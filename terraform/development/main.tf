terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.20.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "2.7.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "3.2.1"
    }
  }
  required_version = "1.7.2"
}

provider "google" {
  credentials = file(var.google_credentials_file)
  project     = var.google_project
}

provider "archive" {
}

locals {
  environment = "development"
  region      = "europe-west1"
  data = {
    environment = "development"
    env_prefix  = "euw1-dev"
    region      = local.region
    tags        = { terraform : true, environment : local.environment }
  }
  temperature = {
    threshold = 37.5
    recipient = "kristof.detroch+guest-lecture@panenco.com"
  }
  sendgrid_sender               = "kristof.detroch+alert@panenco.com"
  compute_service_account_email = "712153936309-compute@developer.gserviceaccount.com"
  email_dlq_alert_email         = "kristof.detroch+dead-letter@panenco.com"
}

module "temperature_service" {
  source         = "../module"
  google_project = var.google_project
  temperature    = local.temperature
  sendgrid = {
    api_key = var.sendgrid_api_key
    sender  = local.sendgrid_sender
  }
  commit_hash                   = var.commit_hash
  env_prefix                    = local.data.env_prefix
  environment                   = local.data.environment
  region                        = local.data.region
  compute_service_account_email = local.compute_service_account_email
  email_dlq_alert_email         = local.email_dlq_alert_email
}
