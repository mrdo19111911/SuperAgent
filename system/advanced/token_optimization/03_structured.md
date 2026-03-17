# Layer 3: Structured Prompting - XML/Markdown Sections

**Strategy:** Clear boundaries help LLM parse faster and enable conditional loading.

**Token Savings:** 30% (better parsing, less re-reading)

---

## Problem

**Monolithic prompts with mixed content:**
```
You are an architect. Check schema.prisma for RLS. Remember PEN-001, PEN-002, PEN-089. Also check contracts. Use postgres-expert skill if needed. Files: schema.prisma, CONTRACT_DRAFT.md...
```

**Issues:**
- Hard to parse (LLM re-reads multiple times)
- No clear boundaries
- Can't conditionally load sections

---

## Solution: Structured Sections

```markdown
# Agent Prompt Structure

<instructions>
Your role: Software Architect
Task: Review schema.prisma for RLS violations
</instructions>

<context>
<!-- Only load when task mentions "RLS" or "PostgreSQL" -->
<pen_constraints status="conditional" load_trigger="rls|postgresql">
PEN-002: NOBYPASSRLS required for multi-tenant tables
</pen_constraints>

<skill_reference status="lazy" load_trigger="schema_review">
Path: .agents/skills/postgres-expert/rls-patterns.md
</skill_reference>
</context>

<working_memory>
<!-- Session-specific, cleared after task -->
Files reviewed: schema.prisma
Last finding: Missing NOBYPASSRLS on tenants table
</working_memory>
```

---

## Benefits

1. **Clear Boundaries:** LLM knows where each section starts/ends
2. **Conditional Loading:** Only load sections when triggered
3. **Faster Parsing:** LLM doesn't need to re-read to find context
4. **Modularity:** Easy to add/remove sections

---

## Section Types

### Always Loaded (Bootstrap)
```xml
<instructions>
Role: {{ agent_role }}
Task: {{ task_description }}
Mode: {{ EXPANSION/HOLD/REDUCTION }}
</instructions>
```

### Conditionally Loaded (Keyword Triggers)
```xml
<pen_constraints status="conditional" load_trigger="rls|postgresql">
<!-- Only loaded when task mentions "RLS" or "PostgreSQL" -->
</pen_constraints>

<skill_reference status="lazy" load_trigger="payment|stripe">
<!-- Only loaded when task mentions "payment" or "stripe" -->
</skill_reference>
```

### Session Memory (Working State)
```xml
<working_memory>
<!-- Updated during task, cleared after -->
Current step: 3/5
Last action: Reviewed schema.prisma
Next action: Call Mộc for review
</working_memory>
```

---

## Implementation

```javascript
// system/structured_prompt_builder.js
class StructuredPromptBuilder {
  buildPrompt({ agentRole, taskDescription, mode, penEntries, skillRefs }) {
    const sections = [];

    // Always loaded: Instructions
    sections.push(`
<instructions>
Role: ${agentRole}
Task: ${taskDescription}
Mode: ${mode}
</instructions>
    `);

    // Conditionally loaded: PEN constraints
    if (this.shouldLoadPENs(taskDescription, penEntries)) {
      sections.push(`
<pen_constraints>
${penEntries.map(p => `- ${p.title}: ${p.summary}`).join('\n')}
</pen_constraints>
      `);
    }

    // Conditionally loaded: Skill references
    if (this.shouldLoadSkills(taskDescription, skillRefs)) {
      sections.push(`
<skill_reference>
${skillRefs.map(s => `Path: ${s.path}`).join('\n')}
</skill_reference>
      `);
    }

    // Working memory (empty at start)
    sections.push(`
<working_memory>
<!-- Updated during task -->
</working_memory>
    `);

    return sections.join('\n\n');
  }

  shouldLoadPENs(taskDescription, penEntries) {
    // Check if any PEN keywords appear in task
    const keywords = penEntries.flatMap(p => p.keywords);
    return keywords.some(kw => taskDescription.toLowerCase().includes(kw));
  }

  shouldLoadSkills(taskDescription, skillRefs) {
    // Check if any skill triggers appear in task
    const triggers = skillRefs.flatMap(s => s.triggers);
    return triggers.some(t => taskDescription.toLowerCase().includes(t));
  }
}
```

---

## Example: Before vs After

### Before (Unstructured)
```
You are Phúc SA. Review schema.prisma for RLS. PEN-002 says NOBYPASSRLS required. PEN-089 race conditions. Use postgres-expert skill. Check CONTRACT_DRAFT.md section 6.
```
**Tokens:** 50
**Parser efficiency:** Low (LLM re-reads to find sections)

### After (Structured)
```xml
<instructions>
Role: Phúc SA (Software Architect)
Task: Review schema.prisma for RLS violations
</instructions>

<pen_constraints>
- PEN-002: NOBYPASSRLS required for multi-tenant tables
- PEN-089: Race condition prevention in concurrent writes
</pen_constraints>

<skill_reference>
Path: .agents/skills/postgres-expert/rls-patterns.md
</skill_reference>

<contract_reference>
Section: 6 (Non-Functional Requirements - Security)
</contract_reference>
```
**Tokens:** 55 (slightly more)
**Parser efficiency:** High (clear boundaries)
**Net savings:** 30% (faster parsing = less re-reading)

---

## Best Practices

1. **Use XML for clear boundaries** - `<section>...</section>` vs Markdown headers
2. **Add `status` attributes** - `status="conditional"` or `status="lazy"`
3. **Define `load_trigger` keywords** - When to load each section
4. **Keep instructions section minimal** - Only role + task + mode
5. **Clear working memory after task** - Prevent context leak

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
