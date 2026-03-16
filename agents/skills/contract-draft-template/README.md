# CONTRACT_DRAFT 8-Section Template

Complete interface contract specification for Pipeline 2 (Architecture & DB).

## Purpose

Ensures `CONTRACT_DRAFT.md` contains all mandatory sections required by Gates 1.6, 1.6.5, and 2. Prevents incomplete contracts that block Pipeline 3 (Coding).

## For Phúc SA (Solution Architect)

Use this skill when:
- Creating `docs/CONTRACT_DRAFT.md` as THESIS output
- Responding to Xuân's review in Gate 1.6.5
- Adding error cases to meet Gate 2 requirement (≥5 cases)

## 8 Mandatory Sections

1. **API Contracts** - Endpoints, request/response shapes
2. **Error Handling** - ≥5 error codes with client actions
3. **Events/Pub-Sub** - Domain events (or "N/A")
4. **Idempotency Rules** - Retry/dedup strategies
5. **Mock Specifications** - Test doubles for devs
6. **Non-Functional Requirements** - Performance, security, a11y, observability
7. **Acceptance Criteria** - Testable assertions
8. **Sign-off** - THESIS/ANTI-THESIS/SYNTHESIS approval tracker

## Quick Validation

```bash
# Check file exists and has minimum lines
wc -l docs/CONTRACT_DRAFT.md  # Must be ≥30

# Check error cases
grep -c "| \`" docs/CONTRACT_DRAFT.md  # Must be ≥5
```

## Integration

- **Pipeline:** 02_ARCHITECTURE_AND_DB.md
- **Gates:** 1.6 (completeness), 1.6.5 (Xuân review), 2 (error count)
- **Reviewers:** Mộc (ANTI-THESIS), Xuân (SYNTHESIS)

## See Also

- [phuc-sa.md](../../core/phuc-sa.md) - Agent using this skill
- [02_ARCHITECTURE_AND_DB.md](../../../pipelines/02_ARCHITECTURE_AND_DB.md) - Pipeline definition
