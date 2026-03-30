# Dead Code Heuristics Reference

Framework-specific patterns, reflection detection, feature flag identification, seasonal code heuristics, and false positive avoidance for dead code analysis.

---

## Framework-Specific Dead Code Patterns

### Spring Framework / Spring Boot

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| `@Component`, `@Service`, `@Repository` | Is the class injected anywhere via `@Autowired`, `@Inject`, or XML? | No injection point found |
| `@Bean` methods in `@Configuration` | Is the returned bean type referenced by any other bean or component? | Bean type not injected anywhere |
| `@Controller` / `@RestController` | Are any of the mapped endpoints hit in access logs or APM? | Zero hits over 12 months |
| `@Scheduled` methods | Does the scheduler log show execution? Is the cron expression valid? | No execution records; invalid cron |
| `@EventListener` / `ApplicationListener` | Is the event type ever published via `ApplicationEventPublisher`? | Event type never published |
| `@Profile("xyz")` | Is the profile ever activated in any environment? | Profile not in any `application.yml` or deployment config |
| `@ConditionalOnProperty` | Is the property ever set to the activating value? | Property always set to non-activating value |
| XML bean definitions | Is the bean ID referenced in any other XML or `@ImportResource`? | Bean ID not referenced |
| `@Aspect` classes | Are the pointcut expressions matching any existing code? | Pointcut matches zero join points |
| `@ConfigurationProperties` | Is the prefix used in any property file? | Prefix not found in any config |

**Spring-specific caution:** `@ConditionalOnMissingBean` may activate a bean only when another is absent. Check all conditional annotations before flagging.

### EJB (Enterprise JavaBeans)

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| `@Stateless`, `@Stateful`, `@Singleton` | Is the EJB injected via `@EJB` or looked up via JNDI? | No injection or JNDI lookup found |
| `@MessageDriven` | Is the destination queue/topic active? Are messages being sent? | Queue/topic has zero throughput |
| `@Remote` / `@Local` interfaces | Is the interface referenced by any client code? | Interface not imported anywhere |
| `ejb-jar.xml` entries | Are the declared beans referenced in application code? | Bean name not found in codebase |
| `@Schedule` (EJB timer) | Does the timer service log show execution? | No timer execution records |
| Entity beans (EJB 2.x) | Are the finder methods or home interfaces used? | Home interface not referenced |

**EJB-specific caution:** Remote EJBs may be called by external systems not in the current codebase. Check JNDI bindings and network traffic before flagging.

### Struts (1.x and 2.x)

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| `struts-config.xml` action mappings | Is the action path hit in access logs? | URL path has zero hits |
| `Action` subclasses | Is the class referenced in `struts-config.xml`? | Class not in any action mapping |
| `ActionForm` subclasses | Is the form bean referenced by any action mapping? | Form bean name not in config |
| Struts 2 `struts.xml` actions | Is the action namespace/name hit in access logs? | Zero hits on action URL |
| Tiles definitions | Is the tile definition referenced by any action result? | Tile name not in any result |
| Interceptor classes | Is the interceptor referenced in any interceptor stack? | Not in any stack definition |

**Struts-specific caution:** Struts 1.x uses convention-based mappings. An `Action` class may be invoked by URL pattern without explicit configuration.

### JSF (JavaServer Faces)

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| `@ManagedBean` / `@Named` | Is the bean EL-referenced in any `.xhtml` or `.jsp`? | Bean name not in any view template |
| Facelets `.xhtml` pages | Is the page navigated to by any navigation rule or link? | Page URL has zero hits |
| `faces-config.xml` navigation rules | Are the from/to view IDs valid pages? | View ID points to nonexistent page |
| Custom converters/validators | Are they referenced via `converter=` or `validator=` in templates? | Converter/validator ID not in any template |
| `@ViewScoped` / `@SessionScoped` beans | Is the backing page itself dead? | Backing page is dead code |
| Composite components | Is the component tag used in any template? | Custom tag not found in any `.xhtml` |

### React

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| Component files (`.jsx`, `.tsx`) | Is the component imported by any other file? | Zero import references |
| Named exports | Is the exported name imported anywhere? | Export not imported |
| Route definitions | Is the route path ever navigated to (analytics/access logs)? | Zero pageviews on route |
| Context providers | Is the context consumed by any `useContext` call? | Context not consumed |
| Custom hooks (`use*`) | Is the hook imported and called? | Hook not imported |
| Redux actions/reducers | Is the action type dispatched? Is the reducer slice accessed? | Action never dispatched; slice never read |
| Higher-order components | Is the HOC wrapping any component? | HOC not called |
| Prop types / interfaces | Is the type used by any component? | Type not referenced |
| CSS modules / styled components | Is the style class or component used? | Style not imported or applied |

