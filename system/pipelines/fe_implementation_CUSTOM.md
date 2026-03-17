<!-- CUSTOM: 10 phases, 3 entry modes, non-linear dependencies, complex wireframe logic -->

# FE Implementation: Wireframe → React Code

> **L2 PRE-LOAD:** lan-dev-fe, minh-fe-arch-chal, trinh-fe-tester, huyen-fe-qa, quang-designer, chau-pana-ux, BRAIN(synthesis)
> **Details:** [ram/pipelines/fe_implementation_details.md](../../ram/pipelines/fe_implementation_details.md)

---

## HARD GATE: Wireframe Check (BLOCKING)

**Before ANY phase, CHECK:**
```
✓ Wireframe exists? (ASCII *.md OR Stitch *.html OR DESIGN_FLOW Stage 6 PASS)
✓ Wireframe covers all pages in scope?
```

**If MISSING → HALT:**
1. **HALT** — `"[FE-BLOCKED] Missing wireframe. Redirect to DESIGN_FLOW."`
2. **REDIRECT** — Call DESIGN_FLOW.md (Stages 1-6) or ui-sketcher agent
3. **WAIT** — Continue FE pipeline only when wireframe exists and reviewed

**Rationale:** Code without wireframe = invented UI → rework, inconsistent UX, wasted tokens.

---

## Entry Modes

| Mode | Condition | Wireframe | Skip |
|------|-----------|-----------|------|
| **Full flow** | DESIGN_FLOW Stage 6 PASS | ✓ (from DESIGN_FLOW) | No skip |
| **Stitch-ready** | `fe/stitch/**/*.html` + `CONTRACT_DRAFT.md` | ✓ (stitch HTML) | Skip DESIGN_FLOW |
| **Wireframe-ready** | ASCII wireframe + `CONTRACT_DRAFT.md` | ✓ (ASCII) | Skip DESIGN_FLOW |
| **Contract-only** | Only `CONTRACT_DRAFT.md` | **BLOCKED** | N/A |

**ALWAYS:** `CONTRACT_DRAFT.md` + Wireframe must exist.

---

## Phases

| Phase | Thesis | Anti-Thesis | Synthesis | Output | Gate |
|-------|--------|-------------|-----------|--------|------|
| **FE-P0** | Lân (solo) | — | — | `FE_CONTEXT.md` (6 sections) | ≥30 lines, 6 sections |
| **FE-P1** | Lân | — | — | `FE_ARCHITECTURE.md` (6 sections) | ≥80 lines, 6 sections |
| **FE-P1.5** | Lân (response) | Minh | Dũng | `FE_ARCH_CHALLENGE.md` + `_RESPONSE.md` | All HIGH issues resolved |
| **FE-P2** | Lân | Quang + Huyền | Dũng | `FE_CONTRACTS.md` (TS interfaces) | ≥50 lines, TS interfaces |
| **FE-P3** | Trình + Huyền | Cross-review | Dũng | `tests/**/*.spec.{tsx,ts}` | ≥5 files, tests RED |
| **FE-P4** | Lân | Minh + ESLint | Dũng | `src/**/*.{tsx,css}` | tsc + tests + build PASS |
| **FE-P5** | Huyền + Quang + Châu | Lân | Dũng | `FE_QA_REPORT.md` VERDICT | Visual ≥90%, WCAG AA, E2E 100% |
| **FE-P9** | Dũng | — | — | Git commit | Targeted commit success |

---

## Output Files

| File | Created By | Phase |
|------|-----------|-------|
| `docs/fe/FE_CONTEXT.md` | Lân | FE-P0 |
| `docs/fe/FE_ARCHITECTURE.md` | Lân | FE-P1 |
| `docs/fe/FE_ARCH_CHALLENGE.md` + `_RESPONSE.md` | Minh + Lân | FE-P1.5 |
| `docs/fe/FE_CONTRACTS.md` | Lân | FE-P2 |
| `tests/unit/**/*.spec.tsx` | Trình | FE-P3 |
| `tests/e2e/**/*.spec.ts` | Huyền | FE-P3 |
| `src/**/*.tsx`, `src/**/*.css` | Lân | FE-P4 |
| `docs/fe/FE_QA_REPORT.md` | Dũng | FE-P5 |

---

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| **FE-G4** | `gates/validate.sh` | tsc + tests + build + no TODO/FIXME | Lân fix, re-run |
| **FE-G5** | `gates/qa.sh` | SAST + test distribution + smoke | Lân fix bugs, re-verify |
| **FE-G9** | `gates/commit.sh` | Pre-validate → targeted commit | Dũng retry |

---

## Principles

1. **CONTRACT_DRAFT.md = API truth** — 100% match, no fake endpoints
2. **Wireframe = UI truth** — layout/fields/nav must match. No improvisation. Missing → HALT → DESIGN_FLOW
3. **TDD mandatory** — RED tests first (FE-P3), GREEN impl after (FE-P4)
4. **Component ≤150 LOC** — extract if exceeded
5. **No `any` type** — strict TS, all interfaces in FE_CONTRACTS.md
6. **WCAG 2.1 AA (code-level)** — axe-core, keyboard nav, ARIA on rendered UI
7. **Targeted git add** — never `git add .`
8. **Nash Triad** — all phases except FE-P0 (solo) and FE-P9 (commit)

---

*Last Updated: 2026-03-17 | Custom pipeline v2.0 (compressed)*
