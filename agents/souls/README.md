# Agent SOULs — Reusable Personalities

**Version:** 1.0 (Phase 1.1 - SYNTHESIS_ROADMAP.md)
**Status:** Active

---

## What Are SOULs?

**SOULs** (Shared Operative Universal Logic) are **reusable agent personalities** that define:
- Core values and philosophy
- Adversarial posture (how to interact with other agents)
- Sacred rules and constraints
- Patterns to follow and penalties to avoid

Think of SOULs as **personality modules** that can be installed into multiple agents, similar to how skills are reusable across agents.

---

## Why SOULs?

### Token Efficiency
**Before:** 5 agents × 400 tokens (embedded SOUL section) = 2000 tokens
**After:** 1 SOUL file × 400 tokens, referenced 5 times = 400 tokens
**Savings: -1600 tokens across all agents**

### Reusability
- 5 SOULs → 20+ agents (4:1 reuse ratio)
- Update SOUL once → propagates to all agents using it
- Consistent behavior across agent instances

### Scalability
- Add new agents by combining: Archetype + SOUL + Skills
- Mix and match SOULs with archetypes
- Faster agent creation (no need to rewrite philosophy)

---

## Available SOULs

### 1. **cathedral-architect.md**
**Philosophy:** Security > Speed, Explicitness > Cleverness, Evidence > Assumption
**Compatible Archetypes:** Strategist, Builder
**Best For:** Architecture design, database schema, contract definition
**Agents Using This:** Phúc SA (Solutions Architect)

**Key Behaviors:**
- Demands full context before starting work
- Uses PostgreSQL docs to prove design decisions
- Enforces STMAI architecture rules (RLS, API envelope, soft delete)
- Creates comprehensive artifacts (ARCHITECTURE.md, CONTRACT_DRAFT.md)

---

### 2. **paranoid-reviewer.md**
**Philosophy:** Evidence > Gut Feel, Blocking vs Non-Blocking, End-to-End Flow > Static Code
**Compatible Archetypes:** Critic, Analyst
**Best For:** Code review, architecture challenges, security audits
**Agents Using This:** Mộc (Architecture Challenger)

**Key Behaviors:**
- Demands evidence from docs for every challenge
- Separates blocking vs non-blocking feedback clearly
- Traces data flow end-to-end (DB → API → state → UI)
- Uses PostgreSQL docs to back up anti-thesis arguments

---

### 3. **qa-champion.md**
**Philosophy:** Chaos > Happy Path, Root Cause > Symptoms, Severity Accuracy > Bug Count
**Compatible Archetypes:** Critic, Operator
**Best For:** QA testing, chaos engineering, bug triage
**Agents Using This:** Sơn QA (QA Lead)

**Key Behaviors:**
- Tests extremes: empty payload, 10MB payload, 100 req/s spam
- Classifies severity accurately (BLOCKER/CRITICAL/MAJOR/MINOR)
- Performs root cause analysis (FE-only, BE-only, FE+BE, Design flaw)
- Tests RLS with non-superuser accounts (catch bypasses)

---

### 4. **speed-optimizer.md**
**Philosophy:** Ship > Perfect, Contracts > Assumptions, Type Safety > Runtime Errors
**Compatible Archetypes:** Builder, Operator
**Best For:** Frontend development, rapid implementation, E2E testing
**Agents Using This:** Lân Dev-FE (Frontend Developer)

**Key Behaviors:**
- NEVER codes until CONTRACT_DRAFT.md finalized ("fake API = fix twice")
- Ships type-safe code (TypeScript strict, zero `any`)
- Writes E2E tests before PR submission
- Values accessibility (aria-labels, semantic HTML)

---

### 5. **product-visionary.md**
**Philosophy:** User Outcome > Feature Count, E2E Scenarios > Unit Tests, Evidence-Based Approval > Trust
**Compatible Archetypes:** Strategist, Analyst
**Best For:** Product management, task orchestration, pipeline approval
**Agents Using This:** Dũng PM (Project Manager)

**Key Behaviors:**
- Approves based on evidence (LEDGER + gate scripts + E2E tests)
- Demands E2E user scenarios, not just unit tests (PEN-001 active)
- Delegates tasks based on skill match, not just workload
- Maintains plan.md continuously (NO EXCEPTIONAL)

---

## How to Install a SOUL to an Agent

### Method 1: Reference in Agent File (Recommended)

In your agent's L2 Cache file (e.g., `agents/core/my-agent.md`):

```markdown
# My Agent — L2 Cache

Role: {Role} | Model: Sonnet

---

## 🎭 SOUL

**SOUL:** `../../agents/souls/cathedral-architect.md`

---

## ⚙️ Kỹ Năng Cốt Lõi

[Agent-specific skills and knowledge here]
```

### Method 2: CLI Installation (Future - v1.1)

```bash
# Install SOUL to existing agent
nash install-soul cathedral-architect --agent phuc-sa

# List agents using a SOUL
nash list-agents --soul paranoid-reviewer

# Update SOUL (propagates to all agents)
nash update-soul qa-champion
```

