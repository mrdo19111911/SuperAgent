# HƯỚNG DẪN CHẾ TẠO VŨ KHÍ - gstack Architecture Audit

**Audit bởi:** Phúc SA (Nash Agent Framework)
**Ngày:** 2026-03-15
**Nguồn:** gstack v0.3.2 by Garry Tan (YC CEO)
**Mục tiêu:** Reverse-engineer toàn bộ kiến trúc để áp dụng cho Nash Framework

---

## EXECUTIVE SUMMARY

gstack là một **skills-as-weapons framework** được thiết kế bởi CEO Y Combinator để biến Claude Code từ "one generic assistant" thành "a team of specialists you can summon on demand." Kiến trúc có 3 lớp:

1. **8 Skills (Vũ Khí):** Markdown prompts với YAML front matter - mỗi skill = một cognitive mode
2. **Browse Binary (Hệ Thống Thần Kinh):** Compiled Bun binary + persistent Chromium daemon (~100ms/cmd)
3. **Integration Patterns:** Greptile triage, cookie decryption, history tracking, eval suite gating

**Key Innovations:**
- **Ref-based interaction:** `@e1`, `@e2` từ accessibility tree → không cần CSS selectors
- **Zero-context overhead:** CLI stdout vs MCP's 2000 tokens/call
- **Diff-aware QA:** Tự động phân tích `git diff` để biết test gì
- **Persistent state:** Project-local `.gstack/` directory cho multi-workspace isolation
- **Cognitive modes:** Founder taste vs Engineering rigor vs Paranoid review - explicit gear switching

**Metrics:**
- ~4,000 LOC TypeScript (browse binary)
- ~10,000 LOC Markdown (8 skills + checklists)
- 203 integration tests
- ~58MB compiled binary
- ~100-200ms per browser command (sau khi warm-up)

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLAUDE CODE (User Layer)                        │
│                                                                         │
│  /plan-ceo-review → Founder mode     /plan-eng-review → Eng manager    │
│  /review → Paranoid reviewer         /ship → Release machine           │
│  /browse → QA engineer               /qa → QA lead                     │
│  /retro → Engineering manager        /setup-browser-cookies → Session  │
└─────────────────────────────────────────────────────────────────────────┘
         │                                                       │
         │ (Discovers skills from)                              │
         ▼                                                       ▼
┌────────────────────────────┐                    ┌─────────────────────┐
│  ~/.claude/skills/gstack/  │                    │  Project .gstack/   │
│  ├── browse/SKILL.md       │                    │  ├── browse.json    │
│  ├── review/SKILL.md       │                    │  ├── qa-reports/    │
│  ├── ship/SKILL.md         │                    │  └── retros/        │
│  └── ...                   │                    └─────────────────────┘
└────────────────────────────┘                             │
         │                                                 │
         │ (Skills invoke)                                 │
         ▼                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BROWSE BINARY (Nervous System)                     │
│  ┌──────────────┐         HTTP POST          ┌──────────────────────┐  │
│  │  CLI (325L)  │ ─────────────────────────→ │  Bun Server (362L)   │  │
│  │  - Read state│  Bearer: <UUID>            │  - Route commands    │  │
│  │  - POST JSON │  localhost:random          │  - Idle timeout      │  │
│  │  - Print text│ ←───────────────────────── │  - Buffer flush      │  │
│  └──────────────┘  Plain text response       └──────────────────────┘  │
│                                                      │                  │
│                                              ┌───────▼──────────┐       │
│                                              │ BrowserManager   │       │
│                                              │  - Launch Chrome │       │
│                                              │  - Ref map       │       │
│                                              │  - Tab mgmt      │       │
│                                              └───────┬──────────┘       │
│                                                      │                  │
│                                                      ▼                  │
│                                              ┌─────────────────┐        │
│                                              │ Playwright API  │        │
│                                              │  - ariaSnapshot │        │
│                                              │  - Locators     │        │
│                                              │  - Events       │        │
│                                              └────────┬────────┘        │
│                                                       │                 │
│                                                       ▼                 │
│                                              Chromium (headless)        │
└─────────────────────────────────────────────────────────────────────────┘
         │
         │ (Captures)
         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CircularBuffer<T> (O(1) ring buffer, 50k capacity)                    │
│  ├── Console logs  → .gstack/browse-console.log                        │
│  ├── Network logs  → .gstack/browse-network.log                        │
│  └── Dialog logs   → .gstack/browse-dialog.log                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Directory Structure

```
gstack/
├── browse/                       # Headless browser CLI
│   ├── src/                      # TypeScript source (3,952 LOC)
│   │   ├── cli.ts                # 325L - Thin client, state file reader
│   │   ├── server.ts             # 362L - HTTP server, command router
│   │   ├── browser-manager.ts   # 453L - Chromium lifecycle
│   │   ├── snapshot.ts           # 397L - Accessibility tree parser
│   │   ├── read-commands.ts     # 294L - Non-mutating ops
│   │   ├── write-commands.ts    # 312L - Mutating ops
│   │   ├── meta-commands.ts     # 221L - Server mgmt, chain, diff
│   │   ├── buffers.ts            # 137L - CircularBuffer<T>
│   │   ├── config.ts             # 105L - Path resolution
│   │   ├── cookie-import-browser.ts  # 417L - macOS cookie decrypt
│   │   ├── cookie-picker-routes.ts   # 207L - API endpoints
│   │   ├── cookie-picker-ui.ts       # 541L - Self-contained HTML
│   │   └── find-browse.ts            # 181L - Binary discovery
│   ├── dist/                     # Compiled binaries (gitignored)
│   │   ├── browse                # ~58MB, Bun --compile
│   │   ├── find-browse           # DRY binary discovery
│   │   └── .version              # Git SHA for version tracking
│   └── test/                     # 203 integration tests
│
├── plan-ceo-review/              # Founder mode skill
│   └── SKILL.md                  # 484 lines (YAML + prompt)
├── plan-eng-review/              # Engineering manager skill
│   └── SKILL.md                  # 163 lines
├── review/                       # Paranoid reviewer skill
│   ├── SKILL.md                  # 113 lines
│   ├── checklist.md              # 126 lines - Review categories
│   └── greptile-triage.md        # 123 lines - Comment classification
├── ship/                         # Release machine skill
│   └── SKILL.md                  # 344 lines
├── qa/                           # QA lead skill
│   ├── SKILL.md                  # 347 lines
│   ├── templates/
│   │   └── qa-report-template.md # 80 lines - Structured report
│   └── references/
│       └── issue-taxonomy.md     # 86 lines - Severity + categories
├── retro/                        # Engineering manager retrospective
│   └── SKILL.md                  # 445 lines
├── setup-browser-cookies/        # Session manager skill
│   └── SKILL.md                  # 88 lines
│
├── setup                         # 88 lines bash - Build + symlink
├── package.json                  # Bun build scripts
├── README.md                     # 627 lines - Marketing + docs
├── BROWSER.md                    # 230 lines - Technical details
├── CHANGELOG.md                  # 111 lines - Version history
├── CONTRIBUTING.md               # 154 lines - Dev workflow
├── TODO.md                       # 118 lines - Roadmap
└── SKILL.md                      # 351 lines - /browse skill (root)
```

---

## 2. SKILL ANATOMY (Vũ Khí Cấu Trúc)

### 2.1 YAML Front Matter Pattern

**EVERY skill bắt đầu với YAML front matter:**

```yaml
---
name: skill-name            # Tên lệnh (Claude discovers by filename)
version: 1.0.0              # Semantic versioning
description: |              # Multi-line description
  What the skill does, when to use it.
  LLM reads this to decide when to invoke.
allowed-tools:              # Tool whitelist (security boundary)
  - Bash
  - Read
  - Edit
  - Grep
  - AskUserQuestion
---
```

