# Modernization Frameworks Reference

## Gartner TIME Model Decision Tree

The TIME model classifies applications into four categories based on their business value, technical quality, and cost profile.

```
Start
  |
  v
Is the module delivering high business value?
  |
  +-- YES --> Is it technically fragile or approaching EOL?
  |             |
  |             +-- YES --> MIGRATE
  |             |           Examples: Core billing system on unsupported J2EE,
  |             |           order processing with high defect rate,
  |             |           payment gateway on deprecated framework
  |             |           GCP Action: Refactor to Cloud Run microservices, Pub/Sub events
  |             |
  |             +-- NO  --> INVEST
  |                         Examples: Well-architected customer portal,
  |                         modern inventory management system,
  |                         API platform with good test coverage
  |                         GCP Action: Enhance on current platform or replatform to Cloud SQL/GKE
  |
  +-- NO  --> Is the maintenance cost acceptable?
                |
                +-- YES --> TOLERATE
                |           Examples: Internal admin tool used weekly,
                |           legacy report generator that still works,
                |           read-only archive viewer
                |           GCP Action: Leave as-is or rehost to Compute Engine
                |
                +-- NO  --> ELIMINATE
                            Examples: Unused CRM module replaced by SaaS,
                            duplicate reporting system,
                            abandoned prototype still running in production
                            GCP Action: Decommission after dead-code-detector confirmation
```

## 6R Framework Decision Flowchart Mapped to GCP Services

Use the 6R framework for modules classified as "Migrate" or "Invest" in the TIME model.

```
Module requires migration
  |
  v
Can it be retired (no business need)?
  +-- YES --> RETIRE: Decommission, archive data to Cloud Storage
  |
  +-- NO  --> Can it be replaced by a Google SaaS product?
                +-- YES --> REPURCHASE
                |           - CRM/ERP --> Google Workspace, partner solutions
                |           - API Management --> Apigee
                |           - Security/SIEM --> Chronicle
                |           - Data Warehouse --> BigQuery
                |
                +-- NO  --> Does it need code changes for cloud?
                              +-- NO  --> REHOST
                              |           - Lift-and-shift to Compute Engine VMs
                              |           - Migrate for Compute Engine for automated migration
                              |           - Minimal risk, fastest path
                              |
                              +-- MINOR --> REPLATFORM
                              |           - Database --> Cloud SQL, AlloyDB, Spanner
                              |           - Containerize --> GKE or Cloud Run
                              |           - Message queues --> Pub/Sub
                              |           - File storage --> Cloud Storage
                              |           - Caching --> Memorystore (Redis)
                              |
                              +-- MAJOR --> Can it remain on-prem for now?
                                            +-- YES --> RETAIN
                                            |           - Manage via Anthos for hybrid
                                            |           - Anthos Config Management for policy
                                            |           - Plan future migration wave
                                            |
                                            +-- NO  --> REFACTOR
                                                        - Decompose monolith to Cloud Run microservices
                                                        - Event-driven with Pub/Sub
                                                        - Workflows for orchestration
                                                        - Firestore/Cloud SQL for data
                                                        - Cloud Build for CI/CD
```

### 6R Effort and Risk Summary

| Strategy | Typical Effort | Risk Level | GCP Primary Services |
|----------|---------------|------------|---------------------|
| Retire | 1-2 weeks | Low | Cloud Storage (archive) |
| Rehost | 2-4 weeks | Low | Compute Engine, Migrate for Compute Engine |
| Replatform | 1-3 months | Low-Medium | Cloud SQL, AlloyDB, GKE, Pub/Sub |
| Repurchase | 1-6 months | Medium | Apigee, Chronicle, BigQuery |
| Refactor | 3-12 months | High | Cloud Run, Pub/Sub, Firestore, Cloud Workflows |
| Retain | Ongoing | Low | Anthos, Anthos Config Management |

## DORA Metrics Thresholds

Based on the Accelerate State of DevOps Report, teams are classified into four performance tiers:

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | On-demand (multiple deploys/day) | Between once/day and once/week | Between once/week and once/month | Between once/month and once/6 months |
| **Lead Time for Changes** | Less than one hour | Between one day and one week | Between one week and one month | Between one month and six months |
| **Change Failure Rate** | 0-5% | 5-10% | 10-15% | 16-30% |
| **Mean Time to Recovery (MTTR)** | Less than one hour | Less than one day | Between one day and one week | More than one week |

### Using DORA Metrics for Modernization Prioritization

1. **Modules with Low DORA performance + High business value** = Highest modernization priority. These modules are both critical and difficult to change safely.
2. **Modules with Low DORA performance + Low business value** = Candidates for retirement or replacement (ELIMINATE in TIME model).
3. **Modules with Elite/High DORA performance** = Well-maintained; consider replatforming rather than refactoring to preserve team velocity.
4. **Change Failure Rate > 15%** = Strong signal of technical debt; correlate with test coverage and code complexity.

### DORA-to-TIME Model Mapping

| DORA Performance | High Business Value | Low Business Value |
|-----------------|--------------------|--------------------|
| Elite/High | INVEST | TOLERATE |
| Medium | MIGRATE (replatform) | TOLERATE or ELIMINATE |
| Low | MIGRATE (refactor) | ELIMINATE |

## Test Coverage Correlation Methodology

Test coverage data enhances the Fragility dimension of the risk assessment.

### Adjustment Formula

```
Adjusted Fragility = Base Fragility * (1 + (1 - test_coverage_ratio) * 0.5)
```

Where:
- `Base Fragility` = Churn frequency x bug-fix ratio x author concentration (scored 1-10)
- `test_coverage_ratio` = Test coverage percentage as a decimal (e.g., 0.75 for 75%)

### Example Calculations

**Module A: High churn, low coverage**
- Base Fragility: 8.0
- Test Coverage: 15% (ratio = 0.15)
- Adjusted Fragility: 8.0 * (1 + (1 - 0.15) * 0.5) = 8.0 * 1.425 = **11.4** (capped at 10)
- Interpretation: Very high risk, low safety net for changes

**Module B: High churn, high coverage**
- Base Fragility: 7.0
- Test Coverage: 85% (ratio = 0.85)
- Adjusted Fragility: 7.0 * (1 + (1 - 0.85) * 0.5) = 7.0 * 1.075 = **7.5**
- Interpretation: Moderate risk, good safety net mitigates churn risk

**Module C: Low churn, low coverage**
- Base Fragility: 3.0
- Test Coverage: 20% (ratio = 0.20)
- Adjusted Fragility: 3.0 * (1 + (1 - 0.20) * 0.5) = 3.0 * 1.40 = **4.2**
- Interpretation: Low-moderate risk, but coverage gap is a concern if churn increases

### Coverage Thresholds

| Coverage Range | Risk Classification | Recommendation |
|---------------|-------------------|----------------|
| >80% | Low coverage risk | Safe for refactoring with existing tests |
| 50-80% | Moderate coverage risk | Add tests before major changes |
| 30-50% | High coverage risk | Significant testing effort needed before migration |
| <30% | Very high coverage risk | Consider writing characterization tests before any changes |

### Data Sources

- **Java/JVM**: JaCoCo XML/CSV reports, Cobertura reports
- **JavaScript/TypeScript**: Istanbul/nyc coverage reports (lcov format)
- **Python**: coverage.py reports (XML or JSON format)
- **Go**: go test -coverprofile output
- **.NET**: dotCover, OpenCover reports
