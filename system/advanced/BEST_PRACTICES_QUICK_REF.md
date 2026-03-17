# Best Practice Agent Design - Quick Reference

**Purpose:** Quick lookup for common agent design questions (covers 90% of use cases).
**For full details:** See `BEST_PRACTICES_DETAILED.md`

**Last updated:** 2026-03-16

---

## Core Principles (The Non-Negotiables)

### 1. Context is Fuel, Not Cargo
Treat tokens as a PRIMARY constraint. Load context progressively (Tier 0→1→2→3), cache deterministic operations, compress conversation history (recent verbatim, old summarized). NEVER load all skills/PENs/WINs upfront or keep full conversation in context. Target: 60-80% token reduction vs naive approach.

### 2. Single Responsibility per Agent
Each agent does ONE thing exceptionally well. Avoid "God Agents" that review architecture, write code, run tests, and deploy. Instead, create specialized agents (ArchitectureReviewer, CodeImplementer) each with bounded context and token budgets (800-1200 tokens). Result: 70% token savings, higher quality per domain.

### 3. Adversarial Validation (Nash Triad)
No agent self-approves. Always Thesis→Anti-Thesis→Synthesis pattern. Every pipeline step has Challenger + Judge with zero-sum scoring to prevent collusion (if QA approves bad code, both penalized). Follows industry patterns from LangGraph critic nodes, CrewAI validation nodes.

### 4. Memory Hierarchy (3-Tier Model)
Store long-term memory externally, retrieve selectively. L2 Cache (250 tokens): Agent role + active P0-P1 PENs + skill metadata. RAM (500-2000 tokens): Load skill content/PEN details when keyword detected. HDD (External DB): All history retrieved via vector search (top 3). Token Savings: 85% (3K→450 tokens idle).

### 5. Clear Boundaries & Interfaces
Agents communicate via immutable contracts, not shared mutable state. Use CONTRACT_DRAFT.md as immutable interface between pipeline stages. Each agent receives frozen input and produces new output without side effects. Prevents race conditions and stale data.

---

## The 9 Production Workflow Patterns (2026)

### Pattern 1: ReAct (Reasoning + Action)
Brief reasoning→Immediate action→Repeat. Use for fast-moving tasks (triage, routing, support), real-time decisions, exploratory workflows. Trade-offs: Fast/responsive but can loop endlessly (add stop conditions). Nash Usage: Hotfix pipeline (Pipeline 6).

### Pattern 2: Plan-and-Execute
Plan ALL steps upfront→Execute sequentially. Use for complex multi-step tasks, when order matters, when cost of failure is high. Trade-offs: Clear/auditable/predictable but slower than ReAct and can't adapt mid-execution. Nash Usage: Architecture pipeline (Pipeline 2).

### Pattern 3: Critic / Reflection
Agent reviews its OWN output before finalizing. Use for writing, summarization, design recommendations, anywhere accuracy > speed. Trade-offs: Higher quality but 2x token cost and 2x latency. Nash Usage: NOT USED - we prefer separate Critic agent (Nash Triad) over self-review.

### Pattern 4: Multi-Agent Debate
Multiple agents argue, best answer wins. Use when unclear right answer, need diverse perspectives, high-stakes decisions. Trade-offs: Catches blind spots but expensive (3x tokens) and slow (sequential debates). Nash Usage: Phúc SA (Thesis) + Mộc (Anti-Thesis) + Xuân (Synthesis).

### Pattern 5: Hierarchical Planning
Break task into sub-tasks, delegate to specialists. Use for large complex tasks (>30 SP), when sub-tasks are independent, need parallel execution. Trade-offs: Parallel execution (fast) + specialized context but coordination overhead + need robust sub-agent protocol. Nash Usage: Pipeline orchestration (Dũng PM delegates).

### Pattern 6: Tool-Use Chains
Agent calls tools sequentially to build up knowledge. Use when need external data (APIs, databases, grep), deterministic operations, knowledge retrieval. Trade-offs: Grounded in real data + transparent but slow (sequential calls) and tool failures break chain. Nash Usage: Every agent uses tools (Read, Write, Grep, Task).

### Pattern 7: Human-in-the-Loop
Agent asks human for approval/input at key decision points. Use for high-stakes decisions (deploy to prod), ambiguous requirements, compliance/legal gates. Trade-offs: Safety (human oversight) + handles ambiguity but slow (human latency) and breaks automation. Nash Usage: Gates 5-7 require human approval for deployment.

### Pattern 8: Iterative Refinement
Loop: Generate→Evaluate→Refine until criteria met. Use for optimization problems, gradual improvement needed, "good enough" is subjective. Trade-offs: Converges to quality but unbounded iterations (set max) and expensive (N iterations × tokens). Nash Usage: Agent Sharpener (baseline→iterate→pass 90%).

