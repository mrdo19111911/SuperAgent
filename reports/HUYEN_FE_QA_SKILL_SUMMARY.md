# Huyền FE-QA Skills - Quick Reference

**Agent:** `agents/dev/huyen-fe-qa.md`
**Last Updated:** 2026-03-16

---

## Installed Skills (6 Total)

### 1. playwright-best-practices-skill ⭐ PRIMARY
**Path:** `agents/skills/playwright-best-practices-skill/SKILL.md`
**Status:** ✅ Pre-installed
**Coverage:** 70+ reference files

**Use for:**
- Locator strategies (role-based > CSS)
- Flaky test debugging (`debugging/flaky-tests.md`)
- Page Object Model patterns
- CI/CD integration
- Mobile/responsive testing
- Network mocking & interception
- Authentication flows
- Visual regression testing

**Key References:**
- `core/locators.md` - Role-based locator priority
- `core/assertions-waiting.md` - Web-first assertions
- `core/page-object-model.md` - POM implementation
- `debugging/flaky-tests.md` - Flakiness detection & fixes
- `testing-patterns/forms-validation.md` - Form testing
- `infrastructure-ci-cd/github-actions.md` - CI setup

---

### 2. playwright-e2e-testing
**Path:** `agents/skills/playwright-e2e-testing/SKILL.md`
**Status:** ✅ Newly installed
**Coverage:** TypeScript E2E patterns

**Use for:**
- TypeScript-first E2E tests
- API testing with `request` fixture
- Responsive viewport testing
- Form interactions & navigation
- Test configuration
- CLI commands reference

**Key Workflows:**
- Forms & navigation
- API testing (request fixture)
- API mocking & interception
- Responsive testing (mobile/tablet/desktop)

---

### 3. qa-test-planner
**Path:** `agents/skills/qa-test-planner/SKILL.md`
**Status:** ✅ Newly installed
**Coverage:** Test planning, test cases, bug reports

**Use for:**
- Creating test plans (ISTQB-aligned)
- Generating test cases
- Writing bug reports
- Building regression suites
- Playwright test templates

**Templates:**
- `assets/templates/test-plan.md`
- `assets/templates/test-case.md`
- `assets/templates/bug-report.md`
- `assets/templates/playwright-test.md`

**References:**
- `references/bug_report_templates.md`
- `references/regression_testing.md`
- `references/playwright_automation.md`

---

### 4. webapp-playwright-testing
**Path:** `agents/skills/webapp-playwright-testing/SKILL.md`
**Status:** ✅ Newly installed
**Coverage:** Live browser automation via Playwright MCP

**Use for:**
- Live browser debugging
- UI element validation
- Screenshot capture
- Console log inspection
- Accessibility snapshots
- Responsive design testing

**MCP Tools:**
- `browser_navigate` - Go to URL
- `browser_click` - Click elements
- `browser_fill_form` - Fill inputs
- `browser_snapshot` - Accessibility tree
- `browser_take_screenshot` - Capture visual state
- `browser_console_messages` - View console logs

---

### 5. crawlee-html-integrity ⭐ CUSTOM
**Path:** `agents/skills/crawlee-html-integrity/SKILL.md`
**Status:** ✅ Newly created
**Coverage:** HTML integrity scanning with Crawlee

**Use for:**
- Scanning entire site for broken links
- Detecting missing images (404s)
- Checking console errors across pages
- Validating meta tags and SEO
- Performance checks

**Workflows:**
1. Basic link crawler
2. Image validation
3. Console error collection

**Example:**
```typescript
import { PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
    async requestHandler({ page, request, enqueueLinks }) {
        // Check for broken links
        const links = await page.$$eval('a', links =>
            links.map(link => ({ href: link.href, text: link.textContent }))
        );

        // Listen for console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.error(`Error on ${request.url}: ${msg.text()}`);
            }
        });

        await enqueueLinks();
    },
    maxRequestsPerCrawl: 50,
});

await crawler.run(['https://your-app.com']);
```

---

### 6. gremlins-chaos-testing ⭐ CUSTOM
**Path:** `agents/skills/gremlins-chaos-testing/SKILL.md`
**Status:** ✅ Newly created
**Coverage:** Chaos testing with gremlins.js

**Use for:**
- Stress testing UI with random interactions
- Finding race conditions and edge cases
- Validating error boundaries
- Testing unpredictable user behavior
- Smoke testing before releases

**Gremlin Species (Mogwais):**
- `clicker()` - Random clicks on elements
- `scroller()` - Random page scrolling
- `formFiller()` - Fill forms with random data
- `typer()` - Random keyboard input
- `toucher()` - Touch gestures (mobile)

