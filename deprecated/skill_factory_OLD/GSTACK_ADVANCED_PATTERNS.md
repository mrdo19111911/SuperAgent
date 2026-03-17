# gstack Advanced Patterns
## Insights từ gstack-guide (Vietnamese translation by Minh Đỗ)

**Tài liệu này bổ sung** cho `GSTACK_WRITING_STYLE.md` với các pattern nâng cao từ [gstack-guide.vercel.app](https://2026-03-15-gstack-guide.vercel.app/).

---

## 1. COGNITIVE MODE SWITCHING (Chuyển Đổi Chế Độ Nhận Thức)

### Philosophy Core Insight

> **"AI coding assistant không nên stuck trong một mode duy nhất."**
> - Garry Tan, CEO Y Combinator

**Problem:** Generic assistant tries to do everything → trung bình ở tất cả.

**Solution:** Explicit "gears" (bánh răng) - khả năng shift cognitive mode theo phase.

### The 8 Cognitive Modes (gstack Skills)

| Skill | Metaphor | Mode | When to Use |
|-------|----------|------|-------------|
| `/plan-ceo-review` | **Cathedral builder / Surgeon** | Founder taste + ambition | Pressure-test product direction |
| `/plan-eng-review` | **Best technical lead** | Engineering rigor | Lock architecture + test matrix |
| `/review` | **Paranoid staff engineer** | Security audit | Find bugs that pass CI but nổ production |
| `/ship` | **Release machine** | Fast execution | Sync, test, push, PR - no talking |
| `/browse` | **QA engineer with eyes** | Browser automation | Login, click, screenshot, catch breakage |
| `/qa` | **QA lead** | Systematic testing | Diff-aware → affected pages → test |
| `/setup-browser-cookies` | **Session manager** | Cookie import | Import Chrome/Arc/Brave cookies → headless |
| `/retro` | **Engineering manager** | Team retrospective | Data-driven retro with per-contributor breakdown |

### Pattern: One Feature, Five Modes

**Real workflow** của Garry Tan:

```
User: "Add seller photo upload to listing app"

┌─────────────────────────────────────────────────────────────┐
│ Phase 1: /plan-ceo-review (Founder Mode)                    │
│ ─────────────────────────────────────────────────────────── │
│ Q: Is "photo upload" the real feature?                      │
│ A: No - the job is helping sellers create listings that     │
│    SELL. 10-star version:                                   │
│    • Identify product from photo                            │
│    • Search web + draft title/description                   │
│    • Pull specs, category, pricing comps                    │
│    • Detect bad photos (dark, cluttered)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 2: /plan-eng-review (Tech Lead Mode)                  │
│ ─────────────────────────────────────────────────────────── │
│ • Architecture diagram: upload → classify → enrich → draft  │
│ • State machine: [uploaded] → [processing] → [enriched]     │
│ • Failure modes: API timeout, rate limit, orphan cleanup    │
│ • Test matrix: happy/nil/empty/error paths                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 3: [exit plan mode, implement]                        │
│ ─────────────────────────────────────────────────────────── │
│ • Developer codes the feature                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 4: /review (Paranoid Engineer Mode)                   │
│ ─────────────────────────────────────────────────────────── │
│ Findings:                                                    │
│ • Race condition: two tabs can overwrite cover-photo        │
│ • Trust boundary: web data → prompt injection vector        │
│ • Missing: orphan cleanup for failed uploads                │
└─────────────────────────────────────────────────────────────┘
                            ↓
           (Developer fixes issues)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 5: /ship (Release Machine Mode)                       │
│ ─────────────────────────────────────────────────────────── │
│ • Sync with main, run tests                                 │
│ • Push + create PR                                          │
│ • Triage Greptile review comments                           │
│ ✅ DONE - no talking, pure execution                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Phase 6: /qa (QA Engineer Mode)                             │
│ ─────────────────────────────────────────────────────────── │
│ • Analyzing diff... 3 routes affected                       │
│ • Upload + enrichment flow passes end-to-end                │
│ • No console errors, no regressions                         │
└─────────────────────────────────────────────────────────────┘
```

### How to Apply This Pattern

**When creating a skill:**

1. **Pick ONE clear mental model** (không phải "generic assistant")
   - ✅ "You are a paranoid staff engineer hunting production bugs"
   - ✅ "You are a release machine executing without asking"
   - ❌ "You are a helpful coding assistant"

2. **Define explicit stopping policy** (Meta-Instructions principle)
   ```markdown
   **Only stop for:**
   - Test failures (show failures)
   - Merge conflicts that can't be auto-resolved

   **Never stop for:**
   - Uncommitted changes (always include them)
   - Version bump choice (auto-pick MICRO/PATCH)
   - CHANGELOG content (auto-generate from diff)
   ```

3. **State the mode shift trigger**
   ```markdown
   ## Philosophy
   Your posture depends on what the user needs:
   * EXPANSION mode: You are building a cathedral. Envision the platonic ideal...
   * HOLD mode: You are a rigorous reviewer. Challenge assumptions...
   * REDUCTION mode: You are a surgeon. Find minimum viable version...
   ```

---

## 2. PERSISTENT STATE ARCHITECTURE (For Complex Tools)

### Problem: Cold-Start Latency

**Naïve approach:** Mỗi tool call → start browser → 3-5 giây overhead → 20 commands = 40+ giây wasted.

**gstack solution:** **Browse Daemon Model**

### Architecture

```
Claude Code                          gstack
───────────                         ──────
                                    ┌──────────────────────┐
  Tool call: $B snapshot -i         │  CLI (compiled binary)│
  ─────────────────────────→        │  • reads state file   │
                                    │  • POST /command      │
                                    └──────────┬───────────┘
                                               │ HTTP
                                    ┌──────────▼───────────┐
                                    │  Server (Bun.serve)   │
                                    │  • dispatches command  │
                                    │  • talks to Chromium   │
                                    └──────────┬───────────┘
                                               │ CDP (Chrome DevTools Protocol)
                                    ┌──────────▼───────────┐
                                    │  Chromium (headless)   │
                                    │  • persistent tabs     │
                                    │  • cookies carry over  │
                                    │  • 30min idle timeout  │
                                    └───────────────────────┘
```

**Performance:**
- First call: ~3s (start everything)
- Every call after: ~100-200ms

### State File Pattern

**Location:** `.gstack/browse.json` (or `.smartlog/state.json`)

**Contents:**
```json
{
  "pid": 12345,
  "port": 42891,
  "token": "uuid-random-token",
  "version": "0.3.7",
  "started_at": "2026-03-16T12:34:56Z"
}
```

**Lifecycle:**
1. CLI reads state file
2. If file missing/stale/PID chết → spawn server
3. Server writes state with mode `0o600` (owner-only read)
4. CLI validates PID + port before each request
5. 30min idle → server auto-shutdown → delete state file

### Port Selection Strategy

**Challenge:** 10 parallel Conductor workspaces → no port collisions.

**Solution:**
```typescript
function findAvailablePort(): number {
  for (let retry = 0; retry < 5; retry++) {
    const port = Math.floor(Math.random() * 50000) + 10000; // 10000-60000
    if (isPortAvailable(port)) return port;
  }
  throw new Error("No available ports after 5 retries");
}
```

### Security Model

1. **Localhost only** - Server binds `localhost`, không `0.0.0.0`
2. **Bearer token auth** - Random UUID, written to state file (mode 0o600)
   ```typescript
   headers: {
     Authorization: `Bearer ${stateFile.token}`
   }
   ```
3. **Cookie security**:
   - Keychain access → user approval (macOS dialog)
   - Decryption in-process (PBKDF2 + AES-128-CBC)
   - No plaintext cookies written to disk
   - Key caching per-session (server shutdown = cache gone)
   - No cookie values in logs

### Why Bun?

| Feature | Benefit |
|---------|---------|
| **Compiled binaries** | `bun build --compile` → single ~58MB executable, no `node_modules` at runtime |
| **Native SQLite** | Cookie decryption reads SQLite directly - `new Database()` built-in |
| **Native TypeScript** | Server runs `bun run server.ts` - no compilation step, no ts-node |
| **Built-in HTTP** | `Bun.serve()` nhanh, đơn giản - framework would be overkill |

**Bottleneck:** Luôn là Chromium, không phải CLI hay server.

### When to Use This Pattern

**Use persistent daemon when:**
- ✅ Tool has expensive initialization (browser, ML model, database connection)
- ✅ Multiple calls expected in sequence
- ✅ State needs to persist across calls (cookies, tabs, sessions)

**Use stateless when:**
- ✅ Tool is fast to initialize (<100ms)
- ✅ Each call is independent
- ✅ No persistent state needed

---

## 3. REF SYSTEM (@e1, @e2) - Better than CSS Selectors

### Problem with Traditional Approaches

| Approach | Problem |
|----------|---------|
| **CSS Selectors** | Brittle - class names change, CSP blocks injection |
| **XPath** | Fragile - DOM structure changes break paths |
| **data-testid** | Requires code modification, doesn't work on 3rd-party sites |
| **DOM mutation** | CSP blocks it, React/Vue hydration strips it, Shadow DOM unreachable |

### gstack Solution: Accessibility Tree → Playwright Locators

**Workflow:**

```
1. Agent: $B snapshot -i
   ↓
2. Server: page.accessibility.snapshot()
   ↓
3. Parser walks ARIA tree → assign refs:
   @e1 = button "Sign in"
   @e2 = textbox "Email"
   @e3 = textbox "Password"
   @e4 = button "Submit"
   ↓
4. Build Playwright Locator:
   getByRole('button', {name: 'Sign in'}).nth(0)
   ↓
5. Store Map<string, Locator> in memory
   ↓
6. Agent: $B click @e3
   ↓
7. Server: @e3 → Locator → locator.click()
```

### Why Locators > DOM Mutation

**Accessibility tree is external to DOM:**
- ✅ CSP (Content Security Policy) cannot block it
- ✅ React/Vue hydration cannot strip it
- ✅ Shadow DOM is reachable via ARIA
- ✅ Works on 3rd-party sites without modification
- ✅ Semantic (role + name) = more robust than class names

### Example Output

```bash
$B snapshot -i

Interactive elements:
@e1  button      "☰ Menu"
@e2  link        "Home"
@e3  link        "Products"
@e4  textbox     "Search..."
@e5  button      "Search"
@e6  link        "Sign in"
```

**Agent can now:**
```bash
$B click @e6       # Click "Sign in"
$B fill @e4 "foo"  # Type "foo" in search box
$B press @e4 Enter # Press Enter in search box
```

### Implementation Pattern

```typescript
// Parse accessibility tree
const snapshot = await page.accessibility.snapshot();
const refs = new Map<string, Locator>();

function walk(node: AXNode, index: number) {
  if (node.role && node.name) {
    const ref = `@e${index}`;
    const locator = page.getByRole(node.role, {name: node.name}).nth(0);
    refs.set(ref, locator);
  }
  node.children?.forEach((child, i) => walk(child, index + i + 1));
}

walk(snapshot, 1);

// Later: execute command
async function click(ref: string) {
  const locator = refs.get(ref);
  if (!locator) throw new Error(`Ref ${ref} not found`);
  await locator.click();
}
```

---

## 4. 3-TIER EVAL STRATEGY (Cost-Optimized Testing)

### Philosophy

> **"Catch 95% issues miễn phí, dùng LLMs chỉ cho judgment calls."**

**Problem:** E2E tests with LLM = expensive (~$4 per run). Running on every commit → unsustainable.

**Solution:** Tiered testing pyramid.

### Tier 1: Static Validation (Free, <5s)

**What:** Parse mọi `$B` command trong SKILL.md, validate vs registry.

**Example:**
```typescript
// tests/static.test.ts
const skillContent = fs.readFileSync('SKILL.md', 'utf-8');
const commands = skillContent.match(/\$B\s+(\w+)/g);

const validCommands = [
  'goto', 'snapshot', 'click', 'fill', 'press',
  'screenshot', 'wait', 'back', 'forward', 'reload'
];

commands.forEach(cmd => {
  const name = cmd.replace('$B ', '');
  expect(validCommands).toContain(name);
});
```

**Catches:**
- ✅ Typos in command names (`$B clik` → fail)
- ✅ Undefined commands (`$B magic` → fail)
- ✅ Invalid syntax (`$B` without command → fail)

**Runs:** Every `bun test` (CI + local).

### Tier 2: E2E via `claude -p` (~$3.85, ~20min)

**What:** Spawn real Claude session, run skill, check for errors.

**Infrastructure:**
```typescript
// tests/e2e/runner.ts
async function runE2ETest(promptFile: string) {
  const prompt = fs.readFileSync(promptFile, 'utf-8');

  // Write to temp file (avoid shell escaping)
  const tempFile = `/tmp/prompt-${Date.now()}.txt`;
  fs.writeFileSync(tempFile, prompt);

  // Spawn claude -p
  const proc = spawn('sh', ['-c',
    `cat ${tempFile} | claude -p --output-format stream-json --verbose`
  ]);

  // Race against timeout
  const timeout = 300000; // 5min
  const result = await Promise.race([
    parseTranscript(proc),
    sleep(timeout).then(() => ({ status: 'timeout' }))
  ]);

  // Write logs
  fs.writeFileSync(`logs/${Date.now()}.json`, JSON.stringify(result));

  return result;
}
```

**Observability:**
- Heartbeat file (touch every 10s)
- Per-run log directory
- `progress.log` (live tail during test)
- Failure transcripts (saved for debugging)
- Machine-readable diagnostics: `exit_reason`, `timeout_at_turn`, `last_tool_call`

**Catches:**
- ✅ Tool call errors (invalid arguments)
- ✅ Workflow deadlocks (infinite loops)
- ✅ Permission errors (file access)
- ✅ Integration issues (server not responding)

**Runs:** Gated by `EVALS=1` flag (manual or nightly CI).

### Tier 3: LLM-as-Judge (~$0.15, ~30s)

**What:** Sonnet scores documentation trên clarity/completeness/actionability.

**Prompt:**
```markdown
You are evaluating skill documentation quality.

Rate 1-10 on:
1. **Clarity** - Can a developer understand what this skill does in 60 seconds?
2. **Completeness** - Are all steps documented? Any implicit assumptions?
3. **Actionability** - Can someone follow this and succeed without asking questions?

Skill documentation:
{SKILL.md content}

Output JSON:
{
  "clarity": 8,
  "completeness": 7,
  "actionability": 9,
  "reasoning": "Clear philosophy section, but Step 3 assumes user knows what 'triage' means without defining it."
}
```

**Catches:**
- ✅ Missing sections (no Philosophy → -2 completeness)
- ✅ Vague instructions ("handle errors" → -3 actionability)
- ✅ Poor structure (walls of text → -2 clarity)

**Runs:** After Tier 2 passes (cheap validation of quality).

### Combined Strategy

```bash
# Local development (fast feedback)
bun test                         # Tier 1: <5s

# Before commit (comprehensive)
EVALS=1 bun run test:evals       # Tier 1+2+3: ~$4, ~20min

# Live monitoring
bun run eval:watch               # Dashboard with progress bars
```

**Cost breakdown per full run:**
- Tier 1: $0 (static)
- Tier 2: ~$3.85 (Claude API for E2E)
- Tier 3: ~$0.15 (Sonnet for docs review)
- **Total: ~$4 per comprehensive test**

---

## 5. GREPTILE INTEGRATION PATTERN (Automated PR Review Triage)

### Context

**Greptile** (YC company) reviews PRs tự động - catches real bugs (race conditions, security issues).

**Problem:** Not every Greptile comment is valid. Manual triage = tedious.

### gstack Solution: Automated Triage + Learning

**Workflow (trong `/review` và `/ship`):**

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Fetch Greptile comments from PR                     │
│ ─────────────────────────────────────────────────────────── │
│ • Read PR number from git branch                            │
│ • Call GitHub API: GET /repos/:owner/:repo/pulls/:num/comments │
│ • Filter to Greptile bot comments only                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Classify each comment                               │
│ ─────────────────────────────────────────────────────────── │
│ For each comment:                                           │
│   • Check ~/.gstack/greptile-history.md for known FPs       │
│   • If match → skip (learned false positive)               │
│   • Otherwise → analyze comment vs actual code change       │
│   • Classify: VALID | ALREADY_FIXED | FALSE_POSITIVE        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Take action                                         │
│ ─────────────────────────────────────────────────────────── │
│ VALID issues:                                               │
│   → Add to critical findings                                │
│   → Must fix before /ship                                   │
│                                                             │
│ ALREADY_FIXED:                                              │
│   → Auto-reply: "Good catch! Fixed in commit <sha>"         │
│                                                             │
│ FALSE_POSITIVE:                                             │
│   → Ask user: "Greptile flagged X, but I think it's OK     │
│     because Y. Push back?" (y/n)                            │
│   → If user confirms FP:                                    │
│      • Reply to comment explaining why FP                   │
│      • Append to ~/.gstack/greptile-history.md              │
│      • Future runs will auto-skip this pattern              │
└─────────────────────────────────────────────────────────────┘
```

### greptile-history.md Format

```markdown
# Greptile False Positive History

## Pattern: Defensive nil checks flagged as redundant

**Greptile comment pattern:**
> `user.email` is already checked on line 42, this nil check is redundant

**Why false positive:**
Defense in depth - the check on line 42 is in a different codepath (controller),
this check is in the model callback (can be triggered from console/migration).
Both checks are intentional.

**First seen:** 2026-03-10 (PR #234)
**Confirmed by:** alice@example.com
**Auto-skip rule:**
```regex
/is already checked.*this nil check is redundant/i
```

---

## Pattern: Arel vs sanitize_sql_array

**Greptile comment pattern:**
> Use Arel instead of `sanitize_sql_array` for better composability

**Why false positive:**
We prefer `sanitize_sql_array` for readability in simple cases.
Arel is overkill for single-condition WHERE clauses.
This is a style preference, not a security issue.

**First seen:** 2026-03-12 (PR #267)
**Confirmed by:** bob@example.com
**Auto-skip rule:**
```regex
/Use Arel instead of.*sanitize_sql_array/i
```
```

### Classification Logic

```typescript
async function classifyGreptileComment(
  comment: GitHubComment,
  diff: GitDiff,
  history: GreptileHistory
): Promise<Classification> {

  // Check learned FPs first
  if (history.matches(comment.body)) {
    return { type: 'LEARNED_FP', confidence: 1.0 };
  }

  // Check if issue already fixed in diff
  const mentionedFile = extractFile(comment.body);
  const mentionedLine = extractLine(comment.body);
  const relevantDiff = diff.getHunk(mentionedFile, mentionedLine);

  if (relevantDiff && fixesIssue(relevantDiff, comment.body)) {
    return {
      type: 'ALREADY_FIXED',
      evidence: relevantDiff,
      confidence: 0.9
    };
  }

  // Analyze if valid concern
  const analysis = await analyzeComment({
    comment: comment.body,
    diff: relevantDiff,
    fullFile: readFile(mentionedFile)
  });

  if (analysis.isValidConcern) {
    return {
      type: 'VALID',
      severity: analysis.severity, // CRITICAL | MAJOR | MINOR
      evidence: analysis.reasoning
    };
  }

  return {
    type: 'FALSE_POSITIVE',
    reasoning: analysis.whyFalsePositive,
    confidence: 0.7
  };
}
```

### Learning Mechanism

**Key insight:** Each confirmed FP becomes training data.

```typescript
async function handleFalsePositive(
  comment: GitHubComment,
  reasoning: string,
  confirmedBy: string
) {
  // 1. Reply to comment
  await github.createCommentReply({
    body: `This is a false positive because:\n\n${reasoning}\n\n` +
          `Our codebase intentionally uses this pattern for [reason].`
  });

  // 2. Extract pattern
  const pattern = extractGeneralizablePattern(comment.body);

  // 3. Append to history
  const entry = {
    pattern: pattern.description,
    greptileCommentPattern: pattern.regex,
    whyFalsePositive: reasoning,
    firstSeen: new Date(),
    confirmedBy: confirmedBy,
    autoSkipRule: pattern.regex
  };

  await appendToHistory('~/.gstack/greptile-history.md', entry);

  // 4. Reload history for current session
  history.reload();
}
```

### Benefits

✅ **Saves time** - Triage 20 comments → 2 minutes instead of 20 minutes
✅ **Learns** - False positives only flagged once, then auto-skipped forever
✅ **Teaches** - History file documents team's architectural decisions
✅ **Auditable** - Every skip has evidence (commit SHA, confirmer, reasoning)

---

## 6. /QA's 4 MODES (Systematic Testing Methodology)

### Philosophy

> **"`/browse` gives agent eyes. `/qa` gives it testing methodology."**

**Problem:** Ad-hoc testing → inconsistent coverage, missed regressions.

**Solution:** 4 structured testing modes.

### Mode 1: Diff-Aware (Auto on feature branch)

**Trigger:** Run `/qa` while on non-main branch.

**Workflow:**
```
1. Detect current branch
2. Run: git diff main --name-only
3. Analyze changed files → infer affected routes:

   Example:
   app/controllers/items_controller.rb  → /items/*
   app/views/items/show.html.erb       → /items/:id
   app/services/listing_enricher.rb    → /items/:id (depends on enrichment)

4. Build test plan:
   • Affected routes: /items/new, /items/:id
   • Edge cases: empty item, item with missing data
   • Regressions: ensure existing items still work

5. Execute tests using $B commands
6. Report: "3 routes tested, all working. No console errors."
```

**Strengths:**
- ✅ Fast (only tests affected areas)
- ✅ Relevant (focused on actual changes)
- ✅ No manual test planning

### Mode 2: Full (URL trực tiếp)

**Trigger:** `/qa https://staging.myapp.com`

**Workflow:**
```
1. Crawl app (5-15 minutes):
   • Start at homepage
   • Click every link in nav
   • Submit every form
   • Test authenticated vs unauthenticated views

2. For each page:
   • Check HTTP status (expect 200/302)
   • Check console errors (fail on JS errors)
   • Check accessibility (ARIA violations)
   • Check responsive (test mobile viewport)
   • Screenshot for visual regression

3. Report:
   • N pages visited
   • M issues found (5-10 well-evidenced issues)
   • Severity: CRITICAL / MAJOR / MINOR
   • Evidence: screenshots + console logs
```

**Strengths:**
- ✅ Comprehensive coverage
- ✅ Finds issues human testers miss
- ✅ Catches integration bugs

**Weaknesses:**
- ❌ Slow (5-15 min)
- ❌ Expensive ($0.50-$2 in API costs)

### Mode 3: Quick (30-second smoke test)

**Trigger:** `/qa --quick https://staging.myapp.com`

**Workflow:**
```
1. Homepage loads? (expect 200)
2. Top 5 nav targets load? (click each, expect 200)
3. Any console errors? (expect none)
4. Any 404s? (expect none)
5. Report: "✅ Smoke test passed" or "❌ Failed: [issue]"
```

**Use case:** Pre-deploy sanity check.

### Mode 4: Regression (Compare vs baseline)

**Trigger:** `/qa --regression baseline.json https://staging.myapp.com`

**Workflow:**
```
1. Load baseline (previous QA report):
   baseline.json = {
     "tested_at": "2026-03-15T10:00:00Z",
     "issues": [
       { "page": "/items/123", "type": "console_error", "message": "..." }
     ],
     "score": 85
   }

2. Run full QA (same as Mode 2)

3. Compare results:
   • Fixed issues: baseline issues not in current → ✅ GOOD
   • New issues: current issues not in baseline → ⚠️ REGRESSION
   • Score delta: current score - baseline score → +5 (improved)

4. Report:
   QA Regression Report:
   • 2 issues fixed since baseline ✅
   • 1 new issue introduced ⚠️
   • Score: 85 → 90 (+5)

   FIXED:
   - /items/123 console error (fixed in commit abc123)

   NEW:
   - /items/new form submit → 500 error ⚠️
```

**Use case:** Pre-release regression testing, continuous quality tracking.

### Mode Selection Logic

```markdown
## Step 1: Detect QA mode

1. Check arguments:
   • If `--quick` → Mode 3 (Quick smoke test)
   • If `--regression <file>` → Mode 4 (Regression)
   • If URL provided → Mode 2 (Full exploration)
   • Otherwise → check git branch

2. If no URL and not on main:
   → Mode 1 (Diff-aware)
   Output: "Analyzing branch diff against main..."

3. If on main without URL:
   → Error: "Specify URL for QA or switch to feature branch"
```

### Test Distribution Insight

gstack uses **test distribution** để parallelize Mode 2:

```typescript
// Spawn 5 parallel test workers
const pages = await crawlAllPages(baseUrl);
const chunks = splitIntoChunks(pages, 5);

await Promise.all(
  chunks.map((chunk, i) =>
    runTestWorker(chunk, `worker-${i}`)
  )
);

// Aggregate results
const results = chunks.flatMap(c => c.results);
```

**Benefit:** Full QA in 3 minutes instead of 15 minutes.

---

## TÓM TẮT: 6 Advanced Patterns từ gstack-guide

| # | Pattern | Key Insight | When to Apply |
|---|---------|-------------|---------------|
| **1** | **Cognitive Mode Switching** | "AI không nên stuck trong một mode" - explicit gears (Founder/TechLead/Paranoid/Release/QA) | Multi-phase workflows (plan → review → ship) |
| **2** | **Persistent State Architecture** | Browse daemon = 3s first call, 100ms after. State file (PID/port/token), random ports, 30min timeout | Complex tools with expensive init (browser, ML model) |
| **3** | **Ref System (@e1, @e2)** | Accessibility tree → Playwright Locators. Survives CSP, React hydration, Shadow DOM | Browser automation on any site (không cần modify code) |
| **4** | **3-Tier Eval Strategy** | Tier 1 free (<5s), Tier 2 $3.85 (E2E), Tier 3 $0.15 (LLM judge). Catch 95% issues miễn phí | Cost-optimized CI pipeline |
| **5** | **Greptile Integration** | Classify (VALID/FIXED/FP) → take action → learn. History file prevents repeat FPs | Automated PR review tools (Greptile, CodeRabbit, etc) |
| **6** | **/qa's 4 Modes** | Diff-aware (fast) / Full (comprehensive) / Quick (30s smoke) / Regression (baseline compare) | Systematic testing methodology |

---

## Next Steps for skill_factory

**These patterns should be referenced in:**

1. **smartlog_skill_creator** - Add section "Advanced Patterns" referencing this file
2. **MANUFACTURING_GUIDE.md** - Add "Persistent State" pattern to architecture section
3. **SKILL_BUILDING_MASTER_GUIDE.md** - Link this as "Level 5: Advanced Patterns"

**Usage:**
```markdown
For basic skills: Use GSTACK_WRITING_STYLE.md (12 principles)
For complex skills: Also read GSTACK_ADVANCED_PATTERNS.md (6 patterns)
```
