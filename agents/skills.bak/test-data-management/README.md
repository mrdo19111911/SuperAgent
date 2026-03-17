# Test Data Management

Test data lifecycle with factories, seeders, and multi-tenant isolation.

## Purpose

Provides production-ready patterns for creating hermetic, reproducible test data across unit, integration, and E2E tests. Prevents flaky tests from data pollution and ensures GDPR compliance.

## For QA/Dev Teams (Son QA, Thúc, Lân, Tuấn, Huyền-Py, Hoàng, Huyền FE-QA)

**Use when:**
- Writing integration tests with database access
- Seeding staging/test databases for manual QA
- Creating isolated test data per test (no shared tenants)
- Preventing test flakiness from leftover data
- Anonymizing production dumps for testing (GDPR compliance)
- Generating large datasets for load/performance testing

## Core Patterns

### 1. Factory Pattern (Object Mother)
- `TestDataFactory` with `createTenant()`, `createUser()`, `createOrderWithItems()`
- Override defaults with partial objects: `factory.createUser(tenantId, { role: 'admin' })`
- Deterministic faker (seed = test name hash) for reproducibility

### 2. Multi-Tenant Isolation
- **CRITICAL:** Create isolated tenant per test in `beforeEach`
- Cleanup in `afterEach` via cascade delete or transaction rollback
- **PEN-003 Violation:** Never use shared `TENANT_ID = 'test-tenant'` across tests

### 3. Data Generation Strategies
| Strategy | Use Case | Example |
|----------|----------|---------|
| Fixtures | Static reference data | `products.json` loaded in `beforeAll` |
| Factories | Dynamic test data | `factory.createOrder(tenantId, 3)` creates 3 items |
| Seeders | Bulk data for E2E | `scripts/seed-staging.ts` creates 10K orders |
| Fakers | Realistic field values | `faker.internet.email()`, `faker.company.name()` |
| Snapshots | API regression tests | `expect(response).toMatchSnapshot()` |

### 4. Cleanup Strategies
- **Transaction Rollback** (fastest): `await transaction.$rollback()`
- **Cascade Delete** (most realistic): `await prisma.tenant.delete({ where: { id: tenantId } })`
- **Manual Cleanup** (most control): Delete children → parent in `afterEach`

## GSTACK Compliance

### Philosophy
You are a **data gardener** cultivating hermetic test datasets. Tests must be **reproducible** (same input → same output).

### Prime Directives
1. ALWAYS use factories, NEVER hardcode test data inline
2. Multi-tenant tests MUST create isolated tenant per test
3. Cleanup test data in `afterEach` OR use transaction rollback
4. Use deterministic fakers (seed = test name hash)
5. Separate data volumes: Unit (10), Integration (100), E2E (1000)
6. NEVER use production data copies (PII/GDPR violation)
7. Avoid anti-patterns: hardcoded IDs, shared tenants, missing cleanup

### Two-Pass Workflow
- **CRITICAL (Blocks CI/CD):** Tenant isolation violations, non-deterministic data, PII leakage, hardcoded IDs
- **INFORMATIONAL (Improve Later):** Data realism, edge case coverage, factory performance

## Quick Start

**TypeScript/Prisma:**
```typescript
import { faker } from '@faker-js/faker';

// Seed faker for reproducibility
beforeEach(() => {
  faker.seed(hashCode(expect.getState().currentTestName));
});

// Create isolated tenant per test
let tenantId: string;
beforeEach(async () => {
  const tenant = await factory.createTenant();
  tenantId = tenant.id;
});

// Cleanup after test
afterEach(async () => {
  await prisma.tenant.delete({ where: { id: tenantId } });
});
```

## Integration with Nash Framework

- **Pipeline 3 (Coding):** Dev agents create factories during TDD workflow
- **Pipeline 4 (Testing):** Son QA validates factory coverage + cleanup strategy
- **Gate 2 (Validate):** Tests must pass 10 times in a row (deterministic)

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Shared test tenant | Data pollution, flaky tests | Create isolated tenant per test |
| Production data copies | PII/GDPR violation | Generate synthetic data with Faker |
| Random UUIDs without seed | Non-deterministic tests | Seed faker with test name hash |
| No cleanup in `afterEach` | Orphaned data slows tests | Add cleanup or transaction rollback |

## See Also

- [TDD Best Practices](../tdd-best-practices/SKILL.md) - RED → GREEN → REFACTOR cycle
- [API Chaos Testing](../api-chaos-testing/SKILL.md) - RLS bypass testing with test data
- [Multi-Tenant Schema Design](../multi-tenant-schema-design/SKILL.md) - Schema patterns for test factories
