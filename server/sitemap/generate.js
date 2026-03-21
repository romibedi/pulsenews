// ---------------------------------------------------------------------------
// Sitemap generator — writes pre-built XML files to S3 during ingestion.
//
// Called at the end of each 15-minute ingestion run. Produces:
//   sitemaps/daily/{date}.xml     — all articles for a given day
//   sitemaps/news.xml             — last 48h articles (Google News)
//   sitemaps/static.xml           — homepage, categories, regions, static pages
//   sitemaps/index.xml            — master sitemap index referencing all above
// ---------------------------------------------------------------------------

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { querySitemapEntries, querySitemapByDate } from '../db.js';
import { CITY_FEEDS } from '../shared/feedRegistry.js';

const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';
const REGION = process.env.AWS_REGION || 'eu-west-1';
const SITE_URL = process.env.SITE_URL || 'https://pulsenewstoday.com';

const s3 = new S3Client({ region: REGION });

const escXml = (s) =>
  (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// ---------------------------------------------------------------------------
// Build XML for a list of article entries
// ---------------------------------------------------------------------------
function buildArticleSitemapXml(entries, { includeNews = false } = {}) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  if (includeNews) {
    xml += ' xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"';
  }
  xml += ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  for (const entry of entries) {
    const loc = entry.slug
      ? `${SITE_URL}/news/${entry.slug}`
      : `${SITE_URL}/article/${encodeURIComponent(entry.id || entry.articleId)}`;
    const pubDate = entry.date || new Date().toISOString();
    const lang = entry.lang || 'en';

    xml += '  <url>\n';
    xml += `    <loc>${escXml(loc)}</loc>\n`;
    if (entry.date) xml += `    <lastmod>${entry.date.slice(0, 10)}</lastmod>\n`;
    xml += '    <priority>0.6</priority>\n';

    if (includeNews) {
      const keywords = [entry.category, entry.source, entry.mood]
        .filter(Boolean)
        .join(', ');
      xml += '    <news:news>\n';
      xml += '      <news:publication>\n';
      xml += '        <news:name>PulseNewsToday</news:name>\n';
      xml += `        <news:language>${escXml(lang)}</news:language>\n`;
      xml += '      </news:publication>\n';
      xml += `      <news:publication_date>${escXml(pubDate)}</news:publication_date>\n`;
      xml += `      <news:title>${escXml(entry.title || 'News')}</news:title>\n`;
      if (keywords) xml += `      <news:keywords>${escXml(keywords)}</news:keywords>\n`;
      xml += '    </news:news>\n';
    }

    if (entry.image) {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escXml(entry.image)}</image:loc>\n`;
      xml += `      <image:title>${escXml(entry.title || 'News')}</image:title>\n`;
      xml += '    </image:image>\n';
    }

    xml += '  </url>\n';
  }

  xml += '</urlset>';
  return xml;
}

// ---------------------------------------------------------------------------
// Build the static sitemap (categories, regions, static pages)
// ---------------------------------------------------------------------------
function buildStaticSitemapXml() {
  const categories = [
    'world', 'technology', 'business', 'science', 'sport', 'culture',
    'environment', 'politics', 'ai', 'entertainment', 'gaming', 'cricket',
    'startups', 'space', 'crypto',
  ];
  const regions = [
    'india', 'uk', 'us', 'australia', 'middle-east', 'europe', 'africa', 'asia', 'latam',
  ];
  const staticPages = ['about', 'archive', 'search', 'explore', 'feeds', 'bookmarks'];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  xml += `  <url>\n    <loc>${SITE_URL}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  for (const cat of categories) {
    xml += `  <url>\n    <loc>${SITE_URL}/category/${cat}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }
  for (const r of regions) {
    xml += `  <url>\n    <loc>${SITE_URL}/region/${r}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${SITE_URL}/${page}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.4</priority>\n  </url>\n`;
  }
  xml += `  <url>\n    <loc>${SITE_URL}/cities</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  for (const city of Object.keys(CITY_FEEDS)) {
    xml += `  <url>\n    <loc>${SITE_URL}/city/${city}</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += '</urlset>';
  return xml;
}

// ---------------------------------------------------------------------------
// Build the sitemap index referencing all sub-sitemaps
// ---------------------------------------------------------------------------
function buildSitemapIndexXml(dailyDates) {
  const today = new Date().toISOString().slice(0, 10);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/static.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
  xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/news.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;

  for (const date of dailyDates) {
    xml += `  <sitemap>\n    <loc>${SITE_URL}/sitemaps/daily/${date}.xml</loc>\n    <lastmod>${date}</lastmod>\n  </sitemap>\n`;
  }

  xml += '</sitemapindex>';
  return xml;
}

// ---------------------------------------------------------------------------
// S3 helpers
// ---------------------------------------------------------------------------
async function writeToS3(key, xml) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: xml,
      ContentType: 'application/xml',
      CacheControl: 'public, max-age=3600',
    }),
  );
}

async function readFromS3(key) {
  try {
    const res = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    );
    return await res.Body.transformToString();
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function listDailyFiles() {
  const dates = [];
  let token = undefined;

  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: 'sitemaps/daily/',
        ContinuationToken: token,
      }),
    );
    for (const obj of res.Contents || []) {
      // key = "sitemaps/daily/2026-03-20.xml" → extract "2026-03-20"
      const match = obj.Key.match(/sitemaps\/daily\/(\d{4}-\d{2}-\d{2})\.xml$/);
      if (match) dates.push(match[1]);
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  return dates.sort().reverse(); // newest first
}

// ---------------------------------------------------------------------------
// Parse existing daily XML to extract entries (for merge during ingestion)
// ---------------------------------------------------------------------------
function parseEntriesFromXml(xml) {
  if (!xml) return [];
  const entries = [];
  const urlRegex = /<url>([\s\S]*?)<\/url>/g;
  let match;
  while ((match = urlRegex.exec(xml)) !== null) {
    const block = match[1];
    const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] || '';
    // Extract slug from URL: /news/{slug} or /article/{id}
    const slugMatch = loc.match(/\/news\/(.+)$/);
    const idMatch = loc.match(/\/article\/(.+)$/);
    entries.push({
      _loc: loc,
      slug: slugMatch ? slugMatch[1] : undefined,
      articleId: idMatch ? decodeURIComponent(idMatch[1]) : undefined,
    });
  }
  return entries;
}

// ---------------------------------------------------------------------------
// Main: update sitemaps after an ingestion run
// ---------------------------------------------------------------------------

/**
 * Called at the end of each ingestion run with newly ingested articles.
 * Merges them into today's daily sitemap, rebuilds the news sitemap,
 * and updates the sitemap index.
 *
 * @param {Array} newArticles — articles ingested in this run, each must have:
 *   { slug, title, description, image, date, source, category, lang, mood }
 */
export async function updateSitemaps(newArticles = []) {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Update today's daily sitemap (read → merge → write)
  if (newArticles.length > 0) {
    const dailyKey = `sitemaps/daily/${today}.xml`;
    const existingXml = await readFromS3(dailyKey);
    const existingSlugs = new Set(
      parseEntriesFromXml(existingXml).map((e) => e.slug || e.articleId),
    );

    // Deduplicate: only add articles not already in the file
    const toAdd = newArticles.filter(
      (a) => !existingSlugs.has(a.slug) && !existingSlugs.has(a.articleId),
    );

    if (toAdd.length > 0 || !existingXml) {
      // Query only today's SITEMAP entries using SK prefix (efficient, paginated)
      const todayEntries = await querySitemapByDate(today);
      const dailyXml = buildArticleSitemapXml(todayEntries);
      await writeToS3(dailyKey, dailyXml);
      console.log(`[sitemap] Updated daily sitemap: ${todayEntries.length} articles for ${today}`);
    }
  }

  // 2. Rebuild news sitemap (last 1000 articles for Google News)
  const recentEntries = await querySitemapEntries(1000);
  const newsXml = buildArticleSitemapXml(recentEntries, { includeNews: true });
  await writeToS3('sitemaps/news.xml', newsXml);

  // 3. Write static sitemap (idempotent, cheap)
  await writeToS3('sitemaps/static.xml', buildStaticSitemapXml());

  // 4. Rebuild sitemap index (list all daily files)
  const dailyDates = await listDailyFiles();
  const indexXml = buildSitemapIndexXml(dailyDates);
  await writeToS3('sitemaps/index.xml', indexXml);

  console.log(`[sitemap] Index updated: ${dailyDates.length} daily sitemaps, ${recentEntries.length} news entries`);
}

/**
 * One-time backfill: generate daily sitemaps for ALL existing articles.
 * Run this manually via: node -e "import('./server/sitemap/generate.js').then(m => m.backfillSitemaps())"
 */
export async function backfillSitemaps() {
  console.log('[sitemap] Starting backfill of all existing articles...');

  // Query ALL sitemap entries from DynamoDB (paginated)
  const { querySitemapAll } = await import('../db.js');
  const chunks = await querySitemapAll();
  const allEntries = chunks.flat();

  console.log(`[sitemap] Found ${allEntries.length} total articles`);

  // Group by date (YYYY-MM-DD)
  const byDate = {};
  for (const entry of allEntries) {
    const date = (entry.date || '').slice(0, 10);
    if (!date) continue;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push(entry);
  }

  const dates = Object.keys(byDate).sort().reverse();
  console.log(`[sitemap] Writing ${dates.length} daily sitemaps...`);

  // Write each daily sitemap
  for (const date of dates) {
    const xml = buildArticleSitemapXml(byDate[date]);
    await writeToS3(`sitemaps/daily/${date}.xml`, xml);
    console.log(`  ${date}: ${byDate[date].length} articles`);
  }

  // News sitemap (latest 1000)
  const recentEntries = await querySitemapEntries(1000);
  await writeToS3('sitemaps/news.xml', buildArticleSitemapXml(recentEntries, { includeNews: true }));

  // Static
  await writeToS3('sitemaps/static.xml', buildStaticSitemapXml());

  // Index
  const indexXml = buildSitemapIndexXml(dates);
  await writeToS3('sitemaps/index.xml', indexXml);

  console.log(`[sitemap] Backfill complete: ${allEntries.length} articles across ${dates.length} days`);
}
