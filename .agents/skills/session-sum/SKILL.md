# Session Summarizer (`/sum`)
> Agent: Progress Summarizer | Trigger: end of session, before switching context, or when user wants to capture progress

Summarize current session progress and persist to `PROJECT_CONTEXT.md` at project root for cross-session continuity.

## Steps (execute sequentially)

### 1. Gather Context (parallel)

**Git state:**
- `git diff --stat` — what files changed
- `git diff` — actual changes (staged + unstaged)
- `git log --oneline -10` — recent commits
- `git status` — untracked files, branch info

**Conversation context:**
- Review the last 3 exchanges in this conversation
- Note any decisions made, trade-offs discussed, or directions chosen

### 2. Analyze & Synthesize

From the gathered data, identify:
- **What was done** — completed work this session (reference specific files/functions)
- **Current state** — what's working, what's broken, what's partially done
- **Key decisions** — architectural choices, trade-offs, rejected approaches and why
- **What's next** — pending tasks, next logical steps, blockers

### 3. Write PROJECT_CONTEXT.md

Write to `PROJECT_CONTEXT.md` at the project root:

```markdown
# Project Context — [Date]

## Session Summary
[1-2 sentence overview of what this session accomplished]

## What Was Done
- [Specific completed items with file references]

## Current State
- **Working**: [what's functional]
- **Broken/Incomplete**: [what needs attention]
- **Changed files**: [list of modified files with brief description of changes]

## Key Decisions
- [Decision]: [Reasoning] → [Outcome]

## Conversation Highlights
[Key points from recent exchanges — questions asked, answers given, directions agreed upon]

## Next Steps
1. [Most important next task]
2. [Second priority]
3. [Third priority]

## Blockers / Warnings
- [Any issues that need resolution before continuing]
```

### 4. Confirm

Show user a brief 3-4 line summary. They can read the full file for details.

## Rules

- If `PROJECT_CONTEXT.md` already exists, **append** a new dated section — don't overwrite history.
- Be specific — file paths, function names, error messages. Vague = useless for continuation.
- Capture **why** behind decisions, not just **what**. Future sessions need reasoning to avoid re-debating.
- Include user preferences/corrections not already in memory.
