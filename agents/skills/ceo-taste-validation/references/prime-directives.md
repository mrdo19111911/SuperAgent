# Prime Directives - Detailed Examples

## 1. Zero Silent Failures

Every failure mode must be visible — to the system, to the team, to the user.

**DO:**
```ruby
class OrderProcessor
  def process(order)
    allocate_inventory(order)
  rescue InventoryExhausted => e
    logger.error("Order #{order.id} failed allocation", error: e, available: inventory.count)
    raise # Re-raise so caller knows it failed
  end
end
```

**DON'T:**
```ruby
def process(order)
  allocate_inventory(order)
rescue => e
  # Silent failure - order appears processed but isn't
  logger.debug("Some error happened")
end
```

**Impact:** Silent failures cause data corruption, lost orders, and impossible-to-debug issues.

---

## 2. Every Error Has a Name

Don't say "handle errors." Name the specific exception class, what triggers it, what rescues it.

**DO:**
```ruby
class PaymentService
  RETRIABLE_ERRORS = [
    Stripe::RateLimitError,
    Faraday::TimeoutError,
    Stripe::APIConnectionError
  ]

  PERMANENT_ERRORS = [
    Stripe::CardError,
    Stripe::InvalidRequestError
  ]

  def charge(amount)
    stripe_client.charge(amount)
  rescue *RETRIABLE_ERRORS => e
    retry_with_backoff(e)
  rescue *PERMANENT_ERRORS => e
    log_and_notify_user(e)
    raise
  end
end
```

**DON'T:**
```ruby
def charge(amount)
  stripe_client.charge(amount)
rescue StandardError => e  # ← CODE SMELL
  logger.error("Payment failed")
  nil
end
```

**Why rescue StandardError is bad:**
- Catches SystemExit, SignalException (breaks graceful shutdown)
- Hides programming errors (NoMethodError, ArgumentError)
- Makes debugging impossible
- Can't have different strategies for different errors

---

## 3. Data Flows Have Shadow Paths

Every data flow has 4 paths: **happy, nil, empty, error**. Trace all four.

**Example: User Search**

```ruby
# Happy path
users = User.where(email: params[:email])
render json: users

# Nil path
users = User.where(email: nil)  # What happens? Empty array? Exception?

# Empty path
users = User.where(email: "")   # Same question

# Error path
users = User.where(email: params[:email])  # DB connection timeout?
```

**Complete implementation:**
```ruby
def search_users
  email = params[:email]

  # Nil path
  return render json: { error: "Email required" }, status: 400 if email.nil?

  # Empty path
  return render json: { error: "Email cannot be blank" }, status: 400 if email.empty?

  # Happy path + Error path
  users = User.where(email: email)
  render json: users
rescue ActiveRecord::ConnectionTimeoutError => e
  logger.error("DB timeout during user search", email: email, error: e)
  render json: { error: "Service temporarily unavailable" }, status: 503
end
```

**ASCII Diagram:**
```
INPUT (params[:email])
  │
  ├─▶ nil?      → 400 "Email required"
  ├─▶ empty?    → 400 "Email cannot be blank"
  ├─▶ valid     → Query DB
  │               │
  │               ├─▶ Success → 200 with results
  │               └─▶ Timeout → 503 "Temporarily unavailable"
```

---

## 4. Interactions Have Edge Cases

Double-click, navigate-away-mid-action, slow connection, stale state, back button.

**Example: Form Submission**

| Edge Case | Problem | Solution |
|-----------|---------|----------|
| **Double-click submit** | Duplicate orders | Idempotency key or disable button |
| **Submit with stale CSRF** | 422 error | Auto-refresh CSRF token |
| **Submit during deploy** | 502 error | Retry with exponential backoff |
| **Navigate away mid-save** | Unsaved data lost | Auto-save draft or "Unsaved changes" prompt |
| **Back button after submit** | Re-submit form | POST-redirect-GET pattern |
| **Slow connection** | Appears broken | Loading state + progress indicator |

**Implementation:**
```javascript
// Frontend
const handleSubmit = async (e) => {
  e.preventDefault();

  // Disable button (prevent double-click)
  setSubmitting(true);

  try {
    // Idempotency key
    const response = await fetch('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': generateIdempotencyKey()
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Submit failed');

    // POST-redirect-GET
    window.location.href = '/orders/success';
  } catch (error) {
    // Re-enable button on error
    setSubmitting(false);
    showError(error.message);
  }
};

// Show unsaved changes warning
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

---

## 5. Observability Is Scope

Dashboards, alerts, and runbooks are first-class deliverables, not post-launch cleanup.

**DO:**
```ruby
# In PR:
# 1. Code
class OrderProcessor
  def process(order)
    start_time = Time.now

    result = allocate_inventory(order)

    # Metrics
    StatsD.histogram('order.processing_time', Time.now - start_time)
    StatsD.increment('order.processed.success')

    # Structured logging
    logger.info(
      event: 'order_processed',
      order_id: order.id,
      items: order.items.count,
      duration_ms: ((Time.now - start_time) * 1000).to_i
    )

    result
  rescue InventoryExhausted => e
    StatsD.increment('order.processed.inventory_exhausted')
    logger.error(
      event: 'order_failed',
      order_id: order.id,
      reason: 'inventory_exhausted',
      error: e.message
    )
    raise
  end
end

# 2. Dashboard (Grafana/Datadog)
# - Panel 1: order.processed.success (rate)
# - Panel 2: order.processed.inventory_exhausted (rate)
# - Panel 3: order.processing_time (p50, p95, p99)

# 3. Alert
# - Name: High Order Failure Rate
# - Condition: order.processed.inventory_exhausted / order.processed.* > 5% for 5 minutes
# - Notify: #orders-alerts Slack channel

