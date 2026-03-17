# Skill vs Workflow - Nash Framework

> **TL;DR:**
> - **Skill** = Reusable tool (micro-workflow) that agents can load on-demand
> - **Workflow** = Complete end-to-end process (macro-workflow) orchestrated by slash commands

---

## 🎯 Định Nghĩa

### SKILL (Kỹ Năng)
**Skill là một TOOL nhỏ, tái sử dụng được, mà agent có thể load on-demand để làm một việc cụ thể.**

**Đặc điểm:**
- ✅ **Reusable** - Nhiều agents có thể dùng cùng 1 skill
- ✅ **Focused** - Làm 1 việc cụ thể (single responsibility)
- ✅ **On-demand** - Load khi cần, không preload
- ✅ **Composable** - Có thể kết hợp nhiều skills
- ✅ **Managed** - Quản lý bởi Nash CLI (`node bin/nash`)

**Ví dụ:**
```
agents/skills/sharpener_reactive/SKILL.md
- Input: Agent file với PEN entries
- Output: Regression tests + Sharpened agent
- Scope: Reactive bug fixing từ past failures

agents/skills/bug-triage/SKILL.md
- Input: Bug report
- Output: Triaged bug (P0-P4) + assigned owner
- Scope: Bug classification + assignment

agents/skills/contract-draft-template/SKILL.md
- Input: Requirements
- Output: 8-section CONTRACT_DRAFT.md
- Scope: API contract generation
```

---

### WORKFLOW (Quy Trình)
**Workflow là một QUY TRÌNH HOÀN CHỈNH end-to-end, orchestrate nhiều agents + skills + gates.**

**Đặc điểm:**
- ✅ **End-to-end** - Từ input → verified output
- ✅ **Multi-agent** - Orchestrate nhiều agents (Nash Triad)
- ✅ **Multi-phase** - Nhiều bước (A, B, C, D, E, F)
- ✅ **Quality gates** - Enforce validation (validate.sh, qa.sh, etc.)
- ✅ **LEDGER tracking** - Evidence-based scoring
- ✅ **Slash command** - Triggered bởi `/command`

**Ví dụ:**
```
/task (Main Nash Dispatcher)
- Input: User request (any SDLC task)
- Output: Fully verified deliverable
- Scope: Complete SDLC workflow
  - STEP 1: Intake & Clarification
  - STEP 2: 12-Dimension Audit (C1-C12)
  - STEP 3: Route to Pipeline(s)
  - STEP 4: Execute with Nash Triad
- Uses: 6 pipelines + 25+ agents + skills + gates

/sharpen (Agent Sharpening Workflow)
- Input: Agent file
- Output: Sharpened agent với tests pass
- Scope: Reactive bug fixing workflow
  - Load sharpener_reactive skill
  - Mine PEN entries
  - Generate regression tests
  - Iterate until all tests pass
  - Update agent file

/browse (Web Automation Workflow - gstack)
- Input: URLs to scrape
- Output: Scraped data + screenshots
- Scope: Browser automation workflow
  - Launch Playwright
  - Navigate + scrape
  - Handle cookies/auth
  - Return structured data
```

---

## 📊 So Sánh Chi Tiết

| Aspect | SKILL | WORKFLOW |
|--------|-------|----------|
| **Scope** | Micro (1 specific task) | Macro (end-to-end process) |
| **Reusability** | High (many agents use same skill) | Low (specific to use case) |
| **Complexity** | Simple (few steps) | Complex (multi-phase, multi-agent) |
| **Agents** | 1 agent uses skill | Multiple agents orchestrated |
| **Quality Gates** | Usually NO | Usually YES (gates/validate.sh, etc.) |
| **LEDGER** | Usually NO | Usually YES (scoring + evidence) |
| **Trigger** | Loaded by agent when needed | Triggered by slash command (`/cmd`) |
| **Location** | `agents/skills/{skill}/SKILL.md` | `.claude/commands/{cmd}.md` |
| **Management** | Nash CLI (`node bin/nash`) | Slash command system |
| **Examples** | bug-triage, sharpener, contract-draft | /task, /sharpen, /browse, /qa |

---

## 🔍 Ví Dụ Cụ Thể

### Example 1: Skill = Ingredient, Workflow = Recipe

