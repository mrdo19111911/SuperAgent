# AGENT BUILDING MASTER GUIDE
## Complete Documentation Map - From Beginner to Expert

**Updated:** 2026-03-16
**Purpose:** Roadmap to create, sharpen, and optimize Nash Framework agents

---

## DOCUMENTATION HIERARCHY

### LEVEL 0: Understanding (READ FIRST!)

**Start here if:** You don't know what agents are or how they differ from skills

#### What is an Agent?

**Agent = SOUL + Skills + Cognitive Modes**

- **SOUL (Identity):** Personality, values, mental models - WHO you are (rarely changes)
- **Skills (Capabilities):** Workflows, checklists, procedures - WHAT you do (frequently enhanced)
- **Cognitive Modes:** EXPANSION/HOLD/REDUCTION - HOW you think (context-dependent)

**Example:**
```
Agent: Phúc SA (System Architect)
├── SOUL: "Cathedral Architect" (vivid metaphor)
│   ├── Mental Model: "Think in 10-star platonic ideals, then reduce to MVP"
│   ├── Core Values: Explicit > Implicit, Reversible > Irreversible
│   └── Adversarial Posture: vs Mộc (expect brutal challenge)
├── Skills:
│   ├── architecture-design (workflow)
│   ├── contract-drafting (checklist)
│   └── db-schema-review (procedure)
└── Cognitive Modes:
    ├── EXPANSION: Product vision (15K-30K tokens)
    ├── HOLD: Contract validation (10K-15K tokens)
    └── REDUCTION: MVP scoping (5K-10K tokens)
```

**Time:** 10 minutes to understand

---

### LEVEL 1: SOUL Creation (HOW TO BUILD PERSONALITY)

**Start here if:** You understand agents, need to create agent personality/identity

**File:** [1_SOUL_CREATION/SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md)

**What you'll learn:**
- How to define Role & Identity (vivid metaphors, not generic descriptions)
- Mental Models & Mode switching (when to EXPAND/HOLD/REDUCE)
- Core Values (priority ordering with concrete trade-offs)
- Adversarial Posture (Nash Triad interactions)
- Personality Traits (behavioral consistency under pressure)

**Supporting files:**
- [soul_catalog.md](1_SOUL_CREATION/references/soul_catalog.md) - 5 reusable SOULs
- [soul_archetypes.md](1_SOUL_CREATION/references/soul_archetypes.md) - 5 archetypes (Strategist, Critic, Builder, Analyst, Operator)

**Time:** 20 minutes to read, 30 minutes to create first SOUL

---

### LEVEL 2: Agent Creation (HOW TO BUILD COMPLETE AGENT)

**Start here if:** You have a SOUL, need to add skills and create complete agent

**File:** [2_AGENT_CREATION/agent_creator_guide.md](2_AGENT_CREATION/agent_creator_guide.md)

**What you'll learn:**
- Step-by-step agent creation process
- How to select/create skills for agent
- How to set up PEN/WIN memory
- How to configure tools (Bash, Read, Write, etc.)
- How to add domain knowledge
- How to write boot protocol

**Supporting files:**
- [agent_composition_guide.md](2_AGENT_CREATION/references/agent_composition_guide.md) - Combine SOUL + Skills + Mode

**Reference:**
- `../agents/AGENT_TEMPLATE_V2.md` - Production template with 9 sections

**Time:** 30 minutes to read, 60 minutes to create production-quality agent

---

### LEVEL 3: Agent Sharpening (HOW TO FIX & UPGRADE)

**Start here if:** You have agents with production failures (PEN entries) or need to upgrade to 2026 standards

#### Level 3A: Reactive Sharpening (PEN/WIN-driven)

**File:** [3_AGENT_SHARPENING/sharpener_reactive/SKILL.md](3_AGENT_SHARPENING/sharpener_reactive/SKILL.md)

**What you'll learn:**
- How to extract PEN/WIN entries from agent file
- How to auto-generate regression tests from PENs
- 5 enhancement strategies:
  1. **Prime Directive** - Add specific rules to prevent failure
  2. **Escape Hatch** - Add early exit conditions
  3. **Table** - Force completeness (error/rescue map)
  4. **Suppression** - Anti-noise lists
  5. **Philosophy** - Strengthen identity/values
- How to cross-validate (prevent overfitting)
- How to update agent file + mark PENs as FIXED

