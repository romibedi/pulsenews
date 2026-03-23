# AWS Infrastructure

All infrastructure is defined in Terraform (`infra/`) and deployed to `eu-west-1` (Ireland) by default. The architecture centers on App Runner for the Express.js container, CloudFront for edge caching and SSL, DynamoDB for article storage, OpenSearch for full-text search, and Lambda for ingestion and search indexing.

## App Runner Configuration

**File**: `infra/apprunner.tf`

### Service Definition
```hcl
resource "aws_apprunner_service" "app" {
  service_name = "pulsenews-${var.environment}"

  image_repository {
    image_identifier      = "${aws_ecr_repository.app.repository_url}:latest"
    image_repository_type = "ECR"
    image_configuration {
      port = "8080"
      runtime_environment_variables = {
        DYNAMODB_TABLE      = aws_dynamodb_table.articles.name
        OPENSEARCH_ENDPOINT = "https://${aws_opensearch_domain.search.endpoint}"
        ANTHROPIC_API_KEY   = var.anthropic_api_key
        NODE_ENV            = "production"
        SITE_URL            = "https://${var.domain_name}"
        AWS_REGION          = var.aws_region
        AUDIO_BUCKET        = aws_s3_bucket.audio.id
        ENABLE_KNN          = var.enable_knn
      }
    }
  }

  instance_configuration {
    cpu               = "1024"   # 1 vCPU
    memory            = "2048"   # 2 GB
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  auto_deployments_enabled = false  # Manual deploys via ECR push
}
```

### Auto-Scaling
```hcl
max_concurrency = 100  # requests per instance before scaling
max_size        = 3    # max instances
min_size        = 1    # always-on baseline
```

### Health Check
```hcl
protocol            = "HTTP"
path                = "/api/health"
interval            = 10
timeout             = 5
healthy_threshold   = 1
unhealthy_threshold = 5
```

### IAM Permissions
The instance role has policies for:
- **DynamoDB**: Full CRUD on the articles table and all GSIs
- **S3**: PutObject, GetObject, HeadObject on the audio bucket
- **OpenSearch**: ESHttpGet, ESHttpPost for search queries
- **Bedrock**: InvokeModel on `amazon.titan-embed-text-v2:0` (for search query embeddings)

## CloudFront Distribution

**File**: `infra/cloudfront.tf`

### Origins

| Origin ID | Target | Purpose |
|-----------|--------|---------|
| `apprunner` | App Runner service URL | API + SSR + SPA |
| `audio-s3` | S3 bucket (OAC) | Pre-generated audio + sitemaps |

### Cache Behaviors (in order of specificity)

| Path Pattern | Origin | Cache Policy | Notes |
|-------------|--------|-------------|-------|
| `/audio/*` | S3 | `static_assets` (TTL 86400-31536000) | No compression (audio) |
| `/sitemaps/*` | S3 | `dynamic` (TTL 0-600) | Compressed |
| `/assets/*` | App Runner | `static_assets` (TTL 86400-31536000) | Vite content-hashed files |
| `/*` (default) | App Runner | `dynamic` (TTL 0-600) | Respects origin Cache-Control |

### Cache Policies

**static_assets**:
- default_ttl: 86400 (24h)
- max_ttl: 31536000 (1 year)
- No cookies, no headers, no query strings in cache key
- Brotli + gzip compression enabled

**dynamic**:
- default_ttl: 0
- max_ttl: 600 (10 min)
- All query strings forwarded (needed for API pagination)
- Brotli + gzip compression enabled

### Origin Request Policy
Forwards `Content-Type`, `Accept`, and `User-Agent` headers to App Runner. The `User-Agent` forwarding is critical for bot detection in SSR (`server/ssr.js`).

### Configuration
```hcl
price_class     = "PriceClass_100"   # US + Europe edges only
http_version    = "http2and3"
aliases         = [var.domain_name, "www.${var.domain_name}"]
viewer_certificate = acm_certificate  # TLSv1.2_2021 minimum
```

