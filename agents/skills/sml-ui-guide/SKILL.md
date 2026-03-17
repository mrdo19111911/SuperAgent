# Smartlog UI Guide (Ultra-Compressed v3)

**Compression:** 3,052 → 2,156 words (29% reduction), 100% content preserved

**Mission:** Non-UX readers audit UI in 15 minutes without training.

**Philosophy:** "If you can't understand it in 30 seconds, it's written wrong."

---

## Why This Matters

**Problem:** 70% of digital transformations fail due to poor UX, not bad tech (McKinsey, 2021)

**Cost of Bad UX:**
- Training: 2-3 days vs 4 hours
- Support: 10-20 tickets/user first 30d (good UX = <5)
- Planning: 10-15 clicks vs 3
- Quit rate: First week

**Goal:** Any supply chain worker operates Smartlog in 10 min, decides 30-50% faster, needs 40-60% less support.

---

## Theory Foundations

| Principle | Definition | Why It Matters | Example |
|-----------|-----------|----------------|---------|
| **Mental Model** | How users think about the system | Navigation that matches workflow = faster adoption | Workflow nav ("Receive→Plan→Ship") vs DB nav ("Orders Table→Details") |
| **Cognitive Load** | Amount of thinking required | Less thinking = faster decisions | Exception dashboard (12 delayed) vs vanity metrics (1,234 orders) |
| **Progressive Disclosure** | Show simple first, advanced later | Don't overwhelm new users | Basic filters visible, advanced behind "More filters" |
| **Feedback Loop** | System response to user action | Instant feedback = confidence | Inline validation vs post-submit errors |
| **Error Recovery** | How easily users fix mistakes | Soft delete + undo = less fear | 30-day recovery vs hard delete |
| **Accessibility** | Usable by all abilities | Color+icon+text vs color-only | Colorblind users see status via icons |

---

## 8 Core Principles (Quick Audit)

| # | Principle | DON'T | DO | Quick Check |
|---|-----------|-------|-----|-------------|
| 1 | **Workflow Navigation** | Database structure menu | Task-based menu (Receive→Plan→Ship) | Menu follows real work steps? |
| 2 | **Exception-First** | Vanity metrics (Total: 1,234) | Problems (12 delayed shipments) | Dashboard shows actionable issues? |
| 3 | **Standard Colors** | Inconsistent status colors | Grey/Blue/Orange/Green/Red/Purple | Same color = same meaning everywhere? |
| 4 | **Speed** | >5 clicks, no feedback | <3 clicks, <2s load, spinners | Core task under 3 clicks? |
| 5 | **AI Governance** | Auto-execute AI suggestions | Suggest→User approves, "Why?" button | AI requires human approval? |
| 6 | **Error Recovery** | Hard delete, post-submit errors | Inline validation, undo, soft delete | Destructive actions have undo? |
| 7 | **Mobile-First** | Small buttons, online-only | 44px touch targets, offline mode | Works on tablet offline? |
| 8 | **10-Min Onboarding** | No demo data, complex first task | Sandbox + guided first success | New user sees value in 10 min? |

---

## Mental Models (Theory → Practice)

| Mental Model | User Expectation | System Design | Validation |
|--------------|------------------|---------------|------------|
| **Task-Oriented** | "I need to ship this order" | Navigation = workflow steps | Menu shows "Ship Orders", not "Shipments Table" |
| **Exception-Driven** | "Show me what needs fixing" | Dashboard = problem list | Top card = "12 delayed shipments" with fix buttons |
| **Status-Aware** | "What's the current state?" | Colors + icons + text | Orange badge with clock icon = "In Progress" |
| **Confidence-Building** | "Can I undo this?" | Soft delete + undo toast | Delete shows "Undo?" for 10 seconds |
| **Context-Preserving** | "Where am I?" | Breadcrumbs + highlight | "Orders > Shipment #123 > Edit" |

---

## 10 Design Patterns (Implementation Templates)

| # | Pattern | Purpose | Components | When to Use |
|---|---------|---------|------------|-------------|
| 1 | **Exception Card** | Show actionable problems | severity, count, title, actions[] | Dashboard, alerts |
| 2 | **Planning Board** | Kanban drag-drop | columns[], onDragEnd() | Task planning, status transitions |
| 3 | **AI Recommendation** | Suggest→Approve flow | title, aiReason, impact[], actions[] | Route suggestions, auto-allocation |
| 4 | **Empty State** | Guide first action | icon, title, description, actions[] | No data screens |
| 5 | **Status Badge** | Visual state indicator | color, icon, text | Order status, shipment tracking |
| 6 | **Inline Validation** | Real-time input check | error, helperText | Forms, data entry |
| 7 | **Undo Toast** | Recover from mistakes | message, action.undo() | Delete, cancel operations |
| 8 | **Progress Indicator** | Long operation feedback | percentage, cancelButton | Reports, bulk operations |
| 9 | **Search Command** | Quick navigation | Cmd+K global search | Any screen, quick jump |
| 10 | **Role Filter** | Hide inaccessible features | hasPermission() guard | Buttons, menu items |

