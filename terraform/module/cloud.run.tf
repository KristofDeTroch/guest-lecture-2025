resource "google_cloud_run_v2_service" "temperature_service" {
  name                = "temperature-service"
  location            = var.region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.google_project}/${google_artifact_registry_repository.api_registry.repository_id}/temperature-service:${var.commit_hash}"
      env {
        name = "SENDGRID__API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.sendgrid_api_key.secret_id
            version = google_secret_manager_secret_version.sendgrid_api_key.version
          }
        }
      }
      env {
        name  = "SENDGRID__FROM"
        value = var.sendgrid.sender
      }
      env {
        name  = "GCLOUD__PUBSUB_TOPICS__EMAIL"
        value = google_pubsub_topic.email_topic.name
      }
    }
  }
  depends_on = [
    null_resource.docker_packaging
  ]
}
