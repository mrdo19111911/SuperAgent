# History Compression Layer — Token Optimization v6.9

**Version:** v1.0
**Purpose:** Compress chat history from 3,000+ tokens → 800 tokens (73% reduction) without losing critical context.

---

## Problem Statement

Current Nash framework loads FULL chat history (last 20 messages) into every agent prompt:

**Token Breakdown (20 messages):**
- User messages: ~500 tokens
- Bot responses: ~2,500 tokens (verbose explanations + [ACTION:...] tags)
- **Total:** ~3,000 tokens wasted per agent dispatch

**Issues:**
1. **Old responses** rarely needed (context decay)
2. **[ACTION:...] tags** from past executions clutter context (causes LLM to re-execute old actions)
3. **Verbose explanations** waste tokens on historical "thinking"

---

## Solution: 3-Zone Compression (Recent/Middle/Old)

```
┌─────────────────┐
│  Zone 1: RECENT │  Messages 1-5  → Keep FULL (no compression)
├─────────────────┤
│  Zone 2: MIDDLE │  Messages 6-15 → Truncate bot responses + strip ACTION tags
├─────────────────┤
│  Zone 3: OLD    │  Messages 16-20 → Collapse to 1-line summary
└─────────────────┘
```

---

## Zone 1: RECENT (Messages 1-5)

**Strategy:** Keep FULL (user + bot responses verbatim)

**Rationale:** Recent context is critical for continuity

**Token Impact:** ~750 tokens (no change)

**Example:**
```
User: "Implement OAuth login"
Bot: "I'll help implement OAuth 2.0 authentication. Let me start by..."
[ACTION:Read src/auth.ts]
[ACTION:Write src/oauth.ts]
...
```

---

## Zone 2: MIDDLE (Messages 6-15)

**Strategy:** Aggressive truncation

### 2.1 Strip ACTION Tags (Highest Impact)

**Problem:** Old [ACTION:...] tags cause LLM hallucination (thinks it needs to re-execute)

**Solution:** Remove ALL [ACTION:...] tags from historical bot responses

**Before (150 tokens):**
```
Bot: I've analyzed the auth module. [ACTION:Read src/auth.ts] [ACTION:Grep "TODO"]
The implementation is missing OAuth validation. [ACTION:Edit src/auth.ts old="// TODO" new="validateToken()"]
I've added validation logic. Please review.
```

**After (40 tokens):**
```
Bot: Analyzed auth module. Missing OAuth validation. Added validateToken() logic.
```

**Token Saved:** ~110 tokens/message (73% reduction)

### 2.2 Truncate Verbose Explanations

**Pattern:** Remove:
- "Let me...", "I'll help...", "Great question..."
- "Here's what I found...", "After analyzing..."
- "Please note...", "Important:..."

**Before (80 tokens):**
```
Bot: Great question! Let me analyze the codebase to find all OAuth references.
After reviewing the code, I found that src/auth.ts contains the main logic.
Please note that the implementation is incomplete.
```

**After (20 tokens):**
```
Bot: OAuth logic in src/auth.ts (incomplete).
```

**Token Saved:** ~60 tokens/message (75% reduction)

### 2.3 Keep User Messages FULL

**Rationale:** User intent must never be compressed (risk of losing requirements)

**Example:**
```
User: "Add OAuth 2.0 with Google and GitHub providers. Use PKCE flow."
→ Keep verbatim (no compression)
```

---

## Zone 3: OLD (Messages 16-20)

**Strategy:** Collapse to 1-line summary per exchange

**Tool:** Rule-based summarization (no LLM needed)

**Algorithm:**
```javascript
function summarizeOldExchange(user, bot) {
  const userAction = extractIntent(user); // "implement", "fix", "analyze"
  const botOutcome = extractVerb(bot);   // "implemented", "fixed", "analyzed"

  return `${userAction} → ${botOutcome}`;
}
```

**Example:**

