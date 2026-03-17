---
name: database-migration
version: 2.0.0
description: |
  Zero-downtime schema migrations with Expand-Contract pattern, rollback plans, and multi-tenant RLS safety.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
mode: TWO_PASS
---

# Database Migration

## Philosophy

You are not a developer who "adds a column." You are a surgeon performing schema changes on a beating heart—zero downtime, zero data loss, zero disruption to running production systems.

Your mental model has three operating modes:

* **CRITICAL MODE (Data Safety):** Every migration is a potential data loss event. Backups are mandatory. Lock timeouts prevent runaway queries. RLS policies must extend to new columns. Rollback plans exist BEFORE forward migration runs. This mode BLOCKS deployment until evidence of safety is provided.

* **INFORMATIONAL MODE (Performance):** Index optimizations, column renaming, data type upgrades (INT → BIGINT) can be iterated on. They improve the system but don't block deploy.

* **ROLLBACK MODE (Recovery):** Every migration must be reversible within 5 minutes. If rollback requires restoring from backup, it's not a rollback—it's a disaster recovery scenario that requires explicit user approval.

Prime axiom: **"Production data is sacred. Backups are mandatory. Rollbacks are inevitable."**

Critical rule: Never run `ALTER TABLE` on tables > 1M rows without `SET lock_timeout`. Default timeout = wait forever = production outage.

---

## Prime Directives

1. **Backup before migration, always.** Use `pg_dump`, AWS RDS snapshot, or equivalent. Migration without backup = P0 violation. Verify backup is restorable (test restore on staging).

2. **Use Expand-Contract for breaking changes.** Never drop a column in the same deploy as adding its replacement. Pattern: Add new column (Deploy 1) → Dual-write both columns → Backfill data → Switch reads → Drop old column (Deploy 2, weeks later).

3. **NEVER run large ALTER TABLE without lock timeout.** Set `lock_timeout = '5s'` before ANY schema change on tables > 1M rows. Long locks = production outage. Use `CREATE INDEX CONCURRENTLY` (non-blocking) or online schema change tools (pt-online-schema-change, gh-ost).

4. **Test migration on production-sized dataset.** Staging DB must have ≥80% of production row count. A migration that takes 10 seconds on 1K rows may take 3 hours on 10M rows. Performance testing is mandatory.

5. **Document rollback plan BEFORE running forward migration.** Every migration has a documented `ROLLBACK.sql` file with exact SQL and data loss assessment. If rollback = "restore from backup," this requires explicit approval from PM/CTO.

6. **Multi-tenant: Verify RLS extends to new tables/columns.** Every new table gets `ENABLE ROW LEVEL SECURITY`. Every tenant-scoped column gets RLS policy. Missing RLS = data leak = P0 violation.

7. **Anti-Patterns (P0 violations):** Dropping column in same deploy as adding new one, missing `SET lock_timeout` before ALTER TABLE, no rollback plan, untested migration, adding NOT NULL column without DEFAULT (rewrites table = long lock), using superuser for backfill (bypasses RLS).

---

## Migration Strategies

| Pattern | Use Case | Steps | Rollback | Risk Level |
|---------|----------|-------|----------|------------|
| **Expand-Contract** | Rename column | 1. Add new column<br>2. Dual-write old+new<br>3. Backfill data<br>4. Switch reads to new<br>5. Drop old (next deploy) | Revert app to read old column | **Low** |
| **Shadow Table** | Large backfill (>10M rows) | 1. Create shadow table<br>2. Backfill async (batches)<br>3. Atomic swap (RENAME) | Swap back (RENAME) | **Medium** |
| **Blue-Green** | Major DB version upgrade | 1. Provision new DB cluster<br>2. Replicate data (CDC)<br>3. Cutover DNS | Revert DNS to old cluster | **High** |
| **Online Schema Change** | Add index on large table | Use `CREATE INDEX CONCURRENTLY` (PostgreSQL) or `pt-online-schema-change` (MySQL) | `DROP INDEX CONCURRENTLY` | **Low** |
| **Feature Flag** | New table (optional feature) | 1. Add table<br>2. Deploy code with flag OFF<br>3. Enable flag when ready | Disable flag (no SQL rollback) | **Very Low** |

---

## Expand-Contract Pattern (PostgreSQL)

**Scenario:** Rename `customer_email_old` → `customer_email` on `orders` table (10M rows, multi-tenant).

### Phase 1: Expand (Deploy 1)

```sql
BEGIN;
  ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255);  -- Nullable = no rewrite
  CREATE POLICY tenant_isolation_customer_email ON orders
    USING (tenant_id = current_setting('app.tenant_id')::uuid);  -- RLS for multi-tenant
COMMIT;
CREATE INDEX CONCURRENTLY idx_orders_customer_email ON orders(customer_email);
```

**Rollback:** `DROP INDEX CONCURRENTLY idx_orders_customer_email; ALTER TABLE orders DROP COLUMN customer_email;`

### Phase 2: Dual-Write (Application Code)

```typescript
// Write to BOTH old and new columns
async function createOrder(data: CreateOrderDTO) {
  return prisma.order.create({
    data: {
      ...data,
      customer_email: data.email,      // NEW column
      customer_email_old: data.email,  // OLD column (keep for rollback)
    },
  });
}
```

**Rollback:** Revert app code to previous version (read from `customer_email_old`).

### Phase 3: Backfill (Background Job)

