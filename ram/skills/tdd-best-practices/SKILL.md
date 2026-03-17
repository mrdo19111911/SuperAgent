# TDD Best Practices

RED → GREEN → REFACTOR cycle with coverage targets (Unit ≥80%, Integration ≥70%).

---

## Phase 1: RED (Test MUST Fail)

**Rule: Test files MUST fail when run initially**

**TypeScript/Jest Example**

```typescript
// tests/OrderService.test.ts (RED Phase)
import { OrderService } from '../OrderService';

describe('OrderService', () => {
  it('should create order with tenant isolation', async () => {
    const orderService = new OrderService(mockPrisma);

    const result = await orderService.create({
      tenant_id: 'tenant-123',
      items: [{ product_id: 'p1', quantity: 2 }],
      total: 100
    });

    expect(result.id).toBeDefined();
    expect(result.tenant_id).toBe('tenant-123');
    expect(result.status).toBe('pending');
  });
});
```

**Run test** - MUST see failure:
```bash
npm test OrderService.test.ts

# Expected output:
# ❌ FAIL tests/OrderService.test.ts
#   ● OrderService › should create order with tenant isolation
#     OrderService is not a constructor
```

**HARD STOP:** If test PASSES in RED phase → something is wrong (stale code, wrong import).

---

## Phase 2: GREEN (Minimal Implementation)

**Write minimum code to pass test**

```typescript
// src/OrderService.ts (GREEN Phase)
import { PrismaClient } from '@prisma/client';

export class OrderService {
  constructor(private prisma: PrismaClient) {}

  async create(data: { tenant_id: string; items: any[]; total: number }) {
    return this.prisma.order.create({
      data: {
        tenant_id: data.tenant_id,
        status: 'pending',
        total: data.total
      }
    });
  }
}
```

**Run test again** - MUST PASS:
```bash
npm test OrderService.test.ts

# Expected output:
# ✅ PASS tests/OrderService.test.ts
#   ✓ OrderService › should create order with tenant isolation (45ms)
```

---

## Phase 3: REFACTOR (Keep Tests Green)

**Clean up code while tests stay green**

```typescript
// src/OrderService.ts (REFACTOR Phase)
import { PrismaClient } from '@prisma/client';

interface CreateOrderDTO {
  tenant_id: string;
  items: Array<{ product_id: string; quantity: number }>;
  total: number;
}

export class OrderService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(dto: CreateOrderDTO) {
    this.validateOrder(dto);

    return this.prisma.order.create({
      data: {
        tenant_id: dto.tenant_id,
        status: 'pending' as const,
        total: dto.total,
        items: {
          create: dto.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        }
      },
      include: { items: true }
    });
  }

  private validateOrder(dto: CreateOrderDTO) {
    if (dto.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (dto.total <= 0) {
      throw new Error('Order total must be positive');
    }
  }
}
```

**Run tests** - MUST still PASS after refactor.

---

## Integration Test Pattern (with DB)

**Setup Test Database**

```typescript
// tests/setup/testDb.ts
import { PrismaClient } from '@prisma/client';

export async function setupTestDb() {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: process.env.TEST_DATABASE_URL }
    }
  });

  // Clean DB before each test
  await prisma.$executeRaw`TRUNCATE TABLE orders CASCADE`;

  return prisma;
}

export async function teardownTestDb(prisma: PrismaClient) {
  await prisma.$disconnect();
}
```

**Integration Test**

