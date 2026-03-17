# Changelog - /task Dispatcher Implementation

> **Date:** 2026-03-17
> **Feature:** Nash Task Dispatcher (`/task` slash command)
> **Status:** ✅ COMPLETE

---

## 🎯 Summary

Đã implement **`/task` slash command** - điểm vào CHÍNH của Nash Framework để tự động dispatch tasks qua 6 SDLC pipelines.

**Usage:**
```
/task Implement user authentication module
/task Fix critical login bug
/task {multi-task with dependencies}
```

---

## 📦 Files Created/Modified

### Created:
1. **`.claude/commands/task.md`** (15KB)
   - Main Nash Task Dispatcher
   - 4-step workflow (Intake → Audit → Route → Execute)
   - Integrates with main.md, AUDIT.md, NASH_SUBAGENT_PROMPTS.md
   - Supports 6 pipeline types (Trivial, Simple, Complex, Critical, NASH, Urgent)
   - Enforces 11 critical rules
   - Multi-task DAG support with topological sort

2. **`SETUP_STATUS.md`** (new)
   - Complete setup status documentation
   - /task usage guide with 3 example workflows
   - Pipeline types table
   - Critical rules reference

### Modified:
3. **`AUTO_SETUP.md`**
   - Added Step 3.9: Install Nash Task Dispatcher
   - Includes full /task.md template (inline in setup guide)
   - Auto-generates /task command on new machine setup

4. **`QUICK_START.md`**
   - Updated expected results to include `/task`
   - Updated test commands to use `/task` as primary example
   - Now shows 4 Nash commands + 4 gstack commands (if available)

---

## 🔥 /task Command Features

