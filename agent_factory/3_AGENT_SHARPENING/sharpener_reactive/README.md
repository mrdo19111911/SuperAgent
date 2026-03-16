# Agent Skill Sharpener
## Mine Production Failures → Auto-Generate Tests → Sharpen Skills

**What is this?** A tool that automatically improves agent skills by converting PEN/WIN entries into regression tests and iteratively enhancing agent capabilities.

---

## 🎯 Use Cases

### Use Case 1: Fix Known Production Failures
```bash
# Agent has 3 ACTIVE PEN entries from past mistakes
/sharpen agents/core/phuc-sa.md

# Tool will:
# 1. Extract PEN-001, PEN-002, PEN-003
# 2. Convert each PEN → regression test
# 3. Run baseline (expect failures)
# 4. Add enhancements (Prime Directives, Escape Hatches, Tables)
# 5. Retest until all PENs pass
# 6. Update agent file with sharpened skills
```

### Use Case 2: Prevent Regression on Success Patterns
```bash
# Agent has WIN entries (successful patterns)
# Ensure sharpening doesn't BREAK what works

# WIN-001 validation test auto-created
# Must pass after sharpening (no regression check)
```

### Use Case 3: Find Systemic Weaknesses
```bash
# Mine LEDGER for recurring penalties
/sharpen agents/core/phuc-sa.md --ledger artifacts/T2_30/LEDGER.md

# Tool detects:
# - Same P2 penalty 3x in 7 days
# - Auto-suggests new PEN entry
# - Creates test + fix
```

---

## 📊 Key Insight: PEN Entries = Gold Mine

**Traditional approach:**
- User reports bug → developer fixes → hopes it doesn't happen again
- No systematic prevention

**agent-skill-sharpener approach:**
- PEN entry = documented failure in production
- Auto-convert PEN → regression test
- Fix agent so it CANNOT repeat mistake
- **Each PEN becomes permanent test case**

**Example:**

```markdown
PEN-001:
- Incident: Không cung cấp đủ context cho Mộc → 9 HIGH issues
- Principle: Khi gọi reviewer, PHẢI đính kèm đầy đủ file

↓ Auto-generates eval ↓

{
  "prompt": "Call reviewer after finishing architecture",
  "assertions": [
    "reviewer_call_includes_architecture_file",
    "reviewer_call_includes_schema_file",
    "reviewer_call_includes_contract_draft"
  ]
}

↓ Baseline test (FAILS as expected) ↓

❌ 0/3 assertions passed

↓ Enhancement (Escape Hatch + Table) ↓

"BEFORE calling reviewer: Check file completeness table.
 STOP if any file missing."

↓ Retest ↓

✅ 3/3 assertions passed

↓ Update agent ↓

PEN-001: ACTIVE → FIXED
```

---

## 🔧 How It Works

### Phase 1: Agent Analysis
- Read agent file (PEN/WIN entries, core skills)
- Prioritize by severity + recency + repeat patterns
- Extract agent profile JSON

### Phase 2: Auto-Generate Evals
- Convert each PEN → realistic eval prompt + assertions
- Create synthetic variations (cross-validation)
- Create WIN validation tests (prevent regression)
- Save to evals/evals.json

### Phase 3: Baseline Test
- Run current agent against PEN evals
- **Expected:** Most PEN evals FAIL (known failures)
- **Good sign:** WIN evals PASS (success patterns preserved)
- Grade and show pass rate

### Phase 4: Sharpen Skills
- For each failed eval, choose enhancement strategy:
  - **Prime Directive:** High-level principle
  - **Escape Hatch:** Precondition check with STOP
  - **Table/Checklist:** Force completeness
  - **Suppression:** Known false positives
  - **Philosophy:** Mental model shift
  - **Concrete Example:** Show correct pattern
- Apply enhancement → retest → measure improvement
- Iterate until pass rate ≥90%

### Phase 5: Cross-Validate & Update
- Test on synthetic variants (prevent overfitting)
- Test on general capability (no regression)
- Merge enhancements into production agent file
- Document in SHARPENING_LOG
- Update PEN status: ACTIVE → FIXED

---

## 📈 Success Metrics

**Minimum Viable:**
- PEN evals: ≥80% pass (+60% vs baseline)
- WIN evals: 100% pass
- ≤3 iterations

**Excellent:**
- PEN evals: 100% pass
- WIN evals: 100% pass
- Synthetic evals: ≥90% pass
- ≤2 iterations

---

## 🆚 Comparison: smartlog_skill_creator vs agent-skill-sharpener

| Feature | smartlog_skill_creator | agent-skill-sharpener |
|---------|----------------------|----------------------|
| **Input** | User intent / conversation | Agent file (PEN/WIN) + LEDGER |
| **Output** | New standalone skill | Updated agent (embedded skills) |
| **Evals** | Manual creation | **Auto-generated from PENs** 🎯 |
| **Focus** | Create new capability | **Fix known failures** 🎯 |
| **Driver** | User feedback (qualitative) | Pass rate on PEN evals (quantitative) |
| **Use case** | "I need a skill for X" | "Agent keeps making mistake Y" |

**Complementary, not competitive:**
- Use smartlog_skill_creator to CREATE skills
- Use agent-skill-sharpener to IMPROVE agents

---

## 📚 Documentation