## DynamoDB Table Design

**File**: `infra/dynamodb.tf`

### Table Structure
```hcl
name         = "pulsenews-articles"
billing_mode = "PAY_PER_REQUEST"
hash_key     = "PK"    # Partition key (String)
range_key    = "SK"     # Sort key (String)
```

### Partition Key Patterns

| PK | SK | Use Case |
|----|-----|---------|
| `GLOBAL#CAT#world` | `{ISO-date}#{articleId}` | Global category queries |
| `REGION#india#CAT#technology` | `{ISO-date}#{articleId}` | Regional category queries |
| `REGION#india` | `{ISO-date}#{articleId}` | Regional general queries |
| `LANG#hi` | `{ISO-date}#{articleId}` | Language-specific queries |
| `CITY#mumbai` | `{ISO-date}#{articleId}` | City-level queries |
| `SITEMAP` | `{ISO-date}#{articleId}` | Sitemap generation, search indexing |

### Global Secondary Indexes

| Index | Hash Key | Range Key | Projection | Purpose |
|-------|----------|-----------|------------|---------|
| `articleId-index` | `articleId` | `date` | ALL | Article lookup by ID, dedup checks |
| `slug-index` | `slug` | `date` | ALL | SEO-friendly URL resolution |

### TTL
```hcl
ttl {
  attribute_name = "ttl"
  enabled        = true
}
```
Articles expire after 90 days. The `ttl` attribute is set to `Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)` during ingestion.

### DynamoDB Streams
```hcl
stream_enabled   = true
stream_view_type = "NEW_AND_OLD_IMAGES"
```
Used to trigger the search indexer Lambda.

### Point-in-Time Recovery
Enabled for disaster recovery.

## S3 Buckets

**File**: `infra/s3.tf`

### Audio Bucket
```
Bucket:     pulsenews-audio-{env}
Contents:   audio/{lang}/{slug}.mp3    -- TTS audio files
            sitemaps/daily/{date}.xml  -- Daily article sitemaps
            sitemaps/news.xml          -- Google News sitemap
            sitemaps/static.xml        -- Category/region/city sitemap
            sitemaps/index.xml         -- Master sitemap index
Lifecycle:  90-day expiry
Access:     CloudFront OAC (no public access)
```

### CloudFront OAC
```hcl
resource "aws_cloudfront_origin_access_control" "audio" {
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
```

Bucket policy allows only CloudFront to read objects, conditioned on the distribution ARN.

## Lambda Functions

**File**: `infra/lambda.tf`

### Ingestion Lambda
```hcl
function_name                  = "pulsenews-ingest-${var.environment}"
handler                        = "ingest/handler.handler"
runtime                        = "nodejs20.x"
architectures                  = ["arm64"]
memory_size                    = 512
timeout                        = 900   # 15 minutes
reserved_concurrent_executions = 1     # Prevent overlapping runs
```

Environment variables: `DYNAMODB_TABLE`, `AUDIO_BUCKET`, `SITE_URL`, `NODE_ENV`

### Search Indexer Lambda
```hcl
function_name = "pulsenews-search-indexer-${var.environment}"
handler       = "search/indexer.handler"
runtime       = "nodejs20.x"
architectures = ["arm64"]
memory_size   = 256
timeout       = 60
```

Environment variables: `OPENSEARCH_ENDPOINT`, `NODE_ENV`, `ENABLE_KNN`

### DynamoDB Streams Event Source Mapping
```hcl
resource "aws_lambda_event_source_mapping" "indexer_stream" {
  event_source_arn  = aws_dynamodb_table.articles.stream_arn
  function_name     = aws_lambda_function.indexer.arn
  starting_position = "TRIM_HORIZON"

  batch_size                         = 50
  maximum_batching_window_in_seconds = 30
  bisect_batch_on_function_error     = true
  maximum_retry_attempts             = 3

  filter_criteria {
    filter {
      pattern = jsonencode({
        dynamodb = {
          NewImage = {
            PK = { S = [{ prefix = "SITEMAP" }] }
          }
        }
      })
    }
  }
}
```

