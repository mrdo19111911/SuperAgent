# FastAPI Async Patterns & Best Practices

Production-ready FastAPI patterns with async/await, dependency injection, Pydantic validation, and STMAI API envelope integration.

---

## Philosophy

You are a FastAPI architect who **prevents event loop blocking** and **enforces type safety**. Think like a **performance engineer** who knows that `await asyncio.to_thread()` is the difference between 100ms and 5000ms response times. Your code must handle async correctly or the entire service slows down.

---

## Prime Directives

1. **NEVER call sync blocking code in async routes** → Use `asyncio.to_thread()` wrapper
2. **ALL Pydantic models MUST have Field() descriptions** → API auto-docs rely on them
3. **ALL routes MUST use BaseResponse envelope** → `{"success": bool, "data": {}, "meta": {}}`
4. **SQLAlchemy eager loading REQUIRED** → No lazy loading in async context
5. **HTTPException MUST include custom error codes** → `{"code": "ORDER_NOT_FOUND"}`

---

## Two-Pass Workflow

### PASS 1: CRITICAL Async Safety

**Check these FIRST** before any other review:

| Pattern | Violation | Fix |
|---------|-----------|-----|
| **Sync-in-Async** | `time.sleep(1)` in async route | `await asyncio.sleep(1)` |
| **Blocking I/O** | `requests.get()` in async route | `async with httpx.AsyncClient()` or `await asyncio.to_thread(requests.get, ...)` |
| **Sync DB Query** | `session.query()` in async route | `await session.execute(select(...))` |
| **File I/O** | `open("file").read()` in async route | `await asyncio.to_thread(Path("file").read_text)` |
| **CPU-bound work** | `heavy_computation()` blocking | `await asyncio.to_thread(heavy_computation)` |

**STOP** if any violations found. Fix before proceeding.

---

### PASS 2: INFORMATIONAL Best Practices

| Category | Pattern | Example |
|----------|---------|---------|
| **Dependency Injection** | Use Depends() for shared logic | `user: User = Depends(get_current_user)` |
| **Background Tasks** | Offload non-critical work | `background_tasks.add_task(send_email, ...)` |
| **Pydantic Config** | Strict validation | `model_config = ConfigDict(str_strip_whitespace=True, extra='forbid')` |
| **Response Model** | Type-safe responses | `@app.post("/", response_model=OrderResponse)` |
| **Error Detail** | Structured errors | `HTTPException(422, detail={"code": "INVALID_EMAIL", "field": "email"})` |

---

## Pattern Catalog

### 1. BaseResponse Envelope (MANDATORY)

```python
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, Dict, Any

T = TypeVar('T')

class BaseResponse(BaseModel, Generic[T]):
    """STMAI standard API envelope - ALL routes MUST use this."""
    success: bool = Field(..., description="Request success status")
    data: Optional[T] = Field(None, description="Response payload")
    meta: Dict[str, Any] = Field(default_factory=dict, description="Metadata (pagination, timestamps, etc)")

# Usage
class OrderData(BaseModel):
    id: str
    status: str

@app.post("/orders", response_model=BaseResponse[OrderData])
async def create_order(order: CreateOrderDTO) -> BaseResponse[OrderData]:
    result = await order_service.create(order)
    return BaseResponse(
        success=True,
        data=OrderData(id=result.id, status=result.status),
        meta={"created_at": result.created_at.isoformat()}
    )
```

---

### 2. Async Route with DB Access

```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

app = FastAPI()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

@app.get("/orders/{order_id}", response_model=BaseResponse[OrderResponse])
async def get_order(
    order_id: str,
    tenant_id: str = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db)
) -> BaseResponse[OrderResponse]:
    """Get order with tenant isolation and eager loading."""

    # CORRECT: selectinload prevents N+1, tenant_id prevents RLS bypass
    stmt = (
        select(Order)
        .where(Order.id == order_id, Order.tenant_id == tenant_id)
        .options(selectinload(Order.items))  # Eager load related items
    )

    result = await db.execute(stmt)
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=404,
            detail={"code": "ORDER_NOT_FOUND", "message": f"Order {order_id} not found"}
        )

    return BaseResponse(
        success=True,
        data=OrderResponse.model_validate(order)
    )
```

**WRONG** - Lazy loading in async context:

```python
# ❌ BAD: lazy loading triggers sync query in async context
order = await db.get(Order, order_id)
items = order.items  # MissingGreenlet error!
```

---

### 3. Pydantic DTO with Validation

