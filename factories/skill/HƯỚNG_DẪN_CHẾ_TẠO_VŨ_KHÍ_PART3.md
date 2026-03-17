# HƯỚNG DẪN CHẾ TẠO VŨ KHÍ - PART 3
## Requirements Gaps + Blueprint + Nash Adaptation

**Tiếp nối:** PART 2 (UX + Anti-patterns)
**Tổng hợp:** Conan Requirements + Synthesis

---

# PHẦN 5: REQUIREMENTS GAPS (Conan Analysis)

## 5.1 USE CASE COVERAGE: 22%

**Current (8 skills):**
- Planning: 2 skills (`/plan-ceo-review`, `/plan-eng-review`)
- Testing: 2 skills (`/qa`, `/browse`)
- Code Quality: 1 skill (`/review`)
- Deployment: 1 skill (`/ship` - PR only, không deploy thật)
- Operations: 0 skills
- Documentation: 0 skills

**Missing (28 use cases):**
```
❌ Development: /debug, /fix, /refactor, /profile
❌ Deployment: /deploy, /rollback, /monitor
❌ Operations: /oncall, /logs, /metrics
❌ Documentation: /docs, /api-design
❌ Testing: /test-gen, /perf
```

---

## 5.2 TOP 7 P0 GAPS (CRITICAL)

| # | Skill | Impact | Effort | Conan Priority | Nash Mapping |
|---|-------|--------|--------|----------------|--------------|
| 1 | `/debug` | HIGH | Medium | P0 | Tung Diag + Lan |
| 2 | `/fix` | HIGH | Low | P0 | Lan Dev + Mộc verify |
| 3 | `/rollback` | CRITICAL | Medium | P0 | Hung Infra |
| 4 | `/monitor` | HIGH | High | P0 | Hung + Tung |
| 5 | **Review→Fix gap** | HIGH | Low | P0 | Mộc hands off to Lan |
| 6 | **QA→Issue filing** | MEDIUM | Low | P0 | Son QA → GitHub API |
| 7 | **Windows support** | CRITICAL | Medium | P0 | Cross-platform |

---

## 5.3 INCOMPLETE WORKFLOWS (11 Gaps)

**Conan's findings:**

1. **Plan → Implementation:** `/plan-ceo-review` outputs diagrams → user manually codes
2. **Review → Fix:** `/review` finds bugs → user manually applies fixes
3. **QA → Triage:** `/qa` saves reports → not filed as GitHub issues
4. **Ship → Deploy:** `/ship` creates PR → not deployed to staging/prod
5. **Retro → Action Items:** `/retro` suggests improvements → not tracked
6. **Debug → Root Cause Docs:** No `/debug` skill exists
7. **Test-Gen → Coverage Tracking:** No `/test-gen` skill
8. **Refactor → Validation:** No `/refactor` + `/qa` integration
9. **Monitor → Incident Response:** No `/monitor` or `/oncall`
10. **Browse → Bug Report:** `/browse` captures evidence → not auto-filed
11. **Security → Remediation:** No `/security` audit skill

---

## 5.4 CROSS-SKILL INTEGRATION (15 Opportunities)

**Top 5 high-ROI integrations:**

1. **Review → Debug:** `/review` finds race condition → auto-trigger `/debug` with file:line
2. **QA → Retro Trends:** `/retro` includes QA health score graph over 7 days
3. **Ship → Monitor → Rollback:** `/ship` → `/deploy staging` → `/monitor 5m` → `/rollback` if fail
4. **Debug → Test-Gen:** `/debug` finds bug → offer "Generate regression test?"
5. **Profile → Review:** `/review` flags N+1 query → suggest `/profile` to measure impact

---

# PHẦN 6: BLUEPRINT - MASS PRODUCTION

## 6.1 SKILL TEMPLATE (Minimal Viable)

```
skill-name/
├── SKILL.md              # Prompt (main entry point)
├── src/
│   ├── cli.ts           # Parse args, ensure server
│   ├── server.ts        # HTTP server, command routing
│   ├── handlers.ts      # Business logic
│   └── types.ts         # TypeScript interfaces
├── test/
│   ├── fixtures/        # Test data
│   └── *.test.ts
├── dist/
│   └── skill            # Compiled binary (58MB) or npm package (8MB)
├── package.json
├── tsconfig.json
└── setup                # Build + symlink to ~/.claude/skills/
```

---

## 6.2 SKILL.MD CHECKLIST (8 Required Sections)

