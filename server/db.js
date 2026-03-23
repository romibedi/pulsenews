import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchWriteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';

const clientConfig = {};
if (process.env.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

const ddbClient = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Strip DynamoDB-internal attributes and remap articleId -> id for frontend use.
 */
function cleanItem(item) {
  if (!item) return null;
  const { PK, SK, ttl, articleId, ...rest } = item;
  return { id: articleId, ...rest };
}

function cleanItems(items) {
  return (items || []).map(cleanItem);
}

/**
 * Query articles by region + category.
 * PK = REGION#<region>#CAT#<category>, SK descending.
 * @param {string} before - ISO date string to paginate (return articles older than this)
 */
export async function queryByRegionCategory(region, category, limit = 20, before = null) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: before
      ? 'PK = :pk AND SK < :before'
      : 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `REGION#${region}#CAT#${category}`,
      ...(before && { ':before': before }),
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  const result = await docClient.send(new QueryCommand(params));
  return cleanItems(result.Items);
}

/**
 * Query articles by global category.
 * PK = GLOBAL#CAT#<category>, SK descending.
 * @param {string} before - ISO date string to paginate (return articles older than this)
 */
export async function queryByGlobalCategory(category, limit = 20, before = null) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: before
      ? 'PK = :pk AND SK < :before'
      : 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `GLOBAL#CAT#${category}`,
      ...(before && { ':before': before }),
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  const result = await docClient.send(new QueryCommand(params));
  return cleanItems(result.Items);
}

/**
 * Query articles by language.
 * PK = LANG#<lang>, SK descending.
 * @param {string} before - ISO date string to paginate (return articles older than this)
 */
export async function queryByLang(lang, limit = 20, before = null) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: before
      ? 'PK = :pk AND SK < :before'
      : 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `LANG#${lang}`,
      ...(before && { ':before': before }),
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  const result = await docClient.send(new QueryCommand(params));
  return cleanItems(result.Items);
}

/**
 * Query articles by city.
 * PK = CITY#<city>, SK descending.
 * @param {string} before - ISO date string to paginate (return articles older than this)
 */
export async function queryByCity(city, limit = 20, before = null) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: before
      ? 'PK = :pk AND SK < :before'
      : 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `CITY#${city}`,
      ...(before && { ':before': before }),
    },
    ScanIndexForward: false,
    Limit: limit,
  };
  const result = await docClient.send(new QueryCommand(params));
  return cleanItems(result.Items);
}

/**
 * Query articles for a specific date (archive).
 * Queries GLOBAL#CAT#, REGION#, and LANG# partitions in parallel so results
 * include full display fields.  Supports optional region/lang filters.
 * Deduplicates by articleId and returns newest first.
 */
export async function queryByDate(date, limit = 100, { region, lang } = {}) {
  const pks = [];

  if (lang && lang !== 'en') {
    // Language-specific archive
    pks.push(`LANG#${lang}`);
  } else if (region && region !== 'world') {
    // Regional archive — query REGION#<region>#CAT#<cat> for all categories
    const cats = ['world', 'technology', 'business', 'science', 'sport', 'culture', 'environment', 'politics', 'ai', 'entertainment', 'gaming', 'cricket', 'startups', 'space', 'crypto'];
    for (const cat of cats) pks.push(`REGION#${region}#CAT#${cat}`);
    pks.push(`REGION#${region}`);
  } else {
    // Global archive — all categories
    const cats = ['world', 'technology', 'business', 'science', 'sport', 'culture', 'environment', 'politics', 'ai', 'entertainment', 'gaming', 'cricket', 'startups', 'space', 'crypto'];
    for (const cat of cats) pks.push(`GLOBAL#CAT#${cat}`);
  }

  const perPk = Math.ceil(limit / pks.length) + 5;

  const results = await Promise.all(
    pks.map((pk) =>
      docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :datePrefix)',
          ExpressionAttributeValues: { ':pk': pk, ':datePrefix': date },
          ScanIndexForward: false,
          Limit: perPk,
        }),
      ),
    ),
  );

  const seen = new Set();
  const all = [];
  for (const result of results) {
    for (const item of result.Items || []) {
      if (!seen.has(item.articleId)) {
        seen.add(item.articleId);
        all.push(item);
      }
    }
  }
  all.sort((a, b) => b.SK.localeCompare(a.SK));
  return cleanItems(all.slice(0, limit));
}

/**
 * Get a single article by its articleId using the articleId-index GSI.
 */
export async function getArticleById(articleId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'articleId-index',
      KeyConditionExpression: 'articleId = :aid',
      ExpressionAttributeValues: { ':aid': articleId },
      Limit: 1,
    }),
  );
  return cleanItem(result.Items?.[0] ?? null);
}

/**
 * Get a single article by its slug using the slug-index GSI.
 */
export async function getArticleBySlug(slug) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'slug-index',
      KeyConditionExpression: 'slug = :s',
      ExpressionAttributeValues: { ':s': slug },
      Limit: 1,
    }),
  );
  return cleanItem(result.Items?.[0] ?? null);
}

/**
 * Batch-write articles to DynamoDB in chunks of 25 (BatchWriteItem limit).
 */
