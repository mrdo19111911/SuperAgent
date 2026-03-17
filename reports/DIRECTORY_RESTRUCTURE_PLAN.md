# Directory Restructure Implementation Plan

**Goal:** Reorganize Nash Agent Framework for clarity, token efficiency, and maintainability

**Timeline:** 8 weeks, 72 hours estimated effort

**Scope:** Restructure entire framework from current ad-hoc organization to 3-tier L2/RAM/HDD architecture

---

## Current State (Problems)

### Current Directory Structure
```
nash-agent-framework/
├── CLAUDE.md (1,283 words)           # Entry point 1
├── main.md (1,490 words)             # Entry point 2
├── GUIDE.md (2,635 words)            # Entry point 3
├── README.md (3,026 words)           # Entry point 4
├── plan.md (150 lines)               # Project tracking
├── agents/
│   ├── BRAIN.md                      # Dung PM system prompt
│   ├── AGENT_TEMPLATE_V2.md (370 lines)
│   ├── core/ (9 agents, mixed sizes)
│   ├── dev/ (10 agents, mixed sizes)
│   ├── research/ (5 agents)
│   ├── user/ (3 agents)
│   └── skills/ (54 skills, no clear organization)
├── system/
│   ├── AUDIT.md (166 lines)
│   ├── BEST_PRACTICE_AGENT.md (779 lines) ← BLOAT
│   ├── COGNITIVE_MODES.md (393 lines)     ← BLOAT
│   ├── TOKEN_OPTIMIZATION.md (626 lines)  ← BLOAT
│   ├── MIXTURE_OF_EXPERTS_ROUTER.md (113 lines)
│   ├── NASH.md (39 lines)
│   ├── SCORING_RULES.md (79 lines)
│   ├── templates/
│   └── (no clear L2/RAM separation)
├── pipelines/
│   ├── 01-06 SDLC (inconsistent sizes: 55-68 lines)
│   ├── DESIGN_FLOW.md (174 lines)
│   └── FE_IMPLEMENTATION.md (364 lines) ← BLOAT
├── skill_factory/ (scattered tools)
├── agent_factory/ (scattered tools)
├── gates/ (quality validators)
├── scripts/ (automation)
├── observability/ (monitoring)
├── data/, bin/, tests/
└── tmp/ (unclear purpose)
```

### Measured Problems

1. **Token Bloat at Bootstrap** (~30K tokens estimated)
   - 4 entry points loaded redundantly
   - system/ files mixed L2/RAM (no lazy loading)
   - All agents loaded regardless of task

2. **No Clear Hierarchy**
   - CLAUDE.md, main.md, GUIDE.md, README.md all claim to be "start here"
   - agents/ mixes profiles (L2) with skills (should be RAM)
   - system/ mixes always-load (routing) with rarely-load (best practices)

3. **Inconsistent Structure**
   - Pipeline files: 55 lines to 364 lines (6× variance)
   - Agent files: 200-800 tokens (4× variance)
   - No templates enforced

4. **Discovery Friction**
   - New users don't know: CLAUDE.md or README.md?
   - Developers grep 100+ files to find routing logic
   - Skills buried in agents/skills/ (should be indexed)

---

## Proposed New Structure

### Design Principles

1. **Directory = Token Tier**
   - `core/` = L2 Cache (always loaded, <10K tokens total)
   - `system/` = RAM (load on-demand via triggers)
   - `docs/` = HDD (never loaded by AI, human-only)

2. **Single Entry Point Funnel**
   - `START_HERE.md` (300 tokens) → dispatches to appropriate path
   - No competing entry points

3. **Tabular Decision Logic**
   - Routing, scoring, metadata in CSV/YAML (not prose)
   - Machine-parseable, unit-testable

4. **Enforced Limits**
   - Agent L2 Cache: ≤500 tokens (automated gate)
   - Pipeline files: ≤600 tokens (template-based)
   - System files: split into reference vs always-load

### Proposed Directory Layout

