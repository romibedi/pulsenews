terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "veyrictech-terraform-state"
    key            = "pulsenews/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}

# Primary provider — eu-west-1 (where DynamoDB, Lambda, OpenSearch live)
provider "aws" {
  region = var.aws_region

  # Disable account-specific DynamoDB endpoints (causes DNS issues with some setups)
  endpoints {
    dynamodb = "https://dynamodb.${var.aws_region}.amazonaws.com"
  }

  default_tags {
    tags = {
      Project     = "PulseNewsToday"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# US-East-1 provider — required for CloudFront ACM certificates
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "PulseNewsToday"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
