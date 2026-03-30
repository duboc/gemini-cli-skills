# Schema Evolution Guide for Pub/Sub Event-Driven Architectures

## Pub/Sub Schema Revision Management

Pub/Sub natively supports schema management for Avro and Protobuf formats. Schemas are project-level resources that can be associated with topics.

### Creating and Managing Schemas

```bash
# Create an Avro schema
gcloud pubsub schemas create order-placed-schema \
  --type=AVRO \
  --definition-file=order-placed.avsc

# Create a Protobuf schema
gcloud pubsub schemas create order-placed-schema \
  --type=PROTOCOL_BUFFER \
  --definition-file=order-placed.proto

# Associate schema with a topic
gcloud pubsub topics create orders.order.placed.v1 \
  --schema=order-placed-schema \
  --message-encoding=JSON  # or BINARY

# Create a schema revision (new version)
gcloud pubsub schemas commit order-placed-schema \
  --type=AVRO \
  --definition-file=order-placed-v2.avsc

# List schema revisions
gcloud pubsub schemas list-revisions order-placed-schema

# Rollback to a previous revision
gcloud pubsub topics update orders.order.placed.v1 \
  --schema=order-placed-schema \
  --schema-revision=<revision-id>
```

### Schema Validation Behavior

- Messages that fail schema validation are rejected at publish time (HTTP 400)
- Configure dead-letter topics for messages that pass schema but fail consumer processing
- Use `--message-encoding=JSON` for debugging, `--message-encoding=BINARY` for production efficiency

---

## Avro Schema Evolution Rules

Avro provides strong schema evolution guarantees when following compatibility rules.

### Adding Fields (Safe)

New fields MUST have a default value:

```json
{
  "type": "record",
  "name": "OrderPlaced",
  "namespace": "com.company.orders",
  "fields": [
    {"name": "orderId", "type": "string"},
    {"name": "customerId", "type": "string"},
    {"name": "totalAmount", "type": "double"},
    {"name": "currency", "type": "string", "default": "USD"},
    {"name": "loyaltyTier", "type": ["null", "string"], "default": null}
  ]
}
```

### Avro Compatibility Rules

| Change | Backward Compatible | Forward Compatible | Full Compatible |
|--------|--------------------|--------------------|-----------------|
| Add field with default | Yes | Yes | Yes |
| Add field without default | No | Yes | No |
| Remove field with default | Yes | No | No |
| Remove field without default | No | No | No |
| Rename field | No | No | No |
| Change field type | Depends on promotion rules | Depends | No |
| Add enum value | No (backward) | Yes (forward) | No |
| Add union type | Depends on position | Depends | Depends |

### Avro Type Promotions (Safe)

- `int` → `long` → `float` → `double`
- `string` → `bytes` (and reverse)

### Using Unions for Optional Fields

```json
{"name": "shippingAddress", "type": ["null", "Address"], "default": null}
```

---

## Protobuf Evolution Rules

Protobuf uses field numbers for wire compatibility, providing flexible evolution.

### Field Number Rules

- NEVER reuse a field number after removing a field
- Use `reserved` to prevent accidental reuse
- Field numbers 1-15 use 1 byte on wire (use for frequently set fields)
- Field numbers 16-2047 use 2 bytes

```protobuf
syntax = "proto3";

message OrderPlaced {
  string order_id = 1;
  string customer_id = 2;
  double total_amount = 3;
  string currency = 4;

  // Added in v2
  string loyalty_tier = 5;

  // Field 6 was removed (was: string old_field)
  reserved 6;
  reserved "old_field";
}
```

### Protobuf Compatibility Rules

| Change | Safe? | Notes |
|--------|-------|-------|
| Add new field | Yes | Unknown fields are preserved by default |
| Remove field (with reserved) | Yes | Old readers ignore, new readers get default |
| Rename field | Yes | Wire format uses field numbers, not names |
| Change field number | No | Breaking change on wire format |
| Change field type | Depends | Some promotions safe (int32→int64, etc.) |
| Change singular to repeated | No | Wire-compatible but semantic change |
| Add enum value | Yes | Unknown values preserved in proto3 |
| Remove enum value | Risky | Old readers may get unexpected value |

### Safe Type Changes in Protobuf

- `int32` ↔ `uint32` ↔ `int64` ↔ `uint64` ↔ `bool` (compatible wire types)
- `sint32` ↔ `sint64` (compatible wire types)
- `string` ↔ `bytes` (if valid UTF-8)
- `fixed32` ↔ `sfixed32`, `fixed64` ↔ `sfixed64`

---

## Event Versioning Strategies

### Strategy 1: Version in Topic Name

```
orders.order.placed.v1
orders.order.placed.v2
```

**Pros:**
- Clean consumer routing — subscribe to the version you support
- Easy to monitor per-version traffic in Cloud Monitoring
- Simple Pub/Sub subscription management

**Cons:**
- Topic proliferation
- Producers may need to publish to multiple topics during migration
- Harder to maintain ordering across versions

**Best for:** Major breaking changes, new event shapes

### Strategy 2: Version in Payload

