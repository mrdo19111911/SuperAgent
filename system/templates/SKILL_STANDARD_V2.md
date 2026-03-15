# SKILL STANDARD — V2.0 (Corrected from gstack)

> **Objective:** Accurate skill-building guide based on real gstack patterns (not assumptions).
> **Updated:** 2026-03-16 after reading all 8 gstack skills.

---

## 📐 Skill Anatomy (The Truth)

### 95% of Skills: Just Markdown

```
~/.claude/skills/
└── skill-name/
    └── SKILL.md           # That's it. No code.
```

**Examples:**
- `/ship` → ship/SKILL.md (14KB, pure workflow)
- `/plan-ceo-review` → plan-ceo-review/SKILL.md (33KB, pure prompt)
- `/retro` → retro/SKILL.md (pure git log analysis)

### When You Need Multiple Files (Still No Code!)

```
review/
├── SKILL.md               # Main workflow (4.8KB)
├── checklist.md          # Validation categories (6.9KB)
└── greptile-triage.md    # Optional integration (4.4KB)
```

**Why split?**
- SKILL.md would be >15KB (hard to read/edit)
- Checklist changes independently from workflow
- Still 100% markdown - NO CODE

### The 5% Exception: Browser Skills

```
browse/
├── SKILL.md              # Thin wrapper (4KB prompt)
├── src/                  # TypeScript server + Playwright
│   ├── cli.ts
│   ├── server.ts
│   └── browser-manager.ts
├── dist/browse           # Compiled binary (~58MB)
└── test/
```

**Why code here?**
- Need persistent Chromium process
- Claude can't control browser directly
- Binary acts as "remote hands"

---

## ⚡ File Structure Rules

### Rule 1: Start with YAML Front Matter

Every SKILL.md starts with:

```yaml
---
name: skill-name
version: 1.0.0
description: One sentence what this does
allowed-tools:
  - Bash
  - Read
  - Edit
  - Grep
  - AskUserQuestion
---
```

**Critical:** `allowed-tools` = security boundary (agent CANNOT use tools not listed)

---

### Rule 2: Numbered Workflow Steps

```markdown
## Step 1: Check branch

1. Run `git branch --show-current`
2. If on `main`, output "Nothing to review" and STOP.

## Step 2: Get diff

```bash
git diff origin/main
```

Parse for changed files.

## Step 3: Apply checklist

Read `.claude/skills/review/checklist.md`
...
```

**Pattern:**
- Always numbered (Step 1, 2, 3...)
- Code blocks for commands (copy-paste ready)
- **Bold for critical actions** and **STOP conditions**

---

### Rule 3: When to Split Files

**Keep in 1 file if:**
- ✅ SKILL.md < 15KB
- ✅ Workflow is linear
- ✅ No shared components

**Split into multiple .md if:**
- ❌ SKILL.md > 15KB
- ❌ Checklist changes independently (like review categories)
- ❌ Multiple skills share same data (like common suppressions)

**Example split:**
```markdown
# In SKILL.md:
## Step 3: Apply checklist
Read `.claude/skills/review/checklist.md`
For each category, scan the diff...

# In checklist.md:
## Pass 1 (CRITICAL)
- SQL injection check
- Race conditions
...

## Pass 2 (INFORMATIONAL)
- Magic numbers
- Test gaps
...
```

---

## 🎯 The 10 gstack Techniques (From Real Code)

| # | Technique | What It Means | Example |
|---|-----------|---------------|---------|
| 1 | **Non-Interactive Default** | Don't ask unless CRITICAL | `/ship` runs straight through, only stops on test failure |
| 2 | **Explicit STOP** | Bold **STOP** on errors | "If tests fail: **STOP**. Do not proceed." |
| 3 | **Two-Pass Review** | CRITICAL first, then INFO | `/review` Pass 1: SQL safety → Pass 2: code smells |
| 4 | **File:Line Evidence** | Every finding = concrete location | "Race condition at user.rb:47" not "there's a race" |
| 5 | **Suppressions List** | Known false positives | `checklist.md` has "DO NOT flag" section |
| 6 | **Graceful Degradation** | Optional deps fail silently | "If Greptile unavailable: skip that step" |
| 7 | **History Learning** | Read past mistakes | `~/.gstack/greptile-history.md` saves FPs |
| 8 | **Auto-Decide Small Things** | Only ask for BIG decisions | `/ship` auto-picks MICRO/PATCH, only asks for MINOR/MAJOR |
| 9 | **Bisectable Commits** | Small, logical chunks | Each commit = one coherent change |
| 10 | **Mode Enforcement** | Tables force completeness | `/plan-ceo` error/rescue map = can't skip edge cases |

---

## 📊 Three Skill Types (Real Distribution)

### Type 1: Pure Workflow (95%)

**What:** Just markdown workflow instructions
**When:** Any task that's git/bash/file operations
**Examples:** /ship, /plan-ceo, /retro, /plan-eng

**Structure:**
```
skill-name/
└── SKILL.md     # 5-30KB, pure workflow
```

**Template:**
```yaml
---
name: my-skill
version: 1.0.0
description: What this does
allowed-tools: [Bash, Read, Edit]
---

# My Skill

## Step 1: Do X
bash command


## Step 2: Do Y
another command
```