```markdown
# Skill Name

**Role:** [One sentence describing mental model]
**Trigger:** [When to invoke this skill]
**Output:** [What artifacts produced]

## PRE-CONDITIONS
- Required state (e.g., git repo, server running)
- Dependencies (e.g., Playwright, GitHub CLI)

## WORKFLOW (Numbered steps)
1. Step 1 description
2. Step 2 description
   - If X: do Y
   - Otherwise: do Z

## STOP CONDITIONS
**STOP if:**
- Condition 1
- Condition 2

**Never stop for:**
- Condition A
- Condition B

## OUTPUT REQUIREMENTS
**Format:** Table / List / JSON
**Save to:** File path
**Report:** What to show user

## ERROR HANDLING
**If command fails:** [Fallback strategy]
**If timeout:** [Recovery path]

## EXAMPLES
bash
skill command arg1 arg2


## INTEGRATION POINTS
- **Hands off to:** [Other skills]
- **Receives from:** [Other skills]
```

---

## 6.3 SERVER ARCHITECTURE PATTERNS

### Pattern 1: Persistent (like gstack /browse)

**When:**
- Stateful (browser, DB connection)
- Commands depend on previous state
- Cold start expensive (>1s)

**Structure:**
```typescript
// cli.ts: Ensure server running
const state = await ensureServer();
await sendCommand(state, command, args);

// server.ts: Long-lived process
const server = Bun.serve({ port, fetch: handleRequest });
process.on('SIGTERM', cleanup);
```

**State file:**
```json
{
  "pid": 1234,
  "port": 12000,
  "token": "uuid"
}
```

---

### Pattern 2: Stateless (one-shot execution)

**When:**
- No state between commands
- Fast execution (<500ms)
- Simple CLI tool wrapper

**Structure:**
```typescript
// cli.ts: Direct execution
const result = await execute(command, args);
console.log(result);
```

**Examples:** `/fix`, `/docs`, `/changelog-gen`

---

### Pattern 3: Hybrid (session-based)

**When:**
- Multiple commands in sequence
- Setup cost moderate (~500ms)
- Session expires after idle

**Structure:**
```typescript
// cli.ts: Check session, start if needed
const session = await getOrCreateSession();
await session.execute(command, args);

// server.ts: TTL-based cleanup
setInterval(() => {
  if (Date.now() - lastCommand > IDLE_TIMEOUT) {
    server.stop();
  }
}, 60_000);
```

**Examples:** `/debug`, `/profile`

---

## 6.4 AUTHENTICATION PATTERNS

### Pattern A: Bearer Token (gstack model)

```typescript
// server.ts
const TOKEN = crypto.randomUUID();
fs.writeFileSync(stateFile, JSON.stringify({ token: TOKEN }));

// fetch handler
if (req.headers.get('Authorization') !== `Bearer ${TOKEN}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

**Pros:** Simple, works across processes
**Cons:** Token in plaintext file, no rotation

---

### Pattern B: Unix Socket Permissions

```typescript
const socketPath = '/tmp/skill-{uid}.sock';
const server = Bun.serve({ unix: socketPath });
fs.chmodSync(socketPath, 0o600); // Owner only
```

**Pros:** OS-level security, zero collision
**Cons:** Unix-only (no Windows without WSL)

---

### Pattern C: Localhost + HMAC

```typescript
const SECRET = crypto.randomBytes(32);
const timestamp = Date.now().toString();
const signature = crypto.createHmac('sha256', SECRET)
  .update(timestamp + body)
  .digest('hex');

// Request header: X-Signature, X-Timestamp
// Reject if timestamp >60s old or signature mismatch
```

**Pros:** Replay protection, no token file
**Cons:** Clock sync required

---

## 6.5 ERROR HANDLING TAXONOMY

### Category 1: User Error (Recoverable)

**Examples:**
- File not found
- Invalid argument
- Git not a repository

**Response:**
```typescript
throw new UserError('File not found: config.json. Run setup first.');
// Exit code: 1
// Show: Clear error message + fix suggestion
```

---

### Category 2: System Error (Retry-able)

**Examples:**
- Network timeout
- Disk full
- Process killed

**Response:**
```typescript
for (let i = 0; i < 3; i++) {
  try { return await fetch(url); }
  catch (err) { await sleep(2 ** i * 1000); }
}
throw new SystemError('Network timeout after 3 retries');
// Exit code: 2
```

---

### Category 3: Fatal Error (Non-recoverable)

