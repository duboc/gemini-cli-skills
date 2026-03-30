# Stored Procedure Analyzer

A Gemini CLI skill for parsing and analyzing database stored procedures (PL/SQL, T-SQL, PL/pgSQL) to produce a prioritized modernization inventory.

## What It Does

This skill reads your database schema files, classifies every stored procedure by complexity and business logic density, and generates a modernization priority report:

1. **Schema discovery** — Locates DDL files, migration scripts (Flyway, Liquibase), and schema dumps. Auto-detects SQL dialect from syntax markers.
2. **Semantic tagging** — Classifies each procedure as CRUD_ONLY, DATA_TRANSFORMATION, COMPLEX_BUSINESS_LOGIC, or ORCHESTRATION based on static code analysis.
3. **Complexity scoring** — Scores each procedure 0-100 across six dimensions: line count, JOIN depth, cursor usage, dynamic SQL, cross-schema references, and parameter count.
4. **Telemetry cross-reference** — Maps CPU time, execution frequency, and I/O statistics from DMVs, AWR reports, or pg_stat_statements when available.
5. **Dependency mapping** — Builds call chains, table dependency graphs, and flags deprecated or vendor-specific features.
6. **Priority report** — Generates a structured inventory with a modernization priority matrix and Mermaid dependency diagrams.

## When Does It Activate?

The skill activates when you ask Gemini to analyze stored procedures or inventory database logic. It auto-detects the SQL dialect and proceeds without setup questions.

| Trigger | Example |
|---------|---------|
| Analyze stored procedures | "Analyze all stored procedures in this project" |
| Inventory database logic | "Give me an inventory of all database logic in this codebase" |
| Assess stored proc complexity | "How complex are the stored procedures in our schema?" |
| Prepare for modernization | "We need to move stored procedure logic to application code. Where do we start?" |
| Cross-reference with telemetry | "Which stored procedures are the most expensive? Here are the DMV exports." |
| Classify by dialect | "Parse these SQL files and tell me which are PL/SQL vs T-SQL" |

## Topics Covered

| Area | Details |
|------|---------|
| **Dialect Detection** | Auto-detects PL/SQL (Oracle), T-SQL (SQL Server), and PL/pgSQL (PostgreSQL) from syntax markers |
| **Semantic Classification** | Four-tier tagging: CRUD_ONLY, DATA_TRANSFORMATION, COMPLEX_BUSINESS_LOGIC, ORCHESTRATION |
| **Complexity Scoring** | Weighted 0-100 score across 6 dimensions with detailed breakdowns |
| **Telemetry Mapping** | SQL Server DMVs, Oracle AWR, PostgreSQL pg_stat_statements integration |
| **Dependency Graphs** | Procedure-to-procedure call chains and table/view dependency mapping |
| **Deprecated Features** | Flags vendor-specific syntax that complicates migration (DB links, CLR procs, legacy syntax) |
| **Priority Matrix** | Four-tier modernization prioritization based on complexity + telemetry |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/stored-proc-analyzer
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- stored-proc-analyzer
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- stored-proc-analyzer --scope user
```

### Option C: Manual

```bash
cp -r skills/stored-proc-analyzer ~/.gemini/skills/stored-proc-analyzer
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to analyze stored procedures or database logic.

### Full inventory and prioritization

```
Analyze all stored procedures in this project. Classify them by
complexity and give me a modernization priority report.
```

### Scan and assess without changes

```
Scan the SQL files in db/migration/ and tell me how complex the
stored procedures are. Don't modify anything.
```

### Cross-reference with telemetry data

```
Here are the DMV exports from our SQL Server. Cross-reference with
the stored procedure inventory and flag the hot ones.
```

### Focus on a specific schema

```
Analyze only the stored procedures in the billing schema. Show me
the dependency graph and complexity scores.
```

### Prepare for microservice extraction

```
We want to move stored procedure logic into application services.
Which procedures should we extract first and why?
```

## Included References

| File | Description |
|------|-------------|
| **complexity-scoring.md** | Detailed scoring rubric for each complexity dimension, SQL dialect detection patterns, example classifications for common procedure types, and heuristic thresholds for each tag category |

## References

| Resource | Description |
|----------|-------------|
| [Oracle PL/SQL Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/23/lnpls/) | Oracle PL/SQL language reference |
| [SQL Server T-SQL Reference](https://learn.microsoft.com/en-us/sql/t-sql/language-reference) | Microsoft T-SQL language reference |
| [PostgreSQL PL/pgSQL Documentation](https://www.postgresql.org/docs/current/plpgsql.html) | PostgreSQL procedural language reference |