---

## AI Governance (Risk-Based Approval)

| Risk Level | Example | AI Behavior | User Action | Implementation |
|------------|---------|-------------|-------------|----------------|
| **Low** | Auto-fill form fields | Auto-apply (user can undo) | None (undo available) | `autoApply: true, undoTimeout: 10000` |
| **Medium** | Route suggestion | Show recommendation | Click "Approve" | `requireApproval: true, showImpact: true` |
| **High** | Split shipment | Show warning only | Manual handling | `aiSuggestion: false, manualOnly: true` |

**XAI (Explainability) Requirements:**
- Every AI suggestion has "Why?" button
- Show business impact: cost, time, CO2
- Display confidence score (>80% = safe, <80% = review)
- Log decisions for audit trail

---

## Onboarding (10-Minute First Success)

| Step | Goal | User Action | Success Metric |
|------|------|-------------|----------------|
| 1 | **Role Selection** | Choose role (Warehouse/Transport/Planner) | Role-specific UI loaded |
| 2 | **Sandbox Mode** | Use demo data (50 shipments, 10 carriers) | No fear of breaking real data |
| 3 | **Guided Task** | Complete first task (create shipment) | Task completed with highlights |
| 4 | **Achievement** | See success message + next steps | User feels progress |
| 5 | **Checklist** | Track onboarding progress | Clear path to mastery |

---

## Security & Privacy (RBAC UX)

**Principle:** Hide what users can't access (don't show disabled buttons)

| Role | TMS Access | WMS Access | OMS Access | Pricing Visibility | Implementation |
|------|-----------|-----------|-----------|-------------------|----------------|
| **Admin** | Full | Full | Full | Full | No restrictions |
| **Planner** | Read/Write | Read | Read/Write | Full | Plan routes, allocate |
| **Warehouse** | None | Full | Read | Hidden | Pick/pack only |
| **Driver** | Read (assigned) | None | None | Hidden | Track shipment only |
| **Carrier** | Read (assigned) | None | None | Hidden | Update delivery status |

**Data Masking:**
- Drivers/carriers see `***` for prices
- Warehouse sees order IDs, not customer names
- Planners see aggregated costs, not vendor contracts

---

## Edge Cases (Production-Ready Checklist)

| Category | Scenario | Expected Behavior | Implementation | Test Case |
|----------|----------|-------------------|----------------|-----------|
| **Timezone** | User in GMT+7, carrier in GMT-5 | All times in user's timezone + UTC tooltip | `moment.tz(userTimezone)` | Create order in Vietnam, assign NYC carrier |
| **Currency** | Order in USD, cost in VND | Display both + exchange rate | `formatCurrency(amount, currency)` | Multi-currency shipment |
| **Offline** | Warehouse loses Wi-Fi | Save locally, sync when online | `IndexedDB + background sync` | Disconnect network, complete pick task |
| **Latency** | Report takes 30 seconds | Progress bar + cancel button | Background job + polling | Generate 10K shipment report |
| **Partial Failure** | 8/10 items allocated | Show 8 success, 2 failed with reasons | Partial success toast | Bulk allocate with insufficient stock |
| **Conflict** | 2 users edit same order | Last write wins + conflict alert | Optimistic locking | Open order in 2 tabs, edit simultaneously |
| **Empty State** | No shipments to display | Guide user to create first shipment | Empty state component | New account, zero data |
| **Error Recovery** | API timeout | Retry button + local draft saved | Error boundary + retry logic | Simulate network timeout |

---

## Implementation Roadmap

| Phase | Duration | Deliverables | Gate Criteria | Owner |
|-------|----------|--------------|---------------|-------|
| **Phase 0: Foundation** | Week 1-3 | Design tokens, component library, baseline audit | No hardcoded colors allowed | UX Lead |
| **Phase 1: Core** | Week 4-10 | 8 principles + 10 patterns implemented | 80% audit checklist pass | Dev Team |
| **Phase 2: Ecosystem** | Week 11-20 | Onboarding, AI governance, security UX, edge cases | HEART metrics baseline | Full Team |
| **Phase 3: Measurement** | Week 20+ | HEART dashboard, quarterly audits, continuous improvement | First quarterly review done | PM + UX |

---

## HEART Framework (Quarterly Metrics)

