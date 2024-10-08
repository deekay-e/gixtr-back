resource "aws_elasticache_subnet_group" "elasticache_subnet_group" {
  name = "${local.prefix}-elasticache-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
}

resource "aws_elasticache_replication_group" "gixtr_redis_cluster" {
  automatic_failover_enabled = true
  replication_group_id = "${local.prefix}-redis"
  description = "Redis elasticache replication group"
  node_type = var.elasticache_node_type
  num_cache_clusters = 2
  parameter_group_name = var.elasticache_parameter_group_name
  port = 6379
  multi_az_enabled = true
  subnet_group_name = aws_elasticache_subnet_group.elasticache_subnet_group.name
  security_group_ids = [aws_security_group.elasticache_sg.id]

  depends_on = [aws_security_group.elasticache_sg]

  provisioner "local-exec" {
    command = file("./scripts/update-env.sh")

    environment = {
      REDIS_ENDPOINT = self.primary_endpoint_address
    }
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-elasticache" })
  )
}
