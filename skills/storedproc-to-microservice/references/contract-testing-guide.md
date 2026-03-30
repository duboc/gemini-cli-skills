# Contract Testing Guide for Extracted Microservices

## Pact Consumer-Driven Contract Test Example

### Python FastAPI Consumer Example

When a frontend or another microservice consumes the extracted API, define the expected contract from the consumer side.

**Consumer test (Python with pact-python):**

```python
# tests/contract/test_order_service_consumer.py
import pytest
from pact import Consumer, Provider

@pytest.fixture(scope="session")
def pact():
    pact = Consumer("OrderFrontend").has_pact_with(
        Provider("OrderService"),
        pact_dir="./pacts",
    )
    pact.start_service()
    yield pact
    pact.stop_service()
    pact.verify()

def test_get_order(pact):
    expected = {
        "orderId": "order-123",
        "customerId": "cust-456",
        "totalAmount": 99.99,
        "status": "CONFIRMED",
        "items": [
            {"productId": "prod-789", "quantity": 2, "unitPrice": 49.99}
        ]
    }

    (pact
     .given("an order with ID order-123 exists")
     .upon_receiving("a request for order order-123")
     .with_request("GET", "/api/v1/orders/order-123")
     .will_respond_with(200, body=expected))

    # Call the consumer client that uses the Order Service API
    from app.clients.order_client import OrderClient
    client = OrderClient(base_url=pact.uri)
    order = client.get_order("order-123")

    assert order["orderId"] == "order-123"
    assert order["totalAmount"] == 99.99
```

**Provider verification (FastAPI service):**

```python
# tests/contract/test_order_service_provider.py
from pact import Verifier

def test_verify_pacts():
    verifier = Verifier(
        provider="OrderService",
        provider_base_url="http://localhost:8000",
    )

    output, _ = verifier.verify_pacts(
        "./pacts/orderfrontend-orderservice.json",
        provider_states_setup_url="http://localhost:8000/_pact/setup",
    )

    assert output == 0
```

**Provider state setup endpoint:**

```python
# app/routers/pact_states.py (only in test profile)
from fastapi import APIRouter

router = APIRouter()

@router.post("/_pact/setup")
async def setup_provider_state(state: dict):
    if state["state"] == "an order with ID order-123 exists":
        # Insert test data into Cloud SQL test instance
        await db.execute(
            "INSERT INTO orders (order_id, customer_id, total_amount, status) "
            "VALUES ('order-123', 'cust-456', 99.99, 'CONFIRMED')"
        )
    return {"status": "ok"}
```

### Java Spring Boot Provider Example

**Provider contract verification (Spring Boot with spring-cloud-contract):**

```java
// src/test/java/com/company/order/contract/OrderContractVerificationTest.java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Provider("OrderService")
@PactFolder("pacts")
class OrderContractVerificationTest {

    @LocalServerPort
    int port;

    @BeforeEach
    void setUp(PactVerificationContext context) {
        context.setTarget(new HttpTestTarget("localhost", port));
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    void verifyPact(PactVerificationContext context) {
        context.verifyInteraction();
    }

    @State("an order with ID order-123 exists")
    void setupOrder() {
        orderRepository.save(new Order(
            "order-123", "cust-456", BigDecimal.valueOf(99.99), "CONFIRMED"
        ));
    }
}
```

---

## Spring Cloud Contract Example with OpenAPI Integration

### Contract Definition (Groovy DSL)

```groovy
// src/test/resources/contracts/order/get_order_by_id.groovy
Contract.make {
    description "should return order by ID"
    request {
        method GET()
        url "/api/v1/orders/order-123"
        headers {
            contentType(applicationJson())
        }
    }
    response {
        status OK()
        headers {
            contentType(applicationJson())
        }
        body([
            orderId: "order-123",
            customerId: "cust-456",
            totalAmount: 99.99,
            status: "CONFIRMED",
            items: [
                [productId: "prod-789", quantity: 2, unitPrice: 49.99]
            ]
        ])
    }
}
```

### Generating Contracts from OpenAPI Spec

Use `openapi-generator` to create contract stubs from the OpenAPI spec generated during stored procedure extraction:

