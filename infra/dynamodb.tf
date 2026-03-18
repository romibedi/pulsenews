# ---------------------------------------------------------------------------
# DynamoDB — single-table design for article storage
# ---------------------------------------------------------------------------

resource "aws_dynamodb_table" "articles" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "articleId"
    type = "S"
  }

  attribute {
    name = "date"
    type = "S"
  }

  attribute {
    name = "slug"
    type = "S"
  }

  # GSI for article lookup by ID
  global_secondary_index {
    name            = "articleId-index"
    hash_key        = "articleId"
    range_key       = "date"
    projection_type = "ALL"
  }

  # GSI for SEO slug lookup
  global_secondary_index {
    name            = "slug-index"
    hash_key        = "slug"
    range_key       = "date"
    projection_type = "ALL"
  }

  # Enable DynamoDB Streams for OpenSearch indexer
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  # 90-day TTL auto-expiry
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = true
  }

  lifecycle {
    ignore_changes = [deletion_protection_enabled]
  }
}
