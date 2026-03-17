# BOOTSTRAP Implementation Examples

## Stage 1: Pre-Audit Bootstrap

```python
# Step 1: Load bootstrap essentials
bootstrap_files = [
    'core/boot/BOOTSTRAP.md',
    'core/boot/NASH_RULES.md',
]

# Step 2: Load audit orchestrator only (NOT all 27 agents)
audit_agent = load_agent('agents/core/tung-diag.md')

# Step 3: Load routing metadata (cached via Decision 17A)
metadata = load_metadata_cached('core/metadata/METADATA.yaml')

# STOP HERE - Do NOT load pipeline agents yet
```

## Stage 2: Post-Routing Agent Load

```python
def load_pipeline_agents(pipeline_id):
    """
    Load agents for specific pipeline (Decision 16B).

    Args:
        pipeline_id: Pipeline number (1-8)

    Returns:
        dict: Agent profiles {agent_id: content}
    """
    # Get pipeline metadata from cached METADATA.yaml
    pipeline = get_pipeline_metadata(pipeline_id)  # Decision 17A cache

    # Collect agent IDs needed
    agents_needed = []
    agents_needed.extend(pipeline['thesis_agents'])      # 2-3 agents
    agents_needed.extend(pipeline['anti_thesis_agents']) # 2-3 agents
    agents_needed.append(pipeline['synthesis_agent'])    # 1 agent

    # Load ONLY these 6-9 agents (NOT all 27)
    loaded_agents = {}
    for agent_id in agents_needed:
        agent_meta = get_agent_metadata(agent_id)  # From METADATA.yaml
        loaded_agents[agent_id] = read_file(agent_meta['l2_path'])

    return loaded_agents  # 6-9 agents × 500 tokens = 3,000-4,500 tokens
```

## Decision 2A: CSV Validator + Fallback

```python
def load_metadata_cached(filepath):
    """
    Load METADATA.yaml with validation and fallback.
    Integrates Decision 2A (CSV validator) + Decision 17A (caching).
    """
    try:
        # Try loading from cache first (Decision 17A)
        metadata = metadata_cache.get_or_parse(filepath, yaml.safe_load)

        # Validate schema version
        if metadata.get('schema_version') != '2.0':
            raise SchemaError(f"Invalid schema version: {metadata.get('schema_version')}")

        return metadata
    except (yaml.YAMLError, SchemaError) as e:
        log_error(f"METADATA.yaml failed: {e}")
        alert_developer("Metadata broken, using fallback prose routing")

        # Fallback to old system/MIXTURE_OF_EXPERTS_ROUTER.md
        return load_prose_router('system/MIXTURE_OF_EXPERTS_ROUTER.md')
```

## Decision 3A: RAM Depth Limit

```python
MAX_RAM_DEPTH = 3

def load_ram(path, depth=0, loaded_paths=None):
    """
    Load RAM file with depth limit and cycle detection.

    Raises:
        RAMDepthError: If depth > MAX_RAM_DEPTH
        RAMCycleError: If circular dependency detected
    """
    if loaded_paths is None:
        loaded_paths = set()

    # Check depth limit
    if depth > MAX_RAM_DEPTH:
        raise RAMDepthError(
            f"RAM depth exceeded at {path}\n"
            f"Maximum depth: {MAX_RAM_DEPTH}\n"
            f"Current depth: {depth}\n"
            f"Path chain: {' → '.join(loaded_paths)}"
        )

    # Check circular dependency
    if path in loaded_paths:
        cycle_path = ' → '.join(list(loaded_paths) + [path])
        raise RAMCycleError(
            f"Circular dependency detected:\n{cycle_path}"
        )

    loaded_paths.add(path)

    # Load file content
    content = read_file(path)

    # Extract RAM references (e.g., "ram/agents/phuc-sa/patterns.md")
    ram_refs = extract_ram_references(content)

    # Recursively load with depth+1
    loaded_ram = {}
    for ref in ram_refs:
        loaded_ram[ref] = load_ram(ref, depth + 1, loaded_paths.copy())

    return content, loaded_ram
```

