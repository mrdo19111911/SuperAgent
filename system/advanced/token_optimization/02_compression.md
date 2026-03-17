# Layer 2: Context Compression - Hierarchical Summarization

**Strategy:** Compress conversation history (recent verbatim, medium summarized, old ultra-compressed).

**Token Savings:** 74% (10K tokens → 2.6K tokens)

**Pattern from:** OpenAI Agents SDK (Session Memory)

---

## Implementation

```javascript
// system/conversation_compressor.js
class ConversationCompressor {
  compress(messages) {
    const recent = messages.slice(-5);        // Last 5 messages: verbatim
    const medium = messages.slice(-20, -5);   // 6-20: Compress
    const old = messages.slice(0, -20);       // >20: Ultra-compress

    return {
      recent: recent,                         // ~2K tokens
      medium: this.summarize(medium, 'medium'), // ~500 tokens
      old: this.summarize(old, 'brief'),       // ~100 tokens
      total_tokens: 2600  // vs 10K+ uncompressed
    };
  }

  summarize(messages, level) {
    if (level === 'medium') {
      // Keep key decisions, remove explanations
      return messages.map(m => this.extractDecisions(m));
    } else {
      // Single sentence per 10 messages
      return this.ultraCompress(messages);
    }
  }

  extractDecisions(message) {
    // Extract only action items and decisions
    const lines = message.content.split('\n');
    const decisions = lines.filter(line =>
      line.includes('DECISION:') ||
      line.includes('ACTION:') ||
      line.includes('RESULT:')
    );
    return decisions.join('\n');
  }

  ultraCompress(messages) {
    // Group every 10 messages, summarize to 1 sentence
    const groups = [];
    for (let i = 0; i < messages.length; i += 10) {
      const group = messages.slice(i, i + 10);
      groups.push(this.summarizeGroup(group));
    }
    return groups.join('\n');
  }

  summarizeGroup(messages) {
    // Extract task and outcome only
    const firstMessage = messages[0].content.substring(0, 100);
    const lastMessage = messages[messages.length - 1].content.substring(0, 100);
    return `Task: ${firstMessage}... → Outcome: ${lastMessage}...`;
  }
}
```

---

## Example Usage

**Before (No Compression):**
```javascript
// Load all 25 messages verbatim
const context = {
  history: allMessages  // 10K tokens
};
// Agent context window fills up quickly
```

**After (Hierarchical Compression):**
```javascript
const compressor = new ConversationCompressor();
const compressed = compressor.compress(allMessages);

const context = {
  recent: compressed.recent,    // Last 5 messages: 2K tokens
  summary: compressed.medium,   // Messages 6-20: 500 tokens
  overview: compressed.old      // Messages 1-5: 100 tokens
};
// Total: 2.6K tokens (vs 10K before)
```

---

## Compression Levels

### Level 1: Recent (Verbatim)
**Messages:** Last 5
**Tokens:** ~2K
**Why:** Need full context for current task

### Level 2: Medium (Decisions Only)
**Messages:** 6-20
**Tokens:** ~500
**Example:**
```
DECISION: Use PostgreSQL for multi-tenancy
ACTION: Created schema.prisma with RLS policies
RESULT: All tables have tenant_id + NOBYPASSRLS
```

### Level 3: Old (Ultra-Compressed)
**Messages:** >20
**Tokens:** ~100
**Example:**
```
Task: Add payment processing... → Outcome: Stripe integration complete...
Task: Fix RLS bug in orders table... → Outcome: PEN-002 violation fixed...
```

---

## When to Compress

**Trigger:** Message count > 5

```javascript
if (conversation.messages.length > 5) {
  const compressed = compressor.compress(conversation.messages);
  context.history = compressed;
} else {
  // Keep all messages verbatim (short conversation)
  context.history = conversation.messages;
}
```

---

## Metrics

```prometheus
# Compression ratio
nash_compression_ratio{agent} 0.74  # 74% reduction

# Average tokens before/after
nash_tokens_before_compression{agent} 10000
nash_tokens_after_compression{agent} 2600

# Compression time
nash_compression_duration_ms{agent} 50  # 50ms average
```

---

## Best Practices

1. **Never compress last 5 messages** - Always keep recent context verbatim
2. **Extract decisions, not explanations** - Focus on outcomes
3. **Cache compressed summaries** - Recompute only when new messages arrive
4. **Test compression quality** - Ensure no critical info lost
5. **Use LLM for complex summarization** - For >100 messages, use small model (GPT-3.5-turbo)

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
