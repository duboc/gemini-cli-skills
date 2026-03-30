# Business Risk Assessor

A Gemini CLI skill for identifying high-risk, high-value modules for modernization by correlating transaction volumes, business rule complexity, and code churn history.

## What It Does

This skill analyzes codebases to produce a prioritized modernization roadmap that maximizes ROI:

1. **Core domain identification** -- Classifies modules as CORE, COMMODITY, SUPPORTING, or GENERIC based on transaction volume and business rule complexity.
2. **Churn analysis** -- Mines Git history to calculate change frequency, bug-fix ratios, author concentration, and revert frequency per file and module.
3. **Heat map generation** -- Scores every module across business value, complexity, and fragility dimensions into a combined priority ranking.
4. **Risk quadrant classification** -- Places modules in a 2x2 matrix (business value vs fragility) with recommended actions per quadrant.
5. **Modernization sequencing** -- Produces an ordered list of modules to modernize, highlighting quick wins and inter-module dependencies.

## When Does It Activate?

The skill activates when you ask Gemini to assess business risk, find high-churn areas, or prioritize modules for modernization.

| Trigger | Example |
|---------|---------|
| Assess business risk | "Assess the business risk of each module in this monolith" |
| Identify core domains | "Which modules are the core domain of this application?" |
| Find high-churn areas | "Find the files and modules with the most churn in this repo" |
| Prioritize modernization | "Which modules should we modernize first for maximum ROI?" |
| Generate heat map | "Generate a code heat map showing risk and business value" |
| Knowledge silo detection | "Which files have only one author contributing to them?" |

## Topics Covered

| Area | Details |
|------|---------|
| **Transaction Volume** | APM metrics, access log aggregation, code-level proxies (endpoint count, controller complexity) |
| **Business Rule Complexity** | Cyclomatic complexity, decision point density, domain model complexity, integration count |
| **Git Churn Metrics** | Change frequency, bug-fix ratio, author count, revert frequency, average change size |
| **Issue Tracker Correlation** | Bug tickets per module, time-to-fix, escalation frequency, defect source ratio |
| **Domain Classification** | CORE, COMMODITY, SUPPORTING, GENERIC module categorization |
| **Churn Classification** | HOT, WARM, COOL, COLD based on change frequency and bug-fix ratio thresholds |
| **Risk Quadrant** | 2x2 matrix mapping business value against fragility with action recommendations |
| **Modernization Sequencing** | ROI-ordered module list with dependency awareness and quick-win identification |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/business-risk-assessor
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- business-risk-assessor
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- business-risk-assessor --scope user
```

### Option C: Manual

```bash
cp -r skills/business-risk-assessor ~/.gemini/skills/business-risk-assessor
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to assess module risk or prioritize modernization.

### Full risk assessment

```
Assess the business risk of every module in this monolith.
Identify which ones we should modernize first.
```

### Churn-focused analysis

```
Analyze the git history of this repo and show me a heat map of
the most frequently changed files and their bug-fix ratios.
```

### Core domain identification

```
Which modules in this codebase are the core domain? Classify
each module as CORE, COMMODITY, SUPPORTING, or GENERIC.
```

### Knowledge silo detection

```
Find all files where only one developer has made changes.
Flag any that are also high-churn or high-complexity.
```

### Pre-modernization prioritization

```
We have budget to modernize 3 modules this quarter. Which 3
give us the highest ROI based on risk, value, and complexity?
```

## Included References

| File | Description |
|------|-------------|
| **references/risk-scoring-rubric.md** | Detailed scoring formulas, threshold definitions, normalization techniques, and example calculations for each risk dimension |

## Included Scripts

| File | Description |
|------|-------------|
| **scripts/git-churn-analyzer.sh** | Shell script that analyzes Git history to extract per-file change frequency, bug-fix ratios, author counts, and churn scores |

## Related Skills

| Skill | Relationship |
|-------|-------------|
| **monolith-sbom** | Use to inventory all technology components before assessing business risk |
| **esb-cataloger** | Use to catalog integration points that feed into integration density scoring |
| **batch-app-scanner** | Use to identify batch modules that may have different risk profiles than online modules |
| **stored-proc-analyzer** | Use to assess complexity hiding in database stored procedures outside the main codebase |
