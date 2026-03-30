# ESB Migration Playbook

## Strangler Fig Pattern — Detailed Steps

The strangler fig pattern incrementally replaces ESB integrations with event-driven equivalents. Each ESB route is migrated independently, allowing the old and new systems to coexist during the transition.

### Overview

```
Phase 1: Intercept          Phase 2: Replace           Phase 3: Remove
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  ESB (active)   │        │  ESB (passive)   │        │                 │
│  Events (shadow)│        │  Events (active) │        │  Events (active)│
│  Compare output │        │  ESB as fallback │        │  ESB removed    │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

### Step-by-Step Process

**Step 1: Identify the migration candidate**
- Select a single ESB route to migrate
- Prefer routes that are: low risk, high volume (validates the new path), stateless, and have clear request/response boundaries
- Avoid starting with routes that have: strict ordering requirements, exactly-once semantics, complex orchestration, or regulatory constraints

**Step 2: Build the event-driven replacement**
- Design the event schema (CloudEvents format)
- Create the topic/subscription infrastructure
- Implement the producer (event publisher)
- Implement the consumer (event handler)
- Deploy idempotency handling in the consumer
- Set up DLQ and retry policies

**Step 3: Deploy in shadow mode**
- Route traffic through both ESB and event path simultaneously
- ESB remains the system of record
- Event path processes in parallel but results are not used
- Compare outputs between ESB and event path
- Log discrepancies for analysis

**Step 4: Validate shadow mode**
- Run shadow mode for a minimum of 2 weeks (or enough to cover all business cycles)
- Confirm event delivery rate matches ESB message rate
- Confirm event processing results match ESB processing results
- Confirm latency is within acceptable bounds
- Confirm error rate is below threshold (< 0.1%)

**Step 5: Switch to event-driven primary**
- Make the event path the primary processing route
- Keep ESB as fallback (traffic still flows through ESB but is not processed)
- Monitor closely for 7 days
- Be ready to revert within minutes

**Step 6: Decommission ESB route**
- After 7 days of stable operation on the event path
- Remove the ESB route configuration
- Archive ESB route artifacts for reference
- Update integration documentation

## Dual-Write Implementation Approaches

Dual-write publishes data to both the ESB and the event broker during the migration transition. This is necessary for shadow mode and parallel running.

### Approach 1: Application-Level Dual-Write

The application publishes to both ESB and event broker in its business logic.

```
Application
    |
    |---> ESB endpoint (existing path)
    |---> Event broker (new path)
```

**Pros:** Simple to implement, no infrastructure changes.
**Cons:** Risk of inconsistency if one write succeeds and the other fails. Not atomic.

**Mitigation:** Accept that the event path may occasionally miss messages during shadow mode. Use reconciliation to detect gaps.

### Approach 2: ESB Tap / Interceptor

Add an interceptor at the ESB level that copies messages to the event broker.

```
Producer ---> ESB ---> Consumer (existing)
                |
                +---> Event Broker (new, shadow)
```

**Pros:** No application code changes, captures all ESB traffic.
**Cons:** Requires ESB configuration changes, adds latency to ESB path.

**Platform-specific implementations:**
- **MuleSoft:** Use a flow reference or VM queue to fork messages
- **TIBCO:** Add a JMS bridge or use process monitoring
- **Apache Camel:** Use the wire tap EIP
- **IBM IIB/ACE:** Use a monitoring node to copy messages

### Approach 3: CDC from Database

If the ESB writes to a database, use Change Data Capture to publish events from the database transaction log.

```
Producer ---> ESB ---> Database ---> CDC (Debezium/Datastream) ---> Event Broker
```

**Pros:** Fully decoupled from ESB, no ESB changes needed, transactionally consistent.
**Cons:** Only works if ESB persists to a database, introduces CDC infrastructure.

### Approach 4: Outbox Table

The application writes to both the business table and an outbox table in the same transaction. A separate process publishes outbox entries to the event broker.

```
Application ---> Database (business table + outbox table)
                                    |
                              Outbox Publisher ---> Event Broker