```
nash-agent-framework/
│
├── START_HERE.md (300 tokens)        # ← SINGLE entry point
│   └─→ Dispatches to: core/BOOTSTRAP.md | docs/QUICKSTART.md | README.md
│
├── core/                             # ← L2 CACHE (always loaded, <10K tokens)
│   ├── BOOTSTRAP.md (200 tokens)     # Load instructions, trigger definitions
│   ├── INDEX.md (500 tokens)         # Master file routing guide
│   ├── NASH_RULES.md (300 tokens)    # 5 rules compact form
│   ├── ROUTING_TABLE.csv             # Audit signals → Pipelines (machine-readable)
│   ├── SCORING_MATRIX.csv            # Event → Severity → Points
│   ├── PIPELINE_REGISTRY.yaml        # Pipeline metadata (agents, gates, phases)
│   └── AGENT_REGISTRY.yaml           # Agent metadata (archetype, skills, L2 path)
│
├── agents/                           # ← L2 CACHE (agent profiles, ≤500 tokens ENFORCED)
│   ├── AGENT_TEMPLATE_V3.md          # 5-section template (500 tokens max)
│   ├── core/                         # 9 core agents × 500 tokens = 4.5K
│   │   ├── dung-manager.md
│   │   ├── phuc-sa.md
│   │   ├── moc-arch-chal.md
│   │   └── ... (6 more)
│   ├── dev/                          # 10 dev agents × 500 tokens = 5K
│   │   ├── thuc-dev-ts.md
│   │   ├── lan-dev-fe.md
│   │   └── ... (8 more)
│   ├── research/                     # 5 research agents × 500 = 2.5K
│   └── user/                         # 3 user agents × 500 = 1.5K
│   └── (Total: 13.5K tokens, but load only needed agents per task)
│
├── ram/                              # ← RAM (on-demand deep references)
│   ├── agents/                       # Agent-specific deep knowledge
│   │   ├── phuc-sa/
│   │   │   ├── architecture_patterns.md
│   │   │   ├── database_best_practices.md
│   │   │   └── contract_checklist.md
│   │   ├── moc/
│   │   │   ├── challenge_tactics.md
│   │   │   └── review_checklists.md
│   │   └── ... (other agents)
│   ├── skills/                       # Skill registry + content (moved from agents/)
│   │   ├── _registry.json            # Skill metadata (version, tags, dependencies)
│   │   ├── code-review-excellence/
│   │   ├── git-workflow-branching/
│   │   └── ... (54 skills)
│   └── domain/                       # Project-specific knowledge
│       └── (loaded based on CONTEXT.md stack)
│
├── system/                           # ← RAM (reference docs, load on trigger)
│   ├── audit/
│   │   ├── AUDIT_SPEC.md             # 12-dimension overview
│   │   └── dimensions/
│   │       ├── C1_business.md
│   │       ├── C2_docs.md
│   │       └── ... (C3-C12)
│   ├── pipelines/
│   │   ├── PIPELINE_TEMPLATE.md      # Standard 6-section template
│   │   ├── 01_requirements.md        # Follows template (≤600 tokens)
│   │   ├── 02_architecture.md
│   │   ├── 03_coding.md
│   │   ├── 04_testing.md
│   │   ├── 05_security.md
│   │   ├── 06_hotfix.md
│   │   ├── design_flow.md
│   │   └── fe_implementation.md
│   ├── templates/
│   │   ├── LEDGER.md                 # Scoring transaction format
│   │   ├── CONTRACT_DRAFT.md         # 8-section API contract
│   │   └── DISPATCH.md               # Sub-agent spawn template (v6.2)
│   ├── advanced/                     # Expert-level references (rarely loaded)
│   │   ├── COGNITIVE_MODES_DECISION_TREE.md (50 lines extracted)
│   │   ├── COGNITIVE_MODES_PHILOSOPHY.md (343 lines)
│   │   ├── TOKEN_OPTIMIZATION_LAYERS.md (split by layer)
│   │   ├── BEST_PRACTICES_QUICK_REF.md (100 lines)
│   │   └── BEST_PRACTICES_DETAILED/ (split by principle/pattern)
│   └── deprecated/                   # Archive old files (don't delete history)
│       ├── NASH_UNIVERSAL_PROMPT.md  # Replaced by core/DISPATCH.md
│       └── MODEL_ROUTING.md          # Replaced by AGENT_REGISTRY.yaml
│
├── docs/                             # ← HDD (human learning, NEVER loaded by AI)
│   ├── 01_QUICKSTART.md              # 15-min tutorial
│   ├── 02_CONCEPTS.md                # Nash/MoE/Memory explained
│   ├── 03_USAGE_GUIDE.md             # Common workflows
│   ├── 04_ARCHITECTURE.md            # Deep dive: system design
│   ├── 05_CONTRIBUTING.md            # Development guide
│   └── FAQ.md                        # Troubleshooting
│
├── gates/                            # Quality validators (unchanged)
│   ├── validate.sh, integrity.sh, qa.sh, security.sh, commit.sh
│
├── scripts/                          # Automation tools
│   ├── bootstrap.sh                  # ← NEW: Load core/ into context
│   ├── enforce_l2_limit.sh           # ← NEW: Reject agents/ >500 tokens
│   ├── merge_audit.sh
│   └── install-production.sh
│
├── factories/                        # ← NEW: Consolidate creation tools
│   ├── skill/                        # Moved from skill_factory/
│   │   ├── SKILL_BUILDING_MASTER_GUIDE.md
│   │   ├── GSTACK_WRITING_STYLE.md
│   │   ├── smartlog_skill_creator/
│   │   └── SKILL_TEMPLATE/
│   └── agent/                        # Moved from agent_factory/
│       ├── AGENT_BUILDING_MASTER_GUIDE.md
│       ├── agent_skill_sharpener/
│       └── agent_sharpening_2026/
│
├── artifacts/{task}/                # Per-task outputs (unchanged)
│   └── plan.md, LEDGER.md, outputs/
│
├── observability/                    # Monitoring stack (unchanged)
│   ├── server.js
│   ├── grafana/
│   └── prometheus/
│
├── data/, bin/, tests/               # Infrastructure (unchanged)
│
└── [REMOVED] tmp/                    # ← DELETED (unclear purpose, no refs)
```