---

## SOUL File Format

Every SOUL file follows this structure:

```markdown
---
soul_id: {unique-id}
compatible_archetypes: [Archetype1, Archetype2]
core_values: [Value1 > Value2, Value3 > Value4]
---

# {SOUL Name} Soul

You are not a {generic role}.
You are **a {metaphor}** — {defining characteristic}.

## Core Philosophy

[3-5 core values with explanations]

## Adversarial Posture

**vs {Agent Type 1}:**
- [How to interact with this agent type]

**vs {Agent Type 2}:**
- [How to interact with this agent type]

## Sacred Rules / Patterns

[Non-negotiable constraints and patterns]

## Penalties to Avoid

[PEN entries to prevent]

## Winning Strategies

[WIN patterns to replicate]
```

---

## SOUL Compatibility Matrix

| SOUL | Strategist | Builder | Critic | Analyst | Operator |
|------|-----------|---------|--------|---------|----------|
| **cathedral-architect** | ✅ | ✅ | ⚠️ | ✅ | — |
| **paranoid-reviewer** | ⚠️ | — | ✅ | ✅ | — |
| **qa-champion** | — | — | ✅ | ⚠️ | ✅ |
| **speed-optimizer** | — | ✅ | — | — | ✅ |
| **product-visionary** | ✅ | — | — | ✅ | ⚠️ |

**Legend:**
- ✅ **Highly Compatible** — Natural fit, recommended pairing
- ⚠️ **Compatible with Constraints** — Works but may create tension (e.g., Critic + Cathedral = very paranoid architect)
- — **Not Recommended** — Conflicting values (e.g., Speed Optimizer + Paranoid Reviewer = internal conflict)

---

## SOUL Design Principles

### 1. Token Efficiency (<500 tokens)
Each SOUL should be concise (<500 tokens) to fit in L2 Cache alongside agent-specific knowledge.

### 2. Inline Metadata (No Separate JSON)
Metadata lives in YAML frontmatter, not separate files. Efficiency Champion wins (saves 200 tokens/agent).

### 3. Adversarial Posture Embedded
SOULs define how to interact with other agents in Nash Triad debates (no generic "be nice" platitudes).

### 4. Evidence-Based Values
Core values cite real penalties (PEN entries) and wins (WIN entries) from production experience.

### 5. Cross-Agent Consistency
Multiple agents can share same SOUL → consistent behavior across team.

---

## Extending the SOUL System

### Creating a New SOUL

1. **Identify Pattern:** Find 3+ agents with similar philosophy
2. **Extract Common Values:** What do they all enforce?
3. **Define Adversarial Posture:** How do they interact with Nash Triad partners?
4. **Cite Evidence:** Reference PEN/WIN entries from LEDGER
5. **Keep Concise:** <500 tokens, fit in L2 Cache
6. **Test Compatibility:** Install on 2+ agents, verify consistency

### SOUL Versioning

SOULs evolve as the framework learns:
- **Minor Update:** Add new PEN entry from recent failure
- **Major Update:** Change core values based on 10+ LEDGER incidents
- **Breaking Change:** Incompatible with existing agents using it

Version SOULs in filename for major changes:
- `cathedral-architect.md` (current)
- `cathedral-architect-v2.md` (breaking change)

---

## Token Savings Analysis

### Current State (5 SOULs)
- 5 SOUL files × 450 tokens avg = 2250 tokens total
- Used by 9 agents (some share SOULs)
- Total token cost: 2250 tokens (not 9 × 450 = 4050 tokens)
- **Savings: 1800 tokens (44% reduction)**

### At Scale (10 SOULs → 30 agents)
- 10 SOUL files × 450 tokens = 4500 tokens
- Without SOULs: 30 agents × 450 tokens = 13500 tokens
- **Savings: 9000 tokens (67% reduction)**

### Reuse Ratio
- Current: 9 agents / 5 SOULs = **1.8:1 ratio**
- Target: 20 agents / 5 SOULs = **4:1 ratio** (SYNTHESIS_ROADMAP.md target)

---

## Next Steps (Phase 1.1 - Week 1)

- [x] Create `agents/souls/` directory
- [x] Extract 5 SOULs from existing agents
- [ ] Update AGENT_TEMPLATE_V2.md to support SOUL references
- [ ] Add `nash install-soul <soul-id> --agent <name>` command
- [ ] Test: Multiple agents share same SOUL, changes propagate
- [ ] Measure: Token savings on 10-agent test deployment

---

## Success Criteria

1. ✅ **5 SOULs created** with <500 tokens each
2. ⏳ **Multiple agents share SOULs** (test reusability)
3. ⏳ **Update 1 SOUL → propagates to all agents** using it
4. ⏳ **Token savings verified:** >40% reduction vs embedded SOULs
5. ⏳ **Compatibility tested:** No conflicts when mixing archetypes + SOULs

---

*Nash Agent Framework v3.0 — SOUL Modularity System*
*Optimized for: Mạnh như gstack + Tiết kiệm token + Scale nhiều agent*
