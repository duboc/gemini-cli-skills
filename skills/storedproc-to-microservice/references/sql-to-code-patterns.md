# SQL-to-Application-Code Translation Patterns

Reference guide for translating stored procedure logic into application-tier code. Covers PL/SQL (Oracle), T-SQL (SQL Server), and PL/pgSQL (PostgreSQL) patterns with their Python and Java equivalents.

## Cursor-to-Stream Patterns

### PL/SQL Cursor Loop

**SQL:**
```sql
DECLARE
  CURSOR c_orders IS SELECT * FROM orders WHERE status = 'PENDING';
  r_order c_orders%ROWTYPE;
BEGIN
  OPEN c_orders;
  LOOP
    FETCH c_orders INTO r_order;
    EXIT WHEN c_orders%NOTFOUND;
    -- process each order
    UPDATE orders SET status = 'PROCESSED' WHERE order_id = r_order.order_id;
  END LOOP;
  CLOSE c_orders;
END;
```

**Python (SQLAlchemy + streaming):**
```python
def process_pending_orders(session: Session) -> int:
    orders = session.execute(
        select(Order).where(Order.status == "PENDING")
    ).scalars()

    count = 0
    for order in orders:
        order.status = "PROCESSED"
        count += 1

    session.commit()
    return count
```

**Java (Spring Data JPA + Stream):**
```java
@Transactional
public int processPendingOrders() {
    return orderRepository.findByStatus("PENDING")
        .stream()
        .peek(order -> order.setStatus("PROCESSED"))
        .mapToInt(order -> 1)
        .sum();
}
```

### T-SQL Cursor with Fetch

**SQL:**
```sql
DECLARE @OrderId INT, @Total DECIMAL(10,2)
DECLARE order_cursor CURSOR FOR
    SELECT order_id, total FROM orders WHERE status = 'NEW'
OPEN order_cursor
FETCH NEXT FROM order_cursor INTO @OrderId, @Total
WHILE @@FETCH_STATUS = 0
BEGIN
    EXEC sp_apply_discount @OrderId, @Total
    FETCH NEXT FROM order_cursor INTO @OrderId, @Total
END
CLOSE order_cursor
DEALLOCATE order_cursor
```

**Python:**
```python
def apply_discounts_to_new_orders(session: Session, discount_service: DiscountService):
    orders = session.execute(
        select(Order.order_id, Order.total).where(Order.status == "NEW")
    ).all()

    for order_id, total in orders:
        discount_service.apply_discount(order_id, total)

    session.commit()
```

### PL/pgSQL FOR Loop

**SQL:**
```sql
CREATE OR REPLACE FUNCTION process_returns()
RETURNS INTEGER AS $$
DECLARE
    r RECORD;
    processed INTEGER := 0;
BEGIN
    FOR r IN SELECT * FROM returns WHERE processed = false LOOP
        UPDATE inventory SET quantity = quantity + r.quantity
            WHERE product_id = r.product_id;
        UPDATE returns SET processed = true WHERE return_id = r.return_id;
        processed := processed + 1;
    END LOOP;
    RETURN processed;
END;
$$ LANGUAGE plpgsql;
```

**Python:**
```python
def process_returns(session: Session) -> int:
    unprocessed = session.execute(
        select(Return).where(Return.processed == False)
    ).scalars().all()

    for ret in unprocessed:
        inventory = session.get(Inventory, ret.product_id)
        inventory.quantity += ret.quantity
        ret.processed = True

    session.commit()
    return len(unprocessed)
```

## Temp Table Patterns

### T-SQL Temp Table Staging

**SQL:**
```sql
CREATE TABLE #StagedOrders (
    order_id INT,
    customer_id INT,
    adjusted_total DECIMAL(10,2)
)

INSERT INTO #StagedOrders
SELECT o.order_id, o.customer_id, o.total * (1 - ISNULL(d.rate, 0))
FROM orders o
LEFT JOIN discounts d ON o.discount_code = d.code
WHERE o.status = 'PENDING'

-- Use staged data for further processing
UPDATE o SET o.total = s.adjusted_total
FROM orders o
INNER JOIN #StagedOrders s ON o.order_id = s.order_id

DROP TABLE #StagedOrders
```

**Python (in-memory collection):**
```python
@dataclass
class StagedOrder:
    order_id: int
    customer_id: int
    adjusted_total: Decimal

def adjust_pending_orders(session: Session) -> list[StagedOrder]:
    results = session.execute(
        select(Order.order_id, Order.customer_id, Order.total, Discount.rate)
        .outerjoin(Discount, Order.discount_code == Discount.code)
        .where(Order.status == "PENDING")
    ).all()

    staged = [
        StagedOrder(
            order_id=r.order_id,
            customer_id=r.customer_id,
            adjusted_total=r.total * (1 - (r.rate or Decimal("0")))
        )
        for r in results
    ]

    for item in staged:
        session.execute(
            update(Order)
            .where(Order.order_id == item.order_id)
            .values(total=item.adjusted_total)
        )

    session.commit()
    return staged
```

### PL/SQL Global Temporary Table