---

## Implementation Plan

### Phase 0: Foundation (4 hours)

**Tasks:**
1. Create `START_HERE.md` (300 tokens universal entry point)
2. Create `core/BOOTSTRAP.md` (200 tokens load instructions)
3. Create `core/INDEX.md` (master file routing guide)
4. Create `scripts/enforce_l2_limit.sh` (500-token limit validator)

**Validation:**
- Run `enforce_l2_limit.sh` on current agents/, document violations
- Measure baseline token load (estimate ~30K)

**Files Created:** 4
**Files Modified:** 0
**Files Deleted:** 0

---

### Phase 1: Extract Decision Logic to Tables (8 hours)

**Tasks:**
1. Extract MoE Router logic → `core/ROUTING_TABLE.csv`
   - Parse `system/MIXTURE_OF_EXPERTS_ROUTER.md` (lines 64-113)
   - Convert to CSV: audit_signal, pipeline, priority, agents, gate_script
   - Add schema version header: `schema_version,2.0`

2. Extract scoring rules → `core/SCORING_MATRIX.csv`
   - Parse `system/SCORING_RULES.md` (lines 6-32)
   - Convert to CSV: event, severity, points, multiplier, evidence_required

3. Create `core/PIPELINE_REGISTRY.yaml`
   - Metadata for 8 pipelines: phases, agents (thesis/anti/synth), gates

4. Create `core/AGENT_REGISTRY.yaml`
   - Metadata for 27 agents: id, archetype, skills, l2_path, ram_path

5. Compress `system/NASH.md` → `core/NASH_RULES.md`
   - Extract 5 rules to 300 tokens (add examples from NASH_UNIVERSAL_PROMPT.md)

**Validation:**
- Parse CSV/YAML with script, verify completeness
- Compare routing decisions: old (prose) vs new (table)
- Unit test: `test_routing_table.sh` (input audit → expected pipeline)

**Files Created:** 5
**Files Modified:** 0
**Files Deleted:** 0

---

### Phase 2: Standardize Pipelines (12 hours)

**Tasks:**
1. Create `system/pipelines/PIPELINE_TEMPLATE.md` (6-section standard)
   - Sections: TRIGGER, AGENTS, OUTPUTS, WORKFLOW, GATES, EXIT
   - Target: 600 tokens max

2. Refactor 8 pipelines to follow template:
   - `pipelines/01_REQUIREMENTS_AND_RESEARCH.md` → `system/pipelines/01_requirements.md`
   - `pipelines/02_ARCHITECTURE_AND_DB.md` → `system/pipelines/02_architecture.md`
   - (repeat for 03-06, design_flow, fe_implementation)

3. Move old pipelines to `system/deprecated/pipelines/`

4. Add gate script check: `gates/validate_pipeline_template.sh`

**Validation:**
- Diff old vs new pipelines, verify no logic lost
- Run `validate_pipeline_template.sh` on all 8 pipelines
- Compare token counts: before vs after

**Files Created:** 9 (template + 8 pipelines)
**Files Modified:** 0
**Files Deleted:** 0 (moved to deprecated/)

---

### Phase 3: Compress Agents (16 hours)

