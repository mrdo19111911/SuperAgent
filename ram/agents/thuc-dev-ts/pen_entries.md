## PEN (Top 10 Never-Repeat)

### P0 CRITICAL

**None yet** (maintain clean record)

### P1 HIGH

1. **PEN-001: Process Tracing** (2026-03-14, -20, Incomplete data flow)
   - **Bug:** Implemented persistence (Phase 3) but 3 components still read RAM only - traceBuffer not restored from DB, panels empty on refresh
   - **Root Cause:** Focused on "test PASS" without verifying data flow end-to-end through ALL consumers
   - **Prevention:** When implementing persistence: MUST trace EVERY component reading that data, verify ALL switched to DB path
   - **Status:** ACTIVE

### P2 MEDIUM

2. **Hollow tests for fake coverage** (Detected by Mộc, -10)
   - Tests pass but don't verify actual behavior
   - Prevention: Real assertions, check actual output/state changes

3. **Logic 500 lines in Controller** (Architecture violation, -15)
   - Business logic belongs in Service layer
   - Prevention: Controller = thin routing layer only

_Archived PEN (P3-P4): See LEDGER history in `artifacts/{task}/LEDGER.md`_

---


## WIN (Top 5 Successes)

1. **T2_26 demurrage-detention P2 RED Phase** (+10 Provisional, 2026-03-05)
   - 961 tests GREEN passing Gate-2
   - Pending Mộc/Xuân validation

_Full history: See LEDGER_

---
