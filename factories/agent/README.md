# 🏭 AGENT FACTORY

> **DEPRECATED PATH WARNING:** The `agent_factory/` directory is now a backward-compatibility symlink. Please use `factories/agent/` for all new references. This symlink will be maintained for existing code but should not be used in new implementations.

## Nhà Máy Sản Xuất AI Agents - Nash Framework

**Tóm tắt 1 dòng:** Tạo, nâng cấp, và sửa lỗi AI agents trong 10-60 phút.

---

## 🎯 Nhà máy này làm gì?

### Agent là gì?

**Agent = Personality (SOUL) + Skills + Cognitive Modes**

Ví dụ thực tế:

```
🧑‍💼 Agent: Phúc SA (Solutions Architect)
├── 🎭 SOUL: "Cathedral Architect"
│   └── Tính cách: Kiên nhẫn, tỉ mỉ, paranoid về nền móng
├── ⚙️ Skills:
│   ├── Architecture Design (workflow thiết kế)
│   ├── Contract Drafting (checklist viết contracts)
│   └── DB Schema Review (review database schema)
└── 🧠 Cognitive Modes:
    ├── EXPANSION: Suy nghĩ 10-star product (tốn 15K tokens)
    ├── HOLD: Validate contracts nghiêm ngặt (10K tokens)
    └── REDUCTION: Cắt scope xuống MVP (5K tokens)
```

---

## 🚀 Quick Start

### Tôi muốn tạo agent mới (10 phút)

```bash
# Bước 1: Copy template
cp 1_SOUL_CREATION/SOUL_TEMPLATE.md agents/souls/my-agent.md

# Bước 2: Điền thông tin
# - Role: "Bạn là bác sĩ phẫu thuật, không phải mechanic sửa xe"
# - Mental Model: "Isolate → Hypothesis → Test → Fix"
# - Values: "Precision > Speed"

# Bước 3: Tạo agent
node bin/nash create-agent my-debugger
  → Chọn SOUL: surgical-debugger
  → Chọn archetype: Critic
  → Done!
```

**Hoặc dùng nash CLI:**

```bash
nash create-agent bug-hunter \
  --soul surgical-debugger \
  --archetype Critic \
  --skills debugging-excellence,root-cause-analysis
```

---

### Tôi cần sửa agent bị lỗi (15 phút)

```bash
# Khi agent làm sai → có PEN entry (Penalty log)
# Agent Factory tự động:
#   1. Đọc PEN entries
#   2. Generate regression tests
#   3. Fix skills
#   4. Verify không lặp lại

# Chạy:
/sharpen agents/core/phuc-sa.md

# Output:
# ✅ Fixed PEN-001 (missing RLS check)
# ✅ Fixed PEN-002 (forgot file attachment)
# ✅ 100% pass rate (5/5 tests)
```

---

### Tôi muốn nâng cấp toàn bộ agents (60 phút)

```bash
# Upgrade lên 2026 industry standards
# → Token giảm 60-80%
# → Workflows tối ưu

# Chạy:
/upgrade-agent agents/core/phuc-sa.md --mode proactive

# Output:
# Before: 5000 tokens/boot
# After:  1500 tokens/boot (-70%)
# Patterns applied: ReAct, Plan-and-Execute, Memory Hierarchy
```

---

## 📂 Cấu Trúc Nhà Máy

