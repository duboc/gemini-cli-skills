# ESB to Event-Driven Transformer

A Gemini CLI skill for designing event-driven architecture replacements for legacy ESB integrations. Translates SOAP/XML point-to-point routes into decoupled event meshes using Pub/Sub or Kafka, producing architecture blueprints, event schemas, and phased migration runbooks.

## What It Does

This skill takes ESB integration catalogs (from `esb-cataloger` or `esb-routing-extractor`) and designs a complete event-driven replacement:

1. **Route assessment** — Maps each ESB integration pattern to a target event-driven pattern (sync to async, polling to CDC, file drops to event triggers).
2. **Event design** — Identifies domain events, defines CloudEvents schemas, and establishes naming conventions and versioning strategy.
3. **Architecture blueprint** — Produces topic design, infrastructure component selection (Pub/Sub, Kafka, EventBridge), and pattern recommendations (outbox, saga, idempotency).
4. **Migration runbook** — Generates a phased strangler fig migration plan with parallel running, consumer migration, producer cutover, and rollback procedures.
5. **Risk register** — Flags routes requiring synchronous fallback, strict ordering, or exactly-once delivery guarantees.

## When Does It Activate?

The skill activates when you ask Gemini to design event-driven replacements for ESB integrations. It works standalone or in combination with the ESB cataloger and routing extractor skills.

| Trigger | Example |
|---------|---------|
| Migrate ESB to events | "Migrate our ESB integrations to an event-driven architecture" |
| Replace ESB with Pub/Sub | "Replace our MuleSoft ESB with Google Cloud Pub/Sub" |
| Replace ESB with Kafka | "Design a Kafka-based replacement for our TIBCO ESB routes" |
| Design event-driven architecture | "Design an event-driven architecture for our order processing integrations" |
| Convert SOAP to async | "Convert these SOAP integrations to async messaging" |
| Event mesh design | "Create an event mesh to replace our point-to-point ESB topology" |

## Topics Covered

| Area | Details |
|------|---------|
| **Pattern Mapping** | Point-to-point sync, pub/sub, file transfer, database polling, batch, content-based routing, orchestration flows |
| **Event Design** | CloudEvents schema, domain event identification, naming conventions, schema versioning and evolution |
| **Topic Architecture** | Naming conventions, partitioning strategy, consumer groups, DLQ design, retention policies |
| **Cloud Platforms** | Google Cloud (Pub/Sub, Dataflow, Datastream), AWS (SNS/SQS, EventBridge, Kinesis), Azure (Event Grid, Service Bus) |
| **Integration Patterns** | Idempotent consumers, outbox pattern, saga pattern, event sourcing, CQRS, CDC |
| **Migration Strategy** | Strangler fig pattern, dual-write, phased consumer/producer migration, rollback procedures |
| **Risk Assessment** | Synchronous fallback requirements, ordering guarantees, exactly-once delivery, event size limits |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/esb-to-event-driven
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-to-event-driven
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-to-event-driven --scope user
```

### Option C: Manual

```bash
cp -r skills/esb-to-event-driven ~/.gemini/skills/esb-to-event-driven
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to design event-driven replacements for ESB integrations.

### Full migration design

```
We have 45 MuleSoft ESB integrations. Design an event-driven
architecture replacement using Google Cloud Pub/Sub. Include
the migration runbook.
```

### From cataloger output

```
Using the ESB catalog from the previous analysis, design event
schemas and topic architecture for migrating to Kafka.
```

### Specific route migration

```
Design an event-driven replacement for our order processing
SOAP integrations. They currently use point-to-point sync
calls between 5 systems.
```

### Risk assessment

```
Which of our ESB integrations require synchronous fallback
and can't be fully migrated to async events?
```

## Included References

| File | Description |
|------|-------------|
| **event-design-patterns.md** | CloudEvents schema templates, topic naming conventions, and common event-driven patterns including event notification, event-carried state transfer, event sourcing, CQRS, idempotency, outbox, and saga implementations |
| **esb-migration-playbook.md** | Strangler fig pattern steps, dual-write approaches, consumer migration checklist, monitoring requirements, rollback procedures, and common pitfalls to avoid during ESB-to-event migration |
