---
name: smartlog-ux-guide
version: 3.0.0
description: |
  Smartlog Ecosystem UX audit and compliance skill. Use when reviewing UI/UX for TMS, WMS, OMS,
  Supply Chain Planning, Marketplace, or Control Tower. Triggers on: UX audit, design review,
  accessibility check, workflow navigation, exception dashboard, AI governance, HEART metrics,
  dark mode, or any Smartlog UI compliance verification. Enforces Smartlog UX Guiding Principles
  v2.3 + Implementation Roadmap as production standards.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - TodoWrite
tags:
  - ux-audit
  - smartlog
  - b2b-logistics
  - accessibility
  - wcag
  - compliance
---

# Smartlog UI Guide
## UX Audit & Compliance for B2B Logistics

**Target:** TMS · WMS · OMS · Supply Chain Planning · Marketplace · Control Tower

**Users:** 60% are 45+ with vision issues, 4h max training, <5 support tickets/user/30d

**Goal:** 10-min first success, 30-50% faster decisions, 40-60% less support

---

## Quick Reference — 8 Core Principles

Before auditing ANY screen, check these 8 principles:

| # | Principle | Quick Check | Block if FAIL |
|---|-----------|-------------|---------------|
| 1 | **Workflow-First Navigation** | Nav follows Order→Plan→Execute→Track (NOT database menu) | Yes |
| 2 | **Exception-First Dashboard** | Problems shown first, not KPI cards | Yes |
| 3 | **One-Screen Operations** | Core tasks complete in <3 clicks on 1 screen | Yes |
| 4 | **Visual-First, Data-Second** | Status colors + icon/text backup (8% men colorblind) | Yes |
| 5 | **System-Suggest, Human-Approve** | AI shows Approve/Adjust/Reject (never auto-execute high-risk) | Yes |
| 6 | **Progressive Complexity** | New users see Essential tier only (Week 1-2) | No (warn) |
| 7 | **Cross-Platform Consistency** | Uses shared component library (not custom one-off) | Yes |
| 8 | **Error Recovery UX** | Destructive actions have Undo or Soft Delete (30d) | Yes |

*See `references/core-principles.md` for detailed DO/DON'T examples and implementation patterns*

---

## Architecture — Read Only What You Need

This skill is organized by audit task. Read ONLY the reference file you need:

| You are auditing... | Read this reference | Contains |
|---------------------|---------------------|----------|
| Colors, typography, spacing, tokens | `references/design-tokens.md` | 6 status colors, dark mode, WCAG contrast |
| Navigation, sidebar, breadcrumb, Cmd+K | `references/navigation.md` | Workflow-first patterns, cross-system breadcrumb |
| Dashboard, KPI cards, exception feed | `references/dashboard-patterns.md` | Control Tower, Planning Board, Map-Centric |
| AI suggestions, recommendations, XAI | `references/ai-ux.md` | 3 risk levels, "Tại sao?" button, Recommendation Card |
| Forms, validation, errors, destructive actions | `references/error-recovery.md` | Inline validation, auto-save, Undo/Soft Delete |
| Onboarding, empty states, sandbox | `references/onboarding.md` | 10-min first success, 5-step flow, demo data |
| Mobile, tablet, offline, scanner | `references/mobile-offline.md` | Touch 44×44px, optimistic UI, conflict resolution |
| RBAC, data masking, audit trail, session | `references/security-privacy.md` | Hide not disable, MFA, session 30min timeout |
| Map, timeline, Kanban, bulk ops | `references/patterns.md` | 10 design patterns with when-to-use guidance |
| Accessibility, dark mode, performance | `references/accessibility-perf.md` | WCAG 2.1 AA, contrast 4.5:1, <2s page load |

**Always start with `references/design-tokens.md`** — contains color system, typography, spacing rules for ALL components.

---

## Philosophy — 3 Pillars

