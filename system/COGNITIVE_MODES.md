# Cognitive Modes - Nash Framework

**Inspired by gstack's 8 Skills** (see [GSTACK_ADVANCED_PATTERNS.md](../skill_factory/GSTACK_ADVANCED_PATTERNS.md))

Nash agents can operate in 3 cognitive modes with different token budgets and mental models.

---

## 🎯 Three Modes

| Mode | Metaphor | Token Budget | When to Use |
|------|----------|--------------|-------------|
| **EXPANSION** | Cathedral builder / Surgeon | 15K-30K | New domain, unclear spec, product direction |
| **HOLD** | Paranoid staff engineer | 10K-15K | Architecture, contracts, rigor needed |
| **REDUCTION** | Release machine | 5K-10K | Implementation from clear spec, ship fast |

---

## 🔀 Mode Selection Logic

**Every agent must select mode at task start (Step 0):**

```
STEP 0: MODE SELECTION

1. Read task description
2. Estimate complexity:
   - Count requirements (< 3 = Simple, 3-10 = Complex, >10 = Critical)
   - Check for keywords
3. Select mode based on decision tree:

┌─────────────────────────────────────────────────────────────┐
│  DECISION TREE                                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Is spec clear + complete?                                   │
│  ├─ YES → Is it implementation only?                         │
│  │  ├─ YES → REDUCTION (ship fast)                          │
│  │  └─ NO → HOLD (follow spec rigorously)                   │
│  └─ NO → Is it new domain / product direction?               │
│     ├─ YES → EXPANSION (explore, design)                     │
│     └─ NO → HOLD (clarify first, then rigor)                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘

KEYWORDS triggering modes:

EXPANSION keywords:
  - "new domain", "unclear", "explore", "product direction"
  - "what would 10x look like", "design alternatives"
  - "user journey", "founder taste"

HOLD keywords:
  - "architecture", "contracts", "schema", "API design"
  - "security", "data model", "integration"
  - "critical", "production", "high risk"

REDUCTION keywords:
  - "implement from CONTRACT_DRAFT", "code only"
  - "fix bug", "refactor", "migrate"
  - "urgent", "hotfix", "fast"
```

**Example classifications:**

```
Task: "Design payment processing for multi-currency support"
→ Keywords: "design", "multi-currency" (new domain)
→ Complexity: Complex (many requirements)
→ Mode: EXPANSION

Task: "Implement user registration endpoint per CONTRACT_DRAFT.md"
→ Keywords: "implement", "per CONTRACT_DRAFT" (clear spec)
→ Complexity: Simple (one endpoint)
→ Mode: REDUCTION

Task: "Review and validate database schema for GDPR compliance"
→ Keywords: "schema", "GDPR" (critical, rigor)
→ Complexity: Complex (compliance requirements)
→ Mode: HOLD
```

---

## 📊 Mode Behaviors

### EXPANSION Mode (Cathedral Builder)

**Mental model:** "Build for 10x scale, think 3 years ahead"

**Behaviors:**
- Ask "What would 10x better look like?"
- Produce 3 alternative designs
- Write detailed rationale for each choice
- Consider edge cases deeply
- Optimize for future extensibility

**Output format:**
- Multiple sections: Problem, Alternatives, Recommendation
- Diagrams (data flow, state machines)
- Trade-off analysis tables

**Token budget:** 15K-30K

**Example output structure:**
```markdown
## Problem Analysis

[Deep dive into user needs, constraints, future requirements]

## Alternative Designs

### Option A: Microservices Architecture
**Pros:** ...
**Cons:** ...
**Complexity:** High

### Option B: Monolith with Modules
**Pros:** ...
**Cons:** ...
**Complexity:** Medium

### Option C: Hybrid Approach
**Pros:** ...
**Cons:** ...
**Complexity:** Medium-High

## Recommendation

[Detailed rationale, mapped to business goals]

## Implementation Roadmap

Phase 1: ...
Phase 2: ...
```

---

### HOLD Mode (Paranoid Engineer)

**Mental model:** "Follow spec exactly, validate everything, catch bugs before QA"

**Behaviors:**
- Validate against existing contracts
- Check ALL PEN rules (via Vector DB query)
- Cross-reference existing code patterns
- Ask clarifying questions if ambiguous
- Produce complete artifacts (no TODOs)

**Output format:**
- Single design (no alternatives)
- Evidence-based (references to contracts, PEN rules)
- Comprehensive error handling

**Token budget:** 10K-15K

**Example output structure:**
```markdown
## Design (per CONTRACT_DRAFT.md)

[Implementation following spec exactly]

## PEN Rules Applied

- PEN-001: Multi-tenant RLS check
- PEN-089: Race condition prevention
- PEN-234: Idempotency key validation

## Error Handling

| Error | Rescue | User Sees |
|-------|--------|-----------|
| ...   | ...    | ...       |

## Test Cases

[Comprehensive test matrix]
```

---

### REDUCTION Mode (Ship Machine)

**Mental model:** "Code speaks, ship fast, no overthinking"

**Behaviors:**
- Implement from CONTRACT_DRAFT.md (no deviation)
- Minimal comments (self-documenting code)
- No alternatives considered
- No lengthy explanations
- Focus: working code + passing tests

**Output format:**
- Code only (with minimal docstrings)
- Test cases
- One-line commit message

**Token budget:** 5K-10K