**Supporting files:**
- [pen_to_eval_patterns.md](3_AGENT_SHARPENING/sharpener_reactive/references/pen_to_eval_patterns.md)
- [enhancement_strategies.md](3_AGENT_SHARPENING/sharpener_reactive/references/enhancement_strategies.md)
- [sharpening_metrics.md](3_AGENT_SHARPENING/sharpener_reactive/references/sharpening_metrics.md)

**Use when:**
- Agent has 3+ active PEN entries
- Repeated bug pattern
- P0/P1 penalty received
- Production incident

**Time:** 15-30 minutes per agent

---

#### Level 3B: Proactive Sharpening (Industry Standards)

**File:** [3_AGENT_SHARPENING/sharpener_proactive/SKILL.md](3_AGENT_SHARPENING/sharpener_proactive/SKILL.md)

**What you'll learn:**
- Audit against 5 core principles:
  1. **Context is Fuel, Not Cargo** (60-80% token reduction target)
  2. **Single Responsibility per Agent** (70% token savings)
  3. **Adversarial Validation** (Nash Triad = zero-sum scoring)
  4. **Memory Hierarchy** (3-Tier: L2/RAM/HDD, 85% savings)
  5. **Clear Boundaries & Interfaces** (immutable contracts)
- Apply workflow patterns:
  - ReAct (Reason + Act)
  - Plan-and-Execute
  - Critic/Reflection
  - Multi-agent Collaboration
  - Tool-calling Patterns
  - Memory-augmented
  - Retrieval-augmented
  - Sequential Chain
  - Parallel Execution
- Token optimization (6-layer defense):
  1. RAG (Selective Retrieval) - 70% savings
  2. Compression (Hierarchical) - 74% savings
  3. Structured Prompting - 30% savings
  4. Modular Sub-agents - 76% savings
  5. Shared Memory (External DB) - 85% savings
  6. Progressive Disclosure - 91% savings

**Supporting files:**
- [workflow_patterns_catalog.md](3_AGENT_SHARPENING/sharpener_proactive/references/workflow_patterns_catalog.md)
- [5_core_principles_checklist.md](3_AGENT_SHARPENING/sharpener_proactive/references/5_core_principles_checklist.md)

**Use when:**
- Quarterly upgrade (every 3 months)
- Token bloat (>500 tokens L2 Cache)
- New workflow patterns available (2026 industry standards)
- Performance optimization needed

**Time:** 30-60 minutes per agent

---

#### Decision Guide: Reactive vs Proactive

**File:** [3_AGENT_SHARPENING/sharpening_decision_tree.md](3_AGENT_SHARPENING/sharpening_decision_tree.md)

**File:** [3_AGENT_SHARPENING/references/when_to_sharpen.md](3_AGENT_SHARPENING/references/when_to_sharpen.md)

**Quick decision:**
- **Reactive:** Agent broke → fix specific bugs
- **Proactive:** Agent old/bloated → modernize/optimize
- **Both:** Quarterly reactive cleanup + proactive upgrade

**Time:** 5 minutes to read decision guide

---

### LEVEL 4: Cognitive Mode Optimization (HOW TO THINK)

**Start here if:** You want to optimize agent token usage based on task complexity

**File:** [4_COGNITIVE_MODE_OPTIMIZATION/references/mode_selection_guide.md](4_COGNITIVE_MODE_OPTIMIZATION/references/mode_selection_guide.md)

**What you'll learn:**
- **EXPANSION mode:** When to use (exploring product vision, research, architecture design)
  - Token budget: 15K-30K
  - Behavior: Think broadly, explore alternatives, consider edge cases
- **HOLD mode:** When to use (implementing from clear spec, validation, routine work)
  - Token budget: 10K-15K
  - Behavior: Execute precisely, follow checklist, no scope creep
- **REDUCTION mode:** When to use (MVP scoping, optimization, scope cuts)
  - Token budget: 5K-10K
  - Behavior: Surgical focus, minimal viable, defer non-critical

**Decision tree:**
- Task unclear/novel → EXPANSION
- Task clear/routine → HOLD
- Task over-budget → REDUCTION

**Reference:**
- `../system/COGNITIVE_MODES.md` - Full specification (394 lines)

**Time:** 30 minutes to read, 1 hour to practice mode switching

---

## LEARNING PATH BY GOAL

### Goal 1: "Create agent in 10 minutes"

