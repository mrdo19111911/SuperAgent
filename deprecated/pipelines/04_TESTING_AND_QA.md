# Pipeline 4: Kiểm Thử Toàn Diện (Testing & QA)

Nghiền nát ứng dụng trên môi trường Staging để đảm bảo không có bug nghiêm trọng lọt Production.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Sơn QA` → `agents/core/son-qa.md`
> - `Huyền FE-QA` → `agents/dev/huyen-fe-qa.md`
> - `Dũng PM` → `agents/BRAIN.md` (Synthesis)

## Input
- Kích hoạt bởi MoE Router khi: Gate 4 PASS (code merged), app chạy được, nhưng [C6] QA coverage rỗng hoặc [C10] nhiều bug lặt vặt từ `AUDIT.md`.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `docs/qa/BUG_LIST.md` | Sơn QA + Huyền FE-QA | Danh sách bugs với severity, reproduction steps, evidence |
| `docs/qa/QA_VERDICT.md` | Dũng PM | Phán quyết cuối: bug nào valid, severity thực tế, action required |
| `tests/e2e/**/*.spec.ts` | Huyền FE-QA | E2E test scripts (Playwright/Crawlee) |

## Quy Trình (Nash Triad)

### THESIS: Tìm Bug & Test Toàn Diện
- **Agent:** Sơn QA + Huyền FE-QA
- **Hành động:**
  - Sơn QA: Đọc `SPEC.md` và `CONTRACT_DRAFT.md` để lên Test Cases. Bắn phá API với edge cases cực đoan (payload rỗng, payload 10MB, spam requests, SQL injection strings).
  - Huyền FE-QA: Đọc kỹ `system/FE_QA_AUTOMATION.md`. Chạy Crawlee quét HTML integrity, gremlins.js chaos testing (click liên loạn), Playwright E2E cho critical flows.
  - Lập `BUG_LIST.md`: mỗi bug ghi severity thực tế kèm reproduction steps và evidence (screenshot/log). Phân loại bug theo severity thực tế. Phóng đại mức độ nghiêm trọng = P0 (-30đ).

### ANTI-THESIS: Phản Biện Bug List
- **Agent:** Dev author gốc (agent nào viết code đó phản biện bug của phần mình)
- **Hành động:**
  - Nhận `BUG_LIST.md`. Với mỗi bug: xác nhận valid hoặc phản biện có bằng chứng.
  - Phản biện False Positive: chỉ rõ dòng Spec/Contract nào chứng minh behavior này là đúng.
  - Phản biện Over-test: "Test case này không reflect real-world usage vì lý do X".
  - Bắt buộc: sửa ngay mọi bug đã xác nhận là valid trước khi lên Synthesis.

### SYNTHESIS: Phán Quyết Bug
- **Agent:** Dũng PM
- **Hành động:**
  - Đọc `BUG_LIST.md` + phản biện của dev.
  - Phán quyết từng bug: Valid (severity giữ nguyên) / False Positive (dismiss) / Downgrade severity.
  - Viết `QA_VERDICT.md` với quyết định cuối + lý do.
  - P4 bugs được phép push vào Backlog, P1/P2/P3 phải fix xong trước khi exit.
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 5 | `gates/validate.sh` + `gates/qa.sh` | No TODO/FIXME trong `src/`, type check pass, unit+integration+E2E pass, SAST no HIGH | Dev fix và re-submit |
| 7a | `gates/qa.sh` | Workflow smoke, SAST re-verify, failure injection, perf baseline, anti-Goodhart test audit | Sơn QA + dev fix issues |

## Exit
- Gate 7a PASS → báo cáo cho Dũng PM → route Pipeline 5 (Security & Deployment).
