# Layer 6: Progressive Disclosure - Lazy Loading

**Strategy:** Start minimal, load more ONLY when needed (Tier 0→1→2→3).

**Token Savings:** 91% (5K tokens → 450 tokens startup)

---

## Nash Framework Tiers

```
┌─────────────────────────────────────────────────────┐
│ Tier 0: Bootstrap (Always Loaded) - 150 tokens     │
│ - Agent name, role, model                          │
│ - Boot protocol reference                           │
│ - LUẬT SỐ 0 (token conservation rule)              │
└─────────────────────────────────────────────────────┘
              ↓ Load on task start
┌─────────────────────────────────────────────────────┐
│ Tier 1: Core Skills (Load on Task) - 300 tokens    │
│ - Core skill descriptions (not full content)        │
│ - Active PEN entries (severity P0-P1 only)         │
│ - Skill reference links (metadata only)             │
└─────────────────────────────────────────────────────┘
              ↓ Load when keyword detected
┌─────────────────────────────────────────────────────┐
│ Tier 2: Conditional Context - 500 tokens           │
│ - Load skill content when task mentions it         │
│ - Load PEN details when relevant error occurs       │
│ - Load examples when agent asks for clarification   │
└─────────────────────────────────────────────────────┘
              ↓ Load only if agent requests
┌─────────────────────────────────────────────────────┐
│ Tier 3: Deep References - 1000 tokens              │
│ - Full skill modules (postgres-expert/rls.md)      │
│ - Detailed examples with code                       │
│ - Historical task transcripts                       │
└─────────────────────────────────────────────────────┘
```

---

## Implementation

```javascript
// system/progressive_loader.js
class ProgressiveLoader {
  async loadContext(agentId, taskDescription) {
    const context = {};

    // Tier 0: Always load (150 tokens)
    context.bootstrap = await this.loadBootstrap(agentId);

    // Tier 1: Core skills (300 tokens)
    context.core = await this.loadCoreSkills(agentId);

    // Tier 2: Conditional (only if keywords match)
    if (this.detectKeywords(taskDescription, ['rls', 'postgresql'])) {
      context.rls_skill = await this.loadSkill('postgres-expert/rls-patterns.md');
    }

    if (this.detectKeywords(taskDescription, ['payment', 'stripe'])) {
      context.payment_skill = await this.loadSkill('payment/stripe-integration.md');
    }

    // Tier 3: Load on-demand (agent calls tool to request)
    // Not pre-loaded

    return context;  // Total: 150-450 tokens (vs 5K before)
  }

  detectKeywords(text, keywords) {
    const lower = text.toLowerCase();
    return keywords.some(kw => lower.includes(kw));
  }

  async loadBootstrap(agentId) {
    // Tier 0: Minimal bootstrap
    return {
      agent_id: agentId,
      role: await this.getRole(agentId),
      model: 'claude-sonnet-4',
      token_rule: 'LUẬT SỐ 0: Token conservation is PRIMARY constraint'
    };
  }

  async loadCoreSkills(agentId) {
    // Tier 1: Skill metadata only (not full content)
    const skills = await db.query(`
      SELECT skill_id, title, keywords
      FROM skills
      WHERE agent_id = ?
    `, [agentId]);

    return skills.map(s => ({
      id: s.skill_id,
      title: s.title,
      keywords: s.keywords,
      // NOT included: full content (loaded on-demand)
    }));
  }

  async loadSkill(skillPath) {
    // Tier 2/3: Full skill content
    const content = await fs.readFile(skillPath, 'utf-8');
    return {
      path: skillPath,
      content: content,
      tokens: this.countTokens(content)
    };
  }
}
```

---

## Example: Task Startup

### Task: "Review schema.prisma for RLS violations"

**Tier 0 (Always Loaded):**
```javascript
{
  agent_id: 'phuc-sa',
  role: 'Software Architect',
  model: 'claude-sonnet-4',
  token_rule: 'LUẬT SỐ 0: Token conservation is PRIMARY'
}
// 150 tokens
```

**Tier 1 (Core Skills Metadata):**
```javascript
{
  skills: [
    { id: 'rls-patterns', title: 'PostgreSQL RLS Best Practices', keywords: ['rls', 'postgres'] },
    { id: 'api-design', title: 'REST API Design Patterns', keywords: ['api', 'rest'] },
    { id: 'security', title: 'OWASP Security Checklist', keywords: ['security', 'owasp'] }
  ],
  active_pens: [
    { id: 'PEN-002', title: 'NOBYPASSRLS required', severity: 'P0' },
    { id: 'PEN-089', title: 'Race condition prevention', severity: 'P1' }
  ]
}
// 300 tokens
```

