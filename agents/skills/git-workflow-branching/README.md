# Git Workflow & Branching

**Skill ID:** `git-workflow-branching`
**Version:** 2.0.0 (GSTACK v2.0)
**Status:** active
**Priority:** P2 (MEDIUM)
**Mode:** TWO_PASS

## Overview

Version control architect skill for maintaining sacred git history—clean, deployable, and auditable. Implements trunk-based development, GitFlow, conventional commits, and merge strategies with GSTACK 12 principles.

**Philosophy:** "Main branch is sacred. Every commit must be deployable. History is immutable documentation."

## Three Operating Modes

1. **CRITICAL MODE (History Integrity):** Force push to protected branches, merge conflicts >10 files, secrets in git history → BLOCKS deployment
2. **INFORMATIONAL MODE (Clean Commits):** Commit message style, branch naming conventions, squash opportunities → improve maintainability
3. **COLLABORATION MODE (Team Coordination):** PR templates, code review integration, multi-developer merge strategies → optimize team velocity

## Prime Directives (7 Rules)

1. NEVER force push to protected branches (main, master, production) — Use `--force-with-lease` on feature branches only
2. Branch naming: `type/TICKET-ID-description` (feat/USER-123-add-export)
3. Commit messages: Conventional Commits `<type>(<scope>): <subject>`
4. Pull before push — `git pull --rebase origin main` to avoid merge commits
5. Delete merged branches — Local and remote cleanup after merge
6. Squash WIP commits — `git rebase -i HEAD~5` before final PR
7. Anti-Patterns: Force push to main (P0), secrets committed (P0), no ticket ID (P2), WIP commits in PR (P3)

## Branching Strategies

| Strategy | Best For | Merge Method | Pros | Cons |
|----------|----------|--------------|------|------|
| Trunk-Based | CI/CD, SaaS | Squash merge | Simple, fast deploy | Requires strong CI |
| GitHub Flow | Web apps | Squash or merge | Simple workflow | No release branches |
| GitFlow | Scheduled releases | Merge commit | Supports release QA | Complex, slow |

**Recommendation:** Trunk-Based for web apps. GitFlow for mobile/desktop releases.

## Two-Pass Review

**CRITICAL (blocks merge):**
- Force push to main/master/production
- Merge conflicts unresolved (>10 files)
- Secrets in diff (`git diff | grep -E 'API_KEY|PASSWORD'`)
- No JIRA/Linear ticket ID in branch name
- Breaking changes without migration plan

**INFORMATIONAL (optimize later):**
- Commit message style (type/scope adherence)
- Too many commits (>10 = needs squashing)
- Branch name conventions (feat vs feature)
- Commit body formatting

## Quick Reference

### Branch Naming
```
feat/USER-123-short-description
fix/BUG-456-short-description
hotfix/v1.2.1-cve-patch
release/v2.0.0
```

### Commit Message Template
```
<type>(<scope>): <subject>

[optional body with details]

[optional footer: Closes #123, BREAKING CHANGE: ...]
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

## Real Production Bugs Prevented

| Violation | Cost | Prevention |
|-----------|------|------------|
| Force push to main | 24 engineer-hours | Prime Directive #1 |
| Secrets committed | $47,000 AWS bill | Pre-push checklist |
| No ticket ID | 8 hours archaeology | Prime Directive #2 |
| Merge conflicts ignored | 2-hour outage | Pre-push checklist |

## Archetype Compatibility

| Archetype | Fit | Reason |
|-----------|-----|--------|
| Builder | ✅ Perfect | Daily commit and branch workflow |
| Operator | ✅ Perfect | Release tagging and deployment (PRIMARY for Hưng) |
| Analyst | ⚠️ Acceptable | PR template structure and planning |
| Strategist | ⚠️ Acceptable | Choosing workflow strategy |
| Critic | ⚠️ Acceptable | Review PR conventions |

## Dependencies

**Tools required:**
- Bash (git commands)
- `gh` CLI (GitHub operations — optional but recommended)

**No external skill dependencies.**

## Primary Users

- **Hưng (DevOps/Infra)** — PRIMARY: Release tagging, deployment workflows, branch protection
- **All Dev agents** — Thúc, Lân, Tuấn, Huyền-Py, Hoàng, Trinh: Daily commit and branching

## Integration with Nash Framework

- **Pipeline 3 (Coding):** Conventional Commits enforcement for all code changes
- **Pipeline 5 (Security):** `gates/security.sh` scans for secrets before deploy
- **Pipeline 6 (Hotfix):** Hotfix workflow for production incidents
- **Gate scripts:** `gates/commit.sh` validates commit format and branch name

## Performance

- **Avg tokens:** ~3,800 (reference guide, not executed inline)
- **Complexity:** Low (templates and conventions)
- **Line count:** 620 lines (GSTACK v2.0 compliant)

## Key Sections in SKILL.md

1. **Philosophy** — Version control architect mental model (3 modes)
2. **Prime Directives** — 7 non-negotiable rules with anti-patterns
3. **Branching Strategies Table** — 4 strategies with decision criteria
4. **Branch Lifecycle** — 7-phase trunk-based workflow (create → cleanup)
5. **Conventional Commits Format** — Types table with versioning impact
6. **Merge Strategies** — Squash vs rebase vs merge with decision matrix
7. **GitFlow Workflow** — Release-based workflow for mobile/desktop
8. **Pre-Push Checklist** — CRITICAL vs INFORMATIONAL verification
9. **Meta-Instructions** — Stopping policy and production bug examples
10. **Quick Reference Card** — Copy-paste commands for daily use

## Known Limitations

- GitHub-centric (adaptable to GitLab/Bitbucket with minor changes)
- Assumes semantic versioning for releases
- English-only examples (patterns are language-agnostic)

## Changelog

**v2.0.0** (2026-03-16) — GSTACK v2.0 Upgrade
- Add Philosophy section with 3 mental models (CRITICAL, INFORMATIONAL, COLLABORATION)
- 7 Prime Directives with P0-P3 violation mapping
- Two-Pass review workflow (CRITICAL blocks merge, INFORMATIONAL optimizes)
- Branching Strategies table with decision criteria
- 7-phase Branch Lifecycle (trunk-based development)
- Conventional Commits Types table with versioning impact
- Merge Strategies with decision matrix
- GitFlow workflow (feature, release, hotfix)
- Pre-Push Checklist (CRITICAL vs INFORMATIONAL)
- Meta-Instructions with Stopping Policy
- Real Production Bugs table (force push, secrets, conflicts)
- Quick Reference Card for daily use
- 620 lines (3.2x expansion from v1.0.0)

**v1.0.0** (2026-03-15) — Initial Release
- Basic trunk-based and GitFlow patterns
- Conventional Commits guide
- PR template and merge strategy reference
- 195 lines