```json
{
  "specversion": "1.0",
  "type": "com.company.orders.OrderPlaced",
  "dataschemaversion": "2.0",
  "data": { }
}
```

**Pros:**
- Single topic per event type
- Consumers can handle multiple versions with branching logic
- Preserves ordering guarantees

**Cons:**
- Consumer complexity increases with each version
- Harder to deprecate old versions
- Schema validation must handle multiple versions

**Best for:** Minor, backward-compatible changes

### Strategy 3: Hybrid (Recommended for GCP)

- Use payload versioning for backward-compatible (minor) changes
- Use topic versioning for breaking (major) changes
- Use Pub/Sub schema revisions to track minor versions within a topic
- Use Pub/Sub message filtering for consumers that only want specific versions

---

## Breaking vs Non-Breaking Changes Catalog

### Non-Breaking Changes (Safe to Deploy)

| Change | Avro | Protobuf | Action Required |
|--------|------|----------|-----------------|
| Add optional field with default | Yes | Yes | Deploy producer first |
| Add new enum value | Forward only | Yes | Deploy consumer first |
| Widen numeric type | Yes (promotions) | Yes (compatible wire) | Deploy consumer first |
| Add new event type to topic | N/A | N/A | Deploy consumer first |
| Increase field length | Yes | Yes | No ordering constraint |

### Breaking Changes (Require Coordination)

| Change | Avro | Protobuf | Migration Strategy |
|--------|------|----------|-------------------|
| Remove required field | Breaking | Breaking | New topic version |
| Rename field | Breaking | Safe (proto) | Avro: new topic; Proto: deploy anytime |
| Change field type (incompatible) | Breaking | Breaking | New topic version |
| Change field from optional to required | Breaking | N/A (proto3) | New topic version |
| Restructure nested objects | Breaking | Breaking | New topic version |
| Change topic partitioning | Breaking | Breaking | New topic + consumer migration |

---

## Consumer Upgrade Ordering for Schema Changes

### For Backward-Compatible Changes (Adding Fields)

1. **Deploy consumers first** — they must tolerate unknown fields
2. Create new Pub/Sub schema revision
3. Update topic to use new schema revision
4. Deploy producers with new fields
5. Verify consumers process new fields correctly

### For Forward-Compatible Changes (Removing Optional Fields)

1. **Deploy producers first** — stop sending removed fields
2. Verify consumers handle missing fields (use defaults)
3. Create new schema revision without removed fields
4. Update topic schema
5. Deploy consumers that no longer expect removed fields

### For Breaking Changes (New Topic Version)

1. Create new topic (`domain.entity.event.v2`) with new schema
2. Deploy consumers that subscribe to both v1 and v2 topics
3. Deploy producers to publish to v2 topic (optionally dual-write to v1)
4. Monitor v1 subscription backlog — ensure it drains
5. Migrate all consumers off v1 subscriptions
6. Stop dual-write to v1
7. Delete v1 subscriptions, then v1 topic

---

## Pub/Sub Dead-Letter Topic Configuration for Failed Validations

### Setting Up Dead-Letter Topics

```bash
# Create dead-letter topic
gcloud pubsub topics create orders.order.placed.v1.dlq

# Create subscription with dead-letter policy
gcloud pubsub subscriptions create order-service-sub \
  --topic=orders.order.placed.v1 \
  --dead-letter-topic=orders.order.placed.v1.dlq \
  --max-delivery-attempts=5 \
  --dead-letter-topic-project=my-project

# Create subscription on DLQ for monitoring/reprocessing
gcloud pubsub subscriptions create order-dlq-monitor \
  --topic=orders.order.placed.v1.dlq
```

### DLQ Monitoring with Cloud Monitoring

```yaml
# Alert policy for DLQ message accumulation
displayName: "DLQ Messages Accumulating"
conditions:
  - displayName: "DLQ subscription backlog > 100"
    conditionThreshold:
      filter: >
        resource.type="pubsub_subscription"
        AND resource.label.subscription_id="order-dlq-monitor"
        AND metric.type="pubsub.googleapis.com/subscription/num_undelivered_messages"
      comparison: COMPARISON_GT
      thresholdValue: 100
      duration: 300s
```

### DLQ Reprocessing Patterns

1. **Manual review**: Cloud Function triggered by DLQ messages, logs to BigQuery for analysis
2. **Automatic retry**: Cloud Function reads from DLQ, transforms message, republishes to original topic
3. **Schema migration**: Cloud Function reads from DLQ, upgrades message to current schema, republishes
4. **Dead-letter sink**: Route DLQ messages to BigQuery for long-term storage and batch reprocessing

### Granting Permissions for Dead-Letter Topics

```bash
# Grant Pub/Sub service account permission to publish to DLQ
gcloud pubsub topics add-iam-policy-binding orders.order.placed.v1.dlq \
  --member="serviceAccount:service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"

# Grant permission to acknowledge from source subscription
gcloud pubsub subscriptions add-iam-policy-binding order-service-sub \
  --member="serviceAccount:service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com" \
  --role="roles/pubsub.subscriber"
```
