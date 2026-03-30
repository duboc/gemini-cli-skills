# End-of-Life Database

Comprehensive reference of end-of-life (EOL) and end-of-support dates for common enterprise technology components. Use this to cross-reference SBOM findings and assign risk levels.

**Last updated:** March 2026
**Risk levels:** CRITICAL = past EOL, no patches; HIGH = EOL imminent or extended support only; MEDIUM = maintenance mode; LOW = actively supported

---

## Java (Oracle JDK / OpenJDK)

| Version | GA Date | Premier Support End | Extended Support End | Risk Level |
|---------|---------|--------------------|--------------------|------------|
| Java 6 | Dec 2006 | Feb 2013 | Dec 2018 | CRITICAL |
| Java 7 | Jul 2011 | Apr 2015 | Jul 2022 | CRITICAL |
| Java 8 (LTS) | Mar 2014 | Mar 2022 | Dec 2030 (Oracle) | MEDIUM |
| Java 9 | Sep 2017 | Mar 2018 | N/A (non-LTS) | CRITICAL |
| Java 10 | Mar 2018 | Sep 2018 | N/A (non-LTS) | CRITICAL |
| Java 11 (LTS) | Sep 2018 | Sep 2023 | Jan 2032 (Oracle) | LOW |
| Java 12 | Mar 2019 | Sep 2019 | N/A (non-LTS) | CRITICAL |
| Java 13 | Sep 2019 | Mar 2020 | N/A (non-LTS) | CRITICAL |
| Java 14 | Mar 2020 | Sep 2020 | N/A (non-LTS) | CRITICAL |
| Java 15 | Sep 2020 | Mar 2021 | N/A (non-LTS) | CRITICAL |
| Java 16 | Mar 2021 | Sep 2021 | N/A (non-LTS) | CRITICAL |
| Java 17 (LTS) | Sep 2021 | Sep 2026 | Sep 2029 (Oracle) | LOW |
| Java 18 | Mar 2022 | Sep 2022 | N/A (non-LTS) | CRITICAL |
| Java 19 | Sep 2022 | Mar 2023 | N/A (non-LTS) | CRITICAL |
| Java 20 | Mar 2023 | Sep 2023 | N/A (non-LTS) | CRITICAL |
| Java 21 (LTS) | Sep 2023 | Sep 2028 | Sep 2031 (Oracle) | LOW |
| Java 22 | Mar 2024 | Sep 2024 | N/A (non-LTS) | HIGH |
| Java 23 | Sep 2024 | Mar 2025 | N/A (non-LTS) | HIGH |
| Java 24 | Mar 2025 | Sep 2025 | N/A (non-LTS) | LOW |

**Notes:**
- Non-LTS versions receive only 6 months of support. Any non-LTS version older than current is CRITICAL.
- OpenJDK distributions (Adoptium, Corretto, Azul) may have different support timelines. Verify with vendor.
- Java 8 extended support varies significantly by vendor (Oracle, Azul, Red Hat, Amazon).

---

