# Phúc SA — Pipeline 2 Quick Checklist

**For:** Solution Architect tasks in Architecture & DB phase
**Skills:** 5 specialized skills in `agents/skills/`

---

## 📋 Before Starting Pipeline 2

- [ ] Read [phuc-sa.md](../core/phuc-sa.md) PEN/WIN entries
- [ ] Check `SPEC.md` for requirements
- [ ] Verify `SOURCE_OF_TRUTH` (top-level architecture doc)

---

## 🗄️ Schema Design Phase

**Use:** [postgresql-rls-architecture/SKILL.md](postgresql-rls-architecture/SKILL.md) + [multi-tenant-schema-design/SKILL.md](multi-tenant-schema-design/SKILL.md)

### Every Table Checklist
- [ ] `tenant_id TEXT NOT NULL`
- [ ] `deleted_at TIMESTAMPTZ` (soft delete)
- [ ] `@@index([tenant_id])`
- [ ] `@@index([tenant_id, deleted_at])`
- [ ] Unique constraints scoped to tenant
- [ ] RLS policy enabled

### Migration Checklist
- [ ] SQL migration has RLS policy:
  ```sql
  ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON {table}
    USING (tenant_id = current_setting('app.current_tenant_id')::TEXT);
  ```
- [ ] `app_user` role created with NOBYPASSRLS:
  ```sql
  CREATE ROLE app_user NOBYPASSRLS LOGIN PASSWORD '...';
  ```
- [ ] Connection pool uses `app_user`, NOT superuser

### Pattern Selection (Skill 3)
- [ ] **Standard Entity:** < 10M rows/tenant → Basic indexes
- [ ] **Time-Series:** > 100M rows → Partition by tenant + month
- [ ] **Hierarchical:** Org → Team → Channel → Denormalize `org_id`
- [ ] **Shared Reference:** Countries, Currencies → NO tenant_id, NO RLS
- [ ] **Soft Delete Cascade:** Application logic, NOT DB triggers

### pg-aiguide MCP Usage (Skill 1)
**Before finalizing schema, search:**
- [ ] `search_docs "row level security policy create"`
- [ ] `search_docs "partial index WHERE clause performance"`
- [ ] `search_docs "SET LOCAL vs SET transaction scope"`
- [ ] `view_skill schema_design` (best practices)

---

## 📝 Contract Draft Phase

**Use:** [contract-draft-template/SKILL.md](contract-draft-template/SKILL.md)

### 8 Mandatory Sections
- [ ] 1. API Contracts (endpoints, request/response)
- [ ] 2. Error Handling (≥5 error codes with client actions)
- [ ] 3. Events/Pub-Sub (domain events OR "N/A")
- [ ] 4. Idempotency Rules (retry/dedup strategies)
- [ ] 5. Mock Specifications (MSW handlers, fixtures)
- [ ] 6. Non-Functional Requirements (perf, security, a11y, observability)
- [ ] 7. Acceptance Criteria (testable assertions: input → output)
- [ ] 8. Sign-off (THESIS/ANTI-THESIS/SYNTHESIS table)

### Self-Validation
- [ ] File ≥30 lines (Gate 1.6 requirement)
- [ ] Error section has ≥5 cases (Gate 2 requirement)
- [ ] All acceptance criteria have testable assertions
- [ ] Mock specs match API contract shapes

---

## 📄 Documentation Phase

**Use:** [token-optimized-arch-docs/SKILL.md](token-optimized-arch-docs/SKILL.md)

### After Completing ARCHITECTURE.md
- [ ] Create `ARCHITECTURE_ABSTRACT.md` (~150 lines max)
- [ ] Use table format for structured data (not prose)
- [ ] Bullets over sentences (remove filler words)
- [ ] Code snippets → File references (e.g., `[db.ts:12-18](../src/db.ts#L12-L18)`)
- [ ] Add pointers to full doc (e.g., "See [ARCHITECTURE.md § RLS]")
- [ ] Define acronyms in glossary

### Abstract Structure
- [ ] System overview (1 paragraph)
- [ ] Module boundaries (bullets)
- [ ] Key decisions (table)
- [ ] Critical constraints (numbered list)
- [ ] Data flow (high-level)
- [ ] Tech stack + schema highlights
- [ ] Pointers to full doc sections

---

## 🛡️ Before Calling Mộc (Anti-Thesis)

**PEN-001 Prevention Checklist:**

