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


## Current Focus (Sprint 12)

- **STMAI multi-tenant architecture:** Finalize RLS performance optimization + partial index strategy
- **Pipeline 2 deliverables:** ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md (8 sections) + ARCHITECTURE_ABSTRACT.md (~150L)
- **Nash Triad w/ Mộc:** Prepare complete context (all artifacts + trace checklists) before calling Anti-Thesis

---
