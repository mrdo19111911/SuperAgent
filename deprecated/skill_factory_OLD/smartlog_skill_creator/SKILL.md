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

**Philosophy:** You are not just automating skill creation - you are teaching the user how to build GREAT skills while handling the tedious parts (testing, metrics, iteration). Every skill you help create should embody the 12 gstack principles, not just function correctly.

---

## Core Workflow

The process has 5 phases. Track progress in TodoList:

```
Phase 1: Capture Intent + Teach Principles
Phase 2: Write Draft with Quality Patterns
Phase 3: Automated Testing Loop
Phase 4: Iterative Improvement
Phase 5: Package + Optimize Triggering
```

---

## Phase 1: Capture Intent + Teach Principles

### Step 1.1: Understand What User Wants

**If user has existing conversation workflow:** Extract from history first:
- Tools used
- Step sequence
- Corrections made
- Input/output formats

**Otherwise, ask:**
1. What should this skill enable Claude to do?
2. When should it trigger? (user phrases/contexts)
3. Expected output format?
4. Objective vs subjective outputs? (determines if we need assertions)

**Mental model check:**
- Objective outputs (file transforms, data extraction, code generation) → need test assertions
- Subjective outputs (writing style, design quality) → qualitative review only

### Step 1.2: Teach the 12 Principles (Brief Version)

Before writing the draft, explain to the user:

