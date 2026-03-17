# Nash Framework Integration Test

**Purpose:** End-to-end test của Nash Triad pipeline với real agents

**Test Level:** Integration (pipeline flow + agent interaction)

---

## Test 1: Simple Pipeline (Trivial Task)

**Objective:** Verify Trivial pipeline completes without errors

**Setup:**
```bash
# Create test workspace
mkdir -p artifacts/test-simple-001
```

**Test Case:**
```bash
# Dispatch trivial task
claude --agent agents/core/dung-manager.md \
  "Add a console.log('Hello World') to main.js"
```

**Expected Flow:**
1. **Audit** (Tung Diag) → Scores all dimensions
2. **Router** → Selects Pipeline: Trivial (<3 SP)
3. **Execute:**
   - S1:A+C - Thuc writes code + self-verify
   - S2:Main - PASS/FAIL decision
4. **LEDGER** created at `artifacts/test-simple-001/LEDGER.md`

**Success Criteria:**
- ✅ Task completes in <2 minutes
- ✅ LEDGER.md exists with scoring entries
- ✅ main.js contains console.log
- ✅ No P0/P1 penalties in LEDGER

---

## Test 2: Complex Pipeline (Multi-Step Task)

**Objective:** Verify Complex pipeline with Nash Triad validation

**Setup:**
```bash
mkdir -p artifacts/test-complex-001
```

**Test Case:**
```bash
claude --agent agents/core/dung-manager.md \
  "Implement user authentication with JWT tokens, password hashing, and login/logout endpoints"
```

**Expected Flow:**
1. **Audit** → Complexity: MEDIUM-HIGH (10-30 SP)
2. **Router** → Pipeline: Complex (A,B,B2,C,D,E)
3. **Tier 1 - Criteria:**
   - S1:A - Phuc SA defines acceptance criteria
   - S2:B - Conan audits completeness
   - S3:B2 - Moc audits correctness
   - S4:Main - PASS/FAIL
4. **Tier 2 - Execute:**
   - S5:C - Thuc implements + self-verify
   - S6:D - Moc verifies functional
   - S7:E - Lan verifies non-functional (security)
   - S8:Main - PASS/FAIL

**Success Criteria:**
- ✅ All 8 steps complete
- ✅ CONTRACT_DRAFT.md created (from Phuc SA)
- ✅ Implementation has JWT + bcrypt
- ✅ Tests pass (Son QA)
- ✅ Security audit passes (Lan)
- ✅ LEDGER shows Nash Triad scoring

**Expected Time:** 15-30 minutes

---

## Test 3: Nash Equilibrium (Adversarial Review)

**Objective:** Verify Anti-Thesis actually catches bugs (not lazy review)

**Setup:**
```bash
mkdir -p artifacts/test-nash-001
```

**Test Case:**
```bash
# Intentionally create buggy code first
echo "function divide(a, b) { return a / b; }" > buggy.js

# Then dispatch task
claude --agent agents/core/moc.md \
  "Review buggy.js for edge cases and production safety"
```

**Expected Behavior:**
1. **Moc** (Anti-Thesis) should find:
   - ❌ Division by zero not handled
   - ❌ Type checking missing (what if a, b are strings?)
   - ❌ No error handling

2. **LEDGER scoring:**
   - Moc gets +15 points (3 P2 bugs found)
   - Original author gets -15 points

**Success Criteria:**
- ✅ Moc finds ≥2 bugs
- ✅ Evidence provided (line numbers, test cases)
- ✅ No M3 (Fabrication) penalty
- ✅ LEDGER shows zero-sum scoring

**Failure Case (should NOT happen):**
- ❌ Moc says "LGTM" without finding bugs → M1 penalty (-30 pts)

---

## Test 4: Multi-Task DAG (Dependencies)

**Objective:** Verify topological sort and parallel execution

**Setup:**
```bash
mkdir -p artifacts/test-dag-001
```

**Test Case:**
```bash
claude --agent agents/core/dung-manager.md \
  "Create 3 tasks:
   1. Design database schema
   2. Implement API endpoints (depends on schema)
   3. Write integration tests (depends on API)"
```

**Expected Flow:**
1. **DAG Construction:**
   ```
   Layer 0: Task 1 (no deps)
   Layer 1: Task 2 (depends on Task 1)
   Layer 2: Task 3 (depends on Task 2)
   ```

2. **Execution:**
   - Task 1 runs first → produces schema.prisma
   - Task 2 reads schema → implements endpoints
   - Task 3 reads endpoints → writes tests

3. **plan.md updates** at each tier boundary

**Success Criteria:**
- ✅ Tasks execute sequentially (not parallel - due to deps)
- ✅ Each task receives output artifacts from previous
- ✅ No "file not found" errors
- ✅ LEDGER has 3 separate task sections

---

## Test 5: Gate Scripts (Quality Validation)

**Objective:** Verify gate scripts catch issues before commit

**Setup:**
```bash
mkdir -p test-module
cd test-module
npm init -y
```

**Test Case 1 - validate.sh:**
```bash
# Create code with TODO
echo "// TODO: fix this later\nfunction test() {}" > test.js

# Run gate
bash ../gates/validate.sh .
```

**Expected:**
- ❌ Exit code: 1
- ❌ Error: "TODO/FIXME found at test.js:1"

