# Risk Scoring Rubric

Detailed scoring formulas, threshold definitions, normalization techniques, and example calculations for the Business Risk Assessor skill.

## Scoring Dimensions

Each module is scored on three dimensions, each rated 1-10.

### 1. Business Value Score

Measures how important a module is to the business based on usage volume and criticality.

**Formula:**

```
Business Value = (Normalized Transaction Volume * 0.6) + (Business Criticality * 0.4)
```

**Transaction Volume Normalization (1-10):**

| Data Source | Normalization Method |
|-------------|---------------------|
| APM data (requests/sec) | `score = min(10, ceil(module_rps / max_rps * 10))` |
| Access logs (hits/day) | `score = min(10, ceil(module_hits / max_hits * 10))` |
| Code proxies (no telemetry) | Count API endpoints, controller actions, and integration points; rank modules by count percentile |

**Business Criticality (1-10):**

| Score | Criteria |
|-------|----------|
| 9-10 | Revenue-generating, customer-facing, regulatory/compliance |
| 7-8 | Core business logic, financial calculations, order processing |
| 5-6 | Internal workflows, reporting, back-office operations |
| 3-4 | Administrative functions, configuration management |
| 1-2 | Logging, monitoring, utility functions |

### 2. Complexity Score

Measures how difficult and risky a module is to change.

**Formula:**

```
Complexity = (Normalized Cyclomatic Complexity * 0.4)
           + (Decision Density * 0.3)
           + (Integration Density * 0.3)
```

**Cyclomatic Complexity Normalization (1-10):**

| Average CC per Function | Score |
|------------------------|-------|
| 1-4 | 1-2 |
| 5-9 | 3-4 |
| 10-14 | 5-6 |
| 15-24 | 7-8 |
| 25+ | 9-10 |

**Decision Density (1-10):**

Decision points (if, switch/case, ternary, catch) per 100 lines of code:

| Decisions per 100 LOC | Score |
|-----------------------|-------|
| 0-5 | 1-2 |
| 6-10 | 3-4 |
| 11-15 | 5-6 |
| 16-25 | 7-8 |
| 26+ | 9-10 |

**Integration Density (1-10):**

Count of external integration points (API calls, database queries, message queue interactions, file system operations, third-party service calls):

| Integration Points | Score |
|--------------------|-------|
| 0-2 | 1-2 |
| 3-5 | 3-4 |
| 6-10 | 5-6 |
| 11-20 | 7-8 |
| 21+ | 9-10 |

### 3. Fragility Score

Measures how unstable and error-prone a module is based on change history.

**Formula:**

```
Fragility = (Churn Frequency * 0.3)
          + (Bug Fix Ratio * 0.3)
          + (Author Concentration * 0.2)
          + (Revert Frequency * 0.2)
```

**Churn Frequency Normalization (1-10):**

Changes per month over the analysis window:

| Changes/Month | Score |
|--------------|-------|
| 0-2 | 1-2 |
| 3-5 | 3-4 |
| 6-10 | 5-6 |
| 11-20 | 7-8 |
| 21+ | 9-10 |

**Bug Fix Ratio (1-10):**

Percentage of commits containing bug-fix indicators (fix, bug, hotfix, patch, revert) in the commit message:

| Bug Fix % | Score |
|-----------|-------|
| 0-5% | 1-2 |
| 6-15% | 3-4 |
| 16-25% | 5-6 |
| 26-40% | 7-8 |
| 41%+ | 9-10 |

**Author Concentration (1-10):**

Inverse of author count, measuring knowledge silo risk (bus factor):

| Distinct Authors | Score |
|-----------------|-------|
| 8+ | 1-2 |
| 5-7 | 3-4 |
| 3-4 | 5-6 |
| 2 | 7-8 |
| 1 | 9-10 |

**Revert Frequency (1-10):**

Percentage of commits that are reverts or have been reverted:

| Revert % | Score |
|----------|-------|
| 0% | 1 |
| 1-2% | 3-4 |
| 3-5% | 5-6 |
| 6-10% | 7-8 |
| 11%+ | 9-10 |

## Combined Score Calculation

**Formula:**

```
Combined Score = (Business Value * 0.4) + (Complexity * 0.3) + (Fragility * 0.3)
```

**Priority Thresholds:**

