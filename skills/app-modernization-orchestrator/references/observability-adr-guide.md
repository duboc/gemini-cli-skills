# Observability & Architecture Decision Records Guide

## OpenTelemetry Instrumentation Patterns for GCP

### Java with Spring Boot on Cloud Run

#### Dependencies (Maven)

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-sdk</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>com.google.cloud.opentelemetry</groupId>
    <artifactId>exporter-trace</artifactId>
</dependency>
<dependency>
    <groupId>com.google.cloud.opentelemetry</groupId>
    <artifactId>exporter-metrics</artifactId>
</dependency>
```

#### Configuration (application.yaml)

```yaml
spring:
  application:
    name: ${SERVICE_NAME:my-service}

otel:
  traces:
    exporter: google_cloud_trace
  metrics:
    exporter: google_cloud_monitoring
  resource:
    attributes:
      service.name: ${SERVICE_NAME:my-service}
      service.version: ${SERVICE_VERSION:1.0.0}
      deployment.environment: ${ENVIRONMENT:production}
      cloud.provider: gcp
      cloud.platform: gcp_cloud_run
```

#### Custom Span Example

```java
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;

@Service
public class OrderService {

    private final Tracer tracer;

    public OrderService(Tracer tracer) {
        this.tracer = tracer;
    }

    public Order processOrder(OrderRequest request) {
        Span span = tracer.spanBuilder("processOrder")
            .setAttribute("order.id", request.getId())
            .setAttribute("order.item_count", request.getItems().size())
            .startSpan();

        try (Scope scope = span.makeCurrent()) {
            Order order = validateOrder(request);
            order = calculatePricing(order);
            order = persistOrder(order);
            span.setAttribute("order.total", order.getTotal().doubleValue());
            return order;
        } catch (Exception e) {
            span.recordException(e);
            span.setStatus(StatusCode.ERROR, e.getMessage());
            throw e;
        } finally {
            span.end();
        }
    }
}
```

#### Structured Logging with Trace Correlation

```java
import com.google.cloud.logging.Severity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import io.opentelemetry.api.trace.Span;

@Component
public class CloudLoggingConfig {

    public static void enrichMDCWithTrace() {
        Span currentSpan = Span.current();
        if (currentSpan != null) {
            MDC.put("trace_id", currentSpan.getSpanContext().getTraceId());
            MDC.put("span_id", currentSpan.getSpanContext().getSpanId());
            MDC.put("trace_sampled",
                String.valueOf(currentSpan.getSpanContext().isSampled()));
        }
    }
}
```

### Python with FastAPI on Cloud Run

#### Dependencies (requirements.txt)

```
opentelemetry-api
opentelemetry-sdk
opentelemetry-instrumentation-fastapi
opentelemetry-exporter-gcp-trace
opentelemetry-exporter-gcp-monitoring
opentelemetry-instrumentation-sqlalchemy
opentelemetry-instrumentation-httpx
```

#### Initialization

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

def configure_telemetry(app):
    resource = Resource.create({
        "service.name": os.getenv("SERVICE_NAME", "my-service"),
        "service.version": os.getenv("SERVICE_VERSION", "1.0.0"),
        "deployment.environment": os.getenv("ENVIRONMENT", "production"),
        "cloud.provider": "gcp",
        "cloud.platform": "gcp_cloud_run",
    })

    provider = TracerProvider(resource=resource)
    processor = BatchSpanProcessor(CloudTraceSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)

    FastAPIInstrumentor.instrument_app(app)
```

#### Custom Span Example

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

async def process_order(request: OrderRequest) -> Order:
    with tracer.start_as_current_span(
        "process_order",
        attributes={
            "order.id": request.id,
            "order.item_count": len(request.items),
        }
    ) as span:
        try:
            order = await validate_order(request)
            order = await calculate_pricing(order)
            order = await persist_order(order)
            span.set_attribute("order.total", float(order.total))
            return order
        except Exception as e:
            span.record_exception(e)
            span.set_status(StatusCode.ERROR, str(e))
            raise
```

#### Structured Logging with Cloud Logging

```python
import json
import logging
from opentelemetry import trace

