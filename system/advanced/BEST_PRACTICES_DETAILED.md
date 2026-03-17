# Best Practice Agent Design - 2026 Industry Standards
## Synthesis from Top Frameworks & Production Patterns

**Sources synthesized:**
- OpenAI Agents SDK (Session Memory, Context Personalization)
- LangGraph, CrewAI, AutoGen (Multi-Agent Frameworks)
- Beam.ai (9 Agentic Workflow Patterns)
- Hatchworks, DigitalApplied (Agent Design Best Practices)
- Nash Agent Framework (Production learnings)

**Last updated**: 2026-03-16

---

## PRINCIPLE_1: Context is Fuel, Not Cargo

**Principle**: Treat tokens as a PRIMARY constraint, not an afterthought.

**Implementation:**
```
✅ DO: Load context progressively (Tier 0 → 1 → 2 → 3)
✅ DO: Cache deterministic operations (embeddings, validations)
✅ DO: Compress conversation history (recent verbatim, old summarized)
❌ DON'T: Load all skills/PENs/WINs upfront
❌ DON'T: Keep full conversation in context window
```

**Target**: 60-80% token reduction vs naive approach

---

## PRINCIPLE_2: Single Responsibility per Agent

**Principle**: Each agent should do ONE thing exceptionally well.

**Anti-pattern:**
```javascript
// ❌ BAD: God Agent
class UberAgent {
  reviewArchitecture() { ... }
  writeCode() { ... }
  runTests() { ... }
  deployProduction() { ... }
}
```

**Best practice:**
```javascript
// ✅ GOOD: Specialized Agents
class ArchitectureReviewer {
  reviewArchitecture(files) {
    // Only architecture review, nothing else
    // Context: Only RLS PENs, only arch skills
    // Token budget: 800 tokens
  }
}

class CodeImplementer {
  implement(contract) {
    // Only implementation, no design
    // Context: Only coding PENs, only language-specific skills
    // Token budget: 1200 tokens
  }
}
```

**Result**: 70% token savings, higher quality per domain

---

## PRINCIPLE_3: Adversarial Validation (Nash Triad)

**Principle**: No agent self-approves. Always Thesis → Anti-Thesis → Synthesis.

**Pattern from industry:**
- **LangGraph**: Critic nodes verify outputs
- **CrewAI**: Validation/approval nodes in workflows
- **Nash**: Every pipeline step has Challenger + Judge

**Implementation:**
```markdown
## Phase C: Execute (Thesis)
Agent: Thục (Builder)
Output: implementation code

## Phase D: Functional Verify (Anti-Thesis)
Agent: Sơn QA (Critic)
Task: Find bugs, edge cases, missing tests
Incentive: +20 points for real bugs found, -30 for lazy review

## Phase E: Synthesis
Agent: Phúc SA (Judge)
Task: Decide: Accept / Reject / Iterate
```

**Zero-sum scoring prevents collusion**: If QA approves bad code, both penalized.

---

## PRINCIPLE_4: Memory Hierarchy (3-Tier Model)

**Principle**: Store long-term memory externally, retrieve selectively.

**From OpenAI Agents SDK:**
```python
# Short-term: Session memory (last 5 messages verbatim)
session.add_message(role="user", content="Review schema")

# Long-term: External store (vector search)
notes = memory.get_relevant_notes(session_id, query="RLS policy")
```

**Nash Implementation:**
```
L2 Cache (Always Loaded):
  - Agent role + model: 50 tokens
  - Active PENs (P0-P1 only): 150 tokens
  - Skill references (metadata): 50 tokens
  Total: 250 tokens

RAM (On-Demand):
  - Skill content: Load when keyword detected
  - PEN details: Load when error matches pattern
  - WIN patterns: Load when success detected
  Total: 500-2000 tokens (conditional)

HDD (External DB):
  - All PEN/WIN history
  - Full skill modules
  - Past task transcripts
  Retrieved: Top 3 via vector search
```

**Token Savings**: 85% (3K → 450 tokens idle)

---

## PRINCIPLE_5: Clear Boundaries & Interfaces

**Principle**: Agents communicate via well-defined contracts, not shared mutable state.

**Anti-pattern:**
```javascript
// ❌ BAD: Shared mutable state
let globalState = { files: [], errors: [] };

architectAgent.review(globalState);  // Mutates
codeAgent.implement(globalState);    // Reads stale data
```

