# Complexity Scoring Reference

Detailed rubric for scoring stored procedure complexity and classifying procedures for modernization prioritization.

## Scoring Rubric

Each procedure is scored 0-100 across six weighted dimensions. The final score is the weighted sum, rounded to the nearest integer.

### 1. Line Count (Weight: 15%)

Counts executable lines only — excludes blank lines, comments, and header/footer boilerplate (CREATE PROCEDURE ... AS/IS, BEGIN/END wrappers).

| Score Range | Line Count | Rationale |
|-------------|-----------|-----------|
| 0-10 | 1-15 lines | Trivial wrapper or single-statement procedure |
| 11-33 | 16-50 lines | Simple logic, likely single responsibility |
| 34-50 | 51-100 lines | Moderate logic, may contain some branching |
| 51-66 | 101-200 lines | Significant logic, likely multiple responsibilities |
| 67-85 | 201-500 lines | Complex procedure, candidate for decomposition |
| 86-100 | 500+ lines | Monolithic procedure, high priority for refactoring |

### 2. JOIN Depth (Weight: 20%)

Counts distinct JOIN clauses and subquery nesting levels. Correlated subqueries count double.

| Score Range | JOIN Pattern | Rationale |
|-------------|-------------|-----------|
| 0 | No JOINs, single-table access | Pure CRUD |
| 10-20 | 1 JOIN or 1 simple subquery | FK lookup or basic relationship |
| 21-40 | 2-3 JOINs | Standard multi-table query |
| 41-66 | 4-5 JOINs or 1-2 nested subqueries | Complex data retrieval |
| 67-85 | 6+ JOINs or correlated subqueries | Difficult to translate to ORM |
| 86-100 | Deeply nested subqueries (3+ levels) or self-joins with recursion | Requires significant redesign |

### 3. Cursor Usage (Weight: 15%)

Detects explicit cursors (DECLARE CURSOR, OPEN, FETCH, CLOSE) and implicit cursor loops (FOR rec IN ... LOOP in PL/SQL).

| Score Range | Cursor Pattern | Rationale |
|-------------|---------------|-----------|
| 0 | No cursors | Set-based operations only |
| 20-40 | Single cursor, forward-only, read-only | Simple row iteration, often replaceable with set-based SQL |
| 41-66 | Single cursor with DML inside loop | Row-by-row processing, performance concern |
| 67-85 | Multiple cursors or cursor with conditional logic | Complex iterative logic |
| 86-100 | Nested cursors or cursor calling other procedures | Highest complexity, hardest to modernize |

### 4. Dynamic SQL (Weight: 20%)

Detects dynamically constructed SQL statements. This is the highest-risk dimension for modernization because dynamic SQL often encodes complex business rules in string operations.

| Score Range | Dynamic SQL Pattern | Rationale |
|-------------|-------------------|-----------|
| 0 | No dynamic SQL | Fully static, easy to analyze and migrate |
| 15-33 | Parameterized EXECUTE with fixed SQL template | Low risk — parameters prevent injection, structure is known |
| 34-50 | EXECUTE IMMEDIATE / sp_executesql with simple variable substitution | Moderate risk — SQL structure is mostly fixed |
| 51-75 | Dynamic WHERE clause construction (conditional concatenation) | High risk — query shape varies at runtime |
| 76-90 | Dynamic table/column names or fully constructed SQL strings | Very high risk — difficult to validate and migrate |
| 91-100 | Nested dynamic SQL (EXEC inside EXEC) or dynamic SQL generating dynamic SQL | Maximum risk — requires complete rewrite |

**Detection patterns by dialect:**

| Dialect | Dynamic SQL Markers |
|---------|-------------------|
| PL/SQL | `EXECUTE IMMEDIATE`, `DBMS_SQL.PARSE`, `OPEN cursor FOR dynamic_string` |
| T-SQL | `EXEC(@sql)`, `EXEC sp_executesql`, `EXECUTE(@sql)`, string concatenation with `+` building SQL |
| PL/pgSQL | `EXECUTE format(...)`, `EXECUTE dynamic_string`, `EXECUTE ... USING` |

