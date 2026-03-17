---
name: agent-skill-sharpener
version: 1.0.0
description: |
  Automatically sharpen agent skills by mining PEN/WIN entries from agent files,
  converting past failures into regression tests, and iteratively improving
  agent capabilities. Use when you want to strengthen an agent based on
  production failures (PEN entries), successful patterns (WIN entries), or
  LEDGER scoring data. More targeted than generic skill creation - focuses
  on fixing known weaknesses and amplifying proven strengths.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - TodoWrite
---

# Agent Skill Sharpener
## Mine Production Failures → Auto-Generate Tests → Sharpen Skills

**Philosophy:** You are not a generic skill builder. You are a **master craftsman sharpening blades after battle**. Each PEN entry is a scar - evidence of what cut the agent. Each WIN entry is a technique that worked. Your job: extract patterns, create tests the agent FAILED before, iterate until sharp. Don't just add rules - **make the agent unable to repeat past mistakes**.

---

## Core Workflow

Track progress in TodoList:

```
Phase 1: Agent Analysis (Extract Skills + PEN/WIN Mining)
Phase 2: Auto-Generate Evals from PEN Entries
Phase 3: Baseline Test (Run Current Agent Against Failure Cases)
Phase 4: Sharpen Skills (Iterative Enhancement)
Phase 5: Cross-Validation & Update Agent File
```

---

## Phase 1: Agent Analysis

### Step 1.1: Understand the Request

**If user provides agent file path:**
```bash
# Example: /sharpen agents/core/phuc-sa.md
```

