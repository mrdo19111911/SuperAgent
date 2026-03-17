# HƯỚNG DẪN CHẾ TẠO VŨ KHÍ - PART 1
## Nash Skills Manufacturing Guide (Complete Edition)

**Tổng hợp từ:** Phúc SA (Infrastructure), Châu UX (Patterns), Mộc (Anti-patterns), Conan (Requirements)
**Ngày:** 2026-03-15
**Mục đích:** Quy trình công nghệ chế tạo skills đạt chuẩn gstack

---

## MỤC LỤC TỔNG

- **PART 1 (file này):** Tổng quan + Infrastructure
- **PART 2:** UX Patterns + Anti-patterns
- **PART 3:** Requirements Gaps + Blueprint + Nash Adaptation
- **INDEX:** Tra cứu nhanh

---

# PHẦN 1: TỔNG QUAN

## 1.1 Bối Cảnh: gstack là gì?

gstack = **8 cognitive modes** (vai trò chuyên biệt) cho SDLC:

| Skill | Vai trò | Trigger khi nào |
|-------|---------|-----------------|
| `/plan-ceo-review` | Founder mindset (10x thinking) | SPEC empty, new domain |
| `/plan-eng-review` | Engineering rigor | Missing schema/contracts |
| `/review` | Paranoid reviewer | Pre-merge code review |
| `/ship` | Release engineer | Deploy branch to PR |
| `/browse` | QA engineer (headless browser) | Visual verification |
| `/qa` | QA lead (systematic testing) | Test web app |
| `/retro` | Engineering manager | Weekly metrics |
| `/setup-browser-cookies` | Session manager | Import auth cookies |

**Kiến trúc core:** Persistent server + ref-based interaction + CircularBuffer logs

---

## 1.2 Kết Luận Từ 4 Agents

### Phúc SA (Infrastructure - Thesis)
- ✅ **Strengths:** Persistent server (~100ms per command), ref-based UI (@e1, @e2), binary compilation
- ❌ **Gaps:** 58MB binary (7x larger than needed), no state locking (race condition), random port (collision risk at scale)
- **Verdict:** 4.9/10 — "Documentation, not adversarial analysis"

### Châu UX (Patterns - Thesis)
- ✅ **Strengths:** HCI research (Miller, Hick cited), user journey walkthroughs, mode selection patterns
- ❌ **Gaps:** Didn't challenge "one question per issue" (UX nightmare at >10 issues), ASCII diagram token waste (500 tokens vs 100 JSON)
- **Verdict:** 6.1/10 — "Documented patterns, didn't critique them"

### Mộc (Anti-patterns - Anti-Thesis)
- ✅ **Strengths:** Found 23 issues (4 P0, 9 P1, 6 P2, 4 P3), challenged both Phúc + Châu assumptions
- ❌ **Critique:** Phúc missed 65% of issues, Châu missed 35%
- **Key Findings:** State race condition, port collision math (10% at 100 servers), 58MB binary alternatives, ASCII diagram = 5x token waste

### Conan (Requirements - Anti-Thesis)
- ✅ **Strengths:** 27 missing skills identified, 64 edge cases, 15 integration gaps
- ❌ **Gaps:** 22% use case coverage (8 of 36 needs), no `/debug`, `/fix`, `/rollback`, `/monitor`
- **Prioritization:** P0 (7 items), P1 (9 items), P2 (9 items + 64 edge cases)

---

## 1.3 Điểm Chính (Key Takeaways)

**ADOPT từ gstack:**
1. Persistent server pattern (cli + server + state file)
2. Ref-based interaction (@e1 via ARIA snapshot)
3. CircularBuffer for logs (O(1) insert, fixed memory)
4. Greptile integration (automated PR review)

**REJECT từ gstack:**
1. 58MB binary → dùng npm package (8MB source)
2. Random port → dùng unix socket (zero collision)
3. "One question per issue" → dùng tiered batching (auto-fix P0, batch P1/P2)
4. ASCII diagram mandate → dùng YAML/JSON (linear flows)
5. Manual Greptile FP tagging → dùng embeddings-based auto-skip

