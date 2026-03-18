# ---------------------------------------------------------------------------
# App Runner — Express.js container serving frontend + API + SSR
# ---------------------------------------------------------------------------

# IAM role for App Runner to pull from ECR
data "aws_iam_policy_document" "apprunner_access_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["build.apprunner.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apprunner_access" {
  name               = "pulsenews-apprunner-access-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.apprunner_access_assume.json
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr" {
  role       = aws_iam_role.apprunner_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# IAM instance role for the running container
data "aws_iam_policy_document" "apprunner_instance_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["tasks.apprunner.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "apprunner_instance" {
  name               = "pulsenews-apprunner-instance-${var.environment}"
  assume_role_policy = data.aws_iam_policy_document.apprunner_instance_assume.json
}

# DynamoDB full CRUD (API reads + ingestion writes)
resource "aws_iam_role_policy" "apprunner_dynamo" {
  name = "dynamodb-crud"
  role = aws_iam_role.apprunner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem",
        "dynamodb:DeleteItem", "dynamodb:Query", "dynamodb:Scan",
        "dynamodb:BatchWriteItem", "dynamodb:BatchGetItem",
      ]
      Resource = [
        aws_dynamodb_table.articles.arn,
        "${aws_dynamodb_table.articles.arn}/index/*",
      ]
    }]
  })
}

# OpenSearch read access (search queries)
resource "aws_iam_role_policy" "apprunner_opensearch" {
  name = "opensearch-search"
  role = aws_iam_role.apprunner_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["es:ESHttpGet", "es:ESHttpPost"]
      Resource = "${aws_opensearch_domain.search.arn}/*"
    }]
  })
}

# Auto-scaling configuration
resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = "pulsenews-scaling-${var.environment}"
  max_concurrency                 = 100
  max_size                        = 3
  min_size                        = 1
}

# The App Runner service
resource "aws_apprunner_service" "app" {
  service_name = "pulsenews-${var.environment}"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_access.arn
    }

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
        }
      }
    }

    auto_deployments_enabled = false
  }

  instance_configuration {
    cpu               = "1024"
    memory            = "2048"
    instance_role_arn = aws_iam_role.apprunner_instance.arn
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }
}
