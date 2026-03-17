# C7: Infra, DevOps & Ops

**Focus:** Is deployment automated and reliable?

## Checklist

- [ ] **CI/CD Pipeline:** Automated test + deploy?
- [ ] **Environment Config:** Separate .env for dev/staging/prod?
- [ ] **Disaster Recovery:** Backup/restore plan exists?
- [ ] **Monitoring:** Logging, alerting, metrics (Prometheus, Grafana)?
- [ ] **Container/IaC:** Docker, K8s, Terraform?

## Red Flags

- No CI/CD (manual deploy)
- Prod secrets in version control
- No backup strategy (data loss risk)
- No monitoring (blind to incidents)

## Examples

**MANUAL:** No pipeline, manual FTP deploy, no backups
**AUTOMATED:** GitHub Actions CI/CD, Docker, daily backups, Grafana dashboards
