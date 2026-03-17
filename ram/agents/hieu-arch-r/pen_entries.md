## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Repeat)

1. **Pattern incompatible with RLS multi-tenant** (2026-02-18, -30, BUG-745)
   - Recommended schema-per-tenant → violates STMAI RLS constraint
   - Fix: ALWAYS check RLS compatibility FIRST before recommending pattern
   - Multiplier: M1 (Missed bug) → -30 became -60 after production issue

2. **"Just use microservices" without trade-off** (2026-02-28, -30, BUG-771)
   - Recommended microservices for 3-table domain → over-engineering
   - Fix: MUST analyze: Team size, Deploy frequency, Domain complexity before microservices

### P1 HIGH (Learn From)

3. **Pattern recommendation without STMAI stack check** (2026-03-05, -20, BUG-803)
   - Suggested GraphQL federation → NestJS doesn't have native support
   - Fix: Verify pattern has NestJS/Prisma/Kafka implementation path

4. **No Oracle comparison** (2026-03-08, -20, BUG-815)
   - Researched event sourcing but didn't check Oracle SCM usage
   - Fix: ALWAYS check: "Does Oracle use this pattern?" (oracle-scm-backend reference)

5. **Incomplete trade-off analysis** (2026-03-10, -15, REV-227)
   - Listed pros only, no cons → Moc caught during review
   - Fix: Format MUST include ✅ Pros AND ❌ Cons

### P2 MEDIUM (Avoid)

6. **Pattern research without code example sketch** (2026-03-12, -10, REV-241)
   - Abstract description only → Phúc SA couldn't implement
   - Fix: Include TypeScript/Prisma pseudo-code sketch

7. **"Industry best practice" without source** (2026-02-22, -10, REV-198)
   - Claimed "everyone uses X" with no reference
   - Fix: MUST cite: GitHub repos, papers, Oracle docs, tech blogs

8. **Missed CAP theorem implication** (2026-02-25, -10, BUG-762)
   - Recommended strong consistency for geo-distributed → impossible
   - Fix: Check CAP trade-offs for distributed patterns

9. **Over-complex pattern for simple domain** (2026-03-01, -10, REV-214)
   - Suggested CQRS for CRUD-only module
   - Fix: Pattern complexity MUST match domain complexity (YAGNI principle)

10. **No migration path from current state** (2026-03-06, -10, REV-233)
    - Recommended Event Sourcing but no plan to migrate existing relational data
    - Fix: Include migration strategy if pattern requires major refactor

_Archived PEN (P3-P4): See artifacts/{task}/LEDGER.md_

---


## WIN (Top 5 Successes)

1. **CQRS + RLS compatibility research** (2026-02-12, +30, TASK-156)
   - Proved CQRS can work with PostgreSQL RLS (separate read models still use RLS policies)
   - Phúc SA adopted → saved 2 weeks architecture debate
   - Impact: Enabled event-driven design without abandoning multi-tenancy

2. **Saga pattern for distributed transactions** (2026-02-20, +25, TASK-178)
   - Researched orchestration vs choreography Saga for order processing
   - Recommended choreography (Kafka events) → fits STMAI event-driven stack
   - Code sketch included → Thục Dev implemented in 3 days

3. **Multi-tenant sharding strategy** (2026-02-28, +20, TASK-192)
   - Evaluated: RLS vs Schema-per-tenant vs DB-per-tenant
   - Conclusion: RLS + read replicas for large tenants (hybrid approach)
   - Trade-off matrix used by Phúc SA in architecture doc

4. **Event Sourcing feasibility study** (2026-03-02, +15, TASK-205)
   - Researched Event Sourcing for audit-heavy domain
   - Conclusion: NOT recommended (complexity > benefit for current team size)
   - Saved team from over-engineering → Dũng PM approved

5. **Geo-distributed cache strategy** (2026-03-09, +15, TASK-221)
   - Researched Redis cluster vs CDN edge caching for global users
   - Recommended: CDN for static, Redis single-region for session (latency acceptable)
   - Hưng DevOps implemented → 40% global latency reduction

_Full WIN history: See artifacts/{task}/LEDGER.md_

---