export async function batchWriteArticles(items) {
  const CHUNK_SIZE = 25;
  const chunks = [];
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  for (const chunk of chunks) {
    const requestItems = {
      [TABLE_NAME]: chunk.map((item) => ({
        PutRequest: { Item: item },
      })),
    };

    let unprocessed = requestItems;
    while (unprocessed && Object.keys(unprocessed).length > 0) {
      const response = await docClient.send(
        new BatchWriteCommand({ RequestItems: unprocessed }),
      );
      unprocessed = response.UnprocessedItems;
    }
  }
}

/**
 * Check whether an article already exists (for dedup during ingestion).
 * Returns true if the article is found, false otherwise.
 */
export async function articleExists(articleId) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'articleId-index',
      KeyConditionExpression: 'articleId = :aid',
      ExpressionAttributeValues: { ':aid': articleId },
      Limit: 1,
      ProjectionExpression: 'articleId',
    }),
  );
  return (result.Items?.length ?? 0) > 0;
}

/**
 * Query sitemap entries for sitemap generation.
 * PK = SITEMAP, SK descending.
 */
export async function querySitemapEntries(limit = 1000) {
  const items = [];
  let lastKey = undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': 'SITEMAP' },
        ScanIndexForward: false,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
    if (items.length >= limit) break;
  } while (lastKey);

  return cleanItems(items.slice(0, limit));
}

/**
 * Query SITEMAP entries for a specific date prefix (e.g. "2026-03-21").
 * SK format is "{date}#{articleId}", so we can use begins_with.
 */
export async function querySitemapByDate(datePrefix) {
  const items = [];
  let lastKey = undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': 'SITEMAP',
          ':prefix': datePrefix,
        },
        ScanIndexForward: false,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return cleanItems(items);
}

/**
 * Query ALL sitemap entries — paginates through every DynamoDB page.
 * Returns chunked arrays of up to `chunkSize` items for splitting into
 * multiple sitemap files (50k URL limit per file).
 */
export async function querySitemapAll(chunkSize = 45000) {
  const items = [];
  let lastKey = undefined;

  do {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': 'SITEMAP' },
        ScanIndexForward: false,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }),
    );
    items.push(...(result.Items || []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  const cleaned = cleanItems(items);

  // Split into chunks for sitemap files (max 50k URLs per file)
  const chunks = [];
  for (let i = 0; i < cleaned.length; i += chunkSize) {
    chunks.push(cleaned.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Query SITEMAP articles that need AI enrichment (needsAI = true).
 * Returns raw items (with PK/SK) for use by the AI enrichment pipeline.
 */
export async function queryArticlesNeedingAI(limit = 200) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const items = [];
  let lastKey;

  // Query today's and yesterday's SITEMAP entries with needsAI filter
  for (const datePrefix of [today, yesterday]) {
    lastKey = undefined;
    do {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        FilterExpression: 'needsAI = :yes',
        ExpressionAttributeValues: {
          ':pk': 'SITEMAP',
          ':prefix': datePrefix,
          ':yes': true,
        },
        ProjectionExpression: 'PK, SK, articleId, title, description, body',
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }));
      items.push(...(result.Items || []));
      lastKey = result.LastEvaluatedKey;
      if (items.length >= limit) break;
    } while (lastKey);
    if (items.length >= limit) break;
  }

  return items.slice(0, limit);
}

/**
 * Update all partition copies of an article with AI analysis results.
 * Finds all items via articleId-index, then updates each with the AI fields.
 */
export async function updateArticleAI(articleId, aiFields) {
  // Find all partition copies
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'articleId-index',
    KeyConditionExpression: 'articleId = :aid',
    ExpressionAttributeValues: { ':aid': articleId },
    ProjectionExpression: 'PK, SK',
  }));

  const items = result.Items || [];
  if (items.length === 0) return 0;

  const results = await Promise.allSettled(
    items.map(({ PK, SK }) =>
      docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
        UpdateExpression: 'SET mood = :mood, entities = :entities, bestQuote = :bq, honestHeadline = :hh, questions = :q, controversyScore = :cs, predictions = :pred, needsAI = :no',
        ExpressionAttributeValues: {
          ':mood': aiFields.mood,
          ':entities': aiFields.entities,
          ':bq': aiFields.bestQuote,
          ':hh': aiFields.honestHeadline,
          ':q': aiFields.questions,
          ':cs': aiFields.controversyScore,
          ':pred': aiFields.predictions,
          ':no': false,
        },
      })),
    ),
  );

  return results.filter(r => r.status === 'fulfilled').length;
}

/**
 * Query recent SITEMAP articles for TTS generation check.
 * Returns raw items with fields needed for TTS.
 */
export async function queryRecentArticlesForTTS(limit = 300) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const items = [];
  let lastKey;

  for (const datePrefix of [today, yesterday]) {
    lastKey = undefined;
    do {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
        ExpressionAttributeValues: {
          ':pk': 'SITEMAP',
          ':prefix': datePrefix,
        },
        ProjectionExpression: 'articleId, title, description, body, slug, lang',
        ScanIndexForward: false,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      }));
      items.push(...(result.Items || []));
      lastKey = result.LastEvaluatedKey;
      if (items.length >= limit) break;
    } while (lastKey);
    if (items.length >= limit) break;
  }

  return items.slice(0, limit);
}
