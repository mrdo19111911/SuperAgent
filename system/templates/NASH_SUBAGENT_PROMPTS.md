# Nash SubAgent Dispatch — v6.3

> **Roles:** THESIS = primary executor. AT (Anti-Thesis) = reviewer/auditor (#1/#2/#3 = parallel). Main = orchestrator (dispatches, scores, writes LEDGER). Letters A-F are phase labels — each pipeline uses a subset.
> **Structure:** Standard pipelines (Simple, Complex, Critical) have two tiers: Tier 1 defines acceptance criteria, Tier 2 builds and verifies. Trivial collapses both tiers. NASH/Urgent have their own flow.

All `$VARS` resolve from `$PROJECT_CONFIG`. Examples are illustrative — adapt to your project's domain.

## Config

| Variable | Purpose |
|----------|---------|
| `$PROJECT_ROOT` | Root directory |
| `$AGENT_DIR` | Agent profiles and system files |
| `$ARTIFACTS_DIR` | Pipeline outputs per task |
| `$SOURCE_OF_TRUTH` | Top-level architecture/strategy document |
| `$SPEC_FILE` | Task-level specification |
| `$CONTRACTS_FILE` | Shared interface contracts |
| `$VERIFY_CMD` | CLI verification command (empty = peer review only) |
| `$VERIFY_PEER` | Non-CLI verification: checklist, rubric, or review guide. Use alone or with `$VERIFY_CMD` |
| `$CRITERIA_DIR` | Where acceptance criteria artifacts live |
| `$CRITERIA_VERB` | What Tier 1 produces (e.g., "write test cases", "define evaluation rubric", "draft acceptance checklist") |
| `$DELIVERABLE_VERB` | What Tier 2 produces (e.g., "implement code", "write report", "create design") |

## Agent Archetypes

Archetypes are capability profiles. Main selects agents by matching archetype to phase need. One agent may hold multiple archetypes. These are advisory — any agent CAN fill any role; archetype guides dispatch, not restricts.

| Archetype | Capabilities | Best Fit Phases |
|-----------|-------------|-----------------|
| **Analyst** | Requirements decomposition, spec writing, gap analysis | A (criteria), B (completeness) |
| **Builder** | Implementation, artifact production, tool usage | C (execute) |
| **Critic** | Adversarial review, edge-case generation, spec lawyering | B, B2, D (verify) |
| **Strategist** | Architecture, trade-off analysis, system design | A (design tasks), E, F |
| **Operator** | Infra, deployment, observability, runtime verification | E (non-functional), F |

NASH agent selection: maximize DISAGREEMENT — never two agents of same primary archetype.

## Rules

0. **Think Tool (MANDATORY)**: Use `<think></think>` before critical decisions. See Think Tool Protocol below.
1. Load agent profile (capabilities + persistent context) from agent registry before dispatch.
2. **plan.md**: Create `$ARTIFACTS_DIR/{task}/plan.md` BEFORE any step. Update per tier boundary. Format: `Batch {N}: {desc} | Pipeline: {type} | {SP} SP` + `- [ ] Task {N}.{i}/{total}: {detail}` checkboxes.
3. **Spec** = `$SPEC_FILE` + `$CONTRACTS_FILE` + `$SOURCE_OF_TRUTH` (absolute law). Pass to every sub-agent.
4. **Verify**: Thesis runs `$VERIFY_CMD` → `{task}/verify.log`. AT gets log + runs independently. `$VERIFY_PEER` → AT evaluates against stated checklist/rubric. Both can apply to same task.
5. **Split**: >30K tokens → split by natural unit (one deliverable, one section, one component), never across logic. **Shared-artifact owner**: when splitting, designate one split as owner of shared mutable artifacts. Other splits produce delta instructions, not direct edits.
6. **Parallel**: Same-tier ATs run in parallel when independent (no shared mutable state). Main waits for all. **Tool Execution**: When calling multiple INDEPENDENT tools (Read, Grep, Glob), invoke all in a single turn for parallel execution.
7. **Deps**: plan.md lists upstream interfaces. Pass dep contracts as `$INPUT_ARTIFACTS`.
8. **Handoff**: Criteria → `$CRITERIA_DIR` + `{task}/S1_criteria_spec.md`. Each criterion MUST have a testable assertion (expected input → expected output, or verifiable completeness statement: "Report covers X, Y, Z with comparison table"). Criteria without assertions = auto-P3. Execute-phase satisfies ALL Tier 1 criteria.
9. **LEDGER**: Main writes after EVERY decision step. Agents CANNOT.
10. **Retries**: Max 3/tier. FAIL→S{n}: AT provides (a) specific failing items, (b) severity, (c) suggested scope. Agent re-executes with findings as `$INPUT_ARTIFACTS`. After 3 FAILs: escalate. Thesis -15 if same error 3x.

## Think Tool Protocol (v6.3)

**MANDATORY reflection before critical decisions. Violation = P0 penalty (-30 points).**

### MUST think before (P0 if violated):

1. **Git operations**: push, force-push, branch deletion, merge to main/master
2. **Phase transitions**:
   - Before Phase C (execute): Verify you have ALL file locations, ALL acceptance criteria understood, ALL dependencies identified
   - Before Phase F (final report): Verify ALL acceptance criteria met, ALL tests passing, ALL contract requirements fulfilled
3. **Test/Build failures**: Before proposing fixes, analyze root cause (not symptoms), impact on other components, whether it's environment issue vs. code bug
4. **Completion reports**: Before claiming "done", verify against acceptance criteria

### SHOULD think before (best practice):

5. Critical architectural decisions
6. Unexpected errors after multiple attempts
7. Reporting environment issues to user
8. Opening images/screenshots (describe what you see in context of task)

### Format:

```xml
<think>
[Internal reasoning - user won't see this. Max 200 words.]
- What do I know?
- What are the risks?
- What's the best approach?
- What could go wrong?
→ Decision: [your choice]
</think>
```

### Example:

```xml
<think>
Task: Push changes to main branch.
Current branch: feature/auth (per git status)
Target: main (production branch per git log)
Risk: Breaking production, no peer review
Better approach: Create Pull Request for Nash Triad review
→ Decision: Create PR, not direct push
</think>
```

**Conciseness Rule**: Max 200 words. Use bullet points. Focus on: Risks, Checks, Decision.

## Multi-Task Dispatch

N tasks → Main:
1. **DAG** — cross-task deps → topological layers (L0=no deps, L1=depends on L0...). Cycle detected → split cycle via minimal interface contract (Trivial pipeline), re-sort.
2. **Group** — same-layer tasks sharing input → same batch
3. **Batch ≤ 30K**. One pipeline/batch, multiple deliverables.
4. **Same-layer** → parallel pipelines | **Cross-layer** → sequential
5. **LEDGER**: one section per batch

## Pipelines

SP = Story Points (effort estimate).

| Pipeline | Scope |
|----------|-------|
| **Trivial** | 1-2 deliverables, <3 SP, no cross-deps |
| **Simple** | 3-5 deliverables, single task, 3-10 SP |
| **Complex** | 6-15 deliverables, may cross tasks, 10-30 SP |
| **Critical** | 15+, cross-task, new shared contracts, 30+ SP |
| **NASH** | Exploratory: debug, debate, design, research (k=2 default) |
| **Urgent** | Time-critical: execute/publish first, review after (outage, deadline) |

Scope exceeds pipeline → **upgrade immediately**.

### Phase Labels

B=completeness, B2=correctness (B and B2 both review A's output independently), D=functional, E=non-functional (perf, security, a11y, observability, resource cleanup, concurrency), F=cross-cutting+root-cause.

### Critical (A,B,B2,C,D,E,F)
```
-- Tier 1: Criteria --
S1:A  Define criteria ($CRITERIA_VERB)          THESIS
S2:B  Audit completeness. FAIL→S1              AT#1
S3:B2 Audit correctness. FAIL→S1               AT#2
S4:Main → PASS/FAIL
-- Tier 2: Execute --
S5:C  Execute ($DELIVERABLE_VERB) + verify      THESIS
S6:D  Verify functional. FAIL→S5               AT#1
S7:E  Verify non-functional. FAIL→S5           AT#2
S8:F  Cross-cutting + root cause. FAIL→S5      AT#3
S9:Main → PASS/FAIL
```

### Complex (A,B,B2,C,D,E)
S1-S7 same as Critical. No F — E covers NF + cross-cutting. S8:Main → PASS/FAIL.

### Simple (A,B,C,D)
```
S1:A Define criteria                            THESIS
S2:B Audit (completeness+correctness). FAIL→S1 AT
S3:C Execute + verify                           THESIS
S4:D Verify (functional+NF+quality). FAIL→S3   AT
S5:Main → PASS/FAIL
```

### Trivial (A,B,C)
```
S1:A Define criteria + execute + verify         THESIS
S2:B Verify + quality. FAIL→S1                 AT
S3:Main → PASS/FAIL
```
Trivial collapses both tiers into one pass. AT in S2 MUST evaluate criteria quality before assessing deliverables.

### NASH (k=2 default)
```
S1: Main picks k opposing agents (maximize archetype disagreement)
S2: k independent executions → k outputs
S3: Each reads others → k critiques
S4: Main decides (merge/select/reject)
S5: Best-fit executes merged strategy
Convergence: all P0-P2 findings agreed. P3+ disagreements acceptable — Main decides.
Stop: convergence OR 2 rounds.
```

### Urgent (3 steps)
```
S1: THESIS executes + publishes (minimal viable)
S2: AT reviews post-execution. Findings → backlog
S3: Main → ACCEPT (with backlog) / ROLLBACK
```
Use ONLY when time-pressure justifies inverted flow. Main must justify in LEDGER. Scope: prefer rollback/config-change over new work. S2 findings at P0/P1 severity → mandatory ROLLBACK. P2+ findings → backlog as follow-up tasks in normal pipelines.

## Scoring

100 pts/task. 0=disabled (restart 30 next task, PROBATION: deductions 1.5× for 2 tasks, bonuses unchanged). Zero-sum per penalty event.

| Lvl | Pts | Trigger |
|-----|-----|---------|
| P0 | ±30 | Deception, lazy review, fabrication, collusion |
| P1 | ±20 | Flaw leaks to final verification |
| P2 | ±15 | Spec drift, wrong diagnosis |
| P3 | ±10 | Missing/hollow criteria, placeholder |
| P4 | ±5 | Nitpick (cap 2/review = +10) |

M1: Reviewer OKs, Main finds flaw → 2× reviewer. M2: AT#2 catches AT#1 miss → 2× AT#1 (Complex/Critical only). M3: No evidence → -30.
Builder bonus: Thesis passes AT first try → +5. Evidence required on every finding (location + evidence snippet, or verification output). Visibility: own score only.

## Dispatch Template

```
## NASH: $TRIAD_ROLE | $PIPELINE_STEP
### 100pt. M1/M2/M3=2× penalty.
You are **$TRIAD_ROLE**. $CROSS_CHECK_AGENT reviews same output independently.
### Task
$TASK_DESCRIPTION
### Input
$INPUT_ARTIFACTS
### Output → `$ARTIFACTS_DIR/{task}/S{n}_{role}_output.md`
### Verify → $VERIFY_CMD and/or $VERIFY_PEER
```

Cross-check chain: B and B2 both review A's output independently. D reviews C. E reviews D. F reviews C+D+E.

## Output

THESIS: Deliverables table + Confidence % + Uncertainty list
AT: Verdict PASS/FAIL + Findings (ID/Severity/Location/Evidence/Fix)
Main: LEDGER + penalty record (→ agent's persistent context, if ≥10pts) + APPROVE/REVISE/REJECT
