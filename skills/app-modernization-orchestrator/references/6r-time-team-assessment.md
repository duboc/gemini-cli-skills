# 6R Framework, TIME Model & Team Assessment Guide

## 6R Framework Decision Flowchart — GCP-Mapped

Use this flowchart to classify each application component into the correct 6R strategy, then map it to the appropriate GCP target.

### Decision Criteria

```
START: Evaluate Component
│
├─ Is the component actively used in production?
│   ├─ NO → RETIRE (Decommission)
│   │         Action: Document dependencies, schedule decommission, archive data to Cloud Storage
│   │
│   └─ YES → Continue
│       │
│       ├─ Is there a Google SaaS product that replaces this component?
│       │   ├─ YES → REPURCHASE
│       │   │         GCP Target: Apigee (API management), Looker (BI), Chronicle (SIEM),
│       │   │                     Google Workspace (collaboration), reCAPTCHA Enterprise (bot protection)
│       │   │         Action: Extract requirements, evaluate SaaS fit, plan data migration
│       │   │
│       │   └─ NO → Continue
│       │       │
│       │       ├─ Does the component need code changes for modernization?
│       │       │   ├─ NO → Can it run as-is on GCP?
│       │       │   │   ├─ YES → REHOST
│       │       │   │   │         GCP Target: Compute Engine (lift-and-shift VMs)
│       │       │   │   │         Tools: Migrate to VMs (automated migration)
│       │       │   │   │         Action: Use Migration Center for assessment, minimal changes
│       │       │   │   │
│       │       │   │   └─ NO → RETAIN
│       │       │   │             GCP Target: Anthos (hybrid/multi-cloud management)
│       │       │   │             Action: Manage on-prem with Anthos, plan future migration
│       │       │   │
│       │       │   └─ YES → How extensive are the changes?
│       │       │       ├─ MINIMAL (config, connection strings, managed services) → REPLATFORM
│       │       │       │         GCP Target: Cloud SQL (database), GKE (containers),
│       │       │       │                     Memorystore (caching), Cloud Run (simple apps)
│       │       │       │         Action: Swap infrastructure dependencies, minimal code changes
│       │       │       │
│       │       │       └─ SIGNIFICANT (architecture, decomposition, rewrite) → REFACTOR
│       │       │                 GCP Target: Cloud Run (microservices), Pub/Sub (messaging),
│       │       │                             Cloud SQL/AlloyDB/Spanner (databases),
│       │       │                             Cloud Build (CI/CD), Cloud Deploy (CD)
│       │       │                 Action: Full modernization pipeline (all 4 phases)
```

### 6R Summary Table

| Strategy | Decision Signal | GCP Target | Effort | Risk |
|----------|----------------|-----------|--------|------|
| Rehost | Works as-is, urgent timeline | Compute Engine + Migrate to VMs | Low | Low |
| Replatform | Minor changes, managed services benefit | Cloud SQL + GKE + Memorystore | Medium-Low | Low |
| Refactor | Core business, needs decomposition | Cloud Run + Pub/Sub + microservices | High | Medium |
| Repurchase | Commodity function, SaaS available | Apigee, Looker, Chronicle, etc. | Medium | Low |
| Retire | No active users, no business value | Decommission + Cloud Storage archive | Low | Low |
| Retain | Compliance/regulatory constraint | Anthos for hybrid management | Low | Low |

---

## Gartner TIME Model Decision Tree — GCP Actions

The TIME model classifies applications into four quadrants based on technical quality and business value.

### TIME Quadrant Mapping

```
                    HIGH Business Value
                          │
         INVEST           │          MIGRATE
    (High value,          │     (High value,
     Good tech)           │      Poor tech)
                          │
    Action: Enhance       │     Action: Modernize
    GCP: Cloud Run,       │     GCP: Full refactor
    add AI/ML features    │     to Cloud Run +
    with Vertex AI        │     Pub/Sub + Cloud SQL
                          │
    ──────────────────────┼──────────────────────
                          │
         TOLERATE         │        ELIMINATE
    (Low value,           │     (Low value,
     Good tech)           │      Poor tech)
                          │
    Action: Maintain      │     Action: Retire
    GCP: Rehost to        │     GCP: Decommission,
    Compute Engine or     │     archive to Cloud
    retain on Anthos      │     Storage
                          │
                    LOW Business Value
```

### TIME-to-6R Mapping

| TIME Quadrant | Recommended 6R | GCP Action |
|---------------|---------------|-----------|
| Invest | Refactor or Replatform | Enhance on Cloud Run, add Vertex AI capabilities |
| Migrate | Refactor | Full modernization to Cloud Run + Pub/Sub + Cloud SQL |
| Tolerate | Rehost or Retain | Lift-and-shift to Compute Engine or manage with Anthos |
| Eliminate | Retire | Decommission, archive data to Cloud Storage |

### Scoring Criteria

**Technical Quality Score (1-5):**
- Code maintainability (cyclomatic complexity, test coverage)
- Security posture (known CVEs, EOL components from SBOM)
- Operational stability (incident frequency, MTTR)
- Scalability characteristics (horizontal scaling capability)
- Technology currency (framework versions, language versions)

