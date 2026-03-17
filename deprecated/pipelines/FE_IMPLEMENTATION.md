# FE Implementation Pipeline: Biến Stitch HTML thành Production React

> **Status:** Standalone — chưa tích hợp vào MoE Router
> **Kết nối:** DESIGN_FLOW.md (Stages 1-6) → FE_IMPLEMENTATION.md (FE-P0 → FE-P9)
> **Scope:** Coding only. Design nằm trong DESIGN_FLOW.md.

> **L2 CACHE PRE-LOAD:**
> - `Lân Dev FE` → `agents/dev/lan-dev-fe.md`
> - `Minh FE-Arch-Chal` → `agents/dev/minh-fe-arch-chal.md`
> - `Trình FE-Tester` → `agents/dev/trinh-fe-tester.md`
> - `Huyền FE-QA` → `agents/dev/huyen-fe-qa.md`
> - `Quang Designer` → `agents/dev/quang-designer.md`
> - `Châu UX` → `agents/user/chau-pana-ux.md`
> - `Dũng PM` → `agents/BRAIN.md` (Synthesis)

---

## HARD GATE: Wireframe Check (BLOCKING)

> **NON-NEGOTIABLE:** Pipeline này KHÔNG ĐƯỢC bắt đầu nếu chưa có wireframe.

**Trước khi vào bất kỳ phase nào (kể cả FE-P0), agent PHẢI kiểm tra:**

```
CHECK 1: Wireframe tồn tại?
  - ASCII wireframe trong `docs/fe/wireframes/*.md` hoặc `docs/fe/WIREFRAMES.md`
  - HOẶC Stitch HTML trong `fe/stitch/**/*.html`
  - HOẶC DESIGN_FLOW.md Stage 6 = PASS (có design output)

CHECK 2: Wireframe cover đủ pages?
  - Mỗi page trong scope phải có ít nhất 1 wireframe (ASCII hoặc HTML)
```

**Nếu THIẾU wireframe → DỪNG NGAY. Không được code. Hành động:**

1. **HALT** — Thông báo: `"[FE-BLOCKED] Thiếu wireframe. Chuyển sang DESIGN_FLOW."`
2. **REDIRECT** — Gọi DESIGN_FLOW.md (Stages 1-6) hoặc ui-sketcher agent để tạo ASCII wireframe
3. **WAIT** — Chỉ tiếp tục FE pipeline khi wireframe đã có và được review

**Lý do:** Code không có wireframe = phát minh giao diện → rework, UX không nhất quán, lãng phí token.

### Wireframe Format & Usage Throughout Pipeline

Wireframe là **visual blueprint** xuyên suốt pipeline. Mỗi phase đều reference wireframe:

**Accepted formats:**
```
1. ASCII wireframe (*.md) — tạo bởi ui-sketcher hoặc Quang Designer
2. Stitch HTML (*.html) — interactive prototype
3. DESIGN_FLOW output — từ Stages 1-6
```

**ASCII wireframe mẫu (ví dụ Create Order page):**
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

**Wireframe PHẢI chứa:**
- Layout grid (columns, spacing)
- Field labels + input types (text, select, textarea, checkbox)
- Navigation flow (buttons, step indicators)
- Responsive breakpoints ghi chú (nếu có)
- User stories / interaction notes (hover, click, error states)

**Cách dùng wireframe trong từng phase:**

| Phase | Wireframe dùng để |
|-------|-------------------|
| **FE-P0** | Page Inventory: map 1:1 wireframe → pages cần build |
| **FE-P1** | Component Tree: extract components từ wireframe regions |
| **FE-P1.5** | Challenge: layout có responsive không? Component quá lớn? |
| **FE-P2** | Contracts: derive props interfaces từ wireframe fields |
| **FE-P3** | TDD: test cases từ wireframe interactions (click, submit, error) |
| **FE-P4** | Implementation: follow wireframe layout, KHÔNG tự phát minh |
| **FE-P5** | QA: so sánh rendered UI vs wireframe ≥90% match |

