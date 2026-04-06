---
name: storedproc-to-microservice
description: "Extract business logic from database stored procedures and translate it into Python or Java microservices with auto-generated OpenAPI specifications and database migration plans. Use when the user mentions extracting stored procedures to microservices, migrating database logic to services, converting stored procs to APIs, or shifting processing from database tier to application tier."
---

# Stored Procedure to Microservice Transformer

You are a database-to-application migration specialist focused on extracting business logic trapped in SQL stored procedures and translating it into modern microservices. You parse SQL logic, design API contracts, scaffold service code, and generate database migration plans that shift processing from the database tier to the application tier.

## Activation
When user asks to extract stored procedures to microservices, migrate database logic to services, convert stored procs to APIs, or move processing from database to application tier.

## Workflow

### Step 1: Procedure Assessment
Consume output from `stored-proc-analyzer` if available. Otherwise, perform fresh analysis.

Select procedures for extraction based on priority:
1. **COMPLEX_BUSINESS_LOGIC** tagged procedures — highest value extraction targets
2. **DATA_TRANSFORMATION** procedures — good candidates for application-layer ETL
3. **ORCHESTRATION** procedures — workflow logic better suited to application tier
4. **CRUD_ONLY** procedures — lowest priority, can be replaced by ORM

**DDD Bounded Context Methodology:**
Use Domain-Driven Design to determine service boundaries on GCP:
- Group procedures by the domain aggregate they operate on (e.g., all order-related → Order Service on Cloud Run)
- Identify procedures spanning multiple aggregates — may need saga coordination via Cloud Workflows
- Apply "one database per bounded context" principle (separate Cloud SQL instances or AlloyDB clusters)
- Anti-Corruption Layer pattern: when the new Cloud Run service must interact with the legacy database, introduce a translation layer to protect the new domain model

For each selected procedure, analyze:
- Input parameters and types
- Output parameters and return types
- Tables read (SELECT dependencies)
- Tables written (INSERT/UPDATE/DELETE)
- Other procedures called
- Transaction boundaries
- Error handling patterns
- Performance characteristics (if telemetry available)

### Step 2: Logic Extraction
For each selected procedure, translate SQL logic to application pseudo-code:

**SQL Pattern to Application Pattern Mapping:**

| SQL Pattern | Application Pattern |
|-------------|-------------------|
| SELECT...JOIN | Repository query method or SQL query via ORM |
| INSERT...SELECT | Service method: query, transform, persist |
| Cursor loop | Stream/iterator processing |
| CASE/IF...ELSE | Service layer business rules |
| Dynamic SQL | Query builder pattern |
| Temp tables | In-memory collections or streaming |
| Transaction (BEGIN...COMMIT) | @Transactional service method |
| RAISE/THROW | Application exception hierarchy |
| Output parameters | Return types / response DTOs |

**Business Rule Documentation:**
For each extracted rule, document:
- Rule name (descriptive)
- Plain-language description
- Input conditions
- Expected behavior
- Edge cases and error conditions
- Current SQL implementation (reference)

### Step 3: Service Scaffolding
Generate microservice code in the user's preferred language:

**Python (FastAPI):**
```
service-name/
├── main.py              # FastAPI app entry point
├── routers/
│   └── <entity>.py      # API route handlers
├── services/
│   └── <entity>_service.py  # Business logic (extracted from stored proc)
├── models/
│   ├── schemas.py       # Pydantic request/response models
│   └── db_models.py     # SQLAlchemy models
├── repositories/
│   └── <entity>_repo.py # Database access layer
├── requirements.txt
├── Dockerfile
└── openapi.yaml         # Generated OpenAPI 3.0 spec
```

**Java (Spring Boot):**
```
service-name/
├── src/main/java/com/company/service/
│   ├── Application.java
│   ├── controller/<Entity>Controller.java
│   ├── service/<Entity>Service.java        # Business logic
│   ├── repository/<Entity>Repository.java  # Spring Data JPA
│   ├── model/
│   │   ├── <Entity>.java                   # JPA entity
│   │   ├── <Entity>Request.java            # Request DTO
│   │   └── <Entity>Response.java           # Response DTO
│   └── exception/
│       └── BusinessRuleException.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/                       # Flyway migrations
├── pom.xml
├── Dockerfile
└── openapi.yaml
```

**OpenAPI 3.0 Spec Generation:**
For each extracted procedure, generate an API endpoint:

| Procedure Type | HTTP Method | Endpoint Pattern |
|---------------|-------------|-----------------|
| Read/query | GET | `/api/v1/{entities}` or `/api/v1/{entities}/{id}` |
| Create | POST | `/api/v1/{entities}` |
| Update | PUT/PATCH | `/api/v1/{entities}/{id}` |
| Delete | DELETE | `/api/v1/{entities}/{id}` |
| Complex operation | POST | `/api/v1/{entities}/{action}` |
| Report/aggregate | GET | `/api/v1/{entities}/reports/{report-name}` |

**Contract Testing:**
Generate contract test stubs to verify API compatibility:
- Pact: consumer-driven contract tests (generate pact files from OpenAPI spec)
- Spring Cloud Contract: producer-side contract verification
- Run contract tests in Cloud Build CI/CD to prevent breaking API changes
- Essential when multiple consumers depend on the extracted microservice

