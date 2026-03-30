# Migration Patterns Reference

Common enterprise migration patterns, sequencing strategies, data migration approaches, and team topology recommendations for application modernization.

## Enterprise Migration Patterns

### Strangler Fig Pattern

**Description**: Gradually replace components of a legacy system by building new functionality alongside the old system, routing traffic to the new implementation incrementally until the legacy system can be decommissioned.

**When to use**:
- System has clear module boundaries or URL-based routing
- Risk tolerance is low — need to migrate incrementally with rollback at each step
- Legacy system is still actively developed (cannot freeze changes)
- Team has limited experience with the target architecture

**When to avoid**:
- System has deep coupling where modules cannot be isolated
- Data model is highly normalized and shared across all modules
- Migration timeline is very short (pattern adds routing overhead)

**Implementation approach**:
1. Place a facade (API gateway, reverse proxy) in front of the legacy system
2. Identify the first module to extract (start with low-risk, well-bounded modules)
3. Build the replacement service behind the facade
4. Route traffic to the new service (start with shadow/canary traffic)
5. Validate behavior parity, then cut over fully
6. Repeat for next module

**Risk profile**: Low — each step is independently deployable and reversible.

**Coupling requirement**: Works best with LOW to MEDIUM coupling.

### Branch by Abstraction

**Description**: Introduce an abstraction layer within the monolith that allows swapping implementations from legacy to modern without changing calling code. Once the new implementation is verified, remove the abstraction and the legacy code.

**When to use**:
- Components are tightly coupled within a single codebase
- Cannot place a facade/proxy in front (internal library dependencies, not HTTP-routable)
- Need to migrate internal libraries, data access layers, or shared services
- Want to run old and new implementations side by side for validation

**When to avoid**:
- System is too fragile to introduce abstraction safely
- No test coverage to validate that the abstraction does not change behavior
- Team lacks refactoring experience

**Implementation approach**:
1. Identify the component to replace
2. Create an abstraction (interface/contract) that represents the component's behavior
3. Make the legacy code implement the abstraction
4. Build the new implementation behind the same abstraction
5. Use feature flags to toggle between implementations
6. Validate the new implementation in production with real traffic
7. Remove the legacy implementation and the abstraction

**Risk profile**: Medium — requires careful refactoring of the monolith.

**Coupling requirement**: Works with HIGH coupling (designed for it).

### Parallel Run

**Description**: Run both legacy and modern systems simultaneously, comparing outputs in real-time. Traffic goes to both systems, but only the legacy system's output is used in production until the modern system is validated.

**When to use**:
- System is mission-critical and any behavioral difference is unacceptable
- Need mathematical proof of equivalence before cutover
- Regulatory requirements demand validation evidence
- Financial calculations, pricing engines, or compliance-critical logic

**When to avoid**:
- System has side effects that cannot be safely duplicated (payment processing, email sending)
- Infrastructure cost of running two systems is prohibitive
- Data volumes make real-time comparison impractical

**Implementation approach**:
1. Deploy the new system alongside the legacy system
2. Fork incoming requests to both systems
3. Capture outputs from both and compare (use a comparison service)
4. Log discrepancies for investigation
5. When discrepancy rate drops below threshold, cut over to the new system
6. Keep the legacy system in standby for rollback period

**Risk profile**: Very low — production behavior unchanged until explicit cutover.

**Coupling requirement**: Works with any coupling level (systems are independent).

### Big Bang Migration

**Description**: Replace the entire legacy system with the new system in a single cutover event, typically during a maintenance window.

**When to use**:
- System is small enough that incremental migration adds more complexity than value
- Clear maintenance windows are available (weekends, holidays, low-traffic periods)
- Legacy system is being retired entirely (not just modernized)
- Strong test coverage and staging environment validation is possible

**When to avoid**:
- System is large or complex
- No maintenance windows available (24/7 operations)
- Team lacks experience with the target system
- Rollback would be difficult or impossible

**Implementation approach**:
1. Build the complete replacement system
2. Validate extensively in staging with production-like data
3. Plan the cutover: data migration, DNS changes, configuration updates
4. Execute cutover during maintenance window
5. Validate production behavior immediately
6. Monitor closely for 24-72 hours post-cutover

**Risk profile**: High — all-or-nothing cutover with limited rollback options.

**Coupling requirement**: N/A — replaces everything at once.

## Migration Sequencing Strategies

### Outside-In (Recommended for most cases)

Start with the outermost layer (UI, API gateway, external integrations) and work inward toward the core domain.

