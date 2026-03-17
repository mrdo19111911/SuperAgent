# CEO Tool Usage

## Tool 1: Read

**Use for:**
- Reading CLAUDE.md, TODOS.md, architecture docs (Pre-Review Audit)
- Reading plan files (SPEC.md, ARCHITECTURE.md, CONTRACT_DRAFT.md)
- Reading existing code to understand patterns (Taste Calibration)

**Pattern:**
```bash
# Pre-Review Audit
Read CLAUDE.md
Read TODOS.md
Read ARCHITECTURE.md (if exists)

# Plan review
Read artifacts/task-123/SPEC.md
Read artifacts/task-123/plan.md

# Taste calibration (EXPANSION mode)
Read services/well_designed_service.rb
Read components/WellDesignedComponent.tsx
```

**DO NOT:**
- Read entire codebase (use Grep/Glob to find specific files)
- Read files not touched by plan (focus on relevant context)

---

## Tool 2: Grep

**Use for:**
- Finding TODO/FIXME/HACK comments in files plan touches
- Searching for existing patterns (e.g., "rescue StandardError" smell)
- Finding similar implementations (Existing Code Leverage)

**Pattern:**
```bash
# Find TODOs in files plan touches
grep -r "TODO\|FIXME\|HACK\|XXX" app/services/order_processor.rb

# Find error handling patterns
grep -r "rescue StandardError" app/services/

# Find existing implementations
grep -r "class.*Processor" app/services/
```

**DO NOT:**
- Grep without context (always specify files or directories)
- Use grep for reading file contents (use Read instead)

---

## Tool 3: Glob

**Use for:**
- Finding files matching pattern (e.g., all services, all controllers)
- Counting files plan touches (Complexity Check)

**Pattern:**
```bash
# Find all services
glob "app/services/*.rb"

# Count controllers plan touches
glob "app/controllers/*orders*.rb"

# Find test files
glob "spec/**/*_spec.rb"
```

**DO NOT:**
- Glob without specific pattern (too broad)
- Use glob to read contents (use Read after glob finds files)

---

## Tool 4: Bash

**Use for:**
- Pre-Review Audit commands (git log, git diff, git stash list)
- Checking file metadata (line count, last modified)
- Running project-specific audit scripts

**Pattern:**
```bash
# Pre-Review Audit
git log --oneline -30
git diff main --stat
git stash list
grep -r "TODO\|FIXME\|HACK\|XXX" --include="*.ts" --include="*.js" --include="*.py" -l

# Complexity checks
find app/services -name "*.rb" -exec wc -l {} + | sort -n
git diff main --numstat | wc -l

# Recently touched files
find app -name "*.rb" -newer Gemfile.lock | head -20
```

**DO NOT:**
- Make code changes via bash (read-only operations only)
- Run destructive commands (git reset, rm -rf, etc.)

---

## Tool 5: AskUserQuestion

**Use for:**
- Mode selection (Step 0F)
- Every issue found (one question per issue)
- Unresolved decisions (architecture alternatives, trade-offs)

**Pattern:**
```markdown
## Step 0F: Mode Selection

Based on analysis:
- Premise: Valid (real user pain)
- Existing code leverage: Medium (can reuse report_exporter)
- 12-month vision: Move toward event-driven
- Complexity: Plan touches 8 files (threshold)

I recommend **EXPANSION** because this is greenfield and opportunity for platform.

**Options:**

A) **SCOPE EXPANSION** - Build collections system (not just favorites)
   - Effort: 2 days → 4 days (2x)
   - Value: 1 feature → 5 features (favorites, wishlist, compare, custom)

B) **HOLD SCOPE** - Build favorites only as planned
   - Effort: 2 days (as planned)
   - Value: 1 feature (favorites)

C) **SCOPE REDUCTION** - Defer UI, ship API-only
   - Effort: 2 days → 1 day
   - Value: API foundation only, UI in follow-up PR

Which mode do you choose?
```

**Critical rules:**
1. **Present 2-3 lettered options**
2. **State recommendation FIRST** ("I recommend B")
3. **Explain WHY** (1-2 sentences)
4. **One question per issue** (no batching, except SMALL CHANGE mode)
5. **Lead with directive** ("Do B. Here's why:" not "Maybe B?")
6. **Map to preferences** (engineering preferences or business goals)

**DO NOT:**
- Batch multiple issues into one question
- Ask yes/no questions (always present lettered options)
- Ask open-ended without explaining ambiguity
- Continue to next section without waiting for answer

---

## Tool Combinations

### Pre-Review Audit
```bash
# 1. Git audit
Bash: git log --oneline -30
Bash: git diff main --stat
Bash: git stash list

# 2. Find TODOs
Bash: grep -r "TODO\|FIXME" --include="*.ts" -l

# 3. Read docs
Read: CLAUDE.md
Read: TODOS.md

# 4. Taste calibration (EXPANSION only)
Glob: app/services/*.rb
Read: app/services/payment_processor.rb (well-designed)
Read: app/services/legacy_importer.rb (anti-pattern)
```

### Existing Code Leverage (Step 0B)
```bash
# 1. Search for similar implementations
Grep: "class.*Exporter" app/services/

# 2. Find all exporters
Glob: app/services/*exporter*.rb

# 3. Read existing exporter
Read: app/services/report_exporter.rb

# 4. Ask user about reuse
AskUserQuestion: "ExportService already does CSV export for invoices. Reuse it?"
```

### Complexity Check (Step 0)
```bash
# 1. Count files touched
Bash: git diff main --name-only | wc -l

# 2. Count new classes
Grep: "^class " app/services/*.rb app/models/*.rb

# 3. Ask if too complex
AskUserQuestion: "Plan touches 12 files, introduces 3 new classes. Smell? Suggest REDUCTION?"
```

---

## Tool Efficiency (Token Optimization)

**High efficiency:**
- Grep → Glob → Read (narrow down before reading)
- Bash commands for metadata (wc -l, git diff --stat)
- AskUserQuestion with clear options (avoid back-and-forth)

**Low efficiency:**
- Read entire files without Grep first
- Multiple rounds of AskUserQuestion for same issue (should present all options upfront)
- Bash commands that output large results (use `head -20` to limit)

---

**Token Count:** ~1,000 tokens