### 5. Cross-Schema References (Weight: 15%)

Detects references to objects outside the procedure's own schema, including remote database access.

| Score Range | Reference Pattern | Rationale |
|-------------|------------------|-----------|
| 0 | Same schema only | Self-contained, easy to migrate independently |
| 15-33 | References 1 other schema in same database | Minor dependency, requires coordination |
| 34-55 | References 2-3 other schemas | Moderate coupling, migration order matters |
| 56-75 | References objects via DB links (Oracle) or linked servers (SQL Server) | Remote dependency, significant migration complexity |
| 76-90 | References 4+ schemas or multiple remote sources | High coupling, likely orchestration role |
| 91-100 | Cross-database + cross-server references combined | Maximum coupling, requires architecture redesign |

**Detection patterns by dialect:**

| Dialect | Cross-Schema Markers |
|---------|---------------------|
| PL/SQL | `schema_name.object_name`, `object_name@db_link`, `ALL_/DBA_` dictionary views |
| T-SQL | `schema_name.object_name`, `database_name.schema_name.object_name`, `server_name.database_name.schema_name.object_name` |
| PL/pgSQL | `schema_name.object_name`, `dblink()`, `postgres_fdw` foreign tables |

### 6. Parameter Count (Weight: 15%)

Counts input, output, and input/output parameters. OUT and INOUT parameters increase complexity because they create implicit contracts with callers.

| Score Range | Parameter Pattern | Rationale |
|-------------|------------------|-----------|
| 0-10 | 0-1 parameters, all IN | Minimal interface |
| 11-33 | 2-3 parameters, all IN | Simple interface |
| 34-50 | 4-6 IN parameters | Moderate interface, consider parameter object |
| 51-66 | 7-8 parameters, or any OUT parameters | Complex interface, tight caller coupling |
| 67-85 | 9-12 parameters, or multiple OUT/INOUT | Very complex interface |
| 86-100 | 13+ parameters, or cursor OUT parameters, or TABLE-type parameters | Maximum interface complexity, requires significant redesign |

## SQL Dialect Detection Patterns

Use these syntax markers to auto-detect the SQL dialect without asking the user.

### PL/SQL (Oracle)

**Strong indicators** (any one confirms PL/SQL):
- `CREATE OR REPLACE PROCEDURE` / `FUNCTION` / `PACKAGE`
- `%TYPE` or `%ROWTYPE` variable declarations
- `PRAGMA AUTONOMOUS_TRANSACTION` / `PRAGMA EXCEPTION_INIT`
- `SYS_REFCURSOR` or `REF CURSOR`
- `DBMS_OUTPUT.PUT_LINE` / `DBMS_LOB` / `DBMS_SQL`
- `EXCEPTION WHEN` blocks
- `NVL(`, `NVL2(`, `DECODE(`
- `/` as standalone statement terminator (end of block)
- `BULK COLLECT`, `FORALL`
- `UTL_FILE`, `UTL_HTTP`, `UTL_MAIL`

**Moderate indicators** (need 2+ to confirm):
- `BEGIN ... END;` block structure
- `IS` or `AS` before block body
- `VARCHAR2` data type
- `NUMBER` data type (without parentheses for integer usage)
- `SYSDATE`, `SYSTIMESTAMP`

### T-SQL (SQL Server)

**Strong indicators** (any one confirms T-SQL):
- `CREATE PROC` or `CREATE PROCEDURE` with `@parameter` syntax
- `@variable` declarations (local variables with @ prefix)
- `sp_executesql`
- `GO` as batch separator
- `##global_temp_table` or `#local_temp_table`
- `SET NOCOUNT ON`
- `@@ROWCOUNT`, `@@ERROR`, `@@IDENTITY`
- `RAISERROR` or `THROW`
- `BEGIN TRY ... END TRY ... BEGIN CATCH ... END CATCH`
- `PRINT` for debug output

