# QUALITY CHECKLIST
## Before Shipping a Skill to Production

**Purpose:** Ensure every skill meets gstack-level quality
**Use when:** About to merge skill to main, publish to npm, or add to install-skills.sh

---

## ✅ FUNCTIONAL (Must Pass)

### Basic Functionality
- [ ] All commands work on happy path (tested manually)
- [ ] Error cases handled gracefully (invalid input, missing files, no network)
- [ ] Exit codes correct:
  - `0` = success
  - `1` = user error (bad input, missing file)
  - `2` = system error (network timeout, disk full)
- [ ] Output clear and actionable (no cryptic error messages)

### Edge Cases (Top 5)
- [ ] Empty input handled (command with no args)
- [ ] Missing dependencies detected (tool not installed, API key missing)
- [ ] Network failure handled (timeout, retry logic)
- [ ] File not found handled (clear error + suggestion)
- [ ] Concurrent usage tested (2+ CLIs running simultaneously)

---

## ⚡ PERFORMANCE (Should Pass)

### Latency
- [ ] Cold start < 3s (persistent server) OR < 500ms (stateless)
- [ ] Warm commands < 200ms (excluding network I/O)
- [ ] No unnecessary waits (sleep, polling when event-driven possible)

### Memory
- [ ] No memory leaks (run 100 commands, memory stable)
- [ ] CircularBuffers sized appropriately (not 50K when 5K enough)
- [ ] Large objects cleaned up (browser contexts, file handles)

