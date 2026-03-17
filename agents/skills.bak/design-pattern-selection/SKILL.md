# Design Pattern Selection

Tactical design patterns (Clean Architecture, DDD, CQRS, Repository) with selection criteria.

---

## Pattern Selection Matrix

| Pattern | Complexity | Team Size | Use Case | Avoid If |
|---------|-----------|-----------|----------|----------|
| **Transaction Script** | Low | 1-3 | Simple CRUD | Complex business rules |
| **Domain Model (DDD)** | High | 5+ | Rich domain logic | Simple CRUD |
| **Repository** | Medium | 3+ | Testable data access | Single DB, no testing |
| **CQRS** | High | 5+ | Read/write asymmetry | Symmetric operations |
| **Event Sourcing** | Very High | 10+ | Audit trail critical | Simple state |

---

## Pattern 1: Transaction Script (Simple CRUD)

**When:** Basic CRUD, simple validation, small team

```typescript
// services/CreateUserService.ts
export async function createUser(data: CreateUserDTO) {
  // Validate
  if (!data.email) throw new Error('Email required');

  // Business logic
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Persist
  return await db.users.create({
    data: { ...data, password: hashedPassword }
  });
}
```

**Pros:** Simple, fast, easy to understand
**Cons:** Anemic model, logic spreads as complexity grows

---

## Pattern 2: Domain-Driven Design (Rich Domain)

**When:** Complex business rules, domain experts available

```typescript
// domain/User.ts (Rich entity)
export class User {
  private constructor(
    private email: Email,      // Value Object
    private password: Password  // Value Object
  ) {}

  static create(email: string, password: string): User {
    return new User(
      Email.create(email),      // Validation in Value Object
      Password.hash(password)
    );
  }

  changeEmail(newEmail: string) {
    // Business rule: email change requires verification
    this.email = Email.create(newEmail);
    this.markEmailAsUnverified();
  }

  private markEmailAsUnverified() {
    // Domain logic encapsulated
  }
}

// application/CreateUserUseCase.ts
export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(dto: CreateUserDTO) {
    const user = User.create(dto.email, dto.password);
    await this.userRepo.save(user);
    return user;
  }
}
```

**Pros:** Business logic centralized, rich domain model
**Cons:** Higher complexity, needs domain expertise

---

## Pattern 3: Repository (Testable Data Access)

**When:** Multiple data sources OR complex queries need testing

```typescript
// repositories/UserRepository.ts (Interface)
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}

// repositories/PrismaUserRepository.ts (Implementation)
export class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    const data = await prisma.user.findUnique({ where: { id } });
    return data ? User.fromPersistence(data) : null;
  }

  async save(user: User) {
    await prisma.user.upsert({
      where: { id: user.id },
      create: user.toPersistence(),
      update: user.toPersistence()
    });
  }
}

// repositories/InMemoryUserRepository.ts (Testing)
export class InMemoryUserRepository implements UserRepository {
  private users = new Map<string, User>();

  async findById(id: string) {
    return this.users.get(id) || null;
  }

  async save(user: User) {
    this.users.set(user.id, user);
  }
}
```

**Pros:** Testable without DB, swap implementations
**Cons:** Extra abstraction, YAGNI if single DB

**When to SKIP:** Simple CRUD with Prisma (use ORM directly)

---

## Pattern 4: CQRS (Command-Query Separation)

**When:** Read operations differ significantly from writes

```typescript
// commands/CreateUserCommand.ts (Write model)
export class CreateUserCommand {
  execute(data: CreateUserDTO) {
    return db.users.create({ data });
  }
}

// queries/GetUserQuery.ts (Read model)
export class GetUserQuery {
  execute(id: string) {
    // Optimized for reads (denormalized, cached)
    return cache.get(`user:${id}`) || db.userViews.findOne(id);
  }
}
```

**Pros:** Optimize reads/writes independently
**Cons:** Eventual consistency, double models