**Best practice:**
```javascript
// ✅ GOOD: Immutable contracts
const archReview = await architectAgent.review({
  files: ['schema.prisma'],
  mode: 'RLS_VALIDATION'
});

const implementation = await codeAgent.implement({
  contract: archReview.approved_contract,
  constraints: archReview.pen_constraints  // Immutable
});
```

**From Nash**: CONTRACT_DRAFT.md serves as immutable interface between pipeline stages.

---

## PATTERN_1: ReAct (Reasoning + Action)

**What**: Brief reasoning → Immediate action → Repeat

**When to use**:
- Fast-moving tasks (triage, routing, support)
- Real-time decision-making
- Exploratory workflows

**Example:**
```
Observation: User asks "Review my schema for RLS issues"
Thought: Need to check schema.prisma file exists
Action: Read("schema.prisma")
---
Observation: File has 3 tables, checking for RLS policies
Thought: Tables have tenant_id but missing NOBYPASSRLS
Action: Report PEN-002 violation
```

**Trade-offs**:
- ✅ Fast, responsive
- ❌ Can loop endlessly (add stop conditions!)
- ❌ No upfront planning

**Nash Usage**: Hotfix pipeline (Pipeline 6)

---

## PATTERN_2: Plan-and-Execute

**What**: Plan ALL steps upfront → Execute sequentially

**When to use**:
- Complex multi-step tasks
- When order matters
- When cost of failure is high

**Example:**
```
Plan Phase:
  1. Read CONTRACT_DRAFT.md
  2. Validate 6 sections (API, DTO, Mock, Errors, Events, Idempotency)
  3. Call Mộc to challenge design
  4. Synthesis decision
  5. Update plan.md

Execute Phase:
  [Run steps 1-5 in order, no deviation]
```

**Trade-offs**:
- ✅ Clear, auditable
- ✅ Predictable token usage
- ❌ Slower than ReAct
- ❌ Can't adapt mid-execution

**Nash Usage**: Architecture pipeline (Pipeline 2)

---

## PATTERN_3: Critic / Reflection

**What**: Agent reviews its OWN output before finalizing

**When to use**:
- Writing, summarization
- Design recommendations
- Anywhere accuracy > speed

**Example:**
```
Draft: [Agent writes ARCHITECTURE.md]
Critic: "Wait, missing data flow diagram. Add it."
Revised: [Agent adds diagram]
Critic: "Good. Now check RLS section."
Final: [Agent verifies RLS, approves]
```

**Trade-offs**:
- ✅ Higher quality output
- ❌ 2x token cost (draft + review)
- ❌ 2x latency

**Nash Usage**: NOT USED (we use separate Critic agent instead - Nash Triad)

**Why**: Self-review is weaker than adversarial review. Nash prefers external Critic.

---

## PATTERN_4: Multi-Agent Debate

**What**: Multiple agents argue, best answer wins

**When to use**:
- Unclear right answer
- Need diverse perspectives
- High-stakes decisions

**Example (from AutoGen):**
```
Agent A (Optimist): "This architecture scales to 1M users"
Agent B (Pessimist): "No, N+1 query will kill DB at 10K users"
Agent C (Judge): "B is right. Require pagination + caching."
```

**Trade-offs**:
- ✅ Catches blind spots
- ❌ Expensive (3x tokens)
- ❌ Slow (sequential debates)

**Nash Usage**: Phúc SA (Thesis) + Mộc (Anti-Thesis) + Xuân (Synthesis)

---

## PATTERN_5: Hierarchical Planning

**What**: Break task into sub-tasks, delegate to specialists

**When to use**:
- Large complex tasks (>30 SP)
- When sub-tasks are independent
- Need parallel execution

**Example:**
```
Main Agent: "Review full system for deployment"
  ├─ Sub-Agent 1: "Security scan (Ngữ)"
  ├─ Sub-Agent 2: "Performance test (Nam)"
  ├─ Sub-Agent 3: "Compliance check (Xuân)"
  └─ Synthesize: Dũng PM aggregates results
```

**Trade-offs**:
- ✅ Parallel execution (fast)
- ✅ Specialized context per sub-agent
- ❌ Coordination overhead
- ❌ Need robust sub-agent protocol

**Nash Usage**: Pipeline orchestration (Dũng PM delegates to specialized agents)

---

## PATTERN_6: Tool-Use Chains

**What**: Agent calls tools sequentially to build up knowledge

**When to use**:
- Need external data (APIs, databases, grep)
- Deterministic operations
- Knowledge retrieval

