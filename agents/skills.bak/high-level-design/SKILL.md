---
name: high-level-design
description: System architecture design with C4 model, ADRs, and scalability patterns
allowed-tools: [Read, Write, Bash, Edit, Grep, Glob]
mode: TWO_PASS
---

# High-Level Design (HLD) — GSTACK v2.0

## Philosophy

You are a **city architect** designing infrastructure for 10 million inhabitants. Your blueprints determine whether the city thrives or collapses under load.

**Three Mental Models:**

1. **CRITICAL Mode** (Blocks Production)
   - Scalability bottlenecks (synchronous cascades, no caching, stateful services)
   - Single points of failure (no redundancy, missing health checks)
   - Missing NFRs (no latency/throughput/availability targets)
   - Security gaps (public database, missing authentication, hardcoded secrets)

2. **INFORMATIONAL Mode** (Improve Communication)
   - Diagram aesthetics (tool choice, colors, fonts)
   - Naming conventions (OrderService vs Order-Service)
   - Component granularity (3 components vs 5 components)
   - Documentation clarity (verbose descriptions)

3. **DECISION Mode** (Justify Choices)
   - Trade-off analysis (Monolith vs Microservices, Sync vs Async, SQL vs NoSQL)
   - Architecture Decision Records (ADRs) with evidence
   - Pattern selection (3-Tier, Event-Driven, CQRS, Serverless)
   - Cost vs performance trade-offs

**Core Principle:**
> "Architecture is about the important stuff. Whatever that is." — Ralph Johnson
>
> The "important stuff" = scalability risks, single points of failure, and NFRs. Everything else is INFORMATIONAL.

---

## Prime Directives

### 1. Use C4 Model (Container Diagram = Most Useful)
- **C2 Container Diagram:** Deployable units (apps, databases, queues), tech stack, protocols
- **Anti-Pattern:** Mixing levels (showing database tables in system overview)

### 2. Document Architecture Decisions in ADRs
- **Required:** Status, Context, Decision, Rationale, Consequences
- **Minimum 3 ADRs:** Database choice, Framework choice, Architecture style
- **Anti-Pattern:** Undocumented decisions ("We chose X because everyone uses it")

### 3. Identify Single Points of Failure + Mitigation
- Single database → Primary-replica replication
- Single API server → Load balancer + auto-scaling (≥2 instances)
- No health checks → `/health` endpoint, readiness/liveness probes
- Synchronous external API → Circuit breaker, fallback, timeout
- **Anti-Pattern:** No redundancy plan

### 4. Design for Scalability
- Horizontal scaling (stateless services, load balancer)
- Caching (Redis, CDN for 99% cache hit rate)
- Database read replicas (1 primary, 3 replicas)
- Async processing (RabbitMQ/Kafka for long-running tasks)
- **Anti-Pattern:** Stateful services that can't scale

### 5. Include Non-Functional Requirements
- **Performance:** P95 latency < 500ms, 1000 req/sec
- **Availability:** 99.9% uptime (43 min downtime/month)
- **Security:** Multi-tenant isolation (RLS), JWT auth
- **Anti-Pattern:** No NFRs ("We'll make it fast later")

### 6. Review with 3 Stakeholders
- **PM (Dũng):** Business goals, timeline
- **Tech Lead (Phúc SA):** Scalability, maintainability
- **Security (Thanh Lai/Ngu):** Isolation, secret management
- **Anti-Pattern:** Architect designs alone

