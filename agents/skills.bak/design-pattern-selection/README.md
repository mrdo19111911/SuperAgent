# Design Pattern Selection

Tactical design patterns with selection criteria and progression path.

## Purpose

Helps choose between Transaction Script, DDD, Repository, CQRS, Event Sourcing, and Clean Architecture based on actual needs.

## For Phúc SA

Use when:
- Designing service layer structure
- Deciding on Repository pattern necessity
- Evaluating DDD vs simple CRUD
- Planning Clean Architecture layers

## 5 Core Patterns

1. **Transaction Script** - Simple CRUD (90% of cases start here)
2. **Domain-Driven Design** - Complex business rules
3. **Repository** - Testable data access
4. **CQRS** - Read/write asymmetry
5. **Event Sourcing** - Audit trail critical

## Pattern Progression

Year 1 → Transaction Script
Year 2 → DDD Lite (if rules grow)
Year 3 → CQRS (if read/write differ)
Year 4 → Event Sourcing (rare!)

**Anti-Pattern:** Jumping to Year 4 on Day 1

## Key Principle

Start simple → Refactor to patterns ONLY when pain emerges

## See Also

- [Architecture Decision Framework](../architecture-decision-framework/) - Strategic patterns
- [Module Decomposition](../module-decomposition-strategy/) - Module structure
