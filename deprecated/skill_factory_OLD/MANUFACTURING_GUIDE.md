# MANUFACTURING GUIDE
## Quy trình chế tạo Skills chuẩn gstack - SỔ TAY SẢN XUẤT HÀNG LOẠT

**Mục đích:** Nhân rộng 100+ skills với chất lượng đồng đều như gstack
**Nguồn:** Distilled từ 8 skills gstack (browse, review, ship, qa, retro, plan-ceo, plan-eng, setup-cookies)

---

# 1. KIẾN TRÚC SKILL (3 Patterns)

## Pattern A: PERSISTENT SERVER (browse, debug, profile)

**Khi nào dùng:**
- ✅ Cần giữ state giữa các lệnh (browser tabs, DB connection, file watchers)
- ✅ Cold start > 1s (Playwright launch = 2-3s)
- ✅ Nhiều lệnh liên tiếp trong 1 session

**Cấu trúc files:**
```
skill-name/
├── SKILL.md                 # Prompt chính
├── src/
│   ├── cli.ts              # Entry point: parse args → ensure server → send command
│   ├── server.ts           # Bun.serve, routing, auth
│   ├── browser-manager.ts  # State quản lý (tabs, refs, buffers)
│   ├── handlers/
│   │   ├── read.ts         # Commands read-only (snapshot, text, links)
│   │   ├── write.ts        # Commands ghi (goto, click, fill)
│   │   └── meta.ts         # Meta commands (tabs, screenshot, health)
│   ├── buffers.ts          # CircularBuffer cho logs
│   └── types.ts
├── test/
│   ├── fixtures/           # HTML test files
│   └── *.test.ts
├── dist/
│   └── browse              # Compiled binary (hoặc npm package)
├── .gstack/
│   └── state.json          # Runtime state (pid, port, token)
├── package.json
└── setup                   # Build + symlink script
```

**Flow:**
```typescript
// cli.ts
const state = await ensureServer();  // Read state file, check health, start if needed
await sendCommand(state, command, args);

// server.ts
const server = Bun.serve({
  port: findAvailablePort(),
  fetch: async (req) => {
    if (!authenticate(req)) return 401;
    const { command, args } = await req.json();
    return await route(command, args);
  }
});
writeState({ pid: process.pid, port, token });

// State file (.gstack/browse.json)
{
  "pid": 12345,
  "port": 45678,
  "token": "uuid-v4",
  "startedAt": "2026-03-15T10:30:00Z"
}
```

---

## Pattern B: STATELESS (fix, docs, changelog-gen)

**Khi nào dùng:**
- ✅ Mỗi lệnh độc lập, không phụ thuộc lệnh trước
- ✅ Execution nhanh < 500ms
- ✅ Chỉ cần đọc files, không cần persistent connection

**Cấu trúc files:**
```
skill-name/
├── SKILL.md
├── src/
│   ├── cli.ts              # Direct execution, no server
│   ├── handlers.ts         # Business logic
│   └── types.ts
├── test/
│   └── *.test.ts
├── dist/
│   └── skill
└── setup
```

**Flow:**
```typescript
// cli.ts
const [command, ...args] = process.argv.slice(2);
const result = await execute(command, args);
console.log(result);
```

---

## Pattern C: HYBRID SESSION (deploy, monitor)

**Khi nào dùng:**
- ✅ Cần session nhưng có TTL (auto-expire after 30 min idle)
- ✅ Setup cost vừa phải (~500ms: connect DB, init API client)
- ✅ Batch commands nhưng không phải 24/7 server

**Cấu trúc:** Giống Pattern A nhưng thêm idle timeout

```typescript
// server.ts
let lastCommandTime = Date.now();

setInterval(() => {
  if (Date.now() - lastCommandTime > IDLE_TIMEOUT) {
    console.log('Idle timeout, shutting down...');
    server.stop();
    process.exit(0);
  }
}, 60_000);

// On each command
fetch: async (req) => {
  lastCommandTime = Date.now();  // Reset timer
  // ... handle command
}
```

---

# 2. SKILL.MD ANATOMY (8 Phần BẮT BUỘC)

## 2.1 Header (Role + Trigger)

```markdown
# Skill Name

**Role:** [Một câu mô tả mental model - VD: "Paranoid code reviewer", "QA lead"]
**Trigger:** [Khi nào invoke - VD: "Pre-merge review", "Before deploy"]
**Pattern:** [Persistent/Stateless/Hybrid]
```

