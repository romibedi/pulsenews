#!/bin/bash
# ---------------------------------------------------------------------------
# Build, push, and deploy to App Runner + invalidate CloudFront cache
#
# Usage:
#   ./scripts/deploy.sh
# ---------------------------------------------------------------------------

set -e

REPO="103371292062.dkr.ecr.eu-west-1.amazonaws.com/pulsenews-app-prod"
SERVICE_ARN="arn:aws:apprunner:eu-west-1:103371292062:service/pulsenews-prod/888b544c20dc46fca90ca2c2309bb71c"
CF_DIST="E3C6ZIGWLTOW49"

echo "=== Building Docker image ==="
docker build --platform linux/amd64 -t "$REPO:latest" .

echo "=== Logging into ECR ==="
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 103371292062.dkr.ecr.eu-west-1.amazonaws.com

echo "=== Pushing to ECR ==="
docker push "$REPO:latest"

echo "=== Deploying to App Runner ==="
aws apprunner start-deployment --service-arn "$SERVICE_ARN"

echo "=== Invalidating CloudFront cache ==="
aws cloudfront create-invalidation --distribution-id "$CF_DIST" --paths '/*' > /dev/null

echo ""
echo "Deploy triggered. App Runner will roll over in ~2-3 minutes."
echo "Monitor: https://eu-west-1.console.aws.amazon.com/apprunner"
