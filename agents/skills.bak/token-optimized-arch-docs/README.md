# Token-Optimized Architecture Documentation

Create ARCHITECTURE_ABSTRACT.md (~150 lines) to complement full ARCHITECTURE.md for token-efficient reviews.

## Purpose

Reduces token consumption for gate reviewers (Xuân, Dũng) by 85%+ while preserving technical accuracy. Implements WIN-001 pattern (ARCHITECTURE_ABSTRACT.md helped Xuân P1.6.5 read faster).

## For Phúc SA (Solution Architect)

Use this skill when:
- Completing `ARCHITECTURE.md` in Pipeline 2 THESIS
- Preparing handoff to Xuán Spec-Rev (Gate 1.6.5)
- Token budget approaching limits (>150K tokens used)
- Creating onboarding docs for new agents

## 5 Token Optimization Techniques

1. **Aggressive Summarization** - Compress prose → bullets + pointers (60% reduction)
2. **Table Format** - Structured data in markdown tables (60% reduction)
3. **Bullets Over Sentences** - Remove filler words (61% reduction)
4. **Code → File References** - Link to files instead of snippets (85% reduction)
5. **Acronyms + Glossary** - Use acronyms after first definition

## Template Structure

- System overview (1 paragraph)
- Module boundaries (bullets)
- Key decisions (table)
- Critical constraints (numbered list)
- Data flow (high-level)
- Tech stack + schema highlights
- Pointers to full doc sections

## Success Metrics

- Abstract ≤150 lines (strict)
- Xuân completes Gate 1.6.5 in <5K tokens (vs. 15K+ without abstract)
- 85%+ token savings for reviewers

## Integration

- **Pipeline:** 02_ARCHITECTURE_AND_DB.md (post-THESIS)
- **WIN Entry:** WIN-001 (token savings pattern)
- **Gates:** 1.6.5 (Xuán reads abstract first)

## See Also

- [phuc-sa.md](../../core/phuc-sa.md) - WIN-001 reference
- [ARCHITECTURE template](../../../templates/ARCHITECTURE.md) (if exists)
