# Module Decomposition Strategy

Break complex systems into manageable modules with clear boundaries.

## Purpose

Provides strategies for decomposing monoliths or designing modular systems from scratch. Covers vertical slicing, horizontal layering, and hybrid approaches.

## For Phúc SA

Use when:
- Designing new system structure
- Refactoring large files (>200 lines)
- Eliminating circular dependencies
- Deciding between vertical vs horizontal slicing

## 3 Decomposition Approaches

1. **By Domain (Vertical)** - Feature complete slices (e.g., products/, orders/)
2. **By Layer (Horizontal)** - Technical layers (controllers/, services/)
3. **By Feature (Hybrid)** - Balance of both

## Key Rules

- Module <200 lines/file
- Dependencies <5 per module
- No circular dependencies
- Domain-specific names (NOT `utils`, `helpers`)

## See Also

- [Architecture Decision Framework](../architecture-decision-framework/) - When to use each approach
- [Design Pattern Selection](../design-pattern-selection/) - Patterns for modules
