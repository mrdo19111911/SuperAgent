# 🏭 Skill Factory

> **DEPRECATED PATH WARNING:** The `skill_factory/` directory is now a backward-compatibility symlink. Please use `factories/skill/` for all new references. This symlink will be maintained for existing code but should not be used in new implementations.

## Complete Guide to Building gstack-Quality Skills + Auto-Sharpening Agents

**What is this?** A complete curriculum for building 100+ high-quality skills, PLUS tools for automatically sharpening agent skills based on production failures (PEN entries).

---

## 🚀 QUICK START

### Create Your First Skill (5 Minutes)

1. Read [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) - Section "Template Tối Giản"
2. Copy the 60-second template
3. Customize workflow
4. Done!

### Sharpen an Agent (10 Minutes)

1. Read [agent_skill_sharpener/README.md](agent_skill_sharpener/README.md)
2. `/sharpen agents/core/{agent-name}.md`
3. Tool auto-generates tests from PEN entries
4. Apply enhancements → Fixed! 🔪

---

## 📚 COMPLETE DOCUMENTATION

### START HERE ⭐
**[SKILL_BUILDING_MASTER_GUIDE.md](SKILL_BUILDING_MASTER_GUIDE.md)** - Roadmap đầy đủ

This file explains:
- What each document does
- Which one to read for your goal
- Learning path (beginner → advanced)
- Quick decision matrix

**Read this FIRST** to understand the whole system.

---

## 📖 DOCUMENTS BY LEVEL

### Level 0: Understanding (5 min)
**[SKILL_EXPLAINED.md](SKILL_EXPLAINED.md)**
- What is a skill? (95% = just 1 markdown file!)
- 3 types: Pure Markdown / With Helpers / With Binary
- Why `/browse` is complex but `/ship` is simple
- 60-second template to create first skill

---

### Level 1: Structure (15 min)
**[../system/templates/SKILL_STANDARD_V2.md](../system/templates/SKILL_STANDARD_V2.md)**
- YAML front matter (allowed-tools firewall)
- Numbered workflow steps
- When to split files (>15KB rule)
- Quality checklist

---

### Level 2: Writing Quality (30 min) ⭐ **MOST IMPORTANT**
**[GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md)**

**The 12 Principles:**
1. Philosophy - Role-play vivid
2. Prime Directives - Specific > vague
3. Tables - Force completeness
4. Multi-Path Analysis - Happy + Nil + Empty + Error
5. Specific > Vague - Concrete examples
6. Escape Hatches - Early exit
7. Two-Pass - CRITICAL → INFORMATIONAL
8. Suppressions - Anti-noise
9. Priority Hierarchy - Never skip X
10. Concrete Examples - Real bugs
11. Terse Output - One line problem, one line fix
12. Meta-Instructions - Stopping policy

**This is 80% of the value.** Structure is only 20%.

---

### Level 3: Advanced Patterns (45 min) 🆕
**[GSTACK_ADVANCED_PATTERNS.md](GSTACK_ADVANCED_PATTERNS.md)**

**The 6 Advanced Patterns:**
1. **Cognitive Mode Switching** - One Feature, Five Modes workflow
2. **Persistent State Architecture** - Browse daemon (3s → 100ms)
3. **Ref System (@e1, @e2)** - Accessibility tree → Playwright Locators
4. **3-Tier Eval Strategy** - Free static + $4 E2E + $0.15 LLM judge
5. **Greptile Integration** - Automated PR review triage + learning
6. **/qa's 4 Modes** - Diff-aware / Full / Quick / Regression

