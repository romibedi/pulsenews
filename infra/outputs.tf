output "website_url" {
  description = "Website URL"
  value       = "https://www.${var.domain_name}"
}

output "apprunner_service_url" {
  description = "App Runner service URL (direct)"
  value       = "https://${aws_apprunner_service.app.service_url}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for cache invalidation)"
  value       = aws_cloudfront_distribution.website.id
}

output "ecr_repository_url" {
  description = "ECR repository URL for Docker image pushes"
  value       = aws_ecr_repository.app.repository_url
}

output "opensearch_endpoint" {
  description = "OpenSearch domain endpoint"
  value       = "https://${aws_opensearch_domain.search.endpoint}"
}

output "route53_nameservers" {
  description = "Route53 nameservers — point your domain registrar here"
  value       = aws_route53_zone.main.name_servers
}

output "dynamodb_table" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.articles.name
}

output "deploy_command" {
  description = "Command to build, push Docker image, and deploy"
  value       = <<-EOT
    # Build & push:
    docker build -t ${aws_ecr_repository.app.repository_url}:latest ..
    aws ecr get-login-password --region ${var.aws_region} | docker login --username AWS --password-stdin ${aws_ecr_repository.app.repository_url}
    docker push ${aws_ecr_repository.app.repository_url}:latest
    # Deploy:
    aws apprunner start-deployment --service-arn ${aws_apprunner_service.app.arn}
    # Invalidate CloudFront cache:
    aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.website.id} --paths '/*'
  EOT
}
