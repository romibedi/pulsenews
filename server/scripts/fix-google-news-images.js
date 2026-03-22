#!/usr/bin/env node
// ---------------------------------------------------------------------------
// One-time migration: Fix Google News articles in DynamoDB
//
// Scans all articles with Google News redirect URLs or logo images,
// resolves them to real publisher URLs, extracts content + OG images,
// and updates DynamoDB in-place.
//
// Usage:
//   node server/scripts/fix-google-news-images.js              # dry run (count only)
//   node server/scripts/fix-google-news-images.js --execute     # actually update DB
//   node server/scripts/fix-google-news-images.js --execute --concurrency=5
// ---------------------------------------------------------------------------

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { extract } from '@extractus/article-extractor';
import { resolveGoogleNewsUrl, fetchOgImage } from '../rss.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const GOOGLE_LOGO = 'lh3.googleusercontent.com/J6_coFb';

const args = new Set(process.argv.slice(2));
const dryRun = !args.has('--execute');
const concurrencyArg = [...args].find(a => a.startsWith('--concurrency='));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split('=')[1]) : 3;

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

// Logo detection (same as handler.js)
function isLogoOrPlaceholder(url) {
  if (!url) return true;
  const lower = url.toLowerCase();
  if (lower.includes('lh3.googleusercontent.com/j6_cofb')) return true;
  if (/[/\-_]logo[/\-_.\d]/i.test(lower)) return true;
  if (/[/\-_](favicon|placeholder|default[_-]?image|brand|icon)[/\-_.]/i.test(lower)) return true;
  return false;
}

// Strip HTML to plain text
function htmlToText(html) {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(p|div|br|h[1-6]|li|blockquote|section|article)[^>]*>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extract article content with timeout
async function extractContent(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const article = await extract(url, {}, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return {
      body: htmlToText(article?.content || ''),
      image: article?.image || null,
      author: article?.author || null,
    };
  } catch {
    return { body: '', image: null, author: null };
  }
}

// ---------------------------------------------------------------------------
// Step 1: Scan for Google News articles
// ---------------------------------------------------------------------------
async function findGoogleNewsArticles() {
  console.log('[scan] Scanning DynamoDB for Google News articles...');
  const items = [];
  let lastKey = undefined;
  let scanned = 0;

  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'contains(#url, :gnews) OR contains(image, :logo)',
      ExpressionAttributeNames: { '#url': 'url' },
      ExpressionAttributeValues: {
        ':gnews': 'news.google.com/rss/articles/',
        ':logo': GOOGLE_LOGO,
      },
      ExclusiveStartKey: lastKey,
    }));

    items.push(...(result.Items || []));
    scanned += result.ScannedCount || 0;
    lastKey = result.LastEvaluatedKey;

    process.stdout.write(`\r[scan] Scanned ${scanned.toLocaleString()} items, found ${items.length} Google News articles...`);
  } while (lastKey);

  console.log(`\n[scan] Done. Found ${items.length} items to fix.`);
  return items;
}

