# Nash vs Claude Prime — Gap Analysis

**Date:** 2026-03-16
**Context:** Nash ĐÃ CÓ skill factory + agent sharpening + gstack skills (5657 .md files)

---

## ❌ SAI LẦM BAN ĐẦU

Tôi đề xuất thêm 10 features mà **Nash ĐÃ CÓ HOẶC KHÔNG CẦN**:

| Feature | Nash Status | Lý do KHÔNG cần thiết |
|---------|-------------|---------------------|
| Auto-configuration | ❌ Có skill factory rồi | User tự tạo skill theo template |
| Greptile integration | ✅ ĐÃ CÓ `greptile-triage.md` | Chỉ thiếu documentation |
| Diff-aware QA | ⚠️ Có `qa-four-modes` | Cần verify có diff-aware chưa |
| Health scoring | ⚠️ Có QA skill | Cần verify có scoring chưa |
| CEO-level planning | ✅ ĐÃ CÓ `ceo-taste-validation` | Chỉ thiếu 10-star framework |
| Forced diagrams | ✅ ĐÃ CÓ `eng-rigor-validation` | Chỉ thiếu enforcement via PEN |
| Browser automation | ✅ ĐÃ CÓ `browser-automation` | Chỉ thiếu verification |
| Team retrospective | ❌ Chưa có | Có thể cần (analytics) |
| Shipping automation | ✅ ĐÃ CÓ `deployment-excellence` | Chỉ thiếu orchestrated workflow |
| Polymorphic agent | ❌ Không cần | Nash dùng specialized agents (đúng design) |

---

## 🎯 THỰC SỰ THIẾU GÌ?

### **Vấn đề 1: Claude Prime có `.claude/rules/` — Path-scoped auto-attach**

**Claude Prime:**
```markdown
# .claude/rules/api-response-format.md
---
paths: ["src/api/**/*.ts", "src/controllers/**/*.ts"]
---

ALL API responses MUST use ResponseWrapper<T>
NEVER return raw data
```

**Khi edit file matching path → rule TỰ ĐỘNG inject vào context**

**Nash:**
- ✅ Có PEN entries (hard constraints)
- ❌ PEN = AGENT-level, không phải FILE-level
- ❌ KHÔNG TỰ ĐỘNG attach theo file path

**Gap:** Nash thiếu **file-path-based auto-attachment** của rules

---

### **Vấn đề 2: Claude Prime có Agent Memory (`.claude/agent-memory-local/`)**

**Claude Prime:**
```
.claude/agent-memory-local/the-mechanic/
  ├── MEMORY.md                    # Index (always loaded)
  ├── failed_approaches.md         # What NOT to do
  ├── env_quirks.md                # Runtime gotchas
  └── deps_gotcha.md               # Hidden dependencies
```

**Boundary rules:**
- Skills own framework patterns
- Rules own guardrails
- Project refs own architecture
- **Memory owns runtime-discovered knowledge**

**Nash:**
- ✅ Có 3-tier memory (L2/RAM/HDD)
- ✅ L2 Cache = agent profile (<500 tokens)
- ✅ RAM = tmp/ram/{agent}/*.md (on-demand)
- ❌ KHÔNG CÓ "failed approaches" tracking
- ❌ KHÔNG CÓ "environment quirks" tracking

**Gap:** Nash thiếu **structured memory for runtime discoveries**

---

### **Vấn đề 3: Claude Prime có the-mechanic — Skill auto-discovery**

**Claude Prime the-mechanic workflow:**
```python
def analyze_task(task):
    domains = extract_domains(task)  # "React dashboard" → [frontend, react, charts]
    skills = []
    for domain in domains:
        matches = glob(f".claude/skills/**/{domain}*/SKILL.md")
        skills.extend(matches)
    return skills

# Auto-discovers and COMBINES multiple skills
```

**Nash:**
- ✅ Có 24+ specialized agents
- ✅ Dung PM dispatches đúng agent
- ❌ Agent KHÔNG tự discover skills
- ❌ KHÔNG thể combine multiple skills trong 1 task

**Gap:** Nash thiếu **automatic skill discovery + combination**

---

### **Vấn đề 4: Claude Prime có Priority Hierarchy — Project > Skill > Training**

**Claude Prime:**
```
1. Project rules (.claude/rules/)      ← HIGHEST priority
2. Skill guidelines (.claude/skills/)
3. General best practices (training)   ← LOWEST priority
```

**Example conflict:**
```
Project rule: "Use cn() not clsx()"
Skill says:   "Use clsx() for conditionals"
Training:     "Use classnames or clsx"