The filter ensures only `PK = SITEMAP` records trigger the indexer, avoiding duplicate indexing of the same article from different partition keys.

### Lambda Packaging
Built via `null_resource` provisioner that runs `npm ci --omit=dev` and creates a zip of the `server/` directory.

## EventBridge Scheduling

**File**: `infra/eventbridge.tf`

```hcl
resource "aws_cloudwatch_event_rule" "ingestion" {
  name                = "pulsenews-ingestion-${var.environment}"
  schedule_expression = "rate(15 minutes)"
}
```

Triggers the ingestion Lambda every 15 minutes. Combined with `reserved_concurrent_executions = 1`, this ensures at most one ingestion run at a time.

## OpenSearch

**File**: `infra/opensearch.tf`

```hcl
resource "aws_opensearch_domain" "search" {
  domain_name    = "pulsenews-search"
  engine_version = "OpenSearch_2.13"

  cluster_config {
    instance_type  = var.opensearch_instance_type  # default: t3.small.search
    instance_count = 1
  }

  ebs_options {
    volume_type = "gp3"
    volume_size = var.opensearch_volume_size  # default: 10 GB
  }
}
```

Features enabled:
- Node-to-node encryption
- Encryption at rest
- Enforce HTTPS (TLS 1.2)
- Fine-grained access control (IAM-based, no internal user database)
- kNN index enabled (for hybrid BM25 + vector search)

Access policies allow:
- Current AWS account (admin): full `es:*` access
- App Runner instance role: `ESHttpGet`, `ESHttpPost` (search queries)
- Indexer Lambda role: full `es:*` access (index creation, document writes)

## Cross-Account DNS Setup

**File**: `infra/route53.tf`

```hcl
resource "aws_route53_zone" "main" {
  name = var.domain_name  # pulsenewstoday.com
}

# Apex domain -> CloudFront
resource "aws_route53_record" "apex" {
  name = var.domain_name
  type = "A"
  alias {
    name    = aws_cloudfront_distribution.website.domain_name
    zone_id = aws_cloudfront_distribution.website.hosted_zone_id
  }
}

# www subdomain -> CloudFront
resource "aws_route53_record" "www" {
  name = "www.${var.domain_name}"
  type = "A"
  alias {
    name    = aws_cloudfront_distribution.website.domain_name
    zone_id = aws_cloudfront_distribution.website.hosted_zone_id
  }
}
```

Both apex and www point to CloudFront via ALIAS records.

### ACM Certificate
**File**: `infra/acm.tf`

Certificate issued for the domain with DNS validation. Must be in `us-east-1` for CloudFront (standard AWS requirement).

## Docker Build

**File**: `Dockerfile`

Two-stage build:
1. **frontend-build**: `node:20-alpine`, runs `npm ci` + `npm run build` (Vite)
2. **production**: `node:20-alpine`, copies server code + `npm install --omit=dev`, copies `dist/` from stage 1 into `./public`

Entrypoint: `node server.js` (port 8080)

## Terraform Variables

**File**: `infra/variables.tf`

| Variable | Default | Description |
|----------|---------|-------------|
| `aws_region` | `eu-west-1` | Primary AWS region |
| `environment` | `prod` | Environment name |
| `domain_name` | `pulsenewstoday.com` | Root domain |
| `anthropic_api_key` | `""` (sensitive) | Anthropic API key for AI analysis |
| `dynamodb_table_name` | `pulsenews-articles` | DynamoDB table name |
| `opensearch_instance_type` | `t3.small.search` | OpenSearch instance type |
| `opensearch_volume_size` | `10` | OpenSearch EBS volume (GB) |
| `enable_knn` | `false` | Enable hybrid BM25+kNN vector search |
