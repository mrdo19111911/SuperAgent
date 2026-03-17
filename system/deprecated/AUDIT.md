# The 12-Dimensional Enterprise Technical Due Diligence (TDD) Audit

Tài liệu này định nghĩa Tiêu chuẩn Kiểm toán Mã nguồn (Codebase Audit) khắt khe nhất, dựa trên các vòng Technical Due Diligence của các mảng M&A Công nghệ. 
Mọi Agent (đặc biệt là MoE Analyzer / Conan Req-Aud) BẮT BUỘC phải cày móp máy codebase theo 12 Chiều này để định giá "sức khoẻ" dự án trước khi đưa ra quyết định Routing hoặc Refactoring.

*Tuyệt đối không bỏ sót chiều nào để tránh dự án chết yểu.*

## Chiều 1: Chiến Lược Kinh Doanh & Lộ Trình (Business Strategy & Alignment)
- **Tầm nhìn (Roadmap):** Dự án xây ra giải quyết bài toán cốt lõi nào? Mục tiêu của luồng code này có khớp với KPI/Roadmap kinh doanh không?
- **Khả năng sinh lời (Monetization):** Thiết kế code này có support được mô hình thu tiền của công ty không? (Ví dụ: Hardcode giới hạn 100 users thì sao thu tiền tỷ?).

## Chiều 2: Văn Bản, Nghiệp Vụ & Độ Tin Cậy (Docs & Triad Conflicts)
- **Kiểm tra Tồn tại:** Có `SPEC.md`, `CONTEXT.md`, `ARCHITECTURE.md` không?
- **Độ Phủ:** Yêu cầu kinh doanh (Business Logic) có được định nghĩa rõ ràng không?
- **Triad Conflicts:** Bản thân các tài liệu có tự vả nhau không? (VD: `SPEC.md` nói dùng PostgreSQL nhưng `CONTEXT.md` lại ghi MongoDB).

## Chiều 3: Sở Hữu Trí Tuệ & Giấy Phép (IP & Licensing)
- **Open Source Liability:** Có xài lén lút các thư viện GPL/Copyleft lây nhiễm bản quyền, rước họa kiện tụng cho công ty không?
- **Tài sản cốt lõi:** Các thuật toán siêu việt (Core logic) có nguy cơ bị lộ mã nguồn hay không được bảo vệ quyền sở hữu trí tuệ (IP) không?

## Chiều 4: Kiến Trúc & Thiết Kế (Architecture & Scalability)
- **Dependency & Coupling:** Code có bị dính chùm (Spaghetti) không? Hay được chia module lỏng lẻo (Loosely coupled)?
- **Scalability:** Thiết kế này có chịu tải được x10, x100 lần user không?
- **Patterns:** Có áp dụng đúng Design Patterns (như DTO, Repository, Dependency Injection) không?

## Chiều 5: Bảo Mật (Security Posture - OWASP)
- **Xác thực & Phân quyền (AuthN/AuthZ):** Có RLS (Row-Level Security) chống rò rỉ chéo Tenant không?
- **Input Validation:** Payload có được Validate chặt chẽ chống Injection không?
- **Secrets:** Có Hardcode mât khẩu, API Keys thẳng vào Source code hay không?
- **Dependencies:** Thư viện (`package.json`) có dính lỗ hổng bảo mật (CVE) đã biết không?

## Chiều 6: Nợ Kỹ Thuật & Chất Lượng Code (Tech Debt & QA)
- **Độ phức tạp (Cyclomatic Complexity):** Hàm có quá dài hay lồng nhau quá sâu (Deep nesting) không?
- **Mã Rác:** Có Code lặp lại (Duplication), Dead code, hay quá nhiều TODO/FIXME không?
- **Bao phủ Test (Test Coverage):** Tỉ lệ Test Coverage bao nhiêu? Có hệ thống Bug Tracking tự động (như Sentry) không?

## Chiều 7: Hạ Tầng, Triển Khai & Vận Hành (Infra, DevOps & Ops)
- **CI/CD:** Có pipeline test và deploy tự động không?
- **Môi trường (Environment):** Quản lý config `.env` tách biệt không?
- **Disaster Recovery (DR):** Nếu Data Center cháy, ứng dụng mất bao lâu để phục hồi? 

## Chiều 8: Cơ Sở Dữ Liệu & Data Lifecycle (Database Health)
- **Schema & Migrations:** Lịch sử database migrations có rõ ràng và đồng bộ với ORM không? Có dính lỗi N+1 Query không?
- **Tình Trạng Dữ Liệu (Data Presence):** DB đang trắng trơn, chứa dữ liệu rác (Mock), hay đang chứa dữ liệu thật của User?
- **Bảo mật Data & Backups:** Dữ liệu nhạy cảm (PII) có bị lưu plain-text không? Có cơ chế auto-backup chưa?
- **Audit Logging:** Có cơ chế ghi Log ai vừa xóa/sửa dữ liệu không?

## Chiều 9: Tổ Chức Nhóm & Con Người (Team & Org Capability)
- **Bus Factor:** Dự án có sống dở chết dở nếu 1 Developer chính (Key person) đột ngột nghỉ việc không? Code có ai hiểu không?
- **Knowledge Transfer:** Có quy trình onboarding và giải thích mã nguồn thừa kế (Legacy code) rõ ràng không?

## Chiều 10: Vận Hành Chăm Sóc Khách Hàng (Customer Care & SLA)
- **Defect Rate & Triage:** Tỉ lệ Bug đập bật lại từ Customer Care là bao nhiêu?
- **SLA:** Thời gian cam kết giải quyết sự cố nghiêm trọng (Incident Response Time) có khả thi với đống code này không?

