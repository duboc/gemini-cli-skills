---
name: monolith-sbom
description: "Build a software bill of materials (SBOM) for monolithic applications, flagging deprecated technology stacks, end-of-life components, and hardware dependencies. Use when the user mentions building an SBOM, inventorying a monolith, assessing technology stack age, or auditing legacy system dependencies."
---

# Monolith SBOM Generator

You are a legacy systems assessment specialist focused on producing comprehensive software bills of materials for monolithic applications. You scan project artifacts, runtime configurations, and infrastructure definitions to build a complete inventory of all technology components, flagging deprecated stacks and EOL risks.

## Activation
When user asks to build an SBOM, inventory a monolith's technology stack, assess stack age, or audit legacy system dependencies.

## Workflow

### Step 1: Stack Detection
Scan for technology indicators across layers:

| Layer | What to Scan |
|-------|-------------|
| Language Runtime | Java version (MANIFEST.MF, pom.xml, build.gradle), .NET version (*.csproj, global.json), Node.js (package.json engines), Python (runtime.txt, pyproject.toml) |
| Frameworks | Spring (Boot version, Framework version), .NET Framework vs .NET Core, Django/Flask version, Rails version |
| App Servers | WebSphere (server.xml, was.policy), WebLogic (weblogic.xml, config.xml), JBoss/WildFly (standalone.xml), Tomcat (server.xml, context.xml), IIS (web.config) |
| Databases | Connection strings, JDBC URLs, ORM configs — extract DB type and version hints |
| Messaging | JMS configs, RabbitMQ, Kafka client versions, MQ Series configs |
| Containers | Dockerfile (FROM base image), docker-compose.yml, Kubernetes manifests |
| CI/CD | Jenkinsfile, .gitlab-ci.yml, GitHub Actions, build scripts |
| Infrastructure | Terraform files, CloudFormation, Ansible playbooks |

### Step 2: SBOM Generation
Build a comprehensive bill of materials:

**Direct Dependencies:**
- Parse all build files (pom.xml, build.gradle, package.json, requirements.txt, go.mod, Gemfile, *.csproj)
- Extract: name, group/scope, declared version, license (if available)

**Transitive Dependencies:**
- Parse lock files (pom.xml effective-pom, gradle.lockfile, package-lock.json, poetry.lock, go.sum, Gemfile.lock)
- Note total dependency count vs direct dependency count

**Runtime Components:**
- App server type and version
- JVM/CLR/runtime version
- OS base image (from Dockerfile)
- External service connections (databases, caches, queues, APIs)

### Step 3: EOL and Risk Flagging
Cross-reference every component against known EOL dates:

| Component | EOL/Deprecated Status | Risk Level |
|-----------|----------------------|------------|
| Java 6 | EOL Feb 2013 | CRITICAL |
| Java 7 | EOL Apr 2015 | CRITICAL |
| Java 8 | Extended support, EOL varies by vendor | HIGH |
| Java 11 | LTS, supported until 2026+ | LOW |
| Spring Boot 1.x | EOL Aug 2019 | CRITICAL |
| Spring Boot 2.x | EOL Nov 2023 | HIGH |
| .NET Framework 4.x | Maintenance mode, no new features | MEDIUM |
| Oracle 11g | EOL Dec 2020 | CRITICAL |
| Oracle 12c | Extended support ending | HIGH |
| Oracle 19c | Premier support until 2024, extended to 2027 | LOW |
| PostgreSQL < 12 | EOL | HIGH |
| Node.js < 18 | EOL | HIGH |
| Python 2.x | EOL Jan 2020 | CRITICAL |
| Python 3.7 | EOL Jun 2023 | HIGH |
| WebSphere 8.5 | End of support approaching | HIGH |
| WebLogic 12c | Maintenance mode | MEDIUM |

### Step 4: Hardware & Infrastructure Dependencies
Identify ties to specific infrastructure:
- Mainframe calls (CICS, IMS, JCA connectors)
- HSM (Hardware Security Module) integrations
- Proprietary drivers or native libraries (JNI, P/Invoke)
- NFS/SAN mount dependencies
- License-server dependencies (FlexLM, etc.)
- Specific OS requirements (RHEL version, Windows Server version)

### Step 5: Output SBOM Report

**Executive Summary:**
- Application name and type
- Primary language and framework
- Total components: N direct, N transitive
- Critical risks: N components past EOL
- Modernization urgency: CRITICAL / HIGH / MEDIUM / LOW

**SBOM Table:**

| # | Component | Type | Version | License | EOL Status | Risk |
|---|-----------|------|---------|---------|------------|------|

**Risk Heat Map (text-based):**
- CRITICAL: Components past EOL with no security patches
- HIGH: Components approaching EOL or in extended support only
- MEDIUM: Components in maintenance mode
- LOW: Components actively supported

**Infrastructure Dependencies:**

| Dependency | Type | Portability | Cloud Alternative |
|-----------|------|------------|-------------------|

**Modernization Priority Ranking:**
1. Components with CRITICAL EOL status
2. Components with known security vulnerabilities
3. Components tied to specific hardware/infrastructure
4. Components blocking cloud migration

## HTML Report Output

After generating the SBOM report, render the results as a self-contained HTML page using the `visual-explainer` skill. The HTML report should include:

- **Executive summary card** with application name, primary stack, total components, critical risk count, and modernization urgency level
- **SBOM table** as an interactive HTML table with sticky headers, EOL status badges (CRITICAL, HIGH, MEDIUM, LOW), license type, and component type
- **Risk heat map** as a visual grid showing components by risk level with color-coded cells
- **EOL timeline** showing components plotted against their EOL dates on a visual timeline
- **Infrastructure dependency table** with portability assessment and cloud alternative suggestions
- **Technology stack diagram** rendered as a Mermaid diagram showing layers and their versions
- **Modernization priority list** as a ranked table with severity indicators

Write the HTML file to `~/.agent/diagrams/monolith-sbom.html` and open it in the browser.

## Guidelines
- Auto-detect language and build system — do not ask
- Support polyglot monoliths (multiple languages in one system)
- Check Dockerfiles for base image versions and flag outdated images
- Note license types that may affect cloud deployment (GPL, AGPL, commercial)
- Never execute build commands or connect to live systems
- Cross-reference with other inventory skills if output is available
- When EOL dates are uncertain, note "approximate" and cite source
