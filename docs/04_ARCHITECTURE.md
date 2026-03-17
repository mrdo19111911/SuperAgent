# Architecture Deep Dive

Complete system design, decision flow, and pipeline internals for Nash Agent Framework.

---

## Table of Contents

1. [Philosophy](#philosophy)
2. [System Architecture](#system-architecture)
3. [Nash Triad Mechanics](#nash-triad-mechanics)
4. [Scoring System](#scoring-system)
5. [MoE Router & Audit](#moe-router--audit)
6. [6 SDLC Pipelines](#6-sdlc-pipelines)
7. [Memory System](#memory-system)
8. [Gate Scripts](#gate-scripts)
9. [Dispatch System](#dispatch-system)
10. [Adapting for Your Project](#adapting-for-your-project)

---

## Philosophy

### Why Nash Equilibrium for AI Agents?

**The problem:** When an AI agent generates output and then reviews its own output, it rubber-stamps everything. There is no incentive to find flaws. Multi-agent setups help, but naive configurations still suffer from collusion (agents agree to pass each other's work) and inflation (everyone gets high scores because scoring is cooperative, not competitive).

**The solution:** Borrow from game theory. In a Nash Equilibrium, no player can improve their outcome by unilaterally changing their strategy. The framework creates a scoring environment where:

- If you are a builder, your best strategy is to produce correct work (because a dedicated adversary will catch your mistakes, and you lose points).
- If you are a reviewer, your best strategy is to find real bugs (because you gain points for catches and lose points for misses or fabrications).
- If you are a judge, your best strategy is to rule based on evidence (because the scoring ledger is auditable and zero-sum).

Deception is always negative expected value. An agent that fabricates a bug loses 30 points (P0 severity). An agent that lazy-reviews and misses a real bug loses 30 points when the judge catches it. The only profitable strategy for every agent is honest, quality work — which is exactly the Nash Equilibrium the framework enforces.

---

## System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     User Request                            │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase -1: AUDIT & ROUTING                                  │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │ Tung Diag    │ ──▶ │ MoE Router   │                     │
│  │ (12-dim)     │     │ (Select      │                     │
│  │              │     │  Pipeline)   │                     │
│  └──────────────┘     └──────┬───────┘                     │
└────────────────────────────────┼─────────────────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
                   ▼                           ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐
│ Pipeline 1: Requirements    │  │ Pipeline 6: Emergency Hotfix│
│ ┌─────────────────────────┐ │  │ ┌─────────────────────────┐ │
│ │ A: Criteria (Analyst)   │ │  │ │ Thesis: Tung + Lan      │ │
│ │ B: Review (Critic)      │ │  │ │ Anti: Moc               │ │
│ │ C: Execute (Builder)    │ │  │ │ Synth: Dung PM          │ │
│ └─────────────────────────┘ │  │ └─────────────────────────┘ │
└─────────────────────────────┘  └─────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase F: LEDGER & SCORING                                  │
│  ┌──────────────┐     ┌──────────────┐                     │
│  │ LEDGER.md    │ ◀── │ Zero-Sum     │                     │
│  │ (Immutable)  │     │ Scoring      │                     │
│  │              │     │ (P0-P4)      │                     │
│  └──────────────┘     └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Storage Architecture

```
SQLite (WAL mode)
  ├─ tasks          (id, status, tokens_used, current_agent)
  ├─ agents         (id, archetype, total_tasks, avg_score)
  ├─ ledger         (task_id, agent, phase, score, evidence)
  ├─ pen_entries    (violation, severity, context, impact)
  └─ embeddings     (vector, agent_id, entry_type)
       │
       ▼
Qdrant Vector DB ────────┬───────▶ Semantic Search (75ms)
       │                 │
       └─────────────────┘ Fallback to grep (slower, reliable)
```

**Why SQLite + WAL?**
- Single file database (portable)
- WAL mode allows concurrent reads during writes
- No network latency (local disk I/O)
- Perfect for single-server deployments (target use case)

**Why Qdrant?**
- Fast vector similarity search (75ms avg)
- Standalone binary (no Docker required)
- PEN/WIN semantic search: "How do I handle git commits?" → finds related PEN entries

---

## Nash Triad Mechanics

### The Three Roles

Every pipeline in the framework uses a three-role structure:

| Role | Responsibility | Constraints |
|------|---------------|-------------|
| **THESIS** | The builder. Produces the deliverable — code, documents, designs, plans. | Cannot review own work |
| **ANTI-THESIS** | The challenger. Attacks the output. Must provide evidence for every finding (file path, line number, reproduction steps). | Cannot be same agent as thesis |
| **SYNTHESIS** | The judge. Decides based on evidence alone. Cannot be the same agent as thesis or anti-thesis. | Must cite evidence in LEDGER |

**Foundational invariant:** No agent ever reviews their own work.

### The 5 Rules

These rules define the scoring game. They are non-negotiable and apply to every pipeline.

#### Rule 0: Detection-Based
Only the agent that detects a flaw gets rewarded. Every penalty (`-N`) has a corresponding reward (`+N`) for the finder. Evidence is mandatory — no evidence means the transaction is void.

**Example:**
```
Finding: API missing error handling for 404 case
Evidence: src/api/users.ts:42 doesn't check response.status
Thesis (Thuc): -15 points (P2)
Anti-Thesis (Moc): +15 points
Total: 0 (zero-sum)
```

#### Rule 1: Blind Scoring
No agent sees scores while work is in progress. Scores are revealed only at synthesis. This prevents agents from gaming their behavior based on current standings. Violating blind scoring (e.g., an agent reading the LEDGER) triggers a 50% penalty increase.

**Implementation:**
```python
def load_ledger(agent_id, task_id):
    """LEDGER is write-only during task execution."""
    if task_in_progress(task_id):
        if caller_is_agent(agent_id):
            log_penalty(agent_id, "P0_BLIND_SCORING_VIOLATION", -45)  # -30 × 1.5
            raise PermissionError("Agents cannot read LEDGER during task")
    return read_file(f"artifacts/{task_id}/LEDGER.md")
```

#### Rule 2: Zero-Sum
The total score across all agents is always zero. Every point gained by one agent is lost by another. This prevents score inflation and ensures that quality is a relative, competitive measure.

**Example transaction:**
```markdown
## Transaction #5: P1 Integration Test Failure

**Event:** Login endpoint returns 500 instead of 401 for invalid credentials
**Evidence:** `npm test` output shows `LoginTest.ts:78 FAILED`
**Builder (Thuc):** -20 points (leaked to QA gate)
**Challenger (Son QA):** +20 points (caught in integration tests)
**Judge (Dung PM):** 0 points (neutral)
**Net change:** -20 + 20 + 0 = 0 ✓
```

#### Rule 3: Balanced Challenger
The challenger faces three specific failure modes, each carrying a multiplier penalty:

| Multiplier | Trigger | Penalty |
|------------|---------|---------|
| **M1 (Missed Bug)** | Judge finds what AT missed | 2x penalty to AT |
| **M2 (Second Catch)** | AT#2 catches what AT#1 missed (Complex/Critical pipelines) | 2x penalty to AT#1 |
| **M3 (Fabricated Bug)** | False evidence or no evidence | P0 = -30 points |

**Example M1:**
```
Anti-Thesis (Moc) approves code.
Judge (Dung PM) runs gates, finds P2 bug.
Moc penalty: -15 × 2 = -30 points (missed bug multiplier)
Builder (Thuc): -15 points (original bug)
Judge (Dung PM): +45 points (found both failures)
```

This triple pressure makes the challenger's optimal strategy to be thorough and honest — not overly aggressive (fabrication is punished) and not passive (misses are punished).

#### Rule 4: Penalty Learning
When an agent is penalized 10 or more points, the PM writes a PEN entry into the agent's L2 Cache (persistent profile). PEN entries are permanent constraints — rules the agent must follow in all future work. They contain only the prevention principle, never the point value:

```
PEN [P2] CONTRACT_DRIFT: Always validate response shape against CONTRACT_DRAFT before submitting.
```

If the agent fails to store the PEN entry, it receives an additional -10 penalty.

**Implementation:**
```python
def record_penalty(agent_id, severity, violation):
    if severity in ['P0', 'P1', 'P2']:  # 30, 20, 15 points
        pen_entry = generate_pen_entry(severity, violation)
        agent_profile = load_agent_profile(agent_id)
        agent_profile.append_pen_entry(pen_entry)
        save_agent_profile(agent_id, agent_profile)

        # Verify agent stored it
        if not verify_pen_stored(agent_id, pen_entry):
            record_penalty(agent_id, 'P3', 'FAILED_TO_STORE_PEN')  # -10 more
```

---

## Scoring System

### Severity Tiers (P0 through P4)

Scoring uses five severity tiers. Every transaction is zero-sum: the penalized agent loses exactly what the rewarded agent gains.

| Severity | Points | Trigger | Example |
|----------|--------|---------|---------|
| **P0** | ±30 | Deception, lazy review, fabrication, collusion, production bug | Fabricated test results, committed .env with secrets |
| **P1** | ±20 | Flaw leaks to final verification (QA gate) | Integration test fails after code review |
| **P2** | ±15 | Spec drift, wrong root-cause diagnosis, breaking contract | API response doesn't match CONTRACT_DRAFT |
| **P3** | ±10 | Missing criteria, placeholder/TODO in code, hollow tests | Acceptance criteria without assertions |
| **P4** | ±5 | Nitpick-level findings (capped at 2 per review = max +10) | Inconsistent naming convention |

### Builder Bonus
If the thesis agent passes anti-thesis review on the first attempt, they receive **+5 points**. This rewards getting it right the first time.

### PROBATION System
If an agent reaches 0 points, they restart at 30 on the next task. During probation (2 tasks), all deductions are multiplied by 1.5x while bonuses remain unchanged. This creates a recovery path that is steep but not impossible.

**Example:**
```
Agent Thuc: 5 points remaining
Next task: P1 bug found (-20 points)
New score: 5 - 20 = -15 → floor to 0 → restart at 30 (PROBATION MODE)

Task 1 (probation): P2 bug (-15 × 1.5 = -22.5)
Task 2 (probation): Passed (+5, no multiplier)
After 2 tasks: Exit probation
```

### The LEDGER

Immutable scoring record stored at `artifacts/{task}/LEDGER.md`.

**Properties:**
- **Write-only for PM**: Only synthesis agent can write
- **Blind during work**: Agents cannot read their own scores while working
- **Evidence required**: Every transaction must cite file:line, commit hash, or gate log
- **Zero-sum enforcement**: Total score always equals zero

**Example LEDGER.md:**

```markdown
# LEDGER — Task: Add User Authentication

**Task ID:** task-001
**Started:** 2026-03-17 10:00:00
**Completed:** 2026-03-17 12:30:00
**Total Duration:** 2h 30m

---

## Transaction #1: P4 Nitpick (Naming Convention)

**Event:** Variable name `usr` should be `user`
**Evidence:** `src/auth/login.ts:15` uses `const usr = ...`
**Builder (Thuc):** -5 points
**Challenger (Moc):** +5 points
**Judge (Dung PM):** 0 points
**Verdict:** Moc evidence confirmed via code review

---

## Transaction #2: P3 Missing Criteria

**Event:** Acceptance criteria missing assertion for password length
**Evidence:** `artifacts/task-001/CRITERIA.md` line 8 says "Password must be secure" without defining length
**Analyst (Conan):** -10 points
**Challenger (Moc):** +10 points
**Judge (Dung PM):** 0 points
**Verdict:** Moc evidence confirmed — criteria lacks testable assertion

---

## Transaction #3: P1 Integration Test Failure

**Event:** Login endpoint returns 500 instead of 401 for invalid credentials
**Evidence:** `npm test` output shows `LoginTest.ts:78 FAILED`
**Builder (Thuc):** -20 points
**Challenger (Son QA):** +20 points
**Judge (Dung PM):** 0 points
**Verdict:** Son QA evidence confirmed via gate log

---

## Final Scores

| Agent | Role | Score | Penalties | Bonuses |
|-------|------|-------|-----------|---------|
| Thuc | Builder (Thesis) | -25 | -5 (P4), -20 (P1) | 0 |
| Conan | Analyst | -10 | -10 (P3) | 0 |
| Moc | Critic (Anti-Thesis) | +15 | 0 | +5 (P4), +10 (P3) |
| Son QA | Critic (Anti-Thesis) | +20 | 0 | +20 (P1) |
| Dung PM | Judge (Synthesis) | 0 | 0 | 0 |
| **TOTAL** | | **0** | | ✓ Zero-sum |

---

## PEN Entries Generated

**Thuc (Builder):**
```
PEN [P1] INTEGRATION_TEST_GAP: Always run `npm test` locally before submitting for review
```

**Conan (Analyst):**
```
PEN [P3] MISSING_ASSERTIONS: Every acceptance criterion must have testable assertion (expected input → output)
```
```

---

## MoE Router & Audit

### 12-Dimension Audit

Before any pipeline runs, the framework performs a comprehensive audit of the codebase:

| ID | Dimension | What It Checks | Output |
|----|-----------|---------------|--------|
| **C1** | Business | Requirements clarity, domain coverage | Score 0-100% |
| **C2** | Docs | Documentation completeness, consistency | Score 0-100% |
| **C3** | IP | Intellectual property, licensing | Score 0-100% |
| **C4** | Architecture | System design quality, coupling, patterns | Score 0-100% |
| **C5** | Security | Vulnerabilities, auth, secrets management | Score 0-100% |
| **C6** | Tech Debt | Code smells, outdated dependencies, TODOs | Score 0-100% |
| **C7** | DevOps | CI/CD, containerization, observability | Score 0-100% |
| **C8** | Database | Schema quality, migrations, indexing | Score 0-100% |
| **C9** | Team | Skill gaps, workload distribution | Score 0-100% |
| **C10** | SLA | Performance targets, uptime requirements | Score 0-100% |
| **C11** | Backend | API implementation completeness | Score 0-100% |
| **C12** | Frontend | UI implementation completeness | Score 0-100% |

### Audit Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Split Audit (3 Parallel Sub-Audits)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Sub-Audit 1  │  │ Sub-Audit 2  │  │ Sub-Audit 3  │      │
│  │ C1-C4        │  │ C5-C8        │  │ C9-C12       │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┴─────────────────┘               │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────┐            │
│  │ Step 2: Merge via scripts/merge_audit.sh    │            │
│  │ Output: AUDIT_REPORT_FINAL.md                │            │
│  └─────────────────────────────────────────────┘            │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────┐            │
│  │ Step 3: MoE Router Analyzes Report          │            │
│  │ Routes to 1+ pipelines based on gaps        │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**Why split into 3 sub-audits?**
- Token limit: 12 dimensions × 2K tokens each = 24K (exceeds context window)
- Parallel execution: 3 agents run concurrently (faster)
- Merge: `merge_audit.sh` combines into single report

### Routing Examples

**Example 1: New Project**
```
Audit: C1=20%, C2=10%, C4=0%, C8=0%, C11=0%
Gaps: Requirements, Docs, Architecture, Database, Backend all missing
Route: Pipeline 1 → Pipeline 2 → Pipeline 3
```

**Example 2: Bug Fix**
```
Audit: C1=90%, C2=80%, C4=85%, C11=75% (bug in existing API)
Gaps: Minor backend implementation gap
Route: Pipeline 3 (Coding & Dev)
```

**Example 3: Production Incident**
```
Audit: N/A (urgent, skip audit)
Task contains: "[URGENT]" tag
Route: Pipeline 6 (Emergency Hotfix)
```

---

## 6 SDLC Pipelines

Each pipeline applies the Nash Triad. The thesis builds, the anti-thesis attacks, and the synthesis judges.

### Pipeline 1: Requirements & Research

**Purpose:** SPEC writing and domain exploration
**Triggers:** Business requirements empty or contradictory (C1 < 50%)
**Produces:** Specification documents, domain models, research reports

**Nash Triad:**
- **Thesis:** Dung PM (Strategist) + Chau UX (Analyst)
- **Anti-Thesis:** Conan (Critic)
- **Synthesis:** User (external stakeholder)

**Phases:**
1. **A: Gather Requirements** — Dung PM interviews stakeholders
2. **B: Document Specs** — Chau UX writes SPEC.md
3. **C: Challenge Completeness** — Conan reviews for gaps
4. **D: User Approval** — User approves/rejects

---

### Pipeline 2: Architecture & DB

**Purpose:** System design, database schema, API contracts
**Triggers:** Specs exist but architecture missing (C4 < 50% OR C8 < 50%)
**Produces:** Architecture diagrams, schema definitions, CONTRACT_DRAFT.md

**Nash Triad:**
- **Thesis:** Phuc SA (Strategist) + Quang (Builder)
- **Anti-Thesis:** Moc (Critic) + Lan (Critic)
- **Synthesis:** Dung PM

**CONTRACT_DRAFT Structure (8 sections):**
1. API Contracts (endpoints, DTOs, status codes)
2. Error Handling (error codes, fallback strategies)
3. Events/Pub-Sub (event schema if applicable)
4. Idempotency Rules (retry/dedup strategies)
5. Mock Specifications (test doubles for development)
6. Non-Functional Requirements (performance, security, a11y)
7. Acceptance Criteria (testable assertions)
8. Sign-off (Thesis/Anti-Thesis/Synthesis approval)

**Phases:**
1. **A: Design Architecture** — Phuc SA creates diagrams + schema
2. **B: Review Design** — Moc challenges coupling/scalability
3. **C: Implement Contracts** — Quang writes CONTRACT_DRAFT.md
4. **D: Functional Review** — Lan checks completeness
5. **E: Non-Functional Review** — Moc checks security/performance
6. **F: PM Approval** — Dung PM scores and approves

---

### Pipeline 3: Coding & Dev

**Purpose:** TDD implementation following RED-GREEN-REFACTOR
**Triggers:** Contracts finalized, code incomplete (C11 < 80% OR C12 < 80%)
**Produces:** Implemented code, unit tests, integration tests

**Nash Triad:**
- **Thesis:** Dev agents (Thuc, Lan, Hoang)
- **Anti-Thesis:** Moc (Critic) + ESLint/TSC
- **Synthesis:** Phuc SA

**Gate Scripts:**
- `validate.sh` — Build + type-check + tests + no TODO/FIXME

**Phases:**
1. **A: Define Test Cases** — Thuc writes test specifications
2. **B: Review Test Coverage** — Moc checks edge cases
3. **C: Implement Code (TDD)** — Thuc writes code (RED → GREEN → REFACTOR)
4. **D: Run Gates** — `bash gates/validate.sh` must pass
5. **E: Code Review** — Moc reviews for bugs/patterns
6. **F: Architect Approval** — Phuc SA approves architecture compliance

---

### Pipeline 4: Testing & QA

**Purpose:** Chaos testing, edge cases, integration verification
**Triggers:** Code complete, tests missing (C6 test coverage < 80%)
**Produces:** Integration tests, E2E tests, QA report

**Nash Triad:**
- **Thesis:** Son QA (Critic) + Huyen FE-QA (Critic)
- **Anti-Thesis:** Lan (Critic)
- **Synthesis:** Dung PM

**Gate Scripts:**
- `integrity.sh` — Detect mock contamination in integration tests
- `qa.sh` — SAST + test distribution + smoke test

**Phases:**
1. **A: Design Test Scenarios** — Son QA writes chaos test cases
2. **B: Review Scenarios** — Lan checks completeness
3. **C: Execute Tests** — Son QA runs tests
4. **D: Run Gates** — `bash gates/integrity.sh && bash gates/qa.sh`
5. **E: Review Results** — Lan reviews findings
6. **F: PM Approval** — Dung PM scores

---

### Pipeline 5: Security & Deployment

**Purpose:** OWASP checks, secrets scanning, dependency auditing
**Triggers:** Tests pass, pre-deploy (C5 < 80% OR C7 < 80%)
**Produces:** Security audit report, CI/CD configs, deployment scripts

**Nash Triad:**
- **Thesis:** CI/CD (Operator) + Thanh Lai (Operator)
- **Anti-Thesis:** Ngu (Critic)
- **Synthesis:** User (final approval before production)

**Gate Scripts:**
- `security.sh` — Secrets scan + dependency audit

**Phases:**
1. **A: Security Scan** — Thanh Lai runs OWASP ZAP, secrets detection
2. **B: Review Findings** — Ngu challenges severity classifications
3. **C: Fix Vulnerabilities** — CI/CD fixes critical issues
4. **D: Run Gates** — `bash gates/security.sh`
5. **E: Final Review** — Ngu approves
6. **F: User Approval** — User authorizes production deploy

---

### Pipeline 6: Emergency Hotfix

**Purpose:** Production incident response
**Triggers:** Production bug, `[URGENT]` tag
**Produces:** Hotfix commit, post-mortem, PEN entries

**Nash Triad:**
- **Thesis:** Tung + Lan (fix first, review later)
- **Anti-Thesis:** Moc (post-deploy review)
- **Synthesis:** Dung PM

**Inverted flow:**
1. **C: Fix First** — Tung + Lan implement fix immediately
2. **D: Deploy** — Push to production without waiting for review
3. **E: Post-Review** — Moc reviews fix after deployment
4. **F: Score & Learn** — Dung PM writes LEDGER + generates PEN entries

**Post-review severity handling:**
- **P0/P1 findings:** Mandatory rollback + proper fix via Pipeline 3
- **P2+ findings:** Backlog as follow-up tasks in normal pipelines

---

## Memory System

### 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  L2 CACHE (Always Loaded)                                   │
│  ├─ Location: agents/{layer}/{agent}.md                     │
│  ├─ Size: <500 tokens per agent                             │
│  ├─ Loaded: Every time agent is dispatched                  │
│  └─ Contents:                                                │
│     • Agent identity (name, role, archetype, capabilities)  │
│     • PEN entries (hard constraints from penalties)         │
│     • WIN entries (proven patterns from successes)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  RAM (Loaded On-Demand)                                     │
│  ├─ Location: tmp/ram/{agent}/*.md                          │
│  ├─ Size: Variable (2K token limit per excerpt)             │
│  ├─ Loaded: Only when agent explicitly requests             │
│  └─ Contents:                                                │
│     • Detailed API specs                                    │
│     • Schema references                                     │
│     • Domain-specific guidelines                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  HDD (Never Preloaded)                                      │
│  ├─ Location: Source code, database schemas, artifacts      │
│  ├─ Size: Unlimited                                          │
│  ├─ Loaded: Agents read directly from filesystem            │
│  └─ Contents:                                                │
│     • Codebase files                                        │
│     • Database schemas                                      │
│     • Large artifacts (images, binaries)                    │
└─────────────────────────────────────────────────────────────┘
```

### Memory Eviction Protocol

| Priority | When to Evict | Rationale | Example |
|----------|--------------|-----------|---------|
| **P0** | Never | Critical safety constraints | "Never commit .env files" |
| **P1** | Only when context critically full | High-impact production lessons | "Always run integration tests before merge" |
| **P2-P3** | When space needed, oldest first | Medium-impact patterns | "Prefer async/await over callbacks" |
| **P4** | Delete after task completion | Task-specific nitpicks | "Use camelCase for this module" |

### PEN Entry Format

```markdown
PEN [P2] CONTRACT_DRIFT: Always validate response shape against CONTRACT_DRAFT before submitting.
```

**Components:**
- `PEN` — Penalty entry marker
- `[P2]` — Severity that triggered the entry
- `CONTRACT_DRIFT` — Short label for the violation type
- Description — Prevention principle (not the point value)

### WIN Entry Format

```markdown
WIN [10pts] Used prepared statements for SQL → prevented injection vulnerability
```

**Components:**
- `WIN` — Win entry marker
- `[10pts]` — Points earned
- Description — What worked and why

---

## Gate Scripts

Gate scripts are automated quality checkpoints. They are not optional — passing them is mandatory for pipeline progression.

### 1. validate.sh (Build + Type-Check + Tests)

```bash
bash gates/validate.sh module_dir
```

**What it checks:**
- Build succeeds (`npm run build` / `go build` / `dotnet build`)
- Type-check passes (`tsc --noEmit` / `go vet`)
- All tests pass (`npm test` / `go test` / `dotnet test`)
- No TODO/FIXME in code (grep scan)

**Auto-detection:**
```bash
if [ -f "package.json" ]; then
  npm run build && npm test
elif [ -f "go.mod" ]; then
  go build ./... && go test ./...
elif [ -f "*.csproj" ]; then
  dotnet build && dotnet test
elif [ -f "requirements.txt" ]; then
  pytest
fi
```

**Evidence trail:**
```bash
# Output logged to gates/validate-{timestamp}.log
# Example P1 penalty:
# LEDGER entry: "validate.sh failed at src/api/users.ts:42 (type error)"
```

---

### 2. integrity.sh (Mock Contamination Detection)

```bash
bash gates/integrity.sh module_dir
```

**What it checks:**
- No mock/stub imports in integration test files
- Integration tests use real database/API
- E2E tests don't skip critical steps

**Detection logic:**
```bash
# Flag files matching *integration*.test.ts that import mocks
grep -r "from.*mock" tests/integration/ && exit 1
grep -r "jest.mock" tests/integration/ && exit 1
```

---

### 3. qa.sh (Static Analysis + Smoke Test)

```bash
bash gates/qa.sh module_dir [url]
```

**What it checks:**
- SAST scan (ESLint / golangci-lint / SonarQube)
- Test distribution (≥60% unit, ≥30% integration, ≥10% e2e)
- Smoke test (if URL provided, hit endpoint, expect 200 OK)

**Test distribution check:**
```bash
unit_count=$(find tests/unit -name "*.test.*" | wc -l)
integration_count=$(find tests/integration -name "*.test.*" | wc -l)
e2e_count=$(find tests/e2e -name "*.test.*" | wc -l)

total=$((unit_count + integration_count + e2e_count))
unit_pct=$((unit_count * 100 / total))

if [ $unit_pct -lt 60 ]; then
  echo "ERROR: Unit tests < 60% ($unit_pct%)"
  exit 1
fi
```

---

### 4. security.sh (Secrets + Dependencies)

```bash
bash gates/security.sh module_dir
```

**What it checks:**
- Hardcoded secrets (grep for API keys, passwords, tokens)
- Dependency vulnerabilities (`npm audit` / `go list` / `dotnet list`)
- .env file not committed (git ls-files check)

**Secrets detection:**
```bash
# Patterns to detect
grep -r "API_KEY\s*=\s*['\"]" src/ && exit 1
grep -r "password\s*=\s*['\"]" src/ && exit 1
git ls-files | grep "\.env$" && exit 1
```

---

### 5. commit.sh (Safe Git Commit)

```bash
bash gates/commit.sh module_name "commit message"
```

**What it does:**
1. Run `validate.sh` first (fail fast if build broken)
2. Exclude .env and credentials files
3. Targeted git add (NEVER `git add .`)
4. Git commit with message

**Implementation:**
```bash
# 1. Validate first
bash gates/validate.sh $MODULE_DIR || exit 1

# 2. Targeted add (exclude secrets)
git add src/$MODULE_NAME
git add tests/$MODULE_NAME
# NEVER: git add .

# 3. Commit
git commit -m "$COMMIT_MSG"
```

---

## Dispatch System

### NASH_SUBAGENT_PROMPTS v6.2

This is the universal dispatch template used to spawn sub-agents into any pipeline step.

**Key concepts:**

#### 6 Pipeline Types by Scope

| Pipeline | Scope | Story Points | Structure |
|----------|-------|--------------|-----------|
| **Trivial** | 1-2 deliverables | <3 SP | Single pass: thesis builds + AT verifies |
| **Simple** | 3-5 deliverables | 3-10 SP | Two tiers: criteria then execution, one AT |
| **Complex** | 6-15 deliverables | 10-30 SP | Two tiers, two ATs (functional + non-functional) |
| **Critical** | 15+ deliverables | 30+ SP | Two tiers, three ATs (functional + non-functional + cross-cutting) |
| **NASH** | Exploratory | Variable | k independent agents produce competing solutions, then critique each other |
| **Urgent** | Time-critical | Variable | Execute first, review after |

#### Two-Tier Structure

**Tier 1 (Criteria):**
- Thesis defines acceptance criteria
- Each criterion must have testable assertion (expected input → output)
- Criteria without assertions = automatic P3 offense
- Anti-Thesis audits criteria for completeness and correctness

**Tier 2 (Execute):**
- Thesis builds deliverable, satisfying all Tier 1 criteria
- Anti-Thesis verifies functionally, then non-functionally (performance, security, a11y)
- In Critical pipelines, third AT does cross-cutting and root-cause review

#### Cross-Check Chain (Critical Pipelines Only)

```
Phase B and B2 → both review Phase A independently
Phase D → reviews Phase C
Phase E → reviews Phase D
Phase F → reviews C + D + E (holistic)
```

**Why:** Ensures no single point of failure in the review process.

#### Multi-Task DAG Orchestration

When task has dependencies:

1. **Topological sort**: Analyze dependencies, create layers
2. **Batch by layer**: Group independent tasks (≤30K tokens/batch)
3. **Execute**: Parallel within layer, sequential across layers

**Example:**
```
Task 1: Create DB schema (no deps)
Task 2: Create API (depends on Task 1)
Task 3: Create UI (depends on Task 2)
Task 4: Write docs (no deps)

Layers:
Layer 0: [Task 1, Task 4] — parallel
Layer 1: [Task 2] — waits for Task 1
Layer 2: [Task 3] — waits for Task 2
```

---

## Adapting for Your Project

The Nash Agent Framework is project-agnostic. The scoring system, Nash Triad, memory tiers, and pipeline dispatch work the same whether you are building software, writing legal briefs, conducting research, or managing consulting engagements.

### Step 1: Define Config Variables

The dispatch template uses `$PROJECT_CONFIG` variables. Set these for your domain:

```bash
export PROJECT_ROOT=/path/to/your/project
export AGENT_DIR=agents
export ARTIFACTS_DIR=artifacts
export SOURCE_OF_TRUTH=architecture/STRATEGY.md
export SPEC_FILE=specs/TASK_SPEC.md
export CONTRACTS_FILE=contracts/API_CONTRACTS.md
export VERIFY_CMD="npm test"
export VERIFY_PEER="checklist/CODE_REVIEW_RUBRIC.md"
export CRITERIA_VERB="write test cases"
export DELIVERABLE_VERB="implement code"
```

### Step 2: Customize Agent Profiles (Optional)

Create agent profiles in `agents/{layer}/` with capabilities relevant to your domain.

**Example: Legal Team**
- **Drafter** (Builder archetype) — Writes legal briefs
- **Opposing Counsel** (Critic archetype) — Challenges arguments
- **Judge** (Strategist archetype) — Reviews evidence, rules

### Step 3: Add Domain-Specific Pipelines (Optional)

The 6 default pipelines map to software development, but you can create additional pipelines.

**Example: Legal Brief Pipeline**
- **Phase A:** Define legal arguments (Drafter)
- **Phase B:** Challenge arguments (Opposing Counsel)
- **Phase C:** Write brief (Drafter)
- **Phase D:** Review for precedent (Opposing Counsel)
- **Phase F:** Judge rules on quality (Judge)

### Step 4: Use Scoring System Unchanged

The 5 rules, P0-P4 severity tiers, LEDGER mechanism, and PEN/WIN memory entries are domain-independent. They work because they model universal incentives: reward thoroughness, punish deception, and make quality the only rational strategy.

---

## Summary

The Nash Agent Framework turns AI agent collaboration into a game where honesty and quality are the dominant strategies:

- **Nash Triad** ensures no self-review
- **5 Rules** make deception negative expected value
- **Scoring system** creates real consequences
- **Memory system** makes agents learn from mistakes
- **Gate scripts** automate enforcement
- **MoE Router** ensures the right work happens at the right time

**Result:** Agents that genuinely challenge each other's work, because the framework makes it the only rational thing to do.

---

## Next Steps

- **Contributing**: See [docs/05_CONTRIBUTING.md](05_CONTRIBUTING.md) for development workflow
- **FAQ**: See [docs/FAQ.md](FAQ.md) for troubleshooting
- **Quick Start**: See [docs/01_QUICKSTART.md](01_QUICKSTART.md) to get started in 15 minutes
