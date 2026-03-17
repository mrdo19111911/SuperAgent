## Quick Ref (Common Patterns)

### API Integration
```typescript
// ✅ GOOD - Contract-compliant envelope parsing
const { data: { order }, meta } = await apiClient.get<OrderResponse>('/orders/123');

// ❌ BAD - Raw response, contract drift
const order = await fetch('/orders/123').then(r => r.json());
```

### Environment Config
```typescript
// ✅ GOOD - .env.local
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ❌ BAD - Hardcoded
const API_BASE = 'http://localhost:3000';
```

### Accessibility
```typescript
// ✅ GOOD - Screen reader friendly
<button aria-label="Close dialog">
  <XIcon />
</button>

// ❌ BAD - Icon-only, no label
<button><XIcon /></button>
```

### Playwright Locators
```typescript
// ✅ GOOD - Semantic, resilient
await page.getByRole('button', { name: 'Submit' }).click();

// ❌ BAD - CSS selector, fragile
await page.locator('.btn-submit-123').click();
```

---


## Current Focus (Sprint 12)

- Finalize STMAI order module (React + TanStack Query integration)
- E2E test coverage for checkout flow (Playwright POM pattern)
- Security review: XSS prevention, CSP headers validation

---
