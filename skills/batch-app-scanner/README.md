# Batch Application Scanner

A Gemini CLI skill for scanning and cataloging Java batch applications. Discovers EJB and Spring Batch jobs, maps cron schedules, audits dependencies, and assesses modernization readiness.

## What It Does

This skill scans your Java project to produce a comprehensive inventory of all batch jobs:

1. **Project discovery** — Detects batch frameworks (Spring Batch, EJB Timer, Quartz, JSR-352) from build files, annotations, XML descriptors, and scheduler configs.
2. **Job cataloging** — Extracts job name, framework, trigger type, schedule, inputs/outputs, and restart/recovery configuration for every batch job found.
3. **Dependency audit** — Flags outdated libraries, known CVE patterns, EOL frameworks, and app-server-specific ties.
4. **Schedule analysis** — Parses cron expressions to human-readable format, builds a daily timeline, identifies conflicts and batch chains.
5. **Modernization readiness** — Classifies each job as READY, NEEDS_WORK, or COMPLEX for cloud migration (e.g., Cloud Run Jobs).

## When Does It Activate?

The skill activates when you ask Gemini to scan, inventory, or audit batch applications.

| Trigger | Example |
|---------|---------|
| Inventory batch jobs | "List all batch jobs in this project" |
| Audit scheduled tasks | "What scheduled tasks are configured in this application?" |
| Scan batch applications | "Scan this codebase for batch processing jobs" |
| Assess modernization | "How ready are our batch jobs for cloud migration?" |
| Dependency audit | "Check our batch job dependencies for outdated libraries" |
| Schedule mapping | "Map out the daily batch schedule for this application" |

## Topics Covered

| Area | Details |
|------|---------|
| **Spring Batch** | `@EnableBatchProcessing`, Job/Step beans, chunk-oriented processing, tasklets |
| **EJB Timers** | `@Schedule`, `@Timeout`, `ejb-jar.xml`, `@MessageDriven` |
| **Quartz Scheduler** | `quartz.properties`, `quartz-jobs.xml`, `@Scheduled` cron and fixed-rate |
| **JSR-352 (javax.batch)** | `batch.xml`, job XML definitions, `jakarta.batch` migration |
| **Enterprise Schedulers** | Control-M definitions, Autosys JIL files, CA7 job cards |
| **Dependency Audit** | EOL detection, CVE pattern matching, framework age assessment |
| **Schedule Analysis** | Cron parsing, timeline generation, conflict detection, chain mapping |
| **Modernization** | Cloud Run Jobs readiness, containerization assessment, refactoring scope |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/batch-app-scanner
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- batch-app-scanner
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- batch-app-scanner --scope user
```

### Option C: Manual

```bash
cp -r skills/batch-app-scanner ~/.gemini/skills/batch-app-scanner
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to scan or audit batch jobs.

### Full batch inventory

```
Scan this project and list every batch job with its schedule,
framework, and dependencies.
```

### Modernization assessment

```
Assess our batch jobs for cloud migration readiness. Flag anything
that needs refactoring before moving to Cloud Run Jobs.
```

### Schedule audit

```
Map out the daily batch schedule for this application. Identify
any time conflicts or missing schedules.
```

### Dependency risk check

```
Check all batch job dependencies for outdated or vulnerable
libraries. Flag anything that needs immediate attention.
```

## Included References

| File | Description |
|------|-------------|
| **batch-framework-patterns.md** | Detection heuristics for Spring Batch, EJB Timer, Quartz, JSR-352, Control-M, and Autosys. Includes config file patterns, cron expression format reference, and framework version detection from dependency versions. |