**Key insights:**
- `name` = slash command (`/plan-ceo-review`)
- `description` = trigger logic (LLM tự match user intent)
- `allowed-tools` = explicit permission model (không có trong list = không dùng được)
- Version giúp track breaking changes

### 2.2 Skill Categories by Cognitive Mode

| Skill | Mode | Allowed Tools | Lines | Purpose |
|-------|------|--------------|-------|---------|
| **plan-ceo-review** | Founder | Read, Grep, Glob, Bash, AskUserQuestion | 484 | Rethink the problem, find 10-star product |
| **plan-eng-review** | Eng Manager | Read, Grep, Glob, AskUserQuestion | 163 | Architecture, edge cases, test matrix |
| **review** | Paranoid Reviewer | Bash, Read, Edit, Write, Grep, Glob, AskUserQuestion | 113 | Pre-landing structural audit |
| **ship** | Release Machine | Bash, Read, Write, Edit, Grep, Glob, AskUserQuestion | 344 | Merge → test → bump → PR (automated) |
| **browse** | QA Engineer | Bash, Read | 129 | Headless browser with 50+ commands |
| **qa** | QA Lead | Bash, Read, Write | 347 | Systematic testing with health score |
| **retro** | Engineering Manager | Bash, Read, Write, Glob | 445 | Team-aware retrospective |
| **setup-browser-cookies** | Session Manager | Bash, Read | 88 | Import cookies from real browser |

**Pattern:** Tools càng ít = skill càng focused. `/browse` chỉ có Bash+Read vì nó là I/O boundary.

### 2.3 Workflow Pattern Taxonomy

**A. Linear Execution (ship, browse, setup-browser-cookies)**

```
Step 1 → Step 2 → Step 3 → ... → Output
     ↓        ↓        ↓
   [STOP nếu fail]
```

**Ví dụ `/ship`:**
```
Pre-flight → Merge main → Run tests → Evals (conditional)
→ Pre-landing review → Greptile triage → Version bump
→ Changelog → Commit → Push → Create PR
```

**B. Multi-Pass with Checkpoints (review, plan-ceo-review, plan-eng-review)**

```
Pass 1 (CRITICAL) → AskUserQuestion per issue
                    ↓
                  [User decides]
                    ↓
Pass 2 (INFORMATIONAL) → AskUserQuestion per issue
                         ↓
                       Output report
```

**C. Phased Exploration (qa)**

```
Setup → Auth → Orient → Explore (loop) → Document (incremental) → Wrap up
                           │                      │
                           └─ Per-page checklist ─┘
```

**D. Aggregation + Analysis (retro)**

```
Gather data (parallel git commands) → Compute metrics → Detect patterns
→ Per-author analysis → Save JSON → Write narrative
```

### 2.4 Common Prompt Engineering Patterns

#### Pattern 1: Explicit Priority Hierarchy

```markdown
## Priority Hierarchy Under Context Pressure
Step 0 > System audit > Error/rescue map > Test diagram > Failure modes
> Opinionated recommendations > Everything else.

Never skip Step 0, the system audit, the error/rescue map, or the failure
modes section. These are the highest-leverage outputs.
```

**Lesson:** Token budget hết → biết bỏ gì, giữ gì.

#### Pattern 2: Multi-Mode Selection (plan-ceo-review)

```markdown
### 0F. Mode Selection
Present three options:
1. **SCOPE EXPANSION:** Push scope up. Build the cathedral.
2. **HOLD SCOPE:** Review with maximum rigor.
3. **SCOPE REDUCTION:** Propose minimal version.

Context-dependent defaults:
* Greenfield feature → default EXPANSION
* Bug fix → default HOLD SCOPE
* Plan touching >15 files → suggest REDUCTION

Once selected, commit fully. Do not silently drift.
```

**Lesson:** LLM có xu hướng "silently drift" → cần explicit lock-in.

#### Pattern 3: AskUserQuestion Protocol (enforced interaction)

```markdown
## CRITICAL RULE — How to ask questions
Every AskUserQuestion MUST:
1. Present 2-3 concrete lettered options
2. State which option you recommend FIRST
3. Explain in 1-2 sentences WHY

**One issue = one AskUserQuestion call.** Never batch.
Label with NUMBER + LETTER (e.g., "3A", "3B").
```

**Lesson:** Batching = user overload. One decision at a time.

#### Pattern 4: Suppression Lists (prevent noise)

```markdown
## Suppressions — DO NOT flag these
- "Add a comment explaining why this threshold was chosen"
- "This assertion could be tighter" when assertion already covers behavior
- ANYTHING already addressed in the diff you're reviewing
```

**Lesson:** LLM có false positive patterns → list chúng ra để suppress.

#### Pattern 5: Evidence-Based Anchoring

```markdown
**Praise** (1-2 specific things): Anchor in actual commits.
Not "great work" — say exactly what was good.

Example: "Shipped the entire auth middleware rewrite in 3 focused
sessions with 45% test coverage"
```

**Lesson:** Generic praise = vô nghĩa. Cite commits/LOC/files.

#### Pattern 6: Escape Hatches

```markdown
**Escape hatch:** If a section has no issues, say so and move on.
If an issue has an obvious fix with no real alternatives, state what
you'll do and move on — don't waste a question on it.
```

**Lesson:** Không phải lúc nào cũng cần hỏi. Tự quyết định khi rõ ràng.

#### Pattern 7: Table-Driven Checklists

```markdown
### Error & Rescue Map
For every method that can fail:

  METHOD              | WHAT CAN GO WRONG    | EXCEPTION CLASS
  --------------------|----------------------|------------------
  ExampleService#call | API timeout          | Faraday::TimeoutError
                      | API returns 429      | RateLimitError
  --------------------|----------------------|------------------

  EXCEPTION CLASS     | RESCUED? | RESCUE ACTION | USER SEES
  --------------------|----------|---------------|----------
  Faraday::TimeoutError | Y      | Retry 2x      | "Temporarily unavailable"
  RateLimitError        | N ← GAP | —            | 500 ← BAD
```

**Lesson:** Tables force completeness. Gaps become visible.

#### Pattern 8: ASCII Diagram Mandates

```markdown
## Prime Directives
6. Diagrams are mandatory. No non-trivial flow goes undiagrammed.
   ASCII art for every new data flow, state machine, processing pipeline.
```

```markdown
Required ASCII diagram: full system architecture showing new components
and their relationships to existing ones.
```

**Lesson:** LLMs tốt với diagrams. Force chúng vẽ = catch hidden assumptions.

---

## 3. BROWSE BINARY ARCHITECTURE (Hệ Thống Thần Kinh)

### 3.1 Why Not MCP?

| Tool | First call | Subsequent | Context overhead/call | Protocol |
|------|-----------|-----------|----------------------|----------|
| Chrome MCP | ~5s | ~2-5s | ~2000 tokens | WebSocket + JSON schemas |
| Playwright MCP | ~3s | ~1-3s | ~1500 tokens | stdio + JSON schemas |
| **gstack browse** | **~3s** | **~100-200ms** | **0 tokens** | Plain text stdout |

**In a 20-command session:**
- MCP: 30,000-40,000 tokens wasted on protocol framing
- gstack: 0 tokens overhead

**Key Innovation:** Bash tool already exists. CLI = simplest interface.

### 3.2 Lifecycle Management