| Combined Score | Priority |
|---------------|----------|
| 8.0-10.0 | CRITICAL -- modernize immediately |
| 6.0-7.9 | HIGH -- schedule for next quarter |
| 4.0-5.9 | MEDIUM -- plan within 6 months |
| 2.0-3.9 | LOW -- monitor, no immediate action |
| 1.0-1.9 | MINIMAL -- consider decommissioning |

## Churn Classification Thresholds

| Classification | Changes/Month | Bug Fix Ratio | Condition |
|---------------|--------------|---------------|-----------|
| HOT | >20 | >30% | Both conditions met |
| WARM | 10-20 | any | Either condition met |
| WARM | any | >20% | Either condition met |
| COOL | <10 | <10% | Both conditions met |
| COLD | <2 | any | Frequency condition met |

## Core Domain Classification Thresholds

| Classification | Volume Threshold | Complexity Threshold |
|---------------|-----------------|---------------------|
| CORE | Business Value >= 7 | Complexity >= 7 |
| COMMODITY | Business Value >= 7 | Complexity < 7 |
| SUPPORTING | Business Value < 7 | Complexity >= 7 |
| GENERIC | Business Value < 7 | Complexity < 7 |

## Normalization Techniques

### Cross-Module Comparison

When modules vary significantly in size, normalize metrics per unit:

- **Per-LOC ratios**: Divide raw counts by lines of code (e.g., decisions per 100 LOC, integrations per 1000 LOC)
- **Per-file ratios**: For churn metrics, normalize by file count in the module to avoid penalizing larger modules
- **Percentile ranking**: Rank all modules by each metric, then assign scores based on percentile position (top 10% = score 10, bottom 10% = score 1)

### Time Window Normalization

- Default analysis window: 12 months
- For recently created modules (<6 months old), extrapolate churn rates but flag the estimate as low-confidence
- Exclude periods of major refactoring (identifiable by spike-then-drop patterns) from bug-fix ratio calculations if they skew results

### Language-Specific Adjustments

- Cyclomatic complexity norms vary by language; compare within language groups, not across them
- Lines of code should use logical lines (statements) rather than physical lines when possible
- Framework-generated code (migrations, scaffolding) should be excluded from complexity calculations

## Example Calculation

### Module: `order-processing`

**Raw Metrics:**
- 45 requests/sec (highest in system is 60 requests/sec)
- Revenue-generating, customer-facing
- Average cyclomatic complexity: 18 per function
- 22 decision points per 100 LOC
- 15 external integrations (3 databases, 4 APIs, 2 queues, 6 file operations)
- 25 changes/month over last 12 months
- 35% of commits are bug fixes
- 2 distinct authors
- 4% revert rate

**Score Calculation:**

1. Business Value:
   - Transaction Volume: ceil(45/60 * 10) = 8
   - Business Criticality: 9 (revenue-generating, customer-facing)
   - Business Value = (8 * 0.6) + (9 * 0.4) = 4.8 + 3.6 = **8.4**

2. Complexity:
   - Cyclomatic Complexity: 8 (CC 15-24 range)
   - Decision Density: 8 (16-25 per 100 LOC range)
   - Integration Density: 8 (11-20 range)
   - Complexity = (8 * 0.4) + (8 * 0.3) + (8 * 0.3) = 3.2 + 2.4 + 2.4 = **8.0**

3. Fragility:
   - Churn Frequency: 10 (21+ changes/month)
   - Bug Fix Ratio: 8 (26-40% range)
   - Author Concentration: 8 (2 authors)
   - Revert Frequency: 6 (3-5% range)
   - Fragility = (10 * 0.3) + (8 * 0.3) + (8 * 0.2) + (6 * 0.2) = 3.0 + 2.4 + 1.6 + 1.2 = **8.2**

4. Combined Score:
   - Combined = (8.4 * 0.4) + (8.0 * 0.3) + (8.2 * 0.3) = 3.36 + 2.40 + 2.46 = **8.22**
   - Priority: **CRITICAL**

5. Classifications:
   - Core Domain: **CORE** (Business Value 8.4 >= 7, Complexity 8.0 >= 7)
   - Churn: **HOT** (25 changes/month > 20, 35% bug-fix ratio > 30%)
   - Risk Quadrant: **Modernize Carefully** (High Value, High Fragility)
