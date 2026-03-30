# Cloud Run Job & Container Templates

Reference templates for migrating batch applications to Cloud Run Jobs, Kubernetes CronJobs, and containerized workloads.

---

## Cloud Run Job YAML Templates

### Basic Cloud Run Job

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: batch-data-export
  labels:
    app: batch-data-export
    team: platform
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
    spec:
      taskCount: 1
      template:
        spec:
          containers:
          - image: us-central1-docker.pkg.dev/my-project/batch/data-export:latest
            resources:
              limits:
                cpu: "2"
                memory: "4Gi"
            env:
            - name: BATCH_DATE
              value: "$(date +%Y-%m-%d)"
            - name: OUTPUT_BUCKET
              value: "gs://my-project-batch-output"
          timeoutSeconds: 3600
          maxRetries: 3
          serviceAccountName: batch-runner@my-project.iam.gserviceaccount.com
```

### Cloud Run Job with Secret Manager

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: batch-db-sync
spec:
  template:
    spec:
      taskCount: 1
      template:
        spec:
          containers:
          - image: us-central1-docker.pkg.dev/my-project/batch/db-sync:latest
            resources:
              limits:
                cpu: "2"
                memory: "8Gi"
            env:
            - name: DB_HOST
              value: "10.0.0.5"
            - name: DB_NAME
              value: "production"
            - name: DB_USERNAME
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: username
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
            - name: ENCRYPTION_KEY
              valueFrom:
                secretKeyRef:
                  name: encryption-key
                  key: latest
          timeoutSeconds: 7200
          maxRetries: 2
          serviceAccountName: batch-db-sync@my-project.iam.gserviceaccount.com
```

### Cloud Run Job with VPC Connector

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: batch-internal-etl
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/vpc-access-connector: projects/my-project/locations/us-central1/connectors/batch-vpc-connector
        run.googleapis.com/vpc-access-egress: private-ranges-only
    spec:
      taskCount: 1
      template:
        spec:
          containers:
          - image: us-central1-docker.pkg.dev/my-project/batch/internal-etl:latest
            resources:
              limits:
                cpu: "4"
                memory: "8Gi"
            env:
            - name: INTERNAL_API_URL
              value: "http://10.128.0.50:8080/api"
            - name: DATABASE_URL
              value: "jdbc:postgresql://10.128.0.30:5432/warehouse"
          timeoutSeconds: 3600
          maxRetries: 3
```

### Cloud Run Job with Cloud SQL

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: batch-report-generator
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/cloudsql-instances: my-project:us-central1:production-db
    spec:
      taskCount: 1
      template:
        spec:
          containers:
          - image: us-central1-docker.pkg.dev/my-project/batch/report-gen:latest
            resources:
              limits:
                cpu: "2"
                memory: "4Gi"
            env:
            - name: DB_CONNECTION_NAME
              value: "my-project:us-central1:production-db"
            - name: DB_NAME
              value: "reports"
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: cloudsql-credentials
                  key: username
            - name: DB_PASS
              valueFrom:
                secretKeyRef:
                  name: cloudsql-credentials
                  key: password
          timeoutSeconds: 1800
          maxRetries: 2
```

### Parallel Cloud Run Job (multiple tasks)

```yaml
apiVersion: run.googleapis.com/v1
kind: Job
metadata:
  name: batch-parallel-processor
spec:
  template:
    spec:
      taskCount: 10
      parallelism: 5
      template:
        spec:
          containers:
          - image: us-central1-docker.pkg.dev/my-project/batch/parallel-proc:latest
            resources:
              limits:
                cpu: "1"
                memory: "2Gi"
            env:
            - name: TASK_INDEX
              value: "$(CLOUD_RUN_TASK_INDEX)"
            - name: TASK_COUNT
              value: "$(CLOUD_RUN_TASK_COUNT)"
            - name: INPUT_BUCKET
              value: "gs://my-project-input"
          timeoutSeconds: 1800
          maxRetries: 3
```

---

## Kubernetes CronJob YAML Templates

### Basic CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-data-export
  namespace: batch-jobs
  labels:
    app: data-export
    tier: batch
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  timeZone: "America/New_York"
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 5
  jobTemplate:
    spec:
      activeDeadlineSeconds: 3600
      template:
        metadata:
          labels:
            app: data-export
        spec:
          containers:
          - name: data-export
            image: us-central1-docker.pkg.dev/my-project/batch/data-export:latest
            resources:
              requests:
                cpu: "1"
                memory: "2Gi"
              limits:
                cpu: "2"
                memory: "4Gi"
            env:
            - name: BATCH_MODE
              value: "nightly"
            volumeMounts:
            - name: config
              mountPath: /app/config
              readOnly: true
          volumes:
          - name: config
            configMap:
              name: data-export-config
          restartPolicy: OnFailure
      backoffLimit: 3
