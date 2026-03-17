# Agent Sharpening 2026
## Apply Industry Best Practices to Nash Agents

**Version:** 2.0.0
**Last Updated:** 2026-03-16
**Reference:** [BEST_PRACTICE_AGENT.md](../../system/BEST_PRACTICE_AGENT.md)

---

## Overview

This skill systematically upgrades Nash agents to 2026 industry standards using patterns from:
- **OpenAI Agents SDK** (Session Memory, Context Personalization)
- **LangGraph** (Graph-based workflows)
- **CrewAI** (Role-based agents)
- **AutoGen/AG2** (Conversational patterns)
- **Beam.ai** (9 Agentic Workflow Patterns)

**Key Difference from `agent_skill_sharpener`:**
- **agent_skill_sharpener:** Reactive (fix PEN entries after failures)
- **agent_sharpening_2026:** Proactive (apply industry standards before failures)

**Use Together:**
1. Run **agent_sharpening_2026** quarterly (preventive maintenance)
2. Run **agent_skill_sharpener** after P0/P1 penalties (incident response)

---

## When to Use

✅ **Use this skill when:**
- Quarterly agent review is due
- Agent has token bloat (>10K tokens/task)
- New industry patterns released (e.g., Beam.ai 2026 H2 updates)
- Agent quality score declining (<70/100)
- Onboarding new agents (establish baseline standards)

❌ **Don't use when:**
- Agent already optimized (<5K tokens/task, quality >85/100)
- Fixing specific PEN entry (use `agent_skill_sharpener` instead)
- Agent is simple (<2K tokens/task, stable performance)

---

## Core Audit Framework

### 5 Core Principles (Mandatory)

Every agent is scored against:

1. **Context is Fuel, Not Cargo** (60-80% token reduction target)
   - Progressive loading (Tier 0-3)
   - LRU caching
   - Conversation compression
   - External memory (Vector DB)

2. **Single Responsibility per Agent** (Focused scope)
   - Clear role boundaries
   - No scope drift
   - Delegation over expansion

3. **Adversarial Validation** (Nash Triad)
   - Thesis → Anti-Thesis → Synthesis
   - Zero-sum scoring
   - No self-approval

4. **Memory Hierarchy** (3-Tier: L2 → RAM → HDD)
   - L2 Cache: <500 tokens (always loaded)
   - RAM: On-demand deep reference
   - HDD: Never preloaded

5. **Clear Boundaries** (Contracts + Error Handling)
   - API contracts
   - Idempotency rules
   - Error codes
   - Retry strategies

**Scoring:** PASS (90-100%) | PARTIAL (50-89%) | FAIL (0-49%)

---

### 9 Workflow Patterns (Context-Aware)

Map agent to optimal pattern:

| # | Pattern | Best For | Token Cost | Example Agent |
|---|---------|----------|------------|---------------|
| 1 | ReAct | Dynamic tasks, tool use | Medium | Tùng Diag |
| 2 | Plan-and-Execute | Multi-step, deterministic | Low | Phúc SA |
| 3 | Critic/Reflection | Quality-critical work | High | Mộc |
| 4 | Multi-Agent Debate | Uncertain domains | High | Nash Triad |
| 5 | Hierarchical Planning | Complex, divisible tasks | Low | Dũng PM |
| 6 | Tool-Use Chains | API workflows | Low | CI/CD Agent |
| 7 | Human-in-the-Loop | High-stakes decisions | Variable | User Agent |
| 8 | Iterative Refinement | Creative/exploratory | High | Châu UX |
| 9 | Dynamic Routing | Diverse task types | Low | MoE Router |

**Audit:** Is agent using optimal pattern for its role?

---

### 6-Layer Token Defense

Apply layers based on bloat signals:

| Layer | Strategy | Savings | When to Apply |
|-------|----------|---------|---------------|
| 1 | RAG (Selective Retrieval) | 70% | PEN/WIN entries >5KB |
| 2 | Compression (Hierarchical) | 74% | Conversation history >3K |
| 3 | Structured Prompting | 30% | Unstructured prompts |
| 4 | Modular Sub-agents | 76% | God Agent anti-pattern |
| 5 | Shared Memory (External DB) | 85% | Repeated reference docs |
| 6 | Progressive Disclosure | 91% | Loading all context upfront |

**Target:** 82.5% overall reduction (20K → 3.5K tokens/task)

---

## Typical Workflow

### Phase 1: Industry Standards Audit (30 min)
1. Load `BEST_PRACTICE_AGENT.md` reference
2. Read target agent file
3. Score 5 core principles (PASS/PARTIAL/FAIL)
4. Identify gaps with evidence

**Output:** Audit report with principle scores

---

### Phase 2: Workflow Pattern Analysis (20 min)
1. Map agent's current workflow to 9 patterns
2. Identify optimal pattern for agent's role
3. Calculate token waste from suboptimal pattern
4. Cite industry precedent from reference doc

**Output:** Pattern recommendation with ROI calculation

---

### Phase 3: Token Optimization Assessment (15 min)
1. Measure baseline token usage
2. Break down by component (system prompt, PENs, skills, etc.)
3. Detect bloat signals
4. Select applicable layers from 6-layer defense

**Output:** Token breakdown + optimization plan

