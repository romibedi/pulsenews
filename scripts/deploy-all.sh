#!/bin/bash
# ---------------------------------------------------------------------------
# Deploy everything: App Runner + both Lambdas + CloudFront invalidation
#
# Usage:
#   ./scripts/deploy-all.sh
# ---------------------------------------------------------------------------
set -euo pipefail

SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "========================================"
echo " PulseNews Full Deployment"
echo "========================================"
echo ""

echo "[1/4] Deploying App Runner..."
"$SCRIPTS_DIR/deploy-app.sh"
echo ""

echo "[2/4] Deploying Ingest Lambda..."
"$SCRIPTS_DIR/deploy-lambda-ingest.sh"
echo ""

echo "[3/4] Deploying Search Indexer Lambda..."
"$SCRIPTS_DIR/deploy-lambda-indexer.sh"
echo ""

echo "[4/4] Invalidating CloudFront cache..."
"$SCRIPTS_DIR/invalidate-cache.sh"
echo ""

echo "========================================"
echo " All deployments complete!"
echo "========================================"
echo "  Site:    https://www.pulsenewstoday.com"
echo "  Console: https://eu-west-1.console.aws.amazon.com/apprunner"
echo ""