```
agent_factory/
│
├── 📘 AGENT_BUILDING_MASTER_GUIDE.md   ← ĐỌC ĐẦU TIÊN (roadmap tổng)
├── 📄 README.md                         ← File này
│
├── 1️⃣ 1_SOUL_CREATION/                 ← TẠO PERSONALITY
│   ├── SOUL_TEMPLATE.md                 ← Template (copy & paste)
│   └── references/
│       ├── soul_catalog.md              ← 5 SOULs có sẵn
│       └── soul_archetypes.md           ← 5 archetypes giải thích
│
├── 2️⃣ 2_AGENT_CREATION/                 ← LẮP RÁP AGENT
│   ├── agent_creator_guide.md           ← Hướng dẫn từng bước
│   └── references/
│       └── agent_composition_guide.md   ← Combine SOUL + Skills + Modes
│
├── 3️⃣ 3_AGENT_SHARPENING/               ← SỬA LỖI & NÂNG CẤP
│   ├── sharpener_reactive/              ← Sửa lỗi từ PEN entries
│   │   └── SKILL.md                     ← Tool tự động sửa bugs
│   ├── sharpener_proactive/             ← Upgrade theo 2026 standards
│   │   └── SKILL.md                     ← Tool audit & optimize
│   └── sharpening_decision_tree.md      ← Dùng cái nào khi nào?
│
└── 4️⃣ 4_COGNITIVE_MODE_OPTIMIZATION/    ← TỐI ƯU MODES
    └── references/
        └── mode_selection_guide.md      ← EXPANSION vs HOLD vs REDUCTION
```

---

## 🎓 Học Theo Cấp Độ

### Level 0: Hiểu Agent Là Gì (10 phút)

**Đọc:** [AGENT_BUILDING_MASTER_GUIDE.md](AGENT_BUILDING_MASTER_GUIDE.md) - Section "Level 0"

**Hiểu được:**
- Agent = SOUL (WHO) + Skills (WHAT) + Modes (HOW)
- SOUL thay đổi ít, Skills thay đổi nhiều
- 5 archetypes: Strategist, Critic, Builder, Analyst, Operator

---

### Level 1: Tạo SOUL (20 phút)

**Đọc:** [1_SOUL_CREATION/SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md)

**Làm được:**
- Tạo personality cho agent
- Chọn archetype phù hợp
- Định nghĩa mental models, core values
- Viết adversarial posture (Nash Triad)

**Ví dụ:**
```markdown
## 🎭 SOUL: Cathedral Architect

**You are not** a generic software architect.
**You are** a cathedral builder — patient, systematic, paranoid about foundations.

**Core Values:**
1. Security > Speed
2. Explicit > Implicit
3. Reversible > Irreversible

**Adversarial Posture vs Mộc (Critic):**
- Provide FULL context (schema, migrations, error codes)
- Never say "trust me" — show evidence
```

---

### Level 2: Tạo Agent Hoàn Chỉnh (30 phút)

**Đọc:** [2_AGENT_CREATION/agent_creator_guide.md](2_AGENT_CREATION/agent_creator_guide.md)

**Làm được:**
- Combine SOUL + Skills + Cognitive Modes
- Thêm PEN/WIN memory
- Configure tools (Bash, Read, Write...)
- Viết boot protocol

**Ví dụ:**
```markdown
## ⚙️ SKILLS

**Skill 1: Architecture Design**
- Trigger: User requests module architecture
- Preconditions:
  1. Check spec exists? If NO → STOP
  2. Check acceptance criteria clear? If NO → STOP
- Workflow: [5 steps with tables & checklists]
- Assertions: [Auto-testable checks]

## 🧠 COGNITIVE MODES

**EXPANSION mode:** When exploring product vision
**HOLD mode:** When validating contracts (default)
**REDUCTION mode:** When optimizing scope to MVP
```

---

### Level 3: Sửa Lỗi & Nâng Cấp (45 phút)

#### 3A. Reactive Sharpening (PEN/WIN-based)

**Khi nào:** Agent có PEN entries (lỗi production)

**Đọc:** [sharpener_reactive/SKILL.md](3_AGENT_SHARPENING/sharpener_reactive/SKILL.md)

**Làm được:**
- Đọc PEN entries từ MEMORY.md
- Auto-generate regression tests
- Apply 5 enhancement strategies:
  1. **Prime Directive** - Add rule cụ thể
  2. **Escape Hatch** - Add early exit
  3. **Table** - Force completeness
  4. **Suppression** - Anti-noise lists
  5. **Philosophy** - Strengthen identity
