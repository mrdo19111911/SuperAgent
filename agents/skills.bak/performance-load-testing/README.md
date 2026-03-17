# Performance & Load Testing

Load testing with k6/Gatling for production readiness validation.

## Purpose

Simulates Black Friday traffic to find breaking points BEFORE customers do. Validates production capacity, identifies bottlenecks, and enforces performance budgets.

## Target Agents

- **Sơn QA** (PRIMARY) — QA lead validates performance before deployment
- **Huyền FE-QA** — Frontend performance testing
- **Hưng** — Infrastructure scaling validation
- **Phúc SA** — Architecture bottleneck analysis

## When to Use

1. **Before deployment** — Validate staging can handle expected load
2. **After architecture changes** — Verify no performance regressions
3. **Multi-tenant isolation** — Spike one tenant, verify others unaffected
4. **Capacity planning** — Find breaking point for scaling decisions

## Core Mental Models

**CRITICAL Mode (Blocking Deploy):**
- DB pool exhausted → BLOCK
- OOM crashes → BLOCK
- Error rate > 1% → BLOCK
- P95 latency > 500ms → BLOCK

**INFORMATIONAL Mode (Optimize Later):**
- N+1 query patterns → Document
- Missing cache layers → Document
- Slow queries → Document

## Key Patterns

### Load Profiles
1. **Constant Rate** — Baseline capacity (100 RPS for 5 minutes)
2. **Ramp-Up** — Find breaking point (10 RPS → 500 RPS)
3. **Spike Test** — Sudden surge (50 RPS → 500 RPS in 10 seconds)
4. **Soak Test** — Sustained load (50 RPS for 1 hour, detect memory leaks)

### Tool Selection
- **k6** → CI/CD automation, API testing
- **Gatling** → Enterprise reporting, high load
- **JMeter** → GUI-based, multi-protocol
- **Locust** → Python teams

## Performance Budgets

| Metric | Target | Alert |
|--------|--------|-------|
| P95 latency | <500ms | >1000ms |
| Error rate | <1% | >5% |
| Throughput | >100 RPS | <10 RPS |

## Integration

**CI/CD:** `gates/performance.sh` runs k6, fails on budget violations

**Observability:** Monitor Golden Signals during test (latency, errors, saturation)

**Multi-tenant:** Verify RLS policies survive load spikes
