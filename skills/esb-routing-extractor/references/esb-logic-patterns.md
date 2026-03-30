# ESB Logic Patterns Reference

Classification criteria, mediator types, platform-specific logic patterns, and business rule extraction templates for ESB routing analysis.

## Route Classification Criteria

### PASS-THROUGH

Routes that perform no transformation or conditional logic. Pure message forwarding.

**Indicators:**
- No mediators between source and target (or only logging/monitoring mediators)
- No conditional branching
- No payload modification
- Protocol bridging only (e.g., HTTP to JMS with no body change)

**Examples:**
```xml
<!-- MuleSoft: Simple HTTP-to-JMS proxy -->
<flow name="orderProxy">
  <http:listener path="/orders" />
  <jms:publish destination="orders.queue" />
</flow>

<!-- Apache Camel: Direct route -->
<route id="directProxy">
  <from uri="http:0.0.0.0:8080/api" />
  <to uri="jms:queue:incoming" />
</route>

<!-- WSO2: Pass-through proxy -->
<proxy name="OrderProxy" transports="http https">
  <target>
    <endpoint>
      <address uri="http://backend:8080/orders" />
    </endpoint>
  </target>
</proxy>
```

### TRANSFORM

Routes that convert message format without business logic. Pure data reshaping.

**Indicators:**
- Contains format conversion (XML to JSON, CSV to XML, encoding changes)
- No `if/else`, `choose/when`, or conditional expressions
- No external data lookups
- Output structure is a deterministic mapping of input structure

**Examples:**
```xml
<!-- MuleSoft: XML-to-JSON transform -->
<flow name="xmlToJsonFlow">
  <http:listener path="/convert" />
  <ee:transform>
    <ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{
  orderId: payload.order.@id,
  items: payload.order.lineItems.*item map {
    sku: $.sku,
    qty: $.quantity
  }
}]]></ee:set-payload>
  </ee:transform>
  <http:request url="http://target/api" method="POST" />
</flow>

<!-- TIBCO: XSLT format conversion -->
<pd:activity name="TransformOrder">
  <pd:type>com.tibco.plugin.xml.XMLTransformActivity</pd:type>
  <config>
    <xslFile>/Transforms/order-format.xslt</xslFile>
  </config>
</pd:activity>
```

### ENRICH

Routes that augment messages with data from external sources without making business decisions.

**Indicators:**
- Contains external service calls to fetch additional data
- Merges fetched data into the message
- No conditional routing based on enriched data
- Lookup is unconditional (always performed, not data-dependent)

**Examples:**
```xml
<!-- MuleSoft: Customer enrichment -->
<flow name="enrichOrder">
  <http:listener path="/orders" />
  <http:request url="http://crm/customers/{payload.customerId}" method="GET"
    target="customerData" />
  <ee:transform>
    <ee:set-payload><![CDATA[%dw 2.0
---
payload ++ { customerName: vars.customerData.name }]]></ee:set-payload>
  </ee:transform>
  <jms:publish destination="enriched.orders" />
</flow>

<!-- WSO2: Database lookup enrichment -->
<sequence name="enrichSequence">
  <dblookup>
    <connection>
      <pool><dsName>jdbc/CustomerDB</dsName></pool>
    </connection>
    <statement>
      <sql>SELECT name, tier FROM customers WHERE id=?</sql>
      <parameter type="VARCHAR" value="{//customerId}" />
      <result name="customerName" column="name" />
    </statement>
  </dblookup>
  <send />
</sequence>
```

### ORCHESTRATE

Routes with multi-step flows, conditional logic, parallel processing, or aggregation.

**Indicators:**
- Contains `choice/when`, `if/else`, `switch/case` routing
- Parallel processing with aggregation
- Sequential multi-service coordination
- Scatter-gather patterns
- Compensation/rollback logic

**Examples:**
```xml
<!-- MuleSoft: Order orchestration -->
<flow name="processOrder">
  <http:listener path="/orders" />
  <choice>
    <when expression="#[payload.type == 'DIGITAL']">
      <http:request url="http://digital-fulfillment/process" />
    </when>
    <when expression="#[payload.type == 'PHYSICAL']">
      <scatter-gather>
        <route>
          <http:request url="http://inventory/reserve" />
        </route>
        <route>
          <http:request url="http://shipping/calculate" />
        </route>
      </scatter-gather>
    </when>
    <otherwise>
      <jms:publish destination="manual.review" />
    </otherwise>
  </choice>
</flow>

<!-- Apache Camel: Multi-step orchestration -->
<route id="orderOrchestration">
  <from uri="jms:queue:orders" />
  <multicast strategyRef="aggregatorStrategy">
    <to uri="direct:validateInventory" />
    <to uri="direct:calculateShipping" />
    <to uri="direct:applyDiscounts" />
  </multicast>
  <to uri="direct:finalizeOrder" />
</route>
```