**Moderate indicators** (need 2+ to confirm):
- `BEGIN ... END` without semicolon after END
- `DECLARE @var datatype`
- `NVARCHAR`, `BIT`, `DATETIME2`
- `GETDATE()`, `GETUTCDATE()`
- `ISNULL(` (instead of COALESCE)

### PL/pgSQL (PostgreSQL)

**Strong indicators** (any one confirms PL/pgSQL):
- `CREATE OR REPLACE FUNCTION` with `RETURNS` clause
- `$$ ... $$` dollar quoting
- `LANGUAGE plpgsql` or `LANGUAGE sql`
- `RAISE NOTICE` / `RAISE EXCEPTION`
- `PERFORM` (execute without capturing result)
- `RETURN QUERY`
- `RETURNS TABLE(...)` or `RETURNS SETOF`
- `NEW` / `OLD` trigger variables
- `TG_OP`, `TG_TABLE_NAME` (trigger context)

**Moderate indicators** (need 2+ to confirm):
- `DECLARE ... BEGIN ... END` with `$$` delimiters
- `TEXT` as common string type
- `SERIAL` / `BIGSERIAL`
- `NOW()`, `CURRENT_TIMESTAMP`
- `BOOLEAN` data type (not BIT)
- `::` cast operator

## Example Classifications

### CRUD_ONLY Examples

**Simple insert procedure:**
```sql
CREATE PROCEDURE insert_customer(@name NVARCHAR(100), @email NVARCHAR(255))
AS
BEGIN
    INSERT INTO customers (name, email, created_at)
    VALUES (@name, @email, GETDATE());
END
```
- Tag: CRUD_ONLY
- Complexity: 8/100 (5 lines, no JOINs, no cursors, no dynamic SQL, same schema, 2 params)

**Basic lookup function:**
```sql
CREATE OR REPLACE FUNCTION get_order_total(p_order_id INTEGER)
RETURNS NUMERIC AS $$
BEGIN
    RETURN (SELECT SUM(quantity * unit_price) FROM order_items WHERE order_id = p_order_id);
END;
$$ LANGUAGE plpgsql;
```
- Tag: CRUD_ONLY
- Complexity: 12/100 (single-table aggregation is still CRUD-level)

### DATA_TRANSFORMATION Examples

**ETL staging procedure:**
```sql
CREATE PROCEDURE etl_daily_sales_summary
AS
BEGIN
    INSERT INTO sales_summary (region, product_category, total_revenue, order_count, avg_order_value)
    SELECT r.region_name, c.category_name, SUM(o.total_amount), COUNT(*), AVG(o.total_amount)
    FROM orders o
    JOIN customers cust ON o.customer_id = cust.id
    JOIN regions r ON cust.region_id = r.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    JOIN categories c ON p.category_id = c.id
    WHERE o.order_date = CAST(GETDATE()-1 AS DATE)
    GROUP BY r.region_name, c.category_name;
END
```
- Tag: DATA_TRANSFORMATION
- Complexity: 48/100 (moderate lines, 5 JOINs score high, no cursors, no dynamic SQL)

### COMPLEX_BUSINESS_LOGIC Examples