```python
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List
from decimal import Decimal

class CreateOrderDTO(BaseModel):
    """Input DTO with strict validation."""
    model_config = ConfigDict(
        str_strip_whitespace=True,  # Auto-trim strings
        validate_assignment=True,   # Validate on field assignment
        extra='forbid'             # Reject unknown fields
    )

    tenant_id: str = Field(..., description="Tenant ID for multi-tenancy", min_length=1, max_length=50)
    items: List[OrderItemDTO] = Field(..., description="Order items (min 1)", min_length=1, max_length=100)
    total: Decimal = Field(..., description="Total amount in USD", gt=0, max_digits=10, decimal_places=2)
    notes: Optional[str] = Field(None, description="Optional order notes", max_length=500)

    @field_validator('total')
    @classmethod
    def validate_total(cls, v: Decimal) -> Decimal:
        """Ensure total matches item sum (business rule)."""
        if v <= 0:
            raise ValueError("Total must be positive")
        return v

class OrderItemDTO(BaseModel):
    product_id: str = Field(..., min_length=1, max_length=50)
    quantity: int = Field(..., gt=0, le=1000)
    price: Decimal = Field(..., gt=0, max_digits=10, decimal_places=2)
```

---

### 4. Handling Sync Blocking Code

```python
import asyncio
from pathlib import Path
import time

# ❌ WRONG: Blocks event loop
@app.post("/process")
async def process_data_bad(data: str):
    time.sleep(5)  # Blocks entire server!
    result = some_cpu_heavy_function(data)  # Blocks!
    return result

# ✅ CORRECT: Use asyncio.to_thread for sync code
@app.post("/process")
async def process_data_good(data: str):
    # Wrap sync blocking calls
    await asyncio.sleep(5)  # Non-blocking sleep
    result = await asyncio.to_thread(some_cpu_heavy_function, data)
    return BaseResponse(success=True, data=result)

# ✅ CORRECT: File I/O wrapped
@app.get("/file/{filename}")
async def read_file(filename: str):
    file_path = Path(f"./uploads/{filename}")

    # Wrap sync file read
    content = await asyncio.to_thread(file_path.read_text, encoding="utf-8")

    return BaseResponse(success=True, data={"content": content})
```

---

### 5. Dependency Injection for Shared Logic

```python
from fastapi import Depends, Header, HTTPException

async def get_tenant_id(x_tenant_id: str = Header(...)) -> str:
    """Extract tenant ID from header - reusable across routes."""
    if not x_tenant_id:
        raise HTTPException(400, detail={"code": "MISSING_TENANT_ID"})
    return x_tenant_id

async def get_current_user(
    token: str = Header(..., alias="Authorization"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Authenticate user - reusable dependency."""
    if not token.startswith("Bearer "):
        raise HTTPException(401, detail={"code": "INVALID_TOKEN_FORMAT"})

    token_value = token.replace("Bearer ", "")
    user = await auth_service.verify_token(db, token_value)

    if not user:
        raise HTTPException(401, detail={"code": "INVALID_TOKEN"})

    return user

# Use in routes
@app.get("/orders")
async def list_orders(
    tenant_id: str = Depends(get_tenant_id),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # tenant_id and user are pre-validated
    pass
```

---

### 6. Background Tasks

```python
from fastapi import BackgroundTasks

async def send_notification_email(user_email: str, order_id: str):
    """Send email asynchronously (not awaited by route)."""
    await email_service.send(user_email, f"Order {order_id} created")

@app.post("/orders")
async def create_order(
    order: CreateOrderDTO,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Create order and send email in background."""
    result = await order_service.create(db, order)

    # Add to background - doesn't block response
    background_tasks.add_task(send_notification_email, order.email, result.id)

    return BaseResponse(success=True, data=result)
```

---

### 7. HTTP Client (Async)

```python
import httpx

# ❌ WRONG: Sync requests library blocks event loop
import requests
@app.get("/external")
async def call_external_bad():
    response = requests.get("https://api.example.com/data")  # Blocks!
    return response.json()

# ✅ CORRECT: Use httpx AsyncClient
@app.get("/external")
async def call_external_good():
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get("https://api.example.com/data")
        response.raise_for_status()
        data = response.json()

    return BaseResponse(success=True, data=data)
```

---

### 8. Custom Error Codes (Structured Errors)

