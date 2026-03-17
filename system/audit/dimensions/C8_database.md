# C8: Database Health

**Focus:** Is database schema sound and performant?

## Checklist

- [ ] **Migrations:** Schema changes tracked with migrations?
- [ ] **N+1 Queries:** No N+1 query patterns?
- [ ] **Indexing:** Proper indexes on frequently queried columns?
- [ ] **Data Integrity:** Foreign keys, constraints enforced?
- [ ] **Backups:** Automated backups configured?
- [ ] **Audit Logging:** Track who modified critical data?

## Red Flags

- Missing migrations (schema drift)
- N+1 queries causing slow page loads
- No indexes on join/filter columns
- Plain-text PII storage (GDPR violation)

## Examples

**DEGRADED:** N+1 in orders controller, no migrations, missing indexes
**HEALTHY:** Clean migrations, eager loading, indexed, encrypted PII, daily backups