```bash
# Generate Spring Cloud Contract stubs from OpenAPI
openapi-generator generate \
  -i openapi.yaml \
  -g spring \
  --additional-properties=interfaceOnly=true \
  -o generated-contracts/

# Or use scc-openapi plugin
mvn spring-cloud-contract:convert -Dcontracts.dir=src/test/resources/openapi
```

### Contract Test in Cloud Build CI/CD

```yaml
# cloudbuild.yaml
steps:
  # Run unit tests
  - name: 'maven:3.9-eclipse-temurin-21'
    entrypoint: 'mvn'
    args: ['test']

  # Run contract tests
  - name: 'maven:3.9-eclipse-temurin-21'
    entrypoint: 'mvn'
    args: ['verify', '-Pcontract-tests']

  # Publish contract stubs to Artifact Registry
  - name: 'maven:3.9-eclipse-temurin-21'
    entrypoint: 'mvn'
    args: ['deploy', '-Pstubs']
    env:
      - 'ARTIFACT_REGISTRY_URL=https://us-central1-maven.pkg.dev/my-project/contract-stubs'

  # Build container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'us-central1-docker.pkg.dev/my-project/services/order-service:$COMMIT_SHA', '.']

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'us-central1-docker.pkg.dev/my-project/services/order-service:$COMMIT_SHA']
```

---

## API Versioning Strategies Comparison

### URL-Based Versioning (Recommended)

```
GET /api/v1/orders/123
GET /api/v2/orders/123
```

| Aspect | Details |
|--------|---------|
| Pros | Simple, explicit, cacheable, easy routing in Cloud Run/Apigee |
| Cons | URL proliferation, harder to sunset |
| GCP support | Cloud Endpoints routing rules, Apigee API proxies, Cloud Run path-based routing |
| Best for | Public APIs, extracted microservices with multiple consumers |

**Cloud Endpoints routing:**
```yaml
# openapi.yaml
paths:
  /api/v1/orders/{id}:
    get:
      operationId: getOrderV1
      x-google-backend:
        address: https://order-service-v1-abc123.run.app
  /api/v2/orders/{id}:
    get:
      operationId: getOrderV2
      x-google-backend:
        address: https://order-service-v2-def456.run.app
```

### Header-Based Versioning

```
GET /api/orders/123
Accept: application/vnd.company.order.v2+json
```

| Aspect | Details |
|--------|---------|
| Pros | Clean URLs, single endpoint |
| Cons | Not cacheable by default, harder to test, hidden versioning |
| GCP support | Requires custom routing logic in Cloud Run or Apigee policies |
| Best for | Internal APIs with controlled consumers |

### Query Parameter Versioning

```
GET /api/orders/123?version=2
```

| Aspect | Details |
|--------|---------|
| Pros | Simple to implement, visible |
| Cons | Clutters URLs, easy to forget, caching complications |
| GCP support | Cloud Endpoints, Apigee |
| Best for | Quick prototyping, not recommended for production |

---

## Anti-Corruption Layer Pattern

When the new Cloud Run microservice must interact with a legacy database that still serves stored procedures, use an Anti-Corruption Layer (ACL) to protect the new domain model.

### Python Example (FastAPI)

```python
# acl/legacy_order_translator.py
from models.domain import Order, OrderItem, Money
from models.legacy import LegacyOrderRow

class LegacyOrderTranslator:
    """Anti-Corruption Layer: translates between legacy DB schema and domain model."""

    def to_domain(self, legacy_row: LegacyOrderRow) -> Order:
        """Translate legacy database row to clean domain model."""
        return Order(
            order_id=str(legacy_row.ORD_ID),           # Legacy: integer ORD_ID
            customer_id=str(legacy_row.CUST_NBR),       # Legacy: CUST_NBR varchar
            total=Money(
                amount=legacy_row.TOT_AMT / 100,        # Legacy: stores cents as integer
                currency=self._map_currency(legacy_row.CUR_CD),
            ),
            status=self._map_status(legacy_row.STAT_FLG),  # Legacy: single char flag
            items=self._translate_items(legacy_row.ORD_ID),
        )

    def to_legacy(self, order: Order) -> dict:
        """Translate domain model back to legacy DB format for writes."""
        return {
            "CUST_NBR": order.customer_id,
            "TOT_AMT": int(order.total.amount * 100),
            "CUR_CD": self._reverse_currency(order.total.currency),
            "STAT_FLG": self._reverse_status(order.status),
        }

    def _map_status(self, flag: str) -> str:
        status_map = {
            "N": "NEW",
            "P": "PROCESSING",
            "C": "CONFIRMED",
            "X": "CANCELLED",
            "S": "SHIPPED",
        }
        return status_map.get(flag, "UNKNOWN")

    def _map_currency(self, code: str) -> str:
        currency_map = {"D": "USD", "E": "EUR", "G": "GBP"}
        return currency_map.get(code, "USD")
```

