# Mode Selection Guide
## EXPANSION vs HOLD vs REDUCTION

**Purpose:** Choose the right cognitive mode based on task complexity

---

## Quick Decision

```
Is task novel/unclear?
├─ YES → EXPANSION (explore)
└─ NO  → Is task routine/clear?
          ├─ YES → HOLD (execute)
          └─ NO  → Is task over-budget?
                   ├─ YES → REDUCTION (cut scope)
                   └─ NO  → Default to HOLD
```

---

## EXPANSION Mode

### When to Use
- **Exploring:** Product vision, architecture design, research
- **Novel problems:** New domain, unclear requirements
- **Edge case analysis:** What could go wrong?
- **Trade-off analysis:** Option A vs B vs C

### Token Budget
15K-30K tokens

### Behavior
- Think broadly, explore all alternatives
- Consider edge cases deeply
- Research deeply (docs, patterns, examples)
- No premature optimization
- Document assumptions

### Example Triggers
- "Design architecture for new module"
- "Research OAuth2 implementation patterns"
- "What are all possible ways this could fail?"
- "Explore accessibility patterns for datepicker"

### Mode Switching Rules in SOUL
```markdown
**EXPANSION mode:** When exploring product vision or architecture design
→ Think in 10-star platonic ideals, consider all edge cases
→ Token budget: 15K-30K
```

---

## HOLD Mode

### When to Use
- **Implementing from clear spec:** CONTRACT_DRAFT.md finalized
- **Validation:** Code review, QA testing
- **Routine work:** Follow established patterns
- **Execution:** Clear acceptance criteria

### Token Budget
10K-15K tokens

### Behavior
- Execute precisely, follow checklist
- No scope creep (stick to spec)
- No exploring alternatives (spec is final)
- Fast execution
- Validate assertions

### Example Triggers
- "Implement API from CONTRACT_DRAFT.md"
- "Review PR against architecture rules"
- "Test user login flow (known scenario)"
- "Follow deployment runbook"

### Mode Switching Rules in SOUL
```markdown
**HOLD mode:** When implementing from clear spec or validating contracts
→ Execute precisely, follow checklist, no scope creep
→ Token budget: 10K-15K
```

---

## REDUCTION Mode

### When to Use
- **MVP scoping:** Cut non-critical features
- **Over-budget:** Task using >15K tokens in HOLD
- **Optimization:** Performance tuning, token reduction
- **Emergency:** Production incident, time pressure

### Token Budget
5K-10K tokens

### Behavior
- Surgical focus on critical path
- Defer non-critical (mark TODO)
- Minimal viable solution
- Fast decisions
- Cut scope aggressively

### Example Triggers
- "Scope this to MVP (ship in 1 day)"
- "Task is over-budget, reduce scope"
- "Production P0, fix NOW (not perfect)"
- "Optimize agent tokens from 800 to <500"

### Mode Switching Rules in SOUL
```markdown
**REDUCTION mode:** When scoping MVP or cutting scope
→ Surgical cuts to critical path, defer non-critical
→ Token budget: 5K-10K
```

---

## Mode Comparison

| Aspect | EXPANSION | HOLD | REDUCTION |
|--------|-----------|------|-----------|
| **Token Budget** | 15K-30K | 10K-15K | 5K-10K |
| **Speed** | Slow (explore) | Medium (execute) | Fast (cut) |
| **Scope** | Broad | Defined | Minimal |
| **Depth** | Deep | Precise | Shallow |
| **Risk** | Low (over-think) | Medium | High (cut too much) |
| **Best For** | Novel problems | Routine work | Emergencies |

---

## Mode Selection by Role