**React-specific caution:** Dynamic imports (`React.lazy`, `import()`) and code splitting may hide references. Check webpack/Vite config for dynamic import patterns.

### Angular

| Pattern | What to Check | Dead Code Signal |
|---------|--------------|-----------------|
| `@Component` | Is the component declared in a module and used in a template or route? | Not in any module declarations or routes |
| `@Injectable` services | Is the service injected via constructor in any component or other service? | Not injected anywhere |
| `@NgModule` | Is the module imported by another module or the root module? | Not imported by any other module |
| `@Pipe` | Is the pipe used in any template (` | pipeName`)? | Pipe name not in any template |
| `@Directive` | Is the directive selector used in any template? | Selector not in any template |
| Route definitions | Is the route path hit in analytics? | Zero navigation to route |
| Lazy-loaded modules | Is the module referenced in any route config `loadChildren`? | Not in any route config |
| RxJS operators / custom operators | Is the operator piped in any observable chain? | Operator not used |

---

## Reflection Detection Patterns

Reflection makes static analysis unreliable. Flag these patterns for manual review rather than marking as dead code.

### Java

```
Class.forName("...")
Class.newInstance()
Constructor.newInstance(...)
Method.invoke(...)
Field.get(...) / Field.set(...)
Proxy.newProxyInstance(...)
MethodHandles.lookup()
ServiceLoader.load(...)
ApplicationContext.getBean(...)
BeanFactory.getBean(...)
```

**Search patterns (regex):**
```
Class\.forName\s*\(
\.newInstance\s*\(
Method\.invoke\s*\(
\.getBean\s*\(
ServiceLoader\.load\s*\(
MethodHandles\.lookup\s*\(
```

### Python

```
getattr(obj, "method_name")
setattr(obj, "attr_name", value)
importlib.import_module("module.name")
__import__("module_name")
globals()["function_name"]
eval("expression")
exec("code")
```

**Search patterns (regex):**
```
getattr\s*\(
setattr\s*\(
importlib\.import_module\s*\(
__import__\s*\(
globals\s*\(\s*\)\s*\[
eval\s*\(
exec\s*\(
```

### JavaScript / TypeScript

```
require(variable)          // dynamic require
import(variable)           // dynamic import
obj[methodName]()          // computed property access
Reflect.get / Reflect.apply
eval("code")
new Function("code")
```

