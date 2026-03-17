# Pipeline 2: Architecture & Database

**Converts `SPEC.md` into validated Data Schema, API Contracts, and Architecture Decision Records.**

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- Gate 1 PASS (Requirements complete)
- C4=spaghetti (Architecture issues detected)
- C8=conflict (Schema contradicts documentation)
- Missing architecture/DB schema

**Conditions:**
- `SPEC.md` approved but no technical design
- Architecture needs validation before coding

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- Phuc SA: BE/DB design, `ARCHITECTURE.md`, `schema.prisma`, `CONTRACT_DRAFT.md`
- Quang Designer: FE Design System (`design-tokens.json`, `index.css`, `tailwind.config.ts`)

**Anti-Thesis (Challengers):**
- Moc Arch-Chal: BE challenges (N+1 queries, RLS, indexing, Kafka partitioning)
- Lan Dev FE: FE challenges (design tokens mapping, API payload match, hardcoded colors)

**Synthesis (Judge):**
- Dung PM: Final decisions on architecture disputes
- Xuan Spec-Rev: Contract review (8-section validation, sign-off/block)

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- Define success criteria for architecture design

**Phase C - Execute:**
- Phuc SA: Draws `ARCHITECTURE.md` (module diagram, Kafka topics, API boundaries)
- Phuc SA: Designs `schema.prisma` (tenant_id required, RLS policies, indexes)
- Phuc SA: Writes `CONTRACT_DRAFT.md` (8 sections: API, DTOs, Mock, Errors, Events, Idempotency, Sign-off)
- Quang: Creates Design System (`design-tokens.json`, HSL color vars in CSS)

**Phase D - Functional Verification:**
- Moc: Attacks `ARCHITECTURE.md` and `schema.prisma` (N+1, RLS coverage, JSONB indexes, Kafka strategy)
- Lan: Reviews `design-tokens.json` and `CONTRACT_DRAFT.md` (CSS mapping, API payload match)
- Both write `ARCH_CHALLENGE.md` with severity (HIGH/MEDIUM/LOW) + evidence
- Counter-proposals required for HIGH issues

**Phase E - Non-Functional Verification:**
- Phuc SA: Writes `ARCH_RESPONSE.md` (accept/reject + rationale per issue)
- Xuan: Reviews `CONTRACT_DRAFT.md`, writes `CONTRACT_REVIEW.md` (8-section check, ≥5 error cases, idempotency)
- Xuan: Sign-off or block with reason

**Phase F - Cross-Cutting Review (if Phanbien triggered):**
- Phuc SA + Moc: Joint design session produces `PHUC_MOC_JOINT_DESIGN.md` with FINAL DECISION

*Phases B/B2 not used; F conditional on debate intensity.*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `docs/ARCHITECTURE.md`: Module diagram, service boundaries, data flow
- `prisma/schema.prisma`: DB schema (tenant_id, RLS, indexes)
- `docs/CONTRACT_DRAFT.md`: 8-section API contract
- `docs/ARCH_CHALLENGE.md`: Issues found (severity + evidence)
- `docs/ARCH_RESPONSE.md`: Responses to all HIGH issues
- `docs/CONTRACT_REVIEW.md`: 8-section validation + sign-off/block

**Optional Artifacts:**
- `docs/PHUC_MOC_JOINT_DESIGN.md`: If intense debate requires joint session
- `design-tokens.json`, `index.css`, `tailwind.config.ts`: FE Design System

**LEDGER Entries:**
- Architecture debate scores
- Contract drift penalties

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 1.5**: `gates/gate1.5.sh` — `ARCH_CHALLENGE.md` + `ARCH_RESPONSE.md` exist, all HIGH issues addressed
- **Gate 1.6**: `gates/gate1.6.sh` — `CONTRACT_DRAFT.md` ≥30 lines, has API + Event sections
- **Gate 1.6.5**: `gates/gate1.6.5.sh` — `CONTRACT_REVIEW.md` exists, Xuan sign-off or block documented
- **Gate 2**: `gates/validate.sh` — Each submodule contract has ≥5 error cases
- **Gate 2.5** (Conditional): `gates/gate2.5.sh` — If Phanbien: `PHUC_MOC_JOINT_DESIGN.md` has FINAL DECISION

**ON FAIL Actions:**
- Gate 1.5 fail: Phuc SA responds to missing HIGH issues
- Gate 1.6 fail: Phuc SA supplements contract sections
- Gate 2 fail: Phuc SA adds error cases

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ All gates pass
- ✅ Xuan signs off `CONTRACT_DRAFT.md`
- ✅ All HIGH architecture issues resolved
- ✅ No contract drift (P2) penalties

**Handoff to Next Pipeline:**
- Route to **Pipeline 3 (Coding)**
- `DESIGN_FLOW.md` (running in parallel) receives `CONTRACT_DRAFT.md`

---

**L2 Cache Pre-Load:**
- `agents/core/phuc-sa.md` (Phuc SA)
- `agents/dev/quang-designer.md` (Quang)
- `agents/core/moc-arch-chal.md` (Moc)
- `agents/dev/lan-dev-fe.md` (Lan)
- `agents/core/xuan-spec-rev.md` (Xuan)
- `agents/BRAIN.md` (Dung PM)

**Token Count:** ~600 tokens