---

## 2.2 Pre-Conditions

```markdown
## Pre-Conditions

**Required:**
- Git repository (run `git status` to verify)
- Bun v1.0+ installed
- GitHub CLI (`gh`) authenticated

**Optional:**
- Greptile API key (enhances review, not required)

**Setup:**
bash
cd ~/.claude/skills/skill-name && ./setup

```

---

## 2.3 Workflow (Numbered Steps)

```markdown
## Workflow

**Step 1: System Audit**
bash
git status
git log --oneline -20
git diff --cached


**Step 2: Analysis**
- Parse diff for changed files
- Categorize by type (feature, bugfix, refactor)

**If no changes:** Print "Nothing to review" and EXIT.

**Step 3: Review Pass 1 (CRITICAL)**
- SQL safety: Check for string interpolation in queries
- Race conditions: Look for unprotected shared state
- LLM trust boundaries: Verify output sanitization

**For each CRITICAL issue found:**
- AskUserQuestion with options: A) Fix now, B) Acknowledge, C) False positive

**If user chooses A (Fix now):**
- Apply fix using Edit tool
- Re-run affected tests
- Commit with message: "fix: [description]"

**Step 4: Review Pass 2 (INFORMATIONAL)**
- Output findings to console (no user interaction)
- Save to `.gstack/review-report.md`
```

**Nguyên tắc viết Workflow:**
- ✅ Đánh số thứ tự (Step 1, 2, 3...)
- ✅ Mỗi step có điều kiện rõ ràng (If X → do Y, Otherwise → do Z)
- ✅ Escape hatch (khi nào STOP, khi nào EXIT sớm)
- ✅ Code blocks cho lệnh shell (dễ copy-paste)

---

## 2.4 Stop Conditions

```markdown
## Stop Conditions

**STOP if:**
- Not in git repo → show error: "Run this in a git repository"
- No changes staged → nothing to review
- User not authenticated to GitHub → run `gh auth login`

**Never stop for:**
- Greptile API unavailable → skip that section silently
- Minor warnings (style, comments) → report but continue
```

---

## 2.5 Output Requirements

```markdown
## Output Format

**Console (real-time):**
markdown
## CRITICAL Issues (3 found)

### Issue 1: SQL Injection at auth.rb:47
**Problem:** String interpolation in WHERE clause
**Fix:** Use `where(email: ?)` instead of `where("email = '#{email}'")`
**Action:** A) Fix now, B) Acknowledge, C) False positive


**File artifacts:**
- `.gstack/review-report.md` — Full findings
- `.gstack/review-history.json` — Append for trend analysis

**User interaction:**
- One AskUserQuestion per CRITICAL issue
- INFORMATIONAL issues → no questions, just report
```

---

## 2.6 Error Handling

```markdown
## Error Scenarios

**If git command fails:**
bash
git status 2>&1 || echo "ERROR: Not a git repository. Initialize with 'git init'."


**If server won't start (port taken):**
- Try 5 random ports in range 10000-60000
- If all fail → show error with port list
- Suggest manual cleanup: `lsof -ti:PORT | xargs kill`

**If browser crashes mid-command:**
- Log error to `.gstack/browse-errors.log`
- Restart browser automatically
- Retry command once
- If still fails → return error to user
```

---

## 2.7 Examples

```markdown
## Usage Examples

**Basic usage:**
bash
skill review


**Diff-aware mode (only review changed files):**
bash
skill review --diff


**Skip Greptile (faster, offline mode):**
bash
skill review --no-greptile


**Debug mode (verbose logging):**
bash
skill review --debug
```

---

## 2.8 Integration Hooks

```markdown
## Integrations

**Hands off to other skills:**
- `skill review` finds CRITICAL → suggests `skill fix` with file:line
- `skill qa` finds bug → triggers `skill debug` with repro steps

**Receives from:**
- `skill ship` → calls `skill review` before creating PR
- `skill retro` → includes review metrics (issues found/fixed)

**Nash Triad mapping:**
- Thesis: Execute skill (this agent)
- Anti-Thesis: Verify findings (re-run on same diff)
- Synthesis: Reconcile discrepancies (user approval)
```

---

# 3. MEMORY MANAGEMENT (Khi nào tách file)

## 3.1 SKILL.md Size Limits

