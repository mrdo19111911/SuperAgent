# Cognitive Mode Optimization

**Purpose:** Optimize agent token usage based on task complexity

---

## Three Cognitive Modes

### EXPANSION
**When:** Exploring, researching, designing, novel problems
**Token Budget:** 15K-30K
**Behavior:** Think broadly, explore alternatives, consider edge cases

### HOLD
**When:** Implementing from clear spec, validation, routine work
**Token Budget:** 10K-15K
**Behavior:** Execute precisely, follow checklist, no scope creep

### REDUCTION
**When:** MVP scoping, optimization, scope cuts, over-budget
**Token Budget:** 5K-10K
**Behavior:** Surgical focus, minimal viable, defer non-critical

---

## Quick Guide

**Read:** [references/mode_selection_guide.md](references/mode_selection_guide.md) (15 min)

**Decision tree:**
- Task unclear/novel → EXPANSION
- Task clear/routine → HOLD
- Task over-budget → REDUCTION

---

## Full Specification

**Complete implementation:** `../../system/COGNITIVE_MODES.md` (394 lines)

**Includes:**
- Decision tree for mode selection
- Token budgets per mode
- Behavior specifications
- Mode switching rules
- Grafana metrics integration
- PEN/WIN learning
- Nash Triad integration
- Agent boot protocol

---

## Files

- **[references/mode_selection_guide.md](references/mode_selection_guide.md)** - EXPANSION/HOLD/REDUCTION guide
- **`../../system/COGNITIVE_MODES.md`** - Full specification (45 min read)
