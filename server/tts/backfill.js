#!/usr/bin/env node
// ---------------------------------------------------------------------------
// TTS Backfill — generates audio for all articles missing TTS in S3
//
// Looks up each article's region via articleId-index so English articles
// get the correct regional accent (US, UK, AU, India, etc.).
//
// Usage:  node server/tts/backfill.js [--concurrency 30] [--limit 5000] [--force]
// ---------------------------------------------------------------------------

import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { generateAndUpload } from './generate.js';

const REGION = process.env.AWS_REGION || 'eu-west-1';
const TABLE = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';

const dynamo = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

// Parse CLI args
const args = process.argv.slice(2);
function getArg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : def;
}
const CONCURRENCY = getArg('--concurrency', 30);
const LIMIT = getArg('--limit', 0); // 0 = no limit
const FORCE = args.includes('--force'); // regenerate even if audio exists

async function audioExists(lang, slug) {
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: BUCKET,
      Key: `audio/${lang || 'en'}/${slug}.mp3`,
    }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Look up the region for an article via the articleId-index.
 * Finds a partition item (REGION#...) that has the region field.
 * Falls back to 'global' if no region found.
 */
async function lookupArticleRegion(articleId) {
  try {
    const resp = await dynamo.send(new QueryCommand({
      TableName: TABLE,
      IndexName: 'articleId-index',
      KeyConditionExpression: 'articleId = :id',
      ExpressionAttributeValues: { ':id': { S: articleId } },
      ProjectionExpression: 'PK, #r, body',
      ExpressionAttributeNames: { '#r': 'region' },
      Limit: 5,
    }));

    let region = 'global';
    let body = '';

    for (const item of (resp.Items || [])) {
      const pk = item.PK?.S || '';
      const itemRegion = item.region?.S;
      const itemBody = item.body?.S;

      // Grab body from any item that has it
      if (itemBody && !body) body = itemBody;

      // Prefer REGION# partition items for actual region info
      if (itemRegion && itemRegion !== 'global' && pk.startsWith('REGION#')) {
        region = itemRegion;
      }
    }

    return { region, body };
  } catch {
    return { region: 'global', body: '' };
  }
}

async function run() {
  const startTime = Date.now();
  console.log(`[backfill] Starting TTS backfill (concurrency=${CONCURRENCY}${LIMIT ? `, limit=${LIMIT}` : ''}${FORCE ? ', FORCE=true' : ''})`);

  let scanned = 0;
  let missing = 0;
  let generated = 0;
  let failed = 0;
  let skipped = 0;
  let lastKey = undefined;
  const batch = [];

  // Paginate through all SITEMAP entries
  while (true) {
    const params = {
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': { S: 'SITEMAP' } },
      ProjectionExpression: 'slug, lang, title, description, articleId',
      Limit: 500,
    };
    if (lastKey) params.ExclusiveStartKey = lastKey;

    const resp = await dynamo.send(new QueryCommand(params));
    const items = resp.Items || [];

    for (const item of items) {
      scanned++;
      const slug = item.slug?.S;
      const lang = item.lang?.S || 'en';
      if (!slug) continue;

      const exists = !FORCE && await audioExists(lang, slug);
      if (exists) {
        skipped++;
      } else {
        missing++;
        batch.push({
          articleId: item.articleId?.S,
          slug,
          lang,
          title: item.title?.S || '',
          description: item.description?.S || '',
        });
      }

      // Process batch when it reaches concurrency size
      if (batch.length >= CONCURRENCY) {
        const results = await processBatch(batch.splice(0, CONCURRENCY));
        generated += results.generated;
        failed += results.failed;

        if (LIMIT && generated >= LIMIT) {
          console.log(`[backfill] Reached limit of ${LIMIT}`);
          break;
        }
      }

      // Progress log every 1000 scanned
      if (scanned % 1000 === 0) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`[backfill] Progress: scanned=${scanned} missing=${missing} generated=${generated} failed=${failed} skipped=${skipped} (${elapsed}s)`);
      }
    }

    if (LIMIT && generated >= LIMIT) break;
    if (!resp.LastEvaluatedKey) break;
    lastKey = resp.LastEvaluatedKey;
  }

  // Process remaining batch
  if (batch.length > 0) {
    const results = await processBatch(batch);
    generated += results.generated;
    failed += results.failed;
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[backfill] Done in ${elapsed}s | scanned=${scanned} missing=${missing} generated=${generated} failed=${failed} skipped=${skipped}`);
}

async function processBatch(articles) {
  let generated = 0;
  let failed = 0;
  let active = 0;

  // First, look up region + body for each article
  const enriched = await Promise.all(
    articles.map(async (article) => {
      const { region, body } = await lookupArticleRegion(article.articleId);
      return { ...article, region, body: body || article.description };
    })
  );

  const queue = [...enriched];

  await new Promise((resolve) => {
    function next() {
      if (queue.length === 0 && active === 0) return resolve();
      while (queue.length > 0 && active < CONCURRENCY) {
        active++;
        const article = queue.shift();
        generateAndUpload(article, { force: FORCE })
          .then((result) => {
            if (result && !result.skipped) generated++;
            else if (!result) failed++;
          })
          .catch(() => failed++)
          .finally(() => { active--; next(); });
      }
    }
    next();
  });

  return { generated, failed };
}

run().catch((err) => {
  console.error(`[backfill] Fatal error: ${err.message}`);
  process.exit(1);
});
