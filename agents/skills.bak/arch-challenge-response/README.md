# Architecture Challenge Response Protocol

Nash Triad response workflow for Phúc SA when Mộc challenges architecture design.

## Purpose

Defines the protocol for:
- Responding to Mộc's `ARCH_CHALLENGE.md` with evidence-based decisions
- Triggering Phanbien (joint design meeting) for contested HIGH issues
- Preventing PEN-001 violations (incomplete context handoff)

## For Phúc SA (Solution Architect)

Use this skill when:
- Mộc publishes `ARCH_CHALLENGE.md` after reviewing your architecture
- Gate 1.5 requires `ARCH_RESPONSE.md` to exist
- You disagree with Mộc's HIGH severity issue (trigger Phanbien)

## Response Decision Matrix

| Severity | Response Options | Gate Impact |
|----------|------------------|-------------|
| **HIGH** | MUST accept OR trigger Phanbien | Gate 1.5 blocks if rejected without Phanbien |
| **MEDIUM** | Accept OR reject with justification | No gate block |
| **LOW** | Accept OR reject with brief reason | No gate impact |

## Phanbien Workflow

1. Phúc SA rejects HIGH issue in `ARCH_RESPONSE.md`
2. Create `PHUC_MOC_JOINT_DESIGN.md` with both positions
3. Dũng PM makes FINAL DECISION (immutable)
4. Gate 2.5 verifies FINAL DECISION exists

## Key Elements in Response

- **Status:** ✅ ACCEPTED or ❌ REJECTED
- **Action Taken:** Specific changes with file paths
- **Evidence:** Commit hashes, test files, benchmarks
- **Reason:** (For rejected issues) Technical justification + references

## Integration

- **Pipeline:** 02_ARCHITECTURE_AND_DB.md (SYNTHESIS phase)
- **Gates:** 1.5 (response exists), 2.5 (Phanbien resolved)
- **Related PEN:** PEN-001 (must provide full context to Mộc)

## See Also

- [phuc-sa.md](../../core/phuc-sa.md) - PEN-001 constraint
- [SCORING_RULES.md](../../../system/SCORING_RULES.md) - P1/P2 penalties
