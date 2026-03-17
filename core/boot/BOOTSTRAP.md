# BOOTSTRAP v2.0 - 2-Stage Loading

**Token Budget:** Stage 1 (1.6K) + Stage 2 (1.5-4.5K) = **3.1-6.1K** (vs 30K = 80-90% reduction)

---

## Stage 1: Pre-Audit (1,600 tokens)

**Trigger:** Framework startup
**Load:** Only essentials for 12D audit

**Files:**
1. `BOOTSTRAP.md` (this file) - 300 tokens
2. `NASH_RULES.md` - 200 tokens
3. `agents/core/tung-diag.md` - 500 tokens
4. `core/metadata/METADATA.yaml` - 600 tokens

**Sequence:** Load bootstrap → Load Tung → Load metadata → STOP (no pipeline agents yet)

---

## Stage 2: Post-Routing (1,500-4,500 tokens)

**Trigger:** After MoE Router selects pipeline
**Load:** Only 6-9 agents for selected pipeline

**Logic:**
- Get pipeline metadata from `METADATA.yaml`
- Load Thesis agents (2-3) + Anti-Thesis (2-3) + Synthesis (1)
- Total: 6-9 agents × 500 tokens = 3K-4.5K tokens

**Example (Pipeline 6 Hotfix):** Tùng + Mộc + Lan + Dũng = 4 agents × 500 = 2K tokens (vs 13.5K if loading all 27)

---

## Decision Integration

- **2A:** CSV Validator + Fallback (METADATA.yaml validation)
- **3A:** RAM Depth Limit (MAX=3, cycle detection)
- **6A:** docs/ On-Demand (2K limit, learning questions only)
- **17A:** Metadata Caching (single parse/session)
- **23A:** Feature Flags Env Cache ($FEATURE_FLAGS_CACHE, no 27× re-read)

**Details:** [ram/boot/bootstrap_examples.md](../../ram/boot/bootstrap_examples.md)

---

## Token Budget Enforcement

**Max Budget:** 6,100 tokens

**Validation:** After Stage 2, count Stage1 + Stage2 tokens. If > 6,100 → raise `BootstrapBudgetExceeded`

---

## Feature Flag Rollout

**Gradual deployment (Decision 4A):**
- Week 1: canary_10pct (10% tasks use new bootstrap)
- Week 2: canary_50pct (50% tasks)
- Week 3: true (100% rollout)
- Auto-rollback if error rate >5%

**Usage:** `if get_feature_flag('enable_staged_bootstrap', task_id): ...`

---

## Error Handling

- `BootstrapError` - Base exception
- `RAMDepthError` - RAM depth > MAX_RAM_DEPTH
- `RAMCycleError` - Circular RAM dependency
- `BootstrapBudgetExceeded` - Budget > 6,100 tokens
- `MetadataValidationError` - METADATA.yaml schema invalid

---

**Status:** Phase 0 (15h) | **Next:** scripts/measure_tokens.py (Decision 18A)
