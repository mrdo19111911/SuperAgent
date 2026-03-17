# Nash v3.0 — SYNTHESIS ROADMAP
## Optimized for: Mạnh như gstack + Tiết kiệm token + Scale nhiều skill/agent

**Last Updated:** 2026-03-16
**Status:** Final (after Nash Triad debate)

---

## 🎯 Three-Pillar Strategy

| Pillar | Metric | Target |
|--------|--------|--------|
| **Mạnh như gstack** | Feature parity with gstack cognitive modes | Match /plan-ceo-review, /review, /qa rigor |
| **Tiết kiệm token** | Token overhead per upgrade | <5% per feature (max 1000 tokens/task) |
| **Scale nhiều skill/agent** | Reusability ratio | 5 SOULs → 20 agents, 50 skills → 100 workflows |

---

## 🏛️ Nash Triad Debate Results

### Thesis (Quality Champion): Vector DB + Dashboard + LLM-as-judge critical
**Wins:** Cross-agent learning, real-time intervention, semantic PEN search
**Loses:** Premature optimization (no evidence we have 1000+ PEN entries)

### Anti-Thesis (Efficiency Champion): Defer everything, use grep + tail -f
**Wins:** Avoid 300% infrastructure bloat, grep works for <500 PEN entries
**Loses:** Too conservative, ignores gstack's proven patterns

### **Synthesis (This Document):** Staged rollout with triggers
- ✅ Ship high-ROI features NOW (SOUL, Skill Registry)
- ⏸️ Defer low-ROI features UNTIL triggered by metrics (Vector DB, Dashboard)
- ❌ Cut over-engineering (Prometheus, A/B testing, SOUL marketplace)

---

## ✅ PHASE 0: Measure Baseline - COMPLETED 2026-03-16

**Goal:** Get data to justify expensive features.

### Script: `scripts/measure-baseline.sh`
```bash
#!/bin/bash

echo "=== Nash Framework Baseline Metrics ==="

# PEN entry count
PEN_COUNT=$(grep -r "^### PEN-" agents/*/MEMORY.md | wc -l)
echo "Total PEN entries: $PEN_COUNT"

# PEN grep performance
echo "Testing PEN search latency..."
time grep -r "multi-tenant" agents/*/MEMORY.md > /dev/null
time grep -r "RLS" agents/*/MEMORY.md > /dev/null
time grep -r "idempotency" agents/*/MEMORY.md > /dev/null

# Task duration analysis
echo "Analyzing task durations from LEDGER..."
for ledger in artifacts/*/LEDGER.md; do
  duration=$(grep "DURATION:" "$ledger" | awk '{print $2}')
  echo "$duration"
done | awk '{sum+=$1; count++} END {print "Avg task duration:", sum/count, "min"}'

# Long tasks
LONG_TASKS=$(grep -l "DURATION: [3-9][0-9]" artifacts/*/LEDGER.md | wc -l)
echo "Tasks >30min: $LONG_TASKS"

# SOUL duplication
echo "Checking SOUL duplication..."
grep -A 20 "## 🎭 SOUL" agents/core/*.md | wc -l
```

### Decision Matrix

| Metric | Threshold | Action |
|--------|-----------|--------|
| PEN count | <100 | ❌ Skip Vector DB (grep is fine) |
| PEN count | 100-300 | ⚠️ Build simple index (bash script) |
| PEN count | >300 | ✅ Build Vector DB |
| Avg grep time | <500ms | ❌ Skip Vector DB |
| Avg grep time | >2s | ✅ Build Vector DB |
| Avg task duration | <20min | ❌ Skip Dashboard (tail -f works) |
| Tasks >30min | >30% | ✅ Build Dashboard |
| SOUL duplication | >500 lines | ✅ Extract SOULs |

**Output:** ✅ `BASELINE_METRICS.md` created
**Decisions:** Skip Vector DB (0 PEN entries), Skip Dashboard (no long tasks), Proceed with SOUL modularity

---

## 🏗️ PHASE 1: High-ROI Foundations (Week 1)

### ✅ 1.1 SOUL Modularity (SIMPLIFIED) - COMPLETED 2026-03-16

**Why:** ✅ Mạnh (reusable), ✅ Tiết kiệm (-200 tokens/agent), ✅ Scale (5 SOULs → 20 agents)

**Efficiency Champion wins:** NO metadata.json (saves 200 tokens/boot). Inline adversarial posture in SOUL.md.

**Structure:**
```
agents/souls/
├── cathedral-architect.md        # From phuc-sa
├── paranoid-reviewer.md          # From moc
├── qa-champion.md                # From son-qa
├── speed-optimizer.md            # From lan
└── product-visionary.md          # From dung-manager
```