```typescript
// tests/integration/OrderService.integration.test.ts
import { setupTestDb, teardownTestDb } from '../setup/testDb';
import { OrderService } from '../../src/OrderService';

describe('OrderService Integration', () => {
  let prisma: PrismaClient;
  let orderService: OrderService;

  beforeAll(async () => {
    prisma = await setupTestDb();
    orderService = new OrderService(prisma);
  });

  afterAll(async () => {
    await teardownTestDb(prisma);
  });

  it('should persist order to database', async () => {
    const result = await orderService.create({
      tenant_id: 'tenant-123',
      items: [{ product_id: 'p1', quantity: 2 }],
      total: 100
    });

    // Verify persisted
    const found = await prisma.order.findUnique({
      where: { id: result.id }
    });

    expect(found).toBeDefined();
    expect(found!.tenant_id).toBe('tenant-123');
  });

  it('should enforce RLS (tenant isolation)', async () => {
    // Create order for tenant-123
    const order1 = await orderService.create({
      tenant_id: 'tenant-123',
      items: [{ product_id: 'p1', quantity: 1 }],
      total: 50
    });

    // Try to query as tenant-456 (should not see tenant-123's order)
    await prisma.$executeRaw`SET LOCAL app.current_tenant_id = 'tenant-456'`;

    const found = await prisma.order.findUnique({
      where: { id: order1.id }
    });

    expect(found).toBeNull();  // RLS should block access
  });
});
```

---

## Go/Testing Example (table-driven tests)

**RED Phase**

```go
// services/order_service_test.go
package services

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestCreateOrder(t *testing.T) {
	tests := []struct {
		name      string
		tenantID  string
		items     []Item
		wantError bool
	}{
		{
			name:     "valid order",
			tenantID: "tenant-123",
			items:    []Item{{ProductID: "p1", Quantity: 2}},
			wantError: false,
		},
		{
			name:     "empty items",
			tenantID: "tenant-123",
			items:    []Item{},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := NewOrderService(mockRepo)

			result, err := svc.CreateOrder(tt.tenantID, tt.items)

			if tt.wantError {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
				assert.NotEmpty(t, result.ID)
				assert.Equal(t, tt.tenantID, result.TenantID)
			}
		})
	}
}
```

**GREEN Phase**

```go
// services/order_service.go
package services

type OrderService struct {
	repo OrderRepository
}

func NewOrderService(repo OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) CreateOrder(tenantID string, items []Item) (*Order, error) {
	if len(items) == 0 {
		return nil, errors.New("order must have items")
	}

	order := &Order{
		ID:       uuid.New().String(),
		TenantID: tenantID,
		Items:    items,
		Status:   "pending",
	}

	return s.repo.Create(order)
}
```

---

## Coverage Verification

**Check coverage before PR**

```bash
# TypeScript/Jest
npm run test:coverage

# Expected output:
# -------------------------|---------|----------|---------|---------|
# File                     | % Stmts | % Branch | % Funcs | % Lines |
# -------------------------|---------|----------|---------|---------|
# All files                |   85.23 |    78.45 |   90.12 |   84.67 |
#   OrderService.ts        |   92.31 |    88.89 |  100.00 |   91.67 |
# -------------------------|---------|----------|---------|---------|

# PASS if ≥80% unit, ≥70% integration
```

```bash
# Go
go test ./... -cover

# Expected output:
# ok      github.com/stmai/services    0.045s    coverage: 82.4% of statements
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Test PASSES in RED phase | Stale code or wrong file | Delete implementation, re-run test (MUST fail) |
| Hollow test (fake coverage) | Test doesn't actually verify behavior | Add assertions for ALL critical paths |
| Integration test without DB cleanup | Test pollution, flaky tests | `beforeEach`: TRUNCATE tables |
| Mock PostgreSQL superuser | Superuser bypasses RLS → false positive | Use non-superuser role in tests |
| Test coverage <80% unit | Missing edge case tests | Add table-driven tests for all branches |

---

## Checklist

```
RED Phase:
[ ] Write test FIRST (before implementation)
[ ] Run test → MUST see failure
[ ] Test verifies ONE behavior clearly

GREEN Phase:
[ ] Write minimal code to pass
[ ] Run test → MUST see success
[ ] No extra features (YAGNI)

REFACTOR Phase:
[ ] Extract functions, improve names
[ ] Run tests → MUST stay green
[ ] Coverage ≥80% unit, ≥70% integration
[ ] No TODO/FIXME in test files
```
