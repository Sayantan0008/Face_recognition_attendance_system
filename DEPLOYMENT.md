# Deployment Guide for Face Recognition Attendance System

This guide provides instructions for deploying the Face Recognition Attendance System to various cloud platforms.

## Prerequisites

Before deploying, ensure you have:

1. A working local version of the application
2. Accounts set up on your chosen cloud platform
3. Command-line tools for your chosen platform installed
4. Updated your `.env` file with production values

## Environment Configuration

Update your `.env` file with production settings:

```
API_KEY=your-secure-api-key
GCS_BUCKET_NAME=your-production-bucket-name
DATABASE_URL=postgresql://user:password@host/dbname
```

## Google Cloud Platform Deployment

### Setup Google Cloud Storage

1. Create a GCS bucket for face data storage:

   ```
   gcloud storage buckets create gs://your-bucket-name --location=us-central1
   ```

2. Set up service account credentials:

   ```
   gcloud iam service-accounts create face-recognition-app
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:face-recognition-app@your-project-id.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   gcloud iam service-accounts keys create key.json \
     --iam-account=face-recognition-app@your-project-id.iam.gserviceaccount.com
   ```

3. Set the environment variable for authentication:
   ```
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
   ```

### Setup Cloud SQL (PostgreSQL)

1. Create a PostgreSQL instance:

   ```
   gcloud sql instances create face-recognition-db \
     --database-version=POSTGRES_13 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. Create a database and user:

   ```
   gcloud sql databases create attendance --instance=face-recognition-db
   gcloud sql users create app-user \
     --instance=face-recognition-db \
     --password=your-secure-password
   ```

3. Update your `.env` file with the PostgreSQL connection string:
   ```
   DATABASE_URL=postgresql://app-user:your-secure-password@/attendance?host=/cloudsql/your-project-id:us-central1:face-recognition-db
   ```

### Deploy to Cloud Run

1. Build and push your Docker image:

   ```
   gcloud builds submit --tag gcr.io/your-project-id/face-recognition
   ```

2. Deploy to Cloud Run:
   ```
   gcloud run deploy face-recognition \
     --image gcr.io/your-project-id/face-recognition \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars="DATABASE_URL=postgresql://app-user:your-secure-password@/attendance?host=/cloudsql/your-project-id:us-central1:face-recognition-db,GCS_BUCKET_NAME=your-bucket-name,API_KEY=your-secure-api-key"
   ```

## Heroku Deployment

1. Install the Heroku CLI and login:

   ```
   heroku login
   ```

2. Create a new Heroku app:

   ```
   heroku create face-recognition-app
   ```

3. Add PostgreSQL add-on:

   ```
   heroku addons:create heroku-postgresql:hobby-dev
   ```

4. Set environment variables:

   ```
   heroku config:set API_KEY=your-secure-api-key
   heroku config:set GCS_BUCKET_NAME=your-bucket-name
   ```

5. Create a `Procfile` in your project root:

   ```
   web: uvicorn main:app --host=0.0.0.0 --port=$PORT
   ```

6. Deploy your application:
   ```
   git push heroku main
   ```

## AWS Elastic Beanstalk Deployment

1. Install the AWS CLI and EB CLI:

   ```
   pip install awscli awsebcli
   ```

2. Configure AWS credentials:

   ```
   aws configure
   ```

3. Initialize EB application:

   ```
   eb init -p python-3.8 face-recognition
   ```

4. Create an environment:

   ```
   eb create face-recognition-env
   ```

5. Set environment variables:

   ```
   eb setenv API_KEY=your-secure-api-key GCS_BUCKET_NAME=your-bucket-name DATABASE_URL=postgresql://user:password@host/dbname
   ```

6. Deploy your application:
   ```
   eb deploy
   ```

## Microsoft Azure App Service Deployment

1. Install the Azure CLI and login:

   ```
   az login
   ```

2. Create a resource group:

   ```
   az group create --name face-recognition-group --location eastus
   ```

3. Create an App Service plan:

   ```
   az appservice plan create --name face-recognition-plan --resource-group face-recognition-group --sku B1 --is-linux
   ```

4. Create a PostgreSQL server:

   ```
   az postgres server create --resource-group face-recognition-group --name face-recognition-db --location eastus --admin-user dbadmin --admin-password your-secure-password --sku-name B_Gen5_1
   ```

5. Create a database:

   ```
   az postgres db create --resource-group face-recognition-group --server-name face-recognition-db --name attendance
   ```

6. Deploy your application:

   ```
   az webapp up --runtime "PYTHON|3.9" --resource-group face-recognition-group --name face-recognition-app --sku B1
   ```

7. Configure environment variables:
   ```
   az webapp config appsettings set --resource-group face-recognition-group --name face-recognition-app --settings API_KEY=your-secure-api-key GCS_BUCKET_NAME=your-bucket-name DATABASE_URL=postgresql://dbadmin:your-secure-password@face-recognition-db.postgres.database.azure.com:5432/attendance
   ```

## Production Considerations

### Security

1. Use strong, unique API keys for production
2. Enable HTTPS for all endpoints
3. Implement proper authentication for admin functions
4. Regularly rotate service account credentials

### Performance

1. Consider using a CDN for static assets
2. Implement caching where appropriate
3. Scale database resources based on expected load
4. Monitor application performance and adjust resources as needed

### Maintenance

1. Set up automated backups for your database
2. Implement logging and monitoring
3. Create a CI/CD pipeline for automated deployments
4. Regularly update dependencies to address security vulnerabilities

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Verify connection strings and ensure firewall rules allow connections
2. **GCS Authentication Issues**: Check service account permissions and credential paths
3. **Memory Errors**: Face recognition is resource-intensive; ensure your hosting plan provides sufficient memory
4. **Slow Performance**: Consider upgrading your hosting plan or optimizing the application

### Getting Help

If you encounter issues during deployment, check:

1. Cloud provider documentation
2. FastAPI deployment guides
3. Face recognition library documentation
4. Stack Overflow for similar issues

---

This deployment guide covers the most popular cloud platforms. Adjust the instructions based on your specific requirements and cloud provider preferences.
