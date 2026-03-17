---
name: agent-sharpening-2026
version: 2.0.0
description: |
  Apply 2026 industry best practices to sharpen Nash agents using patterns from
  OpenAI Agents SDK, LangGraph, CrewAI, and top production frameworks. This skill
  systematically audits agents against 5 core principles (Context Management,
  Single Responsibility, Adversarial Validation, Memory Hierarchy, Clear Boundaries),
  identifies gaps using 9 proven workflow patterns, and applies targeted improvements
  to reduce tokens by 60-80% while increasing quality. Use when you want to upgrade
  agents to modern standards, fix token bloat, improve verification rigor, or apply
  industry patterns from BEST_PRACTICE_AGENT.md.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - TodoWrite
  - WebSearch
tags:
  - agent-sharpening
  - token-optimization
  - best-practices
  - industry-standards
  - 2026-patterns
---

# Agent Sharpening 2026
## Apply Industry Best Practices to Nash Agents

**Philosophy:** You are upgrading agents from "functional" to "production-grade" using battle-tested patterns from top AI frameworks. Your audit is based on **BEST_PRACTICE_AGENT.md** - a synthesis of OpenAI Agents SDK, LangGraph, CrewAI, AutoGen, and 9 proven workflow patterns from Beam.ai. Every recommendation must cite a specific principle or pattern from the reference doc.

**Core Mission:**
1. **Audit** agent against 5 core principles + 9 workflow patterns
2. **Identify gaps** with evidence (token bloat, missing validation, unclear scope)
3. **Apply fixes** using industry patterns (progressive loading, adversarial review, etc.)
4. **Measure impact** (token reduction %, quality improvement)
5. **Document upgrades** in agent's PEN/WIN sections

---

## Prerequisites

**Before starting, ensure you have:**
1. ✅ `system/BEST_PRACTICE_AGENT.md` exists (reference doc)
2. ✅ Agent file to sharpen (e.g., `agents/core/phuc-sa.md`)
3. ✅ (Optional) LEDGER.md for historical penalties
4. ✅ (Optional) Conversation transcripts showing agent performance

---

## Core Workflow

Track progress in TodoList (5 phases):

```markdown
Phase 1: Industry Standards Audit (5 Core Principles)
Phase 2: Workflow Pattern Analysis (9 Proven Patterns)
Phase 3: Token Optimization Assessment (6-Layer Defense)
Phase 4: Apply Targeted Improvements
Phase 5: Validation & Documentation
```

---

## Phase 1: Industry Standards Audit

### Step 1.1: Load Reference Standards

Read `system/BEST_PRACTICE_AGENT.md` and extract:

**5 Core Principles to audit:**
1. ✅ **Context is Fuel, Not Cargo** (60-80% token reduction target)
2. ✅ **Single Responsibility per Agent** (focused scope)
3. ✅ **Adversarial Validation** (Nash Triad in every output)
4. ✅ **Memory Hierarchy** (3-Tier: L2 Cache → RAM → HDD)
5. ✅ **Clear Boundaries** (contracts, error handling, idempotency)

### Step 1.2: Audit Agent Against Principles

For the target agent (e.g., `agents/core/phuc-sa.md`), score each principle:

**Scoring rubric:**
- ✅ **PASS** (90-100%): Fully implements principle with measurable results
- ⚠️ **PARTIAL** (50-89%): Principle present but incomplete/inefficient
- ❌ **FAIL** (0-49%): Principle missing or violated

**Audit template:**

```markdown
## Principle 1: Context is Fuel, Not Cargo

**Current state:**
- Agent loads: [X KB] upfront
- Token budget: [Y tokens/task]
- Context loading strategy: [Eager/Progressive/Hybrid]

**Evidence:**
- [ ] Progressive loading (Tier 0 → 1 → 2 → 3)
- [ ] LRU cache for deterministic ops
- [ ] Conversation compression
- [ ] External memory (Vector DB / grep fallback)

**Score:** [PASS/PARTIAL/FAIL]
**Gap:** [Specific issue, e.g., "Loads all 47 PEN entries upfront = 8KB waste"]
**Fix:** [Apply Layer X from TOKEN_OPTIMIZATION_ARCHITECTURE.md]
```

Repeat for all 5 principles.

---

## Phase 2: Workflow Pattern Analysis

### Step 2.1: Identify Agent's Current Workflow

Map agent's workflow to one of **9 proven patterns** (from BEST_PRACTICE_AGENT.md):

