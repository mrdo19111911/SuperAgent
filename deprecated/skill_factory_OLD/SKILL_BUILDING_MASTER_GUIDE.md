# SKILL BUILDING MASTER GUIDE
## Complete Documentation Map - From Beginner to Master

**Updated:** 2026-03-16
**Purpose:** Roadmap to build 100+ skills at gstack quality level

---

## 📚 DOCUMENTATION HIERARCHY

### LEVEL 0: Understanding (READ FIRST!)

**Start here if:** Bạn chưa biết skill là gì

📄 **[SKILL_EXPLAINED.md](SKILL_EXPLAINED.md)** - Giải thích cơ bản
- ✅ Skill = gì? (95% chỉ là 1 file .md!)
- ✅ 3 loại skill: Pure Markdown / With Helpers / With Binary
- ✅ Tại sao `/browse` phức tạp còn `/ship` đơn giản
- ✅ Template 60 giây tạo skill đầu tiên

**Time:** 5 phút đọc

---

### LEVEL 1: Structure (HOW TO BUILD)

**Start here if:** Đã hiểu skill là gì, cần biết cấu trúc file

📄 **[SKILL_STANDARD_V2.md](system/templates/SKILL_STANDARD_V2.md)** - Chuẩn mực cấu trúc
- ✅ YAML front matter (allowed-tools = firewall)
- ✅ Numbered workflow steps
- ✅ Khi nào tách file (>15KB rule)
- ✅ 3 skill types với tỉ lệ đúng (95% / 4% / 1%)
- ✅ Template tối giản (analyze-security example)
- ✅ Quality checklist

**Time:** 15 phút đọc

---

### LEVEL 2: Writing Quality (HOW TO WRITE WELL)

**Start here if:** Đã biết cấu trúc, cần nâng chất lượng nội dung

📄 **[GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md)** - 12 nguyên tắc viết hay ⭐ **CORE**
- ✅ **Philosophy** - Role-play vivid (cathedral/surgeon)
- ✅ **Prime Directives** - Cụ thể > mơ hồ
- ✅ **Tables** - Force completeness (error/rescue map)
- ✅ **Multi-Path** - Happy + Nil + Empty + Error
- ✅ **Specific > Vague** - Concrete examples
- ✅ **Escape Hatches** - Early exit với **STOP**
- ✅ **Two-Pass** - CRITICAL → INFORMATIONAL
- ✅ **Suppressions** - Anti-noise lists
- ✅ **Priority Hierarchy** - Never skip X
- ✅ **Concrete Examples** - Real bugs not abstract
- ✅ **Terse Output** - One line problem, one line fix
- ✅ **Meta-Instructions** - Stopping policy

**Time:** 30 phút đọc + practice

---

### LEVEL 3: Advanced Patterns (FOR COMPLEX SKILLS)

**Start here if:** Cần build complex skills (browser automation, persistent state, testing automation)

📄 **[GSTACK_ADVANCED_PATTERNS.md](GSTACK_ADVANCED_PATTERNS.md)** - 6 advanced patterns ⭐ **NEW**
- ✅ **Cognitive Mode Switching** - One Feature, Five Modes workflow
- ✅ **Persistent State Architecture** - Browse daemon (3s → 100ms), state files, random ports
- ✅ **Ref System (@e1, @e2)** - Accessibility tree → Playwright Locators
- ✅ **3-Tier Eval Strategy** - Free static + $4 E2E + $0.15 LLM judge
- ✅ **Greptile Integration** - Automated PR review triage + learning
- ✅ **/qa's 4 Modes** - Diff-aware / Full / Quick / Regression testing

**Source:** gstack-guide.vercel.app (Vietnamese translation by Minh Đỗ)
**Time:** 45 phút đọc

---

### LEVEL 4: Mass Production (HOW TO SCALE)

**Start here if:** Đã viết được 1-2 skills chất lượng, cần scale lên 100+