**Example:**
```
Agent: "Check if PostgreSQL has RLS violations"
Tool 1: Read("schema.prisma")
Tool 2: Grep("NOBYPASSRLS")
Tool 3: VectorDB.query("RLS best practices")
Agent: "Found PEN-002 violation. No NOBYPASSRLS role."
```

**Trade-offs**:
- ✅ Grounded in real data
- ✅ Transparent (see exact tool calls)
- ❌ Slow (sequential tool calls)
- ❌ Tool failures break chain

**Nash Usage**: Every agent uses tools (Read, Write, Grep, Task)

---

## PATTERN_7: Human-in-the-Loop

**What**: Agent asks human for approval/input at key decision points

**When to use**:
- High-stakes decisions (deploy to prod)
- Ambiguous requirements
- Compliance/legal gates

**Example:**
```
Agent: "I found 9 HIGH security issues. Fix all?"
Human: "No, #3 and #7 are false positives. Fix the rest."
Agent: [Fixes 1,2,4,5,6,8,9 only]
```

**Trade-offs**:
- ✅ Safety (human oversight)
- ✅ Handles ambiguity well
- ❌ Slow (human latency)
- ❌ Breaks automation

**Nash Usage**: Gates 5-7 require human approval for deployment

---

## PATTERN_8: Iterative Refinement

**What**: Agent loops: Generate → Evaluate → Refine until criteria met

**When to use**:
- Optimization problems
- Gradual improvement needed
- "Good enough" is subjective

**Example:**
```
Iteration 1: Generate SQL query → Slow (2s) → Refine
Iteration 2: Add index → Fast (200ms) → Meets SLA ✓
```

**Trade-offs**:
- ✅ Converges to quality
- ❌ Unbounded iterations (set max!)
- ❌ Expensive (N iterations × tokens)

**Nash Usage**: Agent Sharpener (baseline → iterate → pass 90%)

---

## PATTERN_9: Dynamic Routing

**What**: Route task to specialist based on content analysis

**When to use**:
- Heterogeneous task types
- Need optimal specialist
- Multi-domain system

**Example (from Nash MoE Router):**
```
Task: "Add user login feature"
Router: [12-dimension audit]
  - Clarity: 80% (spec exists)
  - Complexity: 15 SP (medium)
  - Risk: Medium
Route: Pipeline 3 (Coding) with HOLD mode
```

**Trade-offs**:
- ✅ Optimal agent selection
- ✅ Token-efficient (only load relevant agent)
- ❌ Router itself costs tokens
- ❌ Misrouting = wasted work

**Nash Usage**: MIXTURE_OF_EXPERTS_ROUTER.md (core innovation)

---

## Framework Comparison (2026 Landscape)

### When to use each framework:

| Framework | Best For | Strengths | Weaknesses |
|-----------|----------|-----------|------------|
| **LangGraph** | Complex workflows with branching | Graph-based flexibility, conditional logic | Steep learning curve |
| **CrewAI** | Role-based teams, rapid prototyping | Intuitive, fast time-to-production | Less flexible than LangGraph |
| **AutoGen (AG2)** | Conversational agents, human-in-loop | Natural language, enterprise features | Overkill for simple tasks |
| **OpenAI Agents SDK** | Session management, personalization | Official support, memory management | New (March 2025 release) |
| **Nash Framework** | Adversarial validation, multi-pipeline | Nash Triad (zero hallucinations), PEN/WIN learning | Custom (not open-source framework) |

### Hybrid Approaches (Production Reality):

```
LangGraph (orchestration layer)
  ├─ CrewAI (task execution teams)
  ├─ AutoGen (human collaboration)
  └─ OpenAI SDK (memory management)
```

**Nash Hybrid:**
```
Nash MoE Router (orchestration)
  ├─ gstack skills (specialized workflows)
  ├─ Nash Triad (validation)
  └─ SQLite + Vector DB (memory)
```

---

## BEST_PRACTICE_1: Verification & Guardrails

**Industry consensus**: Never trust agent output in high-stakes domains.

**Patterns:**
- **Fact-checking agents** (validate claims against sources)
- **Critic agents** (question assertions)
- **Rule-based validators** (hard constraints)
- **Human review gates** (medical, legal, finance)

**Nash Implementation:**
```
Phase D: Functional Verify (Sơn QA)
  → Run tests, check coverage, validate logic

Phase E: Non-Functional Verify (Ngữ Security)
  → Security scan, secrets check, compliance

Phase F: Cross-Cutting (Xuân)
  → Contract validation, API consistency
```

**Key Insight**: As of 2026, treat agent outputs with healthy skepticism.

---

