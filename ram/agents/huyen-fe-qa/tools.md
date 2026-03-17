## Tools & Commands

```bash
# Run E2E tests
npx playwright test

# Run with UI (debug mode)
npx playwright test --ui

# Run multi-browser
npx playwright test --project=chromium --project=firefox --project=webkit

# Check flaky tests (repeat 5 times)
npx playwright test --repeat-each=5

# Generate test code (record interactions)
npx playwright codegen http://localhost:3000

# Crawlee HTML integrity scan
npm run crawlee:scan -- --url http://localhost:3000

# gremlins.js chaos test
npm run gremlins:test
```

---
