# Event Design Patterns Reference

## CloudEvents Schema Templates

### Base Event Envelope

All events follow the [CloudEvents v1.0 specification](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md):

```json
{
  "specversion": "1.0",
  "type": "com.company.domain.EntityAction",
  "source": "/services/service-name",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "time": "2024-01-15T10:30:00Z",
  "datacontenttype": "application/json",
  "subject": "entity-id-12345",
  "data": {
    "schemaVersion": "1.0",
    "correlationId": "corr-abc-123",
    "payload": { }
  }
}
```

### Domain Event Template

Used for events that represent something that happened in the business domain:

```json
{
  "specversion": "1.0",
  "type": "com.acme.orders.OrderPlaced",
  "source": "/services/order-service",
  "id": "evt-20240115-001",
  "time": "2024-01-15T10:30:00Z",
  "datacontenttype": "application/json",
  "subject": "order-98765",
  "data": {
    "schemaVersion": "1.0",
    "correlationId": "sess-abc-123",
    "orderId": "order-98765",
    "customerId": "cust-12345",
    "items": [
      { "productId": "prod-001", "quantity": 2, "unitPrice": 29.99 }
    ],
    "totalAmount": 59.98,
    "currency": "USD",
    "placedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Command Event Template

Used for events that request an action to be performed:

```json
{
  "specversion": "1.0",
  "type": "com.acme.payments.ProcessPayment",
  "source": "/services/order-service",
  "id": "cmd-20240115-001",
  "time": "2024-01-15T10:30:01Z",
  "datacontenttype": "application/json",
  "subject": "payment-req-54321",
  "data": {
    "schemaVersion": "1.0",
    "correlationId": "sess-abc-123",
    "orderId": "order-98765",
    "amount": 59.98,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "idempotencyKey": "pay-order-98765-attempt-1"
  }
}
```

### Integration Event Template

Used for events bridging bounded contexts or external systems:

```json
{
  "specversion": "1.0",
  "type": "com.acme.integration.ErpOrderSynced",
  "source": "/services/erp-adapter",
  "id": "int-20240115-001",
  "time": "2024-01-15T10:31:00Z",
  "datacontenttype": "application/json",
  "data": {
    "schemaVersion": "1.0",
    "correlationId": "sess-abc-123",
    "sourceSystem": "sap-erp",
    "targetSystem": "order-service",
    "externalReference": "SAP-SO-2024-001",
    "internalReference": "order-98765",
    "syncStatus": "SUCCESS",
    "syncedFields": ["status", "shipmentDate", "trackingNumber"]
  }
}
```

## Topic Naming Conventions

### Standard Format

```
{domain}.{entity}.{event-type}.{version}
```

**Examples:**

| Topic Name | Description |
|------------|-------------|
| `orders.order.placed.v1` | Order was placed |
| `orders.order.cancelled.v1` | Order was cancelled |
| `payments.payment.processed.v1` | Payment completed |
| `payments.payment.failed.v1` | Payment failed |
| `inventory.stock.updated.v1` | Stock level changed |
| `shipping.shipment.dispatched.v1` | Shipment left warehouse |
| `customers.customer.registered.v1` | New customer signed up |

### Dead Letter Queue Naming

```
{original-topic-name}.dlq
```

Example: `orders.order.placed.v1.dlq`

### Retry Topic Naming

```
{original-topic-name}.retry.{attempt}
```

Example: `orders.order.placed.v1.retry.1`, `orders.order.placed.v1.retry.2`

### Partitioning Strategy

| Strategy | Use Case | Key |
|----------|----------|-----|
| By entity ID | Ordering per entity | `orderId`, `customerId` |
| By region | Data locality, compliance | `region` |
| By tenant | Multi-tenant isolation | `tenantId` |
| Round-robin | Maximum throughput, no ordering needed | None |

## Common Event-Driven Patterns

### 1. Event Notification

The simplest pattern. An event signals that something happened, carrying minimal data. Consumers call back to the source for details if needed.

**When to use:** Low coupling requirements, consumers need different subsets of data.

**Trade-offs:** Reduces coupling but increases chattiness (consumers must call back for data).

```json
{
  "type": "com.acme.orders.OrderPlaced",
  "data": {
    "orderId": "order-98765",
    "placedAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Event-Carried State Transfer

Events carry the full state needed by consumers so they never need to call back to the source system. Consumers maintain their own local copy of the data.

**When to use:** Consumer autonomy is important, reducing synchronous dependencies.

**Trade-offs:** Larger event payloads, eventual consistency between producer and consumer views.

```json
{
  "type": "com.acme.orders.OrderPlaced",
  "data": {
    "orderId": "order-98765",
    "customerId": "cust-12345",
    "customerName": "Jane Doe",
    "customerEmail": "jane@example.com",
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zip": "62701"
    },
    "items": [
      {
        "productId": "prod-001",
        "productName": "Widget Pro",
        "quantity": 2,
        "unitPrice": 29.99
      }
    ],
    "totalAmount": 59.98,
    "currency": "USD"
  }
}
```

### 3. Event Sourcing

Store all state changes as an immutable sequence of events. Current state is derived by replaying events. The event log is the system of record.

**When to use:** Audit/compliance requirements, need to reconstruct historical state, complex domain logic.

**Trade-offs:** Increased storage, complexity in rebuilding state, eventual consistency.

```
Event Store for Order aggregate:
  1. OrderCreated    { orderId, customerId, items }
  2. PaymentReceived { orderId, paymentId, amount }
  3. OrderConfirmed  { orderId, confirmedAt }
  4. ItemShipped     { orderId, shipmentId, trackingNumber }
  5. OrderCompleted  { orderId, completedAt }
```

**Snapshot Strategy:**
- Take snapshots every N events (e.g., every 100) to speed up state rebuilding
- Store snapshots alongside the event stream
- Rebuild state from latest snapshot + subsequent events

### 4. CQRS (Command Query Responsibility Segregation)

Separate the write model (commands) from the read model (queries). Events bridge the two, updating read-optimized projections when the write model changes.

**When to use:** Different read and write performance requirements, complex query patterns, multiple read views of the same data.

**Trade-offs:** Increased complexity, eventual consistency between write and read models.

```
Command Side:                    Query Side:
  PlaceOrder command               OrderSummaryView (for dashboards)
    → validates                    OrderDetailView (for customer portal)
    → writes to event store        OrderAnalyticsView (for reporting)
    → emits OrderPlaced event
                                   Each view is updated by consuming
                                   events and projecting into its
                                   optimized read store.
```

## Idempotency Implementation Patterns

### Pattern 1: Idempotency Key in Event

Include a unique idempotency key in every event. Consumers track processed keys.

```json
{
  "data": {
    "idempotencyKey": "pay-order-98765-attempt-1",
    "orderId": "order-98765",
    "amount": 59.98
  }
}
```

**Consumer implementation:**
```
1. Receive event
2. Check if idempotencyKey exists in processed_events table
3. If exists → acknowledge and skip
4. If not → process event, then insert idempotencyKey into processed_events
5. Use a database transaction to ensure step 4 is atomic with processing
```

### Pattern 2: Natural Idempotency

Design operations to be naturally idempotent so reprocessing produces the same result.

| Operation | Idempotent? | Fix |
|-----------|-------------|-----|
| SET status = 'shipped' | Yes | Same result on replay |
| INCREMENT counter BY 1 | No | Use SET counter = specific_value |
| INSERT new row | No | Use UPSERT with unique key |
| DELETE WHERE id = X | Yes | Same result on replay |
| Transfer $100 from A to B | No | Use transfer_id for deduplication |

### Pattern 3: Deduplication Table

Maintain a deduplication table with event IDs and a TTL for cleanup:

```sql
CREATE TABLE processed_events (
    event_id VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    topic VARCHAR(255),
    consumer_group VARCHAR(255)
);

-- Cleanup events older than 7 days
DELETE FROM processed_events WHERE processed_at < NOW() - INTERVAL 7 DAY;
```

## Outbox Pattern Implementation

Ensures reliable event publishing by writing events to a database table in the same transaction as the business operation, then asynchronously publishing them to the event broker.

### How It Works

```
1. Business transaction:
   BEGIN TRANSACTION
     INSERT INTO orders (id, status, ...) VALUES (...)
     INSERT INTO outbox (id, topic, payload, created_at) VALUES (...)
   COMMIT

2. Outbox publisher (separate process):
   POLL outbox table for unpublished events
   PUBLISH each event to the broker
   MARK event as published (or DELETE from outbox)
```

### Outbox Table Schema

```sql
CREATE TABLE outbox (
    id UUID PRIMARY KEY,
    aggregate_type VARCHAR(255) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL,
    retry_count INT DEFAULT 0
);

CREATE INDEX idx_outbox_unpublished ON outbox (created_at) WHERE published_at IS NULL;
```

### Publishing Strategies

| Strategy | Mechanism | Latency | Complexity |
|----------|-----------|---------|------------|
| Polling publisher | Cron job polls outbox table | Seconds | Low |
| CDC-based | Debezium/Datastream reads transaction log | Milliseconds | Medium |
| Transaction log tailing | Custom log reader | Milliseconds | High |

### CDC-Based Outbox (Recommended)

Use Debezium or Google Cloud Datastream to capture outbox table changes directly from the database transaction log. This avoids polling overhead and provides near-real-time publishing.

```
Database → Transaction Log → Debezium/Datastream → Pub/Sub/Kafka
```

## Saga Pattern for Distributed Transactions

Replaces ESB orchestration flows that coordinated multi-system transactions. A saga is a sequence of local transactions where each step publishes an event that triggers the next step.

### Choreography-Based Saga

Each service listens for events and decides what to do next. No central coordinator.

```
OrderService          PaymentService        InventoryService       ShippingService
    |                      |                      |                      |
    |--- OrderPlaced ----->|                      |                      |
    |                      |--- PaymentProcessed ->|                     |
    |                      |                      |--- StockReserved --->|
    |                      |                      |                      |--- ShipmentCreated
    |<------------------- OrderCompleted --------------------------------|
```

**Compensating transactions (on failure):**
```
ShippingService fails → emits ShipmentFailed
InventoryService hears ShipmentFailed → emits StockReleased (compensate)
PaymentService hears StockReleased → emits PaymentRefunded (compensate)
OrderService hears PaymentRefunded → marks order as FAILED (compensate)
```

### Orchestration-Based Saga

A central orchestrator (e.g., Cloud Workflows, Step Functions) coordinates the saga steps.

```
OrderSaga Orchestrator
    |
    |---> PaymentService.processPayment()
    |     Success? → continue
    |     Failure? → compensate and stop
    |
    |---> InventoryService.reserveStock()
    |     Success? → continue
    |     Failure? → PaymentService.refund(), stop
    |
    |---> ShippingService.createShipment()
    |     Success? → complete saga
    |     Failure? → InventoryService.release(), PaymentService.refund(), stop
```

### When to Use Each

| Factor | Choreography | Orchestration |
|--------|-------------|---------------|
| Number of steps | Few (2-4) | Many (5+) |
| Coupling | Lower | Higher (orchestrator knows all services) |
| Visibility | Harder to trace | Easy to monitor |
| Complexity | Distributed logic | Centralized logic |
| ESB replacement | Simple flows | Complex ESB orchestration flows |
