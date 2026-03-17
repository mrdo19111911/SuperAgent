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

---

## Code Quality Review Results (Section 2/4 Complete)

### Decision #7: Merge START_HERE.md into BOOTSTRAP.md
**Issue:** Two entry points violate DRY principle
**Decision:** 7A - Consolidate to single BOOTSTRAP.md
**Time Impact:** +1h to Phase 0

### Decision #8: Consolidate 4 Metadata Files
**Issue:** ROUTING_TABLE.csv, SCORING_MATRIX.csv, PIPELINE_REGISTRY.yaml, AGENT_REGISTRY.yaml duplicate data
**Decision:** 8A - Merge into single core/metadata/METADATA.yaml
**Time Impact:** +4h to Phase 1

### Decision #9: Symlinks for Backward Compatibility
**Issue:** Moving agents/skills/ → ram/skills/ breaks existing references
**Decision:** 9A - Create symlinks + deprecation warnings during migration
**Time Impact:** +1h to Phase 3, +1h to Phase 6

### Decision #10: Agent Creation Script
**Issue:** No enforcement of AGENT_TEMPLATE_V3.md at creation time
**Decision:** 10A - scripts/create_agent.sh with template validation
**Time Impact:** +2h to Phase 3

### Decision #11: Pipeline _CUSTOM Suffix
**Issue:** Template too rigid for complex pipelines (fe_implementation, design_flow)
**Decision:** 11A - Allow _CUSTOM suffix to escape template
**Time Impact:** +1h to Phase 2

---

## Test Review Results (Section 3/4 Complete)

### Decision #12: Test Coverage Diagram
**Finding:** 47 tests needed, 0 exist. 8 new codepaths, 3 CRITICAL gaps
**Time Impact:** Distributed across phases

### Decision #13: Rollback Integration Test
**Issue:** Gap #1 - Rollback test failure (untested disaster recovery)
**Decision:** 13A - Add tests/rollback_test.sh
**Time Impact:** +1h to Phase 0

