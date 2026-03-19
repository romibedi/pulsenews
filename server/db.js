import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  BatchWriteCommand,
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
 * Query articles for a specific date (archive).
 * Uses SITEMAP partition — SK starts with date prefix.
 * Returns all articles from that date, newest first.
 */
export async function queryByDate(date, limit = 50) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :datePrefix)',
      ExpressionAttributeValues: {
        ':pk': 'SITEMAP',
        ':datePrefix': date, // e.g. "2026-03-17"
      },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return cleanItems(result.Items);
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
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'SITEMAP' },
      ScanIndexForward: false,
      Limit: limit,
    }),
  );
  return cleanItems(result.Items);
}