**Tasks:**
1. Create `agents/AGENT_TEMPLATE_V3.md` (5-section, 500-token limit)
   - Sections: IDENTITY, CONSTRAINTS, WORKFLOWS, TOOLS, BOOT
   - Reference deep content in `ram/agents/{agent}/`

2. Audit current agents/ for violations (27 agents)
   - Measure current token counts (use actual tokenizer, not wc -w)
   - Identify content to extract to RAM

3. Compress agents (priority: core → dev → research → user)
   - Extract verbose content to `ram/agents/{agent}/`
   - Apply template (5 sections, ≤500 tokens)
   - Run `enforce_l2_limit.sh` after each agent

4. Move `agents/skills/` to `ram/skills/`

**Validation:**
- Run `enforce_l2_limit.sh` on all agents/, ensure 100% PASS
- Test agent dispatch: verify RAM loads correctly
- Measure token reduction: before vs after

**Files Created:** 27 agent files (overwrite) + ~50 RAM files
**Files Modified:** 27 agents
**Files Deleted:** 0 (skills moved)

---

### Phase 4: Split Large System Files (10 hours)

**Tasks:**
1. Split `system/BEST_PRACTICE_AGENT.md` (779 lines, 20K tokens)
   - `system/advanced/BEST_PRACTICES_QUICK_REF.md` (100 lines)
   - `system/advanced/principles/` (5 files, 1 per principle)
   - `system/advanced/patterns/` (9 files, 1 per pattern)

2. Split `system/COGNITIVE_MODES.md` (393 lines, 12K tokens)
   - `system/advanced/COGNITIVE_MODES_DECISION_TREE.md` (50 lines)
   - `system/advanced/COGNITIVE_MODES_PHILOSOPHY.md` (343 lines)

3. Split `system/TOKEN_OPTIMIZATION.md` (626 lines, 20K tokens)
   - `system/advanced/TOKEN_OPTIMIZATION_LAYERS.md` (6 files, 1 per layer)

4. Split `system/AUDIT.md` (166 lines)
   - `system/audit/AUDIT_SPEC.md` (overview)
   - `system/audit/dimensions/` (12 files, C1-C12)

**Validation:**
- Measure token reduction: 52K → ~8K for quick refs
- Test lazy loading: trigger loads correct section only
- Verify no content lost (diff original vs split)

**Files Created:** ~35 files
**Files Modified:** 0
**Files Deleted:** 0 (originals moved to deprecated/)

---

### Phase 5: Reorganize Docs (6 hours)

**Tasks:**
1. Move `GUIDE.md` → `docs/04_ARCHITECTURE.md`
2. Create `docs/01_QUICKSTART.md` (15-min tutorial)
3. Create `docs/02_CONCEPTS.md` (Nash/MoE/Memory explained)
4. Create `docs/03_USAGE_GUIDE.md` (common workflows)
5. Create `docs/05_CONTRIBUTING.md`
6. Update `README.md` to link to docs/ (remove duplicate content)
7. Archive old files to `system/deprecated/`

**Validation:**
- New user test: can they complete quickstart in ≤20 min?
- Verify no AI agent loads docs/ during bootstrap test
- Check README.md renders correctly on GitHub

**Files Created:** 5
**Files Modified:** 1 (README.md)
**Files Deleted:** 0 (moved to deprecated/)

---

### Phase 6: Consolidate Factories (4 hours)

**Tasks:**
1. Create `factories/` directory
2. Move `skill_factory/` → `factories/skill/`
3. Move `agent_factory/` → `factories/agent/`
4. Update references in scripts, docs

**Validation:**
- Run `bash factories/skill/smartlog_skill_creator/SKILL.md` (test still works)
- Check for broken symlinks or imports

**Files Created:** 0
**Files Modified:** ~10 (path updates)
**Files Deleted:** 0 (moved)

---

### Phase 7: Cleanup & Polish (8 hours)

**Tasks:**
1. Delete `tmp/` directory (no references found, unclear purpose)
2. Update `CLAUDE.md` to reference new structure
3. Update `main.md` boot protocol
4. Create migration guide: `docs/MIGRATION_GUIDE.md`
5. Run full validation:
   - Token budget: core/ + agents/ ≤10K?
   - All files follow templates?
   - No L2 Cache violations?
   - All gate scripts pass?

**Validation:**
- Bootstrap test: cold start, measure token load
- Regression test: dispatch sample task, verify pipelines work
- Performance test: compare task completion time

