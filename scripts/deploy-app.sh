#!/bin/bash
# ---------------------------------------------------------------------------
# Deploy App Runner (Docker build → ECR push → App Runner deployment)
#
# Usage:
#   ./scripts/deploy-app.sh
# ---------------------------------------------------------------------------
set -euo pipefail

REGION="eu-west-1"
ACCOUNT="103371292062"
ECR_REPO="$ACCOUNT.dkr.ecr.$REGION.amazonaws.com/pulsenews-app-prod"
SERVICE_ARN="arn:aws:apprunner:$REGION:$ACCOUNT:service/pulsenews-prod/888b544c20dc46fca90ca2c2309bb71c"

cd "$(dirname "$0")/.."

echo "=== Building Docker image (linux/amd64) ==="
docker build --platform linux/amd64 -t "$ECR_REPO:latest" .

echo "=== Logging into ECR ==="
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "$ACCOUNT.dkr.ecr.$REGION.amazonaws.com"

echo "=== Pushing to ECR ==="
docker push "$ECR_REPO:latest"

echo "=== Triggering App Runner deployment ==="
aws apprunner start-deployment --service-arn "$SERVICE_ARN" --region "$REGION"

echo ""
echo "App Runner deployment triggered. Rolls over in ~2-3 minutes."
echo "Monitor: https://$REGION.console.aws.amazon.com/apprunner"
