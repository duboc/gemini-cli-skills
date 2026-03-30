# Security and Compliance Guide for GCP App Modernization

Security and compliance considerations for enterprise application modernization to Google Cloud Platform, covering PCI-DSS, HIPAA, GDPR, SOX, data classification, encryption, and audit logging.

## PCI-DSS Implications for GCP Migration

### Cardholder Data Scope Identification

During modernization, identify all systems that store, process, or transmit cardholder data (CHD) and sensitive authentication data (SAD). Map these to the target GCP architecture to determine the PCI-DSS scope boundary.

Key activities:
- Inventory all data flows containing PAN, CVV, expiration dates, and cardholder names
- Map legacy stored procedures, batch jobs, and ETL pipelines that touch CHD
- Identify which GCP services will enter PCI scope based on data flow analysis
- Minimize scope by isolating payment processing into dedicated GCP projects

### Encryption at Rest

GCP provides multiple layers of encryption at rest for PCI-scoped data:

- **Google default encryption**: All data at rest is encrypted automatically with AES-256. This is transparent and requires no configuration.
- **CMEK (Customer-Managed Encryption Keys)**: Use Cloud KMS to manage your own keys for BigQuery datasets, Cloud SQL instances, GCS buckets, Compute Engine disks, and Dataflow jobs. Required when PCI-DSS assessors need proof of key ownership and rotation control.
- **CSEK (Customer-Supplied Encryption Keys)**: Provide your own keys for Compute Engine disks and GCS objects. Keys are never stored by Google.
- **Cloud EKM (External Key Manager)**: Hold keys in a third-party KMS outside Google infrastructure. Use when compliance requires keys to never reside in the cloud provider environment.

### Encryption in Transit

- **TLS 1.3**: Enforce minimum TLS 1.3 for all external-facing services via Cloud Load Balancing SSL policies
- **mTLS via Istio on GKE**: Deploy Istio service mesh on GKE to enforce mutual TLS between all microservices within the PCI scope. This satisfies PCI-DSS requirements for encrypted internal communication.
- **Private Google Access**: Ensure GCP service API calls from VPC-internal resources never traverse the public internet

### Audit Logging

- Enable **Data Access audit logs** for all PCI-scoped GCP services (disabled by default for most services)
- Export audit logs to a dedicated BigQuery dataset in a separate, locked-down GCP project for tamper-resistant retention
- Retain audit logs for a minimum of one year (PCI-DSS Requirement 10.7), with at least three months immediately available for analysis
- Use Cloud Monitoring alerting policies to detect anomalous access patterns to PCI-scoped resources

### VPC Service Controls for Network Segmentation

VPC Service Controls create a security perimeter around GCP services to prevent data exfiltration:

- Define a service perimeter enclosing all PCI-scoped projects
- Restrict API access to BigQuery, Cloud Storage, Cloud SQL, and other data services within the perimeter
- Configure access levels using Access Context Manager to allow only authorized networks, identities, and device trust levels
- Use ingress/egress rules for controlled cross-perimeter communication (e.g., between PCI and non-PCI projects)

### PCI-DSS Compliant GCP Services

The following GCP services are covered under Google Cloud's PCI-DSS compliance:

- Compute Engine, GKE, Cloud Run, Cloud Functions
- Cloud SQL, AlloyDB, Spanner, Firestore, Memorystore
- Cloud Storage, Persistent Disk
- Pub/Sub, Dataflow, Datastream
- BigQuery
- Cloud KMS, Secret Manager
- Cloud Load Balancing, Cloud Armor, Cloud CDN
- Cloud Logging, Cloud Monitoring, Cloud Trace
- VPC, VPC Service Controls, Cloud NAT, Cloud DNS
- Artifact Registry, Cloud Build, Cloud Deploy
- Identity-Aware Proxy (IAP)

Verify the current list at: https://cloud.google.com/security/compliance/pci-dss

## HIPAA Considerations for GCP

### PHI Identification During Modernization

Before migrating, systematically identify Protected Health Information (PHI) across:

- **Stored procedures**: SQL logic that reads, transforms, or joins tables containing patient names, diagnoses, medical record numbers, SSNs, or insurance IDs
- **Batch jobs**: ETL pipelines, nightly reports, and data exports that process PHI in flat files, CSVs, or database extracts
- **ESB messages**: Integration messages flowing through legacy middleware (MuleSoft, TIBCO, IBM MQ) that contain patient demographics, lab results, or billing data
- **Application logs**: Ensure PHI is not inadvertently logged. Implement log scrubbing before migration.

### BAA-Covered GCP Services

Google Cloud signs a Business Associate Agreement (BAA) covering these services (among others):

- **Compute**: Compute Engine, GKE, Cloud Run, Cloud Functions
- **Data**: Cloud SQL, AlloyDB, Spanner, Firestore, BigQuery, Bigtable, Memorystore
- **Storage**: Cloud Storage, Persistent Disk
- **Messaging**: Pub/Sub
- **Integration**: Dataflow, Datastream, Cloud Composer
- **Security**: Cloud KMS, Secret Manager, DLP API
- **Networking**: VPC, Cloud Load Balancing, Cloud Armor
- **Observability**: Cloud Logging, Cloud Monitoring, Cloud Trace
- **AI/ML**: Vertex AI, Cloud Healthcare API

