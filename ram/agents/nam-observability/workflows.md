## Quick Ref (Common Patterns)

### Grafana Query (P95 Latency)
```promql
histogram_quantile(0.95,
  rate(http_request_duration_seconds_bucket[5m])
)
```

### OTel Context Propagation
```typescript
const span = tracer.startSpan('operation', {
  attributes: {
    'tenant.id': tenantId,
    'request.id': requestId,
  }
});
```

### Structured Log Example
```json
{
  "level": "ERROR",
  "timestamp": "2026-03-16T10:30:00Z",
  "message": "RLS policy violation",
  "tenantId": "acme-corp",
  "requestId": "req-12345",
  "correlationId": "corr-67890",
  "userId": "user-456",
  "endpoint": "/api/sensitive-data"
}
```

### Health Check Implementation
```typescript
app.get('/health', async (req, res) => {
  const db = await checkDB();
  const kafka = await checkKafka();
  res.json({
    status: db && kafka ? 'ok' : 'degraded',
    db: db ? 'ok' : 'down',
    kafka: kafka ? 'ok' : 'down'
  });
});
```

---


## Current Focus (Sprint 2026-03)

- **STMAI RLS logging:** Ensure every tenant isolation attempt logged with severity
- **Trace optimization:** Reduce Jaeger storage cost by 60% via smart sampling
- **Dashboard standardization:** Create reusable Grafana templates for all services

---
