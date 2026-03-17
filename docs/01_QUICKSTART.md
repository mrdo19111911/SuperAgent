# Quick Start Guide

Get up and running with Nash Agent Framework in 15 minutes.

---

## Prerequisites

- **Node.js**: >= 18.0.0 ([Download](https://nodejs.org))
- **SQLite**: >= 3.35.0 (for WAL mode)
- **Git**: >= 2.30.0
- **OS**: Windows 10+, Linux, or macOS
- **RAM**: 4GB minimum, 16GB recommended
- **Disk**: 10GB free space

---

## Installation (10 minutes)

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
1. Detect your OS (Windows/Linux/macOS)
2. Install SQLite with WAL mode
3. Download Qdrant binary (Vector DB)
4. Download Prometheus binary (metrics)
5. Install Grafana (native, NO Docker)
6. Create database schema with indexes
7. Set up automated backups (cron jobs)
8. Verify installation with health checks

**Installation time**: ~10-15 minutes (includes downloads)

### Step 3: Install Dependencies

```bash
npm install
npm run install:embeddings
```

Downloads the local embedding model (snowflake-arctic-embed-xs, ~100MB).

### Step 4: Start Services

```bash
npm start
```

Access dashboards:
- **Grafana**: http://localhost:3000 (default login: admin/admin)
- **Prometheus**: http://localhost:9090
- **REST API**: http://localhost:4000

---

## Your First Task (5 minutes)

### 1. Dispatch a Simple Task

```bash
claude --agent agents/core/dung-manager.md "Add logging to user authentication module"
```

**What happens:**
1. **Audit**: Tung performs 12-dimension analysis
2. **Route**: MoE Router selects appropriate pipeline (likely Pipeline 3: Coding)
3. **Execute**: Nash Triad validation (Thesis → Anti-Thesis → Synthesis)
4. **Complete**: LEDGER.md created with agent scores

### 2. Monitor Progress

Open Grafana at http://localhost:3000 and navigate to:
- **Task Overview Dashboard**: See task status, duration, completion rate
- **Token Quota Dashboard**: Monitor Claude API usage (45 msg/5h limit)

### 3. Review Results

```bash
# Check LEDGER for scoring
cat artifacts/task-001/LEDGER.md

# Example output:
# | Agent | Phase | Score | Evidence |
# |-------|-------|-------|----------|
# | Thuc (Thesis) | C-Execute | +5 | Passed review on first attempt |
# | Moc (Anti-Thesis) | D-Verify | +10 | Found 2 edge cases (P3×2) |
# | Dung PM (Synthesis) | F-Score | 0 | Neutral judge |
```

---

## What Just Happened?

Your task went through the **Nash Triad**:

1. **Thesis** (Builder): Thuc implemented the logging feature
2. **Anti-Thesis** (Critic): Moc reviewed for bugs and edge cases
3. **Synthesis** (Judge): Dung PM scored both agents based on evidence

**Key guarantees:**
- No agent reviewed their own work
- Every finding required evidence (file:line, gate log, commit hash)
- Scores are zero-sum (one agent's gain = another's loss)
- All transactions recorded in LEDGER.md (immutable)

---

## Next Steps

### Common Workflows

1. **Add a new agent**: See [docs/03_USAGE_GUIDE.md](03_USAGE_GUIDE.md#creating-agents)
2. **Create a custom pipeline**: See [docs/03_USAGE_GUIDE.md](03_USAGE_GUIDE.md#creating-pipelines)
3. **Optimize token usage**: See [docs/02_CONCEPTS.md](02_CONCEPTS.md#cognitive-modes)

### Learning Resources

- **Concepts**: [docs/02_CONCEPTS.md](02_CONCEPTS.md) - Nash Triad, MoE Router, 3-tier memory
- **Architecture**: [docs/04_ARCHITECTURE.md](04_ARCHITECTURE.md) - Deep dive into system design
- **Contributing**: [docs/05_CONTRIBUTING.md](05_CONTRIBUTING.md) - Development workflow

### Troubleshooting

- **Installation fails**: See [docs/FAQ.md](FAQ.md#installation-errors)
- **Task stuck**: See [docs/FAQ.md](FAQ.md#task-debugging)
- **Token quota hit**: See [docs/FAQ.md](FAQ.md#quota-management)

---

## Quick Reference Commands

```bash
# Quality gates (run before merge)
bash gates/validate.sh module_dir          # Build + tsc + tests
bash gates/integrity.sh module_dir         # Detect mocks in tests
bash gates/qa.sh module_dir [url]          # SAST + smoke test
bash gates/security.sh module_dir          # Secrets + dependency audit
bash gates/commit.sh module "msg"          # Safe git commit

# Monitoring
curl http://localhost:4000/health          # Health check
curl http://localhost:4000/api/tasks/active # Active tasks
curl http://localhost:4000/metrics         # Prometheus metrics

# Audit
bash scripts/merge_audit.sh module_dir     # Merge 3 sub-audits
```

---

**You're ready!** Start building with confidence knowing that Nash Triad validation prevents hallucinations and ensures quality.
