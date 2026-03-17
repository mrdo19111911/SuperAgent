# Agent Sharpening

**Purpose:** Fix failing agents (PEN entries) and upgrade to 2026 standards

---

## Two Sharpening Systems

### Reactive Sharpening (PEN/WIN-based)
**Tool:** [sharpener_reactive/SKILL.md](sharpener_reactive/SKILL.md)

**Use when:**
- Agent has 3+ active PEN entries
- Repeated bug pattern
- P0/P1 penalty received
- Production incident

**Process:**
1. Extract PEN/WIN from agent file
2. Auto-generate tests from PENs
3. Apply enhancements (Prime Directive, Escape Hatch, Table, Suppression, Philosophy)
4. Verify fixes
5. Update agent + mark PENs FIXED

**Time:** 15-30 min per agent

---

### Proactive Sharpening (Industry Standards)
**Tool:** [sharpener_proactive/SKILL.md](sharpener_proactive/SKILL.md)

**Use when:**
- Quarterly upgrade (every 3 months)
- Token bloat (>500 L2 Cache)
- New 2026 patterns available
- Performance optimization needed

**Process:**
1. Audit against 5 core principles
2. Apply workflow patterns (ReAct, Plan-and-Execute, etc.)
3. Optimize tokens (6-layer defense)
4. Validate improvements
5. Document in SHARPENING_LOG

**Time:** 30-60 min per agent

---

## Decision Guide

**Read:** [sharpening_decision_tree.md](sharpening_decision_tree.md) (5 min)

**Quick decision:**
- Agent broke → Reactive (fix specific bugs)
- Agent old/bloated → Proactive (modernize/optimize)
- Both → Quarterly reactive cleanup + proactive upgrade

---

## When to Sharpen

**Read:** [references/when_to_sharpen.md](references/when_to_sharpen.md) (5 min)

**Reactive triggers:**
- P0 penalty
- 3+ active PEN entries
- Repeated bug pattern
- Production incident

**Proactive triggers:**
- Quarterly (every 3 months)
- Token bloat (>500 L2)
- New workflow patterns available

---

## Files

- **[sharpening_decision_tree.md](sharpening_decision_tree.md)** - Reactive vs Proactive guide
- **[references/when_to_sharpen.md](references/when_to_sharpen.md)** - Trigger conditions
- **[sharpener_reactive/](sharpener_reactive/)** - PEN/WIN-based sharpening tool
- **[sharpener_proactive/](sharpener_proactive/)** - Industry standards upgrade tool