// ---------------------------------------------------------------------------
// Step 2: Group by unique article (same articleId appears in multiple PKs)
// ---------------------------------------------------------------------------
function groupByArticle(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.articleId || item.SK; // fallback to SK if no articleId
    if (!groups.has(key)) {
      groups.set(key, { url: item.url, title: item.title, items: [] });
    }
    groups.get(key).items.push({ PK: item.PK, SK: item.SK });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// Step 3: Process each unique article
// ---------------------------------------------------------------------------
async function processArticle(articleKey, group) {
  const { url, title, items } = group;

  // Resolve Google News URL
  const realUrl = await resolveGoogleNewsUrl(url);
  const decoded = realUrl !== url;

  if (!decoded) {
    // URL isn't a Google News redirect — just fix the logo image
    // We can't improve it without a real URL to extract from
    return { articleKey, status: 'skip-no-decode', partitions: items.length };
  }

  // Extract content from real URL
  const extracted = await extractContent(realUrl);
  const body = extracted.body || '';

  // Get image
  let image = '';
  if (extracted.image && !isLogoOrPlaceholder(extracted.image)) {
    image = extracted.image;
  }
  if (!image) {
    const ogImg = await fetchOgImage(realUrl).catch(() => null);
    if (ogImg && !isLogoOrPlaceholder(ogImg)) {
      image = ogImg;
    }
  }

  // Build update expression
  const updates = {};
  if (realUrl !== url) updates.url = realUrl;
  if (image) updates.image = image;
  if (body.length > 100) updates.body = body;
  if (extracted.author) updates.author = extracted.author;

  if (Object.keys(updates).length === 0) {
    return { articleKey, status: 'skip-no-improvements', partitions: items.length };
  }

  if (dryRun) {
    const domain = new URL(realUrl).hostname;
    return {
      articleKey,
      status: 'would-update',
      domain,
      hasImage: !!image,
      hasBody: body.length > 100,
      partitions: items.length,
    };
  }

  // Update all partition copies of this article
  let updated = 0;
  for (const { PK, SK } of items) {
    const expr = [];
    const names = {};
    const values = {};

    for (const [key, val] of Object.entries(updates)) {
      const attr = `#${key}`;
      const placeholder = `:${key}`;
      expr.push(`${attr} = ${placeholder}`);
      names[attr] = key;
      values[placeholder] = val;
    }

    try {
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
        UpdateExpression: `SET ${expr.join(', ')}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
      }));
      updated++;
    } catch (err) {
      console.warn(`\n[error] Failed to update PK=${PK}: ${err.message}`);
    }
  }

  const domain = new URL(realUrl).hostname;
  return {
    articleKey,
    status: 'updated',
    domain,
    hasImage: !!image,
    hasBody: body.length > 100,
    partitions: items.length,
    updated,
  };
}

// ---------------------------------------------------------------------------
// Concurrency-limited runner
// ---------------------------------------------------------------------------
async function runWithConcurrency(tasks, concurrency, fn) {
  const results = [];
  let active = 0;
  let idx = 0;

  await new Promise((resolve) => {
    function next() {
      if (idx >= tasks.length && active === 0) return resolve();
      while (idx < tasks.length && active < concurrency) {
        const i = idx++;
        active++;
        fn(tasks[i], i)
          .then((r) => results.push(r))
          .catch((err) => {
            console.warn(`\n[error] Task ${i} failed: ${err.message}`);
            results.push({ status: 'error', error: err.message });
          })
          .finally(() => { active--; next(); });
      }
    }
    next();
  });

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('\n\x1b[1mGoogle News Image & Article Migration\x1b[0m');
  console.log(`Mode: ${dryRun ? '\x1b[33mDRY RUN\x1b[0m (use --execute to apply)' : '\x1b[32mEXECUTE\x1b[0m'}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log('');

  // Step 1: Find all Google News articles
  const items = await findGoogleNewsArticles();
  if (items.length === 0) {
    console.log('No Google News articles found. Nothing to do.');
    return;
  }

  // Step 2: Group by unique article
  const groups = groupByArticle(items);
  console.log(`[group] ${groups.size} unique articles across ${items.length} DynamoDB items`);
  console.log('');

  // Step 3: Process each article
  const tasks = [...groups.entries()];
  const startTime = Date.now();
  let processed = 0;

  const results = await runWithConcurrency(tasks, CONCURRENCY, async ([articleKey, group], i) => {
    const result = await processArticle(articleKey, group);
    processed++;
    if (processed % 10 === 0 || processed === tasks.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (processed / (elapsed || 1)).toFixed(1);
      process.stdout.write(`\r[progress] ${processed}/${tasks.length} articles (${rate}/s, ${elapsed}s elapsed)    `);
    }
    return result;
  });

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const updated = results.filter(r => r.status === 'updated' || r.status === 'would-update');
  const withImage = results.filter(r => r.hasImage);
  const withBody = results.filter(r => r.hasBody);
  const skipped = results.filter(r => r.status?.startsWith('skip'));
  const errors = results.filter(r => r.status === 'error');
  const totalPartitions = results.reduce((sum, r) => sum + (r.updated || r.partitions || 0), 0);

  // Domain breakdown
  const domainCounts = {};
  for (const r of updated) {
    if (r.domain) domainCounts[r.domain] = (domainCounts[r.domain] || 0) + 1;
  }

  console.log(`\n\n\x1b[1mResults (${elapsed}s):\x1b[0m`);
  console.log(`  ${dryRun ? 'Would update' : 'Updated'}: \x1b[32m${updated.length}\x1b[0m articles (${totalPartitions} DB items)`);
  console.log(`  With real images: \x1b[32m${withImage.length}\x1b[0m`);
  console.log(`  With full article body: \x1b[32m${withBody.length}\x1b[0m`);
  console.log(`  Skipped (no improvement): ${skipped.length}`);
  console.log(`  Errors: ${errors.length}`);

  if (Object.keys(domainCounts).length > 0) {
    console.log('\n  Top publishers:');
    const sorted = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    for (const [domain, count] of sorted) {
      console.log(`    ${domain.padEnd(35)} ${count} articles`);
    }
  }

  if (dryRun) {
    console.log(`\n\x1b[33mThis was a dry run. Run with --execute to apply updates.\x1b[0m\n`);
  }
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
