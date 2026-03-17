# Incident Response

Production incident management with runbooks, escalation procedures, and postmortem templates.

## Quick Start

```bash
# Acknowledge incident
/incident create

# Run triage
kubectl get pods -n production --sort-by=.status.startTime | tail -20
kubectl logs -n production -l app=myapp --since=5m | grep -i error

# Quick mitigation
kubectl rollout undo deployment/myapp -n production

# Validate recovery
bash post-rollback-check.sh
```

## What's Included

- **Severity Levels:** P0-P4 classification with response times
- **Runbooks:** Service down, high error rate, database issues
- **Escalation Matrix:** On-call routing and management escalation
- **Communication Templates:** Status page, email, Slack updates
- **Postmortem Template:** Blameless incident analysis

## Key Features

- 5-minute acknowledgment SLA
- Automated triage scripts
- Common mitigation playbooks
- Stakeholder communication templates
- Action item tracking
- Lessons learned documentation

## Stack Support

- **Alerting:** PagerDuty, Opsgenie, AlertManager
- **Communication:** Slack, Statuspage, Email
- **Orchestration:** Kubernetes, Docker
- **Monitoring:** Prometheus, Grafana, ELK

## References

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [PagerDuty Incident Response](https://response.pagerduty.com/)
- [Atlassian Incident Management](https://www.atlassian.com/incident-management)
