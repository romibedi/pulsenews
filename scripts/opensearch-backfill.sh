#!/bin/bash
# ---------------------------------------------------------------------------
# Backfill OpenSearch index from existing DynamoDB articles
#
# Usage:
#   ./scripts/opensearch-backfill.sh
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== OpenSearch Backfill ==="
node server/search/backfill.js "$@"
