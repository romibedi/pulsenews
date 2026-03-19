# ---------------------------------------------------------------------------
# S3 — Pre-generated TTS audio files
#
# Audio is generated at ingestion time and served via CloudFront.
# Files expire after 90 days (matching DynamoDB article TTL).
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "audio" {
  bucket = "pulsenews-audio-${var.environment}"
}

resource "aws_s3_bucket_lifecycle_configuration" "audio_expiry" {
  bucket = aws_s3_bucket.audio.id

  rule {
    id     = "expire-old-audio"
    status = "Enabled"

    filter {}

    expiration {
      days = 90
    }
  }
}

resource "aws_s3_bucket_public_access_block" "audio" {
  bucket                  = aws_s3_bucket.audio.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront OAC for S3
resource "aws_cloudfront_origin_access_control" "audio" {
  name                              = "pulsenews-audio-oac-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 bucket policy — allow CloudFront to read audio files
resource "aws_s3_bucket_policy" "audio_cloudfront" {
  bucket = aws_s3_bucket.audio.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontRead"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.audio.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
        }
      }
    }]
  })
}

output "audio_bucket_name" {
  value = aws_s3_bucket.audio.id
}
