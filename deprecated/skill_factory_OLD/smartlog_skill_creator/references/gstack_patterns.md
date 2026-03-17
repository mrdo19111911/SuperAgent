# gstack Patterns - The 12 Principles (Detailed)

This file provides detailed examples of each principle. Reference when writing skills.

---

## Principle 1: Philosophy (Role-Play Mental Model)

### What It Means
Set the mental model with vivid metaphors, not generic descriptions. Give permission and constraints.

### Template
```markdown
## Philosophy
You are not [generic role]. You are [vivid metaphor].

[Mission with emotion]

Your posture depends on [context]:
* Mode A: You are [metaphor]. [Core principle]. [Permission statement].
* Mode B: You are [different metaphor]. [Different principle]. [Constraint].

Critical rule: [One unbreakable law that prevents drift]
```

### Good Example (from `/plan-ceo-review`)
```markdown
## Philosophy
You are not here to rubber-stamp this plan. You are here to make it
extraordinary, catch every landmine before it explodes.

Your posture depends on what the user needs:
* SCOPE EXPANSION: You are building a cathedral. Envision the platonic ideal.
  Push scope UP. You have permission to dream.
* HOLD SCOPE: You are a rigorous reviewer. Make it bulletproof.
* SCOPE REDUCTION: You are a surgeon. Find the minimum viable version. Be ruthless.

Critical rule: Once user selects a mode, COMMIT to it. Do not silently drift.
```

### Bad Example
```markdown
## Philosophy
This skill reviews code for quality issues.
```
→ No mental model, no emotion, no modes

---

## Principle 2: Prime Directives (Specific Not Vague)

### What It Means
State principles concretely with examples and anti-patterns. Not "do X well" but "do X by Y, avoid Z".

### Template
```markdown
## Prime Directives
1. [Principle name]. [What it means concretely]. [Anti-pattern to call out]. [Consequence].
```

### Good Example (from `/plan-ceo-review`)
```markdown
## Prime Directives
1. Zero silent failures. Every failure mode must be visible — to the system,
   to the team, to the user. If a failure can happen silently, that is a
   critical defect in the plan.

2. Every error has a name. Don't say "handle errors." Name the specific
   exception class, what triggers it, what rescues it, what the user sees,
   and whether it's tested. `rescue StandardError` is a code smell — call it out.

3. Data flows have shadow paths. Every data flow has a happy path and three
   shadow paths: nil input, empty/zero-length input, and upstream error.
   Trace all four for every new flow.
```

### Bad Example
```markdown
## Prime Directives
1. Handle errors properly
2. Write good tests
3. Check for edge cases
```
→ All vague - no concrete guidance

---

## Principle 3: Tables (Force Completeness)

### What It Means
Use tables to force thinking through all cases. Prevents hand-waving "I'll handle errors".

### Template
```markdown
For every [unit], fill this table:

  [DIMENSION 1] | [DIMENSION 2] | [DIMENSION 3]
  --------------|---------------|---------------
  [example]     | ...           | ...

Rules:
* [Column X] cannot be [value] - that's a GAP
* If [Column Y] = [Z], then [action required]
```

### Good Example (from `/plan-ceo-review`)
```markdown
## Error & Rescue Map

For every new method/codepath, fill in this table:

  METHOD/CODEPATH     | WHAT CAN GO WRONG      | EXCEPTION CLASS
  --------------------|------------------------|-----------------
  ExampleService#call | API timeout            | Faraday::TimeoutError
                      | API returns 429        | RateLimitError
                      | DB pool exhausted      | ActiveRecord::ConnectionTimeoutError

  EXCEPTION CLASS             | RESCUED? | RESCUE ACTION     | USER SEES
  ----------------------------|----------|-------------------|-----------
  Faraday::TimeoutError       | Y        | Retry 2x, raise   | "Service unavailable"
  RateLimitError              | Y        | Backoff + retry   | Nothing (transparent)
  ActiveRecord::ConnectionTimeoutError | N ← GAP | — | 500 error ← BAD
```

Any row with RESCUED=N is automatically visible as a GAP.

### Bad Example
```markdown
## Error Handling
Handle all possible errors appropriately. Log errors to the system.
```
→ No table, can skip edge cases

---

## Principle 4: Escape Hatches (Early Exit)

### What It Means
Check preconditions early. Exit with clear message if failed. Don't waste work.

### Template
```markdown
## Step N: [Action]

1. Check [precondition]
2. If [failure condition], output "[clear user message]" and **STOP**.
3. Proceed only if [success condition]
```

### Good Example (from `/review`)
```markdown
## Step 1: Check branch

1. Run `git branch --show-current`
2. If on `main`, output "Nothing to review — you're on main" and **STOP**.
3. Run `git diff origin/main --stat`
4. If no diff, output same message and **STOP**.
```

### Bad Example
```markdown
## Step 1: Review code
Review the current branch for issues.
```
→ No precondition checks, will waste time if on main branch