```
Pillar 1: Design for how humans WORK, not how databases STORE
  → Navigation = workflow steps (Order→Plan→Execute→Track)
  → Info architecture = supply chain flow
  → Mental models = role-based views

Pillar 2: System SUGGESTS decisions, not just DISPLAYS data
  → Every screen asks: "What should user DO with this?"
  → AI recommendations present options + confidence
  → Exception-first: surface problems, hide noise

Pillar 3: ONE language across the ecosystem
  → Same tokens, components, patterns everywhere
  → Learn WMS → instantly understand TMS
  → Shared library is single source of truth
```

*See `references/ux-theory.md` for Systems Thinking foundations (Gestalt, Hick's Law, Fitts's Law, Miller's Law)*

---

## Workflow Navigation Map

Every platform's sidebar MUST follow this workflow order. Do NOT organize by database entity.

```
OMS:   Receive Order → Validate → Allocate → Release
WMS:   Inbound → Put-away → Storage → Pick → Pack → Outbound
TMS:   Plan → Assign Carrier → Dispatch → In Transit → Delivered
SCP:   Demand Forecast → Supply Plan → Inventory Opt → Execution
MKT:   Discover → Compare → Book → Track → Rate
CTR:   Monitor → Detect Exception → Drill-down → Resolve → Report
```

**Breadcrumb rule:** Cross-system drill-down shows full path:
```
Control Tower > Exception #4821 > TMS Shipment SH-8834 > WMS Allocation WA-9912
```

*See `references/navigation.md` for implementation*

---

## Mental Model by Role

Each role sees DIFFERENT default view (feature flags control this):

| Role | Primary Screen | Primary Action | Key Metrics |
|------|---------------|----------------|-------------|
| Logistics Planner | Planning Board + Map | Plan, Optimize | Capacity, Route cost |
| Warehouse Operator | Task List + Floor Map | Pick, Pack, Ship | Tasks pending, Zone load |
| Transport Coordinator | Timeline + Tracking | Dispatch, Track | On-time %, ETA accuracy |
| SC Manager | Dashboard + Forecast | Plan, Approve | Demand accuracy, Fill rate |
| Marketplace User | Search + Compare | Discover, Book | Price, SLA, Rating |
| Executive | Control Tower | Monitor, Steer | KPI exceptions, Trends |

*See `references/core-principles.md` for role-specific patterns*

---

## Audit Checklist (6 Categories, 18 Items)

### Navigation & IA (5 items)
- [ ] Workflow navigation (Order→Plan→Execute→Track, NOT database menu)
- [ ] Breadcrumb cross-system (show full path when drill-down TMS→WMS)
- [ ] Cmd+K global search (works from all screens)
- [ ] Exception-first dashboard (problems shown first, not KPI cards)
- [ ] <3 clicks for core tasks (resolve exception, create shipment, update status)

### Visual & Interaction (6 items)
- [ ] Color + secondary indicator (every color has icon/text, 8% men colorblind)
- [ ] Contrast WCAG 2.1 AA (4.5:1 text, 3:1 large)
- [ ] Touch targets 44×44px (mobile/tablet compliance)
- [ ] Planning Board Kanban (drag-drop for workflow tasks)
- [ ] Map-centric (NOT sidebar) for TMS/WMS
- [ ] Empty state guides action ("Create first shipment" / "Import demo data")

### Intelligence & AI (4 items)
- [ ] AI recommendation format ([Suggestion] + [Data] + [3 Actions: Approve/Adjust/Reject])
- [ ] "Tại sao?" button (XAI - explain AI logic, always present)
- [ ] 3 risk levels (Low: auto-apply | Medium: 1-click | High: manual)
- [ ] Error recovery (inline validation + auto-save + undo/soft-delete 30d)

### Onboarding & Accessibility (3 items)
- [ ] 10-min first success (new user completes first task <10 min)
- [ ] Sandbox mode (50 demo shipments, 10 carriers, 5 warehouses)
- [ ] Keyboard navigation (all complex actions keyboard-accessible)

*See `references/accessibility-perf.md` for tools: axe-core, Lighthouse, Pa11y*

---

## Anti-Patterns (7 Auto-FAIL)

These patterns BLOCK production deployment:

| # | Anti-Pattern | Why It Fails | Fix |
|---|--------------|--------------|-----|
| 1 | Menu theo database | Training 2-3 days | Workflow-first: Order→Plan→Execute→Track |
| 2 | >10 form fields (no AI) | 5-10 min/shipment entry | Auto-fill + AI suggestion + smart defaults |
| 3 | >5 clicks for core task | 10-15 clicks to resolve exception | One-screen operations (<3 clicks) |
| 4 | Table-only (no visual) | Hard to see patterns | Planning Board (Kanban) + Map (GPS/floor plan) |
| 5 | KPI dashboard (no exceptions) | User doesn't know what to do | Exception-first: delayed shipments, stock alerts |
| 6 | Map in sidebar | Map secondary, context lost | Map-centric: map = center, data = sidebar/overlay |
| 7 | Empty screens (no demo) | User can't learn system | Sandbox mode: 50 shipments, 10 carriers, 5 warehouses |

*See `references/patterns.md` for design pattern library*

---

## Color System (6 Status Colors)

| Color | Hex | Status | Use Case |
|-------|-----|--------|----------|
| **Grey** | #9E9E9E | Draft / Unprocessed | New order, unplanned shipment |
| **Blue** | #2196F3 | Planned | Allocated, Assigned, Scheduled |
| **Orange** | #FF9800 | Active / In Progress | In Transit, Picking, Processing |
| **Green** | #4CAF50 | Completed / Success | Delivered, Received, Closed |
| **Red** | #F44336 | Error / Delayed | Late shipment, Failed validation |
| **Purple** | #9C27B0 | Waiting External | Pending Carrier, Customs clearance |

**MUST:** Every color has icon/text label (colorblind support). Dark mode variants maintain 4.5:1 contrast.

*See `references/design-tokens.md` for CSS variables and dark mode implementation*

---

## Compliance Report Format

```markdown
# Smartlog UX Compliance Report

**Platform:** [TMS/WMS/OMS/SC/Marketplace/Control Tower]
**Date:** YYYY-MM-DD
**Reviewer:** [Name]

## Summary

| Category | Pass | Fail | Warn | Score |
|----------|------|------|------|-------|
| Navigation & IA | X/5 | X | X | X% |
| Visual & Interaction | X/6 | X | X | X% |
| Intelligence & AI | X/4 | X | X | X% |
| Onboarding & Accessibility | X/3 | X | X | X% |
| **TOTAL** | **X/18** | **X** | **X** | **X%** |

**Verdict:** ✅ PASS (≥15/18) | ⚠️ NEEDS REVISION (12-14) | ❌ REJECT (<12)

## Failures (P0 - Must Fix Before Launch)

❌ **[Item #X] — [Principle Name]**
- **Evidence:** [Screenshot/Description]
- **Impact:** [User pain / Business risk]
- **Fix:** [Specific action required]
- **Owner:** [Team/Person]
- **Deadline:** [Date]

## Warnings (P1 - Fix Before Next Sprint)

⚠️ **[Item #X] — [Principle Name]**
- **Evidence:** [Screenshot/Description]
- **Suggestion:** [Improvement recommendation]

## Passes (P2 - Good Practices)

✅ **[Item #X] — [Principle Name]**
- **Evidence:** [What was done well]

## Anti-Pattern Check (7 Auto-FAIL)

| # | Anti-Pattern | Detected? | Evidence |
|---|--------------|-----------|----------|
| 1 | Menu theo database | ❌ YES / ✅ NO | [Description] |
| 2 | >10 form fields (no AI) | ❌ YES / ✅ NO | [Description] |
| 3 | >5 clicks (core task) | ❌ YES / ✅ NO | [Description] |
| 4 | Table-only (no visual) | ❌ YES / ✅ NO | [Description] |
| 5 | KPI dashboard (no exceptions) | ❌ YES / ✅ NO | [Description] |
| 6 | Map sidebar (not center) | ❌ YES / ✅ NO | [Description] |
| 7 | Empty blank (no demo) | ❌ YES / ✅ NO | [Description] |

**Auto-FAIL Count:** X/7 (≥1 auto-fail = REJECT)

## Recommendation

**[APPROVE / NEEDS REVISION / REJECT]**

**Next Steps:**
1. [Action item 1]
2. [Action item 2]

**Re-Audit Date:** [If NEEDS REVISION/REJECT]
```

---

## Success Targets

| Metric | Target | Baseline | Improvement |
|--------|--------|----------|-------------|
| First Success | <10 min | 30-45 min | 70-80% faster |
| Task Completion | <3 clicks | 10-15 clicks | 70-80% reduction |
| Decision Speed | 30-50% faster | Manual planning | AI-assisted |
| Support Tickets | <5/user/30d | 8-12/user/30d | 40-60% reduction |
| Training Time | <4 hours | 2-3 days | 75-85% reduction |
| NPS | >30 | N/A | Industry benchmark |
| DAU/MAU | >40% | N/A | SaaS benchmark |
| Churn | <10%/year | N/A | B2B benchmark |

*See `references/heart-metrics.md` for HEART Framework implementation and quarterly measurement*

---

## Implementation Roadmap (4 Phases, 20 Weeks)

| Phase | Duration | Deliverables | Gate |
|-------|----------|--------------|------|
| **0: Foundation** | Week 1-3 | Design tokens, Shared components, Audit baseline | Component library published |
| **1: Core Principles** | Week 4-10 | Workflow nav, Exception dashboard, Colors, Error recovery | A/B test shows ≥20% improvement |
| **2: Patterns & Ecosystem** | Week 11-20 | 10 patterns, Onboarding, AI governance, Security, Edge cases | All patterns in ≥1 platform |
| **3: Measurement** | Week 20+ | HEART metrics, Ops metrics, Anti-pattern audit (quarterly) | Metrics tracked ≥1 month |

*See `references/implementation-roadmap.md` for detailed phase breakdown, bottlenecks (Theory of Constraints), and gate requirements*

---

## Getting Started

1. **Audit request?** → Use the **Audit Checklist** (6 categories, 18 items)
2. **Navigation issue?** → Read `references/navigation.md`
3. **Dashboard/patterns?** → Read `references/dashboard-patterns.md`
4. **AI feature?** → Read `references/ai-ux.md`
5. **Forms/errors?** → Read `references/error-recovery.md`
6. **Colors/tokens?** → Read `references/design-tokens.md` (always start here for components)
7. **Compliance report?** → Use **Compliance Report Format** above
8. **Not sure?** → Check **Anti-Patterns** table. If code matches any, REJECT.

---

## Reference Files (10 Modules)

- `references/design-tokens.md` - Color system, typography, spacing, dark mode
- `references/navigation.md` - Workflow-first patterns, breadcrumb, Cmd+K
- `references/dashboard-patterns.md` - Control Tower, Planning Board, Map-Centric
- `references/ai-ux.md` - AI governance, risk levels, XAI, Recommendation Card
- `references/error-recovery.md` - Inline validation, auto-save, Undo/Soft Delete
- `references/onboarding.md` - 10-min first success, 5-step flow, sandbox
- `references/mobile-offline.md` - Touch targets, optimistic UI, conflict resolution
- `references/security-privacy.md` - RBAC, data masking, MFA, audit trail
- `references/patterns.md` - 10 design patterns library
- `references/accessibility-perf.md` - WCAG 2.1 AA, tools (axe-core, Lighthouse)
- `references/implementation-roadmap.md` - 4 phases, gates, bottlenecks
- `references/heart-metrics.md` - HEART Framework, operational metrics
- `references/ux-theory.md` - Systems Thinking, Gestalt, UX laws
- `references/edge-cases.md` - Timezone, currency, conflict, migration
- `references/modern-practices.md` - Dark mode, sustainability, micro-interactions

---

**Audit Smartlog UI against v2.3 standards. Zero tolerance for anti-patterns.** ⚡

**Version:** 3.0 (March 2026) — Ultra-compressed workflow skeleton
