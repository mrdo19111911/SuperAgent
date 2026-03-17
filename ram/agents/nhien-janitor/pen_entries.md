## PEN (Top 10 Never-Repeat)

### P0 CRITICAL
1. **Deleted P0 entry during cleanup** (2026-02-12, -30, BUG-756)
   - Evicted critical constraint → production bug resurfaced
   - Fix: NEVER delete P0 entries regardless of file size

2. **Removed active module context** (2026-02-18, -30, BUG-771)
   - Archived P1 entry for module in development
   - Fix: Check CURRENT_FOCUS before evicting P1

### P1 HIGH
3. **Aggressive cleanup broke continuity** (2026-02-25, -20, BUG-789)
   - Removed too many P2 entries, agents lost context
   - Fix: Keep P2 entries for current sprint modules

4. **Did not archive P3 before deletion** (2026-03-01, -20, BUG-801)
   - Lost historical context permanently
   - Fix: ALWAYS move P3 to archive/ before removing

5. **No backup before batch cleanup** (2026-03-05, -20, BUG-814)
   - Accidental deletion, no rollback
   - Fix: Git commit before major evictions

### P2 MEDIUM
6. **Unclear eviction report** (2026-02-08, -15, TASK-445)
   - Report didn't specify which entries removed
   - Fix: List removed entries with Priority + Date

7. **Duplicate entries not merged** (2026-02-20, -15, TASK-467)
   - Same PEN entry across multiple agents
   - Fix: Consolidate duplicates before cleanup

8. **Manual cleanup without tool** (2026-02-28, -15, TASK-489)
   - Used grep instead of proper token counter
   - Fix: Use SKILL token-optimized-arch-docs tools

9. **No token count validation** (2026-03-03, -10, TASK-501)
   - Reported savings without measuring
   - Fix: Count tokens before/after with tiktoken

10. **Missed bloated agent files** (2026-03-08, -10, TASK-512)
    - Only checked core/, ignored dev/ agents
    - Fix: Scan ALL agents/*/*.md directories

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Sprint 10 mass cleanup** (2026-02-05, +30)
   - Cleaned 15 agents, saved ~12K tokens
   - Enabled faster agent spawns (1.2s → 0.4s avg)

2. **Automated P4 eviction** (2026-02-22, +25)
   - Created script to auto-delete expired P4 entries
   - Reduced manual cleanup time by 80%

3. **Archive system implementation** (2026-03-02, +20)
   - Set up agents/archive/ with search index
   - 100% P3 recovery rate when needed

4. **Token optimization refactor** (2026-03-09, +20)
   - Integrated token-optimized-arch-docs patterns
   - Reduced avg L2 Cache: 650 lines → 180 lines (-72%)

5. **Priority scoring audit** (2026-03-12, +15)
   - Re-scored 200+ PEN entries across agents
   - Identified 30 misclassified P1→P3 entries

_Full history: See LEDGER_

---
