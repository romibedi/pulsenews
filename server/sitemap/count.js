#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Sitemap page counter — shows total URLs across all sitemaps in S3
// Run: node server/sitemap/count.js
// ---------------------------------------------------------------------------

import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';
const REGION = process.env.AWS_REGION || 'eu-west-1';
const s3 = new S3Client({ region: REGION });

async function readS3(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    return await res.Body.transformToString();
  } catch {
    return null;
  }
}

function countUrls(xml) {
  if (!xml) return 0;
  return (xml.match(/<url>/g) || []).length;
}

async function main() {
  console.log(`\nBucket: ${BUCKET} (${REGION})\n`);

  // Static sitemap
  const staticXml = await readS3('sitemaps/static.xml');
  const staticCount = countUrls(staticXml);

  // News sitemap
  const newsXml = await readS3('sitemaps/news.xml');
  const newsCount = countUrls(newsXml);

  // Daily sitemaps
  const dailyFiles = [];
  let token = undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'sitemaps/daily/',
      ContinuationToken: token,
    }));
    for (const obj of res.Contents || []) {
      const match = obj.Key.match(/sitemaps\/daily\/(\d{4}-\d{2}-\d{2})\.xml$/);
      if (match) dailyFiles.push({ key: obj.Key, date: match[1] });
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (token);

  dailyFiles.sort((a, b) => b.date.localeCompare(a.date));

  let dailyTotal = 0;
  const dailyBreakdown = [];

  for (const file of dailyFiles) {
    const xml = await readS3(file.key);
    const count = countUrls(xml);
    dailyTotal += count;
    dailyBreakdown.push({ date: file.date, count });
  }

  const grandTotal = staticCount + dailyTotal;

  console.log('┌─────────────────────────┬────────┐');
  console.log('│ Sitemap                 │  URLs  │');
  console.log('├─────────────────────────┼────────┤');
  console.log(`│ static.xml              │ ${String(staticCount).padStart(6)} │`);
  console.log(`│ news.xml (Google News)  │ ${String(newsCount).padStart(6)} │`);
  console.log(`│ daily/ (${dailyFiles.length} files)       │ ${String(dailyTotal).padStart(6)} │`);
  console.log('├─────────────────────────┼────────┤');
  console.log(`│ TOTAL (static + daily)  │ ${String(grandTotal).padStart(6)} │`);
  console.log('└─────────────────────────┴────────┘');
  console.log(`\n(news.xml overlaps with daily — not double-counted in total)\n`);

  // Show recent 7 days
  console.log('Recent daily breakdown:');
  for (const d of dailyBreakdown.slice(0, 7)) {
    const bar = '█'.repeat(Math.min(Math.round(d.count / 50), 60));
    console.log(`  ${d.date}  ${String(d.count).padStart(5)}  ${bar}`);
  }
  if (dailyBreakdown.length > 7) {
    console.log(`  ... and ${dailyBreakdown.length - 7} more days`);
  }
  console.log();
}

main().catch((err) => { console.error(err); process.exit(1); });
