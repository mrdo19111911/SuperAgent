# FE Implementation Pipeline - Detailed Reference

## Wireframe Format & Usage

**ASCII wireframe example (Create Order page):**
```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Orders          Create New Order             │
├─────────────────────────────────────────────────────────┤
│  ① Basic ──── ② Items ──── ③ Routing ──── ④ Review     │
│  [●]          [ ]          [ ]            [ ]           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │ Customer ID *        │ │ Service Type         │       │
│  │ [_______________]    │ │ [▼ Select...]        │       │
│  └─────────────────────┘ └─────────────────────┘       │
│  ┌─────────────────────┐ ┌─────────────────────┐       │
│  │ Priority             │ │ Incoterm             │       │
│  │ [▼ Normal       ]    │ │ [▼ Select...]        │       │
│  └─────────────────────┘ └─────────────────────┘       │
│  ┌──────────────────────────────────────────────┐       │
│  │ Special Instructions                          │       │
│  │ [                                            ]│       │
│  │ [                                            ]│       │
│  └──────────────────────────────────────────────┘       │
├─────────────────────────────────────────────────────────┤
│  [Cancel]                              [Next →]         │
└─────────────────────────────────────────────────────────┘
```

**Wireframe MUST contain:**
- Layout grid (columns, spacing)
- Field labels + input types (text, select, textarea, checkbox)
- Navigation flow (buttons, step indicators)
- Responsive breakpoints notes (if applicable)
- User stories / interaction notes (hover, click, error states)

**Wireframe usage per phase:**

| Phase | Wireframe used for |
|-------|-------------------|
| **FE-P0** | Page Inventory: map 1:1 wireframe → pages to build |
| **FE-P1** | Component Tree: extract components from wireframe regions |
| **FE-P1.5** | Challenge: is layout responsive? Component too large? |
| **FE-P2** | Contracts: derive props interfaces from wireframe fields |
| **FE-P3** | TDD: test cases from wireframe interactions (click, submit, error) |
| **FE-P4** | Implementation: follow wireframe layout, NO improvisation |
| **FE-P5** | QA: compare rendered UI vs wireframe ≥90% match |

---

## Phase Details

### FE-P0: Context & Inventory (Solo - No Nash Triad)

**FE_CONTEXT.md mandatory 6 sections:**
1. **Wireframe Reference** — list all wireframe files, format (ASCII/HTML), coverage per page
2. **Page Inventory** — all pages to build, map 1:1 with wireframe files
3. **Component Reuse Map** — reuse from T0_07 vs create new vs inline (derive from wireframe regions)
4. **API Dependency Map** — each page calls which APIs, map with CONTRACT_DRAFT.md endpoints
5. **State Management Plan** — server state (TanStack Query) vs client state (Zustand) vs URL state
6. **Entry Mode** — which mode is active (Full flow / Stitch-ready / Wireframe-ready)

### FE-P1: Component Architecture

**FE_ARCHITECTURE.md mandatory 6 sections:**
1. **Component Tree** — hierarchy: App Shell → Layout → Page → Feature components
2. **Routing Structure** — Next.js App Router file structure, route groups, layouts
3. **Data Fetching Strategy** — query key factory, staleTime/cacheTime per resource
4. **Shared State** — Zustand stores (if needed), cross-component communication
5. **Design Token Usage** — map stitch design tokens → Tailwind config / CSS variables
6. **Bundle Strategy** — lazy loading, dynamic imports, Server vs Client Components

### FE-P1.5: Architecture Challenge

**Minh challenge checklist:**
- Component too large (>150 LOC predicted)?
- Prop drilling >3 levels?
- Client Component when Server Component feasible?
- Bundle bloat risk (heavy library import without tree-shaking)?
- State management overkill (Zustand for data only 1 component uses)?
- Missing Error Boundary strategy?
- Missing loading/error states in component tree?

### FE-P2: Component Contracts

**FE_CONTRACTS.md sections:**
1. **Component Props Interfaces** — each component: `interface XxxProps { ... }`
2. **Hook Signatures** — `useOrders(params): UseQueryResult<Order[]>`
3. **Store Interfaces** — Zustand store shape + actions
4. **API Function Signatures** — map 1:1 with CONTRACT_DRAFT.md endpoints
5. **Route Params** — dynamic route params type definitions

**Anti-Thesis checks:**
- Quang: Design tokens map correctly in props? Color/spacing constants match stitch?
- Huyền: Components have `data-testid`? Flows E2E-testable?

### FE-P3: TDD RED

**Trình writes:**
- Component render tests (renders without crash)
- Interaction tests (click button → state change)
- Form validation tests (submit invalid → error shown)
- Hook tests (useOrders returns data, handles error)
- API integration tests (MSW mock → correct rendering)

