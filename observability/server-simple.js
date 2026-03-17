/**
 * Nash Framework - Simple Mock API Server (No Database Required)
 *
 * Provides demo data for dashboard testing without SQLite dependency
 * Port: 4000
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'null'],
  credentials: true
}));
app.use(express.json());

// Mock data
const mockTasks = [
  {
    id: 'T1_01',
    description: 'Add logging to authentication module',
    status: 'completed',
    pipeline: 'Coding',
    tokens_used: 12500,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'T1_02',
    description: 'Design user dashboard wireframes',
    status: 'completed',
    pipeline: 'Design Flow',
    tokens_used: 8300,
    created_at: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'T1_03',
    description: 'Fix memory leak in event handler',
    status: 'running',
    pipeline: 'Hotfix',
    tokens_used: 15600,
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'T1_04',
    description: 'Write integration tests for API endpoints',
    status: 'running',
    pipeline: 'Testing',
    tokens_used: 9200,
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  },
  {
    id: 'T1_05',
    description: 'Security audit before deployment',
    status: 'pending',
    pipeline: 'Security',
    tokens_used: 0,
    created_at: new Date(Date.now() - 5 * 60000).toISOString()
  },
  {
    id: 'T1_06',
    description: 'Refactor database query optimization',
    status: 'completed',
    pipeline: 'Coding',
    tokens_used: 18200,
    created_at: new Date(Date.now() - 3 * 3600000).toISOString()
  },
  {
    id: 'T1_07',
    description: 'Update API documentation',
    status: 'completed',
    pipeline: 'Requirements',
    tokens_used: 6500,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'T1_08',
    description: 'Implement caching layer for database queries',
    status: 'failed',
    pipeline: 'Coding',
    tokens_used: 14800,
    created_at: new Date(Date.now() - 6 * 3600000).toISOString()
  }
];

const mockAgents = [
  {
    name: 'Dung PM',
    role: 'Project Manager',
    status: 'active',
    score: 150,
    tasks_count: 12
  },
  {
    name: 'Phuc SA',
    role: 'Software Architect',
    status: 'active',
    score: 180,
    tasks_count: 8
  },
  {
    name: 'Moc',
    role: 'Code Reviewer',
    status: 'active',
    score: 165,
    tasks_count: 15
  },
  {
    name: 'Thuc',
    role: 'Backend Developer',
    status: 'idle',
    score: 120,
    tasks_count: 6
  },
  {
    name: 'Lan',
    role: 'Quality Assurance',
    status: 'active',
    score: 140,
    tasks_count: 10
  }
];

// ============================================================================
// API ENDPOINTS
// ============================================================================

// GET /api/tasks - List all tasks
app.get('/api/tasks', (req, res) => {
  res.json(mockTasks);
});

// GET /api/agents - List all agents
app.get('/api/agents', (req, res) => {
  res.json(mockAgents);
});

// GET /metrics - Prometheus metrics format
app.get('/metrics', (req, res) => {
  const totalTasks = mockTasks.length;
  const completedTasks = mockTasks.filter(t => t.status === 'completed').length;
  const runningTasks = mockTasks.filter(t => t.status === 'running').length;
  const failedTasks = mockTasks.filter(t => t.status === 'failed').length;
  const activeAgents = mockAgents.filter(a => a.status === 'active').length;

  const metrics = `
# HELP nash_tasks_total Total number of Nash tasks by status
# TYPE nash_tasks_total counter
nash_tasks_total{status="completed"} ${completedTasks}
nash_tasks_total{status="running"} ${runningTasks}
nash_tasks_total{status="failed"} ${failedTasks}

# HELP nash_agents_active Number of currently active agents
# TYPE nash_agents_active gauge
nash_agents_active ${activeAgents}

# HELP nash_tokens_used Tokens used per task
# TYPE nash_tokens_used histogram
nash_tokens_used_bucket{le="1000"} 0
nash_tokens_used_bucket{le="5000"} 0
nash_tokens_used_bucket{le="10000"} 2
nash_tokens_used_bucket{le="20000"} ${totalTasks}
nash_tokens_used_bucket{le="+Inf"} ${totalTasks}
nash_tokens_used_sum ${mockTasks.reduce((sum, t) => sum + t.tokens_used, 0)}
nash_tokens_used_count ${totalTasks}
`.trim();

  res.type('text/plain').send(metrics);
});

// GET / - Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Nash Framework Observability API (Mock Data)',
    version: '1.0.0',
    endpoints: ['/api/tasks', '/api/agents', '/metrics']
  });
});

// ============================================================================
// START SERVER
// ============================================================================

app.listen(PORT, () => {
  console.log(`✅ Nash Observability API (Mock) listening on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/`);
  console.log(`   Tasks API: http://localhost:${PORT}/api/tasks`);
  console.log(`   Agents API: http://localhost:${PORT}/api/agents`);
  console.log(`   Metrics: http://localhost:${PORT}/metrics`);
  console.log(`\n📊 Serving ${mockTasks.length} mock tasks, ${mockAgents.length} mock agents`);
  console.log(`\n🌐 Open dashboard: observability/dashboard.html`);
});
