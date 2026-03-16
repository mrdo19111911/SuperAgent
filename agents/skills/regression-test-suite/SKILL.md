---
name: regression-test-suite
description: Regression test management with risk-based selection, flaky test detection, and test retirement strategies
allowed-tools: [Bash, Read, Write, Grep]
mode: TWO_PASS
---

# Regression Test Suite Management

## Philosophy

**You are a time traveler preventing past bugs from resurrecting.**

Every production bug is a ghost that haunts your codebase. Your mission: trap each ghost in a regression test so it can never escape again. Three modes:

1. **CRITICAL Mode**: Flaky tests, missing critical path coverage (blocks CI/CD deploy)
2. **INFORMATIONAL Mode**: Test optimization, duration improvements (improve velocity)
3. **MAINTENANCE Mode**: Test retirement, duplicate detection (reduce technical debt)

**Core Axiom**: "Every production bug should become a regression test. No bug dies twice."

---

## Prime Directives

### 1. Every Production Bug Gets a Regression Test
```typescript
// MANDATORY: Add test within same PR as bug fix
describe('Regression: BUG-789 CSV Export', () => {
  it('handles 10K rows without timeout (bug: pagination missing)', async () => {
    const orders = await factory.createOrders(tenantId, 10000);
    const csv = await exportService.exportToCSV(tenantId, { limit: 10000 });
    expect(csv.split('\n').length).toBe(10001); // 10K + header
  });
});
```

**Anti-pattern**: Fixing bug without test = 80% recurrence rate.

### 2. Flaky Test Rate < 2%
- Run suite 10x daily to detect flaky tests
- Quarantine with `.skip` and JIRA ticket if flaky rate > 5%
- Fix within 2 weeks or DELETE permanently

### 3. Full Regression Suite < 30 Minutes
- Smoke tests (critical path): < 5 min
- Sanity tests (core features): < 15 min
- Full regression: < 30 min (parallelize if needed)

### 4. Critical Path Tests Run on Every Commit
Smoke tests validate app is "alive": Login, Create Order, Payment, Core CRUD operations.

### 5. Test Names Describe Bug Scenario
```typescript
// GOOD: test_csv_export_handles_10k_rows_without_timeout_BUG_789
// BAD: test_export_works
```

### 6. Retire Tests When Feature Removed
```bash
git rm tests/legacyExportService.test.ts  # Feature removed → Delete tests immediately
```

### 7. No Duplicate Tests
Search existing tests before adding new ones. One bug = One test.

---

## Test Types & Selection

| Test Type | Scope | Duration | When to Run | Coverage | Example Tests |
|-----------|-------|----------|-------------|----------|---------------|
| **Smoke** | Critical path only | < 5 min | Every commit | 10-20 tests | Login, Create Order, Payment, Health Check |
| **Sanity** | Core features | < 15 min | Pre-deploy to staging | 50-100 tests | All CRUD operations, main workflows |
| **Full Regression** | All features | < 30 min | Nightly, pre-release | 500-2000 tests | Edge cases, historical bugs, integrations |

### Selection Strategies

**Risk-Based**: Priority = (Bug Frequency) × (Severity). Track in `REGRESSION_METRICS.md`:
```markdown
| Module | Production Bugs | Regression Tests | Coverage |
| Payment | 5 | 5 | 100% |
| CSV Export | 3 | 2 | 67% ← Add 1 test |
```

**Change-Based**: `git diff main --name-only | grep '\.ts$' | while read file; do grep -r "import.*$(basename $file .ts)" tests/; done`

**Priority-Based**: P0 (smoke) → every commit, P1 (sanity) → PR, P2 (full) → nightly

---

## Flaky Test Detection & Quarantine

**Flaky Test**: Non-deterministic (sometimes passes, sometimes fails on same code).

### Root Causes & Fixes

| Cause | Fix Strategy | Prevention Pattern |
|-------|--------------|-------------------|
| **Race condition** | Add proper `await`, waitFor() helpers | `await waitFor(() => expect(button).toBeEnabled())` |
| **Time dependency** | Mock Date.now(), use fake timers | `jest.setSystemTime(new Date('2026-03-16'))` |
| **External API** | Mock HTTP calls | `nock('https://api.stripe.com').post('/charges').reply(200)` |
| **Shared state** | Isolate test data (unique tenant per test) | `tenantId = uuidv4()` per test |
| **Random data** | Seed faker with test name hash | `faker.seed(hashCode(test.fullName))` |

