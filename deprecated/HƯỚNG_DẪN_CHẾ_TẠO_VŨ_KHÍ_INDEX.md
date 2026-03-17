# HƯỚNG DẪN CHẾ TẠO VŨ KHÍ - INDEX
## Nash Skills Manufacturing Guide (Master Index)

**Cách dùng:** Ctrl+F từ khóa → tìm section number → mở PART tương ứng

---

## 📚 FILE STRUCTURE

```
HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md     ← Bạn đang đọc file này
HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART1.md     ← Infrastructure (2.1-2.9)
HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART2.md     ← UX + Anti-patterns (3.1-4.8)
HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_PART3.md     ← Requirements + Blueprint (5.1-8)
```

---

## 🔍 QUICK REFERENCE

### Tôi muốn...

| Nhu cầu | Xem section | File |
|---------|-------------|------|
| **Hiểu kiến trúc gstack** | 1.2, 2.2 | PART1 |
| **Tạo skill mới từ đầu** | 6.1, 6.2 | PART3 |
| **Fix bug race condition** | 2.3.2, 4.2.3 | PART1, PART2 |
| **Giảm binary size 58MB→8MB** | 4.2.1 | PART2 |
| **Viết SKILL.md prompt** | 3.2, 6.2 | PART2, PART3 |
| **Tích hợp vào Nash Framework** | 7.1-7.4 | PART3 |
| **Xem roadmap triển khai** | 8 | PART3 |
| **Hiểu Nash Triad wrapper** | 6.9.4, 7.1 | PART3 |

---

## 📖 CONTENT MAP

### PART 1: INFRASTRUCTURE

**1. TỔNG QUAN**
- 1.1 Bối cảnh: gstack là gì?
- 1.2 Kết luận từ 4 agents (Phúc/Châu/Mộc/Conan)
- 1.3 Điểm chính (ADOPT vs REJECT vs NASH-SPECIFIC)

**2. INFRASTRUCTURE (Phúc SA)**
- 2.1 Build toolchain (package.json, setup script)
- 2.2 Browse architecture (5-layer stack)
- 2.3 State management (refs, state file, port selection)
- 2.4 CircularBuffer (logs)
- 2.5 Async disk flush
- 2.6 Cookie decryption (macOS Keychain)
- 2.7 Testing infrastructure
- 2.8 Replication guide (minimal skeleton)
- 2.9 Key takeaways

---

### PART 2: UX PATTERNS + ANTI-PATTERNS

**3. UX PATTERNS (Châu UX)**
- 3.1 Cognitive mode enforcement (`/plan-ceo-review`, `/review`)
- 3.2 Prompt engineering patterns (clarity, conditionals, stop conditions, priority)
- 3.3 User interaction protocols (AskUserQuestion, option format, evidence)
- 3.4 Output formatting (tables, checklists, suppressions)
- 3.5 Workflow taxonomies (linear, multi-pass, conditional)
- 3.6 Learning mechanisms (history files, trend tracking)

**4. ANTI-PATTERNS (Mộc)**
- 4.1 Coverage audit (Phúc missed 65%, Châu missed 35%)
- 4.2 Architectural anti-patterns (58MB binary, port collision, state race, buffer overkill, ref invalidation)
- 4.3 UX anti-patterns ("one question per issue", ASCII waste, FP toil, mode drift)
- 4.4 Code smells (type safety, empty catch, magic numbers)
- 4.5 Prompt smells (vague, missing error handling, hardcoded, conflicting)
- 4.6 Missing critical analysis (security, P99 latency, coverage %, scalability)
- 4.7 Superior alternatives (npm, unix socket, tiered batching, embeddings-based FP)
- 4.8 Nash incompatibilities (single server vs parallel, refs vs L2, no scoring, self-report)

---

### PART 3: REQUIREMENTS + BLUEPRINT + NASH

**5. REQUIREMENTS GAPS (Conan)**
- 5.1 Use case coverage (22% → cần 60%)
- 5.2 Top 7 P0 gaps (critical skills missing)
- 5.3 Incomplete workflows (11 gaps)
- 5.4 Cross-skill integration (15 opportunities)

**6. BLUEPRINT - MASS PRODUCTION**
- 6.1 Skill template (minimal viable)
- 6.2 SKILL.md checklist (8 required sections)
- 6.3 Server architecture patterns (persistent, stateless, hybrid)
- 6.4 Authentication patterns (Bearer token, unix socket, HMAC)
- 6.5 Error handling taxonomy (user, system, fatal)
- 6.6 Testing strategy (unit, integration, E2E)
- 6.7 Versioning + compatibility (semver, migration)
- 6.8 Distribution models (git clone, npm, homebrew, docker)
- 6.9 Nash-specific adaptations (multi-agent server, L2 cache, scoring, validation, token conservation)
- 6.10 Production checklist (security, performance, error handling, testing, docs, compatibility, Nash integration)

