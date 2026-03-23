#!/bin/bash
# ---------------------------------------------------------------------------
# Deploy the TTS Generation Lambda (pulsenews-tts-prod)
#
# Builds a zip package from server/ and uploads to Lambda.
# This Lambda runs every 15 minutes via EventBridge to generate
# TTS audio for articles missing audio files.
#
# Usage:
#   ./scripts/deploy-lambda-tts.sh
# ---------------------------------------------------------------------------
set -euo pipefail

FUNCTION_NAME="pulsenews-tts-prod"
REGION="eu-west-1"
BUILD_DIR="/tmp/lambda-tts-build"

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
zip -rq /tmp/lambda-tts.zip .
SIZE=$(ls -lh /tmp/lambda-tts.zip | awk '{print $5}')
echo "Package size: $SIZE"

echo "=== Deploying to Lambda ==="
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --zip-file "fileb:///tmp/lambda-tts.zip" \
  --region "$REGION" \
  --publish \
  --query '{FunctionName:FunctionName,CodeSize:CodeSize,Version:Version}' \
  --output table

echo ""
echo "TTS Lambda deployed successfully."
echo "Trigger manually: aws lambda invoke --function-name $FUNCTION_NAME --invocation-type Event /dev/null"

# Cleanup
rm -rf "$BUILD_DIR" /tmp/lambda-tts.zip
