## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (-30 điểm)

**1. Fake GREEN E2E test (2026-02-10, -30, BUG-701)**
- **Vi phạm:** E2E test PASS nhưng không test flow thực (empty assertion)
- **Ví dụ:** `await page.click('button'); // no expectation → test passes but useless`
- **Fix:** ALWAYS có assertion sau action: `expect(locator).toBeVisible()`, `expect(text).toContain('Expected')`
- **Multiplier:** M1 (Missed bug) × 2 = -60 nếu bug leak production

**2. Flaky test block CI pipeline (2026-02-18, -30, BUG-715)**
- **Vi phạm:** Flaky test check vào CI → Pipeline bị block ngẫu nhiên → Sơn QA bắt
- **Root cause:** Dùng `page.waitForTimeout(2000)` thay vì `expect().toBeVisible()`
- **Fix:** ALWAYS dùng auto-retry assertions, NEVER hardcode wait
- **Verify:** Run `npx playwright test --repeat-each=5` trước khi commit

### P1 HIGH (-20 điểm)

**3. Brittle CSS selector (2026-02-25, -20, BUG-728)**
- **Vi phạm:** Dùng hardcode CSS selector → test break khi UI thay đổi nhỏ
- **Bad:** `page.locator('.css-class-123 > div:nth-child(2)')`
- **Good:** `page.getByRole('button', { name: 'Submit' })`
- **Fix:** Playwright Best Practices — ALWAYS dùng semantic locators

**4. Missing accessibility test (2026-03-02, -20, BUG-741)**
- **Vi phạm:** E2E test pass nhưng app không accessible (keyboard nav, screen reader)
- **Impact:** Production fail WCAG 2.1 AA compliance
- **Fix:** Check `aria-label`, `role`, keyboard navigation trong critical flows
- **Tool:** `npx playwright test --project=accessibility`

**5. Browser compat not tested (2026-03-08, -20, BUG-755)**
- **Vi phạm:** Test chỉ chạy Chrome → Safari bug leak production
- **Fix:** ALWAYS test multi-browser: `npx playwright test --project=chromium --project=firefox --project=webkit`
- **Playwright config:** Define all 3 browser projects

### P2 MEDIUM (-15 điểm)

**6. No POM for critical flow (2026-02-12, -15, BUG-708)**
- **Vi phạm:** Duplicate setup code khắp test suite — không dùng POM
- **Impact:** Hard to maintain, brittle tests
- **Fix:** Create Page Object Model class cho mỗi critical flow
- **Pattern:** `class LoginPage { async login(user, pass) {...} }`

**7. Responsive layout not tested (2026-02-20, -15, BUG-722)**
- **Vi phạm:** Test chỉ chạy desktop (1920x1080) → Mobile bug leak
- **Fix:** Test multiple viewports: `page.setViewportSize({ width: 375, height: 667 })` (mobile), tablet, desktop
- **Coverage target:** 80% critical flows on 3 viewports

**8. Console errors ignored (2026-02-28, -15, BUG-735)**
- **Vi phạm:** E2E test pass nhưng browser console đầy errors
- **Impact:** Silent JS errors leak production
- **Fix:** Add `page.on('console', msg => { if (msg.type() === 'error') fail(); })`
- **Crawlee:** Use HTML integrity scan to catch console errors

**9. Test data leak between tests (2026-03-05, -15, BUG-748)**
- **Vi phạm:** Test phụ thuộc test trước → flaky khi chạy parallel
- **Fix:** ALWAYS test isolation — mỗi test tự setup data riêng
- **Pattern:** Use `test.beforeEach()` to create fresh tenant/user

**10. Missing error state test (2026-03-10, -15, BUG-762)**
- **Vi phạm:** Chỉ test happy path → 404/500 error page không test
- **Impact:** Production error UI broken
- **Fix:** Coverage target 80% cho error states (404, 500, network fail)

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

**1. E2E caught regression before Sơn QA (2026-02-15, +20, WIN-012)**
- **Impact:** Playwright test detect order creation bug → Block before QA gate
- **Metric:** Save 2 hours manual QA time
- **Pattern:** POM + auto-retry assertions + multi-browser

**2. Stable Playwright suite 100% pass rate (2026-03-01, +15, WIN-023)**
- **Achievement:** 5/5 runs stable, coverage 85% critical flows
- **Technique:** Semantic locators + test isolation + no hardcode waits
- **Impact:** CI pipeline green, team confidence high

**3. gremlins.js found crash bug (2026-02-22, +15, WIN-018)**
- **Impact:** Chaos testing → app crash on rapid click + scroll
- **Documentation:** Repro steps đầy đủ → Dev fix in 1 hour
- **Pattern:** `gremlins.createHorde().unleash()` with constraints

**4. Accessibility audit fix (2026-03-08, +10, WIN-028)**
- **Impact:** Found 12 WCAG violations → All fixed before deploy
- **Tool:** Playwright accessibility plugin + manual keyboard nav test
- **Result:** WCAG 2.1 AA compliance achieved

**5. Multi-browser testing prevented Safari bug (2026-03-12, +10, WIN-032)**
- **Impact:** Date picker broken on Safari → Caught in CI before deploy
- **Coverage:** Chromium + Firefox + WebKit all green
- **Pattern:** `playwright.config.ts` with 3 browser projects

_Full history: See LEDGER_

---
