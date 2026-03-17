# Pipeline 3: Backend Coding

**Converts `CONTRACT_DRAFT.md` into backend source code with passing unit tests.**

**Scope:** Backend ONLY. FE coding (HTML → React) lives in `DESIGN_FLOW.md` Stage 7 / `FE_IMPLEMENTATION.md`.

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- Gate 2 PASS (Architecture complete) or Gate 2.5 (if Phanbien)
- `CONTRACT_DRAFT.md` finalized

**Conditions:**
- Contracts locked, ready for implementation
- Backend stack identified in `docs/CONTEXT.md`

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- **Stack-specific dev agent** (conditional based on `CONTEXT.md`):
  - NestJS/TS → Thuc Dev-TS
  - .NET → Hoang Dev .NET
  - Python → Huyen Dev-Py
  - Go → Tuan Dev Go

**Anti-Thesis (Challengers):**
- Moc Arch-Chal: Code review (logic in Controller?, hollow tests?, hardcoded envs?, wrong layer?)
- Static tools: ESLint, SonarQube (auto-block on lint errors)

**Synthesis (Judge):**
- Phuc SA: Reviews lint + Moc comments, approves merge

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- Define success: code matches `CONTRACT_DRAFT.md`, ≥80% coverage, zero TODO/FIXME

**Phase C - Execute (TDD GREEN):**
- Dev agent applies TDD: write test RED first, implement to GREEN
- Source code 100% adheres to `CONTRACT_DRAFT.md` (no unauthorized payload changes)
- Delete all TODO/FIXME/stub before PR
- Create PR with coverage numbers in description

**Phase D - Functional Verification:**
- Lint auto-runs (ESLint/SonarQube) — PR blocked on errors
- Moc reviews: logic in wrong layer? Hollow tests (fake coverage)? Contract drift? Hardcoded `.env` values?
- Moc writes PR comments with evidence per issue

**Phase E - Non-Functional Verification:**
- Phuc SA reads lint report + Moc comments
- Phuc SA requires dev to fix all issues before approval
- Phuc SA approves and merges PR when clean

*Phases B/B2/F not used (coding pipeline complexity).*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `src/**/*.(ts|cs|py|go)`: Source code (stack-specific)
- `tests/unit/**/*.spec.(ts|cs|py|go)`: Unit tests (≥80% coverage)
- `tests/integration/**/*.spec.(ts|cs|py|go)`: Integration tests (≥70% coverage)

**LEDGER Entries:**
- Contract drift penalties (P2)
- TODO/FIXME violations (P3)
- Hollow test detection (P1 if caught in QA gate)

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 3**: `gates/validate.sh` — ≥5 test files exist
- **Gate 3.5**: `gates/gate3.5.sh` — Unit coverage ≥80%, no TODO/FIXME in `src/`
- **Gate 4**: `gates/validate.sh` — Build succeeds, integration tests pass

**ON FAIL Actions:**
- Gate 3 fail: Dev adds test files
- Gate 3.5 fail: Dev fixes coverage or removes TODOs, re-run
- Gate 4 fail: Dev debugs build errors

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ Gate 4 PASS
- ✅ Phuc SA approves and merges PR
- ✅ Code matches `CONTRACT_DRAFT.md` (zero drift)
- ✅ No TODO/FIXME in source

**Handoff to Next Pipeline:**
- Route to **Pipeline 4 (Testing & QA)**

---

**L2 Cache Pre-Load (conditional on stack):**
- `agents/core/phuc-sa.md` (Synthesis)
- `agents/core/moc-arch-chal.md` (Anti-Thesis)
- `agents/dev/thuc-dev-ts.md` (NestJS/TS)
- `agents/dev/hoang-dev-net.md` (.NET)
- `agents/dev/huyen-dev-py.md` (Python)
- `agents/dev/tuan-dev-go.md` (Go)

**Token Count:** ~550 tokens
