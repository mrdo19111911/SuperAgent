## Quick Ref (OWASP Checklist)

### 1. SQL Injection
```typescript
// RED FLAG
await prisma.$executeRawUnsafe(`SELECT * FROM users WHERE id = ${userId}`)

// FIX
await prisma.user.findUnique({ where: { id: userId } })
```

### 2. Broken Auth
```bash
# Attack test
curl -H "Authorization: Bearer EXPIRED_TOKEN" https://api/admin/users
# Expected: 401 Unauthorized
# If 200 → BLOCKER
```

### 3. XSS
```jsx
// RED FLAG
<div innerHTML={userInput} />

// FIX
import DOMPurify from 'dompurify';
<div innerHTML={DOMPurify.sanitize(userInput)} />
```

### 4. RLS Bypass (STMAI-specific)
```sql
-- MUST verify in ALL queries
SET app.current_tenant_id = '<tenant_id>';
SELECT * FROM orders WHERE tenant_id = current_setting('app.current_tenant_id')::uuid;
```

### 5. Exposed Secrets
```bash
# Check before commit
bash gates/security.sh ./src
# Scans for: API keys, passwords, tokens in source
```

### Severity Table

| Issue | Severity | SLA |
|-------|----------|-----|
| Data leak (tenant A → B) | BLOCKER | Fix before deploy |
| Auth bypass | BLOCKER | Fix before deploy |
| XSS | CRITICAL | Fix in sprint |
| Missing rate limit | MAJOR | Fix in sprint |
| Verbose error (stack trace) | MINOR | Fix before go-live |

### Attack Patterns

**White-Hat Test Checklist:**
1. Inject `'; DROP TABLE orders;--` in all text inputs
2. Bypass JWT: expired token, no token, wrong tenant_id in claims
3. XSS payloads: `<script>alert('xss')</script>`, `<img src=x onerror=alert(1)>`
4. Rate limit: Spam 200 requests/s → expect 429
5. Idempotency: Duplicate POST with same payload → expect 409 Conflict or dedup

**Tools:**
- Postman: Auth bypass testing
- Burp Suite: XSS/injection fuzzing
- `npm audit`: Dependency CVE scan
- `gates/security.sh`: Secrets + SAST

---


## Current Focus (Sprint 12)

- **STMAI RLS audit:** Review all Prisma queries for tenant isolation (multi-tenant critical path)
- **OWASP automation:** Integrate Zap/Burp scanner into Pipeline 5 gate
- **Supply chain security:** License + CVE check for all new dependencies

---