**NASH-SPECIFIC:**
1. Multi-agent browse server (1 server, N tabs: Thesis=tab1, Anti-Thesis=tab2)
2. L2 Cache ref invalidation (encode URL + DOM hash in ref)
3. Zero-sum scoring for `/review` (eval suite with known bugs)
4. External validation for `/ship` (Anti-Thesis re-runs tests independently)

---

# PHẦN 2: INFRASTRUCTURE (Phúc SA Deep Dive)

## 2.1 BUILD TOOLCHAIN

### Package Structure (gstack-main/package.json)

```json
{
  "name": "gstack",
  "version": "0.3.2",
  "type": "module",
  "bin": { "browse": "./browse/dist/browse" },
  "scripts": {
    "build": "bun build --compile browse/src/cli.ts --outfile browse/dist/browse && git rev-parse HEAD > browse/dist/.version",
    "dev": "bun run browse/src/cli.ts",
    "test": "bun test"
  },
  "dependencies": {
    "playwright": "^1.58.2",
    "diff": "^7.0.0"
  },
  "engines": { "bun": ">=1.0.0" }
}
```

**Key Insights (Phúc):**
- Minimal deps (Playwright + diff only)
- Binary compilation (standalone, no runtime needed)
- Version tracking (git SHA in `.version`)

**Mộc's Attack:**
- ❌ `>=1.0.0` = floating versions → hermetic build IMPOSSIBLE
- ❌ 58MB binary = 7x larger than needed
- ✅ Fix: Pin Bun version (`"bun": "1.0.25"`), use npm package (8MB source)

---

### Setup Script Flow (gstack-main/setup)

**Smart Rebuild Logic:**
```bash
NEEDS_BUILD=0
if [ ! -x "$BROWSE_BIN" ]; then NEEDS_BUILD=1; fi
if [ -n "$(find browse/src -newer $BROWSE_BIN)" ]; then NEEDS_BUILD=1; fi
if [ package.json -nt "$BROWSE_BIN" ]; then NEEDS_BUILD=1; fi

if [ "$NEEDS_BUILD" -eq 1 ]; then
  bun install && bun run build
fi
```

**Optimization (Phúc):**
- Only rebuilds when source/deps change
- Incremental setup (skip if up-to-date)

**Mộc's Attack:**
- ❌ No Windows support (paths use POSIX)
- ❌ Cookie decryption macOS-only
- ✅ Fix: Detect OS (`if [[ "$OSTYPE" == "win32" ]]`), implement DPAPI (Windows)

---

## 2.2 BROWSE ARCHITECTURE (5-Layer Stack)

```
┌─────────────────────────────────────────┐
│ Layer 1: CLI (cli.ts)                   │
│ - Parse args, read/start server         │
│ - HTTP POST to localhost:PORT           │
└─────────────────────────────────────────┘
          ↓ HTTP
┌─────────────────────────────────────────┐
│ Layer 2: HTTP Server (server.ts)        │
│ - Bun.serve on random port 10K-60K      │
│ - Auth: Bearer token (UUID)             │
│ - Routes: /command, /health             │
└─────────────────────────────────────────┘
          ↓ Command dispatch
┌─────────────────────────────────────────┐
│ Layer 3: Handlers (read/write/meta)     │
│ - READ: text, html, links, snapshot     │
│ - WRITE: goto, click, fill              │
│ - META: tabs, screenshot, chain         │
└─────────────────────────────────────────┘
          ↓ Browser API
┌─────────────────────────────────────────┐
│ Layer 4: BrowserManager                 │
│ - Tab management (Map<id, Page>)        │
│ - Ref map (@e1 → Playwright Locator)    │
│ - Dialog auto-accept/dismiss            │
└─────────────────────────────────────────┘
          ↓ CDP
┌─────────────────────────────────────────┐
│ Layer 5: Chromium (100MB headless)      │
└─────────────────────────────────────────┘
```

