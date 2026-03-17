# Layer 4: Modular Design - Multi-Agent with Bounded Context

**Strategy:** Delegate to specialized sub-agents with minimal context instead of one agent loading everything.

**Token Savings:** 76% (5K tokens → 1.2K tokens)

---

## Problem: Monolithic Agent

**Before:**
```javascript
async reviewArchitecture(files) {
  // Load: All PENs, All WINs, All Skills, All reference files
  const context = await loadFullContext();  // 5K tokens
  const review = await analyzeWithFullContext(files, context);
  return review;
}
```

**Issues:**
- 5K tokens loaded even if only reviewing 1 file
- Agent has context for RLS, API, DB, UX, security (only needs 1)
- Wasteful for simple tasks

---

## Solution: Modular Sub-Agents

**After:**
```javascript
async reviewArchitecture(files) {
  const subTasks = [];

  // 1. RLS Review Agent (bounded context)
  if (files.includes('schema.prisma')) {
    subTasks.push(
      spawnSubAgent('rls-specialist', {
        files: ['schema.prisma'],
        pen: ['PEN-002'],  // Only RLS-related PEN
        skill: 'postgres-expert/rls-patterns.md',
        tokens_budget: 800
      })
    );
  }

  // 2. API Contract Agent (bounded context)
  if (files.includes('CONTRACT_DRAFT.md')) {
    subTasks.push(
      spawnSubAgent('api-specialist', {
        files: ['CONTRACT_DRAFT.md'],
        pen: ['PEN-005'],  // Only API-related PEN
        tokens_budget: 400
      })
    );
  }

  // 3. Execute sub-agents in parallel
  const results = await Promise.all(subTasks);

  // 4. Synthesis (minimal context)
  return this.synthesize(results);  // 200 tokens
}
```

**Token Usage:**
- RLS specialist: 800 tokens
- API specialist: 400 tokens
- Synthesis: 200 tokens
- **Total: 1.4K tokens** (vs 5K before)

---

## Sub-Agent Spawning Protocol

```javascript
// system/sub_agent_spawner.js
class SubAgentSpawner {
  async spawnSubAgent(role, config) {
    // 1. Create minimal context
    const context = {
      role: role,
      files: config.files,              // Only relevant files
      pen: config.pen,                  // Only relevant PENs
      skill: config.skill,              // Single skill (not all)
      tokens_budget: config.tokens_budget
    };

    // 2. Spawn agent process
    const agent = await this.createAgent(context);

    // 3. Execute task
    const result = await agent.execute();

    // 4. Track token usage
    await this.trackTokens(role, result.tokens_used);

    return result;
  }

  async synthesize(results) {
    // Aggregate sub-agent findings
    const summary = {
      total_issues: results.reduce((sum, r) => sum + r.issues.length, 0),
      critical: results.filter(r => r.severity === 'CRITICAL'),
      recommendations: results.flatMap(r => r.recommendations)
    };

    return summary;  // ~200 tokens
  }
}
```

---

## Example: Architecture Review

### Task: Review full system for deployment

**Monolithic Approach (5K tokens):**
```javascript
const mainAgent = new ArchitectAgent({
  pen: [...allPENs],           // 2K tokens
  skills: [...allSkills],      // 2K tokens
  files: [...allFiles]         // 1K tokens
});
const review = await mainAgent.review();
```

**Modular Approach (1.4K tokens):**
```javascript
const subAgents = [
  spawnSubAgent('security-specialist', {
    files: ['schema.prisma', 'auth.ts'],
    pen: ['PEN-002', 'PEN-005'],
    skill: 'postgres-expert/rls-patterns.md',
    tokens_budget: 600
  }),
  spawnSubAgent('performance-specialist', {
    files: ['api.ts', 'db-queries.ts'],
    pen: ['PEN-089'],
    skill: 'performance/n-plus-one.md',
    tokens_budget: 400
  }),
  spawnSubAgent('api-specialist', {
    files: ['CONTRACT_DRAFT.md'],
    pen: ['PEN-012'],
    tokens_budget: 400
  })
];

const results = await Promise.all(subAgents);
const synthesis = synthesize(results);  // 200 tokens
```

---

## When to Use Modular Approach

**Use when:**
- Task is complex (>30 SP)
- Sub-tasks are independent
- Each sub-task belongs to different domain (security, performance, API)

**Don't use when:**
- Task is simple (<10 SP)
- Sub-tasks have tight coupling
- Coordination overhead > token savings

---

## Coordination Overhead

**Pattern: Parallel execution, sequential synthesis**

```javascript
// Phase 1: Parallel (no dependencies)
const [securityReview, perfReview, apiReview] = await Promise.all([
  spawnSubAgent('security', ...),
  spawnSubAgent('performance', ...),
  spawnSubAgent('api', ...)
]);

// Phase 2: Sequential synthesis (requires all results)
const synthesis = await synthesize([securityReview, perfReview, apiReview]);
```

**Coordination Cost:**
- Spawning 3 sub-agents: 50ms each = 150ms
- Parallel execution: max(600ms, 400ms, 400ms) = 600ms
- Synthesis: 100ms
- **Total: 850ms** (vs 2000ms for monolithic)

---

## Metrics

```prometheus
# Sub-agent spawns
nash_subagent_spawns_total{role} 45

# Token usage per sub-agent
nash_subagent_tokens{role} 600

# Coordination overhead
nash_subagent_coordination_ms{role} 50

# Token savings (vs monolithic)
nash_subagent_savings_percent{role} 0.76  # 76%
```

---

## Best Practices

1. **Bounded context per sub-agent** - Only load what's needed
2. **Parallel execution when possible** - Async/await with Promise.all
3. **Thin synthesis layer** - Aggregate results (200 tokens max)
4. **Track token budgets** - Hard limit per sub-agent
5. **Reuse sub-agents** - Cache for similar tasks

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
