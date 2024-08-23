resource "aws_autosclaing_group" "ec2_asg" {
  name = "${local-prefix}-ASG"
  vpc_zone_identifier = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
  max_size = 1
  min_size = 1
  desired_capacity = 1
  launch_configuration = aws_launch_configuration.asg_launch_config.name
  health_check_type = "ELB"
  health_check_grace_period = 600
  default_cooldown = 150
  force_delete = true
  target_group_arns = [aws_alb_target_group.sever_backend_tg.arn]
  enabled_metrics = [
    "GroupMinSize",
    "GroupMaxSize",
    "GroupDesiredCapacity",
    "GroupInServiceInstances",
    "GroupTottalInstances"
  ]

  depends_on = [aws_elasticache_replication_group.gixtr_redis_cluster]

  tag {
    key = "Name"
    value = "EC2-ASG-${terraform.workspace}"
    propagate_at_launch = true
  }

  tag {
    key = "Type"
    value = "Backend-${terraform.workspace}"
    propagate_at_launch = true
  }
}