**Nguyên tắc:**
- ✅ Main SKILL.md: **< 15K tokens** (fits in one LLM context window)
- ✅ Nếu > 15K → tách thành modules

**Ví dụ tách:**

```
# TOO BIG (25K tokens):
review/SKILL.md                    # 25K - quá lớn!

# REFACTORED:
review/
├── SKILL.md                       # 8K - main workflow
├── checklist.md                   # 7K - review categories
├── suppressions.md                # 3K - known false positives
└── greptile-integration.md        # 2K - optional enhancement
```

**SKILL.md tham chiếu modules:**
```markdown
## Step 3: Review Pass 1

**Categories to check:** See [checklist.md](checklist.md) for full taxonomy.

**Known suppressions:** See [suppressions.md](suppressions.md) - DO NOT flag these.
```

---

## 3.2 CircularBuffer Pattern (Logs)

**Khi nào dùng:**
- ✅ Persistent server cần track console logs, network requests, dialog events
- ✅ Không muốn RAM tăng vô hạn

**Implementation:**
```typescript
// buffers.ts
class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private _size = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(entry: T): void {
    const index = (this.head + this._size) % this.capacity;
    this.buffer[index] = entry;

    if (this._size < this.capacity) {
      this._size++;
    } else {
      this.head = (this.head + 1) % this.capacity;  // Overwrite oldest
    }
  }

  last(n: number): T[] {
    const result: T[] = [];
    const start = Math.max(0, this._size - n);
    for (let i = start; i < this._size; i++) {
      const idx = (this.head + i) % this.capacity;
      result.push(this.buffer[idx]!);
    }
    return result;
  }

  get totalAdded(): number {
    return this.head + this._size;  // For incremental flush
  }
}

// Usage
const consoleBuffer = new CircularBuffer<LogEntry>(5000);  // Keep last 5K entries
const networkBuffer = new CircularBuffer<NetworkLog>(1000);
```

**Sizing guide:**
- Console logs: 5K entries (~8 min at 10 logs/sec)
- Network requests: 1K entries (~typical page load = 50 requests)
- Dialog events: 100 entries (rare)

---

## 3.3 Ref Map (Element References)

**Pattern:** `@e1`, `@e2` → Playwright Locator

```typescript
// snapshot.ts
type RefMap = Map<string, Locator>;

async function createSnapshot(page: Page): Promise<{ output: string; refMap: RefMap }> {
  const ariaText = await page.locator('body').ariaSnapshot();
  const refMap = new Map();
  let refCounter = 1;

  const roleNameCounts = new Map<string, number>();

  // Parse YAML, count duplicates
  for (const node of parseARIA(ariaText)) {
    const key = `${node.role}:${node.name}`;
    roleNameCounts.set(key, (roleNameCounts.get(key) || 0) + 1);
  }

  // Build refs
  let output = '';
  for (const node of parseARIA(ariaText)) {
    const ref = `e${refCounter++}`;
    const key = `${node.role}:${node.name}`;

    let locator = page.getByRole(node.role, { name: node.name });

    // Disambiguate if needed
    if (roleNameCounts.get(key)! > 1) {
      const index = /* track seen count */;
      locator = locator.nth(index);
    }

    refMap.set(ref, locator);
    output += `@${ref} ${node.role} "${node.name}"\n`;
  }

  return { output, refMap };
}
```

**Invalidation strategy:**
```typescript
// browser-manager.ts
page.on('framenavigated', (frame) => {
  if (frame === page.mainFrame()) {
    this.clearRefs();  // Navigation = refs stale
  }
});
```

---

## 3.4 State File Persistence

**Pattern:** Atomic write

```typescript
// server.ts
function writeState(state: State) {
  const tmpFile = STATE_FILE + '.tmp';
  fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2));
  fs.renameSync(tmpFile, STATE_FILE);  // Atomic on POSIX
}

// cli.ts - with locking
function readState(): State | null {
  const lockFd = fs.openSync(STATE_FILE + '.lock', 'w');

  try {
    fs.flockSync(lockFd, 'ex');  // Exclusive lock

    if (!fs.existsSync(STATE_FILE)) return null;

    const content = fs.readFileSync(STATE_FILE, 'utf-8');
    const state = JSON.parse(content);

    // Verify process still alive
    if (!isProcessAlive(state.pid)) return null;

    return state;
  } finally {
    fs.flockSync(lockFd, 'un');  // Release
    fs.closeSync(lockFd);
  }
}
```

