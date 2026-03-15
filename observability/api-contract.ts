/**
 * Nash Framework - API Contract
 *
 * REST API for React Dashboard
 * NO WebSocket needed (simple polling for 5 tasks)
 */

// ============================================================================
// TASK APIs
// ============================================================================

export interface Task {
  id: string;                          // T2_34
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  pipeline: 'requirements' | 'architecture' | 'coding' | 'testing' | 'security' | 'hotfix';
  current_phase: 'A' | 'B' | 'B2' | 'C' | 'D' | 'E' | 'F';
  current_agent: string | null;        // phuc-sa, moc, null if between agents
  started_at: string;                  // ISO timestamp
  updated_at: string;                  // ISO timestamp
  completed_at?: string;               // ISO timestamp
  tokens_used: number;
  tokens_budget: number;               // Based on cognitive mode
  progress_percent: number;            // 0-100
  estimated_completion?: string;       // ISO timestamp (nullable if unknown)
  error_message?: string;              // If status = failed
}

// GET /api/tasks/active
export interface GetActiveTasksResponse {
  tasks: Task[];
  total_active: number;
}

// GET /api/tasks/:id
export interface GetTaskDetailResponse {
  task: Task;
  agents_history: Array<{
    agent: string;
    phase: string;
    started_at: string;
    completed_at: string;
    tokens_used: number;
    score?: number;                    // From LEDGER
  }>;
  logs: LogEntry[];                    // Last 100 lines
}

// POST /api/tasks/:id/pause
export interface PauseTaskRequest {
  reason: string;
}

export interface PauseTaskResponse {
  success: boolean;
  message: string;
}

// POST /api/tasks/:id/resume
export interface ResumeTaskResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// AGENT APIs
// ============================================================================

export interface Agent {
  id: string;                          // phuc-sa
  type: string;                        // Solutions Architect
  archetype: 'Analyst' | 'Builder' | 'Critic' | 'Strategist' | 'Operator';
  status: 'idle' | 'active' | 'errored';
  current_task_id?: string;
  total_tasks_completed: number;
  avg_score: number;                   // From LEDGER
  avg_tokens_per_task: number;
  last_active?: string;                // ISO timestamp
}

// GET /api/agents/status
export interface GetAgentStatusResponse {
  agents: Agent[];
  total_idle: number;
  total_active: number;
}

// GET /api/agents/:id/history
export interface GetAgentHistoryResponse {
  agent: Agent;
  recent_tasks: Array<{
    task_id: string;
    phase: string;
    tokens_used: number;
    score: number;
    completed_at: string;
  }>;
}

// ============================================================================
// METRICS APIs
// ============================================================================

export interface Metrics {
  timestamp: string;                   // ISO timestamp
  total_tasks_today: number;
  total_tasks_this_month: number;
  avg_task_duration_minutes: number;
  avg_tokens_per_task: number;
  p95_task_duration_minutes: number;
  top_agents_by_score: Array<{
    agent: string;
    avg_score: number;
  }>;
  top_agents_by_tokens: Array<{
    agent: string;
    avg_tokens: number;
  }>;
}

// GET /api/metrics
export interface GetMetricsResponse {
  metrics: Metrics;
}

// GET /api/metrics/prometheus
// Returns Prometheus text format for scraping
export type GetPrometheusMetricsResponse = string;

// ============================================================================
// LOGS
// ============================================================================

export interface LogEntry {
  timestamp: string;                   // ISO timestamp
  level: 'debug' | 'info' | 'warn' | 'error';
  agent: string;
  phase: string;
  message: string;
  metadata?: Record<string, any>;
}

// GET /api/tasks/:id/logs?limit=100&level=error
export interface GetLogsRequest {
  limit?: number;                      // Default 100
  level?: 'debug' | 'info' | 'warn' | 'error';
}

export interface GetLogsResponse {
  logs: LogEntry[];
  total_count: number;
}

// ============================================================================
// PEN/WIN APIs (for Dashboard insights)
// ============================================================================

export interface PENEntry {
  pen_id: string;                      // PEN-001
  date: string;                        // 2026-03-02
  module: string;                      // T3_34_cx-analytics
  specific_reason: string;
  general_reason: string;
  prevention_rule: string;
  penalty_agent: string;
  penalty_points: number;
  status: 'ACTIVE' | 'RESOLVED' | 'FIXED';
}

// GET /api/pen/active
export interface GetActivePENResponse {
  pen_entries: PENEntry[];
  total_active: number;
}

// GET /api/pen/stats
export interface GetPENStatsResponse {
  total_pens: number;
  active_pens: number;
  most_common_categories: Array<{
    category: string;
    count: number;
  }>;
  agents_with_most_pens: Array<{
    agent: string;
    pen_count: number;
  }>;
}

// ============================================================================
// POLLING STRATEGY (Dashboard implementation)
// ============================================================================

/**
 * Dashboard polls these endpoints every 2 seconds:
 *
 * 1. GET /api/tasks/active (5 tasks max, lightweight)
 * 2. GET /api/agents/status (50 agents, cached in Redis)
 *
 * Dashboard polls these every 10 seconds:
 *
 * 3. GET /api/metrics (aggregated, cached)
 *
 * Dashboard polls these ON-DEMAND (when user clicks task):
 *
 * 4. GET /api/tasks/:id (full detail + logs)
 * 5. GET /api/tasks/:id/logs (stream updates)
 *
 * NO WebSocket needed because:
 * - Only 5 concurrent tasks
 * - 2s polling latency acceptable
 * - Simpler infrastructure (no connection management)
 */

// ============================================================================
// ERROR RESPONSES
// ============================================================================

export interface ErrorResponse {
  error: {
    code: string;                      // TASK_NOT_FOUND, AGENT_BUSY, etc.
    message: string;
    details?: Record<string, any>;
  };
}

// Example error codes:
export enum ErrorCode {
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  TASK_ALREADY_PAUSED = 'TASK_ALREADY_PAUSED',
  TASK_CANNOT_RESUME = 'TASK_CANNOT_RESUME',
  AGENT_NOT_FOUND = 'AGENT_NOT_FOUND',
  AGENT_BUSY = 'AGENT_BUSY',
  INVALID_REQUEST = 'INVALID_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