**Business Value Score (1-5):**
- Revenue impact (direct or indirect)
- User base size and growth
- Regulatory/compliance requirement
- Strategic alignment with business goals
- Competitive differentiation

---

## Team Capability Assessment Questionnaire

Rate each area 1-5 (1 = No experience, 5 = Expert/Production experience).

### GCP Platform Skills (Questions 1-5)

1. **Compute platforms**: How experienced is the team with Cloud Run, GKE, and Compute Engine?
   - 1: No GCP compute experience
   - 3: Have deployed to one platform in non-production
   - 5: Running production workloads on Cloud Run or GKE

2. **Data services**: How experienced is the team with Cloud SQL, AlloyDB, Spanner, Firestore, and Memorystore?
   - 1: No GCP database experience
   - 3: Have used Cloud SQL for development
   - 5: Managing production databases with HA, backups, and monitoring

3. **Messaging and eventing**: How experienced is the team with Pub/Sub, Eventarc, and Cloud Tasks?
   - 1: No async messaging experience on GCP
   - 3: Have used Pub/Sub for simple pub/sub patterns
   - 5: Running event-driven architectures with Pub/Sub in production

4. **Networking and security**: How experienced is the team with VPC, IAM, Cloud Armor, and Secret Manager?
   - 1: No GCP networking/security experience
   - 3: Basic VPC and IAM setup
   - 5: Designed and managed production VPC with private services, Workload Identity

5. **Observability**: How experienced is the team with Cloud Monitoring, Cloud Logging, Cloud Trace, and Error Reporting?
   - 1: No GCP observability experience
   - 3: Basic logging and monitoring dashboards
   - 5: Full observability with SLOs, alerting, distributed tracing in production

### Cloud-Native Patterns (Questions 6-10)

6. **Containerization**: How experienced is the team with Docker, container image optimization, and distroless images?
   - 1: No container experience
   - 3: Can write Dockerfiles, have built container images
   - 5: Optimized multi-stage builds, distroless images, vulnerability scanning with Artifact Registry

7. **CI/CD**: How experienced is the team with Cloud Build, Cloud Deploy, Artifact Registry, and automated testing pipelines?
   - 1: Manual builds and deployments
   - 3: Basic CI pipeline with automated builds
   - 5: Full CI/CD with Cloud Build, Cloud Deploy, automated testing, canary deployments

8. **Infrastructure as Code**: How experienced is the team with Terraform for GCP?
   - 1: No IaC experience
   - 3: Have used Terraform for basic GCP resources
   - 5: Managing full GCP infrastructure with Terraform modules, state management, and CI/CD

9. **12-Factor App principles**: Does the team follow externalized config, stateless processes, port binding, disposability?
   - 1: Monolithic deployment, config in code
   - 3: Some principles followed (externalized config, logging to stdout)
   - 5: Full 12-factor compliance across all services

10. **GitOps / Config management**: Does the team use declarative config, version-controlled deployments?
    - 1: Manual configuration changes
    - 3: Config in version control but manual apply
    - 5: Full GitOps with Config Sync or Cloud Deploy

### Microservices & Distributed Systems (Questions 11-15)

11. **API design**: How experienced is the team with REST API design, OpenAPI specs, gRPC?
    - 1: No API design experience
    - 3: Have designed REST APIs with OpenAPI
    - 5: Production APIs with versioning, pagination, error handling, gRPC for internal services

12. **Distributed systems patterns**: How experienced with circuit breakers, retries, timeouts, bulkheads?
    - 1: No distributed systems experience
    - 3: Understand patterns conceptually
    - 5: Implemented resilience patterns in production microservices

13. **Event-driven architecture**: How experienced with event sourcing, CQRS, saga patterns?
    - 1: No event-driven experience
    - 3: Basic publish/subscribe patterns
    - 5: Production event-driven systems with Pub/Sub, idempotent consumers, dead-letter topics

14. **Data management**: How experienced with database-per-service, data synchronization, eventual consistency?
    - 1: Only shared database experience
    - 3: Understand the patterns, limited implementation
    - 5: Running database-per-service in production with data sync strategies

15. **Service mesh / networking**: How experienced with Istio, Anthos Service Mesh, or Cloud Run service-to-service auth?
    - 1: No service mesh experience
    - 3: Basic understanding of service mesh concepts
    - 5: Running Anthos Service Mesh or equivalent in production

### DevOps Maturity (Questions 16-20)

16. **Automated testing**: What is the team's testing maturity (unit, integration, contract, e2e)?
    - 1: Minimal or no automated tests
    - 3: Unit tests with >60% coverage
    - 5: Full test pyramid with unit, integration, contract, and e2e tests in CI

17. **Incident management**: Does the team have structured incident response with blameless postmortems?
    - 1: Ad-hoc incident response
    - 3: Defined process with on-call rotation
    - 5: Structured incident response, blameless postmortems, SLO-based alerting

18. **Deployment frequency**: How often does the team deploy to production?
    - 1: Monthly or less
    - 3: Weekly
    - 5: Multiple times per day (on-demand)

