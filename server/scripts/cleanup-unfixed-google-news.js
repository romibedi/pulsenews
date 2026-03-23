#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Cleanup: Delete unfixable Google News articles from DynamoDB
//
// Removes articles that still have Google News redirect URLs and
// Google logo placeholder images — they have no useful content.
//
// Usage:
//   node server/scripts/cleanup-unfixed-google-news.js              # dry run
//   node server/scripts/cleanup-unfixed-google-news.js --execute    # delete
// ---------------------------------------------------------------------------

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.DYNAMODB_TABLE || 'pulsenews-articles';
const dryRun = !process.argv.includes('--execute');

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

async function main() {
  console.log('\n\x1b[1mCleanup: Delete unfixable Google News articles\x1b[0m');
  console.log(`Mode: ${dryRun ? '\x1b[33mDRY RUN\x1b[0m (use --execute to delete)' : '\x1b[31mEXECUTE — DELETING\x1b[0m'}`);
  console.log('');

  // Step 1: Full paginated scan for articles still pointing to Google News
  console.log('[scan] Scanning for unfixed Google News articles...');
  const items = [];
  let lastKey = undefined;
  let scanned = 0;

  do {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'contains(#url, :gnews)',
      ExpressionAttributeNames: { '#url': 'url' },
      ExpressionAttributeValues: {
        ':gnews': 'news.google.com/rss/articles/',
      },
      ProjectionExpression: 'PK, SK, title',
      ExclusiveStartKey: lastKey,
    }));

    items.push(...(result.Items || []));
    scanned += result.ScannedCount || 0;
    lastKey = result.LastEvaluatedKey;

    process.stdout.write(`\r[scan] Scanned ${scanned.toLocaleString()} items, found ${items.length} to delete...`);
  } while (lastKey);

  console.log(`\n[scan] Done. Found ${items.length} items to delete across ${scanned.toLocaleString()} total items.`);

  if (items.length === 0) {
    console.log('Nothing to delete.');
    return;
  }

  // Show partition breakdown
  const pkCounts = {};
  for (const item of items) {
    const prefix = item.PK.split('#')[0];
    pkCounts[prefix] = (pkCounts[prefix] || 0) + 1;
  }
  console.log('\nPartition breakdown:');
  for (const [pk, count] of Object.entries(pkCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pk.padEnd(20)} ${count.toLocaleString()} items`);
  }

  if (dryRun) {
    console.log(`\n\x1b[33mDry run — ${items.length.toLocaleString()} items would be deleted. Run with --execute to delete.\x1b[0m\n`);
    return;
  }

  // Step 2: Batch delete (25 items per batch — DynamoDB limit)
  console.log(`\n[delete] Deleting ${items.length.toLocaleString()} items in batches of 25...`);
  let deleted = 0;
  let errors = 0;
  const startTime = Date.now();

  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const requests = batch.map(({ PK, SK }) => ({
      DeleteRequest: { Key: { PK, SK } },
    }));

    try {
      let unprocessed = { [TABLE_NAME]: requests };

      // Retry unprocessed items (exponential backoff)
      let retries = 0;
      while (unprocessed[TABLE_NAME]?.length > 0 && retries < 5) {
        const result = await docClient.send(new BatchWriteCommand({
          RequestItems: unprocessed,
        }));
        const remaining = result.UnprocessedItems?.[TABLE_NAME]?.length || 0;
        deleted += (unprocessed[TABLE_NAME].length - remaining);

        if (remaining > 0) {
          unprocessed = result.UnprocessedItems;
          retries++;
          await new Promise(r => setTimeout(r, 100 * Math.pow(2, retries)));
        } else {
          break;
        }
      }

      if (unprocessed[TABLE_NAME]?.length > 0) {
        errors += unprocessed[TABLE_NAME].length;
      }
    } catch (err) {
      errors += batch.length;
      console.warn(`\n[error] Batch at ${i} failed: ${err.message}`);
    }

    if ((i + 25) % 500 < 25 || i + 25 >= items.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (deleted / (elapsed || 1)).toFixed(0);
      process.stdout.write(`\r[delete] ${deleted.toLocaleString()}/${items.length.toLocaleString()} deleted (${rate}/s, ${elapsed}s elapsed)    `);
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\n\x1b[1mResults (${elapsed}s):\x1b[0m`);
  console.log(`  Deleted: \x1b[32m${deleted.toLocaleString()}\x1b[0m items`);
  console.log(`  Errors: ${errors}`);
  console.log('');
}

main().catch((err) => {
  console.error('\nCleanup failed:', err);
  process.exit(1);
});
