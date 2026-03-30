# Dead Code Detector

A Gemini CLI skill for identifying unused components, zero-hit endpoints, and dead code safe for removal. Cross-references static codebase analysis with production execution data to confidently flag components that can be safely deleted, reducing migration scope and maintenance burden.

## What It Does

This skill performs forensic analysis on your codebase to find code that is no longer used:

1. **Static inventory** -- Builds a complete catalog of all addressable components: classes, endpoints, scheduled jobs, message listeners, stored procedures, UI components, and configuration classes.
2. **Reference analysis** -- Traces import chains, call graphs, dependency injection wiring, and configuration references to determine which components are actually referenced.
3. **Production correlation** -- Cross-references static findings with APM data, access logs, scheduler logs, and message broker metrics to identify zero-hit components.
4. **Confidence scoring** -- Rates each candidate as HIGH, MEDIUM, or LOW confidence based on combined static and runtime evidence.
5. **Removal plan** -- Produces a dependency-ordered removal sequence with effort estimates and impact assessment.

## When Does It Activate?

The skill activates when you ask Gemini to find dead code, identify unused components, or clean up a codebase before migration.

| Trigger | Example |
|---------|---------|
| Find dead code | "Find all dead code in this project" |
| Identify unused components | "Which classes and endpoints in this codebase are never used?" |
| Flag zero-hit modules | "Flag any modules with zero hits in production" |
| Clean up unused code | "Help me clean up unused code before we migrate" |
| Trim legacy codebase | "Trim this legacy codebase -- what can we safely remove?" |
| Pre-migration scope reduction | "We're migrating to Spring Boot 4. What dead code can we drop first?" |

## Topics Covered

| Area | Details |
|------|---------|
| **Component Inventory** | Classes, modules, public methods, REST/SOAP endpoints, scheduled jobs, message listeners, stored procedures, ESB routes, configuration classes, UI components |
| **Reference Tracing** | Import chains, method call graphs, DI wiring (`@Autowired`, `@Inject`, XML beans), configuration references |
| **Indirect References** | Reflection (`Class.forName`, `Method.invoke`), dynamic proxies, service locators, string-based bean references, convention-over-configuration |
| **Framework Patterns** | Spring profiles and conditional beans, feature flag libraries (LaunchDarkly, Unleash, Togglz), SPI/plugin architectures |
| **Production Data** | APM hit counts (New Relic, Datadog, Dynatrace), access logs, application logs, database audit logs, message broker metrics, scheduler logs |
| **Confidence Scoring** | HIGH (no refs + no hits), MEDIUM (no hits but has refs), LOW (suspicious patterns), EXCLUDE (test/build tooling) |
| **Removal Planning** | Dependency-ordered removal sequence, batch grouping by module, effort estimates, build/test impact assessment |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/dead-code-detector
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- dead-code-detector
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- dead-code-detector --scope user
```

### Option C: Manual

```bash
cp -r skills/dead-code-detector ~/.gemini/skills/dead-code-detector
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to find dead code or identify unused components.

### Full dead code scan

```
Scan this project for dead code. Build an inventory of all components
and flag anything with zero references.
```

### Pre-migration cleanup

```
We're planning a migration to cloud-native microservices. Identify all
dead code we can remove first to reduce migration scope.
```

### Cross-reference with production data

```
Here are our last 12 months of access logs and APM data. Cross-reference
with the codebase to find zero-hit endpoints and unused classes.
```

### Targeted module analysis

```
Analyze the payments module for dead code. Check for unused endpoints,
orphaned service classes, and unreferenced configuration beans.
```

### Safe removal plan

```
Generate a removal plan for all HIGH-confidence dead code. Order by
dependency so we can remove leaf nodes first without breaking anything.
```

## Included References

| File | Description |
|------|-------------|
| **dead-code-heuristics.md** | Framework-specific dead code patterns, reflection detection per language, feature flag library detection, seasonal code heuristics, and common false positive patterns |

## Related Skills

| Skill | Relationship |
|-------|-------------|
| **monolith-sbom** | Use SBOM output to understand the full dependency tree before removing dead code |
| **batch-app-scanner** | Cross-reference batch job inventory with dead code findings to avoid removing scheduled-but-active jobs |
| **esb-cataloger** | Cross-reference ESB integration catalog to avoid flagging ESB-invoked components as dead |
| **stored-proc-analyzer** | Cross-reference stored procedure analysis with dead code findings for database-layer cleanup |
| **spring-boot-upgrader** | Remove dead code before starting a Spring Boot upgrade to reduce migration scope |
