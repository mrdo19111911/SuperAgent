# Agent Creator Guide
## Step-by-Step Process to Build Complete Agent

**Time:** 30-60 minutes per agent

---

## Prerequisites

1. Read [../1_SOUL_CREATION/SOUL_TEMPLATE.md](../1_SOUL_CREATION/SOUL_TEMPLATE.md)
2. Choose archetype from [soul_archetypes.md](../1_SOUL_CREATION/references/soul_archetypes.md)
3. Pick SOUL from [soul_catalog.md](../1_SOUL_CREATION/references/soul_catalog.md)

---

## Step 1: Create SOUL (20 min)

**If reusing existing SOUL:**
```markdown
## 🎭 SOUL

**SOUL:** `../../agents/souls/cathedral-architect.md`
```

**If creating new SOUL:**
- Fill in [../1_SOUL_CREATION/SOUL_TEMPLATE.md](../1_SOUL_CREATION/SOUL_TEMPLATE.md)
- Include: Role, Mental Models, Core Values, Adversarial Posture, Personality Traits

**Token target:** ~200 tokens

---

## Step 2: Add Skills (15 min)

Skills = What you DO, HOW you execute

**Workflow structure:**
```markdown
## ⚙️ SKILLS (Capabilities)

### Skill 1: {Name}
**Workflow:**
1. Step 1
2. Step 2
3. Step 3

**Preconditions:**
- Condition A must be true
- Condition B must exist

**Assertions:**
- Assert X at step 2
- Assert Y at completion

**PEN Reminders:**
- [PEN-001] Never skip validation X
```

**Reference existing skills:**
```markdown
**SKILL:** `~/.claude/skills/architecture-design/SKILL.md`
**SKILL:** `~/.claude/skills/code-review-excellence/SKILL.md`
```

**Token target:** ~200 tokens (skills section)

---

## Step 3: Add PEN/WIN Memory (5 min)

Initially empty, will grow from production failures:

```markdown
## PEN (Hard Constraints)

*(Empty - will be populated when penalties received)*

## WIN (Repeat These)

*(Empty - will be populated when rewards received)*
```

---

## Step 4: Configure Tools (5 min)

List available tools:

```markdown
## TOOLS

- **Bash** - Run shell commands
- **Read** - Read files
- **Write** - Write files
- **Edit** - Edit files
- **Grep** - Search codebase
- **Glob** - Find files by pattern
```

---

## Step 5: Add Domain Knowledge (10 min)

Project-specific standards:

```markdown
## DOMAIN KNOWLEDGE

### Architecture Rules (STMAI)
1. Multi-tenancy: Every table has `tenant_id` + RLS
2. API Envelope: `{ success, data, meta }`
3. Soft Delete: `deleted_at = NOW()`

### API Standards
- REST endpoints: `/api/v1/{resource}`
- Authentication: JWT in Authorization header
```

**Token target:** ~100 tokens

---

## Step 6: Add Statistics (Optional)

Performance tracking:

```markdown
## STATISTICS

**Nash Score:** 0 (baseline)
**Pass Rate:** N/A (new agent)
**Quality Metrics:**
- P0 penalties: 0
- P1 penalties: 0
- Successful challenges: 0
```

---

## Step 7: Create Boot Protocol (5 min)

How to load this agent:

```markdown
## BOOT PROTOCOL

1. Load BRAIN.md (permanent context)
2. Load this file (L2 Cache <500 tokens)
3. Load SOUL (if not inline)
4. Load PEN/WIN entries
5. Load relevant skills
6. Ready for task
```

---

## Complete Example

See `../../agents/core/phuc-sa.md` for production example

**Minimal agent:**
```markdown
# My Agent — L2 Cache

Role: {Role} | Model: Sonnet | Archetype: {Archetype}

---

## 🎭 SOUL
**SOUL:** `../../agents/souls/cathedral-architect.md`

---

## ⚙️ SKILLS

### Skill 1: Core Workflow
1. Do X
2. Do Y
3. Do Z

---

## PEN (Hard Constraints)
*(Empty)*

## WIN (Repeat These)
*(Empty)*

---

## TOOLS
- Bash, Read, Write, Edit, Grep, Glob

---

## BOOT PROTOCOL
1. Load BRAIN.md
2. Load this file
3. Load SOUL
4. Ready
```

---

## Checklist

Before finalizing agent:

- [ ] SOUL section present (inline or reference)
- [ ] Skills have workflows/checklists
- [ ] PEN/WIN sections exist (even if empty)
- [ ] Tools configured
- [ ] Boot protocol defined
- [ ] Token count <500 (L2 Cache target)
- [ ] Tested with real task

---

## Next Steps

1. Create agent using this guide
2. Test with simple task
3. Move to [../3_AGENT_SHARPENING/](../3_AGENT_SHARPENING/) when PEN entries accumulate
4. Use [../4_COGNITIVE_MODE_OPTIMIZATION/](../4_COGNITIVE_MODE_OPTIMIZATION/) to optimize modes
