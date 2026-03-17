# Nash Agent Framework v3.0

**Anti_propost_0.1** — Production-ready AI agent orchestration framework with MoE routing, Nash Triad validation, and 3-tier memory system.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js: >=18.0.0](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![SQLite: 3.x](https://img.shields.io/badge/SQLite-3.x-blue.svg)](https://www.sqlite.org)

---

## What is Nash Agent Framework?

Nash Agent Framework is a **lightweight, portable AI agent orchestration system** designed for production workloads on a single server. Unlike heavyweight distributed systems, Nash focuses on simplicity, reliability, and intelligent token usage.

**The core innovation:** Every task uses **Nash Triad validation** (Thesis → Anti-Thesis → Synthesis) where no agent can self-approve their work. This creates a game-theoretic environment where honesty and quality are the only profitable strategies — eliminating hallucinations, fabricated tests, and lazy reviews.

**Key differentiators:**

- **Zero Hallucinations**: Nash Equilibrium scoring makes deception negative expected value
- **Intelligent Routing**: 12-dimension audit selects optimal pipeline (Requirements/Architecture/Coding/Testing/Security/Hotfix)
- **Adaptive Token Budgets**: Cognitive modes (EXPANSION/HOLD/REDUCTION) save 40-60% tokens on routine tasks
- **Production-Grade**: SQLite + Grafana + Prometheus, NO Docker required
- **Portable**: Works on Windows/Linux/macOS, single-server deployment

**Perfect for:**
- Complex software development (6 SDLC pipelines)
- Long-running tasks (2+ hours with progress tracking)
- Multi-agent workflows (up to 15 concurrent agents)
- Token-conscious operations (Claude Pro 45 msg/5h quota management)

---

## Quick Start

**Get running in 5 minutes with AUTO-SETUP:**

```bash
# Clone repo
git clone <your-repo-url>
cd nash-agent-framework

# ONE-COMMAND SETUP (Windows)
setup-vector-db.bat

# ONE-COMMAND SETUP (Linux/Mac)
bash setup-vector-db.sh

# That's it! Vector DB is ready 🎉
```

**What gets installed:**
- ✅ Vector embeddings for semantic PEN search (no Docker!)
- ✅ In-memory vector database (~80MB model)
- ✅ All tests validated automatically
- ✅ Ready to use in 3-5 minutes

**Optional (if you need observability dashboard):**
```bash
npm install  # Installs SQLite + Express (needs VS Build Tools on Windows)
npm start    # Start dashboard on port 4000

# 5. Monitor progress
# Grafana: http://localhost:3000 (admin/admin)
# Prometheus: http://localhost:9090
# REST API: http://localhost:4000
```

**What just happened?**
1. **Audit**: 12-dimension codebase analysis
2. **Route**: MoE Router selects Pipeline #3 (Coding)
3. **Execute**: Nash Triad (Thesis builds → Anti-Thesis reviews → Synthesis judges)
4. **Score**: Immutable LEDGER.md created with zero-sum scoring

**See:** [docs/01_QUICKSTART.md](docs/01_QUICKSTART.md) for full tutorial.

---

## Architecture Overview

### Nash Triad Validation

```
┌─────────────────────────────────────────────────────────────┐
│  THESIS (Builder)                                           │
│  └─ Produces artifact (code/docs/designs)                   │
│     Best strategy: Create correct work                      │
│     Penalty: -30 points if major bugs found                 │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  ANTI-THESIS (Critic)                                       │
│  └─ Adversarial review with evidence requirements           │
│     Best strategy: Find real bugs (not fabricate)           │
│     Rewards: +N points per finding                          │
│     Penalties: M1 (Missed Bug), M2 (Second Catch),          │
│                M3 (Fabrication) = -30 points                │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  SYNTHESIS (Judge)                                          │
│  └─ Decides based on evidence alone                         │
│     Best strategy: Rule objectively                         │
│     Writes to immutable LEDGER.md                           │
└─────────────────────────────────────────────────────────────┘
```

**Result:** Deception is always negative expected value. The only profitable strategy for every agent is honest, quality work.

### 6 SDLC Pipelines

Each pipeline uses Nash Triad validation:

| # | Pipeline | Thesis | Anti-Thesis | Synthesis | Triggers |
|---|----------|--------|-------------|-----------|----------|
| 1 | Requirements | Dung PM + Chau UX | Conan | User | SPEC empty |
| 2 | Architecture | Phuc SA + Quang | Moc + Lan | Dung PM | Missing schema/contracts |
| 3 | Coding | Dev agents | ESLint + Moc | Phuc SA | Contracts done, code incomplete |
| 4 | Testing | Son QA + Huyen FE-QA | Lan | Dung PM | Code done, tests missing |
| 5 | Security | CI/CD + Thanh Lai | Ngu | User | Tests pass, pre-deploy |
| 6 | Hotfix | Tung + Lan | Moc | Dung PM | Production incident |

### MoE Router (12-Dimension Audit)

Before any pipeline runs, the framework diagnoses the codebase:

| Dimension | Analysis | Output |
|-----------|----------|--------|
| C1: Business | Requirements clarity | Score 0-100% |
| C2: Docs | Documentation completeness | Score 0-100% |
| C4: Architecture | System design quality | Score 0-100% |
| C5: Security | Vulnerabilities, auth | Score 0-100% |
| C8: Database | Schema quality | Score 0-100% |
| C11: Backend | API completeness | Score 0-100% |
| ... | 6 more dimensions | ... |

**Example routing:**
```
Audit: C1=20%, C4=0%, C8=0% → Route: Pipeline 1 → 2 → 3
Audit: C11=75% (bug) → Route: Pipeline 3 (Coding)
Task: [URGENT] tag → Route: Pipeline 6 (Hotfix)
```

### 3-Tier Memory System

```
L2 Cache  →  agents/{layer}/{agent}.md    Always loaded (<500 tokens)
RAM       →  tmp/ram/{agent}/*.md         On-demand (2K limit/excerpt)
HDD       →  Source code / schemas        Never preloaded
```

**PEN/WIN entries** in L2 Cache = hard constraints from past penalties/wins:
- `PEN [P2] CONTRACT_DRIFT: Always validate response against CONTRACT_DRAFT`
- `WIN [10pts] Used prepared statements → prevented SQL injection`

### Scoring System (P0-P4)

Zero-sum scoring with evidence requirements:

| Severity | Points | Trigger | Example |
|----------|--------|---------|---------|
| **P0** | ±30 | Fabrication, production bug | Committed .env with secrets |
| **P1** | ±20 | Bug leaks to QA gate | Integration test fails after review |
| **P2** | ±15 | Spec drift, wrong root-cause | API doesn't match CONTRACT_DRAFT |
| **P3** | ±10 | Missing criteria, TODO in code | Criteria without assertions |
| **P4** | ±5 | Nitpick (max 2/review) | Inconsistent naming |

**See:** [docs/04_ARCHITECTURE.md](docs/04_ARCHITECTURE.md) for complete system design.

---

## Documentation

### Learning Resources

- **[Quick Start](docs/01_QUICKSTART.md)** — 15-minute tutorial (Install → Run task → View LEDGER)
- **[Core Concepts](docs/02_CONCEPTS.md)** — Nash Triad, MoE Router, Cognitive Modes explained
- **[Usage Guide](docs/03_USAGE_GUIDE.md)** — Common workflows (Add agent/pipeline/skill)
- **[Architecture](docs/04_ARCHITECTURE.md)** — Deep dive into system internals
- **[Contributing](docs/05_CONTRIBUTING.md)** — Development guide (Git workflow, testing, gates)
- **[FAQ](docs/FAQ.md)** — Troubleshooting (Common errors, performance tips)

### Core Documentation (AI-Loaded)

- **[CLAUDE.md](CLAUDE.md)** — Instructions for Claude Code integration
- **[system/templates/NASH_SUBAGENT_PROMPTS.md](system/templates/NASH_SUBAGENT_PROMPTS.md)** — v6.2 universal dispatch template (CORE MECHANISM)
- **[system/AUDIT.md](system/AUDIT.md)** — 12-dimension audit specification
- **[system/MIXTURE_OF_EXPERTS_ROUTER.md](system/MIXTURE_OF_EXPERTS_ROUTER.md)** — MoE routing logic
- **[system/SCORING_RULES.md](system/SCORING_RULES.md)** — P0-P4 scoring tables

### Agent Infrastructure

- **[agents/AGENT_TEMPLATE_V2.md](agents/AGENT_TEMPLATE_V2.md)** — Production-ready agent template (9 sections)
- **[factories/skill/agent_skill_sharpener/SKILL.md](factories/skill/agent_skill_sharpener/SKILL.md)** — PEN/WIN-based sharpening (reactive)
- **[factories/skill/agent_sharpening_2026/SKILL.md](factories/skill/agent_sharpening_2026/SKILL.md)** — Industry standards sharpening (proactive)
- **[system/BEST_PRACTICE_AGENT.md](system/BEST_PRACTICE_AGENT.md)** — 5 core principles (60-80% token reduction)

---

## Contributing

We welcome contributions! See [docs/05_CONTRIBUTING.md](docs/05_CONTRIBUTING.md) for:

- Development workflow
- Testing requirements (TDD, 80% coverage)
- Quality gates (validate/integrity/qa/security/commit)
- Git workflow (conventional commits)
- Pull request process

**Quick contribution:**

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/nash-agent-framework.git
cd nash-agent-framework

# 2. Create feature branch
git checkout -b feature/my-feature

# 3. Make changes, write tests
npm test

# 4. Run quality gates
bash gates/validate.sh .
bash gates/qa.sh .

# 5. Commit and push
bash gates/commit.sh module "feat: add my feature"
git push origin feature/my-feature

# 6. Open pull request on GitHub
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **Anthropic Claude** — AI assistance via Claude Code
- **SQLite** — World's most deployed database engine
- **Qdrant** — High-performance vector database
- **Grafana** — Beautiful observability dashboards
- **Prometheus** — Industry-standard metrics collection

---

**Built with ❤️ by the Nash Agent Framework Team**

**Powered by**: [Claude Code](https://claude.com/claude-code)
