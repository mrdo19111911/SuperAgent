# API Chaos Testing

Systematic chaos testing for APIs, auth, RLS, and edge cases.

---

## Weapon 1: Payload Chaos

**Empty Payload**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 Bad Request with validation error
# Bug if: 500 Internal Server Error (unhandled null)
```

**Missing Required Fields**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "t123"}'

# Missing: items, total
# Expected: 400 with error message "items is required"
# Bug if: Order created with null items
```

**Malformed JSON**

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "t123", "items": [}'

# Expected: 400 Bad Request "Invalid JSON"
# Bug if: 500 Internal Server Error
```

**10MB Payload (DoS test)**

```bash
# Generate large payload
node -e "console.log(JSON.stringify({items: Array(100000).fill({id: 'x'.repeat(100)})}))" > large.json

curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d @large.json

# Expected: 413 Payload Too Large OR 400 with validation error
# Bug if: Server crashes or hangs
```

---

## Weapon 2: Auth Bypass Testing

**RLS Bypass Test (PostgreSQL)**

```typescript
// tests/chaos/rlsBypass.test.ts
import { PrismaClient } from '@prisma/client';

describe('RLS Bypass Chaos Test', () => {
  it('should prevent tenant-A from seeing tenant-B data', async () => {
    // Setup: Create order for tenant-123
    await prisma.$executeRaw`SET LOCAL app.current_tenant_id = 'tenant-123'`;
    const order = await prisma.order.create({
      data: { tenant_id: 'tenant-123', total: 100 }
    });

    // Attack: Try to read as tenant-456
    await prisma.$executeRaw`SET LOCAL app.current_tenant_id = 'tenant-456'`;
    const found = await prisma.order.findUnique({
      where: { id: order.id }
    });

    // BLOCKER if found !== null (RLS bypass!)
    expect(found).toBeNull();
  });

  it('should detect superuser bypass (PEN-002)', async () => {
    // Check database role
    const result = await prisma.$queryRaw`
      SELECT rolname, rolbypassrls
      FROM pg_roles
      WHERE rolname = current_user
    `;

    // BLOCKER if rolbypassrls = true (superuser bypasses RLS)
    expect(result[0].rolbypassrls).toBe(false);
  });
});
```

**JWT Token Manipulation**

```bash
# Expired token
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.EXPIRED.sig"

# Expected: 401 Unauthorized "Token expired"
# Bug if: 500 Internal Server Error
```

```bash
# Malformed token
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer invalid-token-format"

# Expected: 401 Unauthorized "Invalid token"
# Bug if: Server crashes
```

```bash
# Missing token
curl -X GET http://localhost:3000/api/orders

# Expected: 401 Unauthorized "No token provided"
# Bug if: Returns data (auth bypass!)
```

---

## Weapon 3: Edge Case Payloads

**Null/Undefined Values**

```javascript
// Test script
const edgeCases = [
  { tenant_id: null, total: 100 },           // null tenant
  { tenant_id: undefined, total: 100 },      // undefined tenant
  { tenant_id: 't123', total: null },        // null number
  { tenant_id: 't123', total: undefined },   // undefined number
  { tenant_id: 't123', items: null },        // null array
  { tenant_id: 't123', items: undefined },   // undefined array
];

for (const payload of edgeCases) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Expected: 400 Bad Request for ALL cases
  // Bug if: 500 Internal Server Error OR data created
  console.log(`Payload ${JSON.stringify(payload)} → ${response.status}`);
}
```

**Negative Numbers**

```javascript
const payload = {
  tenant_id: 't123',
  items: [{ product_id: 'p1', quantity: -5 }],  // Negative quantity
  total: -100  // Negative total
};

// Expected: 400 Bad Request "Quantity must be positive"
// Bug if: Order created with negative values
```

**Max Integer Overflow**

```javascript
const payload = {
  tenant_id: 't123',
  total: Number.MAX_SAFE_INTEGER + 1  // 9007199254740992
};

// Expected: 400 Bad Request OR number clamped to max
// Bug if: Value wraps to negative (integer overflow)
```

**Special Characters (UTF-8, Emoji)**

```javascript
const payload = {
  tenant_id: 't123',
  customer_name: '🚀💥<script>alert("XSS")</script>',
  notes: '\u0000\u0001\u0002'  // Null bytes
};

// Expected: 400 Bad Request OR sanitized
// Bug if: Stored raw and returned in HTML (XSS)
```

---

## Weapon 4: SQL Injection Attempts

**Classic SQL Injection**

```bash
curl -X GET "http://localhost:3000/api/orders?tenant_id=t123' OR '1'='1"