📄 **[MANUFACTURING_GUIDE.md](MANUFACTURING_GUIDE.md)** - Quy trình sản xuất hàng loạt
- ✅ 3 server patterns (persistent/stateless/hybrid)
- ✅ CircularBuffer cho logs
- ✅ State management patterns
- ✅ Testing strategy (unit/integration/E2E)
- ✅ Build & distribution
- ✅ Shared libraries (_shared/ folder)
- ✅ install-skills.sh (mass install)

**Time:** 1 giờ đọc

---

### LEVEL 5: Deep Analysis (REFERENCE)

**Start here if:** Muốn hiểu sâu kiến trúc gstack từng phần

📄 **HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ (3 parts + INDEX)** - Phân tích chi tiết
- **[PART1](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART1.md)** - Infrastructure (build toolchain, browse architecture, state management)
- **[PART2](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART2.md)** - UX Patterns + Anti-patterns (prompt engineering, user interaction)
- **[PART3](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART3.md)** - Requirements Gaps + Blueprint + Nash Adaptation
- **[INDEX](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md)** - Quick reference tra cứu

**Purpose:** Deep dive khi cần hiểu 1 topic cụ thể (vd: port collision math, ref invalidation)
**Time:** 2-3 giờ đọc hết

---

### BONUS: Ready-to-Use Template

📁 **[SKILL_TEMPLATE/](SKILL_TEMPLATE/)** - Copy-paste scaffold
- ✅ SKILL.md với 8 sections
- ✅ src/cli.ts (persistent + stateless patterns)
- ✅ src/server.ts (HTTP server, auth, graceful shutdown)
- ✅ package.json, setup script, .gitignore
- ✅ test/ structure

**Usage:**
```bash
cp -r SKILL_TEMPLATE ~/.claude/skills/my-new-skill
cd ~/.claude/skills/my-new-skill
# Edit SKILL.md, src/cli.ts, src/server.ts
./setup
```

---

## 🎯 LEARNING PATH BY GOAL

### Goal 1: "Tôi muốn tạo skill đơn giản NGAY (5 phút)"

**Path:**
1. Đọc [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) - Section "Template Tối Giản"
2. Copy template 60 giây
3. Sửa workflow theo nhu cầu
4. Xong!

**Output:** 1 skill hoạt động được (pure markdown)

---

### Goal 2: "Tôi muốn skill chất lượng gstack (30 phút)"

