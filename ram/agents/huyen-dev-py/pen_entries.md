## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Repeat)

1. **Hardcoded secrets in source code** (2026-02-18, -30, BUG-745)
   - DB URL, API key committed to git → Security BLOCKER
   - Fix: ALWAYS use `os.getenv()` + `.env` file + `python-dotenv`
   - Prevention: Run `gates/security.sh` before commit

2. **Sync blocking IO in async route** (2026-02-25, -30, BUG-762)
   - `requests.get()` in `async def` → Blocked event loop → 500ms → 5s latency
   - Fix: Use `httpx.AsyncClient()` or `asyncio.to_thread(requests.get, url)`
   - Prevention: Review every `async def` for sync calls (time.sleep, requests, subprocess)

### P1 HIGH (Learn From)

3. **API payload drift from CONTRACT** (2026-03-01, -20, BUG-778)
   - Changed Pydantic model without updating FE → Parse error in production
   - Fix: NEVER change API shape without CONTRACT_DRAFT update + Xuân approval
   - Prevention: Read CONTRACT_DRAFT before implementing endpoint

4. **SQLAlchemy lazy loading in async** (2026-03-05, -20, BUG-789)
   - `order.customer.name` → `MissingGreenlet` error in production
   - Fix: Use `selectinload(Order.customer)` or `joinedload()` for eager loading
   - Prevention: No lazy attribute access in async routes, always eager load

5. **Missing tenant_id filter in query** (2026-03-08, -20, BUG-801)
   - Multi-tenant data leak → Security violation
   - Fix: EVERY SQLAlchemy query MUST have `.filter(Model.tenant_id == tenant_id)`
   - Prevention: Review every query for tenant isolation

### P2 MEDIUM (Avoid)

6. **Hollow test caught by Mộc** (2026-03-10, -15, BUG-812)
   - Test passed but didn't assert actual business logic
   - Fix: Every test must validate output/behavior, not just "it runs"
   - Prevention: Ask "What bug would this test catch?" before writing

7. **datetime.now() instead of UTC** (2026-03-12, -15, BUG-820)
   - Timezone bug in production (Asia/Ho_Chi_Minh → UTC mismatch)
   - Fix: ALWAYS use `datetime.utcnow()` for server timestamps
   - Prevention: Search codebase for `.now()` before commit

8. **Global mutable state** (2026-03-14, -15, BUG-828)
   - Shared dict between requests → Thread-unsafe data corruption
   - Fix: Use FastAPI dependency injection or request-scoped state
   - Prevention: No module-level mutable containers (dict, list, set)

9. **Missing error code in HTTPException** (2026-03-15, -10, BUG-835)
   - Generic 404 without machine-readable code → Hard to debug in FE
   - Fix: `raise HTTPException(status_code=404, detail={"code": "ORDER_NOT_FOUND"})`
   - Prevention: Every HTTPException must have structured detail with code field

10. **TODO without ticket ID at validate gate** (2026-03-16, -10, BUG-842)
    - `# TODO: Optimize this query` → Blocked by gates/validate.sh
    - Fix: `# TODO(JIRA-123): Optimize this query` or remove before commit
    - Prevention: Run `gates/validate.sh` before final commit

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Route optimization algorithm: Correct + Fast** (2026-02-20, +30)
   - Google OR-Tools VRP implementation: 50 waypoints in 350ms (budget: 500ms)
   - Test coverage 95%, all edge cases validated
   - Impact: Core T1_13 feature shipped on time

2. **FastAPI async clean code review PASS** (2026-03-02, +25)
   - Zero sync-in-async traps, proper eager loading, httpx async client
   - Mộc code review PASS on first submission (no P1/P2 findings)
   - Impact: Set async/await pattern standard for team

3. **Pydantic BaseResponse envelope compliance** (2026-03-06, +20)
   - All endpoints return `{ "success": true, "data": {}, "meta": {} }`
   - Xuán Spec-Rev PASS, FE integration smooth (zero parse errors)
   - Impact: Enabled FE standardization across modules

4. **Multi-tenant test isolation strategy** (2026-03-09, +15)
   - Factory pattern with `faker.seed(123)` for deterministic data
   - Every test creates isolated tenant → Zero flaky tests from shared state
   - Impact: Prevented PEN-003 (tenant pollution) for entire Python module

5. **Secrets leak prevention** (2026-03-13, +15)
   - Implemented pre-commit hook with truffleHog scan
   - Caught AWS key before commit → Prevented P0 incident
   - Impact: Team adopted hook for all Python repos

_Full history: See LEDGER_

---