A BAA must be in place before any PHI is stored or processed on GCP. Configure the BAA through the Google Cloud console under the compliance section of the organization settings.

### Cloud Healthcare API

Use the Cloud Healthcare API for structured health data:

- FHIR (R4) stores for clinical data interoperability
- DICOM stores for medical imaging
- HL7v2 stores for legacy health system integration
- Built-in de-identification for FHIR and DICOM resources
- Fine-grained IAM and consent management

### DLP API for PHI Detection and De-identification

The Cloud Data Loss Prevention (DLP) API provides automated PHI detection:

- **Inspection**: Scan Cloud Storage, BigQuery, and Datastore for PHI using built-in infoTypes (e.g., `PERSON_NAME`, `PHONE_NUMBER`, `US_SOCIAL_SECURITY_NUMBER`, `MEDICAL_RECORD_NUMBER`)
- **De-identification**: Apply transformations such as masking, tokenization (using Cloud KMS wrapped keys), date-shifting, and generalization
- **Hybrid jobs**: Inspect data from any source (including on-premises databases) via the DLP API's hybrid content inspection

Use DLP API during the assessment phase to discover PHI in legacy data stores before migration, and during the migration phase to de-identify data for non-production environments.

### Audit Trail via Cloud Audit Logs and BigQuery Export

- Enable Data Access audit logs on all HIPAA-scoped services
- Export logs to BigQuery for long-term retention (HIPAA requires six years)
- Create BigQuery views and dashboards in Looker Studio for compliance reporting
- Set up Cloud Monitoring alerts for unauthorized access attempts to PHI-containing resources
- Use Access Transparency logs to monitor Google support access to your resources

## GDPR Data Residency on GCP

### Regional Resource Placement

For GDPR compliance, place resources in EU regions:

- **Recommended regions**: `europe-west1` (Belgium), `europe-west2` (London), `europe-west3` (Frankfurt), `europe-west4` (Netherlands), `europe-west6` (Zurich), `europe-west8` (Milan), `europe-west9` (Paris), `europe-west12` (Turin)
- **Multi-regional**: Use the `EU` multi-region for Cloud Storage and BigQuery when data must stay within EU boundaries but does not require a specific country
- **Regional GKE clusters**: Deploy GKE clusters in EU regions with node location constraints

### Data Residency Constraints via Organization Policies

Enforce data residency at the organization or folder level using Organization Policy constraints:

- `constraints/gcp.resourceLocations`: Restrict allowed resource locations to specific EU regions
- Apply at the folder level to create an "EU data boundary" folder containing all GDPR-scoped projects
- Use deny policies to explicitly block non-EU regions

### Right to Erasure Implications

GDPR Article 17 (Right to Erasure) creates specific challenges for event-sourced and append-only architectures:

- **Pub/Sub**: Messages are automatically deleted after the retention period (default 7 days, max 31 days). Ensure no long-term Pub/Sub message retention for personal data.
- **BigQuery**: Use DML `DELETE` statements or table-level expiration. For streaming buffer data, deletions take effect after the buffer is flushed. Consider pseudonymization with key-based deletion (delete the mapping key to render data unidentifiable).
- **Cloud Storage**: Implement lifecycle policies for automatic deletion. For versioned buckets, ensure all object versions are deleted.
- **Firestore/Datastore**: Delete individual documents containing personal data. Use TTL policies for automatic expiration.

### VPC Service Controls for Data Boundary Enforcement

Use VPC Service Controls to create a data boundary that prevents personal data from leaving the EU:

- Define a service perimeter around all EU-based GDPR-scoped projects
- Block data copy or export operations to projects outside the perimeter
- Use egress rules to explicitly allowlist any authorized cross-boundary data flows (e.g., anonymized analytics)

## SOX Compliance

### Financial Data Audit Trail Requirements

SOX Section 302 and 404 require demonstrable controls over financial reporting systems:

- Enable comprehensive Cloud Audit Logs for all GCP services processing financial data
- Export audit logs to a separate, immutable BigQuery dataset with table-level access controls
- Implement row-level security in BigQuery for financial datasets to enforce least-privilege access
- Maintain audit log retention for a minimum of seven years

### Change Management via Cloud Deploy and Approval Gates

- Use **Cloud Deploy** for continuous delivery with promotion-based pipelines (dev, staging, production)
- Configure **approval gates** in Cloud Deploy to require manual approval before production deployments
- All deployment configurations are version-controlled in Git (Infrastructure as Code)
- Cloud Deploy maintains an immutable record of every deployment, including who approved and when

### Separation of Duties in CI/CD

Enforce separation of duties using Cloud Build and IAM:

