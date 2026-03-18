# ---------------------------------------------------------------------------
# ACM — SSL/TLS certificate for pulsenewstoday.com
# Must be in us-east-1 for CloudFront
# ---------------------------------------------------------------------------

resource "aws_acm_certificate" "website" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation records — use tolist() to avoid the unknown-key for_each issue
locals {
  cert_dvos = aws_acm_certificate.website.domain_validation_options
}

resource "aws_route53_record" "cert_validation_apex" {
  zone_id = aws_route53_zone.main.zone_id
  name    = [for dvo in local.cert_dvos : dvo.resource_record_name if dvo.domain_name == var.domain_name][0]
  type    = [for dvo in local.cert_dvos : dvo.resource_record_type if dvo.domain_name == var.domain_name][0]
  ttl     = 60
  records = [[for dvo in local.cert_dvos : dvo.resource_record_value if dvo.domain_name == var.domain_name][0]]

  allow_overwrite = true
}

resource "aws_route53_record" "cert_validation_www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = [for dvo in local.cert_dvos : dvo.resource_record_name if dvo.domain_name == "www.${var.domain_name}"][0]
  type    = [for dvo in local.cert_dvos : dvo.resource_record_type if dvo.domain_name == "www.${var.domain_name}"][0]
  ttl     = 60
  records = [[for dvo in local.cert_dvos : dvo.resource_record_value if dvo.domain_name == "www.${var.domain_name}"][0]]

  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "website" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.website.arn
  validation_record_fqdns = [
    aws_route53_record.cert_validation_apex.fqdn,
    aws_route53_record.cert_validation_www.fqdn,
  ]
}
