# HEART Metrics

| Dim | Measure | Target | Method |
|-----|---------|--------|--------|
| H (Happiness) | NPS, CSAT, sentiment | NPS >30, CSAT >4.0, >70% pos | NPS 30d/qtr, Delighted |
| E (Engagement) | DAU/MAU, session freq | >40%, >3/wk, ≥5 feat/mo | Mixpanel, track events |
| A (Adoption) | % try 30d, by role | Core 80%, Pro 40%(90d), Expert 10%(180d) | Cohort analysis |
| R (Retention) | Churn, cohort | <10%/yr, 7d >70%, 30d >60%, 90d >50% | Cohort retention |
| T (Task) | Success%, time, clicks | >90%, <3min, <5 clicks | Completion funnels |

## Task Benchmarks

| Task | Success | Time | Clicks |
|------|---------|------|--------|
| Create shipment | >90% | <2min | <3 |
| Resolve exception | >90% | <1min | <3 |
| Update status | >95% | <30s | <2 |
| Assign carrier | >90% | <1min | <3 |
| Generate report | >85% | <30s | <5 |

## Operational Targets

| Metric | Baseline | Target | Tool |
|--------|----------|--------|------|
| TTFS | 30-45min | <10min | Onboard funnel |
| Decision | 10-15min | 3-5min (50-70%↓) | Study |
| Tickets | 8-12/30d | <5 (40-60%↓) | Zendesk |
| Training | 2-3d | <4hr (75-85%↓) | LMS |

## Dashboards

| Type | Freq | Metrics | Owner |
|------|------|---------|-------|
| Weekly Ops | Wk | DAU/MAU, session, adoption | PM |
| Quarterly UX | Qtr | HEART 5-dim, trends | UX Lead |
| Task Real-time | Live | Success%, time, errors | Eng |

## Reporting

| Metric | Freq | Owner | Audience |
|--------|------|-------|----------|
| DAU/MAU | Wk | PM | Leadership |
| Task Success | Wk | UX | Prod+Eng |
| NPS | Qtr | PM | Board |
| Support | Mo | Support | CS |

## Alert Thresholds

| Status | NPS | DAU/MAU | Task | Action |
|--------|-----|---------|------|--------|
| Green | >30 | >40% | >90% | Maintain |
| Yellow | 10-30 | 30-40% | 80-90% | A/B, interviews |
| Red | <10 | <30% | <80% | Escalate |

**Stack:** Segment/Mixpanel/Amplitude, Delighted, LogRocket/FullStory
