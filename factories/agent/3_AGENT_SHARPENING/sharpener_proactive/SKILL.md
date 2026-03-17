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

**Philosophy:** Upgrade agents from "functional" to "production-grade" using battle-tested patterns from OpenAI Agents SDK, LangGraph, CrewAI, AutoGen, and Beam.ai's 9 workflow patterns. Every recommendation must cite a specific principle or pattern from `system/BEST_PRACTICE_AGENT.md`.

**Core Mission:**
1. **Audit** against 5 core principles + 9 workflow patterns
2. **Identify gaps** with evidence (token bloat, missing validation)
3. **Apply fixes** using industry patterns (progressive loading, adversarial review)
4. **Measure impact** (token reduction %, quality improvement)
5. **Document upgrades** in agent's PEN/WIN sections

---

## Prerequisites

Before starting:
1. ✅ `system/BEST_PRACTICE_AGENT.md` exists (reference doc)
2. ✅ Agent file to sharpen (e.g., `agents/core/phuc-sa.md`)
3. ✅ (Optional) LEDGER.md for historical penalties
4. ✅ (Optional) Conversation transcripts

---

## Core Workflow (Track in TodoList)

```
Phase 1: Industry Standards Audit (5 Core Principles)
Phase 2: Workflow Pattern Analysis (9 Proven Patterns)
Phase 3: Token Optimization Assessment (6-Layer Defense)
Phase 4: Apply Targeted Improvements
Phase 5: Validation & Documentation
```

---

## Phase 1: Industry Standards Audit

### Load Reference Standards
Read `system/BEST_PRACTICE_AGENT.md` → extract 5 Core Principles:
1. **Context is Fuel, Not Cargo** (60-80% token reduction)
2. **Single Responsibility per Agent** (focused scope)
3. **Adversarial Validation** (Nash Triad in every output)
4. **Memory Hierarchy** (3-Tier: L2 Cache → RAM → HDD)
5. **Clear Boundaries** (contracts, error handling, idempotency)

### Audit Agent Against Principles
For each principle, score:
- ✅ **PASS** (90-100%): Fully implements with measurable results
- ⚠️ **PARTIAL** (50-89%): Present but incomplete/inefficient
- ❌ **FAIL** (0-49%): Missing or violated

Document: Current state, Evidence (checkboxes), Score, Gap, Fix

*See `references/5_core_principles_checklist.md` for detailed audit template*

---

## Phase 2: Workflow Pattern Analysis

### Identify Current Workflow
Map agent to one of **9 proven patterns:**
1. **ReAct** - Reasoning → Action loop (dynamic tasks)
2. **Plan-and-Execute** - Plan upfront (deterministic tasks)
3. **Critic/Reflection** - Build → Critique → Improve (quality-critical)
4. **Multi-Agent Debate** - Multiple perspectives (uncertain domains)
5. **Hierarchical Planning** - Manager delegates (complex/divisible)
6. **Tool-Use Chains** - Sequential tool calls (API workflows)
7. **Human-in-the-Loop** - AI proposes, human approves (high-stakes)
8. **Iterative Refinement** - Incremental improvement (creative/exploratory)
9. **Dynamic Routing** - MoE router selects specialist (diverse tasks)

**Audit questions:**
- Which pattern does agent currently use?
- Is it OPTIMAL for this role?
- Does it match pattern's best practices from reference doc?

Document: Current pattern, Optimal pattern, Gap, Token waste estimate, Fix

*See `references/workflow_patterns_catalog.md` for pattern details + best practices*

---

## Phase 3: Token Optimization Assessment

### Load 6-Layer Defense
From `system/TOKEN_OPTIMIZATION_ARCHITECTURE.md`:
1. **Layer 1: RAG** (Selective Retrieval) - 70% savings
2. **Layer 2: Compression** (Hierarchical) - 74% savings
3. **Layer 3: Structured Prompting** - 30% savings
4. **Layer 4: Modular Sub-agents** - 76% savings
5. **Layer 5: Shared Memory** (External DB) - 85% savings
6. **Layer 6: Progressive Disclosure** - 91% savings

**Overall target:** 82.5% reduction (20K → 3.5K tokens/task)

