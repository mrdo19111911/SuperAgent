# Nash Agent Framework v3.0

**Anti_propost_0.1** — Production-ready AI agent orchestration framework with MoE routing, Nash Triad validation, and 3-tier memory system.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js: >=18.0.0](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org)
[![SQLite: 3.x](https://img.shields.io/badge/SQLite-3.x-blue.svg)](https://www.sqlite.org)

---

## 🚀 Quick Start

```bash
# 1. Install production setup (NO Docker required)
bash scripts/install-production.sh

# 2. Install Node.js dependencies
npm install

# 3. Download local embedding model
npm run install:embeddings

# 4. Start observability server
npm start

# 5. Access dashboards
# - Grafana: http://localhost:3000
# - Prometheus: http://localhost:9090
# - REST API: http://localhost:4000
```

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Agent Creation & Upgrade](#agent-creation--upgrade)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Monitoring](#monitoring)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Nash Agent Framework is a **lightweight, portable AI agent orchestration system** designed for production workloads on a single server. Unlike heavyweight distributed systems, Nash focuses on:

- ✅ **Simplicity**: SQLite + local binaries, NO Docker required
- ✅ **Portability**: Works on Windows/Linux/macOS, deploy anywhere
- ✅ **Reliability**: Nash Triad validation prevents hallucinations
- ✅ **Observability**: Real-time dashboards with Grafana + Prometheus
- ✅ **Intelligence**: MoE routing + cognitive modes optimize token usage

### Use Cases

- **Complex Software Development**: 6 SDLC pipelines (Requirements → Architecture → Coding → Testing → Security → Hotfix)
- **Long-Running Tasks**: 2+ hour tasks with progress tracking and quota management
- **Multi-Agent Workflows**: Up to 15 concurrent agents with automatic coordination
- **Production Workloads**: 500+ tasks/month with 50+ agent definitions

---

## ⚡ Key Features

### 1. Nash Triad Validation (Zero Hallucinations)

Every pipeline step uses **Thesis → Anti-Thesis → Synthesis**:

```
Thesis (Builder)      ➜  Creates artifact
Anti-Thesis (Critic)  ➜  Adversarial review
Synthesis (Judge)     ➜  Final decision
```

No agent can self-approve their own work. This eliminates:
- ❌ Fabricated test results
- ❌ Lazy reviews ("LGTM" without reading)
- ❌ Contract drift
- ❌ Missed edge cases

### 2. Mixture-of-Experts (MoE) Router

**12-dimension audit** analyzes tasks and selects optimal pipeline:

| Dimension | Analysis |
|-----------|----------|
| Clarity | Spec completeness (0-100%) |
| Complexity | Story points estimate (1-30) |
| Risk | Production impact (Low/Med/High) |
| Scope | Affected systems count |
| Urgency | SLA deadline (hours) |
| Dependencies | Blocking tasks count |
| Technical Debt | Shortcuts needed (0-10) |
| Test Coverage | Existing tests (%) |
| Documentation | Spec quality (0-100%) |
| Team Capacity | Available agents |
| Historical Data | Similar task performance |
| Business Value | User impact (0-10) |

Routes to 1 of 6 pipelines based on audit scores.

### 3. Cognitive Modes (Adaptive Token Budgets)

Automatically adjusts token budgets based on task type:

- **EXPANSION** (15K-30K tokens): New domains, unclear requirements, exploration
- **HOLD** (10K-15K tokens): Critical architecture, integration, refactoring
- **REDUCTION** (5K-10K tokens): Simple implementations with clear specs

Saves 40-60% tokens on routine tasks while allowing deep thinking for complex problems.

### 4. 3-Tier Memory System

```
L2 Cache  →  agents/{layer}/{agent}.md    Always loaded (<500 tokens)
RAM       →  tmp/ram/{agent}/*.md         On-demand deep reference
HDD       →  Source code / schema         Never preloaded
```

**PEN/WIN entries** store hard constraints from past penalties/wins:
- **PEN**: "Never use `git add .`" (learned from accidental secret commit)
- **WIN**: "Always use prepared statements" (learned from SQL injection fix)

### 5. Production-Grade Observability

**4 Grafana Dashboards**:
1. **Task Overview**: Completion rate, duration histogram, status distribution
2. **Agent Activity**: Active agents, utilization, error timeline
3. **Token Usage**: Consumption by agent, budget vs actual, efficiency
4. **Token Quota Tracking** ⭐: Claude Pro 45 messages/5h limit monitoring

**Prometheus Metrics**:
- `nash_tasks_total{status}` - Task counter
- `nash_task_duration_seconds` - Latency histogram
- `nash_agents_active` - Concurrent agents
- `nash_tokens_used` - Token consumption

### 6. Automated Backup & Recovery

SQLite backups with integrity checks:
- Hourly (keep 24), Daily (keep 7), Weekly (keep 4), Monthly (keep 12)
- Pre/post `PRAGMA integrity_check`
- Disk space validation
- Prometheus metrics export

---

## 🏗️ Architecture

### System Diagram

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

### Data Flow

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

### Agent Archetypes

| Archetype | Strengths | Best For | Examples |
|-----------|-----------|----------|----------|
| **Analyst** | Requirements, specs, gap analysis | Defining acceptance criteria | Conan, Xuan |
| **Builder** | Implementation, artifact production | Execution phases | Thuc, Lan, Hoang |
| **Critic** | Adversarial review, edge cases | Verification phases | Moc, Son QA, Ngu |
| **Strategist** | Architecture, trade-offs, system design | Design and cross-cutting | Phuc SA, Hieu |
| **Operator** | Infrastructure, deployment, runtime | Non-functional verification | Hung, Thanh Lai |

---

## 🛠️ Agent Creation & Upgrade

Nash Agent Framework includes comprehensive infrastructure for creating, upgrading, and optimizing AI agents. This production-ready toolkit enables rapid agent development while maintaining high quality standards.

### Agent Templates

**Production-Ready Scaffolding:**

- **[agents/AGENT_TEMPLATE_V2.md](agents/AGENT_TEMPLATE_V2.md)** (370 lines) - Complete 9-section template for new agents:
  - SOUL (identity & philosophy)
  - SKILLS (workflows & checklists)
  - MEMORY (PEN/WIN entries)
  - TOOLS (available capabilities)
  - DOMAIN KNOWLEDGE (project standards)
  - STATISTICS (performance tracking)
  - SHARPENING LOG (improvement history)
  - REFERENCE MEMORY (on-demand RAM)
  - BOOT PROTOCOL (initialization sequence)

- **[system/templates/NASH_SUBAGENT_PROMPTS.md](system/templates/NASH_SUBAGENT_PROMPTS.md)** (v6.2) - Universal dispatch template used by Main Agent to spawn all sub-agents:
  - 6 pipeline types (Trivial/Simple/Complex/Critical/NASH/Urgent)
  - Phase labels (A-F) with cross-check chains
  - 10 dispatch rules (plan.md updates, verify flow, split strategy)
  - Multi-task DAG orchestration
  - Scoring system (P0-P4, M1/M2/M3 multipliers)

### Cognitive Modes ✅ IMPLEMENTED

**Adaptive Token Budgets Based on Task Complexity:**

Nash automatically adjusts token budgets using 3 cognitive modes. See **[system/COGNITIVE_MODES.md](system/COGNITIVE_MODES.md)** (394 lines) for full specification.

| Mode | Budget | Use Case | Token Savings |
|------|--------|----------|---------------|
| **EXPANSION** | 15K-30K | New domains, unclear requirements, exploration | Baseline |
| **HOLD** | 10K-15K | Critical architecture, integration, refactoring | 20-33% |
| **REDUCTION** | 5K-10K | Simple implementations with clear specs | 50-67% |

**Features:**
- Decision tree for automatic mode selection
- Integration with Nash Triad validation
- Grafana metrics for mode distribution
- PEN/WIN learning for mode tuning
- Agent boot protocol templates

**Savings:** 40-60% token reduction on routine tasks while preserving deep thinking for complex problems.

### Agent Sharpening (2 Complete Systems)

Nash includes two complementary agent upgrade systems:

#### 1. Reactive Sharpening (PEN/WIN-Based)

**[skill_factory/agent_skill_sharpener/SKILL.md](skill_factory/agent_skill_sharpener/SKILL.md)** (939 lines) - Learns from production failures:

- **Phase 1:** Extract agent profile (PEN/WIN analysis)
- **Phase 2:** Auto-generate evals from PEN entries (reproduction tests + synthetic variations)
- **Phase 3:** Baseline test (run agent vs known failures)
- **Phase 4:** Apply 5 enhancement strategies (Prime Directive, Escape Hatch, Table, Suppression, Philosophy)
- **Phase 5:** Cross-validation + merge to agent file

**When to use:** After production incidents, to prevent regression of known bugs.

**Supporting files:**
- `references/pen_to_eval_patterns.md` - Templates for PEN → eval conversion
- `references/enhancement_strategies.md` - When to use which strategy

#### 2. Proactive Sharpening (Industry Standards)

**[skill_factory/agent_sharpening_2026/SKILL.md](skill_factory/agent_sharpening_2026/SKILL.md)** (500+ lines) - Applies 2026 best practices:

- **Phase 1:** Audit against 5 core principles (Context, Single Responsibility, Adversarial Validation, Memory Hierarchy, Clear Boundaries)
- **Phase 2:** Workflow pattern analysis (9 proven patterns: ReAct, Plan-and-Execute, Critic/Reflection, etc.)
- **Phase 3:** Token optimization assessment (6-layer defense)
- **Phase 4:** Apply targeted improvements (ROI-based prioritization)
- **Phase 5:** Validation + documentation

**When to use:** During agent design/refactor, to adopt industry best practices from OpenAI Agents SDK, LangGraph, CrewAI, AutoGen.

**Target:** 60-80% token reduction through architectural improvements.

**Supporting files:**
- `references/workflow_patterns_catalog.md` - 9 workflow patterns
- `references/5_core_principles_checklist.md` - Audit checklist

### Token Optimization (6-Layer Defense)

**[system/TOKEN_OPTIMIZATION_ARCHITECTURE.md](system/TOKEN_OPTIMIZATION_ARCHITECTURE.md)** - Complete optimization strategy:

| Layer | Technique | Savings | Implementation |
|-------|-----------|---------|----------------|
| **1. RAG** | Selective Retrieval (vector search + grep fallback) | 70% | Qdrant + better-sqlite3 |
| **2. Compression** | Hierarchical (recent verbatim, medium compressed, old ultra) | 74% | Conversation compression |
| **3. Structured Prompting** | XML/Markdown sections with conditional loading | 30% | Template-based |
| **4. Modular Sub-agents** | Bounded context delegation | 76% | Nash Triad pipelines |
| **5. Shared Memory** | External PEN/WIN storage (SQLite) | 85% | 3-tier memory system |
| **6. Progressive Disclosure** | Lazy loading with triggers | 91% | On-demand RAM loading |

**Overall target:** 82.5% reduction (20K → 3.5K tokens/task)

**Related:**
- [system/MEMORY_EVICTION_PROTOCOL.md](system/MEMORY_EVICTION_PROTOCOL.md) - L2/RAM/HDD eviction rules (P0-P4 priority)
- `scripts/measure-baseline.sh` - Baseline metrics + decision triggers for when to apply optimizations

### Best Practices & References

**Industry Standards Synthesis (2026):**

- **[system/BEST_PRACTICE_AGENT.md](system/BEST_PRACTICE_AGENT.md)** - 5 core principles from OpenAI, LangGraph, CrewAI, AutoGen, Beam.ai:
  1. Context is Fuel, Not Cargo (60-80% token reduction)
  2. Single Responsibility per Agent (70% savings)
  3. Adversarial Validation (Nash Triad = zero-sum scoring)
  4. Memory Hierarchy (3-Tier: L2/RAM/HDD, 85% savings)
  5. Clear Boundaries & Interfaces (immutable contracts)

- **[skill_factory/GSTACK_WRITING_STYLE.md](skill_factory/GSTACK_WRITING_STYLE.md)** - 12 principles for high-quality agent skills (30 min read)

- **[skill_factory/GSTACK_ADVANCED_PATTERNS.md](skill_factory/GSTACK_ADVANCED_PATTERNS.md)** - 6 advanced patterns for complex skills (45 min read)

- **[skill_factory/QUALITY_CHECKLIST.md](skill_factory/QUALITY_CHECKLIST.md)** - 80+ item pre-launch checklist (Self-review → Peer review → Nash Triad review)

- **[skill_factory/SKILL_BUILDING_MASTER_GUIDE.md](skill_factory/SKILL_BUILDING_MASTER_GUIDE.md)** - Complete curriculum from beginner to master (5 levels)

### Skill Creation Tools

**Automated Skill Builder:**

- **[skill_factory/smartlog_skill_creator/SKILL.md](skill_factory/smartlog_skill_creator/SKILL.md)** - Automated skill builder with testing:
  - Phase 1: Capture Intent
  - Phase 2: Write Draft (applies 12 gstack principles)
  - Phase 3: Automated Testing
  - Phase 4: Iterative Improvement
  - Phase 5: Package + Optimize Triggering
  - **Teaching mode:** Explains quality patterns while building

- **[skill_factory/SKILL_TEMPLATE/](skill_factory/SKILL_TEMPLATE/)** - Copy-paste scaffold for new skills:
  ```bash
  cp -r skill_factory/SKILL_TEMPLATE ~/.claude/skills/my-new-skill
  ```

### Quality Gates (Polyglot Validators)

5 automated validators supporting TypeScript, Go, .NET, and Python:

```bash
# 1. Validate: Build + tsc + tests + no TODO/FIXME
bash gates/validate.sh module_dir

# 2. Integrity: Detect mocks/placeholders in integration tests
bash gates/integrity.sh module_dir

# 3. QA: SAST + test distribution + smoke test
bash gates/qa.sh module_dir [url]

# 4. Security: Secrets scan + dependency audit
bash gates/security.sh module_dir

# 5. Safe commit: Pre-validate → exclude secrets → targeted git add
bash gates/commit.sh module_name "commit message"
```

**Auto-detection:** Gates automatically detect project language and run appropriate toolchain (npm/go/dotnet/pytest).

---

## 💻 Installation

### Prerequisites

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org))
- **SQLite**: >= 3.35.0 (for WAL mode)
- **Git**: >= 2.30.0
- **OS**: Windows 10+, Linux, or macOS
- **RAM**: 4GB minimum, 16GB recommended
- **Disk**: 10GB free space (for embeddings + backups)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/nash-agent-framework.git
cd nash-agent-framework
```

### Step 2: Run Production Install Script

```bash
bash scripts/install-production.sh
```

This script will:
1. ✅ Detect your OS (Windows/Linux/macOS)
2. ✅ Install SQLite with WAL mode enabled
3. ✅ Download Qdrant binary (Vector DB)
4. ✅ Download Prometheus binary (metrics)
5. ✅ Install Grafana (native, NO Docker)
6. ✅ Create database schema with indexes
7. ✅ Set up automated backups (cron jobs)
8. ✅ Verify installation with health checks

**Installation time**: ~10-15 minutes (includes downloads)

### Step 3: Install Node.js Dependencies

```bash
npm install
```

**Dependencies installed**:
- `express` - REST API server
- `better-sqlite3` - SQLite driver with WAL support
- `@qdrant/js-client-rest` - Vector DB client
- `@xenova/transformers` - Local embeddings (no API calls)
- `prom-client` - Prometheus metrics
- `lru-cache` - Query caching

### Step 4: Download Embedding Model

```bash
npm run install:embeddings
```

Downloads **snowflake-arctic-embed-xs** (22M params, ~100MB).

### Step 5: Start Services

```bash
# Start observability server
npm start

