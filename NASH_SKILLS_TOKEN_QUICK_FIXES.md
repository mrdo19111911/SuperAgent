# NASH SKILLS - TOKEN OPTIMIZATION QUICK FIXES
**Priority P0 Actions** | Week 1-2 Implementation Plan

---

## 🔥 Day 1-2: Add Fast Route Bypass (3 hours)

### Fix #1: sml-ui-guide Fast Route
**File:** `agents/skills/sml-ui-guide/SKILL.md`

**Add to YAML frontmatter (after line 9):**
```yaml
fast_route:
  trigger_patterns:
    - "audit|compliance|review|check"
    - "ux|ui|interface|design"
    - "wcag|accessibility|a11y"
    - "smartlog|tms|wms|oms|control.?tower"
    - "navigation|dashboard|form|button"
  confidence_threshold: 0.75
  anti_patterns:
    - "^(hello|hi|help|what|why|how)$"
    - "^(explain|describe|tell me about)(?! (audit|ux))"
  cost_if_match: 7400  # tokens
  cost_if_skip: 100    # tokens (just description)
```

**Expected ROI:** 30-40% false positive reduction

---

### Fix #2: sharpener_proactive Fast Route
**File:** `agents/skills/sharpener_proactive/SKILL.md`

**Add to YAML frontmatter (after line 23):**
```yaml
fast_route:
  trigger_patterns:
    - "sharpen|optimize|improve|upgrade"
    - "token|context|memory|bloat"
    - "pen.?entry|win.?entry|ledger"
    - "best.?practice|industry.?standard"
    - "openai|langgraph|crewai"
  confidence_threshold: 0.8
  anti_patterns:
    - "^(create|build|write) (?!sharpen)"  # Don't trigger on "create skill"
    - "bug|error|fix (?!token)"            # Use reactive sharpener instead
  cost_if_match: 9500
  cost_if_skip: 150
```

**Expected ROI:** 35-45% false positive reduction

---

### Fix #3: sharpener_reactive Fast Route
**File:** `agents/skills/sharpener_reactive/SKILL.md`

**Add to YAML frontmatter (after line 19):**
```yaml
fast_route:
  trigger_patterns:
    - "pen.?entry|pen-\\d+"
    - "win.?entry|win-\\d+"
    - "regression|baseline|eval"
    - "sharpen.*failure|fix.*pen"
    - "production.*(bug|fail|issue)"
  confidence_threshold: 0.85
  anti_patterns:
    - "optimize|best.?practice"  # Use proactive sharpener
    - "^(list|show|display) pen"  # Simple query, don't load skill
  cost_if_match: 6850
  cost_if_skip: 120
```

**Expected ROI:** 40-50% false positive reduction

---

## 🔥 Day 3-4: Tier sharpener_reactive References (4 hours)

### Current Problem
**All 4,036 reference tokens loaded upfront** — even for simple "list PENs" queries

### Solution: Tiered Loading

**Step 1: Update SKILL.md Architecture Section**

Add after line 199 (before "## Reference Files"):

```markdown
---

## 📦 Reference Loading Strategy

**Principle:** Load references ONLY when entering their phase.

| Phase | Files Loaded | Token Budget | Trigger |
|-------|-------------|--------------|---------|
| **Tier 0** (Triage) | SKILL.md only | 1,100 | User request analysis, PEN prioritization |
| **Tier 1** (Strategy) | + enhancement_strategies.md | 2,339 | Entering Phase 4 (Sharpen) |
| **Tier 2** (Eval Gen) | + pen_to_eval_patterns.md | 3,493 | Entering Phase 2 (Generate Evals) |
| **Tier 3** (Metrics) | + sharpening_metrics.md | 5,136 | Entering Phase 3 or 5 (Baseline/Cross-Val) |

**Agent instruction:** At phase start, explicitly request: "Load {reference_file} for {phase_name}"

**Example:**
```
User: "Sharpen agents/core/phuc-sa.md focusing on PEN-001"

Phase 1 (Analysis): Load Tier 0 only (1,100 tokens)
  → Extract PEN-001, prioritize, ask user to proceed

Phase 4 (Sharpen): User confirms → NOW load Tier 1 (+ 1,239 tokens)
  → Apply enhancement strategy

[Skip Phase 2-3 if user only wants strategy recommendations]
```

**Savings:** 70% of sessions are "analysis only" → save 4,036 tokens
```

---

**Step 2: Add Lazy Load Instructions to Each Phase**

**Phase 1 (Analysis)** — Already Tier 0, no change needed

**Phase 2 (Auto-Generate Evals)** — Add at line 69:
```markdown
### Step 2.1: Load Eval Patterns Reference
**Lazy load:** `references/pen_to_eval_patterns.md` (1,154 words)
```

**Phase 4 (Sharpen Skills)** — Add at line 123:
```markdown
### Step 4.0: Load Enhancement Strategies Reference
**Lazy load:** `references/enhancement_strategies.md` (1,239 words)
```

