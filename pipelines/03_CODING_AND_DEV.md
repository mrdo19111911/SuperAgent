# Pipeline 3: Lập Trình Backend

Biến `CONTRACT_DRAFT.md` thành backend source code đã pass unit tests.

> **Scope:** Backend ONLY. FE coding (HTML → React) nằm trong `DESIGN_FLOW.md` Stage 7.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Phúc SA` → `agents/core/phuc-sa.md` (Synthesis: merge PR)
> - `Mộc Arch-Chal` → `agents/core/moc-arch-chal.md` (Anti-Thesis: code review)
> - **Conditional theo stack trong `docs/CONTEXT.md`:**
>   - NestJS/TS → `Thúc Dev-TS` → `agents/dev/hoang-dev-net.md`
>   - .NET → `Hoàng Dev .NET` → `agents/dev/hoang-dev-net.md`
>   - Python → `Huyền Dev-Py` → `agents/dev/huyen-dev-py.md`
>   - Go → `Tuấn Dev Go` → `agents/dev/tuan-dev-go.md`

## Input
- Kích hoạt bởi MoE Router khi: Gate 2 PASS (hoặc Gate 2.5 nếu Phanbien), `CONTRACT_DRAFT.md` đã chốt.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `src/**/*.ts` (hoặc stack tương ứng) | Dev agent theo stack | Source code implementation |
| `tests/unit/**/*.spec.ts` | Dev agent theo stack | Unit tests (≥80% coverage) |
| `tests/integration/**/*.spec.ts` | Dev agent theo stack | Integration tests (≥70% coverage) |

## Quy Trình (Nash Triad)

### THESIS: Viết Code & TDD GREEN
- **Agent:** Dev agent theo stack (Thúc/Hoàng/Huyền-Py/Tuấn)
- **Hành động:**
  - Áp dụng TDD: viết test RED trước, implement đến GREEN.
  - Source code 100% tuân thủ `CONTRACT_DRAFT.md` — tuyệt đối không tự ý sửa response payload.
  - Xóa toàn bộ TODO/FIXME/stub trước khi tạo PR.
  - Tạo Pull Request với description nêu rõ coverage numbers.

### ANTI-THESIS: Static Analysis & Code Review
- **Agent:** Mộc Arch-Chal + Static Tools (ESLint, SonarQube)
- **Hành động:**
  - Chạy linter tự động — block PR nếu có lint error.
  - Mộc review code: logic bị nhét vào Controller? Hollow test chỉ fake coverage? Hardcode `.env` value? Business logic lọt vào wrong layer?
  - Kiểm tra contract drift: response payload có khớp `CONTRACT_DRAFT.md` không?
  - Ghi comment PR với evidence cho mỗi issue.

### SYNTHESIS: Review & Merge
- **Agent:** Phúc SA
- **Hành động:**
  - Đọc lint report + Mộc review comments.
  - Yêu cầu dev fix tất cả issue trước khi approve.
  - Approve và bấm MERGE PR khi code sạch.
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 3 | `gates/validate.sh` | ≥5 test files tồn tại | Dev thêm test files |
| 3.5 | `gates/gate3.5.sh` | Unit test coverage ≥80%, không có TODO/FIXME trong `src/` | Dev fix và re-run |
| 4 | `gates/validate.sh` | Build thành công, integration tests pass | Dev debug build errors |

## Exit
- Gate 4 PASS → báo cáo cho Dũng PM → route Pipeline 4 (Testing & QA).
