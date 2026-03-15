# Skill Name

**Role:** [Describe mental model - e.g., "Paranoid code reviewer", "QA automation engineer"]
**Trigger:** [When to invoke - e.g., "Pre-merge review", "Before deployment"]
**Pattern:** [Persistent Server / Stateless / Hybrid Session]

---

## Pre-Conditions

**Required:**
- Git repository (`git status` should work)
- Bun v1.0+ installed
- [Any other dependencies]

**Optional:**
- [Optional API keys, tools]

**Setup:**
```bash
cd ~/.claude/skills/skill-name && ./setup
```

---

## Workflow

**Step 1: [First step name]**
```bash
# Commands to run
git status
git log --oneline -20
```

**Analysis:**
- Parse [what to parse]
- Check for [what to check]

**If [condition]:** [Action - e.g., EXIT early, STOP and ask user]

---

**Step 2: [Second step]**

**For each [item] found:**
- [Action 1]
- [Action 2]

**AskUserQuestion format:**
```
We recommend [option X].

A) [Option with tradeoffs]
B) [Recommended option]
C) [Alternative]
```

---

**Step 3: [Final step]**

**Output:**
- Console: [What to show]
- File: `.gstack/output.json` — [What to save]

---

## Stop Conditions

**STOP if:**
- [Condition 1] → Error: "[Message with fix]"
- [Condition 2] → Skip silently

**Never stop for:**
- [Acceptable warning]
- [Optional dependency missing]

---

## Output Format

**Console (real-time):**
```markdown
## [Section Title]

### Item 1
[Details]

### Item 2
[Details]
```

**File artifacts:**
- `.gstack/[name].json` — [Purpose]
- `.gstack/[name].log` — [Purpose]

**User interaction:**
- One AskUserQuestion per [unit]
- [When to batch vs individual]

---

## Error Handling

**If [error scenario 1]:**
```bash
command 2>&1 || echo "ERROR: [Message]"
```

**If [error scenario 2]:**
- Retry [N] times with exponential backoff
- If still fails → [Fallback action]

---

## Usage Examples

**Basic usage:**
```bash
skill-name
```

**With flags:**
```bash
skill-name --flag value
```

**Debug mode:**
```bash
skill-name --debug
```

---

## Integrations

**Hands off to:**
- `/other-skill` — [When and why]

**Receives from:**
- `/calling-skill` — [What input expected]

**Nash Triad:**
- Thesis: Execute this skill
- Anti-Thesis: [How to verify]
- Synthesis: [How to reconcile]