**Source:** [gstack-guide.vercel.app](https://2026-03-15-gstack-guide.vercel.app/) (Vietnamese translation by Minh Đỗ)

**Use for:** Complex skills (browser automation, persistent state, testing frameworks)

---

### Level 4: Mass Production (1 hour)
**[MANUFACTURING_GUIDE.md](MANUFACTURING_GUIDE.md)**
- 3 server patterns (persistent/stateless/hybrid)
- CircularBuffer for logs
- State management
- Testing strategy
- Build & distribution
- Shared libraries
- install-skills.sh

---

### Level 5: Deep Reference (2-3 hours)
**Vietnamese Deep Dive (50+ pages):**
- [HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md) - Quick reference
- [PART1](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART1.md) - Infrastructure
- [PART2](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART2.md) - UX + Anti-patterns
- [PART3](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART3.md) - Requirements + Blueprint

**Use when:** You need deep understanding of a specific topic (port collision, ref invalidation, etc.)

**Don't read cover-to-cover** - use INDEX to find topics.

---

### Bonus: Template
**[SKILL_TEMPLATE/](SKILL_TEMPLATE/)** - Copy-paste scaffold

```bash
cp -r skill_factory/SKILL_TEMPLATE ~/.claude/skills/my-new-skill
cd ~/.claude/skills/my-new-skill
# Edit SKILL.md, src/cli.ts, src/server.ts
./setup
```

---

## 🎯 CHOOSE YOUR PATH

### Path 1: "I want a simple skill NOW"
⏱️ **5 minutes**

1. [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) → 60s template
2. Done!

---

### Path 2: "I want gstack-quality skill"
⏱️ **30 minutes**

1. [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) - Basics
2. [../system/templates/SKILL_STANDARD_V2.md](../system/templates/SKILL_STANDARD_V2.md) - Structure
3. [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - **12 principles ⭐**
4. Apply template from GSTACK_WRITING_STYLE.md
5. Self-review with checklist

---

### Path 3: "I want complex skills (browser, persistent state)"
⏱️ **2-3 hours**

1. All of Path 2
2. [GSTACK_ADVANCED_PATTERNS.md](GSTACK_ADVANCED_PATTERNS.md) - 6 advanced patterns
3. Study specific pattern (e.g., Persistent State Architecture)
4. Implement + test with 3-tier eval strategy

---

### Path 4: "I want to build 100 skills"
⏱️ **1 week**

1. All of Path 2 + 3
2. [MANUFACTURING_GUIDE.md](MANUFACTURING_GUIDE.md) - Scale patterns
3. Set up _shared/ libraries
4. Write install-skills.sh
5. Mass produce by domain

---

### Path 5: "I want deep gstack understanding"
⏱️ **2-3 hours**

1. [HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md](HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md) - Overview
2. Ctrl+F your topic
3. Read relevant section in PART 1/2/3

---

## 📊 QUICK REFERENCE

| If you want to... | Read this | Time |
|-------------------|-----------|------|
| Understand what skills are | SKILL_EXPLAINED.md | 5 min |
| Create first skill | SKILL_EXPLAINED.md template | 5 min |
| Learn file structure | SKILL_STANDARD_V2.md | 15 min |
| Write high-quality content | GSTACK_WRITING_STYLE.md ⭐ | 30 min |
| Build complex skills | GSTACK_ADVANCED_PATTERNS.md 🆕 | 45 min |
| Scale to 100+ skills | MANUFACTURING_GUIDE.md | 1h |
| Deep-dive a topic | HƯỚNG_DẪN... INDEX → topic | 15-30 min |
| Copy template | SKILL_TEMPLATE/ | 2 min |

---

## 🎓 LEARNING ORDER (Recommended)

### Week 1: Foundation
1. ✅ SKILL_EXPLAINED.md (5 min)
2. ✅ Create 1 skill from template (5 min)
3. ✅ SKILL_STANDARD_V2.md (15 min)
4. ✅ Create 3-5 more simple skills (2 hours)

**Milestone:** 5 working skills

---

### Week 2: Quality
1. ✅ GSTACK_WRITING_STYLE.md (30 min)
2. ✅ Rewrite 1 skill with 12 principles (1 hour)
3. ✅ Upgrade 5 old skills (3 hours)

**Milestone:** 5 gstack-quality skills

---

### Week 3: Advanced
1. ✅ GSTACK_ADVANCED_PATTERNS.md (45 min)
2. ✅ Study 1 pattern in depth (30 min)
3. ✅ Build 2-3 complex skills (browser, persistent state)

**Milestone:** Complex skills with robust architecture

---

### Week 4: Scale
1. ✅ MANUFACTURING_GUIDE.md (1 hour)
2. ✅ Set up _shared/ (1 hour)
3. ✅ Write install-skills.sh (30 min)
4. ✅ Build domain suite (10 skills in your area)

**Milestone:** Skill factory with shared infrastructure

---

## ❓ FAQ

**Q: Which file is most important?**
A: [GSTACK_WRITING_STYLE.md](GSTACK_WRITING_STYLE.md) - This is 80% of the value. Structure is only 20%.

**Q: Do I need to read everything?**
A: NO! Start with [SKILL_BUILDING_MASTER_GUIDE.md](SKILL_BUILDING_MASTER_GUIDE.md), then pick your path based on your goal.

**Q: When do I need TypeScript code?**
A: Almost never (5% of skills). Only for browser automation or persistent state. See SKILL_EXPLAINED.md "Khi Nào Cần Code".

**Q: How long to master this?**
A:
- Simple skill: 5 minutes
- Quality skill: 30 minutes
- Master system: 1 week of practice

**Q: What's the difference between GSTACK_WRITING_STYLE and MANUFACTURING_GUIDE?**
A:
- **GSTACK_WRITING_STYLE** = How to write CONTENT (12 principles)
- **MANUFACTURING_GUIDE** = How to SCALE (100+ skills, shared infra)

---

## 🏆 SUCCESS CRITERIA

After completing this curriculum, you should be able to:

✅ Create a simple skill in 5 minutes
✅ Create a gstack-quality skill in 30 minutes
✅ Review a skill and identify violations of the 12 principles
✅ Refactor vague skills into specific ones
✅ Set up shared libraries for DRY
✅ Scale to 100+ skills with consistent quality

---

## 📁 FILE MANIFEST

```
skill_factory/
├── README.md                              ← You are here
├── SKILL_BUILDING_MASTER_GUIDE.md        ← Start here (roadmap)
├── SKILL_EXPLAINED.md                     ← Level 0: Basics
├── ../system/templates/SKILL_STANDARD_V2.md  ← Level 1: Structure
├── GSTACK_WRITING_STYLE.md               ← Level 2: Quality ⭐
├── GSTACK_ADVANCED_PATTERNS.md           ← Level 3: Advanced 🆕
├── MANUFACTURING_GUIDE.md                ← Level 4: Scale
├── HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md    ← Level 5: Reference (INDEX)
├── HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART1.md    ← Infrastructure deep dive
├── HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART2.md    ← UX + Anti-patterns
├── HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART3.md    ← Requirements + Blueprint
├── QUALITY_CHECKLIST.md                  ← Pre-ship checklist
├── HOW_TO_BUILD_SKILLS.md               ← (Partial, outdated)
├── smartlog_skill_creator/               ← Meta-skill for creating NEW skills
│   ├── SKILL.md
│   ├── references/
│   └── README.md
├── agent_skill_sharpener/                ← Auto-sharpen agents from PEN/WIN 🔪🆕
│   ├── SKILL.md
│   ├── references/
│   │   ├── pen_to_eval_patterns.md
│   │   ├── enhancement_strategies.md
│   │   └── sharpening_metrics.md
│   └── README.md
└── SKILL_TEMPLATE/                       ← Copy-paste scaffold
    ├── SKILL.md
    ├── src/
    ├── test/
    ├── package.json
    └── setup
```

---

## 🚀 NEXT STEPS

**Right now (2 minutes):**
```bash
cd skill_factory
cat SKILL_EXPLAINED.md   # Read basics
```

**Today (10 minutes):**
1. Read SKILL_EXPLAINED.md template section
2. Create your first skill
3. Test it works

**This week (3 hours):**
1. Read GSTACK_WRITING_STYLE.md
2. Create 5 quality skills
3. Practice applying the 12 principles

---

---

## 🤖 TWO AUTOMATION TOOLS

### Tool 1: smartlog_skill_creator
**Purpose:** Create NEW skills from scratch

**Workflow:**
1. Capture user intent
2. Write draft with 12 gstack principles
3. Auto-generate tests + run parallel evals
4. User reviews outputs via browser
5. Iterate based on feedback
6. Optimize description for triggering
7. Package .skill file

**Use when:** "I need a skill that does X"

[Read more →](smartlog_skill_creator/README.md)

---

### Tool 2: agent_skill_sharpener 🔪🆕 (MOVED)
**Purpose:** FIX existing agent failures (auto-sharpen from PEN entries)

**Workflow:**
1. Extract PEN/WIN entries from agent file
2. **Auto-generate regression tests from PENs** 🎯
3. Run baseline (expect PEN tests to FAIL)
4. Apply enhancements (Prime Directives, Escape Hatches, Tables)
5. Retest until all PENs pass
6. Cross-validate (prevent overfitting)
7. Update agent file + mark PENs as FIXED

**Use when:** "Agent keeps making mistake Y" or "I have 3 ACTIVE PEN entries"

**Key insight:** Each PEN = documented production failure → becomes permanent test case

**Note:** This tool moved to [../agent_factory/3_AGENT_SHARPENING/sharpener_reactive/](../agent_factory/3_AGENT_SHARPENING/sharpener_reactive/)

[Read more →](../agent_factory/3_AGENT_SHARPENING/sharpener_reactive/README.md)

---

## 🆚 Tool Comparison

| Feature | smartlog_skill_creator | agent_skill_sharpener (MOVED) |
|---------|----------------------|----------------------|
| **Input** | User intent / conversation | Agent file (PEN/WIN) |
| **Output** | New standalone skill | Enhanced agent |
| **Tests** | Manual creation + user feedback | **Auto from PENs** 🎯 |
| **Focus** | Create capability | **Fix failures** 🎯 |
| **Driver** | Qualitative (user says "good") | Quantitative (pass rate %) |
| **Iteration** | Based on feedback | Based on assertions |
| **Use case** | "I need X" | "Agent broke Y" |

**Both tools complement each other:**
- smartlog_skill_creator → CREATE skills
- Agent sharpeners (see Agent Factory) → IMPROVE agents

**Note:** Agent sharpening tools moved to [../agent_factory/3_AGENT_SHARPENING/](../agent_factory/3_AGENT_SHARPENING/)

---

## 🏭 RELATED FACTORIES

### Agent Factory (`../agent_factory/`)
**Purpose:** Create and sharpen AGENTS (personalities + workflows)

**What's there:**
- **1_SOUL_CREATION/** - Create agent personalities (WHO you are)
- **2_AGENT_CREATION/** - Build complete agents (SOUL + Skills + Modes)
- **3_AGENT_SHARPENING/** - Fix/upgrade agents
  - **sharpener_reactive/** - PEN/WIN-based bug fixing (moved from here)
  - **sharpener_proactive/** - 2026 industry standards upgrade (moved from here)
- **4_COGNITIVE_MODE_OPTIMIZATION/** - EXPANSION/HOLD/REDUCTION modes

**When to use:**
- Create new agent → Agent Factory
- Create new skill → Skill Factory (this directory)
- Fix failing agent → Agent Factory (sharpener_reactive)
- Upgrade agent → Agent Factory (sharpener_proactive)

**Relationship:**
- **Agents USE skills** (agents reference skills from `~/.claude/skills/`)
- **Skills are standalone** (workflows only, no personality)
- **Example:** Phúc SA agent (personality + workflows) uses architecture-design skill (workflow only)

---

**🎉 Welcome to the Skill Factory! Start with [SKILL_BUILDING_MASTER_GUIDE.md](SKILL_BUILDING_MASTER_GUIDE.md) to understand the system, then jump into [SKILL_EXPLAINED.md](SKILL_EXPLAINED.md) to build your first skill.**

**For agent creation:** See [../agent_factory/README.md](../agent_factory/README.md)
