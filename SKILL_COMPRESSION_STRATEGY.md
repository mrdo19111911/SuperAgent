# Skill Compression & Agent Refinement Strategy

**Date:** 2026-03-16
**Goal:** Reduce 15 enterprise skills from avg 677 lines → 200-300 lines (~56% reduction)

---

## Current State Analysis

### Skill Size Distribution

| Skill | Current Lines | Target | Reduction Needed |
|-------|--------------|--------|------------------|
| test-data-management | 934 | 250 | **-73%** (684 lines) |
| high-level-design | 895 | 280 | **-69%** (615 lines) |
| deployment-strategies | 859 | 300 | **-65%** (559 lines) |
| secrets-config-management | 716 | 250 | **-65%** (466 lines) |
| git-workflow-branching | 619 | 230 | **-63%** (389 lines) |
| container-orchestration | 629 | 250 | **-60%** (379 lines) |
| performance-load-testing | 609 | 250 | **-59%** (359 lines) |
| observability-monitoring | 606 | 250 | **-59%** (356 lines) |
| requirements-engineering | 516 | 220 | **-57%** (296 lines) |
| database-migration | 511 | 230 | **-55%** (281 lines) |
| regression-test-suite | 505 | 220 | **-56%** (285 lines) |
| technical-debt-management | 505 | 220 | **-56%** (285 lines) |
| project-planning-estimation | 405 | 200 | **-51%** (205 lines) |

**Average Current:** 677 lines
**Average Target:** 242 lines
**Average Reduction:** **64% compression** (435 lines removed per skill)

---

## Compression Principles

### What to KEEP (Essential 40%)

1. **YAML Frontmatter** (5 lines)
   ```yaml
   ---
   name: skill-name
   description: One-line summary
   allowed-tools: [Bash, Read]
   mode: TWO_PASS
   ---
   ```

2. **Philosophy** (20-25 lines)
   - Role-play metaphor (5 lines)
   - 3 mental models (CRITICAL/INFORMATIONAL/COLLABORATION) (10 lines)
   - Prime axiom/principle (5 lines)

3. **Prime Directives** (30-40 lines)
   - 5-7 non-negotiable rules (15 lines)
   - Anti-patterns table (15 lines)
   - P0 violations (10 lines)

4. **ONE Key Table** (20-30 lines)
   - Tools comparison OR Workflow phases OR Decision matrix
   - Pick MOST CRITICAL table, remove others

5. **ONE Concrete Example** (40-50 lines)
   - Pick BEST production bug example
   - Complete code snippet (20-30 lines)
   - Before/After comparison (10-20 lines)

6. **Two-Pass Workflow** (15-20 lines)
   - CRITICAL checklist (5-7 items)
   - INFORMATIONAL checklist (3-5 items)

7. **Meta-Instructions** (15-20 lines)
   - Pre-work checklist (5 items)
   - Stopping policy (3 conditions)

**Total KEEP:** ~160-205 lines (68-85% of target)

---

### What to REMOVE (Non-Essential 60%)

❌ **Remove Multiple Tables** (keep only 1)
- Example: Git Workflow has 4 tables → Keep only "Branching Strategies"
- Savings: ~40-60 lines per skill

❌ **Remove Duplicate Examples** (keep only 1 best)
- Example: Test Data has 5 factory examples → Keep only TypeScript/Prisma
- Savings: ~80-120 lines per skill

❌ **Remove Verbose Explanations** (keep only action items)
- Example: HLD has C4 model theory → Remove theory, keep diagram templates
- Savings: ~50-80 lines per skill

❌ **Remove Integration Sections** (agents know context)
- Example: "Integration with Nash Framework" sections
- Savings: ~20-30 lines per skill

❌ **Remove Redundant Checklists** (merge into Meta-Instructions)
- Example: Pre-commit + Pre-push checklists → Merge into 1
- Savings: ~15-25 lines per skill

❌ **Remove "Nice-to-Have" Content**
- Alternative approaches (use main approach only)
- Historical context (focus on current best practice)
- Tool comparisons beyond top 2-3 tools
- Savings: ~40-60 lines per skill

**Total REMOVE:** ~245-375 lines per skill

---

## Compression Formula (Per Skill)

