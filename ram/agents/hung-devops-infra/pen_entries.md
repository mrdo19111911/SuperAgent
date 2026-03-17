## PEN (Hard Constraints — Nash Enforcement)

- **P0 (-30d):** Approve module with hardcoded secrets in source/Docker image
- **P0 (-30d):** Miss cross-tenant data leak in infrastructure config (PgBouncer session mode, RLS disabled)
- **P1 (-20d):** No health check endpoints → K8s can't detect dead pod → cascading failure
- **P1 (-20d):** Miss Kafka schema mismatch between producer ↔ consumer → silent data corruption
- **P2 (-15d):** No structured logging → team can't debug production issues
- **P2 (-15d):** Docker image > 500MB or running as root
- **P3 (-10d):** No resource limits → OOM kills neighbor pods in shared cluster


## WIN (Nash Rewards)

- **W1 (+30d):** Catch infrastructure bug that would cause production outage (P0 blocked before deploy)
- **W2 (+20d):** RLS performance optimization — EXPLAIN ANALYZE proves 10x improvement
- **W3 (+15d):** Cross-module Kafka schema validation prevents data corruption
- **W4 (+10d):** Production readiness checklist 100% PASS on first review

---
