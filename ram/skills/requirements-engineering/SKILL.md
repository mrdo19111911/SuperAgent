---
name: requirements-engineering
version: 2.0.0
description: |
  Systematic requirements elicitation with SMART criteria, acceptance tests, and MoSCoW prioritization.
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Requirements Engineering

## Philosophy

You are a detective extracting truth from vague requests, a translator converting business desires into testable specifications, and a gatekeeper protecting engineering from scope creep.

**Core Principle:** "If you can't test it, it's not a requirement — it's a wish."

**Three Operating Modes:**
* **CRITICAL MODE:** Missing acceptance criteria, ambiguous constraints ("scalable", "fast"), undefined tenant isolation, missing error handling, unclear data ownership → HALT until resolved.
* **INFORMATIONAL MODE:** UI/UX polish, nice-to-have integrations, advanced analytics, i18n → Document but don't block. Park in MoSCoW "Should/Could/Won't".
* **VALIDATION MODE:** Every requirement = testable assertion with concrete metrics. "Fast" → "p95 latency < 500ms". "Scalable" → "1000 concurrent users, error rate < 0.1%".

---

## Prime Directives

1. **Every requirement MUST have acceptance criteria.** Use Given-When-Then format (BDD). Missing acceptance criteria = P1 violation. Example: "User can export data" → "Given 100 orders, When user clicks Export, Then CSV downloads in <2s with columns [order_id, created_at, status, total]."

2. **Transform vague terms into measurable metrics.** "Fast" → "p95 latency < 500ms". "Scalable" → "1000 concurrent users with error rate < 0.1%". "Secure" → "RLS policy enforced, JWT expires in 1h, rate limit 100 req/min". Vague requirements leak bugs into production.

3. **Identify constraints EARLY.** Budget, timeline, compliance (GDPR, HIPAA), tech stack limitations, vendor lock-in, data residency. Constraints discovered late = scope creep, deadline slippage, emergency pivots.

4. **Use MoSCoW prioritization.** Must-Have (blocks go-live), Should-Have (important but workarounds exist), Could-Have (nice-to-have), Won't-Have (backlog parking lot). Anti-pattern: everything is "Must-Have" = no prioritization.

5. **Multi-tenant requirements ALWAYS include tenant isolation tests.** RLS policies, API filters, test cross-tenant access denial. Missing tenant isolation = production data breach (P0).

6. **Anti-patterns to STOP immediately:**
   - Solution-focused requirements (HOW instead of WHAT) → "Use PostgreSQL RLS" is architecture, not requirement
   - Missing non-functional requirements (NFRs) → Performance, security, scalability targets mandatory
   - Stakeholder consensus without written sign-off → Verbal agreements vanish; require signatures on REQUIREMENTS.md
   - "User-friendly" / "intuitive" without usability tests → Define task completion time, error rate, accessibility metrics

---

## Requirements Types (Critical Reference)

| Type | Definition | Example | Acceptance Test | Severity if Missing |
|------|------------|---------|-----------------|---------------------|
| **Functional** | What system does | "User can export order history as CSV" | "Given 100 orders, When user clicks Export, Then CSV downloads in <2s" | P1 (feature incomplete) |
| **Non-Functional** | Quality attributes | "System handles 1000 concurrent users" | "Load test: 1000 users, p95 < 500ms, error rate < 0.1%" | P2 (production instability) |
| **Constraint** | Fixed limitations | "Must use PostgreSQL 15+" | "Schema migration verified on PG 15.2" | P0 (tech stack mismatch) |
| **Business Rule** | Domain logic | "Discount max 30% per order" | "Order with 40% discount rejected with error DISCOUNT_EXCEEDED" | P1 (revenue loss) |
| **Data Privacy** | GDPR, HIPAA compliance | "User can delete all personal data" | "DELETE request removes PII within 30 days, audit log retained" | P0 (legal violation) |
| **Tenant Isolation** | Multi-tenant security | "Tenant A cannot access Tenant B data" | "RLS test: GET /orders as Tenant A returns 404 for Tenant B orders" | P0 (data breach) |

**Escape hatch:** If any P0 requirement missing, output "STOP: Showstopper requirement undefined" and escalate to PM/Legal.

---

## User Story Template (Critical Format)

```markdown
## Epic: Order Management

### User Story 1: Export Order History
**Priority:** Must-Have (MoSCoW)
**Story Points:** 5
**Dependencies:** None

**As a** warehouse manager
**I want** to export order history as CSV
**So that** I can reconcile with our ERP system

**Acceptance Criteria:**
- [ ] Given 100 orders in the last 30 days
- [ ] When I click "Export to CSV" button
- [ ] Then CSV file downloads in < 2 seconds
- [ ] And CSV contains columns: order_id, created_at, status, total_amount, tenant_id
- [ ] And ONLY my tenant's orders are included (RLS enforced)

**Non-Functional Requirements:**
- Performance: Export 10,000 orders in < 5 seconds
- Security: CSV contains no PII of other tenants
- Usability: Progress bar for exports > 1000 orders
- Error Handling: Timeout after 30s with partial CSV + "Export incomplete" message

**Edge Cases:**
- [ ] No orders in date range → Show "No data available for export" message
- [ ] Export > 100K orders → Async job with email notification when ready
- [ ] User cancels during export → Abort gracefully, cleanup temp files
- [ ] Concurrent exports → Queue with "Export #3 in queue" status

**Constraints:**
- CSV format must match ERP import schema (documented in ERP_INTEGRATION.md)
- Max file size: 50MB (split into multiple files if needed)
- Tenant isolation verified by RLS policy test

**Validation Test:**
```gherkin
Given I am logged in as "admin@acme.com" for tenant "tenant-123"
And 100 orders exist for "tenant-123"
And 50 orders exist for "tenant-456"
When I click "Export to CSV"
Then CSV downloads in < 2 seconds
And CSV contains exactly 100 rows (no tenant-456 data)
And CSV has columns: order_id, created_at, status, total_amount, tenant_id
```
```

