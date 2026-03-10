# Nash Agent Framework

**Adversarial multi-agent orchestration for reliable software delivery.**

Codename: `Anti_propost_0.1`

Nash Agent Framework orchestrates 24 AI agents through 6 SDLC pipelines using
Nash Equilibrium scoring. Every output is challenged by an independent adversary
before approval. No agent can approve its own work.

---

## Why This Exists

AI agents without adversarial review produce unreliable output. A single agent
asked to architect, build, and verify its own code has every incentive to
rubber-stamp itself. The result: subtle bugs, skipped edge cases, and
hallucinated test coverage that looks green but tests nothing.

Nash Agent Framework fixes this with a game-theoretic constraint: **builders
never judge their own work**. A Thesis agent builds, an independent Anti-Thesis
agent attacks, and a Synthesis agent decides. Cheating always has negative
expected value. Quality emerges from the equilibrium, not from hope.

---

## Architecture

```
  Task In
     |
     v
+-----------+     +----------------+     +-------------------+
|   Audit   | --> |   MoE Router   | --> | Pipeline Selection|
| (12-dim)  |     | (score & rank) |     |  (P0-P5 / Hotfix)|
+-----------+     +----------------+     +-------------------+
                                                  |
                            +---------------------+
                            v
                  +-------------------+
                  |    Nash Triad     |
                  |                   |
                  |  Thesis (build)   |
                  |       |           |
                  |  Anti-Thesis      |
                  |  (challenge)      |
                  |       |           |
                  |  Synthesis        |
                  |  (judge)          |
                  +-------------------+
                            |
                            v
                  +-------------------+
                  |   Gate Scripts    |
                  | build / test /    |
                  | security / commit |
                  +-------------------+
                            |
                     PASS   |   FAIL --> rework
                            v
                     Next Pipeline
                     or COMPLETE
```

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/your-org/nash-agent-framework.git
cd nash-agent-framework
```

### 2. Configure

Set your Claude Code CLI path and project root in `CLAUDE.md`. Agent L2 caches
live in `agents/` -- edit agent personas or add new ones as needed.

### 3. Run

Dispatch a task through the orchestrator:

```bash
# The PM agent (Dung) reads the task, runs audit, routes via MoE, and
# dispatches sub-agents as Claude Code CLI subprocess calls.
claude --agent agents/core/dung-manager.md "Implement feature X for module Y"
```

Each agent runs in an isolated subprocess with only the context it needs.

---

## Directory Structure

```
nash-agent-framework/
|-- CLAUDE.md                          # Framework-level instructions
|-- main.md                            # Entry point / orchestrator config
|-- README.md
|
|-- agents/
|   |-- BRAIN.md                       # Agent memory architecture
|   |-- core/                          # 9 core agents (PM, QA, architects)
|   |-- dev/                           # 10 dev agents (TS, FE, .NET, Go, Py)
|   |-- research/                      # 5 research agents (security, synthesis)
|   +-- user/                          # 3 user-facing agents (UX, deploy, stakeholder)
|
|-- pipelines/
|   |-- 00_RESEARCH.md
|   |-- 01_REQUIREMENTS_AND_RESEARCH.md
|   |-- 02_ARCHITECTURE_AND_DB.md
|   |-- 03_CODING_AND_DEV.md
|   |-- 04_TESTING_AND_QA.md
|   |-- 05_SECURITY_AND_DEPLOYMENT.md
|   |-- 06_EMERGENCY_HOTFIX.md
|   |-- DESIGN_FLOW.md                 # FE design pipeline (wireframes, no code)
|   +-- FE_IMPLEMENTATION.md           # FE coding pipeline (code, no design)
|
|-- system/
|   |-- AUDIT.md                       # 12-dimension audit spec
|   |-- MIXTURE_OF_EXPERTS_ROUTER.md   # MoE routing logic
|   |-- MODEL_ROUTING.md               # Which model for which agent
|   |-- NASH.md                        # Nash Equilibrium rules
|   |-- NASH_UNIVERSAL_PROMPT.md       # Universal dispatch prompt
|   |-- SCORING_RULES.md              # Zero-sum scoring (P0-P4)
|   |-- MEMORY_EVICTION_PROTOCOL.md    # 3-tier memory management
|   +-- templates/
|       |-- LEDGER_TEMPLATE.md         # Immutable scoring record
|       +-- NASH_SUBAGENT_PROMPTS.md   # v6.2 universal dispatch template
|
|-- gates/
|   |-- commit.sh                      # Pre-commit quality gate
|   |-- integrity.sh                   # Structural integrity checks
|   |-- qa.sh                          # Test coverage gate
|   |-- security.sh                    # Security scan gate
|   +-- validate.sh                    # Schema/contract validation
|
|-- scripts/
|   +-- merge_audit.sh                 # Post-merge audit trail
|
|-- artifacts/                         # Pipeline outputs (per-task)
+-- tmp/                               # Scratch space (gitignored)
```

---

## Agent Roster

### Core Layer (9 agents)

| Agent | Role | Triad Position |
|-------|------|----------------|
| Dung PM | Orchestrator, task routing, LEDGER owner | Coordinator |
| Tung Diag | 12-dimension audit, MoE scoring | Audit |
| Phuc SA | Solution architect, contract drafts | Thesis |
| Moc | Architecture challenger, adversarial review | Anti-Thesis |
| Xuan | Contract/spec guard, schema validation | Synthesis |
| Conan | Requirements auditor, gap detection | Anti-Thesis |
| Son QA | Test strategy, coverage enforcement | Anti-Thesis |
| Nam | Observability, logging, tracing standards | Thesis |
| Nhien Janitor | Cleanup, archival, token optimization | Support (Haiku) |

### Dev Layer (10 agents)

| Agent | Role | Stack |
|-------|------|-------|
| Thuc | Backend developer | TypeScript / NestJS |
| Lan | Frontend developer | React / Next.js |
| Quang | UI/UX designer | Figma / wireframes |
| Hoang | Backend developer | .NET 9 / EF Core |
| Huyen-Py | Backend developer | Python |
| Tuan | Backend developer | Go / Fiber |
| Huyen FE-QA | Frontend QA, accessibility | React Testing Library |
| Hung | DevOps, infrastructure | Docker / K8s / CI |
| Minh | FE architecture challenger | Anti-Thesis (FE) |
| Trinh | FE test strategy | Anti-Thesis (FE) |

### Research Layer (5 agents)

| Agent | Role | Triad Position |
|-------|------|----------------|
| Ngu | Security research, penetration testing | Anti-Thesis |
| Cua | Feature research, competitive analysis | Thesis |
| Don | Synthesis judge, conflict resolution | Synthesis |
| Hieu | Architecture research, pattern evaluation | Thesis |
| Nghia | Stack research, technology evaluation | Thesis |

### User Layer (3 agents)

| Agent | Role |
|-------|------|
| Chau | UX advocacy, user journey validation |
| Thanh Lai | Deployment ops, release management |
| User Agent | Stakeholder proxy, acceptance criteria |

---

## Pipelines

| # | Pipeline | Purpose | Key Gate |
|---|----------|---------|----------|
| P0 | Research | Context gathering, prior art | Completeness audit |
| P1 | Requirements | Specs, contracts, gap analysis | Contract validation |
| P2 | Architecture | DB schema, API design, system design | Schema + security review |
| P3 | Coding | Implementation (TDD: red/green/refactor) | Build + lint + type-check |
| P4 | Testing | Unit, integration, e2e, coverage | Coverage >= 80% |
| P5 | Security & Deploy | Security scan, Dockerfile, CI/CD | Security gate pass |
| P6 | Emergency Hotfix | Fast-track for production incidents | Regression tests |
| -- | Design Flow | FE wireframes and design (no code) | API mapping complete |
| -- | FE Implementation | FE coding from approved wireframes | Build + a11y + tests |

---

## Core Concepts

**Nash Triad** -- Every non-trivial output passes through Thesis/Anti-Thesis/Synthesis.
The builder cannot approve its own work. The challenger is incentivized to find
real flaws (not nitpicks). The judge weighs both sides.

**Zero-Sum Scoring (P0-P4)** -- Agents earn points for catching real issues and
lose points for false positives or missed defects. Cheating (rubber-stamping,
fabricating issues) always has negative expected value.

**PEN/WIN System** -- Penalties become permanent constraints on an agent's
behavior. Rewards build trust and unlock expanded autonomy. History is immutable.

**3-Tier Memory** -- L2 Cache (always loaded with agent persona), RAM (on-demand
context pulled per task), HDD (source code, read as needed). This keeps token
usage bounded while preserving full context access.

**LEDGER** -- Immutable scoring record per task. Records every Triad decision,
gate result, and score change. Cannot be edited after the fact.

**NASH_SUBAGENT_PROMPTS v6.2** -- Universal dispatch template that works for any
project type. Defines the exact context, constraints, and scoring rules injected
into every subprocess call.

---

## Key Files

| File | Purpose |
|------|---------|
| `system/NASH.md` | Nash Equilibrium rules and Triad protocol |
| `system/SCORING_RULES.md` | Zero-sum scoring tables (P0-P4) |
| `system/MIXTURE_OF_EXPERTS_ROUTER.md` | 12-dimension audit and routing logic |
| `system/MEMORY_EVICTION_PROTOCOL.md` | L2/RAM/HDD memory management |
| `system/templates/NASH_SUBAGENT_PROMPTS.md` | v6.2 universal dispatch template |
| `system/templates/LEDGER_TEMPLATE.md` | Immutable task scoring record |
| `agents/BRAIN.md` | Agent memory architecture |
| `agents/core/dung-manager.md` | PM orchestrator (entry point) |

---

## Further Reading

- **[GUIDE.md](GUIDE.md)** -- Detailed usage guide and worked examples
- **[INSTALLATION.md](INSTALLATION.md)** -- Prerequisites and setup instructions

---

## License

MIT -- see [LICENSE](LICENSE) for details.
