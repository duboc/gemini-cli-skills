# GCP Batch Processing Patterns

## Cloud Run Jobs vs GKE CronJobs — Detailed Comparison

| Feature | Cloud Run Jobs | GKE CronJobs |
|---------|---------------|--------------|
| Max execution time | 3600s (1 hour) | No limit |
| Max memory | 32 GiB | Node-dependent (up to 100s of GiB) |
| Max vCPUs | 8 | Node-dependent |
| GPU support | Yes (preview) | Yes (full support) |
| Scale-to-zero | Yes (no idle cost) | No (GKE nodes run continuously) |
| Startup time | Seconds (cold start) | Seconds (pod scheduling) |
| Networking | VPC connector or Direct VPC | Full VPC native |
| Persistent storage | Cloud Storage only | PVC, local SSD, Cloud Storage |
| Scheduling | Cloud Scheduler | Built-in CronJob spec |
| Concurrency control | Task count + parallelism | parallelism + completions |
| Management overhead | Zero (serverless) | GKE cluster management required |
| Knative compatible | Yes (built on Knative) | Yes (with Knative installed) |
| Cost model | Per vCPU-second + memory-second | Node instance cost (always-on) |
| Best for | Most batch jobs, cost-sensitive | Long-running, high-resource, GPU-heavy |

### Decision Criteria

Choose **Cloud Run Jobs** when:
- Job runs < 1 hour
- Memory needs < 32 GiB
- No persistent local storage needed
- Cost optimization is priority (scale-to-zero)
- Team prefers serverless management

Choose **GKE CronJobs** when:
- Job runs > 1 hour
- High memory or GPU requirements
- Need persistent volumes or local SSD
- Complex networking requirements
- Already running GKE for other workloads

---

## Cloud Composer DAG Patterns for Migrated Batch Chains

### Pattern 1: Sequential Chain Migration

Legacy batch chain: Job A → Job B → Job C

```python
from airflow import DAG
from airflow.providers.google.cloud.operators.cloud_run import CloudRunExecuteJobOperator
from datetime import datetime, timedelta

default_args = {
    'owner': 'batch-migration',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2),
}

with DAG(
    'migrated_batch_chain',
    default_args=default_args,
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['migrated', 'batch'],
) as dag:

    job_a = CloudRunExecuteJobOperator(
        task_id='extract_data',
        project_id='my-project',
        region='us-central1',
        job_name='extract-data-job',
    )

    job_b = CloudRunExecuteJobOperator(
        task_id='transform_data',
        project_id='my-project',
        region='us-central1',
        job_name='transform-data-job',
    )

    job_c = CloudRunExecuteJobOperator(
        task_id='load_data',
        project_id='my-project',
        region='us-central1',
        job_name='load-data-job',
    )

    job_a >> job_b >> job_c
```

### Pattern 2: Fan-Out / Fan-In

```python
    extract = CloudRunExecuteJobOperator(
        task_id='extract',
        job_name='extract-job',
        project_id='my-project',
        region='us-central1',
    )

    transform_orders = CloudRunExecuteJobOperator(
        task_id='transform_orders',
        job_name='transform-orders-job',
        project_id='my-project',
        region='us-central1',
    )

    transform_customers = CloudRunExecuteJobOperator(
        task_id='transform_customers',
        job_name='transform-customers-job',
        project_id='my-project',
        region='us-central1',
    )

    load = CloudRunExecuteJobOperator(
        task_id='load',
        job_name='load-job',
        project_id='my-project',
        region='us-central1',
    )

    extract >> [transform_orders, transform_customers] >> load
```

### Pattern 3: Conditional Branching

```python
from airflow.operators.python import BranchPythonOperator

def check_data_volume(**kwargs):
    # Check GCS file size to determine processing path
    from google.cloud import storage
    client = storage.Client()
    bucket = client.bucket('my-data-bucket')
    blob = bucket.blob('daily-extract/data.csv')
    blob.reload()
    if blob.size > 1_000_000_000:  # > 1 GB
        return 'heavy_processing'
    return 'light_processing'

branch = BranchPythonOperator(
    task_id='check_volume',
    python_callable=check_data_volume,
)
```

---

## Cloud Workflows YAML Examples for Sequential Job Orchestration

### Simple Sequential Pipeline

```yaml
main:
  steps:
    - init:
        assign:
          - project_id: ${sys.get_env("GOOGLE_CLOUD_PROJECT_ID")}
          - region: "us-central1"

    - run_extract_job:
        call: googleapis.run.v1.namespaces.jobs.run
        args:
          name: ${"namespaces/" + project_id + "/jobs/extract-data-job"}
          location: ${region}
        result: extract_result

    - check_extract:
        switch:
          - condition: ${extract_result.status.conditions[0].status != "True"}
            raise: "Extract job failed"

    - run_transform_job:
        call: googleapis.run.v1.namespaces.jobs.run
        args:
          name: ${"namespaces/" + project_id + "/jobs/transform-data-job"}
          location: ${region}
        result: transform_result

    - run_load_job:
        call: googleapis.run.v1.namespaces.jobs.run
        args:
          name: ${"namespaces/" + project_id + "/jobs/load-data-job"}
          location: ${region}
        result: load_result

    - return_result:
        return:
          extract: ${extract_result.status}
          transform: ${transform_result.status}
          load: ${load_result.status}
```

