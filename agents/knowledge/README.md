# Knowledge Items (KI) System

**Purpose:** Persistent domain knowledge shared across tasks to reduce token usage.

**Problem Solved:** Agents re-learn same facts every task (e.g., "User entity has 12 fields").

**Solution:** Centralized knowledge base read during Phase A (criteria definition).

---

## Directory Structure

```
agents/knowledge/
├── core/           # System-level decisions
│   ├── architecture.md
│   ├── conventions.md
│   └── dependencies.md
├── domain/         # Business logic knowledge
│   ├── user_model.md
│   ├── auth_flow.md
│   └── payment_integration.md
└── operational/    # Runtime/deployment
    ├── deployment_process.md
    ├── monitoring_alerts.md
    └── incident_runbooks.md
```

---

## When to Create Knowledge Items

**DO create KI when:**
- ✅ Same domain appears in ≥3 tasks (e.g., User, Auth, Payment)
- ✅ Architecture decision affects multiple modules
- ✅ Deployment process is standard across modules
- ✅ Coding convention applies project-wide

**DON'T create KI when:**
- ❌ One-off task with unique context
- ❌ Rapidly changing domain (unstable requirements)
- ❌ Module-specific implementation details

---

## Knowledge Item Template

```markdown
# {Domain Name}

**Created:** YYYY-MM-DD
**Updated:** YYYY-MM-DD
**Owner:** {Agent Name}
**Scope:** {core|domain|operational}

## Summary

{1-2 sentence overview}

## Key Facts

- Fact 1 with evidence [source:line]
- Fact 2 with evidence [source:line]
- ...

## Schema/Structure

{If applicable - DB schema, API contracts, data flow}

## Related Knowledge Items

- [Architecture Decisions](core/architecture.md)
- [Coding Conventions](core/conventions.md)

## References

- [Source Code](path/to/source.ts:line)
- [Documentation](docs/file.md)
- [ADR](artifacts/decisions/ADR-042.md)
```

---

## Usage in Phase A

**Dispatch template includes:**

```markdown
## Phase A: Define Criteria

THESIS reads (in order):
1. $SPEC_FILE (task-specific requirements)
2. $CONTRACTS_FILE (API contracts)
3. agents/knowledge/{relevant_domain}/*.md (persistent context)
4. agents/core/{agent}.md (L2 Cache with PEN/WIN)

Example: Task "Add password reset"
→ Reads knowledge/domain/user_model.md
→ Reads knowledge/domain/auth_flow.md
→ No need to re-discover "User.email is unique constraint"
```

---

## Maintenance

**Who maintains:**
- Dũng PM (Main Agent) updates after task completion
- Format: Add new facts, mark outdated facts as DEPRECATED

**When to update:**
- Architecture decision changes (e.g., User schema adds field)
- New domain emerges (e.g., Payment v2 integration)
- Deprecate old pattern (e.g., localStorage → IndexedDB)

**Version control:**
- All KI files are git-tracked
- Use git blame to trace fact origins
- Reference commits in citations: `[User schema v2, commit abc123]`

---

## Token Impact

**Before KI System:**
- Task 1: Read codebase → 20K tokens
- Task 2: Read codebase again → 20K tokens
- Task 10: Still reading → 20K tokens

**After KI System:**
- Storage: 5K tokens one-time (persistent)
- Task 1-10: Read knowledge/ → 500 tokens each
- **Savings:** 50 tasks × 19.5K = -975K tokens/month (194x ROI)

---

## Examples

### core/architecture.md
```markdown
# System Architecture

**Created:** 2026-03-01
**Updated:** 2026-03-17

## Summary

Monorepo with 60 modules using Nash Triad review for all changes.

## Key Facts

- Module structure: modules/{module_name}/src/
- Gate validation: validate → integrity → qa → security (parallel via parallel_validate.sh)
- Nash Triad: Every pipeline has Thesis → Anti-Thesis → Synthesis review

## Tech Stack

- Language: TypeScript 5.3+
- Runtime: Node.js 20+
- Testing: Jest + Playwright
- Build: tsc + webpack
- CI/CD: GitHub Actions

## References

- [CLAUDE.md](../../CLAUDE.md)
- [NASH_SUBAGENT_PROMPTS.md](../../system/templates/NASH_SUBAGENT_PROMPTS.md)
```

### domain/user_model.md
```markdown
# User Entity Model

**Created:** 2026-01-15
**Updated:** 2026-03-10

## Summary

User entity represents authenticated users with email-based auth.

## Key Facts

- Primary key: id (UUID v4)
- Unique constraint: email (lowercase, validated)
- Password: bcrypt hash (12 rounds)
- Created: timestamp (default now())
- Updated: timestamp (auto-update on change)

## Schema

\`\`\`typescript
interface User {
  id: string;              // UUID v4
  email: string;           // unique, lowercase
  password_hash: string;   // bcrypt(12)
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
}
\`\`\`

## Business Rules

- Email must be verified before login
- Password reset tokens expire in 1 hour
- Max 5 failed login attempts → account locked for 15 min

## Related Knowledge Items

- [Auth Flow](auth_flow.md)
- [Password Reset](auth_flow.md#password-reset)

## References

- [User Model Source](../../../modules/auth/src/models/user.ts:12)
- [User Schema Migration](../../../modules/auth/migrations/001_create_users.sql)
```

---

## Validation

**Gate script checks:**
```bash
# Verify no TODO/FIXME in knowledge items
grep -r "TODO\|FIXME" agents/knowledge/ && exit 1

# Verify all knowledge items have Created/Updated dates
find agents/knowledge -name "*.md" -not -name "README.md" | while read f; do
  grep -q "Created:" "$f" || echo "Missing Created date: $f"
  grep -q "Updated:" "$f" || echo "Missing Updated date: $f"
done
```

---

**Version:** 1.0
**Effective:** 2026-03-17 (v6.6)
