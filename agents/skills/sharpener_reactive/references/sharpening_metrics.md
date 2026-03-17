# Sharpening Metrics & Evaluation

**How to measure improvement and prevent overfitting.**

---

## Core Metrics

### 1. Pass Rate (Primary Metric)

**Formula:** `(passed_evals / total_evals) × 100%`

**Baseline:** Run before sharpening
**Target:** ≥90% on PEN evals, 100% on WIN evals

**Example:**
```
Baseline: 20% (1/5 passed)
Iteration 1: 60% (3/5 passed) — +40% improvement
Iteration 2: 80% (4/5 passed) — +60% improvement
Iteration 3: 100% (5/5 passed) — +80% improvement ✅
```

### 2. Assertion Pass Rate (Granular)

**Formula:** `(passed_assertions / total_assertions) × 100%`

**Useful for:** Identifying partial progress on complex evals.

**Example:**
```
PEN-001 eval (4 assertions):
  Baseline: 0/4 (0%)
  Iteration 1: 3/4 (75%) — "Still missing contract draft attachment"
  Iteration 2: 4/4 (100%) ✅
```

### 3. Cross-Validation Score

**Formula:** `(synthetic_pass_rate + general_capability_pass_rate) / 2`

**Purpose:** Detect overfitting (good on training, bad on validation).

**Good:**
```
PEN evals: 100% pass
Synthetic variants: 100% pass  ← Agent generalized well
General capability: 95% pass   ← No regression
Cross-validation score: 97.5% ✅
```

**Bad (overfitting):**
```
PEN evals: 100% pass
Synthetic variants: 40% pass   ← Agent memorized specific files/domains
General capability: 95% pass
Cross-validation score: 67.5% ❌
```

### 4. Iteration Count

**Ideal:** 2-3 iterations to fix most PENs
**Warning:** >5 iterations = possible overfitting or wrong strategy

**Example:**
```
PEN-001: Fixed in iteration 1 (Escape Hatch strategy)
PEN-002: Fixed in iteration 2 (Table + Example strategy)
PEN-003: Still failing at iteration 4 → try different strategy
```

### 5. Token Efficiency (NEW - v3.0) 🆕

**Formula:** `(tokens_after / tokens_before) × 100%`

**Purpose:** Measure token savings from sharpening enhancements.

**Tracking:**
```javascript
{
  "baseline_tokens": {
    "avg_per_task": 12000,
    "total_for_5_evals": 60000,
    "breakdown": {
      "context_loading": 5000,
      "skill_loading": 3000,
      "execution": 4000
    }
  },
  "enhanced_tokens": {
    "avg_per_task": 7000,
    "total_for_5_evals": 35000,
    "breakdown": {
      "context_loading": 2000,  // RAG optimization
      "skill_loading": 1500,    // Progressive loading
      "execution": 3500         // Fewer iterations
    }
  },
  "savings": {
    "per_task": 5000,
    "percent": 41.7,
    "monthly_projected": 2500000,  // 500 tasks × 5000 tokens
    "cost_savings_usd": 7.50       // at $3/M tokens
  }
}
```

**Why Token Savings Matter:**

1. **Direct Savings**: Fewer wasted iterations (PEN-001: 2 iterations → 1 iteration = -50% tokens)
2. **Indirect Savings**: Better context management (WIN-001: ABSTRACT.md saves 60% tokens)
3. **Compound Effect**: Over 500 tasks/month, small per-task savings = large monthly impact

**Example (WIN-001 validation):**
```
Before: Xuân reads full ARCHITECTURE.md (450 lines = ~2K tokens)
After:  Xuân reads ARCHITECTURE_ABSTRACT.md (150 lines = ~700 tokens)
Savings: 1.3K tokens per review (65% reduction)

If Xuân reviews 50 tasks/month:
  Monthly savings: 65K tokens
  Cost savings: $0.20/month (small but adds up across all agents)
```

**Example (PEN-001 fix - fewer iterations):**
```
Before sharpening:
  Iteration 1: Phúc SA calls Mộc without files → 9 false issues → 15K tokens wasted
  Iteration 2: Fix false issues → 12K tokens
  Total: 27K tokens

After sharpening (escape hatch prevents incomplete call):
  Iteration 1: Phúc SA checks files BEFORE calling Mộc → correct review → 12K tokens
  Total: 12K tokens

Savings: 15K tokens (55% reduction)
```

**Measurement Process:**

1. **Baseline Run** (before sharpening):
   ```bash
   # Run evals, capture token usage
   tokens_baseline = run_evals_with_tracking(agent_baseline, eval_suite)
   ```

2. **Enhanced Run** (after sharpening):
   ```bash
   # Run same evals with enhanced agent
   tokens_enhanced = run_evals_with_tracking(agent_enhanced, eval_suite)
   ```