**Files Created:** 1 (migration guide)
**Files Modified:** 2 (CLAUDE.md, main.md)
**Files Deleted:** 1 (tmp/)

---

### Phase 8: Feature Flags & Gradual Rollout (4 hours)

**Tasks:**
1. Create `core/feature_flags.yaml`:
   ```yaml
   enable_csv_routing: false      # Toggle old/new MoE Router
   enforce_token_limit: warn      # warn vs block mode
   use_new_templates: false       # Gradual agent migration
   load_from_core: true           # Use core/ vs old structure
   ```

2. Update `core/BOOTSTRAP.md` to check feature flags
3. Support both old + new structures during migration

**Validation:**
- Test with all flags OFF (old behavior)
- Test with all flags ON (new behavior)
- Test mixed states (partial migration)

**Files Created:** 1
**Files Modified:** 1 (BOOTSTRAP.md)
**Files Deleted:** 0

---

## Token Reduction Targets

| Category | Before | After | Reduction |
|----------|--------|-------|-----------|
| **Bootstrap (L2 Cache)** | ~30K tokens | ~6K tokens | **80%** |
| Entry points (4 files) | 8.4K words = 11K tokens | 300 tokens (START_HERE only) | 97% |
| Core framework files | 19K tokens (prose) | 3K tokens (tables) | 84% |
| Agent L2 Cache | ~6K tokens (varies) | 4.5K tokens (500×9 core agents) | 25% |
| Pipeline files | ~8K tokens (varies) | 4.8K tokens (600×8 pipelines) | 40% |
| System files (on-demand) | 52K tokens | 8K tokens (quick refs) | 85% |

**Overall:** 30K → 6K bootstrap tokens (**80% reduction**)

---

## Validation Strategy

### Automated Gates
1. `scripts/enforce_l2_limit.sh` - Reject agents/ files >500 tokens
2. `gates/validate_pipeline_template.sh` - Enforce 6-section structure
3. `scripts/measure_tokens.py` - Actual tokenizer (tiktoken), not wc -w
4. `scripts/benchmark_routing.py` - CSV routing performance vs prose

### Manual Testing
1. **Bootstrap test:** Cold start → measure token load → verify ≤10K
2. **Regression test:** Dispatch sample tasks → verify pipelines execute correctly
3. **User test:** New developer follows quickstart → complete in ≤20 min
4. **Performance test:** Compare task completion time before/after

### Success Criteria
- [ ] Bootstrap token load ≤10K (baseline: ~30K)
- [ ] All agents/ files ≤500 tokens (enforced by gate)
- [ ] All pipeline files follow template (8/8 compliance)
- [ ] docs/ never loaded during AI bootstrap
- [ ] CSV routing produces same decisions as prose
- [ ] No regression in task completion time

---

## Risks & Mitigations

### Risk 1: CSV Parsing Errors
**Impact:** P0 - Framework unusable if routing breaks
**Mitigation:**
- Add schema version header to all CSV/YAML
- Unit tests for parsing (malformed CSV, special characters)
- Keep old MoE Router as fallback (feature flag)

### Risk 2: Token Count Methodology
**Impact:** P1 - False claims if wc -w × 1.3 is inaccurate
**Mitigation:**
- Use actual tokenizer (tiktoken) in all measurements
- Provide screenshots from Claude Code UI
- Re-measure all estimates with real tokenizer

### Risk 3: Breaking Agent Dispatch
**Impact:** P0 - Existing agents fail mid-migration
**Mitigation:**
- Support both v2/v3 templates during migration
- Feature flags for gradual rollout
- Regression tests for all 27 agents

### Risk 4: Time Estimate Underrun
**Impact:** P1 - Scope creep, missed deadlines
**Mitigation:**
- 30% contingency buffer built into estimates
- Track actual vs estimated hours per phase
- Stop after Phase 4 if >50% over budget

### Risk 5: Loss of Content During Split
**Impact:** P2 - Missing logic in compressed files
**Mitigation:**
- Diff original vs split files (verify byte-level equivalence)
- Keep deprecated/ as backup (never delete)
- Manual review of all splits

---

## Rollback Strategy

### Pre-Migration Backup
```bash
# Tag current state
git tag pre-refactor-$(date +%Y%m%d)

# Backup to artifacts/
mkdir -p artifacts/refactor/backup/
cp -r agents/ system/ pipelines/ artifacts/refactor/backup/
```