**SQL:**
```sql
INSERT INTO gtt_report_data (region, total_sales)
SELECT region, SUM(amount) FROM sales
GROUP BY region;

-- Multiple queries reference gtt_report_data within session
```

**Java (in-memory map):**
```java
public Map<String, BigDecimal> aggregateSalesByRegion(List<Sale> sales) {
    return sales.stream()
        .collect(Collectors.groupingBy(
            Sale::getRegion,
            Collectors.reducing(BigDecimal.ZERO, Sale::getAmount, BigDecimal::add)
        ));
}
```

## Dynamic SQL Patterns

### T-SQL Dynamic WHERE Clause

**SQL:**
```sql
CREATE PROCEDURE sp_search_orders
    @CustomerId INT = NULL,
    @Status VARCHAR(20) = NULL,
    @MinTotal DECIMAL(10,2) = NULL
AS
BEGIN
    DECLARE @sql NVARCHAR(MAX) = N'SELECT * FROM orders WHERE 1=1'

    IF @CustomerId IS NOT NULL
        SET @sql = @sql + N' AND customer_id = @p_cust'
    IF @Status IS NOT NULL
        SET @sql = @sql + N' AND status = @p_status'
    IF @MinTotal IS NOT NULL
        SET @sql = @sql + N' AND total >= @p_min'

    EXEC sp_executesql @sql,
        N'@p_cust INT, @p_status VARCHAR(20), @p_min DECIMAL(10,2)',
        @p_cust = @CustomerId,
        @p_status = @Status,
        @p_min = @MinTotal
END
```

**Python (SQLAlchemy query builder):**
```python
def search_orders(
    session: Session,
    customer_id: int | None = None,
    status: str | None = None,
    min_total: Decimal | None = None,
) -> list[Order]:
    query = select(Order)

    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if status is not None:
        query = query.where(Order.status == status)
    if min_total is not None:
        query = query.where(Order.total >= min_total)

    return session.execute(query).scalars().all()
```

**Java (Spring Data JPA Specification):**
```java
public List<Order> searchOrders(Integer customerId, String status, BigDecimal minTotal) {
    Specification<Order> spec = Specification.where(null);

    if (customerId != null) {
        spec = spec.and((root, query, cb) -> cb.equal(root.get("customerId"), customerId));
    }
    if (status != null) {
        spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
    }
    if (minTotal != null) {
        spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("total"), minTotal));
    }

    return orderRepository.findAll(spec);
}
```

### PL/SQL EXECUTE IMMEDIATE

**SQL:**
```sql
EXECUTE IMMEDIATE 'SELECT COUNT(*) FROM ' || v_table_name INTO v_count;
```

**Application equivalent:** Avoid direct table name interpolation. Use a predefined allowlist:

```python
ALLOWED_TABLES = {"orders", "customers", "products"}

def count_records(session: Session, table_name: str) -> int:
    if table_name not in ALLOWED_TABLES:
        raise ValueError(f"Table '{table_name}' is not in the allowed list")

    result = session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
    return result.scalar()
```

## Transaction Management Translation

### T-SQL Explicit Transaction

**SQL:**
```sql
BEGIN TRANSACTION
BEGIN TRY
    UPDATE accounts SET balance = balance - @Amount WHERE account_id = @FromId
    UPDATE accounts SET balance = balance + @Amount WHERE account_id = @ToId

    INSERT INTO transactions (from_id, to_id, amount, created_at)
    VALUES (@FromId, @ToId, @Amount, GETDATE())

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION
    THROW
END CATCH
```

**Python (SQLAlchemy):**
```python
def transfer_funds(session: Session, from_id: int, to_id: int, amount: Decimal) -> Transaction:
    try:
        from_account = session.get(Account, from_id, with_for_update=True)
        to_account = session.get(Account, to_id, with_for_update=True)

        if from_account.balance < amount:
            raise InsufficientFundsError(from_id, amount, from_account.balance)

        from_account.balance -= amount
        to_account.balance += amount

        txn = Transaction(from_id=from_id, to_id=to_id, amount=amount)
        session.add(txn)
        session.commit()
        return txn
    except Exception:
        session.rollback()
        raise
```

**Java (Spring @Transactional):**
```java
@Transactional
public TransactionRecord transferFunds(Long fromId, Long toId, BigDecimal amount) {
    Account from = accountRepository.findByIdWithLock(fromId)
        .orElseThrow(() -> new AccountNotFoundException(fromId));
    Account to = accountRepository.findByIdWithLock(toId)
        .orElseThrow(() -> new AccountNotFoundException(toId));

    if (from.getBalance().compareTo(amount) < 0) {
        throw new InsufficientFundsException(fromId, amount, from.getBalance());
    }

    from.setBalance(from.getBalance().subtract(amount));
    to.setBalance(to.getBalance().add(amount));

    return transactionRepository.save(
        new TransactionRecord(fromId, toId, amount, Instant.now())
    );
}
```

### PL/SQL Savepoint Pattern

