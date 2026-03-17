# Smartlog UI Guide

**Role:** UX auditor for Smartlog Ecosystem (TMS/WMS/OMS/SC Planning/Marketplace/Control Tower)

**Target:** B2B logistics (60% users 45+, vision issues, 4h max training, <5 tickets/user/30d)

**Goal:** 10-min first success, 30-50% faster decisions, 40-60% less support

---

## Philosophy (3 Pillars + 5 Systems Thinking)

### 3 Pillars
1. **Workflow > Database** — Design for how humans work (Order→Plan→Execute→Track), not DB structure
2. **Decision Support > Data Display** — System suggests, human approves (not form-based entry)
3. **One Language Across Ecosystem** — Learn once, use everywhere (WMS/TMS/OMS same patterns)

### 5 Systems Thinking Principles
1. **Emergence** — Total experience > sum of parts (OMS→WMS→TMS feels like one flow)
2. **Feedback Loops** — Every action has instant response (route change → WMS updates schedule)
3. **Interconnectedness** — Drill-down cross-system (shipment → order → warehouse → carrier, no system switch)
4. **Leverage Points** — Focus on high-impact: Planning Board, Exception Dashboard, Control Tower
5. **Mental Models** — Design per role (Planner: capacity+route+cost | Operator: zone+task+sequence)

---

## 8 Core UX Principles

| # | Principle | Rule | Example |
|---|-----------|------|---------|
| 1 | **Workflow-First Navigation** | Nav follows real workflow, not DB tables | OMS: Receive→Validate→Allocate→Release (NOT "Orders", "Items", "Customers") |
| 2 | **Exception-First Dashboard** | Problems first, not vanity metrics | Show: delayed shipments, stock exceptions (NOT: total orders, revenue cards) |
| 3 | **One-Screen Operations** | Core tasks <3 clicks on 1 screen | Resolve exception: see issue → take action → confirm (no page change) |
| 4 | **Visual-First, Data-Second** | Color + map + drag-drop > tables | Status colors, Planning Board Kanban, GPS map center (not sidebar) |
| 5 | **System-Suggest, Human-Approve** | AI analyzes → proposes → user reviews → approve/adjust | Route suggestion with confidence % + 3 buttons (Approve/Adjust/Reject) |
| 6 | **Progressive Complexity** | 3 tiers: Essential (Week 1-2) → Professional (Week 3-8) → Expert (Month 3+) | New user sees core workflow only; advanced features unlocked after mastery |
| 7 | **Cross-Platform Consistency** | Same nav, colors, terminology, patterns across all 6 platforms | Sidebar fixed, Cmd+K works everywhere, Grey=#9E9E9E Draft (TMS/WMS/OMS) |
| 8 | **Error Recovery UX** | Inline validation + auto-save + undo/soft-delete (30d recovery) | User Error: "Qty >0" | System: "Connection lost. Draft saved. Retry?" | Business: "Can't delete. Shipment shipped." |

---

## Theory Foundations

### Gestalt + Laws
- **Proximity & Similarity** — Related info grouped
- **Hick's Law** — Reduce choices (AI narrows to approve/reject)
- **Jakob's Law** — Use familiar patterns (Cmd+K, Kanban, contextual tips)
- **Progressive Disclosure** — New user needs 20% features
- **Fitts's Law** — Touch targets ≥44×44px (Apple HIG)
- **Miller's Law** — 7±2 items (max 7 table columns)

### Accessibility First (WCAG 2.1 AA)
- **Color + Secondary Indicator** — All color coding has icon/pattern/text (8% men colorblind)
- **Contrast** — 4.5:1 text, 3:1 large text
- **Keyboard Nav** — All complex actions keyboard-accessible

### Performance UX (B2B)

| Action | Max Time | UX Requirement |
|--------|----------|----------------|
| Simple (Click, Filter) | 100-200ms | Instant feel |
| Page Load | 1-2s | Skeleton screen |
| Reports | 5-10s | Progress bar + Cancel |
| Bulk Ops | 10-60s | Background + notification |

---

## Color System (6 States)

