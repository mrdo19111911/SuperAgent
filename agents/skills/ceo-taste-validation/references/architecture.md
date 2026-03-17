# Architecture Review (Section 1)

## Evaluate & Diagram

### 1. Component Boundaries
- What are the new components?
- How do they interact with existing ones?
- Are boundaries clear?

**Draw dependency graph:**
```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐     ┌──────────────┐
│ API Gateway │────▶│ Auth Service │
└──────┬──────┘     └──────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│   Service   │────▶│   Database   │
└─────────────┘     └──────────────┘
```

### 2. Data Flow (4 Paths)

For **every** new data flow, trace all 4 paths:

**ASCII Diagram Template:**
```
INPUT ──▶ VALIDATION ──▶ TRANSFORM ──▶ PERSIST ──▶ OUTPUT
  │            │              │            │           │
  ▼            ▼              ▼            ▼           ▼
[nil?]    [invalid?]    [exception?]  [conflict?]  [stale?]
[empty?]  [too long?]   [timeout?]    [dup key?]   [partial?]
[wrong    [wrong type?] [OOM?]        [locked?]    [encoding?]
 type?]
```

**Example: Order Creation**
```
POST /orders { product_id: 123, quantity: 2 }
  │
  ├─▶ Nil path: product_id = nil → 400 "Product required"
  ├─▶ Empty path: quantity = 0 → 400 "Quantity must be > 0"
  ├─▶ Happy path: Valid input
  │     │
  │     ├─▶ Transform: Build order object
  │     │     │
  │     │     ├─▶ Exception: Validation fails → 422 "Invalid order"
  │     │     └─▶ Success: Continue
  │     │
  │     ├─▶ Persist: Save to DB
  │     │     │
  │     │     ├─▶ Conflict: Duplicate order_number → Retry with new number
  │     │     ├─▶ Locked: Row locked → Retry 3x with backoff
  │     │     └─▶ Success: Continue
  │     │
  │     └─▶ Output: Return order JSON
  │           │
  │           ├─▶ Stale: Order updated between read/response → Log warning, return stale
  │           └─▶ Success: 201 Created
  │
  └─▶ Error path: DB timeout → 503 "Service unavailable"
```

### 3. State Machines

For every stateful object, draw state machine:

**Example: Payment State Machine**
```
[pending]
    │
    │ charge()
    ├─▶ Success → [authorized]
    │                  │
    │                  │ capture()
    │                  ├─▶ Success → [captured]
    │                  └─▶ Fail → [capture_failed]
    │
    └─▶ Fail → [declined]
              │
              │ retry()
              └─▶ [pending]

Invalid transitions:
  [declined] → [captured]  ❌ Prevented by state_machine gem
  [captured] → [pending]   ❌ Prevented by state_machine gem
```

### 4. Coupling Concerns

**Which components are now coupled that weren't before?**

**Template:**
```
BEFORE:
  OrderService → Database

AFTER:
  OrderService → InventoryService → Database
                 └─▶ EmailService → SMTP

New couplings:
  ✅ OrderService → InventoryService (justified: need to allocate stock)
  ⚠️ OrderService → EmailService (concern: order processing blocked by email)
```

**Is coupling justified?**
- Can it be decoupled with async job?
- What happens if downstream service is down?

### 5. Scaling Characteristics

**What breaks first under 10x load? Under 100x?**

**Template:**
```
Current load: 100 orders/min

10x load (1,000 orders/min):
  ✅ Web tier: Auto-scales, OK
  ⚠️ DB: CPU at 80%, add read replicas
  ❌ SMTP: Rate limit (100 emails/min), switch to background job

100x load (10,000 orders/min):
  ❌ DB writes: Single primary can't handle, need sharding
  ❌ Inventory locking: Table-level locks cause contention, need row-level
  ✅ Background jobs: Sidekiq handles, add more workers
```

### 6. Single Points of Failure

**Map them:**
- Primary database
- Redis (sessions, cache)
- Payment gateway API
- SMTP server

**Mitigation:**
- Database: Failover to standby
- Redis: Redis Sentinel
- Payment gateway: Retry logic + manual reconciliation
- SMTP: Background job + DLQ

### 7. Security Architecture

**For each new endpoint or data mutation:**
- Who can call it?
- What do they get?
- What can they change?

**Example:**
```
POST /api/orders
  Auth: Requires valid JWT token
  Authz: User can only create orders for themselves (scoped by user_id)
  Input validation: product_id (required), quantity (1-100)
  Rate limit: 10 orders/min per user
```

### 8. Production Failure Scenarios

**For each new integration point, describe one realistic failure:**

| Integration | Failure Scenario | Handled? | How? |
|-------------|------------------|----------|------|
| Stripe API | Timeout after 30s | ⚠️ Partial | Retry 1x, then fail |
| Inventory DB | Connection pool exhausted | ❌ No | Should: Queue request + async process |
| Email SMTP | 550 Invalid recipient | ✅ Yes | Log error, mark email as bounced |

### 9. Rollback Posture

**If this ships and immediately breaks, what's the rollback procedure?**

| Scenario | Rollback Method | Time | Data Loss? |
|----------|-----------------|------|------------|
| Code bug | `git revert` + redeploy | 5 min | No |
| Schema change | Migration rollback | 10 min | ⚠️ Yes (new columns lost) |
| Feature flag | Toggle OFF | 1 min | No |
| Config change | Revert env var + restart | 5 min | No |

---

## EXPANSION Mode Additions

### What Makes This Architecture Beautiful?

Not just correct — **elegant**.

**Questions:**
- Is there a design that would make a new engineer say "oh, that's clever and obvious at the same time"?
- Can this be explained in one sentence?
- Is there unnecessary complexity?

**Example:**
```
Current design: OrderService calls InventoryService, PaymentService, EmailService sequentially

Beautiful design: OrderService publishes OrderCreated event
→ InventoryService, PaymentService, EmailService subscribe independently
→ Order creation completes instantly, rest happens async
→ Each service can fail/retry independently without blocking others
```

### Platform Potential

**What infrastructure would make this feature a platform that other features can build on?**

**Example:**
```
Current: "Add favorites"
Platform: "Build collections system"
→ Favorites = collection with type: 'favorites'
→ Future features unlocked: wishlist, compare, recently viewed, custom collections
→ All share same API, UI components, permissions
```

---

## Required ASCII Diagram

**Full system architecture showing new components and relationships to existing ones.**

---

## AskUserQuestion Format

```markdown
## Issue [NUMBER]: [Title]

**Problem:** [Describe concretely with file/line references]

**Impact:** [What breaks? When?]

**Options:**

A) [Recommended option] - [effort, risk, maintenance]
   **Why:** [Map to engineering preference or business goal]

B) [Alternative 1] - [effort, risk, maintenance]

C) [Alternative 2] - [effort, risk, maintenance]

**Recommendation:** Do [LETTER]. [1-2 sentence reasoning].
```

---

**STOP.** AskUserQuestion once per issue. Do NOT batch. Only proceed after all issues resolved.

---

**Token Count:** ~1,300 tokens
