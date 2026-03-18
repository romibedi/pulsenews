# ---------------------------------------------------------------------------
# Lambda — Search Indexer only (DynamoDB Streams → OpenSearch)
# API and Ingestion are now handled by App Runner
# ---------------------------------------------------------------------------

resource "null_resource" "lambda_build" {
  triggers = {
    source_hash = filemd5("${path.module}/../server/package.json")
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/.."
    command     = <<-EOT
      cd server && npm ci --omit=dev
      cd ${path.module}/..
      rm -f infra/lambda.zip
      cd server && zip -r ../infra/lambda.zip . -x "node_modules/.cache/*" "*.test.*"
    EOT
  }
}

data "archive_file" "lambda_fallback" {
  type        = "zip"
  source_dir  = "${path.module}/../server"
  output_path = "${path.module}/lambda.zip"

  depends_on = [null_resource.lambda_build]
}

resource "aws_lambda_function" "indexer" {
  function_name = "pulsenews-search-indexer-${var.environment}"
  role          = aws_iam_role.indexer_lambda.arn
  handler       = "search/indexer.handler"
  runtime       = "nodejs20.x"
  architectures = ["arm64"]
  memory_size   = 256
  timeout       = 60

  filename         = "${path.module}/lambda.zip"
  source_code_hash = data.archive_file.lambda_fallback.output_base64sha256

  environment {
    variables = {
      OPENSEARCH_ENDPOINT = "https://${aws_opensearch_domain.search.endpoint}"
      NODE_ENV            = "production"
    }
  }

  depends_on = [null_resource.lambda_build]
}

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
