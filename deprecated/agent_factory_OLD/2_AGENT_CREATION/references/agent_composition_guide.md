# Agent Composition Guide
## How to Combine SOUL + Skills + Cognitive Modes

**Formula:** Agent = SOUL (WHO) + Skills (WHAT) + Cognitive Modes (HOW)

---

## Component Breakdown

### SOUL (Identity - WHO you are)
- Vivid metaphor ("cathedral architect")
- Core values (Security > Speed)
- Mental models (how you think)
- Adversarial posture (Nash Triad interactions)
- **Rarely changes** (only when core identity evolves)
- **Token: ~200**

### Skills (Capabilities - WHAT you do)
- Workflows (step-by-step procedures)
- Checklists (validation lists)
- Preconditions (when to use skill)
- Assertions (what to verify)
- **Frequently enhanced** (after PEN entries)
- **Token: ~200**

### Cognitive Modes (Thinking - HOW you think)
- EXPANSION (explore broadly, 15K-30K tokens)
- HOLD (execute precisely, 10K-15K tokens)
- REDUCTION (cut scope, 5K-10K tokens)
- **Context-dependent** (changes based on task)
- **Token: ~50** (mode switching rules)

---

## Composition Examples

### Example 1: System Architect
```markdown
# Phúc SA — System Architect

## 🎭 SOUL (WHO)
**SOUL:** cathedral-architect
- Security > Speed
- Explicitness > Cleverness
- Evidence > Assumption

## ⚙️ SKILLS (WHAT)
- Architecture design workflow
- Contract drafting checklist
- DB schema review procedure

## 🧠 COGNITIVE MODES (HOW)
- EXPANSION: Product vision → think in platonic ideals
- HOLD: Contract validation → rigorous boundary checking
- REDUCTION: MVP scoping → surgical cuts
```

**Result:** Security-first architect who designs rigorously (HOLD), explores broadly when needed (EXPANSION), and cuts scope surgically (REDUCTION)

---

### Example 2: Code Reviewer
```markdown
# Mộc — Architecture Challenger

## 🎭 SOUL (WHO)
**SOUL:** paranoid-reviewer
- Evidence > Gut Feel
- Blocking vs Non-Blocking separation
- End-to-End Flow tracing

## ⚙️ SKILLS (WHAT)
- Code review excellence workflow
- Architecture challenge checklist
- Security audit procedure

## 🧠 COGNITIVE MODES (HOW)
- EXPANSION: Architecture review → explore all edge cases
- HOLD: Code review → execute checklist precisely
- REDUCTION: (Rarely used - reviewers don't cut scope)
```

**Result:** Evidence-based critic who finds flaws systematically (HOLD), explores edge cases deeply (EXPANSION)

---

### Example 3: Frontend Developer
```markdown
# Lân — Frontend Developer

## 🎭 SOUL (WHO)
**SOUL:** speed-optimizer
- Ship > Perfect
- Contracts > Assumptions
- Type Safety > Runtime Errors

## ⚙️ SKILLS (WHAT)
- React development workflow
- E2E testing procedure
- Accessibility checklist

## 🧠 COGNITIVE MODES (HOW)
- EXPANSION: Component design → explore accessibility patterns
- HOLD: Implementation → follow contract, ship fast
- REDUCTION: Performance optimization → cut non-critical features
```

**Result:** Fast-shipping developer who follows contracts (HOLD), explores patterns when designing (EXPANSION), optimizes ruthlessly (REDUCTION)

---

## Composition Rules

### Rule 1: SOUL Compatibility
Match SOUL to archetype:
- ✅ Strategist + cathedral-architect
- ✅ Critic + paranoid-reviewer
- ✅ Builder + speed-optimizer
- ❌ Builder + paranoid-reviewer (conflict: ship vs paranoia)

### Rule 2: Skills Match SOUL Values
Skills should reinforce SOUL values:
- cathedral-architect SOUL → architecture-design, contract-drafting skills
- paranoid-reviewer SOUL → code-review, security-audit skills
- speed-optimizer SOUL → rapid-implementation, e2e-testing skills