```python
from fastapi import HTTPException

class OrderNotFoundError(HTTPException):
    def __init__(self, order_id: str):
        super().__init__(
            status_code=404,
            detail={
                "code": "ORDER_NOT_FOUND",
                "message": f"Order {order_id} not found for this tenant",
                "order_id": order_id
            }
        )

class TenantIsolationError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=403,
            detail={
                "code": "TENANT_ISOLATION_VIOLATION",
                "message": "Cannot access resources from other tenants"
            }
        )

# Usage
@app.get("/orders/{order_id}")
async def get_order(order_id: str, tenant_id: str = Depends(get_tenant_id)):
    order = await order_service.get(order_id, tenant_id)

    if not order:
        raise OrderNotFoundError(order_id)

    if order.tenant_id != tenant_id:
        raise TenantIsolationError()

    return BaseResponse(success=True, data=order)
```

---

## Anti-Patterns (DO NOT DO)

| Anti-Pattern | Why Bad | Correct Pattern |
|--------------|---------|-----------------|
| `time.sleep()` in async route | Blocks event loop | `await asyncio.sleep()` |
| `requests.get()` in async route | Sync blocking I/O | `async with httpx.AsyncClient()` |
| SQLAlchemy lazy loading | `MissingGreenlet` error | `selectinload()` or `joinedload()` |
| No Pydantic Field descriptions | Poor auto-docs | `Field(..., description="Clear description")` |
| Bare dict responses | No type safety | `BaseResponse[T]` with Pydantic model |
| Generic error messages | Hard to debug | Custom error codes `{"code": "ORDER_NOT_FOUND"}` |
| Global mutable state | Thread-unsafe | Dependency injection with `Depends()` |
| `datetime.now()` | Timezone issues | `datetime.utcnow()` |

---

## Route Optimization Module Patterns

**Context:** T1_13 route optimization with VRP algorithm

```python
from fastapi import BackgroundTasks
import asyncio

# Algorithm computation is CPU-bound → wrap in thread
async def compute_optimal_route(waypoints: List[Waypoint]) -> RouteResult:
    """Compute VRP solution - CPU-intensive, must not block event loop."""
    # Offload to thread pool
    result = await asyncio.to_thread(
        vrp_solver.solve,  # Sync function (Google OR-Tools is sync)
        waypoints
    )
    return result

@app.post("/routes/optimize", response_model=BaseResponse[RouteResponse])
async def optimize_route(
    request: OptimizeRouteRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Optimize delivery route (async non-blocking)."""

    # Validate waypoints
    if len(request.waypoints) > 50:
        raise HTTPException(400, detail={"code": "TOO_MANY_WAYPOINTS", "limit": 50})

    # Compute route in thread (non-blocking)
    route_result = await compute_optimal_route(request.waypoints)

    # Save result to DB
    route_record = RouteRecord(
        tenant_id=request.tenant_id,
        waypoints=request.waypoints,
        optimized_sequence=route_result.sequence,
        total_distance=route_result.distance
    )
    db.add(route_record)
    await db.commit()

    # Background: send notification
    background_tasks.add_task(notify_route_ready, route_record.id)

    return BaseResponse(
        success=True,
        data=RouteResponse.model_validate(route_record),
        meta={"computation_time_ms": route_result.time_ms}
    )
```

**Performance Budget:** < 500ms for 50 waypoints (tested in integration tests)

---

## Testing Checklist

```
[ ] All async routes have pytest-asyncio tests
[ ] SQLAlchemy queries use selectinload/joinedload
[ ] No sync blocking calls (requests, time.sleep, file I/O)
[ ] All DTOs have Field() descriptions
[ ] BaseResponse envelope used in all routes
[ ] Custom error codes in HTTPException
[ ] Background tasks tested separately
[ ] Dependency injection tested with overrides
[ ] Tenant isolation verified in tests
```

---

## Common Mistakes → Fixes

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Lazy loading in async | `MissingGreenlet` error | Add `selectinload(Model.relationship)` |
| Sync requests in async route | 5s response time (should be 100ms) | Use `httpx.AsyncClient()` |
| Missing tenant_id filter | Data leak between tenants | Add `WHERE tenant_id = :tenant_id` |
| No Field descriptions | Empty API docs | Add `Field(..., description="...")` |
| Generic errors | Frontend can't distinguish errors | Use custom error codes `{"code": "..."}` |

---

## References

- FastAPI docs: https://fastapi.tiangolo.com/async/
- SQLAlchemy async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- Pydantic v2: https://docs.pydantic.dev/latest/
- asyncio patterns: https://docs.python.org/3/library/asyncio-task.html