---

### Phase 4: Apply Targeted Improvements (45 min)
1. Prioritize by ROI: `(Token Savings × Frequency) / Effort`
2. Apply fixes from BEST_PRACTICE_AGENT.md (cite line numbers)
3. Update agent file (header, PEN/WIN sections)
4. Add sharpening_history to frontmatter

**Output:** Updated agent file + implementation log

---

### Phase 5: Validation & Documentation (20 min)
1. Run ≥10 test tasks (before/after comparison)
2. Measure token reduction, quality improvement, time savings
3. Generate before/after report
4. Set next review date (quarterly)

**Output:** Sharpening report + success metrics

**Total time:** ~2 hours per agent

---

## Success Metrics

### Immediate (Post-Sharpening)
- ✅ Token reduction: 60-80%
- ✅ All 5 principles: PASS or PARTIAL (no FAILs)
- ✅ Workflow pattern: Matched to role
- ✅ Report generated with verification

### Short-term (1 month)
- ✅ P1 penalties: -50%
- ✅ Quality score: +15-25%
- ✅ Task time: -20-30%
- ✅ No contradicting PEN entries

### Long-term (3 months)
- ✅ Top quartile (token efficiency)
- ✅ Quarterly review on schedule
- ✅ New patterns adopted
- ✅ Evals automated (weekly)

---

## Example Outputs

### Before Sharpening: Phúc SA (Architect)
```yaml
avg_tokens_per_task: 18,500
quality_score: 72/100
completion_time: 8.5 min
workflow_pattern: ReAct (10 loops)
p1_penalties_per_month: 12
```

### After Sharpening: Phúc SA
```yaml
avg_tokens_per_task: 4,200  # -77% ✅
quality_score: 87/100       # +21% ✅
completion_time: 5.9 min    # -31% ✅
workflow_pattern: Plan-and-Execute  # Optimized ✅
p1_penalties_per_month: 3   # -75% ✅
```

**Improvements applied:**
1. Progressive loading (Layer 6) - Reduced PEN entries from 8KB → 0.5-3KB
2. Plan-and-Execute workflow - Eliminated 9 unnecessary ReAct loops
3. Idempotency rules - Prevented duplicate API calls

**Industry benchmarks met:**
- Token efficiency: 4.2K/task (Industry avg: 8-12K) - **Top 10%** 🏆
- Quality score: 87/100 (Industry avg: 70-80) - **Top 25%** 🏆

---

## Anti-Patterns to Avoid

### ❌ Don't: Blindly copy-paste best practices
Every agent is different. Audit first, apply contextually.

### ❌ Don't: Optimize without measuring
Always measure baseline, then verify improvements with ≥10 test tasks.

### ❌ Don't: Ignore agent's PEN/WIN history
Agent's production data > generic best practice. PENs are gold.

### ❌ Don't: Over-engineer simple agents
If agent uses <2K tokens and performs well, leave it alone.

---

## References

### Primary Reference
- **[BEST_PRACTICE_AGENT.md](../../system/BEST_PRACTICE_AGENT.md)** - 5 principles, 9 patterns, framework comparison

### Supporting References
- **[TOKEN_OPTIMIZATION_ARCHITECTURE.md](../../system/TOKEN_OPTIMIZATION_ARCHITECTURE.md)** - 6-layer defense
- **[NASH_SUBAGENT_PROMPTS.md](../../system/templates/NASH_SUBAGENT_PROMPTS.md)** - Dispatch templates
- **[agent_skill_sharpener](../agent_skill_sharpener/)** - Reactive PEN/WIN sharpener

### Industry Sources (Cited in BEST_PRACTICE_AGENT.md)
- OpenAI Agents SDK: https://github.com/openai/openai-agents-python
- OpenAI Cookbook: https://cookbook.openai.com/examples/agents_sdk/
- Beam.ai: https://beam.ai/agentic-insights/the-9-best-agentic-workflow-patterns-to-scale-ai-agents-in-2026
- Hatchworks: https://hatchworks.com/blog/ai-agents/ai-agent-design-best-practices/

---

## Skill Metadata

```yaml
name: agent-sharpening-2026
version: 2.0.0
tags:
  - agent-sharpening
  - token-optimization
  - best-practices
  - industry-standards
  - 2026-patterns
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
maintenance:
  update_frequency: quarterly
  next_review: 2026-06-16
  changelog:
    - 2026-03-16: Initial release (v2.0.0)
```

---

## Quick Start

```bash
# 1. Ensure reference doc exists
ls -lh system/BEST_PRACTICE_AGENT.md

# 2. Sharpen a single agent
claude --agent skill_factory/agent_sharpening_2026/SKILL.md \
  "Sharpen agents/core/phuc-sa.md using 2026 best practices"

# 3. Sharpen all core agents (quarterly review)
claude --agent skill_factory/agent_sharpening_2026/SKILL.md \
  "Quarterly review: sharpen all agents in agents/core/"

# 4. Fix specific token bloat
claude --agent skill_factory/agent_sharpening_2026/SKILL.md \
  "Agent Mộc is using 22K tokens/task, optimize it"
```

---

**Maintained by:** Nash Agent Framework
**License:** MIT
**Upgrade Frequency:** Quarterly (align with industry updates)