- Verify 100% pass rate

**Ví dụ PEN entry:**
```markdown
### PEN-001 | 2026-03-15 | T2_34
- **Incident:** Phúc SA forgot to attach schema.prisma when calling Mộc
- **Root cause:** No checklist for file completeness
- **Principle:** ALWAYS attach [schema, migrations, contracts] before calling reviewer
- **Status:** ACTIVE
```

**After sharpening:**
```markdown
### PEN-001 | 2026-03-15 | T2_34
- **Status:** FIXED
- **Fix:** Added file completeness table + escape hatch
- **Test:** 4/4 assertions pass
```

---

#### 3B. Proactive Sharpening (Industry Standards)

**Khi nào:** Quarterly upgrade, token bloat (>500 tokens), new patterns available

**Đọc:** [sharpener_proactive/SKILL.md](3_AGENT_SHARPENING/sharpener_proactive/SKILL.md)

**Làm được:**
- Audit against 5 core principles:
  1. Context is Fuel (60-80% token reduction)
  2. Single Responsibility (70% savings)
  3. Adversarial Validation (Nash Triad)
  4. Memory Hierarchy (L2/RAM/HDD = 85% savings)
  5. Clear Boundaries (immutable contracts)
- Apply 9 workflow patterns (ReAct, Plan-and-Execute, Critic/Reflection...)
- Token optimization 6-layer defense
- Validate improvements

**Ví dụ token savings:**
```
Before: 5000 tokens/boot
├── SOUL embedded: 2000 tokens
├── Skills embedded: 2500 tokens
└── Memory embedded: 500 tokens

After: 1500 tokens/boot (-70%)
├── SOUL referenced: 200 tokens (link to file)
├── Skills referenced: 300 tokens (lazy load)
└── Memory L2 only: 1000 tokens (RAM on-demand)
```

---

### Level 4: Cognitive Mode Optimization (30 phút)

**Đọc:** [4_COGNITIVE_MODE_OPTIMIZATION/references/mode_selection_guide.md](4_COGNITIVE_MODE_OPTIMIZATION/references/mode_selection_guide.md)

**Làm được:**
- Hiểu khi nào EXPANSION/HOLD/REDUCTION
- Config mode switching logic
- Measure token savings

**Ví dụ:**
```markdown
## 🧠 COGNITIVE MODES

**EXPANSION mode (15K tokens):**
- Trigger: Product direction, new domain
- Mental model: "10-star platonic ideal"
- Use case: /plan-ceo-review

**HOLD mode (10K tokens):**
- Trigger: Architecture, contracts
- Mental model: "Rigorous boundary checking"
- Use case: /plan-eng-review (default)

**REDUCTION mode (5K tokens):**
- Trigger: Clear spec, fast execution
- Mental model: "Surgical cuts to MVP"
- Use case: /ship
```

---

## 🛣️ Chọn Con Đường Của Bạn

### 🏃 Path 1: Tạo Agent Ngay (10 phút)

**Mục tiêu:** Agent hoạt động được, không cần perfect

1. Copy [SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md)
2. Điền Role, Mental Model, 3 Core Values
3. Chọn archetype từ [soul_archetypes.md](1_SOUL_CREATION/references/soul_archetypes.md)
4. Add 2-3 skills
5. Done!

**Output:** Working agent với basic personality

---

### 🏗️ Path 2: Agent Production-Quality (60 phút)

**Mục tiêu:** Agent đạt chuẩn Nash Framework

1. Đọc [AGENT_BUILDING_MASTER_GUIDE.md](AGENT_BUILDING_MASTER_GUIDE.md) Level 0-2
2. Dùng [SOUL_TEMPLATE.md](1_SOUL_CREATION/SOUL_TEMPLATE.md) đầy đủ:
   - Role & Identity (vivid metaphor)
   - Mental Models & Modes
   - Core Values (với priority ordering)
   - Adversarial Posture
   - Personality Traits