---

# 4. TESTING STRATEGY (3 Layers)

## 4.1 Unit Tests (Fast, 80%+ coverage)

```typescript
// handlers.test.ts
import { describe, it, expect } from 'bun:test';
import { parseCommand } from './handlers';

describe('parseCommand', () => {
  it('parses goto command', () => {
    const cmd = parseCommand(['goto', 'https://example.com']);
    expect(cmd).toEqual({
      type: 'goto',
      url: 'https://example.com'
    });
  });

  it('throws on invalid URL', () => {
    expect(() => parseCommand(['goto', 'not-a-url']))
      .toThrow('Invalid URL');
  });
});
```

**Nguyên tắc:**
- ✅ Test pure functions (parsers, validators, formatters)
- ✅ No external dependencies (mock Playwright, network)
- ✅ Fast (< 100ms per test)

---

## 4.2 Integration Tests (Real server, fixture HTML)

```typescript
// integration.test.ts
import { beforeAll, afterAll, test, expect } from 'bun:test';
import { spawn } from 'child_process';

let serverProc: any;
let testServer: any;

beforeAll(async () => {
  // Start fixture server
  testServer = Bun.serve({
    port: 8765,
    fetch: (req) => {
      const url = new URL(req.url);
      if (url.pathname === '/test.html') {
        return new Response(`
          <button id="btn1">Click Me</button>
          <input id="input1" type="text" />
        `, { headers: { 'Content-Type': 'text/html' } });
      }
      return new Response('Not Found', { status: 404 });
    }
  });

  // Start skill server
  serverProc = spawn('bun', ['run', 'src/server.ts']);
  await Bun.sleep(2000);  // Wait for startup
});

afterAll(() => {
  serverProc.kill();
  testServer.stop();
});

test('full workflow: goto → snapshot → click', async () => {
  // Goto
  const goto = await sendCommand('goto', 'http://localhost:8765/test.html');
  expect(goto.status).toBe('ok');

  // Snapshot
  const snapshot = await sendCommand('snapshot');
  expect(snapshot.output).toContain('@e1 button "Click Me"');

  // Click
  const click = await sendCommand('click', '@e1');
  expect(click.status).toBe('ok');
});

async function sendCommand(cmd: string, ...args: string[]) {
  const state = JSON.parse(fs.readFileSync('.gstack/browse.json', 'utf-8'));
  const resp = await fetch(`http://127.0.0.1:${state.port}/command`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${state.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command: cmd, args })
  });
  return await resp.json();
}
```

**Fixtures:**
```
test/fixtures/
├── basic.html          # Simple button + input
├── forms.html          # Login form with validation
├── spa.html            # React-like dynamic content
└── slow.html           # Artificial 5s delay
```

---

## 4.3 E2E Tests (CLI, real browser)

```typescript
// e2e.test.ts
import { test, expect } from 'bun:test';
import { execSync } from 'child_process';

test('CLI end-to-end', () => {
  // Setup
  execSync('cd test-project && ../setup');

  // Run commands
  const output1 = execSync('skill goto https://example.com').toString();
  expect(output1).toContain('Navigated to https://example.com');

  const output2 = execSync('skill snapshot').toString();
  expect(output2).toContain('@e');  // Has refs

  const output3 = execSync('skill text').toString();
  expect(output3).toContain('Example Domain');
});
```

---

# 5. BUILD & DISTRIBUTION

## 5.1 Setup Script Template

```bash
#!/usr/bin/env bash
set -e

SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
SKILL_NAME="$(basename "$SKILL_DIR")"
BIN="$SKILL_DIR/dist/$SKILL_NAME"

echo "Setting up $SKILL_NAME..."

# 1. Check dependencies
if ! command -v bun &> /dev/null; then
  echo "Error: Bun not installed. Install: curl -fsSL https://bun.sh/install | bash"
  exit 1
fi

# 2. Determine if rebuild needed
NEEDS_BUILD=0

if [ ! -x "$BIN" ]; then
  echo "Binary not found, building..."
  NEEDS_BUILD=1
fi

if [ -n "$(find src -newer "$BIN" 2>/dev/null)" ]; then
  echo "Source changed, rebuilding..."
  NEEDS_BUILD=1
fi

if [ package.json -nt "$BIN" 2>/dev/null ]; then
  echo "Dependencies changed, rebuilding..."
  NEEDS_BUILD=1
