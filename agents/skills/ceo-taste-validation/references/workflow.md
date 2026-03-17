# CEO Review Workflow (2 Phases)

## Overview

CEO review has 2 mandatory phases:
1. **Pre-Review System Audit** - Understand current state before reviewing
2. **Step 0: Nuclear Scope Challenge** - Challenge premises, select mode, then review

---

## PHASE 1: Pre-Review System Audit

**Run BEFORE reviewing the plan.** This is your context to review intelligently.

### Commands to Run

```bash
git log --oneline -30                          # Recent history
git diff main --stat                           # What's already changed
git stash list                                 # Any stashed work
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.js" --include="*.py" -l
find . -name "*.ts" -newer package.json | head -20  # Recently touched files
```

### Files to Read

- **CLAUDE.md** - Repository conventions, agent instructions
- **TODOS.md** - Known deferred work
- **Architecture docs** - Existing design decisions

### Map These Questions

1. **What is the current system state?**
   - What modules exist?
   - What's the tech stack?
   - What's the data model?

2. **What is already in flight?**
   - Other open PRs
   - Stashed branches
   - Parallel work that might conflict

3. **What are the existing known pain points most relevant to this plan?**
   - Recent bug fixes in related areas
   - Performance issues
   - Technical debt

4. **Are there any FIXME/TODO comments in files this plan touches?**
   - These are landmines
   - Address them or acknowledge why you're not

---

## Retrospective Check

Check git log for this branch. If there are prior commits suggesting a previous review cycle:
- Review-driven refactors
- Reverted changes
- Multiple attempts at same feature

**Be MORE aggressive reviewing areas that were previously problematic.**

Recurring problem areas = architectural smells → surface them as architectural concerns.

---

## Taste Calibration (EXPANSION mode only)

Identify 2-3 files or patterns in the existing codebase that are particularly well-designed.

**Example:**
```
✅ Well-designed patterns found:
1. services/order_processor.rb - Clean error handling with named exceptions
2. components/DataTable.tsx - Composable, well-tested, accessible
3. db/migrations/20260301_add_rls.sql - RLS policy with NOBYPASSRLS

Note these as style references for the review.
```

Also note 1-2 patterns that are frustrating or poorly designed — these are anti-patterns to avoid repeating.

**Example:**
```
❌ Anti-patterns to avoid:
1. controllers/api/v1/products_controller.rb - 300 lines, no extraction
2. utils/helpers.ts - Grab bag of unrelated functions
```

---

## Report Findings Before Proceeding

**Template:**
```markdown
## Pre-Review System Audit

### Current System State
- **Tech stack:** Rails 7.1, React 18, PostgreSQL 15
- **Architecture:** Monolith with background jobs (Sidekiq)
- **Data model:** 47 tables, multi-tenant with RLS

### In-Flight Work
- PR #234: Payment gateway migration (merged yesterday)
- Branch `feature/inventory-v2` (stashed, conflicts likely)

### Known Pain Points
- Order processing: 800ms p99 latency (TODO-567)
- Dashboard: N+1 queries on Products (FIXME in products_controller.rb:45)
- Auth: Session store hitting Redis limits (Slack #backend 2026-03-10)

### FIXME/TODO in Files This Plan Touches
- `services/order_allocator.rb:23` - TODO: Handle partial allocations
- `components/OrderForm.tsx:89` - FIXME: Validation doesn't check negative quantities

### Taste Calibration (EXPANSION mode)
✅ Well-designed:
- services/payment_processor.rb (clean error handling)
- components/StatusBadge.tsx (accessible, tested)

❌ Anti-patterns:
- controllers/orders_controller.rb (300 lines, needs extraction)

---
Ready for Step 0.
```

---

## PHASE 2: Step 0 - Nuclear Scope Challenge

See [mode-selection.md](mode-selection.md) for full details.

**Quick reference:**
1. **0A: Premise Challenge** - Is this the right problem?
2. **0B: Existing Code Leverage** - What already exists?
3. **0C: Dream State Mapping** - 12-month ideal state?
4. **0D: Mode-Specific Analysis** - EXPANSION / HOLD / REDUCTION
5. **0E: Temporal Interrogation** - What decisions need resolving NOW?
6. **0F: Mode Selection** - Pick one, commit fully

**STOP.** AskUserQuestion. Wait for mode selection before proceeding.

---

## After Mode Selection

Proceed through 10 review sections:
1. Architecture Review
2. Error & Rescue Map
3. Security & Threat Model
4. Test Strategy
5. Observability & Debugging
6. Deployment & Rollout
7. Performance & Scaling
8. User Experience & Edge Cases
9. Documentation & Knowledge Transfer
10. Opinionated Recommendations

**For each section:**
- Read corresponding reference file
- ✅ Good: [what's good]
- ⚠️ Concern: [what's risky]
- ❌ Gap: [what's missing]
- **STOP.** AskUserQuestion once per issue. Wait.

---

## Critical Rules

1. **Never skip Pre-Review Audit** - You can't review intelligently without context
2. **Never skip Step 0** - Premise challenge is highest leverage
3. **Never drift between modes** - If EXPANSION selected, don't argue for less work later
4. **One question at a time** - No batching issues
5. **Lead with recommendation** - "Do B. Here's why:" not "Maybe B?"

---

**Token Count:** ~900 tokens
