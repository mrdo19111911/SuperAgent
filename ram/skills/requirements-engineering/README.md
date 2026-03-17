# Requirements Engineering

Systematic requirements elicitation with SMART criteria, acceptance tests, and MoSCoW prioritization.

## Purpose

Transform vague stakeholder requests into testable specifications that engineering teams can implement with confidence. Prevents production bugs caused by ambiguous requirements.

## For PMs/Analysts (Conan, Dung, Chau, Xuan)

Use when:
- Writing user stories for new features
- Defining acceptance criteria before architecture phase
- Clarifying edge cases and non-functional requirements
- Decomposing epics into stories
- Prioritizing feature backlog (MoSCoW)

## Core Philosophy

**"If you can't test it, it's not a requirement — it's a wish."**

Three operational modes:
- **CRITICAL:** Missing acceptance criteria, ambiguous constraints (blocks architecture)
- **INFORMATIONAL:** UI/UX polish, nice-to-have features (document, don't block)
- **VALIDATION:** Testable assertions with concrete metrics

## Key Patterns

**User Story Structure:**
- As a [role], I want [goal], So that [benefit]
- Acceptance criteria in Given-When-Then format (BDD)
- Non-functional requirements (performance, security, scalability)
- Edge cases (≥5 scenarios)
- MoSCoW priority (Must/Should/Could/Won't)

**5 Elicitation Techniques:**
1. Stakeholder Interviews (5 Whys for root cause)
2. Prototyping (wireframe → requirement mapping)
3. Workshops (cross-functional alignment)
4. Observation (field study, workflow optimization)
5. BDD Scenarios (technical teams, API contracts)

**Anti-Pattern Prevention:**
- "User can export data" → "Export max 10K rows as CSV in <5s, else async job"
- "System is secure" → "RLS policy enforced, JWT expires 1h, rate limit 100/min"
- "Fast performance" → "P95 latency < 500ms for GET /orders"

## Integration

- **BDD Tests:** Gherkin scenarios become Cucumber/Jest step definitions
- **Sign-off:** Product Owner + Tech Lead + Security (written approval required)
- **Traceability:** Story ID in commits, PRs, tests
- **Scope Control:** Max 3 stakeholder rounds, escalate if unclear

## Version

2.0.0 (GSTACK-compliant)
