# Implementation Roadmap (20 Wks)

## Ph0: Foundation (Wk 1-3)

| Deliverable | Detail |
|-------------|--------|
| Design Tokens | 6 status colors (light+dark), type (11-32px), space (4-64px), CSS+TS |
| Component Lib | StatusBadge, KPICard, ExceptionItem, PlanningBoard, MapView, Timeline, Button/Input/Select/Modal/Drawer/Toast |
| Baseline | Screenshot, measure clicks/task + decision + tickets |

**Gate:** Lib published + ≥1 platform | **Risk:** Fragmentation → PR mandate + dash + sync

## Ph1: Core (Wk 4-10)

| Wk | Feature | Detail |
|----|---------|--------|
| 4-5 | Workflow Nav | OMS/WMS/TMS stage flows |
| 6 | Exception Dash | 70% feed + 30% AI, 30s poll, severity tiers |
| 7 | Color Rollout | Hex→tokens, lint, dark mode |
| 8-9 | Error Recovery | Inline valid, auto-save 30s, soft del 30d |
| 10 | Progressive Disclosure | Essential/Pro/Expert tiers, flags, checklist |

**Gate:** A/B ≥20% time↓ OR ≥15% tickets↓ | **Risk:** Nav resist → A/B + classic 60d

## Ph2: Patterns (Wk 11-20)

| Wk | Feature | Detail |
|----|---------|--------|
| 11-14 | 10 Patterns | Control Tower, Kanban, Map, Timeline, AI Card, Empty, Cmd+K, Bulk, Notify, Mobile/Offline |
| 15-16 | Onboarding | 10min TTFS, 5 steps, sandbox, track TTFS+FWAR |
| 17 | AI Governance | Risk levels, Approve/Adjust/Reject, XAI |
| 18 | Security | RBAC hide, mask PII, 30min timeout, MFA bulk ops |
| 19-20 | Edge Cases | TZ, currency, conflict (opt lock), import, CO2 |

**Gate:** All 10 in ≥1 platform + doc | **Risk:** Non-comply → lint + PR review

## Ph3: Measure (Wk 20+)

| System | Metrics |
|--------|---------|
| HEART | H(NPS>30), E(DAU/MAU>40%), A(80%≥1/qtr), R(<10%/yr), T(>90%, <3min) |
| Ops | TTFS<10min, clicks<3, 30-50%↓, tickets<5/30d, train<4hr |
| Anti-Pat | Auto (hex, alt, 44px) + manual (7), Pass≥15/18, Revise 12-14, Reject<12 |

**Gate:** ≥1mo tracking + dash | **Risk:** Analytics gap → Ph0 setup

## Governance

| Role | Responsibility | Decision |
|------|---------------|----------|
| Design Lead | Lib, tokens, patterns | P0 block |
| UX Reviewer | PR audit weekly | P1 fix sprint |
| Platform Owners | Adoption | P2 optional |
| PM | Metrics | - |

## Success Metrics

| Metric | Baseline | Target |
|--------|----------|--------|
| TTFS | 30-45min | <10min |
| Clicks | 10-15 | <3 |
| Speed | Manual | 30-50%↓ |
| Tickets | 8-12/30d | <5 |
| Training | 2-3d | <4hr |
| NPS | - | >30 |
| DAU/MAU | - | >40% |

**90d Review:** Metrics vs targets, NPS+tickets+interviews, tech debt, next priorities, qtr audit
