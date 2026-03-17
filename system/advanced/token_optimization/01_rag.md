# Layer 1: RAG - Selective Context Retrieval

**Strategy:** Instead of loading all context, dynamically retrieve ONLY relevant information.

**Token Savings:** 70% (500 tokens → 150 tokens for PEN context)

---

## Implementation

```javascript
// system/context_manager.js
class ContextManager {
  async getRelevantContext(taskDescription, agentId) {
    // 1. Vector search for relevant PEN/WIN entries
    const penEntries = await vectorDB.query(taskDescription, {
      filter: { agent_id: agentId, severity: ['P0', 'P1'] },
      limit: 3  // Top 3 most relevant only
    });

    // 2. Grep fallback if vector DB down
    if (!penEntries.length) {
      penEntries = await grepFallback(taskDescription, agentId);
    }

    // 3. Return minimal context
    return {
      pen: penEntries,           // ~200 tokens (3 entries × 70 tokens)
      skill_refs: [],            // Empty - load on-demand
      total_tokens: 200
    };
  }
}
```

---

## Example Usage

**Before (Naive Approach):**
```javascript
// Load ALL PEN entries for agent
const allPENs = await loadAllPENs(agentId);  // 500 tokens
const context = { pen: allPENs };
// Agent gets 50 PEN entries, only needs 3
```

**After (RAG Approach):**
```javascript
// Load ONLY relevant PEN entries
const relevantPENs = await contextManager.getRelevantContext(
  "Review schema.prisma for RLS violations",
  "phuc-sa"
);
// Returns: PEN-002 (RLS), PEN-089 (Race conditions), PEN-234 (Idempotency)
// Total: 150 tokens
```

---

## Vector Search Configuration

**Embedding Model:** text-embedding-3-small (OpenAI) or all-MiniLM-L6-v2 (local)

**Vector DB:** Qdrant (production) or In-Memory (development)

**Search Parameters:**
```javascript
{
  query: taskDescription,
  filter: {
    agent_id: agentId,        // Only PENs for this agent
    severity: ['P0', 'P1'],   // Only critical PENs
    status: 'ACTIVE'          // Skip FIXED PENs
  },
  limit: 3,                   // Top 3 most relevant
  score_threshold: 0.7        // Minimum similarity
}
```

---

## Grep Fallback (Graceful Degradation)

**When Vector DB fails, fall back to keyword search:**

```javascript
async function grepFallback(query, agentId) {
  // Extract keywords from query
  const keywords = extractKeywords(query);  // ["RLS", "schema", "postgres"]

  // Search PEN files
  const results = await grep({
    pattern: keywords.join('|'),
    path: `tmp/ram/${agentId}/pen/`,
    glob: '*.md',
    limit: 3
  });

  return results;
}
```

---

## Metrics

**Track RAG effectiveness:**

```prometheus
# Hit rate (did vector search return results?)
nash_rag_hit_rate{agent} 0.95  # 95% success

# Fallback rate (how often did we use grep?)
nash_rag_fallback_rate{agent} 0.05  # 5% fallback

# Average tokens retrieved
nash_rag_tokens_retrieved{agent} 150
```

---

## Best Practices

1. **Always filter by P0-P1 severity** - Skip low-priority PENs
2. **Use score_threshold** - Avoid irrelevant results (0.7 minimum)
3. **Limit to 3 results** - More = diminishing returns
4. **Cache embeddings** - Generate once, reuse for 30 days
5. **Fallback to grep** - Never fail catastrophically

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
