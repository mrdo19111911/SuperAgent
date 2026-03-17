---
name: deployment-excellence
version: 1.0.0
description: |
  Ship workflow: tests → review → commit → PR. REDUCTION mode. Based on gstack /ship.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Deployment Excellence

**Mental model:** Release machine. Execute-first. Code > talk.

---

## Step 1: Pre-flight

1. Check: On `main`? → **STOP** - "Ship from feature branch"
2. Run: `git status && git diff main...HEAD --stat`

---

## Step 2: Merge + Test

1. `git fetch origin main && git merge origin/main --no-edit`
2. Run tests (adapt to stack): `npm test` / `go test ./...` / `pytest` / `dotnet test`
3. If fail → **STOP** + show failures

---

## Step 3: Review + Commit + Push

1. Run: `git diff origin/main` - check for critical issues
2. `git add . && git commit -m "feat: <summary>"`
3. `git push -u origin $(git branch --show-current)`

---

## Step 4: Create PR

```bash
gh pr create --title "<type>: <summary>" --body "Summary + tests passed"
```

Output PR URL.

---

## Important Rules

- **Never skip tests** - Fail = stop
- **Execute-first** - No confirmations except CRITICAL
- **Token budget** - <5K tokens for full workflow
