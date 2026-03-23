#!/bin/bash
# ---------------------------------------------------------------------------
# Deploy the AI Enrichment Lambda (pulsenews-ai-enrich-prod)
#
# Builds a zip package from server/ and uploads to Lambda.
# This Lambda runs every 5 minutes via EventBridge to enrich articles
# with AI analysis (mood, entities, quotes, etc.).
#
# Usage:
#   ./scripts/deploy-lambda-ai-enrich.sh
# ---------------------------------------------------------------------------
set -euo pipefail

FUNCTION_NAME="pulsenews-ai-enrich-prod"
REGION="eu-west-1"
BUILD_DIR="/tmp/lambda-ai-enrich-build"

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
zip -rq /tmp/lambda-ai-enrich.zip .
SIZE=$(ls -lh /tmp/lambda-ai-enrich.zip | awk '{print $5}')
echo "Package size: $SIZE"

echo "=== Deploying to Lambda ==="
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb:///tmp/lambda-ai-enrich.zip" \
  --region "$REGION" \
  --publish \
  --query '{FunctionName:FunctionName,CodeSize:CodeSize,Version:Version}' \
  --output table

echo ""
echo "AI Enrichment Lambda deployed successfully."
echo "Trigger manually: aws lambda invoke --function-name $FUNCTION_NAME --invocation-type Event /dev/null"

# Cleanup
rm -rf "$BUILD_DIR" /tmp/lambda-ai-enrich.zip
