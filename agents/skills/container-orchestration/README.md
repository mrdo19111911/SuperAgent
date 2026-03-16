# Container Orchestration

Production-ready Docker and Kubernetes patterns with Helm charts and Kustomize overlays.

## Quick Start

```bash
# Build Docker image
docker build -t myapp:1.0.0 .

# Deploy to Kubernetes with Helm
helm upgrade --install myapp ./chart --namespace production --create-namespace

# Or use kubectl with Kustomize
kubectl apply -k overlays/production
```

## What's Included

- **Docker:** Multi-stage builds, security hardening, health checks
- **Kubernetes:** Deployments, Services, Ingress, HPA, PDB
- **Helm:** Complete chart structure with values overlays
- **Kustomize:** Base + overlay pattern for multi-env
- **Security:** Non-root users, read-only filesystem, capability dropping

## Key Features

- Multi-stage Dockerfile optimization
- Zero-downtime rolling updates
- Horizontal pod autoscaling
- Pod disruption budgets for HA
- Resource requests and limits
- Liveness/Readiness/Startup probes
- Security context hardening

## Stack Support

- **Container Runtime:** Docker, containerd, CRI-O
- **Orchestration:** Kubernetes 1.28+
- **Package Management:** Helm 3.13+, Kustomize
- **Languages:** Node.js, Go, Python, Java

## References

- [Kubernetes Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)
- [Helm Documentation](https://helm.sh/docs/)
- [Docker Security](https://docs.docker.com/engine/security/)
