terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "6.20.0"
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


provider "null" {

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
  sendgrid_sender = "kristof.detroch+alert@panenco.com"
}

module "temperature_service" {
  source         = "../module"
  google_project = var.google_project
  temperature    = local.temperature
  sendgrid = {
    api_key = var.sendgrid_api_key
    sender  = local.sendgrid_sender
  }
  commit_hash = var.commit_hash
  env_prefix  = local.data.env_prefix
  environment = local.data.environment
  region      = local.data.region
}
