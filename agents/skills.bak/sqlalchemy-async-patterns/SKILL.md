# SQLAlchemy Async Patterns & Multi-Tenancy

Production-ready SQLAlchemy 2.0 async patterns with multi-tenant isolation, eager loading, and N+1 prevention.

---

## Philosophy

You are a database architect who **prevents N+1 queries** and **enforces tenant isolation**. Think like a **security engineer** who knows that one missing `WHERE tenant_id =` clause causes a data breach. Your queries must be fast (no lazy loading) and secure (tenant isolation) or the entire system fails.

---

## Prime Directives

1. **ALL queries MUST include tenant_id filter** → Multi-tenancy isolation (SECURITY P0)
2. **NEVER use lazy loading in async context** → Use `selectinload()` or `joinedload()`
3. **Soft delete ONLY** → `deleted_at = datetime.utcnow()`, never DELETE
4. **UTC timestamps ALWAYS** → `datetime.utcnow()`, never `datetime.now()`
5. **AsyncSession context manager** → `async with async_session_maker() as session`

---

## Two-Pass Workflow

### PASS 1: CRITICAL Security & Performance

**Check these FIRST** before any other review:

| Pattern | Violation | Impact | Fix |
|---------|-----------|--------|-----|
| **Missing tenant_id** | `select(Order)` without `WHERE tenant_id` | Data leak P0 | Add `.where(Order.tenant_id == tenant_id)` |
| **Lazy loading** | Accessing `order.items` without eager load | `MissingGreenlet` error | `selectinload(Order.items)` |
| **Hard delete** | `session.delete(order)` | GDPR violation | `order.deleted_at = datetime.utcnow()` |
| **Sync session** | `Session()` in async route | Blocks event loop | `AsyncSession()` |
| **datetime.now()** | Local timezone | Inconsistent timestamps | `datetime.utcnow()` |

**STOP** if any violations found. Fix before proceeding.

---

### PASS 2: INFORMATIONAL Best Practices

| Category | Pattern | Example |
|----------|---------|---------|
| **Eager Loading** | Prevent N+1 queries | `selectinload(Order.items.selectinload(OrderItem.product))` |
| **Joins** | Optimize single query | `joinedload(Order.customer)` for 1:1 |
| **Pagination** | Limit + offset | `.limit(20).offset(page * 20)` |
| **Indexes** | Speed up queries | `Index('idx_order_tenant', 'tenant_id', 'created_at')` |
| **Bulk Operations** | Batch inserts | `session.add_all([...])` |

---

## Pattern Catalog

### 1. Base Model with Multi-Tenancy

```python
from sqlalchemy import Column, String, DateTime, Index
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime

class BaseModel:
    """Base model for all tables - enforces multi-tenancy and soft delete."""

    id = Column(String(50), primary_key=True)

    # Multi-tenancy (MANDATORY)
    tenant_id = Column(String(50), nullable=False, index=True)

    # Soft delete (MANDATORY)
    deleted_at = Column(DateTime, nullable=True, default=None)

    # Timestamps (UTC ONLY)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @declared_attr
    def __table_args__(cls):
        """Composite index for tenant isolation + soft delete queries."""
        return (
            Index(f'idx_{cls.__tablename__}_tenant_deleted', 'tenant_id', 'deleted_at'),
        )

# Usage
class Order(BaseModel, Base):
    __tablename__ = 'orders'

    status = Column(String(20), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)

    # Relationships with lazy='noload' (explicit eager loading required)
    items = relationship('OrderItem', back_populates='order', lazy='noload')
```

**Why `lazy='noload'`?** Forces explicit eager loading → prevents accidental N+1 queries.

---

### 2. Async Session Setup

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Engine (singleton - create once at app startup)
engine = create_async_engine(
    DATABASE_URL,  # postgresql+asyncpg://user:pass@host/db
    echo=False,  # Set True for SQL logging in dev
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True  # Verify connections before use
)

# Session maker
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False  # Keep objects usable after commit
)

# Dependency injection (FastAPI)
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
```

---

### 3. Query with Tenant Isolation + Eager Loading

```python
from sqlalchemy import select
from sqlalchemy.orm import selectinload, joinedload

