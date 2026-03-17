# Regression Test Suite Management

**Version**: 1.0.0
**Mode**: TWO_PASS
**Category**: Testing
**Priority**: P2 MEDIUM

## Overview

Regression test management skill for preventing production bugs from returning. Implements risk-based test selection, flaky test detection/quarantine, test lifecycle management, and test retirement strategies.

## Philosophy

**"You are a time traveler preventing past bugs from resurrecting."**

Every production bug becomes a regression test. No bug dies twice.

## Key Features

### 1. Test Selection Strategies
- **Risk-Based**: Prioritize by (Bug Frequency) × (Severity)
- **Change-Based**: Test Impact Analysis (run only affected tests)
- **Priority-Based**: Smoke (< 5 min) → Sanity (< 15 min) → Full (< 30 min)

### 2. Flaky Test Management
- **Detection**: Run suite 10x, identify non-deterministic tests
- **Quarantine**: `.skip` flaky tests with JIRA ticket + root cause analysis
- **Fix**: 5 root cause categories (race, time, API, state, random data)

### 3. Test Lifecycle
- **Add**: Every production bug → regression test (same PR)
- **Maintain**: Daily flaky rate checks, weekly duration analysis
- **Triage**: Weekly quarantine review, 2-week fix deadline
- **Retire**: Delete tests when feature removed

### 4. Two-Pass Workflow
- **CRITICAL** (blocks deploy): Flaky rate > 5%, missing critical path tests, suite timeout > 30 min
- **INFORMATIONAL** (optimize later): Test duration improvements, snapshot updates

## Target Agents

**PRIMARY**: Sơn QA
**SECONDARY**: Huyền FE-QA, All Dev agents (Thúc, Lân, Tuấn, Huyền-Py, Hoàng, Trinh)

## Prime Directives (Non-Negotiable)

1. Every production bug gets a regression test
2. Flaky test rate < 2% (quarantine if > 5%)
3. Full regression suite < 30 minutes
4. Critical path tests run on every commit
5. Test names describe bug scenario (include BUG-ID)
6. Retire tests when feature removed
7. No duplicate tests

## Usage

```bash
# Check flaky test rate
npm test --json | jq '.numFailedTests / .numTotalTests * 100'

# Detect flaky tests (10x runs)
for i in {1..10}; do npm test --json > test-results-$i.json; done

# Find orphaned tests (feature deleted, test remains)
git log --diff-filter=D --summary | grep 'src/' | while read f; do
  grep -r "$(basename $f)" tests/ && echo "Orphaned test for $f"
done
```

## Dependencies

- `tdd-best-practices`: RED-GREEN-REFACTOR cycles
- `test-data-management`: Hermetic test data, multi-tenant isolation

## References

See `SKILL.md` for complete workflow, flaky test root cause matrix, and real production bug examples.
