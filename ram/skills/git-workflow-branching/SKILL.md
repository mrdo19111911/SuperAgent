---
name: git-workflow-branching
version: 2.0.0
description: |
  Git workflows with trunk-based development, conventional commits, and merge strategies.
  GSTACK v2.0 compliant with Philosophy, Prime Directives, Two-Pass review, and concrete examples.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
mode: TWO_PASS
---

# Git Workflow & Branching

## Philosophy

You are not a developer who "makes commits." You are a version control architect maintaining sacred git history—clean, deployable, and auditable.

Your mental model has three operating modes:

* **CRITICAL MODE (History Integrity):** Force push to protected branches, merge conflicts on >10 files, unresolved secrets in git history. These violations BLOCK deployment and require immediate remediation.

* **INFORMATIONAL MODE (Clean Commits):** Commit message style, branch naming conventions, squash opportunities. These improve maintainability but don't block deploy.

* **COLLABORATION MODE (Team Coordination):** PR templates, code review integration, multi-developer merge strategies. Optimizes for team velocity.

Prime axiom: **"Main branch is sacred. Every commit must be deployable. History is immutable documentation."**

---

## Prime Directives

1. **NEVER force push to protected branches (main, master, production).** Use `git push --force-with-lease` only on personal feature branches. P0 violation.

2. **Branch naming: `type/TICKET-ID-description`.** Examples: `feat/USER-123-add-csv-export`, `fix/BUG-456-auth-timeout`. Types: feat, fix, docs, refactor, test, chore, hotfix.

3. **Commit format: Conventional Commits.** Template: `<type>(<scope>): <subject>`. Breaking changes: add `!` or `BREAKING CHANGE:` footer.

4. **Pull before push.** Run `git pull --rebase origin main` before `git push`.

5. **Delete merged branches.** After PR merge, run `git branch -d feat/USER-123`. Use `gh pr merge --delete-branch`.

6. **Squash WIP commits before merge.** Run `git rebase -i HEAD~5` to squash "WIP", "fix typo", "debugging" commits. Use `git push --force-with-lease` after rebase.

7. **Anti-Patterns (P0-P3):**
   - P0: Force push to main/master/production, secrets committed
   - P1: Merge conflicts unresolved, pushing without pull
   - P2: No ticket in branch name, breaking changes without migration plan
   - P3: "WIP" commits in PR, vague messages ("fix stuff")

---

## Two-Pass Review

**Pass 1: CRITICAL (blocks merge)**
- Force push to protected branches
- Merge conflicts unresolved (>10 files = architecture issue)
- Secrets in diff (`git diff | grep -E 'API_KEY|PASSWORD|TOKEN|SECRET'`)
- No JIRA/Linear ticket ID in branch name
- Breaking changes without documented migration plan

**Pass 2: INFORMATIONAL (optimize later)**
- Commit message style (type/scope adherence)
- Too many commits (>10 commits = needs squashing)
- Branch name conventions (feat vs feature, fix vs bugfix)

---

## Branching Strategies

| Strategy | Best For | Branch Types | Merge Method | Pros | Cons |
|----------|----------|--------------|--------------|------|------|
| **Trunk-Based** | Fast-paced teams, CI/CD | `main` + short-lived `feature/*` | Squash merge | Simple, fast deploy | Requires strong CI/CD |
| **GitHub Flow** | Web apps, continuous deploy | `main` + `feature/*` | Squash or merge | Simple workflow | No release branches |
| **GitFlow** | Scheduled releases | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | Merge commit | Supports release QA | Complex, slow |
| **Feature Branches** | Any team size | `main` + `feature/*` | Squash or merge | Flexible | Can get messy |

---

## Branch Lifecycle (3 Phases)

### Phase 1: Create Branch

```bash
git checkout main && git pull origin main
git checkout -b feat/USER-123-add-csv-export
git push -u origin feat/USER-123-add-csv-export
```

---

### Phase 2: Create Pull Request

```bash
git add src/exportService.ts tests/exportService.test.ts
git commit -m "feat(export): add CSV export for order history

- Implement exportToCSV() function with streaming
- Add unit tests with 10K records fixture

Closes USER-123"
git push

gh pr create \
  --title "feat(export): add CSV export for order history" \
  --body "Closes USER-123" \
  --base main
```

---

### Phase 3: Merge and Cleanup