→ Agent follows PROJECT RULE
```

**Nash:**
- ✅ PEN entries = hard constraints
- ❌ Không có explicit priority hierarchy
- ❌ Conflict resolution không clear

**Gap:** Nash thiếu **explicit conflict resolution hierarchy**

---

## 🔍 PHÂN TÍCH SÂU: CÁI GÌ THỰC SỰ HỮU ÍCH?

### **1. Path-scoped Rules (HIGH VALUE)**

**Use case:**
```
Editing: src/api/users.ts
  ↓
Auto-inject: .nash/rules/api-response-format.md
  ↓
Agent sees: "MUST use ResponseWrapper<T>"
  ↓
Prevents: Return raw data (common mistake)
```

**Implementation:**
```bash
# Create rule file
.nash/rules/api-response-format.md:
---
paths: ["src/api/**/*.ts", "src/controllers/**/*.ts"]
---
ALL responses MUST use ResponseWrapper<T>

# When agent edits matching file:
# System auto-injects this into context
# BEFORE agent writes code
```

**Why valuable:**
- ⚡ **Proactive prevention** (not reactive PEN)
- ⚡ **File-level precision** (not agent-level)
- ⚡ **No manual checking** (automatic)

**Nash currently:**
- Agent must manually check PEN entries
- PEN = post-violation (after mistake)
- Not file-aware

---

### **2. Runtime Discovery Memory (MEDIUM VALUE)**

**Use case:**
```
Task: "Add Redis cache"
  ↓
Agent tries: redis.set(key, value)
  ↓
FAILS: "Redis requires await in async context"
  ↓
Saves to memory:
  failed_approaches.md:
    "Redis calls MUST be awaited, even in non-async looking code"
  ↓
Next task: Agent checks memory FIRST
  ↓
Doesn't repeat mistake
```

**Implementation:**
```bash
.nash/agent-memory/
  ├── MEMORY.md                    # Index
  ├── failed_approaches.md         # Anti-patterns
  ├── env_quirks.md                # Environment issues
  └── deps_gotcha.md               # Hidden dependencies
```

**Why valuable:**
- 🔄 **Learn from failures** (no repeat mistakes)
- 🔄 **Environment-specific** (can't be in generic skill)
- 🔄 **Accumulates over time** (gets smarter)

**Nash currently:**
- PEN entries capture failures
- But PEN = penalty-focused, not knowledge-focused
- No structured "lessons learned" database

---

### **3. Skill Auto-Discovery (LOW VALUE for Nash)**

**Why LOW value:**
- Nash design = **specialized agents** (Thục, Lan, Mộc)
- Dung PM **already orchestrates** correctly
- Auto-discovery = thêm complexity, không giải quyết vấn đề gì

**Nash approach BETTER:**
```
Task: "Build React dashboard"
  ↓
Dung PM: "Frontend task → dispatch Lan (FE dev)"
  ↓
Lan equipped with:
  - react-vite-patterns skill
  - frontend-security-coder skill
  - playwright-e2e-testing skill
  ↓
Lan executes with all 3 skills
```

**Claude Prime approach:**
```
Task: "Build React dashboard"
  ↓
the-mechanic: Search .claude/skills/ for "react"
  ↓
Finds: react-patterns, vite-config, testing
  ↓
Combines all 3
```

**Verdict:** Nash approach **already better** — specialized agents = clearer responsibility

---

### **4. Priority Hierarchy (MEDIUM VALUE)**

**Use case:**
```
Conflict:
  Project rule: "Never use any type"
  Skill says:  "Use any for external API responses"
  Training:    "Avoid any, prefer unknown"

Without hierarchy:
  → Agent confused, picks randomly

With hierarchy:
  → Project rule wins
  → Agent never uses `any`
```

**Implementation:**
```markdown
# system/CONFLICT_RESOLUTION.md

## Priority Hierarchy

1. **PEN entries** (agent-specific hard constraints) — HIGHEST
2. **Project rules** (.nash/rules/ if we add them)
3. **Skill guidelines** (agents/skills/)
4. **General best practices** (training data) — LOWEST

## Resolution Algorithm
```python
def resolve_conflict(pen, project_rule, skill, training):
    if pen:
        return pen
    elif project_rule:
        return project_rule
    elif skill:
        return skill
    else:
        return training
```

**Why valuable:**
- 🎯 **Deterministic decisions** (no random picks)
- 🎯 **Clear communication** (agent explains why X not Y)
- 🎯 **Debugging easier** (trace decision path)

**Nash currently:**
- PEN > everything (good)
- But no clear hierarchy for skill vs training conflicts

---

## 💎 ĐÁNH GIÁ LẠI: CÁI NÀO THỰC SỰ CẦN?

