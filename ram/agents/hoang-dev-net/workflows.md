## Quick Ref (.NET Essentials)

### STMAI Compliance Checklist
```csharp
// 1. API Envelope - ALWAYS wrap responses
public class BaseResponse<T>
{
    public bool Success { get; set; }
    public T Data { get; set; }
    public ResponseMeta Meta { get; set; }
}

// 2. Multi-Tenancy - EVERY query filters by tenantId
var orders = await context.Orders
    .Where(o => o.TenantId == tenantId && o.Status == "Paid")
    .ToListAsync();

// 3. Soft Delete - NEVER use context.Remove()
order.DeletedAt = DateTime.UtcNow;
await context.SaveChangesAsync();

// 4. Error Codes - SCREAMING_SNAKE_CASE
return Problem(
    statusCode: 400,
    title: "INVALID_ORDER_STATUS",
    detail: "Order must be DRAFT to cancel"
);
```

### Async Patterns (MUST Follow)
```csharp
// GOOD: async Task (can be awaited, exceptions propagate)
public async Task<OrderDto> CreateOrderAsync(CreateOrderRequest req)
{
    var order = new Order { ... };
    await context.Orders.AddAsync(order);
    await context.SaveChangesAsync();
    return mapper.Map<OrderDto>(order);
}

// BAD: async void (exception swallowed)
public async void ProcessOrder() { ... } // NEVER IN PRODUCTION

// GOOD: IServiceScopeFactory for scoped DbContext in singleton
public class KafkaConsumer : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // ... use dbContext
    }
}
```

### Kafka Integration (.NET)
```csharp
// DomainEvent<T> envelope (multi-tenant + traceable)
var domainEvent = new DomainEvent<OrderCreatedPayload>
{
    Id = Guid.NewGuid().ToString(),
    Type = "ORDER_CREATED",
    TenantId = tenantId,
    Timestamp = DateTime.UtcNow.ToString("o"), // ISO 8601
    CorrelationId = Activity.Current?.Id, // OpenTelemetry trace
    Data = new OrderCreatedPayload { OrderId = order.Id, Amount = order.Total }
};

await kafkaProducer.ProduceAsync("orders", new Message<string, string>
{
    Key = order.Id.ToString(),
    Value = JsonSerializer.Serialize(domainEvent)
});
```

### Test Patterns (xUnit + FluentAssertions)
```csharp
// Unit Test Template
[Fact]
public async Task CreateOrder_ValidInput_ReturnsOrderDto()
{
    // Arrange
    var mockRepo = new Mock<IOrderRepository>();
    var service = new OrderService(mockRepo.Object);
    var request = new CreateOrderRequest { TenantId = "tenant1", Items = [...] };

    // Act
    var result = await service.CreateOrderAsync(request);

    // Assert
    result.Should().NotBeNull();
    result.TotalPrice.Should().Be(100.50m);
    result.Items.Should().HaveCount(3);
    mockRepo.Verify(r => r.AddAsync(It.IsAny<Order>()), Times.Once);
}

// Integration Test with Tenant Isolation
[Fact]
public async Task GetOrders_MultiTenant_IsolatesByTenantId()
{
    // Arrange: Create orders for 2 tenants
    await TestDataFactory.CreateOrder(tenantId: "tenant1");
    await TestDataFactory.CreateOrder(tenantId: "tenant2");

    // Act: Query for tenant1
    var result = await service.GetOrdersAsync("tenant1");

    // Assert: Only tenant1 orders returned
    result.Should().HaveCount(1);
    result.All(o => o.TenantId == "tenant1").Should().BeTrue();
}
```

### Gates Integration
```bash
# Pre-commit validation (run before git commit)
bash gates/validate.sh modules/financial-module  # Build + tsc + tests + no TODO
bash gates/security.sh modules/financial-module  # Secrets scan + dep audit
bash gates/commit.sh financial-module "feat: add order reconciliation"
```

---


## Current Focus (Sprint 12)

**Active Tasks:**
- T4_51: Embedded financial reconciliation module (15 SP, due 2026-03-20)
- Kafka consumer retry logic with dead-letter queue (DLQ)
- Performance optimization: reduce EF Core query N+1 in reporting module

**Learning Goals:**
- Master CQRS pattern for read-heavy reporting queries
- Implement GraphQL BFF for FE data aggregation (Lan collaboration)
- Study Azure Service Bus vs Kafka tradeoffs (Nam consultation)

---
