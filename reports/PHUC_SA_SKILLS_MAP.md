# Phúc SA Skills Map — Visual Guide

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PHÚC SA — SOLUTION ARCHITECT                        │
│                  Pipeline 2: Architecture & DB (THESIS)                 │
└─────────────────────────────────────────────────────────────────────────┘

PEN Entries (Hard Constraints)                WIN Entries (Success Patterns)
┌──────────────────────────────┐              ┌──────────────────────────────┐
│ PEN-001: Incomplete Context  │              │ WIN-001: Token-Optimized     │
│ → MUST provide full artifacts│              │ → ARCHITECTURE_ABSTRACT.md   │
│   to Mộc (Skill 4)           │              │   ~150L saves 85% tokens     │
├──────────────────────────────┤              │   (Skill 5)                  │
│ PEN-002: Missing NOBYPASSRLS │              └──────────────────────────────┘
│ → ALL tables need RLS roles  │
│   (Skill 1)                  │
└──────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         5 SPECIALIZED SKILLS                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│ 1️⃣  PostgreSQL RLS       │  Prevents: PEN-002
│    Architecture Pattern  │  Depends: pg-aiguide MCP
├──────────────────────────┤
│ • RLS policy templates   │  When: Designing schema.prisma
│ • NOBYPASSRLS role setup │  Output: Migrations with RLS
│ • Connection pool config │  Gates: 1.5 (Mộc challenge)
│ • Migration safety       │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3️⃣  Multi-Tenant Schema  │  Depends: Skill 1
│    Design Patterns       │
├──────────────────────────┤
│ • Standard Entity        │  When: Choosing schema pattern
│ • Time-Series Partition  │  Output: Optimized schema.prisma
│ • Hierarchical Tenancy   │  Gates: 1.5, 1.6
│ • Shared Reference Data  │
│ • Soft Delete Cascade    │
│ • N+1 Prevention         │
└──────────────────────────┘

┌──────────────────────────┐
│ 2️⃣  CONTRACT_DRAFT       │  Gates: 1.6, 1.6.5, 2
│    8-Section Template    │
├──────────────────────────┤
│ 1. API Contracts         │  When: THESIS phase output
│ 2. Error Handling (≥5)   │  Output: docs/CONTRACT_DRAFT.md
│ 3. Events/Pub-Sub        │  Requirement: ≥30 lines, 8 sections
│ 4. Idempotency Rules     │
│ 5. Mock Specifications   │  Reviewers: Mộc (1.5), Xuân (1.6.5)
│ 6. Non-Functional Reqs   │
│ 7. Acceptance Criteria   │
│ 8. Sign-off (Nash Triad) │
└──────────────────────────┘

         │
         ▼ (Mộc challenges)

┌──────────────────────────┐
│ 4️⃣  Architecture         │  Prevents: PEN-001
│    Challenge Response    │  Implements: Nash Triad SYNTHESIS
├──────────────────────────┤
│ • ARCH_RESPONSE.md       │  When: Mộc publishes ARCH_CHALLENGE.md
│ • Decision Matrix        │  Output: Evidence-based decisions
│   - HIGH: Accept/Phanbien│  Gates: 1.5, 2.5
│   - MEDIUM: Justify      │
│   - LOW: Brief reason    │  Phanbien: PHUC_MOC_JOINT_DESIGN.md
│ • Phanbien Protocol      │  Judge: Dũng PM (FINAL DECISION)
└──────────────────────────┘

┌──────────────────────────┐
│ 5️⃣  Token-Optimized      │  Implements: WIN-001
│    Architecture Docs     │  Savings: 85%+ token reduction
├──────────────────────────┤
│ • Tables > Prose         │  When: After ARCHITECTURE.md complete
│ • Bullets > Sentences    │  Output: ARCHITECTURE_ABSTRACT.md ~150L
│ • File Refs > Code       │  Audience: Xuân (Gate 1.6.5), Dũng PM
│ • Acronyms + Glossary    │
│ • Aggressive Summary     │  Benefit: Fast gate review <5K tokens
└──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW: PIPELINE 2 (ARCHITECTURE)                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Read SPEC   │───▶│ Design      │───▶│ Create      │───▶│ Optimize    │
│ + PEN/WIN   │    │ Schema      │    │ Contract    │    │ for Review  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                          │                   │                   │
                     Use Skill 1           Use Skill 2       Use Skill 5
                     Use Skill 3           Use Skill 3
                          │                   │                   │
                          ▼                   ▼                   ▼
                   schema.prisma      CONTRACT_DRAFT.md  ARCHITECTURE_ABSTRACT.md
                   migrations/        (8 sections)       (~150 lines)

                                      ▼
                          ┌───────────────────────┐
                          │   ANTI-THESIS (Mộc)   │
                          │  ARCH_CHALLENGE.md    │
                          └───────────────────────┘
                                      │
                          Use Skill 4 │
                                      ▼
                          ┌───────────────────────┐
                          │  SYNTHESIS (Phúc SA)  │
                          │  ARCH_RESPONSE.md     │
                          │                       │
                          │  [If Phanbien]        │
                          │  PHUC_MOC_JOINT_      │
                          │  DESIGN.md            │
                          │  → Dũng PM decides    │
                          └───────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          GATE COVERAGE                                  │
