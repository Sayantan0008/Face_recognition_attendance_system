from google.cloud import storage
import os

def upload_to_gcs(file_path, filename):
    client = storage.Client()
    bucket_name = os.getenv("GCS_BUCKET_NAME")
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(f"faces/{filename}")
    blob.upload_from_filename(file_path)
    return blob.public_url