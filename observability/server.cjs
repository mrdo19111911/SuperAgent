/**
 * Nash Framework - Observability REST API Server
 *
 * Express server for React Dashboard polling.
 * Uses sql.js (pure JS SQLite, no native deps, no Docker).
 *
 * Target: <50ms response time per request
 * Polling: Dashboard polls every 2s
 */

const express = require('express');
const initSqlJs = require('sql.js');
const client = require('prom-client');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, '..', 'data', 'nash.db');

let db; // sql.js Database instance

// ============================================================================
// SQL.JS HELPERS (replaces better-sqlite3 API)
// ============================================================================

function dbAll(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (params.length) stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch { return []; }
}

function dbGet(sql, params = []) {
  return dbAll(sql, params)[0] || null;
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], credentials: true }));
app.use(express.json());

// ============================================================================
// PROMETHEUS METRICS
// ============================================================================

const register = new client.Registry();

const taskCounter = new client.Counter({
  name: 'nash_tasks_total', help: 'Total Nash tasks by status',
  labelNames: ['status'], registers: [register]
});
const taskDuration = new client.Histogram({
  name: 'nash_task_duration_seconds', help: 'Task duration in seconds',
  buckets: [1, 5, 10, 30, 60, 300, 600], registers: [register]
});
const agentsActive = new client.Gauge({
  name: 'nash_agents_active', help: 'Currently active agents',
  registers: [register]
});
const tokensUsed = new client.Histogram({
  name: 'nash_tokens_used', help: 'Tokens used per task',
  buckets: [1000, 5000, 10000, 20000, 30000], registers: [register]
});

function updatePrometheusMetrics() {
  try {
    taskCounter.reset();
    for (const row of dbAll(`SELECT status, COUNT(*) as count FROM tasks GROUP BY status`)) {
      taskCounter.inc({ status: row.status }, row.count);
    }
    const active = dbGet(`SELECT COUNT(*) as count FROM agents WHERE status = 'active'`);
    if (active) agentsActive.set(active.count);
    for (const row of dbAll(`SELECT (julianday(completed_at) - julianday(started_at)) * 86400 as d FROM tasks WHERE completed_at IS NOT NULL AND started_at IS NOT NULL LIMIT 1000`)) {
      if (row.d) taskDuration.observe(row.d);
    }
    for (const row of dbAll(`SELECT tokens_used FROM tasks WHERE tokens_used > 0 LIMIT 1000`)) {
      tokensUsed.observe(row.tokens_used);
    }
  } catch (error) {
    console.error(`[ERROR] Prometheus metrics: ${error.message}`);
  }
}

// ============================================================================
// API ENDPOINTS - TASKS
// ============================================================================

