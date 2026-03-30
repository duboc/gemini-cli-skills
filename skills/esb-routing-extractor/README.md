# ESB Routing Extractor

A Gemini CLI skill for deep-extracting ESB routing logic. Analyzes ESB configuration files to classify each route by complexity, separating simple transparent routing (dumb pipes) from routes with embedded business logic (smart pipes) that require careful migration planning.

## What It Does

This skill performs detailed analysis on the ESB middleware layer, going beyond cataloging to extract and classify the actual routing logic:

1. **Route inventory** — Enumerates all ESB routes/flows from configuration files, capturing endpoints, mediators, and error handling.
2. **Logic classification** — Classifies each route into five categories: PASS-THROUGH, TRANSFORM, ENRICH, ORCHESTRATE, or BUSINESS_RULE.
3. **Business rule extraction** — For complex routes, extracts embedded logic from XSLT, DataWeave, Groovy scripts, ESQL, and content-based routing predicates.
4. **Migration complexity scoring** — Scores each route on a 1-10 scale using weighted factors (logic density, external dependencies, state management, error handling, transformation depth, test coverage).
5. **Dependency mapping** — Produces Mermaid diagrams showing route-to-system dependencies.

## When Does It Activate?

The skill activates when you ask Gemini to extract, analyze, or classify ESB routing logic and embedded business rules.

| Trigger | Example |
|---------|---------|
| Extract ESB business rules | "Extract all the business rules embedded in the ESB routing logic" |
| Analyze routing complexity | "Analyze the routing complexity of our ESB integrations" |
| Separate dumb pipes from smart pipes | "Separate the dumb pipes from the smart pipes in our middleware" |
| Assess middleware for migration | "Assess the ESB middleware logic and score it for migration complexity" |
| Classify ESB routes | "Classify each ESB route by its logic complexity" |
| Extract content-based routing | "Show me all the content-based routing decisions in the ESB configs" |

## Topics Covered

| Area | Details |
|------|---------|
| **Route Classification** | Five-category system: PASS-THROUGH, TRANSFORM, ENRICH, ORCHESTRATE, BUSINESS_RULE |
| **Business Rule Extraction** | XSLT conditionals, DataWeave if/else, Groovy scripts, ESQL procedures, content-based routing predicates |
| **Content-Based Routing** | XPath expressions, JSON path, header-based routing, routing predicates with business meaning |
| **Migration Scoring** | Weighted complexity scoring across six factors (logic density, dependencies, state, error handling, transforms, tests) |
| **Platform Support** | MuleSoft DataWeave, TIBCO XSLT, IBM ESQL, WSO2 mediators, Apache Camel routes, Oracle OSB pipelines |
| **Dependency Analysis** | Route-to-system dependency maps, external dependency counts, side-effect detection |
| **Migration Sequencing** | Recommended migration order from lowest to highest complexity |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/esb-routing-extractor
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-routing-extractor
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-routing-extractor --scope user
```

### Option C: Manual

```bash
cp -r skills/esb-routing-extractor ~/.gemini/skills/esb-routing-extractor
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to extract or analyze ESB routing logic.

### Full route classification

```
Analyze all ESB routes in this project and classify each one by
logic complexity. Separate the dumb pipes from the smart pipes.
```

### Extract business rules

```
Extract all embedded business rules from the ESB routing
configurations. Document each rule in plain language with its
input/output contract.
```

### Migration complexity assessment

```
Score each ESB route for migration complexity and recommend
a migration sequence from easiest to hardest.
```

### Combined with esb-cataloger

```
Use the ESB cataloger output as a starting point, then deep-extract
the routing logic and classify each route for migration.
```

## Included References

| File | Description |
|------|-------------|
| **esb-logic-patterns.md** | Reference guide for ESB logic classification criteria, common mediator/processor types, platform-specific logic patterns, and business rule extraction templates |
