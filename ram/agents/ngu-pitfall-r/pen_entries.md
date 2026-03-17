## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (-30 points)

1. **RLS bypass missed in review** (2026-02-18, -30, BUG-793)
   - Tenant A accessed Tenant B data in production
   - Query missing `app.current_tenant_id` check
   - FIX: ALWAYS verify RLS policies + test cross-tenant queries

2. **False positive BLOCKER** (2026-02-25, -30, BUG-808)
   - Reported XSS vulnerability with no actual exploit
   - Blocked deployment 2 days unnecessarily
   - FIX: MUST provide reproducible attack payload before BLOCKER severity

### P1 HIGH (-20 points)

3. **SQL injection in dynamic query** (2026-03-01, -20, BUG-814)
   - `executeRawUnsafe()` with user input not flagged
   - Discovered by QA in staging
   - FIX: Flag ALL `executeRaw*` + string concatenation patterns

4. **Auth bypass not tested** (2026-03-05, -20, BUG-822)
   - Admin endpoint missing `@UseGuards(JwtAuthGuard)`
   - Only checked code, didn't test with Postman
   - FIX: ALWAYS manual attack test (expired token, no token, wrong tenant)

### P2 MEDIUM (-15 points)

5. **CVE dependency not flagged** (2026-02-10, -15, BUG-785)
   - `npm audit` showed HIGH severity, not escalated
   - FIX: Run `npx audit-ci --high` in review checklist

6. **Incomplete threat model** (2026-02-28, -15, BUG-811)
   - Identified XSS but missed CSRF on state-changing endpoint
   - FIX: Check ALL attack vectors (OWASP Top 10 + STMAI-specific RLS)

7. **Severity misclassification** (2026-03-08, -15, BUG-827)
   - Stack trace exposure marked BLOCKER (should be MINOR)
   - FIX: Follow severity table (data leak/auth bypass = BLOCKER, verbose error = MINOR)

8. **Missing idempotency check** (2026-03-10, -10, BUG-830)
   - POST endpoint no `x-idempotency-key` → duplicate order creation
   - FIX: All state-changing POST/PUT need idempotency protection

9. **Rate limit not verified** (2026-02-20, -10, BUG-799)
   - Assumed rate limit exists, didn't test with 200 req/s
   - FIX: MUST test with chaos script (spam requests, verify 429)

10. **Secrets scan skipped** (2026-03-12, -10, BUG-835)
    - `.env.example` had real API key (copy-paste error)
    - FIX: Run `gates/security.sh` even for "example" files

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **RLS bypass caught pre-production** (2026-02-12, +30, WIN-045)
   - Found query bypassing tenant isolation in multi-tenant query
   - Prevented data breach for 500+ tenants
   - Attack: Modified `tenant_id` in request → accessed other tenant data

2. **Auth bypass in admin panel** (2026-02-22, +25, WIN-051)
   - Discovered `/admin/users` endpoint no JWT guard
   - Postman test with expired token → 200 OK (should be 401)
   - Fixed before production deploy

3. **CVE critical dependency** (2026-03-03, +20, WIN-057)
   - `express` version had RCE vulnerability (CVE-2024-XXXX)
   - Flagged in review, patched same day
   - Automated with `npx audit-ci --critical`

4. **XSS in React component** (2026-03-07, +20, WIN-062)
   - `innerHTML={userBio}` without sanitization
   - Payload: `<img src=x onerror=alert('xss')>` executed
   - Fixed with DOMPurify sanitization

5. **Idempotency attack prevented** (2026-03-11, +15, WIN-068)
   - POST `/orders` no idempotency key → spam creates duplicates
   - Demonstrated 10 duplicate orders in 1 second
   - Added `x-idempotency-key` header validation

_Full history: See LEDGER_

---
