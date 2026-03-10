# Pipeline 1: Phân Tích Yêu Cầu & Nghiên Cứu (Requirements & Research)

Biến ý tưởng sơ khai thành yêu cầu kỹ thuật đã được kiểm chứng (`SPEC.md` + `CONTEXT.md`).

> **⚡ L2 CACHE PRE-LOAD:**
> - `Dũng PM` → `agents/BRAIN.md` + `agents/core/dung-manager.md`
> - `Châu Pana UX` → `agents/user/chau-pana-ux.md`
> - `Conan Req-Aud` → `agents/core/conan-req-aud.md`
> - `User/PO` → `agents/user/user-agent.md`

## Input
- Kích hoạt bởi MoE Router khi: [C1] Business rỗng, [C2] Docs rỗng hoặc mâu thuẫn, dự án mới chưa có SPEC.
- Nếu Domain phức tạp (Blockchain, EDI, IoT, GenAI): chạy `00_RESEARCH.md` trước, đính kèm `docs/RESEARCH/SUMMARY.md`.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `docs/CONTEXT.md` | Dũng PM | Tầm nhìn, scope, stakeholders, constraints |
| `docs/SPEC.md` | Dũng PM + Châu UX | Functional requirements, user stories, acceptance criteria |

> Wireframe KHÔNG thuộc pipeline này — xem `DESIGN_FLOW.md` (chạy song song với Pipeline 2).

## Quy Trình (Nash Triad)

### THESIS: Soạn Thảo Yêu Cầu
- **Agent:** Dũng PM (nghiệp vụ) + Châu UX (UX research)
- **Hành động:**
  - Dũng PM phỏng vấn User/PO, ghi nhận tầm nhìn và constraints, viết nháp `CONTEXT.md`.
  - Châu UX lập User Journey, xác định pain points top-10, bổ sung user stories vào `SPEC.md`.
  - Dũng PM đóng gói `SPEC.md` với functional requirements + acceptance criteria cho từng story.

### ANTI-THESIS: Kiểm Định Yêu Cầu
- **Agent:** Conan Req-Aud
- **Hành động:**
  - Rà soát `SPEC.md` tìm kẽ hở logic, mâu thuẫn nghiệp vụ, edge cases bị bỏ qua.
  - Đặt câu hỏi về tính khả thi: "Acceptance criteria này đo lường được không?"
  - Bắt buộc đề xuất Counter-proposal kèm lý lẽ cho mỗi issue tìm được.

### SYNTHESIS: Chốt Yêu Cầu
- **Agent:** User/PO
- **Hành động:**
  - Đọc tranh luận Dũng/Châu vs Conan.
  - Ra quyết định cuối: chấp nhận, bác bỏ, hoặc yêu cầu sửa từng điểm tranh chấp.
  - Ký duyệt `SPEC.md` (thêm dòng `STATUS: APPROVED` + ngày tháng).
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 0 | `gates/validate.sh` (doc quality: Nash Triad LLM review) | `CONTEXT.md` tồn tại, ≥30 lines | Dũng PM bổ sung CONTEXT.md |
| 0.5 | `gates/gate0_5.sh` | (Conditional) nếu domain phức tạp: `RESEARCH/SUMMARY.md` tồn tại | Chạy Pipeline 00 trước |
| 1 | `gates/validate.sh` (doc quality: Nash Triad LLM review) | `SPEC.md` có ≥3 user stories, acceptance criteria, REQ-PB traceability | Conan/Dũng PM sửa thiếu sót |

## Exit
- Gate 1 PASS → báo cáo cho Dũng PM → route Pipeline 2 (Architecture) + kích hoạt `DESIGN_FLOW.md` song song.