**Advantages**:
- External interfaces change first, providing immediate value to consumers
- Core domain (highest risk) is migrated last, with maximum learning from earlier phases
- API gateway can act as a strangler fig facade

**Sequence**:
1. API gateway and external-facing services
2. Integration layer (ESB routes, message consumers)
3. Application services and business logic
4. Data access layer and database

**Best for**: Systems where external interfaces are well-defined and the core domain is complex.

### Inside-Out

Start with the core domain (database, business logic) and work outward toward integrations and UI.

**Advantages**:
- Core domain is modernized first, establishing the foundation
- Data model is cleaned up before building new services on top
- Reduces risk of building new services on a flawed data foundation

**Sequence**:
1. Database schema and data access layer
2. Core business logic and domain services
3. Integration layer and messaging
4. API gateway and external interfaces

**Best for**: Systems where the data model is the primary source of coupling and technical debt.

### Domain-Driven Decomposition

Identify bounded contexts using Domain-Driven Design and migrate one bounded context at a time.

**Advantages**:
- Each migration unit is a coherent business capability
- Reduces the risk of breaking cross-domain dependencies
- Aligns migration with business value delivery

**Sequence**:
1. Map bounded contexts using event storming or domain analysis
2. Identify context boundaries and their interactions
3. Migrate the most independent bounded context first
4. Progress to contexts with increasing interdependencies
5. Resolve shared kernel and anti-corruption layers last

**Best for**: Large, complex systems where business domain alignment is more important than technical layering.

## Handling Distributed Transactions During Migration

### Problem

When extracting services from a monolith, transactions that were previously local (single database COMMIT) become distributed across multiple services and databases. This creates consistency challenges.

### Strategy 1: Saga Pattern

Replace distributed transactions with a sequence of local transactions, each publishing events that trigger the next step. Compensating transactions handle failures.

**Choreography-based**: Each service listens for events and decides what to do next.
- Simpler to implement for small numbers of steps
- Harder to understand and debug as the number of steps grows

**Orchestration-based**: A central orchestrator tells each service what to do.
- Easier to understand and modify the overall flow
- Orchestrator can become a single point of failure

### Strategy 2: Outbox Pattern

Write the domain event and the database change in the same local transaction (to an "outbox" table). A separate process polls the outbox and publishes events.

- Guarantees at-least-once delivery without distributed transactions
- Requires idempotent consumers
- Works well with CDC (Change Data Capture) tools like Debezium

### Strategy 3: Dual-Phase Migration

During the transition period, keep the legacy transaction boundary intact and gradually move logic out:

1. Extract read-only services first (no transaction risk)
2. Extract services with independent write paths next
3. Introduce sagas for services with shared write paths last

### Anti-Patterns to Avoid

- **Two-phase commit across services**: Does not scale, creates tight coupling, reduces availability
- **Shared database during migration**: Temporary shared access is acceptable, but plan to eliminate it
- **Ignoring eventual consistency**: Design consumers to handle out-of-order and delayed events

## Data Migration Strategies

### Change Data Capture (CDC)

**Description**: Capture changes from the legacy database log (WAL, redo log) and stream them to the new database in near real-time.

**Tools**: Debezium, Oracle GoldenGate, AWS DMS, Google Cloud Datastream

**When to use**: Zero-downtime migration, large data volumes, need to keep systems in sync during transition.

**Considerations**: Schema differences require transformation logic. CDC captures row-level changes, not application-level events.

### Dual-Write

**Description**: Application writes to both legacy and modern databases simultaneously during the transition period.

**When to use**: Small data volumes, simple schema, short transition period.

**Risks**: Consistency issues if one write succeeds and the other fails. Performance impact of double writes. Must be removed after migration.

**Mitigation**: Use the outbox pattern instead of direct dual-write. Verify consistency with periodic reconciliation jobs.

### Event Sourcing Migration

**Description**: Replay historical events to build the new system's state from scratch, rather than migrating data directly.

**When to use**: Moving to an event-sourced architecture. Historical audit trail is important. Data model changes significantly between old and new.

**Considerations**: Requires the ability to reconstruct events from historical data. May need to synthesize events from database snapshots for history before event sourcing was implemented.

### Bulk Migration with Cutover

**Description**: Export data from the legacy system, transform it, and load it into the new system during a maintenance window.

**When to use**: Small to medium data volumes. Maintenance window is available. Schema changes are significant (making CDC complex).

**Sequence**: Full export, transform, load, validate, cutover, monitor.