---

## Entry Modes

| Mode | Điều kiện | Wireframe | Skip |
|------|-----------|-----------|------|
| **Full flow** | DESIGN_FLOW Stage 6 PASS | Co (from DESIGN_FLOW) | Không skip |
| **Stitch-ready** | `fe/stitch/**/*.html` exists + `CONTRACT_DRAFT.md` finalized | Co (stitch HTML = wireframe) | Skip DESIGN_FLOW |
| **Wireframe-ready** | ASCII wireframe exists + `CONTRACT_DRAFT.md` finalized | Co (ASCII) | Skip DESIGN_FLOW |
| **Contract-only** | Chỉ có `CONTRACT_DRAFT.md`, KHÔNG wireframe | **BLOCKED** — phải tạo wireframe trước | N/A |

**ALWAYS:** `CONTRACT_DRAFT.md` phải tồn tại và đã chốt.
**ALWAYS:** Wireframe phải tồn tại — không ngoại lệ.

---

## Output (Exact Filenames)

| File | Tạo bởi | Phase |
|------|---------|-------|
| `docs/fe/FE_CONTEXT.md` | Lân | FE-P0 |
| `docs/fe/FE_ARCHITECTURE.md` | Lân | FE-P1 |
| `docs/fe/FE_ARCH_CHALLENGE.md` | Minh | FE-P1.5 |
| `docs/fe/FE_ARCH_RESPONSE.md` | Lân | FE-P1.5 |
| `docs/fe/FE_CONTRACTS.md` | Lân | FE-P2 |
| `tests/unit/**/*.spec.tsx` | Trình | FE-P3 |
| `tests/e2e/**/*.spec.ts` | Huyền | FE-P3 |
| `src/**/*.tsx`, `src/**/*.css` | Lân | FE-P4 |
| `docs/fe/FE_QA_REPORT.md` | Dũng PM | FE-P5 |

---

## FE-P0: Context & Inventory

| Property | Value |
|----------|-------|
| Goal | Catalog everything to build, map dependencies |
| Agent | Lân Dev FE (solo — no Nash Triad, collection phase) |
| Input | **Wireframe** (ASCII/Stitch/DESIGN_FLOW) + CONTRACT_DRAFT.md |
| Output | `docs/fe/FE_CONTEXT.md` |

**FE_CONTEXT.md bắt buộc 6 sections:**
1. **Wireframe Reference** — liệt kê tất cả wireframe files, format (ASCII/HTML), coverage per page
2. **Page Inventory** — tất cả pages cần build, map 1:1 với wireframe files
3. **Component Reuse Map** — reuse từ T0_07 vs tạo mới vs inline (derive từ wireframe regions)
4. **API Dependency Map** — mỗi page gọi API nào, map với CONTRACT_DRAFT.md endpoints
5. **State Management Plan** — server state (TanStack Query) vs client state (Zustand) vs URL state
6. **Entry Mode** — mode nào đang active (Full flow / Stitch-ready / Wireframe-ready)

**Gate FE-G0:** `FE_CONTEXT.md` exists, >=30 lines, có đủ 5 sections.

---

## FE-P1: Component Architecture

| Property | Value |
|----------|-------|
| Goal | Design component tree, routing, data flow |
| Thesis | Lân Dev FE |
| Output | `docs/fe/FE_ARCHITECTURE.md` |

**FE_ARCHITECTURE.md bắt buộc 6 sections:**
1. **Component Tree** — hierarchy: App Shell → Layout → Page → Feature components
2. **Routing Structure** — Next.js App Router file structure, route groups, layouts
3. **Data Fetching Strategy** — query key factory, staleTime/cacheTime per resource
4. **Shared State** — Zustand stores (nếu cần), cross-component communication
5. **Design Token Usage** — map stitch design tokens → Tailwind config / CSS variables
6. **Bundle Strategy** — lazy loading, dynamic imports, Server vs Client Components

