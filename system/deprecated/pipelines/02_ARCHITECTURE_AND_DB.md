# Pipeline 2: Thiết Kế Kiến Trúc & Database (Architecture & DB)

Biến `SPEC.md` thành Data Schema, API Contract, và Architecture Decision Record đã kiểm chứng.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Phúc SA` → `agents/core/phuc-sa.md` (Thesis: BE/DB design)
> - `Quang Designer` → `agents/dev/quang-designer.md` (Thesis: FE Design System)
> - `Mộc Arch-Chal` → `agents/core/moc-arch-chal.md` (Anti-Thesis: BE challenger)
> - `Lân Dev FE` → `agents/dev/lan-dev-fe.md` (Anti-Thesis: FE challenger)
> - `Xuân Spec-Rev` → `agents/core/xuan-spec-rev.md` (Contract Review — xem task cụ thể bên dưới)
> - `Dũng PM` → `agents/BRAIN.md` (Synthesis)

## Input
- Kích hoạt bởi MoE Router khi: Gate 1 PASS, nhưng thiếu Architecture/DB Schema, hoặc audit phát hiện [C4] Kiến trúc spaghetti, [C8] Schema mâu thuẫn Docs.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `docs/ARCHITECTURE.md` | Phúc SA | Module diagram, service boundaries, data flow |
| `prisma/schema.prisma` | Phúc SA | DB schema (mọi table có `tenant_id`, RLS policy) |
| `docs/CONTRACT_DRAFT.md` | Phúc SA | API endpoints, request/response DTOs, error codes |
| `docs/ARCH_CHALLENGE.md` | Mộc Arch-Chal | Danh sách issues phát hiện, severity, evidence |
| `docs/ARCH_RESPONSE.md` | Phúc SA | Phản hồi từng issue của Mộc, quyết định cuối |
| `docs/CONTRACT_REVIEW.md` | Xuân Spec-Rev | Kiểm tra 8-section contract, sign-off hoặc block |

## Quy Trình (Nash Triad)

### THESIS: Thiết Kế Kiến Trúc & Design System
- **Agent:** Phúc SA (BE/DB) + Quang Designer (FE Design System)
- **Hành động:**
  - Phúc SA: Vẽ `ARCHITECTURE.md` (module diagram, Kafka topics, API boundaries), thiết kế `schema.prisma` (tenant_id bắt buộc, RLS policy, indexes), viết `CONTRACT_DRAFT.md` (8 sections: API, DTOs, Mock, Errors, Events, Idempotency, Sign-off).
  - Quang Designer: Thiết kế Design System — `design-tokens.json`, `index.css` (HSL color vars), `tailwind.config.ts`. Nghiêm cấm FE viết code trước khi có file cấu hình Design System.

### ANTI-THESIS: Phản Biện Kiến Trúc & FE
- **Agent:** Mộc Arch-Chal (BE challenger) + Lân Dev FE (FE challenger)
- **Hành động:**
  - Mộc: Tấn công `ARCHITECTURE.md` và `schema.prisma`: N+1 query? RLS bọc kín chưa? JSONB có index không? Kafka partition strategy đúng chưa? Ghi `ARCH_CHALLENGE.md` với severity (HIGH/MEDIUM/LOW) và evidence.
  - Lân Dev FE: Xem xét `design-tokens.json` và `CONTRACT_DRAFT.md` — biến CSS có mapping đủ không? API payload có match FE component needs không? Hardcode màu lọt vào không?
  - Bắt buộc: đề xuất Counter-proposal kèm lý lẽ cho mỗi issue HIGH.

### SYNTHESIS: Phán Quyết & Chốt Contract
- **Agent:** Dũng PM + Xuân Spec-Rev
- **Hành động:**
  - Phúc SA viết `ARCH_RESPONSE.md`: phản hồi từng issue của Mộc (accept/reject + lý do).
  - Xuân Spec-Rev đọc `CONTRACT_DRAFT.md`, viết `CONTRACT_REVIEW.md`: kiểm tra đủ 8 sections, ≥5 error cases, idempotency keys đúng chỗ. Ký sign-off hoặc ghi block reason.
  - Dũng PM xem xét `ARCH_RESPONSE.md` + `CONTRACT_REVIEW.md`, chốt quyết định cuối.
  - Nếu có `Phanbien` (PHUC_MOC_JOINT_DESIGN.md): Phúc SA + Mộc jointly produce trước Gate 2.5.
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 1.5 | `gates/gate1.5.sh` | `ARCH_CHALLENGE.md` + `ARCH_RESPONSE.md` tồn tại; mọi issue HIGH đã có response | Phúc SA phải phản hồi đủ |
| 1.6 | `gates/gate1.6.sh` | `CONTRACT_DRAFT.md` ≥30 lines, có API + Event boundary sections | Phúc SA bổ sung contract |
| 1.6.5 | `gates/gate1.6.5.sh` | `CONTRACT_REVIEW.md` tồn tại, Xuân đã sign-off hoặc ghi rõ block | Xuân hoàn thiện review |
| 2 | `gates/validate.sh` (doc quality: Nash Triad LLM review) | Mỗi submodule contract ≥5 error cases | Phúc SA thêm error cases |
| 2.5 | `gates/gate2.5.sh` | (Conditional) Nếu Phanbien: `PHUC_MOC_JOINT_DESIGN.md` có "FINAL DECISION" | Joint design meeting |

## Exit
- Gate cuối PASS → báo cáo cho Dũng PM → route Pipeline 3 (Coding). `DESIGN_FLOW.md` (đang chạy song song) nhận `CONTRACT_DRAFT.md` khi hoàn tất.