### Measure Current Token Usage
**Baseline:** avg_tokens_per_task, breakdown (system_prompt, PEN, WIN, skills, conversation)
**Target:** tokens after 80% reduction
**Layers applicable:** Which layers to apply

**Detection heuristics:**
- ❌ PEN/WIN entries >5KB → Layer 1 (RAG)
- ❌ Loading all skills upfront → Layer 6 (Progressive)
- ❌ Full conversation in context → Layer 2 (Compression)
- ❌ Repeated reference docs → Layer 5 (External memory)

---

## Phase 4: Apply Targeted Improvements

### Prioritize by ROI
**Formula:** `(Token Savings × Frequency) / Implementation Effort`

**Priority tiers:**
- 🔥 **P0 (Do First):** High savings, low effort
- 🟡 **P1 (Next):** High savings, medium effort
- 🔵 **P2 (Nice-to-have):** Medium savings, low effort
- ⚪ **P3 (Skip):** Low savings OR high effort

### Apply Industry Patterns
For each gap, select pattern from BEST_PRACTICE_AGENT.md:
- **Progressive Loading:** Tier 0 → 1 → 2 → 3 (91% savings)
- **LRU Cache:** Deterministic ops (reduce redundant calls)
- **External Memory:** Vector DB or grep fallback
- **Conversation Compression:** Summarize old turns
- **Adversarial Review:** Challenger agent for validation
- **Modular Sub-agents:** Single-task specialists
- **Clear Contracts:** Input/output schemas

**Document:** Pattern applied, Code/config changes, Expected savings, Actual savings (after testing)

*See `README.md` for implementation examples*

---

## Phase 5: Validation & Documentation

### Validate Improvements
1. **Token measurement:** Before/after comparison
2. **Quality check:** Run sample tasks, verify no degradation
3. **Performance:** Latency, accuracy metrics
4. **Cross-validation:** Test on held-out tasks

### Document Upgrades
Add to agent file:
```markdown
## SHARPENING_LOG

### Session {date} | agent-sharpening-2026 v2.0

**Audit Scores:**
- Context Management: FAIL → PASS (applied Layer 6 Progressive)
- Workflow Pattern: ReAct → Plan-and-Execute (removed 7 loops)

**Improvements:**
1. Token reduction: 18.5K → 3.7K (80% ↓)
2. Quality: No degradation (validated on 12 sample tasks)
3. Patterns applied: Progressive loading, External memory, LRU cache

**Evidence:** sharpening-workspace/{agent}/session-{date}/
```

### Update PEN/WIN Entries
If sharpening fixes recurring issues → create WIN entry
If new constraints added → optionally create PEN entry for future reference

---

## Best Practices

**Cite sources:** Every recommendation → cite principle/pattern from reference docs
**Measure everything:** Before/after tokens, quality metrics, latency
**Validate thoroughly:** Cross-validate on held-out tasks, check for degradation
**Document concretely:** Code diffs, token breakdowns, evidence files

**Stop conditions:**
- Token reduction meets target (60-80%)
- Quality validated (no regressions)
- User approves changes
- Max 3 iterations (prevent overfitting)

---

## Reference Files

- `references/5_core_principles_checklist.md` - Detailed audit template for 5 principles
- `references/workflow_patterns_catalog.md` - 9 patterns with best practices
- `README.md` - Sharpening guide with implementation examples

---

## Summary Loop

```
1. Load BEST_PRACTICE_AGENT.md standards
2. Audit agent: 5 principles + 9 patterns
3. Measure token baseline + identify bloat signals
4. Prioritize fixes by ROI
5. Apply industry patterns (progressive, adversarial, modular)
6. Validate: tokens, quality, performance
7. Document upgrades in SHARPENING_LOG
8. Update PEN/WIN entries as needed
```

**Key difference from reactive sharpener:**
- **Proactive:** Applies 2026 industry standards even without PEN entries
- **Reactive:** Fixes known production failures (PEN-focused)

Use proactive for: Upgrading to modern standards, token optimization, pattern adoption
Use reactive for: Fixing specific production failures from LEDGER/PEN entries

---

**Sharpen agents to production-grade using battle-tested industry patterns.** ⚡
