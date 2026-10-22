terraform {
  required_version = ">= 1.5"
  required_providers {
    aws    = { source = "hashicorp/aws", version = "~> 5.0" }
    random = { source = "hashicorp/random", version = "~> 3.6" }
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Cognito User Pool ──────────────────────────────────────────
resource "aws_cognito_user_pool" "futa_life" {
  name                     = "futa-life-user-pool"
  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }
  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = false
    mutable             = true
  }

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }

  tags = { Project = "futa-life" }
}

# ── Cognito Hosted UI domain (globally unique) ────────────────
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_cognito_user_pool_domain" "futa_life" {
  domain       = "futa-life-${random_string.suffix.result}"
  user_pool_id = aws_cognito_user_pool.futa_life.id
}

# ── Google as a federated identity provider ───────────────────
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.futa_life.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email profile openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email    = "email"
    name     = "name"
    username = "sub"
  }
}

# ── SPA client (no secret — public browser client) ────────────
resource "aws_cognito_user_pool_client" "futa_life" {
  name         = "futa-life-web-client"
  user_pool_id = aws_cognito_user_pool.futa_life.id

  generate_secret = false

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  supported_identity_providers         = ["COGNITO", "Google"]

  callback_urls = [
    "http://localhost:3000/auth/callback",
    "https://main.${var.amplify_app_id}.amplifyapp.com/auth/callback"
  ]
  logout_urls = [
    "http://localhost:3000",
    "https://main.${var.amplify_app_id}.amplifyapp.com"
  ]

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}

# ── DynamoDB single table (Saves + Leaderboard + Profiles) ────
resource "aws_dynamodb_table" "futa_life" {
  name         = "futa-life"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }
  attribute {
    name = "SK"
    type = "S"
  }
  attribute {
    name = "GSI1PK"
    type = "S"
  }
  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  tags = { Project = "futa-life" }
}