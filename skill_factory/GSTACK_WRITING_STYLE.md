# gstack Writing Style - The Real Secret

**Vấn đề:** Bạn nói đúng - chỉ biết cấu trúc (YAML + numbered steps) là CHƯA ĐỦ.

**Bí quyết:** Đây là CÁCH VIẾT NỘI DUNG để đạt "chất lượng gstack".

---

## 1. PHILOSOPHY SECTION (Thiết Lập Tâm Thế)

### Ví Dụ gstack (/plan-ceo-review):

```markdown
## Philosophy
You are not here to rubber-stamp this plan. You are here to make it
extraordinary, catch every landmine before it explodes, and ensure that
when this ships, it ships at the highest possible standard.

But your posture depends on what the user needs:
* SCOPE EXPANSION: You are building a cathedral. Envision the platonic ideal...
* HOLD SCOPE: You are a rigorous reviewer...
* SCOPE REDUCTION: You are a surgeon. Find the minimum viable version...
```

### Tại Sao Hiệu Quả:

✅ **Không phải lệnh khô khan** - Không nói "Review code", mà nói "make it extraordinary"
✅ **Role-playing rõ ràng** - "You are a cathedral builder" / "You are a surgeon"
✅ **Explicit mode switching** - 3 chế độ khác nhau, agent biết mình đang ở mode nào

### Pattern Học Được:

```markdown
## Philosophy
You are not [generic role]. You are here to [specific mission with emotion].

Your mental model:
* Mode A: You are [vivid metaphor]. [Core principle]. [Permission statement].
* Mode B: You are [different metaphor]. [Different principle]. [Constraint].

Critical rule: [One unbreakable law that prevents mode drift]
```

---

## 2. PRIME DIRECTIVES (Nguyên Tắc Sắt)

### Ví Dụ gstack:

```markdown
## Prime Directives
1. Zero silent failures. Every failure mode must be visible — to the system,
   to the team, to the user. If a failure can happen silently, that is a
   critical defect in the plan.

2. Every error has a name. Don't say "handle errors." Name the specific
   exception class, what triggers it, what rescues it, what the user sees,
   and whether it's tested. rescue StandardError is a code smell — call it out.

3. Data flows have shadow paths. Every data flow has a happy path and three
   shadow paths: nil input, empty/zero-length input, and upstream error.
   Trace all four for every new flow.
```

### Tại Sao Hiệu Quả:

✅ **Cụ thể, không mơ hồ** - Không nói "handle errors", mà đòi hỏi "exception class + trigger + rescue + user sees + tested"
✅ **Naming pattern** - "Shadow paths" = memorable concept
✅ **Anti-pattern call-out** - "`rescue StandardError` is a code smell"

### Pattern Học Được:

```markdown
## Prime Directives
1. [Principle name]. [What it means concretely]. [What violates it]. [Consequence].

Example:
1. Every decision has evidence. Don't say "this looks wrong." Cite file:line,
   show the diff, explain the failure mode. Vague concerns without citations
   are noise.
```

---

## 3. TABLES ENFORCE COMPLETENESS (Bắt Phải Nghĩ Hết)

### Ví Dụ gstack (Error/Rescue Map):

```markdown
Fill in this table:

  METHOD/CODEPATH          | WHAT CAN GO WRONG       | EXCEPTION CLASS
  -------------------------|-------------------------|------------------
  ExampleService#call      | API timeout             | Faraday::TimeoutError
                           | API returns 429         | RateLimitError
                           | DB pool exhausted       | ActiveRecord::ConnectionTimeoutError

  EXCEPTION CLASS              | RESCUED?  | RESCUE ACTION      | USER SEES
  -----------------------------|-----------|--------------------|-----------
  Faraday::TimeoutError        | Y         | Retry 2x, raise    | "Service unavailable"
  RateLimitError               | Y         | Backoff + retry    | Nothing (transparent)
  ConnectionTimeoutError       | N ← GAP   | —                  | 500 error ← BAD
```

### Tại Sao Hiệu Quả:

✅ **Không thể bỏ sót** - Mỗi method → phải list mọi exception → phải quyết định rescue hay không → phải quyết định user thấy gì
✅ **GAP detection** - Cột "RESCUED?" = N → tự động thấy lỗ hổng
✅ **Forces deep thinking** - Không thể hand-wave "handle errors properly"

### Pattern Học Được:

```markdown
## [Section Name]
For every [unit of work], fill in this table:

  [DIMENSION 1] | [DIMENSION 2] | [DIMENSION 3]
  --------------|---------------|---------------
  [row 1]       | ...           | ...

Rules:
* [Column X] cannot be empty
* If [Column Y] = [value], then [Column Z] must [constraint]
* Every row with [condition] is a GAP — flag it
```

---

## 4. MULTI-PATH ANALYSIS (Shadow Paths)

### Ví Dụ gstack (Data Flow):

```markdown
For every new data flow, ASCII diagram the:
* Happy path (data flows correctly)
* Nil path (input is nil/missing — what happens?)
* Empty path (input is present but empty/zero-length — what happens?)
* Error path (upstream call fails — what happens?)
```

### Ví Dụ Cụ Thể (từ checklist.md):

```markdown
#### Conditional Side Effects
Code paths that branch on a condition but forget to apply a side effect
on one branch.

Example: item promoted to verified but URL only attached when a secondary
condition is true — the other branch promotes without the URL, creating
an inconsistent record.
```

### Tại Sao Hiệu Quả:

✅ **Systematic edge case discovery** - Không dựa vào "nhớ" check edge case, mà có framework
✅ **Concrete example** - Không nói chung chung "check edge cases", mà show cụ thể "item promoted without URL"

### Pattern Học Được:

```markdown
For every [new feature], analyze these [N] paths:
1. [Path A]: [description] — [question to answer]
2. [Path B]: [description] — [question to answer]
...

Example real bug:
[Specific scenario that failed in production]
```

---

## 5. SPECIFIC > VAGUE (Luôn Luôn Cụ Thể)

### gstack: ❌ Vague vs ✅ Specific

| ❌ Vague (Tránh) | ✅ Specific (Học Theo) |
|------------------|------------------------|
| "Handle errors properly" | "Name the exception class, rescue action, what user sees, whether it's tested" |
| "Check for SQL injection" | "String interpolation in SQL — use `sanitize_sql_array` or Arel" |
| "Add tests" | "Negative-path tests that assert side effects: URL attached? callback fired?" |
| "Make sure it's secure" | "Authorization: is it scoped to right user? Can user A access user B's data by manipulating IDs?" |
| "Document the code" | "ASCII diagrams in code comments for: state transitions (Models), pipelines (Services), request flow (Controllers)" |

### Pattern Học Được:

```markdown
Instead of: "Check X"
Write:      "Check X by doing Y. Example: [concrete case]. Anti-pattern: [what NOT to do]."
```

---

## 6. ESCAPE HATCHES EVERYWHERE (Lối Thoát Sớm)

### Ví Dụ gstack (/review):

```markdown
## Step 1: Check branch

1. Run `git branch --show-current`
2. If on `main`, output "Nothing to review — you're on main" and **STOP**.
3. Run `git diff origin/main --stat`
4. If no diff, output same message and **STOP**.
```

### Ví Dụ gstack (/ship):

```markdown
## Step 1: Pre-flight

1. Check current branch. If on `main`, **abort**: "You're on main. Ship from
   a feature branch."
```

### Tại Sao Hiệu Quả:

✅ **Prevents wasted work** - Kiểm tra điều kiện ngay từ đầu
✅ **Clear failure messaging** - User biết chính xác tại sao dừng
✅ **Bold STOP/abort** - Không thể miss

### Pattern Học Được:

```markdown
## Step N: [Action]

1. Check [precondition]
2. If [failure condition], output "[clear message]" and **STOP**.
3. Proceed only if [success condition]
```

---

## 7. TWO-PASS ARCHITECTURE (Ưu Tiên Rõ Ràng)

### Ví Dụ gstack (/review checklist):

```markdown
**Two-pass review:**
- **Pass 1 (CRITICAL):** SQL & Data Safety, LLM Trust Boundary — can block /ship
- **Pass 2 (INFORMATIONAL):** All remaining categories — included in PR but don't block
```

### Ví Dụ gstack (/plan-ceo, Section 2):

```markdown
## Step 0: Nuclear Scope Challenge + Mode Selection

[Runs first, stops for user decision]

**STOP.** AskUserQuestion. Do NOT proceed until user responds.

## Review Sections (10 sections, after scope and mode are agreed)

[Only runs after Step 0 approved]
```

### Tại Sao Hiệu Quả:

✅ **Blocking vs non-blocking explicit** - User biết đâu là must-fix, đâu là nice-to-have
✅ **Sequential gates** - Không lãng phí effort review detail khi scope sai
✅ **Clear priority** - Team focus vào CRITICAL trước