### Pattern 9: Dynamic Routing
Route task to specialist based on content analysis. Use for heterogeneous task types, need optimal specialist, multi-domain system. Trade-offs: Optimal agent selection + token-efficient but router itself costs tokens and misrouting = wasted work. Nash Usage: MIXTURE_OF_EXPERTS_ROUTER.md (core innovation with 12-dimension audit).

---

## Production Best Practices (2026 Standards)

### 1. Verification & Guardrails
Never trust agent output in high-stakes domains. Use fact-checking agents, critic agents, rule-based validators, human review gates. Nash Implementation: Phase D (Functional Verify - Sơn QA) → Phase E (Non-Functional Verify - Ngữ Security) → Phase F (Cross-Cutting - Xuân). Key Insight: As of 2026, treat agent outputs with healthy skepticism.

### 2. Clear SLAs & Budget Limits
Define performance constraints upfront: max_duration (30 min), max_tokens (15K), max_tool_calls (50), timeout_action (escalate_to_human). Nash budgets: EXPANSION (15K-30K), HOLD (10K-15K), REDUCTION (5K-10K). Enforce hard limits - throw error if exceeded.

### 3. Transparent Observability
Log full transcripts (every tool call), track token usage (per agent, per task), measure latency (P50, P95, P99), track error rates & retry patterns. Nash stack: Prometheus metrics (tasks_total, task_duration, tokens_used, agents_active), Grafana dashboards (completion rate, duration, efficiency, quota tracking), SQLite logs (full transcripts, tool call audit, LEDGER scoring).

### 4. Fallbacks & Graceful Degradation
Never fail catastrophically. Always have Plan B. Vector DB down → fallback to grep. LLM API error → retry with exponential backoff → switch to smaller model → escalate to human. Tool timeout → log warning → continue with partial data → mark task as "needs_review".

### 5. Human Review in High-Stakes Domains
Require human oversight for: medical diagnosis/treatment, legal advice/contracts, financial reporting/trading, code deployment to production, policy decisions affecting users. Nash Gates: Gate 5 (Security: automated scan→human review), Gate 6 (Staging: automated tests→human smoke test), Gate 7 (Production: human approval required).

---

## Nash Framework Unique Innovations

### 1. PEN/WIN Learning System
Immutable memory of failures (PEN) and successes (WIN). Agents query vector DB for relevant past mistakes before acting. Auto-sharpening: Convert PEN→regression test→fix→mark FIXED. Industry Parallel: None. Most frameworks lack persistent failure memory.

### 2. Zero-Sum Scoring (Game Theory)
Builder creates bug: -15 points. QA catches bug: +15 points. QA misses bug: -30 points (M1 multiplier). Result: No incentive to collude (both lose), strong incentive to find REAL bugs. Industry Parallel: LangGraph has critic nodes but no scoring system.

### 3. Cognitive Mode Switching
Adaptive budgets based on task complexity. EXPANSION (new domain: 15K-30K tokens), HOLD (critical: 10K-15K tokens), REDUCTION (simple impl: 5K-10K tokens). Token Savings: 40-60% on routine tasks. Industry Parallel: None. Most frameworks use fixed budgets.

### 4. MoE Router (12-Dimension Audit)
Audit task across 12 dimensions (Clarity, Complexity, Risk, Scope, Urgency, Dependencies, Tech Debt, Test Coverage, Documentation, Team Capacity, Historical Data, Business Value) → route to 1 of 6 pipelines (Requirements / Architecture / Coding / Testing / Security / Hotfix). Industry Parallel: CrewAI has routing but simpler (role-based, not multi-dimensional).

---

## Common Anti-Patterns (What NOT to Do)

1. **God Agent:** One agent does everything → 20K token context → slow, unfocused. FIX: Specialize agents, delegate sub-tasks.
2. **Shared Mutable State:** Multiple agents mutate global state → race conditions, stale data. FIX: Immutable contracts, message passing.
3. **No Stop Conditions:** ReAct loop runs forever → infinite token burn. FIX: Max iterations (10 max), timeout (30 min), stuck detection.
4. **Trusting Agent Output Blindly:** Agent says "tests pass" → Deploy → Production breaks. FIX: Always run ACTUAL tests, not just "agent claims tests pass".
5. **No Token Tracking:** "Why is this task so expensive?" → No visibility. FIX: Prometheus metrics, Grafana dashboards, per-agent budgets.
6. **Loading Everything Upfront:** Agent.md = 15K tokens (all PENs, all skills, all examples). FIX: Progressive disclosure (Tier 0→1→2→3).

---

**For detailed explanations, code examples, and implementation guidance, see `BEST_PRACTICES_DETAILED.md`**
