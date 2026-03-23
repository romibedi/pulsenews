#!/bin/bash
# ---------------------------------------------------------------------------
# Invalidate CloudFront cache
#
# Usage:
#   ./scripts/invalidate-cache.sh              # invalidate everything
#   ./scripts/invalidate-cache.sh /api/*       # invalidate API only
#   ./scripts/invalidate-cache.sh /city/*      # invalidate city pages
# ---------------------------------------------------------------------------
set -euo pipefail

CF_DIST="E3C6ZIGWLTOW49"
PATHS="${1:-/*}"

echo "=== Invalidating CloudFront ($PATHS) ==="
RESULT=$(aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST" \
  --paths "$PATHS" \
  --query 'Invalidation.{Id:Id,Status:Status}' \
  --output table)

echo "$RESULT"
echo ""
echo "Invalidation in progress. Typically completes in 1-2 minutes."
