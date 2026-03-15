# Test Specifications for Nash Agent Framework v3.0

**Purpose:** Comprehensive test coverage for Phase 1 & 2 features based on engineering preference: **"Well-tested code is non-negotiable; I'd rather have too many tests than too few."** (Issue #9)

**Last Updated:** 2026-03-16
**Status:** Draft for Engineering Review
**Framework:** Jest (Node.js)
**Total Test Cases:** ~30 across 7 test files

---

## Test Coverage Strategy

### Test Pyramid Distribution
- **Unit Tests:** 21 cases (70%) — Fast, isolated, no external dependencies
- **Integration Tests:** 8 cases (27%) — Component interaction, controlled environment
- **E2E Tests:** 1 case (3%) — Full system behavior, user-facing validation

### Testing Philosophy (from plan-eng-review)
1. **DRY violations in tests are acceptable** — Clarity > brevity in test code
2. **Edge cases are mandatory** — Empty inputs, nulls, timeouts, race conditions
3. **Explicit > clever** — Test names describe exact scenario
4. **Diagrams for complex test setups** — ASCII art when structure is non-obvious

---

## Unit Tests (21 cases)

### 1. `tests/unit/mode_selector.test.js` (12 cases)

**Purpose:** Validate cognitive mode selection logic (EXPANSION/HOLD/REDUCTION) based on task description and complexity estimation.

**Framework:** Jest
**Dependencies:** None (pure logic)
**Test Data Location:** `tests/fixtures/mode_selector_scenarios.json`

#### Setup/Teardown
```javascript
beforeEach(() => {
  // Reset cognitive mode state
  ModeSelector.reset();
});
```

#### Test Cases

##### 1.1 Keyword Detection — EXPANSION mode
- **Input:** Task description containing "product direction", "user journey", "founder taste"
- **Expected:** Mode = EXPANSION, Token budget = 15K
- **Edge case:** Multiple expansion keywords should still return single mode

##### 1.2 Keyword Detection — HOLD mode
- **Input:** Task description containing "architecture", "contracts", "10x scale"
- **Expected:** Mode = HOLD, Token budget = 20K
- **Edge case:** "Contract" vs "contracts" (case-insensitive)

##### 1.3 Keyword Detection — REDUCTION mode
- **Input:** Task description containing "implementation clear", "ship fast", "code first"
- **Expected:** Mode = REDUCTION, Token budget = 5K
- **Edge case:** "Ship" alone should not trigger REDUCTION (needs context)

##### 1.4 Complexity Estimation — Story points < 3
- **Input:** Task with 1-2 file changes, no new dependencies, <100 LOC
- **Expected:** Complexity = LOW, Mode = REDUCTION
- **Validation:** Story point calculation aligns with mode

##### 1.5 Complexity Estimation — Story points 3-10
- **Input:** Task with 3-5 file changes, 1 new dependency, 100-500 LOC
- **Expected:** Complexity = MEDIUM, Mode = HOLD
- **Validation:** Boundary case at exactly 3 SP

##### 1.6 Complexity Estimation — Story points > 30
- **Input:** Task with >8 file changes, >2 new classes/services, >1000 LOC
- **Expected:** Complexity = CRITICAL, Mode = EXPANSION
- **Validation:** Triggers architecture review requirement

##### 1.7 Decision Tree — Conflicting signals
- **Input:** Task with EXPANSION keywords but LOW complexity
- **Expected:** Mode = EXPANSION (keywords override complexity)
- **Rationale:** User intent (keywords) beats heuristics (complexity)

##### 1.8 Decision Tree — No keywords, medium complexity
- **Input:** Generic task description, 4 file changes
- **Expected:** Mode = HOLD (default for medium complexity)
- **Rationale:** Conservative default when uncertain

##### 1.9 Edge Case — Empty task description
- **Input:** Empty string `""`
- **Expected:** Error thrown with message "Task description required"
- **Validation:** Graceful failure, not silent default

##### 1.10 Edge Case — Null input
- **Input:** `null` or `undefined`
- **Expected:** Error thrown with message "Invalid task input"
- **Validation:** Type safety check

##### 1.11 Edge Case — Unicode/emoji in task description
- **Input:** Task description with emoji "🚀 Ship fast 🔥"
- **Expected:** Mode = REDUCTION (ignores emoji, processes "Ship fast")
- **Validation:** Robust text processing

##### 1.12 Token Budget Override — Manual override
- **Input:** Mode = HOLD, Manual budget = 10K
- **Expected:** Token budget = 10K (override accepted)
- **Validation:** Manual overrides respect user control

---

### 2. `tests/unit/vector_db_wrapper.test.js` (6 cases)

**Purpose:** Test Vector DB query logic with Qdrant fallback to grep, including LRU cache behavior.

**Framework:** Jest with mocks
**Dependencies:**
- `@qdrant/js-client-rest` (mocked)
- `lru-cache` (real)

**Mock Data:** In-memory PEN entries with embeddings

#### Setup/Teardown
```javascript
beforeEach(() => {
  // Mock Qdrant client
  jest.mock('@qdrant/js-client-rest');

  // Seed mock data
  mockQdrant.setData([
    { id: 'PEN-001', text: 'Multi-tenant tables require RLS', embedding: [...] },
    { id: 'PEN-089', text: 'Row-level security PostgreSQL pattern', embedding: [...] }
  ]);

  // Clear LRU cache
  cache.reset();
});

afterEach(() => {
  jest.clearAllMocks();
});
```

#### Test Cases

##### 2.1 Successful Qdrant Query — Single result
- **Input:** Query "How to handle multi-tenant tables?"
- **Mock:** Qdrant returns [PEN-001] with score 0.92
- **Expected:** Returns [PEN-001], cache hit on retry
- **Validation:** Verify Qdrant client called once, cache stores result

##### 2.2 Successful Qdrant Query — Multiple results ranked
- **Input:** Query "row-level security"
- **Mock:** Qdrant returns [PEN-089 (0.95), PEN-001 (0.87), PEN-234 (0.72)]
- **Expected:** Returns top 5 results, sorted by score descending
- **Validation:** Score threshold >0.7 applied

##### 2.3 Qdrant Timeout → Grep Fallback
- **Input:** Query "idempotency rules"
- **Mock:** Qdrant throws TimeoutError after 2s
- **Expected:** Falls back to `grep -r "idempotency" .pen_index.txt`, returns PEN-123
- **Validation:** Fallback logged as warning, not error

##### 2.4 Qdrant Down → Grep Fallback (503)
- **Input:** Query "authentication"
- **Mock:** Qdrant returns 503 Service Unavailable
- **Expected:** Falls back to grep, returns results if found
- **Validation:** Graceful degradation, no crash

##### 2.5 LRU Cache Hit — No external call
- **Input:** Query "multi-tenant tables" (same as 2.1, executed twice)
- **Expected:** First call hits Qdrant, second call returns cached result
- **Validation:** Qdrant client called ONLY once, cache hit metric incremented

##### 2.6 Empty Results — Both Qdrant and Grep
- **Input:** Query "nonexistent-topic-xyz"
- **Mock:** Qdrant returns [], grep returns no matches
- **Expected:** Returns empty array `[]`, logs info message
- **Validation:** Does not throw error, handles gracefully

---

### 3. `tests/unit/sqlite_setup.test.js` (3 cases)

**Purpose:** Validate SQLite database initialization for concurrent agent writes.

**Framework:** Jest
**Dependencies:** `better-sqlite3`
**Test Database:** `:memory:` (in-memory SQLite)

#### Setup/Teardown
```javascript
let db;

beforeEach(() => {
  // Create in-memory SQLite DB
  db = new Database(':memory:');
});

afterEach(() => {
  db.close();
});
```

#### Test Cases

##### 3.1 WAL Mode Enabled — Concurrent write support
- **Setup:** Call `setupDatabase(db)`
- **Validation:**
  - `PRAGMA journal_mode` returns `wal`
  - WAL file created in test directory
- **Rationale:** WAL mode prevents "database is locked" errors with 15+ concurrent agents

##### 3.2 Schema Created — All required tables exist
- **Setup:** Call `setupDatabase(db)`
- **Validation:**
  - `tasks` table exists with columns: `id`, `status`, `agent_id`, `created_at`, `updated_at`
  - `agent_status` table exists with columns: `agent_id`, `phase`, `tokens_used`, `timestamp`
- **Rationale:** Schema mismatch would cause runtime errors in production

##### 3.3 Indexes Exist — Performance optimization
- **Setup:** Call `setupDatabase(db)`
- **Validation:**
  - Index on `tasks.status` exists
  - Index on `agent_status.agent_id` exists
  - Index on `agent_status.timestamp` exists (for time-range queries)
- **Rationale:** Missing indexes = slow queries at >1000 tasks

---

## Integration Tests (8 cases)

### 4. `tests/integration/vector_db_fallback.test.js` (4 cases)

**Purpose:** Test Vector DB fallback behavior under real network conditions (with controlled failures).

**Framework:** Jest with Testcontainers
**Dependencies:**
- Docker (Qdrant container)
- `testcontainers` library

**Container Setup:**
```javascript
let qdrantContainer;

beforeAll(async () => {
  qdrantContainer = await new GenericContainer('qdrant/qdrant:latest')
    .withExposedPorts(6333)
    .start();
});

afterAll(async () => {
  await qdrantContainer.stop();
});
```

#### Test Cases

##### 4.1 Qdrant Down → Grep Works
- **Setup:** Stop Qdrant container mid-test
- **Action:** Query "multi-tenant tables"
- **Expected:** Fallback to grep returns PEN-001 within 500ms
- **Validation:** Response time <1s, fallback logged

##### 4.2 Qdrant Slow (3s timeout) → Timeout → Grep
- **Setup:** Add network delay to Qdrant (tc command)
- **Action:** Query "RLS patterns"
- **Expected:** Timeout after 2s, grep fallback returns results
- **Validation:** Timeout setting respected, no infinite wait

##### 4.3 Qdrant Recovers → Stop Using Grep
- **Setup:**
  1. Stop Qdrant (forces grep fallback)
  2. Restart Qdrant
  3. Query again
- **Expected:** After health check passes, switch back to Qdrant
- **Validation:** Circuit breaker pattern (5 failures → fallback, 1 success → restore)

##### 4.4 Cache Invalidation — Qdrant data updated
- **Setup:**
  1. Query "test-topic" → cache result
  2. Add new PEN entry to Qdrant with "test-topic"
  3. Query "test-topic" again
- **Expected:** Cache invalidated after TTL (5 min), returns new result
- **Validation:** Cache TTL configurable, defaults to 5min

---

### 5. `tests/integration/dashboard_api.test.js` (3 cases)

**Purpose:** Test Dashboard API endpoints for real-time task/agent monitoring.

**Framework:** Jest + Supertest
**Dependencies:**
- Express server (observability/backend/server.js)
- SQLite (test database)

**Setup:**
```javascript
let app, server, db;

beforeAll(() => {
  db = new Database(':memory:');
  setupDatabase(db);
  app = createApp(db); // Express app
  server = app.listen(0); // Random port
});

afterAll(() => {
  server.close();
  db.close();
});
```

#### Test Cases

##### 5.1 GET `/api/tasks/active` — Returns running tasks
- **Setup:** Insert 3 tasks (2 active, 1 completed)
- **Action:** `GET /api/tasks/active`
- **Expected:** Returns array of 2 tasks with `status: "in_progress"`
- **Validation:** JSON schema matches TaskStatus interface

##### 5.2 GET `/api/agents/status` — Returns all agent states
- **Setup:** Insert 5 agent status records (3 active, 2 idle)
- **Action:** `GET /api/agents/status`
- **Expected:** Returns 5 agents with current phase, tokens_used
- **Validation:** Timestamp within last 10 seconds

##### 5.3 Concurrent Requests — No race conditions
- **Setup:** Start 10 concurrent requests to `/api/tasks/active`
- **Action:** All requests execute simultaneously
- **Expected:** All 10 return same data, no "database is locked" errors
- **Validation:** SQLite WAL mode prevents contention

---

### 6. `tests/integration/concurrent_sqlite.test.js` (1 case)

**Purpose:** Stress-test SQLite with 15 concurrent agent writes (real-world scenario).

**Framework:** Jest
**Dependencies:** `better-sqlite3`, `worker_threads`

**Setup:**
```javascript
let db;

beforeAll(() => {
  db = new Database('test_concurrent.db');
  setupDatabase(db);
});

afterAll(() => {
  db.close();
  fs.unlinkSync('test_concurrent.db');
});
```

#### Test Case

##### 6.1 15 Agents Write Simultaneously — No locks
- **Setup:** Spawn 15 worker threads, each simulating an agent
- **Action:** Each agent:
  1. Inserts task into `tasks` table
  2. Updates `agent_status` 10 times (phase changes)
  3. Writes 50 status.log entries
- **Expected:**
  - All 15 tasks inserted
  - 150 agent_status records (15 × 10)
  - No "SQLITE_BUSY" errors
  - All operations complete within 5 seconds
- **Validation:**
  - WAL mode enabled (checked in setup)
  - No write conflicts in logs
  - Data integrity check: `SELECT COUNT(*) FROM tasks` = 15

---

## E2E Tests (1 case)

### 7. `tests/e2e/dashboard_polling.test.js` (1 case)

**Purpose:** Validate end-to-end Dashboard real-time updates from agent task execution.

**Framework:** Playwright (browser automation) + Jest
**Dependencies:**
- Dashboard frontend (React)
- Backend API server
- SQLite database

**Setup:**
```javascript
let browser, page, server, db;

beforeAll(async () => {
  // Start backend server
  db = new Database(':memory:');
  server = startServer(db, 3001);

  // Start frontend (Vite dev server)
  await exec('cd observability/frontend && npm run dev -- --port 3000');

  // Launch browser
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.goto('http://localhost:3000');
});

afterAll(async () => {
  await browser.close();
  server.close();
  db.close();
});
```

#### Test Case

##### 7.1 Dashboard Sees Task Update Within 2s
- **Action:**
  1. Open Dashboard in browser
  2. Backend inserts new task with `status: "in_progress"`
  3. Wait for Dashboard to poll (1s interval)
- **Expected:**
  - Task appears in Dashboard within 2 seconds
  - Task status changes from "in_progress" → "completed" reflected in <2s
- **Validation:**
  - Measure time from DB write to UI update
  - Screenshot comparison (before/after task appears)
  - No JavaScript errors in console

**Failure Modes Tested:**
- Polling stops if API returns 500 (should retry)
- Stale data shown if server lag >5s (should show warning)
- Browser tab hidden = polling pauses (battery optimization)

---

## Test Data & Fixtures

### Fixture Files
```
tests/
├── fixtures/
│   ├── mode_selector_scenarios.json      # 50+ task descriptions
│   ├── pen_entries_sample.json           # 100 PEN entries with embeddings
│   ├── agent_status_states.json          # Valid phase transitions
│   └── task_lifecycle_examples.json      # Pending → In Progress → Completed
```

### Sample Data Structure (`pen_entries_sample.json`)
```json
[
  {
    "id": "PEN-001",
    "specific_reason": "Multi-tenant tables without RLS leaked data between orgs",
    "prevention_rule": "Always add RLS policies: CREATE POLICY ... ON {table} USING (org_id = current_setting('app.current_org_id'))",
    "status": "ACTIVE",
    "archetype": "Builder",
    "embedding": [0.023, -0.456, 0.789, ...]
  }
]
```

---

## Test Execution Strategy

### CI/CD Integration
```bash
# gates/validate.sh (updated)

# 1. Unit tests (fast, no external deps)
npm test -- tests/unit/ --maxWorkers=4

# 2. Integration tests (Docker required)
npm test -- tests/integration/ --runInBand

# 3. E2E tests (only on pre-merge)
if [ "$CI_EVENT" = "pull_request" ]; then
  npm test -- tests/e2e/ --runInBand
fi
```

### Local Development
```bash
# Watch mode (unit tests only)
npm test -- --watch tests/unit/

# Run specific test file
npm test tests/unit/mode_selector.test.js

# Run with coverage
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":85,"lines":85,"statements":85}}'
```

### Performance Benchmarks
- **Unit tests:** <5s total (12 + 6 + 3 = 21 tests)
- **Integration tests:** <30s total (4 + 3 + 1 = 8 tests, includes Docker startup)
- **E2E tests:** <15s (1 test, browser automation)

**Total test suite runtime: <50 seconds**

---

## Coverage Targets

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|---------------|-----------------|-------------------|
| `system/mode_selector.js` | 95% | 90% | 100% |
| `system/vector_db_wrapper.js` | 90% | 85% | 95% |
| `observability/backend/server.js` | 85% | 80% | 90% |
| `scripts/sqlite_setup.js` | 100% | 100% | 100% |

**Rationale for thresholds:**
- 100% coverage on critical path (SQLite setup = data integrity)
- 85%+ on business logic (mode selection, Vector DB)
- Edge cases must have explicit tests (not just covered by accident)

---

## Failure Mode Testing

### Chaos Engineering Scenarios (Optional Phase 3)
1. **Qdrant kills mid-query** — Verify graceful fallback
2. **SQLite disk full** — Verify error handling, not corruption
3. **Network partition** — Verify timeout settings respected
4. **Memory spike** — Verify LRU cache eviction works
5. **15 agents + 1 DB vacuum** — Verify no deadlock

---

## Test Maintenance Rules

### When to Update Tests
1. **Code change touches logic** → Update unit tests in same commit
2. **API contract changes** → Update integration tests + API docs
3. **New edge case discovered** → Add test case, reference bug ticket
4. **Performance regression** → Add benchmark test with threshold

### Test Review Checklist (from plan-eng-review preferences)
- [ ] Test name describes exact scenario (not generic "it works")
- [ ] Edge cases explicitly tested (empty, null, timeout, race)
- [ ] Assertions test ONE thing (not 5 assertions in one test)
- [ ] Setup/teardown properly isolates tests (no shared state)
- [ ] Flaky tests disabled + marked with `test.skip` + ticket created

---

## References

### Engineering Preferences (Source: `plan-eng-review` skill, Line 24)
> **"Well-tested code is non-negotiable; I'd rather have too many tests than too few."**

### Related Documentation
- `gates/validate.sh` — Runs test suite in CI
- `gates/integrity.sh` — Detects mocks in production code
- `SYNTHESIS_ROADMAP.md` Phase 2.1 — Lightweight Observability
- `plan.md` Phase 1.3 — Cognitive Mode Integration

---

**Status:** Ready for Engineering Review
**Next Steps:**
1. Review test specifications with Dung PM (Task prioritization)
2. Approve test case distribution (21 unit, 8 integration, 1 e2e)
3. Implement tests in priority order (unit → integration → e2e)
4. Integrate with `gates/validate.sh`

---

*"Stale diagrams are worse than no diagrams — they actively mislead." — plan-eng-review, Line 33*
*"Flag any work that could be deferred without blocking the core objective." — plan-eng-review, Line 41*
