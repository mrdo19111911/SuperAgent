---
name: gremlins-chaos-testing
description: Chaos testing with gremlins.js - random clicks, scrolls, form inputs, typing to detect UI crashes, race conditions, and edge cases. Use when stress-testing UI, finding unexpected behaviors, or validating error handling.
---

# gremlins.js Chaos Testing

Automated chaos testing using gremlins.js to find UI bugs through random user interactions.

## When to Use
- Stress test UI with random interactions
- Find race conditions and edge cases
- Validate error boundaries and crash handling
- Test with unpredictable user behavior
- Smoke test before releases

## Prerequisites
- Node.js 18+
- gremlins.js: `npm install gremlins.js`
- Integration with test framework (Playwright, Jest, etc.)

## Quick Start
```typescript
import gremlins from 'gremlins.js';

// Basic usage
gremlins.createHorde().unleash();
```

## Workflows

### 1. Basic Chaos Test
```typescript
import { test } from '@playwright/test';
import gremlins from 'gremlins.js';

test('chaos test - random interactions', async ({ page }) => {
    await page.goto('https://your-app.com');

    // Inject gremlins.js
    await page.addScriptTag({ path: 'node_modules/gremlins.js/dist/gremlins.min.js' });

    // Unleash gremlins for 10 seconds
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

    // Wait for gremlins to finish
    await page.waitForTimeout(10000);

    // Check app didn't crash
    await expect(page.locator('body')).toBeVisible();
});
```

### 2. Controlled Chaos with Error Detection
```typescript
test('chaos test with error detection', async ({ page }) => {
    const errors = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    await page.goto('https://your-app.com');

    await page.addScriptTag({ path: 'node_modules/gremlins.js/dist/gremlins.min.js' });

    await page.evaluate(() => {
        window.gremlins.createHorde().unleash({ nb: 100 });
    });

    await page.waitForTimeout(5000);

    console.log('Errors detected:', errors);
    expect(errors.length).toBe(0); // Should have no crashes
});
```

### 3. Custom Gremlin Species
```typescript
await page.evaluate(() => {
    const horde = window.gremlins.createHorde({
        mogwais: [
            // Only click buttons
            window.gremlins.mogwais.clicker({
                clickTypes: ['click'],
                canClick: (element) => element.tagName === 'BUTTON',
            }),

            // Scroll randomly
            window.gremlins.mogwais.scroller(),

            // Fill forms with invalid data
            window.gremlins.mogwais.formFiller(),
        ],
        strategies: [
            // 50ms delay between actions
            window.gremlins.strategies.distribution({ delay: 50 }),
        ],
    });

    horde.unleash({ nb: 500 });
});
```

### 4. Reproducible Chaos (Seeded Random)
```typescript
await page.evaluate((seed) => {
    const horde = window.gremlins.createHorde({
        randomizer: new window.gremlins.Chance(seed), // Reproducible randomness
    });

    horde.unleash({ nb: 100 });
}, 12345); // Use same seed to reproduce exact sequence
```

## Gremlin Species (Mogwais)

| Mogwai | Behavior | Use Case |
|--------|----------|----------|
| `clicker()` | Random clicks on elements | Button stress testing |
| `scroller()` | Random page scrolling | Infinite scroll, lazy loading |
| `formFiller()` | Fill forms with random data | Input validation |
| `typer()` | Random keyboard input | Text field testing |
| `toucher()` | Touch gestures | Mobile testing |

## Best Practices
- Start with low action count (nb: 50-100)
- Monitor console for errors during chaos
- Use seeded randomness for reproducibility
- Combine with error boundary testing
- Run as smoke test before releases
- Set timeouts to prevent infinite runs

## Troubleshooting
| Issue | Solution |
|-------|----------|
| App crashes | Expected! Document crash with screenshot and stack trace |
| Gremlins never stop | Set `nb` parameter to limit actions |
| Actions too fast | Increase `delay` in distribution strategy |
| Need to reproduce | Use seeded randomizer with same seed |

## Integration with Playwright
```typescript
// Playwright fixture for gremlins
test.beforeEach(async ({ page }) => {
    await page.addScriptTag({
        url: 'https://unpkg.com/gremlins.js'
    });
});

test('unleash gremlins', async ({ page }) => {
    await page.goto('https://your-app.com');

    const crashDetected = await page.evaluate(() => {
        return new Promise((resolve) => {
            try {
                window.gremlins.createHorde().unleash({ nb: 100 });
                setTimeout(() => resolve(false), 5000);
            } catch (error) {
                resolve(true);
            }
        });
    });

    expect(crashDetected).toBe(false);
});
```

## References
- [gremlins.js GitHub](https://github.com/marmelab/gremlins.js)
- [API Documentation](https://github.com/marmelab/gremlins.js#api)
