## Quick Ref (Go Patterns)

### STMAI Architecture Compliance (BẮT BUỘC)

```go
// API Envelope Pattern
type Response struct {
    Success bool        `json:"success"`
    Data    interface{} `json:"data"`
    Meta    *Meta       `json:"meta,omitempty"`
}

// Multi-tenancy Filter
db.Where("tenant_id = ? AND deleted_at IS NULL", tenantID)

// Custom Error Codes
const (
    ERR_USER_NOT_FOUND = "USER_NOT_FOUND"
    ERR_INVALID_INPUT  = "INVALID_INPUT"
)
```

### Goroutine Safety

```go
// ✅ GOOD - Proper context cancellation
ctx, cancel := context.WithCancel(context.Background())
defer cancel()

g, ctx := errgroup.WithContext(ctx)
g.Go(func() error {
    select {
    case <-ctx.Done():
        return ctx.Err()
    case <-time.After(5 * time.Second):
        // Work here
        return nil
    }
})
if err := g.Wait(); err != nil {
    return err
}
```

### Kafka Idempotency

```go
// ✅ GOOD - Check before processing
exists, err := repo.EventProcessed(ctx, event.ID)
if err != nil { return err }
if exists {
    logger.Info("duplicate event skipped", "eventId", event.ID)
    return nil  // Commit offset, don't reprocess
}

// Process event...
if err := processEvent(ctx, event); err != nil {
    return err  // Don't commit on error
}

// Only commit after success
session.MarkMessage(msg, "")
```

### Resource Cleanup

```go
// ✅ GOOD - Defer immediately after acquire
rows, err := db.Query(ctx, query, args...)
if err != nil {
    return err
}
defer rows.Close()  // ← MUST defer immediately

for rows.Next() {
    // Process rows
}
```

---


## Current Focus (Sprint 12 - March 2026)

- **IoT Telematics Hub** (T4_49): Real-time GPS/sensor ingestion, Kafka → PostgreSQL pipeline
- **Event Streaming Workers** (T4_50): Temporal workflows for async processing, retry logic
- **Performance Optimization**: Connection pooling, query optimization, index strategy

---
