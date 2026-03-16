# Technical Debt Management

**Skill ID:** `technical-debt-management`
**Version:** 2.0.0 (GSTACK v1.0)
**Status:** active
**Priority:** P2 (MEDIUM)

## Overview

Track technical debt with compound interest calculation and enforce repayment strategies. Every TODO is a loan with daily compounding interest—a 2-day P0 fix becomes 34 days after 30 days of neglect.

### Key Features

- **Compound Interest Model**: P0 debt = 10%/day, P1 = 5%/day, P2 = 2%/day
- **Debt Severity Matrix**: P0-P4 classification with max age and repayment SLAs
- **5-Phase Lifecycle**: Incur → Track → Prioritize → Repay → Prevent
- **Two-Pass Workflow**: CRITICAL (blocks deploy) → INFORMATIONAL (improve later)
- **Stopping Policy**: > 100 items = freeze features, triage to < 50
- **Real Production Disasters**: Missing auth ($10K bounty), N+1 query ($200K lost sales), no backups ($2M data loss)

## GSTACK Compliance

- **Philosophy**: You are a debt collector tracking compound interest on tech shortcuts
- **7 Prime Directives**: Track all debt, no TODO without ticket ID, P0 paid within 14 days, test coverage ≥70%, architecture debt requires ADR, document repayment plan, prevent snowball
- **3 Tables**: Debt Severity Matrix, Debt Type Taxonomy (5 types), Interest Calculation Examples
- **Multi-Path Analysis**: 5-phase lifecycle with automated extraction, prioritization, and prevention scripts
- **Concrete Examples**: 3 real production disasters with interest calculations
- **Two-Pass**: CRITICAL (P0 > 14 days, coverage < 70%, TODO without ticket, security debt) → INFORMATIONAL (P2/P3 debt, docs, optimization)
- **Terse Output**: One-line summary for CI/CD dashboards

## Quick Reference

### Debt Severity Matrix
```
P0: 10%/day, 14 days max → Security, data loss, production blockers
P1: 5%/day, 30 days max → Stability, performance degradation
P2: 2%/day, 90 days max → Maintainability, tech debt tax
P3: 1%/day, 180 days max → Code style, minor refactoring
P4: 0%/day, infinite → Nice-to-have (close when stale)
```

### Interest Calculation
```
Total Cost = Initial Cost × (1 + Interest Rate) ^ Days Outstanding

Example: P0 debt, 30 days
2 dev-days × (1.10)^30 = 34.9 dev-days (17.4x multiplier)
```

### Stopping Policy
```
Debt backlog > 100 items → Triage to < 50 before new features
P0 debt > 5 items → Repay P0 first
Test coverage < 70% → Add tests before merging
Total interest > 100 dev-days → Freeze features for 1 sprint
```

## Usage

Reference this skill when:
- **Architecture Review**: Identify and track architecture debt with ADR
- **Code Review**: Block TODO/FIXME without ticket ID
- **Sprint Planning**: Allocate 20% capacity to debt repayment
- **Pre-Deploy Gate**: Verify no P0 debt > 14 days old, coverage ≥ 70%

## Archetype Compatibility

| Archetype | Fit | Reason |
|-----------|-----|--------|
| Strategist | Perfect | Architecture debt + ADR decisions |
| Analyst | Perfect | Debt classification and tracking |
| Critic | Perfect | Code review + debt detection |
| Builder | Acceptable | Boy Scout Rule (fix while coding) |
| Operator | Acceptable | Infrastructure debt tracking |

## Dependencies

**None** (standalone skill)

**Tools used:**
- Bash (automated debt extraction, pre-commit hooks)
- Grep (find TODO/FIXME patterns)
- Write (create DEBT_BACKLOG.md)
- Read (analyze existing debt)

## Integration Points

- **Pipeline 2 (Architecture)**: Phuc SA tracks architecture debt in ARCHITECTURE.md with ADR
- **Pipeline 3 (Coding)**: Enforce TODO/FIXME ticket ID in code review
- **Pipeline 4 (Testing)**: Son QA tracks test debt (coverage < 70% = P1)
- **Pipeline 5 (Security)**: gates/security.sh blocks deploy if P0 debt exists
- **Scoring (LEDGER)**: P2 penalty (-15) for debt without ticket, P1 penalty (-20) for shipping P0 debt

## Performance

- **Avg tokens**: ~4,500 (reference only, not executed)
- **Complexity**: Medium (requires interest calculation + prioritization)
- **Automation**: Pre-commit hooks, daily extraction scripts, CI/CD gates

## Known Limitations

- Interest rate estimation requires domain knowledge (adjust 10%/5%/2% based on context)
- Assumes stable team velocity (dev-days may vary)
- Requires discipline to maintain DEBT_BACKLOG.md (automate extraction recommended)

## Changelog

**v2.0.0** (2026-03-16) - GSTACK v1.0
- Complete rewrite following GSTACK 12 principles
- Added compound interest model (10%/5%/2% daily)
- 5-phase lifecycle with automation scripts
- Real production disaster examples
- Two-pass workflow (CRITICAL → INFORMATIONAL)
- Stopping policy enforcement
- Pre-commit hooks and debt ceiling checks

**v1.0.0** (2026-03-16)
- Initial release with SQALE methodology
- ROI analysis framework
- Basic debt classification