19. **Change failure rate**: What percentage of deployments cause production issues?
    - 1: >30% (high failure rate)
    - 3: 15-30%
    - 5: <5% (low failure rate)

20. **Mean time to recovery (MTTR)**: How quickly does the team recover from production incidents?
    - 1: Days
    - 3: Hours
    - 5: Minutes (automated rollback, feature flags)

### Scoring Interpretation

| Total Score | Readiness Level | Recommendation |
|-------------|----------------|----------------|
| 80-100 | Ready | Proceed with full refactoring to Cloud Run + Pub/Sub |
| 60-79 | Mostly Ready | Targeted training on weak areas, start with replatform |
| 40-59 | Needs Development | Google Cloud Skills Boost training program before Phase 4 |
| 20-39 | Significant Gaps | Start with rehost, invest in team training for 3-6 months |

---

## Skills Gap Remediation — Google Cloud Skills Boost Learning Paths

### By Role

**Developers:**
- Cloud Developer Learning Path
- Developing Applications with Google Cloud
- Building Scalable Java/Python Microservices with Cloud Run
- Event-Driven Systems with Pub/Sub
- Google Cloud certification: Professional Cloud Developer

**Site Reliability Engineers (SREs):**
- SRE Practices and Principles
- Logging and Monitoring in Google Cloud
- Implementing SLOs and Error Budgets
- Cloud Operations (Monitoring, Logging, Trace, Error Reporting)
- Google Cloud certification: Professional Cloud DevOps Engineer

**Cloud Architects:**
- Cloud Architect Learning Path
- Designing and Managing Google Cloud Networking
- Security Best Practices in Google Cloud
- Hybrid and Multi-cloud with Anthos
- Google Cloud certification: Professional Cloud Architect

**Data Engineers (for data migration):**
- Data Engineer Learning Path
- Migrating to Cloud SQL / AlloyDB
- Designing Data Pipelines with Dataflow and Pub/Sub
- Google Cloud certification: Professional Data Engineer

---

## Cost/Benefit Analysis Template

### Per-Component Analysis

| Field | Current State | Target State (GCP) |
|-------|--------------|-------------------|
| **Component Name** | | |
| **6R Classification** | | |
| **Annual Infrastructure Cost** | $ (VMs, licenses, hardware) | $ (Cloud Run, Cloud SQL, Pub/Sub) |
| **Annual Licensing Cost** | $ (middleware, DB licenses) | $ (managed service fees) |
| **Annual Maintenance Labor** | $ (FTE hours x rate) | $ (reduced ops with managed services) |
| **Total Annual Cost** | $ | $ |
| **Migration Effort** | N/A | person-months |
| **Migration Cost** | N/A | $ (effort x blended rate) |
| **Annual Savings** | N/A | $ (current - target annual) |
| **Payback Period** | N/A | months (migration cost / monthly savings) |

### GCP Pricing Calculator Integration

Use the [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator) to estimate target costs:

1. **Cloud Run**: Estimate based on expected requests/month, CPU/memory allocation, concurrency
2. **Cloud SQL**: Instance type, storage, HA configuration, read replicas
3. **Pub/Sub**: Message volume, message size, subscription count
4. **Cloud Storage**: Storage class, volume, egress
5. **Cloud Monitoring**: Metrics volume, log volume, trace sampling rate
6. **Networking**: Egress, load balancer, Cloud Armor rules

### Decision Threshold

| Payback Period | Decision |
|---------------|----------|
| < 12 months | Strong proceed — high ROI |
| 12-24 months | Proceed with business justification |
| 24-36 months | Proceed only with strategic justification (security, compliance, talent retention) |
| > 36 months | Reconsider — rehost or retain may be more appropriate |

---

## DORA Metrics Benchmarks

Reference benchmarks from the State of DevOps Report for measuring modernization success.

### Four Key Metrics

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | On-demand (multiple/day) | Weekly to monthly | Monthly to 6-monthly | Fewer than once per 6 months |
| **Lead Time for Changes** | Less than 1 hour | 1 day to 1 week | 1 week to 1 month | 1 to 6 months |
| **Mean Time to Recovery** | Less than 1 hour | Less than 1 day | 1 day to 1 week | More than 6 months |
| **Change Failure Rate** | 0-5% | 6-10% | 11-15% | 16-30%+ |

### Modernization Target Mapping

| Current DORA Level | Modernization Goal | GCP Enablers |
|--------------------|-------------------|-------------|
| Low → Medium | Automate builds and deployments | Cloud Build, Artifact Registry, Cloud Deploy |
| Medium → High | Improve testing and monitoring | Cloud Monitoring SLOs, automated test pipelines |
| High → Elite | Enable on-demand deployment | Cloud Run (instant scaling), feature flags, canary deploys |

### Measurement with GCP Tools

- **Deployment Frequency**: Cloud Deploy delivery pipeline metrics
- **Lead Time**: Cloud Build trigger-to-deploy timestamps
- **MTTR**: Cloud Monitoring incident duration, Error Reporting resolution time
- **Change Failure Rate**: Cloud Deploy rollback frequency, Error Reporting new error rate post-deploy

Track DORA metrics before and after modernization to quantify improvement and justify investment.
