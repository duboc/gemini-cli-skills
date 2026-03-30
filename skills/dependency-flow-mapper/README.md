# Dependency & Flow Mapper

A Gemini CLI skill for tracing execution paths and building dependency graphs across distributed systems. Detects shared database anti-patterns, maps batch processing chains, and assesses coupling risks to support application modernization.

## What It Does

This skill analyzes your codebase to map the actual architecture of distributed systems:

1. **Call pattern analysis** — Scans for synchronous (REST, gRPC, SOAP, JDBC, RMI) and asynchronous (JMS, Kafka, RabbitMQ, Pub/Sub, file-based) communication patterns across all applications.
2. **Dependency graph construction** — Builds a directed graph of all inter-application dependencies with protocol labels, sync/async classification, and coupling risk flags.
3. **Shared database detection** — Identifies the "integration database" anti-pattern by finding tables accessed by multiple applications and classifying read/write/owner access patterns.
4. **Batch chain mapping** — Traces nightly/periodic batch sequences, builds the critical path, and flags parallelization opportunities.
5. **Modernization assessment** — Ranks coupling risks, identifies blockers, and recommends a decoupling sequence for service extraction.

## When Does It Activate?

The skill activates when you ask Gemini to map dependencies, trace execution flows, or analyze coupling between applications.

| Trigger | Example |
|---------|---------|
| Map dependencies | "Map all dependencies between our microservices" |
| Trace execution flows | "Trace the execution flow for order processing across services" |
| Find shared databases | "Which databases are shared across application boundaries?" |
| Build dependency graph | "Build a dependency graph for this distributed system" |
| Analyze coupling | "Analyze the coupling between our applications and flag risks" |
| Map batch chains | "Map the nightly batch processing chain and find the critical path" |

## Topics Covered

| Area | Details |
|------|---------|
| **Synchronous Dependencies** | HTTP/REST, gRPC, JDBC direct access, RMI/RPC, SOAP/WSDL detection |
| **Asynchronous Dependencies** | JMS, Kafka, RabbitMQ, Pub/Sub, event emitters, file-based integration |
| **Shared Database Detection** | Connection string parsing, JNDI lookups, ORM config analysis, read/write/owner classification |
| **Batch Chain Analysis** | Scheduler config parsing (Control-M, Autosys, cron, Quartz, Spring Batch), critical path, parallelization |
| **Coupling Assessment** | Circular dependencies, synchronous chain depth, single points of failure, fan-out patterns |
| **Dependency Graphs** | Mermaid diagram generation with SYNC/ASYNC edge labels and risk annotations |
| **Modernization Blockers** | Dependencies that must be resolved before service extraction |
| **Decoupling Strategy** | Recommended sequence for breaking dependencies safely |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/dependency-flow-mapper
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- dependency-flow-mapper
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- dependency-flow-mapper --scope user
```

### Option C: Manual

```bash
cp -r skills/dependency-flow-mapper ~/.gemini/skills/dependency-flow-mapper
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to map dependencies or analyze coupling.

### Full dependency map

```
Map all dependencies between applications in this repository.
Show me a dependency graph with sync and async communication labeled.
```

### Shared database audit

```
Scan all applications for shared database access. Flag any tables
that are written to by more than one application.
```

### Batch chain analysis

```
Trace the nightly batch processing chain. Show the critical path
and identify jobs that could run in parallel.
```

### Coupling risk assessment

```
Analyze coupling between our services. Flag circular dependencies,
synchronous chains deeper than 3 hops, and single points of failure.
```

## Included References

| File | Description |
|------|-------------|
| **coupling-patterns.md** | Catalog of coupling anti-patterns (integration database, synchronous chains, shared libraries, distributed monolith) with detection heuristics, risk scoring, recommended decoupling strategies, and Mermaid diagram examples. |
