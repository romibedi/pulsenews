#!/bin/bash
# ---------------------------------------------------------------------------
# Show DynamoDB article statistics
#
# Usage:
#   ./scripts/db-stats.sh
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

node -e "
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}), {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE = process.env.DYNAMODB_TABLE || 'pulsenews-articles';

// Full count
let total = 0, lastKey;
const pkCounts = {};
do {
  const r = await client.send(new ScanCommand({
    TableName: TABLE,
    Select: 'SPECIFIC_ATTRIBUTES',
    ProjectionExpression: 'PK',
    ExclusiveStartKey: lastKey,
  }));
  total += r.Count;
  for (const item of r.Items) {
    const prefix = item.PK.split('#')[0];
    pkCounts[prefix] = (pkCounts[prefix] || 0) + 1;
  }
  lastKey = r.LastEvaluatedKey;
} while (lastKey);

console.log('=== DynamoDB Article Stats ===');
console.log('Total items:', total.toLocaleString());
console.log('');
console.log('By partition type:');
for (const [pk, count] of Object.entries(pkCounts).sort((a, b) => b[1] - a[1])) {
  console.log('  ' + pk.padEnd(15) + count.toLocaleString());
}

// Check for problematic articles
const gnews = await client.send(new ScanCommand({
  TableName: TABLE,
  FilterExpression: 'contains(#url, :gnews)',
  ExpressionAttributeNames: { '#url': 'url' },
  ExpressionAttributeValues: { ':gnews': 'news.google.com' },
  Select: 'COUNT',
}));
console.log('');
console.log('Google News URLs remaining:', gnews.Count);

// Sample cities
console.log('');
console.log('Top cities:');
const cities = ['london','new-york','mumbai','bangalore','delhi','chennai','sydney','tokyo','dubai','paris','nairobi','lagos','sao-paulo'];
for (const city of cities) {
  const r = await client.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: { ':pk': 'CITY#' + city },
    Select: 'COUNT',
  }));
  if (r.Count > 0) process.stdout.write('  ' + city + ': ' + r.Count + '  ');
}
console.log();
" 2>&1