**Pricing calculation with business rules:**
```sql
CREATE OR REPLACE PROCEDURE calculate_invoice_total(p_invoice_id IN NUMBER) IS
    v_subtotal NUMBER;
    v_discount NUMBER;
    v_tax_rate NUMBER;
    CURSOR c_items IS SELECT * FROM invoice_items WHERE invoice_id = p_invoice_id;
BEGIN
    FOR item IN c_items LOOP
        IF item.product_type = 'SUBSCRIPTION' THEN
            v_discount := get_subscription_discount(item.customer_id, item.product_id);
        ELSIF item.quantity > 100 THEN
            v_discount := 0.15;
        ELSIF item.quantity > 50 THEN
            v_discount := 0.10;
        ELSE
            v_discount := 0;
        END IF;
        -- ... more business rules ...
        UPDATE invoice_items SET final_price = item.unit_price * item.quantity * (1 - v_discount)
        WHERE item_id = item.item_id;
    END LOOP;
    -- Tax calculation varies by jurisdiction
    SELECT tax_rate INTO v_tax_rate FROM tax_jurisdictions WHERE jurisdiction_id = (
        SELECT jurisdiction_id FROM customers WHERE customer_id = (
            SELECT customer_id FROM invoices WHERE invoice_id = p_invoice_id));
    UPDATE invoices SET total = v_subtotal * (1 + v_tax_rate) WHERE invoice_id = p_invoice_id;
END;
```
- Tag: COMPLEX_BUSINESS_LOGIC
- Complexity: 72/100 (cursor with DML, nested subqueries, conditional business rules, cross-table updates)

### ORCHESTRATION Examples

**Nightly batch workflow:**
```sql
CREATE PROCEDURE run_nightly_batch
AS
BEGIN
    BEGIN TRY
        EXEC validate_pending_orders;
        EXEC calculate_shipping_costs;
        EXEC apply_promotions;
        EXEC generate_invoices;
        EXEC update_inventory_levels;
        EXEC send_notification_queue;
        EXEC archive_completed_orders;
    END TRY
    BEGIN CATCH
        EXEC log_batch_error @proc = 'run_nightly_batch', @error = ERROR_MESSAGE();
        EXEC send_alert @severity = 'HIGH', @message = 'Nightly batch failed';
        THROW;
    END CATCH
END
```
- Tag: ORCHESTRATION
- Complexity: 55/100 (moderate lines, no JOINs, no cursors, no dynamic SQL, but calls 9 other procedures with error handling)

## Heuristic Thresholds for Tag Assignment

When a procedure could match multiple tags, apply these rules in order (first match wins):

1. **ORCHESTRATION**: Procedure calls 2+ other procedures AND contains structured error handling (TRY/CATCH, EXCEPTION WHEN, or SAVEPOINT). The primary purpose is coordination, not data manipulation.

2. **COMPLEX_BUSINESS_LOGIC**: Any of these conditions:
   - IF/CASE branching with 3+ business-rule conditions (not just NULL checks)
   - Cursor loops that contain DML statements
   - Dynamic SQL with conditional construction
   - Cross-schema references combined with conditional logic
   - Explicit transaction management (BEGIN TRAN/COMMIT/ROLLBACK outside of simple error handling)

3. **DATA_TRANSFORMATION**: Any of these conditions:
   - 3+ table JOINs in a single statement
   - GROUP BY with HAVING
   - PIVOT/UNPIVOT operations
   - INSERT...SELECT with transformations
   - Temp table staging patterns (INSERT INTO #temp ... then process ... then INSERT INTO target)
   - MERGE/UPSERT operations

4. **CRUD_ONLY**: None of the above conditions are met. The procedure performs straightforward single-table operations.

### Edge Cases

| Scenario | Classification | Reasoning |
|----------|---------------|-----------|
| Single INSERT with a subquery JOIN | CRUD_ONLY | Subquery is for value lookup, not transformation |
| Procedure with 1 cursor but no DML in loop | DATA_TRANSFORMATION | Cursor iterates for data assembly, not business logic |
| Procedure that calls 1 other procedure | Use other criteria | Single call is not orchestration; classify by primary logic |
| Procedure with TRY/CATCH but no called procedures | Use other criteria | Error handling alone is not orchestration |
| Procedure with dynamic SQL for table partitioning | COMPLEX_BUSINESS_LOGIC | Dynamic SQL is the dominant complexity driver |
| Procedure mixing ETL + business rules | COMPLEX_BUSINESS_LOGIC | Business logic tag takes precedence over transformation |
