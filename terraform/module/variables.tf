variable "google_project" {
  type = string
}

variable "commit_hash" {
  type = string
}

variable "env_prefix" {
  type = string
}

variable "environment" {
  type = string
}

variable "region" {
  type = string
}

variable "temperature" {
  type = object({
    threshold = number
    recipient = string
  })
}

variable "sendgrid" {
  type = object({
    api_key = string
    sender  = string
  })
}

