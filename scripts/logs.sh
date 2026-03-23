#!/bin/bash
# ---------------------------------------------------------------------------
# Tail CloudWatch logs for Lambda functions or App Runner
#
# Usage:
#   ./scripts/logs.sh ingest          # Tail ingestion Lambda logs
#   ./scripts/logs.sh indexer         # Tail search indexer Lambda logs
#   ./scripts/logs.sh app             # Tail App Runner logs
#   ./scripts/logs.sh ingest 30m      # Last 30 minutes
# ---------------------------------------------------------------------------
set -euo pipefail

REGION="eu-west-1"
SINCE="${2:-10m}"

case "${1:-}" in
  ingest)
    echo "=== Ingestion Lambda logs (last $SINCE) ==="
    aws logs tail "/aws/lambda/pulsenews-ingest-prod" \
      --since "$SINCE" --follow --region "$REGION"
    ;;
  indexer)
    echo "=== Search Indexer Lambda logs (last $SINCE) ==="
    aws logs tail "/aws/lambda/pulsenews-search-indexer-prod" \
      --since "$SINCE" --follow --region "$REGION"
    ;;
  app)
    echo "=== App Runner logs (last $SINCE) ==="
    SERVICE_ARN="arn:aws:apprunner:$REGION:103371292062:service/pulsenews-prod/888b544c20dc46fca90ca2c2309bb71c"
    LOG_GROUP=$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --region "$REGION" \
      --query 'Service.ServiceArn' --output text 2>/dev/null | sed 's/arn:aws:apprunner:/\/aws\/apprunner\//')
    # App Runner logs are under /aws/apprunner/<service-name>/<instance-id>
    echo "Check App Runner console for logs:"
    echo "https://$REGION.console.aws.amazon.com/apprunner"
    ;;
  *)
    echo "Usage: $0 {ingest|indexer|app} [since]"
    echo ""
    echo "Examples:"
    echo "  $0 ingest         # Tail ingestion logs"
    echo "  $0 indexer 1h     # Last 1 hour of indexer logs"
    exit 1
    ;;
esac
