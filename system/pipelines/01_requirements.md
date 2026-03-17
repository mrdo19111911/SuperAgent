# Pipeline 01: Requirements & Research

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- [C1] Business context empty
- [C2] Documentation empty or contradictory
- New project with no SPEC.md

**Conditions:**
- MoE Router detects missing requirements
- If complex domain (Blockchain, EDI, IoT, GenAI): Run `00_RESEARCH.md` first, attach `docs/RESEARCH/SUMMARY.md`

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- **Dũng PM**: Business context, functional requirements, stakeholder coordination
- **Châu Pana UX**: User research, user journey mapping, pain point identification

**Anti-Thesis (Challengers):**
- **Conan Req-Aud**: Logic gaps, business contradictions, edge case detection, feasibility challenges

**Synthesis (Judge):**
- **User/PO**: Final approval authority, dispute resolution, SPEC sign-off

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- Dũng PM interviews User/PO, documents vision and constraints
- Châu UX maps user journeys, identifies top-10 pain points

**Phase C - Execute:**
- Dũng PM drafts `CONTEXT.md` (vision, scope, stakeholders, constraints)
- Châu UX adds user stories to `SPEC.md`
- Dũng PM finalizes `SPEC.md` with functional requirements + acceptance criteria per story

**Phase D - Functional Verification:**
- Conan audits `SPEC.md` for logic holes, business contradictions, missing edge cases
- Conan challenges measurability: "Can this acceptance criteria be measured?"
- Conan MUST provide counter-proposals with rationale for each issue

**Phase E - Synthesis Review:**
- User/PO reads Thesis vs Anti-Thesis debate
- User/PO decides: accept, reject, or request revisions per dispute point
- User/PO signs off `SPEC.md` (adds `STATUS: APPROVED` + date)
- Scoring per `system/SCORING_RULES.md`

*Minimum phases: A→C→D→E (Requirements pipeline uses 4 phases)*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `docs/CONTEXT.md`: Vision, scope, stakeholders, constraints (≥30 lines)
- `docs/SPEC.md`: Functional requirements, ≥3 user stories, acceptance criteria, REQ-PB traceability, STATUS: APPROVED

**Optional Artifacts:**
- `docs/RESEARCH/SUMMARY.md`: If complex domain requires research pipeline first

**LEDGER Entries:**
- Thesis/Anti-Thesis debate scoring
- User/PO approval decision
- P0-P4 issues tracked in `artifacts/{task}/LEDGER.md`

**Note:** Wireframes NOT in this pipeline — see `DESIGN_FLOW.md` (runs parallel with Pipeline 2).

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 0**: Nash Triad LLM review — `CONTEXT.md` exists, ≥30 lines
- **Gate 0.5** (Conditional): If complex domain — `RESEARCH/SUMMARY.md` exists (run Pipeline 00 first)
- **Gate 1**: Nash Triad LLM review — `SPEC.md` has ≥3 user stories, acceptance criteria, REQ-PB traceability

**ON FAIL Actions:**
- Gate 0 fail: Dũng PM supplements CONTEXT.md
- Gate 0.5 fail: Run Pipeline 00 (Research) before continuing
- Gate 1 fail: Conan/Dũng PM fix gaps

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ Gate 1 PASS
- ✅ User/PO signs off SPEC.md
- ✅ `CONTEXT.md` and `SPEC.md` created with required content
- ✅ No P0/P1 issues in debate LEDGER

**Handoff to Next Pipeline:**
- Route to **Pipeline 2 (Architecture)**
- Trigger **DESIGN_FLOW.md** in parallel for FE wireframes

---

**L2 Cache Pre-Load:**
- `agents/BRAIN.md` + `agents/core/dung-manager.md` (Dũng PM)
- `agents/user/chau-pana-ux.md` (Châu UX)
- `agents/core/conan-req-aud.md` (Conan)
- `agents/user/user-agent.md` (User/PO)
