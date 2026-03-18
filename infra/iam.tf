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