### Step 1: Keep Core Structure (~160 lines)
```
YAML Frontmatter:        5 lines
Philosophy:             25 lines
Prime Directives:       35 lines
ONE Key Table:          25 lines
TWO-Pass Workflow:      18 lines
Meta-Instructions:      18 lines
Headers/Spacing:        10 lines
---
Subtotal:              136 lines (MANDATORY)
```

### Step 2: Add BEST Example (~60-80 lines)
```
ONE Production Bug:     20 lines (problem statement)
Code Example (Before):  20 lines
Code Example (After):   20 lines
Explanation:           10 lines
---
Subtotal:              70 lines (pick 1 BEST)
```

### Step 3: Add Optional Enhancement (~20-40 lines)
```
EITHER:
- Second table (workflow phases)          25 lines
OR:
- Extended checklist (tools, commands)    30 lines
OR:
- Additional example (edge case)          35 lines
---
Subtotal:              0-35 lines (OPTIONAL, budget permitting)
```

**Total Range:** 206-241 lines (within 200-300 target)

---

## Compression Examples

### Example 1: test-data-management (934 → 250 lines, -73%)

**BEFORE (934 lines):**
- Philosophy: 26 lines ✅
- Prime Directives: 75 lines (7 rules + 3 tables) ❌ TOO MUCH
- Tables: 6 tables (180 lines) ❌ TOO MUCH
- Examples: 7 code examples (TypeScript, Python, Go, .NET, fixtures, snapshots, anonymization) (420 lines) ❌ TOO MUCH
- Lifecycle: 4 phases (120 lines) ❌ REDUNDANT
- Two-Pass: 23 lines ✅
- Meta-Instructions: 30 lines ✅
- Integration: 40 lines ❌ REMOVE

**AFTER (250 lines):**
- Philosophy: 26 lines ✅ KEEP
- Prime Directives: 35 lines (7 rules + 1 anti-patterns table) ✅ COMPRESS
- **ONE Table:** Data Generation Strategies (5 rows: Fixtures, Factories, Seeders, Fakers, Snapshots) (25 lines) ✅ KEEP BEST
- **ONE Example:** TypeScript/Prisma factory with multi-tenant isolation (70 lines) ✅ KEEP BEST
- Two-Pass: 20 lines ✅ KEEP
- Meta-Instructions: 20 lines ✅ KEEP
- Quick Reference Card: 30 lines ✅ ADD (commands)

**Removed:**
- 5 extra tables (Data volumes, Cleanup strategies, etc.) → -100 lines
- 6 extra code examples (Python, Go, .NET, fixtures, snapshots, anonymization) → -280 lines
- Lifecycle section (redundant with Prime Directives) → -80 lines
- Integration section → -40 lines
- Verbose explanations → -184 lines

**Result:** 934 → 250 lines (-684 lines, -73%)

---

### Example 2: high-level-design (895 → 280 lines, -69%)

**BEFORE (895 lines):**
- Philosophy: 32 lines ✅
- Prime Directives: 77 lines ✅
- Tables: 3 tables (Scalability Patterns, NFR Categories, Design Patterns) (85 lines) ❌ TOO MUCH
- C4 Diagrams: 3 full diagrams (C1, C2, C3) with ASCII art (260 lines) ❌ TOO MUCH
- ADR Template: 66 lines ❌ TOO LONG
- Examples: 3 production failures (62 lines) ❌ TOO MUCH
- Two-Pass: 82 lines ❌ TOO LONG
- Meta-Instructions: 50 lines ❌ TOO LONG

**AFTER (280 lines):**
- Philosophy: 32 lines ✅ KEEP
- Prime Directives: 40 lines (compress anti-patterns) ✅ COMPRESS
- **ONE Table:** Design Patterns (6 rows: 3-Tier, Microservices, Event-Driven, CQRS, Serverless, BFF) (30 lines) ✅ KEEP BEST
- **C4 Level 2 (Container Diagram) ONLY** (40 lines) ✅ KEEP MOST USEFUL
- **ADR Template (Short Version)** (30 lines: Status, Context, Decision, Rationale, Consequences) ✅ COMPRESS
- **ONE Production Failure:** Black Friday cascade (20 lines) ✅ KEEP BEST
- Two-Pass: 20 lines ✅ COMPRESS
- Meta-Instructions: 25 lines ✅ COMPRESS
- Quick Reference: 25 lines (C4 checklist) ✅ ADD

