# Skills Directory Moved

**DEPRECATED:** This location is deprecated as of Phase 3 refactor.

**New Location:** `ram/skills/`

All skill content has been moved to `ram/skills/` for on-demand loading.

## Registry

- **Compressed Registry:** `ram/skills/_registry.json` (≤5K tokens, L2 Cache)
- **Full Registry:** `ram/skills/_registry_full.json` (backup, HDD)

## Migration

This directory structure is maintained for backward compatibility only.

To access skills:
```markdown
See: `[[ram/skills/{skill-id}/SKILL.md]]`
```

## Note for Developers

If you need to create or modify skills, work directly in `ram/skills/`.
This redirect file will be removed in Phase 4.
