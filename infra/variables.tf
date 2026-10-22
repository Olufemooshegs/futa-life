variable "aws_region" {
  type    = string
  default = "af-south-1"
}

variable "google_client_id" {
  type      = string
  sensitive = true
}

variable "google_client_secret" {
  type      = string
  sensitive = true
}

variable "amplify_app_id" {
  type        = string
  description = "Your Amplify app ID (leave empty until Amplify hosting is created)"
  default     = "placeholder"
}