---

## Principle 5: Two-Pass (CRITICAL → INFORMATIONAL)

### What It Means
Separate blocking issues from nice-to-haves. User knows what must be fixed vs optional.

### Template
```markdown
## Pass 1: [Tier Name] (BLOCKING)
[Critical checks that stop the workflow]

**If any fail:** **STOP**. Fix these before proceeding.

## Pass 2: [Tier Name] (NON-BLOCKING)
[Nice-to-have checks, reported but don't block]
```

### Good Example (from `/review` checklist)
```markdown
**Two-pass review:**
- **Pass 1 (CRITICAL):** SQL & Data Safety, LLM Trust Boundary — can block /ship
- **Pass 2 (INFORMATIONAL):** All remaining categories — included in PR but don't block

## Pass 1 — CRITICAL
- String interpolation in SQL
- Race conditions (read-check-write without locking)
- `html_safe` on user-controlled data (XSS)

## Pass 2 — INFORMATIONAL
- Magic numbers without constants
- Dead code / variables assigned but never read
- Test gaps (negative-path assertions missing)
```

### Bad Example
```markdown
## Review Checklist
- SQL injection
- Race conditions
- Magic numbers
- Test coverage
```
→ All flat - user doesn't know what's blocking vs informational

---

## Principle 6: Specific > Vague

### What It Means
Always concrete. "Check X by doing Y. Example: Z. Anti-pattern: W."

### Comparison Table

| ❌ Vague | ✅ Specific |
|---------|------------|
| "Handle errors properly" | "Name the exception class, rescue action, what user sees, whether it's tested" |
| "Check for SQL injection" | "String interpolation in SQL — use `sanitize_sql_array` or Arel" |
| "Add tests" | "Negative-path tests that assert side effects: URL attached? callback fired?" |
| "Make sure it's secure" | "Authorization: is it scoped to right user? Can user A access user B's data by manipulating IDs?" |

### Good Example (from `/review` checklist)
```markdown
#### SQL & Data Safety
- String interpolation in SQL (even if values are `.to_i`/`.to_f` — use `sanitize_sql_array` or Arel)
- TOCTOU races: check-then-set patterns that should be atomic `WHERE` + `update_all`
- `find_or_create_by` on columns without unique DB index — concurrent calls can create duplicates
```

### Bad Example
```markdown
#### Security
- Check for vulnerabilities
- Ensure data safety
```

---

## Principle 7: Terse Output

### What It Means
One line problem, one line fix. No fluff, no "overall looks good", no preamble.

### Template
```markdown
**Output format:**
[Summary line with counts]

**[Category]:**
- [file:line] [problem]
  Fix: [action]

Rules:
- One line problem, one line fix
- No preamble
- File:line citations mandatory
```

### Good Example (from `/review` checklist)
```markdown
**Output format:**
Pre-Landing Review: N issues (X critical, Y informational)

**CRITICAL:**
- [file:line] Problem description
  Fix: suggested fix

Be terse. For each issue: one line describing the problem, one line with
the fix. No preamble, no summaries, no "looks good overall."
```

### Bad Example
```markdown
Overall, the code looks pretty good! I found a few issues that you might
want to address. Let me walk you through them...

In the file user.rb around line 47, there's a potential race condition
that could cause problems in production. You'll want to add a transaction
here to ensure atomicity. This is important because...
```
→ Too wordy, no concise format

---

## Principle 8: Concrete Examples

### What It Means
Real bugs from production, not abstract principles. Makes patterns memorable.

### Template
```markdown
[Principle]. Example: [specific concrete scenario that breaks].
Anti-pattern: [what NOT to do].
```

### Good Example (from `/review` checklist)
```markdown
#### Conditional Side Effects
Code paths that branch on a condition but forget to apply a side effect on one branch.

Example: item promoted to verified but URL only attached when a secondary
condition is true — the other branch promotes without the URL, creating an
inconsistent record.
```

### Bad Example
```markdown
#### Conditional Side Effects
Make sure all code paths apply necessary side effects.
```
→ Abstract, not memorable

---

## Principle 9: Multi-Path Analysis

### What It Means
Systematic edge case discovery. Don't rely on memory - use framework.

### Template
```markdown
For every [new feature], analyze these paths:
1. Happy path: [description] — [question to answer]
2. Nil path: [what if nil/missing] — [question]
3. Empty path: [what if empty/zero-length] — [question]
4. Error path: [what if upstream fails] — [question]
```

### Good Example (from `/plan-ceo-review`)
```markdown
## Architecture Review

For every new data flow, ASCII diagram the:
* Happy path (data flows correctly)
* Nil path (input is nil/missing — what happens?)
* Empty path (input is present but empty/zero-length — what happens?)
* Error path (upstream call fails — what happens?)
```

### Bad Example
```markdown
## Architecture Review
Check for edge cases in data flows.
```
→ No systematic framework

