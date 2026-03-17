---
name: performance-load-testing
version: 1.0.0
description: |
  Load testing with k6 for production readiness validation. Simulates Black Friday traffic to find breaking points before users do.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
mode: TWO_PASS
---

# Performance & Load Testing

Load testing with k6 to validate production readiness. Break systems BEFORE customers do.

---

## Philosophy

You are a chaos engineer simulating Black Friday at 11:59 PM. Your job is to break the system BEFORE customers do.

**Three mental models:**

1. **CRITICAL Mode (Blocking Deploy)**: Bouncer. If system crashes under expected load (DB pool exhausted, OOM, circuit breaker triggered), deployment is BLOCKED.

2. **INFORMATIONAL Mode (Optimize Later)**: Performance consultant. Find N+1 queries, missing cache layers, slow indexes. Document, but don't block deploy.

3. **BASELINE Mode (Before Changes)**: Archivist. Establish p95 latency and throughput benchmarks BEFORE code changes. Detect regressions.

**Critical rule**: Test BEFORE merge, not after production. Load testing in staging prevents production fires.

---

## Prime Directives

1. **Load test BEFORE merge (not after production).** Staging must have production-like specs (CPU, RAM, DB size). Testing localhost = useless.

2. **Test multi-tenant isolation under load.** Spike traffic to tenant A (1000 RPS), verify tenant B unaffected (p95 latency stable).

3. **Match production traffic patterns.** Real traffic = 80% GET, 15% POST, 5% DELETE. Match peak hour patterns.

4. **Monitor Golden Signals during test.** Watch latency, errors, saturation (DB connections, memory) in real-time. Grafana dashboard mandatory.

5. **Use production-like data volumes.** Test with 1M database rows, not 10. Slow queries hide in empty databases.

6. **Set performance budgets with thresholds.** P95 latency < 500ms, error rate < 1%, throughput > 1000 RPS. Fail CI/CD if violated.

7. **Run soak tests (sustained load for 1+ hour).** Memory leaks and connection pool exhaustion only appear over time.

**Anti-patterns:**
- Testing localhost (use staging environment)
- Single-threaded scripts (use concurrent VUs)
- Ignoring database (most bottlenecks are DB queries)
- No error rate thresholds (100% failure still "passes")

---

## Tool Comparison Table

| Tool | Best For | Language | Protocol | Pros | Cons |
|------|----------|----------|----------|------|------|
| **k6** | API load testing | JavaScript | HTTP/gRPC/WebSocket | Scripting flexibility, Grafana integration, CI/CD friendly | No GUI |
| **Gatling** | High-load simulation | Scala DSL | HTTP/JMS/WebSocket | Detailed reports, async engine | JVM overhead |
| **JMeter** | GUI-based testing | Java | Multi-protocol | Enterprise adoption, plugin ecosystem | Resource-heavy |
| **Locust** | Python scripting | Python | HTTP | Easy Python scripts, web UI | Single-machine limits |

**Selection:** CI/CD automation → k6, Java ecosystem → Gatling, Python team → Locust

---

## Two-Pass Workflow

### Pass 1: CRITICAL (Blocking Deploy)

**These issues BLOCK deployment:**

1. **Database connection pool exhausted** — App crashes with "ECONNREFUSED"
2. **OOM crashes under load** — "JavaScript heap out of memory"
3. **Error rate > 1%** — More than 1 in 100 requests fail
4. **P95 latency > SLA threshold** — Exceeds 500ms (or your SLA)
5. **Circuit breaker triggered** — Downstream service failures cascade

**Evidence required:** k6 report, Grafana screenshots, error logs.

**STOP deployment if any CRITICAL issue found.**

### Pass 2: INFORMATIONAL (Optimize Later)

**Document for future optimization (non-blocking):**

1. **N+1 query patterns** — Single request triggers 100 DB queries
2. **Missing cache layers** — Redis cache bypassed
3. **Suboptimal indexes** — Slow queries (>100ms) without indexes
4. **Unnecessary serialization** — JSON parsing in hot path
5. **Large payload transfers** — API returns 10MB when 10KB suffices

**Action:** Create GitHub issues with perf labels. Fix in future sprints.

---

## Load Test Example (k6)

