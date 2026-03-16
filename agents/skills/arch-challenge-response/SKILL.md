# Architecture Challenge Response

Templates for responding to Mộc's ARCH_CHALLENGE.md.

---

## ARCH_RESPONSE.md Template

```markdown
# Architecture Response

**Module:** {module_name}
**Author:** Phúc SA
**Date:** 2026-03-15
**In Response to:** ARCH_CHALLENGE.md by Mộc

---

## HIGH-01: Missing NOBYPASSRLS Role
**Status:** ✅ ACCEPTED
**Action:**
- Created migration `002_create_app_user.sql`
- Updated pool config to use `app_user`
**Evidence:**
- File: `migrations/002_create_app_user.sql`
- Commit: `abc123f`

---

## MEDIUM-02: N+1 Query in services/projects.ts
**Status:** ✅ ACCEPTED
**Action:**
- Refactored to use `include: { owner: true }`
- Added test: `tests/projects.test.ts:67`
**Evidence:**
- File: `services/projects.ts` (diff: -5, +3)
- Test: expect(queryCount).toBe(1)

---

## LOW-03: Over-Indexing on tasks Table
**Status:** ❌ REJECTED
**Reason:**
- `title` index used for autocomplete (SPEC.md § 3.2)
- Query: `WHERE tenant_id = ? AND title ILIKE ?`
**Mitigation:**
- Monitor write latency in production
- Revisit if p95 > 100ms
```

---

## Decision Matrix

| Severity | Response | Required |
|----------|----------|----------|
| **HIGH** | Accept OR Phanbien | ARCH_RESPONSE.md |
| **MEDIUM** | Accept OR justify | Brief reason |
| **LOW** | Accept OR brief reason | Optional |

**Phanbien:** If rejecting HIGH → Create `PHUC_MOC_JOINT_DESIGN.md`

---

## PHUC_MOC_JOINT_DESIGN.md Template

```markdown
# Joint Design: {Issue ID}

**Issue:** {Copy from ARCH_CHALLENGE.md}
**Date:** 2026-03-15
**Participants:** Phúc SA, Mộc, Dũng PM (judge)

---

## Phúc SA's Position
**Argument:** [Technical reasoning]
**Evidence:** [Benchmarks, references]
**Trade-offs:** [Acknowledged downsides]

---

## Mộc's Position
**Argument:** [Technical reasoning]
**Evidence:** [Alternative benchmarks]
**Trade-offs:** [Acknowledged downsides]

---

## FINAL DECISION (Dũng PM)
**Chosen:** {Phúc's | Mộc's | Hybrid}
**Reasoning:** [Business + technical context]
**Action Items:**
- [ ] Implement in `{file}`
- [ ] Verify in next review cycle

**LEDGER:** {Winner: no penalty | Loser: -15 P2}
```

---

## Checklist Before Calling Mộc

**PEN-001 Prevention:**
- [ ] `ARCHITECTURE.md` complete
- [ ] `schema.prisma` all tables defined
- [ ] `CONTRACT_DRAFT.md` all 8 sections
- [ ] `migrations/*.sql` with RLS
- [ ] `SPEC.md` attached
- [ ] `SCORING_RULES.md` attached

**If missing:** Mộc can REJECT → P1 penalty (-20)

---

## Response Template Shortcuts

**Accept:**
```markdown
**Status:** ✅ ACCEPTED
**Action:** {What you did}
**Evidence:** {File + commit}
```

**Reject:**
```markdown
**Status:** ❌ REJECTED
**Reason:** {Why + reference to SPEC/requirements}
**Mitigation:** {Alternative approach}
```

**Phanbien (HIGH only):**
```markdown
**Status:** ⚠️ CONTESTED (Phanbien triggered)
**See:** PHUC_MOC_JOINT_DESIGN.md
```
