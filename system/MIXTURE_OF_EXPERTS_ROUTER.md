# Mixture of Experts (MoE) Router

**Vai trò:** Giám Quản Đầu Vào Codebase & Pipeline Dispatcher

---

## 0. 🗺️ SYSTEM INDEX — Toàn Bộ Quy Trình Anti_propost_0.1

> Đây là bản đồ toàn hệ thống. MoE Router đọc mục này để biết mọi file liên quan ở đâu.

### Tầng 1: Chẩn Đoán
| File | Vị Trí | Chức Năng |
|------|---------|-----------|
| `AUDIT.md` | `system/AUDIT.md` | 12-chiều TDD audit spec |
| `merge_audit.sh` | `scripts/merge_audit.sh` | Gom 3 sub-audit → 1 final report |

### Tầng 2: Điều Phối
| File | Vị Trí | Chức Năng |
|------|---------|-----------|
| `FAST_BYPASS_ROUTER.md` | `system/` | Phase -0.5: Regex bypass (70% token savings) |
| `MIXTURE_OF_EXPERTS_ROUTER.md` | `system/` *(file này)* | Router: Flow + Checklist + Guardian |
| `HISTORY_COMPRESSION.md` | `system/` | 3-zone chat compression (49% reduction) |

### Tầng 3: Thi Công (6 Sub-Pipelines Nash Triad + Research)
| File | Vị Trí | Khi Nào Gọi |
|------|---------|-------------|
| `01_REQUIREMENTS_AND_RESEARCH.md` | `pipelines/` | SPEC rỗng, Domain mới |
| `02_ARCHITECTURE_AND_DB.md` | `pipelines/` | Thiếu DB schema, API contract |
| `03_CODING_AND_DEV.md` | `pipelines/` | Cần viết / sửa code |
| `04_TESTING_AND_QA.md` | `pipelines/` | Code xong, cần test |
| `05_SECURITY_AND_DEPLOYMENT.md` | `pipelines/` | Cần deploy, security scan |
| `06_EMERGENCY_HOTFIX.md` | `pipelines/` | Server sập, Bug P0 Prod |
| `DESIGN_FLOW.md` | `pipelines/` | Quy trình thiết kế FE (6 stages, Stitch AI) |

### Tầng 4: Hợp Đồng & Luật
| File | Vị Trí | Chức Năng |
|------|---------|-----------|
| `CONTRACT_DRAFT_TEMPLATE.md` | `system/templates/` | 8-mục contract BE↔FE |
| `SCORING_RULES.md` | `system/SCORING_RULES.md` | Luật thưởng/phạt Nash |
| `NASH.md` | `system/NASH.md` | Lý thuyết nền tảng Nash |

### Tầng 5: Bộ Nhớ Agent
| File | Vị Trí | Chức Năng |
|------|---------|-----------|
| `BRAIN.md` | `agents/BRAIN.md` | Dũng PM's system prompt |
| `agents/core/*.md` | `agents/core/` | L2 Cache core agents |
| `agents/dev/*.md` | `agents/dev/` | L2 Cache dev agents |
| `MEMORY_EVICTION_PROTOCOL.md` | `system/` | Luật P0-P4 eviction |
| `MODEL_ROUTING.md` | `system/MODEL_ROUTING.md` | Agent → Model mapping |
| `ram/{agent}/*.md` | `ram/` | Deep reference files (load on-demand) |

---


**Mô hình (Mixture of Experts):** Thay vì dùng 1 Agent duy nhất phán đoán hoặc nhường người dùng chọn tay, hệ thống dùng một "Gating Network" chạy độc lập (Phase -1) để quét toàn bộ Codebase (mã nguồn, file MD, package deps). Sau đó route luồng công việc tới chính xác "Expert Pipeline" (Backend, Frontend, Hotfix, Refactor).

## 0.5. 🚀 Fast Bypass Layer (Phase -0.5) — v6.9 Token Optimization

**BEFORE running AUDIT.md**, check if input qualifies for Fast Bypass (70% token savings):

### Fast Bypass Decision Tree

```
User Input
    ↓
┌───────────────────────────────────┐
│ Run fast_bypass_scorer.js        │
│ Calculate confidence (0-100%)    │
└───────────────────────────────────┘
    ↓
    ├─ Confidence ≥ 95% (System Command)
    │  → Direct Tool Execution (no pipeline)
    │  → Token saved: ~2,800/msg
    │
    ├─ Confidence ≥ 80% (Simple/Instant)
    │  → Skip AUDIT, route to Trivial/Simple Pipeline
    │  → Token saved: ~1,800-2,500/msg
    │
    └─ Confidence < 80% (Complex)
       → Proceed to Phase -1 (AUDIT.md)
       → Full 12-dimension analysis
```

