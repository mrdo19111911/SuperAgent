## PEN (Top 10 Never-Repeat)

### P0 CRITICAL

**PEN-001 | T2_26 | 2026-02-26 | -30**
- **Bug:** Missed gap in CONTRACT_DRAFT → Sơn QA found 3 integration bugs in testing
- **Root Cause:** Reviewed only 4/6 sections (skipped Events + Idempotency)
- **Rule:** MUST check all 6 sections: API · DTO · Mock · Errors · Events · Idempotency
- **Verdict:** Thiếu 1 section = FAIL → Dev cannot proceed

### P1 HIGH

**PEN-002 | T3_12 | 2026-03-01 | -20**
- **Bug:** FE parse drift (`response.data.id` vs `response.data.order.id`)
- **Root Cause:** Lazy review — didn't trace actual FE parsing code
- **Rule:** MUST verify FE mock matches BE response structure byte-for-byte

**PEN-003 | T2_18 | 2026-02-20 | -20**
- **Bug:** Error codes not SCREAMING_SNAKE_CASE (`orderNotFound` vs `ORDER_NOT_FOUND`)
- **Root Cause:** Didn't enforce naming convention in CONTRACT_DRAFT
- **Rule:** All error codes MUST be SCREAMING_SNAKE_CASE (auto-verified by gate1.6.sh)

### P2 MEDIUM

**PEN-004 | T3_05 | 2026-02-28 | -15**
- **Bug:** Vague acceptance criteria ("system should work well")
- **Root Cause:** Approved spec without testable assertions
- **Rule:** Each criterion must be testable (Given-When-Then or metric-based)

**PEN-005 | T2_22 | 2026-02-22 | -15**
- **Bug:** Missing idempotency key for POST /orders endpoint
- **Root Cause:** Didn't check all POST/PUT/PATCH endpoints for idempotency
- **Rule:** All state-changing endpoints MUST define idempotency strategy

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

**WIN-001 | T2_26 | 2026-02-26 | +30**
- **Success:** Found 3 P1 gaps in CONTRACT_DRAFT (missing error codes, wrong DTO shape, no idempotency)
- **Impact:** Prevented full sprint rework if bugs found in QA
- **Method:** Used full 6-section checklist instead of skim review

**WIN-002 | T3_14 | 2026-03-02 | +25**
- **Success:** Detected BE↔FE drift before merge (FE expected `{ success, data, meta }`, BE returned raw object)
- **Impact:** Saved 2 days integration debugging
- **Method:** Traced FE parsing code against CONTRACT_DRAFT response shape

**WIN-003 | T2_20 | 2026-02-21 | +20**
- **Success:** Enforced testable acceptance criteria (converted "fast response" → "p95 latency <200ms")
- **Impact:** QA could write performance tests immediately
- **Method:** Rejected vague criteria, required metrics

**WIN-004 | T3_08 | 2026-03-01 | +20**
- **Success:** Found missing Kafka event schema before Pipeline 3
- **Impact:** Prevented async processing bugs
- **Method:** Checked DomainEvent<T> structure for all event publishers

**WIN-005 | T2_15 | 2026-02-18 | +15**
- **Success:** Caught inconsistent error handling (some endpoints returned 400, others 422 for validation)
- **Impact:** Standardized error codes across API
- **Method:** Cross-referenced all endpoints in CONTRACT_DRAFT

_Full history: See LEDGER_

---
