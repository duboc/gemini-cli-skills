# ESB Configuration Formats Reference

Platform-specific file patterns, XML namespaces, configuration elements, and detection heuristics for major ESB platforms.

## MuleSoft (Mule 3 and Mule 4)

### File Patterns and Directory Structure

```
src/main/mule/           # Mule 4 flow definitions
src/main/app/            # Mule 3 flow definitions
src/main/resources/      # Properties, WSDL, XSD
mule-artifact.json       # Mule 4 project descriptor
mule-app.properties      # Mule 3 app properties
*.xml                    # Flow definitions
*.dwl                    # DataWeave transformations
```

### XML Namespaces

| Namespace URI | Prefix | Purpose |
|--------------|--------|---------|
| `http://www.mulesoft.org/schema/mule/core` | `mule` | Core flow elements |
| `http://www.mulesoft.org/schema/mule/http` | `http` | HTTP connector |
| `http://www.mulesoft.org/schema/mule/jms` | `jms` | JMS connector |
| `http://www.mulesoft.org/schema/mule/db` | `db` | Database connector |
| `http://www.mulesoft.org/schema/mule/file` | `file` | File connector |
| `http://www.mulesoft.org/schema/mule/sftp` | `sftp` | SFTP connector |
| `http://www.mulesoft.org/schema/mule/ee/core` | `ee` | Enterprise edition / DataWeave |
| `http://www.mulesoft.org/schema/mule/vm` | `vm` | VM (in-memory) connector |

### Key Configuration Elements

```xml
<!-- Flow definition -->
<flow name="orderProcessingFlow">
  <http:listener config-ref="HTTP_Listener" path="/api/orders" />
  <ee:transform>
    <ee:message>
      <ee:set-payload><![CDATA[%dw 2.0 ...]]></ee:set-payload>
    </ee:message>
  </ee:transform>
  <jms:publish config-ref="JMS_Config" destination="orders.queue" />
  <error-handler>
    <on-error-propagate type="ANY">
      <jms:publish config-ref="JMS_Config" destination="orders.dlq" />
    </on-error-propagate>
  </error-handler>
</flow>

<!-- Global connector configs -->
<http:listener-config name="HTTP_Listener" host="0.0.0.0" port="8081" />
<jms:config name="JMS_Config">
  <jms:active-mq-connection url="tcp://broker:61616" />
</jms:config>
```

### Platform Detection Heuristics

- Presence of `mule-artifact.json` confirms Mule 4
- Presence of `mule-app.properties` confirms Mule 3
- XML files with `http://www.mulesoft.org/schema/mule/core` namespace
- `*.dwl` files indicate DataWeave transformations

---

## TIBCO BusinessWorks (5.x and 6.x)

### File Patterns and Directory Structure

```
*.process                 # BW process definitions
*.substvar                # Substitution variables (env-specific)
*.xml                     # Shared resources, connections
*.xsd                     # XML schemas
*.wsdl                    # Service definitions
defaultVars/              # Default variable values
Processes/                # Process definitions directory
Resources/                # Shared resources
```

### Key Configuration Elements

```xml
<!-- Process definition -->
<pd:ProcessDefinition xmlns:pd="http://xmlns.tibco.com/bw/process/2003">
  <pd:starter name="HTTP Receiver">
    <config>
      <sharedChannel>/SharedResources/HTTP Connection.sharedjmscon</sharedChannel>
    </config>
  </pd:starter>
  <pd:activity name="Send JMS Message">
    <pd:type>com.tibco.plugin.jms.JMSSendActivity</pd:type>
    <config>
      <PermittedMessageType>Text</PermittedMessageType>
      <SessionAttributes>
        <transacted>false</transacted>
        <acknowledgeMode>1</acknowledgeMode>
        <maxSessions>1</maxSessions>
        <destination>%%OrderQueue%%</destination>
      </SessionAttributes>
    </config>
  </pd:activity>
</pd:ProcessDefinition>
```

