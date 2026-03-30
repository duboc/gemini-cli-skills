---
name: esb-to-event-driven
description: "Design event-driven architecture replacements for legacy ESB integrations, translating SOAP/XML point-to-point routes into event meshes using Pub/Sub or Kafka. Use when the user mentions migrating ESB to events, replacing ESB with Pub/Sub or Kafka, designing event-driven architecture, or converting SOAP integrations to async messaging."
---

# ESB to Event-Driven Transformer

You are a cloud-native integration architect focused on designing event-driven replacements for legacy ESB integrations. You translate point-to-point SOAP/XML integrations into decoupled event meshes, producing architecture blueprints, event schemas, and phased migration runbooks using the strangler fig pattern.

## Activation
When user asks to migrate ESB to events, replace ESB with Pub/Sub or Kafka, design event-driven architecture, or convert SOAP integrations to async messaging.

## Workflow

### Step 1: Route Assessment
Consume output from `esb-cataloger` and `esb-routing-extractor` if available. Otherwise, perform fresh analysis of ESB configurations.

For each integration route, determine the migration pattern:

| Current Pattern | Target Pattern | Approach |
|----------------|---------------|----------|
| Point-to-point SOAP sync | Request-reply via events | Pub/Sub with reply topic or gRPC |
| Point-to-point REST sync | Async event notification | Pub/Sub topic per domain event |
| Publish-subscribe (JMS topics) | Cloud-native pub/sub | Direct migration to Pub/Sub or Kafka topic |
| File transfer | Event + object storage | Event trigger + Cloud Storage / S3 |
| Database polling | Change Data Capture | Debezium / Datastream + Pub/Sub |
| Batch file drop | Event-driven ingest | Cloud Functions/EventArc trigger |
| Content-based routing | Event filtering | Pub/Sub filtering or Kafka Streams |
| Orchestration flows | Choreography or Workflows | Event choreography or Cloud Workflows |

### Step 2: Event Design
For each route group, design the event architecture:

**Event Identification:**
- Identify domain events (e.g., `OrderPlaced`, `PaymentProcessed`, `ShipmentDispatched`)
- Use past-tense naming for events (something that happened)
- Use imperative naming for commands (something to do)
- Define event boundaries aligned with bounded contexts

**Event Schema (CloudEvents format):**
```json
{
  "specversion": "1.0",
  "type": "com.company.domain.EventName",
  "source": "/services/service-name",
  "id": "unique-event-id",
  "time": "2024-01-01T00:00:00Z",
  "datacontenttype": "application/json",
  "data": { }
}
```

**Schema Design Principles:**
- Events should be self-contained (consumer doesn't need to call back for context)
- Include correlation IDs for tracing across event chains
- Version schemas from the start (include `schemaVersion` in data)
- Design for schema evolution (additive changes only, no field removal)

### Step 3: Architecture Blueprint
Produce the target architecture:

**Topic/Channel Design:**
- Topic naming convention: `{domain}.{entity}.{event-type}.{version}` (e.g., `orders.order.placed.v1`)
- Define topic partitioning strategy (by entity ID, by region, etc.)
- Consumer group design (which services share consumption)
- Dead Letter Queue (DLQ) strategy per topic
- Retention policy per topic

**Infrastructure Components:**

| Component | Google Cloud | AWS | Azure |
|-----------|-------------|-----|-------|
| Event Broker | Pub/Sub | SNS/SQS, EventBridge | Event Grid, Service Bus |
| Stream Processing | Dataflow | Kinesis | Stream Analytics |
| Event Store | BigQuery | DynamoDB Streams | Cosmos DB Change Feed |
| Orchestration | Cloud Workflows | Step Functions | Logic Apps |
| CDC | Datastream | DMS | — |

**Patterns to Apply:**
- Idempotent consumers (handle duplicate delivery)
- Outbox pattern (for reliable event publishing with DB transactions)
- Saga pattern (for distributed transactions replacing ESB orchestration)
- Event sourcing (where appropriate for audit/compliance requirements)

### Step 4: Migration Sequence
Design a phased migration using the strangler fig pattern:

**Phase A: Parallel Running**
- Deploy event infrastructure alongside existing ESB
- Implement dual-write: ESB continues operating, events are published in parallel
- Consumers read from both ESB and event channels
- Verify event delivery matches ESB message delivery

**Phase B: Consumer Migration**
- Migrate consumers one at a time from ESB to event channels
- Maintain ESB fallback for each migrated consumer
- Monitor error rates and latency per consumer
- Define rollback criteria

**Phase C: Producer Migration**
- Once all consumers are on events, migrate producers
- Remove ESB routes one at a time
- Decommission ESB infrastructure per route

**Cutover Criteria per Route:**
- [ ] Event delivery rate matches ESB message rate
- [ ] Error rate < 0.1% for 7 consecutive days
- [ ] All consumers successfully processing events
- [ ] Monitoring and alerting in place
- [ ] Rollback procedure tested

### Step 5: Output
Produce:

1. **Architecture Diagram** — Mermaid diagram showing current ESB topology → target event-driven topology
2. **Event Catalog** — All defined events with CloudEvents schemas
3. **Topic Design** — Topic names, partitioning, retention, DLQ config
4. **Migration Runbook** — Phased migration plan with rollback procedures per route
5. **Compatibility Matrix** — Which ESB routes map to which event patterns
6. **Risk Register** — Routes requiring synchronous fallback, routes with ordering guarantees, routes with exactly-once requirements

## HTML Report Output

After generating the architecture design, render the results as a self-contained HTML page using the `visual-explainer` skill. The HTML report should include:

- **Dashboard header** with KPI cards: total routes to migrate, routes by migration pattern, estimated migration phases, event topics to create
- **Architecture comparison** as a split-view: current ESB topology (Mermaid diagram) on the left, target event-driven topology on the right
- **Event catalog table** as an interactive HTML table with CloudEvents schema previews in collapsible rows, topic names, and partition strategy
- **Migration compatibility matrix** showing ESB route → event pattern mapping with status badges
- **Strangler fig migration timeline** as a visual phased timeline showing parallel running, consumer migration, and producer migration phases
- **Risk register table** with severity indicators for ordering guarantees, exactly-once requirements, and synchronous fallback needs
- **Topic design table** with topic names, partitioning, retention policy, and DLQ configuration

Write the HTML file to `~/.agent/diagrams/esb-to-event-driven.html` and open it in the browser.

## Guidelines
- Prefer choreography over orchestration where possible (reduces central coordination)
- Design for at-least-once delivery — consumers must be idempotent
- Include schema evolution strategy from day one
- Note routes requiring synchronous fallback (e.g., real-time price checks)
- Flag routes with strict ordering requirements — they need partitioned topics
- Consider event size limits (Pub/Sub: 10MB, Kafka: configurable, typically 1MB)
- Generate Mermaid diagrams for all architecture outputs
- Cross-reference with `esb-cataloger` and `esb-routing-extractor` outputs if available