async def get_order_with_items(
    db: AsyncSession,
    order_id: str,
    tenant_id: str
) -> Optional[Order]:
    """Get order with eager-loaded items - tenant-isolated."""

    stmt = (
        select(Order)
        .where(
            Order.id == order_id,
            Order.tenant_id == tenant_id,  # MANDATORY: tenant isolation
            Order.deleted_at.is_(None)     # MANDATORY: soft delete filter
        )
        .options(
            selectinload(Order.items)  # Eager load items (separate query)
        )
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()

# Multi-level eager loading
async def get_order_full(db: AsyncSession, order_id: str, tenant_id: str) -> Optional[Order]:
    """Get order with items + products in 3 queries (not N+1)."""

    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant_id, Order.deleted_at.is_(None))
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),  # 2-level eager load
            joinedload(Order.customer)  # 1:1 relationship - use join
        )
    )

    result = await db.execute(stmt)
    return result.scalar_one_or_none()
```

**Query Count:**
- ❌ Lazy loading: 1 (order) + N (items) + M (products) = **1 + N + M queries** (N+1 problem)
- ✅ Eager loading: 1 (order) + 1 (items) + 1 (products) + 1 (customer join) = **3 queries**

---

### 4. List Query with Pagination

```python
from sqlalchemy import select, func, desc

async def list_orders(
    db: AsyncSession,
    tenant_id: str,
    page: int = 1,
    limit: int = 20
) -> tuple[list[Order], int]:
    """List orders with pagination - tenant-isolated."""

    # Count total (for pagination meta)
    count_stmt = (
        select(func.count(Order.id))
        .where(Order.tenant_id == tenant_id, Order.deleted_at.is_(None))
    )
    total_result = await db.execute(count_stmt)
    total = total_result.scalar()

    # Get page
    stmt = (
        select(Order)
        .where(Order.tenant_id == tenant_id, Order.deleted_at.is_(None))
        .options(selectinload(Order.items))
        .order_by(desc(Order.created_at))
        .limit(limit)
        .offset((page - 1) * limit)
    )

    result = await db.execute(stmt)
    orders = result.scalars().all()

    return orders, total
```

---

### 5. Insert with Multi-Tenancy

```python
import uuid
from datetime import datetime

async def create_order(
    db: AsyncSession,
    tenant_id: str,
    order_data: CreateOrderDTO
) -> Order:
    """Create order with tenant_id enforcement."""

    order = Order(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,  # MANDATORY: set on create
        status='pending',
        total=order_data.total,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Add related items
    for item_data in order_data.items:
        item = OrderItem(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,  # MANDATORY: cascade tenant_id
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            price=item_data.price
        )
        order.items.append(item)

    db.add(order)
    await db.flush()  # Get ID without committing
    await db.refresh(order)  # Load defaults

    return order
```

---

### 6. Update with Optimistic Locking

```python
from sqlalchemy.exc import StaleDataError

async def update_order_status(
    db: AsyncSession,
    order_id: str,
    tenant_id: str,
    new_status: str
) -> Order:
    """Update order with tenant isolation and concurrency control."""

    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant_id, Order.deleted_at.is_(None))
        .with_for_update()  # Row-level lock (prevent concurrent updates)
    )

    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise ValueError(f"Order {order_id} not found")

    # Update fields
    order.status = new_status
    order.updated_at = datetime.utcnow()

    await db.flush()
    return order
```

---

### 7. Soft Delete (NEVER Hard Delete)

```python
async def soft_delete_order(
    db: AsyncSession,
    order_id: str,
    tenant_id: str
) -> None:
    """Soft delete order - sets deleted_at timestamp."""

    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant_id, Order.deleted_at.is_(None))
    )

    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise ValueError(f"Order {order_id} not found")

    # Soft delete
    order.deleted_at = datetime.utcnow()

    # Cascade soft delete to items (if needed)
    for item in order.items:
        item.deleted_at = datetime.utcnow()

    await db.flush()

