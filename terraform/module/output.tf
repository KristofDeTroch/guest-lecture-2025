output "service_url" {
  value = google_cloud_run_v2_service.temperature_service.uri
}
output "function_uri" {
  value = google_cloudfunctions2_function.temperature_function.service_config[0].uri
}