# Or run in background
npm start &
```

### Verification

```bash
# Check health
curl http://localhost:4000/health

# Should return:
# {"status":"ok","database":"connected","timestamp":"..."}
```

---

## 🎮 Usage

### Basic Task Dispatch

```bash
# Entry point: PM agent orchestrates everything
claude --agent agents/core/dung-manager.md "Implement user authentication for web app"
```

**What happens**:
1. **Audit**: Tung performs 12-dimension analysis
2. **Route**: MoE Router selects Pipeline #3 (Coding)
3. **Execute**:
   - Phase A: Conan defines acceptance criteria
   - Phase B: Moc reviews criteria
   - Phase C: Thuc implements code
   - Phase D: Son QA tests functionality
   - Phase E: Ngu reviews security
   - Phase F: Dung PM updates LEDGER with scores
4. **Monitor**: Watch progress in Grafana dashboards

### Quality Gates

Run before merge/deploy:

```bash
# Validate: Build + tsc + tests + no TODO/FIXME
bash gates/validate.sh module_dir

# Integrity: Detect mocks/placeholders in integration tests
bash gates/integrity.sh module_dir

# QA: SAST + test distribution + smoke test
bash gates/qa.sh module_dir [url]

# Security: Secrets scan + dependency audit
bash gates/security.sh module_dir