### Decision #14: Canary Test with 10 Iterations
**Issue:** Gap #3 - Canary percentage accuracy (proposed 10,000 iterations)
**Decision:** 14D - Use 10 iterations only (user preference, trade-off: tests basic logic, won't catch statistical bugs)
**Time Impact:** 0h (already in Phase 8)

### Decision #15: Auto-Rollback Integration Test
**Issue:** Gap #2 - Auto-rollback doesn't actually rollback
**Decision:** 15A - Add tests/feature_flags_auto_rollback_test.py
**Time Impact:** +2h to Phase 8

---

## Performance Review Results (Section 4/4 Complete)

### Decision #16: Staged Bootstrap Loading (90% Token Savings)
**Issue:** Eager-loading all 27 agents wastes 70% tokens (only 6-9 needed per pipeline)
**Decision:** 16B - 2-stage bootstrap: Stage 1 (1.6K tokens pre-audit) → Stage 2 (load pipeline-specific agents)
**Rationale:** User selected Option B for cleaner separation (vs Option A lazy-load after routing)
**Savings:** 30K → 3-6K tokens (80-90% reduction)
**Time Impact:** +3h to Phase 0

### Decision #17: CSV/YAML Metadata Caching
**Issue:** ROUTING_TABLE.csv, METADATA.yaml parsed on every task (440ms + 4 file reads wasted)
**Decision:** 17A - In-memory cache with file hash invalidation
**Savings:** 440ms per task, 99.9% cache hit rate
**Time Impact:** +4h to Phase 1

### Decision #18: Token Counting Memoization
**Issue:** Agent files re-tokenized on every validation (67s/day wasted)
**Decision:** 18A - Persistent .token_cache.json with SHA256 keying
**Savings:** 95% cache hit rate, 66s/day saved in production
**Time Impact:** +3h to Phase 0

### Decision #19: Skills Directory Lazy Loading
**Issue:** 461MB skills directory (54 skills, ~60K tokens/agent if fully loaded)
**Decision:** 19A - Compress _registry.json (14K → 5K tokens), lazy-load skill content on-demand
**Savings:** 69K tokens per agent dispatch
**Time Impact:** +6h to Phase 3

### Decision #20: RAM Budget Enforcement
**Issue:** No eviction policy for ram/ (51K tokens current, 250K+ potential)
**Decision:** 20A - Hard limit 15K tokens/agent, LRU eviction, task-level cleanup
**Savings:** Prevents 200K+ token accumulation
**Time Impact:** +4h to Phase 7

### Decision #21: Batch Token Validation
**Issue:** enforce_l2_limit.sh runs 27× in loop (5-15s wasted)
**Decision:** 21A - Single Python process validates all agents at once
**Savings:** 3-13 seconds
**Time Impact:** +1h to Phase 3

### Decision #22: Git-First Rollback Strategy
**Issue:** cp -r copies 200+ files recursively (5-10s in critical failure path)
**Decision:** 22A - Use git reset --hard (atomic, <1s)
**Savings:** 4-9 seconds in emergency rollback
**Time Impact:** +1h to Phase 0

### Decision #23: Feature Flags Environment Cache
**Issue:** feature_flags.yaml read 27× per task (270-1350ms wasted)
**Decision:** 23A - Cache in $FEATURE_FLAGS_CACHE env var
**Savings:** 96% reduction in file reads (26/27 eliminated)
**Time Impact:** +2h to Phase 8

### Decision #24: Hybrid Quick-Ref Files
**Issue:** Splitting BEST_PRACTICES into 15 files creates HDD seek penalty (140-420ms)
**Decision:** 24A - Create 2 files instead: QUICK_REF.md (90% use cases) + DETAILED.md (grep by section)
**Savings:** 15 random seeks → 1 sequential read
**Time Impact:** +3h to Phase 4

### Finding: No N+1 Query Patterns
**Agent #1 report:** Framework uses parallel execution, single-file registries, lazy loading. No N+1 issues found.
**Time Impact:** 0h

---

## Final Updated Timeline

| Phase | After Tests | Performance Additions | Final | Total Change |
|-------|-------------|----------------------|-------|--------------|
| **Phase 0** | 8h | +3h (16B) +3h (18A) +1h (22A) +2h (23A alt) | **15h** | +11h |
| **Phase 1** | 14h | +4h (17A) | **18h** | +10h |
| **Phase 2** | 13h | - | **13h** | +1h |
| **Phase 3** | 22h | +6h (19A) +1h (21A) | **29h** | +13h |
| **Phase 4** | 13h | +3h (24A) | **16h** | +6h |
| **Phase 5** | 6h | - | **6h** | 0h |
| **Phase 6** | 5h | - | **5h** | +1h |
| **Phase 7** | 5h | +4h (20A) | **9h** | +4h |
| **Phase 8** | 14h | - (23A already counted in Phase 0) | **14h** | +10h |
| **TOTAL** | **95h** | **+27h** | **122h** | **+50h from 72h baseline** |

**Realistic estimate with 30% buffer:** 122h × 1.3 = **159 hours (~20 days full-time or 4 weeks)**

---

## New Code Requirements (Performance Optimizations)

### 6. Staged Bootstrap (Phase 0 - Decision 16B)
```python
# core/boot/BOOTSTRAP.md

## Stage 1: Pre-Audit Bootstrap (1.6K tokens)
bootstrap_stage1 = {
    'core/boot/BOOTSTRAP.md': 300,
    'core/boot/NASH_RULES.md': 200,
    'agents/core/tung-diag.md': 500,  # Audit orchestrator only
    'core/metadata/METADATA.yaml': 800  # Routing table
}

## Stage 2: Post-Routing Agent Load (1.5-4.5K tokens)
def load_pipeline_agents(pipeline_id):
    pipeline = get_pipeline_metadata(pipeline_id)
    agents = []
    agents.extend(pipeline['thesis_agents'])
    agents.extend(pipeline['anti_thesis_agents'])
    agents.append(pipeline['synthesis_agent'])

    # Load only 6-9 agents (vs all 27)
    return [read_file(f"agents/{agent}.md") for agent in agents]
```

### 7. Metadata Cache (Phase 1 - Decision 17A)
```python
# system/metadata_cache.py
import hashlib
from datetime import datetime, timedelta

class MetadataCache:
    def __init__(self):
        self._cache = {}
        self._ttl = timedelta(hours=24)

    def _get_file_hash(self, filepath):
        with open(filepath, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()

    def get_or_parse(self, filepath, parser_func):
        cache_key = filepath

        if cache_key in self._cache:
            entry = self._cache[cache_key]
            current_hash = self._get_file_hash(filepath)
            if current_hash == entry['file_hash'] and \
               datetime.now() - entry['timestamp'] < self._ttl:
                return entry['data']

        # Cache miss
        parsed_data = parser_func(filepath)
        self._cache[cache_key] = {
            'data': parsed_data,
            'file_hash': self._get_file_hash(filepath),
            'timestamp': datetime.now()
        }
        return parsed_data
```

### 8. Token Counting Memoization (Phase 0 - Decision 18A)
```python
# scripts/measure_tokens.py
import tiktoken, hashlib, json, os

class TokenCounter:
    def __init__(self):
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.cache = self._load_cache()

    def _load_cache(self):
        if os.path.exists(".token_cache.json"):
            return json.load(open(".token_cache.json"))
        return {}

    def count_tokens(self, filepath):
        file_hash = hashlib.sha256(open(filepath, 'rb').read()).hexdigest()
        cache_key = f"{filepath}:{file_hash}"

        if cache_key in self.cache:
            return self.cache[cache_key]

        tokens = len(self.encoding.encode(open(filepath).read()))
        self.cache[cache_key] = tokens
        json.dump(self.cache, open(".token_cache.json", 'w'))
        return tokens
```

### 9. Skills Registry Compression (Phase 3 - Decision 19A)
```python
# Before: _registry.json (1,405 lines, 14K tokens)
{
  "id": "code-review-excellence",
  "description": "Two-pass code review (CRITICAL → INFORMATIONAL)...",  # 200 tokens
  "tags": ["review", "qa", "backend", "frontend", "security"]
}

# After: Compressed registry (200 lines, 5K tokens)
{
  "id": "code-review-excellence",
  "desc": "2-pass review: SQL/LLM/side-effects",  # 10 tokens
  "tags": ["review", "qa"],  # top 2 only
  "path": "ram/skills/code-review-excellence/SKILL.md"
}
```

### 10. RAM Budget Enforcement (Phase 7 - Decision 20A)
```python
# system/RAM_EVICTION_PROTOCOL.md
from collections import OrderedDict

class RAMCache:
    def __init__(self, max_tokens=15000):
        self.cache = OrderedDict()
        self.current_tokens = 0
        self.max_tokens = max_tokens

    def load(self, path):
        if path in self.cache:
            self.cache.move_to_end(path)  # LRU
            return self.cache[path][0]

        content = read_file(path)
        tokens = count_tokens(content)

        # Evict oldest until fits
        while self.current_tokens + tokens > self.max_tokens:
            oldest_path, (_, oldest_tokens) = self.cache.popitem(last=False)
            self.current_tokens -= oldest_tokens

        self.cache[path] = (content, tokens)
        self.current_tokens += tokens
        return content
```

### 11. Batch Token Validation (Phase 3 - Decision 21A)
```bash
# scripts/enforce_l2_limit_batch.sh
python3 - agents/**/*.md << 'PYTHON'
import sys, tiktoken

enc = tiktoken.get_encoding("cl100k_base")
violations = []

for filepath in sys.argv[1:]:
    tokens = len(enc.encode(open(filepath).read()))
    if tokens > 500:
        violations.append(f"{filepath}: {tokens} tokens")

if violations:
    print(f"FAIL: {len(violations)} violations")
    sys.exit(1)
else:
    print(f"PASS: {len(sys.argv)-1} agents validated")
PYTHON
```

### 12. Git-First Rollback (Phase 0 - Decision 22A)
```bash
# scripts/rollback.sh
if git diff --quiet HEAD; then
  git reset --hard "pre-refactor-$(date +%Y%m%d)"
else
  echo "ERROR: Uncommitted changes. Stash first."
  exit 1
fi
```

### 13. Feature Flags Env Cache (Phase 8 - Decision 23A)
```bash
# In BOOTSTRAP.md
if [ -z "$FEATURE_FLAGS_CACHE" ]; then
  export FEATURE_FLAGS_CACHE=$(python3 -c "
import yaml, json
print(json.dumps(yaml.safe_load(open('core/feature_flags.yaml'))))
")
fi
```

### 14. Hybrid Quick-Ref Files (Phase 4 - Decision 24A)
```bash
# Instead of 15 files:
system/advanced/BEST_PRACTICES_QUICK_REF.md   # 100 lines, 90% use cases
system/advanced/BEST_PRACTICES_DETAILED.md    # 779 lines, grep by section
```

---

## Remaining Tasks

- [ ] Generate NOT in scope section
- [ ] Generate What already exists section
- [ ] Generate final refactor plan v2 (incorporate all 24 decisions)

---

## References

- **Full plan:** `artifacts/refactor/DIRECTORY_RESTRUCTURE_PLAN.md` (gitignored)
- **THESIS:** `artifacts/refactor/THESIS_COMPREHENSIVE_REFACTOR_STRATEGY.md` (Phúc SA)
- **ANTI-THESIS:** `artifacts/refactor/ANTI_THESIS_REFACTOR_CRITIQUE.md` (Mộc)
- **Nash debate summary:** See conversation 2026-03-16

---

**Status:** 4/4 review sections complete (Architecture, Code Quality, Tests, Performance)
- Architecture: 6 issues resolved
- Code Quality: 5 issues resolved
- Tests: 3 critical gaps resolved
- Performance: 10 issues resolved (9 optimizations + 1 no-action)

**Total decisions:** 24 (1A-15A, 16B, 17A-24A)
**Next:** Generate final refactor plan v2
**Updated by:** Dũng PM (SYNTHESIS agent)
**Date:** 2026-03-16