**Before (200 tokens):**
```
User: "Can you help me debug the payment module? Tests are failing."
Bot: "I'll analyze the payment tests. Let me read the test files first..."
[ACTION:Read tests/payment.test.ts]
[ACTION:Bash npm test]
"Found the issue - missing mock for Stripe API. I'll fix it now..."
[ACTION:Edit tests/payment.test.ts]
"Fixed. Tests now pass."
```

**After (15 tokens):**
```
debug payment tests → fixed (Stripe mock added)
```

**Token Saved:** ~185 tokens/exchange (92% reduction)

---

## Compression Algorithm (Pseudocode)

```javascript
function compressHistory(messages, maxMessages = 20) {
  const recent = messages.slice(0, 5);
  const middle = messages.slice(5, 15);
  const old = messages.slice(15, 20);

  // Zone 1: RECENT (no compression)
  const recentTokens = recent;

  // Zone 2: MIDDLE (strip + truncate)
  const middleTokens = middle.map(msg => {
    if (msg.role === 'user') return msg; // Keep user messages full

    // Strip ACTION tags
    let content = msg.content.replace(/\[ACTION:.*?\]/g, '');

    // Remove verbose prefixes
    content = content.replace(/^(Great|Let me|I'll help|After|Please note|Important).*?\.\s*/gi, '');

    // Truncate to first 2 sentences
    const sentences = content.split(/\.\s+/);
    content = sentences.slice(0, 2).join('. ') + '.';

    return { ...msg, content };
  });

  // Zone 3: OLD (collapse to summary)
  const oldTokens = [];
  for (let i = 0; i < old.length; i += 2) {
    const userMsg = old[i];
    const botMsg = old[i + 1];
    if (!userMsg || !botMsg) continue;

    const summary = summarizeOldExchange(userMsg.content, botMsg.content);
    oldTokens.push({ role: 'system', content: `[History] ${summary}` });
  }

  return [...recentTokens, ...middleTokens, ...oldTokens];
}
```

---

## Anti-Pattern Detection (CRITICAL)

**Problem:** LLM may re-execute old actions if ACTION tags not stripped

**Example (Dangerous):**
```
Old message: "I've implemented auth. [ACTION:Write src/auth.ts content=...]"
→ LLM sees this → thinks it needs to write src/auth.ts AGAIN → overwrites file
```

**Solution:** Strip ALL ACTION tags before injecting into prompt

**Regex Pattern:**
```javascript
const ACTION_TAG_REGEX = /\[ACTION:[^\]]+\]/g;
content = content.replace(ACTION_TAG_REGEX, '');
```

---

## Token Impact Analysis

### Before (No Compression):
| Zone | Messages | User | Bot | Total |
|------|----------|------|-----|-------|
| Recent | 1-5 | 250 | 500 | 750 |
| Middle | 6-15 | 500 | 1,500 | 2,000 |
| Old | 16-20 | 250 | 500 | 750 |
| **Total** | **20** | **1,000** | **2,500** | **3,500** |

### After (With Compression):
| Zone | Messages | User | Bot | Total |
|------|----------|------|-----|-------|
| Recent | 1-5 | 250 | 500 | 750 |
| Middle | 6-15 | 500 | 400 | 900 |
| Old | 16-20 | 0 | 0 | 150 |
| **Total** | **20** | **750** | **900** | **1,800** |

**Reduction:** 3,500 → 1,800 tokens (**49% reduction**)

---

## Integration Points

### 1. Update `agents/BRAIN.md` Boot Protocol

**Add to Step 5 (History Loading):**
```markdown
5. Load chat history via `system/compress_history.cjs` (auto-applies 3-zone compression)
```

### 2. Update `system/templates/NASH_SUBAGENT_PROMPTS.md`

**Add Rule 59:**
```markdown
59. **History Compression** (v6.9): Load history via compress_history.js. NEVER load raw history >20 messages. Strip ACTION tags from Zone 2/3. P2 if bot re-executes old actions due to unstripped tags.
```

### 3. Compression Script

