# Industry Standards and Tools for GCP App Modernization

Industry standards, frameworks, and tools relevant to enterprise application modernization on Google Cloud Platform.

## Standards

### AsyncAPI 3.0

Standard for defining asynchronous APIs. Use AsyncAPI to document:

- **Pub/Sub topics**: Define message schemas, topic names, and subscription semantics
- **Dataflow pipelines**: Document input/output PCollections and windowing strategies
- **Event-driven integrations**: Describe event contracts between microservices on Cloud Run or GKE

AsyncAPI specifications serve as machine-readable contracts that can be validated in CI/CD (Cloud Build) and published to API documentation portals alongside synchronous API specs (OpenAPI).

### CycloneDX vs SPDX

Two competing SBOM (Software Bill of Materials) formats for tracking dependencies during modernization:

| Feature | CycloneDX 1.5 | SPDX 2.3 |
|---------|---------------|----------|
| Focus | Security, vulnerability tracking | License compliance |
| Backed by | OWASP | Linux Foundation |
| Dependency graph | Full transitive dependency tree | Flat package list (improved in 2.3) |
| VEX support | Native (Vulnerability Exploitability eXchange) | Via external documents |
| Use when | Security-first assessment, vulnerability management | License compliance audit, open-source governance |
| GCP integration | Artifact Registry stores SBOM metadata; On-Demand Scanning produces CycloneDX-compatible output | Artifact Registry can store SPDX documents as OCI artifacts |

**Recommendation**: Use CycloneDX for modernization assessments where vulnerability identification is the primary concern. Use SPDX when the legal or procurement team requires license compliance reports.

### SLSA Framework

**Supply-chain Levels for Software Artifacts** (SLSA, pronounced "salsa") is a Google-originated framework for software supply chain integrity.

| SLSA Level | Requirements | GCP Implementation |
|------------|-------------|-------------------|
| Level 1 | Build process is documented | Cloud Build configuration in source control |
| Level 2 | Hosted build service, authenticated provenance | Cloud Build with signed provenance metadata |
| Level 3 | Hardened build platform, non-falsifiable provenance | Cloud Build with SLSA Level 3 provenance attestation |

GCP integration:
- **Cloud Build** automatically generates SLSA Level 3 provenance for container images
- **Binary Authorization** enforces deployment policies based on SLSA attestations
- **Artifact Registry** stores container images with associated provenance and attestation metadata
- Enforce that only images with valid SLSA provenance can deploy to GKE or Cloud Run

### OpenTelemetry

Vendor-neutral observability framework for collecting traces, metrics, and logs. On GCP:

- **Cloud Trace**: Receives distributed traces from OpenTelemetry-instrumented applications. Use for latency analysis and dependency mapping during modernization.
- **Cloud Monitoring**: Receives metrics via OpenTelemetry exporters. Create custom dashboards for migration health indicators.
- **Cloud Logging**: Receives structured logs from OpenTelemetry log exporters. Correlate logs with traces using trace context propagation.
- **OpenTelemetry Collector**: Deploy as a sidecar on GKE or as a standalone service on Cloud Run. Configure exporters for Cloud Trace, Cloud Monitoring, and Cloud Logging.

Deployment patterns:
- **GKE**: Deploy the Collector as a DaemonSet (node-level) or sidecar (pod-level)
- **Cloud Run**: Use the OpenTelemetry SDK directly with GCP exporters (no Collector needed)
- **Compute Engine**: Run the Collector as a systemd service

### SARIF

**Static Analysis Results Interchange Format** — a standard JSON format for static analysis tool output.

- Integrate SARIF output from SonarQube, SpotBugs, and custom analyzers into Cloud Build pipelines
- Store SARIF reports in Cloud Storage for historical analysis
- Use SARIF viewers in VS Code or IntelliJ during code review
- Parse SARIF in Cloud Build steps to gate deployments based on severity thresholds

## Assessment Frameworks

### Gartner TIME Model

Portfolio-level assessment framework for categorizing applications during modernization planning:

| Category | Action | Criteria | GCP Approach |
|----------|--------|----------|-------------|
| Tolerate | Accept as-is, minimal investment | Low business value, stable, low risk | Leave on-premises or lift-and-shift to Compute Engine with minimal changes |
| Invest | Enhance and optimize | High business value, good architecture | Refactor to Cloud Run/GKE, adopt managed services |
| Migrate | Move to GCP with improved architecture | Medium-high business value, outdated platform | Replatform to Cloud SQL/GKE, modernize integration layer |
| Eliminate | Decommission | No business value, redundant functionality | Archive data to Cloud Storage, decommission infrastructure |

Apply the TIME model during the portfolio assessment phase to prioritize which applications to modernize first and which strategy to use.

### 6R Migration Framework (Google Cloud Variant)

Google Cloud's adaptation of the migration strategy framework:

| Strategy | Description | GCP Approach | When to Use |
|----------|-------------|-------------|-------------|
| Rehost | Lift-and-shift with no code changes | Compute Engine, Migrate to VMs | Urgent datacenter exit, low-value apps, minimal budget |
| Replatform | Minor optimization during migration | Cloud SQL (managed DB), GKE (containers), Memorystore | Reduce operational overhead without full refactor |
| Refactor | Cloud-native rearchitecture | Cloud Run, Pub/Sub, Firestore, microservices on GKE | High-value apps, need for scalability and agility |
| Repurchase | Replace with SaaS/managed service | Google Workspace, Apigee, Chronicle, Looker | Custom-built apps that duplicate commercial product functionality |
| Retire | Decommission | Remove after dead code analysis, archive data to GCS | No active users, redundant with other systems |
| Retain | Keep on-premises or in current state | Anthos for hybrid management, Cloud Interconnect | Regulatory constraints, recent capital investment, pending vendor contract |

**Decision criteria for choosing a strategy**:
- Business criticality and strategic value
- Technical debt level and code quality
- Compliance and data residency requirements
- Team skills and capacity
- Timeline and budget constraints

## Tool Catalog

### Database Migration

| Tool | Source | Target | Use When |
|------|--------|--------|----------|
| Google Database Migration Service (DMS) | MySQL, PostgreSQL, SQL Server, Oracle | Cloud SQL, AlloyDB | Managed, minimal-downtime migration with continuous replication |
| ora2pg | Oracle | PostgreSQL (Cloud SQL, AlloyDB) | Open-source Oracle-to-PostgreSQL schema and data conversion |
| Datastream | Oracle, MySQL, PostgreSQL | BigQuery, Cloud Storage | Change Data Capture (CDC) for real-time replication and analytics |
| pgloader | MySQL, SQLite, MS SQL | PostgreSQL (Cloud SQL, AlloyDB) | Open-source bulk data loading and schema conversion |

**Google Database Migration Service (DMS)** provides:
- Continuous replication from source to Cloud SQL or AlloyDB
- Schema conversion workspace for Oracle-to-PostgreSQL migrations
- Minimal-downtime cutover with automated promotion
- Connectivity via VPC peering, VPN, or Cloud Interconnect

**Datastream** provides:
- Real-time CDC from Oracle, MySQL, and PostgreSQL
- Output to BigQuery (for analytics) or Cloud Storage (for further processing)
- Backfill capability for initial data load
- Integration with Dataflow for stream processing and transformation

### Static Analysis and Vulnerability Scanning

| Tool | Function | GCP Integration |
|------|----------|----------------|
| SonarQube | Code quality, dead code detection, security vulnerabilities | Run in Cloud Build, publish results to SonarQube server on GKE |
| Artifact Registry vulnerability scanning | Container image CVE scanning | Native GCP service, automatic scanning on push |
| On-Demand Scanning | Pre-deployment container vulnerability scanning | Scan images before pushing to Artifact Registry |
| Binary Authorization | Deployment policy enforcement | Enforce that only attested images deploy to GKE/Cloud Run |
| OWASP Dependency-Check | Known vulnerability detection in dependencies | Run as a Cloud Build step, output SARIF or HTML reports |
| Trivy | Container and filesystem vulnerability scanner | Run as a Cloud Build step, scan images and IaC files |
| Grype | Vulnerability scanner for containers and SBOMs | Run as a Cloud Build step, input CycloneDX or SPDX SBOMs |
| SpotBugs | Java bytecode analysis for bugs and dead code | Run as a Maven/Gradle build step in Cloud Build |
| UCDetector | Java dead code detection (Eclipse plugin) | Use during assessment phase for dead code inventory |

### Architecture and Assessment

| Tool | Function | GCP Integration |
|------|----------|----------------|
| ArchUnit | Java architecture test framework | Write architecture rules as unit tests, run in Cloud Build |
| CAST Highlight | Portfolio analysis for cloud readiness | SaaS tool, import results into migration planning |
| Google Migration Center | Application discovery and assessment | Native GCP service for discovering on-premises workloads and assessing GCP fit |
| Fitness Functions | Custom architecture fitness tests | Implement as Cloud Build steps or Cloud Monitoring custom metrics |

**Google Migration Center** provides:
- Automated discovery of on-premises VMs, databases, and applications
- TCO (Total Cost of Ownership) analysis comparing on-premises vs GCP
- Right-sizing recommendations for Compute Engine and GKE
- Integration with the 6R framework for migration strategy recommendations

### Contract Testing

| Tool | Function | Use When |
|------|----------|----------|
| Pact | Consumer-driven contract testing | Microservices on Cloud Run or GKE need to verify API compatibility without integration tests |
| Spring Cloud Contract | Producer-side contract verification | Spring Boot services migrating to GKE or Cloud Run need producer-verified contracts |

