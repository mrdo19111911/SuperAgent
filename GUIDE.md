# Nash Agent Framework — Deep Walkthrough Guide

This guide explains the theory, mechanisms, and internal logic of the Nash Agent Framework. It is meant for anyone adopting the framework — whether for software engineering, research, consulting, or any domain where AI agents produce and review work.

---

## 1. Philosophy: Why Nash Equilibrium for AI Agents?

**The problem.** When an AI agent generates output and then reviews its own output, it rubber-stamps everything. There is no incentive to find flaws. Multi-agent setups help, but naive configurations still suffer from collusion (agents agree to pass each other's work) and inflation (everyone gets high scores because scoring is cooperative, not competitive).

**The solution.** Borrow from game theory. In a Nash Equilibrium, no player can improve their outcome by unilaterally changing their strategy. The framework creates a scoring environment where:

- If you are a builder, your best strategy is to produce correct work (because a dedicated adversary will catch your mistakes, and you lose points).
- If you are a reviewer, your best strategy is to find real bugs (because you gain points for catches and lose points for misses or fabrications).
- If you are a judge, your best strategy is to rule based on evidence (because the scoring ledger is auditable and zero-sum).

Deception is always negative expected value. An agent that fabricates a bug loses 30 points (P0 severity). An agent that lazy-reviews and misses a real bug loses 30 points when the judge catches it. The only profitable strategy for every agent is honest, quality work — which is exactly the Nash Equilibrium the framework enforces.

---

## 2. The Nash Triad

Every pipeline in the framework uses a three-role structure:

| Role | Responsibility |
|------|---------------|
| **THESIS** | The builder. Produces the deliverable — code, documents, designs, plans. |
| **ANTI-THESIS** | The challenger. Attacks the output. Must provide evidence for every finding (file path, line number, reproduction steps). |
| **SYNTHESIS** | The judge. Decides based on evidence alone. Cannot be the same agent as thesis or anti-thesis. |

**No agent ever reviews their own work.** This is the foundational invariant. The thesis agent never serves as anti-thesis on the same deliverable. The synthesis agent is always a third party.

The key innovation is that the challenger role is not just permitted to find bugs — it is *incentivized* to find them and *penalized* for missing them or making them up. This creates genuine adversarial pressure, not performative review.

---

## 3. The 5 Rules

These rules define the scoring game. They are non-negotiable and apply to every pipeline.

### Rule 0: Detection-Based
Only the agent that detects a flaw gets rewarded. Every penalty (`-N`) has a corresponding reward (`+N`) for the finder. Evidence is mandatory — no evidence means the transaction is void.

### Rule 1: Blind Scoring
No agent sees scores while work is in progress. Scores are revealed only at synthesis. This prevents agents from gaming their behavior based on current standings. Violating blind scoring (e.g., an agent reading the LEDGER) triggers a 50% penalty increase.

### Rule 2: Zero-Sum
The total score across all agents is always zero. Every point gained by one agent is lost by another. This prevents score inflation and ensures that quality is a relative, competitive measure.

### Rule 3: Balanced Challenger
The challenger faces three specific failure modes, each carrying a 3x penalty multiplier:

- **M1 (Missed Bug):** The challenger approves the output, but the judge finds a flaw. The challenger is penalized at 2x.
- **M2 (Second Catch):** In Complex/Critical pipelines with multiple anti-thesis agents, if AT#2 catches what AT#1 missed, AT#1 is penalized at 2x.
- **M3 (Fabricated Bug):** The challenger reports a finding with no evidence or false evidence. This is a P0 offense (-30 points).

This triple pressure makes the challenger's optimal strategy to be thorough and honest — not overly aggressive (fabrication is punished) and not passive (misses are punished).

### Rule 4: Penalty Learning
When an agent is penalized 10 or more points, the PM writes a PEN entry into the agent's L2 Cache (persistent profile). PEN entries are permanent constraints — rules the agent must follow in all future work. They contain only the prevention principle, never the point value:

```
PEN [P2] CONTRACT_DRIFT: Always validate response shape against CONTRACT_DRAFT before submitting.
```

If the agent fails to store the PEN entry, it receives an additional -10 penalty.

---

## 4. Scoring System (P0 through P4)

Scoring uses five severity tiers. Every transaction is zero-sum: the penalized agent loses exactly what the rewarded agent gains.

| Severity | Points | Trigger |
|----------|--------|---------|
| **P0** | +/-30 | Deception, lazy review, fabrication, collusion, production bug |
| **P1** | +/-20 | Flaw leaks to final verification (QA gate) |
| **P2** | +/-15 | Spec drift, wrong root-cause diagnosis, breaking contract |
| **P3** | +/-10 | Missing criteria, placeholder/TODO in code, hollow tests |
| **P4** | +/-5 | Nitpick-level findings (capped at 2 per review = max +10) |

**Builder bonus:** If the thesis agent passes anti-thesis review on the first attempt, they receive +5 points. This rewards getting it right the first time.

**PROBATION:** If an agent reaches 0 points, they restart at 30 on the next task. During probation (2 tasks), all deductions are multiplied by 1.5x while bonuses remain unchanged. This creates a recovery path that is steep but not impossible.

### The LEDGER

The LEDGER is the immutable scoring record, stored at `artifacts/{task}/LEDGER.md`. Only the PM (synthesis role) can write to it. Agents cannot read their own scores — doing so is a P0 offense. Each transaction records:

- The event type and severity
- Which agent was penalized and rewarded
- The evidence (commit hash, gate log, file:line)
- The verdict author

---

## 5. MoE Router and 12-Dimension Audit

Before any pipeline runs, the framework performs a comprehensive audit of the codebase. This is the "Mixture of Experts" gating mechanism — instead of guessing which pipeline to run, the system diagnoses the codebase first and routes to the correct expert pipeline(s).

### The 12 Audit Dimensions

| ID | Dimension | What It Checks |
|----|-----------|---------------|
| C1 | Business | Requirements clarity, domain coverage |
| C2 | Docs | Documentation completeness, consistency |
| C3 | IP | Intellectual property, licensing |
| C4 | Architecture | System design quality, coupling, patterns |
| C5 | Security | Vulnerabilities, auth, secrets management |
| C6 | Tech Debt | Code smells, outdated dependencies, TODOs |
| C7 | DevOps | CI/CD, containerization, observability |
| C8 | Database | Schema quality, migrations, indexing |
| C9 | Team | Skill gaps, workload distribution |
| C10 | SLA | Performance targets, uptime requirements |
| C11 | Backend | API implementation completeness |
| C12 | Frontend | UI implementation completeness |

### Audit Flow

The audit runs as 3 parallel sub-audits (to stay within token limits), then merges via `merge_audit.sh` into a single `AUDIT_REPORT_FINAL.md`. The MoE Router reads this report and routes to one or more pipelines based on which dimensions have gaps.

For example: if C2 (Docs) is complete but C8 (Database) has no schema and C11 (Backend) is half-built, the router activates Pipeline 2 (Architecture & DB) followed by Pipeline 3 (Coding & Dev).

---

## 6. The 6 Pipelines

Each pipeline applies the Nash Triad. The thesis builds, the anti-thesis attacks, and the synthesis judges. Pipelines differ in what they produce and which agents fill each role.

### Pipeline 1: Requirements & Research
SPEC writing and domain exploration. Activated when business requirements are empty or contradictory. Produces specification documents, domain models, and research reports.

### Pipeline 2: Architecture & DB
System design, database schema, and API contracts. Activated when specs exist but architecture is missing or inconsistent. Produces architecture diagrams, schema definitions, and CONTRACT_DRAFT documents (8 sections: API, DTOs, Mocks, Errors, Events, Idempotency, Sign-off, and more).

### Pipeline 3: Coding & Dev
TDD implementation following RED-GREEN-REFACTOR. Activated when contracts are finalized but code is incomplete. Gate scripts (`validate.sh`) enforce build + type-check + tests + no TODO/FIXME before any code passes.

### Pipeline 4: Testing & QA
Chaos testing, edge cases, and integration verification. Activated after coding is complete. `integrity.sh` detects mock contamination in integration tests. `qa.sh` runs SAST and verifies test distribution.

### Pipeline 5: Security & Deployment
OWASP checks, secrets scanning, dependency auditing, Docker configuration, and CI/CD pipeline setup. `security.sh` is the gate script.

### Pipeline 6: Emergency Hotfix
An inverted-flow pipeline for production incidents. The thesis fixes first, then the anti-thesis reviews after deployment. P0/P1 findings from post-review trigger mandatory rollback. P2+ findings go to the backlog as follow-up tasks in normal pipelines.

### Additional Pipelines
- **Design Flow** (FE design): 6 stages of wireframing and API mapping, producing design artifacts with no code.
- **FE Implementation**: Takes wireframes from Design Flow and implements them in code. Hard gate: no wireframe means halt.

---

## 7. 3-Tier Memory System

Agents have persistent memory across tasks, structured in three tiers to optimize token usage.

### L2 Cache (Always Loaded)
Agent profiles stored at `agents/{layer}/{agent}.md`. Each profile is under 500 tokens and is always loaded when the agent is dispatched. Contains:
- Agent name, role, archetype, and capabilities
- PEN entries: hard constraints from past penalties (prevention rules)
- WIN entries: proven patterns from past successes

### RAM (Loaded On-Demand)
Deep reference files stored at `tmp/ram/{agent}/*.md`. Loaded only when the agent needs them for a specific task. Examples: detailed API specs, schema references, domain-specific guidelines.

### HDD (Never Preloaded)
Source code, database schemas, and large artifacts. Agents read these files directly from the filesystem when needed but they are never preloaded into context.

### Memory Eviction Protocol
Not all memory is permanent. The eviction priority follows severity:
- **P0 entries:** Never evict. These are critical constraints.
- **P1 entries:** Evict only when context window is critically full.
- **P2-P3 entries:** Evict when space is needed, oldest first.
- **P4 entries:** Delete immediately after the current task.

### PEN and WIN Entries
PEN entries are the enforcement mechanism for Rule 4. When an agent makes a mistake severe enough to warrant penalty, the prevention principle is written into their L2 Cache. The agent must check PEN entries before submitting any work. WIN entries record successful patterns — what worked well — and serve as positive guidance.

---

## 8. Gate Scripts

Gate scripts are automated quality checkpoints. They are not optional — passing them is mandatory for pipeline progression.

| Script | What It Does | When It Runs |
|--------|-------------|-------------|
| `validate.sh` | Build + type-check + run all tests + scan for TODO/FIXME | After coding phases |
| `integrity.sh` | Detect mocks, stubs, or placeholders in integration tests | Before integration test gates |
| `qa.sh` | Static analysis (SAST) + test distribution check + smoke test | Before merge |
| `security.sh` | Scan for hardcoded secrets + dependency vulnerability audit | Before deployment |
| `commit.sh` | Run validate first, exclude secrets from staging, then git commit | At pipeline completion |

Gate scripts are polyglot — they detect the project language (TypeScript, .NET, Go) and run the appropriate toolchain. They return pass/fail with evidence logs that feed into LEDGER transactions.

---

## 9. NASH_SUBAGENT_PROMPTS v6.2 — Universal Dispatch

This is the dispatch template used to spawn sub-agents into any pipeline step. It standardizes how agents receive tasks, produce output, and get reviewed.

### Pipeline Types by Scope

| Pipeline | Scope | Structure |
|----------|-------|-----------|
| **Trivial** | 1-2 deliverables, <3 SP | Single pass: thesis builds + AT verifies |
| **Simple** | 3-5 deliverables, 3-10 SP | Two tiers: criteria then execution, one AT |
| **Complex** | 6-15 deliverables, 10-30 SP | Two tiers, two ATs (functional + non-functional) |
| **Critical** | 15+ deliverables, 30+ SP | Two tiers, three ATs (functional + non-functional + cross-cutting) |
| **NASH** | Exploratory (debug, debate, design) | k independent agents produce competing solutions, then critique each other |
| **Urgent** | Time-critical (outage, deadline) | Execute first, review after |

### Agent Archetypes

| Archetype | Strengths | Best For |
|-----------|----------|---------|
| **Analyst** | Requirements, specs, gap analysis | Defining acceptance criteria |
| **Builder** | Implementation, artifact production | Execution phases |
| **Critic** | Adversarial review, edge cases | Verification phases |
| **Strategist** | Architecture, trade-offs, system design | Design and cross-cutting review |
| **Operator** | Infrastructure, deployment, runtime | Non-functional verification |

For NASH (debate) pipelines, agent selection maximizes disagreement — never two agents of the same primary archetype.

### Two-Tier Structure

**Tier 1 (Criteria):** The thesis defines acceptance criteria. Each criterion must have a testable assertion — expected input mapped to expected output, or a verifiable completeness statement. Criteria without assertions are automatically a P3 offense. The anti-thesis audits criteria for completeness and correctness.

**Tier 2 (Execute):** The thesis builds the deliverable, satisfying all Tier 1 criteria. The anti-thesis verifies functionally, then non-functionally (performance, security, accessibility). In Critical pipelines, a third AT does cross-cutting and root-cause review.

### Cross-Check Chain

In Critical pipelines: B and B2 both review A's output independently. D reviews C. E reviews D. F reviews C+D+E. This chain ensures no single point of failure in the review process.

### Scoring Within Dispatch

Each task starts at 100 points. The M1/M2/M3 multipliers apply within the dispatch. The dispatch template itself reminds agents of the scoring rules to maintain incentive alignment.

---

## 10. Adapting for Your Project

The Nash Agent Framework is project-agnostic. The scoring system, Nash Triad, memory tiers, and pipeline dispatch work the same whether you are building software, writing legal briefs, conducting research, or managing consulting engagements.

### Step 1: Define Your Config Variables

The dispatch template uses `$PROJECT_CONFIG` variables. Set these for your domain:

```
$PROJECT_ROOT       — Root directory or workspace
$AGENT_DIR          — Where agent profiles live
$ARTIFACTS_DIR      — Where pipeline outputs are stored
$SOURCE_OF_TRUTH    — Your top-level architecture or strategy document
$SPEC_FILE          — Task-level specification
$CONTRACTS_FILE     — Shared interface contracts (API specs, legal templates, etc.)
$VERIFY_CMD         — CLI verification command (test runner, linter, compiler)
$VERIFY_PEER        — Non-CLI verification (checklist, rubric, review guide)
$CRITERIA_VERB      — What Tier 1 produces ("write test cases", "define rubric")
$DELIVERABLE_VERB   — What Tier 2 produces ("implement code", "write report")
```

### Step 2: Customize Agent Profiles (Optional)

Create agent profiles in `agents/{layer}/` with capabilities relevant to your domain. For a legal team, you might have agents with archetypes like "Drafter" (builder), "Opposing Counsel" (critic), and "Judge" (strategist). The framework does not restrict archetypes — the five defaults (Analyst, Builder, Critic, Strategist, Operator) are advisory.

### Step 3: Add Domain-Specific Pipelines (Optional)

The 6 default pipelines map to a software development lifecycle, but you can create additional pipelines for your domain. Each pipeline only needs to define: which agents fill the triad roles, what gate scripts (if any) enforce quality, and what artifacts are produced.

### Step 4: Use the Scoring System Unchanged

The 5 rules, P0-P4 severity tiers, LEDGER mechanism, and PEN/WIN memory entries are domain-independent. They work because they model universal incentives: reward thoroughness, punish deception, and make quality the only rational strategy.

---

## Summary

The Nash Agent Framework turns AI agent collaboration into a game where honesty and quality are the dominant strategies. The Nash Triad ensures no self-review. The 5 rules make deception negative expected value. The scoring system creates real consequences. The memory system makes agents learn from mistakes. The gate scripts automate enforcement. And the MoE Router ensures the right work happens at the right time.

The result: agents that genuinely challenge each other's work, because the framework makes it the only rational thing to do.
