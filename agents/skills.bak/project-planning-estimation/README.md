# Project Planning & Estimation (v2.0 GSTACK)

**Version:** 2.0.0
**Category:** Planning & Agile
**Mode:** TWO_PASS
**Target Agents:** Dũng PM (PRIMARY), Conan, Phúc SA, Châu UX

---

## Overview

Chess grandmaster planning 10 moves ahead. Agile planning with story points, dependency mapping, PERT estimation, and risk-adjusted buffers for predictable delivery.

**Core Philosophy:** "Plans are worthless, but planning is everything." — Dwight Eisenhower

---

## Three Mental Models

1. **CRITICAL Mode (Blocks Sprint Start):** Missing dependency mapping, no story point estimates, unclear acceptance criteria, critical path not identified, zero buffer = guaranteed overrun. STOP sprint planning until resolved.

2. **INFORMATIONAL Mode (Improve Accuracy):** Track velocity trends, analyze estimation variance (actual vs estimate), run retrospectives on missed deadlines. Learn from past sprints.

3. **RISK Mode (Buffer Allocation):** Unknown unknowns get 2x multiplier. New tech? 2x. Never built payments? 2x. Zero buffer? Schedule post-mortem now.

---

## Key Capabilities

### Estimation Techniques
- **Story Points (Fibonacci 1-13):** Relative sizing with velocity tracking (±20% accuracy after 3 sprints)
- **T-shirt Sizes (XS-XL):** High-level roadmap estimation (±50% accuracy)
- **Planning Poker:** Team consensus estimation with debate (15 min/story)
- **PERT (3-Point):** Risk analysis with Best/Likely/Worst cases (±30% accuracy)
- **#NoEstimates:** Flow-based teams (cycle time only)

### Story Point Scale (With Real Examples)
| Points | Days | Complexity | Example |
|--------|------|------------|---------|
| **1** | 0.5 | Trivial | Duplicate existing API endpoint |
| **2** | 1 | Small | Add email validation to form |
| **3** | 2 | Medium | CRUD API with tests |
| **5** | 3-5 | Large | Multi-step checkout workflow |
| **8** | 5-8 | Very Large | Refactor to microservices |
| **13** | 8-13 | Epic | **STOP: Break down into 5+ stories** |

### 2x Multiplier for Unknowns
- New programming language (TypeScript → Go): **2x**
- New framework (React → Svelte): **2x**
- New infrastructure (AWS → GCP): **2x**
- Domain gap (never built payments): **2x**
- Third-party API (new vendor): **2x**

### Buffer Allocation Strategy
- **Known risks (DB review delay, flaky tests):** 20% buffer
- **Unknown risks (new payment gateway, data migration):** 50% buffer
- **Zero buffer:** Guaranteed deadline slip

---

## Dependency Mapping & Critical Path

**Critical Path Method:**
- Map dependencies BEFORE estimating (dependency tree first)
- Identify longest chain (determines sprint timeline)
- Detect bottlenecks (DB review board, third-party approvals)
- Optimize parallel work (Frontend + API in parallel)

**Example:** Requirements → DB Schema → API → Integration Tests → Deployment
**Result:** 16 days (critical path) vs 25 days (sequential)

---

## Sprint Planning Template (2-Week Sprint)

**Sprint 12: CSV Export Feature**
- **Sprint Goal:** Users can export order history as CSV
- **Velocity:** 25 points/sprint (historical average)
- **Committed:** 22 points (3-point buffer)
- **Team:** 3 devs × 10 days × 6 hours/day = 180 hours
- **Buffer:** 20% (36 hours) → Available: 144 hours

**7 Stories:** CSV button (2 pts), Export API (5 pts), Pagination (3 pts), Unit tests (2 pts), E2E tests (3 pts), Load tests (5 pts), Docs (2 pts)

**Critical Path:** Export API → Pagination → Load tests (13 points, 8 days)

---

## Two-Pass Workflow

### Pass 1: CRITICAL (Blocks Sprint Start)
- Missing dependency mapping
- No story point estimates
- Unclear acceptance criteria
- Critical path not identified
- No risk buffer (0% buffer)

### Pass 2: INFORMATIONAL (Improve Accuracy)
- Velocity tracking (burndown charts)
- Actual vs estimate retrospectives
- Estimation poker consensus analysis
- T-shirt size refinement

---

## Real Production Disaster (Concrete Learning)

**Story:** "Migrate 100K users from MongoDB to PostgreSQL"
**Initial estimate:** 2 weeks (10 points)
**Actual time:** 8 weeks (40 points = 4x overrun)

**Unknowns missed:**
- Data integrity checks (NULL values crashed PostgreSQL constraints)
- RLS policy migration (MongoDB had no tenant isolation)
- Downtime planning (zero-downtime required dual-write strategy)
- Rollback plan (missing rollback script, production stuck)

**Root cause:** No dependency mapping, no 2x multiplier, no buffer, no acceptance criteria

**Prevention:** Break into 8 stories (5 pts each), apply 2x multiplier, add 50% buffer → 192 points = 8 sprints (realistic)

---

## Stopping Policy (Re-Estimation Triggers)

- **Story > 13 points:** STOP, break down into smaller stories (target 3-8 points each)
- **3+ re-estimates on same story:** STOP, run spike task to reduce unknowns (research, prototype, POC)
- **Critical path > sprint capacity:** STOP, reduce scope or extend timeline
- **Scope changes > 20% mid-sprint:** STOP, re-plan sprint (cancel and restart)

---

## Integration with Nash Framework

**Pipeline 1 (Requirements):** Dũng PM creates backlog with T-shirt sizing, Conan challenges scope creep
**Pipeline 2 (Architecture):** Phúc SA maps technical dependencies, identifies critical path
**Pipeline 3 (Coding):** Devs commit to sprint backlog (Planning Poker), daily standups track burndown

**Sprint Cadence (2 weeks):** Day 0 = Planning, Day 1-9 = Dev + standups, Day 10 = Review + retro

**Scoring (LEDGER):**
- P3 penalty (-10): Committing >130% of velocity (overcommitment)
- P2 penalty (-15): <50% estimation accuracy (no learning)
- P4 reward (+5): 90%+ sprint completion rate (predictable delivery)

---

## Usage Example

```markdown
Sprint 12: 22 points committed (velocity: 25), 7 stories, 3 devs, 10 days
Critical path: USER-124 → USER-125 → USER-128 (13 points, 8 days)
Blockers: None (CSV schema validated with ERP team pre-sprint)
Sprint goal: Users can export order history as CSV
Status: ✅ Ready to start (all CRITICAL checks passed)
```

---

**Anti-Patterns to STOP:**
- Exact hour estimates (8.5 hours for Task X) → Use story points
- No buffer (100% sprint capacity) → No slack for incidents
- Ignoring dependencies → Blocked developers, idle time
- Stories > 13 points → Too big to complete in one sprint
- No retrospective on missed estimates → No learning

---

**GSTACK v2.0 Compliant** | 405 lines | Nash Framework
