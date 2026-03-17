---
name: test-data-management
description: Test data lifecycle with factories, seeders, and multi-tenant isolation
allowed-tools: [Bash, Read, Write]
mode: TWO_PASS
---

# Test Data Management

Test data lifecycle with factories, seeders, and multi-tenant isolation.

---

## Philosophy

You are a **data gardener** cultivating realistic test datasets. Three mental models:

1. **CRITICAL Mode**: Tenant isolation violations, PII leaks, non-deterministic data (blocks tests)
2. **INFORMATIONAL Mode**: Data realism, edge case coverage (improves test quality)
3. **CLEANUP Mode**: Zero orphaned test data after test runs

**Core principle:** "Tests must be hermetic—same input always produces same output."

**Anti-pattern:** Using production data copies or shared test tenants violates GDPR and creates flaky tests.

---

## Prime Directives

### 1. ALWAYS use factories, NEVER hardcode test data inline

```typescript
// ❌ BAD: Hardcoded data
const order = await prisma.order.create({ data: { id: 'order-123', tenant_id: 'tenant-abc' } });

// ✅ GOOD: Factory-generated
const order = await factory.createOrder(tenantId);
```

### 2. Multi-tenant tests MUST create isolated tenant per test
**PEN-003 Violation:** Shared tenants → data pollution → flaky tests.

### 3. Cleanup test data in `afterEach` OR use transaction rollback
Orphaned data accumulates → slow tests → false positives.

### 4. Use deterministic fakers (seed = test name hash)
```typescript
beforeEach(() => faker.seed(hashCode(expect.getState().currentTestName)));
```

### 5. Separate data volumes by test type
| Test Type | Records | Purpose |
|-----------|---------|---------|
| Unit | 10 | Fast, focused |
| Integration | 100 | Multi-layer verification |
| E2E | 1,000 | Realistic scenarios |

### 6. NEVER use production data copies (P0: PII/GDPR violation)
Generate synthetic data with Faker or anonymize.

### 7. Anti-patterns to avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Hardcoded IDs | Conflicts in parallel tests | Use `faker.string.uuid()` |
| Shared test tenants | Data pollution across tests | Create isolated tenant per test |
| Random UUIDs without seed | Non-deterministic tests | Seed faker with test name |
| Missing cleanup | Orphaned data slows tests | `afterEach` cleanup or transaction rollback |
| Production data copies | PII/GDPR violation | Generate synthetic data |

---

## Data Generation Strategies

| Strategy | Use Case | Pros | Cons | Example Tool |
|----------|----------|------|------|--------------|
| **Fixtures** | Static test data (golden datasets) | Reproducible, version-controlled | Hard to maintain, brittle | JSON files, YAML |
| **Factories** | Dynamic object creation | Flexible, composable, overridable | Requires setup code | Factory Bot (Ruby), Fishery (TS) |
| **Seeders** | Database population | Realistic relationships, bulk insert | Slow for large datasets | Prisma seed, Django fixtures |
| **Fakers** | Realistic synthetic data | Deterministic if seeded, locale-aware | Needs seed management | Faker.js, Chance.js |
| **Snapshots** | Regression testing | Detects unintended changes | False positives if data changes | Jest snapshots |

---

## Factory Pattern (TypeScript/Prisma)

```typescript
// tests/factories/TestDataFactory.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export class TestDataFactory {
  constructor(private prisma: PrismaClient) {}

  async createTenant(overrides: Partial<Tenant> = {}) {
    return this.prisma.tenant.create({
      data: { id: faker.string.uuid(), name: faker.company.name(), ...overrides },
    });
  }

  async createUser(tenantId: string, overrides: Partial<User> = {}) {
    return this.prisma.user.create({
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        tenant_id: tenantId,
        ...overrides,
      },
    });
  }

  async createOrderWithItems(tenantId: string, itemCount: number = 3) {
    const order = await this.prisma.order.create({
      data: { id: faker.string.uuid(), tenant_id: tenantId, total: 0, status: 'pending' },
    });

    let total = 0;
    for (let i = 0; i < itemCount; i++) {
      const price = faker.number.float({ min: 10, max: 500, precision: 0.01 });
      const quantity = faker.number.int({ min: 1, max: 5 });
      await this.prisma.orderItem.create({
        data: { order_id: order.id, product_id: faker.string.uuid(), quantity, price },
      });
      total += price * quantity;
    }

    return this.prisma.order.update({
      where: { id: order.id },
      data: { total },
      include: { items: true },
    });
  }
}
```