## BEST_PRACTICE_2: Clear SLAs & Budget Limits

**Principle**: Define performance constraints upfront.

**Examples:**
```yaml
# Task SLA
task:
  max_duration: 30 minutes
  max_tokens: 15000
  max_tool_calls: 50
  timeout_action: escalate_to_human

# Quality SLA
quality:
  min_test_coverage: 80%
  max_cyclomatic_complexity: 10
  required_gates: [build, test, security]
```

**Nash Implementation:**
```javascript
// Cognitive mode budgets
EXPANSION: { max: 30K, target: 20K, min: 15K }
HOLD:      { max: 15K, target: 12K, min: 10K }
REDUCTION: { max: 10K, target: 7K,  min: 5K  }

// Hard limit enforcement
if (tokens_used > budget.max) {
  throw new Error("Token budget exceeded");
}
```

---

## BEST_PRACTICE_3: Transparent Observability

**Requirements:**
- Full transcript logging (every tool call)
- Token usage tracking (per agent, per task)
- Latency metrics (P50, P95, P99)
- Error rates & retry patterns

**Nash Observability Stack:**
```
Prometheus Metrics:
  - nash_tasks_total{status}
  - nash_task_duration_seconds
  - nash_tokens_used
  - nash_agents_active

Grafana Dashboards:
  - Task Overview (completion rate, duration)
  - Agent Activity (utilization, errors)
  - Token Usage (efficiency, budget tracking)
  - Token Quota (Claude Pro 45 msg/5h limit)

SQLite Logs:
  - Full transcripts in tasks table
  - Tool call audit trail
  - LEDGER scoring history
```

---

## BEST_PRACTICE_4: Fallbacks & Graceful Degradation

**Principle**: Never fail catastrophically. Always have Plan B.

**Patterns:**
```
Vector DB down?
  → Fallback to grep

LLM API error?
  → Retry with exponential backoff
  → Switch to smaller model
  → Escalate to human

Tool timeout?
  → Log warning
  → Continue with partial data
  → Mark task as "needs_review"
```

**Nash Implementation:**
```javascript
// Vector DB wrapper (system/vector_db_wrapper.js)
async function queryPENEntries(query) {
  try {
    return await qdrant.search(query);  // Try vector search
  } catch (error) {
    console.warn('Qdrant failed, falling back to grep');
    return await grepFallback(query);   // Graceful degradation
  }
}
```

---

## BEST_PRACTICE_5: Human Review in High-Stakes Domains

**Domains requiring human oversight:**
- Medical diagnosis / treatment plans
- Legal advice / contract review
- Financial reporting / trading decisions
- Code deployment to production
- Policy decisions affecting users

**Pattern:**
```
Agent: [Generates deployment plan]
Gate: "This affects 10K users. Require approval?"
Human: "Approved, but deploy to 1% first (canary)"
Agent: [Executes canary deployment]
Agent: "Canary success rate: 99.9%. Proceed to 100%?"
Human: "Approved"
```

**Nash Gates:**
- Gate 5 (Security): Automated scan → Human review
- Gate 6 (Staging): Automated tests → Human smoke test
- Gate 7 (Production): Human approval required

---

## NASH_INNOVATION_1: PEN/WIN Learning System

**Problem**: Agents repeat mistakes.
**Solution**: Immutable memory of failures (PEN) and successes (WIN).

```markdown
## PEN-001 | 2026-02-28 | T2_27
- Sự việc: Không attach files khi gọi Mộc → 9 false issues
- Nguyên tắc: PHẢI attach đủ file khi gọi reviewer
- Status: ACTIVE → FIXED (after sharpening)
```

**Auto-sharpening**: Convert PEN → regression test → fix → mark FIXED

**Industry Parallel**: None. Most frameworks lack persistent failure memory.

---

## NASH_INNOVATION_2: Zero-Sum Scoring (Game Theory)

**Problem**: Agents have incentive to collude or be lazy.
**Solution**: Zero-sum rewards/penalties.

```
Builder creates bug: -15 points
QA catches bug: +15 points
QA misses bug: -30 points (M1 multiplier)
```

**Result**: No incentive to collude (both lose). Strong incentive to find REAL bugs.

**Industry Parallel**: LangGraph has critic nodes, but no scoring system.

---

## NASH_INNOVATION_3: Cognitive Mode Switching

**Problem**: Using same token budget for trivial vs complex tasks.
**Solution**: Adaptive budgets based on task complexity.

```
EXPANSION (new domain):  15K-30K tokens
HOLD (critical):         10K-15K tokens
REDUCTION (simple impl): 5K-10K tokens
```