```bash
# First call (CLI detects no server)
1. CLI reads .gstack/browse.json → not found
2. CLI spawns: bun run browse/src/server.ts &
3. Server launches Chromium (Playwright)
4. Server picks random port 10000-60000
5. Server generates Bearer token (UUID)
6. Server writes state file:
   {
     "port": 42318,
     "token": "uuid-here",
     "pid": 12345,
     "binaryVersion": "abc123",  # Git SHA
     "startTime": 1234567890
   }
7. Server starts accepting HTTP requests
   (~3 seconds total)

# Subsequent calls (CLI finds existing server)
1. CLI reads .gstack/browse.json
2. CLI checks binaryVersion vs current binary
   - If mismatch → kill old server, restart
3. CLI sends HTTP POST to localhost:42318
   Authorization: Bearer <token>
   Body: { "command": "goto", "args": ["https://..."] }
4. Server routes to handler → returns plain text
5. CLI prints to stdout
   (~100-200ms total)

# Idle shutdown
Server tracks lastActivity timestamp.
Every 60s, check: now - lastActivity > 30min?
  If yes → flush buffers → exit(0)
Next CLI call auto-restarts.

# Crash recovery
Chromium crashes → Server exits immediately (no self-healing)
CLI detects dead server → auto-restart on next call
```

**State file location:** `<project-root>/.gstack/browse.json` (detected via `git rev-parse --show-toplevel`)

**Multi-workspace isolation:**
```
/code/project-a/.gstack/browse.json → port 23451 → Chromium PID 1001
/code/project-b/.gstack/browse.json → port 47832 → Chromium PID 1002
```

No port collisions. No shared state.

### 3.3 Ref-Based Interaction (Core Innovation)

**Problem:** CSS selectors brittle, XPath verbose, DOM mutation = CSP violations.

**Solution:** Accessibility tree + deterministic ref assignment.

```typescript
// 1. Get accessibility tree (Playwright API)
const ariaText = await page.locator('body').ariaSnapshot();
// Returns YAML-like text:
// - heading "Test" [level=1]
// - link "Link A"
// - button "Submit"

// 2. Parse + assign refs
const lines = ariaText.split('\n');
let refCounter = 1;
const refMap = new Map<string, Locator>();

for (const line of lines) {
  const node = parseLine(line);  // Extract role, name, props
  if (isInteractive(node.role)) {
    const ref = `@e${refCounter++}`;

    // 3. Build Playwright Locator (deterministic)
    const locator = page.getByRole(node.role, {
      name: node.name,
      exact: true
    }).nth(nthIndex);

    // 4. Store in map
    refMap.set(ref, locator);

    // 5. Print to stdout
    console.log(`${ref} ${node.role} "${node.name}"`);
  }
}

// Later: "click @e3"
const locator = refMap.get('@e3');
await locator.click();
```

**Key benefits:**
- No DOM mutation
- No CSS selector knowledge needed
- Refs stable within one navigation (invalidated on goto)
- Works with any framework (React, Vue, Rails, vanilla)

**Extended features:**

```bash
# Diff mode (-D): track changes after actions
$B snapshot               # Baseline
$B click @e3             # Perform action
$B snapshot -D           # Unified diff showing what changed
# Output: "+ Success message appeared\n- Loading spinner removed"

# Annotate mode (-a): visual evidence
$B snapshot -i -a -o /tmp/annotated.png
# Injects temporary overlay divs at each ref's bounding box
# Takes screenshot with labels
# Removes overlays
# Returns: "Annotated screenshot saved to /tmp/annotated.png"

# Cursor-interactive mode (-C): non-ARIA clickables
$B snapshot -C
# Runs page.evaluate() to find:
#   - cursor: pointer
#   - onclick handlers
#   - tabindex >= 0
# Assigns @c1, @c2, ... refs with nth-child CSS selectors
# Returns: "@c1 div 'Menu button' (cursor:pointer)"
```

### 3.4 Command Architecture

```typescript
// server.ts route dispatch
if (READ_COMMANDS.has(command)) {
  result = await handleReadCommand(command, args, browserManager);
} else if (WRITE_COMMANDS.has(command)) {
  result = await handleWriteCommand(command, args, browserManager);
} else if (META_COMMANDS.has(command)) {
  result = await handleMetaCommand(command, args, browserManager);
} else if (url.startsWith('/cookie-picker/')) {
  return handleCookiePickerRoute(url, req, browserManager);
}
```

**READ_COMMANDS** (non-mutating, 294 LOC):
```
text, html, links, forms, accessibility
js, eval, css, attrs
console, network, cookies, storage, perf
dialog, is
```

**WRITE_COMMANDS** (mutating, 312 LOC):
```
goto, back, forward, reload
click, fill, select, hover, type, press, scroll, wait
viewport, cookie, cookie-import, cookie-import-browser
header, useragent, upload
dialog-accept, dialog-dismiss
```

**META_COMMANDS** (server management, 221 LOC):
```
tabs, tab, newtab, closetab
status, stop, restart
screenshot, pdf, responsive
chain, diff
url, snapshot
```

**Pattern:** Each command returns `Promise<string>` (plain text). Server wraps in JSON, CLI unwraps, prints to stdout.

### 3.5 Buffer System (Observability)

```typescript
class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;  // Next write position
  private length = 0;
  totalAdded = 0;    // Monotonic counter for flush tracking

  push(item: T) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this.length < this.capacity) this.length++;
    this.totalAdded++;
  }

  last(n: number): T[] {
    // O(1) amortized, returns last N items
  }
}

// Three buffers
const consoleBuffer = new CircularBuffer<LogEntry>(50_000);
const networkBuffer = new CircularBuffer<NetworkEntry>(50_000);
const dialogBuffer = new CircularBuffer<DialogEntry>(50_000);

// Playwright hooks
page.on('console', msg => {
  addConsoleEntry({
    timestamp: Date.now(),
    level: msg.type(),
    text: msg.text()
  });
});

page.on('response', response => {
  addNetworkEntry({
    timestamp: Date.now(),
    method: response.request().method(),
    url: response.url(),
    status: response.status(),
    duration: ...,
    size: ...
  });
});

// Async flush every 1s
setInterval(async () => {
  const newEntries = consoleBuffer.totalAdded - lastFlushed;
  if (newEntries > 0) {
    const lines = consoleBuffer.last(newEntries).map(formatLog);
    await Bun.write(CONSOLE_LOG_PATH, existingContent + lines);
    lastFlushed = consoleBuffer.totalAdded;
  }
}, 1000);
```

**Benefits:**
- O(1) push/read (no array shifting)
- 50k capacity prevents unbounded growth
- In-memory = fast reads for `console`/`network` commands
- Async disk flush = doesn't block Chromium
- Survives server crashes (buffers flushed every 1s)

### 3.6 Cookie Import (macOS Keychain Decryption)

```typescript
// browse/src/cookie-import-browser.ts (417 LOC)

// 1. Detect installed browsers
const BROWSERS = [
  { name: 'comet', path: '~/Library/Application Support/Comet/Default/Cookies' },
  { name: 'chrome', path: '~/Library/Application Support/Google/Chrome/Default/Cookies' },
  { name: 'arc', path: '~/Library/Application Support/Arc/User Data/Default/Cookies' },
  { name: 'brave', path: '~/Library/Application Support/BraveSoftware/Brave-Browser/Default/Cookies' },
  { name: 'edge', path: '~/Library/Application Support/Microsoft Edge/Default/Cookies' },
];

// 2. Read SQLite cookie DB
const db = new Database(cookieDbPath);
const rows = db.query('SELECT host_key, name, encrypted_value FROM cookies').all();

// 3. Decrypt encrypted_value
// Chromium v10 encryption (macOS):
//   - Salt: "saltysalt"
//   - Iterations: 1003
//   - Key length: 16 bytes (AES-128)
//   - Cipher: AES-128-CBC
//   - Password: macOS Keychain entry "Chrome Safe Storage"

const password = await getKeychainPassword('Chrome Safe Storage');  // Prompts user
const key = pbkdf2Sync(password, 'saltysalt', 1003, 16, 'sha1');

for (const row of rows) {
  const encrypted = row.encrypted_value;
  if (encrypted[0] === 0x76 && encrypted[1] === 0x31 && encrypted[2] === 0x30) {
    // v10 format: "v10" prefix + 16-byte IV + ciphertext
    const iv = encrypted.slice(3, 19);
    const ciphertext = encrypted.slice(19);
    const decipher = createDecipheriv('aes-128-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const value = decrypted.toString('utf8');

    cookies.push({ domain: row.host_key, name: row.name, value });
  }
}

// 4. Interactive picker UI
// Serves self-contained HTML at http://localhost:<port>/cookie-picker
// User selects domains → POST to /cookie-picker/import
// Playwright context.addCookies(selectedCookies)
```

