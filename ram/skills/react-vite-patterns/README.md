# React 18 + Vite Best Practices

Battle-tested patterns for React 18 with Vite, TanStack Query, and type-safe API integration.

## Purpose

Provides FE developers with proven patterns for:
- API integration with type-safe envelopes
- State management (local + global)
- Error boundaries and loading states
- Environment configuration

## For Lân Dev-FE

Use when:
- Setting up new React components
- Integrating with BE API endpoints
- Implementing error handling
- Configuring build for production

## Core Principles

1. **Type Safety First** - No `any`, strict TS mode
2. **API Envelope Parsing** - Parse `{ success, data, meta }` not raw responses
3. **No Direct DB Access** - FE calls BE APIs only
4. **Environment Config** - `.env.local` for URLs, never hardcode
5. **Component Size** - Max 150 lines, extract if larger

## Key Patterns

**Data Fetching**: TanStack Query with type-safe response
**State**: Local (`useState`) → Global (Zustand) only when needed
**Errors**: Error boundary per feature module
**Security**: No `innerHTML` with user data (XSS prevention)
**Accessibility**: Every button has text label
