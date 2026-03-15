# Smartlog Skill Creator

**High-quality skill builder combining gstack patterns + /skill-creator automation**

## What Is This?

A meta-skill that helps you create OTHER skills with gstack-level quality while automating the test/iterate loop.

**Key differentiators:**
- ✅ **Teaches 12 gstack principles** while building (Philosophy, Tables, Two-Pass, etc.)
- ✅ **Automates testing** with parallel subagent runs + metrics
- ✅ **Iterative improvement** with human-in-the-loop review
- ✅ **Description optimization** for better triggering

---

## Quick Start

### Installation

```bash
# If this is a standalone skill
cd ~/.claude/skills
cp -r /path/to/smartlog_skill_creator ./

# If part of skill_factory
# (Already in skill_factory/smartlog_skill_creator/)
```

### Usage

```
User: I want to create a skill that [does X]

Claude (using this skill):
1. Interviews you about intent
2. Teaches you the 12 principles briefly
3. Writes draft SKILL.md applying quality patterns
4. Creates test cases
5. Spawns parallel tests (with_skill + baseline)
6. Generates browser-based eval viewer
7. You review outputs + leave feedback
8. Improves skill based on feedback
9. Repeats until you're satisfied
10. Packages .skill file + optimizes description
```

---

## Why Use This vs /skill-creator?

| Feature | /skill-creator | smartlog_skill_creator |
|---------|----------------|------------------------|
| Automated testing | ✅ Yes | ✅ Yes |
| Parallel subagents | ✅ Yes | ✅ Yes |
| Eval viewer | ✅ Yes | ✅ Yes |
| Metrics/benchmarking | ✅ Yes | ✅ Yes |
| Description optimization | ✅ Yes | ✅ Yes |
| **12 gstack principles** | ❌ No | ✅ **Yes** |
| **Philosophy sections** | ❌ No | ✅ **Yes** |
| **Tables for completeness** | ❌ No | ✅ **Yes** |
| **Two-Pass architecture** | ❌ No | ✅ **Yes** |
| **Teaches quality writing** | ❌ No | ✅ **Yes** |

**Bottom line:** /skill-creator makes skills that WORK. smartlog_skill_creator makes skills that are GREAT.

---

## The 12 Principles

Every skill created with this tool will embody:

1. **Philosophy** - Vivid role-play mental model
2. **Prime Directives** - Specific rules, not vague
3. **Tables** - Force completeness (error/rescue maps)
4. **Escape Hatches** - Early exit with **STOP**
5. **Two-Pass** - CRITICAL (blocking) → INFORMATIONAL
6. **Specific > Vague** - Concrete examples always
7. **Terse Output** - One line problem, one line fix
8. **Concrete Examples** - Real bugs, not abstract
9. **Multi-Path** - Happy + Nil + Empty + Error
10. **Suppressions** - Known false positives list
11. **Priority Hierarchy** - Never skip X, drop Y first
12. **Meta-Instructions** - Explicit stopping policy

See `references/gstack_patterns.md` for detailed examples.

---

## Workflow

### Phase 1: Capture Intent + Teach

- Interview user about what skill should do
- Briefly explain 12 principles (~30 seconds to read)
- Research if needed (docs, similar skills)

### Phase 2: Write Draft with Quality

- Create SKILL.md with Philosophy, Prime Directives, Tables, etc.
- Apply Two-Pass structure (CRITICAL → INFORMATIONAL)
- Add escape hatches, suppressions, concrete examples
- Self-review before showing user

### Phase 3: Automated Testing

- Create 2-3 realistic test cases (evals.json)
- Spawn parallel subagents (with_skill + baseline) IN SAME TURN
- Draft assertions while tests run
- Capture timing from task notifications

### Phase 4: Iterative Improvement

- Grade assertions (programmatic or manual)
- Aggregate benchmark.json (pass rates, tokens, timing)
- Generate eval viewer (HTML in browser)
- User reviews outputs + leaves feedback
- Improve skill generalizing from feedback (not overfitting)
- Repeat until satisfied

### Phase 5: Package + Optimize

- Optimize description for triggering (20 eval queries)
- Run optimization loop (train/test split)
- Package .skill file
- Present to user

---

## File Structure

```
smartlog_skill_creator/
├── SKILL.md                      # Main skill instructions
├── README.md                     # This file
├── agents/
│   ├── grader.md                # How to grade assertions
│   ├── comparator.md            # Blind A/B comparison
│   └── analyzer.md              # Benchmark analysis
├── scripts/
│   ├── aggregate_benchmark.py   # Create benchmark.json
│   ├── run_loop.py              # Description optimization
│   ├── run_eval.py              # Single eval run
│   └── package_skill.py         # Create .skill file
├── references/
│   ├── schemas.md               # JSON format specs
│   └── gstack_patterns.md       # 12 principles detailed
├── assets/
│   └── eval_review.html         # Trigger eval review template
└── eval-viewer/
    └── generate_review.py       # Browser-based result viewer
```