| Feature | Value for Nash | Effort | Priority |
|---------|----------------|--------|----------|
| **Path-scoped rules** | ⭐⭐⭐⭐⭐ | Medium | **CRITICAL** |
| **Runtime discovery memory** | ⭐⭐⭐⭐☆ | Low | **HIGH** |
| **Priority hierarchy** | ⭐⭐⭐☆☆ | Low | **MEDIUM** |
| **Skill auto-discovery** | ⭐☆☆☆☆ | High | **LOW** (Nash design khác) |
| Greptile enhancement | ⭐⭐☆☆☆ | Low | LOW (đã có rồi, chỉ thiếu doc) |
| Health scoring | ⭐⭐☆☆☆ | Low | LOW (nice-to-have) |
| Team retro | ⭐⭐☆☆☆ | Low | LOW (analytics, không critical) |
| Forced diagrams | ⭐⭐⭐☆☆ | Low | MEDIUM (qua PEN entry) |
| CEO planning enhance | ⭐⭐☆☆☆ | Low | LOW (chỉ thêm framework) |
| Shipping orchestration | ⭐⭐☆☆☆ | Low | LOW (deployment-excellence đã có) |

---

## 🚀 ĐỀ XUẤT MỚI: 3 Features THỰC SỰ Có Giá Trị

### **Feature A: Path-Scoped Rules System**

**What:** Auto-inject rules based on file path being edited

**Why critical:**
- Prevents errors **BEFORE writing code** (not after)
- File-level precision (edit API file → API rules auto-load)
- Zero manual checking overhead

**Implementation:**
```
.nash/rules/
  ├── api-contracts.md              # paths: ["src/api/**/*.ts"]
  ├── rls-security.md               # paths: ["prisma/schema.prisma", "src/db/**/*.ts"]
  └── frontend-patterns.md          # paths: ["src/components/**/*.tsx"]

# System monitors file edits
# Auto-injects matching rules into agent context
# Agent sees rules BEFORE writing code
```

**Effort:** Medium (need file watcher + context injection)

**Impact:** ⭐⭐⭐⭐⭐ Massive — prevents whole classes of errors

---

### **Feature B: Runtime Discovery Memory**

**What:** Structured knowledge base for failed approaches + environment quirks