**Tier 2 (Conditional - Triggered by "RLS" keyword):**
```javascript
{
  rls_skill: {
    path: 'postgres-expert/rls-patterns.md',
    content: '# RLS Best Practices\n\n1. Always use NOBYPASSRLS...',
    tokens: 500
  }
}
// 500 tokens (only loaded because task mentions "RLS")
```

**Tier 3 (Not loaded - agent didn't request):**
```javascript
// NOT loaded:
// - Full task transcripts
// - Detailed code examples
// - Historical PEN entries
```

**Total: 950 tokens** (vs 5K if all loaded upfront)

---

## Tier 2: Keyword Detection

```javascript
const KEYWORD_MAP = {
  'rls-patterns': ['rls', 'row level security', 'postgresql', 'postgres', 'tenant'],
  'api-design': ['api', 'rest', 'endpoint', 'contract'],
  'payment': ['payment', 'stripe', 'billing', 'subscription'],
  'security': ['security', 'owasp', 'vulnerability', 'auth', 'xss', 'sql injection']
};

function detectSkills(taskDescription) {
  const lower = taskDescription.toLowerCase();
  const matchedSkills = [];

  for (const [skillId, keywords] of Object.entries(KEYWORD_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matchedSkills.push(skillId);
    }
  }

  return matchedSkills;
}
```

---

## Tier 3: On-Demand Loading

**Agent requests via tool call:**

```javascript
// Agent discovers it needs more context
const deepContext = await tool('LoadSkillContent', {
  skill_id: 'postgres-expert/advanced-rls-patterns.md',
  reason: 'Need detailed examples for multi-level RLS'
});

// System loads Tier 3 content
const skill = await progressiveLoader.loadSkill('postgres-expert/advanced-rls-patterns.md');

// Return to agent
return skill.content;  // 1000 tokens
```

---

## Token Budget Tracking

```javascript
class TokenBudgetTracker {
  constructor(mode) {
    this.budgets = {
      EXPANSION: { max: 30000, target: 20000 },
      HOLD: { max: 15000, target: 12000 },
      REDUCTION: { max: 10000, target: 7000 }
    };
    this.mode = mode;
    this.spent = {
      tier0: 0,
      tier1: 0,
      tier2: 0,
      tier3: 0
    };
  }

  trackTier(tier, tokens) {
    this.spent[`tier${tier}`] += tokens;
    const total = Object.values(this.spent).reduce((sum, t) => sum + t, 0);

    if (total > this.budgets[this.mode].max) {
      throw new Error(`Token budget exceeded: ${total}/${this.budgets[this.mode].max}`);
    }
  }

  getReport() {
    const total = Object.values(this.spent).reduce((sum, t) => sum + t, 0);
    return {
      tier0: this.spent.tier0,
      tier1: this.spent.tier1,
      tier2: this.spent.tier2,
      tier3: this.spent.tier3,
      total: total,
      budget: this.budgets[this.mode].max,
      utilization: total / this.budgets[this.mode].max
    };
  }
}
```

---

## Metrics

```prometheus
# Tier usage distribution
nash_progressive_tier0_tokens{agent} 150
nash_progressive_tier1_tokens{agent} 300
nash_progressive_tier2_tokens{agent} 500
nash_progressive_tier3_tokens{agent} 0  # Not loaded

# Load efficiency
nash_progressive_load_ratio{agent} 0.19  # 950/5000 = 19% loaded

# Keyword detection accuracy
nash_progressive_keyword_hit_rate{agent} 0.85  # 85% correct
```

---

## Best Practices

1. **Always load Tier 0** - Minimal bootstrap (150 tokens)
2. **Load Tier 1 on task start** - Core skills metadata (300 tokens)
3. **Trigger Tier 2 by keywords** - Conditional loading (500 tokens)
4. **Load Tier 3 on request only** - Agent calls tool (1000 tokens)
5. **Track token budget** - Hard limit enforcement
6. **Measure keyword accuracy** - Fine-tune detection over time

---

**See:** `TOKEN_OPTIMIZATION_LAYERS.md` for overview