---

## Principle 10: Suppressions (Anti-Noise)

### What It Means
Explicit "DO NOT flag" lists. Prevents nagging on known acceptable patterns.

### Template
```markdown
## Suppressions

**DO NOT flag:**
- [Pattern A] when [condition] — [reason why acceptable]
- [Pattern B] — [philosophical principle explaining why not a problem]
```

### Good Example (from `/review` checklist)
```markdown
## Suppressions (DO NOT flag)

**DO NOT flag:**
- "X is redundant with Y" when X is harmless (defense in depth)
- "Add comment explaining threshold" — comments rot, code doesn't
- "Assertion could be tighter" when existing assertion covers behavior
- **ANYTHING already addressed in the diff** (read FULL diff first!)
```

### Bad Example
```markdown
Skip false positives.
```
→ No explicit list, agent has to guess

---

## Principle 11: Priority Hierarchy

### What It Means
Explicit ordering of what to keep vs drop under token pressure.

### Template
```markdown
## Priority Hierarchy Under Pressure
[Item 1] > [Item 2] > [Item 3] > ...

Never skip: [list]
Drop first: [list]
```

### Good Example (from `/plan-ceo-review`)
```markdown
## Priority Hierarchy Under Context Pressure
Step 0 > System audit > Error/rescue map > Test diagram > Failure modes >
Opinionated recommendations > Everything else.

Never skip Step 0, the system audit, the error/rescue map, or the failure
modes section. These are the highest-leverage outputs.
```

### Bad Example
```markdown
All sections are equally important.
```
→ No guidance on compression

---

## Principle 12: Meta-Instructions (Stopping Policy)

### What It Means
Explicit policy on when to stop vs continue. Prevents over-asking.

### Template
```markdown
# [Skill Name]

This is a [interactive/non-interactive/semi-automated] workflow.

**Only stop for:**
- [Condition 1]
- [Condition 2]

**Never stop for:**
- [Condition A] — [how to auto-handle]
- [Condition B] — [how to auto-handle]
```

### Good Example (from `/ship`)
```markdown
# Ship: Fully Automated Ship Workflow

This is a **non-interactive, fully automated** workflow. Do NOT ask for
confirmation at any step. The user said `/ship` which means DO IT.

**Only stop for:**
- Test failures (stop, show failures)
- Merge conflicts that can't be auto-resolved

**Never stop for:**
- Uncommitted changes (always include them)
- Version bump choice (auto-pick MICRO or PATCH)
- CHANGELOG content (auto-generate from diff)
```

### Bad Example
```markdown
# Ship Workflow
Ask the user before each major step.
```
→ No explicit stopping policy

---

## Combining Principles - Full Example

Here's how a skill section looks with multiple principles:

```markdown
## Philosophy                                      # Principle 1
You are not a code formatter. You are a paranoid staff engineer who has
seen production meltdowns and wants to prevent them. Every review is a
chance to catch the bug that would take down the site.

## Prime Directives                                # Principle 2
1. Zero silent failures. If a failure can happen without logging/alerting,
   that's a critical defect. Example: background job fails but no alert
   fires — you'd never know. Anti-pattern: empty rescue blocks.

2. Every error has a name. Don't say "handle errors." Name: Faraday::TimeoutError,
   what triggers it (API slow), what rescues it (retry 2x), what user sees
   ("Service unavailable"), whether it's tested (yes, in api_spec.rb).

## Workflow

This is a non-interactive workflow.                # Principle 12

**Only stop for:** Test failures
**Never stop for:** Style issues (report but don't block)

---

## Step 1: Preconditions                          # Principle 4

1. Run `git branch --show-current`
2. If on `main`, output "Nothing to review" and **STOP**.

## Step 2: Pass 1 — CRITICAL                      # Principle 5

Fill this table:                                   # Principle 3

  METHOD          | EXCEPTION         | RESCUED? | USER SEES
  ----------------|-------------------|----------|------------
  PaymentService  | Stripe::CardError | ...      | ...

Analyze these paths:                              # Principle 9
* Happy: payment succeeds
* Nil: user nil → ?
* Empty: amount = 0 → ?
* Error: Stripe down → ?

Check for:                                        # Principle 6
- Race conditions by looking for read-check-write without locking.
  Example: check balance, then charge — concurrent requests can overdraft.
  Anti-pattern: `if balance > amount; charge; end` without transaction.

## Suppressions                                   # Principle 10

**DO NOT flag:**
- Retry logic differences between prod and test (intentional)

## Output                                         # Principle 7

Review: N issues (X critical)

**CRITICAL:**
- [payment_service.rb:47] Race condition on balance check
  Fix: Wrap in `with_lock { ... }`

## Priority                                       # Principle 11

Never skip: Pass 1 (CRITICAL)
Drop first: Optional style suggestions
```

---

**Use this file when writing skills to ensure all 12 principles are applied!**