### Detection Script
```bash
# Run test suite 10 times, detect flaky tests
for i in {1..10}; do npm test --json > test-results-$i.json; done

# Analyze: Tests that passed < 10 times are flaky
jq -s '[.[] | .testResults[] | .testResults[] | select(.status == "failed")] | \
  group_by(.fullName) | map({test: .[0].fullName, failures: length}) | \
  sort_by(.failures) | reverse' test-results-*.json
```

**Output**:
```json
[
  {"test": "test_websocket_reconnect", "failures": 3},  // 30% flaky rate → QUARANTINE
  {"test": "test_csv_export_large", "failures": 2}      // 20% flaky rate → QUARANTINE
]
```

### Quarantine Strategy
```typescript
// QUARANTINE: Mark flaky test with .skip + metadata
describe.skip('CSV Export Large Files (QUARANTINED)', () => {
  // JIRA: BUG-789 | Flaky rate: 20% | Root cause: Race condition
  // Owner: Thúc | Target fix: 2026-03-25
  it('exports 50K rows without timeout', async () => {
    // Test code remains for reference
  });
});
```

**Quarantine Policy**:
- Flaky rate > 5%: IMMEDIATE quarantine (`.skip`)
- Fix within 2 weeks or DELETE test permanently
- Re-enable only after 10x consecutive passes

---

## Two-Pass Workflow

### CRITICAL (Blocks Deploy)

1. **Flaky test rate > 5%**
   ```bash
   flaky_rate=$(npm test --json | jq '.numFailedTests / .numTotalTests * 100')
   if (( $(echo "$flaky_rate > 5.0" | bc -l) )); then
     echo "❌ CRITICAL: Flaky test rate $flaky_rate% exceeds 5% threshold"; exit 1
   fi
   ```

2. **Critical path test missing**: Login flow, payment processing, core CRUD untested

3. **Regression suite timeout > 30 minutes**
   ```bash
   timeout 30m npm test || { echo "❌ CRITICAL: Test suite exceeded 30 minutes"; exit 1 }
   ```

4. **Production bug with no regression test**: Every fix commit MUST include regression test

### INFORMATIONAL (Improve Later)

1. **Test duration optimization**: Suite runs in 25 min, target 15 min
2. **Snapshot test updates**: Run `npm test -- -u` after design refresh
3. **Test name improvements**: Rename generic names to include bug scenario

---

## Meta-Instructions

### Terse Output Format
```bash
# ✓ 1,247 tests | 3 flaky (0.24%) | 98.7% pass | 22 min runtime
```

### Real Production Bug (Lesson)

CSV export broke AGAIN after 6 months. Original test used 1000 rows (not 10K). Developer changed pagination 1000 → 5000. Test passed (1000 < 5000), but production hit 10K → crash.

**Lesson**: Use **exact scenario** that triggered bug (10K rows, not 1K).

---

## Quick Reference

### Daily Health Check
```bash
# Flaky test rate (target < 2%)
npm test --json | jq '.numFailedTests / .numTotalTests * 100'

# Test duration (slowest tests)
npm test --verbose | grep 'PASS\|FAIL' | awk '{print $NF, $0}' | sort -n | tail -10
```

### Regression Test Checklist
```markdown
- [ ] Every production bug has regression test added
- [ ] Test name includes BUG-ID for traceability
- [ ] Flaky test rate < 2% (verified with 10x runs)
- [ ] Full regression suite < 30 minutes
- [ ] Smoke tests < 5 minutes (critical path only)
- [ ] Dead tests retired (feature removed = test removed)
- [ ] No duplicate tests (search before adding)
- [ ] Tests use deterministic data (seeded faker)
```

### Stopping Policy

**STOP new features** and triage if:
1. **Flaky rate > 5%**: Fix or delete within 3 days
2. **Regression suite > 30 min**: Parallelize or move to nightly
3. **Production bug escapes 2x**: Audit regression coverage (same bug twice = coverage gap)