## Decision 6A: docs/ On-Demand Policy

```python
def handle_agent_question(question, agent_id):
    """
    Load docs/ on-demand for agent learning scenarios.
    Never preloaded. 2K token limit per excerpt.
    """
    # Only trigger for learning questions
    if not is_learning_question(question):
        return None

    # Match question to relevant doc
    doc_path = match_question_to_doc(question)

    # Only allow docs/ directory
    if not doc_path.startswith("docs/"):
        return None

    # Load with 2K token limit
    content = read_file(doc_path, max_tokens=2000)

    log(f"Agent {agent_id} loaded {doc_path} (on-demand, 2K limit)")
    return content

def is_learning_question(question):
    """Check if question is learning-oriented."""
    triggers = [
        "how to", "what is", "explain", "tutorial",
        "example of", "how do i", "show me how"
    ]
    return any(trigger in question.lower() for trigger in triggers)
```

## Decision 23A: Feature Flags Environment Cache

```bash
# Feature flags cached in environment variable (not re-read 27×)
if [ -z "$FEATURE_FLAGS_CACHE" ]; then
  export FEATURE_FLAGS_CACHE=$(python3 -c "
import yaml, json
with open('core/feature_flags.yaml') as f:
  print(json.dumps(yaml.safe_load(f)))
")
fi

# Sub-agents read from env var (no file I/O)
def get_feature_flag(flag_name):
    import os, json
    flags = json.loads(os.environ.get('FEATURE_FLAGS_CACHE', '{}'))
    return flags.get(flag_name, False)
```

## Token Budget Validation

```python
def validate_bootstrap_budget():
    """
    Ensure bootstrap stays within 6,100 token budget.
    Called after Stage 2 loading.
    """
    stage1_tokens = count_tokens([
        'core/boot/BOOTSTRAP.md',
        'core/boot/NASH_RULES.md',
        'agents/core/tung-diag.md',
        'core/metadata/METADATA.yaml'
    ])

    stage2_tokens = count_tokens(loaded_pipeline_agents)

    total = stage1_tokens + stage2_tokens

    if total > 6100:
        raise BootstrapBudgetExceeded(
            f"Bootstrap budget exceeded: {total} > 6100 tokens\n"
            f"Stage 1: {stage1_tokens} tokens\n"
            f"Stage 2: {stage2_tokens} tokens"
        )

    log(f"Bootstrap budget OK: {total}/6100 tokens ({total/6100*100:.1f}%)")
```

## Error Handling

```python
class BootstrapError(Exception):
    """Base exception for bootstrap failures."""
    pass

class RAMDepthError(BootstrapError):
    """RAM loading exceeded MAX_RAM_DEPTH."""
    pass

class RAMCycleError(BootstrapError):
    """Circular dependency in RAM references."""
    pass

class BootstrapBudgetExceeded(BootstrapError):
    """Bootstrap token budget exceeded 6,100 limit."""
    pass

class MetadataValidationError(BootstrapError):
    """METADATA.yaml schema validation failed."""
    pass
```

## Feature Flag Rollout

```yaml
# core/feature_flags.yaml
enable_staged_bootstrap:
  current_value: false
  rollout_plan:
    week_1: canary_10pct    # 10% of tasks use new bootstrap
    week_2: canary_50pct    # 50% of tasks
    week_3: true            # 100% rollout
  auto_rollback:
    trigger: 0.05           # Rollback if >5% error rate
    alert: "#incidents"
```

**Usage:**
```python
if get_feature_flag('enable_staged_bootstrap', task_id):
    # New: 2-stage bootstrap
    bootstrap_stage1()
    pipeline = run_audit_and_route()
    bootstrap_stage2(pipeline)
else:
    # Old: Load all 27 agents
    bootstrap_legacy()
```
