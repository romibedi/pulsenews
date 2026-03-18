// ---------------------------------------------------------------------------
// Backfill script: index existing DynamoDB articles into OpenSearch
//
// Scans all GLOBAL#CAT#* partitions (which have full article content) and
// indexes each article into the correct per-language OpenSearch index.
// Deduplicates by articleId so each article is indexed only once.
//
// Usage:
//   OPENSEARCH_ENDPOINT=https://your-domain.eu-west-1.es.amazonaws.com \
//   node server/search/backfill.js
// ---------------------------------------------------------------------------

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getClient } from './client.js';
import {
  indexName,
  supportedLanguages,
  buildIndexSettings,
} from './mappings.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const SUPPORTED = new Set(supportedLanguages());

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

async function ensureAllIndexes(osClient) {
  for (const lang of supportedLanguages()) {
    const idx = indexName(lang);
    try {
      const exists = await osClient.indices.exists({ index: idx });
      if (!exists.body) {
        await osClient.indices.create({
          index: idx,
          body: buildIndexSettings(lang),
        });
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
  const osClient = getClient();

  console.log('Ensuring all indexes exist...');
  await ensureAllIndexes(osClient);

  console.log('\nScanning DynamoDB for articles...');

  const seen = new Set();
  let totalScanned = 0;
  let totalIndexed = 0;
  let lastKey = undefined;

  // Scan for GLOBAL#CAT# items which have full article content
  do {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: 'begins_with(PK, :prefix)',
        ExpressionAttributeValues: { ':prefix': 'GLOBAL#CAT#' },
        ExclusiveStartKey: lastKey,
      }),
    );

    const items = result.Items || [];
    totalScanned += items.length;

    // Bulk index in batches
    const bulkBody = [];

    for (const item of items) {
      const id = item.articleId;
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const lang = item.lang || 'en';
      const safeLang = SUPPORTED.has(lang) ? lang : 'en';
      const idx = indexName(safeLang);

      bulkBody.push(
        { index: { _index: idx, _id: id } },
        {
          articleId: id,
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
      const bulkResult = await osClient.bulk({
        body: bulkBody,
        refresh: false,
      });

      const indexedCount = bulkBody.length / 2; // action + doc pairs
      totalIndexed += indexedCount;

      if (bulkResult.body.errors) {
        const errors = bulkResult.body.items.filter((i) => i.index?.error);
        console.warn(`  Batch had ${errors.length} errors`);
      }

      console.log(
        `  Scanned ${totalScanned} items, indexed ${totalIndexed} unique articles`,
      );
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  // Final refresh to make documents searchable
  await osClient.indices.refresh({ index: 'articles-*' });

  console.log(`\nBackfill complete: ${totalIndexed} articles indexed.`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
