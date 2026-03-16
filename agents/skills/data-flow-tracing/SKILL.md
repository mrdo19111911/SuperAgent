# Data Flow Tracing

Trace data flow end-to-end (DB → API → State → UI) to verify ALL consumers are updated.

---

## Pattern 1: Full Stack Trace (Backend → Frontend)

**Step 1: Identify Data Source Change**

```typescript
// PR changes: Add DB persistence for process traces
// OLD: traceBuffer (RAM-only)
const traceBuffer = [];

// NEW: Prisma model (DB-persisted)
model ProcessTrace {
  id          String   @id
  tenant_id   String
  process_id  String
  timestamp   DateTime
  data        Json
}
```

**Step 2: Trace Backend API**

```typescript
// API layer - Does it return DB data?
// src/api/traces/getTraces.ts
export async function getTraces(processId: string) {
  // ✅ GOOD - Reads from DB
  const traces = await prisma.processTrace.findMany({
    where: { process_id: processId },
    orderBy: { timestamp: 'asc' }
  });

  return { success: true, data: { traces } };
}
```

**Step 3: Trace Frontend Query**

```typescript
// Frontend data fetching - Does it call the API?
// src/features/traces/api/getTraces.ts
export const useGetTraces = (processId: string) => {
  return useQuery({
    queryKey: ['traces', processId],
    queryFn: async () => {
      const response = await apiClient.get(`/traces/${processId}`);
      return response.data.traces;  // ✅ GOOD - Parses API envelope
    }
  });
};
```

**Step 4: Trace ALL UI Consumers**

```bash
# Search for all components that use traces
grep -rn "traceBuffer\|useTraceState\|ProcessTracePanel" src/

# Found 3 components:
# - HumanTimelinePanel.tsx:42
# - ProcessTracePanel.tsx:18
# - DebugPanel.tsx:67
```

**Step 5: Verify EACH Consumer**

```typescript
// Component 1: HumanTimelinePanel.tsx
function HumanTimelinePanel({ processId }: { processId: string }) {
  // ❌ BAD - Still reads from RAM-only state
  const traces = useTraceState(state => state.traceBuffer);

  // ✅ GOOD - Reads from API (DB-backed)
  const { data: traces } = useGetTraces(processId);

  return <Timeline events={traces} />;
}
```

```typescript
// Component 2: ProcessTracePanel.tsx
function ProcessTracePanel({ processId }: { processId: string }) {
  // ❌ BAD - Local state only, no DB restore
  const [traces, setTraces] = useState([]);

  useEffect(() => {
    // Missing: Fetch from API on mount
  }, [processId]);

  // ✅ GOOD - Fetch from API
  const { data: traces } = useGetTraces(processId);

  return <TraceList traces={traces} />;
}
```

```typescript
// Component 3: DebugPanel.tsx (developer-only)
function DebugPanel() {
  // OK - Debug panel can use RAM buffer (not user-facing)
  const ramBuffer = useTraceState(state => state.traceBuffer);

  return <pre>{JSON.stringify(ramBuffer, null, 2)}</pre>;
}
```

**Result: PEN-001 Violation Found**
- Components 1 & 2 still read RAM → No DB restore → User sees empty data after refresh
- Reviewer MUST request changes: "Update HumanTimelinePanel and ProcessTracePanel to use useGetTraces()"

---

## Pattern 2: Backend-Only Data Flow Trace

**Scenario: Add caching layer**

```typescript
// PR: Add Redis cache for orders
// src/services/OrderService.ts

// OLD: Direct DB query
async getOrder(id: string) {
  return prisma.order.findUnique({ where: { id } });
}

// NEW: Cache-first
async getOrder(id: string) {
  const cached = await redis.get(`order:${id}`);
  if (cached) return JSON.parse(cached);

  const order = await prisma.order.findUnique({ where: { id } });
  await redis.set(`order:${id}`, JSON.stringify(order), 'EX', 3600);
  return order;
}
```

**Trace ALL Consumers of getOrder()**

```bash
# Find all callers
grep -rn "getOrder\|orderService.getOrder" src/

# Found:
# - OrderController.ts:25
# - InvoiceService.ts:48
# - NotificationWorker.ts:103
```

**Verify Cache Invalidation**

```typescript
// OrderController.ts
async updateOrder(id: string, data: UpdateOrderDTO) {
  const updated = await orderService.update(id, data);

  // ❌ MISSING: Cache invalidation
  // User will see stale data for 1 hour!

  // ✅ GOOD: Invalidate cache
  await redis.del(`order:${id}`);

  return updated;
}
```

```typescript
// InvoiceService.ts
async generateInvoice(orderId: string) {
  const order = await orderService.getOrder(orderId);

  // ✅ GOOD - Read-only consumer, no invalidation needed

  return this.createInvoice(order);
}
```

**Trace Result**
- Found missing cache invalidation in OrderController.updateOrder()
- Reviewer requests: "Add redis.del() after order update"