3. Follow [agent_creator_guide.md](2_AGENT_CREATION/agent_creator_guide.md)
4. Review với `../agents/AGENT_TEMPLATE_V2.md` checklist
5. Test với real task

**Output:** Production-ready agent

---

### 🔧 Path 3: Sửa Agent Bị Lỗi (15-30 phút)

**Mục tiêu:** Fix PEN entries, prevent regression

1. Đọc [when_to_sharpen.md](3_AGENT_SHARPENING/references/when_to_sharpen.md)
2. Run reactive sharpening:
   ```bash
   /sharpen agents/core/phuc-sa.md
   ```
3. Tool tự động:
   - Generate tests từ PEN
   - Apply enhancements
   - Verify pass rate
4. Commit với SHARPENING_LOG

**Output:** Fixed agent + regression tests

---

### ⚡ Path 4: Nâng Cấp Toàn Bộ (60 phút/agent)

**Mục tiêu:** Upgrade lên 2026 standards, giảm 60-80% tokens

1. Đọc [sharpening_decision_tree.md](3_AGENT_SHARPENING/sharpening_decision_tree.md)
2. Run proactive sharpening
3. Audit 5 principles
4. Apply workflow patterns
5. Optimize tokens (6-layer defense)
6. Validate & document

**Output:** Modernized agent với 60-80% token reduction

---

## 📊 Bảng Tra Cứu Nhanh

| Tôi muốn... | Đọc file này | Thời gian |
|-------------|--------------|-----------|
| Hiểu agent là gì | AGENT_BUILDING_MASTER_GUIDE.md Level 0 | 10 phút |
| Tạo SOUL | 1_SOUL_CREATION/SOUL_TEMPLATE.md | 20 phút |
| Chọn archetype | soul_archetypes.md | 5 phút |
| Tạo agent hoàn chỉnh | 2_AGENT_CREATION/agent_creator_guide.md | 30 phút |
| Sửa lỗi (PEN) | 3_AGENT_SHARPENING/sharpener_reactive/ | 15-30 phút |
| Upgrade 2026 | 3_AGENT_SHARPENING/sharpener_proactive/ | 60 phút |
| Dùng reactive hay proactive? | sharpening_decision_tree.md | 5 phút |
| Optimize modes | 4_COGNITIVE_MODE_OPTIMIZATION/ | 30 phút |

---

## 🧪 Ví Dụ Thực Tế

### Ví dụ 1: Tạo "Surgical Debugger" Agent

```bash
# Bước 1: Tạo SOUL
cat > agents/souls/surgical-debugger.md <<EOF
---
soul_id: surgical-debugger
compatible_archetypes: [Critic, Analyst]
core_values: [Evidence > Guessing, Isolation > Shotgun]
---

# Surgical Debugger Soul

**You are not** a mechanic hitting random parts until it works.
**You are** a surgeon — precise, methodical, evidence-based.

## Mental Model
1. Isolate the symptom
2. Form hypothesis
3. Design minimal test
4. Fix root cause (not symptom)

## Core Values
1. **Evidence > Guessing** - No "try this" without diagnosis
2. **Isolation > Shotgun** - Reproduce in minimal environment
3. **Root Cause > Quick Fix** - Fix disease, not symptom
EOF

# Bước 2: Tạo agent
nash create-agent surgical-debugger \
  --soul surgical-debugger \
  --archetype Critic \
  --skills debugging-excellence,root-cause-analysis

# Bước 3: Test
claude --agent agents/dev/surgical-debugger.md "Debug race condition in user login"
```

**Output:**
```
Agent: surgical-debugger
├── SOUL: ../../agents/souls/surgical-debugger.md
├── Skills:
│   ├── debugging-excellence
│   └── root-cause-analysis
└── Mode: HOLD (rigor mode)

[Agent performs systematic debugging with evidence]
```

---

### Ví dụ 2: Sharpen Agent Có PEN Entry

