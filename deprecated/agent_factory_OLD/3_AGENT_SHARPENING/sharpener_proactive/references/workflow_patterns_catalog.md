# Workflow Patterns Catalog
## 9 Proven Agentic Patterns for Nash Framework

**Source:** BEST_PRACTICE_AGENT.md (synthesized from Beam.ai, LangGraph, CrewAI, AutoGen)
**Purpose:** Reference guide for mapping agents to optimal workflow patterns
**Last Updated:** 2026-03-16

---

## Pattern Selection Decision Tree

```
START: What is the agent's primary task?

├─ Task requires multiple tools/APIs?
│  ├─ Sequence known upfront? → Pattern 6: Tool-Use Chains
│  └─ Sequence depends on results? → Pattern 1: ReAct
│
├─ Task is complex and divisible?
│  ├─ Can delegate to specialists? → Pattern 5: Hierarchical Planning
│  └─ Requires sequential steps? → Pattern 2: Plan-and-Execute
│
├─ Task requires high quality/correctness?
│  ├─ Single perspective sufficient? → Pattern 3: Critic/Reflection
│  └─ Multiple perspectives needed? → Pattern 4: Multi-Agent Debate
│
├─ Task is creative/exploratory?
│  ├─ Iterative improvement needed? → Pattern 8: Iterative Refinement
│  └─ Best approach unclear upfront? → Pattern 1: ReAct
│
├─ Task has high stakes (production, security)?
│  └─ → Pattern 7: Human-in-the-Loop
│
└─ Agent handles diverse task types?
   └─ → Pattern 9: Dynamic Routing (MoE)
```

---

## Pattern 1: ReAct (Reasoning + Action)

### Description
Agent alternates between reasoning about what to do next and taking actions, adjusting strategy based on results.

### Structure
```
Loop (max N iterations):
  1. Observe: Current state + history
  2. Think: What should I do next? Why?
  3. Act: Execute tool/action
  4. Observe: Result of action
  5. Repeat until: Goal achieved OR max iterations OR stuck
```