**SQL:**
```sql
BEGIN
    SAVEPOINT before_header;
    INSERT INTO order_headers (...) VALUES (...);

    SAVEPOINT before_lines;
    FOR i IN 1..p_line_count LOOP
        INSERT INTO order_lines (...) VALUES (...);
    END LOOP;

EXCEPTION
    WHEN line_error THEN
        ROLLBACK TO before_lines;
        -- Header persists, lines rolled back
    WHEN OTHERS THEN
        ROLLBACK TO before_header;
        RAISE;
END;
```

**Python (nested transactions / savepoints):**
```python
def create_order_with_lines(session: Session, header: OrderHeader, lines: list[OrderLine]):
    session.begin_nested()  # SAVEPOINT before_header
    try:
        session.add(header)
        session.flush()

        session.begin_nested()  # SAVEPOINT before_lines
        try:
            for line in lines:
                line.order_id = header.id
                session.add(line)
            session.commit()  # Release before_lines savepoint
        except IntegrityError:
            session.rollback()  # Rollback to before_lines
            logger.warning("Line insert failed; header preserved")

        session.commit()  # Release before_header savepoint
    except Exception:
        session.rollback()  # Rollback to before_header
        raise
```

## Error Handling Translation

### T-SQL TRY/CATCH to Python Exceptions

**SQL:**
```sql
BEGIN TRY
    -- business logic
END TRY
BEGIN CATCH
    IF ERROR_NUMBER() = 2627  -- unique constraint violation
        THROW 50001, 'Duplicate entry', 1
    IF ERROR_NUMBER() = 547   -- FK violation
        THROW 50002, 'Referenced entity not found', 1
    THROW  -- re-raise original
END CATCH
```

**Python exception hierarchy:**
```python
class ServiceError(Exception):
    """Base exception for service layer errors."""
    pass

class DuplicateEntryError(ServiceError):
    """Raised when a unique constraint would be violated."""
    pass

class ReferencedEntityNotFoundError(ServiceError):
    """Raised when a foreign key reference is invalid."""
    pass

def create_entity(session: Session, entity: Entity):
    try:
        session.add(entity)
        session.flush()
    except IntegrityError as e:
        session.rollback()
        if "unique" in str(e.orig).lower():
            raise DuplicateEntryError(f"Duplicate: {entity.name}") from e
        if "foreign key" in str(e.orig).lower():
            raise ReferencedEntityNotFoundError(str(e.orig)) from e
        raise
```

### PL/SQL RAISE to Java Exceptions

**SQL:**
```sql
IF v_balance < p_amount THEN
    RAISE_APPLICATION_ERROR(-20001, 'Insufficient funds');
END IF;
```

**Java:**
```java
if (account.getBalance().compareTo(amount) < 0) {
    throw new InsufficientFundsException(
        "Insufficient funds: available=" + account.getBalance() + ", requested=" + amount
    );
}
```

### PL/pgSQL RAISE to Application Exceptions

**SQL:**
```sql
RAISE EXCEPTION 'Order % not found', p_order_id USING ERRCODE = 'P0002';
```

**Python:**
```python
raise OrderNotFoundError(f"Order {order_id} not found")
```

## Performance Considerations

### Patterns That May Degrade Performance After Migration

| SQL Pattern | Risk When Moved to App Tier | Mitigation |
|-------------|---------------------------|------------|
| Cursor loop over large result set | N+1 queries if each iteration makes a DB call | Batch fetching, bulk updates, or keep as single SQL statement |
| INSERT...SELECT (bulk) | Loading all data into app memory | Use streaming/pagination or keep as a single SQL statement executed via ORM |
| Complex multi-table JOIN | Multiple round trips if decomposed into separate queries | Keep as a single query via ORM or raw SQL; do not decompose |
| Temp table with indexes | In-memory collections lack index support for large datasets | Use indexed database views or materialized results for large datasets |
| MERGE/UPSERT | Multiple round trips for check-then-insert pattern | Use ORM upsert support (SQLAlchemy `on_conflict_do_update`, JPA `MERGE`) |

### Patterns That Improve Performance After Migration

| SQL Pattern | Benefit When Moved to App Tier | Notes |
|-------------|-------------------------------|-------|
| Cursor-based row processing | Stream processing with parallel execution | App tier can scale horizontally |
| Complex business rules in SQL | Cacheable business rules in app memory | Reduce repeated database computation |
| Dynamic SQL with string concatenation | Parameterized query builders | Better query plan caching |
| Procedure-to-procedure calls | In-process method calls | Eliminates context switching overhead in the database engine |

### General Recommendations

1. **Profile before and after** — Measure stored procedure execution time as the baseline. Compare with microservice latency including network overhead.
2. **Batch database operations** — Replace cursor loops with batch INSERT/UPDATE using ORM bulk operations.
3. **Connection pooling** — Configure connection pools appropriately (HikariCP for Java, SQLAlchemy pool for Python) since the app tier now manages connections.
4. **Caching** — Business rules and reference data that were recomputed on every procedure call can be cached in the application layer.
5. **Keep set-based operations in SQL** — Not all logic should move. Large-scale data transformations (millions of rows) often perform better as SQL statements executed from the application rather than row-by-row processing in application code.
