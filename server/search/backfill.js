// ---------------------------------------------------------------------------
// Backfill script: index existing DynamoDB articles into OpenSearch
//
// Scans all GLOBAL#CAT#* partitions (which have full article content) and
// indexes each article into the correct per-language OpenSearch index.
// Generates vector embeddings for each article via Amazon Bedrock Titan.
// Deduplicates by articleId so each article is indexed only once.
//
// Usage:
//   OPENSEARCH_ENDPOINT=https://your-domain.eu-west-1.es.amazonaws.com \
//   node server/search/backfill.js
//
// Options:
//   --skip-embeddings    Skip embedding generation (BM25-only backfill)
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getClient } from './client.js';
import {
  indexName,
  supportedLanguages,
  buildIndexSettings,
} from './mappings.js';
import { generateEmbedding, buildEmbeddingText } from './embeddings.js';
import { createHybridPipeline } from './pipeline.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const SKIP_EMBEDDINGS = process.argv.includes('--skip-embeddings');

function safeId(id) {
  if (Buffer.byteLength(id, 'utf8') <= 512) return id;
  return createHash('sha256').update(id).digest('hex');
}
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
        console.log(`  Created index: ${idx} (kNN + BM25)`);
      }
    } catch (err) {
      if (err.meta?.body?.error?.type !== 'resource_already_exists_exception') {
        console.error(`  Error creating ${idx}: ${err.message}`);
      }
    }
  }
}

/**
 * Generate embeddings for a batch of items with concurrency control.
 * Returns items enriched with an `embedding` field.
 */
async function enrichWithEmbeddings(items, concurrency = 5) {
  let completed = 0;
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      const text = buildEmbeddingText(item.title, item.description);
      item._embedding = await generateEmbedding(text);
      completed++;
      if (completed % 50 === 0) {
        console.log(`    Embeddings: ${completed}/${items.length}`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return items;
}

async function main() {
  const osClient = getClient();

  console.log('Ensuring all indexes exist (with kNN enabled)...');
  await ensureAllIndexes(osClient);

  console.log('Ensuring hybrid search pipeline exists...');
  await createHybridPipeline();

  if (SKIP_EMBEDDINGS) {
    console.log('\n⚠ Skipping embedding generation (--skip-embeddings flag)\n');
  }

  console.log('\nScanning DynamoDB for articles...');

  const seen = new Set();
  let totalScanned = 0;
  let totalIndexed = 0;
  let totalEmbeddings = 0;
  let lastKey = undefined;

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

    // Collect unique articles for this scan page
    const uniqueItems = [];
    for (const item of items) {
      const id = item.articleId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      uniqueItems.push(item);
    }

    // Generate embeddings for the batch
    if (!SKIP_EMBEDDINGS && uniqueItems.length > 0) {
      await enrichWithEmbeddings(uniqueItems, 5);
    }

    // Bulk index
    const bulkBody = [];
    for (const item of uniqueItems) {
      const lang = item.lang || 'en';
      const safeLang = SUPPORTED.has(lang) ? lang : 'en';
      const idx = indexName(safeLang);

      const doc = {
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
        mood: item.mood || '',
        date: item.date || new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      };

      if (item._embedding) {
        doc.embedding = item._embedding;
        totalEmbeddings++;
      }

      bulkBody.push(
        { index: { _index: idx, _id: safeId(item.articleId) } },
        doc,
      );
    }

    if (bulkBody.length > 0) {
      const bulkResult = await osClient.bulk({
        body: bulkBody,
        refresh: false,
      });

      const indexedCount = bulkBody.length / 2;
      totalIndexed += indexedCount;

      if (bulkResult.body.errors) {
        const errors = bulkResult.body.items.filter((i) => i.index?.error);
        console.warn(`  Batch had ${errors.length} errors`);
        if (errors.length > 0) {
          console.warn(`  First error: ${JSON.stringify(errors[0].index.error)}`);
        }
      }

      console.log(
        `  Scanned ${totalScanned} items | indexed ${totalIndexed} articles | ${totalEmbeddings} embeddings`,
      );
    }

    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  await osClient.indices.refresh({ index: 'articles-*' });

  console.log(`\nBackfill complete: ${totalIndexed} articles indexed, ${totalEmbeddings} with embeddings.`);
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});
