# SBOM Formats Guide

Reference for CycloneDX, SPDX, PURL, and SLSA standards used in SBOM generation.

## CycloneDX 1.5 JSON — Minimal Component Entry

```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  "version": 1,
  "components": [
    {
      "type": "library",
      "name": "spring-boot-starter-web",
      "group": "org.springframework.boot",
      "version": "3.2.1",
      "purl": "pkg:maven/org.springframework.boot/spring-boot-starter-web@3.2.1",
      "licenses": [
        {
          "license": {
            "id": "Apache-2.0"
          }
        }
      ],
      "hashes": [
        {
          "alg": "SHA-256",
          "content": "a3f2b1c4d5e6f7..."
        }
      ]
    }
  ]
}
```

## SPDX 2.3 JSON — Minimal Package Entry

```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "monolith-sbom",
  "documentNamespace": "https://example.com/sbom/monolith-1.0",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-spring-boot-starter-web",
      "name": "spring-boot-starter-web",
      "versionInfo": "3.2.1",
      "supplier": "Organization: Pivotal Software, Inc.",
      "downloadLocation": "https://repo1.maven.org/maven2/org/springframework/boot/spring-boot-starter-web/3.2.1/",
      "licenseConcluded": "Apache-2.0",
      "licenseDeclared": "Apache-2.0",
      "externalRefs": [
        {
          "referenceCategory": "PACKAGE-MANAGER",
          "referenceType": "purl",
          "referenceLocator": "pkg:maven/org.springframework.boot/spring-boot-starter-web@3.2.1"
        }
      ]
    }
  ]
}
```

## PURL (Package URL) Format Specification

PURL is a standardized way to identify software packages across ecosystems.

**Format:**
```
pkg:<type>/<namespace>/<name>@<version>?<qualifiers>#<subpath>
```

**Examples by ecosystem:**

| Ecosystem | PURL Example |
|-----------|-------------|
| Maven | `pkg:maven/org.springframework.boot/spring-boot-starter-web@3.2.1` |
| npm | `pkg:npm/%40angular/core@17.0.0` |
| PyPI | `pkg:pypi/django@5.0` |
| Go | `pkg:golang/github.com/gin-gonic/gin@1.9.1` |
| NuGet | `pkg:nuget/Newtonsoft.Json@13.0.3` |
| Docker | `pkg:docker/library/openjdk@17-jdk-slim` |
| Gem | `pkg:gem/rails@7.1.2` |

**Key rules:**
- `type` is required (maven, npm, pypi, golang, nuget, docker, gem, etc.)
- `namespace` is type-specific (Maven groupId, npm scope, Go module path)
- `@version` is optional but strongly recommended for SBOM use
- `qualifiers` use `?key=value&key2=value2` syntax (e.g., `?type=jar&classifier=sources`)

## CycloneDX vs SPDX — When to Use

| Criterion | CycloneDX | SPDX |
|-----------|-----------|------|
| **Primary focus** | Security and vulnerability management | License compliance and IP management |
| **Best for** | DevSecOps pipelines, vulnerability scanning | Legal/compliance reviews, open-source audits |
| **Vulnerability data** | Native VEX (Vulnerability Exploitability eXchange) support | Requires separate security advisory documents |
| **License modeling** | Basic license ID references | Rich license expressions (AND, OR, WITH) |
| **GCP integration** | Artifact Registry supports CycloneDX for container scanning | Required by some regulatory frameworks |
| **Specification body** | OWASP | Linux Foundation (ISO/IEC 5962:2021) |
| **Tooling** | CycloneDX CLI, Syft, Trivy | SPDX tools, Syft, FOSSology |
| **Recommendation** | Use as primary format for security-focused SBOM | Use as secondary format for compliance reporting |

**Practical guidance:** Generate both formats. Use CycloneDX for integration with Artifact Registry vulnerability scanning and security tooling. Use SPDX when providing SBOMs to legal/compliance teams or when required by regulatory frameworks.

## SLSA Framework — Supply Chain Integrity Levels

SLSA (Supply-chain Levels for Software Artifacts) is a framework for ensuring the integrity of software artifacts throughout the supply chain.

### SLSA Levels

| Level | Requirements | What It Proves |
|-------|-------------|----------------|
| **SLSA 1** | Documentation of the build process; automated build | The package was built by the declared build system |
| **SLSA 2** | Version-controlled source; hosted build service; authenticated provenance | The build ran on a hosted service with tamper-resistant provenance |
| **SLSA 3** | Hardened build platform; non-falsifiable provenance; isolated builds | The build platform is hardened against tampering; provenance is cryptographically verifiable |
| **SLSA 4** | Two-person review; hermetic builds; reproducible builds | Strong assurance that the artifact matches the source and was reviewed |

### Cloud Build and SLSA

Google Cloud Build provides **SLSA Level 3** attestation out of the box:

- **Automated provenance generation**: Cloud Build automatically generates signed provenance metadata for every build
- **Non-falsifiable provenance**: Provenance is signed by Cloud Build's service identity, not user-controlled keys
- **Isolated build environments**: Each build runs in an isolated, ephemeral environment
- **Integration with Binary Authorization**: Provenance attestations can be verified by Binary Authorization before deployment to GKE or Cloud Run

**How to leverage in SBOM generation:**
1. Reference Cloud Build provenance attestations in the SBOM metadata
2. Include the build ID and provenance URI in CycloneDX `metadata.tools` or SPDX `creationInfo`
3. Verify SLSA provenance using `cosign verify-attestation` for container images
4. Use Artifact Registry's built-in vulnerability scanning to cross-reference SBOM components against known CVEs
