# Batch to Serverless Transformer

A Gemini CLI skill for migrating legacy batch applications to cloud-native serverless and container solutions. Generates Cloud Run Job, Kubernetes CronJob, and serverless configurations to replace always-on batch infrastructure with ephemeral, scale-to-zero alternatives.

## What It Does

This skill analyzes your batch applications and produces migration-ready configurations:

1. **Job assessment** — Evaluates each batch job's duration, state requirements, resource needs, I/O patterns, concurrency constraints, and scheduling triggers.
2. **Target selection** — Matches each job to the optimal serverless platform (Cloud Run Jobs, Cloud Functions, K8s CronJobs, Cloud Workflows, or Cloud Composer).
3. **Configuration generation** — Drafts Cloud Run Job YAML, K8s CronJob YAML, Dockerfiles, Terraform snippets, and Cloud Scheduler configs per job.
4. **Orchestration design** — Replaces batch chains with DAG-based orchestration using Airflow or Cloud Workflows, with Mermaid diagrams.
5. **Cost comparison** — Estimates savings from moving to pay-per-execution pricing versus always-on servers.

## When Does It Activate?

The skill activates when you ask Gemini to migrate or modernize batch processing infrastructure.

| Trigger | Example |
|---------|---------|
| Migrate batch to serverless | "Migrate our batch jobs to serverless infrastructure" |
| Convert batch to Cloud Run | "Convert these batch applications to Cloud Run Jobs" |
| Replace batch with CronJobs | "Replace our batch scheduler with Kubernetes CronJobs" |
| Modernize batch processing | "Modernize our batch processing to scale-to-zero" |
| Containerize batch jobs | "Containerize our Java batch jobs for cloud deployment" |
| Orchestrate batch chains | "Replace our sequential batch chain with Cloud Workflows" |

## Topics Covered

| Area | Details |
|------|---------|
| **Cloud Run Jobs** | Job YAML generation, timeout configuration, retry policies, VPC connectors, Cloud SQL connections, Secret Manager integration |
| **Kubernetes CronJobs** | CronJob YAML, concurrency policies, resource requests/limits, restart policies, backoff limits |
| **Cloud Functions** | Event-triggered batch for short-duration jobs, Pub/Sub triggers, Cloud Storage triggers |
| **Cloud Workflows** | YAML step definitions, retry configuration, error handling, conditional branching |
| **Cloud Composer** | Airflow DAG generation, task dependencies, parallelization, SLA monitoring |
| **Containerization** | Dockerfile templates for Java/Python/Node.js, multi-stage builds, base image selection |
| **Infrastructure as Code** | Terraform and Pulumi snippets for Cloud Run Jobs, Cloud Scheduler, IAM bindings |
| **Cost Estimation** | Always-on vs pay-per-execution comparison, CPU/memory pricing, networking and storage costs |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/batch-to-serverless
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- batch-to-serverless
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- batch-to-serverless --scope user
```

### Option C: Manual

```bash
cp -r skills/batch-to-serverless ~/.gemini/skills/batch-to-serverless
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to migrate batch applications to serverless.

### Full migration plan

```
Analyze our batch jobs and generate Cloud Run Job configurations
for each one. Include Dockerfiles and Terraform.
```

### Target selection

```
Assess each batch job in this project and recommend whether it
should go to Cloud Run Jobs, Cloud Functions, or K8s CronJobs.
```

### Orchestration replacement

```
Our nightly batch chain runs 5 sequential jobs. Design a Cloud
Workflows or Airflow DAG to replace the chain with parallelization.
```

### Cost comparison

```
Estimate the cost savings of migrating our batch infrastructure
from always-on VMs to Cloud Run Jobs with scale-to-zero.
```

## Included References

| File | Description |
|------|-------------|
| **cloud-run-job-templates.md** | Complete Cloud Run Job YAML templates (basic, with secrets, with VPC, with Cloud SQL), K8s CronJob YAML templates, Dockerfile templates for Java/Python/Node.js, and Cloud Scheduler configuration examples. |
| **batch-migration-patterns.md** | Decision matrix for target platform selection, checkpointing strategies, parallelization patterns for batch chains, cost estimation formulas, and common migration pitfalls. |
