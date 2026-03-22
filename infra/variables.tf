variable "aws_region" {
  description = "AWS region for primary resources"
  type        = string
  default     = "eu-west-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "domain_name" {
  description = "Root domain name"
  type        = string
  default     = "pulsenewstoday.com"
}

variable "anthropic_api_key" {
  description = "Anthropic API key for AI summaries"
  type        = string
  sensitive   = true
  default     = ""
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for articles"
  type        = string
  default     = "pulsenews-articles"
}

variable "opensearch_instance_type" {
  description = "OpenSearch instance type"
  type        = string
  default     = "t3.small.search"
}

variable "opensearch_volume_size" {
  description = "OpenSearch EBS volume size in GB"
  type        = number
  default     = 10
}

variable "enable_knn" {
  description = "Enable kNN vector search (Bedrock embeddings). Set to 'true' to enable hybrid BM25+kNN, 'false' for BM25-only."
  type        = string
  default     = "false"
}