**Examples:**
- Corrupted state file
- Incompatible version
- Security violation

**Response:**
```typescript
console.error('FATAL: State file corrupted. Delete .nash/state.json and restart.');
process.exit(3);
```

---

## 6.6 TESTING STRATEGY

### Layer 1: Unit Tests (src/*.test.ts)

```typescript
// handlers.test.ts
describe('parseCommand', () => {
  it('parses goto command', () => {
    const cmd = parseCommand(['goto', 'example.com']);
    expect(cmd).toEqual({ type: 'goto', url: 'example.com' });
  });
});
```

**Coverage target:** 80% functions

---

### Layer 2: Integration Tests (server running)

```typescript
// integration.test.ts
beforeAll(async () => {
  server = await startTestServer();
});

test('goto + snapshot', async () => {
  await sendCommand('goto', 'http://localhost:8080/test.html');
  const result = await sendCommand('snapshot');
  expect(result).toContain('@e1');
});
```

**Coverage:** Happy path + top 5 edge cases per command

---

### Layer 3: E2E Tests (real browser)

```typescript
// e2e.test.ts
test('full workflow', async () => {
  execSync('skill setup');
  execSync('skill goto example.com');
  execSync('skill click @e1');
  const output = execSync('skill text').toString();
  expect(output).toContain('Success');
});
```

**Coverage:** 1-2 critical workflows

---

## 6.7 VERSIONING + COMPATIBILITY

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  1  .  2  .  3

MAJOR: Breaking changes (state format, CLI args)
MINOR: New features (backward-compatible)
PATCH: Bug fixes only
```

**Example:**
- 0.3.2 → 0.3.3: Fix ref invalidation bug (PATCH)
- 0.3.3 → 0.4.0: Add `/deploy` skill (MINOR)
- 0.4.0 → 1.0.0: Migrate state file format (MAJOR)

---

### Migration Strategy

```typescript
// State file versioning
const state = JSON.parse(fs.readFileSync(stateFile));
if (state.version !== CURRENT_VERSION) {
  state = migrate(state, CURRENT_VERSION);
  fs.writeFileSync(stateFile, JSON.stringify(state));
}

function migrate(old: any, target: string): State {
  if (old.version === '0.3.0' && target === '0.4.0') {
    return { ...old, newField: defaultValue, version: '0.4.0' };
  }
  // Chain migrations for multi-version jumps
}
```

---

## 6.8 DISTRIBUTION MODELS

### Model A: Git Clone (gstack current)

```bash
git clone https://github.com/org/skill.git ~/.claude/skills/skill
cd ~/.claude/skills/skill && ./setup
```

**Pros:** Simple, full control
**Cons:** 158MB for gstack (58MB binary × 8 skills + deps)

---

### Model B: npm Package (recommended)

```bash
npm install -g @org/skill
# Symlink created: ~/.claude/skills/skill → /usr/local/lib/node_modules/@org/skill
```

**Pros:** 8MB per skill, standard tooling, version management
**Cons:** Requires npm

---

### Model C: Homebrew (macOS)

```bash
brew install org/tap/skill
# Binary at: /opt/homebrew/bin/skill
```

**Pros:** OS-native, auto-updates
**Cons:** macOS-only, packaging overhead

---

### Model D: Docker (isolation)

```bash
docker run -v $(pwd):/workspace org/skill command args
```

**Pros:** Zero dependencies, hermetic
**Cons:** Slow startup (~2s), no state persistence

---

## 6.9 NASH-SPECIFIC ADAPTATIONS

### 6.9.1 Multi-Agent Browse Server

**Problem:** Thesis + Anti-Thesis run `/browse` in parallel → race condition

**Solution:** Tab affinity
```typescript
// State file includes agent ID
{
  "agents": {
    "thesis": { "tabId": "tab-1" },
    "antiThesis": { "tabId": "tab-2" }
  }
}

// CLI detects agent from env
const agentId = process.env.NASH_AGENT_ID || 'default';
await sendCommand(state, command, args, { agentId });

// Server routes to correct tab
const tab = state.agents[agentId].tabId;
await browserManager.execute(tab, command, args);
```

---

### 6.9.2 L2 Cache Ref Invalidation

**Problem:** L2 Cache stores `@e3 = submit button` → navigation → ref stale

**Solution:** Encode context in ref
```markdown
# L2 Cache entry (agents/dev/lan.md)
PEN/WIN:
- P1: Use `getByRole('button', {name: 'Submit'})` not `@e3`
  Reason: @e3 ephemeral, cleared on navigation
