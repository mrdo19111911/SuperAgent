## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Repeat)

1. **Contract Violation - API Payload Change** (2026-02-20, -30, BUG-734)
   - Changed response struct without updating CONTRACT_DRAFT.md → broke FE parsing
   - Fix: NEVER modify API contracts without Thesis/Anti-Thesis/Synthesis approval
   - Nash penalty: M1 multiplier (Builder bypassed contract)

2. **Goroutine Leak in Production** (2026-02-15, -30, BUG-721)
   - Channel not closed + no `ctx.Done()` check → 500 zombie goroutines after 1 hour
   - Fix: ALWAYS use `errgroup.WithContext(ctx)` for spawned goroutines
   - MUST call `cancel()` in defer after `ctx, cancel := context.WithCancel()`

### P1 HIGH (Learn From)

3. **Kafka Offset Commit Before Processing** (2026-02-28, -20, BUG-756)
   - Auto-commit enabled → message lost on crash mid-processing
   - Fix: Manual commit AFTER successful processing: `session.MarkMessage(msg, "")`
   - Idempotency check REQUIRED: `repo.EventProcessed(ctx, event.ID)`

4. **Connection Pool Exhaustion** (2026-03-01, -20, BUG-762)
   - Forgot `defer rows.Close()` in 3 query functions → pool exhausted in 30 minutes
   - Fix: ALWAYS defer resource cleanup immediately after acquiring (rows, stmt, conn)

5. **Race Condition on Shared Map** (2026-03-05, -20, BUG-778)
   - Used plain `map[string]int` in concurrent handlers → data race detected
   - Fix: Use `sync.Map` or `sync.RWMutex` for shared state

### P2 MEDIUM (Avoid)

6. **Hollow Test Detected by Mộc** (2026-02-25, -15, BUG-749)
   - Test passed but assertions missing → fake coverage
   - Fix: Every test MUST have explicit assertions (testify/assert)

7. **Missing Error Check from Goroutine** (2026-03-03, -15, BUG-771)
   - Goroutine returned error but never checked → silent failure
   - Fix: Use `errgroup.WithContext(ctx)` for error propagation

8. **API Envelope Not Used** (2026-02-18, -15, BUG-729)
   - Returned raw struct instead of `{ "success": true, "data": {} }`
   - Fix: ALWAYS use envelope pattern (STMAI compliance)

9. **Soft Delete Violation** (2026-03-07, -10, BUG-785)
   - Used `DELETE FROM users WHERE id = ?` instead of soft delete
   - Fix: ALWAYS `UPDATE users SET deleted_at = NOW() WHERE id = ?`

10. **Missing Tenant Isolation in Query** (2026-03-09, -10, BUG-791)
    - Query without `WHERE tenant_id = ?` → data leak across tenants
    - Fix: EVERY query MUST include tenant_id filter (multi-tenancy requirement)

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **IoT Event Streaming Pipeline** (2026-03-10, +30, FEATURE-89)
   - Kafka consumer with idempotency: 10K events/sec, zero duplicates, zero goroutine leaks
   - Mộc code review: PASS (no findings)
   - Temporal workflow: durable retry with exponential backoff

2. **Multi-Tenant RLS Implementation** (2026-03-02, +25, FEATURE-82)
   - PostgreSQL RLS policies + `SET LOCAL app.tenant_id` middleware
   - 100% tenant isolation verified by chaos testing
   - Performance: <10ms latency for 100M row table (partitioned by tenant_id)

3. **Table-Driven Test Suite** (2026-02-22, +20, REFACTOR-45)
   - 85% coverage with table-driven tests for business logic
   - Son QA approval: "Best Go test patterns in team"

4. **Graceful Shutdown Pattern** (2026-02-27, +15, INFRA-67)
   - Context cancellation → drain in-flight requests → close DB pool
   - Zero dropped requests during rolling deploy

5. **Kafka Idempotency Guard** (2026-03-06, +15, FEATURE-85)
   - `event_processing_log` table with unique constraint on event_id
   - Duplicate events skipped without processing → crash-safe

_Full history: See LEDGER_

---
