# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Nash Agent Framework (Anti_propost_0.1)** — MoE Router + Nash Triad + 3-tier memory.

---

## Quick Commands

```bash
# Validation & Quality Gates
bash gates/validate.sh <module_dir>   # Build + tsc + tests + no TODO/FIXME (polyglot: TS/Go/.NET/Py)
bash gates/integrity.sh <module_dir>  # Detect mocks/placeholders in integration tests
bash gates/qa.sh <module_dir> [url]   # SAST + test distribution + smoke
bash gates/security.sh <module_dir>   # Secrets scan + dep audit
bash gates/commit.sh <module> [msg]   # Pre-validate → safe git commit

# Audit & Routing
bash scripts/merge_audit.sh <dir>     # Merge 3 audit → AUDIT_REPORT_FINAL.md

# Task Dispatch (main entry point)
claude --agent agents/core/dung-manager.md "Implement feature X for module Y"
```

**Gate scripts are polyglot** — they auto-detect project language (TypeScript/Go/.NET/Python) and run the appropriate toolchain (npm/go/dotnet).

---

## Architecture

### Phase -1: Audit → Routing
1. **Tung Diag** performs 12-dimension audit (split into 3 parallel sub-audits to stay within token limits)
2. `scripts/merge_audit.sh` → `AUDIT_REPORT_FINAL.md`
3. **MoE Router** (`system/MIXTURE_OF_EXPERTS_ROUTER.md`) analyzes audit and selects pipeline(s)

### Phase 0: Universal Dispatch ⚡ **CORE MECHANISM**
**`system/templates/NASH_SUBAGENT_PROMPTS.md` (v6.2)** — This is the **HEART of the framework**. Every sub-agent spawn uses this template.

**Key concepts:**
- **6 pipeline types by scope**: Trivial (<3 SP), Simple (3-10 SP), Complex (10-30 SP), Critical (30+ SP), NASH (debate/explore), Urgent (execute-first)
- **Phase labels**: A=criteria, B=completeness audit, B2=correctness audit, C=execute, D=functional verify, E=non-functional verify, F=cross-cutting
- **Cross-check chain**: B+B2 review A independently → D reviews C → E reviews D → F reviews C+D+E (Critical only)
- **10 dispatch rules**: plan.md updates, verify flow ($VERIFY_CMD + $VERIFY_PEER), split strategy (>30K tokens), parallel ATs, LEDGER-only-Main, 3-retry limit
- **Multi-task DAG**: Topological sort for dependencies → batch by layer (≤30K tokens/batch) → parallel same-layer, sequential cross-layer
- **M1/M2/M3 multipliers**: Missed bug (2x), Second catch beats first (2x), Fabrication (P0 = -30)

**READ THIS FILE** to understand how agents actually get dispatched and scored.

### 6 SDLC Pipelines (Nash Triad in every step)

Each pipeline uses **Thesis** (build) → **Anti-Thesis** (challenge) → **Synthesis** (judge):

| # | Pipeline | Thesis | Anti-Thesis | Synthesis | Triggers When |
|---|----------|--------|-------------|-----------|---------------|
| 1 | Requirements | Dung PM + Chau UX | Conan | User | SPEC empty, new domain |
| 2 | Architecture | Phuc SA + Quang | Moc + Lan | Dung PM | Missing schema/contracts |
| 3 | Coding | Dev agents | ESLint + Moc | Phuc SA | Contracts done, code incomplete |
| 4 | Testing | Son QA + Huyen FE-QA | Lan | Dung PM | Code done, tests missing |
| 5 | Security | CI/CD + Thanh Lai | Ngu | User | Tests pass, pre-deploy |
| 6 | Hotfix | Tung + Lan | Moc | Dung PM | Production incident |

**Additional Pipelines:**
- **Design Flow** (`pipelines/DESIGN_FLOW.md`): 6-stage FE wireframing (no code)
- **FE Implementation** (`pipelines/FE_IMPLEMENTATION.md`): Code from approved wireframes

---

## 3-Tier Memory System

```
L2 Cache  →  agents/{layer}/{agent}.md    Always loaded (<500 tokens)
RAM       →  tmp/ram/{agent}/*.md         On-demand deep reference
HDD       →  Source code / schema         Never preloaded
```

**PEN/WIN entries** in L2 Cache = hard constraints from past penalties/successes.

### Memory Eviction Priority
- **P0 entries:** Never evict (critical constraints)
- **P1 entries:** Evict only when context critically full
- **P2-P3 entries:** Evict when space needed (oldest first)
- **P4 entries:** Delete after task completion

---

## Agent Archetypes

| Archetype | Strengths | Best For | Examples |
|-----------|----------|---------|----------|
| **Analyst** | Requirements, specs, gap analysis | Defining acceptance criteria | Conan, Xuan |
| **Builder** | Implementation, artifact production | Execution phases | Thuc, Lan, Hoang |
| **Critic** | Adversarial review, edge cases | Verification phases | Moc, Son QA, Ngu |
| **Strategist** | Architecture, trade-offs, system design | Design and cross-cutting review | Phuc SA, Hieu |
| **Operator** | Infrastructure, deployment, runtime | Non-functional verification | Hung, Thanh Lai |

---

## CONTRACT_DRAFT Structure

