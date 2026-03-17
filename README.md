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

### Standalone (development)

```bash
git clone <your-repo-url>
cd nash-agent-framework
npm run setup
```

### Embed into an existing project

```bash
cd your-project/
git clone <your-repo-url> SuperAgent
cd SuperAgent && npm run setup
```

**What `npm run setup` does:**
1. Installs dependencies (pure JS, no native binaries)
2. Builds BM25 search index over knowledge docs
3. Analyzes git history (hot files, co-change patterns)
4. Scans target codebase with GitNexus Knowledge Graph (if embedded)
5. Ready to use

**Dispatch a task:**
```bash
claude --agent agents/core/dung-manager.md "Implement feature X"
```

**What happens:**
1. **Audit**: 12-dimension codebase analysis
2. **Route**: MoE Router selects optimal pipeline
3. **Execute**: Nash Triad (Thesis builds → Anti-Thesis reviews → Synthesis judges)
4. **Score**: Immutable LEDGER.md with zero-sum scoring

**Optional (observability dashboard):**
```bash
npm start    # Dashboard on http://localhost:4000
```

**See:** [docs/01_QUICKSTART.md](docs/01_QUICKSTART.md) for full tutorial.

---

## Installation Guide

### Prerequisites

- **Node.js** >= 18.0.0
- **Claude Code** (CLI) — [Install guide](https://docs.anthropic.com/en/docs/claude-code)
- **Git** — for repository analysis

### Step 1: Embed SuperAgent into your project

```bash
cd your-project/
git clone <your-repo-url> SuperAgent
cd SuperAgent
```

### Step 2: Install and build indexes

```bash
npm run setup
```

This runs automatically:
```
npm install                              # Pure JS deps (sql.js, express, lru-cache)
node scripts/create-demo-db.cjs         # SQLite demo database
node scripts/auto_generate_ki.cjs       # Generate knowledge items
node scripts/compress_ki.cjs            # Compress knowledge items
node scripts/ki_vector.cjs              # Build BM25 search index
node scripts/analyze_git_dependencies.cjs  # Git hot files + co-change patterns
npx gitnexus analyze ..                  # Build Knowledge Graph of your project
```

**After setup, you have:**
- `data/ki_vectors.db` — BM25 search index (knowledge docs)
- `.gitnexus/` — Knowledge Graph database (your project's code structure)
- `.claude/skills/gitnexus/` — 6 auto-generated agent skills

### Step 3: Register Knowledge Graph MCP server

```bash
# Option A: Via Claude Code CLI
claude mcp add gitnexus -- npx -y gitnexus@latest mcp

# Option B: Manual — create .mcp.json in project root
cat <<'EOF' > ../.mcp.json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
EOF
```

This gives agents access to 7 MCP tools: `query`, `impact`, `context`, `detect_changes`, `rename`, `cypher`, `list_repos`.

### Step 4: Start coding with agents

```bash
# Dispatch a task through the full SDLC pipeline
claude --agent SuperAgent/agents/core/dung-manager.md "Implement user authentication"

# Or use Claude Code directly — agents auto-detect Knowledge Graph
claude
```

**Agents now have:**
- BM25 search over framework knowledge (scoring rules, conventions, architecture)
- Knowledge Graph of your entire codebase (functions, classes, imports, call chains)
- Impact analysis before making changes
- Entry point discovery for onboarding
- Dead code detection for cleanup

### Verify everything works

```bash
cd SuperAgent

# Check BM25 search
npm run ki:search "scoring rules"        # Should return ranked results
npm run ki:list                           # Should list indexed chunks

# Check Knowledge Graph
npm run kg:list                           # Should show your project
npx gitnexus query "main entry point"    # Should find entry points
npx gitnexus impact "yourFunction"       # Should show blast radius

# Check GitNexus status
npx gitnexus status                      # Index stats
```

### Updating indexes

```bash
# After changing knowledge docs
npm run setup:index                       # Rebuild BM25

# After changing source code
npm run kg:analyze                        # Incremental KG update
npm run kg:analyze:force                  # Full KG rebuild

# GitNexus also auto-reindexes after git commits (via PostToolUse hook)
```

### Exclude directories from Knowledge Graph

Create `.gitnexusignore` in project root (same syntax as `.gitignore`):

```
# Example: exclude vendor code and generated files
node_modules/
dist/
build/
vendor/
*.generated.ts
```

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

### Knowledge Intelligence (Dual Search)

SuperAgent uses two complementary search systems to understand both **knowledge** and **code structure**:

```
┌─────────────────────────────────────────────────────────────┐
│  BM25 Search (Knowledge Docs)                               │
│  ├─ Index: agents/knowledge/*.md → SQLite (data/ki_vectors.db)
│  ├─ Query: "scoring rules penalties" → ranked results (26ms)│
│  ├─ Pure JS, zero native deps                               │
│  └─ Used by: All agents for domain knowledge lookup         │
├─────────────────────────────────────────────────────────────┤
│  GitNexus Knowledge Graph (Code Structure)                  │
│  ├─ Index: Target project source → .gitnexus/ (graph DB)   │
│  ├─ 9 languages: TS, JS, Python, Java, C, C++, C#, Go, Rust│
│  ├─ 7 MCP tools: query, impact, context, detect_changes,   │
│  │   rename, cypher, list_repos                             │
│  └─ Used by: Agents for impact analysis, dependency mapping,│
│     entry point discovery, dead code detection              │
└─────────────────────────────────────────────────────────────┘
```

| Dimension | BM25 | GitNexus KG |
|-----------|------|-------------|
| **Scope** | Knowledge docs (`.md`) | Source code (9 languages) |
| **Good at** | "What are the scoring rules?" | "What breaks if I change UserService?" |
| **Speed** | ~26ms | ~8s initial scan, instant queries |
| **Deps** | sql.js (pure JS) | gitnexus (Tree-sitter WASM) |
| **Storage** | `data/ki_vectors.db` | `.gitnexus/` |

**BM25 commands:**
```bash
npm run ki:search "Nash Triad review"    # Search knowledge docs
npm run ki:list                           # List all indexed chunks
npm run setup:index                       # Rebuild BM25 index
```

**GitNexus commands:**
```bash
npm run kg:analyze                        # Scan target codebase
npm run kg:analyze:force                  # Full rebuild
npm run kg:list                           # List indexed repos
npm run kg:clean                          # Delete index
npx gitnexus impact "functionName"        # Blast radius analysis
npx gitnexus context "ClassName"          # 360° symbol view
npx gitnexus query "authentication flow"  # Search execution flows
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
- **SQLite** — World's most deployed database engine (via sql.js)
- **GitNexus** — Zero-server code intelligence engine
- **Grafana** — Beautiful observability dashboards
- **Prometheus** — Industry-standard metrics collection

---

**Built with ❤️ by the Nash Agent Framework Team**

**Powered by**: [Claude Code](https://claude.com/claude-code)
