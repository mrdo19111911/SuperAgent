# Design Flow Pipeline - Detailed Reference

## Stage 0: Contract Discovery (Nash Triad)

**When CONTRACT_DRAFT.md missing → Run this stage:**

```
Step 1: Phúc SA (Thesis) + Mộc (Anti-Thesis) — PARALLEL, NO COMMUNICATION
        ├── Phúc SA:  Read entire module source code → write PHUC_CONTRACT_DRAFT.md
        │             Focus: API endpoints, DTOs, events, happy path
        └── Mộc:      Read entire module source code → write MOC_CONTRACT_DRAFT.md
                      Focus: Edge cases, error handling, security gaps, missing endpoints

Step 2: Dũng PM (Synthesis)
        ├── Read both drafts
        ├── Merge into official CONTRACT_DRAFT.md
        ├── Resolve conflicts (Phúc says endpoint X, Mộc says not needed → Dũng decides)
        └── Ensure 8 sections per Agent_v3 standard

Step 3: Gate — CONTRACT_DRAFT.md exists + 8 sections + Sign-off
        → PASS: Continue DESIGN_FLOW Stage 1
        → FAIL: Return to Step 1
```

**No-Trust principle:**
- Phúc and Mộc read code **independently** — no sharing findings before submitting drafts
- Each submits separate draft — Dũng PM is the only one seeing both
- If 2 drafts conflict >30% endpoints → Dũng召集 debate before merge
- Output: 3 files → `PHUC_CONTRACT_DRAFT.md` + `MOC_CONTRACT_DRAFT.md` + `CONTRACT_DRAFT.md` (final)

**Roles:**

| Agent | Role | Input | Output |
|-------|------|-------|--------|
| Phúc SA | Thesis — design contract from code | Source code + schema.prisma | `PHUC_CONTRACT_DRAFT.md` |
| Mộc Arch-Chal | Anti-Thesis — challenge + supplement | Source code + schema.prisma | `MOC_CONTRACT_DRAFT.md` |
| Dũng PM | Synthesis — merge + resolve conflicts | 2 drafts | `CONTRACT_DRAFT.md` (final) |

---

## Stage 3: ASCII Wireframe Debate — 4 Rounds

> **Mandatory input:** If `CONTRACT_DRAFT.md` exists (Pipeline 2 complete or running parallel), Quang MUST read before drawing wireframe. If not yet available, mark "[CONTRACT PENDING]" on each wireframe element needing API.

```
Round 1 (Quang)  → Draft ASCII wireframe + component list + API mapping table
Round 2 (Châu)   → Domain challenge: "TMS term WRONG / Flow missing step X"
Round 3 (Lân)    → Tech + Contract challenge:
                    - "Does this component exist in T0_07?"
                    - "Which API endpoint in CONTRACT_DRAFT.md supports this action?"
                    - "Wireframe element X has no corresponding API → flag DESIGN_GAP"
Round 4 (Huyền)  → Zero-Defect Check → VERDICT=PASS/FAIL
```

**Round 1 mandatory API Mapping Table:**
```
| Wireframe Element      | User Action        | API Endpoint (from CONTRACT_DRAFT.md)     | Status       |
|------------------------|--------------------|-------------------------------------------|--------------|
| [Create Order] button  | Click → submit     | POST /api/v1/orders                       | ✅ Mapped    |
| [Search] input         | Type → filter      | GET /api/v1/orders?search=                | ✅ Mapped    |
| [Export PDF] button    | Click → download   | ???                                       | ❌ NO API    |
```

> If any element has `❌ NO API` → Round 3 Lân MUST flag, Dũng PM decides: remove element or request BE to add API.

Output: `ASCII_UX_MASTER.md` — single source for Stage 5 Stitch prompt.

---

## Stage 4: Design Review Checklist

**Châu:** Terminology correct? Flow matches TMS standard? Pain points addressed sufficiently?
**Lân:** Components available (`@stmai/ui-components`)? APIs in CONTRACT_DRAFT.md cover all wireframe actions? Timeline realistic?
**Huyền:** WCAG 2.1 AA? Keyboard nav? ARIA labels? Error messages clear?
**Dũng:** Correct MVP scope? Design system reusable for other modules? API Mapping Table has no `❌ NO API`?

> **BLOCKING:** If API Mapping Table still has element `❌ NO API` and not resolved → DESIGN_REVIEW VERDICT=FAIL. Cannot proceed to Stage 5.

---

## Stage Roles Matrix

| Stage | Phúc SA | Mộc | Quang | Châu UX | Lân Dev | Huyền FE-QA | Dũng PM |
|-------|:-------:|:---:|:-----:|:-------:|:-------:|:-----------:|:-------:|
| 0 Contract | ✅ Thesis | ✅ Anti-Thesis | — | — | — | — | ✅ **Synthesis** |
| 1 Research | — | — | ✅ Lead | ✅ Domain | — | — | — |
| 2 Workshop | — | — | ✅ | ✅ Domain | ✅ Feasibility | ✅ A11y | ✅ Facilitate |
| 3 Debate | — | — | ✅ Round 1-3 | ✅ Round 1-3 | ✅ Round 1-3 | ✅ **Gate R4** | — |
| 4 Review | — | — | ✅ Present | ✅ UX/Domain | ✅ Tech | ✅ A11y | ✅ **Approve** |
| 5 Stitch | — | — | ✅ Lead | — | — | — | — |
| 6 HTML QA | — | — | — | — | — | ✅ Lead | — |

---

## Principles

1. **Design tokens first** — `design-tokens.json` must exist before writing Stitch prompt
2. **ASCII → Stitch** — Stitch prompt written from `ASCII_UX_MASTER.md`, no improvised layout
3. **CONTRACT_DRAFT.md constrains design** — Every wireframe element with user action must map to API endpoint in CONTRACT_DRAFT.md. Don't draw features BE has no API for
4. **DESIGN_FLOW doesn't code React** — Stage 6 PASS → hand-off to `FE_IMPLEMENTATION.md`. React code is FE pipeline responsibility
5. **Accessibility from start (design-level)** — WCAG 2.1 AA check on wireframe + Stitch HTML. Code-level A11y check in FE_IMPLEMENTATION.md FE-P5
6. **Mobile-first** — 3 breakpoints: 375 / 768 / 1440px