### Parallel Execution with Cloud Workflows

```yaml
main:
  steps:
    - run_extract:
        call: googleapis.run.v1.namespaces.jobs.run
        args:
          name: ${"namespaces/" + project_id + "/jobs/extract-job"}
          location: "us-central1"

    - parallel_transforms:
        parallel:
          branches:
            - transform_orders:
                steps:
                  - run_orders:
                      call: googleapis.run.v1.namespaces.jobs.run
                      args:
                        name: ${"namespaces/" + project_id + "/jobs/transform-orders"}
                        location: "us-central1"
            - transform_customers:
                steps:
                  - run_customers:
                      call: googleapis.run.v1.namespaces.jobs.run
                      args:
                        name: ${"namespaces/" + project_id + "/jobs/transform-customers"}
                        location: "us-central1"

    - run_load:
        call: googleapis.run.v1.namespaces.jobs.run
        args:
          name: ${"namespaces/" + project_id + "/jobs/load-job"}
          location: "us-central1"
```

### Error Handling and Retry

```yaml
main:
  steps:
    - run_job_with_retry:
        try:
          call: googleapis.run.v1.namespaces.jobs.run
          args:
            name: ${"namespaces/" + project_id + "/jobs/my-job"}
            location: "us-central1"
          result: job_result
        retry:
          predicate: ${default_retry_predicate}
          max_retries: 3
          backoff:
            initial_delay: 30
            max_delay: 300
            multiplier: 2
        except:
          as: e
          steps:
            - send_alert:
                call: http.post
                args:
                  url: "https://monitoring.googleapis.com/..."
                  body:
                    error: ${e.message}
            - fail:
                raise: ${e}
```

---

## Eventarc Trigger Patterns for Event-Driven Batch Execution

### GCS File Upload Trigger

```bash
# Trigger Cloud Run Job when file uploaded to GCS bucket
gcloud eventarc triggers create gcs-upload-trigger \
  --location=us-central1 \
  --destination-run-service=my-processor-service \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=my-input-bucket" \
  --service-account=my-sa@my-project.iam.gserviceaccount.com
```

### BigQuery Job Completion Trigger

```bash
# Trigger processing when a BigQuery job completes
gcloud eventarc triggers create bq-complete-trigger \
  --location=us-central1 \
  --destination-run-service=post-query-processor \
  --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.bigquery.v2.JobCompleted" \
  --service-account=my-sa@my-project.iam.gserviceaccount.com
```

### Pub/Sub Message Trigger

```bash
# Trigger Cloud Run service from Pub/Sub topic
gcloud eventarc triggers create pubsub-trigger \
  --location=us-central1 \
  --destination-run-service=event-processor \
  --destination-run-region=us-central1 \
  --transport-topic=projects/my-project/topics/batch-trigger \
  --service-account=my-sa@my-project.iam.gserviceaccount.com
```

---

## Cloud Scheduler Configuration for All Cron Patterns

### Common Batch Schedules

```bash
# Daily at midnight UTC
gcloud scheduler jobs create http daily-batch \
  --schedule="0 0 * * *" \
  --uri="https://us-central1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/my-project/jobs/daily-job:run" \
  --http-method=POST \
  --oauth-service-account-email=scheduler-sa@my-project.iam.gserviceaccount.com \
  --location=us-central1

# Hourly
gcloud scheduler jobs create http hourly-batch \
  --schedule="0 * * * *" \
  --uri="..." \
  --http-method=POST \
  --oauth-service-account-email=scheduler-sa@my-project.iam.gserviceaccount.com

# Every 15 minutes during business hours (Mon-Fri, 8am-6pm)
gcloud scheduler jobs create http business-hours-batch \
  --schedule="*/15 8-17 * * 1-5" \
  --uri="..." \
  --time-zone="America/New_York"

# First day of every month at 1 AM
gcloud scheduler jobs create http monthly-batch \
  --schedule="0 1 1 * *" \
  --uri="..."

# Every Sunday at 3 AM (weekly maintenance)
gcloud scheduler jobs create http weekly-maintenance \
  --schedule="0 3 * * 0" \
  --uri="..."
```

### Triggering Cloud Workflows from Scheduler

```bash
gcloud scheduler jobs create http workflow-trigger \
  --schedule="0 2 * * *" \
  --uri="https://workflowexecutions.googleapis.com/v1/projects/my-project/locations/us-central1/workflows/batch-pipeline/executions" \
  --http-method=POST \
  --message-body='{"argument": "{\"date\": \"today\"}"}' \
  --oauth-service-account-email=scheduler-sa@my-project.iam.gserviceaccount.com
```

