# Code Review Excellence

**Skill ID:** `code-review-excellence`
**Version:** 1.0.0
**Status:** active

## Overview

Two-pass code review skill using structured analysis:

- **Pass 1 (CRITICAL):** SQL & Data Safety, LLM Output Trust Boundary
- **Pass 2 (INFORMATIONAL):** Conditional Side Effects, Magic Numbers, Dead Code, Test Gaps, View/Frontend

Includes suppression list to prevent known false positives. Outputs terse format: `file:line + problem + fix`.

## Usage

```bash
/review
```

Or invoke directly:

```bash
claude --skill agents/skills/code-review-excellence/SKILL.md
```

## Triggers

- When user asks for code review
- When PR needs pre-merge validation
- When /review command is invoked
- During /ship workflow (Step 3.5: Pre-Landing Review)

## Workflow

1. **Check branch** — Skip if on main or no diff
2. **Read checklist** — Load `checklist.md` (two-pass structure)
3. **Get diff** — `git diff origin/main` (includes uncommitted changes)
4. **Two-pass review** — Apply checklist in order (CRITICAL → INFORMATIONAL)
5. **Output findings** — Show all issues, AskUserQuestion for critical ones

## Supporting Files

- [checklist.md](./checklist.md) — Detailed review criteria (two-pass structure)
- [greptile-triage.md](./greptile-triage.md) — External AI review integration

## Workflow Details

See [SKILL.md](./SKILL.md) for step-by-step instructions.

## Testing

See [tests/evals.json](./tests/evals.json) for test cases.

## Changelog

See [tests/CHANGELOG.md](./tests/CHANGELOG.md) for version history.

## Archetype Compatibility

| Archetype | Fit | Reason |
|-----------|-----|--------|
| Critic | ✅ Perfect | Adversarial review is core Critic strength |
| Builder | ✅ Perfect | Pre-submission self-check before handoff |
| Analyst | ⚠️ Acceptable | Can use for spec validation |
| Strategist | ⚠️ Acceptable | Can use for architecture review |
| Operator | ❌ Poor fit | Not aligned with deployment/runtime focus |

## Dependencies

**Tools required:**
- Bash (git commands)
- Read (checklist, agent files)
- Grep (search diffs)
- AskUserQuestion (critical issue triage)

**No external dependencies** — works with standard git repositories.

## Performance

- **Avg tokens:** ~2,500 per review
- **Avg duration:** ~15 seconds
- **Complexity:** Medium (two-pass structure + file reads)

## Known Limitations

- Requires git repository with remote `origin/main`
- Checklist suppressions are static (not learned from history)
- Greptile integration optional (degrades gracefully if unavailable)

## Migration Notes

Migrated from gstack `/review` skill to Nash Skill Registry format on 2026-03-16.

**Original source:** gstack-main/review/
**Adaptations for Nash:**
- Added metadata.json with archetype compatibility
- Structured for skill registry installation
- Compatible with AGENT_TEMPLATE_V2 format