**Why valuable:**
- Agents **learn from failures** (no repeat mistakes)
- Captures **environment-specific** knowledge (can't be in generic skill)
- Accumulates **over time** (gets smarter)

**Implementation:**
```
.nash/agent-memory/{agent}/
  ├── MEMORY.md                     # Index (always loaded)
  ├── failed_approaches.md          # Anti-patterns learned
  ├── env_quirks.md                 # Runtime environment issues
  └── deps_gotcha.md                # Hidden dependencies

# Example entry:
## Redis Async Gotcha
**Failed:** redis.set(key, value) → hangs
**Why:** Redis client requires await in all contexts
**Fix:** Always use `await redis.set(key, value)`
**Learned:** 2026-03-15, Task #42
```

**Effort:** Low (just structured markdown files)

**Impact:** ⭐⭐⭐⭐☆ High — prevents repeat failures

---

### **Feature C: Conflict Resolution Hierarchy**

**What:** Explicit priority order for conflicting guidance

**Why valuable:**
- **Deterministic** decisions (not random)
- **Explainable** (agent says "I chose X because PEN > skill")
- **Debuggable** (trace decision path)

**Implementation:**
```markdown
# system/CONFLICT_RESOLUTION.md

## Hierarchy (Highest → Lowest)
1. PEN entries (agent-specific constraints)
2. .nash/rules/ (file-path-specific rules) ← NEW
3. Skills (agents/skills/)
4. Training data

## Example Resolution
Task: "Format API response"

Options:
  - PEN entry: (none)
  - Rule (.nash/rules/api-contracts.md): "Use ResponseWrapper<T>"
  - Skill (fastapi-patterns): "Return dict directly"
  - Training: "Use Pydantic models"

→ Agent chooses: ResponseWrapper<T> (rule wins over skill)
→ Logs: "Using ResponseWrapper per .nash/rules/api-contracts.md"
```

**Effort:** Low (documentation + agent instruction)

**Impact:** ⭐⭐⭐☆☆ Medium — improves consistency

---

## 📊 So Sánh: 10 Features Cũ vs 3 Features Mới

| Old (10 features) | Status | Value |
|-------------------|--------|-------|
| Auto-config | Nash has skill factory | Redundant |
| Polymorphic agent | Nash design = specialized agents | Wrong fit |
| Greptile | Nash already has greptile-triage.md | Already done |
| Diff-aware QA | Nash has qa-four-modes | May already exist |
| Health scoring | Nice-to-have | Low priority |
| Shipping | Nash has deployment-excellence | Already done |
| CEO planning | Nash has ceo-taste-validation | Just needs enhancement |
| Forced diagrams | Can enforce via PEN | PEN mechanism enough |
| Browser | Nash has browser-automation | Just verify |
| Team retro | Analytics | Not critical |

**Verdict:** 7/10 already exist, 2/10 wrong fit, 1/10 low priority

---

| New (3 features) | Status | Value |
|------------------|--------|-------|
| **Path-scoped rules** | Nash DOESN'T have | ⭐⭐⭐⭐⭐ CRITICAL |
| **Runtime memory** | Nash DOESN'T have | ⭐⭐⭐⭐☆ HIGH |
| **Conflict hierarchy** | Nash has partial (PEN only) | ⭐⭐⭐☆☆ MEDIUM |

**Verdict:** 3/3 are REAL gaps, HIGH value

---

## 🎯 REVISED PROPOSAL

### **Phase 1: Path-Scoped Rules (Week 1-2)**

**Goal:** Auto-inject file-specific rules

**Tasks:**
1. Create `.nash/rules/` directory
2. Port 3 critical rules from PEN entries:
   - `api-contracts.md` (API response format)
   - `rls-security.md` (NOBYPASSRLS, SET LOCAL)
   - `frontend-state.md` (React state management)
3. Implement file watcher:
   ```javascript
   // system/rule_injector.js
   function getMatchingRules(filePath) {
     const rules = glob('.nash/rules/*.md');
     return rules.filter(rule => {
       const paths = rule.frontmatter.paths;
       return paths.some(pattern => minimatch(filePath, pattern));
     });
   }
   ```
4. Test: Edit API file → verify rule auto-injected

**Success criteria:**
- Editing `src/api/users.ts` → `api-contracts.md` auto-loads
- Agent prevents wrong response format BEFORE writing
- Zero manual PEN checking overhead

---

### **Phase 2: Runtime Discovery Memory (Week 3-4)**

**Goal:** Capture failed approaches + environment quirks

**Tasks:**
1. Create `.nash/agent-memory/` structure
2. Define memory schema:
   ```markdown
   ## {Title}
   **Symptom:** {What went wrong}
   **Root cause:** {Why it failed}
   **Fix:** {How to do it correctly}
   **Learned:** {Date}, Task #{ID}
   ```
3. Agent instruction: "After P1+ failure, save to memory"
4. Agent instruction: "Before task, check memory for relevant patterns"

**Success criteria:**
- Failure happens once → saved to memory
- Same failure attempted → agent checks memory first → prevented
- Memory accumulates 10+ entries over 2 weeks

---

### **Phase 3: Conflict Resolution Hierarchy (Week 5-6)**

**Goal:** Deterministic conflict resolution

**Tasks:**
1. Create `system/CONFLICT_RESOLUTION.md`
2. Update agent instructions:
   ```markdown
   When guidance conflicts:
   1. Check PEN entries first
   2. Check .nash/rules/ (if file path matches)
   3. Check equipped skills
   4. Fall back to training data

   ALWAYS log decision: "Chose X per {source}"
   ```
3. Test with intentional conflicts

**Success criteria:**
- 10 conflict scenarios → 10 consistent resolutions
- Agent explains choice in logs
- No "random" decisions

---

## 🔑 KEY INSIGHT

**Sai lầm ban đầu:**
Tôi so sánh Nash vs Claude Prime **theo features list** → đề xuất 10 features

**Nhưng thực tế:**
- Nash ĐÃ CÓ 90% features (qua skills)
- Nash design KHÁC (specialized agents, không cần polymorphic)
- Nash thiếu **MECHANISMS**, không phải features:
  1. File-path-based auto-attachment (mechanism)
  2. Runtime knowledge accumulation (mechanism)
  3. Conflict resolution protocol (mechanism)

**Đề xuất mới:**
Thêm **3 mechanisms** thay vì **10 features** → impact lớn hơn, effort ít hơn

---

## 🤔 Câu Hỏi Cho Bạn

1. **Path-scoped rules** có hữu ích không?
   - Auto-inject rules khi edit file matching path
   - Prevents errors BEFORE writing code

2. **Runtime memory** có giải quyết vấn đề thực tế không?
   - Lưu failed approaches
   - Agents học từ failures, không lặp lại

3. **Conflict hierarchy** có cần thiết không?
   - Hoặc PEN entries đã đủ?

Bạn thấy 3 mechanisms này có ý nghĩa hơn 10 features ban đầu không?

---

*Gap Analysis | Focus on REAL gaps, not feature lists | 3 mechanisms > 10 features*