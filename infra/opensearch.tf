# ---------------------------------------------------------------------------
# OpenSearch — multilingual full-text search
# ---------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

resource "aws_opensearch_domain" "search" {
  domain_name    = "pulsenews-search"
  engine_version = "OpenSearch_2.13"

  cluster_config {
    instance_type            = var.opensearch_instance_type
    instance_count           = 1
    dedicated_master_enabled = false
    zone_awareness_enabled   = false
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = var.opensearch_volume_size
  }

  node_to_node_encryption {
    enabled = true
  }

  encrypt_at_rest {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = false
    master_user_options {
      master_user_arn = data.aws_caller_identity.current.arn
    }
  }

  access_policies = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { AWS = data.aws_caller_identity.current.arn }
        Action    = "es:*"
        Resource  = "arn:aws:es:${var.aws_region}:${data.aws_caller_identity.current.account_id}:domain/pulsenews-search/*"
      },
      {
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.apprunner_instance.arn }
        Action    = ["es:ESHttpGet", "es:ESHttpPost"]
        Resource  = "arn:aws:es:${var.aws_region}:${data.aws_caller_identity.current.account_id}:domain/pulsenews-search/*"
      },
      {
        Effect    = "Allow"
        Principal = { AWS = aws_iam_role.indexer_lambda.arn }
        Action    = "es:*"
        Resource  = "arn:aws:es:${var.aws_region}:${data.aws_caller_identity.current.account_id}:domain/pulsenews-search/*"
      }
    ]
  })
}