3. **Calculate Savings**:
   ```javascript
   savings = {
     per_task: tokens_baseline.avg - tokens_enhanced.avg,
     percent: ((tokens_baseline.avg - tokens_enhanced.avg) / tokens_baseline.avg) * 100,
     monthly: (tokens_baseline.avg - tokens_enhanced.avg) * tasks_per_month
   };
   ```

**Target Benchmarks:**

| Enhancement Type | Expected Token Savings |
|-----------------|----------------------|
| **Escape Hatch** (prevent wasted iterations) | 30-50% |
| **Prime Directive** (clearer instructions) | 10-20% |
| **Table/Checklist** (structured thinking) | 15-25% |
| **Concrete Example** (reduce confusion) | 20-30% |
| **Progressive Loading** (lazy skill loading) | 40-60% |
| **WIN Pattern** (optimize workflow) | 40-80% |

**Red Flags:**

- Token usage INCREASED after sharpening → Enhancement too verbose
- Savings <5% → Enhancement not effective, try different strategy
- Savings >90% but pass rate dropped → Agent is skipping steps

**Integration with Grafana:**

Add to `grafana/dashboards/token-usage.json`:
```json
{
  "panel": {
    "title": "Sharpening Impact - Token Savings",
    "targets": [{
      "expr": "sum(nash_tokens_baseline - nash_tokens_enhanced) by (agent)"
    }]
  }
}
```

---

## Eval Types & Their Purposes

| Eval Type | Purpose | Pass Requirement |
|-----------|---------|------------------|
| **PEN Regression** | Reproduce past failure | MUST pass after sharpening |
| **Synthetic Variant** | Test generalization | MUST pass (prevent overfitting) |
| **WIN Validation** | Ensure no regression | MUST pass (preserve success) |
| **General Capability** | Baseline tasks | ≥95% pass (no degradation) |

**Balanced eval suite:**
- 2 PEN regression tests per PEN entry
- 1-2 synthetic variants per PEN
- 1 WIN validation per WIN entry
- 2-3 general capability tests

**Example (5 total evals):**
- 2 PEN-001 tests (original + billing variant)
- 1 PEN-002 test
- 1 WIN-001 validation
- 1 general capability (unrelated task)

---

## Detecting Overfitting

### Red Flags

1. **Domain Memorization:**
   - Agent passes "User Auth" eval but fails "Billing" eval (same pattern)
   - **Fix:** Add more domain variations, make enhancement domain-agnostic

2. **File Name Hardcoding:**
   - Enhancement says "attach ARCHITECTURE.md" (specific name)
   - Agent fails when file is named "DESIGN_DOC.md"
   - **Fix:** Use pattern "attach all design documents" instead

3. **Metric Memorization:**
   - Enhancement says "ARCHITECTURE_ABSTRACT.md must be 150 lines"
   - Agent writes exactly 150 lines of fluff to pass assertion
   - **Fix:** Use range "100-200 lines" + semantic check

4. **Test-Specific Behavior:**
   - Agent passes eval because prompt uses magic phrase "call Mộc"
   - Fails in production when user says "get feedback from reviewer"
   - **Fix:** Use diverse phrasings in prompts

### Overfitting Prevention

**Strategy 1: Train/Test Split**
```
PEN-001 evals:
  Train set: User Auth module (used during sharpening)
  Test set: Billing module (held out until final validation)

Only use train set during iterations.
Final validation on test set.
```

**Strategy 2: K-Fold Cross-Validation**
```
5 evals for PEN-001 (5 different domains):
  Iteration 1: Train on 4, validate on 1 (Auth)
  Iteration 2: Train on 4, validate on 1 (Billing)
  Iteration 3: Train on 4, validate on 1 (Inventory)
  ...
  Final: Average cross-validation scores
```

**Strategy 3: Generalization Test**
```
After sharpening on "reviewer file attachment" pattern:
  Create NEW eval: "attach logs when debugging"
  Same underlying pattern (attach context files)
  Different domain (debugging, not review)
  Should pass if agent learned PATTERN, not memorized FILES
```

---

## Success Criteria

### Minimum Viable Sharpening

**Requirements:**
- ✅ PEN evals: ≥80% pass rate (+60% vs baseline)
- ✅ WIN evals: 100% pass (no regression)
- ✅ Synthetic evals: ≥70% pass (decent generalization)
- ✅ ≤3 iterations

**Example:**
```
PEN-001 (2 evals): 2/2 passed (100%)
PEN-002 (1 eval): 1/1 passed (100%)
WIN-001 (1 eval): 1/1 passed (100%)
Synthetic (2 evals): 1/2 passed (50%) ⚠️

Overall: 5/6 = 83% pass rate
Verdict: Minimum viable ✅ (but watch synthetic performance)
```

### Excellent Sharpening