```

### CronJob with Persistent Volume (checkpointing)

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: stateful-batch-processor
  namespace: batch-jobs
spec:
  schedule: "0 */4 * * *"  # Every 4 hours
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      activeDeadlineSeconds: 7200
      template:
        spec:
          containers:
          - name: processor
            image: us-central1-docker.pkg.dev/my-project/batch/processor:latest
            resources:
              requests:
                cpu: "2"
                memory: "4Gi"
              limits:
                cpu: "4"
                memory: "8Gi"
            env:
            - name: CHECKPOINT_DIR
              value: "/data/checkpoints"
            volumeMounts:
            - name: checkpoint-storage
              mountPath: /data/checkpoints
          volumes:
          - name: checkpoint-storage
            persistentVolumeClaim:
              claimName: batch-checkpoints-pvc
          restartPolicy: OnFailure
      backoffLimit: 3
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: batch-checkpoints-pvc
  namespace: batch-jobs
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard-rwo
```

### CronJob with Secret References

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-maintenance
  namespace: batch-jobs
spec:
  schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: db-maintenance
            image: us-central1-docker.pkg.dev/my-project/batch/db-maintenance:latest
            resources:
              requests:
                cpu: "500m"
                memory: "1Gi"
              limits:
                cpu: "1"
                memory: "2Gi"
            env:
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: host
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
            envFrom:
            - configMapRef:
                name: db-maintenance-config
          restartPolicy: OnFailure
      backoffLimit: 2
```

---

## Dockerfile Templates

### Java Batch Application (Spring Boot)

```dockerfile
# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests -q

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -S batch && adduser -S batch -G batch

# Copy artifact
COPY --from=build /build/target/*.jar app.jar

# Health check script for K8s probes
COPY docker/healthcheck.sh /app/healthcheck.sh
RUN chmod +x /app/healthcheck.sh

USER batch

# JVM tuning for batch workloads
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Java Batch Application (minimal)

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Python Batch Application

```dockerfile
FROM python:3.12-slim
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY config/ ./config/

# Create non-root user
RUN useradd -r -s /bin/false batch
USER batch

ENTRYPOINT ["python", "-m", "src.main"]
```

### Node.js Batch Application

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY src/ ./src/
COPY config/ ./config/

# Create non-root user
RUN addgroup -S batch && adduser -S batch -G batch
USER batch

ENTRYPOINT ["node", "src/main.js"]
```

---

## Cloud Scheduler Configuration

### Cloud Scheduler with Cloud Run Job (gcloud)

```bash
# Create a Cloud Scheduler job that triggers a Cloud Run Job
gcloud scheduler jobs create http nightly-export-trigger \
  --location=us-central1 \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/my-project/jobs/batch-data-export:run" \
  --http-method=POST \
  --oauth-service-account-email=scheduler-sa@my-project.iam.gserviceaccount.com
```

### Cloud Scheduler with Pub/Sub trigger

```bash
# Create topic
gcloud pubsub topics create batch-trigger-topic

# Create scheduler job that publishes to Pub/Sub
gcloud scheduler jobs create pubsub hourly-processor-trigger \
  --location=us-central1 \
  --schedule="0 * * * *" \
  --time-zone="UTC" \
  --topic=batch-trigger-topic \
  --message-body='{"job": "hourly-processor", "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"}'
```

### Terraform: Cloud Scheduler + Cloud Run Job

```hcl
resource "google_cloud_run_v2_job" "batch_job" {
  name     = "batch-data-export"
  location = "us-central1"

  template {
    task_count = 1

    template {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/batch/data-export:latest"

        resources {
          limits = {
            cpu    = "2"
            memory = "4Gi"
          }
        }

        env {
          name  = "OUTPUT_BUCKET"
          value = "gs://${var.project_id}-batch-output"
        }

        env {
          name = "DB_PASSWORD"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.db_password.secret_id
              version = "latest"
            }
          }
        }
      }

      timeout     = "3600s"
      max_retries = 3

      service_account = google_service_account.batch_runner.email
    }
  }
}

resource "google_cloud_scheduler_job" "batch_trigger" {
  name      = "batch-data-export-trigger"
  region    = "us-central1"
  schedule  = "0 2 * * *"
  time_zone = "America/New_York"

  http_target {
    http_method = "POST"
    uri         = "https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/${google_cloud_run_v2_job.batch_job.name}:run"

    oauth_token {
      service_account_email = google_service_account.scheduler_sa.email
    }
  }
}

resource "google_service_account" "batch_runner" {
  account_id   = "batch-runner"
  display_name = "Batch Job Runner"
}

resource "google_service_account" "scheduler_sa" {
  account_id   = "batch-scheduler"
  display_name = "Batch Scheduler"
}

resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker" {
  project  = var.project_id
  location = "us-central1"
  name     = google_cloud_run_v2_job.batch_job.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.scheduler_sa.email}"
}
```
