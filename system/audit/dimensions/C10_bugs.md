# C10: Customer Care & SLA

**Focus:** Can support team handle incidents effectively?

## Checklist

- [ ] **Defect Rate:** Bug rate <5%?
- [ ] **Incident Response:** SLA for critical bugs (e.g., <2 hours)?
- [ ] **Error Tracking:** Sentry, Rollbar, or similar?
- [ ] **Support Runbooks:** Common issues documented?

## Red Flags

- High defect rate (>15%)
- No incident response plan
- No error tracking (blind to production bugs)
- Customer complaints about slow fixes

## Examples

**UNSTABLE:** Defect rate 15%, no SLA, manual bug tracking
**STABLE:** Defect rate 3%, 2-hour SLA, Sentry alerts, comprehensive runbooks