**Key challenges solved:**
- DB locked → copy to `/tmp` before reading
- First Keychain access → user clicks "Allow" (async 10s timeout)
- AES key caching → one prompt per browser per session
- v20 format (future) → would need AES-256-GCM support

---

## 4. INTEGRATION PATTERNS

### 4.1 Greptile Triage (review + ship)

**Problem:** Automated PR reviewers create noise. Greptile catches real bugs, but also false positives.

**Solution:** Triage layer + suppression history.

```bash
# Step 1: Fetch comments (parallel)
gh api repos/$REPO/pulls/$PR/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]")
       | select(.position != null)  # Auto-skip outdated comments
       | {id, path, line, body, html_url, source: "line-level"}'
  > /tmp/greptile_line.json &

gh api repos/$REPO/issues/$PR/comments \
  --jq '.[] | select(.user.login == "greptile-apps[bot]")
       | {id, body, html_url, source: "top-level"}'
  > /tmp/greptile_top.json &
wait

# Step 2: Check suppressions
cat ~/.gstack/greptile-history.md | grep "| fp |" | grep "$REPO"
# Match: file-pattern + category
# Example:
#   2026-03-13 | owner/repo | fp | app/services/*.rb | race-condition

# Step 3: Classify non-suppressed comments
for comment in $(cat /tmp/greptile_*.json | jq -r '.id'); do
  # Read file at path:line, cross-reference with diff
  # Classify:
  #   VALID & ACTIONABLE → add to critical findings
  #   VALID BUT ALREADY FIXED → auto-reply with commit SHA
  #   FALSE POSITIVE → AskUserQuestion (reply or ignore?)
  #   SUPPRESSED → skip silently
done

# Step 4: User actions
if classification == "VALID & ACTIONABLE":
  AskUserQuestion: A) Fix now, B) Acknowledge, C) False positive
  if user_choice == "A":
    apply_fix()
    git add <files> && git commit -m "fix: address Greptile review"
    gh api POST repos/$REPO/pulls/$PR/comments/$COMMENT_ID/replies \
      -f body="Fixed in <commit-sha>."
    append_to_history("fix")
  elif user_choice == "C":
    gh api POST repos/$REPO/pulls/$PR/comments/$COMMENT_ID/replies \
      -f body="This is a false positive because <reason>."
    append_to_history("fp")  # Future runs will suppress

elif classification == "VALID BUT ALREADY FIXED":
  # No user interaction needed
  gh api POST repos/$REPO/pulls/$PR/comments/$COMMENT_ID/replies \
    -f body="Good catch — already fixed in <commit-sha>."
  append_to_history("already-fixed")

elif classification == "FALSE POSITIVE":
  AskUserQuestion: A) Reply explaining (recommended), B) Fix anyway, C) Ignore
  if user_choice == "A":
    gh api POST ... -f body="<explanation>"
    append_to_history("fp")
```

**History file format:**
```
<YYYY-MM-DD> | <owner/repo> | <type:fp|fix|already-fixed> | <file-pattern> | <category>
2026-03-13 | garrytan/myapp | fp | app/services/auth_service.rb | race-condition
2026-03-13 | garrytan/myapp | fix | app/models/user.rb | null-check
```

**Learning:** Every false positive confirmed → suppressed in future runs. Batting average tracked in `/retro`.

### 4.2 Eval Suite Gating (/ship)

**Problem:** Prompt changes can silently regress LLM output quality.

**Solution:** Conditional eval gate based on file patterns.

```bash
# Step 3.25 in /ship: Eval Suites (conditional)

# 1. Check if diff touches prompt-related files
changed_files=$(git diff origin/main --name-only)

prompt_patterns=(
  'app/services/*_prompt_builder.rb'
  'app/services/*_generation_service.rb'
  'app/services/*_evaluator.rb'
  'config/system_prompts/*.txt'
  'test/evals/**/*'  # Eval infra changes affect all suites
)

matches=0
for pattern in "${prompt_patterns[@]}"; do
  if echo "$changed_files" | grep -E "$pattern" >/dev/null; then
    matches=$((matches + 1))
  fi
done

if [ $matches -eq 0 ]; then
  echo "No prompt-related files changed — skipping evals."
  # Continue to Step 3.5
  exit 0
fi

# 2. Identify affected eval suites
# Each *_eval_runner.rb declares PROMPT_SOURCE_FILES = [...]
for changed_file in $changed_files; do
  basename=$(basename "$changed_file")
  affected_runners=$(grep -l "$basename" test/evals/*_eval_runner.rb)
  # Map runner → test file: post_generation_eval_runner.rb → post_generation_eval_test.rb
done

# 3. Run affected suites at EVAL_JUDGE_TIER=full (Opus persona)
EVAL_JUDGE_TIER=full EVAL_VERBOSE=1 bin/test-lane --eval \
  test/evals/<suite>_eval_test.rb 2>&1 | tee /tmp/ship_evals.txt

# 4. Parse results
if grep -q "FAIL" /tmp/ship_evals.txt; then
  echo "Eval suite FAILED. Stopping /ship."
  echo "Cost dashboard: ..."
  exit 1
fi

# 5. Include eval results in PR body (Step 8)
```

**Tier strategy:**
```
fast (Haiku):     Dev iteration, smoke tests     ~$0.07/run, ~5s
standard (Sonnet): Default dev, bin/test-lane   ~$0.37/run, ~17s
full (Opus):      /ship and pre-merge           ~$1.27/run, ~72s
```