# ❌ NEVER DO THIS:
# db.delete(order)  # Hard delete - GDPR violation, breaks audit trail
```

---

### 8. Bulk Insert (Performance)

```python
async def bulk_create_orders(
    db: AsyncSession,
    tenant_id: str,
    orders_data: list[CreateOrderDTO]
) -> list[Order]:
    """Bulk insert orders - optimized for large batches."""

    orders = []
    for order_data in orders_data:
        order = Order(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            status='pending',
            total=order_data.total,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        orders.append(order)

    # Bulk add (single INSERT with multiple rows)
    db.add_all(orders)
    await db.flush()

    return orders
```

---

### 9. Complex Query with Joins

```python
from sqlalchemy import and_, or_

async def search_orders(
    db: AsyncSession,
    tenant_id: str,
    status: Optional[str] = None,
    min_total: Optional[Decimal] = None
) -> list[Order]:
    """Search orders with filters - tenant-isolated."""

    filters = [
        Order.tenant_id == tenant_id,
        Order.deleted_at.is_(None)
    ]

    # Optional filters
    if status:
        filters.append(Order.status == status)
    if min_total:
        filters.append(Order.total >= min_total)

    stmt = (
        select(Order)
        .where(and_(*filters))
        .options(selectinload(Order.items))
        .order_by(desc(Order.created_at))
    )

    result = await db.execute(stmt)
    return result.scalars().all()
```

---

### 10. Raw SQL (When Needed)

```python
from sqlalchemy import text

async def execute_raw_query(db: AsyncSession, tenant_id: str) -> list[dict]:
    """Execute raw SQL with parameter binding."""

    # ✅ GOOD: Parameterized query (SQL injection safe)
    stmt = text("""
        SELECT o.id, o.status, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.tenant_id = :tenant_id
          AND o.deleted_at IS NULL
        GROUP BY o.id, o.status
        ORDER BY o.created_at DESC
    """)

    result = await db.execute(stmt, {"tenant_id": tenant_id})
    return [dict(row._mapping) for row in result]

# ❌ NEVER: String formatting (SQL injection risk!)
# stmt = f"SELECT * FROM orders WHERE tenant_id = '{tenant_id}'"
```

---

## Anti-Patterns (DO NOT DO)

| Anti-Pattern | Why Bad | Correct Pattern |
|--------------|---------|-----------------|
| `order.items` without eager load | N+1 query + `MissingGreenlet` | `selectinload(Order.items)` |
| Missing `tenant_id` filter | Data leak P0 | `WHERE tenant_id = :tenant_id` |
| `session.delete(order)` | GDPR violation | `order.deleted_at = utcnow()` |
| `datetime.now()` | Timezone inconsistency | `datetime.utcnow()` |
| `Session()` in async route | Blocks event loop | `AsyncSession()` |
| No pagination | Memory overflow | `.limit().offset()` |
| String SQL without params | SQL injection | `text(...).bindparams()` |

---

## Performance Optimization

### N+1 Query Detection

```python
# ❌ BAD: N+1 queries
orders = await db.execute(select(Order).where(Order.tenant_id == tenant_id))
for order in orders.scalars():
    items = order.items  # Triggers 1 query per order!

# ✅ GOOD: 2 queries total
stmt = select(Order).where(Order.tenant_id == tenant_id).options(selectinload(Order.items))
orders = (await db.execute(stmt)).scalars().all()
for order in orders:
    items = order.items  # No query - already loaded
```

### Index Strategy

```python
# Composite indexes for common queries
class Order(BaseModel, Base):
    __tablename__ = 'orders'

    __table_args__ = (
        # Tenant isolation + soft delete
        Index('idx_orders_tenant_deleted', 'tenant_id', 'deleted_at'),

        # Tenant + status queries
        Index('idx_orders_tenant_status', 'tenant_id', 'status', 'deleted_at'),

        # Tenant + created_at (pagination)
        Index('idx_orders_tenant_created', 'tenant_id', 'created_at', 'deleted_at'),
    )
```

---

## Testing Checklist

```
[ ] All queries include tenant_id filter
[ ] All relationships use eager loading (selectinload/joinedload)
[ ] All deletes are soft (deleted_at timestamp)
[ ] All timestamps use datetime.utcnow()
[ ] AsyncSession used in all async routes
[ ] Composite indexes on tenant_id + common filters
[ ] Pagination for list queries
[ ] No lazy loading in async context
[ ] Bulk operations for large inserts
[ ] Raw SQL uses parameterized queries
```

---

## Common Mistakes → Fixes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Lazy loading in async | `MissingGreenlet` error | Add `lazy='noload'` + `selectinload()` |
| Missing tenant_id | Wrong tenant sees data | Add `WHERE tenant_id = :tenant_id` |
| Hard delete | Audit trail lost | Use `deleted_at = utcnow()` |
| No pagination | OOM on large tables | Add `.limit().offset()` |
| N+1 queries | Slow response (1s → 100ms) | Use `selectinload()` |

---

## References

- SQLAlchemy 2.0 async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Eager loading guide: https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html
- Multi-tenancy patterns: https://docs.sqlalchemy.org/en/20/orm/examples.html#versioned-objects
