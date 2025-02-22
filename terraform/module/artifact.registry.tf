resource "google_artifact_registry_repository" "api_registry" {
  location      = var.region
  repository_id = "${var.google_project}-artifact-registry"
  format        = "DOCKER"
}


resource "null_resource" "docker_packaging" {
  provisioner "local-exec" {
    command = <<EOF
        set -e
        cd ../../temperature-service
        docker buildx build -f ./Dockerfile . --push \
        --platform linux/amd64 \
        -t ${var.region}-docker.pkg.dev/${var.google_project}/${google_artifact_registry_repository.api_registry.repository_id}/temperature-service:latest \
        -t ${var.region}-docker.pkg.dev/${var.google_project}/${google_artifact_registry_repository.api_registry.repository_id}/temperature-service:${var.commit_hash} \
        --cache-to=type=inline,mode=max --progress=plain
        EOF
  }
  triggers = {
    run_at = var.commit_hash
  }
  depends_on = [
    google_artifact_registry_repository.api_registry
  ]
}
