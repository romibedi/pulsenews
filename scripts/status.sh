#!/bin/bash
# ---------------------------------------------------------------------------
# Show status of all PulseNews services
#
# Usage:
#   ./scripts/status.sh
# ---------------------------------------------------------------------------
set -euo pipefail

REGION="eu-west-1"
ACCOUNT="103371292062"

echo "========================================"
echo " PulseNews Service Status"
echo "========================================"
echo ""

# App Runner
echo "--- App Runner ---"
aws apprunner list-services --region "$REGION" \
  --query 'ServiceSummaryList[?ServiceName==`pulsenews-prod`].{Name:ServiceName,Status:Status,URL:ServiceUrl}' \
  --output table 2>/dev/null || echo "  (unable to query)"

# Latest deployment
echo ""
echo "--- Latest Deployment ---"
SERVICE_ARN="arn:aws:apprunner:$REGION:$ACCOUNT:service/pulsenews-prod/888b544c20dc46fca90ca2c2309bb71c"
aws apprunner list-operations --service-arn "$SERVICE_ARN" --region "$REGION" \
  --query 'OperationSummaryList[0:2].{Type:Type,Status:Status,Started:StartedAt}' \
  --output table 2>/dev/null || echo "  (unable to query)"

# Lambda functions
echo ""
echo "--- Lambda Functions ---"
for fn in pulsenews-ingest-prod pulsenews-search-indexer-prod; do
  LAST=$(aws lambda get-function-configuration --function-name "$fn" --region "$REGION" \
    --query '{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,LastModified:LastModified}' \
    --output table 2>/dev/null)
  echo "$LAST"
done

# DynamoDB
echo ""
echo "--- DynamoDB ---"
aws dynamodb describe-table --table-name pulsenews-articles --region "$REGION" \
  --query 'Table.{Name:TableName,Items:ItemCount,Size:TableSizeBytes,Status:TableStatus}' \
  --output table 2>/dev/null || echo "  (unable to query)"

# CloudFront
echo ""
echo "--- CloudFront ---"
aws cloudfront get-distribution --id E3C6ZIGWLTOW49 \
  --query 'Distribution.{Id:Id,Domain:DomainName,Status:Status}' \
  --output table 2>/dev/null || echo "  (unable to query)"

# S3 Audio bucket
echo ""
echo "--- S3 Audio Bucket ---"
AUDIO_COUNT=$(aws s3 ls s3://pulsenews-audio-prod/audio/ --recursive --summarize 2>/dev/null | grep "Total Objects" || echo "  Total Objects: unknown")
echo "  $AUDIO_COUNT"

echo ""
echo "Site: https://www.pulsenewstoday.com"