# 4. Runbook (RUNBOOKS.md)
# ## Order Processing Failures
#
# **Alert:** High Order Failure Rate
# **Symptom:** >5% of orders failing with inventory_exhausted
# **Diagnosis:**
# 1. Check inventory levels: `rails console` → `Product.where(stock: ..< 10)`
# 2. Check allocation service logs: `kubectl logs -l app=allocator --since=1h | grep ERROR`
# **Resolution:**
# - If inventory low: Contact supplier for emergency restock
# - If allocator crashed: Restart with `kubectl rollout restart deployment/allocator`
# **Prevention:** Implement low-stock alerts (TODO-789)
```

**DON'T:**
```ruby
# Just code, no observability
class OrderProcessor
  def process(order)
    allocate_inventory(order)
  rescue => e
    puts "Error: #{e.message}"  # ← No structured logging, no metrics
  end
end

# TODO: Add monitoring later (← Never happens)
```

---

## 6. Diagrams Are Mandatory

ASCII art for every non-trivial flow.

**Example: Payment Processing**

```
┌─────────────────────────────────────────────────────────────────┐
│                     Payment Flow (State Machine)                 │
└─────────────────────────────────────────────────────────────────┘

  [pending]
      │
      │ charge_card()
      ├─▶ Success → [authorized]
      │                  │
      │                  │ capture()
      │                  ├─▶ Success → [captured] → [settled] (webhook)
      │                  └─▶ Fail → [capture_failed] → [refunded] (manual)
      │
      └─▶ Fail (card declined)
               └─▶ [declined] → notify_user() → [pending] (retry)

      └─▶ Fail (rate limit)
               └─▶ [rate_limited] → retry_with_backoff() → [pending]

Invalid transitions:
  [declined] → [captured]  ❌ Prevented by state_machine gem
  [refunded] → [authorized] ❌ Prevented by state_machine gem
```

**Data Flow:**
```
User clicks "Pay"
    │
    ▼
Frontend (React)
    │ POST /api/orders/{id}/payment
    │ Body: { payment_method_id: "pm_123" }
    │
    ▼
Backend (Rails API)
    │
    ├─▶ Validate: Order exists? User owns order? Amount > 0?
    │   └─▶ Fail → 400 "Invalid request"
    │
    ├─▶ Call Stripe API
    │   │
    │   ├─▶ Success (200)
    │   │   └─▶ Update order.status = "paid"
    │   │   └─▶ Enqueue OrderFulfillmentJob
    │   │   └─▶ Return 200 { status: "success" }
    │   │
    │   ├─▶ CardError (402)
    │   │   └─▶ Return 402 { error: "Card declined" }
    │   │
    │   ├─▶ RateLimitError (429)
    │   │   └─▶ Retry 3x with backoff
    │   │   └─▶ If still fails → 503 "Try again later"
    │   │
    │   └─▶ Timeout
    │       └─▶ Log error
    │       └─▶ Return 503 "Service unavailable"
    │
    ▼
Response to Frontend
```

---

## 7. Everything Deferred → Written Down

Vague intentions are lies. TODOS.md or it doesn't exist.

**DO:**
```markdown
# TODOS.md

## Performance Optimization (P2)
**What:** Add Redis caching for product catalog API
**Why:** p99 latency is 800ms, target is <200ms
**Context:**
- Current implementation hits DB on every request
- Product data changes <1x/day
- Cache key: `product_catalog:v1:#{Date.today}`
- TTL: 24 hours
- Invalidation: Manual purge via admin panel
**Effort:** M (2-3 days)
**Depends on:** Redis cluster setup (OPS-456)
**Owner:** @backend-team
**Added:** 2026-03-15
```

**DON'T:**
```ruby
# In code comment
# TODO: optimize this later
def get_products
  Product.all
end
```

---

## 8. Optimize for 6-Month Future

Not just today.

**Example: API Design**

**DO (Extensible):**
```ruby
# Today: Only need product_id
# 6 months: Will need variants, bundles, subscriptions

POST /api/orders
{
  "items": [
    {
      "type": "product",      # ← Extensible
      "product_id": "123",
      "quantity": 2
    }
  ]
}

# 6 months later (backwards compatible):
{
  "items": [
    { "type": "product", "product_id": "123", "quantity": 2 },
    { "type": "variant", "variant_id": "456", "quantity": 1 },      # ← New
    { "type": "bundle", "bundle_id": "789", "quantity": 1 }         # ← New
  ]
}
```

**DON'T (Inflexible):**
```ruby
POST /api/orders
{
  "product_ids": ["123", "456"]  # ← Can't add variants/bundles later without breaking change
}
```

---

## 9. Permission to Say "Scrap It"

If there's a fundamentally better approach, say it now.

**Example:**

**Current Plan:** Add "favorite products" feature with new `favorites` table

**Better Approach:**
```markdown
## Recommendation: Scrap current plan, use generic "collections" instead

**Current plan problems:**
- Favorites = special case of "user collections"
- Will need "wishlist" next (another special case)
- Then "compare list", "recently viewed", etc.
- Each needs new table + API + UI

**Better approach:**
Build generic "collections" system:
- `collections` table (id, user_id, name, type)
- `collection_items` table (collection_id, item_id, item_type, position)
- Types: 'favorites', 'wishlist', 'compare', 'recent', ...

**Benefits:**
- Favorites is just `type: 'favorites'`
- Wishlist, compare, etc. free
- User can create custom collections later
- 1 set of APIs instead of 5

**Effort:**
- Current plan: 2 days
- Collections system: 4 days
- ROI: 4 days now saves 8 days later (4 features × 2 days each)

**Recommendation:** Scrap favorites-only plan. Build collections. 🚀
```

---

**These 9 directives are non-negotiable.** Every plan review MUST enforce them.
