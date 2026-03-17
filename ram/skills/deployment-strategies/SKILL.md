---
name: deployment-strategies
version: 2.0.0
description: |
  Risk-averse deployment strategies: Blue-Green, Canary, Rolling, Feature Flags.
  Always have rollback plan. Monitor metrics during rollout. Zero trust in untested code.
allowed-tools: [Bash, Read, Write, Edit, Grep, Glob]
---

# Deployment Strategies

## Philosophy

You are not here to ship fast. You are here to ship safely. Every deployment is a controlled experiment where the null hypothesis is "this will break production."

Your mental model shifts based on blast radius:

* **Low-Risk (Internal Tools, Dev):** You are a pragmatist. Rolling updates with health checks. Fast feedback, quick rollback if needed.
* **Medium-Risk (Staging, Non-Critical Production):** You are a careful operator. Canary with metrics validation. Progressive rollout with automatic rollback triggers.
* **High-Risk (Critical Production, Financial Systems):** You are a paranoid release engineer. Blue-Green with manual cutover. Full smoke tests before traffic switch. Database rollback plan mandatory.

Critical rule: **Never deploy without a rollback plan.** If you cannot articulate how to undo this deployment in <60 seconds, you are not ready to ship.

---

## Prime Directives

1. **Rollback is not optional.** Every deployment strategy must answer: "How do I undo this in <60 seconds?" If you can't answer, that's a P0 blocker.

2. **Health checks are your contract with production.** Specify: What does `/health/ready` validate? (DB connection? External API? Cache?) What does `/health/live` check? (Process alive? Memory under threshold?) When does K8s kill the pod? (failureThreshold × periodSeconds = max unhealthy time)

3. **Traffic has shadow paths.** Every deployment has three traffic paths:
   - **Happy path:** New version handles 100% traffic perfectly
   - **Degraded path:** New version handles partial traffic (10% canary) - what metrics validate success?
   - **Rollback path:** Traffic switches back to old version - what triggers auto-rollback? What's the manual procedure?

4. **Database migrations are deployment landmines.** If schema changes:
   - Backward-compatible migration required (new code reads old schema)
   - Deploy migration separately BEFORE code deploy
   - Test rollback scenario: old code + new schema must work
   - Never deploy breaking DB change + code in same release

5. **Feature flags > deployment strategies.** For high-risk features, prefer gradual feature enablement over traffic shifting:
   - Deploy code with feature OFF (dark launch)
   - Enable for internal users (10%), beta users (20%), full rollout (100%)
   - Rollback = flip flag, not redeploy

6. **Anti-patterns:**
   - ❌ Deploy breaking migration + code together
   - ❌ Remove column before code stops using it
   - ❌ Rename column without dual-write period

---

## Decision Tree: Pick Your Strategy

| Criteria | Strategy | Rationale | Rollback | Cost | Risk |
|----------|----------|-----------|----------|------|------|
| **Zero downtime + standard app** | **Rolling Update** | Default choice. Progressive pod replacement. | `kubectl rollout undo` (30-60s) | Low | Medium |
| **Instant rollback (<30s)** | **Blue-Green** | Service label switch = atomic cutover. | Switch service selector (10-30s) | High (2x resources) | Low |
| **Risk mitigation + metrics** | **Canary** | Progressive traffic shift with auto-rollback. | Auto-rollback on metrics | Medium (Flagger) | Very Low |
| **Feature + gradual rollout** | **Feature Flags** | Code deployed inactive. Enable by segment. | Flip flag (instant) | Low | Very Low |
| **Database schema change** | **Blue-Green + Flag** | Instant rollback + gradual migration. | Switch + flip flag | High | Low |

**GAP:** Breaking API change → use versioned endpoints (`/v1`, `/v2`) or API gateway routing.

---

## Blue-Green Deployment (Instant Rollback)

### When to Use

✅ Critical apps (payment, auth, data processing)
✅ Database schema changes
✅ Instant rollback required (<30s)

❌ Cost-sensitive apps (2× resources)

### Kubernetes Configuration

```yaml
# blue-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
spec:
  replicas: 5
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
        - name: app
          image: myapp:1.0.0
          ports:
            - containerPort: 3000

---
# green-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-green
spec:
  replicas: 5
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: app
          image: myapp:2.0.0
          ports:
            - containerPort: 3000

---
# service.yaml (THIS is what you switch)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # Switch to 'green' when ready
  ports:
    - port: 80
      targetPort: 3000
```

### Deployment Flow & Commands

```bash
# 1. Deploy green
kubectl apply -f green-deployment.yaml
kubectl wait --for=condition=available --timeout=5m deployment/myapp-green -n production

# 2. Smoke test green
GREEN_POD=$(kubectl get pod -n production -l version=green -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n production ${GREEN_POD} -- curl -f http://localhost:3000/health

# 3. ATOMIC CUTOVER - switch traffic
kubectl patch service myapp -n production -p '{"spec":{"selector":{"version":"green"}}}'

# 4. Monitor 5 min (error rates, latency)

# 5. Scale down blue (keep for rollback)
kubectl scale deployment/myapp-blue --replicas=0 -n production

# EMERGENCY ROLLBACK (instant)
kubectl patch service myapp -n production -p '{"spec":{"selector":{"version":"blue"}}}'
kubectl scale deployment/myapp-blue --replicas=5 -n production
```

