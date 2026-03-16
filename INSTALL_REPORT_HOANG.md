# INSTALL REPORT: Skills for Hoàng Dev .NET

**Date:** 2026-03-16
**Agent:** `agents/dev/hoang-dev-net.md`
**Target:** Backend C#/.NET Developer
**Keywords:** dotnet, csharp, entity-framework, tdd, xunit, async, httpclient, backend, api

---

## Executive Summary

Analyzed 1,000+ skills in the repository and identified **8 high-priority skills** directly applicable to Hoàng's tech stack and responsibilities. These skills cover:

1. **Code Quality & Review** - Self-review before submitting to Mộc
2. **Testing & TDD** - RED-GREEN-REFACTOR cycle with coverage targets
3. **Backend Architecture** - Multi-tenant patterns, API design, security
4. **Deployment** - Ship workflow for feature branches
5. **Quality Assurance** - Chaos testing, edge cases, RLS validation

---

## Installation Priority Matrix

| Priority | Skill | Category | Relevance Score |
|----------|-------|----------|-----------------|
| **P0** | `code-review-excellence` | Quality Gate | 10/10 |
| **P0** | `tdd-best-practices` | Testing | 10/10 |
| **P0** | `multi-tenant-schema-design` | Architecture | 10/10 |
| **P1** | `dotnet-backend` | Framework | 9/10 |
| **P1** | `dotnet-backend-patterns` | Patterns | 9/10 |
| **P1** | `csharp-pro` | Language | 9/10 |
| **P1** | `api-chaos-testing` | QA | 9/10 |
| **P2** | `deployment-excellence` | DevOps | 8/10 |

---

## P0 Skills (Install First)

### 1. Code Review Excellence

**Path:** `e:\SuperAgent\agents\skills\code-review-excellence\SKILL.md`

**What it does:**
- Pre-landing PR review workflow
- Analyzes diff against main for structural issues tests don't catch
- Two-pass review: CRITICAL (SQL safety, LLM trust boundary) + INFORMATIONAL (side effects, dead code, test gaps)
- Greptile integration for automated review triage

**Why Hoàng needs it:**
- **Self-review before Mộc** - Catch issues before code review (avoid P3 -10đ penalty)
- **Contract drift detection** - Prevent breaking FE parse (P1 -20đ violation)
- **SQL safety checks** - Prevent RLS bypass, SQL injection
- **Zero contract drift** - Aligned with WIN entry W2 (+10đ)

**Installation:**
```bash
# Already in SuperAgent repo
# Reference in hoang-dev-net.md exists:
# - **SKILL:** `../../.agents/skills/code-review-excellence/SKILL.md`
```

**Usage:**
```bash
# Before submitting PR to Mộc
/review
```

---

### 2. TDD Best Practices

**Path:** `e:\SuperAgent\agents\skills\tdd-best-practices\SKILL.md`

**What it does:**
- RED → GREEN → REFACTOR cycle
- Coverage targets: Unit ≥80%, Integration ≥70%
- TypeScript/Jest, Go/Testing, C#/xUnit examples
- RLS bypass testing (PostgreSQL)
- Hollow test detection (fake coverage)

**Why Hoàng needs it:**
- **80%+ test coverage requirement** - Aligned with agent spec
- **Prevent hollow tests** - Avoid P2 -15đ penalty
- **Test tenant isolation** - Critical for multi-tenant apps
- **WIN entry alignment** - W1 (+20đ): "test 80%+ coverage, Mộc code review PASS lần đầu"

**C# Example:**
```csharp
// RED Phase - Test MUST fail
[Fact]
public async Task CreateOrder_WithValidData_ReturnsOrder()
{
    var service = new OrderService(mockContext);

    var result = await service.Create(new CreateOrderDto
    {
        TenantId = "tenant-123",
        Items = new[] { new OrderItem { ProductId = "p1", Quantity = 2 } },
        Total = 100
    });

    Assert.NotNull(result.Id);
    Assert.Equal("tenant-123", result.TenantId);
    Assert.Equal("pending", result.Status);
}

// GREEN Phase - Minimal implementation to pass
public class OrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context) => _context = context;

    public async Task<Order> Create(CreateOrderDto dto)
    {
        var order = new Order
        {
            TenantId = dto.TenantId,
            Status = "pending",
            Total = dto.Total
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return order;
    }
}
```

