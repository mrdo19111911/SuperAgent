# Agent Polishing Strategy 🏭

**Date:** 2026-03-16
**Goal:** Polish 20 agents từ ~800 lines → ~250 lines trung bình (-69%)

---

## Vấn Đề Hiện Tại

### Agent Bloat Analysis

**Top 10 Largest Agents:**
1. **hung-devops-infra:** 313 lines (quá nhiều refs, examples)
2. **thuc-dev-ts:** 123 lines
3. **moc-arch-chal:** 108 lines
4. **tuan-dev-go:** 100 lines
5. **phuc-sa:** 92 lines
6. **son-qa:** 84 lines
7. **quang-designer:** 81 lines
8. **hoang-dev-net:** 79 lines
9. **huyen-dev-py:** 76 lines
10. **conan-req-aud:** 70 lines

**Vấn đề:**
- ❌ Skill references quá nhiều (26 skills listed)
- ❌ PEN/WIN entries redundant (50+ entries per agent)
- ❌ Verbose explanations
- ❌ Duplicate context với skills

---

## Chiến Lược Đánh Bóng

### Target L2 Cache Structure (~150-200 lines)

```markdown
# Agent Name - Role

**Archetype:** Builder/Analyst/Critic/Strategist/Operator
**Primary Pipeline:** X
**Top 5 Skills:** [Most-used skills ONLY]

## Core Mission (3 bullets max)
- Mission statement 1
- Mission statement 2
- Mission statement 3

## PEN (Top 10 ONLY - P0 > P1 > P2)
### P0 CRITICAL (Never Repeat)
1. [Most critical penalty with date]
2. [Second critical]

### P1 HIGH (Learn From)
3-5. [Important penalties]

### P2 MEDIUM (Avoid)
6-10. [Notable penalties]

_Archived PEN: See LEDGER_

## WIN (Top 5 ONLY)
1. [Best success with metric]
2-5. [Notable wins]

_Full history: See LEDGER_

## Current Focus (This Sprint)
- Focus 1
- Focus 2
```

**Total Target:** 150-200 lines

---

## Compression Formula Per Agent

### KEEP (Essential)
1. **Header** (5 lines)
   - Name, Role, Archetype, Pipeline, Top 5 Skills

2. **Core Mission** (10 lines)
   - 3 bullet points max
   - What agent does, NOT how

3. **PEN Top 10** (40 lines)
   - P0 (1-2 entries) - CRITICAL never repeat
   - P1 (3-5 entries) - HIGH priority avoid
   - P2 (6-10 entries) - MEDIUM priority
   - Include: Date, Score, Bug ID

4. **WIN Top 5** (25 lines)
   - Best successes with metrics
   - Include: Date, Score, Impact

5. **Current Focus** (10 lines)
   - This sprint priorities
   - 2-3 items max

6. **Quick Ref** (20 lines) - OPTIONAL
   - Most-used commands
   - Common patterns

**Total KEEP:** ~110 lines base + 20-40 optional = **130-150 lines**

---

### REMOVE (Verbosity)

❌ **Skill References (26 → 5)**
- Remove full skill list
- Keep top 5 most-used only
- Add pointer: "Full list: See registry"

❌ **PEN Entries (50+ → 10)**
- Archive P3-P4 entries
- Keep only P0-P2 top 10
- Add pointer: "Archived: See LEDGER"

❌ **WIN Entries (20+ → 5)**
- Keep top 5 successes only
- Add pointer: "Full history: See LEDGER"

❌ **Redundant Context**
- Remove skill content duplication
- Remove verbose explanations
- Remove examples (in skills now)

❌ **Long References**
- Remove GitHub links (in skills)
- Remove code examples (in skills)
- Remove best practices (in skills)

---

## Example: Hung DevOps (313 → 150 lines)

### BEFORE (313 lines)
```markdown
# Hung DevOps-Infra — L2 Cache

Role: DevOps / Infrastructure / Database / Security Engineer
...

## 1. Infrastructure & Deployment (60 lines)
- Docker Best Practices (OWASP Docker Top 10)
- Kubernetes Production Checklist
- Deployment Strategies
- CI/CD Pipeline Security
...

## 2. Database (PostgreSQL Expert) (50 lines)
- RLS Performance
- Index Strategy
- Migration Best Practices
...

## 3. Observability (40 lines)
...

## 4. Security (50 lines)
...

## 5. Integration (40 lines)
...

## PEN Entries (50+ entries, 70 lines)
...

## WIN Entries (20+ entries, 40 lines)
...
```

