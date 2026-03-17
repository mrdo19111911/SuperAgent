# High-Level Design (HLD) — GSTACK v2.0

**Skill ID:** `high-level-design`
**Version:** 2.0.0
**Status:** active
**Priority:** P2 (MEDIUM)
**Mode:** TWO_PASS

## Overview

GSTACK-compliant High-Level Design skill for system architecture with C4 model, ADRs, and scalability patterns. You are a **city architect** designing infrastructure for 10 million inhabitants.

**Three Mental Models:**
1. **CRITICAL Mode:** Scalability bottlenecks, single points of failure, missing NFRs, security gaps → Blocks production
2. **INFORMATIONAL Mode:** Diagram aesthetics, naming conventions, component granularity → Improve later
3. **DECISION Mode:** Trade-off analysis, ADRs with evidence, pattern selection → Justify choices

## Required Artifacts

1. **C1 System Context** — System boundary, external actors/systems (5-9 boxes max)
2. **C2 Container Diagram** — Deployable units (apps, databases, queues), tech stack, protocols
3. **C3 Component Diagram** — Internal modules, layers, dependencies (critical services only)
4. **≥3 ADRs** — Database choice, framework choice, architecture style (with evidence + trade-offs)
5. **NFRs** — Performance (P95 < 500ms), Availability (99.9%), Security (RLS enforced)
6. **SPOF Mitigation** — Database replicas, load balancer, health checks, circuit breakers

## Prime Directives (7 Rules)

1. Use C4 Model (System Context → Container → Component → Code)
2. Document ALL architecture decisions in ADRs (with evidence, trade-offs, validation)
3. Identify single points of failure + mitigation strategies
4. Design for scalability: horizontal scaling, stateless services, caching
5. Include Non-Functional Requirements (NFRs) in HLD (latency, throughput, availability)
6. Review HLD with 3 stakeholders (PM, Tech Lead, Security)
7. Avoid anti-patterns: no diagrams, implementation details in HLD, missing NFRs, no ADRs, synchronous cascades, stateful services, no redundancy

## Real Production Failures (3 Examples)

1. **No HLD → Synchronous Cascade Failure:** Black Friday outage (Order API → Email API sync call) → $50K revenue lost
2. **No ADR → Database Choice Regret:** MongoDB chosen without justification → $200K migration to PostgreSQL (6 months)
3. **Missing NFRs → Scalability Crisis:** No performance targets → P95 latency 5 seconds → 20% churn ($500K revenue lost)

## Escape Hatches (When to Skip HLD)

**Skip if:** Trivial features (<3 components), bug fixes, UI-only changes, prototypes
**Require if:** New service, database schema change, external system integration, performance optimization

## Stopping Conditions

- STOP if <3 components (HLD not required, use code comments)
- STOP if ADRs >10 (over-engineering, merge related decisions)
- STOP if C2 Container Diagram >20 boxes (microservices sprawl, group into modules)
- STOP if ≥3 CRITICAL issues found (fix HLD before implementation)

## Usage

Assigned to: **Phúc SA (PRIMARY)**, Hiếu, Mộc, Nghĩa
Integration: **Pipeline 2 (Architecture)** — Phúc SA creates diagrams/ADRs, Mộc challenges, Dũng PM approves

See [SKILL.md](./SKILL.md) for full GSTACK-compliant specification (895 lines).