### XML Namespaces

| Namespace URI | Prefix | Purpose |
|--------------|--------|---------|
| `http://xmlns.tibco.com/bw/process/2003` | `pd` | Process definitions |
| `http://xmlns.tibco.com/bw/palette/jms/2002` | `jms` | JMS activities |
| `http://xmlns.tibco.com/bw/palette/http/2002` | `http` | HTTP activities |
| `http://xmlns.tibco.com/bw/palette/jdbc/2002` | `jdbc` | JDBC activities |
| `http://xmlns.tibco.com/bw/palette/file/2002` | `file` | File activities |
| `http://xmlns.tibco.com/bw/palette/soap/2002` | `soap` | SOAP activities |

### Platform Detection Heuristics

- Presence of `*.process` files
- Presence of `*.substvar` files
- XML namespace `http://xmlns.tibco.com/bw/process/2003`
- Directory named `Processes/` with XML content

---

## IBM Integration Bus (IIB) / App Connect Enterprise (ACE)

### File Patterns and Directory Structure

```
*.msgflow                 # Message flow definitions
*.subflow                 # Reusable sub-flows
*.esql                    # Extended SQL (transformation logic)
*.bar                     # Broker Archive (deployment artifact)
*.map                     # Graphical data mapper definitions
broker.xml                # Broker configuration
policy.xml                # Policy definitions
META-INF/broker.xml       # Application descriptor
```

### Key Configuration Elements

```xml
<!-- Message flow (.msgflow) -->
<ecore:EPackage xmlns:ecore="http://www.eclipse.org/emf/2002/Ecore">
  <composition>
    <nodes xsi:type="ComIbmMQInput.msgnode" queueName="INPUT.QUEUE" />
    <nodes xsi:type="ComIbmCompute.msgnode" computeExpression="esql://routine/processOrder" />
    <nodes xsi:type="ComIbmMQOutput.msgnode" queueName="OUTPUT.QUEUE" />
    <connections sourceNode="MQInput" targetNode="Compute" />
    <connections sourceNode="Compute" targetNode="MQOutput" />
  </composition>
</ecore:EPackage>
```

```sql
-- ESQL transformation
CREATE COMPUTE MODULE processOrder
  CREATE FUNCTION Main() RETURNS BOOLEAN
  BEGIN
    SET OutputRoot.XMLNSC.Order.OrderId = InputRoot.XMLNSC.Request.Id;
    SET OutputRoot.XMLNSC.Order.Amount = InputRoot.XMLNSC.Request.Total;
    PROPAGATE TO TERMINAL 'out';
    RETURN TRUE;
  END;
END MODULE;
```

### Platform Detection Heuristics

- Presence of `*.msgflow` or `*.subflow` files
- Presence of `*.esql` files
- Presence of `*.bar` files
- `META-INF/broker.xml` descriptor
- XML node types prefixed with `ComIbm`

---

## WSO2 ESB / Micro Integrator

### File Patterns and Directory Structure

```
synapse-config/
  api/                    # REST API definitions
  proxy-services/         # Proxy service definitions
  sequences/              # Mediation sequences
  endpoints/              # Endpoint definitions
  local-entries/          # Local registry entries
  tasks/                  # Scheduled tasks
  inbound-endpoints/      # Inbound endpoint configs
synapse.xml               # Main synapse configuration
```

### XML Namespaces

| Namespace URI | Prefix | Purpose |
|--------------|--------|---------|
| `http://ws.apache.org/ns/synapse` | `syn` | Core synapse configuration |

### Key Configuration Elements

