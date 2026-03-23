#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Cleanup: Delete orphaned TTS audio files from S3
//
// Lists all audio files in S3, checks if a corresponding article exists
// in DynamoDB, and deletes any orphans (audio for deleted articles).
//
// Usage:
//   node server/scripts/cleanup-orphan-audio.js              # dry run
//   node server/scripts/cleanup-orphan-audio.js --execute    # delete
// ---------------------------------------------------------------------------

import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const BUCKET = process.env.AUDIO_BUCKET || 'pulsenews-audio-prod';
const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const REGION = process.env.AWS_REGION || 'eu-west-1';
const dryRun = !process.argv.includes('--execute');

const s3 = new S3Client({ region: REGION });
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

/**
 * Check if any article with this slug exists in DynamoDB.
 * Queries the SITEMAP partition which has one entry per article.
 */
async function articleExistsForSlug(slug) {
  try {
    const result = await docClient.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :slug)',
      ExpressionAttributeValues: {
        ':pk': 'SITEMAP',
        ':slug': slug,
      },
      Limit: 1,
      Select: 'COUNT',
    }));
    return result.Count > 0;
  } catch {
    return true; // On error, assume exists (safe default)
  }
}

async function main() {
  console.log('\n\x1b[1mCleanup: Delete orphaned TTS audio from S3\x1b[0m');
  console.log(`Bucket: ${BUCKET}`);
  console.log(`Mode: ${dryRun ? '\x1b[33mDRY RUN\x1b[0m' : '\x1b[31mEXECUTE — DELETING\x1b[0m'}`);
  console.log('');

  // Step 1: List all audio files in S3
  console.log('[scan] Listing audio files in S3...');
  const audioFiles = [];
  let continuationToken = undefined;

  do {
    const result = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: 'audio/',
      ContinuationToken: continuationToken,
    }));

    for (const obj of (result.Contents || [])) {
      // Extract slug from key: audio/{lang}/{slug}.mp3
      const parts = obj.Key.split('/');
      if (parts.length === 3 && parts[2].endsWith('.mp3')) {
        const slug = parts[2].replace('.mp3', '');
        audioFiles.push({ key: obj.Key, slug, size: obj.Size });
      }
    }

    continuationToken = result.NextContinuationToken;
    process.stdout.write(`\r[scan] Found ${audioFiles.length} audio files...`);
  } while (continuationToken);

  console.log(`\n[scan] Total audio files: ${audioFiles.length}`);

  if (audioFiles.length === 0) {
    console.log('No audio files found.');
    return;
  }

  // Step 2: Check each audio file against DynamoDB
  console.log('[check] Checking for orphaned audio files...');
  const orphans = [];
  let checked = 0;
  let orphanSize = 0;
  const CONCURRENCY = 20;
  const startTime = Date.now();

  // Concurrency-limited checker
  const queue = [...audioFiles];
  let active = 0;

  await new Promise((resolve) => {
    function next() {
      if (queue.length === 0 && active === 0) return resolve();
      while (queue.length > 0 && active < CONCURRENCY) {
        active++;
        const file = queue.shift();
        articleExistsForSlug(file.slug)
          .then((exists) => {
            if (!exists) {
              orphans.push(file);
              orphanSize += file.size || 0;
            }
            checked++;
            if (checked % 100 === 0 || checked === audioFiles.length) {
              const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
              process.stdout.write(`\r[check] ${checked}/${audioFiles.length} checked, ${orphans.length} orphans found (${elapsed}s)    `);
            }
          })
          .catch(() => { checked++; })
          .finally(() => { active--; next(); });
      }
    }
    next();
  });

  console.log(`\n[check] Found ${orphans.length} orphaned audio files (${(orphanSize / 1024 / 1024).toFixed(1)} MB)`);

  if (orphans.length === 0) {
    console.log('No orphans to clean up.');
    return;
  }

  if (dryRun) {
    // Show sample orphans
    console.log('\nSample orphans:');
    for (const f of orphans.slice(0, 10)) {
      console.log(`  ${f.key} (${(f.size / 1024).toFixed(0)} KB)`);
    }
    console.log(`\n\x1b[33mDry run — ${orphans.length} files (${(orphanSize / 1024 / 1024).toFixed(1)} MB) would be deleted.\x1b[0m\n`);
    return;
  }

  // Step 3: Batch delete from S3 (1000 per batch — S3 limit)
  console.log(`\n[delete] Deleting ${orphans.length} orphaned audio files...`);
  let deleted = 0;

  for (let i = 0; i < orphans.length; i += 1000) {
    const batch = orphans.slice(i, i + 1000);
    try {
      await s3.send(new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: batch.map(f => ({ Key: f.key })),
          Quiet: true,
        },
      }));
      deleted += batch.length;
      process.stdout.write(`\r[delete] ${deleted}/${orphans.length} deleted...`);
    } catch (err) {
      console.warn(`\n[error] Batch delete failed: ${err.message}`);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n\x1b[1mResults (${elapsed}s):\x1b[0m`);
  console.log(`  Deleted: \x1b[32m${deleted}\x1b[0m audio files (${(orphanSize / 1024 / 1024).toFixed(1)} MB freed)`);
  console.log('');
}

main().catch((err) => {
  console.error('\nCleanup failed:', err);
  process.exit(1);
});