**Tình huống:** Phúc SA quên attach schema.prisma khi gọi Mộc reviewer

**MEMORY.md trước:**
```markdown
### PEN-001 | 2026-03-15 | T2_34
- **Incident:** Mộc rejected review vì thiếu schema.prisma
- **Root cause:** Phúc SA không check file completeness
- **Principle:** ALWAYS attach [schema, migrations, contracts]
- **Status:** ACTIVE
```

**Chạy sharpener:**
```bash
/sharpen agents/core/phuc-sa.md
```

**Tool tự động làm:**
1. Extract PEN-001
2. Generate test case:
   ```json
   {
     "test_id": "PEN-001-regression",
     "scenario": "Architecture design for new module",
     "assertions": [
       "schema.prisma attached before calling reviewer",
       "migrations/ folder attached",
       "CONTRACT_DRAFT.md complete"
     ]
   }
   ```
3. Apply enhancement (Table strategy):
   ```markdown
   ## Step 3: Call Reviewer

   **File Completeness Checklist:**
   | Required File | Purpose | Status |
   |---------------|---------|--------|
   | schema.prisma | Data model | [ ] |
   | migrations/   | DB changes | [ ] |
   | CONTRACT_DRAFT.md | API contracts | [ ] |

   **Rule:** ALL must have ✓ before calling reviewer. Any [ ] = STOP.
   ```
4. Run test → 4/4 pass
5. Mark PEN-001 as FIXED

**MEMORY.md sau:**
```markdown
### PEN-001 | 2026-03-15 | T2_34
- **Status:** FIXED (2026-03-16)
- **Fix:** Added file completeness table + escape hatch
- **Test:** 4/4 assertions pass
- **Regression test:** sharpening-workspace/phuc-sa/PEN-001.json
```

---

### Ví dụ 3: Proactive Upgrade (Token Optimization)

**Agent trước upgrade:**
```markdown
# phuc-sa.md (5000 tokens)

## SOUL (2000 tokens - embedded)
[400 lines of personality, mental models, values...]

## SKILLS (2500 tokens - embedded)
### Skill 1: Architecture Design (500 tokens)
[Full workflow embedded...]

### Skill 2: Contract Drafting (400 tokens)
[Full workflow embedded...]

[5 more skills...]

## MEMORY (500 tokens)
[10 PEN entries, 5 WIN entries...]
```

**Chạy proactive sharpening:**
```bash
/upgrade-agent agents/core/phuc-sa.md --mode proactive
```

**Tool audit:**
```
❌ Principle 1: Context is Fuel
   - SOUL embedded (2000 tokens) → Should reference
   - Skills embedded (2500 tokens) → Should lazy-load

❌ Principle 4: Memory Hierarchy
   - All memory in L2 → Should use RAM tier

✅ Principle 2: Single Responsibility (already good)
✅ Principle 3: Adversarial Validation (already good)
✅ Principle 5: Clear Boundaries (already good)

Recommendations:
1. Extract SOUL to agents/souls/cathedral-architect.md (-1800 tokens)
2. Reference skills instead of embed (-2200 tokens)
3. Move old PEN entries to RAM (-300 tokens)

Expected savings: -4300 tokens (-86%)
```

**Agent sau upgrade:**
```markdown
# phuc-sa.md (700 tokens)

## SOUL
**SOUL:** ../../agents/souls/cathedral-architect.md

## SKILLS
**SKILL:** ../../agents/skills/architecture-design/SKILL.md
**SKILL:** ../../agents/skills/contract-drafting/SKILL.md

## MEMORY (L2 Cache only - 500 tokens)
### Active PEN Entries (2)
[Only 2 recent PEN entries...]

### WIN Patterns (3)
[Only 3 key WIN patterns...]

## REFERENCE MEMORY (RAM Tier)
**Load when needed:**
- tmp/ram/phuc-sa/old-pens.md (8 old PEN entries)
- tmp/ram/phuc-sa/lessons.md (architecture lessons)
```