**When to SKIP:** Reads = Writes pattern (most apps!)

---

## Pattern 5: Event Sourcing

**When:** Audit trail critical, time-travel queries needed

```typescript
// events/UserEvents.ts
type UserCreated = { type: 'UserCreated'; email: string; timestamp: Date };
type EmailChanged = { type: 'EmailChanged'; newEmail: string; timestamp: Date };

// aggregates/User.ts
export class User {
  private events: UserEvent[] = [];

  static create(email: string) {
    const user = new User();
    user.apply({ type: 'UserCreated', email, timestamp: new Date() });
    return user;
  }

  changeEmail(newEmail: string) {
    this.apply({ type: 'EmailChanged', newEmail, timestamp: new Date() });
  }

  private apply(event: UserEvent) {
    this.events.push(event);
    // Update state based on event
  }

  getEvents() {
    return this.events;
  }
}

// Replay events to rebuild state
function rehydrate(events: UserEvent[]): User {
  const user = new User();
  events.forEach(e => user.apply(e));
  return user;
}
```

**Pros:** Complete audit, time-travel, event replay
**Cons:** Very complex, eventual consistency

**When to SKIP:** Simple audit log sufficient (99% of cases)

---

## Clean Architecture Layers

```
┌─────────────────────────┐
│   Presentation Layer    │ (Controllers, DTOs)
├─────────────────────────┤
│   Application Layer     │ (Use Cases, orchestration)
├─────────────────────────┤
│   Domain Layer          │ (Entities, Value Objects, Rules)
├─────────────────────────┤
│   Infrastructure Layer  │ (Repositories, External APIs)
└─────────────────────────┘

Dependency Rule: Inner layers NEVER depend on outer layers
```

**When:** Complex business logic, long-lived project
**When to SKIP:** Simple CRUD (<5 entities)

---

## Pattern Progression (Start → Grow)

```
Year 1: Transaction Script
  ↓ (Business rules growing)
Year 2: Rich Domain Model (DDD Lite)
  ↓ (Multiple teams)
Year 3: Full DDD + CQRS
  ↓ (Critical audit needs)
Year 4: Event Sourcing (rare!)
```

**Anti-Pattern:** Jumping to Year 4 on Day 1!

---

## Decision Checklist

```
[ ] Start with simplest pattern (Transaction Script)
[ ] Add Repository ONLY if:
    - Multiple data sources OR
    - Complex queries need unit tests
[ ] Add DDD ONLY if:
    - Complex business rules AND
    - Domain experts available
[ ] Add CQRS ONLY if:
    - Read/write patterns differ significantly
[ ] Add Event Sourcing ONLY if:
    - Audit trail legally required OR
    - Time-travel queries needed
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Repository for everything | Unnecessary abstraction | Use ORM directly for simple CRUD |
| DDD without domain expert | Over-engineering | Start with Transaction Script |
| CQRS for symmetric ops | Doubles complexity for no gain | Single model sufficient |
| Event Sourcing too early | Massive complexity | Append-only log sufficient |
| Clean Arch for 3 tables | Over-abstraction | Flat structure OK |

---

## Pattern Combinations

**✅ GOOD:**
- DDD + Repository (testable rich domain)
- CQRS + Event Sourcing (read/write optimization)
- Clean Arch + DDD (layered domain logic)

**❌ BAD:**
- Transaction Script + Clean Arch (contradictory)
- Event Sourcing without CQRS (missing benefit)
- Repository without DDD (unnecessary if anemic)

---

## Recommended Starting Point

```typescript
// Start here for 90% of projects:

// services/users/CreateUserService.ts
export async function createUser(data: CreateUserDTO) {
  // Validate
  const schema = z.object({ email: z.string().email() });
  const validated = schema.parse(data);

  // Business logic
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Persist with ORM directly
  return await prisma.user.create({
    data: { ...validated, password: hashedPassword }
  });
}
```

**Refactor to patterns ONLY when pain points emerge!**