> "I'm going to write this skill using 12 principles from gstack (high-quality skill patterns). Here's what makes a great skill:
>
> **Core principles:**
> 1. **Philosophy** - Role-play the mental model (e.g., "You are a paranoid reviewer")
> 2. **Prime Directives** - Specific rules, not vague (e.g., "Name the exception class, what rescues it, what user sees")
> 3. **Tables** - Force completeness (can't skip edge cases)
> 4. **Escape Hatches** - Check preconditions early, **STOP** with clear messages
> 5. **Two-Pass** - CRITICAL issues first (blocking), then INFORMATIONAL
>
> **Output quality:**
> 6. **Specific > Vague** - "Check X by doing Y. Example: Z. Anti-pattern: W."
> 7. **Terse Output** - One line problem, one line fix
> 8. **Concrete Examples** - Real bugs, not abstract
>
> **Advanced:**
> 9. **Multi-Path Analysis** - Happy + Nil + Empty + Error paths
> 10. **Suppressions** - Known false positives ("DO NOT flag X when Y")
> 11. **Priority Hierarchy** - "Never skip X, drop Y first under pressure"
> 12. **Meta-Instructions** - Explicit stopping policy
>
> I'll apply these as we go. The skill will be better than a basic template!"

**Don't info-dump - keep this under 30 seconds to read.**

### Step 1.3: Research (If Needed)

If skill involves specific tools/frameworks:
- Check available MCP tools for research
- Spawn research subagents in parallel if helpful
- Come prepared with context to reduce user burden

---

## Phase 2: Write Draft with Quality Patterns

### Step 2.1: Create Skill Structure

**Directory:**
```
skill-name/
├── SKILL.md              # Main instructions
├── references/           # Optional: >300 line docs
├── scripts/              # Optional: deterministic tasks
└── assets/              # Optional: templates, files
```

**SKILL.md anatomy:**

```yaml
---
name: skill-name
version: 1.0.0
description: |
  When to trigger + what it does. Be pushy - overtrigger rather than undertrigger.
  Example: "Use this whenever user mentions X, Y, or Z, even if they don't explicitly ask."
allowed-tools: [Bash, Read, Write, ...]
---

# Skill Name

## Philosophy                                    # Principle 1
[Role-play mental model. Not generic - vivid metaphor]

You are not [generic role]. You are [vivid metaphor - e.g., "a surgeon", "cathedral builder"].

[Mission with emotion - e.g., "make it extraordinary", "catch every landmine"]

[Mode switching if applicable - e.g., EXPANSION vs REDUCTION]

Critical rule: [One unbreakable law]

## Prime Directives                              # Principle 2
1. [Specific principle]. [Concrete meaning]. [Anti-pattern to avoid]. [Consequence].
2. [Another principle with examples]
...

## Priority Hierarchy Under Pressure             # Principle 11
[Step/Section X] > [Y] > [Z]

Never skip: [must-have list]
Drop first: [nice-to-have list]

---

## Workflow

This is a [interactive/non-interactive/semi-automated] workflow.  # Principle 12

**Only stop for:**
- [Critical failure condition]

**Never stop for:**
- [Auto-handle condition A] — [how to handle]
- [Auto-handle condition B] — [how to handle]

---

## Step 1: [Preconditions Check]               # Principle 4 (Escape Hatches)

1. Check [condition]
2. If [failure], output "[clear message]" and **STOP**.
3. Proceed only if [success]

## Step 2: [Pass 1 - CRITICAL]                 # Principle 5 (Two-Pass)

For every [unit], fill this table:             # Principle 3 (Tables)

  [COL 1]     | [COL 2]      | [COL 3]
  ------------|--------------|-------------
  [example]   | ...          | ...

Rules:
- [Column X] cannot be empty
- If [Column Y] = [value], that's a GAP → flag it

Analyze these paths:                           # Principle 9 (Multi-Path)
* Happy path: [description]
* Nil path: [what if input nil/missing]
* Empty path: [what if empty/zero-length]
* Error path: [what if upstream fails]

## Step 3: [Pass 2 - INFORMATIONAL]

Check for:                                     # Principle 6 (Specific > Vague)
- [Pattern A] by doing [B]. Example: [C]. Anti-pattern: [D].

## Suppressions                                # Principle 10

**DO NOT flag:**
- [Pattern X] when [Y] — [reason why acceptable]

## Output Format                               # Principle 7 (Terse)

[Skill Name]: N issues (X critical, Y info)

**CRITICAL:**
- [file:line] [problem]
  Fix: [action]

Rules: One line problem, one line fix. No preamble.

## Examples                                    # Principle 8 (Concrete)

Real scenario from production:
[Specific example that would break without this skill]

How this skill handles it:
[Concrete detection/solution]
```

### Step 2.2: Apply Domain Best Practices

**If skill uses common patterns:**
- Persistent server (like `/browse`) → reference MANUFACTURING_GUIDE.md patterns
- Review/QA workflows → reference gstack `/review` two-pass structure
- Planning workflows → reference `/plan-ceo-review` mode switching

**Progressive disclosure:**
- Keep SKILL.md < 500 lines
- Move checklists >50 lines to `references/`
- Bundle repeated scripts to `scripts/`

### Step 2.3: Review Draft Yourself

Before showing the user, self-critique:
- Does Philosophy section have vivid role-play? (not "you are a reviewer" but "you are a paranoid staff engineer")
- Are Prime Directives specific? (not "handle errors" but "name exception class, rescue action, what user sees")
- Are there tables forcing completeness?
- Are there escape hatches with **STOP**?
- Is output format terse? (one line problem, one line fix)

**If draft is vague/generic → rewrite with more specificity.**

---

## Phase 3: Automated Testing Loop

### Step 3.1: Create Test Cases

After draft is written, create 2-3 realistic test prompts.

**Characteristics of good test prompts:**
- Concrete and specific (not "format data" but "the xlsx in my downloads called Q4_sales_final_v2.xlsx")
- Include context (file paths, column names, company names, user backstory)
- Mix of lengths and edge cases
- Something a real user would actually type

**Save to `evals/evals.json`:**
```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Realistic user task prompt with details",
      "expected_output": "Description of expected result",
      "files": [],
      "assertions": []
    }
  ]
}
```

**Show to user:** "Here are test cases I'd like to try. Do these look right?"

### Step 3.2: Spawn Test Runs (Parallel)

Create workspace: `<skill-name>-workspace/iteration-1/`

**For each test case, spawn TWO subagents IN THE SAME TURN:**

**With-skill run:**
```
Execute this task using the skill:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-1/eval-<ID>-<name>/with_skill/outputs/
- Outputs to save: <what user cares about - e.g., "the .docx file">
```

**Baseline run:**
- If NEW skill → no skill at all (save to `without_skill/outputs/`)
- If IMPROVING existing → old version (snapshot it first, save to `old_skill/outputs/`)

**Create `eval_metadata.json` for each test:**
```json
{
  "eval_id": 1,
  "eval_name": "descriptive-name-not-just-eval-1",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

### Step 3.3: Draft Assertions (While Runs In Progress)

**Don't wait idle** - draft quantitative assertions while subagents run.

**Good assertions:**
- Objectively verifiable (not subjective judgment)
- Descriptive names (reads clearly in viewer)
- Example: `"output_contains_all_input_rows"`, `"chart_has_axis_labels"`, `"no_hardcoded_credentials"`

**Skip assertions for subjective skills** (writing style, design quality) - those need human qualitative review.

**Update `eval_metadata.json` and `evals/evals.json` with assertions.**

Explain to user: "While tests run, I'm drafting assertions to check automatically. You'll see both qualitative outputs (files) and quantitative metrics (pass/fail rates)."

### Step 3.4: Capture Timing (As Runs Complete)

Each task completion notification has `total_tokens` and `duration_ms`.

**Save to `timing.json` immediately:**
```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

**This is the ONLY chance to capture this data.**

---

## Phase 4: Iterative Improvement

### Step 4.1: Grade and Aggregate

**Once all runs done:**

1. **Grade each run** - spawn grader subagent or inline:
   - Read `smartlog_skill_creator/agents/grader.md`
   - Evaluate assertions against outputs
   - Save to `grading.json` (use fields: `text`, `passed`, `evidence`)

2. **Aggregate benchmark:**
   ```bash
   python -m smartlog_skill_creator.scripts.aggregate_benchmark \
     <workspace>/iteration-1 --skill-name <name>
   ```
   Produces `benchmark.json` with pass_rate, time, tokens (mean ± stddev + delta)

3. **Analyst pass** - read `smartlog_skill_creator/agents/analyzer.md`:
   - Non-discriminating assertions (always pass/fail regardless)
   - High-variance evals (flaky)
   - Time/token tradeoffs

### Step 4.2: Launch Eval Viewer

```bash
nohup python smartlog_skill_creator/eval-viewer/generate_review.py \
  <workspace>/iteration-1 \
  --skill-name "my-skill" \
  --benchmark <workspace>/iteration-1/benchmark.json \
  > /dev/null 2>&1 &
VIEWER_PID=$!
```

For iteration 2+: add `--previous-workspace <workspace>/iteration-<N-1>`

**Cowork/headless:** Use `--static <output_path>` instead of server

**Tell user:** "I've opened results in your browser. Two tabs:
- **Outputs**: Click through test cases, leave feedback
- **Benchmark**: Quantitative comparison (pass rates, timing, tokens)

When done, click 'Submit All Reviews' and let me know."

### Step 4.3: Read Feedback and Improve

When user says done, read `feedback.json`:

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "chart missing axis labels", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."},
    {"run_id": "eval-2-with_skill", "feedback": "perfect", "timestamp": "..."}
  ],
  "status": "complete"
}
```

Empty feedback = user thought it was fine.

**Kill viewer when done:**
```bash
kill $VIEWER_PID 2>/dev/null
```

### Step 4.4: Improve Skill (Apply 12 Principles)

**Critical mindset:**
1. **Generalize from feedback** - Don't overfit to test cases. Think about the million future uses.
2. **Keep prompt lean** - Remove what's not pulling weight. Read transcripts - if skill makes agent waste time, cut those parts.
3. **Explain the why** - Don't write rigid ALWAYS/NEVER in caps. Explain reasoning so LLM understands.
4. **Look for repeated work** - If all 3 test cases wrote same helper script → bundle it in `scripts/`

**Draft revision, then review it fresh. Take your time - this creates billions in value!**

**After improving:**
1. Apply changes to SKILL.md
2. Rerun tests → `iteration-2/`
3. Launch reviewer with `--previous-workspace`
4. Repeat until user happy or feedback all empty

---

## Phase 5: Package + Optimize Triggering

### Step 5.1: Description Optimization (Optional)

Offer to user: "Want to optimize the description for better triggering accuracy?"

If yes:

**5.1.1: Generate 20 trigger eval queries**

Mix of should-trigger (8-10) and should-not-trigger (8-10).

**Must be realistic** - something real users would type:
- Concrete details (file paths, column names, URLs)
- Backstory/context
- Mix of lengths
- Some typos/casual speech/lowercase

**BAD:** `"Format this data"`, `"Extract text"`
**GOOD:** `"ok so my boss sent me this xlsx (in downloads, called Q4_sales_final_v2.xlsx) and wants profit margin % added. revenue in col C, costs in col D"`

**Should-trigger:** Different phrasings, uncommon use cases, competition with other skills
**Should-not-trigger:** Near-misses (shares keywords but needs different tool), ambiguous phrasing

Save as JSON array with `query` and `should_trigger` fields.

**5.1.2: Review with user via HTML template**

Read `smartlog_skill_creator/assets/eval_review.html`, replace placeholders:
- `__EVAL_DATA_PLACEHOLDER__` → JSON array (no quotes - it's JS variable)
- `__SKILL_NAME_PLACEHOLDER__` → skill name
- `__SKILL_DESCRIPTION_PLACEHOLDER__` → current description

Write to `/tmp/eval_review_<skill-name>.html` and open it.

User can edit/toggle/add/remove, then "Export Eval Set" → downloads to `~/Downloads/eval_set.json`

**5.1.3: Run optimization loop**

```bash
python -m smartlog_skill_creator.scripts.run_loop \
  --eval-set <trigger-eval.json> \
  --skill-path <skill> \
  --model <current-session-model-id> \
  --max-iterations 5 \
  --verbose