**Installation:**
```bash
# Already exists in repo
cp e:\SuperAgent\agents\skills\tdd-best-practices\SKILL.md ~/.claude/skills/tdd-best-practices/
```

---

### 3. Multi-Tenant Schema Design

**Path:** `e:\SuperAgent\agents\skills\multi-tenant-schema-design\SKILL.md`

**What it does:**
- 5 patterns: Standard Entity, Time-Series Partitioned, Hierarchical, Shared Reference, Soft Delete Cascade
- Index strategy for tenant isolation
- N+1 prevention with EF Core
- GDPR hard delete queue

**Why Hoàng needs it:**
- **Tenant isolation enforcement** - Aligned with PEN entry P3: "Không check tenant isolation trong query"
- **Multi-tenancy requirement** - Agent spec: "Mọi query phải filter theo `tenantId`"
- **RLS testing patterns** - Critical for preventing P0 -30đ violations (data breach)

**C# Example:**
```csharp
// Standard Entity with tenant isolation
public class Project
{
    public string Id { get; set; }
    public string TenantId { get; set; }
    public string Name { get; set; }
    public DateTime? DeletedAt { get; set; }

    public User Owner { get; set; }
    public ICollection<Task> Tasks { get; set; }
}

// DbContext configuration
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Project>(entity =>
    {
        entity.HasIndex(e => e.TenantId);
        entity.HasIndex(e => new { e.TenantId, e.DeletedAt });
        entity.HasIndex(e => new { e.TenantId, e.Name })
              .IsUnique()
              .HasFilter("deleted_at IS NULL");
    });
}

// Query with tenant isolation
public async Task<List<Project>> GetActiveProjects(string tenantId)
{
    return await _context.Projects
        .AsNoTracking()
        .Where(p => p.TenantId == tenantId && p.DeletedAt == null)
        .Include(p => p.Owner)  // Prevent N+1
        .ToListAsync();
}
```

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\multi-tenant-schema-design\SKILL.md ~/.claude/skills/multi-tenant-schema-design/
```

---

## P1 Skills (Install Next)

### 4. dotnet-backend

**Path:** `e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend\SKILL.md`

**What it does:**
- ASP.NET Core 8+ API patterns (Minimal API + Controller-based)
- EF Core query optimization (AsNoTracking, Include/ThenInclude)
- JWT authentication/authorization
- Background services (IHostedService, BackgroundService)
- Performance patterns (async/await, connection pooling, caching)

**Why Hoàng needs it:**
- **Stack alignment** - ASP.NET Core, EF Core, xUnit (100% match)
- **.NET traps prevention** - Aligned with agent PEN entries (async void, DbContext lifetime, DateTime.Now)
- **Production patterns** - Minimal API, JWT, background jobs

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend\SKILL.md ~/.claude/skills/dotnet-backend/
```

---

### 5. dotnet-backend-patterns

**Path:** `e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend-patterns\SKILL.md`

**What it does:**
- Dependency injection patterns
- Async/await best practices
- Caching strategies (Redis)
- Resilience patterns (Polly)
- Configuration patterns (IOptions)

**Why Hoàng needs it:**
- **Enterprise patterns** - DI, configuration, caching
- **Resilience** - Critical for production .NET apps
- **Observability** - Logging, health checks, metrics

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend-patterns\SKILL.md ~/.claude/skills/dotnet-backend-patterns/
```

---

### 6. csharp-pro

**Path:** `e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\csharp-pro\SKILL.md`

**What it does:**
- Modern C# features (records, pattern matching, nullable reference types)
- Performance optimization (Span, Memory, value types)
- Async/await patterns without blocking
- Comprehensive testing (xUnit, Moq, FluentAssertions)

**Why Hoàng needs it:**
- **Modern C# features** - Records, pattern matching, nullable types
- **Performance optimization** - Span<T>, Memory<T>, value types
- **Testing alignment** - xUnit + Moq + FluentAssertions (exact agent spec)

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\csharp-pro\SKILL.md ~/.claude/skills/csharp-pro/
```

---

### 7. api-chaos-testing

**Path:** `e:\SuperAgent\agents\skills\api-chaos-testing\SKILL.md`

**What it does:**
- Payload chaos (empty, malformed, 10MB DoS)
- Auth bypass testing (RLS, JWT manipulation)
- Edge cases (null, negative, max int, special chars)
- SQL injection attempts
- Rate limiting & spam detection

