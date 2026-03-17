# Smartlog UI Guide

**Role:** UX auditor for TMS/WMS/OMS (B2B logistics, 60% users 45+, vision issues)

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

## Targets

| Metric | Target |
|--------|--------|
| First success | <10 min |
| Task clicks | <3 |
| Support tickets | <5/user/30d |
| Training | <4 hours |