**Cost control:** Run evals ONLY when prompt files change. Fail fast if first suite fails (don't burn API cost on remaining).

### 4.3 Diff-Aware QA (/qa on feature branch)

**Problem:** Developer finishes coding, wants to verify changes work. Manually listing affected pages = slow.

**Solution:** Auto-analyze `git diff` to identify what to test.

```bash
# /qa (no URL provided, on feature branch)

# 1. Analyze branch diff
changed_files=$(git diff main...HEAD --name-only)
commit_messages=$(git log main..HEAD --oneline)

# 2. Map files → pages/routes
affected_pages=()

for file in $changed_files; do
  case "$file" in
    app/controllers/*_controller.rb)
      # Extract routes from controller name
      # Example: app/controllers/listings_controller.rb → /listings, /listings/:id
      ;;
    app/views/*)
      # Find which controller renders this view
      ;;
    app/models/*.rb)
      # Find controllers that reference this model
      ;;
    app/assets/stylesheets/*.css)
      # Find pages that include this stylesheet
      ;;
    app/javascript/components/*.tsx)
      # Find pages that render this component
      ;;
    config/routes.rb)
      # Re-parse full routing table
      ;;
  esac
done

# 3. Detect running app
for port in 3000 4000 8080; do
  if $B goto http://localhost:$port 2>/dev/null; then
    app_url="http://localhost:$port"
    break
  fi
done

if [ -z "$app_url" ]; then
  # Check PR for staging/preview URL
  preview_url=$(gh pr view --json body --jq '.body' | grep -oE 'https://[^ ]+\.vercel\.app')
  app_url="${preview_url:-ASK_USER}"
fi

# 4. Test each affected page
for page in "${affected_pages[@]}"; do
  $B goto "$app_url$page"
  $B snapshot -i -a -o "$REPORT_DIR/screenshots/$page.png"
  $B console --errors

  # If change was interactive, test the interaction
  if is_form_or_button_change "$changed_files"; then
    $B snapshot               # Baseline
    $B click @e5             # Perform action
    $B snapshot -D           # Diff
  fi
done

# 5. Report scoped to branch changes
echo "Changes tested: ${#affected_pages[@]} pages affected by this branch"
echo "All routes working: ✓"
echo "No console errors: ✓"
```

**Key insight:** `git diff` = test plan. No need for user to list pages manually.

### 4.4 Retro History Tracking

**Problem:** One-time retros = snapshots. No trends over time.

**Solution:** Save JSON, load on next run, compute deltas.

```bash
# /retro (end of Step 13)

# 1. Compute all metrics (commits, LOC, test ratio, sessions, streak, etc.)

# 2. Check for prior retros
prior_retro=$(ls -t .context/retros/*.json 2>/dev/null | head -1)

if [ -n "$prior_retro" ]; then
  # 3. Load prior snapshot
  prior_metrics=$(jq '.metrics' "$prior_retro")

  # 4. Compute deltas
  delta_test_ratio=$((current_test_ratio - prior_test_ratio))
  delta_sessions=$((current_sessions - prior_sessions))
  delta_fix_pct=$((current_fix_pct - prior_fix_pct))

  # 5. Include in narrative
  echo "## Trends vs Last Retro"
  echo "                    Last        Now         Delta"
  echo "Test ratio:         ${prior_test_ratio}%    →    ${current_test_ratio}%         ↑${delta_test_ratio}pp"
  echo "Sessions:           ${prior_sessions}     →    ${current_sessions}          ↑${delta_sessions}"
fi

# 6. Save current snapshot
today=$(TZ=America/Los_Angeles date +%Y-%m-%d)
existing=$(ls .context/retros/${today}-*.json 2>/dev/null | wc -l | tr -d ' ')
next=$((existing + 1))

cat > ".context/retros/${today}-${next}.json" <<EOF
{
  "date": "$today",
  "window": "7d",
  "metrics": {
    "commits": $commits,
    "test_ratio": $test_ratio,
    ...
  },
  "authors": { ... },
  "tweetable": "Week of Mar 1: 47 commits, 3.2k LOC, 38% tests | Streak: 47d"
}
EOF
```

**Enables:**
- Week-over-week trends (test ratio improving? fix ratio decreasing?)
- Multi-week buckets (if window >= 14d)
- Compare mode: `| retro compare 14d` → side-by-side

---

## 5. OPTIMIZATION TECHNIQUES

### 5.1 Token Efficiency

**Technique 1: Zero-context tools**

```bash
# BAD: MCP tool (2000 tokens overhead per call)
{
  "tool": "chrome_navigate",
  "parameters": {
    "url": "https://example.com"
  },
  "schema": { ... 500 tokens ... }
}

# GOOD: Plain text CLI
$B goto https://example.com
# Output: "Navigated to https://example.com"
# Overhead: 0 tokens
```

**Technique 2: Accessibility tree vs full DOM**

```
Full DOM innerHTML:        ~3000-5000 tokens
Accessibility tree (ARIA): ~200-400 tokens
Reduction:                 ~90%
```

**Technique 3: Compact snapshot flags**

```bash
# Without -i: 2000 tokens (all structural nodes)
$B snapshot

# With -i: 300 tokens (only interactive elements)
$B snapshot -i

# With -i -c: 150 tokens (interactive + compact)
$B snapshot -i -c

# With -i -c -d 3: 80 tokens (interactive + compact + depth limit)
$B snapshot -i -c -d 3
```

**Technique 4: Diff mode vs full re-read**

```bash
# BAD: Re-fetch full snapshot after action
$B snapshot -i              # 300 tokens
$B click @e5
$B snapshot -i              # 300 tokens again
# Total: 600 tokens

# GOOD: Diff mode
$B snapshot -i              # 300 tokens
$B click @e5
$B snapshot -D              # 50 tokens (only changes)
# Total: 350 tokens
```

### 5.2 Conditional Execution (Eval Suite Gating)

```bash
# /ship Step 3.25: ONLY run evals if prompt files changed
changed_files=$(git diff origin/main --name-only)

if ! echo "$changed_files" | grep -E 'prompt|generation|evaluator' >/dev/null; then
  echo "No prompt-related files changed — skipping evals."
  # Saves ~$1.27 and ~72s per /ship
  exit 0
fi
```

**Savings:** 95% of PRs don't touch prompts → skip expensive eval gate.

### 5.3 Parallel Execution

**Example 1: /retro data gathering (Step 1)**

```bash
# Run ALL git commands in parallel (independent queries)
git log origin/main --since="7 days ago" --format=... --shortstat &
git log origin/main --since="7 days ago" --format=... --numstat &
TZ=America/Los_Angeles git log origin/main --since="7 days ago" --format=... | sort -n &
git log origin/main --since="7 days ago" --format="" --name-only | grep -v '^$' | sort | uniq -c &
git shortlog origin/main --since="7 days ago" -sn --no-merges &
cat ~/.gstack/greptile-history.md 2>/dev/null || true &
wait

# All 6 queries complete in time of slowest (not sum)
```

**Example 2: /ship Step 3 (tests)**

```bash
# Rails tests and Vitest in parallel
bin/test-lane 2>&1 | tee /tmp/ship_tests.txt &
npm run test 2>&1 | tee /tmp/ship_vitest.txt &
wait
```

### 5.4 Persistent State (Avoid Re-initialization)

**Server stays running 30 minutes:**
```
Call 1: Start server + launch Chrome     (~3s)
Call 2: Reuse existing Chrome            (~100ms)
Call 3: Reuse existing Chrome            (~100ms)
...
Call 50: Reuse existing Chrome           (~100ms)

Idle 30 min → auto-shutdown
Call 51: Restart server + launch Chrome  (~3s)
```

**Ref map persists between commands:**
```bash
$B snapshot -i        # Build ref map (@e1, @e2, ...)
$B click @e3          # Lookup in map → instant
$B fill @e5 "value"   # Lookup in map → instant
# No re-snapshot needed (until navigation)
```

### 5.5 Multi-Pass Architecture (plan-ceo-review)

**Pass 1 (CRITICAL):** SQL safety, race conditions, LLM trust boundary
- If critical issues found → STOP, fix, re-run
- Don't waste tokens on informational passes if critical broken

**Pass 2 (INFORMATIONAL):** Style, dead code, test gaps
- Only run if Pass 1 clean
- Non-blocking → included in PR body but don't stop /ship

**Savings:** Failed critical pass = early exit (no wasted tokens on full review).

---

## 6. BEST PRACTICES (DO's and DON'Ts)

### 6.1 Skill Design

**DO:**
- ✅ Explicit mode selection (EXPANSION vs HOLD vs REDUCTION)
- ✅ Priority hierarchy for token pressure
- ✅ One AskUserQuestion per issue (no batching)
- ✅ Evidence-based recommendations (cite files, lines, commits)
- ✅ Suppression lists for known false positives
- ✅ Escape hatches (don't ask when answer obvious)
- ✅ Table-driven checklists (force completeness)
- ✅ ASCII diagrams for complex flows

**DON'T:**
- ❌ Generic instructions ("review the code carefully")
- ❌ Batching multiple issues into one question
- ❌ Vague TODOs without context
- ❌ Silently drifting between modes
- ❌ Re-arguing after user selects mode
- ❌ Asking yes/no questions (always give options A/B/C)
- ❌ Preambles and summaries (be terse)

### 6.2 Browser Interaction

**DO:**
- ✅ Use `snapshot -i` first (see all interactive elements)
- ✅ Use `snapshot -D` to verify actions worked
- ✅ Use `snapshot -a` for bug report evidence
- ✅ Use `snapshot -C` for tricky UIs (cursor:pointer divs)
- ✅ Check `console --errors` after every interaction
- ✅ Use `is` commands for assertions (`is visible .modal`)
- ✅ Use `chain` for long flows (batch into one HTTP call)

**DON'T:**
- ❌ Guess CSS selectors (use refs from snapshot)
- ❌ Re-snapshot after every command (refs persist)
- ❌ Parse page text instead of `is` assertions
- ❌ Use MCP tools (zero-context CLI is faster)
- ❌ Navigate multiple times for independent queries (`goto` once, then `text`/`js`/`screenshot`)

### 6.3 Integration

**DO:**
- ✅ Conditional execution (only run evals when needed)
- ✅ Parallel commands when independent
- ✅ Sequential with `&&` when dependent
- ✅ Persistent history (JSON snapshots for trends)
- ✅ Suppressions (learn from false positives)
- ✅ Auto-retry with backoff (Greptile API, evals)

**DON'T:**
- ❌ Run evals on every PR (expensive)
- ❌ Ignore history files (trends = value)
- ❌ Silently swallow errors (fail fast, fail loud)
- ❌ Block on non-critical issues
- ❌ Manual cookie import every time (use /setup-browser-cookies)

---

## 7. MISSING PIECES (Gaps to Fill)

### 7.1 Cross-Platform Support

**Current:** macOS only (Keychain decryption for cookies)

**Missing:**
- Linux: GNOME Keyring / kwallet support
- Windows: DPAPI support
- Chromium v20 encryption (AES-256-GCM vs current v10 AES-128-CBC)

### 7.2 Video Recording

**Deferred to Phase 5** (TODO.md line 41)

**Reason:** `recreateContext()` destroys page state → can't maintain recording across useragent changes.

**Solution:** Need session isolation (Phase 5).

### 7.3 Visual PR Annotations (Phase 3.6)

**Planned:**
- `/setup-gstack-upload` skill (S3 bucket config)
- `browse/bin/gstack-upload` (upload screenshot → return public URL)
- `/ship` Step 7.5: embed screenshots in PR body
- `/review` Step 4.5: visual review with annotated screenshots

**Value:** GitHub PR comments support images. Annotated screenshots = higher signal review.

### 7.4 Network Mocking/Routing

**Phase 6 (Advanced Browser):**
- Intercept requests
- Block domains
- Mock API responses
- Test offline mode

### 7.5 Trend Tracking (QA Reports)

**Current:** Single run baseline → regression mode compares 2 runs.

**Missing:** Multi-week trend analysis:
- Health score over time
- Issue categories trending up/down
- Console error accumulation
- Framework upgrade impact

**Idea:** `qa/baselines/*.json` → weekly snapshots → chart in Markdown.

---

## 8. RECOMMENDATIONS FOR NASH FRAMEWORK

### 8.1 Adopt Core Patterns

**Priority 1 (Immediate):**

1. **YAML Front Matter for Skills**
   ```yaml
   ---
   name: tung-diag
   version: 1.0.0
   description: |
     Phase -1 audit: System diagnostic + 3 parallel sub-audits
   allowed-tools:
     - Bash
     - Read
     - Grep
   ---
   ```

2. **Ref-Based Interaction (if building browser automation)**
   - Accessibility tree > CSS selectors
   - Deterministic ref assignment (@e1, @e2)
   - Locator map (no DOM mutation)

3. **AskUserQuestion Protocol**
   ```markdown
   ## For Each Issue
   - One issue = one AskUserQuestion
   - Present 2-3 lettered options (A, B, C)
   - State recommendation FIRST
   - Explain WHY (map to engineering preferences)
   - Label with NUMBER + LETTER (3A, 3B)
   ```

4. **Suppression Lists**
   ```markdown
   ## DO NOT flag these
   - "Add a comment explaining threshold" — thresholds change during tuning
   - "This assertion could be tighter" when assertion already covers behavior
   ```

5. **Priority Hierarchy**
   ```markdown
   ## Under Token Pressure
   System audit > Error map > Test diagram > Failure modes > Everything else
   Never skip: System audit, Error map, Failure modes
   ```

**Priority 2 (Medium-term):**

6. **Multi-Mode Selection (for Phúc SA)**
   - SCOPE EXPANSION: Dream big, build cathedral
   - HOLD SCOPE: Rigorous review
   - SCOPE REDUCTION: Minimum viable
   - Once selected → commit fully (no silent drift)

7. **Table-Driven Checklists**
   ```markdown
   | METHOD | EXCEPTION | RESCUED? | USER SEES |
   |--------|-----------|----------|-----------|
   | Foo#call | TimeoutError | Y | "Service unavailable" |
   | Foo#call | ParseError | N ← GAP | 500 ← BAD |
   ```

8. **Persistent History (JSON Snapshots)**
   ```bash
   .context/retros/2026-03-15-1.json
   .context/audits/2026-03-15-phase-1.json
   ```

9. **Conditional Execution (Cost Control)**
   ```bash
   if ! needs_validation; then
     echo "Skipping validation (no relevant changes)"
     exit 0
   fi
   ```

**Priority 3 (Future):**

10. **Compiled Binary for Critical Path** (if performance matters)
    - Bun --compile = ~58MB single executable
    - ~1ms startup vs ~500ms for Node/Bun script
    - State file + HTTP server pattern

11. **Interactive Picker UIs** (for complex selections)
    - Self-contained HTML in skill
    - Served from local HTTP server
    - User selects in browser → returns to CLI

12. **Greptile-Style Triage Layer** (for any automated reviewer)
    - Fetch comments from tool
    - Classify: VALID / ALREADY FIXED / FALSE POSITIVE / SUPPRESSED
    - Learn from false positives → suppress in future

### 8.2 Adapt gstack Architecture for Nash

**Nash Triad Integration:**

```markdown
# Pipeline 2: Architecture

## Thesis Phase (Phúc SA + Quang)
/plan-eng-review mode (adapted from gstack)
- System audit
- Architecture review with diagrams
- Data flow + edge cases
- Test review with diagram

## Anti-Thesis Phase (Mộc + Lan)
- Review checklist (adapted from gstack/review/checklist.md)
- Two-pass review (CRITICAL → INFORMATIONAL)
- AskUserQuestion per critical issue

## Synthesis Phase (Dũng PM)
- Aggregate findings from both phases
- Resolve conflicts
- Final approval with evidence citations
```

**3-Tier Memory Mapping:**

```
L2 Cache (agents/{layer}/{agent}.md):
  - YAML front matter
  - Core workflow (< 500 tokens)
  - Allowed tools
  - Priority hierarchy

RAM (tmp/ram/{agent}/*.md):
  - Full checklists (review/checklist.md pattern)
  - Issue taxonomies (qa/references/issue-taxonomy.md pattern)
  - Templates (qa/templates/qa-report-template.md pattern)
  - Only loaded when needed

HDD (source code):
  - Browse binary source (browse/src/*.ts pattern)
  - Never preloaded
```

**Gate Scripts Enhancement:**

```bash
# gates/validate.sh → integrate gstack /review patterns
bash gates/validate.sh <module>
  1. Build + tsc
  2. Run tests
  3. Pre-landing review (SQL safety, race conditions, LLM trust)
  4. Check TODO/FIXME
  5. AskUserQuestion per critical issue

# gates/qa.sh → integrate gstack /qa patterns
bash gates/qa.sh <module> [url]
  1. SAST
  2. Test distribution check
  3. Smoke test (if url provided)
  4. Diff-aware QA (if on feature branch)

# gates/commit.sh → integrate gstack /ship patterns
bash gates/commit.sh <module> [msg]
  1. Pre-validate
  2. Exclude secrets (git add by name, never `git add .`)
  3. Bisectable commits (group by logical unit)
  4. Version bump + CHANGELOG
```

### 8.3 Browser Automation (if Nash needs it)

**Option 1: Vendor gstack browse (recommended)**
```bash
cp -Rf ~/.claude/skills/gstack/browse nash-framework/tools/browse
# Modify SKILL.md to fit Nash terminology
# Keep binary as-is (solid foundation)
```

**Option 2: Build Nash-specific browser (only if gstack insufficient)**
- Reuse snapshot.ts architecture (ref-based interaction)
- Reuse buffer.ts (CircularBuffer pattern)
- Adapt server.ts for Nash's project structure
- Add custom commands for Nash-specific workflows

**Don't reinvent:**
- Playwright integration (use theirs)
- Cookie decryption (copy their code)
- State file management (copy their pattern)

### 8.4 Scoring Integration

**gstack has no scoring** → Nash's Zero-Sum Ledger is unique.

**Recommendation:** Add scoring layer on top of gstack patterns.

```markdown
# After Pipeline 2 (Architecture) completes:

## Phúc SA writes LEDGER entry:
P2 issue (contract drift): -15 points to Quang (missed data flow edge case)
P3 issue (TODO at validate): -10 points to Mộc (flagged stale comment)
```

**Evidence sources:**
- `git log` (who committed what)
- Gate script outputs (which gate failed)
- AskUserQuestion history (who approved what)

---

## 9. ARCHITECTURE DIAGRAMS

### 9.1 Skill Discovery Flow

```
┌──────────────────────────────────────────────────────────────┐
│  User types: /plan-ceo-review                                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Claude Code scans:                                          │
│  1. Project local:  .claude/skills/                          │
│  2. Global install: ~/.claude/skills/                        │
│                                                              │
│  Find: plan-ceo-review/SKILL.md or plan-ceo-review.md       │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Parse YAML front matter:                                    │
│  ---                                                         │
│  name: plan-ceo-review                                       │
│  version: 1.0.0                                              │
│  description: |                                              │
│    CEO/founder-mode plan review...                          │
│  allowed-tools:                                              │
│    - Read                                                    │
│    - Grep                                                    │
│    - Glob                                                    │
│    - Bash                                                    │
│    - AskUserQuestion                                         │
│  ---                                                         │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  Load prompt body (everything after ---)                     │
│  Inject into Claude's context                               │
│  Execute with allowed tools only                            │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Browse Binary Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Skill executes: $B goto https://example.com                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLI (browse/dist/browse):                                      │
│  1. Read .gstack/browse.json                                    │
│     {                                                           │
│       "port": 42318,                                            │
│       "token": "uuid-abc123",                                   │
│       "pid": 12345,                                             │
│       "binaryVersion": "git-sha"                                │
│     }                                                           │
│  2. Check binaryVersion vs current binary                       │
│     - If mismatch → kill old server, restart                    │
│  3. Construct HTTP request                                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  HTTP POST to localhost:42318/command                           │
│  Headers:                                                       │
│    Authorization: Bearer uuid-abc123                            │
│    Content-Type: application/json                              │
│  Body:                                                          │
│    { "command": "goto", "args": ["https://example.com"] }      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server (browse/src/server.ts):                                 │
│  1. Validate Bearer token                                       │
│  2. Reset idle timer (lastActivity = now)                       │
│  3. Route to handleWriteCommand()                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  write-commands.ts → goto handler:                              │
│  1. Get page from BrowserManager                                │
│  2. await page.goto(url)                                        │
│  3. Hook console/network listeners                              │
│  4. Return: "Navigated to https://example.com"                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server wraps response:                                         │
│  { "result": "Navigated to https://example.com", "error": null }│
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLI receives JSON, unwraps, prints to stdout:                  │
│  "Navigated to https://example.com"                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Bash tool captures stdout → returns to Claude → skill continues│
└─────────────────────────────────────────────────────────────────┘

Total latency: ~100-200ms (server already running)
               ~3s (first call, server cold start)
```

### 9.3 Ref Assignment Flow (Snapshot System)

```
┌─────────────────────────────────────────────────────────────────┐
│  Command: $B snapshot -i                                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  snapshot.ts → handleSnapshot():                                │
│  1. Get page from BrowserManager                                │
│  2. const ariaText = await page.locator('body').ariaSnapshot()  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Playwright returns YAML-like text:                             │
│                                                                 │
│  - heading "Test Page" [level=1]                                │
│  - link "Link A":                                               │
│    - /url: /a                                                   │
│  - button "Submit"                                              │
│  - textbox "Name"                                               │
│  - paragraph: Some text content                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Parse each line → extract { role, name, props }                │
│  Filter by opts.interactive (only buttons, links, inputs, etc.) │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  For each interactive element:                                  │
│                                                                 │
│  refCounter = 1                                                 │
│  refMap = new Map<string, Locator>()                            │
│                                                                 │
│  For node in filteredNodes:                                     │
│    ref = `@e${refCounter++}`                                    │
│                                                                 │
│    // Build deterministic Locator                               │
│    locator = page.getByRole(node.role, {                        │
│      name: node.name,                                           │
│      exact: true                                                │
│    }).nth(nthIndex)                                             │
│                                                                 │
│    refMap.set(ref, locator)                                     │
│    output += `${ref} ${node.role} "${node.name}"\n`            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Store refMap on BrowserManager (in-memory)                     │
│  Return output to CLI:                                          │
│                                                                 │
│  @e1 link "Link A"                                              │
│  @e2 button "Submit"                                            │
│  @e3 textbox "Name"                                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  Later command: $B click @e2                                    │
│                                                                 │
│  1. Look up refMap.get('@e2') → Locator                         │
│  2. await locator.click()                                       │
│  3. Return: "Clicked @e2"                                       │
└─────────────────────────────────────────────────────────────────┘

Key: NO DOM MUTATION. Refs = aliases to Playwright Locators.
Refs invalidated on navigation (new page = new accessibility tree).
```

### 9.4 Greptile Triage Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  /review or /ship reaches Greptile step                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. Detect PR:                                                  │
│     REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner) │
│     PR=$(gh pr view --json number -q .number)                   │
│                                                                 │
│     If fails → skip Greptile silently (integration is additive) │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Fetch comments (parallel):                                  │
│                                                                 │
│     # Line-level comments                                       │
│     gh api repos/$REPO/pulls/$PR/comments \                     │
│       --jq '.[] | select(.user.login == "greptile-apps[bot]")   │
│                 | select(.position != null)                     │
│                 | {id, path, line, body, html_url}' \           │
│       > /tmp/greptile_line.json &                               │
│                                                                 │
│     # Top-level PR comments                                     │
│     gh api repos/$REPO/issues/$PR/comments \                    │
│       --jq '.[] | select(.user.login == "greptile-apps[bot]")   │
│                 | {id, body, html_url}' \                       │
│       > /tmp/greptile_top.json &                                │
│                                                                 │
│     wait                                                        │
│                                                                 │
│     If 0 comments → skip silently                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Check suppressions (~/.gstack/greptile-history.md):         │
│                                                                 │
│     For each comment:                                           │
│       pattern = extract_pattern(comment.path, comment.body)     │
│       category = classify_category(comment.body)                │
│                                                                 │
│       if history.has(repo, "fp", pattern, category):            │
│         mark as SUPPRESSED → skip                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Classify non-suppressed comments:                           │
│                                                                 │
│     For each comment:                                           │
│       Read file at path:line (±10 lines context)                │
│       Cross-reference with git diff origin/main                 │
│       Cross-reference with review checklist                     │
│                                                                 │
│       Classify:                                                 │
│         - VALID & ACTIONABLE                                    │
│           → Real bug in current code                            │
│                                                                 │
│         - VALID BUT ALREADY FIXED                               │
│           → Issue addressed in later commit                     │
│           → Extract commit SHA                                  │
│                                                                 │
│         - FALSE POSITIVE                                        │
│           → Misunderstood code / stylistic noise                │
│                                                                 │
│         - SUPPRESSED                                            │
│           → Known false positive from history                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. User interaction:                                           │
│                                                                 │
│     VALID & ACTIONABLE:                                         │
│       AskUserQuestion:                                          │
│         A) Fix it now (recommended)                             │
│         B) Acknowledge and ship anyway                          │
│         C) It's a false positive                                │
│                                                                 │
│       If A:                                                     │
│         apply_fix()                                             │
│         git add <files>                                         │
│         git commit -m "fix: address Greptile review"            │
│         gh api POST .../comments/$ID/replies \                  │
│           -f body="Fixed in <sha>."                             │
│         append_to_history("fix", pattern, category)             │
│                                                                 │
│       If C:                                                     │
│         gh api POST .../comments/$ID/replies \                  │
│           -f body="False positive: <reason>"                    │
│         append_to_history("fp", pattern, category)              │
│                                                                 │
│     VALID BUT ALREADY FIXED:                                    │
│       # No user interaction                                     │
│       gh api POST .../comments/$ID/replies \                    │
│         -f body="Good catch — already fixed in <sha>."          │
│       append_to_history("already-fixed", pattern, category)     │
│                                                                 │
│     FALSE POSITIVE:                                             │
│       AskUserQuestion:                                          │
│         A) Reply explaining (recommended)                       │
│         B) Fix it anyway (if trivial)                           │
│         C) Ignore silently                                      │
│                                                                 │
│       If A:                                                     │
│         gh api POST ... -f body="<explanation>"                 │
│         append_to_history("fp", pattern, category)              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Include in output:                                          │
│                                                                 │
│     + N Greptile comments (X valid, Y fixed, Z FP)              │
│                                                                 │
│     ## Greptile Review                                          │
│     - [FIXED] app/models/user.rb:12 — Null check on email       │
│     - [FALSE POSITIVE] lib/auth.rb:88 — Already using secure    │
│       compare                                                   │
└─────────────────────────────────────────────────────────────────┘

