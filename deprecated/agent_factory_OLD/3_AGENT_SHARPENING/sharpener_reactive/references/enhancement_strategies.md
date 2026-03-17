# Enhancement Strategies

**When sharpening agent skills, choose the RIGHT strategy for each PEN failure.**

---

## Strategy Decision Tree

```
Root Cause of Failure?
│
├─ Agent forgot to DO something
│  → Strategy A: Add Prime Directive (high-level rule)
│  → Strategy B: Add Escape Hatch (precondition check)
│
├─ Agent did things in WRONG ORDER
│  → Strategy B: Add Escape Hatch (enforce sequence)
│  → Strategy C: Add Table/Checklist (visual workflow)
│
├─ Agent missed EDGE CASE
│  → Strategy C: Add Table (multi-path analysis)
│  → Strategy A: Add Prime Directive (nil/empty/error principle)
│
├─ Agent used WRONG CONFIGURATION
│  → Strategy C: Add Table (validation checklist)
│  → Strategy F: Add Concrete Example (show correct config)
│
├─ Agent produced FALSE POSITIVE
│  → Strategy D: Add Suppression ("DO NOT flag X when Y")
│
└─ Agent has WRONG MENTAL MODEL
   → Strategy E: Enhance Philosophy (role-play vivid metaphor)
```

---

## Strategy A: Add Prime Directive

**Use when:** High-level principle violated, need universal rule.

**Template:**
```markdown
## Prime Directives
...
N. [Principle name]. [Concrete meaning]. [Anti-pattern]. [Consequence].

Example:
N. Every reviewer call includes full context. Attach ALL design files
   (ARCHITECTURE.md, schema.prisma, CONTRACT_DRAFT.md). Missing files =
   incomplete review → false issues → wasted iteration. PEN-001.
```

**Strength:** Clear, memorable, applies to all situations.
**Weakness:** May be too general, agent might still forget in specific contexts.

---

## Strategy B: Add Escape Hatch

**Use when:** Agent needs to CHECK before proceeding.

**Template:**
```markdown
## Step X: [Action]

1. **Precondition check:**
   - Does [Condition A] hold? If no, **STOP** - "[Error message]"
   - Does [Condition B] hold? If no, **STOP** - "[Error message]"

2. Proceed only if ALL checks pass.

3. [Actual action]
```

**Strength:** Forces agent to validate BEFORE acting, prevents premature action.
**Weakness:** Adds verbosity, may slow down agent.

**Example (PEN-001):**
```markdown
## Before Calling Reviewer

1. **File completeness check:**
   - Does ARCHITECTURE.md exist? If no, **STOP** - "Cannot review without design doc"
   - Does schema.prisma exist? If no, **STOP** - "Cannot review without schema"
   - Does CONTRACT_DRAFT.md exist? If no, **STOP** - "Cannot review without contracts"

2. Only call reviewer if ALL files exist.
```

---

## Strategy C: Add Table/Checklist

**Use when:** Need to enforce COMPLETENESS across multiple dimensions.

**Template:**
```markdown
## [Section Name] - Validation Table

| Item            | Required? | Check | Status |
|-----------------|-----------|-------|--------|
| [Item 1]        | ✓         | [How to check] | [ ] |
| [Item 2]        | ✓         | [How to check] | [ ] |
| [Item 3]        | Optional  | [How to check] | [ ] |

**Rule:** ALL required items must have ✓ before proceeding.
**Gap detection:** Any required item without ✓ = **STOP**.
```

**Strength:** Visual, forces systematic thinking, can't skip items.
**Weakness:** May become mechanical (agent checks boxes without understanding).

**Example (PEN-002 - RLS validation):**
```markdown
## PostgreSQL Schema Validation

| Check                     | Required? | How to Verify | Status |
|---------------------------|-----------|---------------|--------|
| Every table has tenant_id | ✓         | grep 'tenant_id' | [ ] |
| RLS policy defined        | ✓         | grep 'CREATE POLICY' | [ ] |
| NOBYPASSRLS role exists   | ✓         | grep 'NOBYPASSRLS' | [ ] |
| Role is NON-superuser     | ✓         | grep 'NOSUPERUSER' | [ ] |

**PEN-002 reminder:** Missing NOBYPASSRLS = superuser bypasses RLS = security hole.
```

---

## Strategy D: Add Suppression

**Use when:** Agent flags FALSE POSITIVES that are actually acceptable.