**7. NASH FRAMEWORK ADAPTATION**
- 7.1 Skill dispatch via MoE Router
- 7.2 Pipeline mapping (6 pipelines + 2 new)
- 7.3 Skill lifecycle (5 phases)
- 7.4 Critical differences (gstack vs Nash)

**8. ACTIONABLE ROADMAP**
- Phase 1: ADOPT core patterns (Week 1-2)
- Phase 2: FIX critical issues (Week 3-4)
- Phase 3: CREATE missing skills (Week 5-8)
- Phase 4: INTEGRATE with Nash (Week 9-12)
- Phase 5: SCALE production (Week 13-16)

**APPENDIX**
- A. Glossary
- B. File reference index
- C. Metrics summary
- D. Contact + resources

---

## 🎯 KEY CONCEPTS

### Infrastructure
- **Persistent server:** cli + server + state file → fast (~100ms warm)
- **Ref-based UI:** @e1 via ARIA snapshot → stable, token-efficient
- **CircularBuffer:** Fixed memory, O(1) insert → predictable RAM
- **State file race:** NO LOCKING → parallel CLI = corruption → FIX: flock
- **Port collision:** Random 10K-60K → 10% risk at N=100 → FIX: unix socket
- **Cookie decryption:** macOS Keychain → blocks 73% users → FIX: DPAPI (Windows), kwallet (Linux)

### UX Patterns
- **Cognitive mode enforcement:** Tables force complete thinking (Error/Rescue map)
- **Numbered steps:** Force sequential execution (Step 1 → 2 → 3)
- **Bold for critical:** Visual hierarchy (STOP, Never skip)
- **One question per issue:** UX nightmare at >10 → FIX: tiered batching
- **ASCII diagrams:** 5x token waste vs YAML → use conditionally
- **Suppressions:** Greptile history → manual toil → FIX: embeddings-based

### Anti-Patterns
- **58MB binary:** 7x larger than needed → FIX: npm package (8MB)
- **Mode drift:** Prompt text = wish, ~95% compliance → FIX: structured output validation
- **Ref invalidation:** Navigation only → SPA re-renders = stale → FIX: DOM hash + TTL
- **No zero-sum scoring:** gstack self-reports → Nash requires adversarial → FIX: eval suite + LEDGER

### Requirements Gaps
- **22% coverage:** 8 of 36 use cases → need 27 more skills
- **P0 gaps (7):** /debug, /fix, /rollback, /monitor, Review→Fix, QA→Issue, Windows support
- **Incomplete workflows (11):** Plan→Implementation, Review→Fix, QA→Triage, Ship→Deploy, etc.
- **Integration opportunities (15):** Review→Debug, QA→Retro, Ship→Monitor→Rollback, etc.