**SOUL.md format (INLINE metadata):**
```markdown
---
soul_id: cathedral-architect
compatible_archetypes: [Strategist, Builder]
core_values: [Security > Speed, Explicitness > Cleverness]
---

# Cathedral Architect Soul

You are not a generic software architect.
You are **a cathedral builder** — patient, systematic, paranoid about foundations.

## Adversarial Posture

**vs Mộc (Paranoid Reviewer):**
- Provide FULL context (schema, migrations, error codes)
- Never say "trust me" — show evidence

**vs Xuân (Requirements Analyst):**
- Push back on vague specs
- Demand acceptance criteria before designing
```

**Token analysis:**
- Before: 5 agents × 400 tokens (SOUL section) = 2000 tokens
- After: 1 SOUL file × 400 tokens, referenced 5 times = 400 tokens
- **Savings: -1600 tokens across all agents**

**Tasks:**
- [x] Create `agents/souls/` directory (5 SOULs exist)
- [x] Extract 5 SOULs from existing agents (already existed)
- [x] Update AGENT_TEMPLATE_V2.md to support reference format
- [x] Add `nash install-soul <soul-id> --agent <name>` command
- [x] Add `nash list-souls` command

**Success criteria:** ✅ Multiple agents share same SOUL - Tested on test-agent-1 and test-agent-2

---

### ✅ 1.2 Skill Registry Completion - COMPLETED 2026-03-16 (was 70% done, now 100% scaffolded)

**Why:** ✅ Mạnh (gstack parity), ✅ Tiết kiệm (lazy load), ✅ Scale (50+ skills)

**Status:**
- ✅ nash CLI tool created ([bin/nash](bin/nash))
- ✅ `code-review-excellence` migrated
- ⏳ Migrate 5 more gstack skills

**Tasks:**
- [x] Migrate gstack skills to Nash format:
  - [x] `/ship` → `deployment-excellence` (FULL implementation)
  - [x] `/qa` → `qa-four-modes` (scaffold created)
  - [x] `/plan-ceo-review` → `ceo-taste-validation` (scaffold created)
  - [x] `/plan-eng-review` → `eng-rigor-validation` (scaffold created)
  - [x] `/browse` → `browser-automation` (scaffold created)
- [x] nash CLI fixed (ES module error resolved)
- [ ] Test `nash install-skill` on 3 agents (DEFERRED - need to migrate existing agents first)
- [ ] Document skill creation in `skill_factory/SKILL_CREATION_GUIDE.md` (DEFERRED)