```

This:
- Splits 60% train / 40% test
- Evaluates current description (3 runs per query for reliability)
- Calls Claude with extended thinking to propose improvements
- Re-evaluates on train + test
- Iterates up to 5 times
- Opens HTML report
- Returns JSON with `best_description` (selected by test score to avoid overfitting)

Periodically tail output to give user updates.

**5.1.4: Apply result**

Take `best_description` from JSON, update SKILL.md frontmatter.

Show user before/after + scores.

### Step 5.2: Package Skill

**If `present_files` tool available:**

```bash
python -m smartlog_skill_creator.scripts.package_skill <skill-folder>
```

Direct user to resulting `.skill` file for installation.

---

## Important Rules

### Communication Style

**Adapt to user's technical level:**
- Default: "evaluation", "benchmark" OK; "JSON", "assertion" need context
- If user shows coding knowledge → use technical terms freely
- If unsure → briefly explain: "assertions (automated checks that verify outputs)"

### Platform-Specific Adaptations

**Claude.ai (no subagents):**
- Skip parallel test spawning - run tests yourself one-by-one
- Skip baseline runs
- Skip browser reviewer - present results inline
- Skip quantitative benchmarking
- Still run description optimization (uses `claude -p`)

**Cowork (subagents but no display):**
- Use subagents for parallel tests
- Use `--static` for eval viewer (HTML file, not server)
- Feedback downloads as file
- Description optimization works fine

### Principle of Lack of Surprise

No malware, exploits, or misleading skills. Skills should do what description says. Don't create skills for unauthorized access or data exfiltration. "Roleplay as X" is fine.

### TodoList Tracking

Add these to TodoList at start:
- [ ] Phase 1: Capture intent + teach principles
- [ ] Phase 2: Write draft with quality patterns
- [ ] Phase 3: Create evals JSON and run tests
- [ ] Phase 4: Generate eval viewer for human review ← **CRITICAL**
- [ ] Phase 5: Iterate based on feedback
- [ ] Phase 6: Package + optimize description

**Never skip the eval viewer generation step!**

---

## Reference Files

- `agents/grader.md` - How to evaluate assertions
- `agents/comparator.md` - Blind A/B comparison (advanced)
- `agents/analyzer.md` - Benchmark analysis patterns
- `references/schemas.md` - JSON structures (evals.json, grading.json, benchmark.json)
- `references/gstack_patterns.md` - 12 principles detailed examples
- `references/skill_examples.md` - Annotated real skills showing principles

---

## Core Loop Summary

```
1. Capture intent → teach 12 principles briefly
2. Write draft applying Philosophy, Tables, Two-Pass, Escape Hatches, etc.
3. Create evals.json → spawn parallel tests (with_skill + baseline)
4. Draft assertions while tests run
5. Generate eval viewer (BEFORE you review yourself!)
6. User reviews outputs → feedback.json
7. Improve skill generalizing from feedback (not overfitting)
8. Repeat 3-7 until user satisfied
9. Optimize description (optional)
10. Package .skill file
```

**Key difference from /skill-creator:** Every skill embodies the 12 gstack principles, not just "works correctly". You're teaching quality while automating tedium.

---

**Good luck! Remember: Take your time improving skills - you're creating billions in economic value. Draft, review with fresh eyes, improve.**
