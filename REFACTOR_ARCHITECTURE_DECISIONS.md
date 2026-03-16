# Refactor Architecture Decisions (2026-03-16)

**Context:** Nash Triad debate (Phúc SA vs Mộc) + /plan-eng-review validation

**Scope:** Full framework restructure (100 hours estimated)

---

## Architecture Review Results (Section 1/4 Complete)

### Decision #1: Split core/ into boot/ and metadata/
**Issue:** core/ mixed always-loaded bootstrap logic with on-demand routing metadata
**Decision:** 1A - Create core/boot/ (300 tokens always loaded) and core/metadata/ (2K tokens on-demand)
**Rationale:** Makes L2/RAM boundaries explicit in directory structure
**Time Impact:** +1h to Phase 1

### Decision #2: CSV Routing Needs Error Recovery
**Issue:** Converting MoE Router to CSV without error handling risks silent failures
**Decision:** 2A - Add CSV schema validator + fallback to prose MoE Router
**Rationale:** Graceful degradation prevents framework outages on malformed CSV
**Time Impact:** +3h to Phase 1

### Decision #3: RAM Loading Needs Depth Limit
**Issue:** ram/agents/ references can create circular dependencies (A→B→C→A)
**Decision:** 3A - Add MAX_RAM_DEPTH=3 limit + cycle detection
**Rationale:** Prevents infinite loops, shows clear error messages with cycle path
**Time Impact:** +2h to Phase 3

### Decision #4: Feature Flags Need Rollout Strategy
**Issue:** Feature flags without gradual rollout = tech debt that never cleans up
**Decision:** 4A - Gradual rollout (0% → canary 10% → 50% → 100%) + auto-rollback on 5% error rate + cleanup schedule
**Rationale:** Canary mode catches bugs early, auto-rollback prevents outages, cleanup prevents debt
**Time Impact:** +6h to Phase 8

### Decision #5: Rollback Needs Pre-Testing
**Issue:** Untested rollback script = no better than no rollback script
**Decision:** 5A - Add rollback dry run to Phase 0 (test before migration)
**Rationale:** Find rollback bugs safely in Phase 0, not during panic mode
**Time Impact:** +2h to Phase 0

### Decision #6: docs/ Policy Too Restrictive
**Issue:** "Never load docs/" breaks agent-assisted learning scenarios
**Decision:** 6A - Change to "never PRELOAD, allow explicit reads" (2K token limit)
**Rationale:** Preserves bootstrap token savings while enabling legitimate use cases
**Time Impact:** +2h to Phase 0

---

## Updated Timeline

| Phase | Original | Updated | Change |
|-------|----------|---------|--------|
| 0 - Foundation | 4h | 8h | +4h (rollback test, docs policy) |
| 1 - Decision Logic | 8h | 12h | +4h (CSV validator, core/ split) |
| 2 - Pipelines | 12h | 12h | 0h |
| 3 - Agents | 16h | 18h | +2h (RAM depth limit) |
| 4 - System Split | 10h | 10h | 0h |
| 5 - Docs | 6h | 6h | 0h |
| 6 - Factories | 4h | 4h | 0h |
| 7 - Cleanup | 8h | 8h | 0h |
| 8 - Feature Flags | 4h | 10h | +6h (rollout logic) |
| **TOTAL** | **72h** | **88h** | **+16h** |

**Realistic estimate with 30% buffer:** 88h × 1.3 = **114 hours (14 days full-time)**

---

## Updated Directory Structure

```
core/
├── boot/                         # Always loaded (~300 tokens)
│   ├── BOOTSTRAP.md              # + CSV validator, RAM depth limit, feature flags
│   └── NASH_RULES.md
└── metadata/                     # On-demand (~2K tokens)
    ├── INDEX.md                  # Trigger: agent asks "where is X?"
    ├── ROUTING_TABLE.csv         # Schema v2.0, validated on load
    ├── SCORING_MATRIX.csv
    ├── PIPELINE_REGISTRY.yaml
    └── AGENT_REGISTRY.yaml

docs/                             # Never preload, allow explicit reads (2K limit)
├── 01_QUICKSTART.md              # Trigger: "how to start?"
├── 02_CONCEPTS.md                # Trigger: "what is X?"
├── 03_USAGE_GUIDE.md             # Trigger: "how to do X?"
└── ...

ram/
├── agents/{agent}/               # Depth limit = 3, cycle detection
│   └── *.md
└── skills/
```

---

## New Code Requirements