└─────────────────────────────────────────────────────────────────────────┘

Gate 1.5: Architecture Challenge
├─ ARCH_CHALLENGE.md exists (Mộc)
├─ ARCH_RESPONSE.md exists (Phúc SA) ← Skill 4
└─ All HIGH issues addressed

Gate 1.6: Contract Draft
├─ CONTRACT_DRAFT.md ≥30 lines ← Skill 2
└─ Has API + Event boundary sections

Gate 1.6.5: Contract Review
├─ Xuân reads ARCHITECTURE_ABSTRACT.md first ← Skill 5
└─ Xuân sign-off in CONTRACT_REVIEW.md

Gate 2: Error Coverage
└─ CONTRACT_DRAFT.md ≥5 error cases ← Skill 2

Gate 2.5: Phanbien Resolution (Conditional)
└─ PHUC_MOC_JOINT_DESIGN.md has FINAL DECISION ← Skill 4

┌─────────────────────────────────────────────────────────────────────────┐
│                       SUCCESS METRICS (EXPECTED)                        │
└─────────────────────────────────────────────────────────────────────────┘

Before Skills          After Skills         Improvement
─────────────────────────────────────────────────────────────
Gate 1.6 Pass: 70%  →  95%+               +25% (Skill 2 template)
PEN-002 Violations: 1-2/sprint → 0        100% reduction (Skill 1)
Token @ Gate 1.6.5: 15K+ → <5K            67% reduction (Skill 5)
Challenge Resolution: Avg 3 days → 2 days 30% faster (Skill 4)

┌─────────────────────────────────────────────────────────────────────────┐
│                         SKILL DEPENDENCIES                              │
└─────────────────────────────────────────────────────────────────────────┘

pg-aiguide MCP (External)
  │
  └─▶ Skill 1: PostgreSQL RLS Architecture
        │
        └─▶ Skill 3: Multi-Tenant Schema Design
              │
              └─▶ (Used by Phúc SA + Mộc for challenges)

Skill 2: CONTRACT_DRAFT (standalone)
Skill 4: Arch Challenge Response (standalone)
Skill 5: Token-Optimized Docs (standalone)

┌─────────────────────────────────────────────────────────────────────────┐
│                       REGISTRY STATUS                                   │
└─────────────────────────────────────────────────────────────────────────┘

Total Skills in Registry: 7
├─ code-review-excellence (active)
├─ deployment-excellence (draft)
├─ postgresql-rls-architecture (active) ⭐ NEW
├─ contract-draft-template (active) ⭐ NEW
├─ multi-tenant-schema-design (active) ⭐ NEW
├─ arch-challenge-response (active) ⭐ NEW
└─ token-optimized-arch-docs (active) ⭐ NEW

Used By:
├─ phuc-sa: 7 skills
├─ moc-arch-chal: 3 skills (1, 3, 4)
├─ xuan-spec-rev: 3 skills (2, 5, code-review-excellence)
├─ dung-manager: 2 skills (4, 5)
└─ son-qa: 1 skill (code-review-excellence)

┌─────────────────────────────────────────────────────────────────────────┐
│                         QUICK REFERENCE                                 │
└─────────────────────────────────────────────────────────────────────────┘

Designing Schema?           → Skill 1 (RLS) + Skill 3 (Patterns)
Creating Contract?          → Skill 2 (8-Section Template)
Mộc Challenged You?         → Skill 4 (Response Protocol)
Preparing for Gate Review?  → Skill 5 (ARCHITECTURE_ABSTRACT)
Forgot PEN Entry?           → Check phuc-sa.md § PEN section

All skills: agents/skills/{skill-id}/SKILL.md
Registry: agents/skills/_registry.json
Profile: agents/core/phuc-sa.md
Summary: PHUC_SA_SKILLS_SUMMARY.md (this file's sibling)
```

---

**Status:** ✅ ALL SKILLS OPERATIONAL — Ready for Pipeline 2 execution.

**Next Action:** Test skills in real Pipeline 2 run → Collect WIN entries → Share patterns with team.