```

**Alternative:** Cache locator strategy, not ref
```yaml
# L2 Cache
submit_button:
  strategy: "getByRole('button', {name: 'Submit'})"
  url_pattern: "app.com/checkout"
  dom_hash: "abc123"  # Invalidate if DOM changes
```

---

### 6.9.3 Zero-Sum Scoring for `/review`

**Problem:** Nash requires LEDGER, gstack has no scoring

**Solution:** Eval suite with known bugs
```typescript
// test-repos/race-condition/user.rb
# Known bug: Line 47 lacks transaction (CRITICAL)

// LEDGER entry
{
  "agent": "Mộc",
  "task": "review-test-repo-001",
  "found": ["race-condition:47"],  // +20
  "missed": [],
  "fps": ["line-length:12"],       // -5 (flagged style as structural)
  "score": +15
}
```

**Eval harness:**
```bash
# Run /review on 10 test repos with known bugs
for repo in test-repos/*; do
  result=$(skill review $repo)
  score=$(compare_with_ground_truth $result $repo/bugs.json)
  echo "$repo: $score"
done
```

---

### 6.9.4 External Validation (Anti-Thesis Re-Run)

**Problem:** `/ship` self-reports "tests pass" → no verification

**Solution:** Nash Triad wrapper
```yaml
# Nash wrapper for /ship
Thesis (Lan Dev):
  - Run: /ship
  - Output: PR URL, test results

Anti-Thesis (Mộc):
  - Fetch PR branch
  - Re-run tests INDEPENDENTLY
  - Verify: test count matches, all pass
  - Challenge: "Thesis claims 47 tests pass. I found 48 tests, 1 FAILED."

Synthesis (Dũng PM):
  - If Anti-Thesis confirms: Approve PR
  - If Anti-Thesis finds discrepancy: Investigate
  - LEDGER: Record scores (Thesis -20 if lied, Anti-Thesis +20 if caught)
```

---

### 6.9.5 Token Conservation (Rule 0)

**Problem:** ASCII diagrams = 500 tokens, violates Rule 0

**Solution:** Conditional rendering
```markdown
# SKILL.md for Nash
**Diagram format:**
- For USER output (PR body): Use ASCII (readable)
- For AGENT-to-AGENT: Use YAML (parseable, 5x smaller)

Example:
yaml
pipeline:
  - step: validation
    on_error: return_400
  - step: transform
    on_error: log_and_skip
```

---

## 6.10 PRODUCTION CHECKLIST

**Before deploying skill to Nash:**

- [ ] **Security audit:**
  - [ ] No secrets in code (API keys, passwords)
  - [ ] Input validation (command injection, XSS)
  - [ ] Auth mechanism (token, unix socket, HMAC)

- [ ] **Performance:**
  - [ ] P50/P95/P99 latency measured
  - [ ] Memory profiling (no leaks over 7 days)
  - [ ] Concurrent usage tested (10+ agents)

- [ ] **Error handling:**
  - [ ] All catch blocks documented
  - [ ] Retry logic with exponential backoff
  - [ ] Graceful degradation (fallback if service unavailable)

- [ ] **Testing:**
  - [ ] Unit test coverage >80%
  - [ ] Integration tests (happy + top 5 edge cases)
  - [ ] E2E test (1 critical workflow)

- [ ] **Documentation:**
  - [ ] SKILL.md complete (8 required sections)
  - [ ] README with setup instructions
  - [ ] CHANGELOG for version history

- [ ] **Compatibility:**
  - [ ] Cross-platform (macOS, Linux, Windows)
  - [ ] Version migration strategy
  - [ ] Backward compatibility (or MAJOR bump)

- [ ] **Nash integration:**
  - [ ] L2 Cache optimized (<500 tokens)
  - [ ] Multi-agent support (tab/session affinity)
  - [ ] LEDGER scoring defined
  - [ ] External validation hook

---

# PHẦN 7: NASH FRAMEWORK ADAPTATION

## 7.1 SKILL DISPATCH VIA MoE ROUTER

**gstack model:** User invokes skill directly (`/review`)

**Nash model:** PM dispatches via MoE Router

```markdown
# User request: "Review my code for security issues"

# MoE Router (system/MIXTURE_OF_EXPERTS_ROUTER.md)
1. Read 12-dimension audit (AUDIT_REPORT_FINAL.md)
2. Identify pipeline: CODING_AND_DEV (code exists, needs review)
3. Select agents:
   - Thesis: Lan Dev (run /review)
   - Anti-Thesis: Mộc (verify findings)
   - Synthesis: Phuc SA (approve/reject)

# Dispatch (system/templates/NASH_SUBAGENT_PROMPTS.md v6.2)
Spawn 3 subprocesses:
- Lan: Load L2 Cache + /review SKILL.md → execute
- Mộc: Load L2 Cache + checklist.md → verify Lan's findings
- Phuc: Compare Lan vs Mộc → reconcile

# LEDGER update (artifacts/{task}/LEDGER.md)
Lan: Found 3 CRITICAL (+60), 5 INFORMATIONAL (+25) = +85
Mộc: Confirmed 3 CRITICAL (+60), found 1 missed by Lan (SQL injection) = +80
     Lan penalty: -20 (P1 missed bug)
Phuc: Synthesis approved = +10
```

---

## 7.2 PIPELINE MAPPING

| Nash Pipeline | gstack Skills Used | Trigger | Output |
|---------------|-------------------|---------|--------|
| 1. Requirements | `/plan-ceo-review` | SPEC empty | Error/rescue map, failure modes |
| 2. Architecture | `/plan-eng-review` | Missing schema | Dependency graph, test diagram |
| 3. Coding | `/review`, `/fix` | Code incomplete | Reviewed code, fixed bugs |
| 4. Testing | `/qa`, `/browse`, `/test-gen` | Tests missing | QA report, generated tests |
| 5. Security | `/security`, `/review` (checklist) | Pre-deploy | Security audit, fixes |
| 6. Hotfix | `/debug`, `/fix`, `/rollback` | Production incident | Root cause, fix, rollback |

**New pipelines (not in gstack):**
- **Design Flow:** `/wireframe`, `/mockup`, `/prototype` (FE-focused)
- **FE Implementation:** `/component-gen`, `/style-gen` (from wireframes)

---

## 7.3 SKILL LIFECYCLE

```
┌─────────────────────────────────────────────────┐
│ 1. SKILL CREATION (install-skills.sh)          │
│    - Git clone or npm install                   │
│    - Run setup (build binary)                   │
│    - Symlink to ~/.claude/skills/               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 2. SKILL DISCOVERY (MoE Router)                │
│    - Scan ~/.claude/skills/ for SKILL.md        │
│    - Parse metadata (role, trigger, output)     │
│    - Index by capability                        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 3. SKILL DISPATCH (Nash Triad)                 │
│    - Thesis: Execute skill                      │
│    - Anti-Thesis: Verify output                 │
│    - Synthesis: Reconcile + score               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 4. SKILL SCORING (LEDGER)                      │
│    - Found bugs: +P0/P1/P2 points               │
│    - Missed bugs: -2x points (M1 multiplier)    │
│    - False positives: -P3/P4 points             │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 5. SKILL EVOLUTION (PEN/WIN in L2 Cache)       │
│    - PEN: Hard constraints from penalties       │
│    - WIN: Patterns from successes               │
│    - Update L2 Cache for next run               │
└─────────────────────────────────────────────────┘
```

---

## 7.4 CRITICAL DIFFERENCES: gstack vs Nash

| Aspect | gstack | Nash |
|--------|--------|------|
| **Invocation** | User manual (`/review`) | PM automatic (MoE Router) |
| **Execution** | Single-agent (solo dev) | Multi-agent (Thesis/Anti/Syn) |
| **Validation** | Self-report | External (Anti-Thesis verifies) |
| **Scoring** | None | Zero-sum (LEDGER, P0-P4) |
| **Memory** | Ephemeral (per session) | 3-tier (L2/RAM/HDD) |
| **Learning** | Static prompts | Dynamic (PEN/WIN evolve) |
| **Token limit** | No hard limit | <500 tokens L2, <20K file |
| **Concurrency** | Sequential | Parallel agents (race risk) |

---

# PHẦN 8: ACTIONABLE ROADMAP

## Phase 1: ADOPT Core Patterns (Week 1-2)

**Tasks:**
1. ✅ Implement persistent server pattern (cli + server + state)
2. ✅ Add ref-based interaction (@e1 via ARIA snapshot)
3. ✅ CircularBuffer for logs (reduce 50K → 5K + TTL)
4. ✅ Binary compilation (`bun build --compile`)

**Deliverable:** Working `/browse-nash` skill (gstack-compatible)

---

## Phase 2: FIX Critical Issues (Week 3-4)

**Tasks:**
1. ❌ Add flock locking for state file (prevent race)
2. ❌ Switch to unix socket (zero port collision)
3. ❌ Implement ref validation (DOM hash + TTL)
4. ❌ Add Windows DPAPI cookie decryption
5. ❌ Reduce binary size (58MB → 8MB npm package)

**Deliverable:** Production-ready `/browse-nash` (no P0 bugs)

---

## Phase 3: CREATE Missing Skills (Week 5-8)

**P0 skills (7 items):**
1. `/debug` — Interactive debugger (integrates with `/review`, `/qa`)
2. `/fix` — Auto-apply fixes from `/review`
3. `/rollback` — Emergency deployment rollback
4. `/monitor` — Production health dashboard
5. `/test-gen` — Generate test cases from code
6. `/deploy` — Multi-environment deployment
7. `/security` — SAST + dependency audit

**Deliverable:** 7 new skills, 60% use case coverage (vs 22% now)

---

## Phase 4: INTEGRATE with Nash (Week 9-12)

**Tasks:**
1. Wrap skills in Nash Triad (Thesis/Anti/Synthesis)
2. Add LEDGER scoring (eval suite with known bugs)
3. External validation (Anti-Thesis re-runs tests)
4. Multi-agent browse server (tab affinity)
5. L2 Cache optimization (locator strategy, not refs)

**Deliverable:** gstack skills fully integrated into Nash pipelines

---

## Phase 5: SCALE Production (Week 13-16)

**Tasks:**
1. Cross-platform support (Windows, Linux)
2. Multi-repo workflows (monorepo, microservices)
3. Skill marketplace (install-skills.sh auto-discover)
4. Performance optimization (P99 latency, memory profiling)
5. Security audit (threat model, penetration testing)

**Deliverable:** Nash Framework 1.0 with gstack-quality skills

---

# PHỤ LỤC

## A. GLOSSARY

**gstack:** 8 cognitive modes for SDLC (Garry Tan's framework)
**Nash Triad:** Thesis → Anti-Thesis → Synthesis (adversarial debate)
**L2 Cache:** Agent core identity (<500 tokens, always loaded)
**LEDGER:** Immutable scoring record (±P0-P4 points)
**MoE Router:** Mixture of Experts routing logic
**Ref:** Element reference (@e1, @e2) from ARIA snapshot
**State file:** Persistent JSON (.gstack/browse.json)
**Skill:** Claude Code slash command with SKILL.md prompt

---

## B. FILE REFERENCE INDEX

**Part 1 (Infrastructure):**
- gstack-main/package.json
- browse/src/cli.ts, server.ts, snapshot.ts
- browse/src/cookie-import-browser.ts

**Part 2 (UX + Anti-patterns):**
- review/SKILL.md, checklist.md
- ship/SKILL.md
- plan-ceo-review/SKILL.md

**Part 3 (Requirements + Blueprint):**
- tmp/ram/conan/gstack-requirement-gaps-analysis.md
- system/MIXTURE_OF_EXPERTS_ROUTER.md
- system/templates/NASH_SUBAGENT_PROMPTS.md

---

## C. METRICS SUMMARY

**gstack current state:**
- Use case coverage: 22% (8 of 36 needs)
- Missing skills: 27 (P0: 7, P1: 9, P2: 11)
- Edge cases: 64 unhandled scenarios
- Integration gaps: 15 opportunities
- Binary size: 58MB (7x larger than needed)
- Token waste: ASCII diagrams = 5x vs YAML

**Nash targets:**
- Use case coverage: 60% (22 of 36 needs)
- P0 gaps closed: 7/7 (100%)
- Binary size: 8MB (npm package)
- Token efficiency: YAML for agent-to-agent

---

## D. CONTACT + RESOURCES

**gstack repo:** https://github.com/garrytan/gstack (hypothetical, based on README)
**Nash Framework:** E:\SuperAgent (this repo)
**Skill install:** `bash install-skills.sh --gstack`
**Documentation:** See HƯỚNG_DẪN_CHẾ_TẠO_VŨ_KHÍ_INDEX.md

---

**END OF PART 3**

🎯 **Tổng kết:** 3 files hoàn chỉnh
- PART 1: Infrastructure (2.1-2.9)
- PART 2: UX + Anti-patterns (3.1-4.8)
- PART 3: Requirements + Blueprint + Nash (5.1-8, Appendix)

👉 **Tiếp theo:** INDEX.md (tra cứu nhanh tất cả nội dung)
