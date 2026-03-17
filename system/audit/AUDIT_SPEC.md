# The 12-Dimensional Enterprise Technical Due Diligence (TDD) Audit

**Purpose:** Define codebase health across 12 dimensions before routing or refactoring.

**For detailed dimension checklists:** See `dimensions/` directory.

---

## 12 Dimensions Overview

| # | Dimension | Focus | Trigger | File |
|---|-----------|-------|---------|------|
| C1 | Business Strategy & Alignment | Roadmap, Monetization | Misalignment with KPI | [C1_business.md](dimensions/C1_business.md) |
| C2 | Docs & Triad Conflicts | SPEC, CONTEXT, ARCHITECTURE | Missing/conflicting docs | [C2_docs.md](dimensions/C2_docs.md) |
| C3 | IP & Licensing | OSS liability, Core IP | GPL/Copyleft usage | [C3_ip.md](dimensions/C3_ip.md) |
| C4 | Architecture & Scalability | Dependency, Coupling, Patterns | Spaghetti code | [C4_architecture.md](dimensions/C4_architecture.md) |
| C5 | Security (OWASP) | AuthN/AuthZ, RLS, Secrets | Missing RLS, hardcoded keys | [C5_security.md](dimensions/C5_security.md) |
| C6 | Tech Debt & Quality | Complexity, Duplication, Coverage | TODO/FIXME, low coverage | [C6_testing.md](dimensions/C6_testing.md) |
| C7 | Infra, DevOps & Ops | CI/CD, Env, Disaster Recovery | Missing pipeline | [C7_ops.md](dimensions/C7_ops.md) |
| C8 | Database Health | Schema, Migrations, N+1, Backups | Missing migrations | [C8_database.md](dimensions/C8_database.md) |
| C9 | Team & Org Capability | Bus Factor, Knowledge Transfer | Key person dependency | [C9_team.md](dimensions/C9_team.md) |
| C10 | Customer Care & SLA | Defect Rate, Incident Response | High bug rate | [C10_bugs.md](dimensions/C10_bugs.md) |
| C11 | Backend Deep State | Maturity Level, Contract Alignment | BE not matching contracts | [C11_backend.md](dimensions/C11_backend.md) |
| C12 | Frontend Deep State | UI/API Alignment, Error Handling | FE calling wrong endpoints | [C12_frontend.md](dimensions/C12_frontend.md) |

---

## Audit Execution Model (Parallel)

```
Tùng Diag (Orchestrate)
│
├─── [PARALLEL] ─────────────────────────────────────
│    │                    │                    │
│    ▼                    ▼                    ▼
│  Conan Req-Aud     Phúc SA + Mộc        Xuân + Huyền
│  C1, C2, C3       C4, C5, C6,          C11, C12
│  C9, C10          C7, C8
│    │                    │                    │
│    ▼                    ▼                    ▼
│  audit_business.md  audit_technical.md   audit_integration.md
│
└─── [AFTER ALL COMPLETE] ──────────────────────────
     │
     ▼
  merge_audit.sh (bash script)
     │
     ▼
  AUDIT_REPORT_FINAL.md → MoE Router input
```

---

## Standard Output Format

```markdown
### THE 12-DIMENSIONAL AUDIT RECORD

- **[C1] Business Alignment:** [OK / FAIL]
  - Evidence: Code hardcoded 50 user limit (conflicts with Q3 KPI)

- **[C2] Docs & Triad:** [PASS / CONFLICT]
  - Evidence: SPEC says PostgreSQL, CONTEXT says MongoDB

- **[C3] IP Liability:** [SAFE / RISKY]
  - Evidence: Library `xyz` uses GPL license

- **[C4] Architecture:** [CLEAN / SPAGHETTI]
  - Evidence: Controller calls DB directly (no repository layer)

- **[C5] Security:** [PASS / FAIL]
  - Evidence: Missing NOBYPASSRLS on tenants table (PEN-002)

- **[C6] Tech Debt:** [LOW / MEDIUM / HIGH]
  - Evidence: 45 TODO/FIXME, test coverage 32%

- **[C7] Ops:** [AUTOMATED / MANUAL]
  - Evidence: No CI/CD pipeline, manual deploy

- **[C8] Database:** [HEALTHY / DEGRADED]
  - Evidence: N+1 queries in orders controller

- **[C9] Team:** [RESILIENT / FRAGILE]
  - Evidence: Only 1 dev knows payment module (bus factor = 1)

- **[C10] Customer Care:** [STABLE / UNSTABLE]
  - Evidence: Defect rate 15% (target <5%)

- **[C11] Backend State:** [LEVEL 1-6]
  - Evidence: API returns 200 for all errors (not RESTful)

- **[C12] Frontend State:** [LEVEL 1-5]
  - Evidence: Missing .env config for backend URL

---
CONCLUSION FOR ROUTER:
=> [FATAL ERRORS] Missing RLS (C5), GPL liability (C3)
=> [CURRENT STATE] Early development / Technical debt high
```

---

## Output Location Convention

All audit outputs go into the **module being audited**, not the framework root:

```
modules/{path}/{module}/docs/
├── audit_business.md        ← Conan output
├── audit_technical.md       ← Phúc+Mộc output
├── audit_integration.md     ← Xuân+Huyền output
└── AUDIT_REPORT_FINAL.md   ← Router input (permanent)
```

**Merge Script:**
```bash
# Run after 3 sub-agents complete
bash scripts/merge_audit.sh ./modules/{path}/{module}/docs/
```

---

**For detailed checklists per dimension, see files in `dimensions/` directory.**
