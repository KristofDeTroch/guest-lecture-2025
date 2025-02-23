resource "google_pubsub_topic" "email_topic" {
  name = "email-topic"
}

locals {
  email_function_uri = google_cloudfunctions2_function.temperature_function.service_config[0].uri
}

resource "google_pubsub_subscription" "email_subscription" {
  name  = "email-subscription"
  topic = google_pubsub_topic.email_topic.id

  ack_deadline_seconds = 20


  push_config {
    push_endpoint = local.email_function_uri

    attributes = {
      x-goog-version = "v1"
    }
    oidc_token {
      service_account_email = var.compute_service_account_email
      audience              = local.email_function_uri
    }
    no_wrapper {
      write_metadata = true
    }
  }
}
