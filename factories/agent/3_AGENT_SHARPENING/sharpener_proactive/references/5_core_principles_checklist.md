# 5 Core Principles - Audit Checklist
## Systematic Agent Evaluation Framework

**Source:** BEST_PRACTICE_AGENT.md (lines 15-145)
**Purpose:** Standardized checklist for agent sharpening audits
**Last Updated:** 2026-03-16

---

## How to Use This Checklist

For each principle:
1. ✅ Check each criterion (YES/NO/PARTIAL)
2. 📊 Calculate score: (YES × 1.0) + (PARTIAL × 0.5) / Total Criteria
3. 🎯 Grade: PASS (≥90%), PARTIAL (50-89%), FAIL (<50%)
4. 📝 Document gaps with evidence
5. 💡 Recommend fixes from BEST_PRACTICE_AGENT.md

---

## Principle 1: Context is Fuel, Not Cargo

**Target:** 60-80% token reduction vs naive approach

### Checklist

#### Progressive Loading (Weight: 40%)
- [ ] **Tier 0:** Core identity loaded (agent role, model, <500 tokens)
- [ ] **Tier 1:** Critical constraints loaded on-demand (P0 PENs, <1500 tokens)
- [ ] **Tier 2:** Relevant skills loaded when task matches domain (<3000 tokens)
- [ ] **Tier 3:** Full context loaded only for comprehensive audits (<5000 tokens)
- [ ] **Evidence:** Agent file has `memory_strategy: progressive` in header

#### Caching (Weight: 20%)
- [ ] **LRU Cache:** Deterministic operations cached (embeddings, validations)
- [ ] **Cache TTL:** 5-15 min expiration (balance freshness vs reuse)
- [ ] **Cache hits:** ≥60% hit rate on repeated operations
- [ ] **Evidence:** Code uses `lru-cache` or equivalent

#### Conversation Compression (Weight: 20%)
- [ ] **Recent messages:** Verbatim (last 3-5 messages)
- [ ] **Medium history:** Compressed summaries (6-20 messages ago)
- [ ] **Old history:** Ultra-compressed or external storage (>20 messages)
- [ ] **Evidence:** Conversation stored in external DB, not in-context

#### External Memory (Weight: 20%)
- [ ] **Vector DB:** PEN/WIN entries stored externally, retrieved via RAG
- [ ] **Fallback:** Grep fallback if Vector DB unavailable
- [ ] **Reference docs:** Linked via `reference_Memory`, not embedded
- [ ] **Evidence:** Agent uses `queryPENEntries()` or similar API

### Scoring Example
```
Agent: Phúc SA

Progressive Loading:
  ✅ Tier 0 defined (500 tokens)
  ❌ Tier 1-3 missing (loads all PENs upfront)
  Score: 1/4 = 25%

Caching:
  ❌ No caching implemented
  Score: 0/4 = 0%

Compression:
  ❌ Full conversation in context
  Score: 0/4 = 0%

External Memory:
  ❌ All PENs embedded in agent file
  Score: 0/4 = 0%

Overall: (25% × 0.4) + (0% × 0.6) = 10% → ❌ FAIL
```

### Gaps Identified
1. **Gap:** Loads all 47 PEN entries upfront (8KB waste)
2. **Evidence:** Agent file lines 120-280 (PEN section = 8000 tokens)
3. **Fix:** Apply Layer 6 (Progressive Loading) from TOKEN_OPTIMIZATION_ARCHITECTURE.md
4. **Expected savings:** 8000 → 500-3000 tokens (70-94% reduction)

---

## Principle 2: Single Responsibility per Agent

**Target:** Agent does ONE thing exceptionally well

### Checklist

#### Role Clarity (Weight: 30%)
- [ ] **Role defined:** Agent has clear role statement (e.g., "Software Architect")
- [ ] **Scope documented:** What agent DOES and DOESN'T do
- [ ] **Boundaries enforced:** Agent declines out-of-scope requests
- [ ] **Evidence:** Agent file has "Ranh Giới" (boundaries) section