**Removed:**
- 2 extra tables (Scalability Patterns, NFR Categories) → -55 lines
- C1 System Context diagram → -60 lines
- C3 Component diagram → -100 lines
- ADR extended sections (Alternatives, Validation, Rollback) → -36 lines
- 2 extra production failures → -42 lines
- Verbose Two-Pass explanations → -62 lines
- Extended meta-instructions → -25 lines
- ARCHITECTURE.md template → -52 lines

**Result:** 895 → 280 lines (-615 lines, -69%)

---

### Example 3: git-workflow-branching (619 → 230 lines, -63%)

**BEFORE (619 lines):**
- Philosophy: 32 lines ✅
- Prime Directives: 22 lines ✅
- Tables: 4 tables (Branching Strategies, Conventional Commits Types, Merge Strategies, Production Bugs) (95 lines) ❌ TOO MUCH
- Branch Lifecycle: 7 phases with commands (193 lines) ❌ TOO MUCH
- Conventional Commits: 88 lines ❌ TOO LONG
- Merge Strategies: 47 lines ❌ REDUNDANT
- GitFlow Workflow: 102 lines ❌ TOO DETAILED
- Pre-Push Checklist: 18 lines ✅
- Meta-Instructions: 31 lines ✅

**AFTER (230 lines):**
- Philosophy: 32 lines ✅ KEEP
- Prime Directives: 22 lines ✅ KEEP
- **ONE Table:** Branching Strategies (4 rows: Trunk-Based, GitHub Flow, GitFlow, Feature Branches) (20 lines) ✅ KEEP BEST
- **Branch Lifecycle (Compressed):** 3 key phases only (Create → PR → Merge) (45 lines) ✅ COMPRESS
- **Conventional Commits (Short):** Types table + 2 examples (30 lines) ✅ COMPRESS
- **ONE Production Bug:** Force push to main (15 lines) ✅ KEEP BEST
- Pre-Push Checklist: 18 lines ✅ KEEP
- Meta-Instructions: 20 lines ✅ KEEP
- Quick Reference Card: 25 lines (common commands) ✅ ADD

**Removed:**
- 3 extra tables (Conventional Commits full types, Merge Strategies, Production Bugs table) → -75 lines
- Branch Lifecycle verbose explanations → -148 lines
- Conventional Commits extended examples → -58 lines
- Merge Strategies section (redundant with table) → -47 lines
- GitFlow Workflow detailed flow → -102 lines
- Extended meta-instructions → -11 lines

**Result:** 619 → 230 lines (-389 lines, -63%)

---

## Agent Refinement Strategy

### Current Agent Bloat Issues

**Problem:** Agents have grown too large in L2 Cache

Example from [thuc-dev-ts.md](agents/dev/thuc-dev-ts.md):
- **Current size:** ~800-1000 lines (estimated ~250-300 tokens)
- **PEN/WIN entries:** 50+ entries (too many)
- **Skill references:** 26 skills listed (redundant)

### Agent Compression Principles

#### 1. L2 Cache Structure (~200-250 lines, <500 tokens)

```markdown
# Agent Name - Role

**Archetype:** Builder/Analyst/Critic/Strategist/Operator
**Primary Pipeline:** 2 (Architecture) / 3 (Coding) / 4 (Testing) / etc.
**Skills:** [Top 5 most-used skills ONLY]

## Core Competencies (3-5 bullet points)
- Competency 1 with concrete metric
- Competency 2 with concrete metric
- ...

## PEN (Penalties) - TOP 10 ONLY
### P0 (Never Repeat)
1. [Most critical penalty]
2. [Second critical penalty]

### P1 (High Priority)
3-5. [Important penalties]

### P2 (Medium Priority)
6-10. [Notable penalties]

## WIN (Successes) - TOP 5 ONLY
1. [Best success with metric]
2-5. [Other notable wins]

## Current Focus (This Sprint)
- Focus area 1
- Focus area 2
```

#### 2. Skill Reference Strategy