- **Developers**: `roles/cloudbuild.builds.editor` — can trigger builds but cannot approve deployments
- **Reviewers**: Custom role with `clouddeploy.rollouts.approve` — can approve deployments but cannot modify pipeline definitions
- **Platform team**: `roles/clouddeploy.admin` — manages pipeline definitions but does not approve individual deployments
- Use **IAM Conditions** to restrict approval actions to specific environments (e.g., only senior engineers can approve production)

### Data Integrity Validation During Migration

- Implement row-count reconciliation between source and target at each migration phase
- Use checksum/hash comparison for critical financial tables (BigQuery `FARM_FINGERPRINT` or `MD5` functions)
- Run parallel processing: execute financial calculations on both legacy and GCP systems, comparing outputs before cutover
- Maintain a migration audit log recording every data transformation applied, with before/after record counts

## Data Classification Framework

Classify all data during the assessment phase to determine appropriate GCP security controls.

| Classification | Description | GCP Controls |
|---------------|-------------|-------------|
| Public | No impact if disclosed | Default Google-managed encryption, standard IAM |
| Internal | Internal use only | IAM with domain-restricted sharing, VPC network isolation |
| Confidential | Business-sensitive | Cloud KMS CMEK, Data Access audit logging, VPC Service Controls |
| Restricted | Regulated (PCI, PHI, PII) | CMEK or CSEK, DLP API scanning, VPC Service Controls, Access Transparency, Binary Authorization |

### Applying Classifications in Practice

1. **Assessment phase**: Use DLP API to scan source databases and file stores for sensitive data. Tag data with classification labels.
2. **Architecture phase**: Map each classification level to a GCP project structure (e.g., separate projects for Restricted data).
3. **Migration phase**: Apply Cloud KMS keys, VPC Service Controls, and IAM policies based on classification before migrating data.
4. **Operations phase**: Use Security Command Center (SCC) Premium to continuously monitor for classification policy violations.

## Encryption Strategy on GCP

### Encryption Layers

GCP provides encryption at multiple layers. Choose the appropriate level based on data classification:

| Layer | Mechanism | Use When |
|-------|-----------|----------|
| Default | Google-managed AES-256 keys | Public or Internal data; no compliance requirement for key control |
| CMEK | Customer-Managed Encryption Keys via Cloud KMS | Confidential or Restricted data; compliance requires key ownership and rotation control |
| CSEK | Customer-Supplied Encryption Keys | Maximum control needed; keys never stored by Google |
| Cloud EKM | External Key Manager | Keys must be held outside Google infrastructure (regulatory requirement) |
| Application-level | Tink library for field-level encryption | Encrypt specific fields (e.g., PAN, SSN) before data reaches GCP services |

### Cloud KMS Key Management Best Practices

- Create separate key rings per environment (dev, staging, production)
- Use **automatic key rotation** with a rotation period aligned to compliance requirements (e.g., 90 days for PCI-DSS)
- Grant `roles/cloudkms.cryptoKeyEncrypterDecrypter` at the individual key level, not the key ring level
- Enable Cloud KMS audit logging to track all key usage
- Use **Cloud HSM** (FIPS 140-2 Level 3) for keys protecting Restricted data

### Application-Level Encryption with Tink

For field-level encryption of sensitive data before it enters GCP services:

- Use Google's **Tink** cryptographic library (available for Java, Python, Go, C++)
- Encrypt specific fields (credit card numbers, SSNs, health identifiers) at the application layer
- Store encrypted fields in Cloud SQL or BigQuery; decryption requires explicit Tink key access
- Integrate Tink with Cloud KMS for key wrapping (envelope encryption)

## Audit Logging Strategy

### Cloud Audit Log Types

| Log Type | Content | Default State | Retention |
|----------|---------|---------------|-----------|
| Admin Activity | Resource configuration changes (create, delete, modify) | Always on, cannot be disabled | 400 days |
| Data Access | Data read, data write, and permission check events | Off by default for most services | 30 days (default), configurable |
| System Event | Google-initiated system events | Always on, cannot be disabled | 400 days |
| Policy Denied | Access denied by VPC Service Controls or Organization Policy | Always on | 30 days (default), configurable |

### Audit Log Export Architecture

For compliance-grade audit logging:

1. **Aggregated log sink**: Create an organization-level log sink that captures all audit logs across all projects
2. **BigQuery destination**: Route logs to a BigQuery dataset in a dedicated audit project with restricted access
3. **Retention**: Set BigQuery table expiration based on compliance requirements (1 year PCI-DSS, 6 years HIPAA, 7 years SOX)
4. **Analysis**: Create BigQuery saved queries and Looker Studio dashboards for compliance reporting
5. **Alerting**: Use Cloud Monitoring log-based alerting for critical events (e.g., IAM policy changes, data access from unexpected identities)

### Access Transparency

Access Transparency logs provide visibility into actions taken by Google support and engineering staff on your resources:

- Available with Premium or Enterprise support and specific compliance-oriented editions
- Logs include justification for access, resource accessed, and actions performed
- Integrates with Cloud Logging for centralized analysis
- Required for Restricted data classification to satisfy compliance auditor requirements
