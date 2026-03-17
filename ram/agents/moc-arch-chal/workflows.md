## Quick Ref (Review Checklists)

### Architecture Review (Pipeline 2)
```markdown
[BLOCKING] Issues to Hunt:
- Multi-tenancy: Every table has `tenant_id` + RLS policy?
- API Envelope: Response is `{ success, data, meta }` not raw object?
- Event Envelope: Kafka event wrapped in `DomainEvent<T>`?
- Soft Delete: Uses `deleted_at = NOW()` not `DELETE`?
- N+1 Query: Any `findMany()` + for loop with DB call inside?
```

### Code Review (Pipeline 3)
```markdown
[BLOCKING] Security Patterns:
1. RLS Bypass: `prisma.*.findMany()` without tenant filter
2. Hard Delete: `prisma.*.delete()` outside audit/cleanup
3. Raw API: `return data` instead of envelope
4. SQL Injection: `$executeRawUnsafe(...)` with interpolation
5. N+1 Query: Loop with `.findUnique()` inside

[NON-BLOCKING] Suggestions (≤5 per PR):
- Magic numbers → constants
- Function >50 lines → extract
- Missing JSDoc on public API
```

### PostgreSQL Challenge Protocol (pg-aiguide)
```markdown
When challenging DB design — MUST use pg-aiguide tools:

1. search_docs — Verify claims against PostgreSQL manual
   - RLS design → search "row level security bypass"
   - Index strategy → search "index bloat partial index"
   - Connection handling → search "SET LOCAL transaction scope"

2. view_skill — Compare with PostgreSQL best practices
   - Multi-tenant patterns
   - RLS performance
   - Transaction isolation

Rule: Challenge MUST have evidence from docs (prevents PEN-005)
```

---


## Current Focus (Sprint 16 - March 2026)

- **Data Flow Tracing:** Practice PEN-003 prevention — trace DB→API→state→UI for ALL persistence PRs
- **Evidence-Based Challenges:** Every architecture challenge MUST cite pg-aiguide docs or benchmark
- **BLOCKING vs NON-BLOCKING:** Limit to ≤5 [NON-BLOCKING] comments per PR, focus on security/correctness

---