- [ ] `docs/ARCHITECTURE.md` complete (not draft)
- [ ] `prisma/schema.prisma` all tables defined
- [ ] `docs/CONTRACT_DRAFT.md` all 8 sections filled
- [ ] `prisma/migrations/*.sql` RLS policies included
- [ ] `SPEC.md` attached as context
- [ ] `system/SCORING_RULES.md` attached (severity reference)

**If ANY missing → Mộc can REJECT with "INSUFFICIENT CONTEXT" → P1 penalty (-20)**

---

## ⚔️ When Mộc Challenges (Synthesis Phase)

**Use:** [arch-challenge-response/SKILL.md](arch-challenge-response/SKILL.md)

### Read ARCH_CHALLENGE.md
- [ ] Count HIGH/MEDIUM/LOW issues
- [ ] For each issue, note: Evidence, Risk, Counter-Proposal

### Create ARCH_RESPONSE.md

#### For Each Issue:
- [ ] **Status:** ✅ ACCEPTED or ❌ REJECTED
- [ ] **Action Taken:** Specific changes with file paths
- [ ] **Evidence:** Commit hashes, test files, benchmarks
- [ ] **Reason:** (If rejected) Technical justification + references

#### Decision Matrix:
- **HIGH Issues:**
  - [ ] Accept → Implement Mộc's counter-proposal
  - [ ] Reject → Trigger Phanbien (create `PHUC_MOC_JOINT_DESIGN.md`)
- **MEDIUM Issues:**
  - [ ] Accept OR reject with strong justification
- **LOW Issues:**
  - [ ] Accept OR reject with brief reason

### If Phanbien Triggered (HIGH Issue Rejected)
- [ ] Create `docs/PHUC_MOC_JOINT_DESIGN.md`
- [ ] Fill "Phúc SA's Position" with argument + evidence
- [ ] Wait for Mộc to fill "Mộc's Position"
- [ ] Dũng PM writes "FINAL DECISION"
- [ ] Implement decision (winner = no penalty, loser = -15 P2)

---

## ✅ Gate Validation

### Gate 1.5: Architecture Challenge
- [ ] `ARCH_CHALLENGE.md` exists (Mộc created)
- [ ] `ARCH_RESPONSE.md` exists (you created)
- [ ] All HIGH issues have responses (accept OR Phanbien)

### Gate 1.6: Contract Draft
- [ ] `CONTRACT_DRAFT.md` ≥30 lines
- [ ] Has API section
- [ ] Has Event boundary section

### Gate 1.6.5: Contract Review
- [ ] `CONTRACT_REVIEW.md` exists (Xuân created)
- [ ] Xuân sign-off OR block reason
- [ ] If blocked → Fix issues → re-submit

### Gate 2: Error Coverage
- [ ] `CONTRACT_DRAFT.md` ≥5 error cases
- [ ] Each error has: code, HTTP status, trigger, client action

### Gate 2.5: Phanbien Resolution (Conditional)
- [ ] (If applicable) `PHUC_MOC_JOINT_DESIGN.md` has "FINAL DECISION"
- [ ] Decision implemented in codebase

---

## 🎯 Success Criteria (Full Pipeline 2)

- [ ] All gates passed (1.5, 1.6, 1.6.5, 2, 2.5 if applicable)
- [ ] PEN-001 avoided (full context provided to Mộc)
- [ ] PEN-002 avoided (all tables have RLS + NOBYPASSRLS)
- [ ] WIN-001 applied (ARCHITECTURE_ABSTRACT.md created, <5K tokens for Xuân)
- [ ] LEDGER has no penalties (or penalties justified + learned from)

---

## 📚 Skill Reference Quick Links

| Skill | When | Output |
|-------|------|--------|
| [postgresql-rls-architecture](postgresql-rls-architecture/SKILL.md) | Designing schema | `schema.prisma` + migrations with RLS |
| [contract-draft-template](contract-draft-template/SKILL.md) | THESIS phase | `CONTRACT_DRAFT.md` (8 sections) |
| [multi-tenant-schema-design](multi-tenant-schema-design/SKILL.md) | Choosing patterns | Optimized schema with indexes |
| [arch-challenge-response](arch-challenge-response/SKILL.md) | Mộc challenges | `ARCH_RESPONSE.md` + Phanbien |
| [token-optimized-arch-docs](token-optimized-arch-docs/SKILL.md) | After full docs | `ARCHITECTURE_ABSTRACT.md` ~150L |

---

**Last Updated:** 2026-03-16
**Maintained by:** Nash Agent Framework
**For Questions:** See [PHUC_SA_SKILLS_SUMMARY.md](../../PHUC_SA_SKILLS_SUMMARY.md)