# Safe commit: Pre-validate → exclude secrets → targeted git add
bash gates/commit.sh module_name "commit message"
```

**All gates are polyglot**: Auto-detect TypeScript/Go/.NET/Python and run appropriate toolchain.

### Parallel Task Execution

```bash
# Scenario: 5 tasks in parallel, each uses 3 agents = 15 agents concurrent
# Nash handles coordination automatically via SQLite + WAL mode
claude --agent agents/core/dung-manager.md "
  Task 1: Implement login API
  Task 2: Create user dashboard
  Task 3: Add password reset
  Task 4: Implement 2FA
  Task 5: Add session management
"
```

**Resource usage**:
- CPU: 28 cores (E5-2680v4) - agents use 2-4 cores each
- RAM: 64GB - each agent ~2-4GB
- Disk: SQLite WAL handles concurrent writes

### Manual Mode Selection

```javascript
// In your task description, force a specific mode:
const { selectMode } = require('./system/mode_selector.js');

const result = selectMode("Implement login button", {
  forceMode: 'REDUCTION',  // Override automatic selection
  customBudget: 5000,      // Custom token budget
  verbose: true            // Debug logging
});

// Result:
// {
//   mode: 'REDUCTION',
//   budget: 5000,
//   reason: 'Forced by caller: REDUCTION',
//   complexity: { hasSpec: false, wordCount: 3, ... }
// }
```

### Vector DB Queries

```javascript
const { queryPENEntries } = require('./system/vector_db_wrapper.js');