### Pattern Học Được:

```markdown
## Pass 1: [Tier Name] (BLOCKING)
[Critical checks that stop the workflow]

**If any fail:** **STOP**. Fix these before proceeding.

## Pass 2: [Tier Name] (NON-BLOCKING)
[Nice-to-have checks, reported but don't block]
```

---

## 8. SUPPRESSIONS (Anti-Noise Lists)

### Ví Dụ gstack (checklist.md):

```markdown
## Suppressions (DO NOT flag)

**DO NOT flag:**
- "X is redundant with Y" when X is harmless (defense in depth)
- "Add comment explaining threshold" — comments rot, code doesn't
- "Assertion could be tighter" when existing assertion covers behavior
- **ANYTHING already addressed in the diff** (read FULL diff first!)
```

### Tại Sao Hiệu Quả:

✅ **Prevents nagging** - Agent không flag những thứ đã biết là false positive
✅ **Teaches taste** - "Comments rot, code doesn't" = design philosophy
✅ **Context-aware** - "Already in the diff" = must read holistically

### Pattern Học Được:

```markdown
## Suppressions

**Never flag:**
- [Pattern A] — [reason why it's acceptable]
- [Pattern B] when [condition] — [context makes it OK]
- [Pattern C] — [philosophical principle explaining why not a problem]
```

---

## 9. CONTEXT HIERARCHY (Compression Under Pressure)

### Ví Dụ gstack (/plan-ceo):

```markdown
## Priority Hierarchy Under Context Pressure
Step 0 > System audit > Error/rescue map > Test diagram > Failure modes >
Opinionated recommendations > Everything else.

Never skip Step 0, the system audit, the error/rescue map, or the failure
modes section. These are the highest-leverage outputs.
```

### Tại Sao Hiệu Quả:

✅ **Handles token limits** - Biết cái gì drop trước khi hết context
✅ **Explicit must-have** - "Never skip X" = contract
✅ **Value-ranked** - Không phải "all equally important"

### Pattern Học Được:

```markdown
## Priority Hierarchy Under Token Pressure
[Item 1] > [Item 2] > [Item 3] > ...

Never skip: [list]
Drop first: [list]
```

---

## 10. CONCRETE EXAMPLES (Luôn Có Ví Dụ Thật)

### Ví Dụ gstack (checklist.md):

```markdown
#### Conditional Side Effects
- Code paths that branch on a condition but forget to apply a side effect on
  one branch. Example: item promoted to verified but URL only attached when
  a secondary condition is true — the other branch promotes without the URL,
  creating an inconsistent record.
```

### Ví Dụ gstack (Data Flow):

```markdown
#### Time Window Safety
- Date-key lookups that assume "today" covers 24h — report at 8am PT only
  sees midnight→8am under today's key
```

### Tại Sao Hiệu Quả:

✅ **Not abstract** - Không nói "check for bugs", mà show "item promoted without URL"
✅ **Memorable** - "8am PT only sees midnight→8am" = cụ thể dễ nhớ
✅ **Actionable** - Developer thấy ngay pattern cần tránh

### Pattern Học Được:

```markdown
[Principle]. Example: [specific concrete scenario that breaks].
Anti-pattern: [what NOT to do].
```

---

## 11. TERSE OUTPUT FORMAT (Ngắn Gọn Sắc Bén)

### Ví Dụ gstack (checklist.md):

```markdown
**Output format:**
Pre-Landing Review: N issues (X critical, Y informational)

**CRITICAL** (blocking /ship):
- [file:line] Problem description
  Fix: suggested fix

**Issues** (non-blocking):
- [file:line] Problem description
  Fix: suggested fix

If no issues found: `Pre-Landing Review: No issues found.`

Be terse. For each issue: one line describing the problem, one line with
the fix. No preamble, no summaries, no "looks good overall."
```

### Tại Sao Hiệu Quả:

✅ **High signal-to-noise** - Không có fluff
✅ **Scannable** - Developer scan nhanh được tất cả issues
✅ **Actionable** - Mỗi issue đi kèm fix cụ thể

### Pattern Học Được:

```markdown
**Output:**
[Summary line with counts]

[Category 1]:
- [location] [problem]
  Fix: [action]

Rules:
- One line problem, one line fix
- No preamble, no "overall this is good"
- File:line citations mandatory
```

---

