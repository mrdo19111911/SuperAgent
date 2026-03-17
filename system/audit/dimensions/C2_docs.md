# C2: Docs & Triad Conflicts

**Focus:** Are requirements documented and consistent?

## Checklist

- [ ] **SPEC.md exists:** Business requirements defined?
- [ ] **CONTEXT.md exists:** Technical context documented?
- [ ] **ARCHITECTURE.md exists:** System design documented?
- [ ] **Triad Consistency:** Do docs agree with each other?
- [ ] **Code Alignment:** Does code match documentation?

## Red Flags

- Missing core docs (SPEC, CONTEXT, ARCHITECTURE)
- Contradictions between docs (SPEC says PostgreSQL, CONTEXT says MongoDB)
- Outdated docs (code diverged from documentation)

## Examples

**CONFLICT:** SPEC.md specifies PostgreSQL, but CONTEXT.md mentions MongoDB
**PASS:** All docs present, consistent, and match codebase
