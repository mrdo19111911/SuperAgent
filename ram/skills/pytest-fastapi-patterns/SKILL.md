# Pytest FastAPI Testing Patterns

TDD patterns for FastAPI with pytest, pytest-asyncio, async fixtures, and coverage targets (≥80%).

---

## Philosophy

You are a QA engineer who **writes tests BEFORE implementation** and **prevents hollow tests**. Think like a **security auditor** who knows that one missing tenant_id assertion causes a data leak in production. Your tests must catch bugs (not just pass) or they are worthless.

---

## Prime Directives

1. **RED → GREEN → REFACTOR** → Test MUST fail initially, then pass, then refactor
2. **ALL async routes need pytest-asyncio tests** → `@pytest.mark.asyncio`
3. **Coverage ≥80%** → Unit + integration combined
4. **Test tenant isolation** → Verify `tenant_id` filter in DB queries
5. **No hollow tests** → Assert behavior, not just "doesn't crash"

---

## Two-Pass Workflow

### PASS 1: CRITICAL Test Quality

**Check these FIRST** before any other review:

| Pattern | Violation | Impact | Fix |
|---------|-----------|--------|-----|
| **Hollow test** | No assertions or only `assert True` | False coverage | Add behavior assertions |
| **Test passes in RED** | Test passes before implementation | Invalid TDD | Delete implementation, re-run test |
| **Missing tenant_id test** | No assertion on tenant isolation | Data leak in prod | Add test for cross-tenant access denial |
| **Sync test for async route** | Missing `@pytest.mark.asyncio` | Test doesn't run | Add `@pytest.mark.asyncio` decorator |
| **No edge cases** | Only happy path tested | Bugs leak to prod | Add error cases, boundaries |

**STOP** if any violations found. Fix before proceeding.

---

### PASS 2: INFORMATIONAL Best Practices

| Category | Pattern | Example |
|----------|---------|---------|
| **Fixtures** | Reusable test setup | `@pytest.fixture async def db_session()` |
| **Parametrize** | Test multiple inputs | `@pytest.mark.parametrize("input,expected", [...])` |
| **Mocking** | Isolate dependencies | `mocker.patch('module.function')` |
| **Test DB** | Separate test database | `TEST_DATABASE_URL` with rollback |
| **Coverage Reports** | Track coverage | `pytest --cov=app --cov-report=html` |

---

## Pattern Catalog

### 1. RED → GREEN → REFACTOR Cycle

**RED Phase: Write Failing Test**

```python
# tests/test_order_service.py (RED Phase)
import pytest
from app.services.order_service import OrderService
from app.schemas import CreateOrderDTO

@pytest.mark.asyncio
async def test_create_order_with_tenant_isolation(db_session):
    """Test order creation enforces tenant_id."""
    order_service = OrderService(db_session)

    dto = CreateOrderDTO(
        tenant_id='tenant-123',
        items=[{'product_id': 'p1', 'quantity': 2, 'price': 10.0}],
        total=20.0
    )

    result = await order_service.create(dto)

    # Assertions
    assert result.id is not None
    assert result.tenant_id == 'tenant-123'
    assert result.status == 'pending'
    assert len(result.items) == 1

# Run test - MUST see failure:
# $ pytest tests/test_order_service.py::test_create_order_with_tenant_isolation
# ❌ FAIL: AttributeError: 'OrderService' object has no attribute 'create'
```

**HARD STOP:** If test PASSES in RED phase → something is wrong (stale code, wrong import).

**GREEN Phase: Minimal Implementation**

```python
# app/services/order_service.py (GREEN Phase)
from datetime import datetime
import uuid

class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, dto: CreateOrderDTO) -> Order:
        """Create order with tenant isolation."""
        order = Order(
            id=str(uuid.uuid4()),
            tenant_id=dto.tenant_id,
            status='pending',
            total=dto.total,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        for item_data in dto.items:
            item = OrderItem(
                id=str(uuid.uuid4()),
                tenant_id=dto.tenant_id,  # Cascade tenant_id
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            order.items.append(item)

        self.db.add(order)
        await self.db.flush()
        await self.db.refresh(order)

        return order

# Run test - MUST PASS:
# $ pytest tests/test_order_service.py::test_create_order_with_tenant_isolation
# ✅ PASS
```

**REFACTOR Phase: Clean up while tests stay green**

```python
# app/services/order_service.py (REFACTOR Phase)
class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, dto: CreateOrderDTO) -> Order:
        """Create order with tenant isolation and validation."""
        self._validate_order(dto)  # Extract validation

        order = self._build_order(dto)  # Extract builder
        self.db.add(order)

        await self.db.flush()
        await self.db.refresh(order)

        return order

    def _validate_order(self, dto: CreateOrderDTO) -> None:
        """Validate order business rules."""
        if not dto.items:
            raise ValueError("Order must have at least one item")
        if dto.total <= 0:
            raise ValueError("Order total must be positive")

    def _build_order(self, dto: CreateOrderDTO) -> Order:
        """Build order entity with items."""
        order = Order(
            id=str(uuid.uuid4()),
            tenant_id=dto.tenant_id,
            status='pending',
            total=dto.total,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        for item_data in dto.items:
            item = OrderItem(
                id=str(uuid.uuid4()),
                tenant_id=dto.tenant_id,
                order_id=order.id,
                product_id=item_data['product_id'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            order.items.append(item)

        return order

# Run test - MUST still PASS after refactor:
# $ pytest tests/test_order_service.py
# ✅ PASS
```