// Semantic search (uses Qdrant + embeddings)
const results = await queryPENEntries("How to handle git commits?", {
  limit: 10,
  scoreThreshold: 0.7
});

// Results:
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

## ⚙️ Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Database
SQLITE_DB_PATH=data/nash.db

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_TIMEOUT=5000

# Observability
API_PORT=4000
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000

# Token Budgets (override defaults)
EXPANSION_BUDGET_MAX=30000
HOLD_BUDGET_DEFAULT=12000
REDUCTION_BUDGET_MIN=5000

# Backup
BACKUP_DIR=data/backups
BACKUP_RETENTION_HOURLY=24
BACKUP_RETENTION_DAILY=7

# Claude API (optional - for remote agents)
CLAUDE_API_KEY=your-api-key-here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
```

---

## 📊 Monitoring

### Grafana Dashboards

Access at `http://localhost:3000` (default login: admin/admin)

**1. Task Overview Dashboard**
- Task completion rate (24h gauge)
- Tasks by status (pie chart)
- Duration histogram (P50/P95/P99)
- Tasks over time (stacked time series)

**2. Agent Activity Dashboard**
- Active agents count
- Agent utilization (tasks per agent)
- Agent states timeline
- Error log table

**3. Token Usage Dashboard**
- Total tokens consumed
- Tokens by agent (bar chart)
- Budget vs actual (dual-axis)
- Token efficiency gauge