| Category | Metric | Target | Measurement Method | Action if Below Target |
|----------|--------|--------|-------------------|------------------------|
| **Happiness** | CSAT | ≥4.0/5.0 | Quarterly survey (NPS) | User research sessions, identify pain points |
| **Engagement** | DAU | 60% daily active | Analytics dashboard | Push notifications, feature highlights |
| **Adoption** | Feature usage | 40% use core features in month 1 | Feature tracking | Onboarding optimization, tooltips |
| **Retention** | 90-day retention | 80% still active | User cohort analysis | Re-engagement campaigns, value reminders |
| **Task Success** | Completion rate | 95% | Task flow analytics | Fix drop-off points, simplify flows |
| **Time to First Success** | Onboarding | <10 minutes | Stopwatch test | Streamline steps, add shortcuts |
| **Support Tickets** | Operational | <3 per user/month | Support dashboard | Improve error messages, add help tooltips |
| **Clicks per Task** | Efficiency | <3 clicks | User flow analysis | Consolidate screens, add shortcuts |
| **Page Load Time** | Performance | <2 seconds | Lighthouse, RUM | Optimize bundles, lazy loading |
| **Error Rate** | Reliability | <5% | Error tracking (Sentry) | Fix top errors, improve validation |

---

## Anti-Patterns (Avoid These)

| # | Anti-Pattern | Why Bad | Correct Pattern | Audit Question |
|---|--------------|---------|-----------------|----------------|
| 1 | Database-structure menu | Users don't think in DB terms | Workflow menu (Receive→Plan→Ship) | Menu follows work steps? |
| 2 | Vanity metrics dashboard | Nobody logs in to see totals | Exception-first (12 delayed) | Dashboard shows actionable issues? |
| 3 | Multi-screen tasks | 10-15 clicks = frustration | One-screen operations (<3 clicks) | Core task under 3 clicks? |
| 4 | Color-only status | 8% of men colorblind | Color + icon + text | Every color has icon/text? |
| 5 | Hard delete | Accidents happen | Soft delete + undo (30d recovery) | Destructive actions have undo? |
| 6 | Hardcoded colors | Inconsistent across screens | Design tokens (CSS variables) | Colors from design system? |
| 7 | No demo data | Users afraid to try | Sandbox mode (demo shipments) | New users have test data? |
| 8 | AI auto-execute | Mistakes amplified | Suggest→User approves | AI requires approval? |
| 9 | Disabled buttons shown | Confusing UX | Hide if no permission | Show only accessible features? |
| 10 | Post-submit validation | Frustrating re-entry | Inline validation (as-you-type) | Errors shown immediately? |

---

## Best Practices (Production Checklist)

### Navigation & Structure
- [ ] Workflow-first menu (not database structure)
- [ ] Breadcrumbs on all screens
- [ ] Cmd+K global search
- [ ] <3 clicks for core tasks
- [ ] Role-based menu filtering (hide inaccessible)

### Visual Design & Accessibility
- [ ] Design tokens for all colors (no hardcoding)
- [ ] Standard status colors (grey/blue/orange/green/red/purple)
- [ ] Every color has icon + text label
- [ ] Touch targets ≥44px (mobile/tablet)
- [ ] Contrast ratio ≥4.5:1 (WCAG AA)
- [ ] Keyboard navigation (tab order, shortcuts)

### Performance & Speed
- [ ] Page loads <2 seconds
- [ ] Skeleton screens for slow loads
- [ ] Background jobs for bulk ops (>5s)
- [ ] Progress bars with cancel buttons
- [ ] Optimistic UI updates (instant feedback)

### AI & Intelligence
- [ ] Dashboard shows exceptions, not totals
- [ ] AI suggestions have "Why?" button
- [ ] Risk-based approval (low/medium/high)
- [ ] Business impact display (cost, time, CO2)
- [ ] Confidence scores visible (>80% safe)

### Error Handling & Recovery
- [ ] Inline validation (as-you-type)
- [ ] Clear error messages with suggested fixes
- [ ] Soft delete with 30-day recovery
- [ ] Undo toast for destructive actions (10s timeout)
- [ ] Offline mode (save local, sync later)
- [ ] Retry buttons for failed operations

### Mobile & Offline
- [ ] Touch targets ≥44px
- [ ] Works offline (IndexedDB cache)
- [ ] Barcode scanner integration
- [ ] Responsive layout (phone/tablet/desktop)
- [ ] Swipe gestures (mobile-native patterns)

### Onboarding & Education
- [ ] 10-minute first success flow
- [ ] Sandbox mode with demo data
- [ ] Role-specific guided tasks
- [ ] Achievement system (progress tracking)
- [ ] Empty states guide next actions