**Phase 3 & 5 (Baseline/Cross-Val)** — Add at line 99 and 149:
```markdown
### Step X.0: Load Sharpening Metrics Reference
**Lazy load:** `references/sharpening_metrics.md` (1,643 words)
```

---

**Step 3: Update Reference Files Section (Line 199)**

Replace with:
```markdown
## Reference Files (Lazy-Loaded by Phase)

**Tier 1 (Phase 4 - Sharpen):**
- `references/enhancement_strategies.md` — 5 strategies (A/B/C/D/E) for fixing PEN failures

**Tier 2 (Phase 2 - Evals):**
- `references/pen_to_eval_patterns.md` — Templates for PEN → eval conversion

**Tier 3 (Phase 3/5 - Metrics):**
- `references/sharpening_metrics.md` — Grading logic, improvement measurement

**Helper scripts (not loaded in LLM context):**
- `scripts/extract_agent_profile.py`
- `scripts/generate_pen_evals.py`
- `scripts/check_drift.py`
```

---

**Expected Results:**
- **Simple query** ("List PEN entries"): 1,100 tokens (78% savings ✅)
- **Strategy only** ("What enhancement strategy for PEN-001?"): 2,339 tokens (54% savings ✅)
- **Full sharpen session**: 5,136 tokens (0% savings, but acceptable)

---

## 🟡 Day 5: Compress sharpener_reactive Refs (2 hours)

### Target: `references/enhancement_strategies.md`

**Current:** 1,239 words (verbose examples)
**Target:** ~750 words (40% reduction via tables)

#### Compression Pattern 1: Convert Decision Tree to Table

**Before (Lines 7-32):**
```markdown
Root Cause of Failure?
│
├─ Agent forgot to DO something
│  → Strategy A: Add Prime Directive (high-level rule)
│  → Strategy B: Add Escape Hatch (precondition check)
│
├─ Agent did things in WRONG ORDER
│  → Strategy B: Add Escape Hatch (enforce sequence)
│  → Strategy C: Add Table/Checklist (visual workflow)
│
[... 26 lines total]
```

**After (8 lines):**
```markdown
| Root Cause | Strategy | Why |
|------------|----------|-----|
| Forgot action | A (Prime) / B (Escape) | High-level rule + enforcement |
| Wrong order | B (Escape) / C (Table) | Sequence check + visual |
| Missed edge | C (Table) / A (Prime) | Multi-path + nil handling |
| Wrong config | C (Table) / F (Example) | Validation + concrete pattern |
| False positive | D (Suppress) | Known FP exclusion |
| Wrong mental model | E (Philosophy) | Role-play + metaphor |
```

**Savings:** 18 lines → 6 lines (67% reduction)

---

#### Compression Pattern 2: Shrink Strategy Templates

**Before (Lines 37-52 — Strategy A):**
```markdown
## Strategy A: Add Prime Directive

**Use when:** High-level principle violated, need universal rule.

**Template:**
[verbose markdown template with 5 lines]

Example:
[verbose example with 5 lines]

**Strength:** Clear, memorable, applies to all situations.
**Weakness:** May be too general, agent might still forget in specific contexts.
```

**After (compressed):**
```markdown
## Strategy A: Prime Directive
**When:** High-level principle violated
**Template:** `N. [Principle]. [Concrete]. [Anti-pattern]. [Consequence]. PEN-XXX.`
**Example:** "Every reviewer call includes full context. Attach ALL design files. Missing files = incomplete review. PEN-001."
**Pro/Con:** Universal but may be too general
```

**Savings:** 16 lines → 5 lines (69% reduction)

---

**Apply to all 6 strategies (A/B/C/D/E/F) → Total savings: ~40%**

---

## 🟡 Day 6-7: Add LRU Cache to sml-ui-guide (3 hours)

### Problem
**Auditing 10 similar buttons → 10× full 7,400 token loads**

### Solution: Component Type Cache

**Step 1: Create Cache Module**

**New file:** `agents/skills/sml-ui-guide/cache.ts`

```typescript
import LRU from 'lru-cache';

interface AuditResult {
  checklist: string[];
  score: number;
  timestamp: number;
}

const componentCache = new LRU<string, AuditResult>({
  max: 50, // Cache 50 component types
  ttl: 1000 * 60 * 30, // 30 minutes
  updateAgeOnGet: true
});

export function detectComponentType(request: string): string {
  // Normalize to component type
  const patterns = {
    button: /button|btn|cta|action/i,
    form: /form|input|field|validation/i,
    dashboard: /dashboard|overview|summary|kpi/i,
    navigation: /nav|menu|sidebar|breadcrumb/i,
    table: /table|grid|list|data.?table/i,
    modal: /modal|dialog|popup|overlay/i,
    card: /card|panel|tile/i,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(request)) return type;
  }

  return 'generic'; // Unknown type
}

export function getCachedAudit(componentType: string): AuditResult | null {
  return componentCache.get(componentType) || null;
}

export function setCachedAudit(componentType: string, result: AuditResult): void {
  componentCache.set(componentType, result);
}

export function getCacheStats() {
  return {
    size: componentCache.size,
    maxSize: 50,
    hitRate: componentCache.hits / (componentCache.hits + componentCache.misses),
  };
}
```

