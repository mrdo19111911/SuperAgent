# CONTRACT_DRAFT 8-Section Template

Template for `docs/CONTRACT_DRAFT.md` with 8 mandatory sections.

**Requirements:** ≥30 lines, has API + Events sections, ≥5 error cases

---

## Template Structure

```markdown
# Contract Draft: {Module}

## 1. API Contracts

### POST /api/v1/projects
**Auth:** Bearer JWT (tenant-scoped)

**Request:**
{
  "name": "string",
  "description": "string?",
  "metadata": "Record<string, any>?"
}

**Response (200):**
{
  "success": true,
  "data": { "id": "string", "tenant_id": "string", "name": "string" },
  "meta": {}
}

## 2. Error Handling

| Code | HTTP | Trigger | Client Action |
|------|------|---------|---------------|
| TENANT_NOT_FOUND | 404 | Invalid tenant in JWT | Logout + re-auth |
| PROJECT_NAME_CONFLICT | 409 | Duplicate name | Show inline error |
| QUOTA_EXCEEDED | 429 | Tenant limit hit | Upgrade prompt |
| INVALID_METADATA | 400 | Malformed JSON | Validation UI |
| RLS_ISOLATION_FAILED | 500 | RLS policy error | Retry + alert ops |

**Minimum:** 5 error cases

## 3. Events/Pub-Sub

### Event: `project.created`
**Topic:** `stmai.projects`
{
  "event_id": "uuid",
  "tenant_id": "string",
  "aggregate_id": "string",
  "event_type": "project.created",
  "payload": { "name": "string", "created_by": "string" },
  "timestamp": "ISO8601"
}

**Consumers:** analytics-service, notification-service

*(If no events: Write "N/A - Synchronous API only")*

## 4. Idempotency Rules

### POST /api/v1/projects
**Mechanism:** `Idempotency-Key` header
- Backend checks `processed_requests` table
- If key exists → return cached response
- If new → process + cache for 24h

### Kafka Event Processing
- `processed_events` table: (tenant_id, event_id) UNIQUE
- INSERT ON CONFLICT DO NOTHING before processing

## 5. Mock Specifications

// mocks/projects.ts
export const mockProjects = [
  { id: "proj_test_1", tenant_id: "tenant_test", name: "Test Project" }
];

// MSW handler
http.post('/api/v1/projects', () => {
  return HttpResponse.json({
    success: true,
    data: mockProjects[0]
  });
})

## 6. Non-Functional Requirements

**Performance:**
- p95 latency < 200ms
- N+1 prevention via Prisma `include`

**Security:**
- RLS on all tables (see [RLS skill](../postgresql-rls-architecture/))
- JWT RS256, 1h expiry
- Rate limit: 100 req/min per tenant

**Observability:**
- OpenTelemetry span per request
- Prometheus `/metrics` endpoint

## 7. Acceptance Criteria

- [ ] POST /api/v1/projects creates project with correct tenant_id
- [ ] RLS prevents cross-tenant reads
- [ ] Soft delete: DELETE sets deleted_at (not actual deletion)
- [ ] Idempotency-Key prevents duplicates
- [ ] API p95 < 200ms (10 concurrent users)

## 8. Sign-off

| Role | Agent | Status | Date |
|------|-------|--------|------|
| THESIS | Phúc SA | ✅ APPROVED | 2026-03-15 |
| ANTI-THESIS | Mộc | ⏳ PENDING | - |
| SYNTHESIS | Xuân | ❌ BLOCKED | - |

**Blockers:** (List any)
```

---

## 8-Section Checklist

- [ ] 1. API Contracts (endpoints, request/response)
- [ ] 2. Error Handling (≥5 error codes)
- [ ] 3. Events/Pub-Sub (events OR "N/A")
- [ ] 4. Idempotency Rules (retry/dedup)
- [ ] 5. Mock Specifications (MSW, fixtures)
- [ ] 6. Non-Functional Requirements (perf, security, observability)
- [ ] 7. Acceptance Criteria (testable: input → output)
- [ ] 8. Sign-off (THESIS/ANTI-THESIS/SYNTHESIS)

---

## Self-Validation

```bash
wc -l docs/CONTRACT_DRAFT.md  # ≥30 lines?
grep -c "| \`" docs/CONTRACT_DRAFT.md  # ≥5 error cases?
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| <5 error cases | Add edge cases (timeout, deadlock, invalid input) |
| Vague criteria | "API works" → "POST returns 200 + data.id" |
| Mock mismatch | Align mock envelope with API contract |
| Missing section | Copy template section above |