When Pipeline 2 (Architecture) runs, Phuc SA produces `CONTRACT_DRAFT.md` with 8 sections:

1. **API Contracts**: Endpoints, DTOs, status codes
2. **Error Handling**: Error codes, fallback strategies
3. **Events/Pub-Sub**: Event schema (if applicable)
4. **Idempotency Rules**: Retry/dedup strategies
5. **Mock Specifications**: Test doubles for development
6. **Non-Functional Requirements**: Performance, security, a11y
7. **Acceptance Criteria**: Testable assertions
8. **Sign-off**: Thesis/Anti-Thesis/Synthesis approval

---

## Gate Scripts (5 validators)

| Script | Purpose | When | Tech Stack |
|--------|---------|------|------------|
| `validate.sh` | Build + tsc + tests + no TODO/FIXME | After coding | TS, Go, .NET, Py |
| `integrity.sh` | Detect mocks/placeholders in integration tests | Before integration tests | All |
| `qa.sh` | SAST + test distribution + smoke test | Before merge | All |
| `security.sh` | Hardcoded secrets + dependency audit | Before deploy | All |
| `commit.sh` | Pre-validate → exclude secrets → targeted git commit | Final step | All |

> Doc quality validated by Nash Triad LLM review, not grep scripts.

---

## Scoring (Zero-Sum Game)

| Severity | Points | Trigger |
|----------|--------|---------|
| **P0** | ±30 | Collusion, lazy review, fabrication, production bug |
| **P1** | ±20 | Bug leaks to QA gate |
| **P2** | ±15 | Contract drift, wrong root-cause |
| **P3** | ±10 | TODO at validate, missing criteria |
| **P4** | ±5 | Nitpick (max 2 per review = +10 cap) |

**LEDGER** (`artifacts/{task}/LEDGER.md`) = immutable scoring record. Main Agent writes, agents cannot self-score or read their own scores during work.

---

## Non-Negotiable Rules

1. **Nash Triad in every pipeline** — no self-approval
2. **PEN entries = hard constraints** — check before submitting
3. **Token conservation** (Rule 0) — read only when needed, write concisely
4. **Gate scripts are law** — no manual overrides
5. **Evidence-based scoring** — commit/log/gate evidence required
6. **Targeted git add** — never `git add .`
7. **M1/M2/M3 penalties** — Challenger faces 2-3x multiplier for missed bugs, fabrication

---

## Directory Structure (Critical Paths)

```
nash-agent-framework/
├── CLAUDE.md                          # This file
├── main.md                            # Entry point orchestrator
├── agents/
│   ├── BRAIN.md                       # Agent memory architecture
│   ├── core/dung-manager.md          # PM orchestrator (main entry)
│   ├── core/{agent}.md               # 9 core agents (L2 Cache <500 tokens)
│   ├── dev/{agent}.md                # 10 dev agents
│   ├── research/{agent}.md           # 5 research agents
│   └── user/{agent}.md               # 3 user-facing agents
├── system/
│   ├── AUDIT.md                       # 12-dimension audit spec
│   ├── MIXTURE_OF_EXPERTS_ROUTER.md   # MoE routing logic
│   ├── NASH.md                        # Nash Equilibrium rules
│   ├── SCORING_RULES.md              # P0-P4 scoring tables
│   ├── MEMORY_EVICTION_PROTOCOL.md    # L2/RAM/HDD eviction rules
│   └── templates/
│       ├── LEDGER_TEMPLATE.md         # Immutable scoring record
│       └── NASH_SUBAGENT_PROMPTS.md   # v6.2 universal dispatch template
├── pipelines/
│   ├── 01_REQUIREMENTS_AND_RESEARCH.md
│   ├── 02_ARCHITECTURE_AND_DB.md
│   ├── 03_CODING_AND_DEV.md
│   ├── 04_TESTING_AND_QA.md
│   ├── 05_SECURITY_AND_DEPLOYMENT.md
│   ├── 06_EMERGENCY_HOTFIX.md
│   ├── DESIGN_FLOW.md                 # FE wireframes (6 stages)
│   └── FE_IMPLEMENTATION.md           # FE code from wireframes
├── gates/                              # Quality gates (polyglot)
│   ├── validate.sh, integrity.sh, qa.sh, security.sh, commit.sh
├── scripts/
│   └── merge_audit.sh                 # Post-audit merge
└── artifacts/{task}/                  # Per-task outputs + LEDGER
```

---

## How to Dispatch a Task

1. **Entry point**: PM agent (`agents/core/dung-manager.md`)
2. **Dispatch command**:
   ```bash
   claude --agent agents/core/dung-manager.md "Task description here"
   ```
3. **What happens**:
   - Dung PM reads task → runs 12-dimension audit (`AUDIT.md`)
   - MoE Router selects pipeline(s) based on audit
   - **Uses `NASH_SUBAGENT_PROMPTS.md` v6.2** to spawn sub-agents (each agent = 1 subprocess)
   - Each subprocess gets: L2 Cache + task-specific RAM + dispatch template with scoring rules
   - Main Agent coordinates phases (A→B→B2→C→D→E→F), writes LEDGER after each step

---

*Nash Agent Framework | See `GUIDE.md` for full documentation | `README.md` for architecture overview*
