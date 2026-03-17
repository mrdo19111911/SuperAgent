# Multi-Tenant Schema Patterns

5 patterns for multi-tenant database schemas. (RLS setup → see [postgresql-rls-architecture](../postgresql-rls-architecture/))

---

## Pattern Selection

| Pattern | Volume | Use Case |
|---------|--------|----------|
| **Standard Entity** | <10M rows/tenant | Projects, Users, Settings |
| **Time-Series Partitioned** | >100M rows/tenant | Audit logs, Events |
| **Hierarchical** | Nested levels | Org → Team → Channel |
| **Shared Reference** | Static lookup | Countries, Currencies |
| **Soft Delete Cascade** | Parent-child | Project → Tasks |

---

## 1. Standard Entity

```prisma
model Project {
  id          String   @id @default(cuid())
  tenant_id   String
  name        String
  metadata    Json?
  owner_id    String
  deleted_at  DateTime?

  owner User @relation(fields: [owner_id], references: [id])
  tasks Task[]

  @@index([tenant_id])
  @@index([tenant_id, deleted_at])
  @@index([tenant_id, owner_id])
  @@unique([tenant_id, name], where: { deleted_at: null })
}
```

**Indexes:**
- `(tenant_id)` — All queries
- `(tenant_id, deleted_at)` — Active records
- `(tenant_id, owner_id)` — Owner-scoped queries
- Unique: scoped to tenant + active only

---

## 2. Time-Series Partitioned

```sql
-- Parent (partition by tenant + month)
CREATE TABLE audit_logs (
  id         BIGSERIAL,
  tenant_id  TEXT NOT NULL,
  action     TEXT NOT NULL,
  metadata   JSONB,
  timestamp  TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY LIST (tenant_id);

-- Per-tenant partition
CREATE TABLE audit_logs_tenant_abc
  PARTITION OF audit_logs
  FOR VALUES IN ('tenant_abc')
  PARTITION BY RANGE (timestamp);

-- Monthly partition
CREATE TABLE audit_logs_tenant_abc_2026_03
  PARTITION OF audit_logs_tenant_abc
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**Why:** Prune partitions by tenant + time, drop old data instantly.

---

## 3. Hierarchical (Denormalized Tenant ID)

```prisma
model Organization {
  id    String @id
  name  String
  teams Team[]
}

model Team {
  id         String @id
  org_id     String
  name       String
  channels   Channel[]

  @@index([org_id])
  @@unique([org_id, name], where: { deleted_at: null })
}

model Channel {
  id       String @id
  org_id   String  // Denormalized for RLS (no JOIN)
  team_id  String

  @@index([org_id])
  @@index([team_id])
}
```

**Why denormalize org_id:** Filter channels by org without JOIN.

---

## 4. Shared Reference Data

```prisma
model Country {
  id    String @id  // "US", "VN"
  name  String
  // NO tenant_id, NO deleted_at
}

model Project {
  id          String @id
  tenant_id   String
  country_id  String

  country Country @relation(fields: [country_id], references: [id])

  @@index([tenant_id])
}
```

**Migration:** NO RLS on reference tables (global read-only).

---

## 5. Soft Delete Cascade (Application Logic)

```typescript
async function deleteProject(projectId: string, tenantId: string) {
  const now = new Date();

  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId, tenant_id: tenantId },
      data: { deleted_at: now }
    }),
    prisma.task.updateMany({
      where: { project_id: projectId, tenant_id: tenantId },
      data: { deleted_at: now }
    })
  ]);
}
```

**Why application logic:** Explicit, testable, works with Prisma.

---

## Index Strategy

| Query | Index |
|-------|-------|
| `WHERE tenant_id = ?` | `(tenant_id)` |
| `WHERE tenant_id = ? AND deleted_at IS NULL` | `(tenant_id, deleted_at)` |
| `WHERE tenant_id = ? AND owner_id = ?` | `(tenant_id, owner_id)` |
| `WHERE tenant_id = ? ORDER BY created_at` | `(tenant_id, created_at DESC)` |
| `WHERE metadata->>'status' = ?` | `GIN (metadata)` |

**Rule:** Max 3-4 indexes/table (write performance cost).

---

## N+1 Prevention

**❌ Bad:**
```typescript
const projects = await prisma.project.findMany({ where: { tenant_id } });
for (const p of projects) {
  const owner = await prisma.user.findUnique({ where: { id: p.owner_id } });
}
```

**✅ Good:**
```typescript
const projects = await prisma.project.findMany({
  where: { tenant_id },
  include: { owner: true }  // Single query
});
```

---

## GDPR Hard Delete

```prisma
model DeletionQueue {
  id           String   @id
  tenant_id    String
  user_id      String
  delete_after DateTime  // 30 days from request

  @@index([delete_after])
}
```

```typescript
// Cron: daily
const pending = await prisma.deletionQueue.findMany({
  where: { delete_after: { lte: new Date() } }
});

for (const item of pending) {
  await prisma.user.delete({ where: { id: item.user_id } });
}
```

---

## Checklist

- [ ] All tables: `tenant_id` + `deleted_at`
- [ ] Indexes: `(tenant_id)` + `(tenant_id, deleted_at)`
- [ ] Unique constraints scoped to tenant + active
- [ ] Partitioning for >10M rows
- [ ] No N+1 (use `include`)
- [ ] GDPR queue for hard deletes
