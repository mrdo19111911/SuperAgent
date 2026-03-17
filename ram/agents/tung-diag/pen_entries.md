## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (-30 Points)

1. **Skipped audit dimension** (2026-02-18, -30, BUG-792)
   - Missing C7 (Infra/DevOps) → Router selected wrong pipeline → cascading failures
   - Fix: ALWAYS run full 12 dimensions, merge with `bash scripts/merge_audit.sh`

2. **Wrong severity declaration** (2026-02-25, -30, BUG-805)
   - Called BLOCKER on UI glitch (workaround exists) → Team dropped sprint work unnecessarily
   - Fix: Check Bug Triage Matrix - Downgrade if workaround exists (unless data loss/security)

### P1 HIGH (-20 Points)

3. **Hotfix without log analysis** (2026-03-02, -20, BUG-818)
   - Fixed based on "gut feeling", wrong root cause → Issue recurred 2 days later
   - Fix: ALWAYS read logs/traces FIRST, identify root cause, THEN dispatch

4. **Hotfix with TODO/FIXME** (2026-03-08, -20, BUG-831)
   - Emergency fix left `// TODO: refactor this` → Failed validate.sh gate
   - Fix: Hotfix code must be CLEAN (open P3 ticket for refactor instead)

### P2 MEDIUM (-15 Points)

5. **Incomplete audit merge** (2026-02-12, -15, BUG-776)
   - Merged 2/3 sub-audits, forgot Xuân+Huyền's C11/C12 → Incomplete Router input
   - Fix: Verify all 3 streams present before merge

6. **No post-hotfix ticket** (2026-02-20, -15, BUG-798)
   - Fixed production bug, closed ticket, never scheduled cleanup → Tech debt accumulation
   - Fix: ALWAYS open follow-up ticket for Pipeline 3+4 cleanup

7. **Severity downgrade without data check** (2026-03-01, -10, BUG-812)
   - Downgraded CRITICAL → MAJOR because "looks minor", but data loss occurred
   - Fix: Data loss OR security issue = BLOCKER (even if workaround exists)

8. **Audit without baseline measurement** (2026-02-08, -10, BUG-765)
   - Audited codebase, no comparison with previous audit → Can't track improvement/regression
   - Fix: Run `bash scripts/measure-baseline.sh` before audit

9. **Parallel audit streams collision** (2026-03-05, -10, BUG-826)
   - Conan + Phúc both ran C4 (Architecture) → Wasted tokens, conflicting reports
   - Fix: Strict assignment - Conan (C1/2/3/9/10), Phúc+Mộc (C4/5/6/7/8), Xuân+Huyền (C11/12)

10. **Missing audit artifact** (2026-02-15, -10, BUG-783)
    - Ran audit, forgot to write `AUDIT_REPORT_FINAL.md` → Router had no input
    - Fix: Output MUST be written to `{module}/docs/AUDIT_REPORT_FINAL.md`

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Prevented production disaster via audit** (2026-02-28, +30, WIN-045)
   - C5 (Security) audit caught hardcoded AWS keys before deploy → Saved $50K potential breach
   - Impact: Zero security incidents in production

2. **P0 hotfix in 45 minutes** (2026-03-10, +25, WIN-052)
   - BLOCKER: Payment gateway down, data loss risk
   - Root cause: DB connection pool exhausted → Fixed + monitored in <1 hour
   - Post-fix: Opened ticket for connection pool tuning (completed Sprint 11)

3. **12-dimension audit under budget** (2026-02-22, +20, WIN-038)
   - Full audit in 3 parallel streams, merged report: 45K tokens (under 50K limit)
   - All dimensions covered, Router selected correct pipeline (Architecture)

4. **Downgrade prevented panic** (2026-03-03, +15, WIN-047)
   - Correctly downgraded CRITICAL → MAJOR (workaround exists, no data loss)
   - Team continued sprint work, bug fixed next day without emergency stress

5. **Post-hotfix cleanup completion** (2026-02-18, +10, WIN-032)
   - Emergency fix deployed, opened P3 ticket same day → Refactored in Sprint 10
   - Zero tech debt accumulation from hotfix

_Full history: See LEDGER_

---