**Path:**
1. Copy [1_SOUL_CREATION/SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md)
2. Fill in Role, Mental Model, 3-5 Core Values
3. Choose archetype from [soul_archetypes.md](1_SOUL_CREATION/references/soul_archetypes.md)
4. Add 2-3 skill references (e.g., `~/.claude/skills/task-breakdown/SKILL.md`)
5. Set default mode (HOLD for most cases)
6. Done!

**Output:** Working agent with basic personality + skills

---

### Goal 2: "Create production-quality agent"

**Path:**
1. Read this guide Level 0-1 (30 min)
2. Use [SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md) - fill ALL sections:
   - Role & Identity (vivid metaphor)
   - Mental Models & Modes (EXPANSION/HOLD/REDUCTION)
   - Core Values (priority ordering with trade-offs)
   - Adversarial Posture (Nash Triad)
   - Personality Traits (under pressure behavior)
3. Read [agent_creator_guide.md](2_AGENT_CREATION/agent_creator_guide.md) (30 min)
4. Follow [agent_composition_guide.md](2_AGENT_CREATION/references/agent_composition_guide.md)
5. Test with real task
6. Review against `../agents/AGENT_TEMPLATE_V2.md` checklist

**Output:** Production-ready agent (<500 tokens L2 Cache)

---

### Goal 3: "Fix failing agent (PEN entries)"

**Path:**
1. Read [when_to_sharpen.md](3_AGENT_SHARPENING/references/when_to_sharpen.md) (5 min)
2. Use **Reactive Sharpening:**
   ```bash
   /sharpen agents/core/{agent-name}.md
   ```
3. Tool auto-generates tests from PEN entries
4. Apply enhancements (Prime Directive, Escape Hatch, Table, Suppression, Philosophy)
5. Run tests until all PENs pass
6. Cross-validate with synthetic variations
7. Update agent file + mark PENs as FIXED

**Output:** Fixed agent + regression tests + SHARPENING_LOG with before/after metrics

**Time:** 15-30 minutes

---

### Goal 4: "Upgrade agent to 2026 standards"

**Path:**
1. Read [sharpening_decision_tree.md](3_AGENT_SHARPENING/sharpening_decision_tree.md) (5 min)
2. Use **Proactive Sharpening:**
   - Audit against 5 core principles
   - Apply workflow patterns (ReAct, Plan-and-Execute, etc.)
   - Optimize tokens (6-layer defense)
3. Validate improvements
4. Document changes in SHARPENING_LOG

**Output:** Modernized agent with 60-80% token reduction

**Time:** 30-60 minutes

---

### Goal 5: "Optimize agent cognitive modes"

**Path:**
1. Read [mode_selection_guide.md](4_COGNITIVE_MODE_OPTIMIZATION/references/mode_selection_guide.md) (30 min)
2. Study `../system/COGNITIVE_MODES.md` decision tree (15 min)
3. Add mode switching to agent SOUL section:
   ```markdown
   ### Mental Models & Modes
   **Mode switching:**
   - EXPANSION: When exploring architecture → think in platonic ideals
   - HOLD: When validating contracts → rigorous boundary checking
   - REDUCTION: When scoping MVP → surgical cuts
   ```
4. Test agent with different task complexities
5. Measure token usage (EXPANSION vs HOLD vs REDUCTION)

**Output:** Optimized agent with context-aware mode switching

**Time:** 1-2 hours (includes testing)

---

## QUICK DECISION MATRIX

| If you want to... | Read this | Time |
|-------------------|-----------|------|
| Understand agents | AGENT_BUILDING_MASTER_GUIDE.md Level 0 | 10 min |
| Create SOUL | 1_SOUL_CREATION/SOUL_TEMPLATE.md | 20 min |
| Pick archetype | soul_archetypes.md | 5 min |
| See reusable SOULs | soul_catalog.md | 5 min |
| Create complete agent | 2_AGENT_CREATION/agent_creator_guide.md | 30 min |
| Combine SOUL + Skills | agent_composition_guide.md | 15 min |
| Fix failing agent | 3_AGENT_SHARPENING/sharpener_reactive/ | 15-30 min |
| Upgrade to 2026 | 3_AGENT_SHARPENING/sharpener_proactive/ | 30-60 min |
| Decide reactive vs proactive | sharpening_decision_tree.md | 5 min |
| Know when to sharpen | when_to_sharpen.md | 5 min |
| Optimize modes | mode_selection_guide.md | 30 min |
| Full mode spec | ../system/COGNITIVE_MODES.md | 45 min |

---

## RECOMMENDED STUDY ORDER

