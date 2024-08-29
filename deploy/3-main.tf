terraform {
  backend "s3" {
    bucket = "gixtr-terraform-state"
    key = "dev/gixtr.tfstate"
    region = "us-east-1"
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project = var.project
    ManagedBy = "Terraform"
    Owner = "Dee Kay"
  }
}