## .NET Framework and .NET (Core)

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| .NET Framework 2.0 | Nov 2005 | Apr 2016 | CRITICAL |
| .NET Framework 3.0 | Nov 2006 | Apr 2016 | CRITICAL |
| .NET Framework 3.5 SP1 | Nov 2008 | Tied to OS lifecycle | MEDIUM |
| .NET Framework 4.0 | Apr 2010 | Jan 2016 | CRITICAL |
| .NET Framework 4.5 | Aug 2012 | Jan 2016 | CRITICAL |
| .NET Framework 4.5.1 | Oct 2013 | Jan 2016 | CRITICAL |
| .NET Framework 4.5.2 | May 2014 | Apr 2022 | CRITICAL |
| .NET Framework 4.6 | Jul 2015 | Apr 2022 | CRITICAL |
| .NET Framework 4.6.1 | Nov 2015 | Apr 2022 | CRITICAL |
| .NET Framework 4.6.2 | Aug 2016 | Jan 2027 | MEDIUM |
| .NET Framework 4.7 | Apr 2017 | Tied to OS lifecycle | MEDIUM |
| .NET Framework 4.7.1 | Oct 2017 | Tied to OS lifecycle | MEDIUM |
| .NET Framework 4.7.2 | Apr 2018 | Tied to OS lifecycle | MEDIUM |
| .NET Framework 4.8 | Apr 2019 | Tied to OS lifecycle | MEDIUM |
| .NET Framework 4.8.1 | Aug 2022 | Tied to OS lifecycle | LOW |
| .NET Core 1.0 | Jun 2016 | Jun 2019 | CRITICAL |
| .NET Core 1.1 | Nov 2016 | Jun 2019 | CRITICAL |
| .NET Core 2.0 | Aug 2017 | Oct 2018 | CRITICAL |
| .NET Core 2.1 (LTS) | May 2018 | Aug 2021 | CRITICAL |
| .NET Core 2.2 | Dec 2018 | Dec 2019 | CRITICAL |
| .NET Core 3.0 | Sep 2019 | Mar 2020 | CRITICAL |
| .NET Core 3.1 (LTS) | Dec 2019 | Dec 2022 | CRITICAL |
| .NET 5 | Nov 2020 | May 2022 | CRITICAL |
| .NET 6 (LTS) | Nov 2021 | Nov 2024 | HIGH |
| .NET 7 | Nov 2022 | May 2024 | CRITICAL |
| .NET 8 (LTS) | Nov 2023 | Nov 2026 | LOW |
| .NET 9 | Nov 2024 | May 2026 | LOW |

**Notes:**
- .NET Framework 4.x is in maintenance mode. No new features, but security patches continue tied to Windows OS lifecycle.
- .NET Framework will not receive major updates. Microsoft recommends migrating to .NET 8+.
- Non-LTS .NET versions receive only 18 months of support.

---

## Oracle Database

| Version | Release Date | Premier Support End | Extended Support End | Risk Level |
|---------|-------------|--------------------|--------------------|------------|
| Oracle 10g R2 | Jul 2005 | Jul 2010 | Jul 2013 | CRITICAL |
| Oracle 11g R1 | Sep 2007 | Aug 2012 | Aug 2015 | CRITICAL |
| Oracle 11g R2 | Sep 2009 | Jan 2015 | Dec 2020 | CRITICAL |
| Oracle 12c R1 | Jun 2013 | Jul 2018 | Jul 2022 | CRITICAL |
| Oracle 12c R2 | Mar 2017 | Nov 2020 | Mar 2025 | HIGH |
| Oracle 18c | Feb 2018 | Jun 2021 | Jun 2024 | CRITICAL |
| Oracle 19c | Apr 2019 | Apr 2024 | Apr 2027 | MEDIUM |
| Oracle 21c | Dec 2021 | Apr 2024 | Apr 2027 | MEDIUM |
| Oracle 23ai | May 2024 | May 2029 | May 2032 | LOW |

---

## PostgreSQL

| Version | Release Date | End of Life | Risk Level |
|---------|-------------|------------|------------|
| PostgreSQL 9.4 | Dec 2014 | Feb 2020 | CRITICAL |
| PostgreSQL 9.5 | Jan 2016 | Feb 2021 | CRITICAL |
| PostgreSQL 9.6 | Sep 2016 | Nov 2021 | CRITICAL |
| PostgreSQL 10 | Oct 2017 | Nov 2022 | CRITICAL |
| PostgreSQL 11 | Oct 2018 | Nov 2023 | CRITICAL |
| PostgreSQL 12 | Oct 2019 | Nov 2024 | HIGH |
| PostgreSQL 13 | Sep 2020 | Nov 2025 | MEDIUM |
| PostgreSQL 14 | Sep 2021 | Nov 2026 | LOW |
| PostgreSQL 15 | Oct 2022 | Nov 2027 | LOW |
| PostgreSQL 16 | Sep 2023 | Nov 2028 | LOW |
| PostgreSQL 17 | Sep 2024 | Nov 2029 | LOW |