**SKILL: `bug-triage`**
```markdown
# Bug Triage Skill

Input: Bug description
Steps:
1. Classify severity (P0-P4)
2. Identify affected module
3. Suggest owner

Output: Triaged bug JSON
```
→ **Dùng trong:** Pipeline 6 (Hotfix), Pipeline 4 (Testing)

**WORKFLOW: `/task` (using bug-triage skill)**
```markdown
# /task Fix login bug

STEP 1: Intake (clarify bug)
STEP 2: Audit (C5, C8, C11 check)
STEP 3: Route → Pipeline 6 (Hotfix)
STEP 4: Execute
  - Tùng Diag uses bug-triage skill → P0, auth module, assign Lân
  - Lân diagnoses + fixes
  - Mộc reviews
  - Run gates/security.sh → PASS
  - Write LEDGER
  - Deploy
```

---

### Example 2: Architecture Task

**SKILL: `contract-draft-template`**
```markdown
# Contract Draft Template Skill

Input: Requirements (user stories, API needs)
Steps:
1. Draft API endpoints
2. Define DTOs
3. Error handling strategy
4. Mock specifications
5. NFRs (performance, security)

Output: CONTRACT_DRAFT.md (8 sections)
```
→ **Dùng bởi:** Phúc SA (Solution Architect)

**WORKFLOW: `/task` (Phúc SA uses contract-draft-template)**
```markdown
# /task Design user service API

STEP 1: Intake (confirm: CRUD? Auth? Pagination?)
STEP 2: Audit → C1 (has requirements), C4 (no schema yet)
STEP 3: Route → Pipeline 2 (Architecture)
STEP 4: Execute (Complex pipeline, 15 SP)
  - S1:A (Criteria) - Phúc SA uses contract-draft-template skill
    → Outputs CONTRACT_DRAFT.md
  - S2:B (Audit completeness) - Mộc reviews → PASS
  - S3:B2 (Audit correctness) - Lan reviews → FAIL (missing pagination)
  - S1 (Retry) - Phúc SA adds pagination → CONTRACT_DRAFT.md v2
  - S2:B + S3:B2 → PASS
  - S4:C (Execute) - Phúc SA finalizes schema.sql + openapi.yaml
  - S5:D (Verify functional) - Mộc + Son QA → PASS
  - S6:E (Verify NFR) - Check performance targets → PASS
  - S7: Write LEDGER
  - Run gates/validate.sh → PASS
```

---

## 🧩 Khi Nào Dùng Cái Gì?

### Dùng SKILL khi:
- ✅ Task nhỏ, cụ thể, tái sử dụng nhiều lần
- ✅ Nhiều agents cần làm việc giống nhau
- ✅ Không cần Nash Triad (1 agent làm được)
- ✅ Không cần quality gates
- ✅ Output là intermediate artifact (không phải final deliverable)

**Ví dụ:**
- Triage bug (dùng trong nhiều pipelines)
- Draft contract (Phúc SA dùng nhiều lần)
- Generate test cases (Son QA dùng nhiều lần)
- Sharpen agent (proactive maintenance)

---

### Dùng WORKFLOW khi:
- ✅ Task lớn, end-to-end, cần verified output
- ✅ Cần orchestrate nhiều agents (Nash Triad)
- ✅ Cần quality gates (validate, qa, security)
- ✅ Cần LEDGER tracking + evidence
- ✅ Output là final deliverable cho user

**Ví dụ:**
- Implement feature (requirements → architecture → code → test)
- Fix production bug (hotfix workflow)
- Ship code (review → test → deploy)
- QA checks (lint → test → smoke test)

---

## 🔗 Skill + Workflow Integration

**Workflow CÓ THỂ load nhiều skills:**

```markdown
# /task Implement user authentication

STEP 4: Execute Pipeline 3 (Coding)

Phase: Architecture (uses skills)
  - Phúc SA loads contract-draft-template skill
  - Output: CONTRACT_DRAFT.md

Phase: Coding (uses skills)
  - Lân Backend loads api-generator skill (if exists)
  - Output: auth.controller.ts, auth.service.ts

Phase: Testing (uses skills)
  - Son QA loads test-case-generator skill (if exists)
  - Output: auth.spec.ts

Phase: Review (uses skills)
  - Mộc loads security-review skill (if exists)
  - Output: SECURITY_REVIEW.md
```

**Mỗi phase có thể dùng 0-N skills, nhưng workflow orchestrate toàn bộ flow.**

---

## 📂 File Structure

