# Gemini CLI Skills

A collection of reusable skills for [Gemini CLI](https://github.com/google-gemini/gemini-cli). Each skill is self-contained and can be installed independently.

## Available Skills

| Skill | Description | Install |
|-------|-------------|---------|
| [software-troubleshooter](skills/software-troubleshooter/) | Structured code inspection and troubleshooting with diagnostic reports | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- software-troubleshooter` |
| [adk-developer](skills/adk-developer/) | Build single-agent and multi-agent systems with Google's ADK (Python, Java, Go, TypeScript) | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- adk-developer` |
| [agent-engine-deploy](skills/agent-engine-deploy/) | Deploy, manage, and query ADK agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-deploy` |
| [agent-engine-sessions-memory](skills/agent-engine-sessions-memory/) | Manage sessions and long-term memory for agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-sessions-memory` |
| [agent-engine-ops](skills/agent-engine-ops/) | Monitor, trace, secure, and evaluate agents on Vertex AI Agent Engine | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- agent-engine-ops` |
| [zen-presenter](skills/zen-presenter/) | Generate MARP presentation decks following Presentation Zen principles with interactive design consultation and PowerPoint export via HTML | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- zen-presenter` |
| [marp-to-slides](skills/marp-to-slides/) | Convert MARP Markdown presentations to Google Slides with Google brand colors and Material Design conventions | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- marp-to-slides` |
| [ai-studio-architect](skills/ai-studio-architect/) | Convert AI Studio Build mode prototypes to production on GCP with auto-generated infrastructure scripts | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- ai-studio-architect` |
| [clarity-presenter](skills/clarity-presenter/) | Generate MARP decks using SCQA narrative + assertion-evidence design with dual-perspective slides and PowerPoint export via HTML | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- clarity-presenter` |
| [developer-growth-analysis](skills/developer-growth-analysis/) | Analyze Gemini CLI session history to surface development patterns, friction points, and growth opportunities with curated resources | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- developer-growth-analysis` |
| [google-ads-funnel](skills/google-ads-funnel/) | Funnel-as-Code workflows for Google Ads account audits, spend analysis, creative testing, and conversion diagnostics via the Ads API | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- google-ads-funnel` |
| [using-git-worktrees](skills/using-git-worktrees/) | Create isolated git worktrees with smart directory selection, gitignore safety checks, dependency setup, and baseline test verification | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- using-git-worktrees` |
| [webapp-testing](skills/webapp-testing/) | Toolkit for testing local web applications using Playwright with server lifecycle management, screenshots, and console log capture | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- webapp-testing` |
| [writing-plans](skills/writing-plans/) | Generate detailed TDD implementation plans with atomic tasks, exact file paths, and complete code before writing any code | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- writing-plans` |
| [spring-boot-upgrader](skills/spring-boot-upgrader/) | Migrate Spring Boot applications to 4.0 with auto-detected migration paths, phased upgrade plans, and Jackson 3 migration | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- spring-boot-upgrader` |
| [ux-copywriter](skills/ux-copywriter/) | Write effective, accessible, and conversion-optimized microcopy for user interfaces | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- ux-copywriter` |
| [design-system-management](skills/design-system-management/) | Manage design tokens, component libraries, and pattern documentation for scalable, consistent UIs | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- design-system-management` |
| [design-critique](skills/design-critique/) | Evaluate designs for usability, visual hierarchy, consistency, and adherence to design principles | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- design-critique` |
| [feature-spec](skills/feature-spec/) | Write structured product requirements documents (PRDs) with problem statements, user stories, requirements, and success metrics | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- feature-spec` |
| [system-design](skills/system-design/) | Design systems, services, and architectures with explicit trade-off analysis | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- system-design` |
| [documentation](skills/documentation/) | Write and maintain technical documentation, READMEs, API docs, runbooks, and architecture docs | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- documentation` |
| [visual-explainer](skills/visual-explainer/) | Generate beautiful, self-contained HTML pages that visually explain systems, code changes, plans, and data | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- visual-explainer` |

### App Modernization

Skills for assessing, mapping, and modernizing legacy enterprise applications across four phases.

#### Phase 1: Component Inventory

| Skill | Description | Install |
|-------|-------------|---------|
| [stored-proc-analyzer](skills/stored-proc-analyzer/) | Parse database stored procedures (PL/SQL, T-SQL), classify by complexity, and cross-reference with DB telemetry | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- stored-proc-analyzer` |
| [esb-cataloger](skills/esb-cataloger/) | Ingest ESB configurations to produce a consumer/producer matrix by payload and protocol | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- esb-cataloger` |
| [batch-app-scanner](skills/batch-app-scanner/) | Catalog EJB/Spring Batch jobs, map schedules, and flag outdated dependencies | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- batch-app-scanner` |
| [monolith-sbom](skills/monolith-sbom/) | Build a software bill of materials flagging deprecated stacks and EOL components | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- monolith-sbom` |

#### Phase 2: Dependency & Flow Mapping

| Skill | Description | Install |
|-------|-------------|---------|
| [dependency-flow-mapper](skills/dependency-flow-mapper/) | Trace sync/async execution paths, detect shared databases, and build dependency graphs | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- dependency-flow-mapper` |
| [esb-routing-extractor](skills/esb-routing-extractor/) | Deep-extract ESB routing logic separating transparent routing from embedded business rules | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- esb-routing-extractor` |

#### Phase 3: Business & Risk Identification

| Skill | Description | Install |
|-------|-------------|---------|
| [business-risk-assessor](skills/business-risk-assessor/) | Correlate transaction volumes with code complexity and churn to prioritize modernization targets | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- business-risk-assessor` |
| [dead-code-detector](skills/dead-code-detector/) | Cross-reference static analysis with production execution data to flag zero-hit components | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- dead-code-detector` |

#### Phase 4: Target Architecture

| Skill | Description | Install |
|-------|-------------|---------|
| [esb-to-event-driven](skills/esb-to-event-driven/) | Design event-driven replacements for ESB integrations using Pub/Sub or Kafka | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- esb-to-event-driven` |
| [batch-to-serverless](skills/batch-to-serverless/) | Draft Cloud Run, K8s CronJob, and serverless configs to replace legacy batch applications | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- batch-to-serverless` |
| [storedproc-to-microservice](skills/storedproc-to-microservice/) | Extract stored procedure logic into microservices with OpenAPI specs and migration plans | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- storedproc-to-microservice` |

#### Orchestration

| Skill | Description | Install |
|-------|-------------|---------|
| [app-modernization-orchestrator](skills/app-modernization-orchestrator/) | Orchestrate the full modernization lifecycle across all 4 phases, coordinating 11 skills with state management and executive dashboards | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- app-modernization-orchestrator` |

### Database Migration (Sybase to Cloud Spanner)

Skills for migrating legacy Sybase ASE/IQ databases to Cloud Spanner and BigQuery in financial enterprise environments.

#### Phase 1: Sybase Inventory & Discovery

| Skill | Description | Install |
|-------|-------------|---------|
| [sybase-tsql-analyzer](skills/sybase-tsql-analyzer/) | Parse Sybase T-SQL stored procedures, classify by complexity, and flag Spanner-incompatible constructs | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-tsql-analyzer` |
| [sybase-schema-profiler](skills/sybase-schema-profiler/) | Profile Sybase schemas, data types, and indexes to assess Spanner conversion complexity and hotspot risks | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-schema-profiler` |
| [sybase-replication-mapper](skills/sybase-replication-mapper/) | Catalog Replication Server configs and topology to design Change Streams and Pub/Sub replacements | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-replication-mapper` |
| [sybase-integration-cataloger](skills/sybase-integration-cataloger/) | Catalog Open Client/Server, JDBC, PowerBuilder, Crystal Reports, MQ, and FIX/SWIFT connections | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-integration-cataloger` |

#### Phase 2: Data Flow & Dependency Mapping

| Skill | Description | Install |
|-------|-------------|---------|
| [sybase-data-flow-mapper](skills/sybase-data-flow-mapper/) | Trace cross-database references, proxy table federations, and batch ETL chains for migration ordering | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-data-flow-mapper` |
| [sybase-transaction-analyzer](skills/sybase-transaction-analyzer/) | Analyze transaction patterns, isolation levels, and locking behavior for Spanner transaction strategy | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-transaction-analyzer` |
| [sybase-performance-profiler](skills/sybase-performance-profiler/) | Profile query performance from MDA tables to design Spanner indexes and read/write split strategies | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-performance-profiler` |

#### Phase 3: Risk & Scope Reduction

| Skill | Description | Install |
|-------|-------------|---------|
| [sybase-dead-component-detector](skills/sybase-dead-component-detector/) | Identify unused Sybase objects safe for migration exclusion with financial domain preservation rules | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-dead-component-detector` |
| [sybase-analytics-assessor](skills/sybase-analytics-assessor/) | Assess OLTP vs analytics workloads to recommend Spanner/BigQuery split strategy | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-analytics-assessor` |

#### Phase 4: Spanner Target Architecture

| Skill | Description | Install |
|-------|-------------|---------|
| [sybase-to-spanner-schema-designer](skills/sybase-to-spanner-schema-designer/) | Design Spanner schema with interleaved tables, bit-reversed keys, Change Streams, and optimized DDL | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-to-spanner-schema-designer` |
| [tsql-to-application-extractor](skills/tsql-to-application-extractor/) | Extract T-SQL business logic into Cloud Run microservices with Spanner client libs and saga patterns | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- tsql-to-application-extractor` |

#### Orchestration

| Skill | Description | Install |
|-------|-------------|---------|
| [sybase-spanner-migration-orchestrator](skills/sybase-spanner-migration-orchestrator/) | Orchestrate the full Sybase-to-Spanner migration lifecycle across 4 phases, coordinating 11 skills with compliance gates and executive dashboards | `curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh \| bash -s -- sybase-spanner-migration-orchestrator` |

## Installation

### Method 1: Gemini CLI native install

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/<skill-name>
```

Example:

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/software-troubleshooter
```

### Method 2: One-liner with curl

The install script downloads only the requested skill from GitHub (no git clone needed).

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- <skill-name>
```

By default, skills install to the **workspace** scope (`.gemini/skills/<name>/` in your current directory). To install for your user profile instead:

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- <skill-name> --scope user
```

### Method 3: Manual download

1. Download or clone this repository.
2. Copy the desired skill folder into your Gemini skills directory:
   ```bash
   cp -r skills/software-troubleshooter ~/.gemini/skills/software-troubleshooter
   ```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on creating and submitting new skills.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
