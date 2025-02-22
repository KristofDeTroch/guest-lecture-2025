resource "google_storage_bucket" "bucket" {
  name                        = "${var.google_project}-gcf-source"
  location                    = "US"
  uniform_bucket_level_access = true
}



resource "null_resource" "build_function" {
  triggers = {
    run_at = var.commit_hash
  }

  provisioner "local-exec" {
    command = <<EOT
      cd ${path.root}/../../temperature-functions && \
      pnpm install && \
      pnpm run gcp-build 
    EOT
  }
}

data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "${path.root}/../../temperature-functions"
  excludes    = ["node_modules", "dist", ".git", ".gcloudignore", ".gitignore"]
  output_path = "${path.root}/zips/function-source-${var.commit_hash}.zip"
  depends_on  = [null_resource.build_function]
}

resource "google_storage_bucket_object" "functions_zip" {
  name       = "function-source.zip"
  bucket     = google_storage_bucket.bucket.name
  source     = data.archive_file.function_zip.output_path
  depends_on = [data.archive_file.function_zip]
}