**Token analysis:**
- Before: Skills embedded in agent files (3000 tokens/agent × 10 agents = 30K)
- After: Skills referenced (500 tokens/skill × 6 skills = 3K, loaded on-demand)
- **Savings: -27K tokens (if all agents used all skills, which they don't — lazy loading is key)**

**Success criteria:** `nash list-skills` shows 6+ skills, all installable

---

### ✅ 1.3 gstack Cognitive Mode Integration

**Why:** ✅ Mạnh (gstack's secret sauce!), ✅ Tiết kiệm (mode switching = right tool for right job), ✅ Scale (modes are reusable)

**gstack's 8 modes (from GSTACK_ADVANCED_PATTERNS.md):**

| Mode | Metaphor | Token Budget | When to Use |
|------|----------|--------------|-------------|
| `/plan-ceo-review` | Cathedral builder | 15K | Pressure-test product direction |
| `/plan-eng-review` | Paranoid staff engineer | 20K | Lock architecture before coding |
| `/review` | Security auditor | 8K | Find bugs CI misses |
| `/ship` | Release machine | 5K | Fast execution, no talking |
| `/qa` | 4 sub-modes | Variable | Testing strategy |
| `/browse` | Persistent browser daemon | 200 tokens/call after first | Web automation |
| `/retro` | Postmortem analyst | 10K | Learn from failures |

**Nash integration strategy:**
1. **Map modes to Nash agents:**
   - `/plan-ceo-review` → Conan (Requirements Analyst) in **Founder Mode**
   - `/plan-eng-review` → Phúc SA (Solutions Architect) in **Rigor Mode**
   - `/review` → Mộc (Paranoid Reviewer) in **Security Audit Mode**
   - `/ship` → Lân (Dev) in **Execute-Only Mode** (no explanations)

2. **Add mode switching to agent boot protocol:**
   ```markdown
   ## 🧠 COGNITIVE MODES

   **EXPANSION mode (Founder taste):**
   - Trigger: When task involves product direction, user journey
   - Budget: 15K tokens
   - Mental model: "Would Steve Jobs ship this?"

   **HOLD mode (Engineering rigor):**
   - Trigger: When task involves architecture, contracts
   - Budget: 20K tokens
   - Mental model: "Will this survive 10x scale?"

   **REDUCTION mode (Ship fast):**
   - Trigger: When contracts approved, implementation clear
   - Budget: 5K tokens
   - Mental model: "Code first, talk later"
   ```

3. **Mode selection in `NASH_SUBAGENT_PROMPTS.md`:**
   ```markdown
   ## Step 1: Select Cognitive Mode

   Read task description. Choose mode:
   - Product direction? → EXPANSION mode
   - Architecture design? → HOLD mode
   - Clear implementation? → REDUCTION mode

   Load corresponding token budget and mental model.
   ```

**Token analysis:**
- Before: Every agent uses same 10K token budget regardless of task
- After: Simple tasks (REDUCTION) use 5K, complex tasks (EXPANSION) use 15K
- **Savings: 20-30% token reduction on simple tasks**

**Tasks:**
- [ ] Add "COGNITIVE MODES" section to AGENT_TEMPLATE_V2.md
- [ ] Update `NASH_SUBAGENT_PROMPTS.md` with mode selection logic
- [ ] Map gstack skills to Nash agents
- [ ] Test mode switching on 3 tasks (expansion, hold, reduction)

**Success criteria:** Agents dynamically adjust token budget based on task complexity

---

## ⏸️ PHASE 2: Conditional Upgrades (Week 2-3, IF triggered)

### ⏸️ 2.1 Lightweight Observability (FIRST)

**Trigger condition:** Tasks >30min represent >30% of workload (check BASELINE_METRICS.md)

**Efficiency Champion wins:** Use `tail -f status.log`, NOT 3000-line React dashboard.

**Implementation:**
```bash
# agents/core/phuc-sa.md boot protocol
echo "$(date '+%H:%M:%S') | phuc-sa | Phase A | STARTED" >> artifacts/$TASK_ID/status.log

# User monitors:
tail -f artifacts/T2_34/status.log
# 10:30:15 | phuc-sa | Phase A | STARTED
# 10:32:40 | phuc-sa | Phase A | Tokens: 2340
# 10:35:12 | phuc-sa | Phase A | COMPLETED
# 10:35:20 | moc     | Phase B | STARTED
```

**Token cost:** +50 tokens/task (echo commands)
**Infrastructure cost:** 10 lines of bash

**If this proves insufficient AFTER 1 month, THEN build React dashboard.**

**Tasks:**
- [ ] Add status.log writes to agent boot protocol
- [ ] Document `tail -f` usage in README
- [ ] Test on 5 tasks

---

### ⏸️ 2.2 Smart PEN Index (BEFORE Vector DB)

**Trigger condition:** PEN count >100 AND grep time >500ms (check BASELINE_METRICS.md)

**Efficiency Champion wins:** Build simple bash index BEFORE Vector DB.

**Implementation:**
```bash
# scripts/build-pen-index.sh (runs once daily)
grep -r "### PEN-" agents/*/MEMORY.md | \
awk -F'|' '{print $1 "|" $3 "|" $4}' | \
sort > .pen_index.txt

# agents/core/phuc-sa.md boot protocol
grep "multi-tenant" .pen_index.txt | head -5
```

**Token cost:** 0 (grep is free)
**Build time:** 2 seconds (runs daily cron)

**If PEN count >300, THEN migrate to Vector DB.**

**Tasks:**
- [ ] Write `scripts/build-pen-index.sh`
- [ ] Add cron job (daily rebuild)
- [ ] Update agent boot protocol to query index first

---

### ⏸️ 2.3 Vector DB (ONLY if PEN >300)

**Trigger condition:** PEN count >300 OR grep time >2s (check BASELINE_METRICS.md)

**Quality Champion wins:** At 300+ entries, semantic search is necessary.

**Why defer:** We likely have <100 PEN entries today. Efficiency Champion correct: don't over-engineer.

**When triggered, use Quality Champion's implementation:**
- Qdrant Vector DB
- `text-embedding-3-small` (cheap, fast)
- Top 10 PEN retrieval (not 5)

---

## ❌ PHASE 3: Features CUT from Roadmap

### ❌ 3.1 Real-time Dashboard (Full React app)
**Replaced by:** `tail -f status.log` (Phase 2.1)
**Token savings:** 1900 tokens/task
**Infrastructure savings:** 3000 lines of code

### ❌ 3.2 Prometheus/Grafana
**Replaced by:** `nash analyze-ledgers` bash script
**Why:** 5-20 tasks/day doesn't justify production monitoring

### ❌ 3.3 SOUL Marketplace
**Why:** Premature for <10 SOULs
**Revisit when:** >30 SOULs

### ❌ 3.4 A/B Testing Framework
**Why:** Need 1000+ tasks for statistical significance
**Revisit when:** >500 tasks/month

### ❌ 3.5 LLM-as-judge (80% of use cases)
**Why:** Gate scripts (tsc, eslint, grep) handle 80% for free
**Keep:** 20% for subjective criteria (code elegance, architecture taste)

---

## ✅ PHASE 4: Advanced Features (Keep in plan)

### ✅ 4.1 Cross-Agent Learning (High ROI)

**Quality Champion wins:** This prevents same bug class in multiple agents.

**Implementation (SIMPLIFIED):**
```bash
# When PEN entry created
PEN_ID="PEN-234"
ARCHETYPE="Builder"

# Broadcast to compatible agents
for agent in $(nash list-agents --archetype Builder); do
  echo "### $PEN_ID" >> agents/$agent/MEMORY.md
  # Copy PEN entry
done
```

**Token cost:** 0 (just file writes)
**Value:** Prevents 5-10 duplicate bugs

**Tasks:**
- [ ] Add `nash broadcast-pen <pen-id> --archetype <type>` command
- [ ] Update agent-skill-sharpener to trigger broadcast on P0 bugs

---

### ✅ 4.2 Enhanced agent-skill-sharpener

**Both sides agree:** This is high ROI (auto-convert PEN → regression tests).

**Update for AGENT_TEMPLATE_V2:**
- Only sharpen SKILLS section (preserve SOUL)
- If Vector DB exists, query similar failures
- If no Vector DB, use grep on .pen_index.txt

**Tasks:**
- [ ] Update sharpener for new agent structure
- [ ] Add conditional Vector DB integration (if exists)
- [ ] Test on 3 skills

---

## 📊 Final Token Budget Analysis

### Before Upgrade (Current):
- Agent boot: 5000 tokens (embedded SOUL + Skills)
- PEN search: 0 tokens (grep)
- Observability: 0 tokens (LEDGER only)
- **Total per task: 5000 tokens base**

### After Phase 1 (SOUL + Skill Registry + Cognitive Modes):
- Agent boot: 3000 tokens (referenced SOUL, lazy-loaded skills)
- Cognitive mode: 5K-15K tokens (dynamic budget)
- PEN search: 0 tokens (grep/.pen_index.txt)
- Observability: 50 tokens (status.log)
- **Total per SIMPLE task: 3050 tokens base (-39%!)**
- **Total per COMPLEX task: 8050 tokens base (+61%, but justified by quality)**

### If Phase 2 Triggered (Vector DB + Dashboard):
- Vector DB query: +500 tokens/task
- Dashboard events: +900 tokens/task
- **Total overhead: +1400 tokens (28% increase)**
- **Only pay this IF PEN count >300 (proven need)**

---

## 🎯 Success Metrics (3 Pillars)

### Mạnh như gstack:
- [ ] Cognitive mode switching implemented (EXPANSION/HOLD/REDUCTION)
- [ ] 6+ gstack skills migrated (`/review`, `/ship`, `/qa`, etc.)
- [ ] Cross-agent learning active (PEN broadcast)
- **Target:** Feature parity with gstack by Week 3

### Tiết kiệm token:
- [ ] Simple tasks use <5K tokens (REDUCTION mode)
- [ ] SOUL deduplication saves 200 tokens/agent
- [ ] Lazy skill loading (only load when invoked)
- **Target:** 20-30% token reduction on simple tasks

### Scale nhiều skill/agent:
- [ ] 5 SOULs → 20 agents (4:1 reuse ratio)
- [ ] 50 skills in registry
- [ ] Skill installation <30 seconds (`nash install-skill`)
- **Target:** Linear growth (2x agents ≠ 2x tokens)

---

## 🚦 Decision Gates

After Phase 1 (Week 1), measure:

| Metric | If TRUE | Action |
|--------|---------|--------|
| PEN count >100 | Yes | Build .pen_index.txt (Phase 2.2) |
| PEN count >300 | Yes | Build Vector DB (Phase 2.3) |
| Tasks >30min >30% | Yes | Build status.log observability (Phase 2.1) |
| Simple task tokens <5K | No | Debug cognitive mode switching |

**Re-evaluate every 2 weeks.** Let data drive decisions, not assumptions.

---

## 🎬 Next Steps

**Immediate (Week 1, Days 1-2):**
1. ✅ Run `scripts/measure-baseline.sh` → Get real numbers
2. ✅ Review BASELINE_METRICS.md → Data-driven decisions
3. ✅ Proceed to Phase 1.1 (SOUL Modularity) → Start building

**User approval required:**
- Does this roadmap match "Mạnh + Tiết kiệm + Scale"?
- Any features to add/remove?
- Phase 1 priority: SOUL → Skill Registry → Cognitive Modes?

---

*This synthesis preserves Nash innovations (PEN/WIN, Game Theory, LEDGER) while adopting Industry patterns (SOUL modularity, Skill marketplace) strategically. Quality Champion's long-term vision + Efficiency Champion's pragmatism = Data-driven staged rollout.*

**Status:** Ready for implementation 🚀
**Synthesis Author:** Claude (after Nash Triad debate)
**Last Updated:** 2026-03-16