### Week 1: Foundation
1. Read AGENT_BUILDING_MASTER_GUIDE.md Level 0 (10 min)
2. Read soul_archetypes.md (10 min)
3. Create 1 SOUL from SOUL_TEMPLATE.md (30 min)
4. Create 1 agent using agent_creator_guide.md (60 min)
5. Test agent with simple task

**Milestone:** 1 working agent

---

### Week 2: Production Quality
1. Read agent_composition_guide.md (15 min)
2. Study `../agents/AGENT_TEMPLATE_V2.md` (30 min)
3. Create 3 production agents (Critic, Builder, Analyst)
4. Set up Nash Triad (Thesis/Anti-Thesis/Synthesis)
5. Test with real tasks

**Milestone:** 3 production agents in Nash Triad

---

### Week 3: Sharpening
1. Read sharpening_decision_tree.md (10 min)
2. Read when_to_sharpen.md (10 min)
3. Practice reactive sharpening (30 min)
   - Find agent with PEN entries
   - Run `/sharpen`
   - Fix and verify
4. Practice proactive sharpening (60 min)
   - Pick agent with token bloat
   - Audit against 5 principles
   - Apply optimizations

**Milestone:** Ability to fix and upgrade agents

---

### Week 4: Advanced
1. Read mode_selection_guide.md (30 min)
2. Study `../system/COGNITIVE_MODES.md` (45 min)
3. Add mode switching to 3 agents
4. Test with different task complexities
5. Measure token savings

**Milestone:** Optimized agent suite with cognitive mode switching

---

## PRACTICAL WORKFLOWS

### Workflow 1: Create Simple Agent (10 min)

```bash
# 1. Copy SOUL template
cp agent_factory/1_SOUL_CREATION/SOUL_TEMPLATE.md agents/my-agent.md

# 2. Fill in minimal sections:
#    - Role: "You are a {vivid metaphor}"
#    - Mental Model: "{How you think}"
#    - Core Values: 3-5 values

# 3. Add 2-3 skills
#    - SKILL: ~/.claude/skills/task-breakdown/SKILL.md

# 4. Set default mode: HOLD

# 5. Test
claude --agent agents/my-agent.md "Test task"
```

---

### Workflow 2: Create Production Agent (60 min)

```bash
# 1. Read agent_creator_guide.md (30 min)

# 2. Use SOUL_TEMPLATE.md - fill ALL sections (30 min):
#    - Role & Identity (vivid metaphor)
#    - Mental Models & Modes (EXPANSION/HOLD/REDUCTION)
#    - Core Values (priority ordering)
#    - Adversarial Posture (Nash Triad)
#    - Personality Traits

# 3. Add Skills section (15 min):
#    - Workflow 1: {What}
#    - Workflow 2: {What}
#    - Preconditions/Assertions

# 4. Add PEN/WIN section (5 min)

# 5. Add Tools section (5 min)

# 6. Review against AGENT_TEMPLATE_V2.md checklist (5 min)

# 7. Test with real task (10 min)
```

---

### Workflow 3: Sharpen Agent (Reactive)

```bash
# 1. Check PEN entries
grep "PEN-" agents/core/my-agent.md

# 2. Run reactive sharpening
/sharpen agents/core/my-agent.md

# 3. Tool auto-generates tests from PENs

# 4. Apply enhancements
#    - Prime Directive: Add specific rule
#    - Escape Hatch: Add early exit
#    - Table: Force completeness
#    - Suppression: Add noise filter
#    - Philosophy: Strengthen identity

# 5. Verify all tests pass

# 6. Commit with SHARPENING_LOG
```

---

### Workflow 4: Upgrade Agent (Proactive)

```bash
# 1. Read sharpening_decision_tree.md (5 min)

# 2. Audit against 5 principles:
#    - Context is Fuel, Not Cargo
#    - Single Responsibility
#    - Adversarial Validation
#    - Memory Hierarchy
#    - Clear Boundaries

# 3. Apply workflow patterns:
#    - ReAct, Plan-and-Execute, Critic/Reflection

# 4. Optimize tokens:
#    - RAG, Compression, Modular Sub-agents

# 5. Validate improvements

# 6. Document in SHARPENING_LOG
```

---

## FAQ

### Q: What's the difference between Agent and Skill?
**A:**
- **Agent** = SOUL (personality) + Skills (workflows) + Cognitive Modes
- **Skill** = Workflow only (no personality)

**Example:**
- **Agent:** Phúc SA (has identity, values, mental model) + uses skills (architecture-design, contract-drafting)
- **Skill:** architecture-design (just workflow steps, no personality)