**Example output:**
```ruby
# app/controllers/api/v1/users_controller.rb

class Api::V1::UsersController < ApplicationController
  def create
    user = User.create!(user_params)
    render json: user, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def user_params
    params.require(:user).permit(:email, :name)
  end
end

# spec/controllers/api/v1/users_controller_spec.rb

RSpec.describe Api::V1::UsersController do
  describe 'POST /api/v1/users' do
    it 'creates user' do
      post '/api/v1/users', params: { user: { email: 'test@example.com', name: 'Test' } }
      expect(response).to have_http_status(:created)
    end

    it 'handles validation errors' do
      post '/api/v1/users', params: { user: { email: 'invalid' } }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end
```

---

## 🚨 Mode Switching Rules

**RULE 1: No mid-task mode switching**

Once mode selected, CANNOT switch until task complete.

**Why:** Switching wastes tokens (re-contextualization) and causes confusion.

**If mode wrong:**
1. STOP current task
2. Report to user: "Selected REDUCTION but spec unclear, need EXPANSION"
3. User approves mode change
4. Restart task with correct mode

---

**RULE 2: Mode selection is EXPLICIT**

Agent MUST state mode in first output:

```markdown
## MODE SELECTION

**Selected mode:** EXPANSION
**Reason:** New domain (multi-currency payments), need to explore design space
**Token budget:** 20K
**Estimated duration:** 2-3 hours
```

User can override:
```
User: "No, use HOLD mode instead (we already have spec)"
Agent: "Understood, switching to HOLD mode. Re-reading CONTRACT_DRAFT.md..."
```

---

## 📈 Mode Effectiveness Metrics

Track in Grafana:

```prometheus
# Mode selection distribution
nash_mode_selected_total{mode="EXPANSION"} 45
nash_mode_selected_total{mode="HOLD"} 123
nash_mode_selected_total{mode="REDUCTION"} 89

# Token usage by mode
nash_mode_tokens_avg{mode="EXPANSION"} 18450
nash_mode_tokens_avg{mode="HOLD"} 12340
nash_mode_tokens_avg{mode="REDUCTION"} 6780

# Mode correctness (did user override?)
nash_mode_override_rate{mode="EXPANSION"} 0.05  # 5% override rate
nash_mode_override_rate{mode="HOLD"} 0.12       # 12% override rate
nash_mode_override_rate{mode="REDUCTION"} 0.08  # 8% override rate
```

**Optimization loop:**
- If override rate >20% for a mode → mode selection logic needs tuning
- If avg tokens exceeds budget by >30% → mode is too ambitious
- If task duration in REDUCTION > HOLD → spec wasn't clear enough

---

## 🎓 Mode Selection Training (PEN/WIN Learning)

Agents learn mode selection from past mistakes:

**Example PEN entry:**

```markdown
### PEN-245 | 2026-03-15 | T4_56_payment_refactor

**Incident:** Selected REDUCTION mode for payment refactoring, but spec was incomplete. Wasted 8K tokens implementing wrong solution.

**Prevention Rule:** For "refactor" tasks in critical modules (payments, auth), ALWAYS use HOLD mode (validate spec first).

**Penalty:** Agent -15 points (P2: Wrong mode selection)

**Status:** ACTIVE
```

**How agents use this:**

When selecting mode, query Vector DB:
```javascript
const relevantPens = await vectorDB.search(
  "payment refactoring task mode selection",
  { filter: { category: "mode_selection", status: "ACTIVE" } }
);
// Returns PEN-245
// Agent sees: "For refactor tasks in payments, use HOLD"
// Adjusts mode selection logic
```

---

## 🔄 Integration with Nash Triad

**Mode applies to THESIS agent only** (the one building artifacts).

**ANTI-THESIS agent always uses CRITIC mode** (paranoid review, regardless of complexity).

**SYNTHESIS agent always uses JUDGE mode** (evaluate Thesis vs Anti-Thesis, make final call).

**Example:**

```
Task: "Design payment processing"
Pipeline: Architecture (Pipeline 2)

Thesis: Phúc SA in EXPANSION mode (20K tokens)
  → Produces 3 alternative designs

Anti-Thesis: Mộc in CRITIC mode (8K tokens)
  → Reviews all 3 alternatives, finds flaws

Synthesis: Dũng PM in JUDGE mode (5K tokens)
  → Selects best alternative, reconciles Thesis + Anti-Thesis
```

---

## 📝 Mode Selection Template (for agents)

Copy this into every agent's boot protocol:

```markdown
## STEP 0: MODE SELECTION

1. **Read task description**
2. **Check keywords:**
   - EXPANSION: new domain, explore, product direction
   - HOLD: architecture, contracts, critical
   - REDUCTION: implement, fix bug, urgent
3. **Estimate complexity:**
   - Requirements count: {{ count }}
   - Spec clarity: {{ clear/unclear }}
4. **Decision:**
   - Spec clear + implementation only? → REDUCTION
   - Spec clear + architecture/critical? → HOLD
   - Spec unclear / new domain? → EXPANSION
5. **Declare mode:**

   **MODE SELECTED:** {{ EXPANSION / HOLD / REDUCTION }}
   **REASON:** {{ why this mode }}
   **TOKEN BUDGET:** {{ 5K-30K }}

6. **Proceed with mode-specific behavior**
```

---

*Cognitive modes enable agents to dynamically adjust token spend based on task complexity, matching gstack's proven "one feature, five modes" pattern while preserving Nash Triad rigor.*
