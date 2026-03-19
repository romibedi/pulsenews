# ---------------------------------------------------------------------------
# CloudFront — sits in front of App Runner for SSL + edge caching
#
# Routing:
#   /assets/*  → App Runner (long cache, Vite hashed filenames)
#   /*         → App Runner (pass-through, respects origin Cache-Control)
# ---------------------------------------------------------------------------

locals {
  apprunner_domain = aws_apprunner_service.app.service_url
}

# Cache policy for static assets (long cache, immutable hashed files from Vite)
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "pulsenews-static-${var.environment}"
  default_ttl = 86400
  max_ttl     = 31536000
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Cache policy for dynamic content — respect origin Cache-Control headers
resource "aws_cloudfront_cache_policy" "dynamic" {
  name        = "pulsenews-dynamic-${var.environment}"
  default_ttl = 0
  max_ttl     = 600
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

# Origin request policy — forward headers needed by Express (User-Agent for bot SSR)
resource "aws_cloudfront_origin_request_policy" "apprunner" {
  name = "pulsenews-apprunner-origin-${var.environment}"

  cookies_config {
    cookie_behavior = "none"
  }
  headers_config {
    header_behavior = "whitelist"
    headers {
      items = ["Content-Type", "Accept", "User-Agent"]
    }
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_cloudfront_distribution" "website" {
  enabled         = true
  is_ipv6_enabled = true
  price_class     = "PriceClass_100"
  http_version    = "http2and3"
  aliases         = [var.domain_name, "www.${var.domain_name}"]

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.website.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Origin: App Runner (API + SSR + frontend)
  origin {
    domain_name = local.apprunner_domain
    origin_id   = "apprunner"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Origin: S3 for pre-generated TTS audio
  origin {
    domain_name              = aws_s3_bucket.audio.bucket_regional_domain_name
    origin_id                = "audio-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.audio.id
  }

  # Default behavior: pass through to App Runner (API + SSR + SPA fallback)
  default_cache_behavior {
    target_origin_id         = "apprunner"
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    cache_policy_id          = aws_cloudfront_cache_policy.dynamic.id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.apprunner.id
    compress                 = true
  }

  # Pre-generated TTS audio: long cache from S3
  ordered_cache_behavior {
    path_pattern           = "/audio/*"
    target_origin_id       = "audio-s3"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    compress               = false # audio/mpeg doesn't benefit from compression
  }

  # Static assets: long cache (Vite content-hashes filenames)
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    target_origin_id       = "apprunner"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.static_assets.id
    compress               = true
  }

  depends_on = [aws_acm_certificate_validation.website]
}