| Color | Hex | Status | Use Case |
|-------|-----|--------|----------|
| **Grey** | #9E9E9E | Draft / Unprocessed | New order, unplanned shipment |
| **Blue** | #2196F3 | Planned | Allocated, Assigned, Scheduled |
| **Orange** | #FF9800 | Active / In Progress | In Transit, Picking, Processing |
| **Green** | #4CAF50 | Completed / Success | Delivered, Received, Closed |
| **Red** | #F44336 | Error / Delayed | Late shipment, Failed validation, Exception |
| **Purple** | #9C27B0 | Waiting External | Pending Carrier, Customs clearance |

**MUST:** Every color has icon/text label (colorblind support). Dark mode variants maintain 4.5:1 contrast.

---

## Mental Model by Role

| Role | Mental Model | Primary Screen | Key Actions |
|------|--------------|----------------|-------------|
| Logistics Planner | Capacity + Route + Cost | Planning Board + Map | Plan, Optimize |
| Warehouse Operator | Zone + Task + Sequence | Task List + Floor Map | Pick, Pack, Ship |
| Transport Coordinator | Carrier + Timeline | Timeline + Tracking | Dispatch, Track |
| SC Manager | Demand + Supply + Inventory | Dashboard + Forecast | Plan, Approve |
| Marketplace User | Price + Service + Rating | Search + Compare | Discover, Book |
| Executive | KPI + Exception + Risk | Control Tower | Monitor, Steer |

---

## 10 Design Patterns (Unified)

1. **Control Tower Dashboard** — KPI cards (secondary) + Exception feed (primary) + AI recommendations (with XAI)
2. **Planning Board (Kanban)** — Drag-drop: New→Allocated→In Progress→Completed (reduces 70% planning time)
3. **Map-Centric Operations** — Map = center UI (NOT sidebar). TMS: routes | WMS: floor plan | Marketplace: coverage
4. **Timeline View** — Sequence + bottlenecks by time (Gantt-style for shipment/task dependencies)
5. **Recommendation Card** — AI suggestion format: [Recommendation] + [Data/Confidence] + [3 Actions: Approve/Adjust/Reject]
6. **Empty State UX** — Guides next action: Create new / Import CSV / Connect API / Load demo data
7. **Command Palette (Cmd+K)** — Global search across ecosystem (orders, shipments, carriers, tasks)
8. **Bulk Operations** — Select all (cross-page), preview impact, background processing (>5s), atomic commit
9. **Mobile/Offline-First** — Touch 44×44px, scanner integration, optimistic UI, conflict resolution (server wins metadata, ask user for business conflict)
10. **Notification & Alerting** — 3 levels: System Alert (toast) | Business Alert (email/Telegram) | Info (in-app). Avoid alert fatigue.

---

## AI Governance (3 Risk Levels)

| Level | Type | AI Behavior | User Interaction | Example |
|-------|------|-------------|------------------|---------|
| **Low** | Suggestion | Auto-apply | User can undo | Email subject, smart sort, address normalization |
| **Medium** | Recommendation | Propose with confidence % | 1-click approve | Route optimization, carrier selection, demand forecast adjust |
| **High** | Decision (Critical) | Alert only | Manual handling required | Flight change, split shipment, price override |

**XAI (Explainability):** Always show "Tại sao?" (Why?) button → "Route A saves 15% fuel cost based on historical data (345 trips)."

**AI Maturity (4 Levels):**
1. **Automation** — Rule-based workflows
2. **Prediction** — ETA, exception forecasting
3. **Recommendation** — Smart routing, carrier matching
4. **Autonomous Planning** — Auto-optimize entire network

---

## Onboarding System (10-Min First Success)

### 5-Step Flow

| Step | Goal | Action | Output |
|------|------|--------|--------|
| 1. Intent | Personalize | "What do you want to do today?" | Role detection |
| 2. Role | Unlock features | Select: Planner / Dispatcher / Manager / Admin | Feature access |
| 3. Guided Task | First success | Create first shipment/order/pick (with tooltips) | Success state |
| 4. Value | Aha moment | Show impact: "Saved 2 hours vs manual" | User sees benefit |
| 5. Progress | Gamification | Checklist: 5 key tasks to master | Clear learning path |

