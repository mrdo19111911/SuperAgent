# Deployment Strategies

Zero-downtime deployment patterns with rolling updates, blue-green, canary, and GitOps.

## Quick Start

```bash
# Rolling update
kubectl set image deployment/myapp app=myapp:2.0.0

# Blue-green deployment
kubectl apply -f green-deployment.yaml
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

# Canary with Flagger
kubectl apply -f canary.yaml

# GitOps with ArgoCD
kubectl apply -f argocd-app.yaml
argocd app sync myapp-production
```

## What's Included

- **Rolling Updates:** Zero-downtime gradual rollout
- **Blue-Green:** Instant traffic switch between environments
- **Canary:** Progressive delivery with automated validation
- **GitOps:** ArgoCD and Argo Rollouts configurations
- **Rollback:** Automated and manual rollback procedures

## Key Features

- Zero-downtime deployments
- Fast rollback (<60 seconds)
- Health check validation
- Metrics-driven canary analysis
- Progressive traffic shifting
- Automated rollback triggers

## Stack Support

- **Orchestration:** Kubernetes 1.28+
- **GitOps:** ArgoCD 2.9+, Flux
- **Progressive Delivery:** Flagger 1.35+, Argo Rollouts 1.6+
- **Service Mesh:** Istio, Linkerd (optional)

## References

- [Kubernetes Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Flagger Documentation](https://docs.flagger.app/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
