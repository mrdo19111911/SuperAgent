# C4: Architecture & Scalability

**Focus:** Is the system well-designed and scalable?

## Checklist

- [ ] **Modularity:** Code organized into modules/layers?
- [ ] **Coupling:** Loose coupling between modules?
- [ ] **Scalability:** Can system handle 10x traffic?
- [ ] **Design Patterns:** Proper use of patterns (Repository, DTO, DI)?
- [ ] **Database Design:** Proper indexing, no N+1 queries?

## Red Flags

- Spaghetti code (tight coupling, no separation of concerns)
- Controller directly calls database (no repository layer)
- No caching strategy for hot paths
- Missing indexes on frequently queried columns

## Examples

**SPAGHETTI:** Controller calls DB directly, business logic in views
**CLEAN:** 3-layer architecture (Controller → Service → Repository), proper DI
