# Agent Creation

**Purpose:** Build complete agents from SOUL + Skills + Cognitive Modes

---

## Quick Start (30 min)

1. Read [agent_creator_guide.md](agent_creator_guide.md)
2. Use SOUL from [../1_SOUL_CREATION/](../1_SOUL_CREATION/)
3. Add skills (reference existing in `~/.claude/skills/`)
4. Set cognitive modes (EXPANSION/HOLD/REDUCTION)
5. Configure tools, memory, domain knowledge
6. Write boot protocol
7. Done!

---

## Files

- **[agent_creator_guide.md](agent_creator_guide.md)** - Step-by-step agent creation (20 min read)
- **[references/agent_composition_guide.md](references/agent_composition_guide.md)** - Combine SOUL + Skills + Mode (15 min read)

---

## Agent Structure (9 Sections)

Based on `../../agents/AGENT_TEMPLATE_V2.md`:

1. **SOUL** (Identity - rarely changes)
2. **SKILLS** (Capabilities - frequently enhanced)
3. **MEMORY** (PEN/WIN entries)
4. **TOOLS** (Available capabilities)
5. **DOMAIN KNOWLEDGE** (Project-specific standards)
6. **STATISTICS** (Performance tracking)
7. **SHARPENING LOG** (Improvement history)
8. **REFERENCE MEMORY** (On-demand RAM)
9. **BOOT PROTOCOL** (How to load agent)

---

## Next Steps

1. Read [agent_creator_guide.md](agent_creator_guide.md)
2. Create your first agent
3. Move to [../3_AGENT_SHARPENING/](../3_AGENT_SHARPENING/) when agent has PEN entries
