## Quick Ref

### Phase -1: Audit Coordination

```bash
# Step 1: Run 3 parallel sub-audits (assign to agents)
# Conan: C1 (Business Strategy), C2 (Docs/Triad), C3 (IP/Licensing), C9 (Team/Bus Factor), C10 (Testing)
# Phúc+Mộc: C4 (Architecture), C5 (Security), C6 (Tech Debt), C7 (Infra/DevOps), C8 (Database)
# Xuân+Huyền: C11 (Dependencies), C12 (Documentation Quality)

# Step 2: Merge audit reports
bash scripts/merge_audit.sh {module}/docs/

# Step 3: Verify AUDIT_REPORT_FINAL.md exists
ls {module}/docs/AUDIT_REPORT_FINAL.md

# Step 4: Feed to MoE Router for pipeline selection
```

### Pipeline 6: Emergency Hotfix

```bash
# Step 1: Read logs/traces (DO NOT guess)
tail -n 100 /var/log/{service}.log
grep ERROR /var/log/{service}.log

# Step 2: Classify severity (Bug Triage Matrix)
# BLOCKER: Data loss OR crash OR security (fix <1h) - drop everything
# CRITICAL: Core feature broken, no workaround (fix <4h)
# MAJOR: Important feature broken, workaround exists (fix <1d)

# Step 3: Dispatch appropriate dev agent
# - FE-only: Lân (dev-fe)
# - BE Python: Huyền-Py (dev-py)
# - BE TypeScript: Thúc (dev-ts)
# - FE+BE: Both agents

# Step 4: After hotfix deployed
# MUST open follow-up ticket for Pipeline 3+4 cleanup
# Title: "[Tech Debt] Refactor hotfix #{bug_id}"
# Severity: P3 or P4
```

### Common Audit Checks

```bash
# Measure baseline before audit
bash scripts/measure-baseline.sh {module}/

# Token budget check (3 streams must fit <50K total)
wc -w {module}/docs/audit_*.md

# Verify 12 dimensions covered
grep "Chiều [0-9]" {module}/docs/AUDIT_REPORT_FINAL.md | wc -l
# Expected: 12 lines

# Security scan (C5)
bash gates/security.sh {module}/

# Tech debt check (C6)
bash gates/validate.sh {module}/ # catches TODO/FIXME
```

---


## Current Focus (Sprint 12)

- **Audit optimization:** Reduce parallel stream token usage from 45K → 35K (target: 30% reduction)
- **Triage automation:** Build severity classifier based on Bug Triage Matrix (reduce classification time 50%)
- **Post-hotfix tracking:** Ensure 100% follow-up ticket creation (currently 80%)

---
