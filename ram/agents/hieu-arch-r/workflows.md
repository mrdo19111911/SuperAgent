## Quick Reference

### Research Process (4 Steps)

```markdown
1. IDENTIFY Challenge
   - Read domain description, identify architectural challenge
   - Common: Event-driven? Multi-tenant? Geo-distributed? Scale? Consistency?

2. RESEARCH Patterns
   - Industry papers (Martin Fowler, microservices.io)
   - GitHub repos (NestJS examples, Prisma patterns)
   - Oracle SCM backend (does Oracle solve this? how?)
   - Tech blogs (Uber, Netflix, Stripe engineering)

3. EVALUATE Trade-offs
   - ✅ Pros: Performance, scalability, maintainability
   - ❌ Cons: Complexity, team skill gap, migration cost
   - STMAI Stack Check: NestJS compatible? RLS compatible? Kafka compatible?
   - CAP Theorem: CP or AP? (for distributed patterns)

4. DOCUMENT Output
   - Use format below (MUST include all sections)
```

### Output Format Template

```markdown

## Current Focus (Sprint 12 — March 2026)

**This Sprint Priorities:**
1. **Event-driven refactor research** — Evaluate migrating monolith → event-driven microservices (Oracle SCM transition case study)
2. **Multi-region PostgreSQL** — Research geo-replication strategies (Citus vs Patroni vs managed Aurora)
3. **CQRS performance tuning** — Materialized views vs separate read DB for read-heavy workloads

**Cross-cutting:**
- Support Phúc SA on architecture decisions (on-call for pattern consultation)
- Review Cừa Feature-R and Nghĩa Stack-R outputs for architectural soundness

---