**Why Hoàng needs it:**
- **QA integration** - Works with Son QA pipeline
- **Security validation** - Prevent P0 -30đ violations (RLS bypass, SQL injection)
- **Edge case coverage** - Aligned with test coverage requirements

**C# Example:**
```csharp
// RLS bypass test
[Fact]
public async Task GetOrder_WithDifferentTenant_ReturnsNull()
{
    // Setup: Create order for tenant-123
    var order = await _context.Orders.AddAsync(new Order
    {
        TenantId = "tenant-123",
        Total = 100
    });
    await _context.SaveChangesAsync();

    // Attack: Try to read as tenant-456
    var result = await _service.GetOrder(order.Id, "tenant-456");

    // BLOCKER if result != null (RLS bypass!)
    Assert.Null(result);
}
```

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\api-chaos-testing\SKILL.md ~/.claude/skills/api-chaos-testing/
```

---

## P2 Skills (Optional, High Value)

### 8. deployment-excellence

**Path:** `e:\SuperAgent\agents\skills\deployment-excellence\SKILL.md`

**What it does:**
- Ship workflow: tests → review → commit → PR
- Polyglot support (npm/go/dotnet/pytest)
- Execute-first mode (no confirmations)
- Token budget <5K (fast workflow)

**Why Hoàng needs it:**
- **Ship efficiency** - Based on gstack /ship
- **.NET support** - `dotnet test` integration
- **PR creation** - Automated with `gh pr create`

**.NET Usage:**
```bash
# From feature branch
/ship

# Workflow:
# 1. Merge origin/main
# 2. Run: dotnet test
# 3. Review diff
# 4. Commit + push
# 5. Create PR with gh
```

**Installation:**
```bash
cp e:\SuperAgent\agents\skills\deployment-excellence\SKILL.md ~/.claude/skills/deployment-excellence/
```

---

## Additional Skills (Discovered, Not Installed)

These skills are relevant but lower priority:

| Skill | Path | Relevance | Notes |
|-------|------|-----------|-------|
| `contract-draft-template` | `agents/skills/contract-draft-template/SKILL.md` | 7/10 | For Pipeline 2 (Architecture) - Phuc SA domain |
| `architecture-decision-framework` | `agents/skills/architecture-decision-framework/SKILL.md` | 7/10 | Strategic decisions, not day-to-day coding |
| `qa-four-modes` | `agents/skills/qa-four-modes/SKILL.md` | 6/10 | Son QA's skill, not Hoàng's primary |
| `postgresql-rls-architecture` | (reference in multi-tenant) | 8/10 | Covered by multi-tenant-schema-design |

---

## Installation Script

```bash
#!/bin/bash
# Install Hoàng's P0-P1 skills

SKILLS_DIR=~/.claude/skills