### STEP 1: Intake & Clarification
- Loads `main.md` (Dũng PM's Operating System)
- Asks questions if request unclear:
  - Module type? (New / Fix / Enhancement / Emergency)
  - Scope? (Tier? Existing code or greenfield?)
  - Constraints? (Deadline? Tech stack? Dependencies?)
- **DO NOT GUESS** - clarify until crystal clear

### STEP 2: Run 12-Dimension Audit
- Loads `system/AUDIT.md`
- Spawns 3 parallel audits:
  - **Conan** (Req-Aud) → `audit_business.md` (C1, C2, C3, C9, C10)
  - **Phúc SA + Mộc** → `audit_technical.md` (C4, C5, C6, C7, C8)
  - **Xuân + Huyền** → `audit_integration.md` (C11, C12)
- Merges via `bash scripts/merge_audit.sh`
- Output: `AUDIT_REPORT_FINAL.md`

### STEP 3: Route to Pipeline(s)
- Loads `system/MIXTURE_OF_EXPERTS_ROUTER.md`
- Analyzes audit signals → selects pipeline(s):

| Audit Signal | Pipeline | File |
|--------------|----------|------|
| C1 empty, new domain | Pipeline 0.5: Research | `system/pipelines/00_RESEARCH.md` |
| C1 empty, C2 gaps | Pipeline 1: Requirements | `system/pipelines/01_requirements.md` |
| C4 spaghetti, C8 no schema | Pipeline 2: Architecture | `system/pipelines/02_architecture.md` |
| FE module | Design Flow | `system/pipelines/design_flow_CUSTOM.md` |
| C11/C12 code gaps | Pipeline 3: Coding | `system/pipelines/03_coding.md` |
| C6 no tests, C10 bugs | Pipeline 4: Testing | `system/pipelines/04_testing.md` |
| C5/C7 security/deployment | Pipeline 5: Security | `system/pipelines/05_security.md` |
| Production P0 bug | Pipeline 6: Hotfix | `system/pipelines/06_hotfix.md` |

- Presents plan → Waits for user approval

### STEP 4: Execute Pipeline(s)
For each phase:
1. **Load pipeline file** (e.g., `system/pipelines/02_architecture.md`)
2. **Load required agents** from `agents/core/`, `agents/dev/`, etc.
3. **Load agent skills** via `node bin/nash list-skills`
4. **Dispatch sub-agents** using `system/templates/NASH_SUBAGENT_PROMPTS.md` v6.2
5. **Run quality gate** (`gates/validate.sh`, `gates/qa.sh`, etc.)
6. **Write LEDGER** (`artifacts/{task}/LEDGER.md`)
7. **Report progress** to user

---

## 📊 Pipeline Types (Auto-Selected)

Based on Story Points (SP) estimation:

| Type | Story Points | Phases | Use Case |
|------|-------------|--------|----------|
| **Trivial** | <3 SP | A, B, C | Simple fixes, config changes |
| **Simple** | 3-10 SP | A, B, C, D | Single-feature additions |
| **Complex** | 10-30 SP | A, B, B2, C, D, E | Multi-component features |
| **Critical** | 30+ SP | A, B, B2, C, D, E, F | Cross-module, new contracts |
| **NASH** | N/A | Debate (k=2) | Exploratory, research, design |
| **Urgent** | N/A | Execute-first | Production incidents |

**Phase labels:**
- A = Define criteria (THESIS)
- B = Audit completeness (AT#1)
- B2 = Audit correctness (AT#2) - Complex/Critical only
- C = Execute deliverable (THESIS)
- D = Verify functional (AT#1)
- E = Verify non-functional (AT#2) - Complex/Critical only
- F = Cross-cutting review (AT#3) - Critical only

---

## 🧰 Multi-Task DAG Support

When user provides N tasks with dependencies:

1. **Build DAG** from cross-task dependencies
2. **Topological sort** → layers (L0, L1, L2...)
3. **Batch by layer** (≤30K tokens/batch)
4. **Execute:**
   - Same-layer tasks → **Parallel**
   - Cross-layer tasks → **Sequential**

**Example:**
```
/task
1. Design API contracts for user service
2. Implement user CRUD endpoints (depends on #1)
3. Add integration tests (depends on #2)
```

**DAG:**
```
L0: Task 1 (API contracts)
L1: Task 2 (CRUD) - depends on L0
L2: Task 3 (Tests) - depends on L1
```

**Execution:** L0 → L1 → L2 (sequential, wait for each layer to complete)

---

## ⚠️ 11 Critical Rules Enforced

1. **Rule 0:** Token Conservation
   - Read files ONLY when needed (not preload everything)
   - Load order: main.md → user request → audit → pipeline → agents

2. **Rule 1:** Nash Triad
   - THESIS → ANTI-THESIS → SYNTHESIS
   - No self-approval allowed

3. **Rule 2:** Evidence-Based Scoring
   - Every LEDGER entry needs:
     - Location (file:line or function)
     - Evidence (code snippet / log / commit hash)
     - Severity (P0-P4)
   - Fabrication = -30 pts (M3 multiplier)

4. **Rule 3:** PEN Entries = Hard Constraints
   - Check agent's PEN before dispatch:
     ```bash
     grep -A5 "## 🚫 PEN" agents/core/{agent}.md
     ```
   - If agent has PEN for similar mistake → assign different agent OR warn

5. **Rule 4:** Gate Scripts Are Law
   - NO manual overrides
   - If gate fails → Fix → Re-run → Repeat until PASS

6. **Rule 5:** Targeted Git Operations
   - ✅ GOOD: `git add artifacts/{task}/`
   - ❌ BAD: `git add .` or `git add -A`
   - Use `gates/commit.sh` for safe commits

7. **Rule 6:** Multi-Task DAG
   - Build dependency DAG
   - Topological sort → layers
   - Batch ≤30K tokens
   - Same-layer → parallel, Cross-layer → sequential

8. **Rule 7:** M1/M2/M3 Multipliers
   - **M1:** Main catches AT's miss → 2× penalty for AT
   - **M2:** AT#2 catches AT#1 miss → 2× penalty for AT#1 (Complex/Critical)
   - **M3:** No evidence → -30 pts (fabrication)

9. **Rule 8:** Split Strategy
   - If task >30K tokens:
     - Split by natural unit (deliverable/section/component)
     - Designate **shared-artifact owner**
     - Other splits produce delta instructions (NOT direct edits)

10. **Rule 9:** Retry Limit
    - Max 3 retries per tier
    - After 3 FAILs → escalate to user
    - Same error 3× → Thesis gets -15 pts

11. **Rule 10:** LEDGER Ownership
    - **Only Main Agent writes LEDGER**
    - Sub-agents CANNOT write LEDGER
    - Sub-agents CANNOT see their own scores during work

---

## 📋 Example Workflows

### Example 1: New Feature Implementation

**User command:**
```
/task Implement user authentication module
```

**Workflow:**
1. **STEP 1:** Clarify
   - "Is this new module or enhancement?"
   - "Tech stack? JWT/OAuth/Session?"
   - "User schema exists?"

2. **STEP 2:** Audit
   - Run 12-dimension audit on `modules/auth/`
   - Output: `AUDIT_REPORT_FINAL.md`

3. **STEP 3:** Route
   - C1 (Business): Missing user stories → Pipeline 1 (Requirements)
   - C4 (Architecture): No schema → Pipeline 2 (Architecture)
   - C11 (Backend): Need implementation → Pipeline 3 (Coding)
   - C10 (Testing): Need coverage → Pipeline 4 (Testing)

4. **STEP 4:** Execute
   - Phase 1: Requirements (Simple, 5 SP)
   - Phase 2: Architecture (Complex, 15 SP)
   - Phase 3: Coding (Complex, 20 SP)
   - Phase 4: Testing (Simple, 8 SP)

---

### Example 2: Bug Fix (Hotfix)

**User command:**
```
/task Fix critical login bug - users can't authenticate
```

**Workflow:**
1. **STEP 1:** Emergency intake
   - "Production affected?"
   - "Error messages?"
   - "Since when?"

2. **STEP 2:** Quick audit (C5, C8, C11 only)

3. **STEP 3:** Route → Pipeline 6 (Hotfix, Urgent)

4. **STEP 4:** Execute
   - S1: Tùng Diag + Lân diagnose → Fix → Deploy (THESIS)
   - S2: Mộc reviews post-execution (AT)
   - S3: You decide (ACCEPT with backlog / ROLLBACK)

---

### Example 3: Multi-Task with Dependencies

**User command:**
```
/task
1. Design API contracts for user service
2. Implement user CRUD endpoints (depends on #1)
3. Add integration tests (depends on #2)
```

**Workflow:**
1. **STEP 1:** Confirm dependencies (stated)

2. **STEP 2:** Audit (per task)

3. **STEP 3:** Build DAG
   ```
   L0: Task 1 (API contracts)
   L1: Task 2 (CRUD) - depends on L0
   L2: Task 3 (Tests) - depends on L1
   ```

4. **STEP 4:** Execute sequentially (L0 → L1 → L2)
   - Batch 1: Pipeline 2 (Architecture) for Task 1
   - Batch 2: Pipeline 3 (Coding) for Task 2
   - Batch 3: Pipeline 4 (Testing) for Task 3

---

## 🔗 Integration Points

### Files Loaded:
- **`main.md`** - Dũng PM's Operating System (entry point)
- **`system/AUDIT.md`** - 12-dimension audit specification
- **`system/MIXTURE_OF_EXPERTS_ROUTER.md`** - Pipeline routing logic
- **`system/templates/NASH_SUBAGENT_PROMPTS.md`** - v6.2 dispatch template
- **`system/SCORING_RULES.md`** - P0-P4 scoring tables
- **`system/MEMORY_EVICTION_PROTOCOL.md`** - L2/RAM/HDD eviction

### Pipelines:
- **`system/pipelines/00_RESEARCH.md`** - Domain research (optional)
- **`system/pipelines/01_requirements.md`** - Requirements & user stories
- **`system/pipelines/02_architecture.md`** - Architecture & DB design
- **`system/pipelines/03_coding.md`** - Coding & development
- **`system/pipelines/04_testing.md`** - Testing & QA
- **`system/pipelines/05_security.md`** - Security & deployment
- **`system/pipelines/06_hotfix.md`** - Emergency hotfix
- **`system/pipelines/design_flow_CUSTOM.md`** - FE wireframing (6 stages)
- **`system/pipelines/fe_implementation_CUSTOM.md`** - FE code from wireframes

### Agents:
- **Core:** `agents/core/{agent}.md` (7 agents, always available)
  - dung-manager, phuc-sa, moc-arch-chal, son-qa, tung-diag, conan-req-aud, xuan-spec-rev
- **Dev:** `agents/dev/{agent}.md` (10 agents, load on-demand)
  - lan-backend, hoang-fe, thuc-fullstack, hung-devops, etc.
- **Research:** `agents/research/{agent}.md` (5 agents)
- **User:** `agents/user/{agent}.md` (3 agents)

### Skills:
- **Registry:** `agents/skills/_registry.json`
- **CLI:** `node bin/nash list-skills`, `node bin/nash show-skill {id}`
- **Agent-Skill Mapping:** Check `## ⚙️ SKILLS` section in agent files

### Quality Gates:
- **`gates/validate.sh`** - Build + tsc + tests + no TODO/FIXME (after coding)
- **`gates/integrity.sh`** - Detect mocks in integration tests (before integration)
- **`gates/qa.sh`** - SAST + test distribution + smoke (before merge)
- **`gates/security.sh`** - Secrets scan + dependency audit (before deploy)
- **`gates/commit.sh`** - Pre-validate → safe commit (final step)

---

## ✅ Verification

### Test /task command exists:
```bash
$ ls -lh .claude/commands/task.md
-rw-r--r-- 1 ryzen 197121 15K Mar 17 13:56 task.md
```

### Test AUTO_SETUP includes Step 3.9:
```bash
$ grep -A5 "Step 3.9" AUTO_SETUP.md
### Step 3.9: Install Nash Task Dispatcher ⚡ **CORE WORKFLOW**

**This is the MAIN entry point for running Nash Framework tasks.**
```

### Test QUICK_START mentions /task:
```bash
$ grep "/task" QUICK_START.md
✅ Slash commands: /sharpen, /upgrade-agent, /create-skill, /task
Sau đó gõ `/` trong chat → Thấy `/sharpen`, `/upgrade-agent`, `/create-skill`, `/task`
/task Implement user authentication module
```

### Test SETUP_STATUS has /task section:
```bash
$ grep -A2 "Using /task Command" SETUP_STATUS.md
## 🔥 Using /task Command (Main Entry Point)

**`/task` is the CORE Nash Framework dispatcher** that auto-routes requests through the 6 SDLC pipelines.
```

---

## 📊 Impact

### Before:
- ❌ No single entry point for Nash workflow
- ❌ Users had to manually read main.md, AUDIT.md, etc.
- ❌ No automated pipeline routing
- ❌ No slash command for task dispatch

### After:
- ✅ `/task` = ONE command to rule them all
- ✅ Auto-reads main.md → runs audit → routes pipeline → executes
- ✅ Supports 6 pipeline types + multi-task DAG
- ✅ Enforces 11 critical rules automatically
- ✅ Integrated with Nash CLI, skills registry, quality gates
- ✅ Full documentation in 3 places (AUTO_SETUP, QUICK_START, SETUP_STATUS)

---

## 🚀 Next Steps (For User)

1. **Copy framework to new machine:**
   ```bash
   cp -r SuperAgent /new/location
   ```

2. **Run AUTO_SETUP:**
   Paste into Claude Code:
   ```
   Đọc file AUTO_SETUP.md và thực hiện TẤT CẢ các bước setup.
   ```

3. **Reload VSCode** (Ctrl+Shift+P → "Reload Window")

4. **Test /task command:**
   ```
   /task Implement user authentication module
   ```

5. **Watch magic happen!** 🎉

---

## 📝 Git Commit

```
feat(dispatcher): add /task slash command for Nash SDLC workflow

ADDED:
- .claude/commands/task.md (15KB) - Main Nash Task Dispatcher
- AUTO_SETUP.md Step 3.9 - Auto-install /task command
- SETUP_STATUS.md section - /task usage guide with examples
- QUICK_START.md updates - Reference /task as main entry point

This is the CORE entry point for Nash Framework - all SDLC tasks route through /task.
```

**Commit hash:** `90d6a44`

---

## 🎉 Summary

**`/task` command is COMPLETE and READY TO USE!**

**Usage:**
```
/task {your request here}
```

**What it does:**
1. Clarifies your request
2. Runs 12-dimension audit
3. Routes to appropriate pipeline(s)
4. Dispatches agents with Nash Triad
5. Runs quality gates
6. Writes LEDGER with scoring
7. Delivers verified output

**Integration:**
- ✅ main.md (Dũng PM's OS)
- ✅ system/AUDIT.md (12 dimensions)
- ✅ system/MIXTURE_OF_EXPERTS_ROUTER.md (routing)
- ✅ system/templates/NASH_SUBAGENT_PROMPTS.md (dispatch v6.2)
- ✅ 6 SDLC pipelines + Design Flow + FE Implementation
- ✅ 25+ agents (Core, Dev, Research, User)
- ✅ Skills registry (managed by nash CLI)
- ✅ 5 quality gates (validate, integrity, qa, security, commit)

**This is the heartbeat of Nash Framework!** 🔥

---

*Generated: 2026-03-17 | Nash Framework v0.1 | Anti_propost_0.1*