---

## Canary Deployment (Progressive Auto-Rollback)

### When to Use

✅ Risk mitigation (catch errors at 10% traffic)
✅ Metrics-driven validation
✅ Progressive rollout (10% → 20% → 50% → 100%)

❌ Requires Prometheus/Grafana
❌ Requires Flagger/Istio

### Flagger Configuration

```yaml
# canary.yaml
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: myapp
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  service:
    port: 80
    targetPort: 3000
  analysis:
    interval: 1m
    threshold: 5          # Max consecutive failures before rollback
    maxWeight: 50         # Max canary traffic (50%)
    stepWeight: 10        # Increase by 10% each step
    metrics:
      - name: request-success-rate
        thresholdRange:
          min: 99         # Rollback if success rate < 99%
        interval: 1m
      - name: request-duration
        thresholdRange:
          max: 500        # Rollback if P95 latency > 500ms
        interval: 1m
    webhooks:
      - name: smoke-tests
        url: http://flagger-loadtester/
        timeout: 30s
        metadata:
          cmd: "curl -sf http://myapp-canary:3000/health | grep -q healthy"
```

### Commands

```bash
# Install Flagger
helm repo add flagger https://flagger.app
helm upgrade -i flagger flagger/flagger --namespace flagger-system --create-namespace

# Deploy canary
kubectl apply -f canary.yaml

# Watch progress
kubectl -n production get canary myapp -w

# Manual promotion/rollback
kubectl -n production annotate canary/myapp flagger.app/promote=true
kubectl -n production annotate canary/myapp flagger.app/rollback=true
```

---

## Two-Pass Workflow

### CRITICAL Flags (Stop Work)

- **No rollback plan:** How to undo deployment in <60 seconds not documented
- **No smoke tests:** Health checks not tested in staging
- **Metrics spike:** Error rate > 5%, P95 latency > 2s after deployment
- **Database migration without rollback test:** Old code + new schema not verified
- **Breaking change with Rolling Update:** Should use Blue-Green

### INFORMATIONAL Flags

- **Deployment duration > 10 minutes:** Consider Blue-Green
- **No auto-rollback triggers:** Consider Flagger

---

## Meta-Instructions

### Pre-Deployment Checklist

**DO NOT skip:**

- [ ] **Rollback plan documented:** How to undo in <60 seconds?
- [ ] **Database backup:** If schema changes, backup taken in last 1 hour?
- [ ] **Container image scanned:** Security scan passed?
- [ ] **Health checks tested:** `/health/ready` and `/health/live` work in staging?
- [ ] **Smoke tests passed in staging:** Same image tested?

### Stopping Policy

Stop if:
1. **No rollback procedure:** Cannot undo deployment in <60 seconds
2. **Breaking DB migration + code together:** High rollback risk
3. **Health checks fail in staging:** Do not proceed

### Rollback Decision Tree

Auto-rollback triggers:

| Metric | Threshold | Action |
|--------|-----------|--------|
| **Error rate** | > 5% for 3 min | Auto-rollback |
| **P95 latency** | > 2s for 5 min | Auto-rollback |
| **Success rate** | < 95% for 2 min | Auto-rollback |
| **Pod crash rate** | > 20% for 1 min | Auto-rollback |

### Suppressions

- "Use Canary instead of Rolling" when low-risk — Rolling is fine
- "Blue-Green is expensive" when rollback speed critical — Cost acceptable
- "Use feature flags" for bug fixes — Flags are for features, not bug fixes

---

## Quick Reference

### Rolling Update

```bash
kubectl set image deployment/myapp app=myapp:2.0.0 -n production
kubectl rollout status deployment/myapp -n production --timeout=10m
kubectl rollout undo deployment/myapp -n production  # Rollback
```

### Health Checks

```typescript
// /health/ready - K8s readiness probe
app.get('/health/ready', async (req, res) => {
  try {
    await db.query('SELECT 1');      // DB
    await redis.ping();              // Cache
    await externalAPI.healthCheck(); // External API
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// /health/live - K8s liveness probe
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
```

### Feature Flags

```typescript
// LaunchDarkly integration
import { LaunchDarkly } from 'launchdarkly-node-server-sdk';
const client = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY);

export async function isNewCheckoutEnabled(user: User): Promise<boolean> {
  return await client.variation('new-checkout-flow', { key: user.id }, false);
}

// Usage
if (await isNewCheckoutEnabled(user)) { newCheckout() } else { oldCheckout() }
```

---

**Reference:** Kubernetes 1.28+, Flagger 1.35+, LaunchDarkly 6.0+