**Notes:** PostgreSQL provides 5 years of support per major version.

---

## MySQL

| Version | Release Date | Premier Support End | Extended Support End | Risk Level |
|---------|-------------|--------------------|--------------------|------------|
| MySQL 5.5 | Dec 2010 | Dec 2015 | Dec 2018 | CRITICAL |
| MySQL 5.6 | Feb 2013 | Feb 2018 | Feb 2021 | CRITICAL |
| MySQL 5.7 | Oct 2015 | Oct 2020 | Oct 2023 | CRITICAL |
| MySQL 8.0 | Apr 2018 | Apr 2025 | Apr 2026 | MEDIUM |
| MySQL 8.4 (LTS) | Apr 2024 | Apr 2029 | Apr 2032 | LOW |
| MySQL 9.0 | Jul 2024 | Innovation release | Innovation release | LOW |

---

## Microsoft SQL Server

| Version | Release Date | Mainstream Support End | Extended Support End | Risk Level |
|---------|-------------|----------------------|--------------------|------------|
| SQL Server 2008 R2 | Apr 2010 | Jul 2014 | Jul 2019 | CRITICAL |
| SQL Server 2012 | May 2012 | Jul 2017 | Jul 2022 | CRITICAL |
| SQL Server 2014 | Jun 2014 | Jul 2019 | Jul 2024 | CRITICAL |
| SQL Server 2016 | Jun 2016 | Jul 2021 | Jul 2026 | MEDIUM |
| SQL Server 2017 | Oct 2017 | Oct 2022 | Oct 2027 | MEDIUM |
| SQL Server 2019 | Nov 2019 | Jan 2025 | Jan 2030 | LOW |
| SQL Server 2022 | Nov 2022 | Jan 2028 | Jan 2033 | LOW |

---

## MongoDB

| Version | Release Date | End of Life | Risk Level |
|---------|-------------|------------|------------|
| MongoDB 3.6 | Nov 2017 | Apr 2021 | CRITICAL |
| MongoDB 4.0 | Jun 2018 | Apr 2022 | CRITICAL |
| MongoDB 4.2 | Aug 2019 | Apr 2023 | CRITICAL |
| MongoDB 4.4 | Jul 2020 | Feb 2024 | CRITICAL |
| MongoDB 5.0 | Jul 2021 | Oct 2024 | HIGH |
| MongoDB 6.0 | Jul 2022 | Jul 2025 | MEDIUM |
| MongoDB 7.0 | Aug 2023 | Aug 2026 | LOW |
| MongoDB 8.0 | Oct 2024 | Oct 2027 | LOW |

---

## Application Servers

### IBM WebSphere

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| WebSphere 7.0 | Sep 2008 | Apr 2018 | CRITICAL |
| WebSphere 8.0 | Jun 2011 | Apr 2018 | CRITICAL |
| WebSphere 8.5 | Jun 2012 | Apr 2024 | HIGH |
| WebSphere 9.0 | Jun 2016 | Sep 2027 (approx) | MEDIUM |
| WebSphere Liberty | Continuous | Actively supported | LOW |

### Oracle WebLogic

| Version | Release Date | Premier Support End | Extended Support End | Risk Level |
|---------|-------------|--------------------|--------------------|------------|
| WebLogic 10.3.6 (11g) | Jul 2011 | Dec 2018 | Dec 2021 | CRITICAL |
| WebLogic 12.1.3 (12c) | Jun 2014 | Dec 2018 | Dec 2021 | CRITICAL |
| WebLogic 12.2.1.3 | Aug 2017 | Jul 2021 | Jul 2024 | CRITICAL |
| WebLogic 12.2.1.4 | Sep 2019 | Jul 2024 | Jul 2027 | MEDIUM |
| WebLogic 14.1.1 | Mar 2020 | Apr 2025 | Apr 2028 | LOW |
| WebLogic 14.1.2 | Jan 2024 | Jan 2029 | Jan 2032 | LOW |