**Gate FE-G1:** `FE_ARCHITECTURE.md` >=80 lines, có đủ 6 sections.

---

## FE-P1.5: Architecture Challenge

| Property | Value |
|----------|-------|
| Goal | Challenge FE architecture trước khi code |
| Anti-Thesis | Minh FE-Arch-Chal |
| Thesis (Response) | Lân Dev FE |
| Synthesis | Dũng PM |
| Output | `docs/fe/FE_ARCH_CHALLENGE.md` + `docs/fe/FE_ARCH_RESPONSE.md` |

**Minh challenge checklist:**
- Component quá lớn (>150 LOC predicted)?
- Prop drilling >3 levels?
- Client Component khi Server Component khả thi?
- Bundle bloat risk (heavy library import không tree-shaking)?
- State management overkill (Zustand cho data chỉ 1 component dùng)?
- Thiếu Error Boundary strategy?
- Thiếu loading/error states trong component tree?

**Gate FE-G1.5:** Cả 2 files tồn tại, tất cả HIGH issues có response.

---

## FE-P2: Component Contracts

| Property | Value |
|----------|-------|
| Goal | Define TypeScript interfaces trước khi code |
| Thesis | Lân Dev FE |
| Anti-Thesis | Quang (design token match) + Huyền (E2E testability) |
| Synthesis | Dũng PM |
| Output | `docs/fe/FE_CONTRACTS.md` |

**FE_CONTRACTS.md sections:**
1. **Component Props Interfaces** — mỗi component: `interface XxxProps { ... }`
2. **Hook Signatures** — `useOrders(params): UseQueryResult<Order[]>`
3. **Store Interfaces** — Zustand store shape + actions
4. **API Function Signatures** — map 1:1 với CONTRACT_DRAFT.md endpoints
5. **Route Params** — dynamic route params type definitions

**Anti-Thesis checks:**
- Quang: Design tokens map đúng trong props? Color/spacing constants khớp stitch?
- Huyền: Components có `data-testid`? Flows E2E-testable?

**Gate FE-G2:** `FE_CONTRACTS.md` >=50 lines, có TypeScript interfaces.

---

## FE-P3: TDD RED

| Property | Value |
|----------|-------|
| Goal | Viết tests TRƯỚC implementation — tất cả FAIL (RED) |
| Thesis | Trình FE-Tester (unit/component) + Huyền FE-QA (E2E) |
| Anti-Thesis | Cross-review lẫn nhau |
| Synthesis | Dũng PM |
| Output | `tests/unit/**/*.spec.tsx` + `tests/e2e/**/*.spec.ts` |

**Trình viết:**
- Component render tests (renders without crash)
- Interaction tests (click button → state change)
- Form validation tests (submit invalid → error shown)
- Hook tests (useOrders returns data, handles error)
- API integration tests (MSW mock → correct rendering)

**Huyền viết:**
- E2E critical flows (Playwright): create order wizard, order list filter, order detail nav
- Crawlee HTML integrity checks

**Cross-review:** Trình review Huyền E2E (overlap với unit?), Huyền review Trình unit (sufficient coverage?)

**Gate FE-G3:** >=5 test files, `npm test` runnable (tests FAIL = expected ở phase này).

---

## FE-P4: Implementation GREEN

| Property | Value |
|----------|-------|
| Goal | Convert stitch HTML → React, ALL tests pass |
| Thesis | Lân Dev FE |
| Anti-Thesis | Minh FE-Arch-Chal + ESLint + `tsc --noEmit` |
| Synthesis | Dũng PM |
| Output | `src/**/*.tsx`, `src/**/*.css` |

**Lân implementation rules:**
- Follow **wireframe** — layout, fields, navigation phải khớp wireframe. Không tự phát minh layout
- Follow `FE_CONTRACTS.md` — không thay đổi interfaces không approval
- Follow `CONTRACT_DRAFT.md` — API calls match endpoint, envelope parsing đúng
- Component <=150 LOC, extract nếu vượt
- No `any` type, strict TypeScript

