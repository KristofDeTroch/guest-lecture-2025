variable "google_credentials_file" {
  type      = string
  sensitive = true
}

variable "google_project" {
  type = string
}

variable "commit_hash" {
  type = string
}

variable "sendgrid_api_key" {
  type      = string
  sensitive = true
}
