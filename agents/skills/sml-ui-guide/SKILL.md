---
name: smartlog-ux-guide
version: 4.0.0
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

## Quick Reference — The 8 Non-Negotiable Rules

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

*See `references/core-principles.md` for detailed DO/DON'T examples*

---

## Architecture — What to Read When

This skill is organized by audit task. Read ONLY the reference file you need:

| You are... | Read this | Contains |
|-----------|-----------|----------|
| **Auditing navigation** | `references/navigation.md` | Workflow-first sidebar, breadcrumb, Cmd+K, drill-down patterns |
| **Auditing dashboard** | `references/dashboard-patterns.md` | Control Tower layout, exception feed, KPI cards, Planning Board |
| **Auditing colors/tokens** | `references/design-tokens.md` | 6 status colors, typography, spacing, dark mode, CSS variables |
| **Auditing AI features** | `references/ai-ux.md` | 3 risk levels, Recommendation Card, "Tại sao?" XAI button |
| **Auditing forms/errors** | `references/error-recovery.md` | Inline validation, auto-save, soft delete, destructive actions |
| **Auditing onboarding** | `references/onboarding.md` | 10-min first success, 5-step flow, sandbox, empty states |
| **Auditing mobile/offline** | `references/mobile-offline.md` | Touch 44×44px, optimistic UI, scanner, conflict resolution |
| **Auditing security** | `references/security-privacy.md` | RBAC (hide not disable), data masking, MFA, audit trail |
| **Auditing accessibility** | `references/accessibility-perf.md` | WCAG 2.1 AA, contrast, keyboard nav, performance budget |
| **Building implementation plan** | `references/implementation-roadmap.md` | 4 phases (20 weeks), gates, bottlenecks, risks |
| **Setting up metrics** | `references/heart-metrics.md` | HEART framework, operational metrics, dashboards |
| **Understanding theory** | `references/ux-theory.md` | Systems Thinking, Gestalt, Hick's Law, mental models |

**Start with `references/design-tokens.md`** if auditing ANY component (colors, typography, spacing rules).

---

## Three Pillars — Design Philosophy

```
Pillar 1: Design for how humans WORK, not how databases STORE
  → Navigation = workflow steps (Order→Plan→Execute→Track)
  → Mental models = role-based views (Planner vs Operator vs Manager)

Pillar 2: System SUGGESTS decisions, not just DISPLAYS data
  → Every screen asks: "What should user DO with this?"
  → AI recommendations with Approve/Adjust/Reject actions
  → Exception-first: surface problems, hide noise

Pillar 3: ONE language across the ecosystem
  → Same tokens, components, patterns everywhere
  → Learn WMS → instantly understand TMS
  → Shared library is single source of truth
```

*See `references/ux-theory.md` for cognitive psychology foundations*

---

## Workflow Navigation Map

Every platform's sidebar MUST follow this workflow order:

```
OMS:   Receive Order → Validate → Allocate → Release
WMS:   Inbound → Put-away → Storage → Pick → Pack → Outbound
TMS:   Plan → Assign Carrier → Dispatch → In Transit → Delivered
SCP:   Demand Forecast → Supply Plan → Inventory Opt → Execution
MKT:   Discover → Compare → Book → Track → Rate
CTR:   Monitor → Detect Exception → Drill-down → Resolve → Report
```

*See `references/navigation.md` for implementation patterns*

---

## Component Compliance Checklist

### Before PR Merge (18 Items)

#### Navigation & IA (5 items)
- [ ] Workflow navigation (Order→Plan→Execute→Track, NOT database menu)
- [ ] Breadcrumb cross-system (show full path when drill-down TMS→WMS)
- [ ] Cmd+K global search (works from all screens)
- [ ] Exception-first dashboard (problems shown first, not KPI cards)
- [ ] <3 clicks for core tasks (resolve exception, create shipment, update status)

#### Visual & Interaction (6 items)
- [ ] Color + secondary indicator (every color has icon/text, 8% men colorblind)
- [ ] Contrast WCAG 2.1 AA (4.5:1 text, 3:1 large) — use axe-core
- [ ] Touch targets 44×44px (mobile/tablet compliance)
- [ ] Planning Board Kanban (drag-drop for workflow tasks)
- [ ] Map-centric (NOT sidebar) for TMS/WMS
- [ ] Empty state guides action ("Create first shipment" / "Import demo data")