### Sandbox Mode
- **Demo Data:** 50 shipments, 10 carriers, 5 warehouses
- **Always Available:** User can experiment without risk
- **Auto-Reset:** Data resets daily

### Onboarding Metrics

| Metric | Target | Measure |
|--------|--------|---------|
| Time to First Success | <10 min | Onboarding funnel |
| First Week Active Rate | >70% | User saw value |
| Feature Adoption (core) | >40% | Analytics |
| Support Tickets (30d) | <5/user | UX clarity |
| Training Time | <4 hours | Down from 2-3 days |

---

## Security & Privacy UX

### RBAC (Role-Based Access Control)
- **Hide, Not Disable** — No unauthorized features visible (not greyed out)
- **Data Masking** — Price visible to authorized roles only; customer info masked for drivers
- **Session** — Auto-logout 30 min idle; MFA for sensitive ops (delete, price change)
- **Audit Trail** — Log: Who, When, Old/New value (destructive actions)

### Privacy by Design
- **Data Minimization** — Collect only necessary data
- **Consent UX** — GPS/IoT tracking requires explicit consent (modal with "Why we need this")
- **GDPR/PDPA** — Export user data (JSON/CSV), Delete account (30-day grace period)
- **Destructive Actions** — Must have Undo OR Soft Delete (30-day recovery)

---

## Edge Cases & Exception Handling

### 13.1 Timezone & Multi-Region
- **Display:** Always show timezone abbreviation ("15:30 ICT")
- **Toggle:** Local time ↔ Destination time
- **ETA:** Always destination timezone
- **Reports:** User selects timezone reference

### 13.2 Multi-Currency & Multi-Unit
- **Currency:** Show code (VND, USD, THB)
- **Units:** Toggle metric ↔ imperial (kg/lb, km/mi)

### 13.3 Conflict Resolution
- **Optimistic Locking** — Warn when multiple users edit same entity
- **Real-Time Presence** — Show avatars of users editing (like Google Docs)
- **Conflict Strategy:** Server wins (metadata) | Ask User (business logic)

### 13.4 Data Migration
- **Import Wizard** — Auto-detect CSV/Excel columns (AI-powered)
- **Validation Preview** — Show errors before commit
- **Parallel Run Mode** — Old system + new system run simultaneously (switchover after validation)

---

## Implementation Roadmap (4 Phases, 20 Weeks)

| Phase | Duration | Deliverables | Gate Review | Bottleneck (Theory of Constraints) |
|-------|----------|--------------|-------------|-------------------------------------|
| **0: Foundation** | Week 1-3 | • Design token system (6 colors × 2 modes)<br>• Shared component library (10 core components)<br>• UX audit baseline (gap matrix) | Foundation complete | **Component library** — If missing, teams build fragmented components → tech debt |
| **1: Core Principles** | Week 4-10 | • Workflow-first navigation (restructure sidebar)<br>• Exception-first dashboard<br>• Color system + accessibility (icon/text backup)<br>• Error recovery (3 layers: inline/auto-save/undo)<br>• Progressive complexity (3 tiers + feature flags)<br>• Cross-platform consistency (terminology dictionary) | A/B test + user validation | **Navigation restructure** — Requires A/B test to avoid disrupting existing users |
| **2: Patterns & Ecosystem** | Week 11-20 | • 10 design patterns (Control Tower, Planning Board, Map, Timeline, etc.)<br>• Onboarding system (5 steps + sandbox)<br>• AI governance (3 risk levels + XAI)<br>• Security UX (RBAC, masking, MFA, audit)<br>• Edge cases (timezone, currency, conflict, migration) | Cross-platform consistency audit | **Shared pattern adoption** — Need enforcement via linting + design review |
| **3: Measurement** | Week 20+ | • HEART framework metrics instrumentation<br>• Operational metrics (Time to Resolution, Click Depth)<br>• Anti-pattern audit (quarterly)<br>• Continuous improvement loop | HEART metrics live | **Data instrumentation** — Analytics + session recording setup |