class CloudLoggingFormatter(logging.Formatter):
    def format(self, record):
        span = trace.get_current_span()
        span_context = span.get_span_context() if span else None

        log_entry = {
            "severity": record.levelname,
            "message": record.getMessage(),
            "component": record.name,
            "timestamp": self.formatTime(record),
        }

        if span_context and span_context.is_valid:
            log_entry["logging.googleapis.com/trace"] = (
                f"projects/{os.getenv('GCP_PROJECT_ID')}"
                f"/traces/{format(span_context.trace_id, '032x')}"
            )
            log_entry["logging.googleapis.com/spanId"] = (
                format(span_context.span_id, '016x')
            )
            log_entry["logging.googleapis.com/trace_sampled"] = (
                span_context.trace_flags.sampled
            )

        return json.dumps(log_entry)
```

---

## Cloud Trace Setup and Configuration

### Enable Cloud Trace API

```bash
gcloud services enable cloudtrace.googleapis.com --project=${PROJECT_ID}
```

### IAM Permissions

```bash
# For Cloud Run service account
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/cloudtrace.agent"
```

### Cloud Run Configuration

```yaml
# Cloud Run service YAML
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: my-service
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/execution-environment: gen2
    spec:
      containers:
        - image: gcr.io/${PROJECT_ID}/my-service:latest
          env:
            - name: GOOGLE_CLOUD_PROJECT
              value: ${PROJECT_ID}
            - name: SERVICE_NAME
              value: my-service
            - name: ENVIRONMENT
              value: production
```

### Trace Sampling Configuration

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased, ParentBased

# Sample 10% of traces in production, 100% in staging
sample_rate = 1.0 if os.getenv("ENVIRONMENT") == "staging" else 0.1

sampler = ParentBased(root=TraceIdRatioBased(sample_rate))
provider = TracerProvider(resource=resource, sampler=sampler)
```

---

## Cloud Monitoring SLO Configuration

### Terraform Configuration for SLO Monitoring

```hcl
# Cloud Run service SLO based on Cloud Monitoring
resource "google_monitoring_custom_service" "order_service" {
  project      = var.project_id
  service_id   = "order-service"
  display_name = "Order Service"
}

# Availability SLO: 99.9%
resource "google_monitoring_slo" "availability" {
  service      = google_monitoring_custom_service.order_service.id
  display_name = "Order Service Availability SLO"
  goal         = 0.999

  rolling_period_days = 28

  request_based_sli {
    good_total_ratio {
      good_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=\"order-service\"",
        "metric.type=\"run.googleapis.com/request_count\"",
        "metric.labels.response_code_class=\"2xx\"",
      ])
      total_service_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=\"order-service\"",
        "metric.type=\"run.googleapis.com/request_count\"",
      ])
    }
  }
}

# Latency SLO: P99 < 500ms
resource "google_monitoring_slo" "latency" {
  service      = google_monitoring_custom_service.order_service.id
  display_name = "Order Service Latency SLO"
  goal         = 0.99

  rolling_period_days = 28

  request_based_sli {
    distribution_cut {
      distribution_filter = join(" AND ", [
        "resource.type=\"cloud_run_revision\"",
        "resource.labels.service_name=\"order-service\"",
        "metric.type=\"run.googleapis.com/request_latencies\"",
      ])
      range {
        min = 0
        max = 500
      }
    }
  }
}

# Error budget burn rate alert
resource "google_monitoring_alert_policy" "error_budget_burn" {
  project      = var.project_id
  display_name = "Order Service Error Budget Fast Burn"

  conditions {
    display_name = "SLO burn rate > 10x"
    condition_threshold {
      filter          = "select_slo_burn_rate(\"${google_monitoring_slo.availability.id}\", \"60m\")"
      comparison      = "COMPARISON_GT"
      threshold_value = 10
      duration        = "0s"
    }
  }

  notification_channels = [var.pagerduty_channel_id]

  alert_strategy {
    auto_close = "604800s"
  }
}
```

---

## Cloud Logging Structured Logging Format

### Required JSON Fields for GCP Integration

```json
{
  "severity": "INFO | WARNING | ERROR | CRITICAL",
  "message": "Human-readable log message",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "logging.googleapis.com/trace": "projects/PROJECT_ID/traces/TRACE_ID",
  "logging.googleapis.com/spanId": "SPAN_ID",
  "logging.googleapis.com/trace_sampled": true,
  "logging.googleapis.com/labels": {
    "service": "order-service",
    "environment": "production",
    "version": "1.2.3"
  },
  "httpRequest": {
    "requestMethod": "POST",
    "requestUrl": "/api/v1/orders",
    "status": 201,
    "responseSize": "1234",
    "latency": "0.150s",
    "remoteIp": "203.0.113.1",
    "userAgent": "Mozilla/5.0"
  }
}
```

