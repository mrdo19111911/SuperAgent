# Agent Name

## 1. IDENTITY
**Name:** [Agent Name]
**Archetype:** [Analyst/Builder/Critic/Strategist/Operator]
**Model:** [claude-sonnet-4.5/claude-opus-4]
**Role:** [One-line role description]

## 2. CONSTRAINTS
**Top PEN Entries (P0-P1):**
1. **PEN-XXX:** [Violation description → Prevention rule]
2. **PEN-YYY:** [Violation description → Prevention rule]
3. **PEN-ZZZ:** [Violation description → Prevention rule]

**Full PEN/WIN history:** `[[ram/agents/{agent}/pen_entries.md]]`

**Hard Rules:**
- [Rule 1]
- [Rule 2]

## 3. WORKFLOWS
**Primary Workflows:**
1. **[Workflow Name]:** [One-line description]
2. **[Workflow Name]:** [One-line description]

**Detailed processes:** `[[ram/agents/{agent}/workflows.md]]`

## 4. TOOLS
**Available Tools:**
- **[Tool Name]:** [One-line description]
- **[Tool Name]:** [One-line description]
- **[Tool Name]:** [One-line description]

**Tool usage examples:** `[[ram/agents/{agent}/tools.md]]`

## 5. BOOT

### 5.1 Model-Specific Tier Selection (v6.9 Token Optimization)

**Philosophy:** Different models excel at different tasks. Don't waste Opus/Pro's reasoning power on tool execution prompts. Don't burden Haiku with complex architecture decisions.

#### Tier Definitions

**MINI Tier (<200 tokens):**
- **For:** Reasoning-heavy tasks (Opus/Pro)
- **Load:** BRAIN.md + {agent}.md (identity only)
- **Skip:** Verbose workflows, full PEN/WIN history, tool examples
- **Use cases:** Architecture decisions, complex trade-offs, system design

**STANDARD Tier (≤500 tokens):**
- **For:** Balanced tasks (Sonnet)
- **Load:** BRAIN.md + {agent}.md (full)
- **Include:** Top 5 PEN/WIN entries, workflow summaries
- **Use cases:** Coding, reviews, moderate complexity tasks

**TOOL Tier (task-specific):**
- **For:** Simple operations (Haiku)
- **Load:** BRAIN.md + task-specific instructions only
- **Skip:** PEN/WIN, workflows (not needed for simple ops)
- **Use cases:** File operations, memory cleanup, simple queries

**FULL Tier (≤1,200 tokens):**
- **For:** Context-heavy tasks (Complex pipelines)
- **Load:** BRAIN.md + {agent}.md + referenced RAM
- **Include:** Full PEN/WIN + workflows + domain knowledge
- **Use cases:** Critical tasks, cross-cutting reviews, multi-agent coordination

#### Auto-Selection Rules

```python
def select_tier(model, task_type, task_complexity):
    if model in ['opus', 'pro']:
        if task_type == 'reasoning':
            return 'MINI'  # Max reasoning space
        elif task_type == 'execution':
            return 'STANDARD'  # Need some context

    elif model == 'sonnet':
        if task_complexity == 'trivial':
            return 'MINI'
        elif task_complexity in ['simple', 'complex']:
            return 'STANDARD'
        elif task_complexity == 'critical':
            return 'FULL'

    elif model == 'haiku':
        return 'TOOL'  # Always minimal

    return 'STANDARD'  # Default fallback
```

#### Token Budget by Tier

| Tier | BRAIN.md | Agent.md | PEN/WIN | Workflows | RAM | Total |
|------|----------|----------|---------|-----------|-----|-------|
| MINI | 300 | 150 (identity) | 0 | 0 | 0 | **450** |
| STANDARD | 300 | 500 | 100 (top 5) | 50 | 0 | **950** |
| TOOL | 300 | 100 (task) | 0 | 0 | 0 | **400** |
| FULL | 300 | 500 | 200 (all) | 200 | 0-3000 | **1200-4200** |

#### Implementation Examples

**Example 1: Phúc SA (Architect) - Opus for Design Decision**
```markdown
**Model:** opus-4
**Task:** Design multi-tenant RLS architecture
**Tier:** MINI (reasoning-heavy)
**Context loaded:**
  - BRAIN.md (300 tokens)
  - phuc-sa.md identity section only (150 tokens)
  - NO workflows, NO PEN/WIN (let Opus think fresh)
**Total:** 450 tokens → 95% budget to reasoning
```

**Example 2: Nhiên Janitor - Haiku for Cleanup**
```markdown
**Model:** haiku
**Task:** Clean L2 Cache files exceeding 500 tokens
**Tier:** TOOL
**Context loaded:**
  - BRAIN.md (300 tokens)
  - Task instruction: "Scan agents/*.md, move P3/P4 to archive" (100 tokens)
**Total:** 400 tokens → Fast, cheap, effective
```

**Example 3: Sơn QA - Sonnet for Integration Testing**
```markdown
**Model:** sonnet-4.5
**Task:** Review test coverage for payment module
**Tier:** STANDARD
**Context loaded:**
  - BRAIN.md (300 tokens)
  - son-qa.md full (500 tokens)
  - Top 5 PEN entries about missed RLS bugs (100 tokens)
  - Workflow summary (50 tokens)
**Total:** 950 tokens → Balanced context + execution space
```

#### Migration Guide (for existing agents)

**Step 1:** Add tier annotation to agent file header
```markdown
## 1. IDENTITY
**Name:** agent-name
**Model:** sonnet-4.5
**Default Tier:** STANDARD  ← ADD THIS
```

**Step 2:** Create tier-specific versions of agent.md
```
agents/core/phuc-sa.md           # STANDARD tier (≤500 tokens)
agents/core/phuc-sa.mini.md      # MINI tier (≤200 tokens) - identity only
agents/core/phuc-sa.full.md      # FULL tier (≤1200 tokens) - with RAM refs
```

**Step 3:** Update dispatch logic in NASH_SUBAGENT_PROMPTS.md
```bash
# Before spawning agent:
MODEL=$(get_model_for_task $TASK)
TIER=$(select_tier $MODEL $TASK_TYPE $COMPLEXITY)
CONTEXT=$(load_agent_context $AGENT $TIER)

# Spawn with tier-specific context
spawn_agent --model=$MODEL --context=$CONTEXT
```

#### Success Metrics

**Targets (after 4 weeks):**
- Opus/Pro tasks: 30% token reduction (MINI tier adoption)
- Haiku tasks: 50% token reduction (TOOL tier)
- Average: 25% overall reduction
- Quality: Zero regression (measured via PEN entries)

#### Validation Tests

```bash
# Test 1: Tier selection logic
./tests/test_tier_selection.sh

# Test 2: Token budgets
./tests/test_token_budgets.sh

# Test 3: Quality regression
./tests/test_tier_quality.sh
```

---

### 5.2 Standard Boot Protocol

**L2 Cache (Always loaded):**
- This file (`agents/{layer}/{agent}.md`) — ≤500 tokens (STANDARD tier)

**RAM (On-demand loading):**
- `ram/agents/{agent}/workflows.md` — Detailed process steps
- `ram/agents/{agent}/tools.md` — Tool usage examples
- `ram/agents/{agent}/pen_entries.md` — Full PEN/WIN history
- `ram/agents/{agent}/skills.md` — Skill deep dives (if applicable)

**HDD (Never preloaded):**
- Source code, schemas, documentation

**Boot Protocol:** Load L2 Cache → Load RAM files as needed via `system/ram_loader.py` (max depth 3)
