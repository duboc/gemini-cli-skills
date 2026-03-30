# Batch Framework Detection Patterns

Reference guide for identifying batch frameworks, their configuration files, and version detection heuristics.

## Detection Heuristics by Framework

### Spring Batch

**Build file indicators:**

| Build System | Dependency |
|-------------|------------|
| Maven | `org.springframework.batch:spring-batch-core` |
| Gradle | `implementation 'org.springframework.batch:spring-batch-core'` |
| Spring Boot Starter | `org.springframework.boot:spring-boot-starter-batch` |

**Source code patterns:**
- `@EnableBatchProcessing` annotation on a `@Configuration` class
- Bean definitions returning `Job`, `Step`, `ItemReader`, `ItemWriter`, `ItemProcessor`
- `JobBuilderFactory`, `StepBuilderFactory` usage (Spring Batch 4.x and earlier)
- `JobBuilder`, `StepBuilder` usage (Spring Batch 5.x)
- `@StepScope`, `@JobScope` annotations
- `ChunkOrientedTasklet`, `Tasklet` implementations

**Config files:**
- `batch-*.xml` — XML-based job definitions
- `application.yml` / `application.properties` with `spring.batch.*` properties
- `schema-@@platform@@.sql` — Spring Batch metadata schema

**Version detection from dependencies:**

| Dependency Version | Spring Batch Version | Spring Boot Version | Status |
|-------------------|---------------------|--------------------| -------|
| spring-batch-core 2.x | 2.x | N/A (pre-Boot) | EOL — requires major upgrade |
| spring-batch-core 3.x | 3.x | 1.x | EOL — requires major upgrade |
| spring-batch-core 4.x | 4.x | 2.x | Maintenance — plan upgrade |
| spring-batch-core 5.0.x | 5.0 | 3.0.x–3.1.x | Current |
| spring-batch-core 5.1.x | 5.1 | 3.2.x–3.4.x | Current |
| spring-batch-core 5.2.x | 5.2 | 3.5.x | Current |

---

### EJB Timer Service

**Build file indicators:**

| Build System | Dependency |
|-------------|------------|
| Maven (Java EE) | `javax.ejb:javax.ejb-api` or `javax:javaee-api` |
| Maven (Jakarta EE) | `jakarta.ejb:jakarta.ejb-api` or `jakarta.platform:jakarta.jakartaee-api` |

**Source code patterns:**
- `@Schedule(hour = "2", minute = "0")` — declarative timer
- `@Schedules({@Schedule(...)})` — multiple schedules
- `@Timeout` — programmatic timer callback
- `TimerService` injection — programmatic timer creation
- `@Stateless`, `@Singleton` with timer methods
- `@MessageDriven` — JMS-triggered batch processing

**Config files:**
- `ejb-jar.xml` — EJB deployment descriptor with `<timer-schedule>` elements
- `META-INF/ejb-jar.xml` — standard location
- `WEB-INF/ejb-jar.xml` — WAR-packaged EJBs
- App-server-specific: `ibm-ejb-jar-bnd.xml` (WebSphere), `jboss-ejb3.xml` (JBoss)

**Version detection:**

| API Package | EE Version | Status |
|-------------|-----------|--------|
| `javax.ejb` (EJB 2.x API) | Java EE 5 or earlier | Legacy — significant rewrite needed |
| `javax.ejb` (EJB 3.x API) | Java EE 6/7/8 | Aging — plan migration |
| `jakarta.ejb` | Jakarta EE 9+ | Current |

---

### Quartz Scheduler

**Build file indicators:**

| Build System | Dependency |
|-------------|------------|
| Maven | `org.quartz-scheduler:quartz` |
| Spring integration | `org.springframework:spring-context-support` (includes `SchedulerFactoryBean`) |
| Spring Boot | `org.springframework.boot:spring-boot-starter-quartz` |

**Source code patterns:**
- Classes implementing `org.quartz.Job` interface
- `@DisallowConcurrentExecution` annotation
- `@PersistJobDataAfterExecution` annotation
- `Scheduler`, `JobDetail`, `Trigger`, `CronTrigger` usage
- Spring `@Scheduled(cron = "...")` — uses Spring's built-in scheduler, not Quartz
- Spring `@Scheduled(fixedRate = ...)` / `@Scheduled(fixedDelay = ...)`

**Config files:**
- `quartz.properties` — Quartz configuration (thread pool, job store, clustering)
- `quartz-jobs.xml` — XML-defined jobs and triggers
- `application.yml` with `spring.quartz.*` properties (Spring Boot integration)

**Version detection:**

| Dependency Version | Status |
|-------------------|--------|
| quartz 1.x | EOL — requires upgrade |
| quartz 2.3.x | Stable — current |
| quartz 2.4.x+ | Current |

---

### JSR-352 (javax.batch / jakarta.batch)

**Build file indicators:**

| Build System | Dependency |
|-------------|------------|
| Maven (Java EE) | `javax.batch:javax.batch-api` |
| Maven (Jakarta EE) | `jakarta.batch:jakarta.batch-api` |
| JBeret (WildFly) | `org.jberet:jberet-core` |
| IBM implementation | `com.ibm.jbatch:com.ibm.jbatch-tck-spi` |

**Source code patterns:**
- Classes implementing `javax.batch.api.chunk.ItemReader` / `ItemWriter` / `ItemProcessor`
- Classes implementing `javax.batch.api.Batchlet`
- `@Named` annotation on batch artifacts
- `BatchRuntime.getJobOperator()` usage
- `JobOperator.start()`, `JobOperator.restart()` calls