app.get('/api/tasks/active', (req, res) => {
  try {
    const tasks = dbAll(`
      SELECT id, description, status, pipeline, current_phase, current_agent,
        started_at, updated_at, completed_at, tokens_used, tokens_budget,
        progress_percent, estimated_completion, error_message
      FROM tasks WHERE status IN ('pending', 'in_progress')
      ORDER BY started_at DESC LIMIT 10
    `);
    res.json({ tasks, total_active: tasks.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tasks/:id', (req, res) => {
  try {
    const task = dbGet(`
      SELECT id, description, status, pipeline, current_phase, current_agent,
        started_at, updated_at, completed_at, tokens_used, tokens_budget,
        progress_percent, estimated_completion, error_message
      FROM tasks WHERE id = ?
    `, [req.params.id]);

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const agents_history = dbAll(`
      SELECT agent, phase, started_at, completed_at, tokens_used, score
      FROM agent_tasks WHERE task_id = ? ORDER BY started_at ASC
    `, [req.params.id]);

    res.json({ task, agents_history, logs: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ENDPOINTS - AGENTS
// ============================================================================

app.get('/api/agents/status', (req, res) => {
  try {
    const agents = dbAll(`
      SELECT id, type, archetype, status, current_task_id,
        total_tasks_completed, avg_score, avg_tokens_per_task, last_active
      FROM agents ORDER BY status DESC, id ASC
    `);
    res.json({
      agents,
      total_idle: agents.filter(a => a.status === 'idle').length,
      total_active: agents.filter(a => a.status === 'active').length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/agents/:id/history', (req, res) => {
  try {
    const agent = dbGet(`
      SELECT id, type, archetype, status, current_task_id,
        total_tasks_completed, avg_score, avg_tokens_per_task, last_active
      FROM agents WHERE id = ?
    `, [req.params.id]);

    if (!agent) return res.status(404).json({ error: 'Agent not found' });

    const recent_tasks = dbAll(`
      SELECT task_id, phase, tokens_used, score, completed_at
      FROM agent_tasks WHERE agent = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC LIMIT 20
    `, [req.params.id]);

    res.json({ agent, recent_tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ENDPOINTS - METRICS
// ============================================================================

app.get('/api/metrics/summary', (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const tasksToday = dbGet(`SELECT COUNT(*) as count FROM tasks WHERE started_at >= ?`, [todayStart]);
    const tasksMonth = dbGet(`SELECT COUNT(*) as count FROM tasks WHERE started_at >= ?`, [monthStart]);
    const avgDur = dbGet(`SELECT AVG((julianday(completed_at)-julianday(started_at))*1440) as v FROM tasks WHERE completed_at IS NOT NULL AND started_at IS NOT NULL`);
    const avgTok = dbGet(`SELECT AVG(tokens_used) as v FROM tasks WHERE tokens_used > 0`);
    const p95 = dbGet(`SELECT (julianday(completed_at)-julianday(started_at))*1440 as v FROM tasks WHERE completed_at IS NOT NULL AND started_at IS NOT NULL ORDER BY v DESC LIMIT 1 OFFSET (SELECT COUNT(*)*0.05 FROM tasks WHERE completed_at IS NOT NULL)`);
    const topScore = dbAll(`SELECT agent, AVG(score) as avg_score FROM agent_tasks WHERE score IS NOT NULL GROUP BY agent ORDER BY avg_score DESC LIMIT 5`);
    const topTokens = dbAll(`SELECT agent, AVG(tokens_used) as avg_tokens FROM agent_tasks WHERE tokens_used > 0 GROUP BY agent ORDER BY avg_tokens DESC LIMIT 5`);

    res.json({
      metrics: {
        timestamp: now.toISOString(),
        total_tasks_today: tasksToday?.count || 0,
        total_tasks_this_month: tasksMonth?.count || 0,
        avg_task_duration_minutes: avgDur?.v || 0,
        avg_tokens_per_task: avgTok?.v || 0,
        p95_task_duration_minutes: p95?.v || 0,
        top_agents_by_score: topScore,
        top_agents_by_tokens: topTokens,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH & ERROR HANDLING
// ============================================================================

app.get('/health', (req, res) => {
  try {
    dbGet('SELECT 1 as ok');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `${req.method} ${req.path} not found` } });
});

app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
});

// ============================================================================
// STARTUP (async — sql.js requires init)
// ============================================================================

async function start() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log(`[INFO] Loaded database: ${DB_PATH}`);
  } else {
    console.warn(`[WARN] ${DB_PATH} not found — using empty in-memory DB`);
    console.warn('[WARN] Run: npm run setup:db');
    db = new SQL.Database();
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, description TEXT, status TEXT, pipeline TEXT, current_phase TEXT, current_agent TEXT, started_at TEXT, updated_at TEXT, completed_at TEXT, tokens_used INTEGER DEFAULT 0, tokens_budget INTEGER DEFAULT 30000, progress_percent INTEGER DEFAULT 0, estimated_completion TEXT, error_message TEXT);
      CREATE TABLE IF NOT EXISTS agents (id TEXT PRIMARY KEY, type TEXT, archetype TEXT, status TEXT, current_task_id TEXT, total_tasks_completed INTEGER DEFAULT 0, avg_score REAL DEFAULT 0, avg_tokens_per_task REAL DEFAULT 0, last_active TEXT);
      CREATE TABLE IF NOT EXISTS agent_tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id TEXT, agent TEXT, phase TEXT, started_at TEXT, completed_at TEXT, tokens_used INTEGER DEFAULT 0, score INTEGER DEFAULT 0);
    `);
  }

  // Start Prometheus polling
  setInterval(updatePrometheusMetrics, 10000);
  updatePrometheusMetrics();

  // Graceful shutdown
  const shutdown = () => { db.close(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  app.listen(PORT, () => {
    console.log(`\n  Nash Observability Server — http://localhost:${PORT}`);
    console.log(`  Database: ${fs.existsSync(DB_PATH) ? DB_PATH : 'in-memory'}`);
    console.log(`  Endpoints: /health /api/tasks/active /api/agents/status /api/metrics/summary /metrics\n`);
  });
}

start().catch(err => { console.error(`[FATAL] ${err.message}`); process.exit(1); });
