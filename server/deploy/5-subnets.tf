# public subnets
resource "aws_subnet" "public_subnet_a" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.vpc_public_subnets[0]
  availability_zone = var.vpc_availability_zones[0]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-public-a" })
  )
}

resource "aws_subnet" "public_subnet_b" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.vpc_public_subnets[1]
  availability_zone = var.vpc_availability_zones[1]
  map_public_ip_on_launch = true

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-public-b" })
  )
}

resource "aws_subnet" "private_subnet_a" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.vpc_private_subnets[0]
  availability_zone = var.vpc_availability_zones[0]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-a" })
  )
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id = aws_vpc.main.id
  cidr_block = var.vpc_private_subnets[1]
  availability_zone = var.vpc_availability_zones[1]

  tags = merge(
    local.common_tags,
    tomap({ "Name" = "${local.prefix}-private-b" })
  )
}