**Example:**
```typescript
import { test } from '@playwright/test';

test('chaos test - random interactions', async ({ page }) => {
    await page.goto('https://your-app.com');

    await page.addScriptTag({
        url: 'https://unpkg.com/gremlins.js'
    });

    await page.evaluate(() => {
        window.gremlins.createHorde({
            strategies: [
                window.gremlins.strategies.distribution({ delay: 50 }),
            ],
            mogwais: [
                window.gremlins.mogwais.clicker(),
                window.gremlins.mogwais.scroller(),
                window.gremlins.mogwais.formFiller(),
                window.gremlins.mogwais.typer(),
            ],
        }).unleash({ nb: 200 }); // 200 random actions
    });

    await page.waitForTimeout(10000);
    await expect(page.locator('body')).toBeVisible();
});
```

---

## Skill Usage by Scenario

### Scenario 1: Writing E2E Tests for New Feature
**Skills to Use:**
1. `playwright-best-practices-skill` - Reference for locators, POM, assertions
2. `playwright-e2e-testing` - TypeScript patterns and configuration
3. `qa-test-planner` - Test plan and test case templates

**Workflow:**
1. Create test plan using `qa-test-planner/assets/templates/test-plan.md`
2. Write test cases using `qa-test-planner/assets/templates/test-case.md`
3. Implement tests following `playwright-best-practices-skill/core/locators.md`
4. Use POM pattern from `playwright-best-practices-skill/core/page-object-model.md`
5. Run `npx playwright test --repeat-each=5` to verify stability

---

### Scenario 2: Debugging Flaky Test
**Skills to Use:**
1. `playwright-best-practices-skill/debugging/flaky-tests.md` - Primary guide
2. `webapp-playwright-testing` - Live debugging with browser MCP

**Workflow:**
1. Reproduce flakiness: `npx playwright test --repeat-each=20`
2. Isolate parallelism: `npx playwright test --workers=1`
3. Analyze with `playwright-best-practices-skill/debugging/flaky-tests.md`
4. Fix based on flakiness type (UI-driven, environment-driven, etc.)
5. Verify fix: `npx playwright test --repeat-each=10`

---

### Scenario 3: HTML Integrity Check Before Release
**Skills to Use:**
1. `crawlee-html-integrity` - Site-wide scanning
2. `qa-test-planner` - Bug report templates

**Workflow:**
1. Run Crawlee scan to detect broken links and images
2. Collect console errors across all pages
3. Generate bug reports using `qa-test-planner/assets/templates/bug-report.md`
4. Fix issues and re-scan

---

### Scenario 4: Chaos Testing / Stress Testing UI
**Skills to Use:**
1. `gremlins-chaos-testing` - Random UI interactions
2. `qa-test-planner` - Bug report for crashes

**Workflow:**
1. Write chaos test using `gremlins-chaos-testing` patterns
2. Monitor console errors during chaos
3. Document crashes with screenshots
4. Create bug reports for unexpected behaviors
5. Use seeded randomness to reproduce exact crash sequence

---

### Scenario 5: Building Regression Suite
**Skills to Use:**
1. `playwright-best-practices-skill` - Test suite structure
2. `qa-test-planner` - Regression testing strategies
3. `playwright-e2e-testing` - Test configuration

**Workflow:**
1. Review `qa-test-planner/references/regression_testing.md`
2. Organize tests into tiers (smoke, sanity, full)
3. Tag tests using `playwright-best-practices-skill/core/test-tags.md`
4. Set up CI/CD using `playwright-best-practices-skill/infrastructure-ci-cd/github-actions.md`

---

## Alignment with Agent PEN/WIN Constraints

### Preventing PEN Penalties

**P0 (-30): E2E test PASS but no real flow test**
✅ **Solution:** Use `playwright-best-practices-skill/core/assertions-waiting.md` for proper web-first assertions
```typescript
// ❌ BAD (empty assertion)
await page.getByRole('button').click();
// No verification!

// ✅ GOOD (proper assertion)
await page.getByRole('button').click();
await expect(page).toHaveURL(/dashboard/);
await expect(page.getByRole('alert')).toContainText('Success');
```

**P1 (-20): Flaky tests in CI**
✅ **Solution:** Use `playwright-best-practices-skill/debugging/flaky-tests.md`
- Run `--repeat-each=20` to detect flakiness
- Fix based on flakiness type (UI-driven, environment-driven, data-driven)
- Use web-first assertions (auto-retry)
- Avoid hardcoded waits

**P2 (-15): Hardcoded CSS selectors break on UI changes**
✅ **Solution:** Use `playwright-best-practices-skill/core/locators.md` priority order
```typescript
// ❌ BAD (brittle CSS)
await page.locator('.btn-primary').click();

// ✅ GOOD (role-based, resilient)
await page.getByRole('button', { name: 'Submit' }).click();
```