### Severity Mapping

| Application Level | Cloud Logging Severity | When to Use |
|-------------------|----------------------|-------------|
| DEBUG | DEBUG | Detailed diagnostic information |
| INFO | INFO | Normal operation events |
| WARN | WARNING | Unexpected but handled situations |
| ERROR | ERROR | Error events, operation failed |
| FATAL | CRITICAL | System is unusable, requires immediate attention |

---

## SLO/SLI Definition Templates for Microservices

### Template: API Service (Cloud Run)

```yaml
service_name: "order-service"
service_type: "API"
tier: "Tier 1 - Business Critical"

slis:
  availability:
    description: "Proportion of successful HTTP responses"
    good_event: "HTTP response with status < 500"
    valid_event: "All HTTP requests (excluding health checks)"
    measurement: "Cloud Monitoring request_count metric, filtered by response_code_class"

  latency:
    description: "Proportion of requests faster than threshold"
    good_event: "HTTP response with latency < 500ms (P99)"
    valid_event: "All HTTP requests (excluding health checks)"
    measurement: "Cloud Monitoring request_latencies metric, distribution cut"

  correctness:
    description: "Proportion of responses with correct data"
    good_event: "Order total matches expected calculation"
    valid_event: "All order creation requests"
    measurement: "Custom metric via OpenTelemetry"

slos:
  - sli: availability
    target: 99.9%
    window: 28 days rolling
    error_budget: 0.1% (approx 40 minutes/month)
    alert_burn_rate_1h: 14.4x
    alert_burn_rate_6h: 6x

  - sli: latency
    target: 99.0%
    window: 28 days rolling
    error_budget: 1.0%
    alert_burn_rate_1h: 14.4x
    alert_burn_rate_6h: 6x
```

### Template: Event Consumer (Pub/Sub + Cloud Run)

```yaml
service_name: "payment-processor"
service_type: "Event Consumer"
tier: "Tier 1 - Business Critical"

slis:
  processing_success:
    description: "Proportion of messages processed without error"
    good_event: "Message acknowledged successfully"
    valid_event: "All messages received from subscription"
    measurement: "Pub/Sub acknowledge_message_count vs nack count"

  processing_latency:
    description: "Time from message publish to processing completion"
    good_event: "Processing completed within 30 seconds"
    valid_event: "All messages processed"
    measurement: "Custom metric: processing_duration_seconds"

  freshness:
    description: "Age of oldest unacknowledged message"
    good_event: "Oldest unacked message < 5 minutes"
    valid_event: "Continuous (checked every minute)"
    measurement: "Pub/Sub oldest_unacked_message_age metric"

slos:
  - sli: processing_success
    target: 99.95%
    window: 28 days rolling

  - sli: processing_latency
    target: 99.0%
    window: 28 days rolling

  - sli: freshness
    target: 99.9%
    window: 28 days rolling
```

---

## Error Budget Calculation and Alerting

### Error Budget Formula

```
Error Budget = 1 - SLO Target
Budget in Minutes = Error Budget x Window in Minutes

Example (99.9% SLO over 28 days):
Error Budget = 1 - 0.999 = 0.001 (0.1%)
Budget in Minutes = 0.001 x 28 x 24 x 60 = 40.32 minutes
```

### Multi-Window, Multi-Burn-Rate Alerting

| Alert Severity | Burn Rate | Long Window | Short Window | Action |
|---------------|-----------|-------------|--------------|--------|
| Page (Critical) | 14.4x | 1 hour | 5 minutes | Immediate response, wake on-call |
| Page (High) | 6x | 6 hours | 30 minutes | Respond within 30 minutes |
| Ticket (Medium) | 3x | 1 day | 2 hours | Respond within business hours |
| Ticket (Low) | 1x | 3 days | 6 hours | Plan fix in next sprint |

### Error Budget Policy