| Pattern | Description | When to Use | Token Cost |
|---------|-------------|-------------|------------|
| 1. **ReAct** | Reasoning → Action loop | Dynamic tasks, tool use | Medium (3-10 loops) |
| 2. **Plan-and-Execute** | Plan upfront, execute steps | Multi-step, deterministic | Low (single planning phase) |
| 3. **Critic/Reflection** | Build → Critique → Improve | Quality-critical work | High (2x iterations) |
| 4. **Multi-Agent Debate** | Multiple perspectives converge | Uncertain domains | High (N agents × context) |
| 5. **Hierarchical Planning** | Manager delegates sub-tasks | Complex, divisible tasks | Low (parallel execution) |
| 6. **Tool-Use Chains** | Sequential tool calls | API workflows | Low (deterministic flow) |
| 7. **Human-in-the-Loop** | AI proposes, human approves | High-stakes decisions | Variable (wait time) |
| 8. **Iterative Refinement** | Incremental improvement | Creative/exploratory tasks | High (multiple passes) |
| 9. **Dynamic Routing** | MoE router selects specialist | Diverse task types | Low (routing overhead only) |

**Audit questions:**
1. Which pattern does this agent currently use?
2. Is it the OPTIMAL pattern for this agent's role?
3. Does it match the pattern's best practices from BEST_PRACTICE_AGENT.md?

**Example finding:**
```markdown
Agent: Phúc SA (Software Architect)
Current pattern: ReAct (Reasoning → Action loop)
Optimal pattern: Plan-and-Execute (architecture is deterministic, not exploratory)
Gap: Using 10-loop ReAct when 1-shot planning would suffice
Token waste: ~15K tokens/task (7 unnecessary loops)
Fix: Refactor to Plan-and-Execute pattern (see BEST_PRACTICE_AGENT.md lines 180-220)
```

---

## Phase 3: Token Optimization Assessment

### Step 3.1: Load Token Optimization Standards

Read `system/TOKEN_OPTIMIZATION_ARCHITECTURE.md` for **6-Layer Defense**:

1. **Layer 1: RAG (Selective Retrieval)** - 70% savings
2. **Layer 2: Compression (Hierarchical)** - 74% savings
3. **Layer 3: Structured Prompting** - 30% savings
4. **Layer 4: Modular Sub-agents** - 76% savings
5. **Layer 5: Shared Memory (External DB)** - 85% savings
6. **Layer 6: Progressive Disclosure** - 91% savings

**Overall target:** 82.5% reduction (20K → 3.5K tokens/task)

### Step 3.2: Measure Agent's Current Token Usage

**Baseline metrics:**
```json
{
  "agent": "phuc-sa",
  "avg_tokens_per_task": 18500,
  "breakdown": {
    "system_prompt": 2500,
    "pen_entries": 8000,    // ← Bloat detected
    "win_entries": 3000,
    "skills": 4500,
    "conversation": 500
  },
  "target_after_optimization": 3700,  // 80% reduction
  "layers_applicable": [1, 2, 5, 6]   // Which layers to apply
}
```

**Detection heuristics:**
- ❌ **Bloat signal 1:** PEN/WIN entries > 5KB → Apply Layer 1 (RAG)
- ❌ **Bloat signal 2:** Loading all skills upfront → Apply Layer 6 (Progressive)
- ❌ **Bloat signal 3:** Full conversation in context → Apply Layer 2 (Compression)
- ❌ **Bloat signal 4:** Repeated reference docs → Apply Layer 5 (External memory)

---

## Phase 4: Apply Targeted Improvements

### Step 4.1: Prioritize Fixes by ROI

**ROI formula:** `(Token Savings × Frequency) / Implementation Effort`

**Priority tiers:**
- 🔥 **P0 (Do First):** High savings, low effort (e.g., add progressive loading flag)
- ⚡ **P1 (Do Next):** High savings, medium effort (e.g., extract PENs to Vector DB)
- 💎 **P2 (Nice-to-Have):** Medium savings, high effort (e.g., refactor to new workflow pattern)

### Step 4.2: Apply Industry Patterns

For each identified gap, apply the corresponding fix from BEST_PRACTICE_AGENT.md:

#### Fix Template:

```markdown
## Fix #1: Add Progressive Loading (Layer 6)

**Gap:** Agent loads all 47 PEN entries upfront (8KB waste)
**Pattern source:** BEST_PRACTICE_AGENT.md, lines 100-145 (Memory Hierarchy)
**Industry precedent:** OpenAI Agents SDK Session Memory (lazy loading)

**Implementation:**

1. Update agent file header:
```yaml
memory_strategy: progressive
tier_0_budget: 500   # Core identity only
tier_1_budget: 1500  # + Critical PENs (P0 only)
tier_2_budget: 3000  # + Relevant skills (on-demand)
tier_3_budget: 5000  # + Full context (if needed)
```

2. Add to PEN section:
```markdown
### PEN Entry Loading Strategy (NEW - v2.0)