```python
# repositories/order_repo.py
from acl.legacy_order_translator import LegacyOrderTranslator

class OrderRepository:
    """Repository that uses ACL to interact with legacy database."""

    def __init__(self, db_session, translator: LegacyOrderTranslator):
        self.db = db_session
        self.translator = translator

    async def get_by_id(self, order_id: str) -> Order:
        legacy_row = await self.db.execute(
            "SELECT * FROM LEGACY_ORDERS WHERE ORD_ID = :id",
            {"id": int(order_id)}
        )
        return self.translator.to_domain(legacy_row.first())
```

### Java Example (Spring Boot)

```java
// acl/LegacyOrderTranslator.java
@Component
public class LegacyOrderTranslator {

    public Order toDomain(LegacyOrderEntity legacy) {
        return Order.builder()
            .orderId(String.valueOf(legacy.getOrdId()))
            .customerId(legacy.getCustNbr())
            .total(new Money(
                BigDecimal.valueOf(legacy.getTotAmt()).divide(BigDecimal.valueOf(100)),
                mapCurrency(legacy.getCurCd())
            ))
            .status(mapStatus(legacy.getStatFlg()))
            .build();
    }

    public LegacyOrderEntity toLegacy(Order order) {
        LegacyOrderEntity entity = new LegacyOrderEntity();
        entity.setCustNbr(order.getCustomerId());
        entity.setTotAmt(order.getTotal().getAmount()
            .multiply(BigDecimal.valueOf(100)).intValue());
        entity.setCurCd(reverseCurrency(order.getTotal().getCurrency()));
        entity.setStatFlg(reverseStatus(order.getStatus()));
        return entity;
    }

    private OrderStatus mapStatus(String flag) {
        return switch (flag) {
            case "N" -> OrderStatus.NEW;
            case "P" -> OrderStatus.PROCESSING;
            case "C" -> OrderStatus.CONFIRMED;
            case "X" -> OrderStatus.CANCELLED;
            case "S" -> OrderStatus.SHIPPED;
            default -> OrderStatus.UNKNOWN;
        };
    }
}
```

```java
// repository/OrderRepository.java
@Repository
public class OrderRepository {

    private final JdbcTemplate jdbc;
    private final LegacyOrderTranslator translator;

    public Order findById(String orderId) {
        LegacyOrderEntity legacy = jdbc.queryForObject(
            "SELECT * FROM LEGACY_ORDERS WHERE ORD_ID = ?",
            new LegacyOrderRowMapper(),
            Integer.parseInt(orderId)
        );
        return translator.toDomain(legacy);
    }
}
```

---

## DDD Bounded Context Identification Methodology

### Step 1: Catalog All Stored Procedures by Entity

Map each procedure to the primary domain entity it operates on:

| Procedure | Primary Entity | Operations | Reads From | Writes To |
|-----------|---------------|------------|------------|-----------|
| `sp_create_order` | Order | INSERT | customers, products | orders, order_items |
| `sp_update_order_status` | Order | UPDATE | orders | orders, order_history |
| `sp_calculate_shipping` | Order | SELECT | orders, shipping_rates | - |
| `sp_process_payment` | Payment | INSERT/UPDATE | orders | payments, ledger |
| `sp_create_customer` | Customer | INSERT | - | customers |
| `sp_get_customer_orders` | Customer/Order | SELECT | customers, orders | - |

### Step 2: Identify Aggregates

Group procedures by the aggregate root they operate on:

