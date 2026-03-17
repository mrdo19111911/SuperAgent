# Dashboard Patterns — Smartlog

## Exception-First Dash
Rule: Show WHAT to do (problems), not WHAT happened

| Element | Spec | Behavior |
|---------|------|----------|
| Layout | 4 KPI max → 70% exc feed + 30% AI → Map (collapse) | Top-down priority |
| KPI Card | label/val/trend/status, --text-2xl bold | Drill-down click |
| Exc Item | severity🔴🟠🟡, title, desc, ts, entity, 1-2 btns | Critical top (SLA), resolve≤3 clicks, refresh 30s |

## Planning Board (Kanban)
Rule: Drag-drop ~70% faster

**Cols:** Chưa KH→Đã KH→Giao carrier→Dispatch→Giao
**Card:** ID/customer/dest/ETA/priority, capacity "12/15", filter date/carrier/route
**Action:** Drag=status update, dbl-click=panel (not nav)

## Map-Centric
Rule: Map CENTER (60-70%), not secondary

| Prop | Spec | Rule |
|------|------|------|
| Visibility | ALWAYS visible TMS tracking | Center stage |
| Interaction | Click=panel, cluster >50 | No nav away |
| Style | Status colors=tokens, dark tiles | Match design system |
| Real-time | 15-30s refresh | Live tracking |

## Timeline
Rule: Sequence + bottleneck

| Orientation | Use | Style |
|-------------|-----|-------|
| Horizontal | Multi-day | Bottleneck=--status-error+duration |
| Vertical | Single-day | Current=pulse, future=dash |

**Event:** ts, label, status, duration, isBottleneck, actor, location → Click=detail

## AI Card
Rule: Suggestion + Data + 3 Actions

| Prop | Spec | Constraint |
|------|------|------------|
| Actions | Approve/Adj/Reject + "Tại sao?" | ALWAYS 3 actions |
| Confidence | 0-100%, <70%=warn | Show % always |
| Risk | Low/Med/High, high=prominent warn+confirm | Never auto-apply med/high |
| Impact | metric/improvement/value | Quantify result |

## Bulk Ops
Rule: Peak 50-200% vol, handle 100s

| Req | Impl |
|-----|------|
| Select all | Cross-page "Chọn all {total}" |
| Preview | "Sẽ update 234" before exec |
| Background | >5s → toast+progress "45/234"+cancel |
| Confirm | Destructive=confirm modal |

## Empty State
Rule: Teach, never blank

**Struct:** icon (platform-specific) + title + desc + primaryAction + secondaryActions (import/API/demo)
**Rule:** Primary prominent, 2-3 alternatives, demo=instant sandbox

## Notifications

| Tier | Channel | Dismiss | Ex |
|------|---------|---------|-----|
| 🔴 Critical | Banner+Push+Email | No | Server down |
| 🟠 Business | Toast+Push | 10s | Delay, stock low |
| 🟡 Info | Toast | 5s | Task done |

**UI:** Stack bottom-right max 3, bell icon+badge, user config channels
