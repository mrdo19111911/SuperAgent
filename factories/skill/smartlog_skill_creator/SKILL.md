---
name: smartlog-skill-creator
version: 1.0.0
description: |
  Create high-quality skills combining gstack patterns + automated testing.
  Teaches 12 writing principles while automating the test/iterate loop.
  Use this when user wants to create a new skill, improve existing skill,
  or learn how to write gstack-quality skills. More comprehensive than
  basic skill creation - includes quality patterns, automated testing,
  and iterative improvement workflow.
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

# Smartlog Skill Creator
## High-Quality Skill Builder with gstack Patterns + Automation

**Philosophy:** Teach users how to build GREAT skills while handling tedious parts (testing, metrics, iteration). Every skill embodies 12 gstack principles, not just function correctly.

---

## Core Workflow (Track in TodoList)

```
Phase 1: Capture Intent + Teach Principles
Phase 2: Write Draft with Quality Patterns
Phase 3: Automated Testing Loop
Phase 4: Iterative Improvement
Phase 5: Package + Optimize Triggering
```

---

## Phase 1: Capture Intent + Teach Principles

### Understand What User Wants
- **If existing workflow:** Extract tools used, step sequence, corrections, I/O formats
- **Otherwise ask:** What should this enable? When trigger? Output format? Objective/subjective outputs?

**Mental model:** Objective outputs (file transforms, code gen) → need assertions; Subjective (writing style) → qualitative review only

### Teach the 12 Principles (Brief <30sec)
Explain to user:
> "I'm using 12 gstack principles for quality:
>
> **Core:** Philosophy (role-play vivid metaphor), Prime Directives (specific rules), Tables (force completeness), Escape Hatches (precondition checks + STOP), Two-Pass (CRITICAL first, then INFORMATIONAL)
>
> **Output:** Specific > Vague, Terse Output (one line problem/fix), Concrete Examples (real bugs)
>
> **Advanced:** Multi-Path Analysis (Happy/Nil/Empty/Error), Suppressions (known false positives), Priority Hierarchy, Meta-Instructions (stopping policy)
>
> Skill will be better than basic template!"

### Research (If Needed)
Check MCP tools, spawn research subagents in parallel if helpful

*See `references/gstack_patterns.md` for detailed principle examples*

---

## Phase 2: Write Draft with Quality Patterns

### Create Skill Structure
```
skill-name/
├── SKILL.md              # Main instructions (<500 lines)
├── references/           # Optional: >300 line docs
├── scripts/              # Optional: deterministic tasks
└── assets/              # Optional: templates
```

**SKILL.md anatomy:**
- Metadata (name, version, description, allowed-tools)
- Philosophy (vivid role-play metaphor)
- Prime Directives (specific rules with examples + anti-patterns)
- Priority Hierarchy (never skip X, drop Y first)
- Workflow (stopping policy)
- Steps with: Escape Hatches, Tables, Two-Pass, Multi-Path
- Suppressions, Output Format (terse), Examples (concrete)

*See `references/skill_examples.md` for annotated real skills*

### Apply Domain Best Practices
- Persistent server → reference MANUFACTURING_GUIDE.md
- Review/QA → reference gstack `/review` two-pass
- Planning → reference `/plan-ceo-review` mode switching

**Progressive disclosure:** Keep SKILL.md <500 lines, move checklists >50 lines to references/

### Self-Critique Draft
Before showing user, check:
- Philosophy vivid? (not "reviewer" but "paranoid staff engineer")
- Prime Directives specific? (not "handle errors" but "name exception class, rescue action, what user sees")
- Tables forcing completeness?
- Escape hatches with **STOP**?
- Output terse? (one line problem, one line fix)

**If vague/generic → rewrite with specificity**

---

## Phase 3: Automated Testing Loop

### Create Test Cases
2-3 realistic prompts with:
- Concrete details (file paths, column names, company names)
- Context and backstory
- Mix of lengths and edge cases
- Real user phrasing

Save to `evals/evals.json` with: id, prompt, expected_output, files, assertions

Show user: "Do these test cases look right?"

### Spawn Test Runs (Parallel)
Create workspace: `<skill>-workspace/iteration-1/`

For each test, spawn TWO subagents SAME TURN:
- **With-skill:** Using new skill → save to `with_skill/outputs/`
- **Baseline:** Without skill (new) OR old version (improving) → save to `without_skill/` or `old_skill/`

Create `eval_metadata.json` per test

