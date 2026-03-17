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

**Philosophy:** You are a **master craftsman sharpening blades after battle**. Each PEN entry is evidence of what cut the agent. Each WIN entry is a technique that worked. Your job: extract patterns, create tests the agent FAILED before, iterate until sharp. **Make the agent unable to repeat past mistakes**.

---

## Core Workflow (Track in TodoList)

```
Phase 1: Agent Analysis (Extract Skills + PEN/WIN Mining)
Phase 2: Auto-Generate Evals from PEN Entries
Phase 3: Baseline Test (Run Current Agent Against Failure Cases)
Phase 4: Sharpen Skills (Iterative Enhancement)
Phase 5: Cross-Validation & Update Agent File
```

---

## Phase 1: Agent Analysis

### Step 1.1: Understand Request
- Read agent file: PEN/WIN entries, Core Skills, reference_Memory, tools
- Optional: Read LEDGER.md for recent P0/P1/P2 penalties
- Ask user: Focus on which skills? PEN-focused (fix failures) or comprehensive?
- **Default:** PEN-focused (highest ROI)

### Step 1.2: Extract Agent Profile
Parse agent into JSON (save to `sharpening-workspace/{agent}/agent-profile.json`):
- agent_name, role, model
- PEN entries (id, date, task_ref, incident, principle, severity, affected_skill)
- WIN entries (id, task_ref, principle, affected_skill, value)
- core_skills, reference_memory, tools, skills_referenced

Show user: Summary table (X PEN entries, Y WIN entries, Z core skills)

### Step 1.3: Prioritize Sharpening Targets
**Scoring:** Severity (5x) + Recency (3x) + Status (2x) + Repeat pattern (4x)
- P0=50pts, P1=30pts, P2=15pts, P3=5pts
- Last 7d=30pts, 8-30d=20pts, 31-90d=10pts, >90d=5pts
- ACTIVE=20pts, RESOLVED=5pts
- Multiple PENs same skill=40pts

Sort by score → show top priorities → ask user to proceed

---

## Phase 2: Auto-Generate Evals from PEN Entries

**Key insight:** Each PEN entry = 1 test case agent FAILED in production.

### Step 2.1: Convert PEN → Realistic Eval Prompt
For each PEN, create:
- **Scenario** that would trigger same failure
- **Correct behavior** (what agent should do)
- **Past failure** (what agent DID - from PEN incident)
- **Assertions** (must_pass checks, should_pass checks)

Save to `sharpening-workspace/{agent}/evals/pen-{id}-reproduction.json`

### Step 2.2: Create Synthetic Variations
For each PEN eval, create 1-2 variations:
- Different module name, file types
- Same underlying pattern (prevent overfitting)

### Step 2.3: Create WIN Validation Evals
For each WIN, create validation test to ensure sharpening doesn't BREAK what works.

### Step 2.4: Aggregate Evals
Combine into `evals/evals.json` with: eval_id, type (regression/synthetic/validation), source (PEN-id/WIN-id), prompt, setup_files, assertions

Show user: "Generated X PEN tests, Y synthetic variants, Z WIN validations. Ready to baseline?"

*See `references/pen_to_eval_patterns.md` for detailed templates*

---

## Phase 3: Baseline Test

### Step 3.1: Run Current Agent Against Evals
Create `iteration-0-baseline/` workspace
For each eval: Spawn subagent with CURRENT agent version
Save: transcript.md, tool_calls.json, outputs/

### Step 3.2: Grade Baseline
Check assertions (parse transcript for tool calls, file creation, etc.)
Aggregate results: passed/failed per eval, pass_rate

**Show user:**
```
Baseline Results:
❌ PEN-001: 0/4 assertions (missing files in reviewer call)
❌ PEN-002: 1/3 assertions
✅ WIN-001: 3/3 assertions (no regression)

Overall: 20% pass rate (expected - PEN tests should fail)
```

*See `references/sharpening_metrics.md` for grading logic*

---

## Phase 4: Sharpen Skills (Iterative)

### Step 4.1: Choose Enhancement Strategy
For each FAILED eval, analyze root cause and select:
- **Strategy A: Prime Directive** (high-level principles)
- **Strategy B: Escape Hatch** (precondition checks)
- **Strategy C: Table/Checklist** (completeness enforcement)
- **Strategy D: Suppression** (known false positives)
- **Strategy E: Philosophy Enhancement** (mental model shift)

*See `references/enhancement_strategies.md` for detailed strategy guide*

### Step 4.2: Draft Enhancement
Create concrete fix (e.g., add checklist table, escape hatch "STOP if X missing")
Show user diff

### Step 4.3: Apply & Retest
Apply to `iteration-N/agent-enhanced.md`
Rerun same evals → grade → show improvement

### Step 4.4: Iterate Until Target
**Stop condition:** User says "good enough" OR pass_rate ≥90% on PEN evals OR max 5 iterations

---

## Phase 5: Cross-Validation & Update

### Step 5.1: Final Cross-Validation
Test on:
- Held-out synthetic evals
- General capability evals (baseline tasks)
- Re-run WIN evals (ensure no regression)

If regression detected → rollback → try alternative strategy

### Step 5.2: Merge into Agent File
Show final diff → apply to production agent file

### Step 5.3: Document Sharpening
Add `## SHARPENING_LOG` section to agent file:
- Session date, focus (which PENs)
- Baseline vs Final pass rates
- Enhancements applied (which strategies for which PENs)
- Cross-validation results

### Step 5.4: Update PEN Status (Optional)
If eval shows PEN FIXED → suggest: `Status: ACTIVE → FIXED (sharpening session {date})`

---

## Advanced Features

**LEDGER Mining:** Extract recurring penalty patterns → auto-suggest new PEN entries
**Skill Drift Detection:** Save baseline + evals → periodically re-run to detect regression
**Multi-Agent Sharpening:** Sharpen multiple agents with shared PEN patterns

*See `README.md` for advanced feature details*

---

## Core Principles

**Make mistakes IMPOSSIBLE (not just "remember to..."):**
- ❌ Weak: "Always attach files"
- ✅ Strong: Checklist table + Escape Hatch "STOP if missing" + Explicit template

**Prevent overfitting:**
- Test synthetic variations (different domains)
- Check cross-validation pass rate
- Ensure agent learns PATTERN, not specific file names

**TodoList tracking:** Update phases as you progress

---

## Reference Files

- `references/pen_to_eval_patterns.md` - Templates for PEN → eval conversion
- `references/enhancement_strategies.md` - When to use which strategy (A/B/C/D/E)
- `references/sharpening_metrics.md` - Grading logic, improvement measurement
- `scripts/extract_agent_profile.py` - Parse agent.md → JSON
- `scripts/generate_pen_evals.py` - PEN entries → evals.json
- `scripts/check_drift.py` - Monitor skill regression over time

---

## Summary Loop

```
1. Read agent → extract PEN/WIN + core skills
2. Prioritize by severity + recency + repeat
3. Convert PEN → regression test (reproduce failure)
4. Create synthetic variations + WIN validation
5. Baseline: Run current agent → expect PEN failures
6. Choose strategy (Prime/Escape/Table/Suppression/Philosophy)
7. Apply enhancement → retest → measure improvement
8. Iterate 2-3x until PEN evals pass
9. Cross-validate (synthetic + general + WIN)
10. Merge to production agent + document session
```

**Key difference from skill creators:** Fixes KNOWN production failures (PEN entries), not creating new capabilities. Evals auto-generated from battle scars. Focus: Make agent unable to repeat past mistakes.

---

**Mine PEN entries ruthlessly. Each one is a gift - evidence of what needs fixing.** 🔪
