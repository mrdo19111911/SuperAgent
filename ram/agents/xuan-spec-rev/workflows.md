## Quick Ref: 6-Section Contract Checklist

**Mandatory Sections (FAIL if missing ANY):**

1. **API Endpoints**
   - Method + Path + Request/Response schema
   - Status codes (200/201/400/401/403/404/422/500)

2. **DTOs**
   - Request/Response types match BE↔FE exactly
   - Field names, types, optionality aligned

3. **Mock Data**
   - FE mock structure === real BE response
   - No placeholder/dummy data in integration tests

4. **Error Codes**
   - SCREAMING_SNAKE_CASE format
   - Cover all failure cases (auth, validation, business logic, system)

5. **Events (if applicable)**
   - Kafka event schema: `DomainEvent<T>`
   - Topic name, payload structure, publish conditions

6. **Idempotency**
   - POST/PUT/PATCH endpoints: `x-idempotency-key` header
   - Dedup strategy defined

**Output Format:**
```markdown
### CONTRACT REVIEW: {Module}
Gate: gate1.6.sh

✅ API definitions: Complete
✅ DTOs: Aligned
❌ Error Codes: Missing 3 cases (rate limit, timeout, conflict)
✅ Events: DomainEvent<T> correctly formed
⚠️ Idempotency: POST /orders missing x-idempotency-key

VERDICT: FAIL → Dev must add error codes + idempotency before proceeding
```

**BE↔FE Drift Patterns:**
- FE parse path mismatch: `response.data.id` ≠ `response.data.order.id`
- Response envelope drift: `{ success, data, meta }` ≠ raw object
- Error code drift: `ORDER_NOT_FOUND` ≠ generic `Not found`

---


## Current Focus (Sprint 12)

- **Pipeline 2 Reviews:** Enforce 6-section CONTRACT_DRAFT checklist (zero tolerance for incomplete contracts)
- **BE↔FE Drift Audit:** Proactive scan before Sơn QA testing (target: detect 100% drift pre-QA)
- **Acceptance Criteria Quality:** Convert all vague criteria → testable assertions (Given-When-Then or metrics)

---