#### Intelligence & AI (4 items)
- [ ] AI recommendation format ([Suggestion] + [Data] + [3 Actions: Approve/Adjust/Reject])
- [ ] "Tại sao?" button (XAI - explain AI logic, always present)
- [ ] 3 risk levels (Low: auto-apply | Medium: 1-click | High: manual)
- [ ] Error recovery (inline validation + auto-save + undo/soft-delete 30d)

#### Onboarding & Accessibility (3 items)
- [ ] 10-min first success (new user completes first task <10 min)
- [ ] Sandbox mode (50 demo shipments, 10 carriers, 5 warehouses)
- [ ] Keyboard navigation (all actions keyboard-accessible, focus indicator visible)

*See `references/accessibility-perf.md` for automated testing with axe-core, Lighthouse, Pa11y*

---

## Anti-Patterns — Instant PR Rejection

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

*See `references/dashboard-patterns.md` for correct patterns*

---

## Color System (6 Status Colors)

| Color | Hex (Light) | Hex (Dark) | Status | Use Case |
|-------|-------------|------------|--------|----------|
| **Grey** | #9E9E9E | #B0B0B0 | Draft / Unprocessed | New order, unplanned shipment |
| **Blue** | #2196F3 | #64B5F6 | Planned | Allocated, Assigned, Scheduled |
| **Orange** | #FF9800 | #FFB74D | Active / In Progress | In Transit, Picking, Processing |
| **Green** | #4CAF50 | #81C784 | Completed / Success | Delivered, Received, Closed |
| **Red** | #F44336 | #E57373 | Error / Delayed | Late shipment, Failed validation |
| **Purple** | #9C27B0 | #BA68C8 | Waiting External | Pending Carrier, Customs clearance |

**MUST:** Every color has icon/text label (colorblind support). Dark mode maintains 4.5:1 contrast.

*See `references/design-tokens.md` for CSS variables, typography, spacing, dark mode implementation*

---

## Getting Started

1. **Audit request?** → Use **Component Compliance Checklist** (18 items above)
2. **Navigation issue?** → Read `references/navigation.md`
3. **Dashboard/patterns?** → Read `references/dashboard-patterns.md`
4. **AI feature?** → Read `references/ai-ux.md`
5. **Forms/errors?** → Read `references/error-recovery.md`
6. **Colors/tokens?** → Read `references/design-tokens.md` (start here for ALL components)
7. **Planning implementation?** → Read `references/implementation-roadmap.md` (4 phases, 20 weeks)
8. **Setting up metrics?** → Read `references/heart-metrics.md` (HEART + operational)
9. **Not sure?** → Check **Anti-Patterns** table. If code matches any, REJECT.

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

## Anti-Pattern Check (7 Auto-FAIL)

| # | Anti-Pattern | Detected? | Evidence |
|---|--------------|-----------|----------|
| 1 | Menu theo database | ❌ YES / ✅ NO | [Description] |
| 2 | >10 form fields (no AI) | ❌ YES / ✅ NO | [Description] |
| ... | ... | ... | ... |

**Auto-FAIL Count:** X/7 (≥1 auto-fail = REJECT)

## Recommendation

**[APPROVE / NEEDS REVISION / REJECT]**

**Next Steps:**
1. [Action item 1]
2. [Action item 2]
```

---

## Reference Files

- `references/core-principles.md` — 8 principles with DO/DON'T examples
- `references/navigation.md` — Workflow-first, breadcrumb, Cmd+K, drill-down
- `references/dashboard-patterns.md` — Control Tower, Planning Board, Map, Timeline
- `references/design-tokens.md` — Color system, typography, spacing, dark mode
- `references/ai-ux.md` — AI governance, risk levels, XAI, Recommendation Card
- `references/error-recovery.md` — Inline validation, auto-save, undo/soft delete
- `references/onboarding.md` — 10-min first success, 5-step flow, sandbox
- `references/mobile-offline.md` — Touch targets, optimistic UI, scanner, conflict
- `references/security-privacy.md` — RBAC, data masking, MFA, audit trail
- `references/accessibility-perf.md` — WCAG 2.1 AA, tools (axe-core, Lighthouse)
- `references/implementation-roadmap.md` — 4 phases, gates, bottlenecks, risks
- `references/heart-metrics.md` — HEART framework, operational metrics, dashboards
- `references/ux-theory.md` — Systems Thinking, cognitive psychology, mental models

---

**Audit Smartlog UI against v2.3 standards. Zero tolerance for anti-patterns.** ⚡

**Version:** 4.0 (March 2026) — Refactored to workflow skeleton + references pattern