**Kết quả:**
- Before: 5000 tokens/boot
- After: 700 tokens/boot
- **Savings: -86%**

---

## ❓ FAQ

### Fark giữa Agent Factory và Skill Factory?

| | Agent Factory | Skill Factory |
|---|---------------|---------------|
| **Tạo gì?** | Agents (Personality + Skills) | Skills (Workflows only) |
| **Format** | `agents/core/{name}.md` | `agents/skills/{name}/SKILL.md` |
| **Chứa gì?** | SOUL + Skills + Modes + Memory | Workflow + Checklist + Tests |
| **Dùng khi nào?** | Cần AI với personality riêng | Cần workflow tái sử dụng |

**Quan hệ:** Agents SỬ DỤNG skills. Agents = SOUL + Skills + Modes.

---

### Khi nào dùng Reactive vs Proactive Sharpening?

| Tình huống | Dùng | Lý do |
|------------|------|-------|
| Agent có 3+ PEN entries | Reactive | Fix bugs cụ thể |
| Production incident | Reactive | Emergency fix |
| Quarterly upgrade | Proactive | Apply new patterns |
| Token bloat (>500 L2) | Proactive | Optimize memory |
| New workflow patterns available | Proactive | Modernize |

**Best practice:** Dùng CẢ HAI
- Reactive: Sửa bugs ngay khi xảy ra
- Proactive: Upgrade quarterly (3 tháng/lần)

---

### Bao lâu sharpen 1 lần?

**Reactive triggers (sửa ngay):**
- P0 penalty (production bug)
- 3+ active PEN entries
- Repeated bug pattern

**Proactive triggers (định kỳ):**
- Quarterly (3 tháng/lần)
- Token bloat (>500 tokens L2)
- New patterns available (ví dụ: gstack patterns)

**Emergency:**
- Production incident → Reactive ngay lập tức

---

### Có thể reuse SOUL không?

**CÓ!** Đó là mục đích chính.

**Ví dụ:**
- SOUL `cathedral-architect` → Dùng cho:
  - Phúc SA (System Architect)
  - Hiếu (Infrastructure Architect)
  - Quang (Database Architect)

**Lợi ích:**
- 5 SOULs → 20+ agents
- Update 1 SOUL → Tất cả agents đều update
- Token savings: 400 × (N-1) per SOUL

Xem [soul_catalog.md](1_SOUL_CREATION/references/soul_catalog.md) cho 5 SOULs có sẵn.

---

### Target token cho L2 Cache?

**<500 tokens per agent** (L2 Cache = luôn load)

**Breakdown:**
- SOUL: ~200 tokens (personality)
- Skills: ~200 tokens (key workflows + active PEN/WIN)
- Tools/Memory: ~100 tokens (references to RAM/HDD)

**Nếu >500 tokens:**
- Extract SOUL → `agents/souls/{name}.md`
- Reference skills → `agents/skills/{name}/SKILL.md`
- Move old PEN/WIN → `tmp/ram/{agent}/old-memory.md`

---

### Phải đọc hết documents không?

**KHÔNG!** Start với [AGENT_BUILDING_MASTER_GUIDE.md](AGENT_BUILDING_MASTER_GUIDE.md), rồi chọn path theo mục tiêu:

| Mục tiêu | Đọc |
|----------|-----|
| Tạo agent nhanh (10 phút) | SOUL_TEMPLATE.md |
| Agent production (60 phút) | MASTER_GUIDE Level 0-2 |
| Sửa bugs | sharpener_reactive/ |
| Upgrade toàn bộ | sharpener_proactive/ |

---

## 🎯 Roadmap Học (Khuyến Nghị)

### Tuần 1: Foundation
1. Đọc AGENT_BUILDING_MASTER_GUIDE.md (30 phút)
2. Study soul_archetypes.md (10 phút)
3. Tạo 1 agent từ SOUL_TEMPLATE.md (20 phút)
4. Test với simple task