### Bypass Patterns (Regex-Based)

| Pattern | Confidence | Route | Examples |
|---------|-----------|-------|----------|
| **INSTANT_BYPASS** | 100% | Trivial (Profile Line only) | "ê", "ok", "done", "thanks" |
| **SYSTEM_COMMAND** | 95% | Direct Tool | "git status", "screenshot", "npm test" |
| **SIMPLE_BYPASS** | 80% | Simple (Lazy Memory) | "show logs", "list files", "what's status" |
| **MoE_FALLBACK** | <80% | Full AUDIT | "implement OAuth", "refactor payment" |

### Token Impact

| Scenario | Before | After | Savings |
|----------|--------|-------|---------|
| Casual (70%) | 2,500 tokens | 200 tokens | **92%** |
| Simple Query (15%) | 2,500 tokens | 700 tokens | **72%** |
| Complex Task (15%) | 2,500 tokens | 2,500 tokens | 0% |
| **Weighted Avg** | **2,500 tokens** | **875 tokens** | **65%** |

### Anti-Pattern Detection (CRITICAL)

**P1 Penalty:** Fast Bypass MUST NOT route these keywords to bypass:
- architecture, database, security, deployment, refactor
- critical, production, bug, error, fail, test
- schema, contract, API, auth, payment

**Reason:** These require full AUDIT to avoid missed requirements.

**Implementation:** Add to `system/fast_bypass_scorer.js`:
```javascript
const BYPASS_BLOCKLIST = [
  'architecture', 'database', 'security', 'deployment', 'refactor',
  'critical', 'production', 'bug', 'error', 'fail', 'test',
  'schema', 'contract', 'api', 'auth', 'payment'
];

function containsBlockedKeyword(input) {
  return BYPASS_BLOCKLIST.some(kw => input.toLowerCase().includes(kw));
}

if (containsBlockedKeyword(input)) {
  return { confidence: 0, route: 'MoE_ROUTER' }; // Force AUDIT
}
```

### Reference

See full specification: [system/FAST_BYPASS_ROUTER.md](system/FAST_BYPASS_ROUTER.md)

---

## 1. 🔍 Khởi Động Trình Tự Khám Nghiệm (Calling the AUDIT)

Vào thời điểm bắt đầu (Phase -1), thay vì lập tức đoán mò và gọi 1 Pipeline dựa trên đuổi file, **MoE Analyzer BẮT BUỘC phải mở và tuân thủ tuyệt đối quy trình trong file `AUDIT.md`**.

- **Tham chiếu:** Xem chi tiết tại `system/audit/AUDIT_SPEC.md` (Phiên bản Enterprise 12 Chiều TDD).
- **Mục đích:** Không bỏ sót bất kỳ điểm mù nào từ Business, Docs, Security, Tech Debt, Ops, đến Database và Frontend.

Dữ liệu khám nghiệm thu về từ `AUDIT.md` sẽ là tham số SỐNG CÒN để Router gạt cần gạt ở Bước 2.

## 2. 🧠 Lập Luận Điều Phối (Routing Logic)

Dựa vào kết quả khám nghiệm 12 Chiều từ `AUDIT.md`, Analyzer gạt cần chọn **CHÍNH XÁC MỘT (hoặc nhiều chuỗi)** Pipeline tương ứng với chuẩn 6 Bước Làm Phần Mềm (Nash SDLC):

### 🎯 Pipeline 1: Phân Tích Yêu Cầu & Nghiên Cứu (Requirements & Research)
- **Tín hiệu Audit:** [C1] Business rỗng, [C2] Docs rỗng hoặc mâu thuẫn nặng, Dự án mới tinh chưa có code.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Phân Tích Yêu Cầu**. Gọi Dũng PM viết SPEC, User chốt yêu cầu. Nếu Domain khó (VD: Blockchain), đính kèm thêm **Pipeline Nghiên Cứu (P0.5)** để dò mìn.

### 🎯 Pipeline 2: Thiết Kế Kiến Trúc & Database (Architecture & DB)
- **Tín hiệu Audit:** SPEC đã chốt nhưng [C4] Kiến trúc Spaghetti, [C8] Schema Database chưa có hoặc mâu thuẫn với Docs.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Phân Tích Kiến Trúc**. Gọi Phúc SA vẽ Hợp đồng API và Schema DB. Gọi Mộc Arch-Chal vào chặt chém bản vẽ.

### 🎯 Pipeline 3: Lập Trình Backend / Frontend (Coding & Dev)
- **Tín hiệu Audit:** [C2] Docs hoàn hảo, [C8] DB đã lên khung, nhưng [C11] Backend đang code dở (Level 2/3) hoặc [C12] Frontend chưa có.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Lập Trình**. Phân xưởng Dev (Lân / Châu / Quang) bắt tay vào viết code theo đúng Hợp Đồng API.