**Tier 0 (Always loaded):**
- P0 penalties only (critical constraints)
- Agent role + core skills
- Budget: 500 tokens

**Tier 1 (Load if task matches domain):**
- P1 penalties related to current task type
- Triggered by: keyword match in task description
- Budget: +1000 tokens

**Tier 2 (Load on-demand):**
- P2-P3 penalties (reference only)
- Loaded when: agent explicitly asks for "past failures in domain X"
- Budget: +1500 tokens

**Tier 3 (Full context - rare):**
- All PEN/WIN entries
- Only for: critical reviews, comprehensive audits
- Budget: +2000 tokens
```

**Verification:**
- ✅ Baseline task uses Tier 0 only (500 tokens)
- ✅ Relevant task triggers Tier 1 (1500 tokens)
- ✅ Complex task escalates to Tier 2 (3000 tokens)
- ✅ Audit task uses Tier 3 (5000 tokens)

**Expected savings:** 8000 → 500-3000 tokens (70-94% reduction)
```

### Step 4.3: Document Changes in Agent File

Add to agent's **WIN** section:

```markdown
## WIN: Sharpened with Industry Best Practices (2026-03-16)

**Applied patterns from BEST_PRACTICE_AGENT.md:**
1. ✅ Progressive Loading (Layer 6) - 70% token reduction
2. ✅ Adversarial Validation (Nash Triad in Phase D) - Eliminated self-approval
3. ✅ Plan-and-Execute workflow - Reduced 10 ReAct loops → 1 planning phase

**Measurable improvements:**
- Token usage: 18500 → 4200 (-77%)
- Quality score: +15% (fewer P1 penalties)
- Task completion time: -30% (fewer iteration loops)

**Source:** agent-sharpening-2026 skill (v2.0.0)
**Audit date:** 2026-03-16
**Next review:** 2026-06-16 (quarterly)
```

---

## Phase 5: Validation & Documentation

### Step 5.1: Create Before/After Comparison

**Generate report:**

```markdown
# Agent Sharpening Report: Phúc SA
## Applied 2026 Industry Best Practices

**Date:** 2026-03-16
**Skill:** agent-sharpening-2026 v2.0.0
**Reference:** BEST_PRACTICE_AGENT.md

---

### Executive Summary

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Avg Tokens/Task | 18,500 | 4,200 | -77% ✅ |
| Quality Score | 72/100 | 87/100 | +21% ✅ |
| Task Time (avg) | 8.5 min | 5.9 min | -31% ✅ |
| P1 Penalties/Month | 12 | 3 | -75% ✅ |

---

### Gaps Identified (5 Core Principles)

1. **Context Management:** ❌ FAIL (loaded 8KB PEN entries upfront)
2. **Single Responsibility:** ⚠️ PARTIAL (role clear, but scope drift in 3 tasks)
3. **Adversarial Validation:** ✅ PASS (Nash Triad enforced)
4. **Memory Hierarchy:** ❌ FAIL (no progressive loading)
5. **Clear Boundaries:** ⚠️ PARTIAL (contracts present, idempotency missing)

---

### Improvements Applied

#### 1. Progressive Loading (Layer 6)
**Pattern:** Memory Hierarchy (BEST_PRACTICE_AGENT.md:100-145)
**Change:** 4-tier loading strategy (Tier 0: 500 tokens → Tier 3: 5000 tokens)
**Impact:** -77% token usage
**Code:** Added `memory_strategy: progressive` to agent header

#### 2. Workflow Pattern Upgrade
**Pattern:** Plan-and-Execute (BEST_PRACTICE_AGENT.md:180-220)
**Change:** ReAct loop (10 iterations) → Single planning phase
**Impact:** -15K tokens/task, -30% completion time
**Code:** Refactored Phase C (Execute) to use structured plan upfront

#### 3. Idempotency Rules (Clear Boundaries)
**Pattern:** Production Best Practices (BEST_PRACTICE_AGENT.md:520-580)
**Change:** Added retry/dedup strategies to CONTRACT_DRAFT section
**Impact:** Eliminated 8 duplicate API calls in last 30 tasks
**Code:** New section in agent file (lines 245-280)

---

### Verification Evidence

**Test 1: Token Usage (Baseline Task)**
```bash
# Before: Architecture review for simple CRUD API
Tokens used: 18,200
Time: 7.2 min

