# ---------------------------------------------------------------------------
# IAM — Search Indexer Lambda role (only Lambda left after App Runner migration)
# ---------------------------------------------------------------------------

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "indexer_lambda" {
  name               = "pulsenews-indexer-lambda-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "indexer_lambda_logs" {
  role       = aws_iam_role.indexer_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "indexer_lambda_stream" {
  name = "dynamodb-stream"
  role = aws_iam_role.indexer_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:DescribeStream",
          "dynamodb:ListStreams",
        ]
        Resource = "${aws_dynamodb_table.articles.arn}/stream/*"
      }
    ]
  })
}

resource "aws_iam_role_policy" "indexer_lambda_opensearch" {
  name = "opensearch-write"
  role = aws_iam_role.indexer_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["es:ESHttpGet", "es:ESHttpPost", "es:ESHttpPut", "es:ESHttpDelete", "es:ESHttpHead"]
        Resource = "${aws_opensearch_domain.search.arn}/*"
      }
    ]
  })
}

# Bedrock access for generating article embeddings at index time (Titan Embeddings v2)
resource "aws_iam_role_policy" "indexer_lambda_bedrock" {
  name = "bedrock-embeddings"
  role = aws_iam_role.indexer_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["bedrock:InvokeModel"]
      Resource = [
        "arn:aws:bedrock:${var.aws_region}::foundation-model/amazon.titan-embed-text-v2:0",
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0",
      ]
    }]
  })
}

# ---------------------------------------------------------------------------
# IAM — Ingestion Lambda role (RSS feeds → DynamoDB + S3 TTS audio)
# ---------------------------------------------------------------------------

resource "aws_iam_role" "ingest_lambda" {
  name               = "pulsenews-ingest-lambda-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "ingest_lambda_logs" {
  role       = aws_iam_role.ingest_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# DynamoDB read/write for ingestion
resource "aws_iam_role_policy" "ingest_lambda_dynamo" {
  name = "dynamodb-crud"
  role = aws_iam_role.ingest_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query",
        "dynamodb:Scan", "dynamodb:BatchWriteItem",
      ]
      Resource = [
        aws_dynamodb_table.articles.arn,
        "${aws_dynamodb_table.articles.arn}/index/*",
      ]
    }]
  })
}

# S3 read/write for TTS audio uploads + sitemap generation
resource "aws_iam_role_policy" "ingest_lambda_s3" {
  name = "s3-audio-sitemap"
  role = aws_iam_role.ingest_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:HeadObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.audio.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = aws_s3_bucket.audio.arn
        Condition = {
          StringLike = {
            "s3:prefix" = ["sitemaps/*"]
          }
        }
      }
    ]
  })
}
