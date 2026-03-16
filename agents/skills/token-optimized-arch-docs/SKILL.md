# Token-Optimized Architecture Docs

Create ARCHITECTURE_ABSTRACT.md (~150 lines) from full ARCHITECTURE.md.

**Goal:** 85%+ token reduction for gate reviewers.

---

## 5 Compression Techniques

### 1. Tables > Prose (60% reduction)

**❌ Before (84 tokens):**
> The system uses PostgreSQL Row-Level Security policies to enforce multi-tenant isolation. Each table includes a tenant_id column that is used in RLS policies to filter queries...

**✅ After (32 tokens):**
```markdown
| Approach | Decision |
|----------|----------|
| DB-per-tenant | ❌ High ops |
| RLS + tenant_id | ✅ Shared infra |
```

---

### 2. Bullets > Sentences (61% reduction)

**❌ Before (72 tokens):**
> The API layer is responsible for handling HTTP requests. It performs JWT authentication and validates the token. It also enforces rate limiting using Redis.

**✅ After (28 tokens):**
```markdown
**API Layer:**
- JWT auth + validation
- Rate limiting (Redis)
- Routes to service layer
```

---

### 3. File References > Code Snippets (85% reduction)

**❌ Before (150 tokens):**
```typescript
// RLS policy
CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.current_tenant_id')::TEXT);

// Connection setup
const pool = new Pool({ user: 'app_user' });
```

**✅ After (22 tokens):**
```markdown
RLS: [migrations/001_rls.sql](../migrations/001_rls.sql)
Pool: [db.ts:12-18](../src/db.ts#L12-L18)
```

---

### 4. Acronyms + Glossary

**First use:** "Row-Level Security (RLS)"
**Subsequent:** "RLS" only

```markdown
## Glossary
- **RLS:** Row-Level Security
- **NFR:** Non-Functional Requirement
```

---

### 5. Aggressive Summarization

**Full doc → Abstract:**
- System overview: 1 paragraph
- Module boundaries: Bullets
- Key decisions: Table
- Critical constraints: Numbered list
- Pointers: "See [ARCHITECTURE.md § X]"

---

## ARCHITECTURE_ABSTRACT.md Template

```markdown
# Architecture Abstract: {Module}

**Full Spec:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Overview (1 paragraph)

{Module} implements {purpose} using {tech}. Multi-tenant via RLS. Async via Kafka. Deploy: Cloud Run.

---

## Modules

- **API** (`src/api/`) — REST, JWT, rate limit
- **Services** (`src/services/`) — Logic, Prisma
- **Events** (`src/events/`) — Kafka producers/consumers
- **DB** — PostgreSQL 15 + RLS

---

## Key Decisions

| Decision | Choice | Alternative | Reason |
|----------|--------|-------------|--------|
| Multi-Tenancy | RLS | DB-per-tenant | Lower ops |
| Soft Delete | deleted_at | Hard delete | Audit |
| Idempotency | Header key | No dedup | Kafka at-least-once |

**Details:** [ARCHITECTURE.md § Decisions](./ARCHITECTURE.md#decisions)

---

## Critical Constraints

1. RLS on ALL tables (see [RLS skill](../postgresql-rls-architecture/))
2. API envelope: `{ success, data, meta }`
3. NO DELETE, only `UPDATE deleted_at`
4. p95 < 200ms

---

## Schema Highlights

| Table | Rows/Tenant | Partition |
|-------|-------------|-----------|
| projects | 10K | None |
| audit_logs | 10M+ | Monthly |

**Full:** [schema.prisma](../schema.prisma)
```

**Limit:** 150 lines max

---

## Checklist

- [ ] Abstract ≤150 lines
- [ ] Tables for structured data
- [ ] Bullets for lists
- [ ] File refs (not code blocks)
- [ ] Glossary for acronyms
- [ ] Pointers to full doc