**BEFORE (Bad - Lists all 26 skills):**
```markdown
## Skills Available
1. tdd-best-practices
2. react-vite-patterns
3. fastapi-async-patterns
... (23 more)
```

**AFTER (Good - Lists top 5 + "See registry"):**
```markdown
## Primary Skills (Top 5 Most-Used)
1. tdd-best-practices (daily)
2. typescript-best-practices (daily)
3. database-migration (weekly)
4. test-data-management (weekly)
5. git-workflow-branching (daily)

_Full skill list: See `agents/skills/_registry.json` → filter by `used_by: ["thuc-dev-ts"]`_
```

#### 3. PEN/WIN Compression (Top 10 PEN, Top 5 WIN)

**BEFORE (Bad - 50+ PEN entries):**
```markdown
## PEN
### P0
1-10. [Critical penalties]

### P1
11-30. [High priority]

### P2
31-50. [Medium priority]

### P3
51-60. [Low priority]
```

**AFTER (Good - Top 10 PEN only):**
```markdown
## PEN (Top 10 Never-Repeat)
### P0 (CRITICAL)
1. Missing RLS policy → Tenant data leak (2026-02-15, -30, BUG-789)
2. No error handling → Production crash (2026-02-20, -30, BUG-802)

### P1 (HIGH)
3. N+1 query → Slow API (2026-03-01, -20, BUG-815)
4. Missing tests → Regression (2026-03-05, -20, BUG-823)

### P2 (MEDIUM)
5-10. [Other notable penalties]

_Archived PEN (P3-P4): See LEDGER history_
```

---

## Compression Execution Plan

### Phase 1: Compress Top 5 Largest Skills (Week 1)

**Priority Order (Most Bloat → Least):**

1. **test-data-management** (934 → 250 lines, -73%)
   - Remove 6 extra code examples (keep TS/Prisma only)
   - Remove 5 extra tables (keep Data Generation Strategies only)
   - Estimated time: 2 hours

2. **high-level-design** (895 → 280 lines, -69%)
   - Remove C1/C3 diagrams (keep C2 Container only)
   - Remove 2 extra tables (keep Design Patterns only)
   - Compress ADR template (30 lines)
   - Estimated time: 2 hours

3. **deployment-strategies** (859 → 300 lines, -65%)
   - Remove verbose Flagger config (keep summary)
   - Remove duplicate examples (keep Blue-Green + Canary only)
   - Estimated time: 1.5 hours

4. **secrets-config-management** (716 → 250 lines, -65%)
   - Remove 5 extra breach examples (keep top 2)
   - Remove verbose AWS SDK examples (keep core only)
   - Estimated time: 1.5 hours

5. **git-workflow-branching** (619 → 230 lines, -63%)
   - Remove GitFlow section (keep Trunk-Based + GitHub Flow only)
   - Remove 3 extra tables (keep Branching Strategies only)
   - Remove verbose lifecycle (compress 7 phases → 3)
   - Estimated time: 1.5 hours

**Total Phase 1:** 8.5 hours (~1 day)
**Savings:** 2,729 lines removed (avg 546 per skill)

---

### Phase 2: Compress Next 5 Skills (Week 1)

6. **container-orchestration** (629 → 250 lines, -60%)
7. **performance-load-testing** (609 → 250 lines, -59%)
8. **observability-monitoring** (606 → 250 lines, -59%)
9. **requirements-engineering** (516 → 220 lines, -57%)
10. **database-migration** (511 → 230 lines, -55%)

**Total Phase 2:** 7 hours (~1 day)
**Savings:** 1,751 lines removed (avg 350 per skill)

---

### Phase 3: Compress Remaining 3 Skills (Week 1)

11. **regression-test-suite** (505 → 220 lines, -56%)
12. **technical-debt-management** (505 → 220 lines, -56%)
13. **project-planning-estimation** (405 → 200 lines, -51%)

**Total Phase 3:** 4 hours (~0.5 day)
**Savings:** 785 lines removed (avg 262 per skill)

---

### Phase 4: Agent Refinement (Week 2)

**Target:** 20 agents need L2 Cache compression

**Agent Categories:**