### Red Hat JBoss / WildFly

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| JBoss EAP 6 | Jun 2012 | Jun 2019 | CRITICAL |
| JBoss EAP 7.0 | May 2016 | Jun 2020 | CRITICAL |
| JBoss EAP 7.1 | Feb 2018 | Jun 2021 | CRITICAL |
| JBoss EAP 7.2 | Jan 2019 | Nov 2022 | CRITICAL |
| JBoss EAP 7.3 | Mar 2020 | Dec 2023 | HIGH |
| JBoss EAP 7.4 | Dec 2021 | Dec 2026 | LOW |
| JBoss EAP 8.0 | Mar 2024 | Mar 2029 (approx) | LOW |
| WildFly | Continuous | Community-supported, no formal EOL | MEDIUM |

### Apache Tomcat

| Version | Minimum Java | End of Life | Risk Level |
|---------|-------------|------------|------------|
| Tomcat 7 | Java 6 | Mar 2021 | CRITICAL |
| Tomcat 8.5 | Java 7 | Mar 2024 | HIGH |
| Tomcat 9 | Java 8 | Actively supported | LOW |
| Tomcat 10.0 | Java 11 | Oct 2022 (superseded by 10.1) | HIGH |
| Tomcat 10.1 | Java 11 | Actively supported | LOW |
| Tomcat 11 | Java 17 | Actively supported | LOW |

---

## Spring Boot

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| Spring Boot 1.3 | Nov 2015 | EOL | CRITICAL |
| Spring Boot 1.4 | Jul 2016 | EOL | CRITICAL |
| Spring Boot 1.5 | Jan 2017 | Aug 2019 | CRITICAL |
| Spring Boot 2.0 | Mar 2018 | EOL | CRITICAL |
| Spring Boot 2.1 | Oct 2018 | EOL | CRITICAL |
| Spring Boot 2.2 | Oct 2019 | EOL | CRITICAL |
| Spring Boot 2.3 | May 2020 | EOL | CRITICAL |
| Spring Boot 2.4 | Nov 2020 | EOL | CRITICAL |
| Spring Boot 2.5 | May 2021 | EOL | CRITICAL |
| Spring Boot 2.6 | Nov 2021 | EOL | CRITICAL |
| Spring Boot 2.7 | May 2022 | Nov 2023 | HIGH |
| Spring Boot 3.0 | Nov 2022 | Nov 2023 | HIGH |
| Spring Boot 3.1 | May 2023 | May 2024 | HIGH |
| Spring Boot 3.2 | Nov 2023 | Nov 2024 | HIGH |
| Spring Boot 3.3 | May 2024 | May 2025 | MEDIUM |
| Spring Boot 3.4 | Nov 2024 | Nov 2025 | LOW |
| Spring Boot 3.5 | May 2025 | May 2026 | LOW |
| Spring Boot 4.0 | Nov 2025 | Nov 2026 (approx) | LOW |

---

## Spring Framework

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| Spring Framework 3.x | Dec 2009 | Dec 2016 | CRITICAL |
| Spring Framework 4.x | Dec 2013 | Dec 2020 | CRITICAL |
| Spring Framework 5.0-5.2 | Sep 2017 | Dec 2021 | CRITICAL |
| Spring Framework 5.3 | Oct 2020 | Dec 2024 | HIGH |
| Spring Framework 6.0 | Nov 2022 | Aug 2024 | HIGH |
| Spring Framework 6.1 | Nov 2023 | Actively supported | LOW |
| Spring Framework 6.2 | Nov 2024 | Actively supported | LOW |
| Spring Framework 7.0 | Nov 2025 (approx) | Actively supported | LOW |

---

## Node.js