### Rollback Procedure
```bash
# If migration fails in Phase N
bash scripts/rollback.sh

# Script does:
1. Restore from artifacts/refactor/backup/
2. Reset feature flags to OFF
3. Git revert to pre-refactor tag
4. Run validation tests
```

### Feature Flag Escape Hatch
```yaml
# Instant rollback without code changes
core/feature_flags.yaml:
  enable_csv_routing: false       # ← Revert to prose MoE Router
  enforce_token_limit: false      # ← Disable strict limits
  use_new_templates: false        # ← Use v2 agents
  load_from_core: false           # ← Use old structure
```

---

## NOT in Scope (Explicitly Deferred)

| Work | Rationale |
|------|-----------|
| Auto-generate diagrams from CSV | Nice-to-have, not core functionality |
| Unit tests for routing/scoring logic | Deferred to post-migration (add in Phase 9) |
| Grafana dashboard for token usage | Observability already exists, not urgent |
| Hierarchical compression TTL automation | Manual compression sufficient for now |
| Multi-language support (i18n) | Framework is English-only for now |
| Agent performance benchmarking | Defer until basic structure proven |

---

## What Already Exists (Reuse vs Rebuild)

| Capability | Existing Code | Plan Action |
|------------|---------------|-------------|
| **Token measurement** | None (using wc -w approximation) | **BUILD NEW:** scripts/measure_tokens.py (tiktoken) |
| **Agent dispatch** | agents/core/dung-manager.md | **REUSE:** Keep dispatch logic, add feature flags |
| **Pipeline execution** | pipelines/*.md | **REFACTOR:** Keep logic, apply template |
| **Quality gates** | gates/*.sh | **REUSE:** Keep all 5 gates unchanged |
| **Observability** | observability/server.js | **REUSE:** No changes needed |
| **Skill registry** | agents/skills/_registry.json | **MOVE:** To ram/skills/ (not rebuild) |
| **MoE routing** | system/MIXTURE_OF_EXPERTS_ROUTER.md | **EXTRACT:** Logic to CSV (not rebuild) |

**Principle:** Capture outputs, don't rebuild. 90% reuse, 10% reorganize.

---

## File Change Summary

| Phase | Created | Modified | Deleted | Moved |
|-------|---------|----------|---------|-------|
| 0. Foundation | 4 | 0 | 0 | 0 |
| 1. Decision Logic | 5 | 0 | 0 | 0 |
| 2. Pipelines | 9 | 0 | 0 | 8 |
| 3. Agents | 77 | 27 | 0 | 54 skills |
| 4. System Split | 35 | 0 | 0 | 4 large files |
| 5. Docs | 5 | 1 | 0 | 1 |
| 6. Factories | 0 | 10 | 0 | 2 dirs |
| 7. Cleanup | 1 | 2 | 1 | 0 |
| 8. Feature Flags | 1 | 1 | 0 | 0 |
| **TOTAL** | **137** | **41** | **1** | **69** |

---

## Timeline & Effort Breakdown

| Phase | Tasks | Estimated Hours | Realistic Hours | Contingency |
|-------|-------|----------------|-----------------|-------------|
| 0. Foundation | 4 | 4h | 4h | 0h |
| 1. Decision Logic | 5 | 8h | 8h | 0h |
| 2. Pipelines | 4 | 12h | 12h | 0h |
| 3. Agents | 4 | 16h | 20h | +4h (edge cases) |
| 4. System Split | 4 | 10h | 12h | +2h (diffing) |
| 5. Docs | 7 | 6h | 8h | +2h (user testing) |
| 6. Factories | 4 | 4h | 4h | 0h |
| 7. Cleanup | 5 | 8h | 10h | +2h (regression tests) |
| 8. Feature Flags | 3 | 4h | 6h | +2h (integration) |
| **TOTAL** | **40** | **72h** | **84h** | **+12h** |

**Realistic delivery:** 10.5 days full-time OR 8 weeks part-time (10h/week)

---

## Open Questions

1. **Token limit enforcement:** Hard block or soft warn initially?
2. **CSV parsing library:** Python csv module or custom parser?
3. **Deprecated/ retention:** Keep forever or auto-delete after 6 months?
4. **Feature flag defaults:** Start with all OFF or gradual ON?
5. **Backward compatibility:** Support v2 agents for how long? (1 month? 3 months?)

---

**Document Version:** 1.0
**Last Updated:** 2026-03-16
**Author:** Synthesis from Nash Triad debate (Phúc SA + Mộc + Dũng PM)
