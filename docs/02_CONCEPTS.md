# Core Concepts

Understand the foundational mechanisms that make Nash Agent Framework work.

---

## Nash Triad Validation

### The Problem

When an AI agent generates output and then reviews its own output, it rubber-stamps everything. There is no incentive to find flaws. Multi-agent setups help, but naive configurations suffer from:

- **Collusion**: Agents agree to pass each other's work
- **Score Inflation**: Everyone gets high scores in cooperative systems
- **Hallucinations**: No penalty for fabricated test results

### The Solution

Every pipeline step uses **Thesis → Anti-Thesis → Synthesis**:

```
┌─────────────────────────────────────────────────────────────┐
│  THESIS (Builder)                                           │
│  ├─ Produces artifact (code, docs, designs)                 │
│  ├─ Best strategy: Create correct work                      │
│  └─ Penalty: -30 points if major bugs found                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  ANTI-THESIS (Critic)                                       │
│  ├─ Adversarial review with evidence requirements           │
│  ├─ Best strategy: Find real bugs (not fabricate)           │
│  ├─ Reward: +N points for each finding (P0-P4)              │
│  └─ Penalties:                                               │
│     • M1 (Missed Bug): -2x if judge finds what you missed   │
│     • M2 (Second Catch): -2x if AT#2 finds your miss        │
│     • M3 (Fabrication): -30 points for false findings       │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  SYNTHESIS (Judge)                                          │
│  ├─ Decides based on evidence alone                         │
│  ├─ Cannot be same agent as Thesis or Anti-Thesis           │
│  ├─ Best strategy: Rule objectively (auditable LEDGER)      │
│  └─ Writes to immutable LEDGER.md                           │
└─────────────────────────────────────────────────────────────┘
```

**Key invariant:** No agent ever reviews their own work.

**Result:** Deception is always negative expected value. The only profitable strategy for every agent is honest, quality work — this is the Nash Equilibrium.

---

## MoE (Mixture of Experts) Router

### 12-Dimension Audit

Before any pipeline runs, the framework performs a comprehensive codebase audit:

| Dimension | What It Checks |
|-----------|---------------|
| **C1: Business** | Requirements clarity, domain coverage |
| **C2: Docs** | Documentation completeness, consistency |
| **C3: IP** | Intellectual property, licensing |
| **C4: Architecture** | System design quality, coupling, patterns |
| **C5: Security** | Vulnerabilities, auth, secrets management |
| **C6: Tech Debt** | Code smells, outdated dependencies, TODOs |
| **C7: DevOps** | CI/CD, containerization, observability |
| **C8: Database** | Schema quality, migrations, indexing |
| **C9: Team** | Skill gaps, workload distribution |
| **C10: SLA** | Performance targets, uptime requirements |
| **C11: Backend** | API implementation completeness |
| **C12: Frontend** | UI implementation completeness |

### Routing Logic

```
┌─────────────────────────────────────────────────────────────┐
│  Phase -1: AUDIT & ROUTING                                  │
│                                                             │
│  ┌──────────────┐                                           │
│  │ Tung Diag    │ Runs 12-dim audit (split into 3 parallel │
│  │ (Auditor)    │ sub-audits to stay within token limits)   │
│  └──────┬───────┘                                           │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────┐              │
│  │ scripts/merge_audit.sh                   │              │
│  │ → AUDIT_REPORT_FINAL.md                  │              │
│  └──────┬───────────────────────────────────┘              │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │ MoE Router   │ Analyzes gaps and selects pipeline(s)    │
│  │              │ Example:                                  │
│  │              │ • C2 complete, C8 empty → Pipeline 2      │
│  │              │ • C4+C11 gaps → Pipeline 2 + Pipeline 3   │
│  └──────┬───────┘                                           │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────┐              │
│  │ Selected Pipeline(s) Execute              │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**Why this matters:** No guessing which pipeline to run. The audit diagnoses the codebase first and routes to the correct expert pipeline(s).

---

## 3-Tier Memory System

Agents have persistent memory across tasks, structured to optimize token usage:

```
┌─────────────────────────────────────────────────────────────┐
│  L2 CACHE (Always Loaded)                                   │
│  ├─ Location: agents/{layer}/{agent}.md                     │
│  ├─ Size: <500 tokens per agent                             │
│  ├─ Contents:                                                │
│  │  • Agent identity (name, role, archetype)                │
│  │  • PEN entries (hard constraints from past penalties)    │
│  │  • WIN entries (proven patterns from past successes)     │
│  └─ Example PEN:                                             │
│     "Never use 'git add .' — always targeted git add"       │
└─────────────────────────────────────────────────────────────┘
                   ▲
                   │ Always loaded when agent dispatched
                   │
