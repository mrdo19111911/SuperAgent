# C6: Tech Debt & Quality

**Focus:** Is code maintainable and well-tested?

## Checklist

- [ ] **Cyclomatic Complexity:** Functions <10 complexity?
- [ ] **Code Duplication:** Minimal duplication (DRY principle)?
- [ ] **Test Coverage:** >80% coverage?
- [ ] **TODO/FIXME:** No unresolved TODO/FIXME in production code?
- [ ] **Dead Code:** No unused imports/functions?
- [ ] **Linting:** Code passes linter (ESLint, RuboCop)?

## Red Flags

- High cyclomatic complexity (>15)
- Test coverage <50%
- Many TODO/FIXME comments (unfinished work)
- Duplicate code blocks (copy-paste programming)

## Examples

**HIGH DEBT:** 45 TODO/FIXME, coverage 32%, complexity 18
**LOW DEBT:** No TODO, coverage 92%, complexity <8, clean linter