1. **Core Agents (9 agents)** - 2 hours each
   - Conan, Dũng, Mộc, Nam, Nhién, Phúc SA, Sơn QA, Tùng, Xuân

2. **Dev Agents (7 agents)** - 1.5 hours each
   - Thúc, Lân, Tuấn, Huyền-Py, Hoàng, Huyền FE-QA, Trinh

3. **Research Agents (4 agents)** - 1 hour each
   - Hiếu, Nghĩa, Ngư, Cửa, Đôn

**Compression Steps per Agent:**
1. Reduce skill references: 26 → Top 5 (-15 minutes)
2. Compress PEN entries: 50+ → Top 10 (-30 minutes)
3. Compress WIN entries: 20+ → Top 5 (-15 minutes)
4. Remove redundant context (-30 minutes)
5. Validate L2 Cache < 500 tokens (-15 minutes)

**Total Phase 4:** 30 hours (~4 days)

---

## Success Metrics

### Skill Compression Goals

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Average Skill Size** | 677 lines | 242 lines | **-64%** (-435 lines) |
| **Total Enterprise Skills Size** | 10,157 lines | 3,629 lines | **-64%** (-6,528 lines) |
| **Skill Token Usage (avg)** | ~2,000 tokens | ~700 tokens | **-65%** |

### Agent Compression Goals

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Average Agent L2 Size** | ~800 lines (~250 tokens) | ~250 lines (~75 tokens) | **-69%** |
| **Skill References (avg)** | 26 skills | 5 skills | **-81%** |
| **PEN Entries (avg)** | 50+ entries | 10 entries | **-80%** |
| **WIN Entries (avg)** | 20+ entries | 5 entries | **-75%** |

### Framework Impact

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Registry Load Time** | ~3 MB | ~1 MB | **-67%** |
| **Agent Spawn Time** | ~5s | ~2s | **-60%** |
| **Context Window Usage** | ~80K tokens | ~30K tokens | **-63%** |

---

## Validation Checklist

### Per Skill Compressed

- [ ] GSTACK 12 principles still present
- [ ] YAML frontmatter intact
- [ ] Philosophy vivid and concise (20-25 lines)
- [ ] Prime Directives actionable (30-40 lines)
- [ ] ONE key table retained
- [ ] ONE best example retained
- [ ] Two-Pass workflow clear (15-20 lines)
- [ ] Meta-instructions with stopping policy (15-20 lines)
- [ ] Target size: 200-300 lines ✅
- [ ] Registry entry updated with compressed description

### Per Agent Refined

- [ ] L2 Cache < 500 tokens
- [ ] Skill references: Top 5 only
- [ ] PEN entries: Top 10 only (P0 > P1 > P2)
- [ ] WIN entries: Top 5 only
- [ ] Archetype, Pipeline, Competencies clear
- [ ] Current Focus updated (this sprint)
- [ ] No redundant context (removed verbosity)

---

## Timeline Summary

| Phase | Tasks | Duration | Savings |
|-------|-------|----------|---------|
| **Phase 1** | Compress top 5 skills | 1 day | -2,729 lines |
| **Phase 2** | Compress next 5 skills | 1 day | -1,751 lines |
| **Phase 3** | Compress final 3 skills | 0.5 day | -785 lines |
| **Phase 4** | Refine 20 agents | 4 days | -11,000 lines (agent files) |
| **Total** | 13 skills + 20 agents | **6.5 days** | **-15,265 lines** |

---

## Next Steps

### Immediate (Day 1)

1. Start Phase 1: Compress test-data-management (2 hours)
2. Compress high-level-design (2 hours)
3. Compress deployment-strategies (1.5 hours)

### Day 2

4. Compress secrets-config-management (1.5 hours)
5. Compress git-workflow-branching (1.5 hours)
6. Start Phase 2: Compress container-orchestration (1.5 hours)

### Day 3-4

7-13. Complete Phase 2 & 3 (compress remaining 8 skills)

### Day 5-10

14-33. Phase 4: Refine all 20 agents

---

**Status:** Ready to execute compression
**Expected Impact:** 64% skill size reduction, 69% agent size reduction
**Framework Benefit:** Faster spawns, lower context usage, easier maintenance

---

*Compression Strategy by Nash Agent Framework*
*2026-03-16*