---

### 2. Async Fixtures

```python
# conftest.py (shared fixtures)
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database import Base

@pytest_asyncio.fixture(scope="session")
async def test_engine():
    """Create test database engine (once per session)."""
    engine = create_async_engine(
        "postgresql+asyncpg://user:pass@localhost/test_db",
        echo=False
    )

    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    # Drop tables after session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()

@pytest_asyncio.fixture
async def db_session(test_engine):
    """Create fresh DB session for each test (with rollback)."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False
    )

    async with async_session() as session:
        async with session.begin():
            yield session
            await session.rollback()  # Rollback after test (clean state)
```

---

### 3. Testing FastAPI Routes

```python
# tests/test_routes.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_create_order_route():
    """Test POST /orders endpoint with tenant isolation."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/orders",
            json={
                "tenant_id": "tenant-123",
                "items": [{"product_id": "p1", "quantity": 2, "price": 10.0}],
                "total": 20.0
            },
            headers={"X-Tenant-ID": "tenant-123"}
        )

    assert response.status_code == 201
    data = response.json()

    assert data["success"] is True
    assert data["data"]["tenant_id"] == "tenant-123"
    assert data["data"]["status"] == "pending"
    assert len(data["data"]["items"]) == 1
```

---

### 4. Testing Tenant Isolation (CRITICAL)

```python
@pytest.mark.asyncio
async def test_tenant_isolation_get_order(db_session):
    """Test that tenant A cannot access tenant B's orders."""
    order_service = OrderService(db_session)

    # Create order for tenant A
    dto_a = CreateOrderDTO(
        tenant_id='tenant-a',
        items=[{'product_id': 'p1', 'quantity': 1, 'price': 10.0}],
        total=10.0
    )
    order_a = await order_service.create(dto_a)

    # Try to get order as tenant B (should fail)
    result = await order_service.get(order_a.id, tenant_id='tenant-b')

    assert result is None  # Tenant B cannot see tenant A's order

@pytest.mark.asyncio
async def test_tenant_isolation_list_orders(db_session):
    """Test that list_orders only returns orders for requesting tenant."""
    order_service = OrderService(db_session)

    # Create orders for different tenants
    dto_a = CreateOrderDTO(tenant_id='tenant-a', items=[...], total=10.0)
    dto_b = CreateOrderDTO(tenant_id='tenant-b', items=[...], total=20.0)

    await order_service.create(dto_a)
    await order_service.create(dto_b)

    # List orders for tenant A
    orders_a, total_a = await order_service.list(tenant_id='tenant-a', page=1, limit=10)

    assert total_a == 1  # Only 1 order for tenant A
    assert all(o.tenant_id == 'tenant-a' for o in orders_a)
```

---

### 5. Parametrized Tests

```python
@pytest.mark.parametrize("input_data,expected_error", [
    ({"tenant_id": "", "items": [], "total": 10.0}, "Order must have at least one item"),
    ({"tenant_id": "t1", "items": [{"product_id": "p1", "quantity": 1, "price": 10}], "total": 0}, "Order total must be positive"),
    ({"tenant_id": "t1", "items": [{"product_id": "", "quantity": 1, "price": 10}], "total": 10.0}, "Product ID cannot be empty"),
])
@pytest.mark.asyncio
async def test_create_order_validation_errors(db_session, input_data, expected_error):
    """Test validation errors for create_order."""
    order_service = OrderService(db_session)

    dto = CreateOrderDTO(**input_data)

    with pytest.raises(ValueError, match=expected_error):
        await order_service.create(dto)
```

---

### 6. Mocking External Dependencies

```python
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_send_order_notification(db_session, mocker):
    """Test order creation sends notification (mocked)."""
    # Mock email service
    mock_email = mocker.patch('app.services.email_service.send_email', new_callable=AsyncMock)

    order_service = OrderService(db_session, email_service=mock_email)

    dto = CreateOrderDTO(tenant_id='t1', items=[...], total=10.0)
    result = await order_service.create(dto)

    # Verify email was sent
    mock_email.assert_called_once_with(
        to=dto.customer_email,
        subject=f"Order {result.id} created",
        body=mocker.ANY
    )
```

---

### 7. Testing Async Background Tasks