Key: Every triage outcome → learns for next time.
History file = distributed knowledge base.
```

---

## 10. COMPLETION SUMMARY

```
+========================================================================+
|              GSTACK ARCHITECTURE AUDIT — COMPLETION SUMMARY            |
+========================================================================+
| System audited       | gstack v0.3.2 (Garry Tan / Y Combinator)       |
| Total files read     | 28 files (14,000+ LOC analyzed)               |
| Skills documented    | 8/8 (100% coverage)                           |
| Architecture layers  | 3 (Skills, Browse Binary, Integration)       |
| Key innovations      | 8 (ref-based, zero-context, diff-aware, etc.) |
| Diagrams produced    | 4 (System, Discovery, Request, Ref, Greptile) |
| Best practices       | 12 DO's, 12 DON'Ts                            |
| Missing pieces       | 5 (cross-platform, video, visual PR, etc.)    |
| Nash recommendations | 12 (3 priority levels)                        |
+========================================================================+
| Evidence sources     |                                               |
|   - README.md        | 627 lines - Marketing + architecture         |
|   - BROWSER.md       | 230 lines - Technical deep dive               |
|   - CHANGELOG.md     | 111 lines - Evolution history                 |
|   - TODO.md          | 118 lines - Roadmap + ideas                   |
|   - 8 SKILL.md files | ~2,600 lines total                            |
|   - Supporting docs  | ~500 lines (checklists, templates, taxonomy)  |
|   - TypeScript src   | 3,952 lines (browse binary)                   |
+========================================================================+
```

---

## APPENDIX A: SKILL COMPARISON TABLE

| Feature | plan-ceo-review | plan-eng-review | review | ship | browse | qa | retro | setup-browser-cookies |
|---------|----------------|-----------------|--------|------|--------|----|----|----------------------|
| **Lines (SKILL.md)** | 484 | 163 | 113 | 344 | 129 | 347 | 445 | 88 |
| **Allowed Tools** | 5 | 4 | 7 | 7 | 2 | 3 | 4 | 2 |
| **Mode Selection** | Yes (3) | Yes (3) | No | No | No | Yes (4) | Yes (2) | No |
| **Multi-Pass** | Yes (2) | Yes (4) | Yes (2) | No | No | Yes (6) | No | No |
| **AskUserQuestion** | Yes (per issue) | Yes (per issue) | Yes (critical) | Yes (version/review) | No | No | No | No |
| **Tables** | 4 | 2 | 1 | 0 | 2 | 4 | 3 | 0 |
| **Diagrams Required** | 6 types | 1 type | 0 | 0 | 0 | 0 | 0 | 0 |
| **External Refs** | 0 | 0 | 2 files | 2 files | 1 file | 2 files | 0 | 0 |
| **Conditional Exec** | Yes (evals) | No | No | Yes (evals, Greptile) | No | Yes (diff-aware) | No | No |
| **History Files** | No | No | 1 (Greptile) | 1 (Greptile) | 3 (logs) | 2 (baselines, reports) | 1 (JSON) | 0 |
| **Suppressions** | No | No | Yes | Yes | No | No | No | No |

---

## APPENDIX B: FILE PATTERNS FOR NASH

```bash
# Nash Framework skill structure (proposed)

