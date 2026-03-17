# Module Decomposition Strategy

Break complex systems into manageable, maintainable modules with clear boundaries.

---

## Decomposition Principles

**Module = Single Responsibility + Clear Interface**

1. **Cohesion:** Related things together
2. **Coupling:** Minimal dependencies between modules
3. **Encapsulation:** Hide implementation details
4. **Testability:** Each module tests independently

---

## Decomposition by Concern

### 1. By Domain (Vertical Slice)

```
ecommerce/
├── products/     ← Full stack for products
│   ├── api/
│   ├── service/
│   ├── repository/
│   └── types/
├── orders/       ← Full stack for orders
│   ├── api/
│   ├── service/
│   └── repository/
└── users/
```

**When:** Domain-driven design, microservices preparation
**Benefit:** Easy to extract to service later

### 2. By Technical Layer (Horizontal)

```
src/
├── controllers/  ← All API endpoints
├── services/     ← All business logic
├── repositories/ ← All data access
└── models/       ← All data types
```

**When:** Small team, simple CRUD app
**Benefit:** Familiar pattern, easy to start

### 3. By Feature (Hybrid)

```
src/
├── checkout/     ← Feature module
│   ├── CheckoutController.ts
│   ├── CheckoutService.ts
│   └── types.ts
├── inventory/
└── shared/       ← Only truly shared code
    └── auth/
```

**When:** Medium complexity, clear features
**Benefit:** Balance between vertical & horizontal

---

## Module Boundary Checklist

```
For each module:
- [ ] Single, clear purpose (name explains it)
- [ ] Can be understood in isolation
- [ ] Has defined public interface
- [ ] Hides implementation details
- [ ] Depends on <5 other modules
- [ ] No circular dependencies
- [ ] Can be tested independently
```

---

## Naming Anti-Patterns

### ❌ BAD (Generic)
```
utils/
helpers/
common/
shared/
misc/
```
→ These become dumping grounds!

### ✅ GOOD (Domain-Specific)
```
OrderCalculator
UserAuthenticator
InvoiceGenerator
PaymentProcessor
```
→ Clear purpose, single responsibility

---

## Decomposition Decision Tree

```
Q: What binds these functions together?

├─ Domain Concept (Order, User, Product)
│  → Group by domain (Vertical Slice)
│  Example: orders/ with all order logic
│
├─ Technical Layer (API, Service, Repository)
│  → Group by layer (Horizontal)
│  Example: controllers/ with all APIs
│
└─ Feature (Checkout, Search, Dashboard)
   → Group by feature (Hybrid)
   Example: checkout/ with checkout flow
```

---

## Module Size Guidelines

| Metric | Target | Red Flag |
|--------|--------|----------|
| Lines per file | <200 | >500 |
| Files per module | 3-10 | >20 |
| Functions per file | <10 | >20 |
| Dependencies | <5 | >10 |

**Rule:** If file >200 lines → Split by responsibility

---

## Dependency Rules

### 1. Acyclic Dependencies
```
❌ BAD (Circular):
orders → products → orders

✅ GOOD (Tree):
orders → products
      → users
```

### 2. Dependency Direction
```
✅ Domain ← Services ← Controllers
         ← Repositories

Domain layer depends on NOTHING
```

### 3. Shared Code
```
❌ BAD:
shared/
├── utils.ts (50 functions)
└── helpers.ts (30 functions)

✅ GOOD:
shared/
├── auth/
│   └── JwtValidator.ts
└── http/
    └── HttpClient.ts
```

---

## Refactoring Large Files

### Step 1: Identify Responsibilities
```typescript
// OrderService.ts (500 lines) has 3 responsibilities:
1. Order validation
2. Payment processing
3. Email notifications
```

### Step 2: Extract Modules
```
orders/
├── OrderService.ts       (orchestration only)
├── OrderValidator.ts     (validation logic)
├── PaymentProcessor.ts   (payment calls)
└── OrderNotifier.ts      (email logic)
```

### Step 3: Define Interfaces
```typescript
// OrderService orchestrates
export class OrderService {
  constructor(
    private validator: OrderValidator,
    private payment: PaymentProcessor,
    private notifier: OrderNotifier
  ) {}

  async createOrder(data: OrderData) {
    await this.validator.validate(data);
    const result = await this.payment.charge(data);
    await this.notifier.sendConfirmation(result);
    return result;
  }
}
```

---

## Module Template

```typescript
// {ModuleName}/index.ts (Public API)
export { ModuleService } from './ModuleService';
export type { ModuleData, ModuleResult } from './types';

// {ModuleName}/ModuleService.ts (Implementation)
export class ModuleService {
  // Public methods only
  async doSomething(input: ModuleData): Promise<ModuleResult> {
    return this.privateHelper(input);
  }

  // Private implementation
  private privateHelper(input: ModuleData) {
    // ...
  }
}

// {ModuleName}/types.ts (Data contracts)
export interface ModuleData {
  // ...
}
```

---

## Common Decomposition Patterns

### Pattern 1: Feature Folders
```
features/
├── checkout/
│   ├── components/  (UI)
│   ├── hooks/       (Logic)
│   └── api/         (Data)
└── search/
```
**Use:** Frontend apps (React, Vue)

### Pattern 2: Clean Architecture Layers
```
src/
├── domain/       (Business entities)
├── application/  (Use cases)
├── infrastructure/ (External adapters)
└── presentation/ (Controllers)
```
**Use:** Complex business logic

### Pattern 3: Modular Monolith
```
modules/
├── orders/      (Independently deployable)
├── inventory/
└── payments/
```
**Use:** Microservices preparation

---

## Validation Checklist

Before finalizing module structure:
- [ ] No circular dependencies
- [ ] Each module <200 lines per file
- [ ] Shared code is domain-specific (not generic "utils")
- [ ] Module names explain purpose
- [ ] Can extract module to separate package
- [ ] Dependencies flow in one direction

---

## Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| God Module | 1000+ lines, does everything | Extract by responsibility |
| Circular Deps | A → B → A | Introduce interface layer |
| Generic Naming | `utils.ts` | `OrderCalculator.ts` |
| Over-Nesting | `a/b/c/d/e/f.ts` | Flatten to 2-3 levels max |
| Under-Modularity | Everything in 1 file | Split when >200 lines |
