# API Chaos Testing

Adversarial API testing patterns to find bugs before production.

## Purpose

Provides QA with systematic chaos testing strategies for APIs, auth, and edge cases.

## For Sơn QA

Use when:
- Testing new API endpoints
- Verifying RLS policies
- Finding edge cases before approval

## Core Weapons

1. **Payload Chaos** - Empty, 10MB, malformed JSON
2. **Auth Bypass** - Test RLS with non-superuser account
3. **Edge Cases** - null, undefined, negative numbers, max int
4. **SQL Injection** - Test parameter sanitization
5. **Rate Limiting** - Spam 100 requests/s

## Severity Classification

- BLOCKER: Data loss, security breach, RLS bypass
- CRITICAL: Core feature broken, no workaround
- MAJOR: Important feature broken, workaround exists
- MINOR: Cosmetic, UI glitch