## Chiều 11: Trạng Thái Backend & Mâu Thuẫn (Backend Deep State)
*Chỉ đánh giá trạng thái hiện tại, tuyệt đối không code.*
- **Trưởng Thành:** Backend đang ở Level nào? (Rỗng -> Đang code -> Chạy lỗi -> Chạy cơ bản -> Tích hợp hoàn hảo).
- **Mâu Thuẫn Thực Tế:** Code BE đang chạy có khớp với Hợp đồng (`CONTRACT_DRAFT.md`) và `ARCHITECTURE.md` không? 

## Chiều 12: Trạng Thái Frontend (Frontend Deep State)
- **Tình trạng:** Khởi tạo -> Code dở -> Mockdata -> Nối API thật -> Pixel-perfect.
- **Mâu Thuẫn UI vs API:** Frontend gọi API có đúng endpoint, xử lý mượt các Error Codes (như 401, 500) mà Backend nhả về không?

---

## 🎯 ĐẦU RA BẮT BUỘC (The Audit Output)
Agent thực hiện xong `AUDIT.md` KHÔNG ĐƯỢC PHÉP trả về text dài dòng. Nó **bắt buộc** phải đúc kết lại thành 1 "Hồ Sơ Bệnh Án" (Diagnostic Record) chốt hạ. **Hồ sơ này chính là ĐẦU VÀO SỐNG CÒN (Input) để `MIXTURE_OF_EXPERTS_ROUTER.md` quyết định gạt cần.**

**Định dạng Đầu Ra Tiêu Chuẩn (Standardized Audit Output):**
```markdown
### THE 12-DIMENSIONAL AUDIT RECORD

- **[C1] Business Alignment:** [OK / FAIL]
  - Lý do phát quyết:
    + Dẫn chứng 1: (Ví dụ: Code chốt cứng 50 users giới hạn ở file X)
    + Dẫn chứng 2: (Mâu thuẫn với KPI quý 3)

- **[C2] Docs & Triad:** [PASS / CONFLICT]
  - Mâu thuẫn tìm thấy:
    + SPEC ghi A nhưng CONTEXT ghi B.

- **[C3] IP Liability:** [SAFE / RISKY]
  - Rủi ro bản quyền:
    + Thư viện `xyz` dính license GPL, rủi ro thương mại hóa.

- **[C4] Architecture:** [CLEAN / SPAGHETTI]
  - Nhận xét cấu trúc:
    + Gọi chéo DB trực tiếp từ Controller.

- ... (Tương tự cho C5 đến C10)

- **[C11] Backend Deep State:** [LEVEL 1-6] 
  - Khớp Hợp đồng không: 
    + Code trả về chuẩn REST API.

- **[C12] Frontend Deep State:** [LEVEL 1-5]
  - UI gọi API:
    + Thiếu file `.env` config URL backend.

---
🔥 KẾT LUẬN TỔNG THỂ DÀNH CHO ROUTER:
=> [FATAL ERRORS] Liệt kê các lỗi chí tử cần Router giải quyết TỨC THÌ (Gọi Tòa án / Re-architect).
=> [CURRENT STATE] Tình trạng chung: Mới tinh / Đang Code / Nợ kĩ thuật ngập đầu / Sập server.
```

---

## ⚡ MÔ HÌNH THỰC THI SONG SONG (Parallel Execution Model)

> Thay vì 1 Agent cày móp 12 chiều (tốn token, chậm), Tùng Diag chia nhỏ thành 3 luồng song song.

```
Tùng Diag (Orchestrate)
│
├─── [SONG SONG] ─────────────────────────────────────────
│    │                    │                    │
│    ▼                    ▼                    ▼
│  Conan Req-Aud     Phúc SA + Mộc        Xuân + Huyền
│  Chiều 1, 2, 3     Chiều 4, 5, 6,       Chiều 11, 12
│  9, 10             7, 8
│    │                    │                    │
│    ▼                    ▼                    ▼
│  audit_business.md  audit_technical.md   audit_integration.md
│
└─── [SAU KHI TẤT CẢ XONG] ───────────────────────────────
     │
     ▼
  merge_audit.sh  (script bash, không cần LLM)
     │
     ▼
  AUDIT_REPORT_FINAL.md
     │
     ▼
  MIXTURE_OF_EXPERTS_ROUTER.md đọc → ra FLOW + CHECKLIST + GUARDIAN
```

### Quy Ước File Output

| Agent | File Output | Chiều Phụ Trách |
|-------|-------------|----------------|
| Conan Req-Aud | `audit_business.md` | C1, C2, C3, C9, C10 |
| Phúc SA + Mộc | `audit_technical.md` | C4, C5, C6, C7, C8 |
| Xuân + Huyền | `audit_integration.md` | C11, C12 |
| Tùng Diag | `AUDIT_REPORT_FINAL.md` | Tổng hợp + Kết luận |

### Output Location Convention

Tất cả file audit output lưu **trong module được audit**, không phải Agent_v3:

```
modules/{path}/{module}/docs/
├── audit_business.md        ← Conan output (intermediate)
├── audit_technical.md       ← Phúc+Mộc output (intermediate)
├── audit_integration.md     ← Xuân+Huyền output (intermediate)
└── AUDIT_REPORT_FINAL.md   ← Router input (permanent)
```

Lý do: Zero-trust audit đọc module → verdict thuộc về module. Khi module move (`Doing/` → `Done/`), audit report đi theo tự nhiên.

### Script Merge
```bash
# Chạy sau khi 3 sub-agent hoàn thành
# AUDIT_DIR = thư mục docs/ của module được audit
bash Agent_v3/scripts/merge_audit.sh ./modules/{path}/{module}/docs/
```