fi

# 3. Build if needed
if [ "$NEEDS_BUILD" -eq 1 ]; then
  echo "Installing dependencies..."
  bun install

  echo "Building binary..."
  bun run build

  echo "Recording version..."
  git rev-parse HEAD > dist/.version 2>/dev/null || echo "dev" > dist/.version
fi

# 4. Symlink to Claude skills directory
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

if [ -L "$SKILLS_DIR/$SKILL_NAME" ]; then
  echo "Updating symlink..."
  rm "$SKILLS_DIR/$SKILL_NAME"
fi

ln -s "$SKILL_DIR" "$SKILLS_DIR/$SKILL_NAME"

echo "✓ Setup complete. Run: /$SKILL_NAME <command>"
```

---

## 5.2 package.json Template

```json
{
  "name": "skill-name",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "skill-name": "./dist/skill-name"
  },
  "scripts": {
    "build": "bun build --compile src/cli.ts --outfile dist/skill-name",
    "dev": "bun run src/cli.ts",
    "test": "bun test",
    "test:watch": "bun test --watch"
  },
  "dependencies": {
    "playwright": "^1.58.2"
  },
  "devDependencies": {
    "@types/bun": "latest"
  },
  "engines": {
    "bun": ">=1.0.0"
  }
}
```

---

# 6. QUALITY CHECKLIST (Before Shipping)

## 6.1 Functional

- [ ] All commands work on happy path
- [ ] Error messages clear + actionable
- [ ] Handles edge cases (empty input, missing files, no network)
- [ ] Exit codes correct (0=success, 1=user error, 2=system error)

## 6.2 Performance

- [ ] Cold start < 3s (persistent) or < 500ms (stateless)
- [ ] Warm commands < 200ms (excluding network I/O)
- [ ] Memory stable over 100 commands (no leaks)
- [ ] CircularBuffers sized appropriately (not overkill)

## 6.3 Testing

- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests: Happy path + top 5 edge cases
- [ ] E2E test: 1 critical workflow
- [ ] Tests pass in CI (GitHub Actions)

## 6.4 Documentation

- [ ] SKILL.md complete (8 required sections)
- [ ] README.md with setup instructions
- [ ] Examples for common use cases
- [ ] Error messages self-documenting

## 6.5 Integration

- [ ] Works standalone (no Nash Framework required)
- [ ] Nash-compatible (can wrap in Triad)
- [ ] MoE Router entry added (if applicable)
- [ ] L2 Cache optimized (< 500 tokens if cached)

## 6.6 Cross-Platform

- [ ] macOS tested
- [ ] Linux tested
- [ ] Windows tested (or documented as unsupported)
- [ ] Path separators handled (use `path.join`, not `/`)

---

# 7. PRODUCTION PATTERNS

## 7.1 Async Disk I/O (Non-Blocking)

```typescript
// server.ts - Log flushing
let flushInProgress = false;
let lastFlushed = 0;

async function flushBuffers() {
  if (flushInProgress) return;
  flushInProgress = true;

  try {
    const newCount = consoleBuffer.totalAdded - lastFlushed;
    if (newCount === 0) return;

    const entries = consoleBuffer.last(newCount);
    const lines = entries.map(e => `[${e.timestamp}] ${e.text}`).join('\n');

    const existing = fs.existsSync(LOG_PATH)
      ? await Bun.file(LOG_PATH).text()
      : '';

    await Bun.write(LOG_PATH, existing + lines + '\n');
    lastFlushed = consoleBuffer.totalAdded;
  } finally {
    flushInProgress = false;
  }
}

