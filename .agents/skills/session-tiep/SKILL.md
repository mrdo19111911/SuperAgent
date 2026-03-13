# Session Continuator (`/tiep`)
> Agent: Session Continuator | Trigger: start of new session, resuming work, or when user says "tiếp", "continue"

Read `PROJECT_CONTEXT.md` and either auto-resume work or ask what to do next.

## Steps

### 1. Read Context

Read `PROJECT_CONTEXT.md` at the project root. If multiple sessions exist, focus on the **most recent** section.

### 2. Verify Current State (parallel)

- `git status` — check current branch and working state
- `git log --oneline -5` — verify recent commits match context
- Quick scan any files mentioned as broken/incomplete in context

### 3. Decide: Auto-resume or Ask

**Context exists with "Next Steps":**
- Brief status update (3-4 lines max):
  - Last session: [what was done]
  - Current state: [working/broken]
  - Next up: [first priority from Next Steps]
- **Start working on first Next Step immediately** — no waiting for confirmation.
- If user says something specific alongside `/tiep`, prioritize their request.

**Context empty or doesn't exist:**
- Tell user there's no saved context
- Show `git log --oneline -10` and `git status`
- Ask: "Bạn muốn làm gì tiếp?"

**Context exists but no clear Next Steps:**
- Summarize what was last done
- Ask: "Context cũ không có next steps rõ ràng. Bạn muốn làm gì?"

### 4. Work

Begin working. Follow project conventions from `CLAUDE.md`.

## Rules

- **Speed over ceremony** — user invoked `/tiep` because they want to keep moving.
- Address blockers first if mentioned in context.
- Cross-reference git state — if new commits since last session, mention before diving in.
- Respect previous key decisions. Don't re-debate unless user brings it up.