---

## Example Session

```
User: I want a skill that analyzes CSV files for data quality issues

Claude (using smartlog_skill_creator):

> Great! Before we start, I'll explain the 12 quality principles I'll use...
> [Brief 30-second explanation]
>
> Let me ask a few questions:
> - What kind of issues should it detect? (missing values, duplicates, outliers?)
> - Should it suggest fixes or just report?
> - Do you want assertions for automated testing?

User: Detect missing values, duplicates, and type inconsistencies. Just report.
      Yes to assertions.

Claude:

> Perfect. Writing draft now with:
> - Philosophy: "You are a data quality analyst who's seen silent corruption..."
> - Prime Directives: "Every column must be checked. Zero silent passes."
> - Tables: Quality check matrix (column | check | pass/fail)
> - Two-Pass: CRITICAL (data loss risks) → INFORMATIONAL (formatting)
>
> [Writes SKILL.md]
>
> Here's the draft. Now creating 3 test cases:
> 1. CSV with missing values
> 2. CSV with duplicate rows
> 3. CSV with type mismatches (numbers as strings)
>
> Spawning tests... (runs with_skill + without_skill in parallel)
>
> While tests run, drafting assertions:
> - "detects_all_missing_values"
> - "identifies_duplicate_rows"
> - "flags_type_inconsistencies"
>
> Tests complete! Opening browser viewer...

[Browser opens with Outputs tab showing results, Benchmark tab showing metrics]

User: [Reviews, leaves feedback: "Missing values detection is perfect, but
      duplicate detection missed case-insensitive dupes"]

Claude:

> Reading feedback... I see the issue. Improving SKILL.md to check for
> case-insensitive duplicates by normalizing before comparison.
>
> Rerunning tests with improvement...
>
> [Opens viewer again with iteration-2 results + previous comparison]

User: Perfect! Ship it.

Claude:

> Great! Want to optimize the description for better triggering?

User: Yes

Claude:

> Generating 20 trigger eval queries... Opening review HTML for you to edit...
> [User reviews/edits]
>
> Running optimization loop (5 iterations, train/test split)...
> Iteration 1: 72% test accuracy
> Iteration 2: 81% test accuracy
> Iteration 3: 87% test accuracy ← Best!
>
> Applying best description. Packaging skill...
>
> Done! Your skill is at: ~/.claude/skills/csv-data-quality/csv-data-quality.skill
```

---

## Platform-Specific Notes

### Claude Code (Full Features)

All features work:
- Parallel subagent spawning
- Browser-based eval viewer
- Description optimization (uses `claude -p`)

### Claude.ai (Limited)

- No subagents → run tests yourself one-by-one
- No browser → present results inline
- Skip baseline comparisons
- Skip quantitative benchmarking
- Description optimization still works

### Cowork (Mostly Full)

- Subagents work
- Use `--static` for eval viewer (HTML file, not server)
- Feedback downloads as file (copy manually)
- Description optimization works

---

## Dependencies

**Required:**
- Python 3.8+
- Claude CLI (`claude -p` for description optimization)

**Optional (for full features):**
- Subagent support (Claude Code, Cowork)
- Browser (for eval viewer)

---

## Configuration

No config files needed. The skill is self-contained.

**To customize:**
- Edit `SKILL.md` to change workflow
- Edit `references/gstack_patterns.md` to add more principle examples
- Edit `eval-viewer/generate_review.py` for viewer customization

---

## Troubleshooting

**"Viewer won't open in browser"**
→ Use `--static <output_path>` to generate HTML file instead of server

**"Feedback.json not found"**
→ In Cowork, it downloads to ~/Downloads. Copy manually to workspace.

**"Grading.json fails viewer"**
→ Check field names: must be `text`, `passed`, `evidence` (not `name`/`met`/`details`)

**"Description optimization fails"**
→ Requires `claude` CLI. Check: `which claude`

**"Tests timing out"**
→ In Cowork, run tests in series instead of parallel if timeouts severe

---

## Contributing

To improve smartlog_skill_creator:

1. Use it to create skills
2. Note what could be better
3. Update SKILL.md with improvements
4. Add examples to `references/gstack_patterns.md`
5. Share learnings

---

## License

Same as parent skill_factory project.

---

## Learn More

- **skill_factory/** - Parent documentation system
- **GSTACK_WRITING_STYLE.md** - Detailed 12 principles guide
- **SKILL_BUILDING_MASTER_GUIDE.md** - Complete learning roadmap

---

**Start creating great skills!** Just tell Claude what you want and this skill will guide the process. 🚀