# After: Same task with progressive loading
Tokens used: 3,800 (Tier 1: 1500 tokens sufficient)
Time: 4.8 min
Result: ✅ -79% tokens, -33% time
```

**Test 2: Quality (Complex Task)**
```bash
# Before: Multi-service architecture review
P1 penalties: 2 (missed edge cases, incomplete contracts)
LEDGER score: -40

# After: Same task type with Plan-and-Execute pattern
P1 penalties: 0
LEDGER score: +20
Result: ✅ Quality improved, adversarial review caught issues
```

**Test 3: Scope Adherence (Boundary Test)**
```bash
# Before: Asked to review architecture, started writing code
Scope drift: YES (violated Single Responsibility)

# After: Same request with clear boundaries
Scope drift: NO (declined code writing, stayed in architect role)
Result: ✅ Single Responsibility enforced
```

---

### Recommendations for Next Review (2026-06-16)

1. **Monitor Tier escalation rate:** If >30% of tasks use Tier 3, refine Tier 1 triggers
2. **Benchmark against other agents:** Compare token efficiency across team
3. **Evaluate new patterns:** Check Beam.ai for 2026 H2 updates
4. **Compress PEN entries:** If PEN count >100, apply hierarchical summarization (Layer 2)

---

### Industry Benchmarks Met

✅ **Token efficiency:** 4.2K/task (Industry avg: 8-12K) - Top 10%
✅ **Quality score:** 87/100 (Industry avg: 70-80) - Top 25%
✅ **Adversarial validation:** 100% coverage (Many frameworks skip this)
✅ **Memory hierarchy:** 4-tier progressive (Most use 2-tier or none)

**Conclusion:** Agent now meets 2026 production standards. Quarterly review recommended.
```

### Step 5.2: Update Agent's Metadata

Add to agent file frontmatter:

```yaml
sharpening_history:
  - date: 2026-03-16
    skill: agent-sharpening-2026
    version: 2.0.0
    improvements:
      - Progressive loading (Layer 6)
      - Plan-and-Execute workflow
      - Idempotency rules
    token_reduction: 77%
    quality_improvement: 21%
    next_review: 2026-06-16
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Blindly Copy-Paste Best Practices
**Wrong approach:**
```markdown
"I added all 9 workflow patterns to every agent"
```

**Right approach:**
```markdown
"I audited agent's role (Architect), identified current pattern (ReAct),
found optimal pattern for role (Plan-and-Execute), applied targeted change"
```

**Why:** Context matters. Not every pattern fits every agent.

---

### ❌ Anti-Pattern 2: Optimize Without Measuring
**Wrong approach:**
```markdown
"I think this agent uses too many tokens, so I removed some PEN entries"
```

**Right approach:**
```markdown
"Measured baseline: 18.5K tokens/task. Breakdown: PEN=8K (bloat).
Applied Layer 6 (progressive loading). New baseline: 4.2K. Verified with 10 test tasks."
```

**Why:** Optimization without metrics = guessing. Always measure before/after.

---

### ❌ Anti-Pattern 3: Ignore Agent's Existing PEN/WIN Entries
**Wrong approach:**
```markdown
"Industry says use Plan-and-Execute, so I'll force it on this agent"
```

**Right approach:**
```markdown
"Agent has 12 PEN entries about missed edge cases in ReAct loops.
Switching to Plan-and-Execute addresses 8 of those PENs. Keeping ReAct
for exploratory tasks where upfront planning is impossible."
```

**Why:** Agent's history > generic best practice. PENs are production data.

---

### ❌ Anti-Pattern 4: Over-Engineer Simple Agents
**Wrong approach:**
```markdown
"This simple bug-fix agent now has 6-tier memory hierarchy!"
```

**Right approach:**
```markdown
"Bug-fix agent uses <2K tokens/task. No optimization needed.
Applied only Principle 2 (Single Responsibility) to prevent scope drift."
```

**Why:** Premature optimization wastes time. Only optimize bottlenecks.

---

## Success Metrics

### Immediate (Post-Sharpening)
- ✅ Token reduction: 60-80% (or justify why lower)
- ✅ All 5 principles: PASS or PARTIAL (no FAILs remaining)
- ✅ Workflow pattern: Matched to agent role
- ✅ Before/after report: Generated with verification evidence

### Short-term (1 month)
- ✅ P1 penalties: -50% reduction
- ✅ Quality score: +15-25% improvement
- ✅ Task completion time: -20-30% reduction
- ✅ No new PEN entries contradicting applied patterns

### Long-term (3 months)
- ✅ Agent in top quartile of team (token efficiency)
- ✅ Quarterly review completed on schedule
- ✅ New patterns from industry adopted (e.g., Beam.ai 2026 H2 updates)
- ✅ Sharpening workflow automated (evals run weekly, auto-flag regressions)

---

## Reference Integration

**This skill depends on:**
1. ✅ `system/BEST_PRACTICE_AGENT.md` - 5 principles, 9 patterns, framework comparison
2. ✅ `system/TOKEN_OPTIMIZATION_ARCHITECTURE.md` - 6-layer defense, benchmarks
3. ✅ `skill_factory/agent_skill_sharpener/` - Existing sharpener (PEN/WIN focused)
4. ✅ `system/NASH_SUBAGENT_PROMPTS.md` - Dispatch templates (for workflow patterns)

**Key difference from existing sharpener:**
- **agent_skill_sharpener:** PEN/WIN mining → regression tests (reactive)
- **agent_sharpening_2026:** Industry audit → proactive upgrades (preventive)

**Use together:**
1. Run **agent_sharpening_2026** quarterly (apply new industry standards)
2. Run **agent_skill_sharpener** after each P0/P1 penalty (fix specific failures)

---

## Example Usage

### Scenario 1: Quarterly Agent Upgrade
```bash
User: "Sharpen all core agents using 2026 best practices"

