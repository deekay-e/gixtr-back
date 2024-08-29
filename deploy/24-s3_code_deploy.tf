resource "aws_s3_bucket" "code_deploy_bb" {
  bucket = "${local.prefix}-app"
  force_destroy = true

  tags = local.common_tags
}

resource "aws_s3_bucket_acl" "code_deploy_bb_acl" {
  bucket = aws_s3_bucket.code_deploy_bb.id
  acl = "private"
}

resource "aws_s3_bucket_public_access_block" "code_deploy_bb_pab" {
  bucket = aws_s3_bucket.code_deploy_bb.id

  block_public_acls = true
  block_public_policy = true
  restrict_public_buckets = true
  ignore_public_acls = true
}

resource "aws_s3_bucket_versioning" "code_deploy_bb_version" {
  bucket = aws_s3_bucket.code_deploy_bb.id

  versioning_configuration {
    status = "Enabled"
  }
}
