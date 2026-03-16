# Observability & Monitoring

**Version:** 1.0.0
**Category:** Production Operations
**Stack:** Prometheus, Grafana, OpenTelemetry, Loki
**Target Agents:** Nam (PRIMARY), Hung, Thanh Lai, Tung

---

## Overview

Enterprise-grade observability stack implementing Google's Golden Signals (Latency, Traffic, Errors, Saturation) with distributed tracing, structured logging, and SLO-based alerting.

### Philosophy

You are a paranoid SRE who monitors everything because production WILL fail. When it does, you need evidence to fix it fast.

**Critical Rule:** No alert without runbook. Every alert must tell the engineer: what broke, why, and what to do next.

---

## Quick Start

### 1. Install Stack

```bash
# Prometheus + Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus --namespace monitoring --create-namespace

# Loki + Promtail
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack --namespace monitoring

# Jaeger (for tracing)
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/crds/jaegertracing.io_jaegers_crd.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/service_account.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/operator.yaml
```

### 2. Add Metrics to Your App

```typescript
// metrics.ts
import { register, Counter, Histogram } from 'prom-client';

export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'endpoint', 'status', 'tenant_id'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request latency',
  labelNames: ['method', 'endpoint', 'tenant_id'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### 3. Configure Alerts

```yaml
# alerts.yml
groups:
  - name: api_alerts
    rules:
      - alert: HighErrorRate
        expr: |
          (sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m]))) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 1%"
          runbook: "https://wiki.internal/runbooks/high-error-rate"
```

### 4. Add Distributed Tracing

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## Core Concepts

### Golden Signals (Google SRE)

1. **Latency** — P95 response time < 500ms
2. **Traffic** — Requests per second
3. **Errors** — Error rate < 0.1%
4. **Saturation** — DB connection pool, memory, CPU

### Two-Pass Workflow

**Pass 1: CRITICAL (Blocks Deploy)**
- Error rate alert (> 1% over 5m)
- P95 latency alert (> 500ms)
- Kafka consumer lag alert (> 10k messages)
- Health check down

**Pass 2: INFORMATIONAL (Non-Blocking)**
- Grafana dashboards for debugging
- LogQL queries for root cause analysis
- Historical trend visualization

### Multi-Tenant Isolation

Every metric MUST have `tenant_id` label:

```typescript
httpRequestsTotal.inc({
  tenant_id: req.user.tenant_id,
  endpoint: '/orders',
  status: 200
});
```

**Why:** When error rate spikes, you can isolate to specific tenant → faster root cause.

---

## Metrics Catalog

| Metric | Type | Labels | Purpose |
|--------|------|--------|---------|
| `http_requests_total` | Counter | method, endpoint, status, tenant_id | Total requests |
| `http_request_duration_seconds` | Histogram | method, endpoint, tenant_id | P50/P95/P99 latency |
| `db_connections_active` | Gauge | pool | Connection pool usage |
| `kafka_consumer_lag_seconds` | Gauge | topic, partition | Consumer lag |
| `job_processing_duration_seconds` | Histogram | job_type, status | Background job latency |

---

## Alert Severity Matrix

| Severity | Condition | Example | Response Time |
|----------|-----------|---------|---------------|
| **CRITICAL** | Data loss, RLS bypass, downtime | Service down, error rate > 5% | < 15 minutes |
| **WARNING** | Performance degradation | P95 latency > 500ms | < 1 hour |
| **INFO** | Trend, capacity planning | Disk 70% full | Next business day |

---

## Common Scenarios

### Scenario 1: High Error Rate Alert

**Alert fires:** `HighErrorRate: 5% errors over 5 minutes`

**Response:**
1. Check Grafana "Error Rate" panel → Which endpoint?
2. Query Loki: `{job="api"} | json | endpoint="/orders" | level="error"`
3. Find `trace_id` in logs → Open Jaeger trace
4. Identify slow span (e.g., DB query timeout)
5. Root cause in < 5 minutes

### Scenario 2: Kafka Consumer Lag Spike

**Alert fires:** `KafkaConsumerLag: 50,000 messages`

**Response:**
1. Check consumer throughput metric
2. Check BE server CPU/memory (overloaded?)
3. Scale consumers horizontally
4. Monitor lag decrease

---

## Best Practices

### Do's
- Always include `tenant_id` in metrics/logs/traces
- Set alert thresholds after load testing
- Use P95 for latency alerts (not P99)
- Link every alert to runbook
- Use structured JSON logging

### Don'ts
- Don't alert on single request failure
- Don't use unbounded label values (user IDs)
- Don't alert on CPU > 80% (normal spike)
- Don't use `:latest` tags in production
- Don't skip health checks

---

## Integration with Nash Framework

### Pipeline 5 (Post-Deploy Monitoring)
Nam sets up:
- Prometheus metrics endpoint
- Grafana Golden Signals dashboard
- Alert rules (error rate, latency, lag)
- Health check endpoint

### Pipeline 6 (Hotfix Support)
Nam provides root cause analysis via:
- Loki log aggregation (filter by tenant, endpoint)
- Jaeger distributed tracing (find slow spans)
- Prometheus metrics (error rate by tenant)

Output: Root cause + affected scope → Tung Diag

---

## Troubleshooting

### Metrics Not Showing in Grafana

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-server 9090:80
# Visit http://localhost:9090/targets
# Verify scrape status = UP
```

### Traces Not Appearing in Jaeger

```bash
# Check OpenTelemetry SDK logs
# Ensure OTEL_EXPORTER_JAEGER_ENDPOINT is set correctly
# Verify Jaeger collector is running
kubectl get pods -n observability | grep jaeger
```

### Alert Not Firing

```bash
# Test PromQL expression in Prometheus UI
# Check alert rules loaded: /rules
# Verify Alertmanager is configured
```

---

## References

- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Google SRE Book — Monitoring](https://sre.google/sre-book/monitoring-distributed-systems/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)

---

**Maintained by:** Nam (Observability Engineer)
**Last Updated:** 2026-03-16
