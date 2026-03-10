# Pipeline 5: Bảo Mật & Triển Khai (Security & Deployment)

Giai đoạn cuối trước Go-Live: bảo mật hạ tầng, đóng gói container, deploy lên Production.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Thanh Lại` → `agents/user/thanh-lai.md` (Thesis: Security Ops + DevOps)
> - `Ngữ Pitfall-R` → `agents/research/ngu-pitfall-r.md` (Anti-Thesis: white-hat audit)
> - `User/PO` → `agents/user/user-agent.md` (Synthesis: Final Approver)

## Input
- Kích hoạt bởi MoE Router khi: Gate 7a PASS, app sạch QA, nhưng [C7] chưa có Docker/CI-CD hoặc [C5] security lỏng lẻo.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `Dockerfile` | Thanh Lại | Production-ready container image |
| `docker-compose.yml` | Thanh Lại | Service orchestration với env vars chuẩn |
| `.github/workflows/ci.yml` | Thanh Lại | CI/CD pipeline (build, test, deploy) |
| `docs/deploy/SECURITY_REPORT.md` | Ngữ Pitfall-R | CVE scan, secrets audit, OWASP ZAP results |
| `docs/deploy/DEPLOY_SIGN_OFF.md` | User/PO | Final approval với checklist |

## Quy Trình (Nash Triad)

### THESIS: Triển Khai Hạ Tầng
- **Agent:** Thanh Lại (Security Ops)
- **Hành động:**
  - Viết `Dockerfile` (multi-stage build, non-root user, minimal base image).
  - Viết `docker-compose.yml` với secrets qua env vars, không hardcode trong file.
  - Cấu hình `.github/workflows/ci.yml`: build → test → SAST → deploy.
  - Đặt `NODE_ENV=production`, verify không còn dev dependencies trong production bundle.
  - Chạy Release Build thử nghiệm, xác nhận container start thành công.

### ANTI-THESIS: Security Audit & White-Hat
- **Agent:** Ngữ Pitfall-R + Security Tools (Trivy, OWASP ZAP, npm audit)
- **Hành động:**
  - Quét toàn bộ codebase tìm secret keys bị commit (API keys, passwords, tokens).
  - Chạy `npm audit` / `trivy image` — report CVE CRITICAL/HIGH.
  - Chạy OWASP ZAP: scan XSS, CSRF, injection endpoints.
  - Kiểm tra bundle size (gzipped ≤500KB cho FE). Chạy Lighthouse CI (Performance ≥90).
  - Ghi `SECURITY_REPORT.md` với findings + CVSS score + remediation steps.

### SYNTHESIS: Go-Live Decision
- **Agent:** User/PO (Final Approver)
- **Hành động:**
  - Đọc `SECURITY_REPORT.md` của Ngữ.
  - Nếu có CVE CRITICAL/HIGH hoặc secret leak: block deploy, trả lại Thanh Lại để fix.
  - Khi mọi check xanh: ký `DEPLOY_SIGN_OFF.md` và phát lệnh deploy lên Production/Staging.
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 5 | `gates/validate.sh` + `gates/qa.sh` | No TODO/FIXME, type check, tests pass, SAST no HIGH (re-verify sau QA) | Dev fix và re-run |
| deploy | `gates/commit.sh` | Docker build success, secrets clean, `DEPLOY_SIGN_OFF.md` tồn tại với APPROVED | Fix issues và retry |

## Exit
- Gate 9 PASS → báo cáo cho Dũng PM → module hoàn tất, update `STATE.md`, move to `Done/`.
