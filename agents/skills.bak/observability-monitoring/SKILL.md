---
name: observability-monitoring
version: 1.0.0
description: |
  Prometheus + Grafana setup with SLO/SLI alerting for Golden Signals monitoring.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
---

# Observability & Monitoring

Production-grade observability: metrics, alerts, and Golden Signals dashboards.

---

## Philosophy

You are not a dashboard decorator. You are a paranoid SRE who monitors everything because production WILL fail, and when it does, you need evidence to fix it fast.

Your mental model:
* **CRITICAL mode**: You are a smoke detector. Alert on real fires (P0/P1 incidents), not burnt toast. Every alert must have a runbook, or it's noise.
* **INFORMATIONAL mode**: You are a diagnostic lab. Provide dashboards for debugging, but never wake humans at 3am for curiosity.

Critical rule: **No alert without runbook.** If alert fires → human must know: what broke, why, what to do next.

---

## Prime Directives

1. **Golden Signals First.** Monitor latency, traffic, errors, saturation (Google SRE). These 4 metrics predict 95% of outages. Everything else is secondary.

2. **Every metric has a label.** Don't emit `http_requests_total`. Emit `http_requests_total{service="api",tenant_id="t123",endpoint="/orders"}`. Labels = multi-tenant isolation + precise alerting.

3. **Alert thresholds must survive load testing.** If P95 latency > 500ms triggers alert, but load tests show 600ms under normal traffic → false positive. Set thresholds after measuring reality.

4. **Logs are structured JSON.** Include `trace_id`, `tenant_id`, `request_id` in every log line for correlation.

5. **Distributed traces propagate context.** `trace_id` must flow: API → Kafka → Worker → DB. Broken chain = unsolvable mystery.

---

## Golden Signals Table

| Signal | Metric | Threshold | Alert Severity |
|--------|--------|-----------|----------------|
| **Latency** | P95 request duration | > 500ms for 5m | P1 (warning) |
| **Traffic** | Request rate | N/A (informational) | - |
| **Errors** | Error rate (5xx) | > 1% for 5m | P0 (critical) |
| **Saturation** | DB connection pool usage | > 80% for 5m | P1 (warning) |

---

## Two-Pass Workflow

**Pass 1: CRITICAL (P0/P1 Alerts) — Blocks Deploy**

For every service, configure:

1. **Error Rate Alert** — `rate > 1%` over 5 minutes
2. **P95 Latency Alert** — `p95 > 500ms` over 5 minutes
3. **Health Check Down** — `/health` returns non-200
4. **Resource Saturation** — DB connections > 80%

**If any missing:** Deploy fails. No exceptions.

**Pass 2: INFORMATIONAL (Dashboards) — Non-Blocking**

Build Grafana dashboards for debugging:
1. Request rate by endpoint (Traffic)
2. P50/P95/P99 latency breakdown (Latency)
3. Error count by status code (Errors)
4. Database connection pool usage (Saturation)

These are for root cause analysis, not alerting.

---

## Step 1: Prometheus Metrics

**Metric Types:** Counter (requests), Gauge (connections), Histogram (latency P95)

**Setup (Node.js):**

```typescript
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status', 'tenant_id'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency in seconds',
  labelNames: ['method', 'endpoint', 'tenant_id'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const tenantId = req.user?.tenant_id || 'unknown';
    httpRequestsTotal.inc({ method: req.method, endpoint: req.route?.path, status: res.statusCode, tenant_id: tenantId });
    httpRequestDuration.observe({ method: req.method, endpoint: req.route?.path, tenant_id: tenantId }, duration);
  });
  next();
});
```

---

## Step 2: Prometheus Alerting Rules

**alerts.yml:**

```yaml
groups:
  - name: api_alerts
    interval: 30s
    rules:
      # P0: Error rate > 1%
      - alert: HighErrorRate
        expr: |
          (
            sum(rate(http_requests_total{status=~"5.."}[5m]))
            /
            sum(rate(http_requests_total[5m]))
          ) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate ({{ $value | humanizePercentage }})"
          runbook: "https://wiki.internal/runbooks/high-error-rate"

      # P1: P95 latency > 500ms
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency {{ $value | humanizeDuration }}"
          runbook: "https://wiki.internal/runbooks/high-latency"

      # P0: Health check down
      - alert: ServiceDown
        expr: up{job="api-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
          runbook: "https://wiki.internal/runbooks/service-down"
```

---

## Step 3: Grafana Dashboard

**4 Golden Signals Panels:**
- **Traffic**: `sum(rate(http_requests_total[5m])) by (endpoint)`
- **Errors**: `sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))`
- **Latency P95**: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- **Saturation**: `db_connections_active / db_connections_max`

---

## Quick Reference: PromQL Queries

```promql
# P95 latency per endpoint
histogram_quantile(0.95,
  sum by(endpoint, le) (
    rate(http_request_duration_seconds_bucket[5m])
  )
)

# Error rate by tenant (multi-tenant isolation)
sum by(tenant_id) (
  rate(http_requests_total{status=~"5.."}[5m])
)
/
sum by(tenant_id) (
  rate(http_requests_total[5m])
)

# Top 5 slowest endpoints
topk(5,
  histogram_quantile(0.95,
    rate(http_request_duration_seconds_bucket[5m])
  )
)
```

---

## Extended Stack (Optional)

**Tracing**: OpenTelemetry + Jaeger (propagate `trace_id` via headers)
**Logs**: Loki + Promtail (query: `{job="api"} | json | tenant_id="t123"`)

---

## Meta-Instructions

**Never skip**: Prometheus metrics setup + Error rate alert (> 1% over 5m)

**Evidence you're done:**
1. `/metrics` endpoint returns Prometheus format
2. `http_requests_total` with `tenant_id` label
3. `http_request_duration_seconds` histogram configured
4. Alert rule for error rate + health check down
5. Grafana dashboard with 4 Golden Signals

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| Alert on every error | Alert fatigue, ignored pages | Alert on error rate > 1% (not single errors) |
| No `tenant_id` label | Can't isolate multi-tenant issues | Every metric must have `tenant_id` |
| Logs without `trace_id` | Can't correlate logs → traces | Include `trace_id` in every log line |
| No runbook link | Engineer wakes up, doesn't know what to do | Every alert must link to runbook |
| P99 latency alerts | Too noisy (outliers expected) | Use P95 or P50 instead |
| Metric names without units | `http_request_duration` — seconds? ms? | `http_request_duration_seconds` |