```xml
<!-- Proxy service -->
<proxy name="OrderProxy" transports="http https"
       xmlns="http://ws.apache.org/ns/synapse">
  <target>
    <inSequence>
      <log level="full"/>
      <send>
        <endpoint key="OrderBackend"/>
      </send>
    </inSequence>
    <outSequence>
      <send/>
    </outSequence>
    <faultSequence>
      <log level="custom">
        <property name="ERROR" expression="get-property('ERROR_MESSAGE')"/>
      </log>
    </faultSequence>
  </target>
</proxy>

<!-- Endpoint definition -->
<endpoint name="OrderBackend" xmlns="http://ws.apache.org/ns/synapse">
  <http method="POST" uri-template="http://backend:8080/api/orders"/>
</endpoint>
```

### Platform Detection Heuristics

- Presence of `synapse.xml` or `synapse-config/` directory
- Directories named `proxy-services/`, `sequences/`, `endpoints/`
- XML namespace `http://ws.apache.org/ns/synapse`

---

## Oracle Service Bus (OSB)

### File Patterns and Directory Structure

```
*.proxy                   # Proxy service definitions
*.biz                     # Business service definitions
*.pipeline                # Message flow pipelines
*.wsdl                    # Service contracts
*.xquery                  # XQuery transformations
*.xslt                    # XSLT transformations
sbconfig/                 # Service Bus configuration root
  project/
    ProxyService/
    BusinessService/
    Pipeline/
    WSDL/
```

### Key Configuration Elements

```xml
<!-- Proxy service -->
<xml-fragment xmlns:ser="http://www.bea.com/wli/sb/services"
              xmlns:con="http://www.bea.com/wli/sb/pipeline/config">
  <ser:coreEntry isProxy="true" isEnabled="true">
    <ser:binding type="SOAP" isSoap12="false">
      <ser:wsdl ref="project/WSDL/OrderService"/>
    </ser:binding>
    <ser:ws-policy/>
  </ser:coreEntry>
</xml-fragment>

<!-- Business service -->
<xml-fragment xmlns:ser="http://www.bea.com/wli/sb/services">
  <ser:coreEntry isProxy="false">
    <ser:binding type="SOAP">
      <ser:wsdl ref="project/WSDL/BackendOrderService"/>
    </ser:binding>
    <ser:endpointConfig>
      <ser:providerSpecific>
        <ser:loadBalancingAlgorithm>round-robin</ser:loadBalancingAlgorithm>
        <ser:URI>http://backend:7001/services/OrderService</ser:URI>
      </ser:providerSpecific>
    </ser:endpointConfig>
  </ser:coreEntry>
</xml-fragment>
```

### XML Namespaces

| Namespace URI | Prefix | Purpose |
|--------------|--------|---------|
| `http://www.bea.com/wli/sb/services` | `ser` | Service definitions |
| `http://www.bea.com/wli/sb/pipeline/config` | `con` | Pipeline configuration |
| `http://www.bea.com/wli/sb/stages/config` | `con1` | Stage configuration |
| `http://www.bea.com/wli/sb/stages/transform/config` | `tran` | Transformations |

### Platform Detection Heuristics

- Presence of `*.proxy` and `*.biz` files
- Presence of `*.pipeline` files
- XML namespace `http://www.bea.com/wli/sb/services`
- Directory structure with `ProxyService/` and `BusinessService/`

---

## Apache ServiceMix / Apache Camel

### File Patterns and Directory Structure

```
# Spring XML DSL
camel-context.xml                   # Camel context with routes
META-INF/spring/camel-context.xml   # Spring-based Camel context

# Java DSL
src/main/java/**/routes/           # RouteBuilder classes
*RouteBuilder.java                  # Convention-named route builders
*Route.java                         # Convention-named routes

# YAML DSL (Camel 3.x+)
src/main/resources/camel/*.yaml     # YAML route definitions
src/main/resources/routes/*.yaml    # Alternative location

# Blueprint (OSGi)
OSGI-INF/blueprint/blueprint.xml    # OSGi Blueprint routes
```

### XML Namespaces

