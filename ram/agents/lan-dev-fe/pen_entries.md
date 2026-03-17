## PEN (Top 10 Never-Repeat)

### P0 CRITICAL
1. **Started React before CONTRACT_DRAFT finalized** (-30)
   - Built on fake API assumptions → full rewrite required
   - MUST WAIT for Phuc SA sign-off on contracts
   - "Fake API = fix twice" is law

2. **XSS vulnerability in production** (-30)
   - Used `innerHTML` with user data → security breach
   - ONLY use `{userInput}` or DOMPurify for rich content

### P1 HIGH
3. **Hardcoded API URL in code** (-20)
   - `VITE_API_BASE_URL=http://localhost:3000` in component
   - MUST use `.env.local` + `import.meta.env.VITE_API_BASE_URL`

4. **API envelope drift** (-20)
   - Parsed response differently than CONTRACT_DRAFT envelope
   - MUST follow: `const { data: { entity }, meta } = await apiClient.get()`
   - Contract violations caught by Mộc → penalty doubled

### P2 MEDIUM
5. **Icon-only button missing aria-label** (-15)
   - Accessibility fail → Quang/Châu reported bug
   - EVERY button needs text label (visible or aria-label)

6. **Component >200 lines** (-15)
   - Violates SRP, hard to test
   - Extract sub-components at 150 line threshold

7. **Magic numbers in code** (-10)
   - Hardcoded `50` instead of `const MAX_ROWS = 50`
   - Hurts maintainability

8. **No error boundary** (-10)
   - Feature module crashed entire app
   - WRAP each feature in ErrorBoundary

9. **CSS selector in Playwright test** (-10)
   - `.class-name-123` instead of `getByRole('button', { name: 'Submit' })`
   - Fragile tests break on design changes

10. **Missing E2E test for new flow** (-10)
    - Shipped user flow without Playwright coverage
    - EVERY new flow needs E2E test in same PR

_Archived PEN (P3-P4): See LEDGER history_

---


## WIN (Top 5 Successes)

1. **React component + E2E tests pass first try** (+20)
   - Build passed, Playwright green, no revision needed
   - Contract-driven development pays off

2. **100% TypeScript strict mode, zero `any`** (+15)
   - Full type safety across FE codebase
   - API types auto-generated from OpenAPI spec

3. **Reused design system components** (+10)
   - Saved >20% effort by leveraging Quang's component library
   - Consistency + speed win

4. **Caught contract bug in review phase** (+15, as Anti-Thesis)
   - API endpoint missing pagination in CONTRACT_DRAFT
   - Challenged Phuc SA before coding started → saved rework

5. **Accessibility audit clean sweep** (+10)
   - WCAG AA compliance, all Châu's checkpoints green
   - aria-labels, contrast ratios, keyboard nav all perfect

_Full history: See LEDGER_

---
