# Contributing Guide

Development workflow, testing, gate scripts, and PR process for Nash Agent Framework.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Testing](#testing)
4. [Quality Gates](#quality-gates)
5. [Git Workflow](#git-workflow)
6. [Pull Request Process](#pull-request-process)
7. [Code Standards](#code-standards)
8. [Documentation](#documentation)

---

## Getting Started

### Prerequisites

- **Node.js**: >= 18.0.0
- **Git**: >= 2.30.0
- **SQLite**: >= 3.35.0
- **Code Editor**: VS Code recommended (with ESLint + Prettier extensions)

### Fork and Clone

```bash
# Fork the repository on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/nash-agent-framework.git
cd nash-agent-framework
```

### Install Dependencies

```bash
npm install
npm run install:embeddings
```

### Set Up Development Environment

```bash
# Create .env file
cp .env.example .env

# Edit .env with your local settings
code .env
```

### Run Development Server

```bash
npm run dev
```

Access at:
- **Grafana**: http://localhost:3000
- **REST API**: http://localhost:4000

---

## Development Workflow

### Branch Naming Convention

```bash
# Feature
git checkout -b feature/add-new-pipeline

# Bug fix
git checkout -b fix/ledger-scoring-bug

# Documentation
git checkout -b docs/update-architecture-guide

# Refactor
git checkout -b refactor/simplify-mode-selector
```

### Feature Development Cycle

```
1. Create branch from main
   ↓
2. Implement feature
   ↓
3. Write tests (TDD preferred)
   ↓
4. Run quality gates locally
   ↓
5. Commit with descriptive message
   ↓
6. Push to your fork
   ↓
7. Open pull request
   ↓
8. Address review feedback
   ↓
9. Merge after approval
```

---

## Testing

### Test Structure

```
tests/
├── unit/               # Fast, isolated tests (≥60% of total)
│   ├── mode_selector.test.js
│   ├── vector_db_wrapper.test.js
│   └── sqlite_setup.test.js
├── integration/        # Tests with real dependencies (≥30%)
│   ├── vector_fallback.test.js
│   ├── concurrent_sqlite.test.js
│   └── dashboard_api.test.js
└── e2e/                # Full end-to-end flows (≥10%)
    └── dashboard_polling.test.js
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode (during development)
npm run test:watch
```

### Writing Tests (TDD)

**1. Write failing test first (RED):**

```javascript
// tests/unit/token_calculator.test.js
describe('calculateTokens', () => {
  it('should calculate tokens for simple text', () => {
    const result = calculateTokens('Hello world');
    expect(result).toBe(2);
  });
});
```

**2. Implement minimum code to pass (GREEN):**

```javascript
// src/token_calculator.js
function calculateTokens(text) {
  return text.split(' ').length;
}
```

**3. Refactor while keeping tests green (REFACTOR):**

```javascript
// src/token_calculator.js (improved)
function calculateTokens(text) {
  // More accurate: use tiktoken or GPT-4 tokenizer
  const encoder = getTokenEncoder();
  return encoder.encode(text).length;
}
```

### Test Coverage Requirements

| Coverage Type | Minimum | Target |
|--------------|---------|--------|
| Line coverage | 80% | 90% |
| Branch coverage | 75% | 85% |
| Function coverage | 90% | 95% |

**Check coverage:**

```bash
npm run test:coverage

# Output:
# -----------------|---------|----------|---------|---------|
# File             | % Stmts | % Branch | % Funcs | % Lines |
# -----------------|---------|----------|---------|---------|
# All files        |   92.3  |   89.1   |   94.5  |   92.8  |
# mode_selector.js |   95.2  |   91.3   |   100   |   95.2  |
# -----------------|---------|----------|---------|---------|
```

---

## Quality Gates

Before committing, run all quality gates locally:

### 1. Validate (Build + Type-Check + Tests)

```bash
bash gates/validate.sh .
```

**What it checks:**
- Build succeeds
- TypeScript type-check passes
- All tests pass
- No TODO/FIXME in code

**Common failures:**

```bash
# Type error
Error: Property 'foo' does not exist on type 'Bar'
Fix: Add missing property or update type definition

# Test failure
FAIL tests/unit/ledger.test.js
Fix: Debug test, fix implementation

# TODO found
Error: TODO found at src/api/users.ts:42
Fix: Complete implementation or create GitHub issue
```

### 2. Integrity (Mock Contamination)

```bash
bash gates/integrity.sh .
```

**What it checks:**
- No mock imports in integration tests
- Integration tests use real database/API
- E2E tests don't skip steps

**Common failures:**

```bash
Error: Mock import found in tests/integration/api.test.js:5
Fix: Use real API client, not mock
```

### 3. QA (Static Analysis + Smoke Test)

```bash
bash gates/qa.sh .
```

**What it checks:**
- ESLint (code quality)
- Test distribution (60/30/10 rule)
- Smoke test (if URL provided)

**Common failures:**

```bash
Error: ESLint violations found (12 errors, 5 warnings)
Fix: Run `npm run lint:fix` to auto-fix

Error: Unit tests < 60% (current: 45%)
Fix: Add more unit tests
```

### 4. Security (Secrets + Dependencies)

```bash
bash gates/security.sh .
```

**What it checks:**
- No hardcoded secrets
- No vulnerable dependencies
- .env file not committed

**Common failures:**

```bash
Error: Hardcoded API key found at src/config.ts:12
Fix: Move to .env file

Error: Vulnerable dependency: lodash@4.17.20 (CVE-2021-23337)
Fix: Run `npm audit fix`
```

### 5. Safe Commit

```bash
bash gates/commit.sh module_name "feat: add token calculator"
```

**What it does:**
1. Runs validate.sh first
2. Excludes .env and secrets
3. Targeted git add (NEVER `git add .`)
4. Commits with message

---

## Git Workflow

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, no logic change)
- `refactor:` — Code refactor (no feat/fix)
- `perf:` — Performance improvement
- `test:` — Add/update tests
- `chore:` — Build process, dependencies
- `ci:` — CI/CD changes
- `revert:` — Revert previous commit

**Examples:**

```bash
# Good
feat(router): add MoE routing for hotfix pipeline
fix(ledger): prevent zero-sum violation in probation mode
docs(architecture): update Nash Triad diagram

# Bad
update stuff
fixed bug
WIP
```

### Commit Best Practices

**DO:**
- Write descriptive commit messages
- Keep commits atomic (one logical change)
- Use targeted `git add` (specific files/directories)
- Run quality gates before committing

**DON'T:**
- Use `git add .` (use `bash gates/commit.sh` instead)
- Commit .env files or secrets
- Bundle unrelated changes
- Commit TODO/FIXME without GitHub issue

### Branch Management

```bash
# Keep your fork up to date
git remote add upstream https://github.com/original/nash-agent-framework.git
git fetch upstream
git rebase upstream/main

# Create feature branch
git checkout -b feature/my-feature

# Make changes, commit
git add src/my-feature.js tests/my-feature.test.js
git commit -m "feat(my-feature): add new capability"

# Push to your fork
git push origin feature/my-feature
```

---

## Pull Request Process

### Before Opening PR

**Checklist:**

- [ ] All quality gates pass locally
- [ ] Tests written and passing (coverage ≥80%)
- [ ] Documentation updated (if needed)
- [ ] CHANGELOG.md updated (for user-facing changes)
- [ ] No merge conflicts with main
- [ ] Commits follow conventional commit format

### Opening PR

1. **Push branch to your fork**

```bash
git push origin feature/my-feature
```

2. **Open PR on GitHub**

Navigate to original repo → Pull Requests → New Pull Request

3. **Fill PR template**

```markdown
## Summary
Brief description of changes (1-3 sentences)

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- Added X feature
- Fixed Y bug
- Refactored Z module

## Testing
- [ ] Unit tests added (coverage: 92%)
- [ ] Integration tests added
- [ ] All gates pass locally

## Screenshots (if UI changes)
(Add screenshots here)

## Checklist
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or marked as BREAKING CHANGE in commit)
```

### Review Process

**What reviewers check:**

1. **Code quality**
   - Follows project conventions
   - No unnecessary complexity
   - Proper error handling

2. **Tests**
   - Coverage ≥80%
   - Tests are meaningful (not just for coverage)
   - Edge cases covered

3. **Documentation**
   - Code comments where needed
   - README/docs updated if needed

4. **Security**
   - No secrets committed
   - Input validation present
   - Dependencies up to date

### Addressing Feedback

```bash
# Make requested changes
git add src/updated-file.js
git commit -m "fix(review): address code review feedback"

# Push to same branch (PR auto-updates)
git push origin feature/my-feature
```

### Merge Requirements

**Automated checks must pass:**
- CI/CD pipeline (GitHub Actions)
- All quality gates
- Code coverage ≥80%

**Manual approval:**
- At least 1 approving review from maintainer
- No unresolved conversations

---

## Code Standards

### TypeScript/JavaScript

**Use ESLint + Prettier:**

```bash
# Auto-fix lint issues
npm run lint:fix

# Check formatting
npm run format:check

# Auto-format
npm run format
```

**Naming conventions:**

```javascript
// Variables: camelCase
const tokenCount = 42;

// Functions: camelCase
function calculateTokens(text) { }

// Classes: PascalCase
class TokenCalculator { }

// Constants: UPPER_SNAKE_CASE
const MAX_TOKEN_BUDGET = 30000;

// Files: kebab-case
// token-calculator.js
// mode-selector.test.js
```

### Code Organization

```javascript
// 1. Imports
const fs = require('fs');
const { calculateTokens } = require('./token-calculator');

// 2. Constants
const DEFAULT_MODE = 'HOLD';

// 3. Helper functions (private)
function _validateInput(text) { }

// 4. Exported functions (public)
function selectMode(task) { }

// 5. Exports
module.exports = { selectMode };
```

### Error Handling

```javascript
// Good: Specific error types
class TokenBudgetExceeded extends Error {
  constructor(actual, max) {
    super(`Token budget exceeded: ${actual} > ${max}`);
    this.name = 'TokenBudgetExceeded';
    this.actual = actual;
    this.max = max;
  }
}

// Bad: Generic errors
throw new Error('something went wrong');
```

### Documentation Comments

```javascript
/**
 * Selects cognitive mode based on task complexity.
 *
 * @param {string} task - Task description
 * @param {Object} options - Configuration options
 * @param {string} [options.forceMode] - Force specific mode (EXPANSION/HOLD/REDUCTION)
 * @param {number} [options.customBudget] - Override default token budget
 * @returns {Object} Mode selection result with mode, budget, and reason
 * @throws {InvalidTaskError} If task is empty or invalid
 *
 * @example
 * const result = selectMode("Implement login", { forceMode: 'REDUCTION' });
 * // => { mode: 'REDUCTION', budget: 5000, reason: '...' }
 */
function selectMode(task, options = {}) {
  // Implementation
}
```

---

## Documentation

### When to Update Docs

**Always update docs when:**
- Adding new feature
- Changing API
- Modifying configuration options
- Adding new pipeline or agent

**Where to update:**

| Change Type | File to Update |
|------------|----------------|
| New feature | README.md, docs/03_USAGE_GUIDE.md |
| Architecture change | docs/04_ARCHITECTURE.md |
| New concept | docs/02_CONCEPTS.md |
| Installation step | docs/01_QUICKSTART.md |
| Troubleshooting | docs/FAQ.md |

### Documentation Standards

**Use clear headings:**

```markdown
# Level 1: Document title
## Level 2: Major section
### Level 3: Subsection
#### Level 4: Detail (use sparingly)
```

**Use code blocks with language:**

```markdown
```bash
npm install
```

```javascript
const result = selectMode(task);
```
```

**Use tables for comparisons:**

```markdown
| Mode | Budget | Use Case |
|------|--------|----------|
| EXPANSION | 15K-30K | Exploration |
| HOLD | 10K-15K | Architecture |
| REDUCTION | 5K-10K | Simple tasks |
```

**Use lists for steps:**

```markdown
1. First step
2. Second step
3. Third step
```

---

## Getting Help

### Resources

- **Documentation**: [docs/](../docs/)
- **FAQ**: [docs/FAQ.md](FAQ.md)
- **GitHub Issues**: Report bugs or request features
- **Discussions**: Ask questions in GitHub Discussions

### Reporting Bugs

**Use GitHub Issues with this template:**

```markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. Expected vs actual behavior

**Environment**
- OS: Windows 10
- Node.js: 18.16.0
- Framework version: 3.0.0

**Logs**
(Paste relevant error logs)

**Screenshots**
(If applicable)
```

### Feature Requests

**Use GitHub Issues with this template:**

```markdown
**Feature Description**
What feature do you want?

**Motivation**
Why is this needed? What problem does it solve?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you considered
```

---

## Code Review Checklist

**For authors:**

- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Coverage ≥80%
- [ ] Documentation updated
- [ ] No secrets committed
- [ ] Commit messages follow conventional commits
- [ ] Quality gates pass locally

**For reviewers:**

- [ ] Logic is correct and clear
- [ ] Tests cover edge cases
- [ ] No unnecessary complexity
- [ ] Error handling is proper
- [ ] Documentation is accurate
- [ ] No security issues
- [ ] Performance considerations addressed

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Nash Agent Framework!**
