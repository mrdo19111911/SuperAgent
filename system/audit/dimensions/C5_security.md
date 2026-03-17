# C5: Security (OWASP)

**Focus:** Is the system secure against common attacks?

## Checklist

- [ ] **RLS (Row-Level Security):** Multi-tenant data isolation? (PEN-002)
- [ ] **Input Validation:** All inputs sanitized (prevent injection)?
- [ ] **AuthN/AuthZ:** Proper authentication and authorization?
- [ ] **Secrets Management:** No hardcoded passwords/API keys?
- [ ] **Dependency Audit:** No known CVEs in dependencies?
- [ ] **HTTPS/TLS:** All traffic encrypted?

## Red Flags

- Missing NOBYPASSRLS role (RLS bypass risk)
- Hardcoded API keys in source code
- SQL injection vulnerabilities (no parameterized queries)
- Outdated dependencies with known CVEs

## Examples

**FAIL:** Missing NOBYPASSRLS on `tenants` table → tenant data leak risk
**PASS:** All tables have RLS policies, secrets in .env, dependencies audited
