# Pipeline 6: Cứu Hộ Khẩn Cấp (Emergency Hotfix)

"Làn Khẩn Cấp" — kích hoạt khi Production sụp đổ hoặc có bug P0 ảnh hưởng trực tiếp người dùng.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Tùng Diag` → `agents/core/tung-diag.md` (Thesis: Root Cause Analysis)
> - `Mộc Arch-Chal` → `agents/core/moc-arch-chal.md` (Anti-Thesis: Risk Checker)
> - `Dũng PM` → `agents/BRAIN.md` (Synthesis: Decision Maker)

## Input
- Kích hoạt khẩn cấp bởi MoE Router khi: Server crash, DB mất kết nối, hoặc bug P0 trực tiếp trên Production (thanh toán sai, dữ liệu corrupt, auth bypass).

## Severity Classification

| Severity | SLA | Ví dụ |
|----------|-----|-------|
| SEV-1 | Fix trong 1h | Server 100% down, dữ liệu tài chính sai |
| SEV-2 | Fix trong 4h | Feature chính broken, performance nghiêm trọng |
| SEV-3 | Fix trong 24h | Feature phụ broken, workaround tồn tại |

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `docs/hotfix/ROOT_CAUSE.md` | Tùng Diag | Log analysis, root cause, impacted scope |
| `docs/hotfix/HOTFIX_PR.md` | Dev author gốc | Exact lines changed, risk assessment |
| `docs/hotfix/POST_MORTEM.md` | Tùng Diag + Dũng PM | Timeline, root cause, prevention plan |

## Quy Trình (Nash Triad)

### THESIS: Chẩn Đoán & Hotfix
- **Agent:** Tùng Diag (RCA) + Dev author gốc (patch)
- **Hành động:**
  - Tùng Diag: Mổ xẻ logs (Server, DataDog, Grafana) tìm Root Cause trong ≤30 phút (SEV-1). Ghi `ROOT_CAUSE.md` với timeline sự kiện + impacted scope.
  - Dev author gốc (agent nào viết code đó fix): tạo `HOTFIX_PR.md` — chỉ sửa chính xác hàm/line bị lỗi. CẤM refactor class, rename, hoặc thêm feature trong lúc hotfix.
  - Communicate với stakeholders mỗi 30 phút (SEV-1) hoặc mỗi 2h (SEV-2).

### ANTI-THESIS: Kiểm Tra Domino Effect
- **Agent:** Mộc Arch-Chal (hoặc Phúc SA nếu Mộc không available)
- **Hành động:**
  - Review `HOTFIX_PR.md` nhanh (≤15 phút cho SEV-1).
  - Câu hỏi bắt buộc: "Fix này có gây Domino effect sang service khác không? Data đã bị corrupt cần script rollback/fix không?"
  - Chặn band-aid fix tạo nợ kỹ thuật nghiêm trọng — yêu cầu approach khác nếu rủi ro cao hơn sự cố hiện tại.
  - Approve hoặc block có lý do rõ ràng bằng văn bản.

### SYNTHESIS: Deploy Quyết Đoán
- **Agent:** Dũng PM (hoặc C-Level/User nếu SEV-1)
- **Hành động:**
  - Phân tích trade-off: "Để sập tiếp" vs "Merge hotfix có rủi ro X".
  - Nếu Mộc đã gật đầu: ép buộc Merge vào `main` và deploy cấp tốc.
  - Truy cứu Git blame xác định tác giả bug gốc cho post-mortem scoring.
  - Sau khi Production ổn định: tạo ticket yêu cầu chạy Pipeline 3 + Pipeline 4 để cleanup đàng hoàng.
  - Scoring theo `system/SCORING_RULES.md` — tối đa P0 = ±30đ, không vượt cap.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 9 | `gates/commit.sh` | Git commit targeted (no `git add .`), `POST_MORTEM.md` tồn tại | Tùng Diag hoàn thiện post-mortem |

## Communication Protocol

- SEV-1: Thông báo stakeholders ngay lúc phát hiện → update mỗi 30 phút → confirm resolved.
- SEV-2: Thông báo trong 30 phút → update mỗi 2h → confirm resolved.
- SEV-3: Thông báo trong 4h → update daily.

## Exit
- Gate 9 PASS + Production ổn định ≥30 phút → báo cáo cho Dũng PM → mở Pipeline 3 + 4 để cleanup.