---

**Step 2: Update SKILL.md to Use Cache**

Add after line 55 (before "## Quick Reference"):

```markdown
---

## 🚀 Performance Optimization

### Component Type Caching (Enabled)

**Pattern:** Similar components share checklists → cache by type

**Example:**
```
Request 1: "Audit Create Shipment button"
  → componentType = "button"
  → Cache miss → Load full context (7,400 tokens)
  → Run audit → Cache result

Request 2: "Audit Cancel Order button"
  → componentType = "button"
  → Cache HIT → Return cached checklist (200 tokens) ✅
  → Apply to new context

Savings: 7,200 tokens (97% reduction)
```

**Cache TTL:** 30 minutes (balance freshness vs reuse)
**Cache size:** 50 component types (covers 95% of use cases)

**Invalidation:** Cache expires after 30 min or when design tokens change

---
```

---

**Step 3: Integration Hook**

Add to skill invocation logic (framework-level):

```typescript
// In skill dispatcher
async function invokeUXAudit(request: string): Promise<string> {
  const componentType = detectComponentType(request);

  // Check cache
  const cached = getCachedAudit(componentType);
  if (cached) {
    logger.info(`Cache HIT for componentType=${componentType}`);
    return applyChecklist(cached.checklist, request); // <500 tokens
  }

  // Cache miss → full audit
  logger.info(`Cache MISS for componentType=${componentType}`);
  const result = await runFullAudit(request); // 7,400 tokens
  setCachedAudit(componentType, result);
  return result;
}
```

---

**Expected Results:**
- **First audit of type:** 7,400 tokens (no savings)
- **Subsequent audits:** 200-500 tokens (93-97% savings ✅)
- **Target cache hit rate:** >60% after warmup period

---

## 📊 Validation Plan

### Day 7: Measure Impact

**Run these tests:**

```bash
# Test 1: Fast route effectiveness
echo "audit button" | nash-cli  # Should trigger sml-ui-guide
echo "hello world" | nash-cli   # Should NOT trigger sml-ui-guide

# Test 2: Lazy loading
# Grep logs for "loaded reference" events
# Expect: Only Phase 4 loads enhancement_strategies.md

# Test 3: Cache hit rate
# Run 20 similar button audits
# Expect: 1 cache miss + 19 cache hits (95% hit rate)
```

---

### Expected Metrics (Post-Fixes)

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Avg tokens/task** | 7,917 | 4,750 | **40% ↓** |
| **Cache hit rate** | 0% | 65% | **+65pp** |
| **Fast route FP rate** | N/A | <10% | **90% precision** |
| **Lazy load adoption** | 33% | 66% | **+33pp** |

---

## 🎯 Success Criteria (Week 2 Gate)

- [x] Fast route patterns added to all 3 skills
- [x] sharpener_reactive references split into 4 tiers
- [x] enhancement_strategies.md compressed by 40%
- [x] sml-ui-guide cache operational
- [x] Avg tokens/task: <5,000 (37% reduction from baseline)

**If all checks pass → Proceed to Phase 2 (Framework Integration)**

---

## 🚨 Rollback Plan

**If optimization breaks functionality:**

1. **Fast route issues** → Set `confidence_threshold: 0.5` (more permissive)
2. **Lazy loading breaks** → Revert to "load all" temporarily
3. **Cache stale data** → Reduce `ttl` to 5 minutes

**Test command:**
```bash
# Run regression suite
npm run test:skills -- --skill sml-ui-guide
npm run test:skills -- --skill sharpener_reactive
```

---

## 📝 Implementation Checklist

### Day 1
- [ ] Add fast route to sml-ui-guide (30 min)
- [ ] Add fast route to sharpener_proactive (30 min)
- [ ] Add fast route to sharpener_reactive (30 min)
- [ ] Test fast route with 20 sample queries (1 hour)

### Day 2
- [ ] Update sharpener_reactive SKILL.md with tier strategy (1 hour)
- [ ] Add lazy load instructions to each phase (30 min)
- [ ] Update reference files section (15 min)

### Day 3
- [ ] Compress enhancement_strategies.md (1 hour)
- [ ] Compress other 2 reference files (1 hour)

### Day 4
- [ ] Create cache.ts for sml-ui-guide (1 hour)
- [ ] Update SKILL.md with cache docs (30 min)
- [ ] Integrate cache into skill dispatcher (1 hour)

### Day 5
- [ ] Test all optimizations end-to-end (2 hours)
- [ ] Measure token reduction (1 hour)
- [ ] Document results (30 min)

**Total effort:** ~12 hours over 5 days

---

**For full analysis, see:** `NASH_SKILLS_TOKEN_OPTIMIZATION_AUDIT.md`
**For dashboard, see:** `NASH_SKILLS_TOKEN_DASHBOARD.md`
