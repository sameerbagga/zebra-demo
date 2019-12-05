ASSUMPTIONS:
assuming 3x buckets in Google Cloud project
1) initial-upload-bucket --> to upload the file for triggering the cloud function
2) invalid_records --> function will write all invalid data to this bucket, with the same filename as of the uploaded
3) valid_records --> function will write all valid data to this bucket, with the same filename as of the uploaded


COMMAND TO DEPLOY THE FUNCTION:
gcloud functions deploy uploadHandler --runtime nodejs8 --trigger-resource initial-upload-bucket --trigger-event google.storage.object.finalize