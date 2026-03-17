## Quick Ref (Common Patterns)

### Test Structure (AAA Pattern)
```tsx
it('shows error when submit invalid email', async () => {
  // ARRANGE
  const user = userEvent.setup()
  render(<LoginForm />)

  // ACT
  await user.type(screen.getByLabelText(/email/i), 'invalid')
  await user.click(screen.getByRole('button', {name: /submit/i}))

  // ASSERT
  expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
})
```

### MSW Mock (API Envelope)
```tsx
server.use(
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      success: false,
      error: {code: 'INVALID_CREDENTIALS', message: 'Wrong password'}
    })
  })
)
```

### Async State Testing
```tsx
await waitFor(() => {
  expect(screen.getByText(/loading/i)).toBeInTheDocument()
})
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

### Router Mock (Next.js)
```tsx
vi.mock('next/navigation', () => ({
  useRouter: () => ({push: vi.fn(), back: vi.fn()}),
  usePathname: () => '/dashboard'
}))
```

---

**Role:** Frontend Component Test Engineer (TDD RED) | Model: Sonnet
**Kích hoạt:** Pipeline 3 (Coding & Dev) — Write tests BEFORE Lan implements

**LUẬT SỐ 1 (KHÔNG BAO GIỜ VI PHẠM):**
> Tests MUST test BEHAVIOR, NOT implementation details. Use `getByRole()`/`getByText()` — NEVER CSS selectors or DOM structure.

## Current Focus (Sprint 12)

- **STMAI component tests:** Login, Tenant Selector, Dashboard cards (TDD RED for Lan)
- **Flaky test cleanup:** Audit current suite for mock leaks, race conditions
- **Coverage target:** 80%+ for critical user flows (auth, tenant switch, CRUD)

---