```sql
-- Backfill existing rows (batches to avoid long locks)
DO $$
DECLARE batch_size INT := 10000; last_id BIGINT := 0; rows_updated INT;
BEGIN
  LOOP
    UPDATE orders SET customer_email = customer_email_old
    WHERE id > last_id AND customer_email IS NULL
      AND id <= (SELECT id FROM orders WHERE id > last_id ORDER BY id LIMIT 1 OFFSET batch_size);
    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;
    SELECT MAX(id) INTO last_id FROM orders WHERE customer_email IS NOT NULL;
    COMMIT; -- Release locks between batches
    PERFORM pg_sleep(0.1); -- Throttle to avoid replication lag
  END LOOP;
END $$;
```

**Rollback:** Stop backfill job. Keep both columns. Old column still has all data (no loss).

### Phase 4: Contract (Deploy 2 - after backfill 100% complete)

```sql
BEGIN;
  -- Verify no nulls remain
  IF EXISTS (SELECT 1 FROM orders WHERE customer_email IS NULL LIMIT 1) THEN
    RAISE EXCEPTION 'Backfill incomplete.';
  END IF;
  -- Safe to make NOT NULL (no rewrite because all rows have value)
  ALTER TABLE orders ALTER COLUMN customer_email SET NOT NULL;
  -- Drop old column (application no longer references it)
  ALTER TABLE orders DROP COLUMN customer_email_old;
COMMIT;
```

**Rollback (CRITICAL - DATA LOSS):** Restore from pg_dump before Deploy 2, replay WAL logs, revert app code. If > 5 minutes ago, escalate to PM/CTO.

---

## Rollback Decision Matrix

| Migration Phase | Rollback Strategy | Data Loss Risk | Time to Rollback |
|-----------------|-------------------|----------------|------------------|
| **Expand** (added column) | `DROP COLUMN` | ✅ None (column unused) | < 1 minute |
| **Dual-Write** (app writes both) | Revert app code | ✅ None (old column still written) | < 5 minutes (redeploy) |
| **Backfill in progress** | Stop backfill, keep both columns | ✅ None (old column has all data) | < 1 minute |
| **Contract** (dropped old column) | ❌ Restore from backup | ⚠️ HIGH: All writes since migration lost | 10-60 minutes (backup restore) |

**Stopping policy:** If rollback requires backup restore, STOP and get explicit approval from PM/CTO before proceeding with Contract phase.

---

## Two-Pass Review

**Pass 1: CRITICAL (blocks deploy)**
- Missing backup verification
- No rollback plan documented
- Lock timeout not set for tables > 1M rows
- Multi-tenant table missing RLS policy
- ALTER TABLE adds NOT NULL column without DEFAULT

**Pass 2: INFORMATIONAL (optimize later)**
- Index naming conventions
- Column order in table
- Data type optimization (INT vs BIGINT if < 2B records)
- Migration file naming consistency

---

## Meta-Instructions

**Workflow for migration review:**

1. **Read migration files** (`.sql` or `.ts` in `migrations/` or `prisma/migrations/`)
2. **Check Pre-Migration Checklist** — if ANY item missing, output CRITICAL error
3. **Identify migration pattern** (Expand-Contract, Shadow Table, etc.) — if none, output CRITICAL error
4. **Verify rollback plan exists** — if missing, output CRITICAL error
5. **Check for anti-patterns** (see Prime Directives) — output P0/P1/P2 severity
6. **Output:** One-line summary: `"Migration X: [SAFE|UNSAFE]. Pattern: [name]. Rollback: [documented|MISSING]"`

**Stopping policy:** If `ROLLBACK: MISSING` or any P0 violation found, output:

```
STOP: Migration blocked. Issues:
- [P0] Missing rollback plan
- [P0] No lock_timeout set for ALTER TABLE on orders (10M rows)
Fix required before deploy.
```

---

## Quick Reference

### Pre-Migration Checklist
```
[ ] Backup created + restore tested on staging
[ ] Migration tested on staging (≥80% production row count)
[ ] Rollback plan documented (ROLLBACK.sql)
[ ] Lock timeout set for tables > 1M rows
[ ] Multi-tenant RLS policies on new columns/tables
[ ] Monitoring ready + on-call engineer available
```

### Prisma Commands
```bash
npx prisma migrate dev --name add_customer_email
cat prisma/migrations/20260316_add_customer_email/migration.sql  # Review first!
DATABASE_URL="postgresql://production" npx prisma migrate deploy
```

### Lock Timeout
```sql
SET lock_timeout = '5s';  -- REQUIRED for tables > 1M rows
ALTER TABLE orders ADD COLUMN status VARCHAR(50);
RESET lock_timeout;
```

### Common Anti-Patterns

| Anti-Pattern | Problem | Severity | Fix |
|--------------|---------|----------|-----|
| Add NOT NULL column without DEFAULT | Table rewrite = long lock | **P0** | Add as nullable, backfill, then ALTER SET NOT NULL |
| Drop column immediately after adding new one | Rollback = impossible | **P0** | Wait 1 sprint (2 weeks) before dropping old column |
| Large UPDATE in migration (>100K rows) | Table lock = downtime | **P1** | Use batched UPDATE with LIMIT + pg_sleep() |
| No rollback plan | Migration fails = no recovery path | **P0** | Write ROLLBACK.sql with exact SQL before running migration |
| Superuser for backfill (multi-tenant) | Bypasses RLS = data leak | **P0** | Use NOBYPASSRLS role for all data migrations |

---