## Rollback Planning

### Per-Pattern Rollback Strategies

| Pattern | Rollback Strategy | Rollback Time | Data Risk |
|---------|-------------------|---------------|-----------|
| Strangler Fig | Reroute traffic back to legacy through facade | Minutes | Low — legacy was still running |
| Branch by Abstraction | Toggle feature flag back to legacy implementation | Seconds | Low — same database |
| Parallel Run | Stop sending traffic to new system | Minutes | None — legacy was always primary |
| Big Bang | Restore from backup, revert DNS/config | Hours | High — data written to new system is lost |

### Rollback Checklist

Before any migration step, verify:

- [ ] Rollback procedure is documented and tested
- [ ] Rollback can be executed by the on-call team (not just the migration team)
- [ ] Data created during migration can be reconciled after rollback
- [ ] Monitoring alerts are configured to trigger rollback if needed
- [ ] Rollback time estimate is within the acceptable downtime window
- [ ] Communication plan for stakeholders if rollback is triggered

### Point of No Return

Identify and document the "point of no return" for each migration step — the moment after which rollback becomes significantly harder or impossible. Common points of no return:

- Database schema changes that drop columns or tables
- Data transformations that are not reversible
- External system integrations that start sending data to the new system
- DNS changes that propagate globally

## Team Topology Recommendations

### Platform Team

**Responsibility**: Build and maintain the shared migration infrastructure — CI/CD pipelines, container orchestration, service mesh, observability stack, database migration tools.

**Composition**: 3-5 engineers with infrastructure and DevOps expertise.

**Key deliverables**: Container base images, deployment pipelines, monitoring dashboards, database migration tooling, service mesh configuration.

### Stream-Aligned Teams

**Responsibility**: Each team owns the migration of one or more bounded contexts. They make architecture decisions within their domain and use the platform team's infrastructure.

**Composition**: 4-8 engineers per team, full-stack capability (backend, data, testing).

**Key principle**: Each team can deploy independently. Cross-team dependencies are managed through well-defined APIs and events.

### Enabling Team

**Responsibility**: Help stream-aligned teams adopt new technologies and patterns. Provide training, pair programming, architecture reviews, and migration playbooks.

**Composition**: 2-3 senior engineers with deep expertise in the target architecture (cloud-native, event-driven, microservices).

**Duration**: Temporary — the enabling team should work itself out of a job as stream-aligned teams build capability.

### Anti-Patterns

- **Migration SWAT team**: A single team responsible for all migration work creates a bottleneck and knowledge silo.
- **No platform team**: Every stream-aligned team builds its own infrastructure, leading to inconsistency and wasted effort.
- **Enabling team becomes a gate**: The enabling team should advise, not approve. Avoid creating an architecture review board that blocks progress.

## Success Metrics and KPIs

### Leading Indicators (Track During Migration)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Components migrated | Per roadmap milestones | Count of components in target architecture |
| Dead code removed | 100% of identified dead code | Lines of code removed / dead code inventory |
| Test coverage of migrated components | > 80% | Automated test coverage reports |
| Deployment frequency (migrated services) | > 1x per week | CI/CD pipeline metrics |
| Mean time to recovery (migrated services) | < 1 hour | Incident management data |
| Migration defect rate | < 5% of migrated components | Bugs filed against migrated components |

### Lagging Indicators (Track Post-Migration)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Infrastructure cost change | 20-40% reduction | Cloud billing comparison |
| Developer productivity | 25-50% improvement | Lead time for changes, deployment frequency |
| Incident rate change | 30-50% reduction | Incident count comparison (same period, year over year) |
| Time to market for new features | 40-60% reduction | Feature lead time measurement |
| Operational toil reduction | 50%+ reduction | On-call burden, manual operations hours |
| Team autonomy | Independent deployment capability | Cross-team deployment dependencies |

### Migration Health Dashboard Metrics

| Metric | Red | Yellow | Green |
|--------|-----|--------|-------|
| Phase completion | Behind by > 2 weeks | Behind by 1-2 weeks | On schedule or ahead |
| Defect rate | > 10% of migrated components | 5-10% | < 5% |
| Rollback count | > 2 rollbacks in a phase | 1-2 rollbacks | 0 rollbacks |
| Team velocity | Declining trend | Flat | Increasing trend |
| Stakeholder satisfaction | Major concerns raised | Minor concerns | No concerns |
| Budget variance | > 20% over budget | 10-20% over | Within 10% of budget |
