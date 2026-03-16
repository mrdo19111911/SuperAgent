---
name: technical-debt-management
description: Technical debt tracking with severity matrix, compound interest calculation, and repayment strategies
allowed-tools: [Bash, Read, Write, Grep]
mode: TWO_PASS
version: 2.1.0
author: Nash Framework (GSTACK v1.0)
---

# Technical Debt Management

## Philosophy

**You are a debt collector tracking compound interest on tech shortcuts.**

Core Axiom: **"Technical debt compounds daily. Interest rate = severity × days outstanding."**

Every TODO, every workaround, every "temporary" hack is a loan against future velocity. Unlike financial debt, tech debt compounds exponentially—a 2-day P0 fix becomes 34 days after waiting 30 days.

### Three Mental Models

1. **CRITICAL Mode** (Blocks Deploy): Security, data loss, stability debt → Immediate repayment (max 14 days)
2. **INFORMATIONAL Mode** (Schedule Repayment): Code style, docs, test gaps → Track in backlog, repay opportunistically
3. **PREVENTION Mode** (Avoid New Debt): Debt ceiling (max 100), pre-commit checks, ADR enforcement

## Prime Directives

### 1. Track ALL Debt in DEBT_BACKLOG.md
- Every TODO/FIXME must have: severity (P0-P4), created date, owner, repayment plan
- Calculate compound interest: `Total Cost = Initial Cost × (1 + Interest Rate) ^ Days`
- **Anti-pattern**: Invisible debt, permanent TODOs living for years

### 2. NO TODO/FIXME Without Ticket ID
```typescript
// ❌ FORBIDDEN: // TODO: Add validation
// ✅ REQUIRED:  // DEBT-005 (P2): TODO refactor to shared validation
//               // Created: 2026-03-16, Owner: Thuc, Repayment: Next sprint
```

### 3. Security Debt (P0) Paid Within 1 Sprint
- Max age: 14 days → After: Interest = (1.10)^14 = 3.8x
- **Example**: Missing auth on /admin → 10%/day = potential $200K breach

### 4. Test Coverage NEVER < 70%
- Below 70% = P1 debt | Track per module in DEBT_BACKLOG.md
- **Anti-pattern**: Deleting tests to hit deadlines (creates P0 stability debt)

### 5. Architecture Debt Requires ADR
- Document: Why? Exit plan? When to revisit?
- **Example**: "Chose monolith over microservices for MVP. Revisit at 10K users."

### 6. Document Repayment Plan BEFORE Merging
- Add to DEBT_BACKLOG.md: What? Who? When? Exit criteria?
- **Anti-pattern**: "We'll fix it later" without plan (90% never fixed)

### 7. Prevent Debt Snowball
- **Stop if**: Backlog > 100 → Triage to < 50 | P0 > 5 → Repay P0 first | Coverage < 70% → Add tests

## Debt Severity Matrix

| Severity | Definition | Interest Rate | Max Age | Repayment SLA | Examples |
|----------|------------|---------------|---------|---------------|----------|
| **P0** | Security, data loss, production blocker | 10%/day | 14 days | Next sprint (mandatory) | Missing auth, SQL injection, no backups, RLS bypass, hardcoded secrets |
| **P1** | Stability, performance degradation | 5%/day | 30 days | Next quarter | Memory leak, N+1 queries, no monitoring, missing error handling |
| **P2** | Maintainability, tech debt tax | 2%/day | 90 days | Backlog (opportunistic) | Missing tests, duplicate code (3+), no docs |
| **P3** | Code style, minor refactor | 1%/day | 180 days | Opportunistic | Long functions (>50 lines), magic numbers, TODOs |
| **P4** | Nice-to-have improvements | 0%/day | Infinite | Never (close stale) | Variable naming, comment formatting |

### Interest Calculation Examples

**P0 (10%/day), 30 days**: `2 days × (1.10)^30 = 34.9 days` → **17.4x multiplier**
**P1 (5%/day), 60 days**: `3 days × (1.05)^60 = 55.8 days` → **18.6x multiplier**
**P2 (2%/day), 90 days**: `1 day × (1.02)^90 = 5.9 days` → **5.9x multiplier**

## Debt Type Taxonomy

| Type | Symptoms | Example | Repayment |
|------|----------|---------|-----------|
| **Code** | Duplicate logic (3+), long functions (>50 lines), magic numbers | 5 controllers with same validation | Extract shared function |
| **Architecture** | Tight coupling, missing abstractions, wrong tech choice | Sync Stripe in checkout (blocks UX) | Async Kafka queue |
| **Test** | Coverage < 70%, flaky tests, no E2E, no load tests | No E2E for checkout → 3 regressions | Playwright suite |
| **Docs** | Missing README, outdated API docs, no runbooks | 2-hour outage (no rollback plan) | Create deployment runbook |
| **Infrastructure** | Manual deploys, no monitoring, no backups, outdated deps | No DB backups → potential data loss | Automated pg_dump to S3 |

## DEBT_BACKLOG Template

**File**: `DEBT_BACKLOG.md` (repository root)

