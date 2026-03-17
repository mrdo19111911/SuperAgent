## Quick Ref (Common Commands)

```bash
# Count tokens in agent file
npx tiktoken agents/core/phuc-sa.md

# Archive P3 entries
mkdir -p agents/archive/phuc-sa/
mv tmp/ram/phuc-sa/p3_entries.md agents/archive/phuc-sa/

# Git safety commit
git add agents/core/
git commit -m "chore(L2): cleanup sprint 12 - saved 15K tokens"
```

---

**Last Cleaned:** 2026-03-16
**Next Cleanup:** Sprint 13 end (2026-03-30)

## Current Focus (Sprint 12)

- Agent Polishing: Compress 20 agents from ~800 → ~250 lines avg (-69%)
- Skill reference cleanup: Reduce from 26 → Top 5 per agent
- PEN/WIN consolidation: Keep only Top 10/Top 5 in L2

---