### Disk I/O
- [ ] Async writes (don't block on disk flush)
- [ ] Logs rotated or bounded (don't grow infinitely)
- [ ] State file writes are atomic (tmp → rename)

---

## 🧪 TESTING (80%+ Coverage)

### Unit Tests
- [ ] Pure functions tested (parsers, validators, formatters)
- [ ] Edge cases covered (empty, null, invalid input)
- [ ] No external dependencies (mock network, filesystem)
- [ ] Fast (< 100ms per test, total suite < 5s)

### Integration Tests
- [ ] Server + CLI tested together
- [ ] Fixture files used (no network dependencies)
- [ ] Happy path + top 5 edge cases
- [ ] State persistence tested (server restart, state recovery)

### E2E Tests
- [ ] At least 1 critical workflow tested end-to-end
- [ ] Real binary executed (not just `bun run`)
- [ ] Verifies user-facing output (not just exit code)

### CI/CD
- [ ] Tests pass in GitHub Actions (or equivalent)
- [ ] No flaky tests (run 10 times, 100% pass rate)

---

## 📖 DOCUMENTATION (Must Have)

### SKILL.md (8 Required Sections)
- [ ] Header (Role, Trigger, Pattern)
- [ ] Pre-Conditions (Required deps, setup instructions)
- [ ] Workflow (Numbered steps with conditionals)
- [ ] Stop Conditions (When to exit early, when to continue)
- [ ] Output Format (Console, files, user interaction)
- [ ] Error Handling (Scenarios with fallbacks)
- [ ] Usage Examples (3+ common use cases)
- [ ] Integration Hooks (Hands off to, receives from, Nash Triad)

### README.md
- [ ] One paragraph summary (what it does)
- [ ] Installation instructions (copy-paste ready)
- [ ] Usage examples (basic + advanced)
- [ ] Architecture overview (if persistent server)

### Inline Documentation
- [ ] Non-obvious code has comments (why, not what)
- [ ] Complex algorithms explained (with examples)
- [ ] Magic numbers have constants with names

---

## 🔗 INTEGRATION (Nash-Specific)

### Standalone
- [ ] Works without Nash Framework (can invoke directly)
- [ ] No hard dependencies on other skills
- [ ] Clear error if optional deps missing

### Nash-Compatible
- [ ] Can wrap in Nash Triad (Thesis/Anti/Synthesis)
- [ ] MoE Router entry added (system/MIXTURE_OF_EXPERTS_ROUTER.md)
- [ ] L2 Cache entry optimized (< 500 tokens if cached)

### Cross-Skill
- [ ] Documents which skills it hands off to
- [ ] Documents what input it expects from other skills
- [ ] Uses shared libraries where applicable (_shared/ folder)

---

## 🌍 CROSS-PLATFORM (Should Support)

### Operating Systems
- [ ] macOS tested (primary platform)
- [ ] Linux tested (Ubuntu 22.04+)
- [ ] Windows tested OR documented as unsupported

### Path Handling
- [ ] Uses `path.join()`, not hardcoded `/` or `\`
- [ ] Home directory via `process.env.HOME` (not `~`)
- [ ] Temp files in `os.tmpdir()` (not `/tmp`)

### Dependencies
- [ ] Bun available (or fallback to Node.js)
- [ ] External tools detected (gh, git, docker)
- [ ] Clear installation instructions if missing

---

## 🔒 SECURITY (Critical)

### Input Validation
- [ ] Command injection prevented (no `eval`, `exec` with user input)
- [ ] Path traversal prevented (no `../../` in file paths)
- [ ] SQL injection prevented (parameterized queries)

### Secrets
- [ ] No API keys in code (use env vars or keychain)
- [ ] No passwords logged (mask in output)
- [ ] State file permissions correct (0600 for sensitive data)

### Network
- [ ] HTTPS for external APIs (not HTTP)
- [ ] Timeouts on all network calls (no infinite wait)
- [ ] Auth tokens not in URLs (use headers)

---

## 🏗️ CODE QUALITY (Should Pass)

### Type Safety
- [ ] No `any` types (use proper interfaces)
- [ ] All function signatures typed
- [ ] Return types explicit

### Error Handling
- [ ] No empty catch blocks without comments
- [ ] Errors have context (file:line, what was attempted)
- [ ] Resource cleanup in `finally` blocks

### Code Smells
- [ ] No magic numbers (use named constants)
- [ ] No deeply nested code (max 3 levels)
- [ ] Functions < 50 lines (extract if larger)

### Consistency
- [ ] Follows project style (indentation, naming)
- [ ] Error messages consistent format
- [ ] Logging consistent format (timestamp, level, message)

---

## 📦 DISTRIBUTION (Before Publish)

### Build
- [ ] `./setup` script works from scratch
- [ ] Binary runs on clean machine (no local deps)
- [ ] Version stamped (git SHA in dist/.version)

### Git
- [ ] No secrets committed (check .gitignore)
- [ ] No large binaries (use LFS if >10MB)
- [ ] Clean commit history (no "WIP", "fix typo" spam)

### npm (if publishing)
- [ ] package.json complete (name, version, bin, deps)
- [ ] README renders correctly on npmjs.com
- [ ] License file included

---

## 🎯 NASH FRAMEWORK SPECIFIC

### MoE Router
- [ ] Entry added to `system/MIXTURE_OF_EXPERTS_ROUTER.md`
- [ ] Capability clearly described (one sentence)
- [ ] Triggers defined (when to invoke)

### L2 Cache
- [ ] Agent L2 entry < 500 tokens
- [ ] PEN/WIN entries concrete (not vague)
- [ ] Patterns cached, not examples

### LEDGER
- [ ] Scoring criteria defined (what earns +P0/P1/P2)
- [ ] Penalties defined (what causes -P0/P1/P2)
- [ ] Eval suite created (for adversarial testing)

### External Validation
- [ ] Anti-Thesis can re-run independently
- [ ] Output reproducible (same input → same output)
- [ ] Verification strategy documented

---

## 🚀 PRE-LAUNCH RITUAL

**Day before launch:**

1. **Fresh clone test:**
   ```bash
   cd /tmp
   git clone [repo-url] test-skill
   cd test-skill
   ./setup
   # Run 3 common workflows
   ```

2. **Cross-platform test:**
   - Run on macOS
   - Run on Linux (Docker if no native machine)
   - Document Windows support status

3. **Performance baseline:**
   ```bash
   time skill-name command  # Record cold start
   time skill-name command  # Record warm start
   # Run 100 times, check memory growth
   ```

4. **Documentation review:**
   - Read SKILL.md fresh (find confusing parts)
   - Verify all examples copy-paste ready
   - Check broken links

5. **Security scan:**
   ```bash
   grep -r "API_KEY\|PASSWORD\|SECRET" src/
   # Should return 0 hardcoded secrets
   ```

---

## ✨ POLISH (Nice-to-Have)

### User Experience
- [ ] Progress indicators for slow operations (>2s)
- [ ] Helpful suggestions in error messages ("Did you mean X?")
- [ ] Colors in output (errors=red, success=green, warnings=yellow)

### Developer Experience
- [ ] Debug mode (--debug flag shows verbose logs)
- [ ] Dry-run mode (--dry-run shows what would happen)
- [ ] Watch mode for tests (bun test --watch)

### Observability
- [ ] Health check endpoint (/health)
- [ ] Version command (skill-name --version)
- [ ] Metrics logged (.gstack/metrics.json)

---

## 📊 SCORECARD

**Minimum to ship:**
- ✅ Functional: 10/10
- ✅ Documentation: 8/8 sections in SKILL.md
- ✅ Testing: 80%+ coverage
- ✅ Security: 0 secrets, 0 injections

**Ideal before launch:**
- All "Must Pass" ✅
- 80%+ "Should Pass" ✅
- 50%+ "Nice-to-Have" ✅

---

## 🎓 REVIEW PROTOCOL

**Self-review (30 min):**
1. Run through checklist alone
2. Fix obvious issues
3. Mark uncertain items

**Peer review (15 min):**
1. Another dev runs `./setup` on their machine
2. Tests 3 workflows from README
3. Reports what was confusing

**Nash Triad review (if applicable):**
1. Thesis: You present skill
2. Anti-Thesis: Mộc-style adversarial review
3. Synthesis: PM approves or requests changes

---

**END OF CHECKLIST**

💡 **Pro tip:** Print this checklist, check boxes with pen. Tactile > digital for QA.