### Draft Assertions (While Tests Run)
Don't wait idle - draft objectively verifiable assertions:
- Good names (descriptive)
- Examples: `output_contains_all_input_rows`, `chart_has_axis_labels`, `no_hardcoded_credentials`
- Skip for subjective skills (human qualitative review instead)

Update `eval_metadata.json` and `evals/evals.json`

### Capture Timing (As Runs Complete)
Save `total_tokens` and `duration_ms` to `timing.json` immediately (only chance to capture)

---

## Phase 4: Iterative Improvement

### Grade and Aggregate
1. **Grade runs:** Spawn grader subagent (read `agents/grader.md`) → evaluate assertions → `grading.json`
2. **Aggregate benchmark:** Run `scripts/aggregate_benchmark` → `benchmark.json` (pass_rate, time, tokens with mean ± stddev + delta)
3. **Analyst pass:** Read `agents/analyzer.md` → find non-discriminating assertions, high-variance evals, time/token tradeoffs

### Launch Eval Viewer
```bash
nohup python smartlog_skill_creator/eval-viewer/generate_review.py \
  <workspace>/iteration-1 --skill-name "my-skill" \
  --benchmark <workspace>/iteration-1/benchmark.json \
  > /dev/null 2>&1 &
```

For iteration 2+: add `--previous-workspace`
Cowork/headless: Use `--static <output_path>`

Tell user: "Results in browser - Outputs tab (feedback) + Benchmark tab (metrics). Click 'Submit All Reviews' when done."

### Read Feedback and Improve
Read `feedback.json` → empty feedback = user OK

Kill viewer: `kill $VIEWER_PID`

**Critical mindset:**
1. Generalize from feedback (don't overfit)
2. Keep prompt lean (remove what's not pulling weight)
3. Explain why (not rigid ALWAYS/NEVER)
4. Bundle repeated work to `scripts/`

**After improving:** Apply changes → rerun tests → iteration-2/ → launch reviewer with --previous-workspace → repeat until user happy

---

## Phase 5: Package + Optimize Triggering

### Description Optimization (Optional)
Offer: "Want to optimize description for better triggering?"

**If yes:**
1. **Generate 20 trigger queries:** 8-10 should-trigger (different phrasings, uncommon cases), 8-10 should-not (near-misses, ambiguous). Realistic with details/backstory.
2. **Review via HTML:** Read `assets/eval_review.html`, replace placeholders, open browser. User edits → export to `~/Downloads/eval_set.json`
3. **Run optimization:**
   ```bash
   python -m smartlog_skill_creator.scripts.run_loop \
     --eval-set <trigger-eval.json> --skill-path <skill> \
     --model <model-id> --max-iterations 5 --verbose
   ```
   Splits 60/40 train/test → evaluates → proposes improvements → iterates → HTML report → best_description (by test score)
4. **Apply result:** Update SKILL.md frontmatter with best_description

*See `README.md` for detailed optimization workflow*

### Package Skill
If `present_files` available:
```bash
python -m smartlog_skill_creator.scripts.package_skill <skill-folder>
```

---

## Important Rules

**Communication:** Adapt to user's technical level (explain "assertions" = automated checks if needed)

**Platform adaptations:**
- **Claude.ai (no subagents):** Run tests one-by-one, skip baseline, present results inline, skip benchmarking. Description optimization still works.
- **Cowork (no display):** Use subagents, `--static` for viewer, feedback as file

**No surprise:** No malware/exploits. Skills do what description says. No unauthorized access/exfiltration.

**TodoList tracking:** Add 6 phases at start, update as you progress. **Never skip eval viewer generation!**

---

## Reference Files

- `agents/grader.md` - Assertion evaluation
- `agents/comparator.md` - Blind A/B comparison
- `agents/analyzer.md` - Benchmark analysis
- `references/schemas.md` - JSON structures
- `references/gstack_patterns.md` - 12 principles detailed
- `references/skill_examples.md` - Annotated real skills

---

## Summary Loop

```
1. Capture intent → teach 12 principles briefly
2. Write draft (Philosophy, Tables, Two-Pass, Escape Hatches)
3. Create evals.json → spawn parallel tests (with_skill + baseline)
4. Draft assertions while tests run
5. Generate eval viewer (BEFORE self-review!)
6. User reviews outputs → feedback.json
7. Improve skill (generalize, don't overfit)
8. Repeat 3-7 until satisfied
9. Optimize description (optional)
10. Package .skill file
```

**Key difference from basic creators:** Embodies 12 gstack principles, not just "works correctly". Teaching quality while automating tedium.

---

**Take your time improving skills - you're creating billions in economic value. Draft, review fresh, improve.** 🎯