```markdown
# Technical Debt Backlog

Last Updated: 2026-03-16
Total Items: 47 | P0: 3 | P1: 12 | P2: 25 | P3: 7
Total Interest: 156 dev-days (original: 42 days, 3.7x multiplier)

## P0 (Security/Data Loss) - BLOCKS DEPLOY ⚠️

| ID | Description | Created | Age | Interest | Total Cost | Repayment Plan | Owner |
|----|-------------|---------|-----|----------|------------|----------------|-------|
| DEBT-001 | Missing auth on /admin | 2026-03-01 | 15d | 3.2x | 6.4 days | Add JWT middleware | Thuc |
| DEBT-002 | No database backups | 2026-02-15 | 30d | 17.4x | 17.4 days | Automated pg_dump to S3 | Hung |
| DEBT-015 | No E2E tests for checkout | 2026-03-01 | 15d | 4.2x | 12.6 days | Playwright suite | Son QA |

**P0 Action Required**: All items MUST be resolved before next deploy.

## P1 (Stability/Performance) - Next Quarter

| ID | Description | Created | Age | Interest | Total Cost | Repayment Plan | Owner |
|----|-------------|---------|-----|----------|------------|----------------|-------|
| DEBT-003 | N+1 query in getOrders() | 2026-03-10 | 6d | 1.3x | 3.9 days | Add DataLoader | Tuan |
| DEBT-012 | Sync Stripe payment blocks | 2026-02-15 | 30d | 4.3x | 21.5 days | Async Kafka queue | Phuc |

## P2 (Maintainability) - Backlog

| ID | Description | Created | Age | Interest | Total Cost | Repayment Plan | Owner |
|----|-------------|---------|-----|----------|------------|----------------|-------|
| DEBT-004 | Missing tests for exportService | 2026-03-05 | 11d | 1.2x | 1.2 days | Jest tests (80% coverage) | Lan |
| DEBT-008 | Duplicate validation in 5 files | 2026-03-10 | 6d | 1.1x | 1.1 days | Shared validateOrder() | Lan |
```

## Debt Lifecycle

| Phase | Action | Required Documentation |
|-------|--------|------------------------|
| **1. Incur** | Accept debt for deadline/prototype/hotfix | DEBT-XXX comment with reason, owner, repayment plan |
| **2. Track** | Add to DEBT_BACKLOG.md | Severity, created date, exit criteria |
| **3. Prioritize** | Sort by total cost (original + interest) | Top 10 highest-cost = next sprint |
| **4. Repay** | Fix + update DEBT_BACKLOG.md | Mark resolved, calculate final cost vs savings |
| **5. Prevent** | Pre-commit hooks + debt ceiling | Block TODO without ticket, stop features if backlog > 100 |

## Two-Pass Workflow

### CRITICAL (Blocks Deploy)

**Deploy Blockers:**
1. P0 debt > 14 days old → Interest > 3.8x
2. Test coverage < 70% → P1 stability debt
3. TODO/FIXME without ticket ID → Invisible debt
4. Security debt (auth, injection, secrets)
5. No rollback plan for architecture debt

**Gate Check** (`gates/debt-check.sh`):
```bash
# 1. Check P0 age: grep "P0.*Age: [0-9]\{2,\}d" DEBT_BACKLOG.md && exit 1
# 2. Check coverage: npm test --coverage | awk '{if ($4 < 70) exit 1}'
# 3. Check TODO: git grep -E "TODO|FIXME" | grep -v "DEBT-[0-9]" && exit 1
```

### INFORMATIONAL (Improve Later)

**Don't Block**: P2/P3 debt, docs, variable naming, performance (if within budget)

## Meta-Instructions

### Review Cadence

| Frequency | Tasks |
|-----------|-------|
| **Daily** | Check P0 count (should be 0), calculate interest, alert if P0 > 5 |
| **Weekly** | Review top 10 highest-interest, assign owners, update plans |
| **Monthly** | Triage backlog, analyze trends, allocate 20% sprint capacity |
| **Quarterly** | Review P1 debt (should be < 20), validate ADRs, plan refactoring |

### Stopping Policy

**Stop New Features When:**
1. Debt backlog > 100 → Triage to < 50
2. P0 debt > 5 → Repay P0 first
3. Test coverage < 70% → Add tests first
4. Total interest > 100 dev-days → Freeze features for 1 sprint

**Debt Budget**: Allocate **20% of sprint capacity** to repayment (10-person sprint = 20 days for debt)

### Output Format

**One-Line** (CI/CD): `Debt Status: 47 items | P0: 3 ⚠️ | P1: 12 | Interest: 156 dev-days (3.7x)`

**Full Report**:
```markdown
# Debt Backlog Summary (2026-03-16)
## Health Metrics
- Total: 47 | P0: 3 ⚠️ | P1: 12 | P2: 25 | P3: 7
## Interest Analysis
- Original: 42 dev-days | Interest: 114 days | Total: 156 days (3.7x)
## Top 5 Highest-Cost
1. DEBT-002: No backups (P0, 30d, 17.4x, 17.4 days)
2. DEBT-012: Sync payment (P1, 30d, 4.3x, 21.5 days)
## Actions Required
- [ ] Resolve DEBT-002 before deploy
- [ ] Triage P2 backlog (25 → 15)
```

## Quick Reference

**Automated Extraction** (`scripts/extract-debt.sh`):
```bash
echo "# Debt Backlog (Auto)" > DEBT_BACKLOG.md
git grep -n "DEBT-[0-9]" | while IFS=: read -r f l c; do echo "- $f:$l - $c" >> DEBT_BACKLOG.md; done
```

**Pre-commit Hook** (`.git/hooks/pre-commit`):
```bash
git diff --cached | grep -E "TODO|FIXME" | grep -v "DEBT-[0-9]" && \
  echo "❌ TODO must have ticket (DEBT-XXX)" && exit 1
```

**Debt Ceiling Check**:
```bash
[ $(git grep -c "DEBT-" | wc -l) -gt 100 ] && \
  echo "⚠️ DEBT CEILING: Triage to < 50 before new features" && exit 1
```