---

### Q: Can I reuse SOULs across agents?
**A:** YES! That's the design goal.
- 5 SOULs can power 20+ agents
- Example: "cathedral-architect" SOUL → Phúc SA, Hiếu Arch, Quang DB-Arch
- See [soul_catalog.md](1_SOUL_CREATION/references/soul_catalog.md)

---

### Q: Which sharpening system should I use?
**A:** See [sharpening_decision_tree.md](3_AGENT_SHARPENING/sharpening_decision_tree.md)
- **Reactive:** Agent has PEN entries → Fix specific bugs
- **Proactive:** Quarterly upgrade or token bloat → Modernize/optimize
- **Both:** Best practice = reactive cleanup + proactive upgrade quarterly

---

### Q: How often should I sharpen agents?
**A:** See [when_to_sharpen.md](3_AGENT_SHARPENING/references/when_to_sharpen.md)

**Reactive triggers:**
- P0 penalty received
- 3+ active PEN entries
- Repeated bug pattern
- Production incident

**Proactive triggers:**
- Quarterly (every 3 months)
- Token bloat (>500 L2 Cache)
- New workflow patterns available
- Performance issues

---

### Q: What's the token target for agents?
**A:**
- **L2 Cache (always loaded):** <500 tokens per agent
  - SOUL: ~200 tokens
  - Skills: ~200 tokens
  - Tools/Memory: ~100 tokens
- **If >500 tokens:** Extract to RAM (`tmp/ram/{agent}/*.md`)
- **Target via proactive sharpening:** 60-80% reduction

---

### Q: Do I need to read everything?
**A:** NO! Follow your goal path:
- Create simple agent → Level 1 only (30 min)
- Create production agent → Levels 1-2 (90 min)
- Fix failing agent → Level 3A (30 min)
- Upgrade agent → Level 3B (60 min)
- Optimize modes → Level 4 (90 min)

---

## SUCCESS METRICS

**After completing this guide system, you should be able to:**

- Create simple agent in 10 minutes
- Create production-quality agent in 60 minutes
- Fix failing agent (PEN entries) in 15-30 minutes
- Upgrade agent to 2026 standards in 30-60 minutes
- Decide when to use reactive vs proactive sharpening
- Optimize agent cognitive modes (EXPANSION/HOLD/REDUCTION)
- Achieve 60-80% token reduction via 6-layer optimization
- Reuse SOULs across multiple agents (5 SOULs → 20+ agents)

---

## FILE SUMMARY

| File | Purpose | Length | Read Time |
|------|---------|--------|-----------|
| **AGENT_BUILDING_MASTER_GUIDE.md** | Complete roadmap | 10K | 30 min |
| **SOUL_TEMPLATE.md** | Copy-paste SOUL template | 2K | 5 min |
| **soul_catalog.md** | 5 reusable SOULs | 2K | 5 min |
| **soul_archetypes.md** | 5 archetypes explained | 3K | 10 min |
| **agent_creator_guide.md** | Step-by-step creation | 5K | 20 min |
| **agent_composition_guide.md** | SOUL + Skills + Mode | 3K | 15 min |
| **sharpener_reactive/SKILL.md** | PEN/WIN-based sharpening | 28K | 30 min |
| **sharpener_proactive/SKILL.md** | Industry standards upgrade | 15K | 30 min |
| **sharpening_decision_tree.md** | Reactive vs Proactive | 2K | 5 min |
| **when_to_sharpen.md** | Triggers | 2K | 5 min |
| **mode_selection_guide.md** | EXPANSION/HOLD/REDUCTION | 4K | 15 min |

**Total:** ~76K words, ~3 hours to read everything (but you don't need to!)

---

## NEXT STEPS

**Immediate (Today):**
1. Read this guide Level 0 (10 min)
2. Read soul_archetypes.md (10 min)
3. Create 1 SOUL from SOUL_TEMPLATE.md (30 min)

**This Week:**
1. Read agent_creator_guide.md (30 min)
2. Create 3 production agents (3 hours)
3. Test with real tasks

**This Month:**
1. Practice reactive sharpening (fix 3 agents with PEN entries)
2. Practice proactive sharpening (upgrade 3 agents to 2026 standards)
3. Optimize cognitive modes (add EXPANSION/HOLD/REDUCTION to all agents)

---

**You now have a complete agent-building curriculum. Start with Level 0 and work your way up!**