# Expected: 400 Bad Request OR safely escaped
# BLOCKER if: Returns all orders (SQL injection!)
```

**UNION Injection**

```bash
curl -X GET "http://localhost:3000/api/users?id=1 UNION SELECT password FROM users--"

# Expected: 400 Bad Request
# BLOCKER if: Exposes password hashes
```

**Prisma Raw SQL Test**

```typescript
// Code review: Check for $executeRawUnsafe
const unsafeQuery = await prisma.$executeRawUnsafe(
  `SELECT * FROM orders WHERE tenant_id = '${tenantId}'`
);

// BLOCKER: Use $executeRaw (tagged template) instead
const safeQuery = await prisma.$executeRaw`
  SELECT * FROM orders WHERE tenant_id = ${tenantId}
`;
```

---

## Weapon 5: Rate Limiting & Spam

**100 Requests/Second**

```bash
# Generate 100 concurrent requests
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/orders \
    -H "Content-Type: application/json" \
    -d '{"tenant_id":"t123","total":100}' &
done
wait

# Expected: Some requests return 429 Too Many Requests
# Bug if: All 100 succeed (no rate limiting) OR server crashes
```

**Duplicate Idempotency Keys**

```bash
# Send same idempotency key twice
curl -X POST http://localhost:3000/api/orders \
  -H "Idempotency-Key: key-123" \
  -d '{"tenant_id":"t123","total":100}'

curl -X POST http://localhost:3000/api/orders \
  -H "Idempotency-Key: key-123" \
  -d '{"tenant_id":"t123","total":100}'

# Expected: Second request returns cached response (same order ID)
# Bug if: Two orders created with same idempotency key
```

---

## Bug Report Template

```markdown
### BUG-{MODULE}-{###}: [Title]

**Severity:** BLOCKER | CRITICAL | MAJOR | MINOR

**Root Cause Type:** FE-only | BE-only | FE+BE | Design flaw

**Repro Steps:**
1. Send POST /api/orders with payload `{"tenant_id": null}`
2. Observe server response

**Expected:** 400 Bad Request with error "tenant_id is required"

**Actual:** 500 Internal Server Error "Cannot read property 'id' of null"

**Evidence:**
- Log: [Attach server log]
- Screenshot: [Attach error response]
- curl command: `curl -X POST ... -d '{"tenant_id": null}'`

**Impact:** API returns 500 for invalid input instead of 400, exposing internal error details
```

---

## Severity Classification Table

| Severity | Definition | Timeline | Example |
|----------|------------|----------|---------|
| **BLOCKER** | Data loss, security breach, RLS bypass | < 1 hour | Tenant A can read Tenant B's orders |
| **CRITICAL** | Core feature broken, no workaround | < 4 hours | Cannot create orders at all |
| **MAJOR** | Important feature broken, workaround exists | < 1 day | Cannot filter orders, but can view all |
| **MINOR** | Cosmetic, UI glitch | < 1 week | Button color wrong |

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Test with superuser DB account | Superuser bypasses RLS → false positive | Use non-superuser role (`NOBYPASSRLS`) |
| Report MAJOR as BLOCKER | Dev panic, sprint disrupted | Classify by data loss + workaround availability |
| Bug report without repro steps | Dev cannot reproduce | Include curl command + payload |
| Skip edge case testing | Production users find bugs | Always test: null, negative, max int, special chars |
| No SQL injection test | Security vulnerability leaks | Test with `' OR '1'='1` payloads |

---

## Checklist

```
Payload Chaos:
[ ] Empty payload: {} → 400 Bad Request
[ ] Missing required fields → 400 with clear error message
[ ] Malformed JSON → 400 (not 500)
[ ] 10MB payload → 413 OR validation error (not crash)

Auth Bypass:
[ ] Expired JWT → 401 Unauthorized
[ ] Missing token → 401 Unauthorized
[ ] RLS test: Tenant A cannot read Tenant B data → null
[ ] Database role has NOBYPASSRLS (not superuser)

Edge Cases:
[ ] null values → 400 Bad Request
[ ] Negative numbers → 400 OR rejected
[ ] Max integer → Handled gracefully
[ ] Special chars/emoji → Sanitized (no XSS)

SQL Injection:
[ ] ' OR '1'='1 → 400 OR safely escaped
[ ] UNION SELECT → 400 (not data leak)
[ ] No $executeRawUnsafe in codebase

Rate Limiting:
[ ] 100 req/s → Some return 429
[ ] Duplicate idempotency key → Same response cached
```
