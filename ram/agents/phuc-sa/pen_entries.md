## PEN (Top 10 Never-Repeat)

### P0 CRITICAL
1. **PEN-002 | 2026-02-28 | T2_26 | -30**
   - Missing NOBYPASSRLS in RLS policy
   - **Rule:** Every multi-tenant table MUST have NON-superuser role with NOBYPASSRLS (superuser always bypasses RLS)
   - **Prevention:** Check skill: `postgresql-rls-architecture/SKILL.md`

### P1 HIGH
2. **PEN-001 | 2026-02-28 | T2_27 | -20**
   - Insufficient context to Mộc → 9 HIGH issues at P6 iter-1
   - **Rule:** When calling reviewer (Mộc/Xuân), MUST attach ALL relevant files (ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md)
   - **Prevention:** Missing context = auto-FAIL. Use skill: `arch-challenge-response/SKILL.md`

### P2 MEDIUM
3. **Incomplete CONTRACT_DRAFT | 2026-02-15 | T2_20 | -15**
   - Missing Idempotency section in CONTRACT_DRAFT.md
   - **Rule:** ALL 8 sections required: API, Errors, Events, Idempotency, Mocks, NFRs, Criteria, Sign-off
   - **Prevention:** Use template: `contract-draft-template/SKILL.md`

4. **Missing ARCHITECTURE_ABSTRACT | 2026-02-10 | T2_15 | -10**
   - Only provided full ARCHITECTURE.md (~800 lines) to Xuân → token overflow at Gate 1.6.5
   - **Rule:** ALWAYS create ARCHITECTURE_ABSTRACT.md (~150 lines) for fast gate reviews
   - **Prevention:** Use skill: `token-optimized-arch-docs/SKILL.md` (WIN-001 pattern)

5. **Schema without soft delete | 2026-02-05 | T2_10 | -10**
   - Table `notifications` missing `deleted_at` column
   - **Rule:** ALL tables MUST have `deleted_at TIMESTAMP` for soft delete (STMAI rule)
   - **Prevention:** Check multi-tenant schema patterns

6-10. [Archived - See LEDGER for full PEN history]

_Archived PEN (P3-P4): See artifacts/{task}/LEDGER.md_

---


## WIN (Top 5 Successes)

1. **WIN-001 | 2026-02-25 | T1_13 | +30**
   - ARCHITECTURE_ABSTRACT.md (~150L) helped Xuân at P1.6.5 review 85% faster
   - **Pattern:** Token-optimized docs (tables, bullets, acronyms, file refs) = faster gates
   - **Repeat:** Use `token-optimized-arch-docs/SKILL.md` for all architecture deliverables

2. **Complete multi-tenant schema | 2026-02-20 | T1_10 | +25**
   - Schema: All tables with `tenant_id` + `deleted_at` + partial indexes + RLS policies with NOBYPASSRLS
   - **Impact:** Zero tenant pollution bugs in production
   - **Repeat:** Use `multi-tenant-schema-design/SKILL.md` + `postgresql-rls-architecture/SKILL.md`

3. **8-section CONTRACT_DRAFT | 2026-02-18 | T1_08 | +20**
   - First complete CONTRACT_DRAFT.md passed Gate 1.6 without revision
   - **Impact:** Saved 2 iteration cycles (4 hours)
   - **Repeat:** Use `contract-draft-template/SKILL.md` checklist

4. **PHUC_MOC_JOINT_DESIGN.md | 2026-02-15 | T1_05 | +20**
   - Synthesis role: Documented FINAL DECISION after Mộc challenge with evidence-based trade-offs
   - **Impact:** Xuân accepted design at Gate 1.6.5 without questions
   - **Repeat:** Use `arch-challenge-response/SKILL.md` protocol

5. **Database migration plan | 2026-02-12 | T1_03 | +15**
   - Expand-Contract pattern for zero-downtime schema change (10M rows, 5min total, no locks)
   - **Impact:** Production deployment with zero user impact
   - **Repeat:** Use `database-migration/SKILL.md` (GSTACK v2.0)

_Full WIN history: See artifacts/{task}/LEDGER.md_

---
