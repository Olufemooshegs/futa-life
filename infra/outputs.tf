output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.futa_life.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.futa_life.id
}

output "cognito_domain" {
  value = "https://${aws_cognito_user_pool_domain.futa_life.domain}.auth.${var.aws_region}.amazoncognito.com"
}

output "dynamodb_table" {
  value = aws_dynamodb_table.futa_life.name
}