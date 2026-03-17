# Usage Guide

Common workflows and code examples for working with Nash Agent Framework.

---

## Table of Contents

1. [Task Dispatch](#task-dispatch)
2. [Creating Agents](#creating-agents)
3. [Creating Pipelines](#creating-pipelines)
4. [Creating Skills](#creating-skills)
5. [Quality Gates](#quality-gates)
6. [Monitoring & Debugging](#monitoring--debugging)

---

## Task Dispatch

### Basic Dispatch

```bash
# Entry point: PM agent orchestrates everything
claude --agent agents/core/dung-manager.md "Task description here"
```

**Example:**

```bash
claude --agent agents/core/dung-manager.md "Add password reset feature to user module"
```

### Parallel Task Execution

```bash
# Dispatch multiple tasks (framework handles coordination)
claude --agent agents/core/dung-manager.md "
  Task 1: Implement login API
  Task 2: Create user dashboard
  Task 3: Add password reset
  Task 4: Implement 2FA
  Task 5: Add session management
"
```

**What happens:**
- MoE Router analyzes dependencies (topological sort)
- Groups tasks by layer (independent tasks = same layer)
- Executes same-layer tasks in parallel (up to 15 agents concurrent)
- Sequential execution across layers

### Force Specific Pipeline

Add pipeline hint in task description:

```bash
claude --agent agents/core/dung-manager.md "[PIPELINE:3] Fix login bug in auth module"
```

**Pipeline numbers:**
- 1: Requirements & Research
- 2: Architecture & DB
- 3: Coding & Dev
- 4: Testing & QA
- 5: Security & Deployment
- 6: Emergency Hotfix

### Force Cognitive Mode

```bash
claude --agent agents/core/dung-manager.md "[MODE:REDUCTION] Add logging to UserService.login()"
```

**Modes:**
- `EXPANSION`: 15K-30K tokens (exploration, unclear requirements)
- `HOLD`: 10K-15K tokens (critical architecture, integration)
- `REDUCTION`: 5K-10K tokens (simple implementations with specs)

---

## Creating Agents

### Step 1: Copy Template

```bash
cp agents/AGENT_TEMPLATE_V2.md agents/dev/my-new-agent.md
```

### Step 2: Fill 9 Sections

**agents/dev/my-new-agent.md**

```markdown
# AGENT: My New Agent

## 1. SOUL (Identity & Philosophy)

**Name:** My New Agent
**Role:** Frontend specialist focusing on React components
**Archetype:** Builder
**Primary Capabilities:**
- React component design (functional + hooks)
- CSS-in-JS styling (styled-components)
- Accessibility (WCAG 2.1 AA compliance)
- Jest/React Testing Library

**Philosophy:**
- Semantic HTML first, then progressive enhancement
- Mobile-first responsive design
- Performance: Target <2s LCP, <100ms FID

---

## 2. SKILLS (Workflows & Checklists)

### Skill 1: Create React Component

**Workflow:**
1. Read CONTRACT_DRAFT.md for component spec
2. Create component file: `src/components/{Name}.tsx`
3. Write tests first (TDD): `src/components/{Name}.test.tsx`
4. Implement component (RED → GREEN → REFACTOR)
5. Run accessibility audit: `npm run a11y`
6. Submit for review

**Checklist:**
- [ ] Component has TypeScript prop types
- [ ] All interactive elements keyboard-accessible
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Test coverage ≥80%
- [ ] No console errors in dev mode

---

## 3. MEMORY (PEN/WIN Entries)

**PEN Entries:**
- `PEN [P1] MISSING_A11Y: Always run axe-core audit before submitting components`
- `PEN [P2] INLINE_STYLES: Never use inline styles, always use styled-components`

**WIN Entries:**
- `WIN [10pts] Used React.memo() for expensive list renders → 40% perf improvement`

---

## 4. TOOLS (Available Capabilities)

- `npm test` - Run Jest + RTL tests
- `npm run a11y` - Accessibility audit (axe-core)
- `npm run lint` - ESLint + Prettier
- `git` - Version control

---

## 5. DOMAIN KNOWLEDGE (Project Standards)

- React version: 18.2.0
- Styling: styled-components 6.x
- State: Redux Toolkit (no plain Redux)
- Router: React Router v6

---

## 6. STATISTICS (Performance Tracking)

**Total tasks:** 0
**Average score:** N/A (new agent)
**Penalties:** 0
**Bonuses:** 0

---

## 7. SHARPENING LOG (Improvement History)

(Empty - will be populated by agent_skill_sharpener after production tasks)

---

## 8. REFERENCE MEMORY (On-Demand RAM)

**References available in tmp/ram/my-new-agent/:**
- `react-patterns.md` - Common React patterns
- `a11y-checklist.md` - WCAG 2.1 AA checklist

---

## 9. BOOT PROTOCOL (Initialization Sequence)

1. Load L2 Cache (this file)
2. Check PEN entries for hard constraints
3. Load CONTRACT_DRAFT.md for current task spec
4. If unclear, load RAM: `tmp/ram/my-new-agent/react-patterns.md`
5. Proceed with task execution
```

### Step 3: Register in METADATA.yaml

```yaml
# core/metadata/METADATA.yaml
agents:
  - id: my-new-agent
    name: "My New Agent"
    archetype: Builder
    layer: dev
    l2_path: agents/dev/my-new-agent.md
    ram_dir: tmp/ram/my-new-agent
    capabilities:
      - react
      - typescript
      - accessibility
```

### Step 4: Create RAM Directory (Optional)

```bash
mkdir -p tmp/ram/my-new-agent
```

**tmp/ram/my-new-agent/react-patterns.md**

```markdown
# React Patterns Reference

## Pattern 1: Compound Components
(Details here...)

## Pattern 2: Render Props
(Details here...)
```

### Step 5: Test Agent

```bash
claude --agent agents/dev/my-new-agent.md "Create LoginButton component"
```

---

## Creating Pipelines

### Step 1: Create Pipeline File

**pipelines/07_CUSTOM_PIPELINE.md**

```markdown
# Pipeline 7: Custom Workflow

## Overview

**Purpose:** Handle custom domain-specific tasks
**Triggers:** When MoE Router detects custom criteria

---

## Nash Triad Roles

| Role | Agent(s) | Responsibility |
|------|----------|---------------|
| **Thesis** | Agent A, Agent B | Build deliverable |
| **Anti-Thesis** | Agent C | Review for correctness |
| **Synthesis** | Dung PM | Judge and score |

---

## Phases

### Phase A: Define Criteria (Analyst)
**Agent:** Conan (Analyst archetype)
**Output:** Acceptance criteria with testable assertions
**Gate:** None (criteria definition)

### Phase B: Completeness Audit (Critic)
**Agent:** Moc (Critic archetype)
**Input:** Phase A output
**Output:** Completeness review (missing criteria?)
**Gate:** None (audit only)

### Phase C: Execute (Builder)
**Agent:** Thuc (Builder archetype)
**Input:** Approved criteria from Phase A
**Output:** Deliverable artifact
**Gate:** `bash gates/validate.sh`

### Phase D: Functional Verify (Critic)
**Agent:** Son QA (Critic archetype)
**Input:** Phase C output
**Output:** Functional test results
**Gate:** `bash gates/qa.sh`

### Phase F: Scoring (Strategist)
**Agent:** Dung PM (Synthesis)
**Input:** All phase outputs
**Output:** LEDGER.md with scores
**Gate:** None (final step)

---

## CONTRACT_DRAFT Structure

(Define what contract sections this pipeline uses)

---

## Success Criteria

- All gates pass
- Zero P0/P1 findings in Anti-Thesis review
- LEDGER.md written with evidence
```

### Step 2: Register in METADATA.yaml

```yaml
# core/metadata/METADATA.yaml
pipelines:
  - id: 7
    name: "Custom Workflow"
    file_path: pipelines/07_CUSTOM_PIPELINE.md
    thesis_agents: [agent-a, agent-b]
    anti_thesis_agents: [agent-c]
    synthesis_agent: dung-pm
    gate_scripts:
      - gates/validate.sh
      - gates/qa.sh
```

### Step 3: Update MoE Router

**system/MIXTURE_OF_EXPERTS_ROUTER.md**

Add routing logic:

```markdown
## Route to Pipeline 7: Custom Workflow

**Triggers:**
- C2 (Docs) score < 50% AND
- C11 (Backend) score > 80% AND
- Task contains "[CUSTOM]" tag

**Example:**
```
Task: [CUSTOM] Generate API documentation from OpenAPI spec
Audit: C2=30%, C11=90%
Route: Pipeline 7
```
```

---

## Creating Skills

### Option 1: Use Automated Skill Builder

```bash
claude --agent skill_factory/smartlog_skill_creator/SKILL.md "Create skill for monitoring disk usage"
```

**What happens:**
1. **Phase 1:** Capture Intent (interview-style Q&A)
2. **Phase 2:** Write Draft (applies 12 gstack principles)
3. **Phase 3:** Automated Testing
4. **Phase 4:** Iterative Improvement
5. **Phase 5:** Package + Optimize Triggering

### Option 2: Manual Creation from Template

```bash
cp -r skill_factory/SKILL_TEMPLATE ~/.claude/skills/my-new-skill
cd ~/.claude/skills/my-new-skill
```

**Edit SKILL.md:**

```markdown
# My New Skill

## Trigger Patterns

When the user asks about:
- "monitor disk usage"
- "check storage space"
- "disk full"

## Workflow

1. Run `df -h` to check disk usage
2. Parse output for filesystems >80% full
3. Alert user with recommendations
4. Log to monitoring dashboard

## Example

User: "Why is my disk full?"

Response:
- Run disk analysis
- Identify top 10 space consumers
- Suggest cleanup actions
```

---

## Quality Gates

### 1. Validate (Build + Type-Check + Tests)

```bash
bash gates/validate.sh module_dir
```

**What it checks:**
- Build succeeds (npm run build / go build / dotnet build)
- Type-check passes (tsc --noEmit / go vet)
- All tests pass (npm test / go test / dotnet test)
- No TODO/FIXME in code

**Auto-detects:** TypeScript, Go, .NET, Python

### 2. Integrity (Mock Contamination)

```bash
bash gates/integrity.sh module_dir
```

**What it checks:**
- No mock/stub imports in integration test files
- Integration tests use real database/API
- E2E tests don't skip steps

### 3. QA (Static Analysis + Smoke Test)

```bash
bash gates/qa.sh module_dir [url]
```

**What it checks:**
- SAST scan (ESLint / golangci-lint / SonarQube)
- Test distribution (≥60% unit, ≥30% integration, ≥10% e2e)
- Smoke test (hit URL, expect 200 OK)

### 4. Security (Secrets + Dependencies)

```bash
bash gates/security.sh module_dir
```

**What it checks:**
- Hardcoded secrets (grep for API keys, passwords)
- Dependency vulnerabilities (npm audit / go list / dotnet list)
- .env file not committed

### 5. Commit (Safe Git Commit)

```bash
bash gates/commit.sh module_name "commit message"
```

**What it does:**
1. Run validate.sh first
2. Exclude .env and credentials files
3. Targeted git add (NEVER `git add .`)
4. Git commit with message

---

## Monitoring & Debugging

### Check Task Status (REST API)

```bash
# Get active tasks
curl http://localhost:4000/api/tasks/active

# Example response:
# {
#   "tasks": [
#     {
#       "id": "task-001",
#       "status": "in_progress",
#       "current_agent": "thuc",
#       "tokens_used": 12500,
#       "started_at": "2026-03-17T10:00:00Z"
#     }
#   ]
# }
```

### View LEDGER

```bash
cat artifacts/task-001/LEDGER.md
```

### Check Token Quota (Grafana)

1. Open http://localhost:3000
2. Navigate to **Token Quota Dashboard**
3. Check:
   - Current 5h window usage (green/yellow/red)
   - Messages remaining (based on 45 msg/5h Claude Pro limit)
   - Reset countdown

### Debug Agent Behavior

```bash
# Add verbose flag to task
claude --agent agents/core/dung-manager.md "[VERBOSE] Fix login bug"
```

**What it shows:**
- Mode selection reasoning
- RAM loading decisions
- Gate script outputs
- Scoring transactions

### Query PEN Entries (Semantic Search)

```javascript
const { queryPENEntries } = require('./system/vector_db_wrapper.js');

const results = await queryPENEntries("How to handle git commits?", {
  limit: 10,
  scoreThreshold: 0.7
});

console.log(results);
// [
//   {
//     violation: "Used 'git add .' instead of targeted add",
//     context: "Committed .env file with API keys",
//     impact: "Production secrets leaked to GitHub",
//     severity: "P0",
//     score: 0.92
//   },
//   ...
// ]
```

---

## Best Practices

### 1. Always Use Quality Gates

```bash
# GOOD: Validate before merge
bash gates/validate.sh auth-module
bash gates/security.sh auth-module
git merge feature-branch

# BAD: Merge without validation
git merge feature-branch
```

### 2. Check LEDGER After Tasks

```bash
# Review agent performance
cat artifacts/task-001/LEDGER.md | grep "P0\|P1"

# If you see P0/P1 penalties, investigate:
# - What went wrong?
# - Is there a pattern?
# - Should we add a PEN entry?
```

### 3. Monitor Token Quota

```bash
# Before starting large batch
curl http://localhost:4000/api/metrics/summary | jq '.token_quota'

# If quota low, defer non-urgent tasks
```

### 4. Use Staged Bootstrap (Decision 16B)

```bash
# Feature flag already enabled in production
# No action needed - framework auto-loads only needed agents
```

---

## Troubleshooting

See [docs/FAQ.md](FAQ.md) for common issues and solutions.

---

## Next Steps

- **Architecture Deep Dive**: [docs/04_ARCHITECTURE.md](04_ARCHITECTURE.md)
- **Contributing Guide**: [docs/05_CONTRIBUTING.md](05_CONTRIBUTING.md)
- **FAQ**: [docs/FAQ.md](FAQ.md)