Read the agent file and identify structure:
- Role + Model
- PEN entries (Hard Constraints from past mistakes)
- WIN entries (Successful patterns to repeat)
- Kỹ Năng Cốt Lõi (Core Skills)
- reference_Memory links (tmp/ram/{agent}/*.md)
- Tool references

**If user provides LEDGER path additionally:**
Read artifacts/{task}/LEDGER.md for:
- Recent P0/P1/P2 penalties
- Patterns in scoring (what agent consistently gets penalized for)
- Timestamps (prioritize recent failures)

**Ask user:**
1. "Which skills should I focus on?" (or "all skills" for comprehensive sharpening)
2. "Do you have conversation transcripts I should analyze?" (optional)
3. "Target: fix known failures (PEN-focused) or optimize all skills (comprehensive)?"

**Default:** PEN-focused (highest ROI - fix known production failures first)

### Step 1.2: Extract Agent Profile

Parse agent file into structured profile:

```json
{
  "agent_name": "phuc-sa",
  "role": "Software Architect / Backend Lead",
  "model": "Sonnet",
  "pen_entries": [
    {
      "id": "PEN-001",
      "date": "2026-02-28",
      "task_ref": "T2_27",
      "incident": "Không cung cấp đủ context codebase cho Mộc → Mộc tìm 9 HIGH issues tại P6 iter-1",
      "principle": "Khi gọi reviewer (Mộc/Xuân), PHẢI đính kèm đầy đủ file liên quan — thiếu context = tự tạo FAIL",
      "status": "ACTIVE",
      "affected_skill": "Code Review Coordination",
      "severity": "P0"
    },
    {
      "id": "PEN-002",
      "date": "2026-02-28",
      "task_ref": "T2_26",
      "incident": "Bỏ sót NOBYPASSRLS trong RLS policy",
      "principle": "Mọi bảng multi-tenant PHẢI có role NON-superuser với NOBYPASSRLS — superuser luôn bypass RLS",
      "status": "ACTIVE",
      "affected_skill": "PostgreSQL Schema Design",
      "severity": "P0"
    }
  ],
  "win_entries": [
    {
      "id": "WIN-001",
      "task_ref": "T1_13",
      "principle": "ARCHITECTURE_ABSTRACT.md (~150L) giúp Xuân P1.6.5 đọc nhanh hơn → tiết kiệm token, tăng tốc gate",
      "affected_skill": "Architecture Documentation",
      "value": "60% token savings for reviewer"
    }
  ],
  "core_skills": [
    "Architecture Design",
    "Schema Design (PostgreSQL + Prisma)",
    "Contract Drafting (API + Events + Errors)",
    "Code Review Synthesis",
    "RLS Policy Design"
  ],
  "reference_memory": [
    "tmp/ram/phuc-sa/modules.md",
    "tmp/ram/phuc-sa/arch-lessons.md"
  ],
  "tools": ["Write", "pg-aiguide MCP tools"],
  "skills_referenced": [
    ".agents/skills/code-review-excellence/SKILL.md",
    ".agents/skills/bug-triage/SKILL.md"
  ]
}
```

**Save to:** `sharpening-workspace/{agent-name}/agent-profile.json`

**Show user:** Summary table

```
Agent: Phúc SA (Software Architect)
PEN Entries: 2 ACTIVE (2 P0, 0 P1, 0 P2)
WIN Entries: 1
Core Skills: 5 identified
Reference Memory: 2 files
Skills Referenced: 2 external
```

### Step 1.3: Prioritize Sharpening Targets

**Scoring system:**

| Factor | Weight | Logic |
|--------|--------|-------|
| **Severity** | 5x | P0 = 50 pts, P1 = 30 pts, P2 = 15 pts, P3 = 5 pts |
| **Recency** | 3x | Last 7 days = 30 pts, 8-30 days = 20 pts, 31-90 days = 10 pts, >90 days = 5 pts |
| **Status** | 2x | ACTIVE = 20 pts, RESOLVED = 5 pts |
| **Repeat pattern** | 4x | Multiple PENs for same skill = 40 pts |

**Sort PEN entries by total score → highest priority first.**

**Show user:**

```
Sharpening Priority:

1. [96 pts] PEN-001: Code Review Coordination (P0, 18 days ago, ACTIVE)
   → "Không cung cấp đủ context cho Mộc"
   → Will create regression test + add file checklist

2. [96 pts] PEN-002: PostgreSQL Schema Design (P0, 18 days ago, ACTIVE)
   → "Bỏ sót NOBYPASSRLS trong RLS policy"
   → Will create regression test + add schema validation table

Estimated: 2 core skill enhancements, 4-6 regression tests
```

Ask user: "Proceed with these priorities? (or specify custom focus)"

---

## Phase 2: Auto-Generate Evals from PEN Entries

**Key insight:** Each PEN entry = 1 test case the agent FAILED in production.

### Step 2.1: Convert PEN → Realistic Eval Prompt

**For each PEN entry**, use this template:

```markdown
## PEN Entry Analysis

**ID:** PEN-001
**Incident:** Không cung cấp đủ context codebase cho Mộc → Mộc tìm 9 HIGH issues
**Principle:** Khi gọi reviewer (Mộc/Xuân), PHẢI đính kèm đầy đủ file liên quan

## Eval Prompt Generation

**Scenario that would trigger same failure:**

You are Phúc SA working on the "User Authentication" module for STMAI.

You've just finished:
- ARCHITECTURE.md (system design with authentication flow diagram)
- schema.prisma (User, Session, RefreshToken tables with RLS policies)
- CONTRACT_DRAFT.md (API contracts for login/logout/refresh endpoints)

The design looks good to you. Now call Mộc (architectural reviewer) to challenge your design before proceeding to implementation.

**What agent should do (correct behavior):**
- Attach ARCHITECTURE.md to reviewer call
- Attach schema.prisma to reviewer call
- Attach CONTRACT_DRAFT.md to reviewer call
- Provide summary of design for context

**What agent DID (past failure - PEN-001):**
- Called reviewer without attaching files
- Mộc had incomplete context → found 9 false HIGH issues
- Wasted iteration cycle

## Assertions

{
  "assertions": [
    {
      "name": "reviewer_call_includes_architecture_file",
      "type": "must_pass",
      "check": "Tool call to Task/Mộc includes ARCHITECTURE.md as attachment or file content",
      "rationale": "PEN-001: Missing context files = incomplete review"
    },
    {
      "name": "reviewer_call_includes_schema_file",
      "type": "must_pass",
      "check": "Tool call includes schema.prisma",
      "rationale": "PEN-001: Schema is critical for RLS/data model review"
    },
    {
      "name": "reviewer_call_includes_contract_draft",
      "type": "must_pass",
      "check": "Tool call includes CONTRACT_DRAFT.md",
      "rationale": "PEN-001: API contracts needed for interface review"
    },
    {
      "name": "no_premature_reviewer_call",
      "type": "should_pass",
      "check": "Agent does NOT call reviewer before all 3 files exist",
      "rationale": "Prevent calling reviewer with incomplete artifacts"
    }
  ]
}
```

**Save to:** `sharpening-workspace/{agent}/evals/pen-001-reproduction.json`

### Step 2.2: Create Synthetic Variations (Cross-Validation)

For each PEN eval, create 1-2 **synthetic variations** with:
- Different module name (Auth → Billing, User Mgmt → Inventory)
- Different file types (ARCHITECTURE.md → SEQUENCE_DIAGRAM.md, schema.prisma → data-model.yaml)
- Similar underlying pattern (must attach files to reviewer)

**Why:** Prevent overfitting. Agent should learn the PATTERN, not memorize specific files.

### Step 2.3: Create WIN Validation Evals

For each WIN entry, create validation test:

```markdown
## WIN Entry: WIN-001

**Pattern:** ARCHITECTURE_ABSTRACT.md (~150L) saves Xuân 60% tokens

**Eval Prompt:**

You are Phúc SA. You've finished ARCHITECTURE.md (450 lines) for the Payment Gateway module.

Now you need to prepare for gate review by Xuân. Xuân needs to understand the architecture quickly.

**Expected behavior (WIN-001):**
- Create ARCHITECTURE_ABSTRACT.md (~150 lines)
- Include: System boundary, key components, data flow, external deps
- Reference full ARCHITECTURE.md for details

**Assertions:**
{
  "assertions": [
    {
      "name": "abstract_file_created",
      "type": "must_pass",
      "check": "ARCHITECTURE_ABSTRACT.md exists"
    },
    {
      "name": "abstract_is_concise",
      "type": "should_pass",
      "check": "ARCHITECTURE_ABSTRACT.md is 100-200 lines (not full copy)"
    },
    {
      "name": "abstract_includes_key_sections",
      "type": "must_pass",
      "check": "Contains: system boundary, components, data flow, dependencies"
    }
  ]
}
```

**Purpose:** Ensure sharpening doesn't BREAK what already works.

### Step 2.4: Aggregate Evals JSON

Combine all evals into `evals/evals.json`:

```json
{
  "agent_name": "phuc-sa",
  "sharpening_session": "2026-03-16",
  "evals": [
    {
      "id": "pen-001-reproduction",
      "type": "regression",
      "source": "PEN-001",
      "prompt": "...",
      "setup_files": {
        "ARCHITECTURE.md": "# User Auth\n...",
        "schema.prisma": "model User {...}",
        "CONTRACT_DRAFT.md": "## API Contracts\n..."
      },
      "assertions": [...]
    },
    {
      "id": "pen-001-variant-billing",
      "type": "synthetic",
      "source": "PEN-001",
      "prompt": "...",
      "setup_files": {...},
      "assertions": [...]
    },
    {
      "id": "win-001-validation",
      "type": "validation",
      "source": "WIN-001",
      "prompt": "...",
      "setup_files": {...},
      "assertions": [...]
    }
  ]
}
```

**Show user:**

```
Generated Evals:
- 2 PEN regression tests (PEN-001, PEN-002)
- 2 synthetic variations (cross-validation)
- 1 WIN validation test
Total: 5 eval cases

Ready to run baseline?
```

---

## Phase 3: Baseline Test

### Step 3.1: Run Current Agent Against Evals

Create workspace: `sharpening-workspace/{agent}/iteration-0-baseline/`

**For each eval, spawn subagent:**

```bash
# Spawn with CURRENT agent version (before sharpening)
claude --agent agents/core/phuc-sa.md --prompt "
{eval.prompt}

Setup files are in: sharpening-workspace/phuc-sa/evals/pen-001-setup/

{Additional context from eval.setup_files}
"
```

**Save outputs to:**
```
iteration-0-baseline/
├── eval-pen-001-reproduction/
│   ├── transcript.md
│   ├── tool_calls.json
│   └── outputs/
├── eval-pen-001-variant-billing/
│   └── ...
└── eval-win-001-validation/
    └── ...
```

### Step 3.2: Grade Baseline

For each eval run, check assertions:

```python
# Example: Check "reviewer_call_includes_architecture_file"
transcript = read("iteration-0-baseline/eval-pen-001-reproduction/transcript.md")
tool_calls = parse_tool_calls(transcript)

reviewer_calls = [tc for tc in tool_calls if tc.tool == "Task" and "mộc" in tc.args.lower()]

passed = any(
    "ARCHITECTURE.md" in call.args or
    "architecture.md" in call.file_attachments
    for call in reviewer_calls
)

result = {
    "assertion": "reviewer_call_includes_architecture_file",
    "passed": passed,
    "evidence": "Reviewer called at line 234, but no ARCHITECTURE.md attached" if not passed else "ARCHITECTURE.md attached at line 234"
}
```

**Aggregate baseline results:**

```json
{
  "session": "iteration-0-baseline",
  "timestamp": "2026-03-16T10:00:00Z",
  "results": {
    "pen-001-reproduction": {
      "passed": false,
      "assertions_passed": 0,
      "assertions_total": 4,
      "failures": [
        "reviewer_call_includes_architecture_file",
        "reviewer_call_includes_schema_file",
        "reviewer_call_includes_contract_draft"
      ]
    },
    "pen-002-reproduction": {
      "passed": false,
      "assertions_passed": 1,
      "assertions_total": 3
    },
    "win-001-validation": {
      "passed": true,
      "assertions_passed": 3,
      "assertions_total": 3
    }
  },
  "summary": {
    "total_evals": 5,
    "passed": 1,
    "failed": 4,
    "pass_rate": 0.20
  }
}
```

**Show user:**

```
Baseline Results (Current Agent):

PEN Regression Tests:
❌ PEN-001 reproduction: 0/4 assertions passed
   → Missing: architecture file, schema file, contract draft in reviewer call
❌ PEN-001 variant (billing): 1/4 assertions passed
❌ PEN-002 reproduction: 1/3 assertions passed

WIN Validation Tests:
✅ WIN-001 validation: 3/3 assertions passed
   → Agent correctly creates ARCHITECTURE_ABSTRACT.md

Overall: 20% pass rate (1/5 evals passed)

Expected: PEN tests should fail (these are known failures).
Good news: WIN test passed (didn't break existing success pattern).

Proceed with sharpening?
```

---

## Phase 4: Sharpen Skills (Iterative Enhancement)

### Step 4.1: Choose Enhancement Strategy

For each FAILED eval, analyze root cause and select ONE strategy:

**Strategy A: Add Prime Directive** (for high-level principles)
**Strategy B: Add Escape Hatch** (for precondition checks)
**Strategy C: Add Table/Checklist** (for completeness enforcement)
**Strategy D: Add Suppression** (for known false positives)
**Strategy E: Enhance Philosophy** (for mental model shift)

**Example for PEN-001:**

Root cause: Agent called reviewer without attaching required files.

**Why it happened:** No explicit rule about file attachment in agent instructions.

**Strategy selected:** B (Escape Hatch) + C (Table)

**Rationale:**
- Escape Hatch = prevent premature reviewer call
- Table = force completeness check before calling

### Step 4.2: Draft Skill Enhancement

**Enhancement for PEN-001:**

```markdown
## 🔧 Kỹ Năng Cốt Lõi

**Architecture Design (Pipeline 2 THESIS):**
- Vẽ ARCHITECTURE.md (System diagram, Module boundary, Data flow)
- Schema: `schema.prisma` — mọi bảng có `tenant_id` + `deleted_at` (soft delete)
- CONTRACT_DRAFT.md — đủ 6 mục: API + DTO + Mock + Errors + Events + Idempotency
- Khi xong: Tạo ARCHITECTURE_ABSTRACT.md ~150 dòng cho Xuân đọc nhanh

**BEFORE calling Mộc to challenge design:**  ← NEW (Escape Hatch)

1. **Precondition check - File Completeness:**

| Required File        | Purpose                     | Exists? | Path |
|----------------------|----------------------------|---------|------|
| ARCHITECTURE.md      | System design overview      | [ ]     | ... |
| schema.prisma        | Data model + RLS policies   | [ ]     | ... |
| CONTRACT_DRAFT.md    | API contracts (6 sections)  | [ ]     | ... |

**Rule:** ALL must have ✓ before calling Mộc. If ANY missing, **STOP** and complete it first.

**PEN-001 reminder:** Missing files = incomplete context → reviewer finds false issues → wasted iteration.

2. **Call Mộc with full context:**
   ```
   $TASK moc "Challenge this {module} architecture:

   [Attach: ARCHITECTURE.md, schema.prisma, CONTRACT_DRAFT.md]

   Focus areas: {specific concerns from design}"
   ```

**Khi gọi Mộc để Challenge:**  ← UPDATED (reinforced)
- Cung cấp: ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md đầy đủ
- KHÔNG gọi Mộc với incomplete artifacts → PEN-001 ACTIVE
```

**Show user the diff:**

```diff
**Khi gọi Mộc để Challenge:**
- Cung cấp: ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md đầy đủ
- KHÔNG gọi Mộc với incomplete artifacts → PEN-001 active

+ **BEFORE calling Mộc to challenge design:**
+
+ 1. **Precondition check - File Completeness:**
+
+ | Required File        | Purpose                     | Exists? | Path |
+ |----------------------|----------------------------|---------|------|
+ | ARCHITECTURE.md      | System design overview      | [ ]     | ... |
+ | schema.prisma        | Data model + RLS policies   | [ ]     | ... |
+ | CONTRACT_DRAFT.md    | API contracts (6 sections)  | [ ]     | ... |
+
+ **Rule:** ALL must have ✓ before calling Mộc. If ANY missing, **STOP** and complete it first.
+
+ **PEN-001 reminder:** Missing files = incomplete context → false issues → wasted iteration.
+
+ 2. **Call Mộc with full context:**
+    ```
+    $TASK moc "Challenge this {module} architecture:
+
+    [Attach: ARCHITECTURE.md, schema.prisma, CONTRACT_DRAFT.md]
+
+    Focus areas: {specific concerns}"
+    ```
```

### Step 4.3: Apply Enhancement & Retest

**Apply changes to agent file:**

```bash
# Create iteration-1 with enhanced agent
cp agents/core/phuc-sa.md sharpening-workspace/phuc-sa/iteration-1/phuc-sa-enhanced.md
# Apply enhancement diff
```

**Rerun same evals:**

```bash
# Spawn with ENHANCED agent
claude --agent sharpening-workspace/phuc-sa/iteration-1/phuc-sa-enhanced.md \
  --prompt "{eval.prompt}"
```

**Grade iteration-1:**

```json
{
  "session": "iteration-1-enhanced",
  "results": {
    "pen-001-reproduction": {
      "passed": true,
      "assertions_passed": 4,
      "assertions_total": 4,
      "improvement": "+4 assertions vs baseline"
    },
    "pen-001-variant-billing": {
      "passed": true,
      "assertions_passed": 4,
      "assertions_total": 4
    },
    "win-001-validation": {
      "passed": true,
      "assertions_passed": 3,
      "assertions_total": 3,
      "regression_check": "✅ No degradation"
    }
  },
  "summary": {
    "pass_rate": 0.60,
    "improvement": "+40% vs baseline"
  }
}
```

**Show user:**

```
Iteration 1 Results (After Enhancement):

PEN Regression Tests:
✅ PEN-001 reproduction: 4/4 assertions passed (+4 vs baseline)
   → Fixed: All files now attached to reviewer call
✅ PEN-001 variant (billing): 4/4 assertions passed
❌ PEN-002 reproduction: 1/3 assertions passed (no change)

WIN Validation Tests:
✅ WIN-001 validation: 3/3 assertions passed (✅ no regression)

Overall: 60% pass rate (3/5 evals) — +40% improvement

PEN-001 is FIXED ✅
PEN-002 still needs work. Continue sharpening?
```

### Step 4.4: Iterate Until Target Met

**Repeat 4.1-4.3 for remaining failures:**

- Iteration 2: Sharpen PEN-002 (PostgreSQL Schema Design)
- Iteration 3: Polish + optimize
- Iteration N: Cross-validation with synthetic evals

**Stop condition:**
- User says "good enough"
- Pass rate ≥ 90% on PEN evals
- No regression on WIN evals
- Max 5 iterations (prevent overfitting)

---

## Phase 5: Cross-Validation & Update Agent File

### Step 5.1: Final Cross-Validation

**Before finalizing, test on:**

1. **Held-out synthetic evals** (not used during sharpening)
2. **General capability evals** (baseline tasks unrelated to PENs)
3. **Re-run old WIN evals** (ensure no regression)

**If cross-validation shows regression:**
- Rollback problematic enhancement
- Try alternative strategy (e.g., Prime Directive instead of Table)
- Iterate again

### Step 5.2: Merge Enhancements into Agent File

**Apply final diff to production agent file:**

```bash
# Show user final diff
diff agents/core/phuc-sa.md sharpening-workspace/phuc-sa/iteration-N/phuc-sa-enhanced.md

# Apply changes
cp sharpening-workspace/phuc-sa/iteration-N/phuc-sa-enhanced.md agents/core/phuc-sa.md
```

### Step 5.3: Document Sharpening Session

**Add to agent file:**

```markdown
---

## 🔪 SHARPENING_LOG

### Session 2026-03-16 | agent-skill-sharpener v1.0

**Focus:** PEN-001 (reviewer file attachment), PEN-002 (NOBYPASSRLS in RLS)

**Evals:**
- 2 PEN regression tests (reproduction + variant)
- 1 WIN validation test
- 2 synthetic cross-validation tests
Total: 5 evals

**Baseline (iteration-0):**
- Pass rate: 20% (1/5)
- PEN-001: 0/4 assertions ❌
- PEN-002: 1/3 assertions ❌
- WIN-001: 3/3 assertions ✅

**Final (iteration-3):**
- Pass rate: 100% (5/5)
- PEN-001: 4/4 assertions ✅
- PEN-002: 3/3 assertions ✅
- WIN-001: 3/3 assertions ✅ (no regression)

**Enhancements applied:**
1. **Code Review Coordination (PEN-001 fix):**
   - Added: Precondition check table (File Completeness)
   - Added: Escape Hatch "STOP if files missing"
   - Added: Explicit reviewer call template with attachments

2. **PostgreSQL Schema Design (PEN-002 fix):**
   - Added: Prime Directive 5 "RLS NOBYPASSRLS Validation"
   - Added: Schema validation checklist table
   - Added: Concrete example of NOBYPASSRLS requirement

**Cross-validation:**
- ✅ Synthetic evals (different modules): 100% pass
- ✅ General capability: No degradation
- ✅ WIN patterns: Preserved

**Artifacts:**
- Workspace: `sharpening-workspace/phuc-sa/`
- Evals JSON: `evals/evals.json`
- Final agent: `iteration-3/phuc-sa-enhanced.md`
```

### Step 5.4: Update PEN Entry Status (Optional)

**If eval shows PEN is FIXED, suggest updating status:**

```diff
### PEN-001 | 2026-02-28 | T2_27
- Sự việc: Không cung cấp đủ context codebase cho Mộc → Mộc tìm 9 HIGH issues tại P6 iter-1
- Nguyên tắc: **Khi gọi reviewer (Mộc/Xuân), PHẢI đính kèm đầy đủ file liên quan — thiếu context = tự tạo FAIL**
- Status: ACTIVE
+ Status: FIXED (sharpening session 2026-03-16 — 100% pass on regression tests)
+ Fix: Added file completeness checklist + escape hatch in "Khi gọi Mộc" section
```

**Show user:**

```
Sharpening Complete! ✅

Changes applied to: agents/core/phuc-sa.md

Summary:
- 2 PEN entries FIXED (PEN-001, PEN-002)
- 1 WIN pattern PRESERVED (WIN-001)
- Pass rate: 20% → 100% (+80%)
- 3 iterations total
- 0 regressions detected

Suggested PEN status updates:
- PEN-001: ACTIVE → FIXED
- PEN-002: ACTIVE → FIXED

Apply status updates? (y/n)
```

---

## Advanced Features

### Feature 1: LEDGER Mining (Optional)

**If user provides LEDGER file:**

```bash
# Example: /sharpen agents/core/phuc-sa.md --ledger artifacts/T2_30/LEDGER.md
```

**Extract patterns from LEDGER:**

1. **Recurring penalties:**
   ```
   Phúc SA:
   - T2_27: -10 (P2) "Missing RLS validation in schema"
   - T2_30: -10 (P2) "Missing RLS validation in schema"
   - T2_34: -10 (P2) "Missing RLS validation in schema"

   Pattern: RLS validation is SYSTEMATIC weakness (3x in 7 days)
   ```

2. **Auto-create PEN entry suggestion:**
   ```markdown
   ## Suggested PEN Entry (from LEDGER mining)

   ### PEN-003 | 2026-03-16 | Auto-detected
   - Pattern: Recurring P2 penalties for "Missing RLS validation"
   - Tasks: T2_27, T2_30, T2_34 (3 occurrences in 7 days)
   - Principle: **Schema validation PHẢI check RLS policies BEFORE submitting to reviewer**
   - Status: PROPOSED
   - Affected skill: PostgreSQL Schema Design

   Add this PEN entry? (y/n)
   ```

### Feature 2: Skill Drift Detection

**After sharpening, set up monitoring:**

```bash
# Save current agent version as baseline
cp agents/core/phuc-sa.md sharpening-workspace/phuc-sa/baselines/2026-03-16.md

# Save eval suite as regression tests
cp sharpening-workspace/phuc-sa/evals/evals.json regression-tests/phuc-sa-2026-03-16.json
```

**Periodically re-run:**

```bash
# Monthly: Check if agent has regressed on fixed PENs
python scripts/check_drift.py \
  --agent agents/core/phuc-sa.md \
  --baseline sharpening-workspace/phuc-sa/baselines/2026-03-16.md \
  --evals regression-tests/phuc-sa-2026-03-16.json
```

**If drift detected (pass rate drops), alert user to re-sharpen.**

### Feature 3: Multi-Agent Sharpening

**If user provides multiple agents:**

```bash
# Example: /sharpen agents/core/*.md
```

**Workflow:**
1. Extract profiles for all agents in parallel
2. Identify SHARED PEN patterns (e.g., multiple agents fail at "file attachment to reviewer")
3. Create SHARED eval suite
4. Sharpen all agents with same enhancements
5. Cross-validate across agents (ensure fix works for all roles)

**Benefit:** Fix systemic team-wide issues in one session.

---

## Important Rules

### Communication Style

**Adapt to user's technical level:**
- Default: "regression test", "assertion" need brief explanation
- If user shows agent development knowledge → use terms freely
- Always show concrete examples (eval prompts, diffs, pass rates)

### Philosophy of Sharpening

**Don't just add rules - make mistakes IMPOSSIBLE:**

❌ **Weak:** "Always attach files when calling reviewer"
✅ **Strong:** Table checklist + Escape Hatch "STOP if any file missing" + Explicit call template

❌ **Weak:** "Remember to use NOBYPASSRLS"
✅ **Strong:** Prime Directive with concrete example + Schema validation table + PEN-002 reference

**Principle:** Agent should hit a guardrail BEFORE making mistake, not rely on memory.

### Prevent Overfitting

**Warning signs:**
- Agent passes PEN evals but fails synthetic variants
- Pass rate 100% on training, <70% on cross-validation
- Agent memorizes file names instead of learning pattern

**Fix:**
- Add more synthetic variations
- Test on different domains (Auth → Billing → Inventory)
- Check if enhancement is TOO specific (file names hardcoded)

### TodoList Tracking

Add these to TodoList at start:

- [ ] Phase 1: Extract agent profile + prioritize PEN entries
- [ ] Phase 2: Auto-generate evals from PEN/WIN entries
- [ ] Phase 3: Baseline test (run current agent vs failures)
- [ ] Phase 4: Sharpen skills (iterative enhancement)
- [ ] Phase 5: Cross-validate + update agent file
- [ ] Document sharpening session in SHARPENING_LOG

**Update status as you progress.**

---

## Reference Files

- `references/pen_to_eval_patterns.md` - Templates for converting PEN → eval
- `references/enhancement_strategies.md` - When to use Prime Directive vs Escape Hatch vs Table
- `references/sharpening_metrics.md` - How to measure improvement + prevent overfitting
- `scripts/extract_agent_profile.py` - Parse agent.md → JSON
- `scripts/generate_pen_evals.py` - PEN entries → evals.json
- `scripts/check_drift.py` - Monitor for skill regression over time

---

## Core Loop Summary

```
1. Read agent file → extract PEN/WIN entries + core skills
2. Prioritize by severity + recency + repeat patterns
3. Convert each PEN → regression test (must reproduce past failure)
4. Create synthetic variations (cross-validation)
5. Create WIN validation tests (prevent regression on success patterns)
6. Baseline test: Run current agent → expect PEN failures
7. Choose enhancement strategy (Prime Directive / Escape Hatch / Table)
8. Apply enhancement → retest → measure improvement
9. Iterate until PEN evals pass (usually 2-3 iterations)
10. Cross-validate on synthetic + general capability evals
11. Merge enhancements into production agent file
12. Document sharpening session in SHARPENING_LOG
13. Optionally: Update PEN status ACTIVE → FIXED
```

**Key difference from smartlog-skill-creator:**
- smartlog creates NEW skills from user intent
- agent-skill-sharpener FIXES KNOWN FAILURES from production PEN entries
- Evals auto-generated from battle scars, not manual creation
- Focus: Make agent unable to repeat past mistakes

---

**Good luck sharpening! Remember: Each PEN is a gift - evidence of what needs fixing. Mine them ruthlessly.** 🔪