**Usage in Tests:**

```typescript
describe('Order Tests', () => {
  let factory: TestDataFactory;
  let tenantId: string;

  beforeAll(() => factory = new TestDataFactory(new PrismaClient()));

  beforeEach(async () => {
    faker.seed(hashCode(expect.getState().currentTestName));
    tenantId = (await factory.createTenant()).id;
  });

  afterEach(async () => {
    await prisma.tenant.delete({ where: { id: tenantId } });
  });

  it('should create order with items', async () => {
    const order = await factory.createOrderWithItems(tenantId, 5);
    expect(order.items.length).toBe(5);
    expect(order.tenant_id).toBe(tenantId);
  });

  it('should enforce tenant isolation', async () => {
    const tenant2 = await factory.createTenant();
    await factory.createOrderWithItems(tenantId, 3);
    const orders = await prisma.order.findMany({ where: { tenant_id: tenant2.id } });
    expect(orders.length).toBe(0); // ✅ Isolated
    await prisma.tenant.delete({ where: { id: tenant2.id } });
  });
});
```

---

## Two-Pass Workflow

### CRITICAL (Blocks CI/CD)
1. Tenant isolation violation (data leaks between tests)
2. Non-deterministic data (random UUIDs without seed → flaky tests)
3. PII leakage (production data in test environment)
4. Missing cleanup (orphaned records slow tests)
5. Hardcoded IDs (conflicts in parallel runs)

### INFORMATIONAL (Improve Later)
1. Data realism (fake emails vs realistic ones)
2. Edge case coverage (Unicode names, long strings, special chars)
3. Performance (factory too slow → use bulk insert/seeders)
4. Data relationships (missing FK tests)

---

## Meta-Instructions

### Test Data Checklist

```
Before PR:
[ ] Factory created for each entity (Tenant, User, Order, etc.)
[ ] Faker seeded with deterministic value (test name hash)
[ ] Cleanup strategy: Transaction rollback OR afterEach delete
[ ] Multi-tenant tests create isolated tenant per test
[ ] Data volumes match test type: Unit (10), Integration (100), E2E (1000)
[ ] No hardcoded IDs or shared test tenants
[ ] No production data copies in test environment
[ ] Tests pass 10 times in a row (deterministic)
```

### Stopping Policy

**If test data setup > 30% of test runtime:**
- Refactor to use database snapshots (dump/restore)
- Pre-seed fixtures in `beforeAll` instead of `beforeEach`
- Use in-memory database (SQLite) for unit tests

---

## Quick Reference

**Factory Commands:**
```typescript
await factory.createTenant();
await factory.createUser(tenantId, { email: 'admin@example.com', role: 'admin' });
await factory.createOrderWithItems(tenantId, 5);
```

**Deterministic Seeding:**
```typescript
beforeEach(() => faker.seed(hashCode(expect.getState().currentTestName)));
```

**Cleanup:**
```typescript
// Rollback (fastest)
afterEach(async () => await transaction.$rollback());

// Cascade delete (most realistic)
afterEach(async () => await prisma.tenant.delete({ where: { id: tenantId } }));
```

**Multi-Tenant Template:**
```typescript
describe('Feature', () => {
  let tenantId: string;
  beforeEach(async () => {
    faker.seed(hashCode(expect.getState().currentTestName));
    tenantId = (await factory.createTenant()).id;
  });
  afterEach(async () => await prisma.tenant.delete({ where: { id: tenantId } }));
});
```

---