### 7. Avoid Critical Anti-Patterns
- No diagrams → P1 (Blocks PR)
- Missing NFRs → P1 (Blocks PR)
- No ADRs → P2 (Review delay)
- Synchronous cascades → P0 (Production bug)
- Stateful services → P1 (Can't scale)
- No redundancy → P0 (Single point of failure)

---

## Design Patterns Table

| Pattern | Use Case | Pros | Cons | When to Use | Example |
|---------|----------|------|------|-------------|---------|
| **3-Tier (Monolith)** | Web apps, CRUD, MVP | Simple, fast iteration, low ops cost | Tight coupling, hard to scale teams | Year 0-1, <10K users, <5 devs | React → FastAPI → PostgreSQL |
| **Microservices** | Large teams, domain isolation | Independent deploy, scalability, polyglot | High ops complexity, distributed tracing required | Year 2+, >50K users, >10 devs | Order Service, Payment Service, User Service |
| **Event-Driven** | Async workflows, decoupling | Loose coupling, scalability, resilience | Eventual consistency, hard to debug | Long-running tasks, high throughput | Order created → Email sent (RabbitMQ) |
| **CQRS** | Read-heavy workloads | Optimized reads, scalability | Complexity, eventual consistency, dual storage | 10:1 read-to-write ratio | Write to PostgreSQL, read from Elasticsearch |
| **Serverless** | Variable load, cost optimization | Auto-scaling, pay-per-use, no server mgmt | Cold starts (500ms-3s), vendor lock-in | Batch jobs, infrequent tasks | AWS Lambda for nightly report generation |
| **BFF (Backend for Frontend)** | Multiple clients (web, mobile) | Client-optimized APIs, reduce overfetching | Code duplication, more services | Web needs different data than mobile | Web BFF (full product) vs Mobile BFF (minimal) |

---

## C4 Container Diagram (Level 2)

**Purpose:** Show deployable units (apps, databases, queues), tech stack, communication protocols.

**Example (E-commerce System):**

```
┌─────────────────────────────────────────────────┐
│  E-commerce System                              │
│                                                 │
│  ┌─────────────┐      ┌─────────────┐         │
│  │   React     │      │   Next.js   │         │
│  │   SPA       │      │   SSR       │         │
│  │ (Vite 5.0)  │      │   (v14)     │         │
│  └──────┬──────┘      └──────┬──────┘         │
│         │ HTTPS/JSON         │                 │
│         └────────┬───────────┘                 │
│                  │                             │
│         ┌────────▼────────┐                    │
│         │  FastAPI        │                    │
│         │  (Python 3.11)  │                    │
│         │  + Pydantic     │                    │
│         └────────┬────────┘                    │
│                  │ SQL (Async)                 │
│         ┌────────▼────────────────────┐        │
│         │  PostgreSQL 16              │        │
│         │  (Multi-tenant with RLS)    │        │
│         │  Primary + 2 Read Replicas  │        │
│         └─────────────────────────────┘        │
│                                                 │
│         ┌─────────────┐                        │
│         │   Redis     │                        │
│         │   Cache     │                        │
│         │ (Session +  │                        │
│         │  Products)  │                        │
│         └─────────────┘                        │
│                                                 │
│         ┌─────────────┐                        │
│         │  RabbitMQ   │                        │
│         │  (Order     │                        │
│         │   Queue)    │                        │
│         └──────┬──────┘                        │
│                │ AMQP                           │
│         ┌──────▼──────┐                        │
│         │  Celery     │                        │
│         │  Worker     │                        │
│         │ (Background │                        │
│         │   Jobs)     │                        │
│         └─────────────┘                        │
└─────────────────────────────────────────────────┘
```

**NFRs:** P95 < 500ms (99% cache hit), Horizontal scaling (2-10 instances), 99.9% uptime (`/health` checks)

**Rules:** Show protocols (HTTPS, SQL, AMQP), Label tech stack, Include NFR targets inline

---

## ADR Template (Concise)

```markdown
# ADR-XXX: [Decision Title]

**Status:** Proposed | Accepted | Rejected | Deprecated
**Date:** YYYY-MM-DD
**Deciders:** [Phúc SA, Hung, Thanh Lai]

## Context
What problem? What constraints? Options: PostgreSQL with RLS, DB-per-tenant, Shared schema no RLS

## Decision
We choose **PostgreSQL with RLS**.

## Rationale
- **Scalability:** 1000+ tenants without database sprawl
- **Cost:** $500/month vs $5000/month for 100 databases
- **Compliance:** RLS enforced at DB level (cannot bypass in app code)
- **Performance:** 10M rows, p95 < 200ms

**Evidence:** Load test (1000 concurrent users, p95 < 500ms ✅), Security test (cross-tenant blocked ✅)

## Consequences
**Positive:** Easy new tenants, strong isolation guarantee
**Negative:** No per-tenant schema customization, all-or-nothing backup/restore

**Alternatives:** DB-per-tenant (ops complexity), Schema-per-tenant (connection limits)
**Validation:** Load test, Security test, Migration test (<5 min for 100 tenants)
**Rollback:** If RLS p95 > 2s, migrate top 10 tenants to separate databases
```

---

## Production Failure: Black Friday Cascade

**Scenario:** E-commerce Black Friday sale. Order endpoint calls Email API synchronously (no timeout). Email API slow (5s/email). 1000 concurrent orders → 1000 pending email calls → all API workers blocked → site down.

**Root Cause:** No HLD, no async pattern documented

**Prevention:** C2 diagram would show: Order Service → RabbitMQ → Email Worker (async). ADR-004: "Use async queue for email"

**Cost:** $50,000 lost revenue (2-hour outage)

---

## Two-Pass Workflow

### CRITICAL (Blocks Implementation) — Fix Immediately

- [ ] Synchronous cascade without timeout (API → Email blocks request)
- [ ] No caching for hot data (product catalog 1000x/sec)
- [ ] Stateful services (session in memory, can't scale)
- [ ] Single database instance (no replicas)
- [ ] Single API instance (no load balancer)
- [ ] No health checks (`/health` endpoint missing)
- [ ] No latency/throughput/availability targets
- [ ] Database/Framework/Architecture undocumented (no ADRs)

**Stopping Policy:** If ≥3 CRITICAL issues → STOP implementation. Fix HLD first.

### INFORMATIONAL (Improve Later) — Document Only

- Diagram aesthetics, naming conventions, component granularity

**Stopping Policy:** If diagram communicates clearly → STOP nitpicking.

---

## Meta-Instructions

### HLD Checklist (Mandatory Before Implementation)

**Diagrams:**
- [ ] C2 Container diagram (tech stack: React, FastAPI, PostgreSQL, Redis)

**ADRs:**
- [ ] ADR-001: Database choice (PostgreSQL, MongoDB, etc.)
- [ ] ADR-002: Framework choice (FastAPI, Express, etc.)
- [ ] ADR-003: Architecture style (Monolith, Microservices, etc.)

**NFRs:**
- [ ] Performance: Latency target (P95 < 500ms), Throughput (1000 req/sec)
- [ ] Availability: Uptime target (99.9%)
- [ ] Security: Multi-tenant isolation (RLS enforced)

**SPOF Mitigation:**
- [ ] Database redundancy (primary + replicas)
- [ ] API redundancy (≥2 instances + load balancer)
- [ ] Circuit breakers for external services

### Stopping Conditions

**STOP if:**
- ADRs > 10 (over-engineering)
- C2 Container Diagram has > 20 boxes (too complex)
- Feature has < 3 components (HLD not required)

---

## Quick Reference

### C4 Level 2 Checklist
- [ ] Show all deployable units (apps, databases, queues)
- [ ] Label tech stack (FastAPI, PostgreSQL 16, Redis)
- [ ] Show protocols (HTTPS/JSON, SQL, AMQP)
- [ ] Include NFR targets inline (P95 < 500ms, 99.9% uptime)

### ADR Quick Template
1. **Status:** Proposed/Accepted
2. **Context:** Problem statement + options
3. **Decision:** What we chose
4. **Rationale:** Why this choice (evidence: benchmarks, cost)
5. **Consequences:** Positive/negative impacts

### NFR Categories (One-Line Each)
- **Performance:** P95 latency < 500ms, 1000 req/sec throughput
- **Availability:** 99.9% uptime (43 min downtime/month), health checks
- **Scalability:** Horizontal scaling (2-10 instances), caching (99% hit rate)
- **Security:** Multi-tenant isolation (RLS), JWT auth (1-hour expiry)
- **Compliance:** GDPR data retention (delete after 30 days)

### SPOF Mitigation Patterns
- **Database:** Primary-replica replication + read replicas
- **API:** Load balancer + auto-scaling (≥2 instances) + health checks
- **External services:** Circuit breaker (Polly, Resilience4j) + timeout + fallback
