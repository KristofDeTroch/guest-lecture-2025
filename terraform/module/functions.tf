resource "google_cloudfunctions2_function" "temperature_function" {
  name     = "temperature-function"
  location = var.region

  build_config {
    runtime     = "nodejs20"
    entry_point = "temperatureWarning"

    source {
      storage_source {
        bucket     = google_storage_bucket.bucket.name
        object     = google_storage_bucket_object.functions_zip.name
        generation = google_storage_bucket_object.functions_zip.generation
      }
    }
  }


  service_config {
    max_instance_count = 1
    available_memory   = "256M"
    timeout_seconds    = 60


    environment_variables = {
      SENDGRID__FROM = var.sendgrid.sender
      SENTRY__DSN    = var.sentry_dsn
    }
    dynamic "secret_environment_variables" {
      for_each = {
        SENDGRID__API_KEY = google_secret_manager_secret.sendgrid_api_key.secret_id
      }

      content {
        key        = secret_environment_variables.key
        version    = "latest"
        project_id = var.google_project
        secret     = secret_environment_variables.value
      }
    }
  }

  depends_on = [google_storage_bucket_object.functions_zip]
}
