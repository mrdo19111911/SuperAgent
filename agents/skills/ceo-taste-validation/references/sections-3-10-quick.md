# CEO Review Sections 3-10 (Quick Reference)

Load this file when reviewing sections 3-10. For detailed examples, create separate files as needed.

---

## Section 3: Security & Threat Model

### Evaluate

**Attack surface expansion:**
- What new attack vectors? (endpoints, params, file paths, background jobs)

**Input validation:**
- For every new user input: validated? sanitized? rejected loudly on failure?
- Test: nil, empty string, wrong type, exceeds max length, unicode, HTML/script injection

**Authorization:**
- For every new data access: scoped to right user/role?
- Direct object reference vulnerability? (Can user A access user B's data by manipulating IDs?)

**Secrets and credentials:**
- New secrets? In env vars, not hardcoded? Rotatable?

**Injection vectors:**
- SQL injection, command injection, template injection, LLM prompt injection

**Audit logging:**
- For sensitive operations: audit trail exists?

### Output Template

```markdown
### Security Findings

| Threat | Likelihood | Impact | Mitigated? | How? |
|--------|------------|--------|------------|------|
| [Threat] | High/Med/Low | High/Med/Low | Y/N | [Description] |
```

---

## Section 4: Test Strategy

### Make Complete Diagram

```
NEW UX FLOWS:
  [list each new user-visible interaction]

NEW DATA FLOWS:
  [list each new path data takes through system]

NEW CODEPATHS:
  [list each new branch, condition, execution path]

NEW BACKGROUND JOBS / ASYNC WORK:
  [list each]

NEW INTEGRATIONS / EXTERNAL CALLS:
  [list each]

NEW ERROR/RESCUE PATHS:
  [list each — cross-reference Section 2]
```

### For Each Item

- **Test type:** Unit / Integration / System / E2E
- **Test exists?** Y/N
- **Happy path test?** Y/N
- **Failure path test?** Which failure?
- **Edge case test?** nil, empty, boundary values, concurrent access

### Test Ambition Check

- What test makes you confident shipping at 2am Friday?
- What test would hostile QA engineer write to break this?
- What's the chaos test?

### Test Pyramid Check

Many unit, fewer integration, few E2E? Or inverted (bad)?

### Flakiness Risk

Flag any test depending on: time, randomness, external services, ordering

---

## Section 5: Observability & Debugging

### Evaluate

**Logging:**
- For every new codepath: structured log lines at entry, exit, each significant branch?

**Metrics:**
- For every new feature: what metric tells you it's working? What tells you it's broken?

**Tracing:**
- For new cross-service flows: trace IDs propagated?

**Alerting:**
- What new alerts should exist?

**Dashboards:**
- What new dashboard panels do you want on day 1?

**Debuggability:**
- If bug reported 3 weeks post-ship, can you reconstruct what happened from logs alone?

**Admin tooling:**
- New operational tasks that need admin UI or rake tasks?

**Runbooks:**
- For each new failure mode: what's the operational response?

### EXPANSION Addition

What observability would make this feature a **joy to operate**?

---

## Section 6: Deployment & Rollout

### Evaluate

**Migration safety:**
- For every DB migration: backward-compatible? Zero-downtime? Table locks?

**Feature flags:**
- Should any part be behind feature flag?

**Rollout order:**
- Correct sequence: migrate first, deploy second?

**Rollback plan:**
- Explicit step-by-step

**Deploy-time risk window:**
- Old code and new code running simultaneously — what breaks?

**Environment parity:**
- Tested in staging?

**Post-deploy verification:**
- First 5 minutes checklist? First hour?

**Smoke tests:**
- What automated checks run immediately post-deploy?

### EXPANSION Addition

What deploy infrastructure would make shipping this feature **routine**?

---

## Section 7: Performance & Scaling

### Evaluate

**N+1 queries:**
- For every new ActiveRecord association traversal: includes/preload present?

**Memory usage:**
- For every new data structure: max size in production?

**Database indexes:**
- For every new query: index present?

**Caching opportunities:**
- For every expensive computation or external call: should it be cached?

**Background job sizing:**
- For every new job: worst-case payload, runtime, retry behavior?

**Slow paths:**
- Top 3 slowest new codepaths + estimated p99 latency

**Connection pool pressure:**
- New DB connections, Redis connections, HTTP connections?

---

## Section 8: User Experience & Edge Cases

### Interaction Edge Cases

For every new user-visible interaction:

```
INTERACTION          | EDGE CASE              | HANDLED? | HOW?
---------------------|------------------------|----------|--------
Form submission      | Double-click submit    | ?        |
                     | Submit with stale CSRF | ?        |
                     | Submit during deploy   | ?        |
Async operation      | User navigates away    | ?        |
                     | Operation times out    | ?        |
                     | Retry while in-flight  | ?        |
List/table view      | Zero results           | ?        |
                     | 10,000 results         | ?        |
                     | Results change mid-page| ?        |
Background job       | Job fails after 3/10   | ?        |
                     | Job runs twice (dup)   | ?        |
                     | Queue backs up 2 hours | ?        |
```

### UI States

Every screen must handle:
- **Happy state:** Data present
- **Loading state:** Data fetching
- **Error state:** Fetch failed
- **Empty state:** No data (with helpful message)

---

## Section 9: Documentation & Knowledge Transfer

### Evaluate

**Architecture diagram:**
- Up to date? Shows new components?

**API documentation:**
- For every new endpoint: request/response examples, error codes

**Schema documentation:**
- New tables/columns documented? Relationships clear?

**Runbooks:**
- For every new failure mode: step-by-step troubleshooting

**Code comments:**
- Complex logic explained? WHY not just WHAT?

**ASCII diagrams in code:**
- For complex designs: embedded in relevant files?

**The 1-year question:**
- Read this plan as new engineer in 12 months — obvious?

---

## Section 10: Opinionated Recommendations

### The Big Three Questions

1. **What's the biggest risk if we ship this as-is?**
   - Concrete failure scenario
   - Likelihood + impact
   - Mitigation

2. **What's the biggest opportunity we're missing?**
   - What would make this 2x better for 1.2x effort?
   - Platform potential?
   - Delight opportunities?

3. **If you could change ONE thing, what would it be?**
   - The most important improvement
   - WHY it matters
   - Effort vs impact

### EXPANSION Mode Additions

**What comes after this ships?**
- Phase 2? Phase 3?
- Does the architecture support that trajectory?

**Platform potential:**
- Does this create capabilities other features can leverage?

### Reversibility Rating (1-5)

- **1:** One-way door (can't undo without major refactor)
- **3:** Reversible but painful (data migration required)
- **5:** Easily reversible (feature flag, config change)

---

## Output Format for All Sections

```markdown
## Section [N]: [Title]

### Findings
- ✅ Good: [what's good]
- ⚠️ Concern: [what's risky]
- ❌ Gap: [what's missing]

### Recommendations
1. [Specific action] - **WHY:** [reasoning]
2. [Specific action] - **WHY:** [reasoning]

### ASCII Diagram
[If applicable]

---
**STOP.** Asking user about: [one specific issue]

**Options:**
A) [Recommended] - [effort, risk, maintenance]
B) [Alternative 1] - [effort, risk, maintenance]
C) [Alternative 2] - [effort, risk, maintenance]

**Recommendation:** Do [LETTER]. [1-2 sentence WHY].
```

---

## Completion Summary Template

```
+====================================================================+
|            MEGA PLAN REVIEW — COMPLETION SUMMARY                   |
+====================================================================+
| Mode selected        | EXPANSION / HOLD / REDUCTION                |
| System Audit         | [key findings]                              |
| Step 0               | [mode + key decisions]                      |
| Section 1  (Arch)    | ___ issues found                            |
| Section 2  (Errors)  | ___ error paths mapped, ___ GAPS            |
| Section 3  (Security)| ___ issues found, ___ High severity         |
| Section 4  (Data/UX) | ___ edge cases mapped, ___ unhandled        |
| Section 5  (Quality) | ___ issues found                            |
| Section 6  (Tests)   | Diagram produced, ___ gaps                  |
| Section 7  (Perf)    | ___ issues found                            |
| Section 8  (Observ)  | ___ gaps found                              |
| Section 9  (Deploy)  | ___ risks flagged                           |
| Section 10 (Future)  | Reversibility: _/5, debt items: ___         |
+--------------------------------------------------------------------+
| NOT in scope         | written (___ items)                          |
| What already exists  | written                                     |
| Dream state delta    | written                                     |
| Error/rescue registry| ___ methods, ___ CRITICAL GAPS              |
| Failure modes        | ___ total, ___ CRITICAL GAPS                |
| TODOS.md updates     | ___ items proposed                          |
| Delight opportunities| ___ identified (EXPANSION only)             |
| Diagrams produced    | ___ (list types)                            |
| Stale diagrams found | ___                                         |
| Unresolved decisions | ___ (listed below)                          |
+====================================================================+
```

---

**Token Count:** ~1,500 tokens (covers 8 sections in compressed format)
