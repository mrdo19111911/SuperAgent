# Coding Conventions

**Created:** 2026-03-17
**Updated:** 2026-03-17
**Owner:** Phuc SA
**Scope:** core

## Summary

Project-wide coding standards for TypeScript, Git, testing, and documentation.

## TypeScript Conventions

**Naming:**
- `PascalCase` for classes, interfaces, types
- `camelCase` for functions, variables, properties
- `UPPER_SNAKE_CASE` for constants
- Prefix interfaces with `I` only if distinguishing from class (e.g., `IRepository` vs `Repository`)

**Types:**
- Prefer `interface` over `type` for object shapes
- Use `type` for unions, intersections, mapped types
- Always specify return types for public functions
- Avoid `any` - use `unknown` if type truly unknown

**Error Handling:**
- Wrap external API calls in try-catch
- Return `Result<T, E>` pattern for functions that can fail
- Never swallow errors - log or propagate
- Use custom error classes (extend `Error`)

**Example:**
```typescript
// Good
interface User {
  id: string;
  email: string;
}

async function getUser(id: string): Promise<Result<User, Error>> {
  try {
    const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return Ok(user);
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    return Err(new DatabaseError('User not found'));
  }
}

// Bad
function getUser(id) {  // No types
  try {
    return db.query('SELECT * FROM users WHERE id = ' + id);  // SQL injection risk
  } catch (e) {
    // Swallowed error
  }
}
```

## Git Conventions

**Commit Messages:**
- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
- Scope: module name or affected area
- Description: Imperative mood, lowercase, no period

**Examples:**
```
feat(auth): add password reset flow
fix(payment): handle Stripe webhook timeout
docs(api): update authentication guide
refactor(user): extract validation to separate service
```

**Branching:**
- `main` - production-ready code
- `feature/{name}` - new features
- `fix/{name}` - bug fixes
- `hotfix/{name}` - urgent production fixes

**Pull Requests:**
- Use `gh pr create` with Nash Triad review
- Include test coverage in description
- Link to related issues/tasks

## Testing Conventions

**Test Structure:**
- Use `describe` for test suites
- Use `it` or `test` for test cases
- Follow AAA pattern: Arrange → Act → Assert

**Coverage Requirements:**
- Minimum 80% line coverage
- 100% coverage for critical paths (auth, payment, security)
- No mocks in integration tests (use real DB/services)

**Example:**
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid email', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'secure123';

      // Act
      const result = await userService.createUser(email, password);

      // Assert
      expect(result.isOk()).toBe(true);
      expect(result.value.email).toBe(email);
    });

    it('should reject duplicate email', async () => {
      // Arrange
      await userService.createUser('test@example.com', 'pass123');

      // Act
      const result = await userService.createUser('test@example.com', 'pass456');

      // Assert
      expect(result.isErr()).toBe(true);
      expect(result.error.message).toContain('duplicate');
    });
  });
});
```

## Documentation Conventions

**Code Comments:**
- Use JSDoc for public APIs
- Avoid obvious comments ("increment counter")
- Explain WHY, not WHAT
- Link to ADRs for architectural decisions

**Example:**
```typescript
/**
 * Validates user password against security policy.
 *
 * Security policy per ADR-023: min 8 chars, 1 upper, 1 lower, 1 number.
 *
 * @param password - User-provided password
 * @returns Validation result with specific error messages
 * @see artifacts/decisions/ADR-023-password-policy.md
 */
function validatePassword(password: string): ValidationResult {
  // ...
}
```

**README Structure:**
- Purpose (1-2 sentences)
- Installation steps
- Usage examples
- API documentation (link to OpenAPI/Swagger)
- Contributing guidelines

## File Organization

**Module Structure:**
```
modules/{module_name}/
├── src/
│   ├── models/       # Data models, schemas
│   ├── services/     # Business logic
│   ├── controllers/  # API handlers
│   ├── middleware/   # Express middleware
│   └── utils/        # Helper functions
├── tests/
│   ├── unit/
│   └── integration/
├── contracts/        # API contracts (OpenAPI)
└── README.md
```

**File Naming:**
- `kebab-case.ts` for files
- One class/interface per file (unless tightly coupled)
- Test files: `{name}.test.ts` or `{name}.spec.ts`

## Related Knowledge Items

- [Architecture](architecture.md)
- [Dependencies](dependencies.md)

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Conventional Commits](https://www.conventionalcommits.org/)
