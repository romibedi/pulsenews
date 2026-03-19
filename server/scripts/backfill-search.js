#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Backfill OpenSearch: reindex all DynamoDB articles into OpenSearch
//
// Wraps server/search/backfill.js with nicer CLI output.
//
// Usage:
//   OPENSEARCH_ENDPOINT=https://... node server/scripts/backfill-search.js
//   node server/scripts/backfill-search.js --dry-run   # just count articles
// ---------------------------------------------------------------------------

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { createHash } from 'crypto';
import { getClient } from '../search/client.js';
import { indexName, supportedLanguages, buildIndexSettings } from '../search/mappings.js';

const TABLE = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const REGION = process.env.AWS_REGION || 'eu-west-1';

const DRY_RUN = process.argv.includes('--dry-run');
const SUPPORTED = new Set(supportedLanguages());

function safeId(id) {
  if (Buffer.byteLength(id, 'utf8') <= 512) return id;
  return createHash('sha256').update(id).digest('hex');
}

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

async function ensureAllIndexes(osClient) {
  for (const lang of supportedLanguages()) {
    const idx = indexName(lang);
    try {
      const exists = await osClient.indices.exists({ index: idx });
      if (!exists.body) {
        await osClient.indices.create({ index: idx, body: buildIndexSettings(lang) });
        console.log(`  Created index: ${idx}`);
      }
    } catch (err) {
      if (err.meta?.body?.error?.type !== 'resource_already_exists_exception') {
        console.error(`  Error creating ${idx}: ${err.message}`);
      }
    }
  }
}

async function main() {
  console.log(`\n\x1b[1mOpenSearch Backfill\x1b[0m`);
  console.log(`Table: ${TABLE}${DRY_RUN ? ' | DRY RUN' : ''}\n`);

  // Scan DynamoDB — both GLOBAL#CAT# (English) and LANG# (non-English) partitions
  const seen = new Set();
  const articles = [];
  let totalScanned = 0;
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
        if (!item.articleId || seen.has(item.articleId)) continue;
        seen.add(item.articleId);
        articles.push(item);
      }

      lastKey = result.LastEvaluatedKey;
      process.stdout.write(`\r  Scanned ${totalScanned} items, found ${articles.length} unique articles...`);
    } while (lastKey);
  }

  console.log(`\r  Scanned ${totalScanned} items, found ${articles.length} unique articles.      `);

  if (DRY_RUN) {
    const langCounts = {};
    for (const a of articles) langCounts[a.lang || 'en'] = (langCounts[a.lang || 'en'] || 0) + 1;
    console.log('\nLanguage breakdown:');
    for (const [lang, count] of Object.entries(langCounts).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${lang}: ${count} articles → index: ${indexName(lang)}`);
    }
    console.log(`\nTotal: ${articles.length} articles would be indexed.`);
    process.exit(0);
  }

  // Index into OpenSearch
  const osClient = getClient();

  console.log('  Ensuring all indexes exist...');
  await ensureAllIndexes(osClient);

  let totalIndexed = 0;
  let errors = 0;
  const BATCH_SIZE = 200;
  const startTime = Date.now();

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);
    const bulkBody = [];

    for (const item of batch) {
      const lang = item.lang || 'en';
      const safeLang = SUPPORTED.has(lang) ? lang : 'en';

      bulkBody.push(
        { index: { _index: indexName(safeLang), _id: safeId(item.articleId) } },
        {
          articleId: item.articleId,
          title: item.title || '',
          description: item.description || '',
          body: item.body || '',
          url: item.url || '',
          image: item.image || '',
          author: item.author || '',
          source: item.source || '',
          category: item.category || 'general',
          region: item.region || 'global',
          lang: safeLang,
          sectionId: item.sectionId || '',
          tags: item.tags || [],
          slug: item.slug || '',
          date: item.date || new Date().toISOString(),
          createdAt: item.createdAt || new Date().toISOString(),
        },
      );
    }

    if (bulkBody.length > 0) {
      const result = await osClient.bulk({ body: bulkBody, refresh: false });
      const batchIndexed = bulkBody.length / 2;
      totalIndexed += batchIndexed;

      if (result.body.errors) {
        const batchErrors = result.body.items.filter((it) => it.index?.error);
        errors += batchErrors.length;
        totalIndexed -= batchErrors.length;
      }
    }

    process.stdout.write(`\r  [${Math.min(i + BATCH_SIZE, articles.length)}/${articles.length}] Indexed ${totalIndexed} articles...`);
  }

  // Refresh to make documents searchable
  await osClient.indices.refresh({ index: 'articles-*' });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n\x1b[1mResults:\x1b[0m`);
  console.log(`  \x1b[32m${totalIndexed} indexed\x1b[0m | \x1b[${errors ? '31' : '32'}m${errors} errors\x1b[0m`);
  console.log(`  Completed in ${elapsed}s\n`);
}

main().catch((err) => {
  console.error('\nBackfill failed:', err);
  process.exit(1);
});
