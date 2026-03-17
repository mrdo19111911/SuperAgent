## Quick Ref (STMAI Architecture Rules)

### Schema Design (Multi-Tenant)
```prisma
model Entity {
  id         String   @id @default(uuid())
  tenant_id  String   // REQUIRED
  deleted_at DateTime? // REQUIRED (soft delete)

  @@index([tenant_id, deleted_at]) // Partial index for active records
}
```

### RLS Policy (NOBYPASSRLS)
```sql
-- CRITICAL: Use NON-superuser role with NOBYPASSRLS
CREATE ROLE app_user NOLOGIN NOBYPASSRLS;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON entities
  USING (tenant_id = current_setting('app.current_tenant_id', TRUE));
```

### API Envelope (STMAI Standard)
```typescript
{ success: boolean, data: T, meta: { ... } }
// NEVER return raw data
```

### CONTRACT_DRAFT.md (8 Sections)
1. API Contracts (Endpoints + DTOs + Status Codes)
2. Error Handling (Error codes + Fallbacks)
3. Events/Pub-Sub (Event schema if applicable)
4. Idempotency Rules (Retry/Dedup strategies)
5. Mock Specifications (Test doubles for dev)
6. Non-Functional Requirements (Performance + Security + A11y)
7. Acceptance Criteria (Testable assertions)
8. Sign-off (Thesis/Anti-Thesis/Synthesis approval)

### PostgreSQL Expert (pg-aiguide MCP)
**REQUIRED:** Use `search_docs` or `view_skill` before proposing RLS/schema/index strategies
- RLS policy design → `search_docs "row level security policy create"`
- Index strategy → `search_docs "partial index expression index"`
- Connection pooling → `search_docs "pgbouncer transaction pooling SET LOCAL"`

---

## Problem Decomposition (Strategist Core Skill)

### When to Decompose:
- Complex task >30 SP (Story Points) or scope unclear
- Cross-module dependencies (≥3 modules involved)
- Multiple tech stacks (full-stack: FE + BE + DB)
- Ambiguous requirements (need exploration phase)

### Decomposition Strategy (Top-Down):

```
1. Identify Boundaries
   ↓ Business domains → Modules (Auth, Catalog, Order, Payment)

2. Define Interfaces
   ↓ API contracts between modules (REST/GraphQL/gRPC)

3. Analyze Dependencies
   ↓ DAG (Directed Acyclic Graph) → detect cycles

4. Prioritize
   ↓ Critical path first (P0 > P1 > P2)

5. Estimate
   ↓ SP per module → track in plan.md
```

### STMAI Decomposition Pattern:

**Step 1: Domain Analysis (Business Logic Split)**
```
Large Problem: "Build multi-tenant eCommerce platform"
  ↓
Domains:
- Authentication (tenant isolation)
- Product Catalog (shared + tenant-specific)
- Order Management (tenant data isolation)
- Payment Gateway (idempotency + webhooks)
- Analytics (tenant dashboards)
```

**Step 2: Module Boundaries (Interface Design)**
```
Auth Module
  └─ Exports: /auth/login, /auth/verify, getTenantId()

Product Module
  └─ Depends on: Auth.getTenantId()
  └─ Exports: /products/*, ProductDTO

Order Module
  └─ Depends on: Auth.getTenantId(), Product.ProductDTO
  └─ Exports: /orders/*, OrderDTO

Payment Module
  └─ Depends on: Order.OrderDTO
  └─ Exports: /payments/*, PaymentDTO
```

**Step 3: Dependency DAG (Topological Order)**
```
Auth (Layer 0)
  ↓
Product (Layer 1)
  ↓
Order (Layer 2)
  ↓
Payment (Layer 3)

Analytics (Layer 1) ← depends only on Auth
```

**Step 4: Task Breakdown (plan.md format)**
```markdown
## Task Decomposition

### Layer 0: Foundation (Week 1-2)
- [ ] Task 1.1: Auth module (RLS setup) - 8 SP
- [ ] Task 1.2: Tenant middleware - 3 SP
- [ ] Task 1.3: Auth API contracts - 5 SP

### Layer 1: Core Modules (Week 3-4)
- [ ] Task 2.1: Product catalog (shared tables) - 13 SP
- [ ] Task 2.2: Analytics dashboard - 8 SP

### Layer 2: Business Logic (Week 5-6)
- [ ] Task 3.1: Order management - 13 SP
- [ ] Task 3.2: Order state machine - 8 SP

### Layer 3: Payment (Week 7-8)
- [ ] Task 4.1: Payment gateway integration - 13 SP
- [ ] Task 4.2: Webhook handlers (idempotency) - 8 SP
```

### Anti-Patterns (Avoid):

❌ **Monolithic breakdown:** "Frontend + Backend" (too broad)
✅ **Domain-driven:** "Auth + Product + Order" (clear boundaries)

❌ **Circular dependencies:** Order → Payment → Order
✅ **Acyclic DAG:** Auth → Product → Order → Payment

❌ **No estimation:** "Build eCommerce" (no SP)
✅ **Granular SP:** "Auth module: 8 SP, Product: 13 SP"

❌ **Tech-first split:** "Database + API + UI"
✅ **Domain-first:** "Auth domain (DB + API + UI together)"

### Decision Framework (When NOT to Decompose):

**Simple tasks (<10 SP):** Direct implementation, no breakdown needed
**Trivial fixes (<3 SP):** Single-file changes, no architecture needed
**Unclear scope:** Run exploration spike (2 SP) first, then decompose

### Output Artifacts:

1. **ARCHITECTURE.md** (Module boundaries + interfaces)
2. **schema.prisma** (DB module isolation)
3. **CONTRACT_DRAFT.md** (API contracts between modules)
4. **plan.md** (Task breakdown with SP + dependencies)

---

## Current Focus (Sprint 12)

- **STMAI multi-tenant architecture:** Finalize RLS performance optimization + partial index strategy
- **Pipeline 2 deliverables:** ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md (8 sections) + ARCHITECTURE_ABSTRACT.md (~150L)
- **Nash Triad w/ Mộc:** Prepare complete context (all artifacts + trace checklists) before calling Anti-Thesis

---
