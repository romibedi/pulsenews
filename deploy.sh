#!/bin/bash
# PulseNews AWS Deployment Script
# Usage: ./deploy.sh [--guided]

set -e

STACK_NAME="pulsenews-api"
REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="${SAM_BUCKET:-}"

echo "=== PulseNews AWS Deployment ==="
echo ""

# Check prerequisites
command -v aws >/dev/null 2>&1 || { echo "ERROR: AWS CLI not installed. Run: brew install awscli"; exit 1; }
command -v sam >/dev/null 2>&1 || { echo "ERROR: AWS SAM CLI not installed. Run: brew install aws-sam-cli"; exit 1; }

# Step 1: Install server dependencies
echo "[1/4] Installing server dependencies..."
cd server && npm ci && cd ..

# Step 2: Build SAM
echo "[2/4] Building SAM application..."
sam build --template template.yaml

# Step 3: Deploy SAM
echo "[3/4] Deploying API to Lambda + API Gateway..."
if [ "$1" = "--guided" ]; then
  sam deploy --guided --stack-name "$STACK_NAME" --region "$REGION" --capabilities CAPABILITY_IAM
else
  sam deploy \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --capabilities CAPABILITY_IAM \
    --no-confirm-changeset \
    --no-fail-on-empty-changeset \
    --resolve-s3
fi

# Step 4: Get API URL
echo "[4/4] Getting API URL..."
API_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text)

echo ""
echo "=== Deployment Complete ==="
echo "API URL: $API_URL"
echo ""
echo "Next steps:"
echo "  1. Set VITE_API_URL=$API_URL in Amplify environment variables"
echo "  2. In Amplify Console > Rewrites, add:"
echo "     Source: /api/<*>  Target: $API_URL/api/<*>  Type: 200 (Rewrite)"
echo "  3. Trigger a new Amplify build"
echo ""
echo "To set ANTHROPIC_API_KEY:"
echo "  aws lambda update-function-configuration \\"
echo "    --function-name $STACK_NAME-PulseNewsApi-xxx \\"
echo "    --environment 'Variables={ANTHROPIC_API_KEY=your-key,NODE_ENV=production}'"