**Performance (Phúc):**
- Cold start: ~2-3s (Chromium launch)
- Warm path: ~100ms per command
- Why fast? Persistent server + Chromium, Locators (lazy), ARIA tree (native C++)

**Mộc's Attack:**
- ❌ P99 latency NEVER measured (complex pages = 2-5s, not 100ms)
- ❌ Memory leak: CircularBuffer 50K entries = overkill (10x larger than needed)
- ✅ Fix: Reduce buffer (50K → 5K), add TTL-based eviction

---

## 2.3 STATE MANAGEMENT

### 2.3.1 Ref Lifecycle (@e1, @e2)

**Snapshot → Ref Creation (snapshot.ts):**
```typescript
const ariaText = await page.locator('body').ariaSnapshot(); // YAML tree
const refMap = new Map<string, Locator>();

// Count role+name pairs for disambiguation
for (const node of nodes) {
  const key = `${node.role}:${node.name}`;
  roleNameCounts.set(key, (count.get(key) || 0) + 1);
}

// Assign refs + build Locators
for (const node of nodes) {
  const ref = `e${refCounter++}`; // @e1, @e2, @e3...

  let locator = page.getByRole(node.role, { name: node.name });

  // Disambiguate if multiple matches
  if (roleNameCounts.get(key) > 1) {
    locator = locator.nth(seenIndex); // nth(0), nth(1)...
  }

  refMap.set(ref, locator);
}
```

**Ref Invalidation (browser-manager.ts):**
```typescript
page.on('framenavigated', (frame) => {
  if (frame === page.mainFrame()) {
    this.clearRefs(); // Refs cleared on navigation
  }
});
```

**Mộc's Attack:**
- ❌ **INCOMPLETE INVALIDATION:** SPA re-renders, AJAX content, infinite scroll = refs STALE
- ❌ Exploit: Upload file → DOM shifts → @e1 points to WRONG element
- ✅ Fix Options:
  - DOM hash validation (compare current DOM vs snapshot DOM)
  - TTL-based expiration (refs expire after 60s)
  - Element validation (check aria-label matches before action)

---

### 2.3.2 State File Persistence (.gstack/browse.json)

**Structure (server.ts):**
```typescript
const state = {
  pid: process.pid,
  port: 12345,        // Random 10K-60K
  token: 'uuid-v4',   // Auth token
  startedAt: '2026-03-15T10:30:00Z',
  binaryVersion: 'abc123de' // Git SHA
};
// Atomic write
fs.writeFileSync(tmpFile, JSON.stringify(state));
fs.renameSync(tmpFile, stateFile);
```

**Mộc's Attack:**
- ❌ **P0 CRITICAL:** NO LOCKING → parallel CLIs = state corruption
- ❌ Exploit scenario:
  ```bash
  # Terminal 1: browse goto example.com &
  # Terminal 2: browse click @e1 &
  # T0: CLI1 reads state (PID=1234, port=12000)
  # T1: CLI2 reads state (PID=1234, port=12000) [SAME]
  # T2: Server crashes
  # T3: CLI1 starts NEW server (PID=1235, port=12001)
  # T4: CLI1 writes state
  # T5: CLI2 starts ANOTHER server (PID=1236) [DUPLICATE]
  # T6: CLI2 overwrites state [CLI1 LOST]
  ```
- ✅ Fix: Advisory lock via flock
  ```typescript
  const lockFd = fs.openSync(stateFile + '.lock', 'w');
  fs.flockSync(lockFd, 'ex'); // Exclusive lock
  // Critical section: read → decide → start → write
  fs.flockSync(lockFd, 'un'); // Release
  ```

---

### 2.3.3 Port Selection (Random 10K-60K)

**Current (server.ts):**
```typescript
const MIN_PORT = 10000, MAX_PORT = 60000;
for (let attempt = 0; attempt < 5; attempt++) {
  const port = MIN + Math.floor(Math.random() * (MAX - MIN));
  try {
    const server = Bun.serve({ port, fetch: ... });
    server.stop();
    return port;
  } catch { continue; }
}
```

