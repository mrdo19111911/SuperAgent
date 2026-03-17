# Onboarding — Smartlog

## 10-Min First Success

User MUST complete 1 real task in 10min

## 5 Steps

| Step | Action | Details |
|------|--------|---------|
| 1. Intent | "Cần gì?" | 3-4 options + skip |
| 2. Role | Select | Config view/sidebar/dash (Planner/Oper/Coord/Mgr/Exec) |
| 3. Guided Task | 1 core, spotlight | Max 5 steps ≤30s (WMS: scan→confirm→put-away) |
| 4. Value | Success msg | "Hoàn thành 2min!" (was 8min), animation+confetti 2s |
| 5. Checklist | Progress | "3/7 kỹ năng", click=walkthrough, badge Beginner→Proficient→Expert |

**Interface:** OnboardingStep = id/title/desc/target/position/action (click|type|drag|scan)/completionCheck/nextStep
**Spotlight:** target/msg/step/total/onNext/onSkip, dim all, arrow, persist progress

## Sandbox

**Data:** 50 shipments, 10 carriers, 5 WH, 100 orders, 20 customers
**Rules:** "Dùng demo" always, "[DEMO]" badge, 1-click clear, isolated, enables all (inc AI)

## Feature Tiers

| Tier | Timeline | Features | Unlock |
|------|----------|----------|--------|
| Essential | Wk1-2 | Create/View/Edit, basic filters, status | Default |
| Pro | Wk3-8 | Advanced filters, bulk, reports, analytics, Kanban | 14d OR 50 tasks |
| Expert | Mo3+ | AI planning, API, custom dash, rules | 60d OR admin |

**Impl:** HIDE (not disable), "Khám phá thêm" preview, admin promote, progress in profile

## Metrics

| Metric | Target | Measure |
|--------|--------|---------|
| TTFS | <10min | Signup→task |
| FWAR | >70% | ≥3d active in 7d |
| Core adopt | >40% mo1 | % use ≥1 |
| Tickets 30d | <5/user | Helpdesk |
| Train | <4hr | Independent |
| Complete | >80% | 5-step flow |
| Sandbox | >50% | New users activate |

## Empty State

**Pattern:** icon, title, desc, primaryAction, secondaryActions [Import/API/Demo]
**Rules:** NEVER blank, primary filled, 2-3 alternatives, demo ALWAYS, illustration matches platform