# P0 Skills (already in repo, verify paths)
echo "Installing P0 skills..."
mkdir -p $SKILLS_DIR/code-review-excellence
cp -r e:\SuperAgent\agents\skills\code-review-excellence/* $SKILLS_DIR/code-review-excellence/

mkdir -p $SKILLS_DIR/tdd-best-practices
cp e:\SuperAgent\agents\skills\tdd-best-practices\SKILL.md $SKILLS_DIR/tdd-best-practices/

mkdir -p $SKILLS_DIR/multi-tenant-schema-design
cp e:\SuperAgent\agents\skills\multi-tenant-schema-design\SKILL.md $SKILLS_DIR/multi-tenant-schema-design/

# P1 Skills
echo "Installing P1 skills..."
mkdir -p $SKILLS_DIR/dotnet-backend
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend\SKILL.md $SKILLS_DIR/dotnet-backend/

mkdir -p $SKILLS_DIR/dotnet-backend-patterns
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\dotnet-backend-patterns\SKILL.md $SKILLS_DIR/dotnet-backend-patterns/

mkdir -p $SKILLS_DIR/csharp-pro
cp e:\SuperAgent\agents\skills\antigravity-awesome-skills\skills\csharp-pro\SKILL.md $SKILLS_DIR/csharp-pro/

mkdir -p $SKILLS_DIR/api-chaos-testing
cp e:\SuperAgent\agents\skills\api-chaos-testing\SKILL.md $SKILLS_DIR/api-chaos-testing/

# P2 Skills
echo "Installing P2 skills..."
mkdir -p $SKILLS_DIR/deployment-excellence
cp e:\SuperAgent\agents\skills\deployment-excellence\SKILL.md $SKILLS_DIR/deployment-excellence/

echo "Installation complete! Installed 8 skills for Hoàng."
echo "Verify with: ls $SKILLS_DIR"
```

---

## Agent L2 Cache Update

Update `agents/dev/hoang-dev-net.md` reference section:

```markdown
## 📚 reference_Memory

- [C#/.NET Battle-Tested Patterns](../tmp/ram/hoang-dev-net/dotnet-patterns.md) ← đọc khi bắt đầu .NET module
- **SKILL:** `../../.agents/skills/code-review-excellence/SKILL.md` ← Code review standards
- **SKILL:** `~/.claude/skills/tdd-best-practices/SKILL.md` ← RED-GREEN-REFACTOR cycle
- **SKILL:** `~/.claude/skills/multi-tenant-schema-design/SKILL.md` ← Tenant isolation patterns
- **SKILL:** `~/.claude/skills/dotnet-backend/SKILL.md` ← ASP.NET Core 8+ patterns
- **SKILL:** `~/.claude/skills/dotnet-backend-patterns/SKILL.md` ← DI, async, caching
- **SKILL:** `~/.claude/skills/csharp-pro/SKILL.md` ← Modern C# features
- **SKILL:** `~/.claude/skills/api-chaos-testing/SKILL.md` ← Edge cases, RLS testing
- **SKILL:** `~/.claude/skills/deployment-excellence/SKILL.md` ← Ship workflow

- **TOOL: Write** — Ghi artifact ra disk. Mọi output ĐỀU PHẢI lưu file, không chỉ print ra chat.
```

---

## Workflow Integration

### Before Code Review (Self-Review)
```bash
# 1. Run TDD cycle
/tdd-best-practices

# 2. Check tenant isolation
/multi-tenant-schema-design

# 3. Self-review before Mộc
/review
```

### Before QA Gate
```bash
# 1. Chaos testing
/api-chaos-testing

# 2. Coverage check
dotnet test /p:CollectCoverage=true /p:CoverageReporter=lcov
# Verify: ≥80% unit, ≥70% integration
```

### Ship to PR
```bash
/deployment-excellence
```

---

## Success Metrics

After installation, Hoàng should achieve:

✅ **W1 (+20đ):** Module hoàn thành đúng deadline, test 80%+ coverage, Mộc code review PASS lần đầu
✅ **W2 (+10đ):** Zero contract drift với FE (Xuân verify PASS)
✅ **Avoid P0 (-30đ):** No hardcoded secrets, no RLS bypass
✅ **Avoid P1 (-20đ):** No contract drift, no async void in production
✅ **Avoid P2 (-15đ):** No hollow tests, no tenant isolation gaps
✅ **Avoid P3 (-10đ):** No TODO at validate, no missing criteria

---

## Next Steps

1. **Install P0 skills** (3 skills, 5 minutes)
2. **Test workflows** (run `/review` on existing PR, run `/tdd-best-practices` on test file)
3. **Install P1 skills** (4 skills, 10 minutes)
4. **Update agent L2 cache** (add skill references to `hoang-dev-net.md`)
5. **Install P2 skills** (1 skill, optional)

---

## Skill Factory Usage

For creating new skills or modifying existing ones:

```bash
# Use skill-creator
/skill-creator

# Or manually follow:
# - skill_factory/SKILL_BUILDING_MASTER_GUIDE.md
# - skill_factory/GSTACK_WRITING_STYLE.md (12 principles)
# - skill_factory/SKILL_STANDARD_V2.md (structure)
```

**Key principles for Hoàng's custom skills:**
- **Philosophy:** Role-play as backend architect (cathedral builder)
- **Tables:** Force completeness (error code → rescue map)
- **Multi-Path:** Happy + Nil + Error + Tenant isolation violation
- **Specific > Vague:** Concrete C# examples, not abstract
- **Suppressions:** Anti-noise (skip StyleCop warnings in tests)

---

## Report Metadata

**Skills Analyzed:** 1,100+ files
**Skills Recommended:** 8
**Installation Time:** ~20 minutes
**Token Budget:** ~50K tokens (analysis phase)
**Framework Coverage:** .NET 8+, C# 12, EF Core 8, xUnit, Moq, FluentAssertions

**Generated by:** Claude (Sonnet 4.5)
**Date:** 2026-03-16
**Report Path:** `e:\SuperAgent\INSTALL_REPORT_HOANG.md`