## 12. META-INSTRUCTIONS (Hướng Dẫn Về Hướng Dẫn)

### Ví Dụ gstack (/ship):

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

### Tại Sao Hiệu Quả:

✅ **Explicit stopping policy** - Agent biết chính xác khi nào dừng vs khi nào tiếp tục
✅ **Prevents over-asking** - "Never stop for X" = permission to decide
✅ **User intent captured** - "User said `/ship` which means DO IT"

### Pattern Học Được:

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

---

## TÓM TẮT: 12 Nguyên Tắc Viết Skill gstack-Quality

| # | Nguyên Tắc | Công Thức |
|---|------------|-----------|
| 1 | **Philosophy** | Role-play vivid (cathedral/surgeon) + mode switching + unbreakable rule |
| 2 | **Prime Directives** | Cụ thể > mơ hồ, name anti-patterns, concrete consequences |
| 3 | **Tables** | Enforce completeness, detect GAPs automatically, prevent hand-waving |
| 4 | **Multi-Path** | Happy + Nil + Empty + Error (systematic edge case discovery) |
| 5 | **Specific > Vague** | "Check X by doing Y, Example: Z, Anti-pattern: W" |
| 6 | **Escape Hatches** | Check preconditions early, **STOP** with clear message |
| 7 | **Two-Pass** | CRITICAL (blocking) first, INFORMATIONAL (non-blocking) second |
| 8 | **Suppressions** | "DO NOT flag X when Y" (teach taste, prevent noise) |
| 9 | **Priority Hierarchy** | "Never skip X, drop Y first under pressure" |
| 10 | **Concrete Examples** | Real bugs from production, not abstract principles |
| 11 | **Terse Output** | One line problem, one line fix, file:line mandatory |
| 12 | **Meta-Instructions** | Explicit stopping policy ("only stop for X, never for Y") |

---

## Template Áp Dụng 12 Nguyên Tắc

```markdown
---
name: my-skill
version: 1.0.0
description: [One sentence]
allowed-tools: [Bash, Read, ...]
---

# [Skill Name]

## Philosophy                                          # Nguyên tắc 1
You are not [generic]. You are [vivid role]. [Mission].

Your mental model: [3 modes with metaphors]

Critical rule: [Unbreakable law]

## Prime Directives                                    # Nguyên tắc 2
1. [Principle]. [Concrete meaning]. [Anti-pattern]. [Consequence].
2. [Principle]. [Specific checklist]. [Example violation].

## [Workflow Name]

This is a [interactive/non-interactive] workflow.     # Nguyên tắc 12

**Only stop for:**
- [Condition 1]

**Never stop for:**
- [Condition A] — [auto-handle how]

---

## Step 1: [Preconditions]                            # Nguyên tắc 6

1. Check [condition]
2. If [failure], output "[message]" and **STOP**.

## Step 2: [Pass 1 - CRITICAL]                        # Nguyên tắc 7

For every [unit], fill this table:                    # Nguyên tắc 3

  [COL 1] | [COL 2] | [COL 3]
  --------|---------|--------
  ...     | ...     | ...

Rules:
- [Column X] cannot be [value] — that's a GAP
- If [Column Y] = [Z], flag it

Analyze these paths:                                  # Nguyên tắc 4
* Happy path: [what]
* Nil path: [what]
* Empty path: [what]
* Error path: [what]

## Step 3: [Pass 2 - INFORMATIONAL]                   # Nguyên tắc 7

Check for:                                            # Nguyên tắc 5
- [Pattern A] by doing [B]. Example: [C]. Anti-pattern: [D].

## Suppressions                                        # Nguyên tắc 8

**DO NOT flag:**
- [Pattern X] when [Y] — [reason]

## Output Format                                       # Nguyên tắc 11

[Skill Name]: N issues (X critical, Y info)

**CRITICAL:**
- [file:line] [problem]
  Fix: [action]

Rules: One line problem, one line fix. No preamble.

## Priority Under Pressure                             # Nguyên tắc 9

Never skip: [must-have list]
Drop first: [nice-to-have list]

---

## Examples                                            # Nguyên tắc 10

Real bug from production:
[Specific scenario that failed]

How this skill would catch it:
[Concrete detection]
```

---

**KẾT LUẬN:**

Bạn nói đúng - cấu trúc (YAML + steps) chỉ là 20%.

**80% còn lại** = 12 nguyên tắc viết NỘI DUNG này.

Học 12 cái này → viết skills đạt chất lượng gstack. 🎯
