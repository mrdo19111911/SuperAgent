<!-- CUSTOM: 7 stages, 4-round wireframe debate, parallel contract discovery, iterative feedback loops -->

# DESIGN_FLOW: No Code Before Design

> **Philosophy:** No code before design. No design before research.
> **Scope:** Design only — Research → Wireframe → Stitch HTML → QA. No React code.
> **Position:** Runs AFTER Pipeline 1 (Gate 1 PASS), PARALLEL with Pipeline 2
> **Hand-off:** Stage 6 PASS → `FE_IMPLEMENTATION.md` for React code
> **Details:** [ram/pipelines/design_flow_details.md](../../ram/pipelines/design_flow_details.md)

---

## HARD GATE: CONTRACT_DRAFT Check (BLOCKING)

**Before ANY stage, CHECK:**
```
✓ CONTRACT_DRAFT.md exists for target module?
  - Location: <module>/docs/CONTRACT_DRAFT.md
  - Must have 8 sections: API, DTOs, Mock, Errors, Events, Idempotency, Sign-off, ...
```

### If NOT EXIST → Stage 0: Contract Discovery (Nash Triad)

**Stop design. Create CONTRACT_DRAFT.md first.**

| Step | Agent | Action | Output |
|------|-------|--------|--------|
| 1 | Phúc SA (Thesis) + Mộc (Anti-Thesis) | Read code PARALLEL, NO COMMUNICATION | `PHUC_CONTRACT_DRAFT.md` + `MOC_CONTRACT_DRAFT.md` |
| 2 | Dũng PM (Synthesis) | Merge + resolve conflicts | `CONTRACT_DRAFT.md` (final) |
| 3 | Gate | Check 8 sections + Sign-off | PASS → Stage 1 / FAIL → retry |

### If EXISTS → Skip Stage 0, start Stage 1

---

## Flow

```
Stage 0: Contract Check   → CONTRACT_DRAFT.md (if missing: Phúc+Mộc→Dũng)  (skip if exists)
Stage 1: Research         → USER_RESEARCH.md + COMPETITIVE_ANALYSIS.md      (4-6h)
Stage 2: Workshop         → DESIGN_DECISIONS.md + TMS_GLOSSARY.md           (2-3h)
Stage 3: Wireframe Debate → ASCII_UX_MASTER.md (4-Round Debate)             (4-6h)
Stage 4: Design Review    → DESIGN_REVIEW.md VERDICT=PASS/FAIL              (1h)
Stage 5: Stitch AI        → stitch-output/*.html (Google Stitch)            (2-3h)
Stage 6: HTML QA          → HTML Integrity Report (Crawlee)                 (1h)
         ↓
         HAND-OFF → FE_IMPLEMENTATION.md (FE-P0 → FE-P9) for React code
         (Condition: Stage 6 PASS + CONTRACT_DRAFT.md finalized)
```

---

## Stages

| Stage | Thesis | Anti-Thesis | Synthesis | Output | Gate |
|-------|--------|-------------|-----------|--------|------|
| **0 (if needed)** | Phúc SA | Mộc | Dũng | `CONTRACT_DRAFT.md` | 8 sections + Sign-off |
| **1** | Quang + Châu | — | — | `USER_RESEARCH.md` | ≥3 personas + pain points |
| **2** | Quang + Châu + Lân + Huyền | — | Dũng | `DESIGN_DECISIONS.md` + `TMS_GLOSSARY.md` | Dũng approve |
| **3** | Quang (R1-3) + Châu (R2) + Lân (R3) | — | Huyền (R4 gate) | `ASCII_UX_MASTER.md` + `COMPONENT_SPEC.md` + `design-tokens.json` | VERDICT=PASS |
| **4** | Quang | Châu + Lân + Huyền | Dũng | `DESIGN_REVIEW.md` | All stakeholders ✅ |
| **5** | Quang | — | — | `stitch-output/*.html` | Components + Tokens + A11y + Responsive |
| **6** | Huyền | — | — | `HTML_INTEGRITY_REPORT.md` | Bugs < 5 |

---

## Output Files

| Stage | File | Created By |
|-------|------|-----------|
| 0 | `CONTRACT_DRAFT.md` (if missing) | Phúc SA + Mộc → Dũng PM merge |
| 1 | `docs/design/USER_RESEARCH.md` | Quang + Châu |
| 2 | `docs/design/DESIGN_DECISIONS.md`, `TMS_GLOSSARY.md` | Quang + Châu + Lân + Huyền |
| 3 | `docs/design/ASCII_UX_MASTER.md`, `COMPONENT_SPEC.md`, `design-tokens.json` | Quang (R1) → debate → Huyền (gate R4) |
| 4 | `docs/design/DESIGN_REVIEW.md` VERDICT | Dũng PM |
| 5 | `stitch-output/*.html` | Quang (Stitch AI) |
| 6 | `docs/design/HTML_INTEGRITY_REPORT.md` | Huyền (Crawlee) |

---

## Stage 3: Wireframe Debate (4 Rounds)

R1 (Quang) → ASCII wireframe + API mapping | R2 (Châu) → Domain challenge | R3 (Lân) → Tech + Contract challenge | R4 (Huyền) → VERDICT

**BLOCKING:** Any `❌ NO API` in mapping table → Stage 4 FAIL. Details in RAM.

---

## Principles

1. **Design tokens first** — `design-tokens.json` before Stitch prompt
2. **ASCII → Stitch** — Stitch prompt from `ASCII_UX_MASTER.md`, no improvisation
3. **CONTRACT_DRAFT.md constrains design** — Every wireframe element with action must map to API endpoint. No features BE lacks API for
4. **DESIGN_FLOW doesn't code React** — Stage 6 PASS → hand-off to `FE_IMPLEMENTATION.md`
5. **Accessibility from start (design-level)** — WCAG 2.1 AA on wireframe + Stitch. Code-level A11y in FE_IMPLEMENTATION.md FE-P5
6. **Mobile-first** — 3 breakpoints: 375 / 768 / 1440px

---

*Last Updated: 2026-03-17 | Custom pipeline v2.0 (compressed)*
