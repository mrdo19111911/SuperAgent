# Cognitive Modes - Decision Tree (Quick Reference)

**Purpose:** Fast mode selection flowchart (covers 80% of use cases).
**For philosophy & deep dive:** See `COGNITIVE_MODES_PHILOSOPHY.md`

---

## Mode Selection Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│  STEP 0: MODE SELECTION DECISION TREE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Is spec clear + complete?                                   │
│  ├─ YES → Is it implementation only?                         │
│  │  ├─ YES → REDUCTION (ship fast)                          │
│  │  │         Token Budget: 5K-10K                           │
│  │  │         Metaphor: Release machine                      │
│  │  │                                                         │
│  │  └─ NO → HOLD (follow spec rigorously)                   │
│  │           Token Budget: 10K-15K                           │
│  │           Metaphor: Paranoid staff engineer               │
│  │                                                            │
│  └─ NO → Is it new domain / product direction?               │
│     ├─ YES → EXPANSION (explore, design)                     │
│     │         Token Budget: 15K-30K                          │
│     │         Metaphor: Cathedral builder / Surgeon          │
│     │                                                         │
│     └─ NO → HOLD (clarify first, then rigor)                 │
│              Token Budget: 10K-15K                           │
│              Metaphor: Paranoid staff engineer               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Keyword Triggers

### EXPANSION keywords:
- "new domain", "unclear", "explore", "product direction"
- "what would 10x look like", "design alternatives"
- "user journey", "founder taste"

### HOLD keywords:
- "architecture", "contracts", "schema", "API design"
- "security", "data model", "integration"
- "critical", "production", "high risk"

### REDUCTION keywords:
- "implement from CONTRACT_DRAFT", "code only"
- "fix bug", "refactor", "migrate"
- "urgent", "hotfix", "fast"

---

## Example Classifications

```
Task: "Design payment processing for multi-currency support"
→ Keywords: "design", "multi-currency" (new domain)
→ Complexity: Complex (many requirements)
→ Mode: EXPANSION

Task: "Implement user registration endpoint per CONTRACT_DRAFT.md"
→ Keywords: "implement", "per CONTRACT_DRAFT" (clear spec)
→ Complexity: Simple (one endpoint)
→ Mode: REDUCTION

Task: "Review and validate database schema for GDPR compliance"
→ Keywords: "schema", "GDPR" (critical, rigor)
→ Complexity: Complex (compliance requirements)
→ Mode: HOLD
```

---

## Quick Reference Table

| Mode | Token Budget | When to Use | Output Format |
|------|--------------|-------------|---------------|
| **EXPANSION** | 15K-30K | New domain, unclear spec, product direction | Multiple alternatives, diagrams, trade-off analysis |
| **HOLD** | 10K-15K | Architecture, contracts, rigor needed | Single design, evidence-based, complete artifacts |
| **REDUCTION** | 5K-10K | Implementation from clear spec, ship fast | Code only, minimal comments, passing tests |

---

## Mode Selection Template (Copy-Paste)

```markdown
## STEP 0: MODE SELECTION

1. **Read task description**
2. **Check keywords:**
   - EXPANSION: new domain, explore, product direction
   - HOLD: architecture, contracts, critical
   - REDUCTION: implement, fix bug, urgent
3. **Estimate complexity:**
   - Requirements count: {{ count }}
   - Spec clarity: {{ clear/unclear }}
4. **Decision:**
   - Spec clear + implementation only? → REDUCTION
   - Spec clear + architecture/critical? → HOLD
   - Spec unclear / new domain? → EXPANSION
5. **Declare mode:**

   **MODE SELECTED:** {{ EXPANSION / HOLD / REDUCTION }}
   **REASON:** {{ why this mode }}
   **TOKEN BUDGET:** {{ 5K-30K }}

6. **Proceed with mode-specific behavior**
```

---

## Critical Rules

1. **No mid-task mode switching** - Once mode selected, CANNOT switch until task complete
2. **Mode selection is EXPLICIT** - Agent MUST state mode in first output
3. **User can override** - If agent selects wrong mode, user can request change

---

**For detailed mode behaviors, output examples, and philosophy, see `COGNITIVE_MODES_PHILOSOPHY.md`**
