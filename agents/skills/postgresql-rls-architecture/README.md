# PostgreSQL RLS Architecture Pattern

Multi-tenant PostgreSQL schema design with Row-Level Security (RLS) best practices.

## Purpose

Prevents **PEN-002 violations** by ensuring every multi-tenant table has:
- `tenant_id` column with RLS policy
- NOBYPASSRLS role for production connections
- Partial indexes for soft-delete queries

## For Phúc SA (Solution Architect)

Use this skill when:
- Designing `schema.prisma` in Pipeline 2
- Responding to Mộc's architecture challenges about database isolation
- Reviewing migration files for RLS correctness

## Quick Checklist

- [ ] Every table has `tenant_id TEXT NOT NULL`
- [ ] RLS enabled: `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY`
- [ ] Policy uses `current_setting('app.current_tenant_id')`
- [ ] Migration creates `app_user` role with NOBYPASSRLS
- [ ] Connection pool uses non-superuser role
- [ ] Soft delete with `deleted_at` column
- [ ] Partial index: `WHERE deleted_at IS NULL`

## Integration

- **Pipeline:** 02_ARCHITECTURE_AND_DB.md
- **Tools:** pg-aiguide MCP (`search_docs`, `view_skill`)
- **Gates:** 1.5 (Arch Challenge), 1.6 (Contract Draft)

## See Also

- [phuc-sa.md](../../core/phuc-sa.md) - Agent profile with PEN-002
- [SCORING_RULES.md](../../../system/SCORING_RULES.md) - P0 for RLS bypass