**4. Token Quota Dashboard** ⭐ **Most Important**
- **Current 5h window usage** (green/yellow/red thresholds)
- **Messages remaining** (based on 45 msg/5h Claude Pro limit)
- **Reset countdown** (time until quota resets)
- **Historical usage** (48h rolling view)
- **Task queue** (pending tasks when quota exhausted)

### REST API Endpoints

**Tasks**:
```bash
# Get active tasks
curl http://localhost:4000/api/tasks/active

# Get task details
curl http://localhost:4000/api/tasks/{task_id}
```

**Agents**:
```bash
# Get agent status
curl http://localhost:4000/api/agents/status

# Get agent history
curl http://localhost:4000/api/agents/{agent_id}/history
```

**Metrics**:
```bash
# Get summary metrics
curl http://localhost:4000/api/metrics/summary

# Prometheus format
curl http://localhost:4000/metrics
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

Output:
```
PASS tests/unit/mode_selector.test.js (12 tests)
PASS tests/unit/vector_db_wrapper.test.js (6 tests)
PASS tests/unit/sqlite_setup.test.js (3 tests)
PASS tests/integration/vector_fallback.test.js (4 tests)
PASS tests/integration/dashboard_api.test.js (3 tests)
PASS tests/integration/concurrent_sqlite.test.js (1 test)
PASS tests/e2e/dashboard_polling.test.js (1 test)