---

## Cost Estimation Formulas for Cloud Run Jobs

### Cloud Run Jobs Pricing Components

```
Total Cost = vCPU Cost + Memory Cost + Request Cost + Networking Cost

vCPU Cost = (vCPU count) x (execution seconds) x ($0.00002400/vCPU-second)
Memory Cost = (GiB) x (execution seconds) x ($0.00000250/GiB-second)
Request Cost = (number of executions) x ($0.40/million)
```

### Free Tier (per month)

- 180,000 vCPU-seconds
- 360,000 GiB-seconds
- 2 million requests

### Example Cost Calculations

**Daily ETL job (2 vCPU, 4 GiB, 30 min):**
```
Monthly executions: 30
vCPU: 2 x 1800s x 30 x $0.0000240 = $2.59
Memory: 4 x 1800s x 30 x $0.0000025 = $0.54
Requests: negligible
Total: ~$3.13/month
```

**Hourly sync job (1 vCPU, 2 GiB, 5 min):**
```
Monthly executions: 720
vCPU: 1 x 300s x 720 x $0.0000240 = $5.18
Memory: 2 x 300s x 720 x $0.0000025 = $1.08
Requests: negligible
Total: ~$6.26/month
```

**Compare with always-on VM (e2-standard-2):**
```
e2-standard-2: ~$48.92/month (on-demand)
Savings: 87-94% for typical batch workloads
```

### Cost Optimization Tips

- Use minimum CPU allocation for I/O-bound jobs
- Right-size memory based on actual usage (check Cloud Monitoring)
- Use committed use discounts for predictable workloads on GKE
- Leverage free tier for low-frequency jobs
- Consider Cloud Run execution environment gen2 for better CPU performance

---

## Monitoring Setup: Cloud Monitoring Dashboards for Batch Job Health

### Key Metrics to Monitor

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Job execution duration | `run.googleapis.com/job/completed_task_attempt_count` | > 2x expected duration |
| Job failure rate | `run.googleapis.com/job/completed_task_attempt_count` (filtered by status) | > 0 failures in window |
| Cloud Scheduler missed fires | `scheduler.googleapis.com/job/execution_count` | Expected - actual > 0 |
| Memory utilization | `run.googleapis.com/container/memory/utilizations` | > 90% (right-size up) |
| CPU utilization | `run.googleapis.com/container/cpu/utilizations` | Sustained > 95% |
| GCS read/write latency | `storage.googleapis.com/api/request_latencies` | > p99 baseline |

### Cloud Monitoring Dashboard JSON

```json
{
  "displayName": "Batch Job Health Dashboard",
  "mosaicLayout": {
    "tiles": [
      {
        "widget": {
          "title": "Job Execution Duration (p50, p95, p99)",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_job\" AND metric.type=\"run.googleapis.com/job/completed_task_attempt_count\"",
                  "aggregation": {
                    "alignmentPeriod": "3600s",
                    "perSeriesAligner": "ALIGN_RATE"
                  }
                }
              }
            }]
          }
        }
      },
      {
        "widget": {
          "title": "Job Success vs Failure",
          "xyChart": {
            "dataSets": [{
              "timeSeriesQuery": {
                "timeSeriesFilter": {
                  "filter": "resource.type=\"cloud_run_job\" AND metric.type=\"run.googleapis.com/job/completed_task_attempt_count\""
                }
              }
            }]
          }
        }
      }
    ]
  }
}
```

### Alert Policy for Job Failures

```bash
# Create alert for Cloud Run Job failures
gcloud alpha monitoring policies create \
  --display-name="Batch Job Failure Alert" \
  --condition-display-name="Cloud Run Job Failed" \
  --condition-filter='resource.type="cloud_run_job" AND metric.type="run.googleapis.com/job/completed_task_attempt_count" AND metric.labels.result="failed"' \
  --condition-threshold-value=0 \
  --condition-threshold-comparison=COMPARISON_GT \
  --condition-threshold-duration=0s \
  --notification-channels=projects/my-project/notificationChannels/CHANNEL_ID \
  --combiner=OR
```

### Structured Logging for Batch Jobs

```python
import json
import logging
import sys

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "timestamp": self.formatTime(record),
            "labels": {
                "job_name": os.environ.get("CLOUD_RUN_JOB", "unknown"),
                "execution_id": os.environ.get("CLOUD_RUN_EXECUTION", "unknown"),
                "task_index": os.environ.get("CLOUD_RUN_TASK_INDEX", "0"),
            }
        }
        if record.exc_info:
            log_entry["stack_trace"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JSONFormatter())
logging.root.addHandler(handler)
logging.root.setLevel(logging.INFO)
```
