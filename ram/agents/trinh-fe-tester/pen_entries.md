## PEN (Top 10 Never-Repeat)

### P0 CRITICAL (Never Violate)

1. **Hollow test — assertion without behavior check** (-30đ)
   - Test only checks `toBeDefined()`/`toBeTruthy()` without validating actual behavior
   - Fix: ALWAYS assert on user-visible output (text, enabled state, API calls)
   - Example: `expect(screen.getByRole('button', {name: /submit/i})).toBeEnabled()`

2. **Test framework behavior instead of OUR code** (-30đ)
   - Testing React hooks, Zustand, Vitest work correctly (library QA, not ours)
   - Fix: Test OUR business logic using those tools, not the tools themselves

### P1 HIGH (Learn From)

3. **Implementation detail dependency** (-20đ)
   - Test uses CSS selectors (`.submit-btn`), DOM structure, or internal state
   - Fix: Use `getByRole('button', {name: /submit/i})`, `getByText()`, `getByLabelText()`
   - Axiom: "If user can't see it, test can't check it"

4. **Mock leak across tests** (-20đ)
   - MSW handlers or Zustand mocks not cleaned in `afterEach` → flaky failures
   - Fix: ALWAYS `server.resetHandlers()` + `useStore.setState(initialState)` in `afterEach`

5. **Flaky test merged to main** (-20đ)
   - Test passes locally but fails in CI (race condition, timing, shared state)
   - Fix: Run test 10 times locally (`npm test -- --run --reporter=verbose --repeat=10`)

### P2 MEDIUM (Avoid)

6. **Duplicate test setup boilerplate** (-15đ)
   - Copy-paste `render(<Component {...props} />)` in every test
   - Fix: Extract to `renderWithProviders()` helper or `beforeEach` fixture

7. **Missing async wait** (-15đ)
   - Assertion runs before async operation completes → `act()` warning
   - Fix: Use `waitFor(() => expect(...))` for async state changes

8. **Hardcoded test data** (-10đ)
   - `userId: '123'`, `email: 'test@example.com'` instead of factories
   - Fix: Use `faker.seed(42)` + factory functions for deterministic data

9. **Coverage gaming** (-10đ)
   - Add test to hit 80% threshold without checking meaningful behavior
   - Fix: Delete useless test, add behavior-focused test for critical paths

10. **Missing edge case tests** (-10đ)
    - Only happy path tested (form submit success), no error/loading/empty states
    - Fix: Test matrix — Loading → Success/Error, Empty → Data, Valid → Invalid

_Archived PEN: See LEDGER history_

---


## WIN (Top 5 Successes)

1. **Caught regression in TDD RED phase** (+20đ)
   - Test written BEFORE Lan coded → failed when Lan implemented → revealed bug in design
   - Impact: Bug fixed before code review, saved 2 hours debugging

2. **Stable test suite 5/5 runs, 85% coverage** (+15đ)
   - Zero flaky tests, all green in CI, coverage exceeds threshold
   - Impact: Deploy confidence, no test-related rollbacks

3. **Refactored untestable component** (+10đ)
   - Detected component with tight coupling → triggered Lan to refactor BEFORE coding complete
   - Impact: Prevented tech debt, improved component design

4. **MSW mock patterns documented** (+10đ)
   - Created reusable MSW handlers for STMAI API envelope
   - Impact: 30% faster test writing for team

5. **Hermetic test data factories** (+5đ)
   - Replaced hardcoded IDs with `faker.seed(42)` + factory pattern
   - Impact: Zero flaky tests from shared tenant pollution

_Full history: See LEDGER_

---
