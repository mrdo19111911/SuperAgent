# Multi-Tenant Schema Design Pattern Catalog

Comprehensive patterns for multi-tenant SaaS database schemas with Prisma + PostgreSQL.

## Purpose

Provides reusable schema patterns for common multi-tenant scenarios:
- Standard entities (Projects, Users)
- High-volume time-series (Audit logs, Events)
- Hierarchical tenancy (Org → Team → Channel)
- Shared reference data (Countries, Currencies)
- Soft delete with cascade

## For Phúc SA (Solution Architect)

Use this skill when:
- Designing `schema.prisma` for new modules
- Choosing indexing strategy for performance
- Deciding partition strategy for high-volume tables
- Responding to Mộc's N+1 query challenges

## 5 Core Patterns

1. **Standard Entity** - Low-medium volume (< 10M rows/tenant)
2. **Time-Series Partitioned** - High volume (> 100M rows/tenant)
3. **Hierarchical Multi-Tenancy** - Nested isolation (Org → Team)
4. **Shared Reference Data** - Global lookup tables (no RLS)
5. **Soft Delete Cascade** - Application-level cascade logic

## Quick Rules

- **Every table:** `tenant_id` + `deleted_at`
- **Every table:** Index on `(tenant_id, deleted_at)`
- **Unique constraints:** Scoped to tenant + active records
- **N+1 Prevention:** Use Prisma `include` for relations
- **JSONB:** Add GIN index if searching metadata

## Integration

- **Dependencies:** [postgresql-rls-architecture](../postgresql-rls-architecture/)
- **Pipeline:** 02_ARCHITECTURE_AND_DB.md
- **Gates:** 1.5 (Mộc challenge), 1.6 (Contract draft)

## See Also

- [phuc-sa.md](../../core/phuc-sa.md) - PEN-002 (RLS)
- [PostgreSQL RLS Architecture](../postgresql-rls-architecture/SKILL.md)
