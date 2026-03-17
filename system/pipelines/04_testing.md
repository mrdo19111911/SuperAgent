# Pipeline 4: Testing & QA

**Stress-tests application on Staging to ensure no critical bugs reach Production.**

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- Gate 4 PASS (Code merged, app runnable)
- C6=empty (QA coverage missing)
- C10=high (Many bugs detected in audit)

**Conditions:**
- Backend implementation complete
- Need comprehensive QA before deployment

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- Son QA: Backend API stress testing, edge cases, SQL injection strings
- Huyen FE-QA: E2E testing (Playwright), HTML integrity (Crawlee), chaos testing (gremlins.js)

**Anti-Thesis (Challengers):**
- Dev author (original code owner): Confirms valid bugs vs disputes false positives with evidence

**Synthesis (Judge):**
- Dung PM: Final verdict per bug (valid/false positive/downgrade severity), writes `QA_VERDICT.md`

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- Define QA success: critical bugs found, severity accurate, reproduction steps documented

**Phase C - Execute:**
- Son QA: Reads `SPEC.md` + `CONTRACT_DRAFT.md`, creates test cases
- Son QA: Attacks API (edge cases: empty payload, 10MB payload, spam, injection strings)
- Huyen FE-QA: Reads `system/FE_QA_AUTOMATION.md`, runs Crawlee (HTML integrity), gremlins.js (chaos), Playwright (E2E critical flows)
- Both produce `BUG_LIST.md`: severity + reproduction steps + evidence (screenshots/logs)

**Phase D - Functional Verification:**
- Dev author receives `BUG_LIST.md`
- Per bug: confirms valid OR disputes with evidence (Spec/Contract line reference)
- Disputes false positives: "Spec line X shows this behavior is correct"
- Disputes over-testing: "Test case doesn't reflect real-world usage because Y"
- MUST fix all confirmed valid bugs before Synthesis

**Phase E - Non-Functional Verification:**
- Dung PM reads `BUG_LIST.md` + dev disputes
- Per bug: decides Valid (keep severity) / False Positive (dismiss) / Downgrade severity
- Writes `QA_VERDICT.md` with final decisions + rationale
- P4 bugs can push to Backlog; P1/P2/P3 must fix before exit

*Phases B/B2/F not used (QA pipeline scope).*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `docs/qa/BUG_LIST.md`: Bugs with severity, reproduction steps, evidence
- `docs/qa/QA_VERDICT.md`: Final verdict per bug (valid/FP/downgrade), action required
- `tests/e2e/**/*.spec.ts`: E2E test scripts (Playwright/Crawlee)

**LEDGER Entries:**
- Bug severity scoring (P1/P2/P3)
- Severity inflation penalties (P0 for exaggeration)
- Missed bugs if found in later gates

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 5**: `gates/validate.sh` + `gates/qa.sh` — No TODO/FIXME in `src/`, type check pass, unit+integration+E2E pass, SAST no HIGH
- **Gate 7a**: `gates/qa.sh` — Workflow smoke, SAST re-verify, failure injection, perf baseline, anti-Goodhart test audit

**ON FAIL Actions:**
- Gate 5 fail: Dev fixes and re-submits
- Gate 7a fail: Son QA + dev address issues jointly

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ Gate 7a PASS
- ✅ All P1/P2/P3 bugs fixed (P4 can go to Backlog)
- ✅ `QA_VERDICT.md` shows PASS decision
- ✅ E2E tests cover critical flows

**Handoff to Next Pipeline:**
- Route to **Pipeline 5 (Security & Deployment)**

---

**L2 Cache Pre-Load:**
- `agents/core/son-qa.md` (Son QA)
- `agents/dev/huyen-fe-qa.md` (Huyen FE-QA)
- `agents/BRAIN.md` (Dung PM)

**Token Count:** ~550 tokens
