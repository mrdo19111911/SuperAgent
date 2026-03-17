# Layer 5: Shared Memory System - External Database

**Strategy:** Store long-term memory externally, retrieve selectively (top 3 via vector search).

**Token Savings:** 85% (3K tokens → 450 tokens per task)

**Pattern from:** OpenAI Agents SDK (Long-term Memory)

---

## Architecture

```
Context Window (Active):
  - Current task only: 500 tokens
  - Relevant PENs (top 3): 200 tokens
  Total: 700 tokens

External Memory (SQLite + Vector DB):
  - All PEN entries: Unlimited (not in context)
  - All WIN entries: Unlimited (not in context)
  - Past task history: Unlimited (not in context)
  Retrieved: Top 3 × 70 tokens = 210 tokens
```

---

## Implementation

### Pattern from OpenAI Agents SDK

```python
# Long-term memory stored externally, retrieved on-demand
class MemoryStore:
    def save_memory_note(session_id, note):
        db.insert('session_notes', {
            'session_id': session_id,
            'note': note,
            'timestamp': now()
        })

    def get_relevant_notes(session_id, query):
        # Vector search, return top 3 only
        return db.vector_search('session_notes', query, limit=3)
```

### Nash Implementation

```javascript
// SQLite + Vector DB integration
class SharedMemory {
  async saveTaskMemory(taskId, key, value) {
    await db.insert('task_memory', {
      task_id: taskId,
      key: key,
      value: value,
      embedding: await embeddings.generate(value)
    });
  }

  async retrieveRelevant(taskId, query, limit = 3) {
    // Try vector search first
    const results = await vectorDB.search(query, {
      filter: { task_id: taskId },
      limit: limit
    });

    // Return minimal context
    return results.map(r => ({
      key: r.key,
      value: r.value.substring(0, 200),  // Truncate to 200 chars
      relevance: r.score
    }));
  }
}
```

---

## Database Schema

```sql
-- SQLite schema
CREATE TABLE task_memory (
  id INTEGER PRIMARY KEY,
  task_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  embedding BLOB,  -- Vector embedding
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_task_key (task_id, key)
);

CREATE TABLE pen_entries (
  id INTEGER PRIMARY KEY,
  pen_id TEXT UNIQUE,
  agent_id TEXT,
  severity TEXT,  -- P0, P1, P2, P3, P4
  status TEXT,    -- ACTIVE, FIXED
  title TEXT,
  content TEXT,
  embedding BLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE win_entries (
  id INTEGER PRIMARY KEY,
  win_id TEXT UNIQUE,
  agent_id TEXT,
  pattern TEXT,
  content TEXT,
  embedding BLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Example Usage

### Saving Memory

```javascript
// During task execution
await sharedMemory.saveTaskMemory(
  'T4_56_payment_refactor',
  'rls_violation',
  'Found missing NOBYPASSRLS on payments table'
);

// After task completion
await sharedMemory.saveTaskMemory(
  'T4_56_payment_refactor',
  'solution',
  'Added NOBYPASSRLS role, verified with integration test'
);
```

### Retrieving Memory

```javascript
// At start of new task
const relevantMemory = await sharedMemory.retrieveRelevant(
  'T5_89_stripe_integration',  // New task
  'payment processing RLS security'  // Query
);

// Returns top 3 relevant memories:
// [
//   { key: 'rls_violation', value: 'Found missing NOBYPASSRLS...', relevance: 0.92 },
//   { key: 'solution', value: 'Added NOBYPASSRLS role...', relevance: 0.87 },
//   { key: 'test_case', value: 'Integration test verifies...', relevance: 0.81 }
// ]
```

---

## Storage vs Retrieval Pattern

### What Goes to External Memory

**Always store externally:**
- All PEN/WIN entries
- Past task transcripts
- Agent learnings
- Skill modules (full content)
- Historical decisions

**Never load into context upfront:**
- Full PEN database (500+ entries)
- Complete conversation history
- All skills (100+ modules)

### What Gets Retrieved

**Only retrieve top 3:**
- Via vector search (similarity)
- Filtered by relevance score (>0.7)
- Truncated to 200 chars each

**Total retrieved:** 3 × 70 tokens = 210 tokens (vs 3K if all loaded)

---

## Vector DB Integration

```javascript
// system/vector_db_wrapper.js
class VectorDBWrapper {
  async searchPENs(query, agentId) {
    try {
      // Try Qdrant first
      return await qdrant.search({
        collection: 'pen_entries',
        query_vector: await embeddings.generate(query),
        filter: {
          agent_id: agentId,
          severity: ['P0', 'P1'],
          status: 'ACTIVE'
        },
        limit: 3,
        score_threshold: 0.7
      });
    } catch (error) {
      // Fallback to SQLite full-text search
      console.warn('Qdrant failed, falling back to SQLite FTS');
      return await db.query(`
        SELECT * FROM pen_entries
        WHERE agent_id = ? AND status = 'ACTIVE'
        AND (title LIKE ? OR content LIKE ?)
        ORDER BY created_at DESC
        LIMIT 3
      `, [agentId, `%${query}%`, `%${query}%`]);
    }
  }
}
```

---

## Cache Strategy

**LRU Cache for frequent queries:**

```javascript
const { LRUCache } = require('lru-cache');

class CachedSharedMemory extends SharedMemory {
  constructor() {
    super();
    this.cache = new LRUCache({
      max: 500,               // 500 entries
      ttl: 1000 * 60 * 30,    // 30 minutes
      updateAgeOnGet: true
    });
  }

  async retrieveRelevant(taskId, query, limit = 3) {
    const cacheKey = `${taskId}:${query}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      console.log('✓ Cache hit: retrieveRelevant');
      return cached;
    }

    // Cache miss - query database
    const results = await super.retrieveRelevant(taskId, query, limit);
    this.cache.set(cacheKey, results);
    return results;
  }
}
```

---

## Metrics

```prometheus
# Storage metrics
nash_memory_entries_total{type} 1234  # PEN/WIN/Task entries

# Retrieval metrics
nash_memory_retrieval_latency_ms 45
nash_memory_cache_hit_rate 0.65  # 65% cache hit

# Token savings
nash_memory_tokens_saved{agent} 2550  # Tokens not loaded
```

---

## Best Practices

1. **Store everything externally** - Never keep large datasets in context
2. **Retrieve top 3 only** - More = diminishing returns
3. **Use vector search** - Similarity > keyword matching
4. **Cache frequent queries** - LRU with 30-min TTL
5. **Fallback to SQLite FTS** - Graceful degradation if vector DB fails
6. **Truncate retrieved values** - 200 chars max per entry

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