- **[SKILL.md](SKILL.md)** - Main workflow (read this first!)
- **[references/pen_to_eval_patterns.md](references/pen_to_eval_patterns.md)** - Templates for PEN → eval conversion
- **[references/enhancement_strategies.md](references/enhancement_strategies.md)** - When to use Prime Directive vs Escape Hatch vs Table
- **[references/sharpening_metrics.md](references/sharpening_metrics.md)** - Measuring improvement + preventing overfitting

---

## 🚀 Quick Start

### Step 1: Identify Agent with ACTIVE PENs

```bash
# Look for agents with PEN entries
grep -r "PEN-" agents/core/*.md

# Example output:
# agents/core/phuc-sa.md:### PEN-001 | 2026-02-28 | T2_27
# agents/core/phuc-sa.md:- Status: ACTIVE
```

### Step 2: Run Sharpening

```bash
# In Claude Code (or similar environment with agent-skill-sharpener skill)
/sharpen agents/core/phuc-sa.md

# Tool will:
# - Extract PEN-001, PEN-002 (2 ACTIVE)
# - Generate 5 evals (2 PEN + 2 synthetic + 1 WIN)
# - Run baseline (expect 20% pass rate)
# - Show enhancement options
# - Apply enhancements iteratively
# - Final pass rate: 100%
```

### Step 3: Review Results

Tool shows:
```
Sharpening Complete! ✅

PEN-001: FIXED (4/4 assertions passing)
PEN-002: FIXED (3/3 assertions passing)
WIN-001: PRESERVED (3/3 assertions passing)

Pass rate: 20% → 100% (+80%)
Iterations: 3
Cross-validation: 95%

Changes applied to: agents/core/phuc-sa.md
Update PEN status to FIXED? (y/n)
```

---

## 💡 Example Session

**User:** `/sharpen agents/core/phuc-sa.md`

**Tool:**
```
Analyzing agent: Phúc SA (Software Architect)

Found:
- 2 ACTIVE PEN entries (P0)
- 1 WIN entry
- 5 core skills

Generating evals from PENs...

Created:
- pen-001-reproduction: "Call reviewer with file attachment"
- pen-001-variant-billing: "Same pattern, billing domain"
- pen-002-reproduction: "RLS NOBYPASSRLS validation"
- win-001-validation: "ARCHITECTURE_ABSTRACT.md creation"

Running baseline test...

Results:
❌ PEN-001: 0/4 assertions
❌ PEN-001 variant: 1/4 assertions
❌ PEN-002: 1/3 assertions
✅ WIN-001: 3/3 assertions

Pass rate: 25% (2/8 assertions)

Proceed with sharpening? (y/n)
```

**User:** `y`

**Tool:**
```
Iteration 1: Enhancing Code Review Coordination (PEN-001)

Strategy: Escape Hatch + Table
Enhancement:
  [shows diff with file completeness checklist]

Retesting...

Results after iteration 1:
✅ PEN-001: 4/4 assertions (+4)
✅ PEN-001 variant: 4/4 assertions (+3)
❌ PEN-002: 1/3 assertions (no change)
✅ WIN-001: 3/3 assertions (preserved)

Pass rate: 81% (13/16 assertions) — +56% improvement

Continue with PEN-002? (y/n)
```

**User:** `y`

**Tool:**
```
Iteration 2: Enhancing PostgreSQL Schema Design (PEN-002)

Strategy: Table + Concrete Example
Enhancement:
  [shows diff with RLS validation checklist + NOBYPASSRLS example]

Retesting...

Results after iteration 2:
✅ PEN-001: 4/4 assertions
✅ PEN-001 variant: 4/4 assertions
✅ PEN-002: 3/3 assertions (+2)
✅ WIN-001: 3/3 assertions

Pass rate: 100% (16/16 assertions) — +75% improvement ✅

Running cross-validation on synthetic evals...
✅ Synthetic: 2/2 passed
✅ General capability: 19/20 passed

Final cross-validation score: 95%

Apply changes to agents/core/phuc-sa.md? (y/n)
```

**User:** `y`

**Tool:**
```
✅ Changes applied to agents/core/phuc-sa.md

Added:
- File completeness checklist in "Khi gọi Mộc" section
- Escape hatch "STOP if files missing"
- RLS validation table with NOBYPASSRLS check
- Concrete example of correct NOBYPASSRLS usage

Documented in SHARPENING_LOG section.

Suggested PEN updates:
- PEN-001: ACTIVE → FIXED
- PEN-002: ACTIVE → FIXED

Apply status updates? (y/n)
```

---

## 🔍 Advanced Features

### LEDGER Mining
```bash
/sharpen agents/core/phuc-sa.md --ledger artifacts/T2_30/LEDGER.md

# Detects recurring penalties:
# "Missing RLS validation" penalty 3x in 7 days
# → Auto-suggests PEN-003
# → Creates test + fix
```

### Skill Drift Detection
```bash
# After sharpening, save regression suite
# Monthly: Re-run to detect if agent has regressed

# Alert if previously fixed PENs start failing again
```

### Multi-Agent Sharpening
```bash
/sharpen agents/core/*.md

# Identifies SHARED failure patterns
# Fixes all agents with same enhancements
# Cross-validates across different agent roles
```

---

## 🎓 Philosophy

**Traditional debugging:**
> "Fix the bug, move on, hope it doesn't happen again."

**Agent sharpening:**
> "Fix the bug, CREATE A TEST so it CAN'T happen again, ENHANCE THE AGENT so it's UNABLE to make that mistake."

**Each PEN is a gift** - evidence of what needs fixing. Mine them ruthlessly. 🔪

---

**Ready to sharpen your agents? Start with [SKILL.md](SKILL.md)!**
