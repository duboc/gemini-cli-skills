# Stored Procedure to Microservice Transformer

A Gemini CLI skill for extracting business logic from database stored procedures and translating it into Python or Java microservices with auto-generated OpenAPI specifications and database migration plans.

## What It Does

This skill takes stored procedures containing business logic and transforms them into production-ready microservice scaffolding:

1. **Procedure assessment** — Consumes output from `stored-proc-analyzer` or performs fresh analysis. Selects procedures for extraction based on complexity tags and business value.
2. **Logic extraction** — Translates SQL patterns (cursors, temp tables, dynamic SQL, transactions) into equivalent application-tier patterns (streams, collections, query builders, service methods).
3. **Service scaffolding** — Generates complete microservice code in Python (FastAPI) or Java (Spring Boot) with proper layering: controllers, services, repositories, models, and DTOs.
4. **OpenAPI generation** — Produces OpenAPI 3.0 specifications for every extracted endpoint, with request/response schemas, error responses, and examples.
5. **Data migration plan** — Creates a phased migration strategy from shared database access to database-per-service, including Flyway/Liquibase scripts and rollback procedures.
6. **Integration test stubs** — Generates test cases that verify the microservice produces the same results as the original stored procedure.

## When Does It Activate?

The skill activates when you ask Gemini to extract stored procedures into microservices, convert database logic to APIs, or migrate processing from the database tier to the application tier.

| Trigger | Example |
|---------|---------|
| Extract stored procedures to microservices | "Extract the billing stored procedures into a microservice" |
| Migrate database logic to services | "Migrate our database logic into application services" |
| Convert stored procs to APIs | "Convert these stored procedures into REST APIs" |
| Shift processing to application tier | "Move the order processing logic from the database to the app layer" |
| Generate OpenAPI from stored procs | "Generate an OpenAPI spec from these stored procedures" |
| Create migration plan for stored procs | "Create a migration plan to move stored procedures out of the database" |

## Topics Covered

| Area | Details |
|------|---------|
| **SQL Pattern Translation** | Cursor loops to streams, temp tables to collections, dynamic SQL to query builders, transactions to @Transactional |
| **Service Scaffolding** | FastAPI (Python) and Spring Boot (Java) project structures with proper layering |
| **OpenAPI 3.0 Generation** | Endpoint mapping, request/response schemas, error responses, pagination, versioning |
| **Business Rule Extraction** | Documented rules with plain-language descriptions, input/output contracts, edge cases |
| **Data Migration Planning** | Shared database (transitional) to database-per-service (target) strategies |
| **Migration Scripts** | Flyway/Liquibase script generation, rollback procedures, data sync strategies |
| **Integration Testing** | Test stubs verifying functional equivalence between stored proc and microservice |
| **Dependency-Aware Ordering** | Migration sequence that respects procedure interdependencies |

## Usage Examples

Once installed, the skill activates when you ask Gemini to extract stored procedures into services.

### Extract all business logic procedures

```
Extract the stored procedures tagged as COMPLEX_BUSINESS_LOGIC into
Python FastAPI microservices. Generate OpenAPI specs and migration scripts.
```

### Convert a specific procedure to a service

```
Convert the sp_process_order stored procedure into a Spring Boot
microservice with full OpenAPI spec and Flyway migrations.
```

### Generate migration plan only

```
Create a data migration plan for moving the billing stored procedures
to a dedicated microservice database. Include rollback scripts.
```

### Use with stored-proc-analyzer output

```
I already ran the stored procedure analyzer. Now extract the P1 priority
procedures into microservices with integration test stubs.
```

### Target a specific language

```
Convert these T-SQL stored procedures into Java Spring Boot services.
Use Spring Data JPA for data access and generate the OpenAPI spec.
```

## Included References

| File | Description |
|------|-------------|
| **sql-to-code-patterns.md** | Common SQL-to-application-code translation patterns for PL/SQL, T-SQL, and PL/pgSQL, including cursor-to-stream mapping, transaction management, and error handling |
| **openapi-templates.md** | OpenAPI 3.0 skeleton templates, common response schemas, authentication patterns, versioning strategies, and example specs for CRUD and complex operations |

## References

| Resource | Description |
|----------|-------------|
| [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3) | OpenAPI 3.0.3 specification reference |
| [FastAPI Documentation](https://fastapi.tiangolo.com/) | Python FastAPI framework documentation |
| [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/) | Spring Boot framework reference documentation |
| [Flyway Documentation](https://documentation.red-gate.com/flyway) | Flyway database migration tool documentation |
| [Liquibase Documentation](https://docs.liquibase.com/) | Liquibase database migration tool documentation |
| [Strangler Fig Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig) | Microsoft architecture pattern for incremental migration |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/storedproc-to-microservice
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- storedproc-to-microservice
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- storedproc-to-microservice --scope user
```

### Option C: Manual

```bash
cp -r skills/storedproc-to-microservice ~/.gemini/skills/storedproc-to-microservice
```
