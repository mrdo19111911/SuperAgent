/**
 * Nash Framework - Observability REST API Server
 *
 * Production-ready Express server for React Dashboard polling.
 * Uses SQLite (read-only) + Prometheus metrics.
 *
 * Target: <50ms response time per request
 * Polling: Dashboard polls every 2s (no WebSocket)
 */

const express = require('express');
const Database = require('better-sqlite3');
const client = require('prom-client');
const cors = require('cors');
const path = require('path');

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection (read-only mode)
const DB_PATH = path.join(__dirname, '..', 'data', 'nash.db');
let db;

try {
  db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  console.log(`[INFO] Connected to database: ${DB_PATH}`);
} catch (error) {
  console.error(`[ERROR] Failed to connect to database: ${error.message}`);
  console.error(`[ERROR] Expected database at: ${DB_PATH}`);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// ============================================================================
// PROMETHEUS METRICS SETUP
// ============================================================================

const register = new client.Registry();

// Counter: nash_tasks_total{status}
const taskCounter = new client.Counter({
  name: 'nash_tasks_total',
  help: 'Total number of Nash tasks by status',
  labelNames: ['status'],
  registers: [register]
});

// Histogram: nash_task_duration_seconds
const taskDuration = new client.Histogram({
  name: 'nash_task_duration_seconds',
  help: 'Task execution duration in seconds',
  buckets: [1, 5, 10, 30, 60, 300, 600],
  registers: [register]
});

// Gauge: nash_agents_active
const agentsActive = new client.Gauge({
  name: 'nash_agents_active',
  help: 'Number of currently active agents',
  registers: [register]
});

// Histogram: nash_tokens_used
const tokensUsed = new client.Histogram({
  name: 'nash_tokens_used',
  help: 'Tokens used per task',
  buckets: [1000, 5000, 10000, 20000, 30000],
  registers: [register]
});

// Function to update Prometheus metrics from database
function updatePrometheusMetrics() {
  try {
    // Reset counters
    taskCounter.reset();

    // Count tasks by status
    const taskStats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM tasks
      GROUP BY status
    `).all();

    taskStats.forEach(row => {
      taskCounter.inc({ status: row.status }, row.count);
    });

    // Update active agents gauge
    const activeAgents = db.prepare(`
      SELECT COUNT(*) as count
      FROM agents
      WHERE status = 'active'
    `).get();

    agentsActive.set(activeAgents.count);

    // Update task duration histogram
    const durations = db.prepare(`
      SELECT
        (julianday(completed_at) - julianday(started_at)) * 86400 as duration_seconds
      FROM tasks
      WHERE completed_at IS NOT NULL
        AND started_at IS NOT NULL
      LIMIT 1000
    `).all();

    durations.forEach(row => {
      taskDuration.observe(row.duration_seconds);
    });

    // Update tokens histogram
    const tokens = db.prepare(`
      SELECT tokens_used
      FROM tasks
      WHERE tokens_used > 0
      LIMIT 1000
    `).all();

    tokens.forEach(row => {
      tokensUsed.observe(row.tokens_used);
    });

  } catch (error) {
    console.error(`[ERROR] Failed to update Prometheus metrics: ${error.message}`);
  }
}

// Update metrics every 10 seconds
setInterval(updatePrometheusMetrics, 10000);
updatePrometheusMetrics(); // Initial update

// ============================================================================
// API ENDPOINTS - TASKS
// ============================================================================

/**
 * GET /api/tasks/active
 * Returns tasks where status IN ('pending', 'in_progress')
 */
app.get('/api/tasks/active', (req, res) => {
  try {
    const query = db.prepare(`
      SELECT
        id,
        status,
        pipeline,
        current_phase,
        current_agent,
        started_at,
        updated_at,
        completed_at,
        tokens_used,
        tokens_budget,
        progress_percent,
        estimated_completion,
        error_message
      FROM tasks
      WHERE status IN ('pending', 'in_progress')
      ORDER BY started_at DESC
      LIMIT 10
    `);

    const tasks = query.all();

    res.json({
      tasks: tasks,
      total_active: tasks.length
    });

  } catch (error) {
    console.error(`[ERROR] /api/tasks/active: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tasks/:id
 * Returns detailed task information with agent history
 */
app.get('/api/tasks/:id', (req, res) => {
  try {
    const taskId = req.params.id;

    // Get task details
    const task = db.prepare(`
      SELECT
        id,
        status,
        pipeline,
        current_phase,
        current_agent,
        started_at,
        updated_at,
        completed_at,
        tokens_used,
        tokens_budget,
        progress_percent,
        estimated_completion,
        error_message
      FROM tasks
      WHERE id = ?
    `).get(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get agent history (if agent_tasks table exists)
    let agentsHistory = [];
    try {
      agentsHistory = db.prepare(`
        SELECT
          agent,
          phase,
          started_at,
          completed_at,
          tokens_used,
          score
        FROM agent_tasks
        WHERE task_id = ?
        ORDER BY started_at ASC
      `).all(taskId);
    } catch (e) {
      // Table might not exist yet
      agentsHistory = [];
    }

    res.json({
      task: task,
      agents_history: agentsHistory,
      logs: [] // Logs to be implemented separately
    });

  } catch (error) {
    console.error(`[ERROR] /api/tasks/:id: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ENDPOINTS - AGENTS
// ============================================================================

/**
 * GET /api/agents/status
 * Returns agent states from agents table
 */
app.get('/api/agents/status', (req, res) => {
  try {
    const query = db.prepare(`
      SELECT
        id,
        type,
        archetype,
        status,
        current_task_id,
        total_tasks_completed,
        avg_score,
        avg_tokens_per_task,
        last_active
      FROM agents
      ORDER BY status DESC, id ASC
    `);

    const agents = query.all();

    const total_idle = agents.filter(a => a.status === 'idle').length;
    const total_active = agents.filter(a => a.status === 'active').length;

    res.json({
      agents: agents,
      total_idle: total_idle,
      total_active: total_active
    });

  } catch (error) {
    console.error(`[ERROR] /api/agents/status: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/agents/:id/history
 * Returns agent's recent task history
 */
app.get('/api/agents/:id/history', (req, res) => {
  try {
    const agentId = req.params.id;

    // Get agent details
    const agent = db.prepare(`
      SELECT
        id,
        type,
        archetype,
        status,
        current_task_id,
        total_tasks_completed,
        avg_score,
        avg_tokens_per_task,
        last_active
      FROM agents
      WHERE id = ?
    `).get(agentId);

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get recent tasks
    let recentTasks = [];
    try {
      recentTasks = db.prepare(`
        SELECT
          task_id,
          phase,
          tokens_used,
          score,
          completed_at
        FROM agent_tasks
        WHERE agent = ?
          AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT 20
      `).all(agentId);
    } catch (e) {
      recentTasks = [];
    }

    res.json({
      agent: agent,
      recent_tasks: recentTasks
    });

  } catch (error) {
    console.error(`[ERROR] /api/agents/:id/history: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// API ENDPOINTS - METRICS
// ============================================================================

/**
 * GET /api/metrics/summary
 * Returns aggregated metrics (total tasks, completion rate, avg tokens)
 */
app.get('/api/metrics/summary', (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Total tasks today
    const tasksToday = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE started_at >= ?
    `).get(todayStart);

    // Total tasks this month
    const tasksThisMonth = db.prepare(`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE started_at >= ?
    `).get(monthStart);

    // Average task duration (in minutes)
    const avgDuration = db.prepare(`
      SELECT AVG((julianday(completed_at) - julianday(started_at)) * 1440) as avg_minutes
      FROM tasks
      WHERE completed_at IS NOT NULL
        AND started_at IS NOT NULL
    `).get();

    // Average tokens per task
    const avgTokens = db.prepare(`
      SELECT AVG(tokens_used) as avg_tokens
      FROM tasks
      WHERE tokens_used > 0
    `).get();

    // P95 task duration (approximate)
    const p95Duration = db.prepare(`
      SELECT
        (julianday(completed_at) - julianday(started_at)) * 1440 as duration_minutes
      FROM tasks
      WHERE completed_at IS NOT NULL
        AND started_at IS NOT NULL
      ORDER BY duration_minutes DESC
      LIMIT 1 OFFSET (SELECT COUNT(*) * 0.05 FROM tasks WHERE completed_at IS NOT NULL)
    `).get();

    // Top agents by score
    const topAgentsByScore = db.prepare(`
      SELECT agent, AVG(score) as avg_score
      FROM agent_tasks
      WHERE score IS NOT NULL
      GROUP BY agent
      ORDER BY avg_score DESC
      LIMIT 5
    `).all();

    // Top agents by tokens
    const topAgentsByTokens = db.prepare(`
      SELECT agent, AVG(tokens_used) as avg_tokens
      FROM agent_tasks
      WHERE tokens_used > 0
      GROUP BY agent
      ORDER BY avg_tokens DESC
      LIMIT 5
    `).all();

    res.json({
      metrics: {
        timestamp: new Date().toISOString(),
        total_tasks_today: tasksToday.count,
        total_tasks_this_month: tasksThisMonth.count,
        avg_task_duration_minutes: avgDuration.avg_minutes || 0,
        avg_tokens_per_task: avgTokens.avg_tokens || 0,
        p95_task_duration_minutes: p95Duration ? p95Duration.duration_minutes : 0,
        top_agents_by_score: topAgentsByScore,
        top_agents_by_tokens: topAgentsByTokens
      }
    });

  } catch (error) {
    console.error(`[ERROR] /api/metrics/summary: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /metrics
 * Prometheus metrics endpoint (prom-client format)
 */
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error(`[ERROR] /metrics: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  try {
    // Test database connection
    db.prepare('SELECT 1').get();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] Unhandled error: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message
    }
  });
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

process.on('SIGINT', () => {
  console.log('\n[INFO] Received SIGINT, shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[INFO] Received SIGTERM, shutting down gracefully...');
  db.close();
  process.exit(0);
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Nash Framework - Observability API Server                 ║
║  Port: ${PORT}                                                 ║
║  Database: ${DB_PATH}  ║
║  Polling: React Dashboard (2s interval)                    ║
║  Target Response Time: <50ms                               ║
╚════════════════════════════════════════════════════════════╝
  `);

  console.log('[INFO] Available endpoints:');
  console.log('  GET /health                  - Health check');
  console.log('  GET /api/tasks/active        - Active tasks (pending/in_progress)');
  console.log('  GET /api/tasks/:id           - Task details');
  console.log('  GET /api/agents/status       - All agents status');
  console.log('  GET /api/agents/:id/history  - Agent task history');
  console.log('  GET /api/metrics/summary     - Aggregated metrics');
  console.log('  GET /metrics                 - Prometheus metrics');
  console.log('');
});