**Config files:**
- `META-INF/batch-jobs/*.xml` — job definition XML files
- `META-INF/batch.xml` — batch artifact mapping
- Job XML elements: `<job>`, `<step>`, `<chunk>`, `<batchlet>`, `<flow>`, `<split>`

**Version detection:**

| API Package | Status |
|-------------|--------|
| `javax.batch` 1.0 | Java EE 7 — plan migration to jakarta |
| `jakarta.batch` 2.0 | Jakarta EE 9 — current |
| `jakarta.batch` 2.1 | Jakarta EE 10+ — current |

---

### Control-M (BMC)

**Detection indicators:**
- Files with `.xml` extension containing `<DEFTABLE>` or `<FOLDER>` root elements
- `<JOB` elements with `JOBNAME`, `CMDLINE`, `SCHEDTABLE` attributes
- `.ctmdef` or `.def` export files
- References to `ctmorder`, `ctmcontb`, `ctmcreate` commands in scripts
- Environment variables: `CONTROLM`, `CTM_HOME`, `CTM_SERVER`

**Common fields in job definitions:**
- `JOBNAME` — job identifier
- `CMDLINE` — command to execute (often a shell script calling `java -jar`)
- `SCHEDTABLE` — scheduling calendar
- `TIMEFROM` / `TIMEUNTIL` — execution window
- `DAYS` / `WEEKDAYS` — day-based scheduling
- `INCOND` / `OUTCOND` — job dependencies (predecessor/successor conditions)

---

### Autosys (CA/Broadcom)

**Detection indicators:**
- `.jil` files (Job Information Language)
- Lines starting with `insert_job:` or `update_job:`
- `job_type: CMD` or `job_type: BOX` declarations
- References to `jil`, `autorep`, `sendevent` commands

**Common JIL fields:**
- `insert_job: <name>` — job definition
- `job_type: CMD` — command job (executes a script/command)
- `job_type: BOX` — container job (groups sub-jobs)
- `command: java -jar ...` — the actual execution command
- `start_times: "02:00"` — scheduled start time
- `days_of_week: all` — day-based scheduling
- `condition: s(predecessor_job)` — dependency on another job's success
- `date_conditions: y` — enable calendar-based scheduling

---

## Cron Expression Format Reference

### Standard Unix Cron (5 fields)

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ ┌───────────── day of week (0-7 or SUN-SAT, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

### Spring / Quartz Cron (6 fields)

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12 or JAN-DEC)
│ │ │ │ │ ┌───────────── day of week (1-7 or SUN-SAT, 1 = Sunday in Quartz)
│ │ │ │ │ │
* * * * * *
```

**Note:** Spring uses 0=Sunday while Quartz uses 1=Sunday. Both support `?` for "no specific value" on day-of-month or day-of-week.

### Common Cron Expressions

| Expression (Unix) | Expression (Spring/Quartz) | Meaning |
|-------------------|--------------------------|---------|
| `0 2 * * *` | `0 0 2 * * *` | Daily at 2:00 AM |
| `0 0 * * *` | `0 0 0 * * *` | Daily at midnight |
| `*/15 * * * *` | `0 */15 * * * *` | Every 15 minutes |
| `0 2 * * 1` | `0 0 2 * * MON` | Every Monday at 2:00 AM |
| `0 2 1 * *` | `0 0 2 1 * *` | First day of month at 2:00 AM |
| `0 2 * * 1-5` | `0 0 2 * * MON-FRI` | Weekdays at 2:00 AM |
| `0 0,12 * * *` | `0 0 0,12 * * *` | Twice daily at midnight and noon |
| `0 2 L * *` | `0 0 2 L * ?` | Last day of month at 2:00 AM (Quartz only) |

### EJB @Schedule Mapping

EJB `@Schedule` uses named attributes instead of cron strings:

| Attribute | Cron Field | Default |
|-----------|-----------|---------|
| `second` | Second | `"0"` |
| `minute` | Minute | `"0"` |
| `hour` | Hour | `"0"` |
| `dayOfMonth` | Day of month | `"*"` |
| `month` | Month | `"*"` |
| `dayOfWeek` | Day of week | `"*"` |
| `year` | Year | `"*"` |

Example: `@Schedule(hour = "2", minute = "0", dayOfWeek = "Mon-Fri")` = Weekdays at 2:00 AM

---

## Framework Version Detection from Build Files

### Maven (pom.xml)

Look for version in these locations (in priority order):

1. Direct `<version>` tag on the dependency
2. `<properties>` section (e.g., `<spring-batch.version>5.1.0</spring-batch.version>`)
3. `<dependencyManagement>` section
4. Parent POM `<version>` (for Spring Boot starters, parent version = Boot version)
5. BOM imports in `<dependencyManagement>` (e.g., `spring-boot-dependencies`)

### Gradle (build.gradle / build.gradle.kts)

Look for version in these locations:

1. Direct version string: `implementation 'group:artifact:version'`
2. Version catalog: `libs.versions.toml` with `[versions]` section
3. Platform/BOM: `implementation platform('org.springframework.boot:spring-boot-dependencies:3.2.0')`
4. `ext` block or `buildscript` variables
5. Spring Boot plugin version: `id 'org.springframework.boot' version '3.2.0'`

### Java Version Detection

| Source | Property/Element |
|--------|-----------------|
| Maven | `<maven.compiler.source>`, `<maven.compiler.target>`, `<java.version>` |
| Gradle | `sourceCompatibility`, `targetCompatibility`, `jvmTarget` |
| Manifest | `Build-Jdk`, `Build-Jdk-Spec` in `MANIFEST.MF` |
| Toolchain | `java.toolchain.languageVersion` (Gradle), `maven-toolchains-plugin` (Maven) |