```

**Pros:** Transactionally consistent, reliable, works with any broker.
**Cons:** Requires application code changes and a separate publisher process.

## Consumer Migration Checklist

Use this checklist for each consumer being migrated from ESB to event-driven.

### Pre-Migration

- [ ] Identify all data fields the consumer reads from the ESB message
- [ ] Map ESB message fields to CloudEvents schema fields
- [ ] Identify any ESB-specific features the consumer relies on (content-based routing, message transformation, protocol conversion)
- [ ] Confirm the consumer can handle at-least-once delivery (idempotency)
- [ ] Determine ordering requirements (does this consumer need ordered processing?)
- [ ] Identify the consumer's error handling behavior (retry, DLQ, alert)
- [ ] Document the consumer's SLA (latency, throughput, availability)
- [ ] Set up monitoring dashboards for the new event-driven consumer

### Implementation

- [ ] Implement event subscription (Pub/Sub subscription or Kafka consumer group)
- [ ] Implement message deserialization (CloudEvents JSON parsing)
- [ ] Implement idempotency check (deduplication by event ID)
- [ ] Implement business logic (same as existing ESB consumer)
- [ ] Implement error handling (retry with backoff, DLQ after max retries)
- [ ] Implement health check endpoint
- [ ] Write unit tests for event handling
- [ ] Write integration tests against a test topic

### Validation

- [ ] Deploy consumer in shadow mode (reads events but does not write results)
- [ ] Compare shadow consumer output with ESB consumer output for 100+ messages
- [ ] Confirm no data loss or transformation errors
- [ ] Confirm latency meets SLA
- [ ] Confirm error rate < 0.1%
- [ ] Load test the event consumer at 2x expected peak throughput

### Cutover

- [ ] Switch consumer from ESB to event-driven (disable ESB subscription, enable event subscription)
- [ ] Monitor error rate for 4 hours after cutover
- [ ] Monitor processing latency for 4 hours after cutover
- [ ] Confirm all messages are being processed (compare counts with producer)
- [ ] Keep ESB subscription configuration available for 7 days (for rollback)

### Post-Migration

- [ ] After 7 days of stable operation, remove ESB subscription configuration
- [ ] Update integration documentation
- [ ] Archive ESB consumer code
- [ ] Update monitoring dashboards to remove ESB metrics

## Monitoring Requirements During Migration

### Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|----------------|
| Event publish rate | Producer | Drops below baseline by > 10% |
| Event delivery latency | Broker | p99 exceeds 5 seconds |
| Consumer processing rate | Consumer | Falls behind publish rate |
| Consumer error rate | Consumer | Exceeds 0.1% |
| DLQ message count | Broker | Any messages in DLQ |
| Consumer lag | Broker | Lag exceeds 1000 messages |
| ESB vs event output match rate | Comparison service | Falls below 99.9% |
| End-to-end latency | Tracing | Exceeds ESB baseline by > 20% |

### Dashboard Requirements

1. **Real-time comparison dashboard** — Side-by-side view of ESB message rate vs event rate, with discrepancy highlighting
2. **Consumer health dashboard** — Per-consumer processing rate, error rate, and lag
3. **DLQ dashboard** — DLQ message count per topic, oldest message age, reprocessing status
4. **Migration progress dashboard** — Number of routes migrated vs remaining, current phase per route

### Alerting Rules

- **Critical (page):** Consumer error rate > 1% for 5 minutes, DLQ growing continuously for 15 minutes, event delivery completely stopped
- **Warning (ticket):** Consumer error rate > 0.1% for 15 minutes, consumer lag > 1000 for 10 minutes, ESB vs event mismatch > 0.1%
- **Info (log):** New consumer deployed, migration phase change, route decommissioned

### Distributed Tracing

Implement correlation IDs across the entire event chain:

```
correlationId: "sess-abc-123"

OrderService (publish OrderPlaced)
  → PaymentService (consume OrderPlaced, publish PaymentProcessed)
    → InventoryService (consume PaymentProcessed, publish StockReserved)
      → ShippingService (consume StockReserved, publish ShipmentCreated)