### BUSINESS_RULE

Routes containing domain-specific validation, calculation, or routing decisions based on business data.

**Indicators:**
- Pricing calculations, discount logic, tax computation
- Regulatory compliance checks (KYC, AML, sanctions screening)
- Domain-specific validation beyond schema validation
- Routing decisions based on business thresholds (order value, customer tier, region)
- SLA enforcement, rate limiting based on business rules

**Examples:**
```xml
<!-- MuleSoft: Business rule in DataWeave -->
<flow name="pricingFlow">
  <http:listener path="/price" />
  <ee:transform>
    <ee:set-payload><![CDATA[%dw 2.0
---
{
  basePrice: payload.unitPrice * payload.quantity,
  discount: if (payload.quantity > 100) 0.15
            else if (payload.quantity > 50) 0.10
            else if (payload.customerTier == "GOLD") 0.05
            else 0,
  tax: if (payload.region == "EU") payload.unitPrice * 0.20
       else if (payload.region == "UK") payload.unitPrice * 0.20
       else 0
}]]></ee:set-payload>
  </ee:transform>
</flow>

<!-- IBM IIB: ESQL business rule -->
-- Compliance routing based on transaction amount and country
CREATE COMPUTE MODULE ComplianceRouter
  CREATE FUNCTION Main() RETURNS BOOLEAN
  BEGIN
    IF InputRoot.XMLNSC.Transaction.Amount > 10000 THEN
      SET OutputRoot = InputRoot;
      PROPAGATE TO TERMINAL 'out1'; -- High-value review queue
    END IF;
    IF InputRoot.XMLNSC.Transaction.Country IN ('IR','KP','SY') THEN
      SET OutputRoot = InputRoot;
      PROPAGATE TO TERMINAL 'out2'; -- Sanctions screening
    END IF;
    PROPAGATE TO TERMINAL 'out'; -- Standard processing
  END;
END MODULE;
```

## Common ESB Mediator/Processor Types

### Mediators by Classification

| Mediator Type | Typical Category | Notes |
|---------------|-----------------|-------|
| Log / Trace | PASS-THROUGH | Observability only, no logic |
| Wire Tap | PASS-THROUGH | Copies message for monitoring |
| Protocol Bridge | PASS-THROUGH | HTTP-to-JMS, JMS-to-MQ |
| Load Balancer | PASS-THROUGH | Round-robin, weighted distribution |
| Format Converter | TRANSFORM | XML-to-JSON, CSV-to-XML |
| XSLT Transform | TRANSFORM or BUSINESS_RULE | Check for conditionals inside XSLT |
| DataWeave Map | TRANSFORM or BUSINESS_RULE | Check for if/else logic |
| Content Enricher | ENRICH | External data lookup |
| Database Lookup | ENRICH or BUSINESS_RULE | Depends on whether result drives logic |
| Content-Based Router | ORCHESTRATE or BUSINESS_RULE | Depends on routing predicate meaning |
| Splitter | ORCHESTRATE | Breaks message into parts |
| Aggregator | ORCHESTRATE | Combines multiple messages |
| Scatter-Gather | ORCHESTRATE | Parallel fan-out with merge |
| Recipient List | ORCHESTRATE | Dynamic routing to multiple targets |
| Idempotent Filter | ORCHESTRATE | Deduplication logic |
| Resequencer | ORCHESTRATE | Message ordering |
| Script (Groovy/Java) | BUSINESS_RULE | Almost always contains business logic |
| ESQL Compute Node | BUSINESS_RULE | IBM-specific, usually business logic |
| Custom Processor | BUSINESS_RULE | Any custom-coded component |

### Ambiguous Mediators

These mediators require inspection to classify correctly:

**XSLT Transforms** — Check for:
- `xsl:if`, `xsl:choose`, `xsl:when` with business predicates = BUSINESS_RULE
- Pure element mapping with no conditionals = TRANSFORM