agents/
├── layer-1-audit/
│   ├── tung-diag/
│   │   └── SKILL.md              # Phase -1 audit coordinator
│   ├── audit-perf/
│   │   └── SKILL.md              # Performance sub-audit
│   ├── audit-security/
│   │   └── SKILL.md              # Security sub-audit
│   └── audit-quality/
│       └── SKILL.md              # Quality sub-audit
│
├── layer-2-architecture/
│   ├── phuc-sa/
│   │   ├── SKILL.md              # Based on plan-eng-review
│   │   ├── checklist.md          # Based on review/checklist.md
│   │   └── templates/
│   │       └── arch-doc.md
│   └── quang/
│       └── SKILL.md
│
├── layer-3-coding/
│   ├── dev-agents/
│   │   └── SKILL.md
│   └── eslint/
│       └── SKILL.md
│
├── layer-4-testing/
│   ├── son-qa/
│   │   ├── SKILL.md              # Based on qa/SKILL.md
│   │   ├── templates/
│   │   │   └── qa-report.md      # Based on qa/templates/
│   │   └── references/
│   │       └── issue-taxonomy.md # Based on qa/references/
│   └── huyen-fe-qa/
│       └── SKILL.md
│
├── layer-5-security/
│   └── thanh-lai/
│       └── SKILL.md
│
└── layer-6-hotfix/
    ├── tung/
    │   └── SKILL.md
    └── lan/
        └── SKILL.md

tools/
├── browse/                       # Vendored from gstack
│   ├── src/
│   ├── dist/
│   └── SKILL.md
│
└── merge-audit/
    └── SKILL.md                  # Based on ship/SKILL.md patterns

gates/
├── validate.sh                   # Enhanced with review/checklist.md
├── integrity.sh
├── qa.sh                         # Enhanced with qa/SKILL.md
├── security.sh
└── commit.sh                     # Enhanced with ship/SKILL.md

.context/
├── audits/                       # Persistent audit snapshots
│   └── 2026-03-15-phase-1.json
├── retros/                       # Persistent retro snapshots
│   └── 2026-03-15-1.json
└── greptile/                     # Greptile history (if used)
    └── history.md

.gstack/                          # If using browse
├── browse.json
├── browse-console.log
├── browse-network.log
├── browse-dialog.log
└── qa-reports/
```

---

**END OF AUDIT REPORT**

**Prepared by:** Phúc SA (Nash Agent Framework)
**For:** Dũng PM (Main Agent)
**Next Steps:** Present to User for approval, then integrate recommendations into Nash architecture.
