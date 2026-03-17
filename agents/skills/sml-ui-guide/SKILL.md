# Smartlog UI Guide

**Role:** UX auditor for TMS/WMS/OMS (B2B logistics, 60% users 45+, vision issues)

**Philosophy:** 5 Systems Thinking principles — (1) Emergence: flow > parts, (2) Feedback: instant response, (3) Interconnectedness: drill-down cross-system, (4) Leverage: Planning Board + Exception Dashboard + Control Tower, (5) Mental Models: role-specific UX.

---

## Checklist (18 items)

### Navigation (5)
1. **Workflow nav** - Order→Plan→Execute→Track (NOT database menu)
2. **Exception dashboard** - Problems first, not KPI cards
3. **<3 clicks** - Core task completion
4. **Breadcrumb** - Always show position in flow
5. **Cmd+K** - Global search

### Visual (6)
6. **Color + icon** - Every color has secondary indicator (8% men colorblind)
7. **Contrast** - 4.5:1 text, 3:1 large (WCAG 2.1 AA)
8. **Touch** - 44x44px min buttons
9. **Board/Map** - NOT just tables
10. **Empty state** - Guide next action
11. **Planning board** - Kanban drag-drop

### Intelligence (7)
12. **AI format** - Recommendation + data + 3 actions (Approve/Adjust/Reject)
13. **"Tại sao?"** - Explain AI logic
14. **Error recovery** - Inline validation + auto-save + undo
15. **Bulk ops** - Select all pages + preview
16. **Offline** - Optimistic UI + conflict resolution
17. **Timezone** - Show abbreviation (15:30 ICT)
18. **Dark mode** - Auto-switch + contrast maintained

---

## Auto-FAIL (7)

| # | Anti-pattern | Example |
|---|--------------|---------|
| 1 | Menu theo database | Nav: "Users", "Orders", "Shipments" |
| 2 | >10 form fields | No AI auto-fill |
| 3 | >5 clicks | Core task |
| 4 | Table only | No board/map |
| 5 | KPI dashboard | No exception feed |
| 6 | Map sidebar | Not center |
| 7 | Empty blank | No demo data/sandbox |

---

## Color System

| Color | Status | Use |
|-------|--------|-----|
| Grey #9E9E9E | Draft | Unprocessed |
| Blue #2196F3 | Planned | Allocated |
| Orange #FF9800 | Active | In Transit, Picking |
| Green #4CAF50 | Done | Delivered, Closed |
| Red #F44336 | Error | Delayed, Exception |
| Purple #9C27B0 | Waiting | Pending External |

**MUST:** Every color has icon/text backup.

---

## Output

```
# Smartlog UX Compliance

**Score:** X/18
**Verdict:** PASS / FAIL / WARNING

## Failures
- ❌ [Item #] - [Evidence] - Priority

## Warnings
- ⚠️ [Item #] - [Evidence]

## Recommendation
[APPROVE / NEEDS REVISION / REJECT]
```

---

## 10 Design Patterns

1. **Planning Board** - Kanban: New→Allocated→In Progress→Completed (drag-drop)
2. **Fleet View** - Real-time GPS map (center, NOT sidebar) + driver status
3. **Exception Feed** - Auto-refresh delayed/stuck items, resolve in <3 clicks
4. **Bulk Operations** - Multi-select (cross-page), preview changes, atomic commit
5. **Search & Filter** - Cmd+K global, saved filters, search history
6. **Collaboration** - Real-time presence (avatars), inline comments, @mentions
7. **Notification Center** - Grouped by priority, actionable buttons, snooze
8. **Analytics Dashboard** - KPIs secondary to exceptions, drill-down to raw data
9. **Import/Export** - Wizard auto-detect CSV columns, validation preview, rollback
10. **Settings Management** - Progressive disclosure (Basic/Advanced), diff before save

---

## Onboarding (10-Min First Success)

| Step | Action | Output |
|------|--------|--------|
| 1. Intent | "What do you want to do?" → role detection | Personalized path |
| 2. Role | Select: Planner / Dispatcher / Manager / Admin | Feature unlocks |
| 3. Guided Task | First shipment/order/pick with tooltips | Success state |
| 4. Value | Show impact: "Saved 2 hours vs manual" | Aha moment |
| 5. Progress | Checklist: 5 key tasks to master | Gamification |

**Sandbox:** 50 demo shipments, 10 carriers, 5 warehouses (always available).

---

## AI Governance (3 Risk Levels)

| Level | Type | UX Rule | Example |
|-------|------|---------|---------|
| **Low** | Suggestion | Auto-apply, notify after | Smart sort, email subject |
| **Medium** | Recommendation | Show confidence, 1-click approve | Route, carrier, forecast |
| **High** | Decision | Must explain + require approval | Price change, order cancel |

**XAI:** "Tại sao?" button always present → show data + logic.

---

## Security & Privacy UX

- **RBAC:** Hide (not disable) unauthorized features
- **Data Mask:** Price visible to authorized roles only, customer info masked for drivers
- **Session:** Auto-logout 30 min, MFA for sensitive ops
- **Audit Trail:** Log: who, when, old/new value (destructive actions)
- **Privacy:** Data minimization, GPS consent, GDPR export/delete
- **Destructive Actions:** Undo OR soft delete (30-day recovery)

---

## Implementation Phases (4 stages, 20 weeks)

| Phase | Duration | Deliverables | Bottleneck |
|-------|----------|--------------|------------|
| **0: Foundation** | Week 1-3 | Design tokens (6 colors × 2 modes), Shared components (10 core), Audit baseline | Component library (Theory of Constraints #1) |
| **1: Core Principles** | Week 4-10 | Workflow nav, Exception dashboard, Color system, Error recovery (3 layers), Progressive complexity (3 tiers) | Navigation restructure + A/B test |
| **2: Patterns & Ecosystem** | Week 11-20 | 10 patterns, Onboarding (5 steps), AI governance, Security UX, Edge cases | Cross-platform consistency |
| **3: Measurement** | Week 20+ | HEART metrics, Ops metrics (Time to Resolution, Adoption Rate), Anti-pattern audit (quarterly) | Data instrumentation |

**Gate:** Each phase requires review before next.

---

## HEART Framework Metrics

| Metric | Definition | Target | Measure |
|--------|------------|--------|---------|
| **Happiness** | User satisfaction (NPS, CSAT) | NPS >30 | Quarterly survey |
| **Engagement** | Active users, feature usage | DAU/MAU >40% | Analytics |
| **Adoption** | New user activation | 10-min success >80% | Onboarding funnel |
| **Retention** | Churn rate | <10%/year | Cohort analysis |
| **Task Success** | Completion rate, time | >90%, <3 min | Session recording |

**Operational:**
- Time to Resolution: <5 min (exceptions)
- Click Depth: <3 clicks (core tasks)
- Support Ticket Rate: <5/user/30d

---

## Targets

| Metric | Target |
|--------|--------|
| First success | <10 min |
| Task clicks | <3 |
| Support tickets | <5/user/30d |
| Training | <4 hours |
| NPS | >30 |
| DAU/MAU | >40% |
| Churn | <10%/year |