### Strategist
- **Primary mode:** EXPANSION (design systems)
- **Secondary mode:** REDUCTION (scope MVP)
- **Rarely:** HOLD (strategists don't execute)

**Example:**
- EXPANSION: Design product vision
- REDUCTION: Cut scope to MVP
- HOLD: (delegate to Builder)

---

### Builder
- **Primary mode:** HOLD (execute from spec)
- **Secondary mode:** EXPANSION (novel problems)
- **Rarely:** REDUCTION (builders ship features, not cut them)

**Example:**
- HOLD: Implement from CONTRACT_DRAFT.md
- EXPANSION: Research new library/pattern
- REDUCTION: (escalate to Strategist to cut scope)

---

### Critic
- **Primary mode:** EXPANSION (find all edge cases)
- **Secondary mode:** HOLD (validate checklist)
- **Rarely:** REDUCTION (critics don't cut scope)

**Example:**
- EXPANSION: Architecture review (explore all flaws)
- HOLD: Code review (follow checklist)
- REDUCTION: (critics challenge scope cuts, not make them)

---

### Analyst
- **Balanced:** EXPANSION (explore gaps) + HOLD (validate spec)
- **Rarely:** REDUCTION

**Example:**
- EXPANSION: Requirements analysis (what's missing?)
- HOLD: Spec validation (criteria complete?)
- REDUCTION: (escalate to Strategist)

---

### Operator
- **Primary mode:** HOLD (follow runbook)
- **Secondary mode:** REDUCTION (emergency response)
- **Rarely:** EXPANSION (operators execute, not explore)

**Example:**
- HOLD: Deploy to production (follow runbook)
- REDUCTION: Production P0 (fix fast, not perfect)
- EXPANSION: (escalate to Strategist for design)

---

## Mode Switching Examples

### Example 1: Architecture Design → Implementation
```
Phase 1 (Design):
- Mode: EXPANSION (explore architecture patterns)
- Token: 20K (research RLS, Kafka, API patterns)
- Output: ARCHITECTURE.md, CONTRACT_DRAFT.md

Phase 2 (Implementation):
- Mode: HOLD (execute from contracts)
- Token: 12K (implement precisely, no scope creep)
- Output: Code matching CONTRACT_DRAFT.md
```

**Mode switch trigger:** CONTRACT_DRAFT.md finalized → EXPANSION → HOLD

---

### Example 2: Routine Work → Novel Problem
```
Task 1 (Routine):
- Mode: HOLD (implement login form - known pattern)
- Token: 10K (follow established React patterns)
- Output: Login component

Task 2 (Novel):
- Mode: EXPANSION (implement WebAuthn - new to team)
- Token: 25K (research spec, explore libraries, consider edge cases)
- Output: WebAuthn integration + documentation
```

**Mode switch trigger:** Familiar pattern → HOLD, Unfamiliar pattern → EXPANSION

---

### Example 3: Over-Budget → Scope Cut
```
Initial attempt (HOLD):
- Token: 18K (over-budget, >15K limit)
- Reason: Too many edge cases considered

Retry (REDUCTION):
- Token: 8K (cut non-critical edge cases to TODO)
- Output: MVP solution, edge cases deferred
```

**Mode switch trigger:** Token usage >15K → REDUCTION

---

## Implementation in Agent File

Add to SOUL section:

```markdown
### Mental Models & Modes

**Core mental model:** {How you approach problems}

**Mode switching:**
- **EXPANSION mode:** When exploring product vision or architecture design
  → Think in 10-star platonic ideals, consider all alternatives, explore edge cases
  → Token budget: 15K-30K
  → Triggers: Novel problems, research, design, trade-off analysis

- **HOLD mode:** When implementing from clear spec or validating contracts
  → Execute precisely, follow checklist, no scope creep, fast execution
  → Token budget: 10K-15K
  → Triggers: Routine work, clear acceptance criteria, code review

- **REDUCTION mode:** When scoping MVP or cutting scope
  → Surgical cuts to critical path, defer non-critical, minimal viable
  → Token budget: 5K-10K
  → Triggers: Over-budget, emergency, MVP scoping, optimization

**Critical unbreakable law:** {One rule that prevents mode drift}
Example: "NEVER stay in EXPANSION for routine tasks - wastes tokens"
```

---

## Metrics to Track

**Per mode:**
- Tasks completed
- Average token usage
- Success rate (tasks completed vs abandoned)

**Mode switching:**
- EXPANSION → HOLD transitions (design → implement)
- HOLD → REDUCTION transitions (over-budget → cut scope)
- Mode adherence (stayed in correct mode?)

**Optimization:**
- Token savings from REDUCTION vs HOLD
- Quality impact (REDUCTION sacrifices quality?)

---

## Next Steps

1. Add mode switching rules to agent SOUL section
2. Practice mode selection with real tasks
3. Measure token usage per mode
4. Optimize mode switching triggers

---

**Reference:** See `../../../system/COGNITIVE_MODES.md` for complete specification (394 lines, 45 min read)