**Mộc's Attack:**
- ❌ **COLLISION PROBABILITY NEVER CALCULATED**
- ❌ Math: 50K ports, N servers → collision risk = `1 - e^(-N²/2M)`
  - N=10: 0.1% risk
  - N=50: 2.5% risk
  - N=100: **10% risk** → "browse randomly fails 10% of the time"
- ✅ Fix Options:
  - **Unix socket** (zero collision, 10% faster): `Bun.serve({ unix: socketPath })`
  - **Kernel-assigned port**: `Bun.serve({ port: 0 })` → OS picks ephemeral port
  - **Port lock file**: flock on `/tmp/browse-port-{port}.lock`

---

## 2.4 CIRCULAR BUFFER (Logs)

**Implementation (buffers.ts):**
```typescript
class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0, _size = 0;
  readonly capacity: number;

  push(entry: T): void {
    const index = (this.head + this._size) % this.capacity;
    this.buffer[index] = entry;
    if (this._size < this.capacity) {
      this._size++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }
}

const HIGH_WATER_MARK = 50_000;
const consoleBuffer = new CircularBuffer<LogEntry>(HIGH_WATER_MARK);
```

**Memory (Phúc):**
- 50K entries × 100 bytes = 5MB per buffer
- Total: 15MB (console + network + dialog)

**Mộc's Attack:**
- ❌ **OVERKILL:** 50K entries = 83 min console logs at 10 logs/sec
- ❌ **MEMORY LEAK:** Buffer NEVER shrinks (even if server idle for days)
- ✅ Fix:
  - Reduce size: 50K → 5K (500KB RAM, 8 min buffer)
  - Add TTL eviction:
    ```typescript
    clearOlderThan(maxAge: number): void {
      while (this._size > 0) {
        const oldest = this.buffer[this.head];
        if (oldest.timestamp >= Date.now() - maxAge) break;
        this.buffer[this.head] = undefined; // Free memory
        this.head = (this.head + 1) % this.capacity;
        this._size--;
      }
    }
    ```

---

## 2.5 ASYNC DISK FLUSH (Non-Blocking)

**Strategy (server.ts):**
```typescript
let flushInProgress = false;

async function flushBuffers() {
  if (flushInProgress) return;
  flushInProgress = true;

  try {
    const newCount = consoleBuffer.totalAdded - lastFlushed;
    if (newCount > 0) {
      const entries = consoleBuffer.last(newCount);
      const lines = entries.map(e => `[${e.timestamp}] ${e.text}`).join('\n');
      await Bun.write(LOG_PATH, existingContent + lines);
      lastFlushed = consoleBuffer.totalAdded;
    }
  } finally {
    flushInProgress = false;
  }
}

setInterval(flushBuffers, 1000); // Every 1s
```

**Why Critical (Phúc):**
- Commands don't block on disk I/O
- Logs persist even if server crashes (1s window)

---

## 2.6 COOKIE DECRYPTION (macOS Keychain)

**Pipeline (cookie-import-browser.ts):**

1. **Keychain Access:**
```typescript
async function getKeychainPassword(service: string): Promise<string> {
  const proc = Bun.spawn(['security', 'find-generic-password', '-s', service, '-w']);
  const timeout = setTimeout(() => proc.kill(), 10_000); // 10s
  const exitCode = await proc.exited;
  return stdout.trim(); // Base64 password
}
```

2. **Key Derivation:**
```typescript
const password = await getKeychainPassword('Chrome Safe Storage');
const key = crypto.pbkdf2Sync(password, 'saltysalt', 1003, 16, 'sha1');
```

3. **Decryption:**
```typescript
function decrypt(encryptedValue: Buffer, key: Buffer): string {
  const prefix = encryptedValue.slice(0, 3).toString(); // "v10"
  const ciphertext = encryptedValue.slice(3);
  const iv = Buffer.alloc(16, 0x20); // 16 space chars
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.slice(32).toString('utf-8'); // Skip HMAC tag
}
```