### 🎯 Pipeline 4: Kiểm Thử Toàn Diện (Testing & QA)
- **Tín hiệu Audit:** Code đã viết xong, app chạy được nhưng [C6] Test Coverage rỗng, [C10] Nhiều Bug lặt vặt.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Kiểm Thử**. Gọi Sơn QA vào tàn phá ứng dụng, bắt Dev sửa cho bằng hết.

### 🎯 Pipeline 5: Bảo Mật & Triển Khai (Security & Deployment)
- **Tín hiệu Audit:** Pass hết bài QA nhưng [C7] Chưa cấu hình Docker/CI-CD, hoặc [C5] Cảnh báo Security lỏng lẻo.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Triển Khai**. Gọi hệ thống DevOps đóng gói, rà soát C5 lần cuối trước khi Go-Live.

### 🎯 Pipeline 6: Cứu Hộ Khẩn Cấp (Maintenance / Emergency)
- **Tín hiệu Audit:** App đang chạy nhưng bị Crash, hoặc [C1] Fail SLA do Bug Production nghiêm trọng.
- **Hành động (WhatToDo):** Kích hoạt **Pipeline Cứu Hộ (Emergency Lane)**. Gọi Tùng Diag mổ xẻ Log, dựng dậy server ngay trong đêm.

## 3. 🤖 Prompt Tiêu Chuẩn cho Gating Network (MoE Analyzer)

```text
Bạn là Mixture of Experts (MoE) Analyzer của STMAI.
Quy tắc Bắt Buộc: Bơm dữ liệu qua "Khám Nghiệm Mã Nguồn 12 Chiều" theo quy trình trong file `AUDIT.md` trước khi gọi Pipeline. Tuyệt đối không đoán bừa.

QUY TRÌNH CHẨN ĐOÁN: Yêu cầu chạy Tool đọc file `AUDIT.md` để lấy List 12 Dimensions cày nát dự án.

WHATTODO - KẾT LUẬN ROUTING DẠNG CHUỖI (FLOW OF WORKFLOWS):
Từ Bệnh Án AUDIT, hãy thiết kế một Chuỗi Thực Thi (Execution Plan) gồm 1 hoặc nhiều Pipeline liên tiếp nhau.
Ví dụ 1 (Dự án mới tinh):
  [Flow]: Pipeline 1 (Requirements) -> Pipeline 2 (Architecture) -> Pipeline 3 (Coding)
Ví dụ 2 (Kiến trúc thối, Code dở):
  [Flow]: Pipeline 2 (Architecture - Rebuild) -> Pipeline 3 (Coding - Refactor) -> Pipeline 4 (Testing)

OUTPUT BẮT BUỘC:
[Báo cáo Audit 12 Chiều TDD từ kết quả chạy AUDIT.md]
[Các Lỗ Hổng / Fatal Errors Phát Hiện Được]
[FLOW OF WORKFLOWS: Danh sách các Pipeline cần chạy theo thứ tự 1 -> 2 -> 3 Cụ thể]
[CHECKLIST: Danh sách các Artifacts/Mục tiêu BẮT BUỘC phải hoàn thành tương ứng với Flow trên]
[ZERO_TRUST_GUARDIAN: Chỉ định tên 1 Subagent (VD: Mộc Arch-Chal, Huyền QA, hoặc Ngữ Pitfall-R) đóng vai trò Người Kiểm Duyệt Độc Lập để rà soát Checklist trên trước khi cho phép hệ thống chuyển sang luồng Pipeline tiếp theo. Kẻ này có quyền Phủ Quyết (VETO) nếu Checklist bị làm sai lệch.]
```

## 4. 🎯 Context Hierarchy (v6.9 Rule 44)

When conflicts arise between sources, resolve using strict priority:

**Priority Order (High → Low):**
1. **User** - Explicit instructions in current conversation
2. **Spec** - $SPEC_FILE + task requirements
3. **Contracts** - $CONTRACTS_FILE + CONTRACT_DRAFT.md
4. **SOT** - $SOURCE_OF_TRUTH (architecture docs)
5. **PEN/WIN** - Agent persistent memory (past failures/wins)
6. **Code** - Existing codebase implementation

**Conflict Resolution:**
- Higher priority ALWAYS wins
- Cite hierarchy when resolving: "User instruction > existing code"
- **P1 penalty** if violate user instruction due to lower-priority source

**Example:**
```
User: "Use axios for HTTP"
Code: Uses fetch()
→ Resolution: Switch to axios (User > Code)
```
