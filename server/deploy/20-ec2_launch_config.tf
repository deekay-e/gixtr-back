resource "aws_launch_configuration" "asg_launch_config" {
  name = "${local.prefix}-launch-config"
  image_id = data.aws_ami.ec2_ami.id
  instance_type = var.ec2_instance_type
  key_name = "gixtrKP"
  associate_public_ip_address = false
  iam_instance_profile = aws_iam_instance_profile.ec2_instance_profile.name
  security_groups = [aws_security_group.autoscaling_group_sg.id]

  lifecycle {
    create_before_destroy = true
  }
}
