resource "aws_route53_record" "alb_dns_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name = var.dev_api_sever_domain
  type = "A"

  depends_on = [aws_alb.alb]

  alias {
    name = aws_alb.alb.dns_name
    zone_id = aws_alb.alb.zone_id
    evaluate_target_health = false
  }
}
