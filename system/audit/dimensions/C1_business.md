# C1: Business Strategy & Alignment

**Focus:** Does the codebase support business goals?

## Checklist

- [ ] **Roadmap Alignment:** Does code solve core business problem?
- [ ] **KPI Support:** Can architecture scale to meet KPI targets?
- [ ] **Monetization Model:** Does code support revenue model? (e.g., no hardcoded user limits if charging per-user)
- [ ] **Product Vision:** Code direction matches product roadmap?

## Red Flags

- Hardcoded limits that conflict with growth targets (e.g., max 100 users when target is 10K)
- Missing features critical to monetization (e.g., no billing integration)
- Architecture decisions that block business model (e.g., single-tenant when selling to enterprises)

## Examples

**FAIL:** Code hardcoded 50-user limit → conflicts with Q3 KPI (1000 users)
**PASS:** Multi-tenant architecture supports enterprise sales model