Run contract tests in Cloud Build as part of the CI pipeline. Store Pact contracts in a Pact Broker deployed on GKE or Cloud Run.

### Event and Data Tools

| Tool | Function | GCP Integration |
|------|----------|----------------|
| Debezium | Open-source CDC for database event streaming | Deploy on GKE, output change events to Pub/Sub |
| Pub/Sub schemas | Native schema validation for Pub/Sub topics | Define schemas in Avro or Protocol Buffers, enforce on publish |
| Datastream | Managed CDC service | Stream changes from Oracle/MySQL/PostgreSQL to BigQuery or GCS |
| Apache Beam | Unified batch and stream processing SDK | Run on Dataflow (managed) or Spark/Flink on Dataproc |

**Debezium on GKE**:
- Deploy as a Kafka Connect cluster on GKE with Debezium connectors
- Capture row-level changes from Oracle, MySQL, PostgreSQL, SQL Server
- Route change events to Pub/Sub via a Kafka-to-Pub/Sub connector or custom sink
- Use for migrating from legacy database triggers or polling-based integration patterns

**Pub/Sub Schemas**:
- Define topic schemas using Avro or Protocol Buffers
- Enforce schema validation on publish (reject non-conforming messages)
- Support schema evolution with compatibility checks (backward, forward, full)
- Store schemas in the Pub/Sub Schema Registry (no external registry needed)

## GCP Service Reference for Modernization

Mapping of common enterprise application functions to recommended GCP services.

| Function | GCP Service | Notes |
|----------|------------|-------|
| Message Broker | Pub/Sub | Serverless, global, at-least-once delivery. Use for decoupling microservices and event-driven architectures. |
| Serverless Containers | Cloud Run | Deploy containers without managing infrastructure. Auto-scales to zero. HTTP and gRPC. |
| Serverless Functions | Cloud Functions (2nd gen) | Event-driven compute for lightweight integrations. Built on Cloud Run infrastructure. |
| Container Orchestration | GKE (Autopilot or Standard) | Autopilot for hands-off node management. Standard for full control over node pools. |
| Stream Processing | Dataflow (Apache Beam) | Managed Apache Beam runner for both batch and streaming data pipelines. |
| Workflow Orchestration | Cloud Workflows | Serverless orchestration for HTTP-based service calls. Use for API-driven workflows. |
| DAG Orchestration | Cloud Composer (Apache Airflow) | Managed Airflow for complex DAG-based data and ML pipelines. |
| CDC / Replication | Datastream | Managed CDC from Oracle, MySQL, PostgreSQL. Serverless, auto-scaling. |
| Data Warehouse | BigQuery | Serverless analytics data warehouse. Column-oriented, petabyte-scale. |
| Object Storage | Cloud Storage | Durable object storage with multiple storage classes (Standard, Nearline, Coldline, Archive). |
| Secret Management | Secret Manager | Store API keys, passwords, certificates. Integrates with Cloud Run, GKE, Cloud Functions. |
| Job Scheduling | Cloud Scheduler | Managed cron job service. Triggers Pub/Sub, HTTP endpoints, or Cloud Functions. |
| Key Management | Cloud KMS | Manage encryption keys with automatic rotation. Supports HSM-backed keys (Cloud HSM). |
| API Gateway | Apigee | Full-lifecycle API management with analytics, monetization, and developer portal. |
| API Gateway (lightweight) | API Gateway | Serverless API gateway for Cloud Functions, Cloud Run, and backend services. |
| Observability | Cloud Monitoring, Cloud Logging, Cloud Trace | Integrated observability suite. Use with OpenTelemetry for vendor-neutral instrumentation. |
| Migration Assessment | Migration Center | Discover, assess, and plan migrations from on-premises to GCP. |
| Hybrid Management | Anthos | Run GKE clusters on-premises or on other clouds. Unified management plane. |
| Managed Relational DB | Cloud SQL | Managed MySQL, PostgreSQL, SQL Server. Automated backups, HA, read replicas. |
| Managed PostgreSQL | AlloyDB | High-performance PostgreSQL-compatible database for demanding transactional workloads. |
| Globally Distributed DB | Spanner | Horizontally scalable, strongly consistent, relational database. |
| Document Database | Firestore | Serverless NoSQL document database with real-time sync and offline support. |
| In-Memory Cache | Memorystore | Managed Redis and Memcached. Use for session caching and low-latency data access. |
| Batch Processing | Dataproc | Managed Spark and Hadoop. Use for legacy MapReduce job migration. |
| CI/CD | Cloud Build + Cloud Deploy | Cloud Build for CI (build, test, scan). Cloud Deploy for CD (promotion-based delivery). |
| Infrastructure as Code | Terraform (GCP provider) | Declarative infrastructure management. Google-maintained Terraform provider. |
| Service Mesh | Istio on GKE / Cloud Service Mesh | mTLS, traffic management, and observability for microservices on GKE. |
