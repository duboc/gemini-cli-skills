# Monolith SBOM Generator

A Gemini CLI skill for building software bills of materials (SBOM) for monolithic applications, flagging deprecated technology stacks, end-of-life components, and hardware dependencies.

## What It Does

This skill scans project artifacts, runtime configurations, and infrastructure definitions to build a complete inventory of all technology components in a monolithic application:

1. **Stack detection** — Identifies language runtimes, frameworks, app servers, databases, messaging systems, and infrastructure from project files.
2. **SBOM generation** — Parses build files and lock files to catalog all direct and transitive dependencies with versions and licenses.
3. **EOL and risk flagging** — Cross-references every component against known end-of-life dates and assigns risk levels (CRITICAL, HIGH, MEDIUM, LOW).
4. **Hardware & infrastructure dependencies** — Identifies ties to mainframes, HSMs, proprietary drivers, license servers, and specific OS versions.
5. **Structured report** — Produces an executive summary, SBOM table, risk heat map, infrastructure dependency matrix, and modernization priority ranking.

## When Does It Activate?

The skill activates when you ask Gemini to build an SBOM, inventory a monolith, assess technology stack age, or audit legacy system dependencies.

| Trigger | Example |
|---------|---------|
| Build an SBOM | "Build a software bill of materials for this application" |
| Inventory a monolith | "Inventory all the technology components in this monolith" |
| Assess stack age | "How old is the technology stack in this project?" |
| Audit dependencies | "Audit this legacy system for end-of-life dependencies" |
| Check EOL risks | "Which components in this project are past end of life?" |
| Pre-migration assessment | "What needs to be upgraded before we can move this to the cloud?" |

## Topics Covered

| Area | Details |
|------|---------|
| **Language Runtimes** | Java, .NET, Node.js, Python, Go, Ruby version detection from build and config files |
| **Frameworks** | Spring Boot/Framework, .NET Framework/.NET Core, Django, Flask, Rails version identification |
| **App Servers** | WebSphere, WebLogic, JBoss/WildFly, Tomcat, IIS detection and version extraction |
| **Databases** | Oracle, PostgreSQL, MySQL, SQL Server, MongoDB version hints from connection strings and ORM configs |
| **Messaging** | JMS, RabbitMQ, Kafka, MQ Series client version detection |
| **Containers & CI/CD** | Dockerfile base images, docker-compose, Kubernetes manifests, Jenkinsfile, GitHub Actions |
| **Infrastructure** | Terraform, CloudFormation, Ansible playbook scanning |
| **EOL Assessment** | Cross-referencing all components against known end-of-life and extended support dates |
| **Hardware Dependencies** | Mainframe calls, HSM integrations, JNI/P-Invoke, NFS/SAN mounts, license servers |
| **License Risks** | GPL, AGPL, commercial license identification that may affect cloud deployment |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/monolith-sbom
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- monolith-sbom
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- monolith-sbom --scope user
```

### Option C: Manual

```bash
cp -r skills/monolith-sbom ~/.gemini/skills/monolith-sbom
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to build an SBOM or assess a monolith's technology stack.

### Full SBOM for a Java monolith

```
Build a complete software bill of materials for this application.
Flag anything past end of life.
```

### Pre-cloud migration assessment

```
We want to move this monolith to GCP. Scan the project and tell me
which components are tied to specific infrastructure or are past EOL.
```

### Technology stack age check

```
How old is the technology stack in this project? Which components
need to be upgraded most urgently?
```

### Dependency audit for compliance

```
Audit all dependencies in this monolith. I need component names,
versions, licenses, and EOL status for a compliance review.
```

### Polyglot monolith inventory

```
This system has Java backend code, a Node.js frontend, and Python
batch jobs. Build a unified SBOM across all three.
```

## Included References

| File | Description |
|------|-------------|
| **eol-database.md** | Comprehensive end-of-life date reference for Java, .NET, databases, app servers, frameworks, runtimes, middleware, and operating systems |

## Related Skills

| Skill | Relationship |
|-------|-------------|
| **spring-boot-upgrader** | Use after SBOM identifies outdated Spring Boot versions to plan the upgrade |
| **software-troubleshooter** | Use when SBOM findings reveal runtime issues tied to deprecated components |