**DataWeave Scripts** — Check for:
- `if/else` with business thresholds or domain values = BUSINESS_RULE
- Pure field mapping or format conversion = TRANSFORM
- `lookup()` calls = ENRICH (if no conditional logic on result)

**Database Queries** — Check for:
- SELECT used to enrich payload = ENRICH
- SELECT result used in routing decision = BUSINESS_RULE
- INSERT/UPDATE as side effect = flag for migration risk

**Content-Based Routers** — Check for:
- Routing on message type or format = ORCHESTRATE (technical routing)
- Routing on business field values (region, tier, amount) = BUSINESS_RULE

## Platform-Specific Logic Patterns

### MuleSoft (DataWeave / Mule XML)

**Business logic locations:**
- `<ee:transform>` blocks with DataWeave containing `if/else`
- `<choice>` routers with MEL or DataWeave expressions in `when` attributes
- `<scripting:execute>` blocks with Groovy/Java
- Custom Java components referenced via `<java:invoke>`
- `<validation:*>` elements with custom validators

**Key expressions to scan:**
```
#[payload.fieldName > threshold]     — MEL expression (Mule 3)
#[vars.fieldName == 'value']         — MEL variable check
%dw 2.0 ... if (condition)           — DataWeave conditional
```

**Configuration files:**
```
src/main/mule/*.xml          — Flow definitions
src/main/resources/*.dwl     — Standalone DataWeave scripts
src/main/java/**/*.java      — Custom Java components
```

### TIBCO BusinessWorks

**Business logic locations:**
- XSLT activities with conditional logic
- Java Code activities (`com.tibco.plugin.java.JavaActivity`)
- Mapper activities with conditional XPath expressions
- Checkpoint activities (indicate stateful processing)
- Choice/transition conditions between activities

**Key patterns to scan:**
```xml
<!-- Conditional transition -->
<pd:transition>
  <pd:from>CheckOrder</pd:from>
  <pd:to>HighValueProcess</pd:to>
  <pd:conditionType>xpath</pd:conditionType>
  <pd:xpath>$CheckOrder/order/amount &gt; 10000</pd:xpath>
</pd:transition>

<!-- Java code activity -->
<pd:activity name="CalculateDiscount">
  <pd:type>com.tibco.plugin.java.JavaActivity</pd:type>
</pd:activity>
```

**Configuration files:**
```
*.process          — Process definitions (XML)
*.substvar         — Substitution variables (environment config)
Processes/**       — Process directory
Resources/**       — Shared resources (connections, schemas)
```

### IBM Integration Bus / App Connect Enterprise

**Business logic locations:**
- ESQL Compute nodes (`.esql` files)
- Java Compute nodes
- Mapping nodes with conditional logic
- Filter nodes with ESQL expressions
- Route nodes with routing expressions

**Key patterns to scan:**
```esql
-- Conditional routing in ESQL
IF InputRoot.XMLNSC.Order.Priority = 'RUSH' THEN
  PROPAGATE TO TERMINAL 'out1';
ELSE
  PROPAGATE TO TERMINAL 'out';
END IF;

-- Business calculation
SET OutputRoot.XMLNSC.Invoice.Tax =
  InputRoot.XMLNSC.Order.Subtotal * 0.08;

-- Database lookup for business decision
SET customerTier = THE(
  SELECT T.tier FROM Database.CUSTOMERS AS T
  WHERE T.id = InputRoot.XMLNSC.Order.CustomerId
);
```

**Configuration files:**
```
*.msgflow          — Message flow definitions (XML)
*.subflow          — Reusable sub-flows
*.esql             — ESQL source files
*.map              — Graphical mapping definitions
*.java             — Java compute node source
```

### WSO2 ESB / Micro Integrator

**Business logic locations:**
- `<filter>` mediators with XPath/JSONPath conditions
- `<switch>` mediators with case conditions
- `<class>` mediators invoking custom Java
- `<script>` mediators with JavaScript/Groovy
- `<enrich>` mediators (check if enrichment drives routing)
- `<payloadFactory>` with conditional template logic