```
nash-agent-framework/
├── agents/
│   ├── skills/                    # SKILLS (managed by nash CLI)
│   │   ├── _registry.json         # Skill registry
│   │   ├── bug-triage/
│   │   │   └── SKILL.md
│   │   ├── contract-draft-template/
│   │   │   └── SKILL.md
│   │   └── sharpener_reactive/
│   │       └── SKILL.md
│   │
│   └── core/                      # Agents (can use skills)
│       ├── dung-manager.md        # PM (uses deployment-excellence skill)
│       ├── phuc-sa.md             # SA (uses contract-draft skill)
│       └── son-qa.md              # QA (uses test-case-generator skill)
│
├── .claude/commands/              # WORKFLOWS (slash commands)
│   ├── task.md                    # Main SDLC dispatcher
│   ├── sharpen.md                 # Agent sharpening workflow
│   ├── browse.md                  # Web automation workflow
│   ├── qa.md                      # QA checks workflow
│   └── ship.md                    # Shipping workflow
│
└── system/pipelines/              # SDLC Pipelines (used by /task workflow)
    ├── 01_requirements.md
    ├── 02_architecture.md
    └── ...
```

---

## 🎯 Analogy (Ví Dụ Thực Tế)

### Factory Analogy

**SKILL = Machine/Tool**
- Drill press (khoan lỗ)
- Lathe (tiện)
- Welding torch (hàn)
- Paint sprayer (sơn)

**WORKFLOW = Production Line**
- Car manufacturing workflow:
  1. Frame assembly (uses welding skill)
  2. Engine installation (uses lifting skill)
  3. Paint job (uses painting skill)
  4. Quality inspection (uses inspection skill)
  5. Final test drive

**Worker (Agent) có thể:**
- Learn nhiều skills (Lân Backend biết cả api-generator + db-migration skills)
- Use skill trong workflow phase cụ thể
- Share skills với workers khác

**Foreman (Dũng PM) orchestrates:**
- Workflow hoàn chỉnh (from raw material → finished car)
- Assign workers to phases
- Run quality checks
- Track progress (LEDGER)

---

## 🚀 Best Practices

### For Skills:
1. **Single Responsibility** - 1 skill làm 1 việc
2. **Clear Input/Output** - Document rõ ràng
3. **Reusable** - Thiết kế để nhiều agents dùng
4. **Composable** - Có thể combine với skills khác
5. **Versioned** - Semantic versioning (1.0.0, 2.0.0)
6. **Registered** - Add vào `_registry.json` via nash CLI

### For Workflows:
1. **End-to-End** - From request → verified deliverable
2. **Nash Triad** - Enforce THESIS → AT → SYNTHESIS
3. **Quality Gates** - Run gates at key checkpoints
4. **LEDGER Tracking** - Evidence-based scoring
5. **Token Optimized** - Load files only when needed (Rule 0)
6. **Multi-Task Support** - Handle DAG dependencies

---

## 📝 Summary