```markdown
## Error Budget Policy for [Service Name]

### When error budget is healthy (> 50% remaining):
- Deploy at normal cadence
- Run experiments and migrations
- Focus on feature development

### When error budget is at risk (25-50% remaining):
- Reduce deployment frequency
- Prioritize reliability improvements
- Review recent changes for regressions

### When error budget is low (< 25% remaining):
- Freeze non-critical deployments
- All engineering effort on reliability
- Conduct incident review for recent budget consumption

### When error budget is exhausted (0% remaining):
- Full deployment freeze (except reliability fixes)
- Mandatory postmortem for contributing incidents
- Leadership review before resuming normal operations
```

---

## Architecture Decision Record (ADR) Template

```markdown
# ADR-NNN: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN
**Deciders:** [List of people involved in the decision]

## Context

[Describe the technical or business forces at play. What problem are we solving?
What constraints exist? What alternatives were considered?]

## Decision

[State the decision clearly. What did we decide to do?]

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Trade-off 1]
- [Trade-off 2]

### Risks
- [Risk 1 and mitigation]

## References
- [Link to relevant documentation]
```

---

## Example ADRs for GCP Modernization

### ADR-001: Pub/Sub vs Kafka on GKE for Event Messaging

**Date:** 2024-01-15
**Status:** Accepted

#### Context
The modernized architecture requires an event broker for asynchronous communication between microservices. The two primary options on GCP are:
- **Pub/Sub**: Fully managed, serverless, native GCP integration
- **Kafka on GKE**: Self-managed or Confluent-managed, more control, broader ecosystem

The team currently uses a legacy message queue (e.g., IBM MQ) and has limited Kafka experience. The target architecture has approximately 15 event topics with moderate throughput (1,000-10,000 messages/second).

#### Decision
Use **Google Cloud Pub/Sub** as the primary event broker.

#### Consequences

**Positive:**
- Zero operational overhead (fully managed, auto-scaling)
- Native integration with Cloud Run via Eventarc (push subscriptions)
- Built-in dead-letter topics, retry policies, and exactly-once delivery
- Pay-per-message pricing aligns with variable workloads
- IAM-based access control, no separate auth system

**Negative:**
- Maximum message size of 10 MB (sufficient for events, not large payloads)
- No log compaction (unlike Kafka) — not suitable for event sourcing with replay
- Limited ordering guarantees (ordering keys provide partial ordering only)
- Vendor lock-in to GCP (mitigated by using OpenTelemetry and cloud-agnostic abstractions)

**Risks:**
- If message ordering becomes critical, may need to add ordering keys or reconsider Kafka for specific topics
- Mitigation: Design events to be idempotent, use ordering keys for streams requiring sequence

---

### ADR-002: Cloud SQL vs AlloyDB vs Spanner for Microservice Databases

**Date:** 2024-01-16
**Status:** Accepted

#### Context
The modernized architecture uses database-per-service. We need to select the appropriate database service for different microservice categories:
- **Cloud SQL**: Managed PostgreSQL/MySQL, familiar, cost-effective
- **AlloyDB**: PostgreSQL-compatible, higher performance, analytical capabilities
- **Spanner**: Globally distributed, strongly consistent, unlimited scale

Current state is a single Oracle database shared across all services. Migration involves decomposing into per-service databases.

#### Decision
Use a tiered database strategy:
- **Cloud SQL PostgreSQL** for most microservices (default choice)
- **AlloyDB** for services requiring high-performance analytics or mixed OLTP/OLAP workloads
- **Spanner** reserved for services requiring global distribution or extreme scale (evaluated case-by-case)

#### Consequences

**Positive:**
- Cloud SQL minimizes migration complexity (PostgreSQL is well-known, strong tooling)
- Cost-effective for most workloads (right-sized instances per service)
- AlloyDB provides a performance upgrade path without schema changes
- Spanner available for future global expansion without re-architecture

**Negative:**
- Multiple database technologies increase operational complexity
- Cross-service queries are no longer possible (requires API-based data access)
- Need to implement data synchronization patterns (events via Pub/Sub)

**Risks:**
- Data consistency across services requires careful saga pattern implementation
- Mitigation: Use Pub/Sub for event-driven data synchronization, implement compensating transactions

---

### ADR-003: Cloud Run vs GKE Autopilot for Container Platform

**Date:** 2024-01-17
**Status:** Accepted

