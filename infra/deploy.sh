#!/bin/bash
# ---------------------------------------------------------------------------
# PulseNewsToday — Deployment script (App Runner + CloudFront)
#
# Usage:
#   ./deploy.sh              # Deploy everything
#   ./deploy.sh infra        # Terraform only
#   ./deploy.sh app          # Build & push Docker image, trigger App Runner deploy
#   ./deploy.sh indexer      # Update search indexer Lambda only
#   ./deploy.sh backfill     # Run OpenSearch backfill for existing articles
#   ./deploy.sh invalidate   # Invalidate CloudFront cache
# ---------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
INFRA_DIR="$SCRIPT_DIR"
REGION="eu-west-1"

cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[deploy]${NC} $1"; }
warn() { echo -e "${YELLOW}[deploy]${NC} $1"; }
err() { echo -e "${RED}[deploy]${NC} $1"; exit 1; }

get_output() {
  cd "$INFRA_DIR"
  terraform output -raw "$1" 2>/dev/null
  cd "$PROJECT_DIR"
}

deploy_infra() {
  log "Running Terraform..."
  cd "$INFRA_DIR"
  terraform init
  terraform plan -out=tfplan
  echo ""
  read -p "Apply this plan? (y/N) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    terraform apply tfplan
    log "Infrastructure deployed!"
  else
    warn "Skipped infrastructure deployment."
  fi
  cd "$PROJECT_DIR"
}

deploy_app() {
  ECR_REPO=$(get_output "ecr_repository_url")
  if [ -z "$ECR_REPO" ]; then
    err "ECR repository URL not found. Run 'deploy_infra' first."
  fi

  log "Building Docker image..."
  docker build --platform linux/amd64 -t pulsenews-app:latest .

  log "Logging into ECR..."
  aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REPO"

  log "Tagging and pushing..."
  docker tag pulsenews-app:latest "$ECR_REPO:latest"
  docker push "$ECR_REPO:latest"

  log "Triggering App Runner deployment..."
  APP_ARN=$(aws apprunner list-services --region "$REGION" \
    --query "ServiceSummaryList[?ServiceName=='pulsenews-prod'].ServiceArn" --output text)
  if [ -n "$APP_ARN" ] && [ "$APP_ARN" != "None" ]; then
    aws apprunner start-deployment --service-arn "$APP_ARN" --region "$REGION"
    log "Deployment triggered. App Runner will pull the new image."
  else
    warn "App Runner service not found. Create it first with 'deploy_infra'."
  fi
}

deploy_indexer() {
  log "Building indexer Lambda package..."
  cd server && npm ci --omit=dev && cd ..
  rm -f infra/lambda.zip
  cd server && zip -r ../infra/lambda.zip . -x "node_modules/.cache/*" "*.test.*" && cd ..

  log "Updating indexer Lambda..."
  aws lambda update-function-code \
    --function-name "pulsenews-search-indexer-prod" \
    --zip-file "fileb://infra/lambda.zip" \
    --region "$REGION" \
    --publish || warn "Lambda update failed (may not exist yet)"

  log "Indexer Lambda updated!"
}

invalidate_cache() {
  DIST_ID=$(get_output "cloudfront_distribution_id")
  if [ -z "$DIST_ID" ]; then
    warn "CloudFront distribution ID not available."
    return
  fi
  log "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths '/*'
}

run_backfill() {
  ENDPOINT=$(get_output "opensearch_endpoint")
  log "Running OpenSearch backfill against $ENDPOINT..."
  OPENSEARCH_ENDPOINT="$ENDPOINT" node server/search/backfill.js
  log "Backfill complete!"
}

# --- Main ---
case "${1:-all}" in
  infra)
    deploy_infra
    ;;
  app)
    deploy_app
    ;;
  indexer)
    deploy_indexer
    ;;
  backfill)
    run_backfill
    ;;
  invalidate)
    invalidate_cache
    ;;
  all)
    deploy_infra
    deploy_app
    deploy_indexer
    invalidate_cache
    log ""
    log "Deployment complete!"
    log "  Website: https://www.pulsenewstoday.com"
    log "  App Runner: $(get_output 'apprunner_service_url' 2>/dev/null || echo 'pending')"
    log ""
    warn "Don't forget to run './deploy.sh backfill' to index existing articles into OpenSearch"
    ;;
  *)
    echo "Usage: $0 {all|infra|app|indexer|backfill|invalidate}"
    exit 1
    ;;
esac
