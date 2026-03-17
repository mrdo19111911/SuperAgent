## PEN (Top 10 Never-Repeat — Missed Vulnerabilities)

### P0 CRITICAL (-30 pts)

**PEN-001 | 2026-03-14 | Lazy Review Detection**
- **What Happened:** "LGTM" approved 500-line PR in 30 seconds without reading
- **Impact:** Framework rule violation — every Challenger must show evidence of deep review
- **Prevention:** MUST spend ≥2 min per 100 lines, cite specific line numbers in feedback
- **Status:** ACTIVE

**PEN-002 | 2026-03-12 | Nitpicking Over Logic**
- **What Happened:** PR comment focused on style/format instead of architecture/security
- **Impact:** -30 pts for violating Critic role (logic > style)
- **Prevention:** BLOCKING issues = security/correctness ONLY. Style = [NON-BLOCKING] max 2 comments
- **Status:** ACTIVE

### P1 HIGH (-20 pts)

**PEN-003 | 2026-03-14 | Missed Data Flow Bug**
- **What Happened:** Approved code review but missed: 3 UI components read RAM-only traceBuffer, no DB restore path
- **Impact:** User discovered data loss on page refresh (production bug)
- **Root Cause:** Reviewed code statically, didn't trace data flow end-to-end (DB → API → state → consumer)
- **Prevention:** When reviewing persistence: MUST trace from DB → EVERY consumer component. Verify restore path exists
- **Status:** ACTIVE

**PEN-004 | 2026-03-10 | RLS Bypass Not Caught**
- **What Happened:** Code used `prisma.order.findMany()` without tenant filter — passed review
- **Impact:** Security BLOCKER leaked to QA gate
- **Prevention:** ALWAYS grep for `.findMany()` → verify RLS policy or explicit `where: { tenantId }`
- **Status:** ACTIVE

### P2 MEDIUM (-15 pts)

**PEN-005 | 2026-03-08 | Challenge Without Evidence**
- **What Happened:** Challenged index strategy with "feels slow" — no EXPLAIN ANALYZE proof
- **Impact:** Dev wasted time defending correct approach
- **Prevention:** Architecture challenge MUST cite PostgreSQL docs (pg-aiguide) or benchmark data
- **Status:** ACTIVE

**PEN-006 | 2026-03-05 | Comment Overload**
- **What Happened:** Posted 20 minor [NON-BLOCKING] comments on single PR
- **Impact:** Dev felt overwhelmed, ignored valid BLOCKING issue buried in noise
- **Prevention:** Limit [NON-BLOCKING] to ≤5 comments per PR. Batch minor issues or skip
- **Status:** ACTIVE

**PEN-007 | 2026-03-02 | Hard Delete Not Flagged**
- **What Happened:** Approved `prisma.order.delete()` instead of soft delete (`deleted_at = NOW()`)
- **Impact:** Contract violation leaked to integration test
- **Prevention:** ALWAYS search for `.delete(` → flag as BLOCKING if not audit/cleanup context
- **Status:** ACTIVE

**PEN-008 | 2026-02-28 | Raw API Return**
- **What Happened:** Approved `return order` instead of envelope `{ success, data, meta }`
- **Impact:** Contract violation broke FE error handling
- **Prevention:** ALWAYS verify API returns match envelope contract
- **Status:** ACTIVE

**PEN-009 | 2026-02-25 | N+1 Query Pattern**
- **What Happened:** Approved `findMany()` + `for loop` with `.findUnique()` inside
- **Impact:** Production performance degradation (500ms → 5s on 100 items)
- **Prevention:** MUST flag any loop with DB call inside as BLOCKING — suggest `include` or batch fetch
- **Status:** ACTIVE

**PEN-010 | 2026-02-20 | SQL Injection Risk**
- **What Happened:** Missed `prisma.$executeRawUnsafe()` with string interpolation
- **Impact:** Security BLOCKER caught by gate script
- **Prevention:** ALWAYS grep for `RawUnsafe` → flag as BLOCKING unless parameterized
- **Status:** ACTIVE

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

**WIN-001 | 2026-03-11 | RLS Bypass Detection (+30)**
- Caught `prisma.payment.findMany()` missing tenant filter in design review
- Prevented security breach before code written
- Evidence: pg-aiguide search "NOBYPASSRLS role attributes"

**WIN-002 | 2026-03-06 | N+1 Query Prevention (+20)**
- Code challenge led to refactor: `findMany()` + loop → single query with `include`
- Production performance: 5s → 200ms (25x faster)
- Blocked PR with clear [BLOCKING] label + alternative solution

**WIN-003 | 2026-02-28 | Thorough PR Review (+10)**
- Found ≥2 blocking issues in single PR: RLS bypass + hard delete
- Explained WHY both violate contracts (not just WHAT)
- Developer thanked for clear feedback

**WIN-004 | 2026-02-22 | Architecture Alternative (+15)**
- Challenged materialized view approach with pg-aiguide evidence
- Proposed incremental refresh strategy → saved 80% compute
- Evidence-backed counter-proposal accepted by Phuc SA

**WIN-005 | 2026-02-18 | Contract Validation (+10)**
- Caught missing idempotency key in payment API design
- Referenced CONTRACT_DRAFT template section 4 (Idempotency Rules)
- Prevented production duplicate charge bug

_Full WIN history: See LEDGER_

---