| Version | Release Date | LTS Start | End of Life | Risk Level |
|---------|-------------|-----------|------------|------------|
| Node.js 8 | May 2017 | Oct 2017 | Dec 2019 | CRITICAL |
| Node.js 10 | Apr 2018 | Oct 2018 | Apr 2021 | CRITICAL |
| Node.js 12 | Apr 2019 | Oct 2019 | Apr 2022 | CRITICAL |
| Node.js 14 | Apr 2020 | Oct 2020 | Apr 2023 | CRITICAL |
| Node.js 16 | Apr 2021 | Oct 2021 | Sep 2023 | CRITICAL |
| Node.js 18 (LTS) | Apr 2022 | Oct 2022 | Apr 2025 | HIGH |
| Node.js 20 (LTS) | Apr 2023 | Oct 2023 | Apr 2026 | LOW |
| Node.js 22 (LTS) | Apr 2024 | Oct 2024 | Apr 2027 | LOW |
| Node.js 23 | Oct 2024 | N/A (Current) | Jun 2025 | MEDIUM |
| Node.js 24 | Apr 2025 | Oct 2025 | Apr 2028 | LOW |

**Notes:** Odd-numbered releases are "Current" only (no LTS). Even-numbered releases enter LTS and receive 30 months of support.

---

## Python

| Version | Release Date | End of Life | Risk Level |
|---------|-------------|------------|------------|
| Python 2.7 | Jul 2010 | Jan 2020 | CRITICAL |
| Python 3.5 | Sep 2015 | Sep 2020 | CRITICAL |
| Python 3.6 | Dec 2016 | Dec 2021 | CRITICAL |
| Python 3.7 | Jun 2018 | Jun 2023 | CRITICAL |
| Python 3.8 | Oct 2019 | Oct 2024 | HIGH |
| Python 3.9 | Oct 2020 | Oct 2025 | MEDIUM |
| Python 3.10 | Oct 2021 | Oct 2026 | LOW |
| Python 3.11 | Oct 2022 | Oct 2027 | LOW |
| Python 3.12 | Oct 2023 | Oct 2028 | LOW |
| Python 3.13 | Oct 2024 | Oct 2029 | LOW |

**Notes:** Python versions receive 5 years of support (2 years bugfix + 3 years security).

---

## Middleware

### RabbitMQ

| Version | Release Date | End of Support | Risk Level |
|---------|-------------|---------------|------------|
| RabbitMQ 3.8 | Oct 2019 | Jul 2022 | CRITICAL |
| RabbitMQ 3.9 | Jul 2021 | Jul 2023 | CRITICAL |
| RabbitMQ 3.10 | May 2022 | Jul 2023 | CRITICAL |
| RabbitMQ 3.11 | Sep 2022 | Dec 2023 | CRITICAL |
| RabbitMQ 3.12 | Jun 2023 | Jun 2024 | HIGH |
| RabbitMQ 3.13 | Feb 2024 | Dec 2024 | HIGH |
| RabbitMQ 4.0 | Oct 2024 | Actively supported | LOW |

**Notes:** RabbitMQ typically supports only the latest and previous minor release. Older versions lose support quickly.

### Apache Kafka

| Version | Release Date | End of Support (approx) | Risk Level |
|---------|-------------|------------------------|------------|
| Kafka 2.x | 2018-2020 | Community only, no formal EOL | HIGH |
| Kafka 3.0-3.4 | Sep 2021 - Jun 2023 | Superseded | HIGH |
| Kafka 3.5-3.7 | Jul 2023 - Apr 2024 | Actively supported | MEDIUM |
| Kafka 3.8+ | Jul 2024 | Actively supported | LOW |
| Kafka 4.0 | Mar 2025 | Actively supported | LOW |

**Notes:** Kafka does not publish formal EOL dates. Community support typically covers the latest 2-3 minor versions. KRaft mode is required starting Kafka 4.0 (ZooKeeper removed).

### Redis