```
Order Aggregate:
  - sp_create_order
  - sp_update_order_status
  - sp_calculate_shipping
  → Order Service (Cloud Run)
  → Database: Cloud SQL (orders, order_items, order_history)

Payment Aggregate:
  - sp_process_payment
  - sp_refund_payment
  → Payment Service (Cloud Run)
  → Database: Cloud SQL (payments, ledger)

Customer Aggregate:
  - sp_create_customer
  - sp_update_customer
  → Customer Service (Cloud Run)
  → Database: Cloud SQL (customers)
```

### Step 3: Identify Cross-Aggregate Procedures

Procedures that span aggregates need special handling:

- `sp_get_customer_orders` — reads from Customer and Order → API composition in API Gateway or BFF
- `sp_process_order_payment` — writes to Order and Payment → Saga pattern via Cloud Workflows
- `sp_generate_monthly_report` — reads from all aggregates → reporting service with read replicas or BigQuery

### Step 4: Map to GCP Services

```
┌─────────────────────────────────────────────────┐
│                   Apigee / Cloud Endpoints       │
│                   (API Gateway)                  │
├────────┬────────────┬────────────┬───────────────┤
│ Order  │  Payment   │ Customer   │   Reporting   │
│Service │  Service   │  Service   │   Service     │
│(Cloud  │  (Cloud    │  (Cloud    │  (Cloud Run)  │
│ Run)   │   Run)     │   Run)     │               │
├────────┼────────────┼────────────┼───────────────┤
│Cloud   │  Cloud     │  Cloud     │  BigQuery     │
│SQL     │  SQL       │  SQL       │  (read-only)  │
│(orders)│ (payments) │(customers) │               │
└────────┴────────────┴────────────┴───────────────┘
         │                         │
         └───── Cloud Workflows ───┘
               (Saga coordination)
```

---

## Cloud Build CI/CD Integration for Contract Test Execution

### Full Pipeline with Contract Testing

```yaml
# cloudbuild.yaml
steps:
  # Step 1: Fetch consumer pacts from Artifact Registry
  - name: 'gcr.io/cloud-builders/gsutil'
    args: ['cp', 'gs://my-project-pacts/*.json', './pacts/']

  # Step 2: Run unit tests
  - name: 'python:3.12-slim'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        pip install -r requirements.txt -r requirements-test.txt
        pytest tests/unit/ -v

  # Step 3: Start service and run contract verification
  - name: 'python:3.12-slim'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        pip install -r requirements.txt -r requirements-test.txt
        # Start service in background for contract verification
        uvicorn main:app --host 0.0.0.0 --port 8000 &
        sleep 5
        pytest tests/contract/ -v
        kill %1

  # Step 4: Run integration tests against Cloud SQL test instance
  - name: 'python:3.12-slim'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        pip install -r requirements.txt -r requirements-test.txt
        pytest tests/integration/ -v
    env:
      - 'DATABASE_URL=postgresql://test-user:$$DB_PASSWORD@/testdb?host=/cloudsql/my-project:us-central1:test-instance'
    secretEnv: ['DB_PASSWORD']

  # Step 5: Build and push container
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'us-central1-docker.pkg.dev/my-project/services/$_SERVICE_NAME:$COMMIT_SHA'
      - '.'

  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/my-project/services/$_SERVICE_NAME:$COMMIT_SHA'

  # Step 6: Deploy to Cloud Run (staging)
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - '$_SERVICE_NAME-staging'
      - '--image=us-central1-docker.pkg.dev/my-project/services/$_SERVICE_NAME:$COMMIT_SHA'
      - '--region=us-central1'
      - '--no-traffic'

  # Step 7: Publish pacts to GCS for consumer teams
  - name: 'gcr.io/cloud-builders/gsutil'
    args: ['cp', './pacts/*.json', 'gs://my-project-pacts/providers/$_SERVICE_NAME/']

availableSecrets:
  secretManager:
    - versionName: projects/my-project/secrets/test-db-password/versions/latest
      env: 'DB_PASSWORD'

substitutions:
  _SERVICE_NAME: order-service

options:
  logging: CLOUD_LOGGING_ONLY
```

### Trigger Configuration

```bash
# Create Cloud Build trigger for contract tests on PR
gcloud builds triggers create github \
  --repo-name=order-service \
  --repo-owner=my-org \
  --pull-request-pattern="^main$" \
  --build-config=cloudbuild.yaml \
  --substitutions="_SERVICE_NAME=order-service"
```