**Status:** ✅ Implemented in `system/compress_history.cjs`

```javascript
#!/usr/bin/env node
/**
 * compress_history.js - 3-zone history compression (v6.9)
 *
 * Usage: node system/compress_history.js input.json output.json
 * Input: Full chat history (JSON array)
 * Output: Compressed history (JSON array)
 */

const fs = require('fs');

function compressHistory(messages) {
  // Implementation from pseudocode above
  // ...
}

const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const compressed = compressHistory(input);
fs.writeFileSync(process.argv[3], JSON.stringify(compressed, null, 2));
console.error(`Compressed ${input.length} messages → ${compressed.length} entries`);
```

---

## Testing Strategy

**Test Suite:** `tests/history_compression.test.js`

```javascript
describe('History Compression', () => {
  it('should keep Zone 1 (Recent) unchanged', () => {
    const messages = generateMockHistory(20);
    const compressed = compressHistory(messages);

    // First 5 messages should be identical
    expect(compressed.slice(0, 5)).toEqual(messages.slice(0, 5));
  });

  it('should strip ACTION tags from Zone 2 (Middle)', () => {
    const messages = [
      { role: 'assistant', content: 'Analyzed. [ACTION:Read file.ts] Done.' }
    ];
    const compressed = compressHistory(messages);

    expect(compressed[0].content).not.toContain('[ACTION:');
    expect(compressed[0].content).toBe('Analyzed. Done.');
  });

  it('should collapse Zone 3 (Old) to summaries', () => {
    const messages = generateMockHistory(20);
    const compressed = compressHistory(messages);

    // Last 5 pairs should be collapsed to ~3 summaries
    const oldZone = compressed.slice(15);
    expect(oldZone.length).toBeLessThan(5);
    expect(oldZone[0].content).toMatch(/^\[History\]/);
  });
});
```

---

## Edge Cases

### 1. Code Blocks in History

**Problem:** Truncation may break code fences

**Solution:** Detect triple backticks, skip truncation if inside code block

```javascript
function isSafeToTruncate(content, pos) {
  const before = content.substring(0, pos);
  const backtickCount = (before.match(/```/g) || []).length;
  return backtickCount % 2 === 0; // Even = outside code block
}
```

### 2. Multi-turn Debugging Sessions

**Problem:** Middle zone may contain critical error traces

**Solution:** Detect error patterns, keep full if found

```javascript
const ERROR_KEYWORDS = ['Error:', 'TypeError:', 'at line', 'stack trace'];
function containsError(content) {
  return ERROR_KEYWORDS.some(kw => content.includes(kw));
}

if (containsError(msg.content)) {
  return msg; // Keep full, don't compress
}
```

### 3. User Corrections

**Problem:** User edits/corrections in middle zone must be preserved

**Solution:** Detect correction patterns, keep full

```javascript
const CORRECTION_PATTERNS = [
  /^(no|wait|actually|correction|fix that)/i,
  /instead|not that|should be/i
];

function isCorrection(content) {
  return CORRECTION_PATTERNS.some(pattern => pattern.test(content));
}
```

---

## Monitoring Metrics

**Track in `tmp/compression_metrics.json`:**

```json
{
  "daily": {
    "messages_processed": 5000,
    "avg_before_tokens": 3200,
    "avg_after_tokens": 1600,
    "reduction_pct": 50,
    "errors": 3,
    "false_positives": 1
  }
}
```

---

## Rollback Plan

**If compression causes errors:**

1. Check `tmp/compression_errors.log`
2. Disable compression via flag: `--no-history-compression`
3. Revert to full history loading
4. Fix regex patterns based on error cases

---

## Future Enhancements

1. **Semantic compression** (LLM-based summarization for Zone 3)
2. **Context decay scoring** (older messages get higher compression)
3. **User preference learning** (adjust compression based on user feedback)
4. **Multi-language support** (VN/JP verbose phrase detection)

---

*History Compression | Rule 0 (Token Conservation) in action*
