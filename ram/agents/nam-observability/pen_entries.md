## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Repeat)

1. **Missing tenantId in logs** (2026-02-18, -30, BUG-794)
   - Multi-tenant incident impossible to debug
   - Fix: EVERY log line MUST include `tenantId` field
   - Validator: `grep -r 'log\.' | grep -v tenantId` = FAIL

2. **No health check endpoint** (2026-02-25, -30, BUG-808)
   - Service down, K8s kept routing traffic
   - Fix: MUST have `/health` endpoint with DB + Kafka checks
   - Validator: `curl /health` returns 200 with component status

### P1 HIGH (Learn From)

3. **Wrong root cause analysis** (2026-03-05, -20, BUG-821)
   - Blamed backend when Kafka lag was root cause
   - Fix: ALWAYS check Kafka consumer lag FIRST
   - Cross-check: Correlate timestamp spikes across metrics

4. **Alert threshold too wide** (2026-03-10, -20, BUG-829)
   - P95 > 60s alert → SLA breach before notification
   - Fix: P95 latency alert MUST be < 1s for critical paths
   - Research: P95 < 500ms standard for user-facing APIs

5. **Missing correlationId** (2026-03-12, -15, BUG-834)
   - Async flow impossible to trace across services
   - Fix: Propagate `correlationId` through Kafka headers + HTTP
   - Pattern: `X-Correlation-ID` header in all service calls

### P2 MEDIUM (Avoid)

6. **Metrics endpoint not secured** (2026-02-20, -10, BUG-801)
   - `/metrics` exposed sensitive tenant counts
   - Fix: Internal-only endpoint or scrape from sidecar

7. **Log level misconfiguration** (2026-02-28, -10, BUG-812)
   - INFO logs in production → 10GB/day storage cost
   - Fix: Production = ERROR + WARN only, unless debug enabled

8. **No structured logging** (2026-03-01, -10, BUG-816)
   - Grep-based debugging inefficient
   - Fix: JSON logs with consistent schema

9. **Alert fatigue** (2026-03-08, -8, BUG-827)
   - 50 alerts/day, team ignored critical ones
   - Fix: Alert only on actionable metrics, use severity levels

10. **Missing trace sampling config** (2026-03-14, -8, BUG-837)
    - 100% trace sampling → 500GB/month Jaeger cost
    - Fix: Sample 10% in production, 100% for errors

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **15-min root cause during hotfix** (2026-03-02, +20, WIN-045)
   - Pipeline 6: Identified RLS policy missing index from Grafana logs
   - Impact: Tung implemented fix in 10 min total
   - Method: Filtered by `SECURITY` log prefix → Found slow query

2. **Zero-rework observability setup** (2026-02-22, +15, WIN-038)
   - Pipeline 5: OTel + Prometheus + Grafana passed Thanh Lai audit first time
   - Checklist compliance: 100% (all 5 items)
   - Thanh feedback: "Production-ready monitoring"

3. **Pre-user latency spike detection** (2026-03-06, +10, WIN-050)
   - Alert caught P95 > 500ms before user complaint
   - Root cause: DB connection pool exhausted
   - Prevention: Auto-scaling rule added

4. **Multi-tenant incident isolation** (2026-02-16, +10, WIN-032)
   - `tenantId` logging helped isolate bug to single tenant
   - Avoided emergency tenant-wide rollback
   - Impact: 99.9% tenants unaffected

5. **Kafka lag early warning** (2026-03-11, +8, WIN-055)
   - Alert at 8k lag threshold → Prevented consumer timeout cascade
   - Tung scaled consumers before incident
   - Prevention: Saved 30min downtime

_Full WIN history: See LEDGER_

---