Test Suites: 7 passed, 7 total
Tests:       30 passed, 30 total
Coverage:    92.3% (lines), 89.1% (branches)
```

### Run Specific Test Suite

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e
```

---

## 📚 Documentation

### Core Documentation

- [CLAUDE.md](CLAUDE.md) - Instructions for Claude Code integration
- [GUIDE.md](GUIDE.md) - Complete framework guide
- [IMPLEMENTATION_COMPLETE.md](IMPLEMENTATION_COMPLETE.md) - v3.0 implementation details
- [SYNTHESIS_ROADMAP.md](SYNTHESIS_ROADMAP.md) - Upgrade roadmap

### System Documentation

- [system/AUDIT.md](system/AUDIT.md) - 12-dimension audit specification
- [system/MIXTURE_OF_EXPERTS_ROUTER.md](system/MIXTURE_OF_EXPERTS_ROUTER.md) - MoE routing logic
- [system/NASH.md](system/NASH.md) - Nash Equilibrium rules
- [system/SCORING_RULES.md](system/SCORING_RULES.md) - P0-P4 scoring tables
- [system/COGNITIVE_MODES.md](system/COGNITIVE_MODES.md) - Mode selection guide
- [system/BEST_PRACTICE_AGENT.md](system/BEST_PRACTICE_AGENT.md) - 2026 industry standards (5 core principles)
- [system/TOKEN_OPTIMIZATION_ARCHITECTURE.md](system/TOKEN_OPTIMIZATION_ARCHITECTURE.md) - 6-layer token optimization
- [system/MEMORY_EVICTION_PROTOCOL.md](system/MEMORY_EVICTION_PROTOCOL.md) - Memory eviction rules

### Agent Infrastructure

- [agents/AGENT_TEMPLATE_V2.md](agents/AGENT_TEMPLATE_V2.md) - Agent creation template (9 sections)
- [agents/BRAIN.md](agents/BRAIN.md) - Agent memory architecture
- [skill_factory/agent_skill_sharpener/SKILL.md](skill_factory/agent_skill_sharpener/SKILL.md) - PEN/WIN-based sharpening
- [skill_factory/agent_sharpening_2026/SKILL.md](skill_factory/agent_sharpening_2026/SKILL.md) - Industry standards sharpening
- [skill_factory/SKILL_BUILDING_MASTER_GUIDE.md](skill_factory/SKILL_BUILDING_MASTER_GUIDE.md) - Complete skill creation curriculum
- [skill_factory/GSTACK_WRITING_STYLE.md](skill_factory/GSTACK_WRITING_STYLE.md) - 12 writing principles
- [skill_factory/QUALITY_CHECKLIST.md](skill_factory/QUALITY_CHECKLIST.md) - 80+ item quality checklist

### Pipeline Documentation

- [pipelines/01_REQUIREMENTS_AND_RESEARCH.md](pipelines/01_REQUIREMENTS_AND_RESEARCH.md)
- [pipelines/02_ARCHITECTURE_AND_DB.md](pipelines/02_ARCHITECTURE_AND_DB.md)
- [pipelines/03_CODING_AND_DEV.md](pipelines/03_CODING_AND_DEV.md)
- [pipelines/04_TESTING_AND_QA.md](pipelines/04_TESTING_AND_QA.md)
- [pipelines/05_SECURITY_AND_DEPLOYMENT.md](pipelines/05_SECURITY_AND_DEPLOYMENT.md)
- [pipelines/06_EMERGENCY_HOTFIX.md](pipelines/06_EMERGENCY_HOTFIX.md)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Anthropic Claude** - AI assistance via Claude Code
- **SQLite** - World's most deployed database engine
- **Qdrant** - High-performance vector database
- **Grafana** - Beautiful observability dashboards
- **Prometheus** - Industry-standard metrics collection

---

**Built with ❤️ by the Nash Agent Framework Team**

**Powered by**: [Claude Code](https://claude.com/claude-code)
