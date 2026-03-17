## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (-30 each)

**1. Hardcoded Connection String in Source** (2026-02-18, -30, BUG-794)
- Committed `appsettings.json` with production DB password
- Fix: ALWAYS use Azure Key Vault or environment variables for secrets
- Gate: `gates/security.sh` blocks commits with secrets

**2. `async void` in Production Code** (2026-02-25, -30, BUG-811)
- Used `async void OnButtonClick()` → exception swallowed, app crashed without logs
- Fix: MUST use `async Task` (async void only for event handlers in UI layers)
- Detection: Code review checks all async methods return Task

### P1 HIGH (-20 each)

**3. API Contract Drift - Breaking FE** (2026-03-01, -20, BUG-816)
- Changed `OrderResponse.totalPrice` from decimal to string without CONTRACT update
- Lan FE parsing failed, Xuan caught at spec review
- Fix: MUST update CONTRACT_DRAFT.md before changing DTOs

**4. DbContext Injected into Singleton** (2026-03-05, -20, BUG-824)
- Injected `AppDbContext` into singleton service → lifetime clash, stale data
- Fix: Use `IServiceScopeFactory` to create scoped DbContext per request

**5. Missing Tenant Filter in Query** (2026-03-08, -20, BUG-832)
- Query: `context.Orders.Where(o => o.Status == "Paid")` (missing `tenantId`)
- Moc caught at code review → cross-tenant data leak risk
- Fix: EVERY query MUST filter by `tenantId`

### P2 MEDIUM (-15 each)

**6. Hollow Test - Fake Coverage** (2026-02-20, -15, BUG-803)
- Test passed but didn't assert business logic, just checked `result != null`
- Son QA flagged during test audit
- Fix: Assert specific business rules (discount calculation, RLS enforcement)

**7. `DateTime.Now` Instead of `DateTime.UtcNow`** (2026-02-28, -15, BUG-814)
- Used `DateTime.Now` → timezone bugs in production (server in PST, DB in UTC)
- Fix: ALWAYS use `DateTime.UtcNow` for timestamps

**8. Lazy Loading Enabled - N+1 Queries** (2026-03-03, -15, BUG-820)
- EF Core lazy loading caused 1000+ queries in loop
- Fix: Disable lazy loading, use explicit `Include()` or eager loading

**9. No Dispose HttpClient** (2026-03-10, -15, BUG-835)
- Created `new HttpClient()` per request → socket exhaustion
- Fix: Use `IHttpClientFactory` for pooled connections

**10. API Response Not Wrapped in Envelope** (2026-02-15, -10, BUG-791)
- Returned raw `OrderDto` instead of `{ success, data, meta }`
- Fix: ALWAYS wrap responses in STMAI API Envelope

_Archived PEN (P3-P4): See LEDGER → hoang-dev-net_

---


## WIN (Top 5 Successes)

**1. Zero-Downtime Migration - 5M Rows** (2026-02-12, +30, T4_47)
- EF Core migration with Expand-Contract pattern, no locks, 8min total
- Used `database-migration` skill, all tests passed pre/post migration
- Impact: Production deploy without maintenance window

**2. Perfect Test Suite - 85% Coverage** (2026-02-22, +25, T4_48)
- Financial reporting module: 127 tests (unit + integration), 85% coverage
- Zero hollow tests, all edge cases covered (null, tenant isolation, decimal precision)
- Moc code review PASS first attempt, Son QA audit: "Exemplary"

**3. Async/Await Refactor - 40% Latency Reduction** (2026-03-02, +20, T4_49)
- Converted sync Kafka producer to async → p95 latency 600ms → 360ms
- Used `async Task` everywhere, no `async void`, proper cancellation tokens
- Load test: 1000 RPS sustained, zero exceptions

**4. Secrets Cleanup - P0 Prevention** (2026-03-07, +15, Security)
- Audited codebase, removed 12 hardcoded secrets, migrated to Azure Key Vault
- Implemented `gates/security.sh` pre-commit hook
- Impact: Zero secrets in git history (after rebase/force-push)

**5. Multi-Tenant Kafka Events** (2026-03-12, +15, T4_50)
- Implemented `DomainEvent<T>` envelope with tenantId, timestamp, correlation_id
- All events now traceable, multi-tenant isolation enforced at event level
- Impact: Nam observability dashboard shows tenant-filtered event flow

_Full WIN history: See LEDGER → hoang-dev-net_

---