**Search patterns (regex):**
```
require\s*\(\s*[^"'`]      // dynamic require (non-literal argument)
import\s*\(\s*[^"'`]       // dynamic import (non-literal argument)
Reflect\.(get|set|apply|construct)\s*\(
eval\s*\(
new\s+Function\s*\(
```

### C# / .NET

```
Type.GetType("...")
Activator.CreateInstance(...)
MethodInfo.Invoke(...)
Assembly.LoadFrom(...)
Delegate.DynamicInvoke(...)
```

**Search patterns (regex):**
```
Type\.GetType\s*\(
Activator\.CreateInstance\s*\(
MethodInfo\.Invoke\s*\(
Assembly\.Load(From)?\s*\(
\.DynamicInvoke\s*\(
```

---

## Feature Flag Library Detection

Code behind a disabled feature flag is **dormant, not dead**. Detect these libraries and exclude flagged code from dead code results.

| Library | Language | Detection Pattern |
|---------|----------|------------------|
| LaunchDarkly | Java, JS, Python, Go, .NET | `import com.launchdarkly`, `require('launchdarkly')`, `ldclient` |
| Unleash | Java, JS, Python | `import no.finn.unleash`, `require('unleash-client')` |
| Togglz | Java | `import org.togglz`, `@ActivationStrategy` |
| Split.io | Java, JS, Python | `import io.split`, `require('@splitsoftware/splitio')` |
| Flagsmith | JS, Python | `require('flagsmith')`, `from flagsmith import` |
| ConfigCat | Java, JS, Python, .NET | `import com.configcat`, `require('configcat')` |
| OpenFeature | Any | `import dev.openfeature`, `require('@openfeature')` |
| Custom flags | Any | `feature.enabled`, `isFeatureEnabled`, `feature_flag`, `feature_toggle` |
| Spring profiles | Java | `@Profile`, `spring.profiles.active` |
| Environment checks | Any | `process.env.FEATURE_`, `os.environ.get("FEATURE_")`, `System.getProperty("feature.")` |

**Heuristic:** Search for common flag patterns in conditionals:
```
if.*feature.*enabled
if.*flag.*active
if.*toggle.*on
@ConditionalOnProperty.*enabled
```

---

## Seasonal Code Identification

Code that executes on specific schedules may appear dead during off-season analysis. Flag these patterns for extended observation rather than removal.

### Calendar-Based Patterns

| Pattern | Indicators | Recommended Observation Window |
|---------|-----------|-------------------------------|
| Year-end processing | Class/method names containing `yearEnd`, `annual`, `fiscal`, `eoy` | 12+ months |
| Quarterly reporting | Names containing `quarterly`, `q1`-`q4`, `quarter` | 6+ months |
| Monthly processing | Names containing `monthly`, `month_end`, `eom` | 3+ months |
| Tax season | Names containing `tax`, `1099`, `w2`, `filing` | 12+ months |
| Holiday/seasonal | Names containing `holiday`, `christmas`, `blackFriday`, `seasonal`, `promotion` | 12+ months |
| Enrollment periods | Names containing `enrollment`, `openEnrollment`, `registration` | 12+ months |
| Audit | Names containing `audit`, `compliance`, `sox`, `regulatory` | 12+ months |

### Cron Expression Analysis

| Cron Frequency | Example | Flag If No Hits Within |
|---------------|---------|----------------------|
| Every minute/hour | `0 * * * *` | 1 week |
| Daily | `0 0 * * *` | 1 month |
| Weekly | `0 0 * * 0` | 2 months |
| Monthly | `0 0 1 * *` | 3 months |
| Quarterly | `0 0 1 1,4,7,10 *` | 6 months |
| Annually | `0 0 1 1 *` | 14 months |

### Disaster Recovery / Failover Code

Never flag as dead without explicit team confirmation:

| Indicator | Examples |
|-----------|---------|
| Package/namespace names | `disaster`, `recovery`, `failover`, `fallback`, `circuit_breaker` |
| Class names | `DisasterRecoveryService`, `FailoverHandler`, `BackupProcessor` |
| Configuration | `dr.enabled`, `failover.mode`, `backup.endpoint` |
| Documentation references | Mentioned in runbooks, incident response docs, BCP plans |

---

## Common False Positive Patterns

### 1. Interface Implementations with DI

**False positive:** An implementation class appears to have no callers because all references use the interface type.

**How to avoid:** When scanning for references to `FooServiceImpl`, also check for references to `FooService` (the interface). If the interface is injected, the implementation is alive.

### 2. Convention-Over-Configuration Frameworks

**False positive:** A class has no explicit references but is discovered by framework convention (package scanning, naming convention).

**Common frameworks:**
- Spring component scanning (`@ComponentScan`)
- Struts action naming conventions
- Rails convention (controller names map to routes)
- Django URL auto-discovery

**How to avoid:** Check framework configuration for base packages, scan paths, and naming conventions before flagging.

### 3. Serialization / Deserialization Classes

**False positive:** DTOs, POJOs, or data classes appear unused because they are only referenced by serialization frameworks (Jackson, Gson, Protobuf).

**How to avoid:** Check for `@JsonProperty`, `@XmlElement`, `@SerializedName`, `Serializable`, protobuf definitions. These classes are alive if the endpoint they serve is alive.

### 4. Annotation Processor Generated Code

**False positive:** Source code is generated at compile time by annotation processors (Lombok, MapStruct, Dagger, AutoValue).

**How to avoid:** Check for annotation processor dependencies in the build file. Generated code in `target/generated-sources` or `build/generated` should be excluded from dead code analysis.

### 5. Test Infrastructure

**False positive:** Test utilities, fixtures, builders, and base test classes appear unused because they are only referenced from test code.

**How to avoid:** Separate test code from production code analysis. Flag test utilities that test dead production code, but don't flag test infrastructure as dead production code.

### 6. SPI (Service Provider Interface) Implementations

**False positive:** Classes listed in `META-INF/services/` files have no direct import references.

**How to avoid:** Check `META-INF/services/` directory for all interface files. Classes listed there are loaded at runtime by `ServiceLoader`.

### 7. Callback / Webhook Handlers

**False positive:** Endpoint handlers for external callbacks (payment gateway webhooks, OAuth callbacks, CI/CD hooks) may have zero internal references.

**How to avoid:** Check for URL patterns like `/callback`, `/webhook`, `/notify`, `/hook`. Cross-reference with external system configurations.

### 8. Database Migration Classes

**False positive:** Flyway (`V1__*.java`), Liquibase changesets, or Alembic migrations appear unused after execution.

**How to avoid:** Never flag migration classes as dead code. They are historical records required for database versioning.

### 9. Aspect-Oriented Cross-Cutting Concerns

**False positive:** `@Aspect` classes, servlet filters, and middleware have no direct callers because they are woven at compile/runtime.

**How to avoid:** Check for `@Aspect` with valid pointcut expressions, filter registrations in `web.xml` or `FilterRegistrationBean`, middleware registrations.

### 10. Multi-Module Shared Libraries

**False positive:** A class in a shared library module appears unused within that module but is consumed by other modules.

**How to avoid:** Analyze all modules that depend on the shared library. Check the library's consumers before flagging any public API as dead.
