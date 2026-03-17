## Quick Ref: Playwright Best Practices

### Locator Strategy (Priority Order)
1. **Role-based:** `page.getByRole('button', { name: 'Submit' })` ✅ Best
2. **Label-based:** `page.getByLabel('Email address')` ✅ Good
3. **Test ID:** `page.getByTestId('submit-button')` ⚠️ OK (add `data-testid` in code)
4. **CSS/XPath:** `page.locator('.css-class')` ❌ Brittle (last resort)

### Auto-Retry Assertions (NO hardcode waits!)
```typescript
// ❌ BAD: Hardcode wait
await page.waitForTimeout(2000);
expect(element).toBeVisible();

// ✅ GOOD: Auto-retry assertion
await expect(page.getByRole('alert')).toBeVisible();
```

### Page Object Model Pattern
```typescript
class OrderPage {
  constructor(private page: Page) {}

  async createOrder(data: OrderData) {
    await this.page.getByRole('button', { name: 'New Order' }).click();
    await this.page.getByLabel('Customer').fill(data.customer);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Order created')).toBeVisible();
  }
}
```

### Test Isolation Pattern
```typescript
test.beforeEach(async ({ page }) => {
  // Create fresh tenant + user for THIS test only
  const tenant = await createTestTenant();
  const user = await createTestUser(tenant);
  await loginAs(page, user);
});

test.afterEach(async () => {
  // Cleanup (optional if using transaction rollback)
  await deleteTestData();
});
```

### Multi-Browser Config
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### Flaky Test Prevention Checklist
- [ ] No `page.waitForTimeout()` — use `expect().toBeVisible()`
- [ ] Test isolation — no shared state between tests
- [ ] Tenant isolation — each test creates own tenant
- [ ] Parallel-safe — tests can run concurrently
- [ ] Verify stability: `npx playwright test --repeat-each=5`

---


## Current Focus (Sprint 12)

- **Playwright coverage expansion:** Order management module (target 80%)
- **Accessibility testing:** WCAG 2.1 AA compliance for all critical flows
- **Chaos testing:** gremlins.js integration into CI pipeline
- **Flaky test elimination:** <5% flaky rate (currently 8%)

---