**Template:**
```markdown
## Suppressions

**DO NOT flag:**
- [Pattern X] when [Context Y] — [Reason why it's OK]
- [Pattern A] — [Philosophy explaining why not a problem]

Example from reviewer context:
**DO NOT flag:**
- "Defense in depth" as redundant when X is checked in controller AND model
  — Both checks are intentional (different execution paths)
```

**Strength:** Teaches taste, prevents noise, documents team decisions.
**Weakness:** Can accumulate clutter if overused.

---

## Strategy E: Enhance Philosophy

**Use when:** Agent has fundamentally WRONG MENTAL MODEL.

**Template:**
```markdown
## Philosophy

You are not [generic role]. You are [vivid metaphor - e.g., surgeon, cathedral builder].

Your mission: [Emotional goal - e.g., "make it extraordinary", "catch every landmine"]

[Mode switching if applicable]

Critical rule: [One unbreakable law that prevents mental drift]
```

**Example (if agent treats review as "nice to have"):**
```markdown
## Philosophy

You are not "submitting code for feedback". You are a **surgeon preparing for life-saving surgery**.

Before you operate (deploy to production), you call in a specialist (Mộc/Xuân) to review your procedure.
Would you operate WITHOUT having your instruments ready? Would you ask for review WITHOUT showing your plan?

**No. That's malpractice.**

Critical rule: Incomplete artifacts = incomplete review = patient dies (production breaks).
PEN-001 active: Always attach full context to reviewer.
```

**Strength:** Changes how agent THINKS, not just what it DOES.
**Weakness:** Requires careful wording, can be too abstract.

---

## Strategy F: Add Concrete Example

**Use when:** Principle is clear but agent needs to SEE it.

**Template:**
```markdown
## [Section Name]

[Principle]

**Example (PEN-XXX context):**
```[language]
// ❌ WRONG (what agent did that caused PEN)
[bad code example]

// ✅ CORRECT (what agent should have done)
[good code example]
\```

**Why this matters:** [Specific consequence from PEN]
```

**Strength:** Crystal clear, agent can copy pattern.
**Weakness:** May encourage copy-paste without understanding.

---

## Combination Strategies

**Often best results come from COMBINING strategies:**

### Combo 1: Prime Directive + Escape Hatch
```markdown
## Prime Directives
3. Full context to reviewers. Missing files = wasted iteration. PEN-001.

## Before Calling Reviewer
1. **Check:** All files exist? If no, **STOP**.
```

**Why:** Prime Directive = high-level principle, Escape Hatch = enforcement mechanism.

### Combo 2: Table + Concrete Example
```markdown
## Validation Table
[Checklist of items]

## Example: Correct Schema (PEN-002)
```sql
CREATE ROLE app_user NOSUPERUSER NOBYPASSRLS;
CREATE POLICY tenant_isolation ON users FOR ALL TO app_user ...
\```
```

**Why:** Table = structure, Example = what "correct" looks like.

### Combo 3: Philosophy + Prime Directive + Suppression
```markdown
## Philosophy
[Vivid mental model]

## Prime Directives
[3-5 specific rules]

## Suppressions
[Known false positives to ignore]
```

**Why:** Philosophy = how to think, Prime Directives = what to do, Suppressions = what NOT to worry about.

---

## Choosing the Right Strategy

| Situation | Best Strategy | Second Best |
|-----------|---------------|-------------|
| Agent forgot action | B (Escape Hatch) | A (Prime Directive) |
| Agent wrong order | B (Escape Hatch) | C (Table) |
| Agent missed edge case | C (Table - multi-path) | A (Prime Directive) |
| Agent wrong config | C (Table - validation) | F (Example) |
| Agent false positive | D (Suppression) | - |
| Agent wrong mindset | E (Philosophy) | A (Prime Directive) |

---

## Anti-Patterns (What NOT to Do)

❌ **Too Many Rules:** 20+ Prime Directives = agent overwhelmed
✅ **Better:** 3-5 core principles + specific tables/checklists

❌ **Vague Escape Hatch:** "Check if everything is ready"
✅ **Better:** "Check: ARCHITECTURE.md exists? schema.prisma exists? CONTRACT_DRAFT.md exists?"

❌ **Mechanical Table:** Just a list to check off without understanding
✅ **Better:** Table + rationale column ("Why this matters: PEN-002")

❌ **Generic Suppression:** "Don't worry about minor issues"
✅ **Better:** "DO NOT flag defensive nil checks as redundant - defense in depth is intentional"

❌ **Abstract Philosophy:** "Be excellent"
✅ **Better:** "You are a paranoid staff engineer hunting production bugs"

---

**Use this guide to choose enhancements that FIT the failure mode!**
