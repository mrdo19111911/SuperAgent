# Pipeline 5: Security & Deployment

**Final gate before Go-Live: infrastructure security, container packaging, Production deployment.**

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- Gate 7a PASS (QA clean)
- C7=missing (No Docker/CI-CD)
- C5=loose (Security gaps detected)

**Conditions:**
- App passed QA, ready for infrastructure setup
- Pre-deployment security scan needed

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- Thanh Lai: Security Ops + DevOps (Dockerfile, docker-compose, CI/CD workflows, env vars)

**Anti-Thesis (Challengers):**
- Ngu Pitfall-R: White-hat security audit (CVE scan, secrets audit, OWASP ZAP, bundle size)
- Security tools: Trivy, OWASP ZAP, npm audit

**Synthesis (Judge):**
- User/PO: Final approver for Go-Live decision, signs `DEPLOY_SIGN_OFF.md`

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- Define success: production-ready containers, zero CRITICAL/HIGH CVEs, secrets clean, deploy signed off

**Phase C - Execute:**
- Thanh Lai: Writes `Dockerfile` (multi-stage build, non-root user, minimal base image)
- Thanh Lai: Writes `docker-compose.yml` (secrets via env vars, no hardcoded values)
- Thanh Lai: Configures `.github/workflows/ci.yml` (build → test → SAST → deploy)
- Thanh Lai: Sets `NODE_ENV=production`, verifies no dev dependencies in bundle
- Thanh Lai: Runs release build trial, confirms container starts

**Phase D - Functional Verification:**
- Ngu + tools scan entire codebase for hardcoded secrets (API keys, passwords, tokens)
- Runs `npm audit` / `trivy image` — reports CVE CRITICAL/HIGH
- Runs OWASP ZAP: scans XSS, CSRF, injection endpoints
- Checks bundle size (gzipped ≤500KB for FE), Lighthouse CI (Performance ≥90)
- Writes `SECURITY_REPORT.md` with findings + CVSS scores + remediation steps

**Phase E - Non-Functional Verification:**
- User/PO reads `SECURITY_REPORT.md`
- If CVE CRITICAL/HIGH or secret leak: blocks deploy, returns to Thanh Lai
- When all checks green: signs `DEPLOY_SIGN_OFF.md`, authorizes Production/Staging deploy

*Phases B/B2/F not used (deployment pipeline scope).*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `Dockerfile`: Production-ready container image
- `docker-compose.yml`: Service orchestration with proper env vars
- `.github/workflows/ci.yml`: CI/CD pipeline (build, test, deploy)
- `docs/deploy/SECURITY_REPORT.md`: CVE scan, secrets audit, OWASP ZAP results
- `docs/deploy/DEPLOY_SIGN_OFF.md`: Final approval with checklist

**LEDGER Entries:**
- Security violations (P0 for secret leaks in commits)
- CVE CRITICAL/HIGH findings (P1)

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 5**: `gates/validate.sh` + `gates/qa.sh` — No TODO/FIXME, type check, tests pass, SAST no HIGH (re-verify post-QA)
- **Gate deploy**: `gates/commit.sh` — Docker build success, secrets clean, `DEPLOY_SIGN_OFF.md` exists with APPROVED

**ON FAIL Actions:**
- Gate 5 fail: Dev fixes and re-runs
- Gate deploy fail: Fix issues and retry

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ Gate deploy PASS
- ✅ User/PO signs `DEPLOY_SIGN_OFF.md`
- ✅ Zero CRITICAL/HIGH CVEs
- ✅ No hardcoded secrets in commits
- ✅ Container builds and starts successfully

**Handoff to Next Pipeline:**
- Module complete, update `STATE.md`, move to `Done/`
- (Or trigger Pipeline 6 if Production incident occurs)

---

**L2 Cache Pre-Load:**
- `agents/user/thanh-lai.md` (Thanh Lai)
- `agents/research/ngu-pitfall-r.md` (Ngu)
- `agents/user/user-agent.md` (User/PO)

**Token Count:** ~550 tokens