#### Scope Adherence (Weight: 40%)
- [ ] **Historical adherence:** ≥90% of tasks within defined scope
- [ ] **No scope drift:** Agent hasn't expanded role without authorization
- [ ] **Delegation over expansion:** Agent delegates out-of-scope tasks (doesn't do them)
- [ ] **Evidence:** LEDGER shows no P2 penalties for scope violations

#### Specialization Depth (Weight: 30%)
- [ ] **Domain expertise:** Agent has deep skills in its domain (not shallow generalist)
- [ ] **Skill count:** 3-7 core skills (not 20+ kitchen-sink skills)
- [ ] **PEN/WIN focused:** PENs/WINs all related to agent's domain
- [ ] **Evidence:** Skills section ≤7 items, all related

### Scoring Example
```
Agent: Phúc SA (Software Architect)

Role Clarity:
  ✅ Role: "Software Architect / Backend Lead"
  ✅ Scope: Architecture, DB design, API contracts
  ⚠️ Boundaries: Defined but not enforced (accepted code implementation tasks)
  Score: 2.5/3 = 83%

Scope Adherence:
  ⚠️ 8/10 recent tasks within scope (2 tasks: wrote code instead of delegating)
  ✅ No unauthorized scope expansion
  ❌ Implemented code in 2 tasks (should delegate to Thục)
  Score: 1.5/3 = 50%

Specialization Depth:
  ✅ 5 core skills (all architecture-related)
  ✅ All PENs about architecture failures
  ✅ Deep expertise (not generalist)
  Score: 3/3 = 100%

Overall: (83% × 0.3) + (50% × 0.4) + (100% × 0.3) = 75% → ⚠️ PARTIAL
```

### Gaps Identified
1. **Gap:** Accepted 2 coding tasks (should delegate to Builder)
2. **Evidence:** LEDGER shows tasks #47, #53 (Phúc implemented code)
3. **Fix:** Add to PEN section: "Never implement code. Always delegate to Thục/Thắng/Lan."
4. **Expected improvement:** 100% scope adherence

---

## Principle 3: Adversarial Validation (Nash Triad)

**Target:** No self-approval, always Thesis → Anti-Thesis → Synthesis

### Checklist

#### Nash Triad Coverage (Weight: 50%)
- [ ] **Phase A (Criteria):** Reviewed by Anti-Thesis (Analyst challenges PM)
- [ ] **Phase C (Execute):** Built by Thesis (Builder produces artifact)
- [ ] **Phase D (Verify):** Reviewed by Anti-Thesis (Critic challenges Builder)
- [ ] **Phase E (NFR):** Optional second Critic (for Critical pipeline)
- [ ] **Phase F (Cross-cutting):** Synthesis reviews all phases (Judge)
- [ ] **Evidence:** NASH_SUBAGENT_PROMPTS.md enforces triad in pipeline

#### Zero-Sum Scoring (Weight: 30%)
- [ ] **Penalties for lazy review:** Critic penalized if approves bad work
- [ ] **Challenger multipliers:** Critic faces M1/M2/M3 penalties (2-3x) if misses bugs
- [ ] **Collusion prevention:** No agent self-scores, Main Agent writes LEDGER
- [ ] **Evidence:** SCORING_RULES.md enforces zero-sum

#### No Self-Approval (Weight: 20%)
- [ ] **Builder ≠ Reviewer:** Agent never reviews own work
- [ ] **Different archetypes:** Thesis (Builder) vs Anti-Thesis (Critic)
- [ ] **Independent review:** Anti-Thesis hasn't seen Thesis's thought process
- [ ] **Evidence:** LEDGER shows distinct agents in Thesis/Anti roles

### Scoring Example
```
Agent: Mộc (Critic)

Nash Triad Coverage:
  ✅ Participates as Anti-Thesis in Phase D
  ✅ Never self-approves (always challenges Builder)
  ✅ Synthesis (Phúc SA) judges Mộc's critiques
  Score: 3/3 = 100%

Zero-Sum Scoring:
  ✅ Mộc penalized -30 for lazy review (Task #34, approved buggy code)
  ✅ Faces M1 multiplier (2x penalty if Sơn QA finds bug Mộc missed)
  ✅ Cannot self-score
  Score: 3/3 = 100%

No Self-Approval:
  ✅ Mộc never reviews own work
  ✅ Mộc (Critic) vs Thục (Builder) = different archetypes
  ✅ Independent review (no shared context)
  Score: 3/3 = 100%

Overall: (100% × 0.5) + (100% × 0.3) + (100% × 0.3) = 100% → ✅ PASS
```

### Gaps Identified
None (Mộc meets all Adversarial Validation criteria)

---

## Principle 4: Memory Hierarchy (3-Tier Model)

**Target:** L2 Cache (<500 tokens) → RAM (on-demand) → HDD (never preloaded)

### Checklist

#### L2 Cache (Always Loaded) (Weight: 30%)
- [ ] **Agent identity:** Role, model, core skills (<200 tokens)
- [ ] **P0 constraints:** Critical PEN entries only (<300 tokens)
- [ ] **Total budget:** ≤500 tokens
- [ ] **Evidence:** Agent file header ≤500 tokens

#### RAM (On-Demand) (Weight: 40%)
- [ ] **Reference links:** `reference_Memory` points to tmp/ram/{agent}/*.md
- [ ] **Lazy loading:** Only loaded when agent explicitly requests
- [ ] **P1-P3 PENs:** Stored in RAM, retrieved by domain/keyword
- [ ] **Evidence:** PEN section uses `queryPENEntries(domain)` pattern

#### HDD (Never Preloaded) (Weight: 30%)
- [ ] **Source code:** Never loaded upfront (only when agent reads specific file)
- [ ] **Full LEDGER:** Not in context (only recent penalties if needed)
- [ ] **Old conversation:** Stored externally (DB), not in context
- [ ] **Evidence:** No large static data in agent file

### Scoring Example
```
Agent: Phúc SA

L2 Cache:
  ✅ Agent identity: 180 tokens
  ❌ P0 constraints: 8000 tokens (all PENs embedded) → BLOAT
  Score: 1/2 = 50%

RAM:
  ❌ No reference_Memory links
  ❌ All PENs embedded (not lazy-loaded)
  Score: 0/2 = 0%

HDD:
  ✅ Source code not embedded
  ✅ LEDGER not embedded
  ⚠️ All PENs embedded (should be in RAM/HDD)
  Score: 2/3 = 67%

Overall: (50% × 0.3) + (0% × 0.4) + (67% × 0.3) = 35% → ❌ FAIL
```

### Gaps Identified
1. **Gap:** All 47 PEN entries embedded in L2 Cache (8KB waste)
2. **Evidence:** Agent file lines 120-280 (PEN section)
3. **Fix:** Move P1-P3 PENs to `tmp/ram/phuc-sa/pen_entries.md`, use RAG retrieval
4. **Expected savings:** L2 Cache: 8000 → 500 tokens (94% reduction)

---

## Principle 5: Clear Boundaries (Contracts + Error Handling)

**Target:** Well-defined contracts, error codes, idempotency, retry strategies

### Checklist

#### API Contracts (Weight: 25%)
- [ ] **Endpoints defined:** All APIs have contract (method, path, params, response)
- [ ] **DTOs documented:** Request/response schemas defined
- [ ] **Status codes:** Success (200, 201) and error codes (400, 401, 500) specified
- [ ] **Evidence:** CONTRACT_DRAFT.md exists with API section

#### Error Handling (Weight: 25%)
- [ ] **Error codes:** Application-specific codes (e.g., `AUTH_001`, `DB_002`)
- [ ] **Fallback strategies:** What happens when external service fails
- [ ] **Error messages:** User-friendly messages (not raw stack traces)
- [ ] **Evidence:** CONTRACT_DRAFT.md has Error Handling section

#### Idempotency (Weight: 25%)
- [ ] **Idempotency keys:** Duplicate requests handled safely
- [ ] **Deduplication:** Same request twice = same result (no side effects)
- [ ] **Retry safety:** Can retry failed operations without corruption
- [ ] **Evidence:** CONTRACT_DRAFT.md has Idempotency section

#### Retry Strategies (Weight: 25%)
- [ ] **Exponential backoff:** Retries with increasing delays (1s, 2s, 4s, 8s)
- [ ] **Max retries:** Limited (e.g., 3-5 retries max)
- [ ] **Circuit breaker:** Stop retrying if service consistently fails
- [ ] **Evidence:** Code has retry logic or uses library (e.g., `retry`, `axios-retry`)

### Scoring Example
```
Agent: Phúc SA (Architect)

API Contracts:
  ✅ Endpoints defined in CONTRACT_DRAFT.md
  ✅ DTOs documented
  ✅ Status codes specified
  Score: 3/3 = 100%

Error Handling:
  ✅ Error codes defined (AUTH_001, DB_002)
  ⚠️ Fallback strategies: Mentioned but not detailed
  ✅ User-friendly messages
  Score: 2.5/3 = 83%

Idempotency:
  ❌ Idempotency section missing from CONTRACT_DRAFT.md
  ❌ No deduplication strategy defined
  ❌ Retry safety not addressed
  Score: 0/3 = 0%

Retry Strategies:
  ⚠️ Exponential backoff mentioned, not implemented
  ⚠️ Max retries = 3 (mentioned in doc, not in code)
  ❌ No circuit breaker
  Score: 1/3 = 33%

Overall: (100% × 0.25) + (83% × 0.25) + (0% × 0.25) + (33% × 0.25) = 54% → ⚠️ PARTIAL
```

### Gaps Identified
1. **Gap:** Idempotency section missing from CONTRACT_DRAFT.md
2. **Evidence:** CONTRACT_DRAFT.md lines 1-150 (no Idempotency section)
3. **Fix:** Add section to CONTRACT_DRAFT template (see BEST_PRACTICE_AGENT.md:520-580)
4. **Expected improvement:** Score 54% → 90% (PASS)

---

## Summary Scorecard

### Agent: [Agent Name]
### Date: [YYYY-MM-DD]

| Principle | Score | Grade | Gaps | Priority |
|-----------|-------|-------|------|----------|
| 1. Context is Fuel | 10% | ❌ FAIL | Loads 8KB PENs upfront | 🔥 P0 |
| 2. Single Responsibility | 75% | ⚠️ PARTIAL | Accepted 2 coding tasks | ⚡ P1 |
| 3. Adversarial Validation | 100% | ✅ PASS | None | - |
| 4. Memory Hierarchy | 35% | ❌ FAIL | All PENs in L2 Cache | 🔥 P0 |
| 5. Clear Boundaries | 54% | ⚠️ PARTIAL | No idempotency rules | ⚡ P1 |

**Overall:** 55% (2 FAIL, 2 PARTIAL, 1 PASS) → ⚠️ NEEDS IMPROVEMENT

### Priority Fixes (By ROI)

| # | Fix | Expected Savings | Effort | ROI | Priority |
|---|-----|------------------|--------|-----|----------|
| 1 | Progressive Loading (Layer 6) | 8000 → 500 tokens (-94%) | Low (1 hour) | ★★★★★ | 🔥 P0 |
| 2 | Move PENs to RAM (External Memory) | 8000 → 500 tokens (-94%) | Medium (2 hours) | ★★★★☆ | 🔥 P0 |
| 3 | Add Idempotency Rules | Quality +20% | Low (1 hour) | ★★★☆☆ | ⚡ P1 |
| 4 | Enforce Scope Boundaries | Quality +10% | Low (30 min) | ★★☆☆☆ | ⚡ P1 |

**Recommended action:** Start with Fix #1 (Progressive Loading) - highest ROI, lowest effort.

---

## Audit Evidence Template

For each gap, provide evidence:

```markdown
### Gap #1: Context Bloat (Principle 1)

**Evidence:**
- Agent file: agents/core/phuc-sa.md
- PEN section: Lines 120-280 (160 lines)
- Token count: 8000 tokens (measured with tiktoken)
- Breakdown:
  - P0 PENs: 12 entries × 200 tokens = 2400 tokens
  - P1 PENs: 18 entries × 180 tokens = 3240 tokens
  - P2-P3 PENs: 17 entries × 140 tokens = 2380 tokens

**Impact:**
- 94% of PEN tokens (7620/8000) are P1-P3 (not critical)
- Loaded on every task (even when irrelevant)
- Monthly waste: 7620 tokens/task × 100 tasks = 762K tokens (~$2.30)

**Fix:**
Apply Layer 6 (Progressive Loading):
1. Keep P0 PENs in L2 Cache (2400 tokens)
2. Move P1 PENs to Tier 1 (load if domain matches)
3. Move P2-P3 PENs to Tier 2 (load on-demand)

**Expected result:**
- Baseline task: 2400 tokens (Tier 0 only) - 70% reduction ✅
- Domain task: 5640 tokens (Tier 0 + Tier 1) - 30% reduction ✅
- Audit task: 8000 tokens (Tier 3 full context) - No change (acceptable)

**Verification:**
Run 10 test tasks, measure token usage:
- [ ] 7/10 tasks use Tier 0 only (2400 tokens)
- [ ] 2/10 tasks use Tier 1 (5640 tokens)
- [ ] 1/10 tasks use Tier 3 (8000 tokens)
- [ ] Average: (7×2400 + 2×5640 + 1×8000) / 10 = 3760 tokens (-53% vs baseline)
```

---

## Quarterly Review Checklist

Run this audit every 3 months:

- [ ] **Re-audit all 5 principles** (scores may have degraded)
- [ ] **Check for new anti-patterns** (God Agent, shared state, etc.)
- [ ] **Review new PEN entries** (do they indicate principle violations?)
- [ ] **Benchmark against industry** (check Beam.ai, OpenAI for new patterns)
- [ ] **Update reference docs** (BEST_PRACTICE_AGENT.md, TOKEN_OPTIMIZATION_ARCHITECTURE.md)
- [ ] **Measure token efficiency trends** (is agent getting more efficient over time?)
- [ ] **Verify applied fixes still working** (no regressions)

**Next review date:** [YYYY-MM-DD] (3 months from now)

---

## References

- **Source:** system/BEST_PRACTICE_AGENT.md (lines 15-145)
- **Token optimization:** system/TOKEN_OPTIMIZATION_ARCHITECTURE.md
- **Scoring rules:** system/SCORING_RULES.md
- **Memory architecture:** agents/BRAIN.md

---

**Version:** 1.0.0
**Last Updated:** 2026-03-16
**Maintained By:** Nash Agent Framework
**Review Frequency:** Quarterly