**Huyền writes:**
- E2E critical flows (Playwright): create order wizard, order list filter, order detail nav
- Crawlee HTML integrity checks

**Cross-review:** Trình reviews Huyền E2E (overlap with unit?), Huyền reviews Trình unit (sufficient coverage?)

### FE-P4: Implementation GREEN

**Lân implementation rules:**
- Follow **wireframe** — layout, fields, navigation must match wireframe. No improvised layout
- Follow `FE_CONTRACTS.md` — no interface changes without approval
- Follow `CONTRACT_DRAFT.md` — API calls match endpoint, envelope parsing correct
- Component <=150 LOC, extract if exceeded
- No `any` type, strict TypeScript

**Minh review:**
- [BLOCKING]: XSS, bundle bloat, contract drift, broken hooks rules
- [NON-BLOCKING]: naming convention, minor refactor suggestion

### FE-P5: Visual QA & Verify

**Checks:**

| Check | Agent | Method | Threshold |
|-------|-------|--------|-----------|
| Visual fidelity vs wireframe | Quang | Side-by-side comparison (wireframe vs rendered) | ≥90% match |
| WCAG AA accessibility (code-level) | Quang + Huyền | axe-core + keyboard nav on rendered UI | 0 critical violations |
| E2E critical flows | Huyền | Playwright test suite | 100% pass |
| Chaos testing | Huyền | gremlins.js | App does not crash |
| UX flow validation | Châu | Domain expert walkthrough | Flows match TMS domain |
| Bundle size | Script | `next/bundle-analyzer` | < threshold (TBD per module) |
| Lighthouse score | Script | Lighthouse CI | > 80 performance |

**Nash flow:**
- Thesis (Huyền+Quang+Châu) produce bug list with severity + evidence
- Anti-Thesis (Lân) confirm valid or defend with evidence per bug
- Synthesis (Dũng) writes `FE_QA_REPORT.md` with VERDICT = PASS/FAIL

---

## Entry Modes

| Mode | Condition | Wireframe | Skip |
|------|-----------|-----------|------|
| **Full flow** | DESIGN_FLOW Stage 6 PASS | Yes (from DESIGN_FLOW) | No skip |
| **Stitch-ready** | `fe/stitch/**/*.html` exists + `CONTRACT_DRAFT.md` finalized | Yes (stitch HTML = wireframe) | Skip DESIGN_FLOW |
| **Wireframe-ready** | ASCII wireframe exists + `CONTRACT_DRAFT.md` finalized | Yes (ASCII) | Skip DESIGN_FLOW |
| **Contract-only** | Only `CONTRACT_DRAFT.md`, NO wireframe | **BLOCKED** — must create wireframe first | N/A |

**ALWAYS:** `CONTRACT_DRAFT.md` must exist and finalized.
**ALWAYS:** Wireframe must exist — no exceptions.

---

## Agent Participation Matrix

```
Phase          | Lan  | Minh | Trinh | Huyen | Quang | Chau | Dung |
---------------+------+------+-------+-------+-------+------+------+
FE-P0 Context  | T    |      |       |       |       |      |      |
FE-P1 Arch     | T    |      |       |       |       |      |      |
FE-P1.5 Chal   | Resp | AT   |       |       |       |      | S    |
FE-P2 Contract | T    |      |       | AT    | AT    |      | S    |
FE-P3 TDD RED  |      |      | T     | T     |       |      | S    |
FE-P4 GREEN    | T    | AT   |       |       |       |      | S    |
FE-P5 QA       | AT   |      |       | T     | T     | T    | S    |
FE-P9 Done     |      |      |       |       |       |      | T    |

T = Thesis | AT = Anti-Thesis | S = Synthesis | Resp = Response to challenge
```

---

## Principles

1. **CONTRACT_DRAFT.md is source of truth for API** — API calls must match 100%, no fake endpoints
2. **Wireframe is source of truth for UI** — layout, fields, navigation must match wireframe. No improvised interfaces. If wireframe missing → HALT → call DESIGN_FLOW
3. **TDD mandatory** — Trình writes RED tests first, Lân implements GREEN after
4. **Component <=150 LOC** — exceeding must extract, no exceptions
5. **No `any` type** — strict TypeScript, all interfaces must define in FE_CONTRACTS.md
6. **Accessibility (code-level)** — WCAG 2.1 AA on rendered UI (axe-core, keyboard nav, ARIA). Design-level A11y already checked in DESIGN_FLOW Stage 3-4
7. **Targeted git add** — never `git add .` or `git add -A`
8. **Nash Triad every phase** — except FE-P0 (collection) and FE-P9 (commit)
