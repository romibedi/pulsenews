#!/bin/bash
# ---------------------------------------------------------------------------
# Deploy the Search Indexer Lambda (pulsenews-search-indexer-prod)
#
# Triggered by DynamoDB Streams — indexes new articles into OpenSearch.
#
# Usage:
#   ./scripts/deploy-lambda-indexer.sh
# ---------------------------------------------------------------------------
set -euo pipefail

FUNCTION_NAME="pulsenews-search-indexer-prod"
REGION="eu-west-1"
BUILD_DIR="/tmp/lambda-indexer-build"

cd "$(dirname "$0")/.."

echo "=== Preparing build directory ==="
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cp -r server/* "$BUILD_DIR/"

echo "=== Installing dependencies ==="
cd "$BUILD_DIR"
npm ci --omit=dev 2>&1 | tail -3

echo "=== Removing unnecessary files ==="
rm -rf public playwright-report test-results scripts

echo "=== Creating deployment package ==="
zip -rq /tmp/lambda-indexer.zip .
SIZE=$(ls -lh /tmp/lambda-indexer.zip | awk '{print $5}')
echo "Package size: $SIZE"

echo "=== Deploying to Lambda ==="
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb:///tmp/lambda-indexer.zip" \
  --region "$REGION" \
  --publish \
  --query '{FunctionName:FunctionName,CodeSize:CodeSize,Version:Version}' \
  --output table

echo ""
echo "Search Indexer Lambda deployed successfully."

# Cleanup
rm -rf "$BUILD_DIR" /tmp/lambda-indexer.zip