| | SKILL | WORKFLOW |
|---|---|---|
| **What** | Reusable tool | End-to-end process |
| **Who** | 1 agent uses | Multiple agents orchestrated |
| **Where** | `agents/skills/` | `.claude/commands/` |
| **When** | On-demand load | Slash command trigger |
| **Why** | DRY (Don't Repeat) | Complete deliverable |
| **How** | Nash CLI manage | Slash command execute |

**Mối quan hệ:**
```
Workflow USES → Skill(s)
/task LOADS → contract-draft skill (trong Pipeline 2)
/sharpen LOADS → sharpener_reactive skill
/qa LOADS → test-distribution skill + sast-analyzer skill
```

**Skill = Lego brick 🧱**
**Workflow = Lego instruction manual 📖**

Bạn có thể dùng cùng 1 brick (skill) trong nhiều models (workflows) khác nhau!

---

## 🔁 Composition Patterns (Advanced)

### Pattern 1: Workflow → Skill (Standard)
**Most common pattern** - Workflow orchestrates + loads skills on-demand.

```markdown
/task Implement auth
  ↓
  Execute Pipeline 2 (Architecture)
    ↓
    Phúc SA loads contract-draft-template skill
    ↓
    Output: CONTRACT_DRAFT.md
```

---

### Pattern 2: Skill → Workflow (Recursive) ⚡ **YOUR QUESTION**
**YES, you can!** Skill có thể trigger workflow (slash command) via Task tool hoặc SlashCommand tool.

**Use case:** Skill cần complex orchestration mà không muốn duplicate logic.

```markdown
# Example: deployment-orchestrator skill

agents/skills/deployment-orchestrator/SKILL.md
  ↓
  Load requirements
  ↓
  Call /qa workflow (run QA checks)  ← SKILL CALLS WORKFLOW!
  ↓
  If /qa PASS → deploy
  ↓
  If /qa FAIL → rollback
```

**Implementation:**
```markdown
# agents/skills/deployment-orchestrator/SKILL.md

## Phase 3: Pre-Deploy QA

**Use SlashCommand tool to run /qa workflow:**

User agent can execute:
- Use Task tool with qa-checker agent
- OR use SlashCommand('/qa {module}')

/qa workflow will:
- Run SAST
- Check test distribution
- Run smoke tests
- Return PASS/FAIL

If PASS → Proceed to deployment
If FAIL → Halt + notify user
```

---

### Pattern 3: Workflow → Workflow (Nested)
Workflow có thể gọi workflow khác.

```markdown
/ship  (Main workflow)
  ↓
  STEP 1: Call /qa workflow (verify quality)
  ↓
  STEP 2: Call /task workflow (execute deployment pipeline)
  ↓
  STEP 3: Monitor + notify
```

---

### Pattern 4: Skill → Skill (Composition)
Skill có thể load skill khác (skill composition).

```markdown
# agents/skills/api-full-lifecycle/SKILL.md

This skill orchestrates:
1. Load contract-draft-template skill → Draft API
2. Load api-generator skill → Generate code
3. Load test-case-generator skill → Generate tests
4. Return complete API package
```

**Implementation:**
```markdown
## Phase 1: Draft Contract
**Load skill:** `agents/skills/contract-draft-template/SKILL.md`
(Agent reads + executes that skill's workflow)

## Phase 2: Generate Code
**Load skill:** `agents/skills/api-generator/SKILL.md`
(Use output from Phase 1 as input)

## Phase 3: Generate Tests
**Load skill:** `agents/skills/test-case-generator/SKILL.md`
(Use output from Phase 2 as input)
```

---

## 🎯 When to Use Composition Patterns?

### Skill → Workflow (Pattern 2)
**Use when:**
- ✅ Skill needs complex orchestration (Nash Triad, quality gates)
- ✅ Don't want to duplicate workflow logic inside skill
- ✅ Workflow already exists and is well-tested

**Example:**
```
deployment-orchestrator skill calls /qa workflow
ci-cd-pipeline skill calls /task workflow
auto-fixer skill calls /sharpen workflow
```

**Warning:** ⚠️ Avoid deep recursion (Skill → Workflow → Skill → Workflow...) → can cause token overflow!

---

### Workflow → Workflow (Pattern 3)
**Use when:**
- ✅ Main workflow needs complete sub-workflow
- ✅ Sub-workflow is independent and reusable
- ✅ Clear handoff points (output of one = input of next)

**Example:**
```
/ship calls /qa (verify) → then calls /deploy (execute)
/release calls /task (build) → then calls /publish (distribute)
```

---

### Skill → Skill (Pattern 4)
**Use when:**
- ✅ Building composite skill from atomic skills
- ✅ Clear data flow (output of skill A → input of skill B)
- ✅ Want to maintain DRY (Don't Repeat Yourself)

**Example:**
```
api-full-lifecycle skill = contract-draft + api-generator + test-generator
feature-pipeline skill = requirements-parser + architecture-drafter + code-scaffolder
```

---

## 🧩 Composition Rules

### Rule 1: Avoid Circular Dependencies
```
❌ BAD:
Skill A calls Skill B
Skill B calls Skill A
→ Infinite loop!

✅ GOOD:
Skill A calls Skill B
Skill B calls Skill C
→ Linear dependency
```

---

### Rule 2: Token Budget Management
```
⚠️ WATCH OUT:
Workflow (30K tokens)
  → calls Skill (10K tokens)
    → calls Workflow (30K tokens)
      → calls Skill (10K tokens)
→ Total = 80K tokens! (May exceed limits)

✅ BETTER:
Keep nesting depth ≤ 2 levels
Monitor token usage at each level
```

---

### Rule 3: Clear Input/Output Contracts
```
✅ GOOD:
Skill A outputs: CONTRACT_DRAFT.md
Skill B expects: CONTRACT_DRAFT.md
→ Clear contract!

❌ BAD:
Skill A outputs: "some JSON"
Skill B expects: "different format"
→ Integration failure
```

---

## 📝 Updated Summary Table

| Pattern | Example | Use Case | Complexity |
|---------|---------|----------|------------|
| **Workflow → Skill** | /task loads contract-draft | Standard orchestration | Low ✅ |
| **Skill → Workflow** | deployment-orchestrator calls /qa | Need complex sub-flow | Medium ⚠️ |
| **Workflow → Workflow** | /ship calls /qa then /deploy | Multi-phase delivery | Medium ⚠️ |
| **Skill → Skill** | api-full-lifecycle = 3 atomic skills | Composite skill | Low ✅ |

---

## 🎯 Best Practice: Composition Guidelines

1. **Prefer Pattern 1** (Workflow → Skill) - Most maintainable
2. **Use Pattern 2 sparingly** (Skill → Workflow) - Only when needed
3. **Document dependencies** - Make it clear in skill/workflow docs
4. **Monitor token usage** - Track at each nesting level
5. **Avoid deep nesting** - Keep ≤ 2 levels deep
6. **Test independently** - Each skill/workflow should work standalone

---

## 🚀 Advanced Example: deployment-orchestrator Skill

```markdown
# agents/skills/deployment-orchestrator/SKILL.md

---
name: deployment-orchestrator
version: 2.0.0
description: |
  Orchestrates complete deployment workflow with pre-deploy QA,
  deployment execution, and post-deploy verification.

  This skill CALLS /qa workflow for quality checks, then executes
  deployment pipeline. Demonstrates Skill → Workflow pattern.
---

## Phase 1: Pre-Deploy Checks

**Load module info:**
```bash
ls {module}/
cat {module}/package.json
```

**Verify git status:**
```bash
git status
git log -1
```

---

## Phase 2: Run QA Workflow ⚡ SKILL → WORKFLOW

**Use SlashCommand tool to run /qa:**

Prompt for /qa workflow:
```
Run QA checks on module {module}:
- SAST scan
- Test distribution check (unit 60%, integration 30%, e2e 10%)
- Smoke tests
- Return PASS/FAIL verdict
```

**Expected output from /qa workflow:**
```
✅ PASS - All QA checks passed
  - SAST: 0 P0/P1 issues
  - Tests: 65% unit, 25% integration, 10% e2e
  - Smoke: All endpoints responding

OR

❌ FAIL - QA checks failed
  - SAST: 2 P1 security issues found
  - Tests: Only 40% unit coverage (need 60%+)
```

**Decision:**
- If /qa returns PASS → Proceed to Phase 3
- If /qa returns FAIL → HALT + notify user + write LEDGER

---

## Phase 3: Execute Deployment

**Only runs if Phase 2 = PASS**

```bash
# Build
npm run build

# Run deployment
npm run deploy:prod

# Verify
curl https://api.example.com/health
```

---

## Phase 4: Post-Deploy Verification

**Check production metrics:**
- Response time < 200ms
- Error rate < 0.1%
- All endpoints healthy

**If verification PASS:**
- Write LEDGER (deployment success)
- Notify user

**If verification FAIL:**
- Auto-rollback
- Write LEDGER (deployment failed)
- Notify user
```

**Usage:**
```
Agent loads deployment-orchestrator skill:
"Deploy auth-service to production"

Skill workflow:
1. Check git status ✅
2. Call /qa workflow ✅ (SKILL → WORKFLOW pattern!)
3. /qa returns PASS ✅
4. Execute deployment ✅
5. Verify production ✅
6. Done!
```

---

## 🎉 Summary: Composition Flexibility

**Nash Framework supports ALL composition patterns:**

```
✅ Workflow → Skill         (Standard)
✅ Skill → Workflow         (Advanced, your question!)
✅ Workflow → Workflow      (Nested workflows)
✅ Skill → Skill            (Composite skills)
```

**Key principle:** **Composition = Power + Flexibility**

**Warning:** With great power comes great responsibility!
- Monitor token usage
- Avoid circular deps
- Document dependencies
- Test independently

**You can build complex workflows by composing simple skills + workflows!** 🚀

---

*Generated: 2026-03-17 | Nash Framework v0.1*
*Updated: Added Composition Patterns section*
