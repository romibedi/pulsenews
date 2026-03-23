#!/bin/bash
# ---------------------------------------------------------------------------
# Trigger ingestion Lambda manually
#
# Usage:
#   ./scripts/trigger-ingestion.sh             # async (fire and forget)
#   ./scripts/trigger-ingestion.sh --sync      # wait for result + show logs
# ---------------------------------------------------------------------------
set -euo pipefail

FUNCTION_NAME="pulsenews-ingest-prod"
REGION="eu-west-1"

if [ "${1:-}" = "--sync" ]; then
  echo "=== Invoking ingestion Lambda (synchronous) ==="
  aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --invocation-type RequestResponse \
    --log-type Tail \
    /tmp/ingest-result.json \
    --query 'LogResult' --output text | base64 -d

  echo ""
  echo "=== Result ==="
  cat /tmp/ingest-result.json | python3 -m json.tool 2>/dev/null || cat /tmp/ingest-result.json
  rm -f /tmp/ingest-result.json
else
  echo "=== Invoking ingestion Lambda (async) ==="
  aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --invocation-type Event \
    /dev/null

  echo "Ingestion triggered. Check CloudWatch logs for progress."
  echo "Logs: aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $REGION"
fi