| Version | Release Date | End of Life | Risk Level |
|---------|-------------|------------|------------|
| Redis 5 | Oct 2018 | EOL | CRITICAL |
| Redis 6.0 | Apr 2020 | EOL | HIGH |
| Redis 6.2 | Feb 2021 | Feb 2025 (approx) | HIGH |
| Redis 7.0 | Apr 2022 | Actively supported | LOW |
| Redis 7.2 | Aug 2023 | Actively supported | LOW |
| Redis 7.4 | Jul 2024 | Actively supported | LOW |
| Redis 8.0 | Oct 2024 | Actively supported | LOW |

**Notes:** Redis changed to dual license (RSMv2/SSPLv1) in March 2024 starting with 7.4. Forks like Valkey may be relevant for licensing considerations.

---

## Operating Systems

### Red Hat Enterprise Linux (RHEL)

| Version | Release Date | Full Support End | Maintenance Support End | Risk Level |
|---------|-------------|-----------------|------------------------|------------|
| RHEL 6 | Nov 2010 | May 2016 | Nov 2020 | CRITICAL |
| RHEL 7 | Jun 2014 | Aug 2019 | Jun 2024 | CRITICAL |
| RHEL 8 | May 2019 | May 2024 | May 2029 | MEDIUM |
| RHEL 9 | May 2022 | May 2027 | May 2032 | LOW |
| RHEL 10 | May 2025 | May 2030 | May 2035 | LOW |

### Ubuntu LTS

| Version | Release Date | Standard Support End | Extended Security (ESM) End | Risk Level |
|---------|-------------|---------------------|---------------------------|------------|
| Ubuntu 14.04 | Apr 2014 | Apr 2019 | Apr 2024 | CRITICAL |
| Ubuntu 16.04 | Apr 2016 | Apr 2021 | Apr 2026 | HIGH |
| Ubuntu 18.04 | Apr 2018 | May 2023 | Apr 2028 | MEDIUM |
| Ubuntu 20.04 | Apr 2020 | Apr 2025 | Apr 2030 | MEDIUM |
| Ubuntu 22.04 | Apr 2022 | Apr 2027 | Apr 2032 | LOW |
| Ubuntu 24.04 | Apr 2024 | Apr 2029 | Apr 2034 | LOW |

### Windows Server

| Version | Release Date | Mainstream Support End | Extended Support End | Risk Level |
|---------|-------------|----------------------|--------------------|------------|
| Windows Server 2008 R2 | Oct 2009 | Jan 2015 | Jan 2020 | CRITICAL |
| Windows Server 2012 R2 | Oct 2013 | Oct 2018 | Oct 2023 | CRITICAL |
| Windows Server 2016 | Oct 2016 | Jan 2022 | Jan 2027 | MEDIUM |
| Windows Server 2019 | Nov 2018 | Jan 2024 | Jan 2029 | LOW |
| Windows Server 2022 | Aug 2021 | Oct 2026 | Oct 2031 | LOW |
| Windows Server 2025 | Nov 2024 | Oct 2029 | Oct 2034 | LOW |

---

## Risk Level Definitions

| Risk Level | Definition | Action Required |
|-----------|-----------|----------------|
| **CRITICAL** | Component is past EOL. No security patches available. Known vulnerabilities may exist unpatched. | Immediate upgrade or replacement required. |
| **HIGH** | Component is approaching EOL or receiving only extended/paid support. Limited patches. | Plan upgrade within next quarter. |
| **MEDIUM** | Component is in maintenance mode or nearing end of active development. Still receiving security patches. | Include in next modernization cycle. |
| **LOW** | Component is actively supported with regular updates and security patches. | Monitor for future EOL announcements. |

---

## Disclaimer

EOL dates are sourced from vendor documentation and community announcements as of March 2026. Dates may vary by vendor distribution (e.g., Oracle JDK vs Adoptium vs Amazon Corretto). Always verify with your specific vendor and support contract. Extended support contracts may extend dates beyond what is listed here.