---

## Pattern 3: Event-Driven Data Flow

**Scenario: Kafka event triggers state change**

```typescript
// PR: Publish OrderConfirmed event to Kafka
// src/services/OrderService.ts

async confirmOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'confirmed' }
  });

  // Publish event
  await kafka.publish('stmai.orders', {
    type: 'OrderConfirmed',
    orderId: order.id,
    timestamp: new Date()
  });

  return order;
}
```

**Trace Event Consumers**

```bash
# Search for Kafka consumers
grep -rn "stmai.orders\|OrderConfirmed" src/

# Found:
# - NotificationWorker.ts:35 (sends email)
# - InventoryWorker.ts:58 (reserves stock)
# - AnalyticsWorker.ts:91 (tracks conversion)
```

**Verify Idempotency in EACH Consumer**

```typescript
// NotificationWorker.ts
async handleOrderConfirmed(event: OrderConfirmedEvent) {
  // ❌ MISSING: Idempotency check
  // Duplicate events will send duplicate emails!

  await emailService.send({
    to: event.customerEmail,
    subject: 'Order Confirmed',
    body: `Your order ${event.orderId} is confirmed.`
  });

  // ✅ GOOD: Check processed_events table
  const exists = await prisma.processedEvent.findUnique({
    where: { event_id: event.id }
  });

  if (exists) {
    logger.info('Duplicate event, skipping', { eventId: event.id });
    return;
  }

  await emailService.send(...);

  await prisma.processedEvent.create({
    data: { event_id: event.id, processed_at: new Date() }
  });
}
```

**Trace Result**
- NotificationWorker missing idempotency check
- Reviewer blocks PR: "Add idempotency check to prevent duplicate emails"

---

## Trace Checklist Template

```markdown
## Data Flow Trace

**Data Source Changed:** [DB table / API endpoint / State store]

**Change Type:** [Add persistence / Add caching / Change structure]

**Backend Trace:**
- [ ] API layer returns new data structure
- [ ] Response matches API envelope `{ success, data, meta }`
- [ ] Cache invalidation added (if caching)

**Frontend Trace:**
- [ ] Query hook (`useGetX`) updated to call API
- [ ] All UI components using data identified:
  - Component 1: [name.tsx:line] - Status: ✅ Updated | ❌ Still RAM-only
  - Component 2: [name.tsx:line] - Status: ✅ Updated | ❌ Still RAM-only
  - Component 3: [name.tsx:line] - Status: ✅ Updated | ❌ Still RAM-only

**Event Consumers (if event-driven):**
- [ ] All Kafka consumers identified
- [ ] Idempotency check in EACH consumer
- [ ] No duplicate processing on retry

**Verdict:**
- [ ] PASS - All consumers updated
- [ ] FAIL - Missing consumers: [list components/workers]
```

---

## Review Script Example

```bash
#!/bin/bash
# scripts/trace-data-flow.sh

# Usage: bash scripts/trace-data-flow.sh "ProcessTrace"

DATA_TYPE=$1

echo "=== Tracing data flow for: $DATA_TYPE ==="

echo "\n1. Backend API usage:"
grep -rn "$DATA_TYPE" src/api/ --include="*.ts"

echo "\n2. Frontend query hooks:"
grep -rn "use.*$DATA_TYPE\|$DATA_TYPE.*Query" src/features/ --include="*.ts"

echo "\n3. UI components consuming data:"
grep -rn "$DATA_TYPE" src/components/ src/features/ --include="*.tsx"

echo "\n4. Kafka event consumers:"
grep -rn "$DATA_TYPE" src/workers/ --include="*.ts"

echo "\n=== Review EACH result above ==="
```

**Run trace script during code review:**
```bash
bash scripts/trace-data-flow.sh "Order"
bash scripts/trace-data-flow.sh "ProcessTrace"
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Review code statically only | Miss consumer components | Trace data flow end-to-end (DB → API → UI) |
| Assume "tests pass" = complete | Tests may not cover ALL consumers | Manually verify EACH consumer component |
| Skip event consumer trace | Duplicate processing on retry | Check idempotency in EVERY Kafka consumer |
| No cache invalidation check | Stale data after update | Verify `redis.del()` after mutations |

---

## PEN-001 Prevention Checklist

```
When reviewing persistence/data-flow changes:

Backend:
[ ] API endpoint returns DB data (not RAM-only)
[ ] Response uses envelope `{ success, data, meta }`
[ ] Cache invalidated after mutations

Frontend:
[ ] Query hook (`useGetX`) fetches from API
[ ] ALL UI components identified (grep search)
[ ] EACH component verified:
    - Uses API query (not local state only)
    - Has restore path on mount

Event-Driven:
[ ] All Kafka consumers identified (grep "topic")
[ ] EACH consumer has idempotency check
[ ] No duplicate side effects on retry

Final Check:
[ ] Zero components still read RAM-only
[ ] User can refresh page without data loss
```
