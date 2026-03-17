# JSON Schemas Reference

Canonical schemas for all JSON files used in testing/evaluation pipeline.

---

## evals.json

Test case definitions. Created at start of testing phase.

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "User's task prompt (realistic, with details)",
      "expected_output": "Description of what should be produced",
      "files": [
        {"path": "inputs/data.csv", "description": "Optional: input files needed"}
      ],
      "assertions": [
        {
          "name": "output_contains_all_rows",
          "description": "Check that output CSV has same row count as input",
          "check": "programmatic or manual"
        }
      ]
    }
  ]
}
```

**Fields:**
- `id`: Unique integer identifier
- `prompt`: The actual task user would type (be realistic!)
- `expected_output`: Human-readable description (not used programmatically)
- `files`: Optional array of input files
- `assertions`: Array of checks (can be empty initially, filled in during Step 3.3)

---

## eval_metadata.json

Per-test-case metadata. Created in each eval directory.

```json
{
  "eval_id": 1,
  "eval_name": "descriptive-name-here",
  "prompt": "The user's task prompt",
  "assertions": [
    {
      "name": "output_contains_all_rows",
      "description": "Check that output CSV has same row count as input"
    }
  ]
}
```

**Location:** `<workspace>/iteration-N/eval-<ID>-<name>/eval_metadata.json`

**Fields:**
- `eval_name`: Descriptive name (not just "eval-0") - used for directory naming
- `assertions`: Same format as evals.json, but just for this eval

---

## timing.json

Timing data from task notification. Save immediately when task completes.

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

**Location:** `<workspace>/iteration-N/eval-<ID>-<name>/<config>/timing.json`

Where `<config>` is `with_skill`, `without_skill`, or `old_skill`.

**Critical:** This data only appears in task notification - save it immediately!

---

## grading.json

Assertion evaluation results. Created by grader agent after outputs are ready.

```json
{
  "eval_id": 1,
  "eval_name": "descriptive-name",
  "run_config": "with_skill",
  "expectations": [
    {
      "text": "Output contains all input rows",
      "passed": true,
      "evidence": "Input: 127 rows, Output: 127 rows"
    },
    {
      "text": "Chart has axis labels",
      "passed": false,
      "evidence": "Screenshot shows X-axis unlabeled"
    }
  ],
  "overall_pass": false,
  "notes": "2/3 assertions passed"
}
```

**Location:** `<workspace>/iteration-N/eval-<ID>-<name>/<config>/grading.json`

**IMPORTANT:** The viewer expects these exact field names:
- `expectations[].text` (not `name`)
- `expectations[].passed` (not `met`)
- `expectations[].evidence` (not `details`)

---

## benchmark.json

Aggregated results across all test cases. Created by `aggregate_benchmark.py`.

```json
{
  "skill_name": "example-skill",
  "iteration": 1,
  "timestamp": "2026-03-16T10:30:00Z",
  "configurations": [
    {
      "name": "with_skill",
      "label": "With Skill",
      "results": [
        {
          "eval_id": 1,
          "eval_name": "chart-generation",
          "passed": true,
          "pass_rate": 0.67,
          "total_tokens": 84852,
          "duration_seconds": 23.3,
          "assertions": [
            {"text": "Output contains all rows", "passed": true},
            {"text": "Chart has axis labels", "passed": false}
          ]
        }
      ],
      "aggregate": {
        "overall_pass_rate": 0.67,
        "mean_tokens": 85000,
        "stddev_tokens": 1500,
        "mean_duration_seconds": 23.5,
        "stddev_duration_seconds": 0.8
      }
    },
    {
      "name": "without_skill",
      "label": "Baseline (No Skill)",
      "results": [...],
      "aggregate": {...}
    }
  ],
  "comparison": {
    "pass_rate_delta": 0.33,
    "tokens_delta": -5000,
    "duration_delta": -2.1,
    "interpretation": "Skill improved pass rate by 33pp, used 5K fewer tokens, 2.1s faster"
  }
}
```

**Location:** `<workspace>/iteration-N/benchmark.json`

**Ordering:** Put each `with_skill` version BEFORE its baseline counterpart for viewer display.

---

## feedback.json

User feedback from eval viewer. Downloaded when user clicks "Submit All Reviews".

```json
{
  "reviews": [
    {
      "run_id": "eval-0-chart-gen-with_skill",
      "feedback": "chart is missing axis labels",
      "timestamp": "2026-03-16T10:45:23Z"
    },
    {
      "run_id": "eval-1-data-transform-with_skill",
      "feedback": "",
      "timestamp": "2026-03-16T10:46:01Z"
    },
    {
      "run_id": "eval-2-report-gen-with_skill",
      "feedback": "perfect, love the formatting",
      "timestamp": "2026-03-16T10:47:15Z"
    }
  ],
  "status": "complete"
}
```

**Location:**
- Claude Code: `<workspace>/iteration-N/feedback.json` (auto-saved by viewer server)
- Cowork/headless: `~/Downloads/feedback.json` (user downloads, you copy it)

**Empty feedback** means user thought it was fine.

---

## trigger_eval.json

Trigger accuracy evaluation queries. Used for description optimization.

```json
[
  {
    "query": "ok so my boss sent me this xlsx (in downloads, Q4_sales_final_v2.xlsx) and wants profit margin % added. revenue is col C, costs col D",
    "should_trigger": true
  },
  {
    "query": "can you help me understand what this python script does? it's in ~/code/analyze.py",
    "should_trigger": false
  }
]
```

**Characteristics:**
- Realistic (something user would actually type)
- Concrete details (file paths, column names, context)
- Mix of lengths and phrasings
- Should-not-trigger = near-misses (shares keywords but needs different tool)

---

## description_optimization_result.json

Output from `run_loop.py` description optimization.

```json
{
  "best_description": "Updated description text with improved triggering accuracy. Use this whenever user mentions X, Y, or Z...",
  "best_iteration": 3,
  "scores": {
    "train": {
      "precision": 0.92,
      "recall": 0.88,
      "f1": 0.90
    },
    "test": {
      "precision": 0.89,
      "recall": 0.85,
      "f1": 0.87
    }
  },
  "iterations": [
    {
      "iteration": 1,
      "description": "Original description...",
      "train_score": 0.75,
      "test_score": 0.72
    },
    {
      "iteration": 2,
      "description": "Improved description...",
      "train_score": 0.85,
      "test_score": 0.83
    },
    {
      "iteration": 3,
      "description": "Best description...",
      "train_score": 0.90,
      "test_score": 0.87
    }
  ]
}
```

**Selection:** `best_description` chosen by **test score**, not train score (avoids overfitting).

---

## Directory Structure Example

```
example-skill-workspace/
├── iteration-1/
│   ├── eval-0-chart-generation/
│   │   ├── eval_metadata.json
│   │   ├── with_skill/
│   │   │   ├── outputs/
│   │   │   │   └── chart.png
│   │   │   ├── timing.json
│   │   │   └── grading.json
│   │   └── without_skill/
│   │       ├── outputs/
│   │       ├── timing.json
│   │       └── grading.json
│   ├── eval-1-data-transform/
│   │   └── [same structure]
│   ├── benchmark.json
│   └── feedback.json
├── iteration-2/
│   └── [same structure, plus --previous-workspace reference]
└── skill-snapshot/
    └── [old version of skill for baseline comparison]
```

---

## Validation Rules

**evals.json:**
- Each eval must have unique `id`
- `prompt` cannot be empty
- `assertions` can be empty initially (filled during testing)

**grading.json:**
- `expectations` array must use `text`, `passed`, `evidence` (exact names for viewer)
- `overall_pass` = true only if ALL assertions pass

**benchmark.json:**
- `configurations` array must have with_skill version BEFORE baseline
- `aggregate` stats must include mean and stddev for tokens and duration
- `comparison.interpretation` should be human-readable summary

**timing.json:**
- Must be saved immediately when task completes (data not persisted elsewhere)
- `total_duration_seconds` = `duration_ms / 1000`

---

## Common Mistakes

❌ **grading.json uses `name` instead of `text`**
→ Viewer will break. Must be `text`.

❌ **Assertions empty in evals.json**
→ OK initially, but must be filled before grading step.

❌ **benchmark.json configurations in wrong order**
→ Viewer expects with_skill BEFORE baseline.

❌ **feedback.json not found**
→ In Cowork, it downloads to ~/Downloads, not workspace. Copy it manually.

❌ **timing.json missing**
→ Must save immediately from task notification, can't recover later.

---

**Reference these schemas when implementing scripts or debugging viewer issues.**
