# Frequently Asked Questions

Troubleshooting, common errors, performance tips, and debugging steps.

---

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Task Debugging](#task-debugging)
3. [Token Quota Management](#token-quota-management)
4. [Performance Optimization](#performance-optimization)
5. [Agent Behavior](#agent-behavior)
6. [Quality Gates](#quality-gates)
7. [Database Issues](#database-issues)
8. [Grafana & Monitoring](#grafana--monitoring)

---

## Installation Issues

### Q: `install-production.sh` fails with "SQLite not found"

**Symptoms:**
```bash
Error: SQLite binary not found in PATH
Installation failed
```

**Solution:**

```bash
# Windows (using Chocolatey)
choco install sqlite

# macOS (using Homebrew)
brew install sqlite3

# Linux (Debian/Ubuntu)
sudo apt-get install sqlite3 libsqlite3-dev

# Verify installation
sqlite3 --version
# Should show: 3.35.0 or higher
```

---

### Q: Qdrant fails to start on Windows

**Symptoms:**
```bash
Error: Failed to start Qdrant service
Port 6333 already in use
```

**Solution:**

```bash
# 1. Check if Qdrant is already running
netstat -ano | findstr :6333

# 2. Kill existing process
taskkill /PID <PID> /F

# 3. Restart Qdrant
npm run qdrant:start

# Alternative: Change Qdrant port
# Edit .env:
QDRANT_URL=http://localhost:6334
```

---

### Q: `npm install` fails with EACCES permission error

**Symptoms:**
```bash
Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution:**

```bash
# Option 1: Use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then retry
npm install
```

---

### Q: Grafana won't start (port 3000 already in use)

**Symptoms:**
```bash
Error: bind: address already in use
```

**Solution:**

```bash
# Option 1: Change Grafana port
# Edit .env:
GRAFANA_PORT=3001

# Option 2: Kill existing process
# Linux/macOS
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Task Debugging

### Q: Task stuck in "in_progress" state

**Symptoms:**
```bash
curl http://localhost:4000/api/tasks/active
# Shows task stuck for >2 hours
```

**Diagnosis:**

```bash
# 1. Check agent status
curl http://localhost:4000/api/agents/status

# 2. Check SQLite database
sqlite3 data/nash.db
sqlite> SELECT * FROM tasks WHERE status = 'in_progress';

# 3. Check logs
tail -f logs/task-<id>.log
```

**Common causes:**

| Cause | Solution |
|-------|----------|
| Claude API quota hit | Wait for 5h window to reset, check Grafana Token Quota Dashboard |
| Agent crashed | Check logs, restart task |
| Infinite loop in agent logic | Kill task, review agent code |
| Network timeout | Check internet connection, retry |

**Solution:**

```bash
# Manual task reset (use sparingly)
sqlite3 data/nash.db
sqlite> UPDATE tasks SET status = 'failed', error = 'Manual reset' WHERE id = 'task-001';
```

---

### Q: How do I debug agent behavior?

**Enable verbose logging:**

```bash
# Add [VERBOSE] flag to task
claude --agent agents/core/dung-manager.md "[VERBOSE] Fix login bug"
```

**What verbose mode shows:**
- Mode selection reasoning
- RAM loading decisions
- Gate script outputs (full)
- Scoring transactions (step-by-step)
- Agent thought process

**Check agent's working directory:**

```bash
# Agent creates tmp files during execution
ls tmp/task-<id>/
# Shows:
# - plan.md (task plan)
# - criteria.md (acceptance criteria)
# - work/ (code changes)
# - gates/ (gate logs)
```

---

### Q: Agent produces incorrect output despite passing review

**Symptoms:**
- Anti-Thesis approves code
- Integration tests fail later
- User finds bugs after deployment

**Root cause analysis:**

```bash
# 1. Check LEDGER for M1 (missed bug) penalties
cat artifacts/task-<id>/LEDGER.md | grep "M1\|Missed Bug"

# 2. Review Anti-Thesis agent PEN entries
cat agents/core/moc.md | grep "PEN"
# Should see entries like:
# PEN [P1] LAZY_REVIEW: Always run integration tests, not just unit tests
```

**Prevention:**

```bash
# 1. Sharpen Anti-Thesis agent (learn from failure)
claude --agent skill_factory/agent_skill_sharpener/SKILL.md "Sharpen Moc agent based on task-<id>"

# 2. Add stricter quality gates
# Edit pipeline file, add:
# Gate: bash gates/integrity.sh && bash gates/qa.sh
```

---

## Token Quota Management

### Q: How do I avoid hitting Claude API quota (45 msg / 5h)?

**Monitor quota:**

1. Open Grafana: http://localhost:3000
2. Navigate to **Token Quota Dashboard**
3. Check **Messages Remaining** gauge

**Strategies:**

| Quota Level | Action |
|-------------|--------|
| Green (>30 msg) | Normal operation |
| Yellow (15-30 msg) | Defer non-urgent tasks |
| Red (<15 msg) | Emergency tasks only |

**Optimize token usage:**

```bash
# 1. Use REDUCTION mode for simple tasks
claude --agent agents/core/dung-manager.md "[MODE:REDUCTION] Add logging to UserService"

# 2. Batch similar tasks (share context)
claude --agent agents/core/dung-manager.md "
  Task 1: Add logging to UserService
  Task 2: Add logging to AuthService
  Task 3: Add logging to PaymentService
"

# 3. Enable staged bootstrap (auto-enabled in v3.0)
# Loads only needed agents (6-9 instead of 27)
```

---

### Q: What happens when quota is exhausted?

**Behavior:**
- New tasks queued (not started)
- In-progress tasks continue (already loaded context)
- Grafana shows "Quota Exhausted" alert

**Recovery:**

```bash
# 1. Wait for 5h window reset (automatic)
# Check reset countdown in Grafana Token Quota Dashboard

# 2. View queued tasks
curl http://localhost:4000/api/tasks/queued

# 3. Tasks auto-resume when quota resets
# No manual action needed
```

---

### Q: How do I estimate tokens before running a task?

**Use dry-run mode:**

```bash
# Estimate tokens without executing
claude --agent agents/core/dung-manager.md "[DRY_RUN] Implement user authentication"

# Output:
# Estimated tokens: 18,500
# Mode: HOLD (10K-15K budget)
# Agents needed: 6 (Conan, Thuc, Moc, Son QA, Ngu, Dung PM)
# Expected duration: 45 minutes
```

---

## Performance Optimization

### Q: Tasks are running slower than expected

**Diagnosis:**

```bash
# 1. Check task duration histogram in Grafana
# Navigate to Task Overview Dashboard
# Look at P50/P95/P99 latencies

# 2. Check agent utilization
curl http://localhost:4000/api/metrics/summary | jq '.agent_utilization'

# 3. Check database performance
sqlite3 data/nash.db
sqlite> PRAGMA optimize;
sqlite> ANALYZE;
```

**Common causes:**

| Cause | Solution |
|-------|----------|
| SQLite not in WAL mode | Run `PRAGMA journal_mode=WAL;` |
| Too many concurrent tasks | Limit to 5 parallel tasks max |
| Qdrant index not optimized | Run `qdrant:optimize` script |
| Large RAM files loaded | Use on-demand loading, reduce RAM file size |

**Optimization:**

```bash
# 1. Enable WAL mode (if not already)
sqlite3 data/nash.db
sqlite> PRAGMA journal_mode=WAL;

# 2. Optimize Qdrant index
curl -X POST http://localhost:6333/collections/pen_entries/optimizer

# 3. Clean up old tasks
npm run cleanup:old-tasks

# 4. Vacuum database
sqlite3 data/nash.db
sqlite> VACUUM;
```

---

### Q: Vector search is slow (>500ms)

**Diagnosis:**

```bash
# Test vector search speed
curl -X POST http://localhost:6333/collections/pen_entries/points/search \
  -H "Content-Type: application/json" \
  -d '{"vector": [...], "limit": 10}'

# Should return in <100ms
```

**Solutions:**

```bash
# 1. Rebuild Qdrant index
npm run qdrant:rebuild

# 2. Increase Qdrant cache
# Edit qdrant config:
storage:
  hnsw_index:
    m: 16
    ef_construct: 100

# 3. Use grep fallback for reliability (slower but guaranteed)
# Edit .env:
VECTOR_SEARCH_TIMEOUT=200  # Fallback to grep after 200ms
```

---

## Agent Behavior

### Q: Agent ignores PEN entries

**Symptoms:**
- Agent repeats same mistake
- PEN entry exists in agent profile
- LEDGER shows same penalty multiple times

**Diagnosis:**

```bash
# 1. Check agent L2 Cache
cat agents/core/thuc.md | grep "PEN"

# 2. Check if agent is loading L2 Cache
# Add [VERBOSE] to task, check logs:
grep "Loaded L2 Cache" logs/task-<id>.log

# 3. Verify PEN entry format
# Should be:
# PEN [P2] LABEL: Description
```

**Solutions:**

```bash
# 1. Verify agent boot protocol loads PEN entries
# Edit agents/core/thuc.md, section 9 (BOOT PROTOCOL):
# 1. Load L2 Cache (this file)
# 2. Check PEN entries for hard constraints  ← Should be here

# 2. Add PEN check to agent workflow
# Edit agent SKILLS section:
# Checklist:
# - [ ] Review PEN entries before starting
# - [ ] Verify no PEN violations before submitting

# 3. Increase PEN penalty multiplier (nuclear option)
# Edit system/SCORING_RULES.md:
# If agent violates existing PEN: 3x penalty
```

---

### Q: How do I create a new agent?

**See:** [docs/03_USAGE_GUIDE.md#creating-agents](03_USAGE_GUIDE.md#creating-agents)

**Quick steps:**

```bash
# 1. Copy template
cp agents/AGENT_TEMPLATE_V2.md agents/dev/my-agent.md

# 2. Fill 9 sections
# - SOUL (identity)
# - SKILLS (workflows)
# - MEMORY (PEN/WIN)
# - TOOLS (capabilities)
# - DOMAIN KNOWLEDGE
# - STATISTICS
# - SHARPENING LOG
# - REFERENCE MEMORY
# - BOOT PROTOCOL

# 3. Register in METADATA.yaml
# Add under agents:
# - id: my-agent
#   name: "My Agent"
#   archetype: Builder
#   layer: dev
#   l2_path: agents/dev/my-agent.md

# 4. Test agent
claude --agent agents/dev/my-agent.md "Test task"
```

---

## Quality Gates

### Q: `validate.sh` fails with "TODO found"

**Symptoms:**
```bash
Error: TODO found at src/api/users.ts:42
Gate failed: validate.sh
```

**Solutions:**

```bash
# Option 1: Complete the TODO
# Fix the code, remove TODO comment

# Option 2: Create GitHub issue, remove TODO
# 1. Create issue: "Complete user.email validation"
# 2. Add comment in code:
# // Issue #123: Complete email validation
# 3. Remove TODO

# Option 3: Use FIXME for urgent items (allowed in dev branches)
# TODO → not allowed
# FIXME → allowed (must have issue number)
# Example: // FIXME(#123): Email validation incomplete
```

---

### Q: `integrity.sh` fails with "Mock import found"

**Symptoms:**
```bash
Error: Mock import found in tests/integration/api.test.js:5
import { mockDatabase } from '../mocks/db';
```

**Explanation:**

Integration tests must use real dependencies, not mocks. This prevents false positives (tests pass but production fails).

**Solution:**

```javascript
// Bad: Mock in integration test
import { mockDatabase } from '../mocks/db';

test('should create user', async () => {
  const db = mockDatabase();  // ❌ Integration test using mock
  const result = await createUser(db, { name: 'Alice' });
  expect(result).toBe(true);
});

// Good: Real database in integration test
import { getTestDatabase } from '../test-utils/db';

test('should create user', async () => {
  const db = await getTestDatabase();  // ✓ Real database
  const result = await createUser(db, { name: 'Alice' });
  expect(result).toBe(true);
  await db.close();
});
```

**Where to use mocks:**

```
tests/
├── unit/            ← Mocks OK here
│   └── user-service.test.js  (mock database, fast)
├── integration/     ← Mocks NOT allowed
│   └── api.test.js  (real database, real API)
└── e2e/             ← Mocks NOT allowed
    └── user-flow.test.js  (full stack, real everything)
```

---

### Q: `security.sh` fails with "Hardcoded secret found"

**Symptoms:**
```bash
Error: Hardcoded API key found at src/config.ts:12
const API_KEY = 'sk-1234567890abcdef';
```

**Solution:**

```javascript
// Bad: Hardcoded secret
const API_KEY = 'sk-1234567890abcdef';

// Good: Load from .env
require('dotenv').config();
const API_KEY = process.env.API_KEY;

// Verify .env exists
if (!API_KEY) {
  throw new Error('API_KEY not set in .env');
}
```

**Verify .env is gitignored:**

```bash
# Check .gitignore
cat .gitignore | grep ".env"
# Should show: .env

# Verify not committed
git ls-files | grep ".env"
# Should return nothing
```

---

## Database Issues

### Q: SQLite database is locked

**Symptoms:**
```bash
Error: database is locked
SQLITE_BUSY: database is locked by another process
```

**Diagnosis:**

```bash
# Check if WAL mode is enabled
sqlite3 data/nash.db
sqlite> PRAGMA journal_mode;
# Should return: wal

# If not wal, enable it:
sqlite> PRAGMA journal_mode=WAL;
```

**Solutions:**

```bash
# 1. Ensure WAL mode is enabled (concurrent reads + writes)
sqlite3 data/nash.db "PRAGMA journal_mode=WAL;"

# 2. Close zombie connections
fuser data/nash.db  # Linux
# Kill any processes holding the db

# 3. Increase timeout
# Edit database config:
const db = new Database('data/nash.db', {
  timeout: 10000  // 10 seconds
});

# 4. Restart framework
npm stop && npm start
```

---

### Q: How do I backup the database?

**Manual backup:**

```bash
# SQLite backup (safe, online)
sqlite3 data/nash.db ".backup data/nash-backup.db"

# Verify integrity
sqlite3 data/nash-backup.db "PRAGMA integrity_check;"
# Should return: ok
```

**Automated backups:**

Backups run automatically (configured in `install-production.sh`):

```bash
# Backup schedule:
# - Hourly: keep 24
# - Daily: keep 7
# - Weekly: keep 4
# - Monthly: keep 12

# Location:
ls data/backups/
# hourly/nash-2026-03-17-10.db
# daily/nash-2026-03-17.db
# weekly/nash-2026-03-W11.db
# monthly/nash-2026-03.db

# Restore from backup:
cp data/backups/daily/nash-2026-03-17.db data/nash.db
```

---

### Q: How do I view LEDGER entries in database?

**SQLite queries:**

```bash
sqlite3 data/nash.db

# View all ledger entries
sqlite> SELECT * FROM ledger ORDER BY created_at DESC LIMIT 10;

# View by task
sqlite> SELECT * FROM ledger WHERE task_id = 'task-001';

# View by agent
sqlite> SELECT * FROM ledger WHERE agent = 'thuc';

# View by severity
sqlite> SELECT * FROM ledger WHERE severity = 'P0';

# Calculate agent scores
sqlite> SELECT agent, SUM(score) as total_score
        FROM ledger
        GROUP BY agent
        ORDER BY total_score DESC;
```

---

## Grafana & Monitoring

### Q: Grafana dashboard shows no data

**Diagnosis:**

```bash
# 1. Check if Prometheus is running
curl http://localhost:9090/api/v1/query?query=up
# Should return: {"status":"success", ...}

# 2. Check if metrics are being exported
curl http://localhost:4000/metrics
# Should return Prometheus format metrics

# 3. Check Prometheus targets
# Open http://localhost:9090/targets
# All targets should be "UP"
```

**Solutions:**

```bash
# 1. Restart Prometheus
npm run prometheus:restart

# 2. Check Prometheus config
cat prometheus.yml
# Verify scrape configs:
scrape_configs:
  - job_name: 'nash-api'
    static_configs:
      - targets: ['localhost:4000']

# 3. Reimport Grafana dashboards
# Navigate to Grafana → Dashboards → Import
# Upload: grafana/dashboards/*.json
```

---

### Q: How do I add custom Grafana metrics?

**Add metric to code:**

```javascript
const { register, Counter, Gauge } = require('prom-client');

// Define metric
const myCustomMetric = new Counter({
  name: 'nash_custom_events_total',
  help: 'Count of custom events',
  labelNames: ['event_type']
});

// Increment metric
myCustomMetric.inc({ event_type: 'user_login' });

// Expose via /metrics endpoint (already set up)
```

**Add to Grafana dashboard:**

1. Open Grafana → Dashboard → Add Panel
2. Query: `nash_custom_events_total{event_type="user_login"}`
3. Visualization: Time Series / Gauge / Table
4. Save dashboard

---

### Q: Grafana login password forgotten

**Reset admin password:**

```bash
# Stop Grafana
npm run grafana:stop

# Reset password
grafana-cli admin reset-admin-password newpassword

# Start Grafana
npm run grafana:start

# Login with: admin / newpassword
```

---

## Still Need Help?

### Community Support

- **GitHub Issues**: https://github.com/yourusername/nash-agent-framework/issues
- **GitHub Discussions**: https://github.com/yourusername/nash-agent-framework/discussions

### Reporting Bugs

See [docs/05_CONTRIBUTING.md#reporting-bugs](05_CONTRIBUTING.md#reporting-bugs)

### Documentation

- [Quick Start](01_QUICKSTART.md)
- [Core Concepts](02_CONCEPTS.md)
- [Usage Guide](03_USAGE_GUIDE.md)
- [Architecture](04_ARCHITECTURE.md)
- [Contributing](05_CONTRIBUTING.md)
