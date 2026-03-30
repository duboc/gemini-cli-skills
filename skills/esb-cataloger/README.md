# ESB Cataloger

A Gemini CLI skill for cataloging ESB (Enterprise Service Bus) integrations. Scans ESB configuration files across major platforms, extracts endpoint definitions, and produces a comprehensive consumer/producer matrix with protocol and payload analysis.

## What It Does

This skill reads ESB configuration files from your project, auto-detects the platform, and produces a full integration catalog:

1. **Config discovery** — Scans for configuration files across MuleSoft, TIBCO, IBM IIB/ACE, WSO2, Oracle OSB, Apache Camel, and Dell Boomi.
2. **Endpoint extraction** — Parses each integration flow to identify source/target systems, protocols, payload formats, transformations, and error handling.
3. **Consumer/producer matrix** — Generates a comprehensive table of all integrations with their characteristics.
4. **Landscape summary** — Aggregates integrations by protocol, payload format, and system connectivity.
5. **Risk and modernization assessment** — Flags hardcoded credentials, missing error handling, deprecated protocols, and classifies each integration by modernization complexity.

## When Does It Activate?

The skill activates when you ask Gemini to catalog, inventory, map, or audit ESB integrations. It auto-detects the ESB platform from file patterns — no setup questions required.

| Trigger | Example |
|---------|---------|
| Catalog ESB integrations | "Catalog all the ESB integrations in this project" |
| Inventory middleware | "Give me an inventory of all middleware integrations" |
| Map consumers and producers | "Map all the consumers and producers in our MuleSoft flows" |
| Audit ESB configurations | "Audit the ESB configurations and flag any risks" |
| Integration landscape | "Show me the full integration landscape for this ESB" |
| Find hardcoded credentials | "Scan the ESB configs for hardcoded credentials or URLs" |

## Topics Covered

| Area | Details |
|------|---------|
| **Platform Detection** | Auto-detects MuleSoft, TIBCO BW, IBM IIB/ACE, WSO2, Oracle OSB, Apache Camel, Dell Boomi |
| **Protocol Analysis** | SOAP, REST, JMS, JDBC, FTP, SFTP, MQ, file-based, and custom protocols |
| **Payload Formats** | XML, JSON, CSV, binary, SOAP envelope, flat file classification |
| **Operation Types** | Request-response, one-way, publish-subscribe, poll patterns |
| **Transformations** | None, format conversion, data mapping, enrichment detection |
| **Security Audit** | Basic auth, OAuth, certificate, API key inventory; flags hardcoded credentials |
| **Error Handling** | DLQ, retry policies, alerting configuration analysis |
| **Modernization** | Classifies integrations as SIMPLE_REPLACEMENT, NEEDS_REDESIGN, or COMPLEX |

## Installation

### Option A: Gemini CLI native

```bash
gemini skills install https://github.com/duboc/gemini-cli-skills.git --path skills/esb-cataloger
```

### Option B: One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-cataloger
```

For user-scope installation (available across all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/duboc/gemini-cli-skills/main/scripts/install.sh | bash -s -- esb-cataloger --scope user
```

### Option C: Manual

```bash
cp -r skills/esb-cataloger ~/.gemini/skills/esb-cataloger
```

## Usage Examples

Once installed, the skill activates when you ask Gemini to catalog or audit ESB integrations.

### Full integration catalog

```
Catalog all ESB integrations in this project. Show me the full
consumer/producer matrix.
```

### Audit for risks

```
Audit the ESB configurations and flag hardcoded credentials,
missing error handling, and deprecated protocols.
```

### Modernization assessment

```
Analyze these ESB integrations and classify each one by
modernization complexity.
```

### Multi-vendor scan

```
This project has both MuleSoft and TIBCO integrations. Catalog
everything into a single matrix.
```

## Included References

| File | Description |
|------|-------------|
| **esb-config-formats.md** | Reference guide for ESB configuration file patterns, XML namespaces, key parsing elements, and platform detection heuristics across all major ESB platforms |