setInterval(flushBuffers, 1000);  // Every 1s
```

---

## 7.2 Health Check Endpoint

```typescript
// server.ts
fetch: async (req) => {
  const url = new URL(req.url);

  if (url.pathname === '/health') {
    return new Response(JSON.stringify({
      status: 'ok',
      uptime: process.uptime(),
      version: fs.readFileSync('dist/.version', 'utf-8').trim(),
      memory: process.memoryUsage()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // ... other routes
}

// cli.ts - check server alive
async function isServerHealthy(state: State): Promise<boolean> {
  try {
    const resp = await fetch(`http://127.0.0.1:${state.port}/health`, {
      signal: AbortSignal.timeout(1000)
    });
    return resp.ok;
  } catch {
    return false;
  }
}
```

---

## 7.3 Graceful Shutdown

```typescript
// server.ts
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Shutting down gracefully...');

  // Flush buffers
  await flushBuffers();

  // Close browser
  if (browserManager.browser) {
    await browserManager.browser.close();
  }

  // Remove state file
  if (fs.existsSync(STATE_FILE)) {
    fs.unlinkSync(STATE_FILE);
  }

  process.exit(0);
});

process.on('SIGINT', () => process.emit('SIGTERM'));
```

---

# 8. SCALING TO 100+ SKILLS

## 8.1 Naming Convention

```
/browse              # Browser automation
/review              # Code review
/ship                # Release engineer
/qa                  # QA testing
/retro               # Retrospective
/debug               # Interactive debugger
/fix                 # Auto-fix bugs
/deploy              # Multi-env deployment
/monitor             # Production health
/rollback            # Emergency rollback
```

**Pattern:**
- Verb-based (action-oriented)
- Single word (easy to type)
- Domain-specific prefix if overlap (fe-review, be-review)

---

## 8.2 Shared Libraries (DRY)

```
~/.claude/skills/
├── _shared/
│   ├── auth.ts              # GitHub token, API keys
│   ├── git.ts               # Git helpers (status, diff, log)
│   ├── prompt.ts            # AskUserQuestion wrapper
│   └── validation.ts        # Input sanitization
├── browse/
│   └── src/cli.ts           # import { readGitState } from '../_shared/git'
├── review/
└── ship/
```

**Benefits:**
- One fix → all skills benefit
- Consistent error messages
- Easier testing (mock once)

---

## 8.3 install-skills.sh (Mass Install)

```bash
#!/usr/bin/env bash
set -e

SKILLS_REPO="https://github.com/org/nash-skills.git"
SKILLS_DIR="$HOME/.claude/skills"

echo "Installing Nash skills..."

# Clone if not exists
if [ ! -d "$SKILLS_DIR/.git" ]; then
  git clone "$SKILLS_REPO" "$SKILLS_DIR"
fi

cd "$SKILLS_DIR"
git pull

# Install each skill
for skill_dir in */; do
  if [ -f "$skill_dir/setup" ]; then
    echo "Setting up $(basename "$skill_dir")..."
    (cd "$skill_dir" && ./setup)
  fi
done

echo "✓ All skills installed. Run: /browse, /review, /ship, etc."
```

---

# 9. TEMPLATE SKILL (Copy-Paste Start)

```bash
# Create new skill in 2 minutes:
cd ~/.claude/skills
cp -r _template my-new-skill
cd my-new-skill

# Edit these files:
# 1. SKILL.md - Add your workflow
# 2. src/cli.ts - Add command parsing
# 3. src/handlers.ts - Add business logic

./setup
/my-new-skill test  # Test it
```

**Files to create:**
- See next section for full template structure

---

# 10. NASH FRAMEWORK INTEGRATION

## 10.1 MoE Router Entry

```markdown
# system/MIXTURE_OF_EXPERTS_ROUTER.md

## Skill: /my-skill
**Capability:** [One sentence - what it does]
**Triggers when:**
- Audit dimension: X > threshold
- Pipeline: CODING_AND_DEV selected
- User request contains: "do X"

**Output:** [Artifacts produced]

**Example dispatch:**
User: "Review my code for security"
→ MoE selects: CODING_AND_DEV pipeline
→ Agents: Thesis=Lan (run /review), Anti=Mộc (verify)
```

---

## 10.2 L2 Cache Entry Template

```markdown
# agents/dev/skill-specialist.md

**Agent:** Skill Specialist
**Archetype:** Builder
**Token limit:** 500 (L2 Cache)

## PEN (Penalties - DON'T do this)
- P1: Don't use @refs in L2 Cache (ephemeral, invalid after navigation)
  Reason: Ref cleared on page change, agent will fail
- P2: Don't cache full output (bloats cache)
  Reason: Output can be 10K+ tokens

## WIN (Wins - DO this)
- Use locator strategy not refs:
  yaml
  submit_button: getByRole('button', {name: 'Submit'})

- Cache patterns not examples:
  yaml
  sql_injection_check: |
    Grep for: ["#{, "${] in *.rb
    Flag: "Use parameterized queries"
```

---

**END OF MANUFACTURING GUIDE**

👉 **Next:** Create `SKILL_TEMPLATE/` folder with production-ready scaffold
