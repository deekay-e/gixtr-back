resource "aws_security_group" "bastion_host_sg" {
  name = "${local.prefix}-bastion-host-sg"
  description = "Allows SSH to an from bastion host instance"
  vpc_id = aws_vpc.main.vpc_id

  ingress {
    from_port = 22
    to_port = 22
    protocol = "TCP"
    cidr_blocks = [var.bastion_host_cidr]
    description = "Allows SSH to bastion host instance"
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows SSH from bastion host instance"
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-bastion-host-sg" })
  )
}

resource "aws_security_group" "alb_sg" {
  name = "${local.prefix}-alb-sg"
  description = "Allows traffic through the application load balancer"
  vpc_id = aws_vpc.main.vpc_id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "TCP"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows HTTP traffic to load balancer"
  }

  ingress {
    from_port = 443
    to_port = 443
    protocol = "TCP"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows HTTPS traffic to load balancer"
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows traffic from load balancer"
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-alb-sg" })
  )
}

resource "aws_security_group" "autoscaling_group_sg" {
  name = "${local.prefix}-autoscaling-group-sg"
  description = "Allows internet access for instances launched with ASG"
  vpc_id = aws_vpc.main.vpc_id

  ingress {
    from_port = 80
    to_port = 80
    protocol = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description = "Allows HTTP traffic to web server"
  }

  ingress {
    from_port = 443
    to_port = 443
    protocol = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description = "Allows HTTPS traffic to web server"
  }

  ingress {
    from_port = 22
    to_port = 22
    protocol = "TCP"
    security_groups = [aws_security_group.bastion_host_sg.id]
    description = "Allows HTTPS traffic to web server via bastion host"
  }

  ingress {
    from_port = 8008
    to_port = 8008
    protocol = "TCP"
    security_groups = [aws_security_group.alb_sg.id]
    description = "Allows HTTPS traffic to web server via ALB"
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows traffic from web server"
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-autoscaling-group-sg" })
  )
}

resource "aws_security_group" "elasticache_sg" {
  name = "${local.prefix}-elasticache-sg"
  description = "Allows internet access for elasticache service"
  vpc_id = aws_vpc.main.vpc_id
  }

  ingress {
    from_port = 6379
    to_port = 6379
    protocol = "TCP"
    security_groups = [aws_security_group.bastion_host_sg.id]
    description = "Allows access to redis server via bastion host"
  }

  ingress {
    from_port = 6379
    to_port = 6379
    protocol = "TCP"
    security_groups = [aws_security_group.autoscaling_group_sg.id]
    description = "Allows access to redis server via ASG"

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = [var.global_destination_cidr_block]
    description = "Allows traffic from web server"
  }

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-elasticache-sg" })
  )
}