**Key patterns to scan:**
```xml
<!-- Content-based routing -->
<switch source="//order/type">
  <case regex="WHOLESALE">
    <send><endpoint><address uri="http://wholesale/api"/></endpoint></send>
  </case>
  <case regex="RETAIL">
    <send><endpoint><address uri="http://retail/api"/></endpoint></send>
  </case>
  <default>
    <send><endpoint><address uri="http://general/api"/></endpoint></send>
  </default>
</switch>

<!-- Script mediator with business logic -->
<script language="js">
  var amount = mc.getPayloadJSON().order.amount;
  if (amount > 5000) {
    mc.setProperty("approvalRequired", "true");
  }
</script>
```

**Configuration files:**
```
synapse-configs/default/proxy-services/*.xml   — Proxy service definitions
synapse-configs/default/sequences/*.xml        — Mediation sequences
synapse-configs/default/endpoints/*.xml        — Endpoint definitions
synapse-configs/default/api/*.xml              — API definitions
```

### Apache Camel

**Business logic locations:**
- `<choice>/<when>` with Simple or XPath predicates
- `<bean>` references to Java methods
- `<process>` references to custom Processor classes
- Predicate expressions in `<filter>`
- `<aggregate>` with custom aggregation strategies
- RouteBuilder Java classes with `.choice().when()` chains

**Key patterns to scan:**
```java
// Java DSL business routing
from("jms:queue:orders")
  .choice()
    .when(simple("${body.amount} > 10000"))
      .to("direct:highValueApproval")
    .when(simple("${body.customerType} == 'VIP'"))
      .to("direct:vipProcessing")
    .otherwise()
      .to("direct:standardProcessing");

// Custom processor with business logic
.process(exchange -> {
    Order order = exchange.getIn().getBody(Order.class);
    double discount = calculateTierDiscount(order);
    order.setFinalPrice(order.getPrice() * (1 - discount));
});
```

**Configuration files:**
```
**/camel-context.xml              — XML DSL routes
**/routes/*.xml                   — Route definitions
**/routes/*.yaml                  — YAML DSL routes
**/*RouteBuilder.java             — Java DSL routes
**/*Routes.java                   — Java DSL routes
**/application.properties         — Endpoint configuration
```

## Business Rule Extraction Templates

### Template 1: Conditional Routing Rule

```markdown
**Rule Name:** [descriptive name]
**Route:** [route ID/name]
**Category:** BUSINESS_RULE

**Description (plain language):**
[What business decision does this rule make?]

**Predicate:**
[Exact XPath/JSONPath/expression from config]

**Conditions and Outcomes:**
| Condition | Destination | Business Meaning |
|-----------|-------------|-----------------|
| [expression] | [target endpoint] | [what this means in business terms] |

**External Dependencies:** [list any DB lookups, service calls]
**Side Effects:** [DB writes, notifications, file creation]
**Suggested Migration Target:** [microservice, rules engine, serverless]
```

### Template 2: Calculation Rule

```markdown
**Rule Name:** [descriptive name]
**Route:** [route ID/name]
**Category:** BUSINESS_RULE

**Description (plain language):**
[What does this calculation produce?]

**Formula:**
[Exact formula/logic from config]

**Input Fields:**
| Field | Source | Type |
|-------|--------|------|

**Output Fields:**
| Field | Derivation | Type |
|-------|-----------|------|

**Business Constraints:**
- [threshold values, valid ranges, special cases]

**External Dependencies:** [lookup tables, reference data]
**Suggested Migration Target:** [microservice, rules engine, serverless]
```

### Template 3: Validation Rule

```markdown
**Rule Name:** [descriptive name]
**Route:** [route ID/name]
**Category:** BUSINESS_RULE

**Description (plain language):**
[What does this validation check?]

**Validation Logic:**
[Exact validation expression/code]

**Pass Criteria:** [what makes a message valid]
**Fail Action:** [reject, route to error queue, flag for review]
**Regulatory Context:** [if applicable — compliance requirement reference]

**External Dependencies:** [reference data, sanctions lists, etc.]
**Suggested Migration Target:** [microservice, rules engine, serverless]
```

### Template 4: Enrichment-Driven Rule

```markdown
**Rule Name:** [descriptive name]
**Route:** [route ID/name]
**Category:** BUSINESS_RULE (enrichment + decision)

**Description (plain language):**
[What data is fetched and what decision does it drive?]

**Enrichment Source:** [DB query, service call, file lookup]
**Enrichment Query:** [exact SQL/URL/path]
**Decision Logic:**
[How the enriched data drives routing/processing]

**Without Enrichment Source:** [what happens if lookup fails]
**Suggested Migration Target:** [microservice with dedicated data access]
```
