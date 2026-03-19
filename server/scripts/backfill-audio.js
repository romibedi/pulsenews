#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Backfill TTS audio: generate audio for all existing articles in DynamoDB
//
// Usage:
//   node server/scripts/backfill-audio.js
//   node server/scripts/backfill-audio.js --lang=hi          # only Hindi
//   node server/scripts/backfill-audio.js --concurrency=10   # faster
//   node server/scripts/backfill-audio.js --dry-run           # just count
// ---------------------------------------------------------------------------

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { generateAndUpload } from '../tts/generate.js';

const TABLE = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const REGION = process.env.AWS_REGION || 'eu-west-1';

const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? 'true']; })
);
const FILTER_LANG = args.lang || null;
const CONCURRENCY = parseInt(args.concurrency) || 5;
const DRY_RUN = args['dry-run'] === 'true';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

async function main() {
  console.log(`\n\x1b[1mTTS Audio Backfill\x1b[0m`);
  console.log(`Table: ${TABLE} | Concurrency: ${CONCURRENCY}${FILTER_LANG ? ` | Lang: ${FILTER_LANG}` : ''}${DRY_RUN ? ' | DRY RUN' : ''}\n`);

  const seen = new Set();
  const articles = [];
  let totalScanned = 0;

  // Scan both GLOBAL#CAT# (English) and LANG# (non-English) partitions
  const prefixes = ['GLOBAL#CAT#', 'LANG#'];

  for (const prefix of prefixes) {
    let lastKey = undefined;
    do {
      const result = await ddb.send(new ScanCommand({
        TableName: TABLE,
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: { ':prefix': prefix },
        ExclusiveStartKey: lastKey,
      }));

      for (const item of result.Items || []) {
        totalScanned++;
        if (!item.articleId || !item.slug || seen.has(item.articleId)) continue;
        seen.add(item.articleId);

        const lang = item.lang || 'en';
        if (FILTER_LANG && lang !== FILTER_LANG) continue;

        articles.push({
          title: item.title || '',
          body: item.body || '',
          description: item.description || '',
          lang,
          slug: item.slug,
        });
      }

      lastKey = result.LastEvaluatedKey;
      process.stdout.write(`\r  Scanned ${totalScanned} items, found ${articles.length} unique articles...`);
    } while (lastKey);
  }

  console.log(`\r  Scanned ${totalScanned} items, found ${articles.length} unique articles.      `);

  if (DRY_RUN) {
    const langCounts = {};
    for (const a of articles) langCounts[a.lang] = (langCounts[a.lang] || 0) + 1;
    console.log('\nLanguage breakdown:');
    for (const [lang, count] of Object.entries(langCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${lang}: ${count} articles`);
    }
    console.log(`\nTotal: ${articles.length} articles would be processed.`);
    process.exit(0);
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;
  let active = 0;
  let idx = 0;
  const queue = [...articles];
  const startTime = Date.now();

  await new Promise((resolve) => {
    function next() {
      if (queue.length === 0 && active === 0) return resolve();
      while (queue.length > 0 && active < CONCURRENCY) {
        active++;
        const article = queue.shift();
        idx++;
        const i = idx;
        generateAndUpload(article)
          .then((result) => {
            if (result?.skipped) {
              skipped++;
            } else if (result) {
              generated++;
              const sizeKB = (result.size / 1024).toFixed(0);
              process.stdout.write(`\r  [${i}/${articles.length}] Generated ${sizeKB}KB: ${article.slug.slice(0, 60)}   `);
            } else {
              failed++;
            }
          })
          .catch(() => failed++)
          .finally(() => { active--; next(); });
      }
    }
    next();
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n\x1b[1mResults:\x1b[0m`);
  console.log(`  \x1b[32m${generated} generated\x1b[0m | ${skipped} skipped | \x1b[${failed ? '31' : '32'}m${failed} failed\x1b[0m`);
  console.log(`  Completed in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error('\nBackfill failed:', err);
  process.exit(1);
});
