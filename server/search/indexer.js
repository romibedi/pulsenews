// ---------------------------------------------------------------------------
// DynamoDB Streams → OpenSearch indexer Lambda
//
// Triggered by DynamoDB Streams on the pulsenews-articles table.
// Only indexes SITEMAP items (one per unique article) to avoid duplicates.
// Routes each article to the correct per-language index.
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';
import { getClient } from './client.js';
import { indexName, supportedLanguages, buildIndexSettings } from './mappings.js';

function safeId(id) {
  if (Buffer.byteLength(id, 'utf8') <= 512) return id;
  return createHash('sha256').update(id).digest('hex');
}

const SUPPORTED = new Set(supportedLanguages());

/**
 * Ensure the index exists for a language, creating it if needed.
 * Caches created indexes for the lifetime of the Lambda container.
 */
const ensuredIndexes = new Set();

async function ensureIndex(client, lang) {
  const idx = indexName(lang);
  if (ensuredIndexes.has(idx)) return;

  try {
    const exists = await client.indices.exists({ index: idx });
    if (!exists.body) {
      const settings = buildIndexSettings(lang);
      await client.indices.create({
        index: idx,
        body: settings,
      });
      console.log(`[indexer] Created index: ${idx}`);
    }
  } catch (err) {
    // Index might have been created by another concurrent invocation
    if (err.meta?.body?.error?.type !== 'resource_already_exists_exception') {
      throw err;
    }
  }

  ensuredIndexes.add(idx);
}

/**
 * Extract the article document from a DynamoDB Stream record image.
 * DynamoDB Stream delivers items in DynamoDB JSON format (with type descriptors).
 */
function unmarshallImage(image) {
  const doc = {};
  for (const [key, typedValue] of Object.entries(image)) {
    const type = Object.keys(typedValue)[0];
    const val = typedValue[type];
    switch (type) {
      case 'S':
        doc[key] = val;
        break;
      case 'N':
        doc[key] = Number(val);
        break;
      case 'BOOL':
        doc[key] = val;
        break;
      case 'L':
        doc[key] = val.map((item) => {
          const t = Object.keys(item)[0];
          return item[t];
        });
        break;
      case 'NULL':
        doc[key] = null;
        break;
      default:
        doc[key] = val;
    }
  }
  return doc;
}

/**
 * Lambda handler — processes DynamoDB Stream events.
 */
export async function handler(event) {
  const client = getClient();
  let indexed = 0;
  let deleted = 0;
  let skipped = 0;

  for (const record of event.Records) {
    try {
      const eventName = record.eventName; // INSERT, MODIFY, REMOVE

      // Only process SITEMAP items (PK = "SITEMAP") to avoid duplicate indexing
      const image = record.dynamodb?.NewImage || record.dynamodb?.OldImage;
      if (!image) continue;

      const pk = image.PK?.S;
      if (pk !== 'SITEMAP') {
        skipped++;
        continue;
      }

      const articleId = image.articleId?.S;
      if (!articleId) continue;

      if (eventName === 'REMOVE') {
        // Article deleted (TTL expiry or manual delete) — remove from all indexes
        const lang = image.lang?.S || 'en';
        const idx = indexName(lang);
        try {
          await client.delete({
            index: idx,
            id: safeId(articleId),
            refresh: false,
          });
          deleted++;
        } catch (err) {
          if (err.meta?.statusCode !== 404) {
            console.warn(`[indexer] Delete failed for ${articleId}: ${err.message}`);
          }
        }
        continue;
      }

      // INSERT or MODIFY — index the article
      const doc = unmarshallImage(record.dynamodb.NewImage);

      // SITEMAP items are lean (slug, url, date, title only).
      // We need the full article. Query the articleId-index to get the full item.
      // However, DynamoDB Streams for SITEMAP PK may not have body/description.
      // To keep indexer simple, we index what we have. The ingestion handler
      // can be updated to also write a SEARCH partition with full content.
      //
      // For now: if the SITEMAP item lacks body, we still index title + description.
      // The full-content enrichment can be added as a follow-up.

      const lang = doc.lang || 'en';
      const safeLang = SUPPORTED.has(lang) ? lang : 'en';

      await ensureIndex(client, safeLang);

      const searchDoc = {
        articleId: doc.articleId,
        title: doc.title || '',
        description: doc.description || '',
        body: doc.body || '',
        url: doc.url || '',
        image: doc.image || '',
        author: doc.author || '',
        source: doc.source || '',
        category: doc.category || 'general',
        region: doc.region || 'global',
        lang: safeLang,
        sectionId: doc.sectionId || '',
        tags: doc.tags || [],
        slug: doc.slug || '',
        date: doc.date || new Date().toISOString(),
        createdAt: doc.createdAt || new Date().toISOString(),
      };

      await client.index({
        index: indexName(safeLang),
        id: safeId(articleId),
        body: searchDoc,
        refresh: false,
      });

      indexed++;
    } catch (err) {
      console.error(`[indexer] Error processing record: ${err.message}`);
    }
  }

  console.log(
    `[indexer] Processed ${event.Records.length} records | indexed=${indexed} deleted=${deleted} skipped=${skipped}`,
  );

  return { indexed, deleted, skipped };
}
