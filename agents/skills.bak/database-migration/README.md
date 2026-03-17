# Database Migration

**Version:** 2.0.0 | **Category:** Database | **Mode:** TWO_PASS

## Description

Zero-downtime schema migrations with Expand-Contract pattern, rollback plans, and multi-tenant RLS safety. Prevents production outages from unsafe ALTER TABLE operations.

## Purpose

Helps backend teams safely evolve database schemas without breaking production systems. Critical for multi-tenant SaaS applications where downtime = revenue loss.

## Target Agents

- **Phuc SA** (PRIMARY) - Architecture reviews of migration plans
- **Thuc** - TypeScript/Node.js backend (Prisma migrations)
- **Tuan** - Go backend (raw SQL migrations)
- **Huyen-Py** - Python backend (Alembic migrations)
- **Hoang** - .NET backend (Entity Framework migrations)

## Core Patterns

### 4-Phase Expand-Contract Pattern
1. **Expand**: Add new column (nullable, no DEFAULT)
2. **Dual-Write**: Application writes to both old and new columns
3. **Backfill**: Background job migrates existing data in batches
4. **Contract**: Enforce constraints, drop old column (weeks later)

### Migration Strategies
- **Expand-Contract**: Column renames, type changes (low risk)
- **Shadow Table**: Large backfills >10M rows (medium risk)
- **Blue-Green**: Database version upgrades (high risk)
- **Online Schema Change**: Non-blocking index creation (low risk)

## Prime Directives (P0 Violations)

1. **Backup before migration** - No backup = P0
2. **Lock timeout on large tables** - Missing `SET lock_timeout` = P0
3. **Rollback plan documented** - No rollback SQL = P0
4. **Multi-tenant RLS safety** - New table without RLS policy = P0
5. **No NOT NULL without DEFAULT** - Causes table rewrite = P0
6. **Test on staging first** - Production-sized dataset required
7. **No superuser for backfill** - Bypasses RLS = data leak = P0

## Integration

- **Prisma**: `npx prisma migrate deploy` (auto-generates SQL)
- **TypeORM**: `npm run typeorm migration:run` (TypeScript-based)
- **Alembic**: `alembic upgrade head` (Python)
- **Entity Framework**: `dotnet ef database update` (.NET)
- **CI/CD**: Migrate BEFORE app deployment, verify with `npx prisma migrate status`

## Key Files

- **SKILL.md**: 512-line comprehensive guide with SQL examples
- **Pre-Migration Checklist**: 8-item safety checklist (backup, staging test, rollback plan, etc.)
- **Rollback Decision Matrix**: 4 phases with data loss assessment
- **Real Production Disaster**: Concrete example (3-hour outage, $150K loss)

## Two-Pass Review

**Pass 1 (CRITICAL - blocks deploy):**
- Missing backup verification
- No rollback plan documented
- Lock timeout not set for tables > 1M rows
- Multi-tenant table missing RLS policy

**Pass 2 (INFORMATIONAL - optimize later):**
- Index naming conventions
- Batch size tuning for backfill
- Data type optimization (INT vs BIGINT)

## Dependencies

- **postgresql-rls-architecture**: Multi-tenant RLS policy patterns

## Examples

```sql
-- WRONG (P0 violation: table rewrite = 3-hour lock on 10M rows)
ALTER TABLE products ADD COLUMN inventory_count INT NOT NULL DEFAULT 0;

-- CORRECT (Expand-Contract: < 1 second)
ALTER TABLE products ADD COLUMN inventory_count INT; -- Phase 1: Expand
-- (Background job backfills data in batches)
ALTER TABLE products ALTER COLUMN inventory_count SET NOT NULL; -- Phase 4: Contract
```

## When to Use

- Adding/renaming/dropping database columns
- Changing column types (e.g., VARCHAR(50) → VARCHAR(255))
- Adding indexes to large tables (>1M rows)
- Backfilling data for new columns
- Multi-tenant schema changes (RLS-aware)

## Meta-Instructions

**Review workflow:**
1. Read migration files (`.sql` or `.ts`)
2. Check Pre-Migration Checklist (8 items)
3. Identify migration pattern (Expand-Contract, Shadow Table, etc.)
4. Verify rollback plan exists with exact SQL
5. Output: "Migration X: [SAFE|UNSAFE]. Pattern: [name]. Rollback: [documented|MISSING]"

**Stopping policy:** If rollback = "restore from backup," STOP and escalate to PM/CTO.