### Nash Adaptation
- **Multi-agent browse:** 1 server, N tabs (Thesis=tab1, Anti=tab2)
- **L2 Cache refs:** Cache locator STRATEGY not ephemeral @e1
- **Zero-sum scoring:** Eval suite with known bugs → LEDGER tracks ±P0-P4
- **External validation:** Anti-Thesis re-runs tests (verifies Thesis didn't lie)
- **Token conservation:** YAML for agent-to-agent (ASCII only for USER output)

---

## 📊 DECISION MATRICES

### When to use persistent server?

| Criterion | Persistent | Stateless |
|-----------|-----------|-----------|
| State between commands | ✅ Yes | ❌ No |
| Cold start >1s | ✅ Yes | ❌ No |
| Concurrent requests | ✅ Yes | ⚠️ Maybe |
| Simple CLI wrapper | ❌ No | ✅ Yes |
| **Examples** | `/browse`, `/debug` | `/fix`, `/docs` |

---

### When to use ASCII diagrams?

| Scenario | ASCII | YAML/JSON |
|----------|-------|-----------|
| Show to USER (PR body) | ✅ | ❌ |
| Agent-to-agent | ❌ | ✅ (5x smaller) |
| Complex topology (>5 nodes) | ✅ | ⚠️ |
| Linear pipeline (<5 steps) | ❌ | ✅ (list better) |
| Parseable by LLM | ❌ | ✅ |

---

### Distribution model selection?

| Model | Size | Tooling | Platform | Auto-update |
|-------|------|---------|----------|-------------|
| Git clone | 158MB | Git | All | Manual `git pull` |
| npm package | 8MB | npm | All | `npm update` |
| Homebrew | 8MB | brew | macOS | `brew upgrade` |
| Docker | 8MB | docker | All | `docker pull` |
| **Recommend** | **npm** | **standard** | **cross-platform** | **yes** |

---

## 🚨 CRITICAL WARNINGS

### P0 BUGS (MUST FIX)

1. **State file race condition** (4.2.3)
   - **Risk:** Parallel CLI → duplicate servers, state corruption
   - **Fix:** flock locking before read-decide-write

2. **Port collision at scale** (4.2.2)
   - **Risk:** 10% failure rate at 100 repos
   - **Fix:** Unix socket (zero collision)

3. **No Windows support** (1.3, 5.2)
   - **Risk:** Blocks 40% of developers
   - **Fix:** DPAPI cookie decryption, cross-platform paths

4. **Ref invalidation incomplete** (4.2.5)
   - **Risk:** SPA re-renders → stale refs → wrong element clicked
   - **Fix:** DOM hash validation OR TTL expiration

5. **Mode drift enforcement** (4.3.4)
   - **Risk:** LLM forgets mode after 10K tokens → wrong recommendations
   - **Fix:** Structured output validation, mode reminder per section

---

### TOKEN WASTE ALERTS

1. **ASCII diagrams** (4.3.2)
   - **Waste:** 500 tokens vs 100 YAML (5x)
   - **When OK:** User-facing output, complex topology
   - **When BAD:** Agent-to-agent, linear flows

2. **50K CircularBuffer** (4.2.4)
   - **Waste:** 5MB RAM pinned, 83 min buffer (10x needed)
   - **Fix:** Reduce to 5K + TTL eviction

3. **58MB binary** (4.2.1)
   - **Waste:** 7x larger than npm package
   - **Fix:** Ship as source (8MB) + `bun install`

---

## 🔧 IMPLEMENTATION SHORTCUTS

### Minimal viable skill (15 min)

```bash
# 1. Create structure
mkdir -p my-skill/src my-skill/test
cd my-skill

# 2. Write SKILL.md (8 required sections — see 6.2)
# 3. Implement cli.ts + server.ts (see 2.8 skeleton)
# 4. Add setup script
# 5. Test: ./setup && my-skill command args
```

---

### Wrap skill in Nash Triad (30 min)

```yaml
# artifacts/{task}/plan.md
workflow:
  - phase: A (Criteria)
    agent: Conan
    skill: /my-skill
    output: criteria.md

  - phase: C (Execute)
    agent: Lan
    skill: /my-skill
    input: criteria.md
    output: result.md

  - phase: D (Verify)
    agent: Mộc
    verify: Re-run /my-skill independently
    compare: Lan's result vs own
    challenge: If discrepancy found

# LEDGER entry (Main Agent writes)
- Lan: Executed skill, output claims X → await verification
- Mộc: Re-ran skill, confirms X → Lan +20, Mộc +20
  (or challenges: Lan claimed X but actual Y → Lan -40, Mộc +40)
```

---

### Add to MoE Router (10 min)

```markdown
# system/MIXTURE_OF_EXPERTS_ROUTER.md

## Skill: /my-skill
**Capability:** [One sentence]
**Triggers when:**
- Audit dimension X > threshold
- Pipeline Y selected
- Explicit user request: "do X"

**Dispatch to pipeline:**
- CODING_AND_DEV (if code-related)
- TESTING_AND_QA (if test-related)
- etc.
```

---

## 📞 SUPPORT

**Questions?**
- gstack issues: https://github.com/garrytan/gstack/issues (hypothetical)
- Nash Framework: File in `E:\SuperAgent\.github\issues\`
- Skill development: See `agents/core/dung-manager.md` (PM entry point)

**Contributing:**
- Add skill to `install-skills.sh`
- Update this INDEX with new sections
- Run validation: `bash gates/validate.sh my-skill/`

---

## 📝 VERSION HISTORY

- **v1.0** (2026-03-15): Initial synthesis from 4 agent reports
  - Phúc SA: Infrastructure deep dive
  - Châu UX: UX patterns analysis
  - Mộc: Anti-patterns adversarial review
  - Conan: Requirements gaps analysis
- **Split reason:** Original doc exceeded 32K output token limit
- **Files:** 3 parts + 1 index (total ~15K tokens per file)

---

## ✅ COMPLETION CHECKLIST

**Before considering "gstack-level quality" achieved:**

- [ ] All 7 P0 gaps closed (5.2)
- [ ] State file race fixed (flock locking)
- [ ] Port collision fixed (unix socket)
- [ ] Windows support (DPAPI + cross-platform)
- [ ] Binary size reduced (58MB → 8MB npm)
- [ ] Ref invalidation fixed (DOM hash or TTL)
- [ ] Nash Triad wrapper implemented (7.1)
- [ ] LEDGER scoring defined (eval suite)
- [ ] External validation (Anti-Thesis re-run)
- [ ] L2 Cache optimized (<500 tokens)
- [ ] Token waste eliminated (YAML not ASCII)
- [ ] Production checklist passed (6.10)

**When ALL checkboxes ✅ → Nash Framework ready for production**

---

**END OF INDEX**

🎓 **Cách dùng:**
1. Ctrl+F từ khóa (ví dụ: "port collision")
2. Tìm section number (ví dụ: 4.2.2)
3. Mở PART tương ứng (PART2)
4. Nhảy đến section 4.2.2

📚 **3 files documentation hoàn chỉnh, tổng ~50 pages A4 equivalent**
