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

  dead_letter_policy {
    dead_letter_topic     = google_pubsub_topic.email_dead_letter_topic.id
    max_delivery_attempts = 5
  }

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


resource "google_pubsub_topic" "email_dead_letter_topic" {
  name                       = "email-dead-letter-topic"
  message_retention_duration = "259200s" # 3 days
}

resource "google_pubsub_subscription" "email_dead_letter_subscription" {
  name  = "email-dead-letter-subscription"
  topic = google_pubsub_topic.email_dead_letter_topic.id
}

resource "google_monitoring_notification_channel" "email_dlq_alert_channel" {
  display_name = "email-dlq-alert-channel"
  type         = "email"
  labels       = { email_address = var.email_dlq_alert_email }
}

resource "google_monitoring_alert_policy" "email_dlq_alert_policy" {
  display_name = "email-dlq-alert-policy"
  combiner     = "OR"


  conditions {
    display_name = "email-dlq-alert-policy"

    condition_threshold {
      filter     = "resource.type = \"pubsub_subscription\" AND metric.type = \"pubsub.googleapis.com/subscription/dead_letter_message_count\" AND resource.labels.subscription_id = \"${google_pubsub_subscription.email_subscription.name}\""
      comparison = "COMPARISON_GT"
      duration   = "0s"
      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }

      threshold_value = 0
    }
  }
  alert_strategy {
    notification_prompts = ["OPENED"]
  }
  notification_channels = [google_monitoring_notification_channel.email_dlq_alert_channel.id]
}