### Security & Privacy
- [ ] Hide features without permission (not disable)
- [ ] Data masking (drivers/carriers can't see prices)
- [ ] Audit trail for AI decisions
- [ ] Session timeout warnings
- [ ] GDPR compliance (data export/delete)

---

## Audit Checklist (5 Minutes per Screen)

### 1. Navigation Test
- [ ] Reachable from main menu in <3 clicks?
- [ ] Breadcrumb shows path?
- [ ] Cmd+K search finds this screen?

### 2. Visual Test
- [ ] Status colors match standard (grey/blue/orange/green/red/purple)?
- [ ] Every color has icon or text label?
- [ ] Buttons >44px on mobile?

### 3. Speed Test
- [ ] Page loads <2 seconds?
- [ ] Core action completes in <3 clicks?
- [ ] Long operations (>5s) show progress bar?

### 4. Intelligence Test
- [ ] Dashboard shows exceptions, not vanity metrics?
- [ ] AI suggestions have "Why?" button?
- [ ] Can complete task on one screen?

### 5. Error Test
- [ ] Type invalid input → inline error shown?
- [ ] Disconnect internet → "offline" message?
- [ ] Try delete → "Are you sure?" or undo option?

### 6. Mobile Test
- [ ] Open on tablet → buttons still clickable?
- [ ] Go offline → can still work (syncs later)?
- [ ] Barcode scanner works?

---

## Compliance Report Template

### AI Maturity Assessment

**Level 1 (Basic):** System suggests, user reviews, manual execution
- Example: Route recommendations, user approves, manually assigns carrier

**Level 2 (Moderate):** Auto-execution with undo, low-risk only
- Example: Auto-fill form fields, user can undo within 10 seconds

**Level 3 (Advanced):** Adaptive learning, confidence-based automation
- Example: High-confidence allocations (>90%) auto-execute, low-confidence (<80%) require review

**Level 4 (Autonomous):** Full automation with human oversight, incident response
- Example: AI handles 95% of routine allocations, escalates anomalies to humans

### Compliance Checklist
- [ ] EU AI Act: High-risk systems have human oversight (Level 1-2 minimum)
- [ ] GDPR: AI decisions logged for audit trail (30-day retention)
- [ ] ISO 9001: Quality gates prevent AI errors from propagating
- [ ] SOC 2: Access controls prevent unauthorized AI overrides

---

## Quick Reference Card (Print & Stick to Monitor)

### Core Principles
1. **Navigation:** Workflow, not database
2. **Dashboard:** Exceptions, not totals
3. **Colors:** Standard + icon/text
4. **AI:** Suggest→Approve ("Why?" button)
5. **Errors:** Inline validation + undo
6. **Mobile:** 44px targets + offline
7. **Speed:** <3 clicks, <2s load
8. **Onboarding:** 10-min success + demo

### Audit Checklist (5 min/screen)
- [ ] Workflow navigation
- [ ] Exception-first content
- [ ] Standard colors + accessibility
- [ ] <3 clicks core task
- [ ] Error recovery (undo/retry)
- [ ] Mobile-friendly
- [ ] AI "Why?" button
- [ ] Empty state guidance

### Avoid These
- Database menus
- Vanity metrics
- Color-only status
- Hard deletes
- >3 clicks
- No demo data
- Hardcoded colors
- AI auto-execute

---

## Glossary (For Non-UX People)

| Term | Definition | Example |
|------|-----------|---------|
| **Breadcrumb** | Navigation trail showing location | "Home > Orders > Shipment #123" |
| **Design Token** | Variable storing design values for consistency | `--status-in-progress: #FF9800` |
| **Exception-First** | Show problems requiring action, not stats | "12 delayed" vs "1,234 total" |
| **Mental Model** | How users think about system | Workflow-based vs database-based |
| **Progressive Disclosure** | Show simple first, advanced later | Basic filters visible, "More filters" button |
| **Skeleton Screen** | Placeholder showing structure while loading | Grey boxes before content loads |
| **Soft Delete** | Mark deleted, allow recovery vs permanent | 30-day recovery vs hard delete |
| **Touch Target** | Clickable area size for fingers | Minimum 44x44 pixels |
| **Workflow-First** | Navigation follows work steps, not software | "Receive→Plan→Ship" vs "Tables→Details" |
| **XAI** | Explainable AI - must show why it decided | "Why?" button shows reasoning |

---

**Version:** 3.0 (Ultra-Compressed Edition)
**Compression:** 748 lines → 518 lines (31% reduction), 3,052 → 2,156 words (29% reduction)
**Author:** Phúc SA (via Quang compression techniques)
**Last Updated:** 2026-03-17

---

**Living Document:** Update quarterly based on user research and HEART metrics.