# Token Optimization - Layers Overview

**Philosophy**: Token = Fuel. Context Window = Lifespan. Optimize ruthlessly.

**Goal**: Reduce token usage by 60-80% while maintaining quality through intelligent memory management.

**For detailed implementation:** See `token_optimization/` directory for each layer.

---

## 6-Layer Defense Stack

| Layer | Technique | Savings | When to Load |
|-------|-----------|---------|--------------|
| **Layer 1** | [RAG - Selective Retrieval](token_optimization/01_rag.md) | 70% | Always - foundation |
| **Layer 2** | [Compression - Hierarchical Summarization](token_optimization/02_compression.md) | 74% | When conversation > 5 messages |
| **Layer 3** | [Structured Prompting](token_optimization/03_structured.md) | 30% | Always - clear boundaries |
| **Layer 4** | [Modular Sub-Agents](token_optimization/04_modular.md) | 76% | Complex tasks (>30 SP) |
| **Layer 5** | [Shared Memory (External DB)](token_optimization/05_shared_memory.md) | 85% | Always - persistent storage |
| **Layer 6** | [Progressive Disclosure](token_optimization/06_progressive.md) | 91% | Always - lazy loading |

---

## Quick Reference: When to Use Each Layer

### Layer 1: RAG (Selective Retrieval)
**Use when:** You need to load PEN/WIN entries or skills
**How:** Vector search for top 3 relevant entries only
**Trigger keywords:** "RLS policy", "authentication bug", "payment processing"
**File:** [01_rag.md](token_optimization/01_rag.md)

### Layer 2: Compression (Conversation History)
**Use when:** Conversation has >5 messages
**How:** Recent verbatim, medium compressed, old ultra-compressed
**Trigger:** Message count > 5
**File:** [02_compression.md](token_optimization/02_compression.md)

### Layer 3: Structured Prompting
**Use when:** Building agent prompts
**How:** XML sections with conditional loading markers
**Trigger:** Always (design pattern)
**File:** [03_structured.md](token_optimization/03_structured.md)

### Layer 4: Modular Sub-Agents
**Use when:** Task is complex (>30 SP) or has independent sub-tasks
**How:** Delegate to specialized agents with bounded context
**Trigger:** Complexity > 30 SP or multiple domains
**File:** [04_modular.md](token_optimization/04_modular.md)

### Layer 5: Shared Memory (External DB)
**Use when:** Need persistent storage across tasks
**How:** SQLite + Vector DB for long-term memory
**Trigger:** Always (architecture pattern)
**File:** [05_shared_memory.md](token_optimization/05_shared_memory.md)

### Layer 6: Progressive Disclosure
**Use when:** Loading agent context
**How:** Tier 0 (bootstrap) → Tier 1 (core) → Tier 2 (conditional) → Tier 3 (on-demand)
**Trigger:** Always (fundamental pattern)
**File:** [06_progressive.md](token_optimization/06_progressive.md)

---

## Expected Token Savings (Cumulative)

| Layer | Baseline | After | Savings |
|-------|----------|-------|---------|
| 1. RAG | 500 | 150 | 70% |
| 2. Compression | 10000 | 2600 | 74% |
| 3. Structured | 5000 | 3500 | 30% |
| 4. Modular | 5000 | 1200 | 76% |
| 5. Shared Memory | 3000 | 450 | 85% |
| 6. Progressive | 5000 | 450 | 91% |
| **Overall** | **20K** | **3.5K** | **82.5%** |

**Monthly Impact (500 tasks):**
- Before: 20K × 500 = 10M tokens
- After: 3.5K × 500 = 1.75M tokens
- **Savings: 8.25M tokens/month**
- **Cost savings: ~$25/month** (at $3/M tokens)

---

## Token Budget Enforcement

**Cognitive Mode Budgets:**
```javascript
EXPANSION: { max: 30K, target: 20K, min: 15K }
HOLD:      { max: 15K, target: 12K, min: 10K }
REDUCTION: { max: 10K, target: 7K,  min: 5K  }
```

**Hard Limit Enforcement:**
```javascript
if (tokens_used > budget.max) {
  throw new Error("Token budget exceeded");
}
```

**Prometheus Metrics:**
```
nash_tokens_per_task{agent, mode}
nash_token_budget_utilization{agent, mode}
nash_token_efficiency_ratio{agent}
```

---

## Implementation Priority

**Phase 1 (Week 1)**: Foundation
- ✅ Token tracking in Agent Sharpener
- ✅ Basic RAG with vector DB
- ✅ Progressive loader (Tier 0-2)

**Phase 2 (Week 2)**: Optimization
- ✅ Conversation compression
- ✅ Structured prompting with XML
- ✅ Token budget enforcement

**Phase 3 (Week 3)**: Advanced
- ✅ Modular sub-agent delegation
- ✅ Shared memory with SQLite
- ✅ Response caching (LRU)

**Phase 4 (Week 4)**: Measurement
- ✅ Grafana dashboards for token metrics
- ✅ Monthly savings reports
- ✅ Efficiency benchmarks

---

## Complete Optimization Stack (Code Example)

**Combining all 6 layers:**

```javascript
// system/optimized_agent_runtime.js
class OptimizedAgentRuntime {
  async executeTask(taskDescription, agentId, mode = 'HOLD') {
    // Layer 1: RAG - Selective retrieval
    const relevantPENs = await contextManager.getRelevantContext(taskDescription, agentId);

    // Layer 2: Compression - Summarize conversation history
    const compressedHistory = conversationCompressor.compress(this.history);

    // Layer 3: Structured prompting - XML sections
    const prompt = this.buildStructuredPrompt({
      instructions: this.getInstructions(agentId),
      pen_constraints: relevantPENs,  // Only top 3
      working_memory: compressedHistory.recent,
      summary: compressedHistory.medium
    });

    // Layer 4: Modular design - Delegate to sub-agents
    const subTasks = this.decompose(taskDescription);
    const results = await Promise.all(
      subTasks.map(st => this.spawnSubAgent(st, { tokens_budget: 800 }))
    );

    // Layer 5: Shared memory - Save to external DB
    await sharedMemory.saveTaskMemory(taskId, 'findings', results);

    // Layer 6: Progressive disclosure - Load more only if needed
    if (results.some(r => r.needs_deep_context)) {
      const deepContext = await progressiveLoader.loadTier3(agentId);
      // Re-run with deep context
    }

    // Token budget enforcement
    const tokensUsed = this.countTokens(prompt) + results.reduce((sum, r) => sum + r.tokens, 0);
    await tokenBudget.trackUsage(taskId, tokensUsed);

    return {
      results,
      tokens_used: tokensUsed,
      efficiency: tokensUsed / tokenBudget.budgets[mode].target
    };
  }
}
```

---

## References

- OpenAI Agents SDK: Session Memory & Context Personalization (2025)
- Anthropic Context Window Management Best Practices
- Nash Framework BRAIN.md (LUẬT SỐ 0)
- gstack Progressive Disclosure Patterns

---

**Last Updated**: 2026-03-16
**Version**: 3.0
**Status**: Production-ready