```python
@pytest.mark.asyncio
async def test_background_task_execution(db_session):
    """Test background task is triggered after order creation."""
    from fastapi import BackgroundTasks

    background_tasks = BackgroundTasks()
    task_executed = False

    async def mock_task(order_id: str):
        nonlocal task_executed
        task_executed = True

    order_service = OrderService(db_session)
    dto = CreateOrderDTO(tenant_id='t1', items=[...], total=10.0)

    result = await order_service.create(dto, background_tasks=background_tasks)

    background_tasks.add_task(mock_task, result.id)
    await background_tasks()  # Execute tasks

    assert task_executed is True
```

---

### 8. Coverage Targets

```bash
# Run tests with coverage
pytest --cov=app --cov-report=term --cov-report=html

# Expected output:
# -------------------------|---------|----------|---------|---------|
# Name                     | Stmts   | Miss     | Cover   |
# -------------------------|---------|----------|---------|---------|
# app/services/order.py    | 45      | 5        | 89%     |
# app/routes/orders.py     | 30      | 3        | 90%     |
# -------------------------|---------|----------|---------|---------|
# TOTAL                    | 150     | 20       | 87%     |
# -------------------------|---------|----------|---------|---------|

# ✅ PASS: ≥80% coverage
```

**Coverage Targets:**
- **Unit tests:** ≥80% statement coverage
- **Integration tests:** ≥70% coverage
- **Combined:** ≥80% coverage

---

### 9. Testing Error Responses

```python
@pytest.mark.asyncio
async def test_get_order_not_found():
    """Test GET /orders/{id} returns 404 for non-existent order."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(
            "/orders/nonexistent-id",
            headers={"X-Tenant-ID": "tenant-123"}
        )

    assert response.status_code == 404
    data = response.json()

    assert data["success"] is False
    assert data["detail"]["code"] == "ORDER_NOT_FOUND"
    assert "nonexistent-id" in data["detail"]["message"]
```

---

### 10. Integration Test with DB

```python
@pytest.mark.asyncio
async def test_order_persistence_integration(db_session):
    """Integration test: order persists to database."""
    order_service = OrderService(db_session)

    dto = CreateOrderDTO(tenant_id='t1', items=[...], total=10.0)
    result = await order_service.create(dto)

    # Commit to DB
    await db_session.commit()

    # Query from DB (fresh session)
    stmt = select(Order).where(Order.id == result.id)
    db_result = await db_session.execute(stmt)
    persisted_order = db_result.scalar_one_or_none()

    assert persisted_order is not None
    assert persisted_order.tenant_id == 't1'
    assert persisted_order.status == 'pending'
```

---

## Anti-Patterns (DO NOT DO)

| Anti-Pattern | Why Bad | Correct Pattern |
|--------------|---------|-----------------|
| `assert True` | Hollow test | Assert actual behavior |
| Test passes in RED | Invalid TDD | Delete implementation, re-run test |
| No tenant_id assertion | Data leak in prod | Test cross-tenant access denial |
| Missing `@pytest.mark.asyncio` | Test skipped | Add decorator to async tests |
| Only happy path | Edge cases leak to prod | Test errors, boundaries, edge cases |
| Hardcoded test data | Brittle tests | Use factories or fixtures |
| No coverage check | Unknown gaps | Run `pytest --cov` |

---

## Testing Checklist

```
RED Phase:
[ ] Write test FIRST (before implementation)
[ ] Run test → MUST see failure
[ ] Test verifies ONE behavior clearly

GREEN Phase:
[ ] Write minimal code to pass
[ ] Run test → MUST see success
[ ] No extra features (YAGNI)

REFACTOR Phase:
[ ] Extract functions, improve names
[ ] Run tests → MUST stay green
[ ] Coverage ≥80%

Integration Tests:
[ ] Test tenant isolation (cross-tenant denial)
[ ] Test DB persistence (commit + re-query)
[ ] Test error responses (404, 422, 403)
[ ] Test background tasks execution
[ ] Mock external dependencies

Coverage:
[ ] pytest --cov shows ≥80% coverage
[ ] All critical paths tested
[ ] Edge cases covered
[ ] No hollow tests (empty asserts)
```

---

## Common Mistakes → Fixes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Test passes in RED | No test failure initially | Delete implementation, re-run test |
| Hollow test | 100% coverage but bugs leak | Add behavior assertions |
| Missing async decorator | Test skipped silently | Add `@pytest.mark.asyncio` |
| No tenant_id test | Data leak in prod | Test cross-tenant access denial |
| No rollback after test | Test pollution | Use fixture with `session.rollback()` |
| Hardcoded DB connection | Tests fail on CI | Use `TEST_DATABASE_URL` env var |

---

## References

- pytest-asyncio: https://pytest-asyncio.readthedocs.io/
- FastAPI testing: https://fastapi.tiangolo.com/tutorial/testing/
- pytest fixtures: https://docs.pytest.org/en/stable/fixture.html
- pytest parametrize: https://docs.pytest.org/en/stable/how-to/parametrize.html
- Coverage.py: https://coverage.readthedocs.io/