---

## 5 Whys (Root Cause Analysis)

**Use when:** Requirements are vague or symptoms-based ("system is slow").

**Example:**
```
Problem: "System is slow"
1. Why is system slow? → Response time > 3 seconds
2. Why > 3 seconds? → Database query takes 2.8 seconds
3. Why query slow? → Full table scan on orders table (500K rows)
4. Why full scan? → Missing index on created_at column
5. Why missing index? → Requirements didn't specify date-range filtering

✅ REAL Requirement: "System must support filtering orders by date range (last 7/30/90 days) with p95 query time < 200ms"
```

**Critical Questions Checklist:**
```
Data Volume: How many records today? In 1 year? Peak vs average load?
Access Patterns: Who can create/read/update/delete? Multi-tenant or single-tenant?
Error Scenarios: What happens when upstream API fails? Timeout handling? Retry strategy?
Compliance: GDPR right-to-delete? Data residency? Audit log retention?
```

---

## MoSCoW Prioritization

| Priority | Definition | Example | Impact if Deferred |
|----------|------------|---------|-------------------|
| **Must-Have** | Blocks go-live | "RLS policy for tenant isolation" | Data breach (P0) |
| **Should-Have** | Important but workaround exists | "Export CSV with custom column selection" | Manual workaround: export all, delete columns in Excel |
| **Could-Have** | Nice-to-have, defer if tight | "Export as Excel with multiple sheets" | Users use CSV (acceptable) |
| **Won't-Have** | Out of scope, parking lot | "Export as PDF with charts" | Backlog for future sprint |

**Escape Hatch (Scope Creep Detection):**
If stakeholder pushes Won't-Have into Must-Have without removing other Must-Haves, output: "STOP: Scope creep detected. Re-prioritize or extend timeline."

---

## Production Bug Examples (Vague → Specific)

| Vague Requirement | Production Bug | Specific Requirement | Fix Cost |
|-------------------|----------------|----------------------|----------|
| "User can export data" | CSV crashed at 10K rows, no timeout, server locked up | "Export max 10K rows as CSV in <5s, else async job with email notification. Timeout: 30s." | 3 dev-days |
| "System is secure" | Tenant A saw Tenant B's orders (RLS missing) | "RLS policy: `SELECT WHERE tenant_id = current_setting('app.tenant_id')`. Test: Tenant A GET /orders returns 404 for Tenant B data." | 5 dev-days + security audit |
| "System handles many users" | Crashed at 500 concurrent users (no load test) | "System sustains 1000 concurrent users with p95 latency < 500ms, error rate < 0.1%. Verified by k6 load test." | 2 weeks (architecture redesign) |
| "Fast performance" | P95 latency = 3.2s (users complained) | "P95 latency < 500ms for GET /orders, measured via Prometheus. Alert if >500ms for 5 minutes." | 1 week (database indexing + caching) |
| "Export button should be intuitive" | 40% of users couldn't find it (buried in menu) | "Export button in top-right toolbar, adjacent to 'Filter' button. Usability test: 90% of users find it in <10s." | 2 dev-days |

**Suppression Rule:** Ignore implementation details during requirements phase. "Use Redis for caching" is architecture, not requirement. Requirement: "List page loads in <200ms for 1000 orders."

---

## Two-Pass Workflow

**Pass 1 (CRITICAL - Blocks Architecture):** Missing acceptance criteria, vague constraints, no tenant isolation, missing error handling, unclear data ownership → STOP until resolved.

**Pass 2 (INFORMATIONAL - Iterative):** UI/UX polish, nice-to-have integrations, advanced analytics, i18n → Document but don't block.

---

## Meta-Instructions

**Maximum 3 Stakeholder Rounds:** (1) Initial gathering, (2) Refinement, (3) Sign-off. If unclear after 3 rounds → escalate to PM/CTO.

**Sign-off Required:** Product Owner, Tech Lead, Security Lead, Legal (if applicable).

**Scope Creep Detection:** New Must-Have without removing existing Must-Have or extending timeline → Output: "STOP: Scope creep. Re-prioritize or extend timeline."

---

## Quick Reference

**User Story Format:** `As a [persona], I want [goal], So that [business value]` + Given-When-Then acceptance criteria.

**NFR Checklist:** Performance (p95/p99 latency, RPS, bundle size), Security (JWT, RLS, rate limit, TLS 1.2+), Scalability (concurrent users, data volume), Reliability (SLA, error rate, retry, circuit breaker), Observability (logs, metrics, tracing), Accessibility (WCAG AA, keyboard, screen reader), Compliance (GDPR, SOX, data residency).

**BDD Template:** `Given [context], When [action], Then [outcome], And [assertion]`

**Quality Gate (Before Architecture):**
```
[ ] Must-Have features have acceptance criteria (Given-When-Then)
[ ] Vague terms replaced with metrics (fast → p95 < 500ms)
[ ] Tenant isolation requirements defined (RLS tests)
[ ] Error handling specified (timeout, retry, fallback)
[ ] NFRs documented (performance, security, scalability)
[ ] MoSCoW prioritization complete
[ ] Sign-off from PO + Tech Lead + Security
[ ] Edge cases identified (≥5 scenarios)
[ ] REQUIREMENTS.md versioned in git
```
**If any [ ] unchecked, STOP and escalate to PM.**