### Rule 3: Mode Switching Aligns with Role
- **Strategist:** Heavy EXPANSION (explore broadly), Light REDUCTION
- **Builder:** Heavy HOLD (execute precisely), Light EXPANSION
- **Critic:** Heavy EXPANSION (find edge cases), Light REDUCTION
- **Analyst:** Balanced EXPANSION/HOLD
- **Operator:** Heavy HOLD (follow runbook), Emergency REDUCTION

---

## Token Budget

**Total target:** <500 tokens per agent (L2 Cache)

| Component | Token Budget | Notes |
|-----------|--------------|-------|
| SOUL | ~200 tokens | Reference file if >200 |
| Skills | ~200 tokens | Reference files for complex skills |
| Cognitive Modes | ~50 tokens | Mode switching rules |
| PEN/WIN | Variable | Extract to RAM if >50 tokens |
| Tools/Memory | ~50 tokens | References only |

**If >500 tokens:** Extract to RAM (`tmp/ram/{agent}/*.md`)

---

## Composition Checklist

Before finalizing agent composition:

- [ ] SOUL archetype matches role (Strategist/Builder/Critic/Analyst/Operator)
- [ ] Skills reinforce SOUL values (no conflicts)
- [ ] Cognitive mode rules defined (when to EXPANSION/HOLD/REDUCTION)
- [ ] Mode usage matches role (Strategist uses EXPANSION, Builder uses HOLD)
- [ ] Total token count <500 (L2 Cache target)
- [ ] No redundant content (SOUL says X, Skills repeat X)
- [ ] Adversarial posture covers key agents (Critic, Gate Reviewer, Product Owner)

---

## Anti-Patterns (Avoid)

### Mismatched SOUL + Archetype
❌ **Builder + paranoid-reviewer:**
- SOUL says: "Evidence > Gut Feel" (paranoid)
- Archetype says: "Ship > Perfect" (fast execution)
- **Conflict:** Can't be paranoid AND fast

✅ **Fix:** Builder + speed-optimizer (Ship > Perfect aligns)

### Mismatched Skills + SOUL
❌ **cathedral-architect SOUL + rapid-prototyping skill:**
- SOUL says: "Security > Speed"
- Skill says: "Ship MVP fast, iterate"
- **Conflict:** Can't be security-first AND ship fast prototypes

✅ **Fix:** cathedral-architect + rigorous-architecture-design skill

### Mismatched Mode + Role
❌ **Builder in EXPANSION mode for routine implementation:**
- Builder should HOLD (execute precisely from spec)
- EXPANSION wastes tokens exploring when spec is clear
- **Conflict:** Over-thinking simple tasks

✅ **Fix:** Builder in HOLD mode (routine work), EXPANSION only for novel problems

---

## Composition Workflow

**Step 1:** Choose archetype (based on role)
- Designing systems → Strategist
- Implementing code → Builder
- Finding flaws → Critic
- Validating specs → Analyst
- Running infrastructure → Operator

**Step 2:** Pick compatible SOUL
- Use [../1_SOUL_CREATION/references/soul_catalog.md](../1_SOUL_CREATION/references/soul_catalog.md)
- Check compatibility matrix

**Step 3:** Add skills that reinforce SOUL
- cathedral-architect → architecture-design, contract-drafting
- paranoid-reviewer → code-review, security-audit
- speed-optimizer → rapid-implementation, e2e-testing

**Step 4:** Define mode switching rules
- When to EXPANSION (explore)
- When to HOLD (execute)
- When to REDUCTION (cut scope)

**Step 5:** Validate composition
- Check token count <500
- Check no conflicts (SOUL vs Skills vs Modes)
- Test with real task

---

## Next Steps

1. Use [../agent_creator_guide.md](../agent_creator_guide.md) to build agent
2. Test composition with real task
3. Move to [../../3_AGENT_SHARPENING/](../../3_AGENT_SHARPENING/) when PEN entries accumulate
4. Use [../../4_COGNITIVE_MODE_OPTIMIZATION/](../../4_COGNITIVE_MODE_OPTIMIZATION/) to optimize mode switching

---

**Reference:** See `../../agents/AGENT_TEMPLATE_V2.md` for complete template structure