```

All events in the chain carry the same `correlationId`, enabling end-to-end trace reconstruction.

## Rollback Procedures

### Route-Level Rollback

If a migrated route experiences issues, roll back that specific route without affecting others.

**Rollback steps:**
1. Re-enable the ESB route configuration
2. Redirect traffic from event path back to ESB path
3. Disable the event consumer (but keep the subscription — messages will accumulate)
4. Verify ESB route is processing correctly
5. Investigate the issue with the event path
6. Drain accumulated messages from the event subscription after the fix

**Rollback time target:** Under 5 minutes for any single route.

### Full Rollback

If systemic issues affect multiple migrated routes:

1. Re-enable all ESB routes
2. Disable all event consumers
3. Verify ESB is processing all routes correctly
4. Perform root cause analysis on the event infrastructure
5. Re-plan migration with fixes

### Rollback Testing

Before each migration phase, test the rollback procedure:

1. Migrate a test route to events
2. Simulate a failure (kill event consumer, break event schema, introduce DLQ overflow)
3. Execute rollback procedure
4. Measure rollback time
5. Verify no messages were lost during the rollback
6. Document any issues encountered

## Common Pitfalls and How to Avoid Them

### Pitfall 1: Big Bang Migration

**Problem:** Attempting to migrate all ESB routes simultaneously.
**Consequence:** If anything goes wrong, everything is affected. Rollback is complex.
**Solution:** Migrate one route at a time. Start with the simplest, lowest-risk route. Build confidence and tooling before tackling complex routes.

### Pitfall 2: Ignoring Message Ordering

**Problem:** Assuming events will be processed in order without designing for it.
**Consequence:** Race conditions, data corruption, inconsistent state.
**Solution:** Identify routes with ordering requirements upfront. Use partitioned topics with partition keys (e.g., entity ID). Accept that cross-partition ordering is not guaranteed and design accordingly.

### Pitfall 3: Missing Idempotency

**Problem:** Building consumers that assume exactly-once delivery.
**Consequence:** Duplicate processing, double charges, duplicate records.
**Solution:** Design every consumer to be idempotent from the start. Use deduplication tables, natural idempotency, or idempotency keys. Test with deliberate duplicate delivery.

### Pitfall 4: Event Schema Without Versioning

**Problem:** Deploying event schemas without a versioning strategy.
**Consequence:** Breaking consumers when schemas change, inability to evolve schemas.
**Solution:** Include `schemaVersion` in every event from day one. Use additive-only changes (new fields are optional, never remove or rename fields). Version topics when breaking changes are unavoidable.

### Pitfall 5: Synchronous Mindset in Async World

**Problem:** Trying to replicate synchronous request-response patterns with events.
**Consequence:** Complex reply topic management, tight coupling, poor performance.
**Solution:** Embrace eventual consistency. Redesign flows to be truly asynchronous where possible. Use request-reply over events only when synchronous response is genuinely required (e.g., real-time price checks). Consider keeping some routes as synchronous gRPC instead of forcing them into events.

### Pitfall 6: Undersized Dead Letter Queues

**Problem:** Not planning DLQ capacity and monitoring.
**Consequence:** Lost messages, silent failures, data inconsistency.
**Solution:** Set up DLQ for every topic. Monitor DLQ depth with alerting. Implement DLQ reprocessing tooling before going live. Define retention policies for DLQ messages.

### Pitfall 7: No Observability During Migration

**Problem:** Migrating without comparison dashboards and distributed tracing.
**Consequence:** Unable to detect discrepancies between ESB and event processing, delayed incident response.
**Solution:** Build the comparison dashboard before starting migration. Implement distributed tracing with correlation IDs. Set up alerting rules for ESB vs event mismatches.

### Pitfall 8: Forgetting About Back Pressure

**Problem:** Not handling scenarios where consumers cannot keep up with producers.
**Consequence:** Memory exhaustion, cascading failures, message loss.
**Solution:** Implement consumer flow control (acknowledgment-based pacing for Pub/Sub, consumer group rebalancing for Kafka). Set appropriate message retention periods. Monitor consumer lag continuously. Design auto-scaling policies for consumers.
