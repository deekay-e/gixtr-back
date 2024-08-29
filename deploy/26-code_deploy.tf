resource "aws_codedeploy_app" "code_deploy_app" {
  name = "${local.prefix}-app"
  compute_platform = "Server"
}

resource "aws_codedeploy_deployment_group" "code_deploy_dg" {
  app_name = aws_codedeploy_app.code_deploy_app.name
  deployment_group_name = "${local.prefix}-dg"
  deployment_config_name = "CodeDeployDefault.AllAtOnce"
  service_role_arn = aws_iam_role.code_deploy_role.arn
  autoscaling_groups = [aws_autoscaling_group.ec2_asg.name]

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type = "BLUE_GREEN"
  }

  load_balancer_info {
    target_group_info {
      name = aws_alb_target_group.server_backend_tg.name
    }
  }

  auto_rollback_configuration {
    enabled = true
    events = ["DEPLOYMENT_FAILURE"]
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    green_fleet_provisioning_option {
      action = "COPY_AUTO_SCALING_GROUP"
    }

    terminate_blue_instances_on_deployment_success {
      action = "TERMINATE"
      termination_wait_time_in_minutes = 0
    }
  }

  provisioner "local-exec" {
    command = file("./scripts/delete-asg.sh")
    when = destroy
    on_failure = continue

    environment = {
      ENV_TYPE = "Backend-${terraform.workspace}"
    }
  }
}
