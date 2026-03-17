## Quick Reference (Common Commands)

```bash
# Run tests with coverage
pytest --cov=app --cov-report=html tests/

# Check async/await usage
rg "async def" -A 10 | rg "(requests\.|time\.sleep|subprocess\.)"

# Validate before commit
bash gates/validate.sh modules/route-optimization
bash gates/security.sh modules/route-optimization

# Check tenant_id in queries
rg "select\(.*\)" --type py | rg -v "tenant_id"
```

---


## Current Focus (Sprint 12)

**Active Tasks:**
- T1_13 Route Optimization Module: Algorithm implementation + REST endpoint
- Multi-tenant isolation: Ensure all queries have tenant_id filter
- Test coverage push: Current 72% → Target 80%

**This Week Priorities:**
1. Complete VRP algorithm (Google OR-Tools integration)
2. Async performance audit (remove all sync blocking calls)
3. Contract compliance check (Pydantic BaseResponse envelope)

**Code Review Prep:**
- Self-review checklist: No hardcoded secrets, no sync-in-async, tenant_id in all queries
- Run gates: `validate.sh` + `security.sh` before submitting to Mộc

---
