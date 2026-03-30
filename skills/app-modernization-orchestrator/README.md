# App Modernization Orchestrator

A Gemini CLI skill that acts as the master orchestrator for the entire enterprise application modernization process. It guides teams through all 4 phases — inventory, dependency mapping, risk assessment, and target architecture design — by invoking 11 specialized skills in the correct order, managing state between phases, and producing a unified migration plan with executive dashboards.

## What It Does

This skill coordinates the full assessment-to-architecture pipeline:

1. **Intake & scoping** — Gathers application context, defines scope, and selects which specialized skills to invoke based on the technology landscape.
2. **Phase 1: Component inventory** — Runs inventory skills in parallel to catalog stored procedures, ESB integrations, batch jobs, and monolith components.
3. **Phase 2: Dependency mapping** — Traces execution paths, detects shared database anti-patterns, and classifies ESB routing rules.
4. **Phase 3: Risk assessment** — Correlates business value with technical complexity, identifies dead code, and establishes modernization priorities.
5. **Phase 4: Target architecture** — Designs event-driven, serverless, and microservice replacements for legacy components.
6. **Unified plan & dashboard** — Synthesizes all phase outputs into an executive-ready migration plan and interactive HTML dashboard.

## When Does It Activate?

The skill activates when you ask Gemini to orchestrate a full application modernization effort.

| Trigger | Example |
|---------|---------|
| Modernize application | "Modernize this application end-to-end" |
| Full migration assessment | "Run a full migration assessment on this system" |
| Orchestrate modernization | "Orchestrate the modernization of our legacy platform" |
| Legacy transformation | "Start a legacy system transformation for this application" |
| Cloud migration assessment | "Assess this system for cloud migration" |
| End-to-end migration | "Plan an end-to-end migration from our monolith to microservices" |

## Topics Covered

| Area | Details |
|------|---------|
| **Orchestration** | Coordinating 11 specialized skills across 4 sequential phases with dependency management |
| **Phase Management** | Phase gates, verification checklists, synthesis between phases, scope adjustments |
| **Migration Planning** | Unified migration roadmap with sequencing, dependencies, parallel workstreams, rollback strategies |
| **Executive Dashboards** | Self-contained HTML dashboard with KPI cards, architecture diagrams, risk quadrants, cost comparisons |
| **State Management** | Resumable orchestration via `modernization-state.json`, tracking completed and pending skills |
| **Skill Coordination** | Dynamic skill selection based on scope, feeding outputs between phases, parallel execution |

## Coordinated Skills

This orchestrator delegates work to 11 specialized skills:

| Phase | Skill | Purpose |
|-------|-------|---------|
| 1 - Inventory | `stored-proc-analyzer` | Parse and classify database stored procedures |
| 1 - Inventory | `esb-cataloger` | Catalog ESB integrations and consumer matrices |
| 1 - Inventory | `batch-app-scanner` | Inventory batch jobs, schedules, and dependencies |
| 1 - Inventory | `monolith-sbom` | Build software bill of materials, flag EOL components |
| 2 - Mapping | `dependency-flow-mapper` | Trace execution paths, detect shared databases, map batch chains |
| 2 - Mapping | `esb-routing-extractor` | Separate transparent routing from embedded business rules |
| 3 - Risk | `business-risk-assessor` | Correlate business value, complexity, and code churn |
| 3 - Risk | `dead-code-detector` | Identify zero-hit components safe for removal |
| 4 - Target | `esb-to-event-driven` | Design event-driven replacements for ESB integrations |
| 4 - Target | `batch-to-serverless` | Draft Cloud Run/K8s configs for batch job migration |
| 4 - Target | `storedproc-to-microservice` | Extract stored proc logic into microservices with OpenAPI specs |

## Phase Workflow

```
Step 0: Intake & Scoping
    |
    v
Step 1: Phase 1 — Component Inventory (parallel)
    |  stored-proc-analyzer | esb-cataloger | batch-app-scanner | monolith-sbom
    |  [Phase Gate: inventories complete, no data gaps]
    v
Step 2: Phase 2 — Dependency Mapping (sequential from Phase 1)
    |  dependency-flow-mapper | esb-routing-extractor
    |  [Phase Gate: full dependency graph, shared DBs identified]
    v
Step 3: Phase 3 — Risk Assessment (sequential from Phase 1+2)
    |  business-risk-assessor | dead-code-detector
    |  [Phase Gate: core domains identified, dead code flagged]
    v
Step 4: Phase 4 — Target Architecture (parallel, from Phase 1-3)
    |  esb-to-event-driven | batch-to-serverless | storedproc-to-microservice
    |  [Phase Gate: target covers all in-scope components]
    v
Step 5: Unified Migration Plan
    v
Step 6: Executive Dashboard (HTML)
```

## Output Artifacts

| Artifact | Description |
|----------|-------------|
| `modernization-scope.md` | Intake scoping document defining what is in scope and which skills to run |
| `phase-1-summary.md` | Consolidated inventory of all discovered components and early risk flags |
| `phase-2-summary.md` | Architecture topology, coupling points, batch critical path, trapped business logic |
| `phase-3-summary.md` | Core domain modules, dead code removal plan, module priority ranking |
| `phase-4-summary.md` | Target architecture designs for event-driven, serverless, and microservice components |
| `modernization-plan.md` | Unified executive-ready migration plan with roadmap, quick wins, and risk register |
| `modernization-dashboard.html` | Interactive HTML dashboard with KPI cards, diagrams, timelines, and cost comparisons |
| `modernization-state.json` | Orchestration state file for resuming interrupted sessions |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/app-modernization-orchestrator
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- app-modernization-orchestrator
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- app-modernization-orchestrator --scope user
```

### Option C: Manual

```bash
cp -r skills/app-modernization-orchestrator ~/.gemini/skills/app-modernization-orchestrator
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to orchestrate a modernization effort.

### Full modernization assessment

```
Modernize this application end-to-end. Run all four phases and
produce a unified migration plan with an executive dashboard.
```

### Scoped assessment

```
Assess this system for cloud migration. We have stored procedures
and batch jobs but no ESB. Focus on those components.
```

### Resume interrupted session

```
Resume the modernization assessment for our order management system.
Pick up from where we left off.
```

### Quick wins only

```
Run a quick modernization scan. Identify dead code to remove and
simple batch jobs we can containerize immediately.
```

## Included References

| File | Description |
|------|-------------|
| **orchestration-checklist.md** | Pre-assessment intake questionnaire, phase gate criteria, skill selection decision matrix, common scope patterns, timeline estimation guidelines, stakeholder communication templates, and risk escalation criteria. |
| **migration-patterns.md** | Common enterprise migration patterns (strangler fig, branch by abstraction, parallel run), sequencing strategies, distributed transaction handling, data migration approaches, rollback planning, team topology recommendations, and success metrics. |