### When to Use
- ✅ Task requires dynamic decision-making (path unknown upfront)
- ✅ External API calls with unpredictable responses
- ✅ Debugging/investigation (don't know root cause yet)
- ✅ Exploratory research

### When NOT to Use
- ❌ Task has deterministic steps (use Plan-and-Execute)
- ❌ Quality-critical (ReAct may miss edge cases - use Critic/Reflection)
- ❌ Token budget tight (loops are expensive)

### Token Cost
**Medium:** 3-10 loops typical, ~2K tokens/loop = 6-20K total

### Nash Agents Using This Pattern
- **Tùng Diag** (12-dimension audit - explores codebase dynamically)
- **Conan** (Requirements analysis - iterative questioning)

### Example (Debugging)
```
Iteration 1:
  Observe: Test failing with "500 Internal Server Error"
  Think: Need to check server logs first
  Act: grep "ERROR" logs/server.log
  Result: Found "Database connection timeout"

Iteration 2:
  Observe: DB timeout error found
  Think: Check database connectivity
  Act: psql -h db.example.com -U user -c "SELECT 1"
  Result: Connection refused

Iteration 3:
  Observe: DB not reachable
  Think: Check if DB service is running
  Act: systemctl status postgresql
  Result: Service is stopped
  → Goal achieved: Root cause = DB service down
```

### Industry Examples
- **LangGraph:** ReAct agent template
- **LangChain:** ReAct executor
- **AutoGen:** Conversational ReAct pattern

### Optimization Tips
1. Set **max_iterations** (e.g., 10) to prevent infinite loops
2. Add **stuck detection** (if last 3 actions identical, break)
3. Cache deterministic actions (e.g., file reads)
4. Use **early exit** conditions (don't loop if goal obviously achieved)

---

## Pattern 2: Plan-and-Execute

### Description
Agent creates a complete plan upfront, then executes steps sequentially without replanning (unless plan fails).

### Structure
```
Phase 1: Planning
  Input: Task description
  Output: Structured plan (steps 1-N)

Phase 2: Execution
  For each step in plan:
    Execute step
    Verify result
    If failed: Replan (optional) OR abort
```

### When to Use
- ✅ Task has predictable structure (e.g., architecture design, CRUD implementation)
- ✅ Steps are deterministic (outcome known before execution)
- ✅ Token budget is tight (plan once, execute once)
- ✅ Parallelizable steps (execute concurrently)

### When NOT to Use
- ❌ Task requires exploration (path unknown upfront - use ReAct)
- ❌ Steps depend heavily on previous results (use ReAct or Hierarchical)
- ❌ High uncertainty (use Critic/Reflection or Multi-Agent Debate)

### Token Cost
**Low:** Single planning phase (~2K tokens) + execution (~3K) = 5K total

### Nash Agents Using This Pattern (Recommended)
- **Phúc SA** (Software Architect - architecture is deterministic)
- **Quang** (Backend - schema design is structured)
- **Thục** (Builder - implementation from contracts)

### Example (Architecture Design)
```
Phase 1: Planning
  Input: "Design REST API for user management"
  Plan:
    1. Define API contracts (endpoints, DTOs)
    2. Design database schema
    3. Specify error handling
    4. Define idempotency rules
    5. List non-functional requirements

Phase 2: Execution
  Step 1: Executed → CONTRACT_DRAFT.md (API section)
  Step 2: Executed → CONTRACT_DRAFT.md (DB section)
  Step 3: Executed → CONTRACT_DRAFT.md (Error section)
  Step 4: Executed → CONTRACT_DRAFT.md (Idempotency section)
  Step 5: Executed → CONTRACT_DRAFT.md (NFR section)
  → Plan complete, no replanning needed
```

### Industry Examples
- **LangGraph:** Plan-and-Execute graph
- **CrewAI:** Sequential crew with planning step
- **OpenAI Agents SDK:** Session-based planning

### Optimization Tips
1. **Batch steps:** Parallelize independent steps (e.g., DB schema + API contracts)
2. **Reuse plans:** Cache plans for similar tasks (e.g., CRUD APIs)
3. **Plan validation:** Have Anti-Thesis review plan BEFORE execution
4. **Adaptive replanning:** Only replan if step fails (don't replan after every step)

### Token Savings vs ReAct
ReAct: 10 loops × 2K = **20K tokens**
Plan-and-Execute: 2K plan + 3K execute = **5K tokens**
**Savings: 75%** 🏆

---

## Pattern 3: Critic/Reflection

### Description
Agent produces output, then critiques its own work (or external critic reviews), then improves based on feedback. Iterates until quality threshold met.

### Structure
```
Loop (max M iterations):
  1. Build: Agent produces artifact (code, design, etc.)
  2. Critique: Critic reviews artifact (find flaws, edge cases)
  3. Reflect: Builder considers critique
  4. Improve: Builder updates artifact
  5. Repeat until: No major flaws OR max iterations
```

### When to Use
- ✅ Quality is paramount (production code, security reviews)
- ✅ Subtle bugs expected (edge cases, race conditions)
- ✅ Nash Triad validation (Thesis → Anti-Thesis → Synthesis)
- ✅ Code reviews, architecture reviews

### When NOT to Use
- ❌ Simple tasks (overkill for trivial work)
- ❌ Token budget tight (2x cost due to critique loop)
- ❌ Fast iteration needed (reflection is slow)

### Token Cost
**High:** 2-3 iterations × (Build 3K + Critique 2K) = **10-15K total**

### Nash Agents Using This Pattern
- **Mộc** (Critic - core role is adversarial review)
- **Sơn QA** (Critic - functional verification)
- **Lan** (Critic - correctness audit)

### Example (Code Review)
```
Iteration 1:
  Build (Thục): Implements login endpoint
    Code: 150 lines
  Critique (Mộc): Finds 3 issues:
    1. No rate limiting (security)
    2. Password comparison not constant-time (timing attack)
    3. Missing idempotency (duplicate login creates 2 sessions)
  Reflect (Thục): Acknowledges all 3 issues
  Improve (Thục): Fixes all 3

Iteration 2:
  Build (Thục): Updated code (180 lines)
  Critique (Mộc): Finds 1 issue:
    1. Rate limit uses IP only (bypassable via proxy rotation)
  Reflect (Thục): Adds rate limit by user ID + IP
  Improve (Thục): Final code (200 lines)

Iteration 3:
  Build (Thục): Final code
  Critique (Mộc): No major issues found
  → Quality threshold met, exit loop
```

### Industry Examples
- **LangGraph:** Critic nodes in graph
- **CrewAI:** Validation/approval agents
- **Nash Framework:** Built-in (Thesis/Anti-Thesis/Synthesis in every pipeline)

### Optimization Tips
1. **Limit iterations:** Max 3 (diminishing returns after that)
2. **Prioritize critiques:** Fix P0/P1 first, defer P3/P4 nitpicks
3. **Separate critics:** Different critics for different aspects (security, performance, UX)
4. **Zero-sum scoring:** Critic penalized for lazy review (prevents rubber-stamping)

---

## Pattern 4: Multi-Agent Debate

### Description
Multiple agents with different perspectives debate a decision, converge to consensus or vote.

### Structure
```
1. Problem statement broadcast to N agents
2. Each agent proposes solution independently
3. Agents debate (challenge each other's proposals)
4. Converge:
   - Consensus: All agree on one solution
   - Vote: Majority wins
   - Synthesis: Judge combines best ideas
```

### When to Use
- ✅ High uncertainty (no obviously correct answer)
- ✅ Multiple valid approaches (trade-offs to consider)
- ✅ Groupthink risk (want diverse perspectives)
- ✅ Critical decisions (architecture choice, tech stack)

### When NOT to Use
- ❌ Task has one correct answer (overkill)
- ❌ Token budget tight (N agents × context = expensive)
- ❌ Time-sensitive (debate is slow)

### Token Cost
**High:** N agents × (3K context + 2K debate) = 15-30K for 3-5 agents

### Nash Agents Using This Pattern
- **Nash Triad** (Thesis/Anti-Thesis/Synthesis in Pipelines 1-6)
- **Architecture Review** (Phúc SA + Quang + Hiếu debate tech choices)

### Example (Tech Stack Decision)
```
Problem: Choose database for high-write workload

Agent 1 (Phúc SA): PostgreSQL
  Pros: ACID, mature, rich query capabilities
  Cons: Write throughput limited (WAL bottleneck)

Agent 2 (Quang): Cassandra
  Pros: Linear write scalability, high availability
  Cons: No ACID, eventual consistency, learning curve

Agent 3 (Hiếu): MongoDB
  Pros: Flexible schema, good write performance, familiar
  Cons: Consistency issues, not ideal for relational data

Debate:
  Phúc: Cassandra over-engineered for this scale
  Quang: PostgreSQL won't handle 100K writes/sec
  Hiếu: MongoDB is middle ground, proven at similar scale

Synthesis (User/Judge):
  Decision: PostgreSQL + WAL tuning + partitioning
  Rationale: ACID required, 100K writes/sec achievable with tuning
  Fallback: If scaling fails, migrate to Cassandra (data model allows)
```

### Industry Examples
- **CrewAI:** Multi-agent collaboration
- **AutoGen:** Group chat (agents debate in conversation)
- **Nash Framework:** Nash Triad (3-agent debate in every pipeline)

### Optimization Tips
1. **Limit participants:** 3-5 agents max (more = diminishing returns)
2. **Assign archetypes:** Diverse perspectives (Optimist, Pessimist, Pragmatist)
3. **Time-box debate:** Max 2 rounds (prevent endless argument)
4. **Judge pattern:** Dedicated synthesis agent (don't vote, synthesize best ideas)

---

## Pattern 5: Hierarchical Planning

### Description
Manager agent decomposes complex task into subtasks, delegates to specialist agents, aggregates results.

### Structure
```
1. Manager receives complex task
2. Manager decomposes into subtasks
3. Manager delegates each subtask to specialist agent
4. Specialists execute in parallel (if independent)
5. Manager aggregates results
6. Manager verifies completeness
```

### When to Use
- ✅ Complex task divisible into independent subtasks
- ✅ Specialist agents available (each expert in subdomain)
- ✅ Parallelization possible (speed up execution)
- ✅ Token budget allows (manager overhead + N specialists)

### When NOT to Use
- ❌ Task is atomic (can't subdivide - use Plan-and-Execute)
- ❌ Subtasks heavily interdependent (use ReAct)
- ❌ No specialists available (manager does all work = overhead waste)

### Token Cost
**Low (per agent):** Manager 2K + (N specialists × 3K) = 2K + 9K (for 3 specialists) = 11K
**But:** Parallelization saves time (not tokens)

### Nash Agents Using This Pattern
- **Dũng PM** (Manager - delegates to dev/QA/arch specialists)
- **MoE Router** (Routes to specialist pipelines)

### Example (Feature Implementation)
```
Manager (Dũng PM):
  Task: Implement user notification system
  Decomposition:
    1. Architecture (Phúc SA)
    2. Backend API (Quang)
    3. Frontend UI (Hoàng)
    4. Testing (Sơn QA)

Delegation (Parallel):
  Specialist 1 (Phúc SA):
    Task: Design notification architecture
    Output: CONTRACT_DRAFT.md (architecture section)

  Specialist 2 (Quang):
    Task: Implement notification API (after architecture)
    Output: src/api/notifications.ts

  Specialist 3 (Hoàng):
    Task: Build notification UI (after API)
    Output: src/components/NotificationCenter.tsx

  Specialist 4 (Sơn QA):
    Task: Write tests (after implementation)
    Output: tests/notifications.spec.ts

Aggregation (Dũng PM):
  Verify:
    ✅ Architecture approved (Nash Triad)
    ✅ API implements architecture
    ✅ UI consumes API correctly
    ✅ Tests cover acceptance criteria
  Result: Feature complete
```

### Industry Examples
- **LangGraph:** Supervisor pattern
- **CrewAI:** Hierarchical crew (manager + workers)
- **AutoGen:** Group manager agent

### Optimization Tips
1. **Parallelize independent tasks:** Don't wait for Specialist 1 if Specialist 2's task is independent
2. **Minimize manager overhead:** Manager only plans/aggregates, doesn't execute
3. **Specialist reuse:** Same specialist for similar tasks (leverage context)
4. **Clear contracts:** Manager defines acceptance criteria upfront (prevent rework)

---

## Pattern 6: Tool-Use Chains

### Description
Agent executes a predefined sequence of tool calls (APIs, databases, file operations) with minimal reasoning overhead.

### Structure
```
Input: Data + Tool chain definition
Execution:
  1. Call Tool A with input
  2. Transform result → input for Tool B
  3. Call Tool B
  4. Transform result → input for Tool C
  5. ...
  N. Return final result
```

### When to Use
- ✅ Workflow is deterministic (same sequence every time)
- ✅ Tools are reliable (low failure rate)
- ✅ Transformation logic is simple (no complex reasoning)
- ✅ Speed + low token cost important

### When NOT to Use
- ❌ Tool calls depend on complex reasoning (use ReAct)
- ❌ High failure rate (need error handling - use Plan-and-Execute)
- ❌ Sequence varies by context (use Dynamic Routing)

### Token Cost
**Low:** Minimal reasoning, mostly tool I/O = 2-3K tokens

### Nash Agents Using This Pattern
- **CI/CD Agent** (Predefined pipeline: build → test → deploy)
- **Backup Script** (Predefined: dump → compress → upload → verify)

### Example (CI/CD Pipeline)
```
Tool Chain:
  1. git pull origin main
  2. npm install
  3. npm run build
  4. npm test
  5. If tests pass: docker build -t app:latest
  6. If build succeeds: docker push registry.example.com/app:latest
  7. If push succeeds: kubectl rollout restart deployment/app

Execution (Happy Path):
  Tool 1: git pull → Success (no conflicts)
  Tool 2: npm install → Success (all deps installed)
  Tool 3: npm run build → Success (bundle created)
  Tool 4: npm test → Success (all tests pass)
  Tool 5: docker build → Success (image built)
  Tool 6: docker push → Success (image pushed)
  Tool 7: kubectl rollout → Success (deployment restarted)
  Result: Deployment complete

Execution (Failure):
  Tool 1-3: Success
  Tool 4: npm test → Failure (3 tests failed)
  → Chain aborts, no deployment
  Result: Tests failed, fix required
```

### Industry Examples
- **LangChain:** SequentialChain
- **n8n/Zapier:** Workflow automation
- **GitHub Actions:** Workflow YAML

### Optimization Tips
1. **Error handling:** Define retry strategies (e.g., npm install retry 3x)
2. **Conditional branching:** If-else logic (e.g., skip deploy if tests fail)
3. **Caching:** Cache intermediate results (e.g., npm install cache)
4. **Idempotency:** Ensure chain can rerun safely (no duplicate side effects)

---

## Pattern 7: Human-in-the-Loop

### Description
AI agent proposes actions/decisions, human approves/rejects/modifies before execution.

### Structure
```
Loop:
  1. Agent analyzes task
  2. Agent proposes action/decision
  3. Human reviews proposal
  4. Human responds: Approve / Reject / Modify
  5. If approved: Execute
     If rejected: Agent retries with feedback
     If modified: Execute modified version
  6. Repeat until task complete
```

### When to Use
- ✅ High-stakes decisions (production deploys, database migrations)
- ✅ Legal/compliance requirements (human oversight mandated)
- ✅ Uncertain tasks (AI confidence low, need human judgment)
- ✅ Learning phase (AI not yet trusted, human validates)

### When NOT to Use
- ❌ Routine tasks (overhead waste - automate fully)
- ❌ Real-time requirements (human approval too slow)
- ❌ High volume (human becomes bottleneck)

### Token Cost
**Variable:** Depends on human response time (context may need refreshing if delayed)

### Nash Agents Using This Pattern
- **User Agent** (High-level orchestrator - user approves pipeline selection)
- **Deploy Agent** (Proposes production changes, user approves)

### Example (Database Migration)
```
Iteration 1:
  Agent (Quang): Proposes migration
    SQL: ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  Human: Approves
  Agent: Executes migration
  Result: Column added

Iteration 2:
  Agent (Quang): Proposes index
    SQL: CREATE INDEX idx_users_email_verified ON users(email_verified);
  Human: Modifies
    Feedback: "Use partial index (only unverified users)"
    Modified SQL: CREATE INDEX idx_users_email_verified ON users(email_verified) WHERE email_verified = FALSE;
  Agent: Executes modified SQL
  Result: Partial index created
```

### Industry Examples
- **GitHub Copilot:** AI suggests, human accepts/rejects
- **Claude Code:** Tool use requires approval (via hooks)
- **Nash Framework:** Gate scripts (validate.sh, security.sh require human review)

### Optimization Tips
1. **Batch approvals:** Group related actions (approve 5 migrations at once)
2. **Auto-approve safe actions:** Only require approval for risky operations
3. **Approval timeouts:** If human doesn't respond in 5 min, escalate or abort
4. **Approval context:** Show human WHY action needed (not just WHAT)

---

## Pattern 8: Iterative Refinement

### Description
Agent produces initial draft, then iteratively improves based on evaluation metrics or user feedback.

### Structure
```
1. Agent produces v1 (initial draft)
2. Evaluate v1 (metrics, user feedback, test results)
3. Agent improves → v2
4. Evaluate v2
5. Repeat until: Metrics meet threshold OR max iterations
```

### When to Use
- ✅ Creative tasks (UI design, copywriting, architecture)
- ✅ No "correct" answer (subjective quality)
- ✅ Incremental improvement possible (each iteration adds value)
- ✅ Evaluation function exists (automated or human)

### When NOT to Use
- ❌ Task has deterministic solution (use Plan-and-Execute)
- ❌ Token budget tight (iterations are expensive)
- ❌ Quality threshold unclear (how do you know when to stop?)

### Token Cost
**High:** N iterations × 3K = 9-15K (for 3-5 iterations)

### Nash Agents Using This Pattern
- **Châu UX** (UI wireframes - iterate based on user feedback)
- **Skill Creator** (Skill refinement - iterate based on evals)

### Example (UI Wireframe)
```
Iteration 1 (v1):
  Agent (Châu UX): Creates wireframe for login page
    Elements: Email input, password input, login button
  Evaluation (User): Feedback:
    - Missing "Forgot password?" link
    - No social login options
    - Button placement awkward

Iteration 2 (v2):
  Agent: Updates wireframe
    Added: Forgot password link, Google/GitHub login buttons
    Fixed: Button placement (centered, below inputs)
  Evaluation (User): Feedback:
    - Good, but add "Remember me" checkbox
    - Google button too small

Iteration 3 (v3):
  Agent: Final wireframe
    Added: Remember me checkbox
    Fixed: Increased social button size
  Evaluation (User): Approved ✅
  Result: Wireframe finalized
```

### Industry Examples
- **GPT-4 Code Interpreter:** Iteratively refines code based on test results
- **DALL-E:** User iteratively refines prompts for image generation
- **Nash Skill Creator:** Iteratively sharpens skills based on evals

### Optimization Tips
1. **Limit iterations:** Max 5 (diminishing returns)
2. **Automated evaluation:** Use metrics where possible (don't wait for human feedback)
3. **Delta updates:** Only change what's broken (don't regenerate everything)
4. **Version control:** Keep v1, v2, v3 (allow rollback if v3 worse than v2)

---

## Pattern 9: Dynamic Routing (MoE)

### Description
Router agent analyzes task, selects optimal specialist agent(s) or pipeline to handle it.

### Structure
```
1. Router receives task
2. Router analyzes task characteristics:
   - Domain (frontend, backend, security, etc.)
   - Complexity (simple, complex, critical)
   - Urgency (normal, urgent)
3. Router selects specialist(s):
   - Single specialist: Route to specialist
   - Multiple specialists: Route to multi-agent workflow
   - No specialist: Route to generalist
4. Specialist executes task
5. Router aggregates results (if multiple specialists)
```

### When to Use
- ✅ Diverse task types (unpredictable domain/complexity)
- ✅ Large team of specialists (need intelligent routing)
- ✅ Avoid one-size-fits-all agent (want optimal match per task)
- ✅ Routing logic is cheaper than wrong specialist (overhead < cost of failure)

### When NOT to Use
- ❌ Single task type (no routing needed)
- ❌ Routing logic complex (overhead > benefit)
- ❌ Small team (just use generalist agent)

### Token Cost
**Low (routing overhead):** Router analysis 1K + Specialist 3K = 4K total

### Nash Agents Using This Pattern
- **MoE Router** (Routes to 6 SDLC pipelines based on 12-dimension audit)
- **User Agent** (Routes to research/dev/QA agents based on request)

### Example (MoE Router)
```
Task 1: "Fix login bug in production"
Router (MoE):
  Analysis:
    - Domain: Security + Backend
    - Complexity: High (production)
    - Urgency: Critical
  Decision: Route to Pipeline 6 (Emergency Hotfix)
    Specialists: Tùng (Diag) + Lan (Critic) + Dũng PM (Judge)
  Result: Hotfix deployed in 30 min

Task 2: "Add dark mode toggle to settings"
Router (MoE):
  Analysis:
    - Domain: Frontend + UX
    - Complexity: Medium
    - Urgency: Normal
  Decision: Route to Pipeline 3 (Coding) + Design Flow
    Specialists: Châu UX (Wireframe) + Hoàng (FE Implementation)
  Result: Feature delivered in 2 hours

Task 3: "Explain how auth works"
Router (MoE):
  Analysis:
    - Domain: Documentation
    - Complexity: Low
    - Urgency: Normal
  Decision: Route to User Agent (Generalist - no specialist needed)
  Result: Explanation provided in 2 min
```

### Industry Examples
- **LangGraph:** Conditional edges (route based on state)
- **CrewAI:** Task delegation logic
- **OpenAI Agents SDK:** Router agents (upcoming feature)
- **Nash Framework:** MoE Router (MIXTURE_OF_EXPERTS_ROUTER.md)

### Optimization Tips
1. **Fast routing:** Use heuristics, not deep analysis (routing should be <1K tokens)
2. **Routing cache:** Similar tasks → same specialist (don't re-analyze)
3. **Fallback specialist:** If no match, route to generalist (don't fail)
4. **Routing metrics:** Track accuracy (% of tasks routed correctly)

---

## Pattern Comparison Matrix

| Pattern | Token Cost | Time | Quality | Parallelizable | Best For |
|---------|------------|------|---------|----------------|----------|
| 1. ReAct | Medium-High | Slow | Medium | No | Dynamic tasks, exploration |
| 2. Plan-and-Execute | Low | Fast | High | Yes (steps) | Deterministic multi-step |
| 3. Critic/Reflection | High | Slow | Very High | No | Quality-critical work |
| 4. Multi-Agent Debate | Very High | Very Slow | Very High | No | Uncertain domains |
| 5. Hierarchical Planning | Medium | Fast | High | Yes (subtasks) | Complex divisible tasks |
| 6. Tool-Use Chains | Very Low | Very Fast | Medium | Yes (if tools allow) | Deterministic workflows |
| 7. Human-in-the-Loop | Variable | Very Slow | Very High | No | High-stakes decisions |
| 8. Iterative Refinement | High | Slow | High | No | Creative/subjective tasks |
| 9. Dynamic Routing | Low | Fast | High | Yes (after routing) | Diverse task types |

---

## Nash Framework Mapping

### Current Agent → Pattern Assignments

| Agent | Current Pattern | Optimal Pattern | Gap? |
|-------|----------------|-----------------|------|
| Dũng PM | Hierarchical Planning | ✅ Optimal | None |
| Phúc SA | ReAct (10 loops) | Plan-and-Execute | ❌ 75% token waste |
| Quang | Plan-and-Execute | ✅ Optimal | None |
| Mộc | Critic/Reflection | ✅ Optimal | None |
| Sơn QA | Critic/Reflection | ✅ Optimal | None |
| Tùng Diag | ReAct | ✅ Optimal (exploration needed) | None |
| Hoàng | Plan-and-Execute | ✅ Optimal | None |
| Châu UX | Iterative Refinement | ✅ Optimal | None |
| MoE Router | Dynamic Routing | ✅ Optimal | None |

**Actionable:** Refactor **Phúc SA** to Plan-and-Execute (save 15K tokens/task)

---

## References

- **Source:** system/BEST_PRACTICE_AGENT.md (lines 147-400)
- **Beam.ai:** https://beam.ai/agentic-insights/the-9-best-agentic-workflow-patterns-to-scale-ai-agents-in-2026
- **LangGraph:** https://langchain-ai.github.io/langgraph/
- **CrewAI:** https://docs.crewai.com/
- **AutoGen:** https://microsoft.github.io/autogen/

---

**Last Updated:** 2026-03-16
**Maintained By:** Nash Agent Framework
**Review Frequency:** Quarterly (align with industry updates)