**Path:**
1. Đọc [SKILL_STANDARD_V2.md](system/templates/SKILL_STANDARD_V2.md) - Hiểu cấu trúc
2. Đọc [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - Học 12 nguyên tắc
3. Áp dụng template cuối GSTACK_WRITING_STYLE.md
4. Self-review với checklist trong SKILL_STANDARD_V2.md

**Output:** 1 skill đạt chuẩn gstack (có Philosophy, Tables, Two-Pass, Suppressions...)

---

### Goal 3: "Tôi muốn build complex skill (browser automation, persistent state)"

**Path:**
1. Đọc [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - 12 principles first
2. Đọc [GSTACK_ADVANCED_PATTERNS.md](GSTACK_ADVANCED_PATTERNS.md) - 6 advanced patterns
3. Study specific pattern (e.g., Persistent State Architecture)
4. Apply to your use case (browser, ML model, database connection)
5. Implement 3-tier eval strategy
6. Test with real scenarios

**Output:** 1 complex skill với robust architecture

---

### Goal 4: "Tôi muốn build 100 skills (1 tuần)"

**Path:**
1. Đọc [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) - Foundation
2. Đọc [SKILL_STANDARD_V2.md](system/templates/SKILL_STANDARD_V2.md) - Structure
3. Đọc [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - Quality
4. Đọc [MANUFACTURING_GUIDE.md](MANUFACTURING_GUIDE.md) - Scale patterns
5. Set up shared libraries (_shared/ folder)
6. Write install-skills.sh
7. Mass produce theo domain (security, testing, deployment, monitoring...)

**Output:** 100 skills có shared infra, consistent quality

---

### Goal 5: "Tôi muốn hiểu sâu gstack architecture"

**Path:**
1. Đọc [INDEX](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md) - Scan tổng quan
2. Ctrl+F topic cần tìm (vd: "port collision")
3. Đọc section tương ứng trong PART 1/2/3
4. Xem code examples trong gstack-main/

**Output:** Deep understanding về 1 aspect cụ thể

---

## 📊 QUICK DECISION MATRIX

| Nếu bạn muốn... | Đọc file này | Time |
|-----------------|-------------|------|
| Hiểu skill là gì | SKILL_EXPLAINED.md | 5 min |
| Tạo skill đầu tiên | SKILL_EXPLAINED.md (template section) | 5 min |
| Biết cấu trúc file | SKILL_STANDARD_V2.md | 15 min |
| Viết skill chất lượng cao | GSTACK_WRITING_STYLE.md | 30 min |
| Build complex skill | GSTACK_ADVANCED_PATTERNS.md | 45 min |
| Scale lên 100 skills | MANUFACTURING_GUIDE.md | 1h |
| Hiểu sâu 1 topic | HƯỚNG_DẪN... (INDEX → topic) | 15-30 min |
| Copy template | SKILL_TEMPLATE/ | 2 min |

---

## 🎓 RECOMMENDED STUDY ORDER

### Beginner (Chưa từng tạo skill)
1. **SKILL_EXPLAINED.md** (5 min) - Understand basics
2. **Template 60s** (5 min) - Create first skill
3. **SKILL_STANDARD_V2.md** (15 min) - Learn structure
4. **Practice:** Tạo 3-5 simple skills

**Milestone:** Có 5 skills hoạt động

---

### Intermediate (Đã có 5-10 skills)
1. **GSTACK_WRITING_STYLE.md** (30 min) - Level up quality
2. **Rewrite 1 skill** (1h) - Áp dụng 12 nguyên tắc
3. **Review with checklist** (30 min) - SKILL_STANDARD_V2 checklist
4. **Practice:** Nâng cấp 5 skills cũ theo chuẩn mới

**Milestone:** 5 skills đạt chất lượng gstack

---

### Advanced (Complex skills)
1. **GSTACK_ADVANCED_PATTERNS.md** (45 min) - 6 advanced patterns
2. **Pick 1 pattern** (30 min) - Study in depth (e.g., Persistent State)
3. **Implement** (2-3h) - Apply to your use case
4. **Test** (1h) - 3-tier eval strategy
5. **Practice:** Build 2-3 complex skills (browser, ML model, DB connection)

**Milestone:** Complex skill với robust architecture

---

### Expert (Scale production)
1. **MANUFACTURING_GUIDE.md** (1h) - Learn patterns
2. **Set up _shared/** (1h) - DRY libraries
3. **Write install-skills.sh** (30 min) - Mass install
4. **HƯỚNG_DẪN... PART 1/2/3** (2h) - Deep references
5. **Practice:** Build skill category (10 security skills)

**Milestone:** Domain-specific skill suite với shared infra

---

## 🔧 PRACTICAL WORKFLOWS

### Workflow 1: Create Simple Skill (Pure Markdown)

```bash
# 1. Use 60s template from SKILL_EXPLAINED.md
mkdir ~/.claude/skills/my-skill
cat > ~/.claude/skills/my-skill/SKILL.md <<'EOF'
---
name: my-skill
version: 1.0.0
description: What it does
allowed-tools: [Bash, Read]
---
# My Skill
## Step 1: Do X
[workflow here]
EOF

# 2. Test
/my-skill

# Time: 5 minutes
```

---

### Workflow 2: Create Quality Skill (With 12 Principles)

```bash
# 1. Copy template from GSTACK_WRITING_STYLE.md (end of file)
# 2. Fill in:
#    - Philosophy section (role-play)
#    - Prime Directives (3-5 rules)
#    - Workflow with escape hatches
#    - Tables for completeness
#    - Suppressions
# 3. Review against SKILL_STANDARD_V2.md checklist
# 4. Test with real scenario

# Time: 30 minutes
```

---

### Workflow 3: Mass Produce Skills

```bash
# 1. Set up shared
mkdir -p ~/.claude/skills/_shared
# Copy common helpers (git.ts, auth.ts, validation.ts)

# 2. Create category template
# Example: security-*.md skills all use same structure

# 3. Generate from list
for skill in analyze-deps scan-secrets audit-permissions; do
  cp SKILL_TEMPLATE ~/.claude/skills/$skill
  # Customize
done

# 4. install-skills.sh
# Auto-setup all skills in one command

# Time: 5 min per skill after setup
```

---

## ❓ FAQ

### Q: Tôi nên bắt đầu từ đâu?
**A:** [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) → làm template 60s → có skill đầu tiên trong 10 phút.

### Q: Làm sao viết skill "chất lượng gstack"?
**A:** Đọc [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md), áp dụng 12 nguyên tắc. Quan trọng nhất: Tables (force completeness), Specific > Vague, Concrete Examples.

### Q: Khi nào cần code (TypeScript)?
**A:** Chỉ khi cần browser automation hoặc persistent state. 95% skills chỉ cần markdown. Xem SKILL_EXPLAINED.md section "Khi Nào Cần Code".

### Q: File nào quan trọng nhất?
**A:** [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - Đây là 80% giá trị. Cấu trúc chỉ là 20%.

### Q: HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ khác gì với các file khác?
**A:** Đó là **deep reference** (50 pages phân tích chi tiết). Dùng khi cần hiểu 1 topic sâu (vd: CircularBuffer sizing, ref invalidation). Không cần đọc hết - dùng INDEX tra cứu.

### Q: Tôi có thể bỏ qua file nào?
**A:**
- **Không thể bỏ:** SKILL_EXPLAINED.md, GSTACK_WRITING_STYLE.md
- **Nên đọc:** SKILL_STANDARD_V2.md
- **Optional:** MANUFACTURING_GUIDE.md (nếu cần scale 100+), HƯỚNG_DẪN... (reference only)

---

## 🎯 SUCCESS METRICS

**After reading this guide system, you should be able to:**

✅ Tạo 1 simple skill trong 5 phút (pure markdown)
✅ Tạo 1 quality skill trong 30 phút (với Philosophy, Tables, Two-Pass...)
✅ Review 1 skill và point out vi phạm 12 nguyên tắc
✅ Refactor 1 skill từ "vague" → "gstack-quality"
✅ Set up shared libraries để DRY
✅ Write install-skills.sh cho mass deployment
✅ Scale lên 100+ skills với consistent quality

---

## 📁 FILE SUMMARY

| File | Purpose | Length | Read Time |
|------|---------|--------|-----------|
| **SKILL_EXPLAINED.md** | Basics + 60s template | 2K | 5 min |
| **SKILL_STANDARD_V2.md** | Structure rules | 5K | 15 min |
| **GSTACK_WRITING_STYLE.md** | 12 writing principles ⭐ | 8K | 30 min |
| **GSTACK_ADVANCED_PATTERNS.md** | 6 advanced patterns 🆕 | 12K | 45 min |
| **MANUFACTURING_GUIDE.md** | Scale patterns | 10K | 1h |
| **HƯỚNG_DẪN... PART1** | Infrastructure deep dive | 15K | 1h |
| **HƯỚNG_DẪN... PART2** | UX + Anti-patterns | 18K | 1h |
| **HƯỚNG_DẪN... PART3** | Requirements + Blueprint | 16K | 1h |
| **HƯỚNG_DẪN... INDEX** | Quick reference | 3K | 10 min |
| **SKILL_TEMPLATE/** | Copy-paste scaffold | - | 2 min |

**Total:** ~89K words, ~6 hours to read everything (but you don't need to!)

---

## 🚀 NEXT STEPS

**Immediate (Today):**
1. Read [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) (5 min)
2. Create 1 skill from 60s template (5 min)
3. Test it works

**This Week:**
1. Read [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) (30 min)
2. Rewrite your skill with 12 principles (1h)
3. Create 5 more skills

**This Month:**
1. Read [MANUFACTURING_GUIDE.md](MANUFACTURING_GUIDE.md) (1h)
2. Set up _shared/ libraries
3. Build domain suite (10-20 skills in your area)

---

**🎓 You now have a complete skill-building curriculum. Start with SKILL_EXPLAINED.md and work your way up!**
