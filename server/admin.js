// ---------------------------------------------------------------------------
// Admin dashboard API — stats aggregation for article traceability
// Protected by ADMIN_PASSWORD environment variable
// ---------------------------------------------------------------------------

import { Router } from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import {
  FEEDS,
  REGIONAL_FEEDS,
  LANG_FEEDS,
  CITY_FEEDS,
} from './shared/feedRegistry.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pulsenews-admin-2026';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});
const s3 = new S3Client({ region: process.env.AWS_REGION || 'eu-west-1' });

const router = Router();

// Simple password auth middleware
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(requireAdmin);

// Count all items in a PK (paginated COUNT query)
async function countPK(pk) {
  let total = 0;
  let lastKey;
  do {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': pk },
      Select: 'COUNT',
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));
    total += result.Count || 0;
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);
  return total;
}

// Count S3 objects with a prefix
async function countS3Prefix(prefix) {
  let total = 0;
  let token;
  do {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ...(token && { ContinuationToken: token }),
    }));
    total += result.KeyCount || 0;
    token = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (token);
  return total;
}

// Sample SITEMAP items for LLM analysis field coverage
async function sampleLLMCoverage(sampleSize = 500) {
  const fields = ['mood', 'honestHeadline', 'controversyScore', 'entities', 'bestQuote', 'questions', 'predictions', 'body', 'image'];
  const counts = {};
  fields.forEach(f => counts[f] = 0);
  let logoImages = 0;
  let sampled = 0;

  let lastKey;
  do {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': 'SITEMAP' },
      ScanIndexForward: false,
      Limit: Math.min(500, sampleSize - sampled),
      ...(lastKey && { ExclusiveStartKey: lastKey }),
    }));

    for (const item of (result.Items || [])) {
      sampled++;
      for (const field of fields) {
        if (item[field] !== undefined && item[field] !== null && item[field] !== '') {
          if (field === 'entities' || field === 'questions' || field === 'predictions') {
            if (Array.isArray(item[field]) && item[field].length > 0) counts[field]++;
          } else {
            counts[field]++;
          }
        }
      }
      // Check for logo/placeholder images
      if (item.image) {
        const lower = item.image.toLowerCase();
        if (lower.includes('lh3.googleusercontent.com/j6_cofb') ||
            /[/\-_]logo[/\-_.\d]/i.test(lower) ||
            /[/\-_](favicon|placeholder|default[_-]?image|brand|icon)[/\-_.]/i.test(lower)) {
          logoImages++;
        }
      }
    }
    lastKey = result.LastEvaluatedKey;
  } while (lastKey && sampled < sampleSize);

  return { counts, sampled, logoImages };
}

// GET /api/admin/stats — full dashboard data
router.get('/stats', async (req, res) => {
  try {
    const startTime = Date.now();
    const categories = Object.keys(FEEDS);
    const regions = Object.keys(REGIONAL_FEEDS);
    const languages = Object.keys(LANG_FEEDS);
    const cities = Object.keys(CITY_FEEDS);

    // Parallel: count all categories, regions, languages, cities, sitemap, TTS
    const [
      categoryCounts,
      regionCounts,
      langCounts,
      cityCounts,
      sitemapCount,
      ttsCounts,
      llmCoverage,
    ] = await Promise.all([
      // Categories
      Promise.all(categories.map(async cat => ({
        key: cat,
        count: await countPK(`GLOBAL#CAT#${cat}`),
      }))),
      // Regions (count total per region across all categories)
      Promise.all(regions.map(async region => {
        const catCounts = await Promise.all(
          ['world', 'technology', 'business', 'sport', 'science', 'culture', 'politics'].map(
            cat => countPK(`REGION#${region}#CAT#${cat}`)
          )
        );
        return {
          key: region,
          count: catCounts.reduce((sum, c) => sum + c, 0),
          byCategory: Object.fromEntries(
            ['world', 'technology', 'business', 'sport', 'science', 'culture', 'politics'].map((cat, i) => [cat, catCounts[i]])
          ),
        };
      })),
      // Languages
      Promise.all(languages.map(async lang => ({
        key: lang,
        count: await countPK(`LANG#${lang}`),
      }))),
      // Cities
      Promise.all(cities.map(async city => ({
        key: city,
        count: await countPK(`CITY#${city}`),
      }))),
      // Sitemap total
      countPK('SITEMAP'),
      // TTS by language
      Promise.all(['en', ...languages].map(async lang => ({
        key: lang,
        count: await countS3Prefix(`audio/${lang}/`),
      }))),
      // LLM analysis coverage
      sampleLLMCoverage(1000),
    ]);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    res.json({
      timestamp: new Date().toISOString(),
      elapsed: `${elapsed}s`,
      totals: {
        sitemapArticles: sitemapCount,
        categories: categoryCounts.reduce((sum, c) => sum + c.count, 0),
        regions: regionCounts.reduce((sum, r) => sum + r.count, 0),
        languages: langCounts.reduce((sum, l) => sum + l.count, 0),
        cities: cityCounts.reduce((sum, c) => sum + c.count, 0),
      },
      categories: Object.fromEntries(categoryCounts.map(c => [c.key, c.count])),
      regions: Object.fromEntries(regionCounts.map(r => [r.key, { total: r.count, byCategory: r.byCategory }])),
      languages: Object.fromEntries(langCounts.map(l => [l.key, l.count])),
      cities: Object.fromEntries(cityCounts.map(c => [c.key, c.count])),
      tts: {
        total: ttsCounts.reduce((sum, t) => sum + t.count, 0),
        byLanguage: Object.fromEntries(ttsCounts.map(t => [t.key, t.count])),
      },
      llmAnalysis: {
        sampleSize: llmCoverage.sampled,
        fields: Object.fromEntries(
          Object.entries(llmCoverage.counts).map(([field, count]) => [
            field,
            {
              count,
              percentage: llmCoverage.sampled > 0 ? Math.round((count / llmCoverage.sampled) * 100) : 0,
            },
          ])
        ),
        logoImages: llmCoverage.logoImages,
      },
    });
  } catch (err) {
    console.error('[admin] Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/verify — check password
router.get('/verify', (req, res) => {
  res.json({ ok: true });
});

export default router;
