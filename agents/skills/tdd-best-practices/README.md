# TDD Best Practices

Test-Driven Development patterns for RED → GREEN → REFACTOR cycles with high coverage targets.

## Purpose

Helps backend developers write tests BEFORE implementation following strict TDD discipline.

## For Backend Devs (Thúc/Tuấn/Hoàng)

Use when:
- Starting new feature implementation
- Writing integration tests
- Verifying test coverage before PR

## Core Principle

**RED → GREEN → REFACTOR**
1. RED: Write failing test (MUST fail initially)
2. GREEN: Write minimal code to pass
3. REFACTOR: Clean up while keeping tests green

## Coverage Targets

- Unit tests: ≥80%
- Integration tests: ≥70%
- E2E tests: Critical user paths only
