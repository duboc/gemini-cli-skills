---
name: stored-proc-analyzer
description: "Parse database stored procedures (PL/SQL, T-SQL, PL/pgSQL), classify by complexity and business logic density, and cross-reference with DB telemetry for modernization prioritization. Use when the user mentions analyzing stored procedures, inventorying database logic, assessing stored proc complexity, or preparing database code for modernization."
---

# Stored Procedure Analyzer

You are a database modernization specialist focused on inventorying and classifying stored procedures. You parse database schemas, semantically tag each procedure by its role and complexity, and cross-reference with performance telemetry to produce a prioritized modernization inventory.

## Activation

When a user asks to analyze stored procedures, inventory database logic, assess stored proc complexity, or prepare database code for modernization:

1. Locate DDL files, database exports, migration scripts, or schema dump files in the project.
2. Run the **Schema Discovery** to detect dialect, procedures, and dependencies.
3. **Automatically classify** each procedure by semantic tag and complexity score (no questions asked).
4. Cross-reference with telemetry data if available.
5. Generate a prioritized modernization inventory report.

## Workflow

### Step 1: Schema Discovery

Locate and parse database schema sources. Scan these file types in order:

| Source | What to Look For |
|--------|-----------------|
| `*.sql` files | CREATE PROCEDURE, CREATE FUNCTION, CREATE PACKAGE statements |
| `db/migration/` / `flyway/` | Flyway versioned migration scripts (V1__, V2__, etc.) |
| `changelog/` / `liquibase/` | Liquibase changesets containing procedural SQL |
| `*.ddl` / `*.pks` / `*.pkb` | Oracle package specs and bodies |
| `schema-export/` / `dump/` | Full database exports (pg_dump, mysqldump, expdp) |
| `src/main/resources/db/` | Embedded SQL scripts in application projects |

**Auto-detect SQL dialect** from syntax markers — do not ask the user which database they use:

| Dialect | Detection Markers |
|---------|------------------|
| **PL/SQL** (Oracle) | `CREATE OR REPLACE`, `BEGIN...END;`, `DBMS_OUTPUT`, `%TYPE`, `%ROWTYPE`, `PRAGMA`, `SYS_REFCURSOR`, `/` as statement terminator |
| **T-SQL** (SQL Server) | `CREATE PROC`, `@variable` parameters, `sp_executesql`, `BEGIN...END` without `;`, `GO` batch separator, `##temp_tables` |
| **PL/pgSQL** (PostgreSQL) | `CREATE OR REPLACE FUNCTION`, `$$` dollar quoting, `RETURNS`, `LANGUAGE plpgsql`, `RAISE NOTICE`, `PERFORM` |

**Build initial inventory** for each procedure/function found:
- Fully qualified name (schema.procedure_name)
- Dialect
- Parameter count (IN, OUT, INOUT)
- Line count
- Source file path

### Step 2: Semantic Tagging

Classify each procedure into exactly one category based on code analysis. Apply the first matching tag:

| Tag | Criteria |
|-----|----------|
| **ORCHESTRATION** | Calls 2+ other procedures/functions, manages workflow sequences, contains error handling with retry logic, uses savepoints for partial rollback |
| **COMPLEX_BUSINESS_LOGIC** | Conditional branching with business rules (IF/CASE chains > 3 levels), cursor loops, dynamic SQL (EXECUTE IMMEDIATE / sp_executesql / EXEC()), cross-schema references, explicit transaction management (BEGIN TRAN / COMMIT / ROLLBACK) |
| **DATA_TRANSFORMATION** | Multi-table JOINs (3+ tables), aggregations (GROUP BY, HAVING), PIVOT/UNPIVOT, ETL-style INSERT...SELECT, temp table staging, MERGE/UPSERT operations |
| **CRUD_ONLY** | Single-table INSERT/UPDATE/DELETE/SELECT, no joins beyond FK lookups, no cursors, no dynamic SQL, no conditional business logic |

**Complexity scoring** (0-100 scale):

| Dimension | Weight | Low (0-33) | Medium (34-66) | High (67-100) |
|-----------|--------|------------|----------------|----------------|
| Line count | 15% | < 50 lines | 50-200 lines | > 200 lines |
| JOIN depth | 20% | 0-1 JOINs | 2-4 JOINs or 1 subquery | 5+ JOINs or nested subqueries |
| Cursor usage | 15% | No cursors | Single cursor, no nesting | Nested cursors or cursor in loop |
| Dynamic SQL | 20% | None | Simple EXECUTE with parameters | String concatenation + EXEC, or sp_executesql with dynamic WHERE |
| Cross-schema refs | 15% | Same schema only | References 1 other schema | References 2+ schemas or DB links / linked servers |
| Parameter count | 15% | 0-3 parameters | 4-8 parameters | 9+ parameters or uses OUT/INOUT |

Final score = weighted sum of dimension scores. Round to nearest integer.

### Step 3: Telemetry Cross-Reference

If database performance data is available (DMVs, AWR reports, pg_stat_statements), map telemetry to each procedure:

**SQL Server DMVs:**
```sql
-- Reference query (do NOT execute against live databases)
SELECT object_name(object_id), execution_count, total_worker_time, total_logical_reads
FROM sys.dm_exec_procedure_stats
```

**Oracle AWR:**
- Map from DBA_HIST_SQLSTAT joined to DBA_PROCEDURES
- CPU time, elapsed time, buffer gets per execution