---

### Type 2: Workflow + Helpers (4%)

**What:** SKILL.md + supporting .md files (still no code!)
**When:** Checklist too long, or shared data
**Examples:** /review (checklist.md), /ship (could split if it grows)

**Structure:**
```
skill-name/
├── SKILL.md        # Main flow
├── checklist.md    # Validation rules
└── helpers.md      # Shared logic
```

---

### Type 3: Workflow + Binary (1%)

**What:** SKILL.md + compiled code
**When:** Need external process (browser, language server)
**Examples:** /browse, /qa

**Structure:**
```
skill-name/
├── SKILL.md
├── src/            # TypeScript
├── dist/binary     # Compiled
└── setup           # Build script
```

**Only do this if:**
- ✅ Need persistent state (browser tabs)
- ✅ Need external tool (Chromium, LSP)
- ✅ Performance critical (parsing 100MB+ files)

**Otherwise:** Use Type 1 (pure markdown)!

---

## 🧬 Skill DNA (What Makes It "gstack Quality")

### Metadata Layer
```yaml
allowed-tools: [...]   # Security firewall
version: 1.0.0         # Track evolution
```

### Workflow Layer
- ✅ Numbered steps (1, 2, 3...)
- ✅ Bold **STOP** conditions
- ✅ Code blocks (copy-paste ready)
- ✅ Escape hatches (early exit on `main` branch)

### Evidence Layer
- ✅ File:line citations
- ✅ Before/after diffs
- ✅ Concrete examples, not vague descriptions

### Learning Layer
- ✅ History files (`~/.gstack/greptile-history.md`)
- ✅ Suppressions ("DO NOT flag" lists)
- ✅ Trend tracking (retro snapshots)

### UX Layer
- ✅ Non-interactive by default
- ✅ AskUserQuestion only for genuine decisions
- ✅ Clear progress indicators ("Step 3/8...")

---

## 📝 Template: Minimal Skill (60 seconds)

```bash
# Create folder
mkdir -p ~/.claude/skills/analyze-security

# Create SKILL.md
cat > ~/.claude/skills/analyze-security/SKILL.md <<'EOF'
---
name: analyze-security
version: 1.0.0
description: Scan for hardcoded secrets and dependency vulnerabilities
allowed-tools:
  - Bash
  - Grep
  - Read
---

# Security Analyzer

## Step 1: Scan for secrets

```bash
grep -r "API_KEY\|PASSWORD\|SECRET" src/ --exclude-dir=node_modules
```

If matches found: **STOP** and report locations.

## Step 2: Check dependencies

```bash
npm audit --production
```

If CRITICAL vulnerabilities: list with CVE numbers.

## Step 3: Report

Output:
- Secrets found: [file:line]
- CVEs: [package@version → CVE-XXXX-YYYY]

EOF

# Use it
/analyze-security
```

**That's it. No TypeScript, no server, no binary. Just markdown.**

---

## ✅ Checklist: Is This Skill "gstack Quality"?

**Metadata:**
- [ ] YAML front matter with `allowed-tools`
- [ ] Version number (semver)
- [ ] One-sentence description

**Workflow:**
- [ ] Numbered steps
- [ ] Bold **STOP** conditions
- [ ] Code blocks for commands
- [ ] Early exits (e.g., "if on main, abort")

**Evidence:**
- [ ] File:line citations
- [ ] Concrete examples, not vague
- [ ] Show diffs/before-after

**UX:**
- [ ] Non-interactive (runs straight through)
- [ ] AskUserQuestion only for critical decisions
- [ ] Clear error messages with fixes

**Files:**
- [ ] < 15KB per .md file (split if larger)
- [ ] No code unless ABSOLUTELY needed (browser/LSP)

---

## 🎓 Common Mistakes (Corrected)

### ❌ Mistake 1: "Every skill needs code"
**Truth:** 95% are pure markdown. Only `/browse` and `/qa` have code.

### ❌ Mistake 2: "Skills go in system/skills/"
**Truth:** gstack uses `~/.claude/skills/` (global) or `.claude/skills/` (project)

### ❌ Mistake 3: "Checklists should be in SKILL.md"
**Truth:** If checklist > 50 lines, move to separate .md file

### ❌ Mistake 4: "Binary skills are simpler"
**Truth:** Binary skills are HARDER (need build, tests, cross-platform). Avoid unless necessary.

### ❌ Mistake 5: "Ask user for every decision"
**Truth:** Auto-decide small things (like MICRO/PATCH version bump). Only ask for BIG decisions (MINOR/MAJOR, or CRITICAL bug fixes).

---

## 🚀 To Build 100 Skills

**You DON'T need:**
- ❌ TypeScript skills
- ❌ Bun/npm expertise
- ❌ Binary compilation knowledge
- ❌ Server architecture

**You ONLY need:**
1. ✅ Know bash/git commands
2. ✅ Write clear workflows (numbered steps)
3. ✅ Copy template above
4. ✅ Fill in your domain logic

**Time per skill:** 5-30 minutes (not days!)

---

**END OF STANDARD V2.0**

This is the REAL gstack way. Not theoretical - extracted from actual code.