### Gate Requirements
- **Phase 0→1:** Component library published + adopted by all teams
- **Phase 1→2:** A/B test shows ≥20% improvement in task completion time
- **Phase 2→3:** All 10 patterns implemented in ≥1 platform
- **Phase 3:** HEART metrics tracked for ≥1 month

---

## HEART Framework (Measurement)

### Core Metrics

| Dimension | Metric | Target | Measure Method |
|-----------|--------|--------|----------------|
| **Happiness** | NPS, CSAT | NPS >30, CSAT ≥4.0/5.0 | Quarterly survey |
| **Engagement** | DAU/MAU, Feature Usage | DAU/MAU >40% (≥60% licensed users) | Analytics |
| **Adoption** | New user activation | 10-min success >80%, core features >40% in month 1 | Onboarding funnel |
| **Retention** | Churn rate | <10%/year, 90-day retention >80% | Cohort analysis |
| **Task Success** | Completion rate, Time-on-Task | >90% completion, <3 min core tasks (30% faster) | Session recording + analytics |

### Operational Metrics

| Metric | Target | Baseline Comparison |
|--------|--------|---------------------|
| Time to First Shipment | <10 min | Down from 30-45 min |
| Planning Efficiency | 50% reduction vs manual | Measured via time-on-task |
| Exception Resolution Time | <5 min (dashboard) / <15 min (total) | Down from 30-60 min |
| Support Ticket Rate | <3/user/month (first 3 months) | Down from 8-12/user/month |
| Training to Competency | <1 week (<4 hours training) | Down from 2-3 days |
| Click Depth (Core Tasks) | <3 clicks | Down from 10-15 clicks |

---

## Anti-Patterns (7 Auto-FAIL)

| # | Anti-Pattern | Why It Fails | Evidence | Fix |
|---|--------------|--------------|----------|-----|
| 1 | **Menu theo database** | Nav: "Users", "Orders", "Shipments" (not workflow) | Training takes 2-3 days | Workflow-first: Order→Plan→Execute→Track |
| 2 | **>10 form fields without AI** | 5-10 min/shipment (manual entry) | High error rate | Auto-fill + AI suggestion + smart defaults |
| 3 | **>5 clicks for core task** | 10-15 clicks to resolve exception | Low task success | One-screen operations (<3 clicks) |
| 4 | **Table-only (no visual)** | Hard to see patterns/bottlenecks | Users can't find issues | Planning Board (Kanban) + Map (GPS/floor plan) |
| 5 | **KPI dashboard (no exceptions)** | User doesn't know what to do | Low engagement | Exception-first: delayed shipments, stock alerts |
| 6 | **Map in sidebar** | Map secondary, data primary | Context lost | Map-centric: map = center, data = sidebar/overlay |
| 7 | **Empty screens (no demo data)** | User doesn't understand system | Onboarding fails | Sandbox mode with 50 shipments, 10 carriers, 5 warehouses |

---

## Best Practices 2024-2025

### Dark Mode
- **Auto-switch:** System setting OR time-based (after 18:00)
- **Color variants:** All 6 status colors have dark mode (maintain 4.5:1 contrast)
- **Map/Floor Plan:** Dark tiles (not inverted colors)

### Sustainability UX (GLEC Framework)
- **CO2 Display:** Show emission next to cost for each route
- **Green Routing:** Filter/sort by carbon footprint
- **Sustainability Dashboard:** ESG reporting, emission trends
- **Eco-Label:** Badge "Green Choice" for lowest-emission carrier/route

### Micro-Interactions
- **Success Animation:** Celebrate task completion (subtle confetti/checkmark)
- **Progress Celebration:** Onboarding milestones (gamification)
- **Smart Defaults:** Remember user preferences (view mode, filters, sort)

---

## Audit Checklist (18 Items)

### Navigation & IA (5)
- [ ] **Workflow Navigation** — Nav follows real process (Order→Plan→Execute→Track), NOT database menu
- [ ] **Breadcrumb Cross-System** — Always show position in flow (can drill-down TMS→WMS→OMS)
- [ ] **Cmd+K Global Search** — Works across all platforms
- [ ] **Exception-First Dashboard** — Problems shown first, not KPI cards
- [ ] **<3 Clicks for Core Tasks** — Resolve exception, create shipment, update status