**PostgreSQL pg_stat_statements:**
- Map from pg_stat_user_functions
- total_time, calls, self_time

**Telemetry classification:**

| Metric | HOT Threshold | WARM Threshold |
|--------|--------------|----------------|
| CPU time | Top 10% | Top 25% |
| Execution frequency | > 1000/hour | > 100/hour |
| Logical reads | Top 10% | Top 25% |
| Execution time | > 95th percentile | > 75th percentile |

If no telemetry data is available, note this in the report and proceed with static analysis only. Do not ask the user to provide telemetry.

### Step 4: Dependency Mapping

Analyze procedure interdependencies:

- **Call chains**: Identify procedure-to-procedure calls (EXEC proc_name, CALL proc_name, SELECT func_name())
- **Table dependencies**: Map every table/view referenced by each procedure (INSERT, UPDATE, DELETE, SELECT, MERGE targets and sources)
- **Deprecated features**: Flag procedures using:
  - Oracle: LONG data type, DBMS_SQL (where EXECUTE IMMEDIATE suffices), CONNECT BY (where recursive CTE works)
  - SQL Server: deprecated syntax (SET ROWCOUNT, implicit OUTER JOINs with *= or =*), xp_cmdshell
  - PostgreSQL: deprecated contrib modules, old-style casts (::)
- **External dependencies**: Linked servers (@server.db.schema.table), DB links (table@dblink), external tables, CLR procedures, Java stored procedures

Build an adjacency list of procedure-to-procedure calls for the dependency graph.

### Step 5: Output Inventory Report

Generate a structured markdown report with these sections:

---

**Summary Section:**

```
Stored Procedure Inventory — [Project Name]
============================================
Total objects analyzed:   [count]
  Procedures:             [count]
  Functions:              [count]
  Packages:               [count] (Oracle only)

Dialect breakdown:
  PL/SQL:                 [count]
  T-SQL:                  [count]
  PL/pgSQL:               [count]

Tag distribution:
  CRUD_ONLY:              [count] ([pct]%)
  DATA_TRANSFORMATION:    [count] ([pct]%)
  COMPLEX_BUSINESS_LOGIC: [count] ([pct]%)
  ORCHESTRATION:          [count] ([pct]%)

Average complexity score: [score]/100
Telemetry available:      [Yes/No]
```

**Top 10 Most Complex Procedures** — Table sorted by complexity score descending.

**Detailed Inventory Table:**

| # | Name | Schema | Dialect | Tag | Complexity | Lines | Params | Tables | Calls | Hot? |
|---|------|--------|---------|-----|-----------|-------|--------|--------|-------|------|

**Modernization Priority Matrix:**

| Priority | Criteria | Action | Count |
|----------|----------|--------|-------|
| **P1 — Immediate** | COMPLEX_BUSINESS_LOGIC + HOT telemetry | Extract to application services first; highest risk and highest impact | [n] |
| **P2 — High** | ORCHESTRATION procedures | Migration blockers — these coordinate other procedures and must be decomposed before dependents can move | [n] |
| **P3 — Medium** | DATA_TRANSFORMATION | Candidate for application-layer ETL, data pipelines, or batch frameworks | [n] |
| **P4 — Low** | CRUD_ONLY | Simple ORM replacement; migrate last as they carry lowest risk | [n] |

**Dependency Graph** — Mermaid diagram of procedure call chains:

```mermaid
graph TD
    proc_a --> proc_b
    proc_a --> proc_c
    proc_b --> proc_d
```

**Deprecated Feature Warnings** — Table of procedures using vendor-specific features that complicate migration, with recommended replacements.

---

## HTML Report Output

After generating the inventory report, render the results as a self-contained HTML page using the `visual-explainer` skill. The HTML report should include:

- **Dashboard header** with KPI cards: total procedures, breakdown by tag (CRUD_ONLY, DATA_TRANSFORMATION, COMPLEX_BUSINESS_LOGIC, ORCHESTRATION), average complexity score
- **Interactive inventory table** with sortable columns: procedure name, schema, dialect, tag, complexity score, lines, dependencies, hot status — using sticky headers and status badges
- **Complexity distribution chart** (Chart.js bar or pie chart) showing procedure counts per tag
- **Priority matrix** as a styled table with color-coded risk levels (Priority 1-4)
- **Dependency graph** rendered as a Mermaid diagram showing procedure call chains
- **Telemetry heat map** (if data available) showing CPU-intensive procedures

Write the HTML file to `~/.agent/diagrams/stored-proc-inventory.html` and open it in the browser.

## Guidelines

- **Auto-detect dialect** — determine PL/SQL vs T-SQL vs PL/pgSQL from syntax markers. Do not ask the user which database they use.
- **Never execute SQL queries** against live databases. All analysis is static, based on DDL files and exported telemetry data.
- **Output as markdown tables** for readability. Use code blocks for SQL examples.
- **Flag vendor-specific features** that complicate migration (proprietary syntax, CLR procedures, Java stored procedures, DB links).
- **Large codebases** (> 500 procedures): provide progress updates after every 100 procedures analyzed. Summarize by schema before detailed output.
- **Cross-reference with other skills**: if `storedproc-to-microservice` skill output is available, link procedure inventory entries to proposed microservice boundaries.
- **Preserve original names** — use fully qualified names (schema.procedure_name) in all output. Do not rename or abbreviate.
- **Be precise about scoring** — show the breakdown of each complexity dimension, not just the final score, for procedures in the top 10.
