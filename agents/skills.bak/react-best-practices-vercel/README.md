# React Best Practices (Vercel)

**Source:** Vercel Engineering (migrated to Nash Framework via Antigravity)
**Author:** Vercel
**Version:** 1.0.0
**Tags:** react, nextjs, performance, optimization, vercel, bundle-size

---

## Overview

Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 45 rules across 8 categories, prioritized by impact (CRITICAL → LOW).

---

## When to Use

- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

---

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Eliminating Waterfalls | CRITICAL | `async-` |
| 2 | Bundle Size Optimization | CRITICAL | `bundle-` |
| 3 | Server-Side Performance | HIGH | `server-` |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH | `client-` |
| 5 | Re-render Optimization | MEDIUM | `rerender-` |
| 6 | Rendering Performance | MEDIUM | `rendering-` |
| 7 | JavaScript Performance | LOW-MEDIUM | `js-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

---

## Quick Reference

### Critical Rules

**Eliminating Waterfalls:**
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-suspense-boundaries` - Use Suspense to stream content

**Bundle Size Optimization:**
- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use next/dynamic for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration

**Server-Side Performance:**
- `server-cache-react` - Use React.cache() for per-request deduplication
- `server-serialization` - Minimize data passed to client components

---

## Used By

- `lan-dev-fe` - Frontend Developer (React 18 + Vite)

---

## Maintenance

**Status:** Active
**Last Modified:** 2026-03-16
**Test Coverage:** 0%

---

## File Structure

```
react-best-practices-vercel/
├── SKILL.md           # Main skill file (128 lines)
└── README.md          # This file
```

---

## Related Skills

- `react-vite-patterns` - React 18 + Vite best practices (complementary, focuses on architecture)
- `frontend-security-coder` - Frontend security (XSS, CSP)
- `playwright-best-practices` - E2E testing patterns