┌─────────────────────────────────────────────────────────────┐
│  RAM (Loaded On-Demand)                                     │
│  ├─ Location: tmp/ram/{agent}/*.md                          │
│  ├─ Size: Variable (2K token limit per excerpt)             │
│  ├─ Contents:                                                │
│  │  • Detailed API specs                                    │
│  │  • Schema references                                     │
│  │  • Domain-specific guidelines                            │
│  └─ Trigger: Agent explicitly requests deep reference       │
└─────────────────────────────────────────────────────────────┘
                   ▲
                   │ Loaded only when needed
                   │
┌─────────────────────────────────────────────────────────────┐
│  HDD (Never Preloaded)                                      │
│  ├─ Location: Source code, database schemas                 │
│  ├─ Size: Unlimited                                          │
│  ├─ Contents:                                                │
│  │  • Codebase files                                        │
│  │  • Database schemas                                      │
│  │  • Large artifacts                                       │
│  └─ Access: Agents read directly from filesystem            │
└─────────────────────────────────────────────────────────────┘
```

### PEN and WIN Entries

**PEN (Penalty) Entries:**
- Written when agent makes a mistake severe enough to warrant 10+ points penalty
- Hard constraints that agent must check before submitting any work
- Never evicted (P0 entries), only P2-P4 can be evicted when critically full
- Format: `PEN [P2] CONTRACT_DRIFT: Always validate response shape against CONTRACT_DRAFT`

**WIN Entries:**
- Record successful patterns that worked well
- Positive guidance for future tasks
- Format: `WIN [5pts] Used prepared statements for SQL → prevented injection`

### Memory Eviction Protocol

| Priority | When to Evict | Example |
|----------|--------------|---------|
| **P0** | Never | "Never commit .env files" (learned from secret leak) |
| **P1** | Only when context critically full | "Always run integration tests before merge" |
| **P2-P3** | When space needed, oldest first | "Prefer async/await over callbacks" |
| **P4** | Delete after task completion | "Use camelCase for this module" |

---

## Cognitive Modes (Adaptive Token Budgets)

Nash automatically adjusts token budgets based on task complexity:

### Mode Selection Decision Tree

```
Is there a detailed spec?
│
├─ YES → Is this critical architecture or integration?
│        │
│        ├─ YES → HOLD (10K-15K tokens)
│        │        Best for: Refactoring, API design, data modeling
│        │
│        └─ NO → REDUCTION (5K-10K tokens)
│                 Best for: Simple implementations, bug fixes
│
└─ NO → Is this a new domain or unclear requirements?
         │
         └─ YES → EXPANSION (15K-30K tokens)
                  Best for: Research, exploration, design debates
```

### Token Savings

| Mode | Budget | Use Case | Savings vs Baseline |
|------|--------|----------|---------------------|
| **EXPANSION** | 15K-30K | New domains, unclear requirements | Baseline |
| **HOLD** | 10K-15K | Critical architecture, integration | 20-33% |
| **REDUCTION** | 5K-10K | Simple implementations with specs | 50-67% |

**Overall impact:** 40-60% token reduction on routine tasks while preserving deep thinking for complex problems.

### Manual Override

```javascript
const { selectMode } = require('./system/mode_selector.js');

const result = selectMode("Implement login button", {
  forceMode: 'REDUCTION',    // Override automatic selection
  customBudget: 5000,        // Custom token budget
  verbose: true              // Debug logging
});
```

---

## Scoring System (P0-P4)

Every transaction is zero-sum: one agent's penalty = another agent's reward.

| Severity | Points | Trigger | Example |
|----------|--------|---------|---------|
| **P0** | ±30 | Deception, fabrication, production bug | Fabricated test results, committed .env file |
| **P1** | ±20 | Bug leaks to QA gate | Integration test fails after code review |
| **P2** | ±15 | Spec drift, wrong root-cause | API response doesn't match CONTRACT_DRAFT |
| **P3** | ±10 | Missing criteria, TODO in code | Acceptance criteria without assertions |
| **P4** | ±5 | Nitpick-level findings (max 2/review) | Inconsistent naming convention |

### Builder Bonus

If thesis agent passes anti-thesis review on first attempt: **+5 points** (rewards getting it right the first time).

### Challenger Multipliers

| Multiplier | Trigger | Penalty |
|------------|---------|---------|
| **M1** | Missed Bug (judge finds what AT missed) | 2x penalty to AT |
| **M2** | Second Catch (AT#2 finds what AT#1 missed) | 2x penalty to AT#1 |
| **M3** | Fabricated Bug (false evidence) | P0 = -30 points |

**Result:** Challenger's optimal strategy is to be thorough and honest — not overly aggressive (fabrication punished) and not passive (misses punished).

---

## The LEDGER

Immutable scoring record stored at `artifacts/{task}/LEDGER.md`.

### Properties

- **Write-only for PM**: Only synthesis agent (PM) can write
- **Blind during work**: Agents cannot read their own scores while working
- **Evidence required**: Every transaction must cite file:line, commit hash, or gate log
- **Zero-sum**: Total score across all agents always equals zero

### Example Entry

```markdown
## Transaction #3: P2 Contract Drift

**Event:** API response missing `user.email` field
**Evidence:** `src/api/users.ts:42` returns `{id, name}` but CONTRACT_DRAFT specifies `{id, name, email}`
**Builder (Thuc):** -15 points (missed requirement)
**Challenger (Moc):** +15 points (found drift)
**Judge (Dung PM):** 0 points (neutral)
**Verdict:** Moc evidence confirmed via `diff CONTRACT_DRAFT.md src/api/users.ts`
```

---

## Agent Archetypes

Agents are assigned archetypes based on their strengths:

| Archetype | Strengths | Best For | Examples |
|-----------|-----------|----------|----------|
| **Analyst** | Requirements, specs, gap analysis | Defining acceptance criteria | Conan, Xuan |
| **Builder** | Implementation, artifact production | Execution phases | Thuc, Lan, Hoang |
| **Critic** | Adversarial review, edge cases | Verification phases | Moc, Son QA, Ngu |
| **Strategist** | Architecture, trade-offs, design | Design and cross-cutting review | Phuc SA, Hieu |
| **Operator** | Infrastructure, deployment, runtime | Non-functional verification | Hung, Thanh Lai |

**For NASH (debate) pipelines:** Agent selection maximizes disagreement — never two agents of the same primary archetype.

---

## Quality Gates (Polyglot Validators)

Automated quality checkpoints that enforce passing before pipeline progression:

| Gate | Purpose | Detects | Tech Stack |
|------|---------|---------|------------|
| `validate.sh` | Build + type-check + tests | Build failures, type errors, test failures, TODO/FIXME | TS, Go, .NET, Py |
| `integrity.sh` | Mock contamination | Mocks/stubs in integration tests | All |
| `qa.sh` | Static analysis + smoke test | Code smells, test gaps, runtime errors | All |
| `security.sh` | Secrets + dependencies | Hardcoded secrets, vulnerable deps | All |
| `commit.sh` | Safe git commit | Validates first, excludes secrets, targeted add | All |

**Auto-detection:** Gates detect project language and run appropriate toolchain (npm/go/dotnet/pytest).

**Evidence trail:** Gate logs feed into LEDGER transactions (e.g., "validate.sh failed at line 42" → P1 penalty).

---

## Next Steps

- **Usage Guide**: See [docs/03_USAGE_GUIDE.md](03_USAGE_GUIDE.md) for common workflows
- **Architecture Deep Dive**: See [docs/04_ARCHITECTURE.md](04_ARCHITECTURE.md) for system internals
- **Troubleshooting**: See [docs/FAQ.md](FAQ.md) for common issues

---

**Key Takeaway:** Nash Agent Framework makes honest, quality work the only rational strategy through game theory, not rules or appeals.