**Requirements:**
- ✅ PEN evals: 100% pass
- ✅ WIN evals: 100% pass
- ✅ Synthetic evals: ≥90% pass
- ✅ General capability: ≥95% pass
- ✅ ≤2 iterations

**Example:**
```
PEN evals: 3/3 passed (100%)
WIN evals: 1/1 passed (100%)
Synthetic: 2/2 passed (100%)
General: 19/20 passed (95%)

Overall: 25/26 = 96% pass rate
Verdict: Excellent ✅✅
```

---

## Measuring Agent Improvement Over Time

### Longitudinal Metrics

**After each sharpening session, track:**

```json
{
  "agent": "phuc-sa",
  "sharpening_sessions": [
    {
      "date": "2026-03-16",
      "pens_fixed": ["PEN-001", "PEN-002"],
      "pass_rate_before": 0.20,
      "pass_rate_after": 1.00,
      "iterations": 3,
      "evals_count": 5,
      "cross_validation": 0.95
    },
    {
      "date": "2026-04-10",
      "pens_fixed": ["PEN-003"],
      "pass_rate_before": 0.67,
      "pass_rate_after": 1.00,
      "iterations": 2,
      "evals_count": 3,
      "cross_validation": 0.98
    }
  ],
  "total_pens_active": 0,
  "total_pens_fixed": 3,
  "average_improvement": 0.72
}
```

### Drift Detection

**Problem:** Agent regresses on previously fixed PENs over time (new enhancements break old fixes).

**Solution: Regression Test Suite**

```bash
# After each sharpening session, save eval suite
cp evals/evals.json regression-tests/phuc-sa-2026-03-16.json

# Monthly: Re-run all historical regression tests
for suite in regression-tests/*.json; do
  run_evals --agent agents/core/phuc-sa.md --evals $suite
done

# Alert if any suite drops below 90% pass rate
```

**Example drift alert:**
```
⚠️ Drift Detected: phuc-sa

Regression suite from 2026-03-16:
  Previously: 100% pass (5/5 evals)
  Current: 60% pass (3/5 evals)

Failed evals:
  - PEN-001 reproduction (was passing, now failing)
  - PEN-001 billing variant (was passing, now failing)

Likely cause: Recent changes to agent broke PEN-001 fix.
Action required: Re-sharpen or rollback recent changes.
```

---

## Reporting Format

### End-of-Session Report

```markdown
## Sharpening Session Report: phuc-sa

**Date:** 2026-03-16
**Focus:** PEN-001 (reviewer file attachment), PEN-002 (NOBYPASSRLS)
**Duration:** 3 iterations, ~2 hours

### Metrics

| Metric | Baseline | Final | Change |
|--------|----------|-------|--------|
| **Pass Rate** | 20% (1/5) | 100% (5/5) | +80% ✅ |
| **PEN Evals** | 0% (0/3) | 100% (3/3) | +100% ✅ |
| **WIN Evals** | 100% (1/1) | 100% (1/1) | 0% ✅ (preserved) |
| **Synthetic Evals** | 0% (0/2) | 100% (2/2) | +100% ✅ |
| **Cross-Validation** | N/A | 95% | ✅ |
| **Iterations** | - | 3 | Target: ≤3 ✅ |

### Enhancements Applied

1. **Code Review Coordination (PEN-001)**
   - Added: File completeness checklist table
   - Added: Escape hatch "STOP if files missing"
   - Added: Explicit reviewer call template

2. **PostgreSQL Schema Design (PEN-002)**
   - Added: Prime Directive 5 "RLS NOBYPASSRLS Validation"
   - Added: Schema validation table with NOBYPASSRLS check
   - Added: Concrete example with correct NOBYPASSRLS syntax

### Evidence

**PEN-001 Before (Baseline):**
```
Line 234: $TASK moc "Review architecture"
[No files attached] ❌
```

**PEN-001 After (Iteration 3):**
```
Line 187: File completeness check:
  ✓ ARCHITECTURE.md exists
  ✓ schema.prisma exists
  ✓ CONTRACT_DRAFT.md exists

Line 234: $TASK moc "Review architecture:
  [Attached: ARCHITECTURE.md, schema.prisma, CONTRACT_DRAFT.md]" ✅
```

### Recommendations

✅ **PEN-001 Status:** ACTIVE → FIXED
✅ **PEN-002 Status:** ACTIVE → FIXED
📋 **Next Session:** Consider sharpening PEN-003 if added
🔍 **Monitoring:** Re-run regression suite monthly to detect drift

### Artifacts

- Workspace: `sharpening-workspace/phuc-sa/`
- Evals: `evals/evals.json`
- Regression suite: `regression-tests/phuc-sa-2026-03-16.json`
- Final agent: `agents/core/phuc-sa.md` (updated)
```

---

**Use these metrics to ensure sharpening ACTUALLY WORKS and doesn't just pass tests by memorizing!**