### AFTER (150 lines)
```markdown
# Hung DevOps-Infra — L2 Cache

**Archetype:** Operator
**Primary Pipeline:** 5 (Security & Deployment)
**Top 5 Skills:**
1. container-orchestration (daily)
2. infrastructure-as-code (daily)
3. deployment-strategies (daily)
4. observability-monitoring (weekly)
5. database-migration (weekly)

_Full skill list: See registry → used_by: ["hung"]_

## Core Mission
- Guard production: Docker/K8s security, zero-downtime deploys, RLS performance
- "Last gate keeper": Code passes review but crashes on deploy = Hung's responsibility
- Proactive prevention: OWASP compliance, monitoring before incidents

## PEN (Top 10 Never-Repeat)

### P0 CRITICAL
1. **Root container in production** (2026-02-15, -30, BUG-789)
   - Used `USER root` → Security breach
   - Fix: ALWAYS `USER app` (UID >1000)

2. **No resource limits** (2026-02-20, -30, BUG-802)
   - Pod crashed neighbors (OOM)
   - Fix: ALWAYS set `requests` + `limits`

### P1 HIGH
3. **`:latest` tag in prod** (2026-03-01, -20, BUG-815)
   - Unpredictable deploy
   - Fix: Use digest or semantic version

4. **Missing health checks** (2026-03-05, -20, BUG-823)
   - Traffic to unready pods
   - Fix: MUST have liveness + readiness probes

### P2 MEDIUM
5-10. [Other penalties]

_Archived PEN (P3-P4): See LEDGER history_

## WIN (Top 5 Successes)
1. **Zero-downtime DB migration** (2026-02-10, +30)
   - 10M rows, no lock, 5min total
   - Expand-Contract pattern

2. **K8s security hardening** (2026-02-25, +25)
   - Pod Security Standards enforced
   - All containers non-root, RO filesystem

3-5. [Other wins]

_Full history: See LEDGER_

## Current Focus (Sprint 12)
- RLS performance optimization (STMAI multi-tenant)
- Container security audit (OWASP Top 10 compliance)
- Production monitoring dashboard (Grafana setup)

## Quick Ref (Common Commands)
```bash
# Docker security scan
docker scan myimage:latest

# K8s resource check
kubectl top pods --namespace=production

# DB migration test
prisma migrate deploy --preview-feature
```
```

**Reduction:** 313 → 150 lines (**-52%**, 163 lines removed)

---

## Batch Execution Plan

### Batch 1: Core Agents (9 agents, 2 hours)
1. Conan (req-aud)
2. Dung (manager)
3. Moc (arch-chal)
4. Nam (observability)
5. Nhien (janitor)
6. Phuc SA (architect)
7. Son QA (qa-lead)
8. Tung (diagnostics)
9. Xuan (spec-rev)

**Target:** 70-108 lines → 150-180 lines avg

### Batch 2: Dev Agents (7 agents, 1.5 hours)
10. Thuc (dev-ts)
11. Lan (dev-fe)
12. Tuan (dev-go)
13. Huyen-Py (dev-py)
14. Hoang (dev-net)
15. Huyen FE-QA (fe-qa)
16. Trinh (fe-tester)

**Target:** 76-123 lines → 150-170 lines avg

### Batch 3: Research & Special Agents (4 agents, 1 hour)
17. Hieu (arch-r)
18. Nghia (stack-r)
19. Ngu (pitfall-r)
20. Cua (feature-r)

**Target:** 50-80 lines → 120-150 lines avg

**Total:** 20 agents, 4.5 hours

---

## Compression Techniques

### 1. Skill References: 26 → Top 5
```markdown
BEFORE (26 skills):
## Skills Available
1. tdd-best-practices
2. react-vite-patterns
... (24 more)

AFTER (Top 5):
**Top 5 Skills:**
1. tdd-best-practices (daily)
2. typescript-patterns (daily)
3. database-migration (weekly)
4. test-data-management (weekly)
5. git-workflow-branching (daily)

_Full list: See registry → used_by: ["thuc-dev-ts"]_
```

**Savings:** ~100 lines

### 2. PEN Entries: 50+ → Top 10
```markdown
BEFORE (50+ entries):
## PEN
### P0
1-10. [Entries]
### P1
11-30. [Entries]
### P2
31-50. [Entries]

AFTER (Top 10):
## PEN (Top 10 Never-Repeat)
### P0 CRITICAL (1-2)
1. [Most critical with date]

### P1 HIGH (3-5)
3. [Important penalty]

### P2 MEDIUM (6-10)
6. [Notable penalty]

_Archived: See LEDGER_
```

**Savings:** ~120 lines

### 3. WIN Entries: 20+ → Top 5
```markdown
BEFORE (20+ entries):
## WIN
1-20. [All successes]

AFTER (Top 5):
## WIN (Top 5 Successes)
1. [Best win with metric]
2-5. [Notable wins]

_Full history: See LEDGER_
```

**Savings:** ~60 lines

### 4. Remove Redundant Content
```markdown
REMOVE:
- Skill content duplication
- Code examples (in skills)
- Best practices (in skills)
- GitHub references (in skills)
- Verbose explanations

KEEP:
- Agent-specific PEN/WIN
- Current focus (this sprint)
- Top 5 skills used
```

**Savings:** ~100 lines

**Total Savings Per Agent:** ~380 lines → ~150 lines (**-60%**)

---

## Success Criteria

### Per Agent Polished

- [ ] L2 Cache < 200 lines
- [ ] Skill references: Top 5 only
- [ ] PEN entries: Top 10 (P0 > P1 > P2)
- [ ] WIN entries: Top 5
- [ ] Archetype, Pipeline, Mission clear
- [ ] Current Focus updated
- [ ] No skill content duplication
- [ ] Pointer to registry/LEDGER for full lists

### Framework Impact

- [ ] Agent spawn time: -60% faster
- [ ] L2 Cache token usage: -70%
- [ ] Context window: Fit 50+ agents vs 20
- [ ] Maintenance: Easier to update

---

## Next Step

**Launch Batch 1** (9 core agents) với parallel subagents:
1. Conan, Dung, Moc, Nam, Nhien
2. Phuc SA, Son QA, Tung, Xuan

**Estimated:** 2 hours for 9 agents

Bạn ready để launch không? 🚀