### 1. CSV Schema Validator (Phase 1)
```python
def validate_csv_schema(csv_path, expected_version="2.0"):
    """
    Validates CSV schema and structure.
    Raises SchemaError on validation failure.
    """
    # Check schema version header
    # Validate column count and types
    # Check for required fields
    pass

def parse_routing_table_with_fallback():
    """
    Parses ROUTING_TABLE.csv with fallback to prose MoE Router.
    Returns routing decisions dict.
    Alerts developer on fallback usage.
    """
    try:
        routing = parse_csv("core/metadata/ROUTING_TABLE.csv")
        validate_csv_schema(routing, version="2.0")
        return routing
    except (CSVError, SchemaError) as e:
        log_error(f"CSV routing failed: {e}")
        alert_developer("CSV routing broken, using fallback")
        return parse_prose("system/MIXTURE_OF_EXPERTS_ROUTER.md")
```

### 2. RAM Depth Limit (Phase 3)
```python
MAX_RAM_DEPTH = 3

def load_ram(path, depth=0, loaded_paths=set()):
    """
    Loads RAM file with depth limit and cycle detection.
    Raises RAMDepthError if depth > MAX_RAM_DEPTH.
    Raises RAMCycleError if circular dependency detected.
    """
    if depth > MAX_RAM_DEPTH:
        raise RAMDepthError(f"RAM depth exceeded at {path}")

    if path in loaded_paths:
        raise RAMCycleError(f"Circular dependency: {path}")

    loaded_paths.add(path)
    # Load and parse file
    # Extract RAM references
    # Recursively load with depth+1
    pass
```

### 3. Feature Flag Rollout (Phase 8)
```python
def get_feature_flag(flag_name, task_id):
    """
    Gets feature flag value with gradual rollout support.
    Supports: canary mode, auto-rollback on error rate.
    """
    config = load_yaml("core/feature_flags.yaml")[flag_name]

    # Check rollout schedule
    current_week = get_current_week()
    value = config['rollout_plan'].get(current_week, config['current_value'])

    # Canary mode: random sampling
    if value.startswith("canary_"):
        percentage = int(value.split("_")[1].replace("pct", ""))
        return hash(task_id) % 100 < percentage

    # Auto-rollback check
    if config.get('auto_rollback'):
        error_rate = get_error_rate(flag_name, last_hour=1)
        if error_rate > config['auto_rollback']['trigger']:
            alert_developer(f"Auto-rollback: {flag_name} error_rate={error_rate}")
            return False

    return value
```

### 4. Rollback Dry Run (Phase 0)
```bash
# scripts/test_rollback.sh
#!/bin/bash
# Tests rollback procedure before migration

echo "Creating fake backup..."
mkdir -p artifacts/refactor/test_backup/
cp -r agents/ system/ pipelines/ artifacts/refactor/test_backup/

echo "Simulating migration (touching files)..."
echo "# TEST MIGRATION" >> agents/core/dung-manager.md

echo "Running rollback..."
bash scripts/rollback.sh --test-mode

echo "Validating restore..."
diff -r artifacts/refactor/test_backup/ .
if [ $? -eq 0 ]; then
    echo "✅ Rollback test PASSED"
else
    echo "❌ Rollback test FAILED"
    exit 1
fi

echo "Cleaning up..."
rm -rf artifacts/refactor/test_backup/
```

### 5. docs/ On-Demand Loading (Phase 0)
```python
def handle_agent_question(question):
    """
    Loads docs/ on-demand for agent learning scenarios.
    Never preloads. 2K token limit per excerpt.
    """
    if "how to" in question.lower() or "what is" in question.lower():
        relevant_doc = match_question_to_doc(question)
        if relevant_doc.startswith("docs/"):
            return read_file(relevant_doc, max_tokens=2000)
    return None
```

---

## Remaining Review Sections

- [ ] Section 2: Code Quality Review (DRY, organization, error handling)
- [ ] Section 3: Test Review (coverage diagram, validation strategy)
- [ ] Section 4: Performance Review (N+1, caching, bottlenecks)

---

## References

- **Full plan:** `artifacts/refactor/DIRECTORY_RESTRUCTURE_PLAN.md` (gitignored)
- **THESIS:** `artifacts/refactor/THESIS_COMPREHENSIVE_REFACTOR_STRATEGY.md` (Phúc SA)
- **ANTI-THESIS:** `artifacts/refactor/ANTI_THESIS_REFACTOR_CRITIQUE.md` (Mộc)
- **Nash debate summary:** See conversation 2026-03-16

---

**Status:** Architecture Review complete (6/6 issues resolved)
**Next:** Code Quality Review
**Updated by:** Dũng PM (SYNTHESIS agent)
**Date:** 2026-03-16
