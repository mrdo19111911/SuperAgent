# Agent Memory System

Persistent memory for all STMAI Pipeline agents. Memory files store learnings, patterns, and context across sessions.

## Directory Structure

```
agents/
├── core/       # Core agent memories
├── dev/        # Developer agent memories
├── research/   # Research agent memories (optional)
└── user/       # User agent memories (optional)
```

## Memory File Format

Simple markdown files organized by topic:

```markdown
# Agent Memory — {Agent Name}

## Successful Patterns

### Pattern: {Name}
**Context:** When designing X...
**Solution:** Use Y because Z
**Results:** Performance improved by N%
**Used in:** T4_40, T4_41

## Mistakes & Lessons

### Mistake: {Description}
**What happened:** ...
**Root cause:** ...
**Fix:** ...
**Prevention:** ...

## Adversarial History

### vs Mộc (P1.5)
- **T4_40:** HIGH issue found — missing RLS check → -10 points
- **T4_41:** PASS ngay → +20 points
- **Pattern:** Always validate RLS in ARCHITECTURE.md

## Library Selections

### {Library Name}
**Purpose:** ...
**Why chosen:** ...
**Experience:** Works well / Had issues
**Modules:** T4_40, T4_42

## Quick Reference

**Common gotchas:**
- [ ] Always check X before Y
- [ ] Never do Z without W

**Best practices:**
- [ ] Pattern A for situation B
- [ ] Approach C when D

## Statistics

- Total modules: N
- Nash score: +X
- Gate-1 pass rate: 92%
- P6 avg iterations: 1.1
```

## What to Remember

**DO record:**
- ✅ Recurring patterns and anti-patterns
- ✅ Library selection rationale
- ✅ Adversarial feedback (Mộc/Xuân challenges)
- ✅ Design decisions that worked well
- ✅ Mistakes and how to prevent them
- ✅ Module-specific gotchas
- ✅ Performance learnings

**DON'T record:**
- ❌ Session-specific state (use STATE.md instead)
- ❌ Current task details (use CONTINUE-HERE.md)
- ❌ Code snippets (keep references instead)
- ❌ Obvious knowledge (focus on domain-specific)

## Memory Usage Protocol

**When to READ memory:**
- Starting a new module in familiar domain
- Responding to adversarial challenge
- Selecting libraries/patterns
- After repeated mistakes

**When to WRITE memory:**
- Completed a module (record patterns)
- Fixed a bug caused by past mistake
- Received adversarial feedback
- Learned something non-obvious

## Memory Maintenance

- Update statistics after each module
- Archive outdated patterns (mark as [DEPRECATED])
- Link to specific modules for context
- Keep concise (80% signal, 20% noise)

## File Naming

- Match agent file names: `{agent-id}.md`
- Example: `agents/core/phuc-sa.md`

## Penalty Rules Format Specification (v4.1)

Khi agent bị trừ điểm, Dũng cung cấp structured feedback và agent PHẢI auto-save vào memory file.

### Entry Format

```markdown
## Penalty Rules (Auto-Saved)

### PEN-001 | 2026-03-02 | Module: T3_34_cx-analytics
- **Specific Reason:** Missed RLS check on `analytics_events` table — no `tenant_id` column, no RLS policy
- **General Reason:** Insufficient security validation — did not verify multi-tenancy on every table
- **Prevention Rule:** MUST check RLS policy exists on EVERY table in schema.prisma before declaring architecture PASS
- **Penalty:** Phúc -90 points (Rule: Phúc↔Mộc CRITICAL ×6)
- **Status:** ACTIVE

### PEN-002 | 2026-03-02 | Module: T2_27_dangerous-goods
- **Specific Reason:** False positive — claimed missing HAZMAT validation but it exists in src/validation/hazmat.service.ts:45
- **General Reason:** Did not verify claim against actual source code before raising issue
- **Prevention Rule:** MUST quote exact file:line when raising architecture issue. If cannot find code reference, do NOT raise.
- **Penalty:** Mộc -30 points (Rule: M3 False Positive)
- **Status:** ACTIVE
```

### Field Definitions

| Field | Required | Description |
|-------|----------|-------------|
| `PEN-{NNN}` | Yes | Sequential ID, unique per agent memory file |
| `Date` | Yes | ISO date of penalty event |
| `Module` | Yes | Module where penalty occurred |
| `Specific Reason` | Yes | Exact error with code/doc references |
| `General Reason` | Yes | Pattern/category of mistake |
| `Prevention Rule` | Yes | Actionable rule to prevent recurrence |
| `Penalty` | Yes | Points lost + rule reference |
| `Status` | Yes | ACTIVE (enforced on boot) or RESOLVED (kept for history) |

### Status Values

- **ACTIVE** — Loaded on boot as hard constraint. Agent MUST check this rule before submitting work.
- **RESOLVED** — Kept for history but not enforced. Set by Dũng when agent demonstrates pattern is fixed (3+ modules without repeat).

### Boot Integration

On agent init (Step 4 of Boot Protocol):
1. Read `Agent_v3/agents/{layer}/{agent_name}.md`
2. Find all `### PEN-` entries with `Status: ACTIVE`
3. Each prevention rule = hard constraint for this session
4. Before submitting ANY work, agent MUST verify against ALL active prevention rules

### Dũng Verification

- After penalty, Dũng checks agent memory file within same session
- If PEN entry missing → additional -10 penalty (Rule 13)
- If PEN entry present but incomplete (missing fields) → Dũng requires correction

## See Also

- [Agent Definitions](../agents/README.md)
- [Current State](../state/STATE.md)
- [Nash Equilibrium](../pipeline/NASH_EQUILIBRIUM.md)
- [Penalty Learning Protocol](../pipeline/PIPELINE_v4.0.md#penalty-learning-protocol)

## 📚 reference_Memory

- **TOOL: Write** — Ghi artifact ra disk. Mọi output ĐỀU PHẢI lưu file, không chỉ print ra chat.
