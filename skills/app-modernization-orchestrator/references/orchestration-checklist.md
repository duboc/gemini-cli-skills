# Orchestration Checklist Reference

Comprehensive checklist for orchestrating enterprise application modernization across all four phases.

## Pre-Assessment Intake Questionnaire

Use this questionnaire during Step 0 (Intake & Scoping) to gather the information needed to scope the modernization effort and select the right skills.

### Application Identity

1. What is the application name and version?
2. What is its primary business function? (e.g., order management, claims processing, payroll)
3. Which business unit or team owns the application?
4. How many active users does it serve? (internal, external, or both)
5. What is the annual revenue or cost associated with this application?

### Technology Stack

6. What programming languages and versions are used? (e.g., Java 8, COBOL, C#/.NET 4.5)
7. What application frameworks are in use? (e.g., Spring Boot 2.x, EJB 3.1, Struts 1.x)
8. What databases are used? (e.g., Oracle 12c, SQL Server 2016, DB2, PostgreSQL)
9. How many stored procedures, functions, and triggers exist in the database?
10. Is there an Enterprise Service Bus? If so, which product and version? (e.g., MuleSoft, IBM IIB, TIBCO, Oracle SOA Suite)
11. Are there batch processing jobs? What schedulers are used? (e.g., Control-M, Autosys, cron, Spring Batch, Quartz)
12. What application servers are in use? (e.g., WebSphere, WebLogic, JBoss, Tomcat)
13. What message brokers or event systems are present? (e.g., IBM MQ, Kafka, RabbitMQ, ActiveMQ)

### Current State

14. Where is the application deployed today? (on-premises, colocation, private cloud, hybrid)
15. Is the application containerized or virtualized? (Docker, VMware, bare metal)
16. What CI/CD pipelines exist? (Jenkins, GitLab CI, Azure DevOps, none)
17. What monitoring and observability tools are in place? (APM, logging, tracing)
18. When was the last major release? How frequently are changes deployed?

### Data & Integration

19. How many external systems does this application integrate with?
20. Are there shared databases accessed by multiple applications?
21. What data volumes are processed? (transactions per day, batch record counts, storage size)
22. Are there regulatory or compliance requirements for data handling? (PCI-DSS, HIPAA, SOX, GDPR)

### Constraints & Goals

23. What is the target timeline for modernization? (3 months, 6 months, 12 months, 18+ months)
24. What is the available budget range? (order of magnitude)
25. What team expertise is available? (cloud-native experience, microservices, Kubernetes, event-driven)
26. Are there business-critical windows to avoid? (quarter-end, tax season, peak sales)
27. What does "modernized" mean for this organization? (cloud-native, containerized, decomposed, replatformed, retired)
28. Are there any vendor lock-in concerns or preferred cloud providers?

## Phase Gate Criteria

### Phase 1 to Phase 2 Gate

All of the following must be true before proceeding to Phase 2:

- [ ] All applicable Phase 1 skills have completed successfully
- [ ] Stored procedure inventory is complete (if in scope) with complexity scores assigned
- [ ] ESB integration catalog is complete (if in scope) with consumer/producer matrix
- [ ] Batch job catalog is complete (if in scope) with schedules and dependencies
- [ ] SBOM is generated with EOL components flagged
- [ ] No critical data gaps identified (if gaps exist, document them and assess impact)
- [ ] Component counts are validated against known system documentation
- [ ] Phase 1 summary document is saved to `phase-1-summary.md`
- [ ] `modernization-state.json` is updated with Phase 1 completion status

### Phase 2 to Phase 3 Gate

All of the following must be true before proceeding to Phase 3:

- [ ] Dependency graph covers all components discovered in Phase 1
- [ ] Shared database anti-patterns are identified and documented
- [ ] Synchronous and asynchronous dependencies are classified
- [ ] ESB routes are classified as pass-through vs. business-logic-bearing (if in scope)
- [ ] Batch processing chains are mapped with critical path identified
- [ ] No orphan components exist (every component connects to at least one other)
- [ ] Circular dependencies are flagged
- [ ] Phase 2 summary document is saved to `phase-2-summary.md`
- [ ] `modernization-state.json` is updated with Phase 2 completion status

### Phase 3 to Phase 4 Gate

All of the following must be true before proceeding to Phase 4:

- [ ] Core domain modules are identified (top 5-10 by business value)
- [ ] All modules have risk quadrant assignments (value vs. complexity)
- [ ] Dead code inventory is complete with removal recommendations
- [ ] Scope reduction from dead code removal is quantified
- [ ] Modernization priority sequence is established
- [ ] High-risk modules have mitigation strategies documented
- [ ] Phase 3 summary document is saved to `phase-3-summary.md`
- [ ] `modernization-state.json` is updated with Phase 3 completion status

### Phase 4 Completion Gate

All of the following must be true before producing the unified plan:

- [ ] Target architecture designs cover all in-scope components
- [ ] Migration sequence respects dependency constraints from Phase 2
- [ ] Risk mitigations from Phase 3 are reflected in migration approach
- [ ] Dead code from Phase 3 is excluded from target architecture
- [ ] Each target design includes rollback strategy
- [ ] Cost comparison (current vs. target) is documented
- [ ] Phase 4 summary document is saved (if applicable)
- [ ] `modernization-state.json` is updated with Phase 4 completion status

## Skill Selection Decision Matrix

Use this matrix to determine which skills to run based on the application's technology landscape.

### Always Run (Core Skills)

| Skill | Rationale |
|-------|-----------|
| `monolith-sbom` | Every application has dependencies to inventory and EOL risks to flag |
| `dependency-flow-mapper` | Understanding dependencies is foundational to any migration strategy |
| `business-risk-assessor` | Business value and risk must drive prioritization regardless of technology |
| `dead-code-detector` | Reducing scope before migration saves effort and reduces risk |

### Conditional Skills

| Condition | Skills to Add |
|-----------|---------------|
| Database has stored procedures | `stored-proc-analyzer` (Phase 1) + `storedproc-to-microservice` (Phase 4) |
| ESB or middleware is present | `esb-cataloger` (Phase 1) + `esb-routing-extractor` (Phase 2) + `esb-to-event-driven` (Phase 4) |
| Batch processing exists | `batch-app-scanner` (Phase 1) + `batch-to-serverless` (Phase 4) |

### Detection Heuristics

How to determine if a component type is present when the user is unsure:

| Component | Detection Method |
|-----------|-----------------|
| Stored procedures | Check for `.sql` files, database migration scripts, ORM configs referencing procedures |
| ESB | Look for ESB product configs (mule-config.xml, integration-flow.xml), WSDL files, ESB-specific dependencies in build files |
| Batch jobs | Look for scheduler configs (cron, Quartz, Control-M), `@Scheduled` annotations, batch XML definitions, `.jil` files |

## Common Scope Patterns

### Database-Heavy Pattern

**Characteristics**: Large Oracle/SQL Server database with hundreds of stored procedures, few ESB integrations, minimal batch processing.

**Skills to run**: `monolith-sbom`, `stored-proc-analyzer`, `dependency-flow-mapper`, `business-risk-assessor`, `dead-code-detector`, `storedproc-to-microservice`

**Typical timeline**: Medium (3-5 days for assessment)

**Key risks**: Data migration complexity, distributed transaction management, procedure interdependencies

### ESB-Heavy Pattern

**Characteristics**: Heavy middleware usage (MuleSoft, IBM IIB, TIBCO), many integrations, ESB contains business logic beyond simple routing.

**Skills to run**: `monolith-sbom`, `esb-cataloger`, `dependency-flow-mapper`, `esb-routing-extractor`, `business-risk-assessor`, `dead-code-detector`, `esb-to-event-driven`

**Typical timeline**: Medium-Large (3-7 days for assessment)

**Key risks**: Business logic trapped in ESB, consumer migration coordination, protocol translation

### Batch-Heavy Pattern

**Characteristics**: Complex nightly/periodic batch processing, job chains with dependencies, large data volumes, enterprise schedulers.

**Skills to run**: `monolith-sbom`, `batch-app-scanner`, `dependency-flow-mapper`, `business-risk-assessor`, `dead-code-detector`, `batch-to-serverless`

**Typical timeline**: Medium (3-5 days for assessment)

**Key risks**: Batch chain ordering, processing windows, data volume handling, scheduler migration

### Full Stack Pattern

**Characteristics**: All component types present — stored procedures, ESB, batch processing, and a large monolithic application.

**Skills to run**: All 11 skills

**Typical timeline**: Large (7-14 days for assessment)

**Key risks**: Complexity of coordinating all migration workstreams, dependency conflicts between component types, organizational change management

## Timeline Estimation Guidelines

### Small Scope (1-2 days)

- Single application, single component type (e.g., batch-only or database-only)
- Fewer than 50 components to inventory
- Well-documented existing architecture
- Single team responsible

### Medium Scope (3-5 days)

- Single application, 2-3 component types
- 50-200 components to inventory
- Some documentation gaps
- 2-3 teams involved

### Large Scope (1-2 weeks)

- Multiple applications or full-stack modernization
- 200+ components to inventory
- Significant documentation gaps
- Multiple teams and stakeholders
- Complex integrations and dependencies
- Regulatory or compliance considerations

### Estimation Adjustments

Add time for:
- **Poor documentation**: +25-50% — more discovery and validation needed
- **No APM/telemetry**: +20% — harder to identify dead code and actual usage patterns
- **Multiple databases**: +15% per additional database — shared data patterns take longer to map
- **Regulatory requirements**: +20-30% — compliance validation at each phase gate
- **Distributed team**: +15% — coordination overhead for intake and validation

## Stakeholder Communication Templates

### Phase 1 Completion Notification

```
Subject: [App Modernization] Phase 1 Complete — Component Inventory

Team,

Phase 1 (Component Inventory) for [APPLICATION NAME] is complete.

Key findings:
- [X] stored procedures cataloged ([Y] high complexity)
- [X] ESB integrations mapped ([Y] with embedded business logic)
- [X] batch jobs inventoried ([Y] in critical chains)
- [X] dependencies in SBOM ([Y] at end-of-life)

Critical risks identified:
- [List top 3 risks]

Next step: Phase 2 — Dependency & Flow Mapping (estimated [X] days)

Full details: phase-1-summary.md
```

### Phase 2 Completion Notification

```
Subject: [App Modernization] Phase 2 Complete — Dependency Mapping

Team,

Phase 2 (Dependency & Flow Mapping) for [APPLICATION NAME] is complete.

Key findings:
- Architecture topology mapped: [X] applications, [Y] dependencies
- [X] shared database anti-patterns detected
- Batch critical path: [X] hours, [Y] parallelization opportunities
- [X] ESB routes classified ([Y]% pass-through, [Z]% business logic)

Migration constraints identified:
- [List top 3 coupling constraints]

Next step: Phase 3 — Risk Assessment (estimated [X] days)

Full details: phase-2-summary.md
```

### Phase 3 Completion Notification

```
Subject: [App Modernization] Phase 3 Complete — Risk Assessment

Team,

Phase 3 (Risk Assessment) for [APPLICATION NAME] is complete.

Key findings:
- [X] core domain modules identified
- [X]% of codebase flagged as dead code (safe for removal)
- Modernization priority: [Top 3 modules in order]
- [X] high-risk modules requiring careful migration

Scope reduction opportunity:
- Removing dead code reduces migration scope by [X]%

Next step: Phase 4 — Target Architecture Design (estimated [X] days)

Full details: phase-3-summary.md
```

### Final Plan Delivery

```
Subject: [App Modernization] Assessment Complete — Migration Plan Delivered

Stakeholders,

The full modernization assessment for [APPLICATION NAME] is complete.

Summary:
- [X] components assessed across [Y] applications
- [X] components recommended for migration
- [X] components recommended for removal (dead code)
- Estimated migration timeline: [X] months in [Y] phases
- [X] quick wins identified for immediate action

Deliverables:
1. Unified Migration Plan: modernization-plan.md
2. Executive Dashboard: modernization-dashboard.html
3. Phase summaries: phase-1-summary.md through phase-4-summary.md

Recommended next steps:
1. Executive review of migration plan
2. Quick wins execution (estimated [X] days)
3. Phase 1 migration kickoff (estimated start: [DATE])

Please review the executive dashboard for a visual overview.
```

## Risk Escalation Criteria

### Immediate Escalation (Block Phase Progression)

- **Critical security vulnerability** discovered in a production-facing component (CVE with known exploit)
- **Data integrity risk** — shared database with no clear ownership could lead to data corruption during migration
- **Compliance violation** — component handles regulated data without required controls
- **Single point of failure** — critical business process depends on a single, unmaintained component

### Elevated Risk (Document and Monitor)

- **EOL component** with no vendor support that is in the critical path
- **Knowledge silo** — only one person understands a critical component
- **Missing telemetry** — cannot determine actual usage patterns for dead code detection
- **Complex coupling** — circular dependencies involving more than 3 components
- **Large blast radius** — a single component change affects more than 5 downstream consumers

### Accepted Risk (Document in Risk Register)

- **Minor EOL components** with available alternatives and low migration complexity
- **Low-traffic integrations** that can tolerate brief downtime during migration
- **Well-understood technical debt** with clear remediation path
- **Team skill gaps** addressable through training or temporary staffing
