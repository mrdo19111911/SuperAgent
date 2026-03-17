# Best Practices Quick Ref

> **Purpose:** Quick lookup for agent design (90% use cases)
> **Details:** [ram/advanced/best_practices_details.md](../../ram/advanced/best_practices_details.md)

---

## Core Principles (5 Non-Negotiables)

1. **Context = Fuel, Not Cargo** - Load progressively (Tier 0→3), compress history. Target: 60-80% token reduction
2. **Single Responsibility** - 1 agent = 1 thing. Bounded context (800-1200 tokens). Result: 70% token savings
3. **Adversarial Validation (Nash Triad)** - No self-approval. Thesis→Anti-Thesis→Synthesis + zero-sum scoring
4. **Memory Hierarchy (3-Tier)** - L2 Cache (250T) → RAM (500-2K) → HDD (vector search). Savings: 85%
5. **Clear Boundaries** - Immutable contracts (CONTRACT_DRAFT.md), no shared mutable state

---

## 9 Production Workflow Patterns (2026)

| Pattern | Use When | Nash Example | Trade-off |
|---------|----------|--------------|-----------|
| **ReAct** | Fast decisions, triage | Hotfix (Pipeline 6) | Fast but can loop |
| **Plan-Execute** | Multi-step, order matters | Architecture (P2) | Clear but slow |
| **Critic/Reflection** | Quality > speed | NOT USED (prefer Nash) | 2x tokens |
| **Multi-Agent Debate** | Unclear answer, high stakes | Phúc+Mộc+Xuân | 3x tokens |
| **Hierarchical** | Large task (>30 SP), parallel | Dũng delegates | Coordination overhead |
| **Tool-Use Chains** | External data, deterministic | All agents | Tool failures break |
| **Human-in-Loop** | High stakes, compliance | Gates 5-7 | Human latency |
| **Iterative Refine** | Optimization, gradual | Agent Sharpener | Unbounded iterations |
| **Dynamic Routing** | Multi-domain, heterogeneous | MoE Router (12D) | Router token cost |

---

## Production Best Practices (2026)

1. **Verification** - Never trust agent output. Fact-check + critic + validator + human gates (D→E→F phases)
2. **SLAs & Budgets** - max_duration (30 min), max_tokens (15K), max_tool_calls (50), hard limits
3. **Observability** - Log transcripts, track tokens/latency/errors. Stack: Prometheus + Grafana + SQLite
4. **Fallbacks** - Always Plan B. Vector DB down → grep. LLM error → retry → smaller model → human
5. **Human Review** - Required for: medical, legal, financial, prod deploy, policy decisions

---

## Nash Unique Innovations

1. **PEN/WIN System** - Immutable failure/success memory, vector search, auto-sharpening
2. **Zero-Sum Scoring** - Builder bug: -15. QA catch: +15. QA miss: -30 (M1). No collusion
3. **Cognitive Mode** - EXPANSION (15-30K), HOLD (10-15K), REDUCTION (5-10K). Savings: 40-60%
4. **MoE Router** - 12-dimension audit → 6 pipelines. Industry: CrewAI has simpler routing

---

## Anti-Patterns (DON'T)

1. **God Agent** - Fix: Specialize
2. **Shared Mutable State** - Fix: Immutable contracts
3. **No Stop Conditions** - Fix: Max iterations (10), timeout (30 min)
4. **Trust Blindly** - Fix: Run ACTUAL tests
5. **No Token Tracking** - Fix: Prometheus metrics
6. **Load Everything** - Fix: Progressive disclosure

---

**Full details:** [ram/advanced/best_practices_details.md](../../ram/advanced/best_practices_details.md)