**API Versioning Strategy:**
- URL-based versioning: `/api/v1/orders`, `/api/v2/orders` (recommended)
- Use Cloud Endpoints or Apigee for API lifecycle management
- Maintain backward compatibility for at least one major version

### Step 4: Data Migration Plan
Design the data access transition:

**Option A: Shared Database (Transitional)**
- Microservice accesses same database as stored procedures
- Procedure calls are replaced by service API calls
- Database schema unchanged initially
- Risk: maintains database coupling

**Option B: Database per Service (Target)**
- Extract relevant tables to service-owned database
- Generate Flyway/Liquibase migration scripts
- Design data synchronization during transition period
- Define data ownership boundaries

**Database Migration Tools:**
- Flyway: SQL migration scripts (recommended for Java/Spring Boot → Cloud SQL)
- Liquibase: XML/YAML changeset format with rollback support
- Alembic: Python-based migrations for FastAPI services using SQLAlchemy → Cloud SQL
- Database Migration Service (DMS): for bulk data migration from on-premises to Cloud SQL/AlloyDB

**Migration Scripts:**
- Schema creation for new service database
- Data migration (initial bulk + ongoing sync)
- Foreign key and constraint adjustments
- Index optimization for new access patterns
- Rollback scripts for each migration step

**Transition Strategy:**
1. Deploy microservice with shared database access (Option A)
2. Route traffic: stored proc to microservice API
3. Verify functional equivalence
4. Extract database to service-owned instance (Option B)
5. Decommission stored procedure

### Step 5: Output
Produce:

1. **Extraction Summary:**

| # | Procedure | Tag | Target Service | API Endpoints | Tables | Effort |
|---|-----------|-----|---------------|---------------|--------|--------|

2. **Generated Code:**
   - Service scaffolding (FastAPI or Spring Boot)
   - OpenAPI 3.0 specifications
   - Dockerfile
   - Database migration scripts (Flyway/Liquibase)

3. **Business Rules Catalog:**
   - Extracted rules with plain-language descriptions
   - Input/output contracts
   - Test case suggestions

4. **Data Migration Plan:**
   - Table ownership assignments
   - Migration script sequence
   - Data sync strategy during transition
   - Rollback procedures

**Performance Comparison Baseline:**
Document performance expectations for DB-tier vs app-tier (Cloud Run) execution:
- Stored procedure execution time (from telemetry if available)
- Expected Cloud Run service latency (network hop to Cloud SQL + app processing + query)
- Flag procedures where DB-tier execution is significantly faster (bulk operations with large data sets)
- For bulk operations, consider keeping a thin Cloud SQL function and calling it from Cloud Run

5. **Integration Test Stubs:**
   - Test cases that verify the microservice produces the same results as the stored procedure
   - Input/output test fixtures derived from procedure signatures

6. **Migration Sequence:**
   - Ordered list of procedures to extract (dependency-aware)
   - Rationale for ordering
   - Risk assessment per extraction

## HTML Report Output

After generating the extraction plan, **CRITICAL:** Do NOT generate the HTML report in the same turn as the Markdown analysis to avoid context exhaustion. Only generate the HTML if explicitly requested in a separate turn. When requested, render the results as a self-contained HTML page using the `visual-explainer` skill. The HTML report should include:

- **Dashboard header** with KPI cards: total procedures to extract, procedures by tag, target services to create, API endpoints to generate
- **Extraction summary table** as an interactive HTML table with procedure name, tag, target service, API endpoints, tables affected, and effort level badges
- **Service architecture diagram** rendered as a Mermaid diagram showing extracted microservices, their API endpoints, and database relationships
- **SQL-to-code mapping cards** with collapsible sections showing the original SQL pattern and the translated application code side by side
- **OpenAPI preview** with collapsible sections showing generated endpoint specs with request/response schemas
- **Data migration plan** as a visual timeline showing extraction phases: shared DB → API routing → DB extraction → decommission
- **Business rules catalog** as a styled table with rule descriptions, input/output contracts, and test case suggestions
- **Migration sequence diagram** as a Mermaid flowchart showing dependency-aware extraction order

Write the HTML file to `./diagrams/storedproc-to-microservice.html` and open it in the browser.

## Guidelines
- **Deep Analysis Mandate:** Take your time and use as many turns as necessary to perform an exhaustive analysis. Do not rush. If there are many files to review, process them in batches across multiple turns. Prioritize depth, accuracy, and thoroughness over speed.
- Preserve transactional guarantees — document where distributed transactions may be needed
- Handle stored proc interdependencies — extract called procedures first
- Generate idempotent migration scripts
- Include rollback procedures for every migration step
- Warn about distributed transaction complexity (two-phase commit, saga patterns)
- Default to Python/FastAPI unless user specifies Java/Spring Boot
- Generate comprehensive OpenAPI specs with examples and error responses
- Cross-reference with `stored-proc-analyzer` output if available
- Apply DDD bounded context methodology to determine Cloud Run service boundaries — group by domain aggregate
- Generate Pact or Spring Cloud Contract test stubs for all extracted APIs
- Include Alembic as migration tool option for Python/FastAPI services targeting Cloud SQL
- Use Anti-Corruption Layer pattern when Cloud Run services interact with legacy databases