#### Context
The modernized microservices need a container runtime platform. Options on GCP:
- **Cloud Run**: Fully managed, serverless containers, scale to zero
- **GKE Autopilot**: Managed Kubernetes, Google manages nodes, pay-per-pod
- **GKE Standard**: Full Kubernetes control, self-managed nodes

The team has limited Kubernetes experience (assessment score: 2/5). Target architecture has 15-20 microservices with variable traffic patterns.

#### Decision
Use **Cloud Run** as the default platform for all request-driven microservices. Use **GKE Autopilot** only for workloads requiring Kubernetes-specific features (stateful sets, custom operators, GPU workloads).

#### Consequences

**Positive:**
- Cloud Run eliminates Kubernetes operational complexity
- Scale-to-zero reduces cost for low-traffic services
- Simpler CI/CD pipeline (Cloud Build → Artifact Registry → Cloud Deploy → Cloud Run)
- Built-in HTTPS, custom domains, traffic splitting for canary deployments
- Matches team capability (lower barrier to entry than GKE)

**Negative:**
- Maximum request timeout of 60 minutes (not suitable for long-running jobs — use Cloud Run Jobs)
- No persistent local storage (stateless only)
- Limited networking control compared to GKE (no service mesh without GKE)
- Cold start latency for infrequently accessed services (mitigated by minimum instances)

**Risks:**
- Some workloads may need GKE later (e.g., ML inference with GPUs)
- Mitigation: Containerized architecture is portable; migration to GKE Autopilot is straightforward

---

### ADR-004: Apigee vs Cloud Endpoints for API Gateway

**Date:** 2024-01-18
**Status:** Accepted

#### Context
The modernized architecture exposes APIs to external consumers and internal services. An API gateway is needed for:
- Rate limiting, authentication, and authorization
- API versioning and lifecycle management
- Analytics and monitoring
- Developer portal for external consumers

Options:
- **Apigee**: Full API management platform, developer portal, monetization
- **Cloud Endpoints**: Lightweight API gateway, OpenAPI-based, lower cost

The application serves 50+ external API consumers and requires a developer portal.

#### Decision
Use **Apigee** for external-facing APIs. Use direct Cloud Run service-to-service authentication (IAM-based) for internal APIs.

#### Consequences

**Positive:**
- Full API lifecycle management (design, publish, version, deprecate)
- Built-in developer portal for external consumers
- Advanced rate limiting, quota management, and spike arrest
- API analytics and monetization capabilities
- OAuth 2.0 / API key management out of the box

**Negative:**
- Higher cost than Cloud Endpoints (enterprise pricing)
- Additional operational complexity (Apigee environments, proxies, products)
- Learning curve for Apigee-specific configuration

**Risks:**
- Apigee proxy logic can become a maintenance burden if overused
- Mitigation: Keep Apigee proxies thin (routing, auth, rate limiting only), business logic stays in Cloud Run services

---

### ADR-005: Cloud Composer vs Cloud Workflows for Orchestration

**Date:** 2024-01-19
**Status:** Accepted

#### Context
The modernized batch processing architecture needs workflow orchestration for:
- Multi-step batch job sequences (ETL pipelines)
- Event-driven workflow triggers
- Error handling, retries, and compensation

Options:
- **Cloud Composer**: Managed Apache Airflow, rich DAG authoring, extensive operator library
- **Cloud Workflows**: Serverless, YAML/JSON-based, native GCP integration, pay-per-execution

Current state uses cron + shell scripts or legacy job schedulers (Control-M, Autosys).

#### Decision
Use a dual approach:
- **Cloud Workflows** for simple orchestration (< 10 steps, request-driven, event-triggered)
- **Cloud Composer** for complex data pipelines (multi-step ETL, data dependencies, backfill)

#### Consequences

**Positive:**
- Cloud Workflows eliminates infrastructure for simple orchestration (serverless, pay-per-execution)
- Cloud Composer provides full Airflow capability for complex pipelines
- Both integrate natively with Cloud Run, Pub/Sub, Cloud SQL, and BigQuery
- Clear decision boundary: complexity determines the tool

**Negative:**
- Two orchestration tools increases cognitive load
- Cloud Composer has a minimum cost (~$300/month for smallest environment)
- Teams need to learn both tools

**Risks:**
- Workflows may outgrow Cloud Workflows' capabilities over time
- Mitigation: Design workflows as independent steps callable from either orchestrator; migration between tools is straightforward when steps are Cloud Run services
