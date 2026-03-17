# Safe Integration Strategy — Non-Invasive Enhancement

**Date:** 2026-03-16
**Purpose:** Thêm 10 features từ Claude Prime & gstack **KHÔNG ẢNH HƯỞNG** Nash workflow hiện tại

---

## 🎯 Nguyên Tắc Vàng: Isolated Skills

### ❌ KHÔNG ĐƯỢC LÀM:
1. ❌ **Sửa `system/NASH_SUBAGENT_PROMPTS.md`** (core dispatch template)
2. ❌ **Sửa `system/MIXTURE_OF_EXPERTS_ROUTER.md`** (MoE routing logic)
3. ❌ **Sửa pipelines/** (6 SDLC pipelines)
4. ❌ **Sửa agents/core/** (9 core agents)
5. ❌ **Thay đổi scoring rules** (`system/SCORING_RULES.md`)
6. ❌ **Thay đổi memory eviction** (`system/MEMORY_EVICTION_PROTOCOL.md`)

### ✅ ĐƯỢC PHÉP:
1. ✅ **Tạo skills mới** trong `agents/skills/`
2. ✅ **Enhance skills hiện có** (thêm file `.md` mới, KHÔNG sửa file gốc)
3. ✅ **Thêm PEN/WIN entries** vào agents (học từ failures)
4. ✅ **Thêm tools** vào `allowed-tools` trong skill frontmatter
5. ✅ **Reference skills** trong agent's L2 Cache (section `### SKILLS`)

---

## 📚 Pattern: Skill-Based Architecture

### Cách Nash hiện tại dùng skills:

```markdown
# agents/core/dung-manager.md

### SKILLS (6 equipped)
- **SKILL:** `../../agents/skills/deployment-excellence/SKILL.md`
- **SKILL:** `../../agents/skills/qa-four-modes/SKILL.md`
- **SKILL:** `../../agents/skills/code-review-excellence/SKILL.md`
- **SKILL:** `../../agents/skills/module-decomposition-strategy/SKILL.md`
- **SKILL:** `../../agents/skills/bug-triage/SKILL.md`
- **SKILL:** `../../agents/skills/architecture-decision-framework/SKILL.md`
```

**Cơ chế:**
- Agent **READ skill file** khi cần
- Skill = **passive knowledge**, không active execution
- Skill **KHÔNG can thiệp** workflow, chỉ guide agent

---

## 🔐 Safe Integration Approach

### Approach 1: **Pure Skill Addition** (Safest)

**Concept:** Tạo skill mới, agent tự quyết định khi nào dùng

**Example:** CEO-level Planning

```bash
# Tạo skill mới
agents/skills/ceo-product-thinking/
  ├── SKILL.md                # Main workflow
  ├── 10-star-framework.md    # Expansion templates
  └── metadata.json           # Registry entry

# Agent tự động discover khi:
# - User request vague ("Add upload")
# - Dung PM thấy cần challenge requirement
```

**Không cần:**
- ❌ Sửa MoE Router
- ❌ Thêm vào pipeline
- ❌ Modify dispatch template

**Chỉ cần:**
- ✅ Tạo skill
- ✅ Register trong `_registry.json`
- ✅ Agent tự reference khi thấy relevant

---

### Approach 2: **Skill Enhancement** (Safe)

**Concept:** Thêm file mới vào skill folder, KHÔNG sửa file gốc

**Example:** Greptile Integration

```bash
# Skill hiện có
agents/skills/code-review-excellence/
  ├── SKILL.md                     # ✅ GIỮ NGUYÊN
  ├── checklist.md                 # ✅ GIỮ NGUYÊN
  ├── greptile-triage.md          # ✅ ĐÃ CÓ SẴN!
  └── greptile-integration.md     # ➕ THÊM MỚI (chi tiết API)

# Trong SKILL.md, Step 2.5 ĐÃ CÓ:
## Step 2.5: Check for Greptile review comments
Read `.claude/skills/review/greptile-triage.md` ...
```

**Lợi ích:**
- Greptile integration **ĐÃ CÓ SẴN** trong Nash!
- Chỉ cần **enhance documentation**
- Không động vào workflow

---

### Approach 3: **Optional Enhancement** (Safe + Explicit)

**Concept:** Feature là OPTIONAL, agent explicitly call

**Example:** Health Scoring

```bash
# Trong qa-four-modes/SKILL.md
## Step 5: Report (OPTIONAL: Health Scoring)

**Default:** PASS/FAIL verdict

**Enhanced (optional):** Add health score
- Read `./health-scoring.md`
- Calculate 4 categories (Functionality, Performance, UI, Console)
- Output: "Health Score: 72/100"

User can request: "/qa --with-health-score"
```

**Kích hoạt:**
- User explicitly asks
- Hoặc agent thấy trend tracking cần thiết

---

## 📋 Mapping 10 Features → Safe Integration

| # | Feature | Approach | Integration Method | Risk Level |
|---|---------|----------|-------------------|------------|
| **1** | Auto-config (`/nash-prime`) | **Pure Skill** | Create new skill, user explicitly calls | 🟢 LOW |
| **2** | Polymorphic agent | **NEW AGENT** | Create `the-mechanic.md` as ALTERNATIVE to specialized agents | 🟡 MEDIUM |
| **3** | Greptile integration | **Skill Enhancement** | Add `greptile-integration.md` to existing skill | 🟢 LOW |
| **4** | Diff-aware QA | **Skill Enhancement** | Add `diff-aware-mode.md` as Mode 1 | 🟢 LOW |
| **5** | Health scoring | **Optional Enhancement** | Add `health-scoring.md`, opt-in | 🟢 LOW |
| **6** | Shipping automation | **Skill Enhancement** | Add `nash-ship.md` to deployment-excellence | 🟢 LOW |
| **7** | CEO-level planning | **Pure Skill** | Create new skill, reference in Dung PM | 🟢 LOW |
| **8** | Forced diagrams | **PEN Entry** | Add to eng-rigor-validation, enforce via PEN | 🟡 MEDIUM |
| **9** | Browser automation | **Verify Existing** | Check if browser-automation has features | 🟢 LOW |
| **10** | Team retrospective | **Pure Skill** | Create new skill, standalone | 🟢 LOW |

---

## 🛡️ Risk Mitigation by Feature

### Feature #1: Auto-config

**Safe Method:**
```bash
# Create as standalone skill
agents/skills/nash-auto-config/
  ├── SKILL.md
  └── stack-detection.md

# User explicitly calls
claude --agent agents/core/dung-manager.md "/nash-prime"

# Dung PM sees "/nash-prime" → reads skill → executes
```

**NO changes to:**
- ❌ MoE Router
- ❌ Pipelines
- ❌ Core agents

---

### Feature #2: Polymorphic Agent (⚠️ Most Risky)

**Safe Method:**
```bash
# Create as ALTERNATIVE agent, not replacement
agents/core/the-mechanic.md

# Dung PM dispatch table:
| Khi nào | Gọi ai |
|---------|--------|
| Multi-domain task | the-mechanic (auto-discovers skills) |
| Specialized task | Thục/Lan/Mộc (existing agents) |
```

**Why safe:**
- Không thay thế existing agents
- Chỉ là **thêm option**
- Dung PM quyết định khi nào dùng

**Test strategy:**
1. Tạo `the-mechanic.md`
2. Test standalone: `claude --agent agents/core/the-mechanic.md "Build dashboard"`
3. Nếu OK → Dung PM có thể reference
4. Nếu FAIL → không ảnh hưởng existing flow

---

### Feature #3: Greptile Integration

**ALREADY EXISTS!** ✅

```bash
# Check existing file
cat agents/skills/code-review-excellence/greptile-triage.md
```

**Only need:**
- Enhance documentation (API details)
- Add FP history tracking
- NO workflow changes

---

### Feature #4-5: QA Enhancements

**Safe Method:**
```bash
# qa-four-modes/ structure:
agents/skills/qa-four-modes/
  ├── SKILL.md                  # ✅ Main workflow
  ├── mode-1-diff-aware.md      # ➕ NEW
  ├── mode-2-full.md            # ➕ NEW
  ├── mode-3-quick.md           # ➕ NEW
  ├── mode-4-regression.md      # ➕ NEW
  └── health-scoring.md         # ➕ OPTIONAL

# SKILL.md references modes:
## Modes
1. **Diff-aware** (default on feature branch) → read `mode-1-diff-aware.md`
2. **Full** → read `mode-2-full.md`
...
```

**Why safe:**
- Mode 1-4 = **implementation details**
- SKILL.md = **interface** (unchanged)
- Health scoring = **optional addon**

---

### Feature #6: Shipping Automation

**Safe Method:**
```bash
# deployment-excellence/ structure:
agents/skills/deployment-excellence/
  ├── SKILL.md                  # ✅ Existing general deployment
  ├── nash-ship-workflow.md     # ➕ NEW orchestrated flow
  └── version-bump.md           # ➕ NEW auto-versioning

# User explicitly calls
/nash-ship
  ↓
Dung PM → reads nash-ship-workflow.md → executes steps
```

**Why safe:**
- Nash-ship = **new workflow**, not replacement
- Existing deployment skill = unchanged
- User explicitly triggers

---

### Feature #7: CEO-level Planning

**Safe Method:**
```bash
# Create new skill
agents/skills/ceo-product-thinking/
  ├── SKILL.md
  ├── 10-star-framework.md
  └── tier-comparison-template.md

# Reference in Dung PM
agents/core/dung-manager.md:
  ### SKILLS (7 equipped)  # ← Add one more
  - **SKILL:** `../../agents/skills/ceo-product-thinking/SKILL.md`

# Dung PM decides when to use:
# - User request vague
# - No clear requirements
# - New product/feature
```

**Why safe:**
- Dung PM **already references skills**
- Just adding one more reference
- Dung PM decides when relevant

---

### Feature #8: Forced Diagrams (⚠️ Needs PEN Entry)

**Safe Method:**
```bash
# Enhance eng-rigor-validation skill
agents/skills/eng-rigor-validation/
  ├── SKILL.md                  # ✅ Existing
  ├── mandatory-diagrams.md     # ➕ NEW enforcement rules
  └── diagram-templates.md      # ➕ NEW examples

# Add PEN entry to enforcing agents
agents/core/moc-arch-chal.md:
  ## PEN
  ### PEN-XXX | 2026-03-16 | Missing Diagrams
  - **Reason:** Architecture approved without diagrams → vague → bugs
  - **Rule:** Phase B (Completeness Audit) MUST check diagrams exist
  - **Penalty:** -15 (P2) if missing
```

**Why safe:**
- Uses existing PEN mechanism
- Mộc already does completeness audit
- Just adding **one more check**

---

### Feature #9: Browser Automation

**Safe Method:**
```bash
# Check existing skill
ls agents/skills/browser-automation/

# If exists:
# - Verify has Playwright
# - Verify has persistent daemon
# - Verify has cookie import

# If missing features:
# - Add new .md files (enhancement)
# - DON'T replace existing SKILL.md
```

**Why safe:**
- Skill already exists
- Only verify + enhance
- No workflow changes

---

### Feature #10: Team Retrospective

**Safe Method:**
```bash
# Create standalone skill
agents/skills/team-retro/
  ├── SKILL.md
  ├── git-metrics.md
  └── contributor-analysis.md

# User explicitly calls
/nash-retro
  ↓
Dung PM → reads team-retro/SKILL.md → executes

# Or schedule weekly via cron
# (outside Nash workflow)
```

**Why safe:**
- Completely standalone
- No dependencies on workflow
- No automatic triggering

---

## 📊 Implementation Priority (By Risk)

### Phase 1: Zero-Risk Additions
**Timeline:** Week 1-2

1. ✅ **Feature #10:** Team Retro (new skill, standalone)
2. ✅ **Feature #7:** CEO Planning (new skill, optional reference)
3. ✅ **Feature #9:** Browser Automation (verify existing, enhance if needed)

**Testing:**
- Create skills
- Test standalone
- Register in `_registry.json`
- DON'T integrate yet

---

### Phase 2: Low-Risk Enhancements
**Timeline:** Week 3-4

4. ✅ **Feature #3:** Greptile (enhance existing, already has triage.md)
5. ✅ **Feature #4:** Diff-aware QA (add mode-1, optional)
6. ✅ **Feature #5:** Health Scoring (optional addon to QA)
7. ✅ **Feature #6:** Nash Ship (new workflow in existing skill)

**Testing:**
- Add enhancement files
- Test with opt-in flag
- Verify existing workflows unchanged

---

### Phase 3: Medium-Risk Changes
**Timeline:** Week 5-6

8. ✅ **Feature #1:** Auto-config (new skill, user-triggered)
9. ✅ **Feature #8:** Forced Diagrams (PEN entry, enforcement via existing audit)

**Testing:**
- Test in isolated branch
- Verify no regression
- PEN entry on test agent first

---

### Phase 4: Controlled Rollout
**Timeline:** Week 7-8

10. ✅ **Feature #2:** Polymorphic Agent (new agent, not replacement)

**Testing:**
- Create `the-mechanic.md`
- Test 10 tasks standalone
- Compare results vs specialized agents
- Only add to Dung PM dispatch table if 90%+ success rate

---

## 🧪 Testing Strategy

### Level 1: Isolated Skill Test
```bash
# Test skill without integration
claude "Act as this skill" < agents/skills/new-skill/SKILL.md

# Verify:
# - Skill can execute independently
# - No errors in workflow
# - Output format correct
```

### Level 2: Agent Integration Test
```bash
# Add skill to test agent (not production agent)
agents/dev/test-agent.md:
  ### SKILLS
  - **SKILL:** `../../agents/skills/new-skill/SKILL.md`

# Run 5 tasks
claude --agent agents/dev/test-agent.md "Task 1"
...

# Verify:
# - Agent can read skill
# - Skill enhances output
# - No workflow breakage
```

### Level 3: Production Agent (Opt-in)
```bash
# Add to Dung PM with OPTIONAL flag
agents/core/dung-manager.md:
  ### SKILLS (7 equipped)
  - **SKILL (OPTIONAL):** `../../agents/skills/new-skill/SKILL.md`

# Dung PM decides when to use
# NOT automatic activation
```

### Level 4: Full Integration
```bash
# Only after 50+ successful uses in Level 3
# Remove OPTIONAL flag
# Becomes standard reference
```

---

## 📝 File Structure (Safe Additions Only)

```
E:\SuperAgent\
├── agents/
│   ├── core/
│   │   ├── dung-manager.md         # ✅ ADD skill references (non-invasive)
│   │   └── the-mechanic.md         # ➕ NEW (alternative agent)
│   └── skills/
│       ├── nash-auto-config/       # ➕ NEW skill
│       │   ├── SKILL.md
│       │   └── stack-detection.md
│       ├── ceo-product-thinking/   # ➕ NEW skill
│       │   ├── SKILL.md
│       │   └── 10-star-framework.md
│       ├── team-retro/             # ➕ NEW skill
│       │   ├── SKILL.md
│       │   └── git-metrics.md
│       ├── code-review-excellence/
│       │   ├── SKILL.md            # ✅ NO CHANGE
│       │   ├── greptile-triage.md # ✅ ALREADY EXISTS
│       │   └── greptile-integration.md  # ➕ ENHANCE (API details)
│       ├── qa-four-modes/
│       │   ├── SKILL.md            # ✅ NO CHANGE
│       │   ├── mode-1-diff-aware.md     # ➕ NEW
│       │   └── health-scoring.md        # ➕ NEW (optional)
│       ├── deployment-excellence/
│       │   ├── SKILL.md            # ✅ NO CHANGE
│       │   └── nash-ship-workflow.md    # ➕ NEW
│       ├── eng-rigor-validation/
│       │   ├── SKILL.md            # ✅ NO CHANGE
│       │   └── mandatory-diagrams.md    # ➕ NEW
│       └── browser-automation/
│           └── SKILL.md            # ✅ VERIFY + ENHANCE if needed
├── system/                          # ❌ NO CHANGES
│   ├── NASH_SUBAGENT_PROMPTS.md    # ❌ DO NOT TOUCH
│   ├── MIXTURE_OF_EXPERTS_ROUTER.md # ❌ DO NOT TOUCH
│   └── ...
└── pipelines/                       # ❌ NO CHANGES
    └── ...
```

**Summary:**
- ➕ **10 new skill folders**
- ➕ **1 new agent** (the-mechanic, optional)
- ✅ **6 skill enhancements** (add files, don't modify existing)
- ✅ **1 agent reference update** (Dung PM adds skills to list)
- ❌ **0 system changes**
- ❌ **0 pipeline changes**

---

## ✅ Success Criteria

### Must Pass Before Integration:
1. ✅ All new skills **execute standalone** (no dependencies)
2. ✅ Existing workflows **unchanged** (regression test)
3. ✅ Skills are **opt-in** (not forced activation)
4. ✅ Documentation **clear** (how to use, when to use)
5. ✅ Registry **updated** (`agents/skills/_registry.json`)

### Rollback Plan:
```bash
# If any feature breaks workflow:
# 1. Remove skill reference from agent L2 Cache
# 2. Skill files remain (isolated, harmless)
# 3. No workflow impact

# Example: Remove CEO Planning from Dung PM
agents/core/dung-manager.md:
  ### SKILLS (6 equipped)  # ← Back to 6
  # - **SKILL:** `../../agents/skills/ceo-product-thinking/SKILL.md`  ← Comment out

# Skill still exists, just not referenced
# Zero downtime, zero risk
```

---

## 🎓 Key Insights from Nash Architecture

### 1. Skills = Passive Knowledge
- Skills **KHÔNG execute tự động**
- Agent **READ skill** khi relevant
- Workflow điều khiển bởi **agent logic**, not skills

### 2. L2 Cache = Configuration Layer
```markdown
# agents/core/dung-manager.md structure:
## PEN (Hard Constraints)      ← Learned from failures
## WIN (Repeat These)          ← Learned from successes
## Dispatch Table              ← When to call which agent
## Task Delegation Principles  ← How to orchestrate
## SKILLS (6 equipped)         ← ⚡ Skill references
```

**Insight:** Adding skill reference = **zero risk**, agent still decides

### 3. PEN Entries = Behavior Shaping
```markdown
## PEN-001 | Date | Process Tracing
- **Prevention Rule:** TRƯỚC KHI APPROVE pipeline có UI: BẮT BUỘC dispatch FE-QA verify
- **Penalty:** -15 (P2)
- **Status:** ACTIVE
```

**Insight:** Can enforce new behaviors via PEN (forced diagrams, health scoring)

---

## 🚀 Recommended Starting Point

### Week 1: Proof of Concept

**Goal:** Validate safe integration approach

**Tasks:**
1. Create **Feature #10 (Team Retro)** as pure standalone skill
2. Test 5 times independently
3. Add reference to Dung PM (OPTIONAL flag)
4. Run 3 tasks where Dung PM references it
5. Verify no existing workflow impact

**Success = Green light for Phase 2-4**

---

*Safe Integration Strategy | No changes to Nash core | Skills-based enhancement only*