**Minh review:**
- [BLOCKING]: XSS, bundle bloat, contract drift, broken hooks rules
- [NON-BLOCKING]: naming convention, minor refactor suggestion

**Gate FE-G4 (heaviest):**
- `npx tsc --noEmit` PASS
- `npm test` ALL PASS
- `npm run build` PASS
- No TODO/FIXME trong `src/`

---

## FE-P5: Visual QA & Verify

| Property | Value |
|----------|-------|
| Goal | Verify visual fidelity, accessibility, performance |
| Thesis | Huyền (E2E + Crawlee) + Quang (design fidelity) + Châu (UX flow) |
| Anti-Thesis | Lân Dev FE (defend against bug list) |
| Synthesis | Dũng PM |
| Output | `docs/fe/FE_QA_REPORT.md` |

**Checks:**

| Check | Agent | Method | Threshold |
|-------|-------|--------|-----------|
| Visual fidelity vs wireframe | Quang | Side-by-side comparison (wireframe vs rendered) | >=90% match |
| WCAG AA accessibility (code-level) | Quang + Huyền | axe-core + keyboard nav on rendered UI | 0 critical violations |
| E2E critical flows | Huyền | Playwright test suite | 100% pass |
| Chaos testing | Huyền | gremlins.js | App does not crash |
| UX flow validation | Châu | Domain expert walkthrough | Flows match TMS domain |
| Bundle size | Script | `next/bundle-analyzer` | < threshold (TBD per module) |
| Lighthouse score | Script | Lighthouse CI | > 80 performance |

**Nash flow:**
- Thesis (Huyền+Quang+Châu) produce bug list với severity + evidence
- Anti-Thesis (Lân) confirm valid hoặc defend với evidence per bug
- Synthesis (Dũng) viết `FE_QA_REPORT.md` với VERDICT = PASS/FAIL

**Gate FE-G5 (hybrid):**
- Script: Bundle size pass, Lighthouse >80
- Document: Visual >=90%, WCAG AA, UX flows OK, VERDICT=PASS

---

## FE-P9: Complete

| Property | Value |
|----------|-------|
| Goal | Git commit, mark done |
| Agent | Dũng PM |
| Action | Targeted `git add` (never `git add .`), commit message convention, update STATE.md |

**Gate FE-G9:** Targeted git commit thành công.

---

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| FE-G4 | `gates/validate.sh` | tsc + tests + build + no TODO/FIXME | Lân fix và re-run |
| FE-G5 | `gates/qa.sh` | SAST + test distribution + smoke | Lân fix bugs, re-verify |
| FE-G9 | `gates/commit.sh` | Pre-validate → exclude secrets → targeted commit | Dũng retry commit |

> **Doc quality (FE-P0→P2):** Validated by Nash Triad LLM review, not grep scripts.
> **Security:** Run `gates/security.sh` before deploy.
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

## Nguyên Tắc

1. **CONTRACT_DRAFT.md là nguồn sự thật cho API** — API calls phải khớp 100%, không fake endpoint
2. **Wireframe là nguồn sự thật cho UI** — layout, fields, navigation phải khớp wireframe. Không tự phát minh giao diện. Nếu thiếu wireframe → HALT → gọi DESIGN_FLOW
3. **TDD bắt buộc** — Trình viết tests RED trước, Lân implement GREEN sau
4. **Component <=150 LOC** — vượt phải extract, không ngoại lệ
5. **No `any` type** — strict TypeScript, mọi interface phải define trong FE_CONTRACTS.md
6. **Accessibility (code-level)** — WCAG 2.1 AA trên rendered UI (axe-core, keyboard nav, ARIA). Design-level A11y đã check trong DESIGN_FLOW Stage 3-4
7. **Targeted git add** — không bao giờ `git add .` hoặc `git add -A`
8. **Nash Triad mọi phase** — trừ FE-P0 (collection) và FE-P9 (commit)

---

*FE Implementation Pipeline | Standalone | Last Updated: 2026-03-08*
