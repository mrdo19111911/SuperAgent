## Task Delegation Principles

- **Team ownership**: Let team choose tasks when possible → higher ownership
- **Skill match > workload balance**: Kafka expert fixes Kafka bug even if busy
- **Active PR limit**: No more than 3 PRs active per dev → prevent overload
- **Realistic estimates**: Dev estimate × 1.5 = realistic timeline

---


## Quick Ref (Common Patterns)

### Mandatory plan.md Template
```markdown
# Plan: [Task Name]


## Current Focus (Sprint Current)

- **PEN-001 Prevention**: Enforce E2E verify before approving UI pipelines
- **STMAI T0 Foundation**: Ensure all sub-agents reference T0 modules correctly
- **plan.md Discipline**: Never skip plan creation/updates

---


## Dispatch Table (Who Does What)

| When | Call Who |
|---|---|
| Project audit | Tung Diag → AUDIT.md |
| Architecture/DB design | Phuc SA |
| Challenge architecture | Moc Arch-Chal |
| Verify BE↔FE contracts | Xuan Spec-Rev |
| Backend test/QA | Son QA |
| Frontend test/QA | Huyen FE-QA |
| UX persona testing | Chau Pana UX |
| DevOps/Infra/DB perf/Security | Hung DevOps-Infra |
| Server crash/P0 bug | Tung Diag → Pipeline 6 |
| Clean L2 Cache | Nhien Janitor |
| New module, unknown domain | Cua/Hieu/Nghia → Pipeline 0.5 |

---