**Milestone:** 1 working agent ✅

---

### Tuần 2: Production Quality
1. Đọc agent_creator_guide.md (30 phút)
2. Study agent_composition_guide.md (20 phút)
3. Tạo 3 production agents (Critic, Builder, Analyst)
4. Setup Nash Triad (Thesis/Anti-Thesis/Synthesis)

**Milestone:** 3 production agents trong Nash Triad ✅

---

### Tuần 3: Sharpening
1. Đọc sharpening_decision_tree.md (10 phút)
2. Đọc when_to_sharpen.md (10 phút)
3. Practice reactive sharpening (30 phút)
4. Practice proactive sharpening (60 phút)

**Milestone:** Biết cách fix & upgrade agents ✅

---

### Tuần 4: Advanced
1. Đọc mode_selection_guide.md (30 phút)
2. Study `../system/COGNITIVE_MODES.md` (45 phút)
3. Optimize agents cho EXPANSION/HOLD/REDUCTION modes
4. Measure token savings

**Milestone:** Optimized agent suite với mode switching ✅

---

## 🔗 Liên Kết Quan Trọng

### Documents trong Agent Factory
- [AGENT_BUILDING_MASTER_GUIDE.md](AGENT_BUILDING_MASTER_GUIDE.md) - START HERE
- [1_SOUL_CREATION/](1_SOUL_CREATION/) - SOUL templates & examples
- [2_AGENT_CREATION/](2_AGENT_CREATION/) - Agent creator guide
- [3_AGENT_SHARPENING/](3_AGENT_SHARPENING/) - Reactive & Proactive sharpening
- [4_COGNITIVE_MODE_OPTIMIZATION/](4_COGNITIVE_MODE_OPTIMIZATION/) - Mode optimization

### Related Factories
- [Skill Factory](../skill_factory/) - Tạo skills (workflows chỉ, không có personality)
- [Nash CLI](../bin/nash) - Command-line tools

### System Documentation
- [AGENT_TEMPLATE_V2.md](../agents/AGENT_TEMPLATE_V2.md) - Production template
- [COGNITIVE_MODES.md](../system/COGNITIVE_MODES.md) - Mode switching spec
- [NASH.md](../system/NASH.md) - Nash Triad rules
- [SCORING_RULES.md](../system/SCORING_RULES.md) - P0-P4 penalty system

---

## ✅ Success Criteria

Sau khi hoàn thành curriculum này, bạn sẽ:

- ✅ Tạo agent mới trong 10 phút (basic)
- ✅ Tạo production-quality agent trong 60 phút
- ✅ Sửa failing agent với PEN entries trong 15-30 phút
- ✅ Upgrade agent lên 2026 standards trong 60 phút
- ✅ Quyết định khi nào dùng reactive vs proactive
- ✅ Optimize cognitive modes (EXPANSION/HOLD/REDUCTION)
- ✅ Đạt 60-80% token reduction qua 6-layer optimization
- ✅ Reuse SOULs across agents (5 SOULs → 20+ agents)

---

## 🚀 Bắt Đầu Ngay

### Ngay bây giờ (2 phút):
```bash
cd agent_factory
cat AGENT_BUILDING_MASTER_GUIDE.md | head -100
```

### Hôm nay (30 phút):
1. Đọc AGENT_BUILDING_MASTER_GUIDE.md Levels 0-1
2. Study soul_archetypes.md
3. Tạo SOUL đầu tiên từ SOUL_TEMPLATE.md

### Tuần này (3 giờ):
1. Đọc agent_creator_guide.md
2. Tạo 3 production agents
3. Test với real tasks
4. Practice sharpening 1 agent

---

**Welcome to the Agent Factory! 🏭**

**START HERE:** [AGENT_BUILDING_MASTER_GUIDE.md](AGENT_BUILDING_MASTER_GUIDE.md)

---

*Nash Agent Framework v3.0 | Agent Factory | Last updated: 2026-03-16*
