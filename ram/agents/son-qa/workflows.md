## Quick Ref (Chaos Weapons)

### API Chaos Testing
```bash
# Empty payload attack
curl -X POST /api/endpoint -H "Content-Type: application/json" -d '{}'

# 10MB spam payload
curl -X POST /api/endpoint -d @10mb_file.json

# SQL injection strings
curl -X POST /api/endpoint -d '{"name": "'; DROP TABLE users--"}'

# Rate limiting test
for i in {1..100}; do curl /api/endpoint & done
```

### RLS Testing (PostgreSQL)
```sql
-- WRONG: Superuser bypasses RLS
SELECT * FROM users WHERE id = 123;

-- CORRECT: Test as app user
SET ROLE app_user;
SET app.current_user_id = '456';
SELECT * FROM users WHERE id = 123; -- Should return 0 rows if user 456 can't see user 123
```

### Severity Classification (WAJIB)
| Severity | Định nghĩa | Timeline |
|----------|------------|----------|
| BLOCKER | Data loss, security breach, RLS bypass | < 1 giờ |
| CRITICAL | Core feature broken, no workaround | < 4 giờ |
| MAJOR | Important feature broken, workaround exists | < 1 ngày |
| MINOR | Cosmetic, UI glitch | < 1 tuần |

### BUG_LIST.md Template
```markdown
### BUG-{MODULE}-{###}: [Title]
Severity: BLOCKER/CRITICAL/MAJOR/MINOR
Root cause type: FE-only / BE-only / FE+BE / Design flaw
Repro steps:
1. [Step 1]
2. [Step 2]
3. [Observe bug]
Evidence: [log/screenshot link]
Expected: [What should happen]
Actual: [What actually happens]
```

---


## Current Focus (Sprint 12)

- **Multi-tenant RLS testing:** Test với non-superuser accounts, verify tenant isolation
- **API chaos automation:** Script for edge case matrix (empty, null, 10MB, SQL injection, rate limiting)
- **Test value audit:** Identify hollow tests (DELETE logic → test should fail)

---