```javascript
// k6-constant-rate.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-arrival-rate',
      rate: 100, duration: '5m', preAllocatedVUs: 50, maxVUs: 200,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],  // Error rate < 1%
  },
};

export default function () {
  const tenantId = `tenant-${__VU % 10}`;
  const res = http.post('https://api.example.com/v1/orders', JSON.stringify({
    tenantId, items: [{ sku: 'WIDGET-123', qty: 2 }]
  }), { headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': tenantId } });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Run:** `k6 run k6-constant-rate.js --out json=baseline-results.json`

---

### Load Profile Patterns

| Profile | Purpose | Pattern | Success Criteria |
|---------|---------|---------|------------------|
| **Ramp-Up** | Find breaking point | 10→100→300→500 RPS over 20min | Identify capacity limit |
| **Spike** | Sudden traffic surge | 50→500 RPS in 10s | System recovers, no OOM |
| **Soak** | Detect memory leaks | 50 RPS for 1+ hour | Memory stable over time |
| **Stress** | Push to failure | Ramp until errors > 5% | Find max throughput |

**Ramp-Up Example:**
```javascript
stages: [
  { duration: '2m', target: 100 },   // Ramp to 100 RPS
  { duration: '5m', target: 100 },   // Hold
  { duration: '2m', target: 300 },   // Ramp to 300 RPS
  { duration: '5m', target: 300 },   // Hold
  { duration: '2m', target: 0 },     // Ramp down
]
```

**Spike Example:**
```javascript
stages: [
  { duration: '1m', target: 50 },    // Normal load
  { duration: '10s', target: 500 },  // SPIKE to 10x
  { duration: '3m', target: 500 },   // Hold spike
  { duration: '10s', target: 50 },   // Drop back
]
```

---

## Bottleneck Analysis

| Symptom | Root Cause | Fix | Prevention |
|---------|------------|-----|------------|
| **P95 latency 5s @ 500 users** | DB connection pool size = 10 | Increase pool to 50 | Load test before merge |
| **OOM crash @ 1000 RPS** | Memory leak in cache (no TTL eviction) | Fix TTL eviction logic | Soak test (1h sustained) |
| **503 errors @ spike** | Circuit breaker threshold too aggressive | Tune threshold (50% → 80%) | Spike test in staging |
| **N+1 queries slow down API** | Missing `include` in query | Add eager loading | Query analysis in logs |
| **Redis pool exhausted** | No connection pooling | Use singleton client | Code review |

**Real production bug:**
- **Date:** 2024-11-15
- **Symptom:** API p95 latency 200ms → 5s at 500 concurrent users
- **Root cause:** PostgreSQL connection pool size = 10 (default), exhausted under load
- **Evidence:** `ECONNREFUSED` errors in logs, Grafana showed db_connections_active = 10/10
- **Fix:** Increased pool size to 50 in database.yml

---

## Multi-Tenant Isolation Testing

**Pattern:** Spike tenant A traffic (10→500 RPS), verify tenant B unaffected (p95 < 500ms).

Use k6 scenarios with different `exec` functions and tenant-specific thresholds:
```javascript
thresholds: { 'http_req_duration{tenant:tenant-B}': ['p(95)<500'] }
```

---

## Meta-Instructions (Stopping Policy)

1. **Run baseline FIRST** (before code changes) → document p95, p99, throughput
2. **After changes:** Re-run identical test, compare vs baseline
3. **If regression > 10%:** STOP and investigate (baseline p95=200ms, new=250ms = +25% → BLOCK)
4. **Max 3 optimization iterations per PR** (find → fix → verify → escalate if still failing)
5. **Save results:** `artifacts/load-test-report.md`

**Escalate after 3 iterations:** Phuc SA (architecture), Hung (infrastructure), or Dung PM (timeline).

---

## Quick Reference

**k6 commands:**
```bash
k6 run script.js --out json=results.json
k6 run -e API_URL=https://staging.example.com script.js
k6 cloud script.js  # Distributed
```

**Common thresholds:**
```javascript
thresholds: {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.01'],  // Error rate < 1%
  http_reqs: ['rate>100'],  // Throughput > 100 RPS
}
```

---

## Checklist

**Before:** Staging = production specs, DB seeded (1M+ rows), RLS enabled, APM enabled, baseline documented
**During:** Monitor CPU/memory/DB in Grafana, watch error logs, check slow queries (>100ms)
**After:** P95 < 500ms, errors < 1%, no leaks, report saved, bottlenecks documented, issues created

---

## When NOT to Load Test

Skip load testing for: unit tests, localhost, UI-only changes, documentation updates, prototype/POC code.

**If unsure:** Ask PM (Dung) or QA lead (Son).

---

**END OF SKILL**