**Mộc's Attack:**
- ❌ **macOS-ONLY:** Windows/Linux users = 73% of developers BLOCKED
- ✅ Fix:
  - **Windows DPAPI:**
    ```typescript
    function decryptWindows(encrypted: Buffer): string {
      const ps = `[System.Security.Cryptography.ProtectedData]::Unprotect(...)`;
      return execSync(`powershell -Command "${ps}"`).toString();
    }
    ```
  - **Linux kwallet:** Use `secret-tool` or `gnome-keyring`

---

## 2.7 TESTING INFRASTRUCTURE

**Test Organization (browse/test/):**
```
test/
├── test-server.ts          # Fixture server (HTML, echo)
├── fixtures/
│   ├── basic.html
│   ├── forms.html
├── commands.test.ts        # Integration tests
├── snapshot.test.ts
├── cookie-import-browser.test.ts
```

**Fixture Strategy (Phúc):**
```html
<!-- test/fixtures/basic.html -->
<button id="btn1">Click Me</button>
<input id="input1" type="text">
```

**Why Fixture-Based:**
- No network deps (fast + reliable)
- Reproducible state
- Controlled edge cases

**Mộc's Attack:**
- ❌ **ZERO COVERAGE %** mentioned (what % of code is tested?)
- ❌ No P99 latency tests, no memory profiling
- ✅ Fix: Add coverage tracking, performance benchmarks

---

## 2.8 REPLICATION GUIDE (Minimal Skeleton)

**cli.ts (Nash Skill):**
```typescript
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_DIR = path.join(process.cwd(), '.nash');
const STATE_FILE = path.join(CONFIG_DIR, 'skill.json');

async function ensureServer() {
  const state = readState();
  if (state && isProcessAlive(state.pid)) {
    const resp = await fetch(`http://127.0.0.1:${state.port}/health`);
    if (resp.ok) return state;
  }
  return startServer();
}

async function startServer() {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  const proc = Bun.spawn(['bun', 'run', 'src/server.ts'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { STATE_FILE }
  });
  proc.unref();

  while (true) {
    const state = readState();
    if (state && isProcessAlive(state.pid)) return state;
    await Bun.sleep(100);
  }
}

// Main
const [command, ...args] = process.argv.slice(2);
const state = await ensureServer();
await sendCommand(state, command, args);
```

**server.ts:**
```typescript
const TOKEN = crypto.randomUUID();
const port = findPort(); // Random or unix socket

const server = Bun.serve({
  port,
  fetch: async (req) => {
    if (req.headers.get('authorization') !== `Bearer ${TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }
    const { command, args } = await req.json();
    const result = await handleCommand(command, args);
    return new Response(result);
  }
});

fs.writeFileSync(STATE_FILE, JSON.stringify({ pid: process.pid, port, token: TOKEN }));
```

**setup script:**
```bash
#!/usr/bin/env bash
set -e
SKILL_DIR="$(cd "$(dirname "$0")" && pwd)"
BIN="$SKILL_DIR/dist/skill"

if [ ! -x "$BIN" ] || [ "$SKILL_DIR/src" -nt "$BIN" ]; then
  bun install && bun build --compile src/cli.ts --outfile dist/skill
  git rev-parse HEAD > dist/.version
fi
```

---

## 2.9 KEY TAKEAWAYS (Infrastructure)

**ADOPT:**
1. ✅ Persistent server (cli + server + state file) — FAST (~100ms warm)
2. ✅ Ref-based UI (@e1 via ARIA) — token-efficient, stable
3. ✅ CircularBuffer (fixed memory, O(1) insert)
4. ✅ Binary compilation (`bun build --compile`)

**FIX:**
1. ❌ State file race → add flock lock
2. ❌ Random port collision → use unix socket
3. ❌ 50K buffer overkill → reduce to 5K + TTL eviction
4. ❌ Ref invalidation incomplete → add DOM hash / TTL / validation
5. ❌ macOS-only cookies → implement Windows DPAPI, Linux kwallet
6. ❌ 58MB binary → use npm package (8MB source)

---

**END OF PART 1**

👉 **Tiếp theo:** PART 2 — UX Patterns + Anti-patterns