**Test Case 2 - integrity.sh:**
```bash
# Create test with mock
echo "test('foo', () => { mockService.bar(); })" > test.spec.js

# Run gate
bash ../gates/integrity.sh .
```

**Expected:**
- ❌ Exit code: 1
- ❌ Error: "Mock detected in integration test"

**Test Case 3 - security.sh:**
```bash
# Create file with hardcoded secret
echo "const API_KEY = 'sk-1234567890abcdef';" > config.js

# Run gate
bash ../gates/security.sh .
```

**Expected:**
- ❌ Exit code: 1
- ❌ Error: "Potential secret found: API_KEY"

**Success Criteria:**
- ✅ All gates catch their target issues
- ✅ False positive rate <5%
- ✅ Execution time <10s per gate

---

## Test 6: Memory System (L2 Cache → RAM → HDD)

**Objective:** Verify 3-tier memory loads correctly

**Test Case:**
```bash
# Check L2 Cache loads
claude --agent agents/core/phuc-sa.md --show-context

# Should show:
# - PEN/WIN entries (<500 tokens)
# - Core skills
# - Tools
# - NOT full RAM files
```

**Success Criteria:**
- ✅ L2 Cache: All agent.md files <500 tokens
- ✅ RAM: tmp/ram/{agent}/ loaded on-demand only
- ✅ HDD: Source code never preloaded
- ✅ Total context per task <30K tokens

---

## Test 7: Scoring System (Zero-Sum Game)

**Objective:** Verify LEDGER scoring is accurate and immutable

**Test Case:**
```bash
# Run task that should trigger P0 bug
claude --agent agents/core/dung-manager.md \
  "Deploy to production without running tests"
```

**Expected LEDGER:**
```markdown
### S5:C Execute
**Agent:** Dung PM
**Action:** Attempted production deploy without tests
**Result:** FAIL

**Penalty:** -30 (P0 - Production bug potential)
**Reason:** Violated Prime Directive: "Never deploy without passing gates"
```

**Success Criteria:**
- ✅ LEDGER.md is immutable (git-tracked)
- ✅ Scoring is evidence-based (commit hash, gate log)
- ✅ Zero-sum: Penalties match rewards across agents
- ✅ No self-scoring allowed

---

## Test 8: Token Conservation (Rule 0)

**Objective:** Verify agents use progressive loading

**Test Case:**
```bash
# Simple task (should use REDUCTION mode)
claude --agent agents/core/dung-manager.md \
  "Fix typo in README.md line 42: 'teh' → 'the'"
```

**Expected Behavior:**
1. **Mode:** REDUCTION (detected from "fix typo")
2. **Token budget:** 5K (not 20K)
3. **Context loaded:**
   - ✅ README.md (target file)
   - ❌ Full codebase (unnecessary)

**Measurement:**
```bash
# Check actual tokens used
grep "total_tokens" artifacts/test-typo-001/LEDGER.md
```

**Success Criteria:**
- ✅ Token usage <7K (within REDUCTION budget)
- ✅ No unnecessary file reads
- ✅ Task completes in <30 seconds

---

## Running All Tests

```bash
# Sequential run
bash tests/run-integration-tests.sh

# Parallel run (if no deps)
bash tests/run-integration-tests.sh --parallel

# Specific test
bash tests/run-integration-tests.sh test-nash-pipeline::Test1
```

**Expected Output:**
```
========================================
Nash Framework Integration Tests
========================================

✅ Test 1: Simple Pipeline (2.3s)
✅ Test 2: Complex Pipeline (18.7s)
✅ Test 3: Nash Equilibrium (5.1s)
✅ Test 4: Multi-Task DAG (12.4s)
✅ Test 5: Gate Scripts (3.2s)
✅ Test 6: Memory System (1.8s)
✅ Test 7: Scoring System (4.6s)
✅ Test 8: Token Conservation (1.2s)

========================================
PASS: 8/8 tests (49.3s total)
========================================
```

---

## Coverage Metrics

**Target Coverage:**
- Unit Tests: 70% (fast, isolated logic)
- Integration Tests: 25% (pipeline flows)
- E2E Tests: 5% (full system with real Claude API)

**Critical Paths (Must Cover):**
1. ✅ Audit → Router → Pipeline selection
2. ✅ Nash Triad (Thesis → Anti-Thesis → Synthesis)
3. ✅ LEDGER scoring (zero-sum game)
4. ✅ Gate validation (5 scripts)
5. ✅ Memory hierarchy (L2 → RAM → HDD)
6. ✅ Token conservation (3 modes)
7. ✅ Multi-task DAG (dependencies)
8. ✅ Contract enforcement (API + Events + Errors)

---

## Known Limitations

1. **Real Claude API required** - Tests need actual Claude Code CLI
2. **Token costs** - Full E2E tests consume real tokens
3. **Time** - Complex pipeline test takes 15-30 minutes
4. **Non-deterministic** - LLM outputs vary slightly (use fuzzy assertions)

**Mitigation:**
- Use CI/CD quotas for tests
- Cache common responses
- Run expensive tests nightly only
- Use mock mode for unit tests

---

## Next Steps

1. Implement `tests/run-integration-tests.sh` runner
2. Add CI/CD integration (GitHub Actions)
3. Create test fixtures in `tests/fixtures/`
4. Add performance benchmarks
5. Set up test reporting dashboard