| Namespace URI | Prefix | Purpose |
|--------------|--------|---------|
| `http://camel.apache.org/schema/spring` | `camel` | Spring XML routes |
| `http://camel.apache.org/schema/blueprint` | `camel` | Blueprint XML routes |

### Key Configuration Elements

```xml
<!-- Spring XML DSL -->
<camelContext xmlns="http://camel.apache.org/schema/spring">
  <route id="orderRoute">
    <from uri="jms:queue:incoming.orders"/>
    <marshal><json library="Jackson"/></marshal>
    <to uri="http://backend:8080/api/orders"/>
    <onException>
      <exception>java.lang.Exception</exception>
      <handled><constant>true</constant></handled>
      <to uri="jms:queue:orders.dlq"/>
    </onException>
  </route>
</camelContext>
```

```java
// Java DSL
public class OrderRoute extends RouteBuilder {
    @Override
    public void configure() {
        from("jms:queue:incoming.orders")
            .marshal().json(JsonLibrary.Jackson)
            .to("http://backend:8080/api/orders")
            .onException(Exception.class)
                .handled(true)
                .to("jms:queue:orders.dlq");
    }
}
```

```yaml
# YAML DSL
- route:
    id: orderRoute
    from:
      uri: jms:queue:incoming.orders
    steps:
      - marshal:
          json:
            library: Jackson
      - to:
          uri: http://backend:8080/api/orders
```

### Platform Detection Heuristics

- Presence of `camel-context.xml`
- Java files extending `RouteBuilder`
- XML namespace `http://camel.apache.org/schema/spring`
- Maven/Gradle dependencies on `camel-core`
- `from("...")` and `.to("...")` patterns in Java files

---

## Dell Boomi

### File Patterns and Directory Structure

```
*.xml                     # Process definitions (exported)
*.json                    # Component configurations
component/                # Component definitions
process/                  # Process definitions
connection/               # Connection configurations
operation/                # Operation definitions
```

### Key Configuration Elements

```xml
<!-- Boomi process (exported XML) -->
<bns:Process xmlns:bns="http://api.platform.boomi.com/"
             name="Order Processing">
  <bns:Component componentId="abc-123" type="connector">
    <bns:object>
      <connectorType>http</connectorType>
      <connectionId>conn-456</connectionId>
      <operationId>op-789</operationId>
    </bns:object>
  </bns:Component>
  <bns:Component componentId="abc-124" type="map">
    <bns:object>
      <mapId>map-101</mapId>
    </bns:object>
  </bns:Component>
</bns:Process>
```

### Platform Detection Heuristics

- XML namespace `http://api.platform.boomi.com/`
- Presence of `componentId` attributes in XML
- Directory structure with `component/`, `process/`, `connection/`
- JSON files with `connectorType` fields

---

## Cross-Platform Detection Strategy

When scanning a repository, apply these checks in order:

1. **Check for platform-specific markers** (highest confidence):
   - `mule-artifact.json` -> MuleSoft 4
   - `mule-app.properties` -> MuleSoft 3
   - `*.process` + `*.substvar` -> TIBCO BW
   - `*.msgflow` + `*.esql` -> IBM IIB/ACE
   - `synapse.xml` or `synapse-config/` -> WSO2
   - `*.proxy` + `*.biz` -> Oracle OSB
   - `camel-context.xml` or `RouteBuilder` classes -> Apache Camel
   - `http://api.platform.boomi.com/` namespace -> Dell Boomi

2. **Check build files for dependencies** (medium confidence):
   - `mule-maven-plugin` in pom.xml -> MuleSoft
   - `camel-core` dependency -> Apache Camel
   - `wso2` in dependency group IDs -> WSO2

3. **Check XML namespaces in config files** (medium confidence):
   - Parse first few lines of XML files for known namespace URIs

4. **Support multi-vendor detection**:
   - A single repository may contain multiple ESB platforms
   - Report each platform separately in the catalog
   - Flag cross-platform integrations (e.g., Camel routes calling MuleSoft endpoints)