Agent (using this skill):
1. Read BEST_PRACTICE_AGENT.md (reference standards)
2. For each agent in agents/core/:
   - Audit 5 principles → identify gaps
   - Map workflow pattern → find optimal fit
   - Measure token usage → apply 6-layer defense
   - Generate before/after report
3. Prioritize by ROI (biggest token savers first)
4. Apply fixes, document in WIN sections
5. Schedule next review (2026-06-16)

Result: 9 agents upgraded, avg 72% token reduction, +18% quality improvement
```

### Scenario 2: Fix Token Bloat in Single Agent
```bash
User: "Phúc SA is using 20K tokens/task, optimize it"

Agent (using this skill):
1. Measure baseline: 18.5K tokens
2. Breakdown: PEN entries = 8K (bloat detected)
3. Audit Principle 1 (Context Management): FAIL
4. Apply Layer 6 (Progressive Loading):
   - Tier 0: 500 tokens (core identity)
   - Tier 1: 1500 tokens (relevant PENs)
   - Tier 2-3: on-demand
5. Verify: New baseline = 3.8K tokens (-79%)
6. Document in WIN section

Result: Token usage reduced from 18.5K → 3.8K, quality maintained
```

### Scenario 3: Adopt New Industry Pattern
```bash
User: "I read about Plan-and-Execute from LangGraph, apply it to our architects"

Agent (using this skill):
1. Read BEST_PRACTICE_AGENT.md lines 180-220 (Plan-and-Execute pattern)
2. Identify candidates: Phúc SA, Quang, Hiếu (all architects)
3. Audit current pattern: All using ReAct (10 loops avg)
4. Gap: Architecture is deterministic, not exploratory
5. Refactor to Plan-and-Execute:
   - Phase A: Criteria (plan upfront)
   - Phase C: Execute (single-pass implementation)
   - No loops (except Phase B review iterations)
6. Measure: -15K tokens/task, -30% completion time

Result: 3 architects upgraded to optimal workflow pattern
```

---

## Output Format

After sharpening, provide:

1. **Executive Summary** (3-5 bullet points)
2. **Gaps Identified** (5 principles scored)
3. **Improvements Applied** (with pattern sources cited)
4. **Before/After Metrics** (token usage, quality, time)
5. **Verification Evidence** (test cases showing improvement)
6. **Next Review Date** (quarterly recommended)

Save as: `artifacts/{task}/AGENT_SHARPENING_REPORT_{agent}_{date}.md`

---

## Final Checklist

Before completing, verify:

- [ ] All 5 principles audited (scored PASS/PARTIAL/FAIL)
- [ ] Workflow pattern identified and optimized
- [ ] Token usage measured (before/after with ≥10 test tasks)
- [ ] Improvements cited from BEST_PRACTICE_AGENT.md (line numbers)
- [ ] Before/after report generated
- [ ] Agent's WIN section updated
- [ ] Agent's frontmatter includes sharpening_history
- [ ] Next review date set (quarterly)
- [ ] Success metrics defined (immediate, short-term, long-term)

---

**Version:** 2.0.0
**Last Updated:** 2026-03-16
**Maintained By:** Nash Agent Framework
**Reference Doc:** system/BEST_PRACTICE_AGENT.md
**Upgrade Frequency:** Quarterly (align with industry updates)