```bash
gh pr merge --squash --delete-branch
git checkout main && git pull origin main
git branch -d feat/USER-123-add-csv-export
```

**Merge strategy:**
- **Squash:** Feature branches (one feature = one commit)
- **Rebase:** Preserve logical commits, linear history
- **Merge commit:** Release branches (preserve branch context)

---

## Conventional Commits (Concise)

### Types

| Type | Meaning | Example |
|------|---------|---------|
| `feat` | New feature | `feat(auth): add JWT refresh token rotation` |
| `fix` | Bug fix | `fix(export): handle timeout for 10K+ rows` |
| `docs` | Documentation | `docs(readme): update deployment steps` |
| `refactor` | Code refactor | `refactor(db): extract query logic` |
| `perf` | Performance | `perf(query): add index on user.email` |
| `test` | Tests | `test(orders): add integration test for RLS` |
| `chore` | Build/deps | `chore(deps): update Prisma to v5.0` |
| `ci` | CI/CD config | `ci(github): add caching to test workflow` |

### Examples

```bash
git commit -m "feat(export): add CSV export for order history

- Implement exportToCSV() with streaming
- Add tenant_id filtering for multi-tenant isolation

Closes USER-123"

git commit -m "fix(auth): handle JWT expiry edge case

Added 10-second grace period for refresh token rotation.

Closes BUG-456"
```

---

## Production Bug: Force Push to Main

**Violation:** `git push --force` to main deleted 15 commits (5 devs, 3 days work).

**Cost:** 24 eng-hours recovery @ $500/hour = **$12,000**.

**Prevention:**
1. Enable branch protection (Settings → Branches → Require PR)
2. NEVER `git push --force` on shared branches (Prime Directive #1)
3. Use `git push --force-with-lease` on feature branches only

---

## Pre-Push Checklist

**CRITICAL:**
1. [ ] Run tests: `npm test` or `pytest` or `go test ./...`
2. [ ] Review changes: `git diff --cached`
3. [ ] No secrets: `git diff --cached | grep -E 'API_KEY|PASSWORD|TOKEN|SECRET'`
4. [ ] Conventional Commits: `<type>(<scope>): <subject>`
5. [ ] Pull latest: `git pull --rebase origin main`

**INFORMATIONAL:**
6. [ ] Branch has ticket ID: `feat/USER-123-description`
7. [ ] Squash WIP: `git rebase -i HEAD~5` if PR has >5 commits
8. [ ] Run linter: `npm run lint` or `golangci-lint run`

---

## Meta-Instructions

**STOP immediately if:**
- Force push to main/master/production → Use `--force-with-lease` on feature branch only
- Merge conflicts on >10 files → Coordinate with team
- Secrets detected → Remove with `git filter-repo`
- Breaking change without migration plan → Document first

**OK to proceed:**
- Merge conflicts on 1-5 files → Resolve, test, commit
- Large PR (>500 lines) → Consider splitting
- Rebase conflicts on feature branch → Resolve, `git push --force-with-lease`

---

## Quick Reference

### Branch Naming
```
feat/USER-123-short-description
fix/BUG-456-short-description
hotfix/v1.2.1-cve-patch
```

### Daily Workflow (Trunk-Based)
```bash
git checkout main && git pull
git checkout -b feat/USER-789-new-feature
git commit -m "feat(module): add new feature"
git fetch origin main && git rebase origin/main
git push --force-with-lease
gh pr create --base main
gh pr merge --squash --delete-branch
```

### Squash Commits
```bash
git rebase -i HEAD~5                  # Interactive rebase
# Change 'pick' to 'squash' for WIP commits
git push --force-with-lease
```

### Merge Strategies
```bash
gh pr merge --squash --delete-branch  # Squash → 1 commit
gh pr merge --rebase --delete-branch  # Linear history
gh pr merge --merge --delete-branch   # Merge commit
git cherry-pick <hash>                # Single commit
```

### Conflict Resolution
```bash
git merge main                        # or git pull
git status                            # See conflicts
# Edit files, remove <<<<<<< markers
git add <resolved-files>
git commit && git push
```

### Rollback
```bash
git revert <commit-hash>              # Undo commit
git reset --hard origin/main          # DANGER: Discard all
git reflog                            # Recover lost commits
git reset --hard HEAD@{5}             # Restore previous state
```
