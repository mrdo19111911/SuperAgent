# Data Flow Tracing

End-to-end data flow verification for code reviews (DB → API → State → UI).

## Purpose

Helps reviewers trace data flow across all consumers to prevent incomplete implementations.

## For Mộc Arch-Chal

Use when:
- Reviewing persistence changes
- Checking data flow completeness
- Preventing PEN-001 violations (incomplete consumer updates)

## Core Principle

**Trace from source to ALL consumers**
When persistence changes (DB → API → State), verify EVERY component that reads the data is updated.

## PEN-001 Violation

Missing consumer updates after persistence refactor:
- 3 components still read RAM-only `traceBuffer`
- No DB restore path implemented
- User sees empty data after refresh