**Token Savings**: 40-60% on routine tasks

**Industry Parallel**: None. Most frameworks use fixed budgets.

---

## NASH_INNOVATION_4: MoE Router (12-Dimension Audit)

**Problem**: Sending all tasks through same pipeline.
**Solution**: Audit task → route to optimal pipeline.

**12 Dimensions:**
- Clarity, Complexity, Risk, Scope, Urgency
- Dependencies, Tech Debt, Test Coverage, Documentation
- Team Capacity, Historical Data, Business Value

**Route to 1 of 6 pipelines**: Requirements / Architecture / Coding / Testing / Security / Hotfix

**Industry Parallel**: CrewAI has routing, but simpler (role-based, not multi-dimensional).

---

## Recommended Implementation Order

### Phase 1: Foundation (Week 1)
1. ✅ Single-responsibility agents
2. ✅ 3-tier memory (L2/RAM/HDD)
3. ✅ Basic tool-use chains
4. ✅ Token budget enforcement

### Phase 2: Validation (Week 2)
1. ✅ Adversarial review (Thesis/Anti/Synth)
2. ✅ Zero-sum scoring
3. ✅ PEN/WIN system
4. ✅ Quality gates

### Phase 3: Optimization (Week 3)
1. ✅ Progressive loading
2. ✅ Conversation compression
3. ✅ Vector DB + grep fallback
4. ✅ Response caching

### Phase 4: Scale (Week 4)
1. ✅ MoE routing
2. ✅ Hierarchical planning
3. ✅ Observability dashboards
4. ✅ Auto-sharpening

---

## Common Anti-Patterns (What NOT to Do)

### ANTI_PATTERN_1: God Agent
```
One agent does everything → 20K token context → slow, unfocused
```
**Fix**: Specialize agents, delegate sub-tasks

---

### ANTI_PATTERN_2: Shared Mutable State
```
Multiple agents mutate global state → race conditions, stale data
```
**Fix**: Immutable contracts, message passing

---

### ANTI_PATTERN_3: No Stop Conditions
```
ReAct loop runs forever → infinite token burn
```
**Fix**: Max iterations (e.g., 10 max), timeout (30 min), stuck detection

---

### ANTI_PATTERN_4: Trusting Agent Output Blindly
```
Agent says "tests pass" → Deploy → Production breaks
```
**Fix**: Always run ACTUAL tests, not just "agent claims tests pass"

---

### ANTI_PATTERN_5: No Token Tracking
```
"Why is this task so expensive?" → No visibility into token usage
```
**Fix**: Prometheus metrics, Grafana dashboards, per-agent budgets

---

### ANTI_PATTERN_6: Loading Everything Upfront
```
Agent.md = 15K tokens (all PENs, all skills, all examples)
```
**Fix**: Progressive disclosure (Tier 0 → 1 → 2 → 3)

---

## References & Further Reading

**Frameworks:**
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [CrewAI Docs](https://docs.crewai.com/)
- [AutoGen (AG2)](https://microsoft.github.io/autogen/)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)

**Patterns:**
- [Beam.ai: 9 Agentic Workflow Patterns](https://beam.ai/agentic-insights/the-9-best-agentic-workflow-patterns-to-scale-ai-agents-in-2026)
- [ByteByteGo: AI Agentic Workflow Patterns](https://blog.bytebytego.com/p/top-ai-agentic-workflow-patterns)
- [Hatchworks: Agent Design Best Practices](https://hatchworks.com/blog/ai-agents/ai-agent-design-best-practices/)

**Context Management:**
- [OpenAI Cookbook: Session Memory](https://cookbook.openai.com/examples/agents_sdk/session_memory)
- [OpenAI Cookbook: Context Personalization](https://developers.openai.com/cookbook/examples/agents_sdk/context_personalization/)
- [Anthropic: Context Window Management](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)

**Nash Framework:**
- [CLAUDE.md](../../CLAUDE.md) - Framework overview
- [TOKEN_OPTIMIZATION_LAYERS.md](TOKEN_OPTIMIZATION_LAYERS.md) - Token optimization strategies
- [MIXTURE_OF_EXPERTS_ROUTER.md](../MIXTURE_OF_EXPERTS_ROUTER.md) - MoE routing logic
- [NASH.md](../NASH.md) - Nash Equilibrium rules

---

**Last Updated**: 2026-03-16
**Version**: 1.0.0
**Status**: Production-ready synthesis from 10+ sources
