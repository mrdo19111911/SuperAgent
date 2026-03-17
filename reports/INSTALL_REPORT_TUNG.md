# SKILL INSTALLATION REPORT: Tùng Diag

**Agent:** Tùng Diag (AUDIT Lead / Emergency Coordinator)
**Date:** 2026-03-16
**Archetype:** Analyst + Operator

---

## Agent Profile Summary

**Role:** AUDIT Lead, Emergency Coordinator
**Responsibilities:**
- Phase -1: Coordinate 12-dimension audit (3 parallel streams)
- Pipeline 6: Emergency hotfix coordination & root cause analysis
- Bug triage & severity classification

**Key Keywords:** audit, diagnostics, emergency, hotfix, root-cause, triage, severity

---

## Skills Installed

### 1. **bug-triage** (Primary)
- **Path:** `E:\SuperAgent\agents\skills\bug-triage\SKILL.md`
- **Relevance:** Core skill for Pipeline 6 - severity classification (BLOCKER/CRITICAL/MAJOR/MINOR)
- **Archetype Fit:** Analyst + Operator
- **Installation:** Reference added to L2 Cache

### 2. **code-review-excellence** (Audit)
- **Path:** `E:\SuperAgent\agents\skills\code-review-excellence\SKILL.md`
- **Relevance:** Two-pass review supports audit thoroughness
- **Archetype Fit:** Critic + Builder
- **Installation:** Reference added to L2 Cache

### 3. **data-flow-tracing** (Root Cause)
- **Path:** `E:\SuperAgent\agents\skills\data-flow-tracing\SKILL.md`
- **Relevance:** Trace root cause through DB → API → State → UI
- **Archetype Fit:** Critic + Analyst
- **Installation:** Reference added to L2 Cache

### 4. **token-optimized-arch-docs** (Audit Reports)
- **Path:** `E:\SuperAgent\agents\skills\token-optimized-arch-docs\SKILL.md`
- **Relevance:** Create concise AUDIT_REPORT_FINAL.md with token optimization
- **Archetype Fit:** Strategist + Analyst
- **Installation:** Reference added to L2 Cache

---

## Installation Actions

```markdown
## 📚 reference_Memory

- [Audit & Diagnostics Strategy](../tmp/ram/tung-diag/diagnostics.md) ← khi Audit dự án hoặc server sập
- [Audit History](../tmp/ram/tung-diag/history.md) ← lịch sử sập và root causes

### SKILLS (4 equipped)
- **SKILL:** `../../agents/skills/bug-triage/SKILL.md` ← Bug Triage Matrix (Pipeline 6 Core)
- **SKILL:** `../../agents/skills/code-review-excellence/SKILL.md` ← Two-Pass Audit Thoroughness
- **SKILL:** `../../agents/skills/data-flow-tracing/SKILL.md` ← Root Cause Tracing (DB→API→UI)
- **SKILL:** `../../agents/skills/token-optimized-arch-docs/SKILL.md` ← Concise Audit Reports

- **TOOL: Write** — Ghi artifact ra disk. Mọi output ĐỀU PHẢI lưu file, không chỉ print ra chat.
```

---

## Token Impact

- **Before:** ~250 tokens (L2 Cache)
- **Skill References:** ~120 tokens (4 skills × 30 tokens each)
- **Total:** ~370 tokens (well under 500 token limit)

---

**Status:** ✅ COMPLETE
**Skills Installed:** 4/4
**Token Budget:** OK (370/500)
