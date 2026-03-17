# SOUL Creation

**Purpose:** Create agent personality and identity (the WHO, not the WHAT)

---

## What is SOUL?

**SOUL = Identity, Personality, Values, Mental Models**

The SOUL section defines WHO your agent is, HOW they think, and WHY they exist. This is the persistent identity that remains stable across all sessions.

**SOUL is NOT:**
- Workflows (that's Skills)
- Tools (that's Tools section)
- Specific tasks (that's Skills)

**SOUL IS:**
- Vivid metaphor ("cathedral architect", "paranoid reviewer", "surgical debugger")
- Mental models (how you approach problems)
- Core values (priority ordering when values conflict)
- Adversarial posture (how you interact with other agents)
- Personality traits (behavioral consistency)

---

## Quick Start (20 min)

1. Copy [SOUL_TEMPLATE.md](SOUL_TEMPLATE.md)
2. Choose archetype from [references/soul_archetypes.md](references/soul_archetypes.md)
3. Fill in 5 sections:
   - Role & Identity
   - Mental Models & Modes
   - Core Values
   - Adversarial Posture
   - Personality Traits
4. Done!

---

## Files

- **[SOUL_TEMPLATE.md](SOUL_TEMPLATE.md)** - Copy-paste template (5 min read)
- **[references/soul_catalog.md](references/soul_catalog.md)** - 5 reusable SOULs (5 min read)
- **[references/soul_archetypes.md](references/soul_archetypes.md)** - 5 archetypes explained (10 min read)

---

## SOUL Reusability

**Goal:** 5 SOULs → 20+ agents

**Example:**
- "cathedral-architect" SOUL → Phúc SA, Hiếu Arch, Quang DB-Arch
- "paranoid-reviewer" SOUL → Mộc Arch-Chal, Ngu Sec-Rev, Xuân Spec-Rev
- "qa-champion" SOUL → Sơn QA, Huyền FE-QA, Lan E2E

**Benefits:**
- Consistent personality across agents
- Faster agent creation (reuse existing SOUL)
- Token savings (reference SOUL file instead of inline)

---

## Examples

### Good SOUL (Vivid)
```markdown
### Role & Identity
**You are not** a generic system architect.

**You are** a cathedral architect - you think in 10-star platonic ideals, then reduce to MVP without compromising structural integrity.

**Your mission:** Make it extraordinary, even if constrained to MVP.
```

### Bad SOUL (Generic)
```markdown
### Role & Identity
You are a system architect who designs software systems and creates architecture documents.
```

---

## Next Steps

1. Read [SOUL_TEMPLATE.md](SOUL_TEMPLATE.md)
2. Study [soul_archetypes.md](references/soul_archetypes.md)
3. Create your first SOUL
4. Move to [../2_AGENT_CREATION/](../2_AGENT_CREATION/) to build complete agent
