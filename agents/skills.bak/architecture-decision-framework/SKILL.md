# Architecture Decision Framework

CTO-level decision-making for architectural choices with trade-off analysis.

---

## Core Principle

**"Simplicity is the ultimate sophistication."**
- Start simple
- Add complexity ONLY when proven necessary
- Removing complexity is MUCH harder than adding it

---

## Decision Tree: Choose Architecture Pattern

```
What's your MAIN concern?

┌─ Data Access Complexity?
│  ├─ HIGH (complex queries, testing) → Repository + Unit of Work
│  └─ LOW (simple CRUD) → ORM direct (Prisma, Drizzle)
│
├─ Business Rules Complexity?
│  ├─ HIGH (domain logic, rules vary) → Domain-Driven Design
│  └─ LOW (mostly CRUD) → Transaction Script
│
├─ Independent Scaling?
│  ├─ YES (different scaling per service)
│  │  REQUIRES ALL:
│  │    - Clear domain boundaries
│  │    - Team > 10 devs
│  │    - Different scaling needs
│  │  → Microservices (if ALL true) OR Modular Monolith (if ANY false)
│  └─ NO → Modular Monolith
│
└─ Real-time Requirements?
   ├─ HIGH (immediate updates, sync) → Event-Driven + Message Queue
   └─ LOW (eventual consistency OK) → Synchronous REST/GraphQL
```

---

## The 3 Questions (Before ANY Pattern)

1. **Problem Solved:** What SPECIFIC problem does this pattern solve?
2. **Simpler Alternative:** Is there a simpler solution?
3. **Deferred Complexity:** Can we add this LATER when needed?

---

## Anti-Patterns (Red Flags)

| Pattern | Anti-pattern | Simpler Alternative |
|---------|-------------|-------------------|
| Microservices | Premature splitting | Modular monolith → Extract later |
| Clean/Hexagonal | Over-abstraction | Concrete first → Interfaces later |
| Event Sourcing | Over-engineering | Append-only audit log |
| CQRS | Unnecessary complexity | Single model |
| Repository | YAGNI for CRUD | ORM direct access |

---

## ADR Template (Architecture Decision Record)

```markdown
# ADR-{number}: {Title}

**Date:** 2026-03-16
**Status:** Proposed | Accepted | Deprecated | Superseded
**Decision Maker:** {Name/Role}

## Context
{What problem are we solving? What constraints exist?}

## Decision
{What did we decide? Which pattern/approach?}

## Alternatives Considered
| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Option A | ... | ... | ... |
| Option B | ... | ... | ... |

## Consequences
**Positive:**
- Impact 1
- Impact 2

**Negative:**
- Trade-off 1
- Trade-off 2

**Risks:**
- Risk 1 (Mitigation: ...)
- Risk 2 (Mitigation: ...)

## Validation
- [ ] Simpler alternative considered?
- [ ] Team expertise matches choice?
- [ ] Can be deferred if unproven?
```

---

## Real-World Decision Examples

### Example 1: SaaS Multi-Tenant

**Context:** Building SaaS with 100+ tenants
**Decision:** Shared DB + RLS (NOT DB-per-tenant)
**Why:** Lower ops, proven pattern, easy scaling
**ADR:** See [postgresql-rls-architecture](../postgresql-rls-architecture/)

### Example 2: E-Commerce Checkout

**Context:** High-traffic checkout flow
**Decision:** Synchronous monolith (NOT microservices)
**Why:** ACID transactions critical, team small (5 devs)
**Future:** Extract payment service when >10M orders/month

### Example 3: Analytics Dashboard

**Context:** Real-time metrics (5-second lag OK)
**Decision:** Polling + caching (NOT WebSocket/SSE)
**Why:** Simpler, 5s lag acceptable, fewer connections
**Future:** WebSocket if <1s lag required

---

## Validation Checklist

Before finalizing:
- [ ] Requirements clearly understood
- [ ] Constraints identified
- [ ] Each decision has trade-off analysis
- [ ] Simpler alternatives considered
- [ ] ADR written for significant decisions
- [ ] Team expertise matches chosen patterns

---

## Recommended Reading Order

1. **Starting design** → Decision tree above
2. **Documenting choice** → ADR template
3. **Pattern comparison** → Anti-patterns table
4. **Reference** → Real-world examples