**P3 (-10): No POM for important flows**
✅ **Solution:** Use `playwright-best-practices-skill/core/page-object-model.md`
```typescript
// Create LoginPage class
class LoginPage {
    constructor(page) {
        this.page = page;
    }

    async login(email, password) {
        await this.page.getByLabel('Email').fill(email);
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
    }
}
```

### Achieving WIN Rewards

**W1 (+20): E2E test catches regression before manual QA**
✅ **Enabled by:** Comprehensive E2E coverage using all Playwright skills
- Critical flows automated (order create, login, filter, pagination)
- Runs in CI on every commit

**W2 (+15): Playwright suite stable 5/5 runs, >80% coverage**
✅ **Enabled by:** `playwright-best-practices-skill/debugging/flaky-tests.md`
- Flakiness prevention strategies
- Proper waits and assertions
- Test isolation patterns
- Verify with `npx playwright test --repeat-each=5`

**W3 (+10): gremlins.js crash documented with full repro steps**
✅ **Enabled by:** `gremlins-chaos-testing` + `qa-test-planner/assets/templates/bug-report.md`
- Chaos testing finds unexpected crashes
- Bug report template with reproduction steps
- Screenshots and stack traces attached

---

## Quick Commands Reference

### Playwright Testing
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run with headed browser
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Test for flakiness (repeat 20 times)
npx playwright test --repeat-each=20

# Single worker (isolate parallelism issues)
npx playwright test --workers=1

# Show HTML report
npx playwright show-report

# Generate tests by recording
npx playwright codegen https://your-app.com
```

### Crawlee
```bash
# Create new crawler
npx crawlee create my-crawler

# Install Crawlee
npm install crawlee
```

### gremlins.js
```bash
# Install gremlins.js
npm install gremlins.js
```

---

## Next Steps

### 1. Update Agent Reference Memory
Edit `agents/dev/huyen-fe-qa.md` section `📚 reference_Memory`:

```markdown
## 📚 reference_Memory

- **SKILL:** `../../agents/skills/playwright-best-practices-skill/SKILL.md` ← Playwright Best Practices (locators, assertions, POM, flaky test prevention, debugging)
- **SKILL:** `../../agents/skills/playwright-e2e-testing/SKILL.md` ← TypeScript E2E patterns, API testing, responsive testing
- **SKILL:** `../../agents/skills/crawlee-html-integrity/SKILL.md` ← HTML integrity scanning (broken links, images, console errors)
- **SKILL:** `../../agents/skills/gremlins-chaos-testing/SKILL.md` ← Chaos testing (random clicks, scroll, resize)
- **SKILL:** `../../agents/skills/qa-test-planner/SKILL.md` ← Test planning, bug reports, test case templates
- **SKILL:** `../../agents/skills/webapp-playwright-testing/SKILL.md` ← Browser automation via Playwright MCP
- `system/FE_QA_AUTOMATION.md` ← FE QA automation framework cho STMAI
- **TOOL: Write** — Ghi artifact ra disk. Mọi output ĐỀU PHẢI lưu file, không chỉ print ra chat.
```

### 2. Test Skill Activation
Try these prompts to verify skills are working:

**Test Playwright Best Practices:**
```
"Show me the locator priority order from playwright-best-practices"
```

**Test Crawlee:**
```
"How do I scan my site for broken links using Crawlee?"
```

**Test gremlins.js:**
```
"Create a chaos test using gremlins.js to stress test the login page"
```

**Test QA Test Planner:**
```
"Create a test plan for the checkout feature using qa-test-planner templates"
```

### 3. Integrate into Workflow
- Add Playwright tests to CI/CD pipeline
- Run Crawlee scans before each release
- Include gremlins.js chaos tests in smoke suite
- Use qa-test-planner templates for all new features

---

## Troubleshooting

**Issue: Skill not triggering**
- Verify skill path in agent's `reference_Memory`
- Check SKILL.md has proper frontmatter (name, description)
- Mention skill explicitly in prompt: "Use the skill playwright-best-practices..."

**Issue: Flaky tests still occurring**
- Review `playwright-best-practices-skill/debugging/flaky-tests.md`
- Run `--repeat-each=20` to confirm flakiness
- Check for brittle CSS selectors
- Verify test isolation (no shared state)

**Issue: Crawlee scan too slow**
- Increase `maxConcurrency` in crawler config
- Reduce `maxRequestsPerCrawl` for faster results
- Filter URLs to stay within domain

**Issue: gremlins.js never stops**
- Set `nb` parameter to limit actions (e.g., `nb: 100`)
- Add timeout in test: `await page.waitForTimeout(5000)`

---

**Generated:** 2026-03-16
**Report:** `INSTALL_REPORT_HUYEN_FE.md`
**Agent:** `agents/dev/huyen-fe-qa.md`