### Visual & Interaction (6)
- [ ] **Color + Secondary Indicator** — Every color has icon/text (colorblind: 8% men)
- [ ] **Contrast WCAG 2.1 AA** — 4.5:1 text, 3:1 large
- [ ] **Touch Targets 44×44px** — Mobile/tablet compliance
- [ ] **Planning Board (Kanban)** — Drag-drop for workflow tasks
- [ ] **Map-Centric (Not Sidebar)** — Map = center for TMS/WMS
- [ ] **Empty State Guides Action** — "Create first shipment" / "Import demo data"

### Intelligence & AI (4)
- [ ] **AI Recommendation Format** — [Suggestion] + [Data] + [3 Actions: Approve/Adjust/Reject]
- [ ] **"Tại sao?" Button (XAI)** — Explain AI logic (always present)
- [ ] **3 Risk Levels** — Low (auto-apply) | Medium (1-click) | High (manual)
- [ ] **Error Recovery** — Inline validation + auto-save + undo/soft-delete (30d)

### Onboarding & Accessibility (3)
- [ ] **10-Min First Success** — New user completes first task <10 min
- [ ] **Sandbox Mode** — 50 demo shipments, 10 carriers, 5 warehouses
- [ ] **Keyboard Navigation** — All complex actions keyboard-accessible

---

## Compliance Report Format

```markdown
# Smartlog UX Compliance Report

**Platform:** [TMS/WMS/OMS/SC Planning/Marketplace/Control Tower]
**Date:** YYYY-MM-DD
**Reviewer:** [Name]

---

## Summary

| Category | Pass | Fail | Warn | Score |
|----------|------|------|------|-------|
| Navigation & IA | X/5 | X | X | X% |
| Visual & Interaction | X/6 | X | X | X% |
| Intelligence & AI | X/4 | X | X | X% |
| Onboarding & Accessibility | X/3 | X | X | X% |
| **TOTAL** | **X/18** | **X** | **X** | **X%** |

**Verdict:** ✅ PASS (≥15/18) | ⚠️ NEEDS REVISION (12-14/18) | ❌ REJECT (<12/18)

---

## Failures (P0 - Must Fix Before Launch)

❌ **[Item #X] — [Principle Name]**
- **Evidence:** [Screenshot/Description]
- **Impact:** [User pain point / Business risk]
- **Fix:** [Specific action required]
- **Owner:** [Team/Person]
- **Deadline:** [Date]

---

## Warnings (P1 - Fix Before Next Sprint)

⚠️ **[Item #X] — [Principle Name]**
- **Evidence:** [Screenshot/Description]
- **Suggestion:** [Improvement recommendation]

---

## Passes (P2 - Good Practices)

✅ **[Item #X] — [Principle Name]**
- **Evidence:** [What was done well]

---

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

---

## Recommendation

**[APPROVE / NEEDS REVISION / REJECT]**

**Reasoning:** [Detailed explanation based on score + anti-patterns]

**Next Steps:**
1. [Action item 1]
2. [Action item 2]
3. [Action item 3]

**Re-Audit Date:** [If NEEDS REVISION/REJECT]
```

---

## Success Targets (Quick Reference)

| Metric | Target | Baseline | Improvement |
|--------|--------|----------|-------------|
| First Success | <10 min | 30-45 min | 70-80% faster |
| Task Completion | <3 clicks | 10-15 clicks | 70-80% reduction |
| Decision Speed | 30-50% faster | Manual planning | AI-assisted |
| Support Tickets | <5/user/30d | 8-12/user/30d | 40-60% reduction |
| Training Time | <4 hours | 2-3 days | 75-85% reduction |
| NPS | >30 | N/A (new) | Industry benchmark |
| DAU/MAU | >40% | N/A (new) | SaaS benchmark |
| Churn | <10%/year | N/A (new) | B2B benchmark |

---

**Living Document** — Updated continuously per Product Team, User Research, production data.

**Version:** 2.3 (March 2026) + Implementation Roadmap v1.0

**Smartlog Ecosystem:** TMS · WMS · OMS · Supply Chain Planning · Marketplace · Control Tower
