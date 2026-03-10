# DESIGN_FLOW.md — Quy Trình Thiết Kế FE

> **Triết lý:** No code before design. No design before research.
> **Source:** Distilled từ v4.1 FE Pipeline (FE-S-1 → FE-S4)
> **Scope:** Design only: Research → Wireframe → Stitch HTML → QA. Không code React.
> **Vị trí trong hệ thống:** Chạy SAU Pipeline 1 (Gate 1 PASS), SONG SONG với Pipeline 2.
> **Hand-off:** Stage 6 PASS → chuyển sang `FE_IMPLEMENTATION.md` (FE-P0 → FE-P9) để code React.

---

## HARD GATE: CONTRACT_DRAFT Check (BLOCKING)

> **NON-NEGOTIABLE:** DESIGN_FLOW KHÔNG ĐƯỢC bắt đầu Stage 1 nếu chưa có `CONTRACT_DRAFT.md`.

**Trước khi vào bất kỳ stage nào, agent PHẢI kiểm tra:**

```
CHECK: CONTRACT_DRAFT.md tồn tại cho module target?
  - Vị trí: <module>/docs/CONTRACT_DRAFT.md
  - Phải có đủ 8 sections: API, DTOs, Mock, Errors, Events, Idempotency, Sign-off, ...
```

### Nếu CHƯA CÓ → Stage 0: Contract Discovery (Nash Triad)

**Dừng design. Tạo CONTRACT_DRAFT.md trước.**

```
Step 1: Phúc SA (Thesis) + Mộc Arch-Chal (Anti-Thesis) — SONG SONG, KHÔNG TRAO ĐỔI
        ├── Phúc SA:  Đọc toàn bộ source code module → viết PHUC_CONTRACT_DRAFT.md
        │             Focus: API endpoints, DTOs, events, happy path
        └── Mộc:      Đọc toàn bộ source code module → viết MOC_CONTRACT_DRAFT.md
                      Focus: Edge cases, error handling, security gaps, missing endpoints

Step 2: Dũng PM (Synthesis)
        ├── Đọc cả 2 drafts
        ├── Merge thành CONTRACT_DRAFT.md chính thức
        ├── Resolve conflicts (Phúc nói endpoint X, Mộc nói không cần → Dũng quyết)
        └── Đảm bảo đủ 8 sections theo chuẩn Agent_v3

Step 3: Gate — CONTRACT_DRAFT.md tồn tại + đủ 8 sections + có Sign-off
        → PASS: Tiếp tục DESIGN_FLOW Stage 1
        → FAIL: Quay lại Step 1
```

**Nguyên tắc No-Trust:**
- Phúc và Mộc đọc code **độc lập** — không share findings trước khi nộp draft
- Mỗi người nộp draft riêng — Dũng PM là người duy nhất thấy cả 2
- Nếu 2 drafts conflict >30% endpoints → Dũng triệu tập debate trước khi merge
- Output: 3 files → `PHUC_CONTRACT_DRAFT.md` + `MOC_CONTRACT_DRAFT.md` + `CONTRACT_DRAFT.md` (final)

**Vai trò Stage 0:**

| Agent | Vai trò | Input | Output |
|-------|---------|-------|--------|
| Phúc SA | Thesis — thiết kế contract từ code | Source code + schema.prisma | `PHUC_CONTRACT_DRAFT.md` |
| Mộc Arch-Chal | Anti-Thesis — challenge + bổ sung | Source code + schema.prisma | `MOC_CONTRACT_DRAFT.md` |
| Dũng PM | Synthesis — merge + resolve conflicts | 2 drafts | `CONTRACT_DRAFT.md` (final) |

### Nếu ĐÃ CÓ → Skip Stage 0, bắt đầu Stage 1

---

## Output (Exact Filenames)

| Stage | File | Tạo bởi |
|-------|------|---------|
| 0 | `CONTRACT_DRAFT.md` (nếu chưa có) | Phúc SA + Mộc → Dũng PM merge |
| 1 | `docs/design/USER_RESEARCH.md` | Quang Designer + Châu UX |
| 2 | `docs/design/DESIGN_DECISIONS.md`, `docs/design/TMS_GLOSSARY.md` | Quang + Châu + Lân + Huyền |
| 3 | `docs/design/ASCII_UX_MASTER.md`, `docs/design/COMPONENT_SPEC.md`, `docs/design/design-tokens.json` | Quang (Round 1) → debate → Huyền (gate) |
| 4 | `docs/design/DESIGN_REVIEW.md` (VERDICT=PASS/FAIL) | Châu + Lân + Huyền + Dũng |
| 5 | `stitch-output/*.html` | Quang (Stitch AI) |
| 6 | `docs/design/HTML_INTEGRITY_REPORT.md` | Huyền FE-QA (Crawlee) |
| — | **HAND-OFF → `FE_IMPLEMENTATION.md`** | Stage 6 PASS triggers FE pipeline |

---

## Flow

```
Stage 0: Contract Check   → CONTRACT_DRAFT.md (nếu chưa có: Phúc+Mộc→Dũng)  (skip nếu đã có)
Stage 1: Research         → USER_RESEARCH.md + COMPETITIVE_ANALYSIS.md        (4-6h)
Stage 2: Workshop         → DESIGN_DECISIONS.md + TMS_GLOSSARY.md             (2-3h)
Stage 3: Wireframe Debate → ASCII_UX_MASTER.md (4-Round Debate)               (4-6h)
Stage 4: Design Review    → DESIGN_REVIEW.md VERDICT=PASS/FAIL                (1h)
Stage 5: Stitch AI        → stitch-output/*.html (Google Stitch)              (2-3h)
Stage 6: HTML QA          → HTML Integrity Report                              (1h)
         ↓
         HAND-OFF → FE_IMPLEMENTATION.md (FE-P0 → FE-P9) để code React
         (Điều kiện: Stage 6 PASS + CONTRACT_DRAFT.md đã chốt)
```

---

## Vai Trò

| Stage | Phúc SA | Mộc | Quang | Châu UX | Lân Dev | Huyền FE-QA | Dũng PM |
|-------|:-------:|:---:|:-----:|:-------:|:-------:|:-----------:|:-------:|
| 0 Contract | ✅ Thesis | ✅ Anti-Thesis | — | — | — | — | ✅ **Synthesis** |
| 1 Research | — | — | ✅ Lead | ✅ Domain | — | — | — |
| 2 Workshop | — | — | ✅ | ✅ Domain | ✅ Feasibility | ✅ A11y | ✅ Facilitate |
| 3 Debate | — | — | ✅ Round 1-3 | ✅ Round 1-3 | ✅ Round 1-3 | ✅ **Gate R4** | — |
| 4 Review | — | — | ✅ Present | ✅ UX/Domain | ✅ Tech | ✅ A11y | ✅ **Approve** |
| 5 Stitch | — | — | ✅ Lead | — | — | — | — |
| 6 HTML QA | — | — | — | — | — | ✅ Lead | — |

---

## Stage 3: ASCII Wireframe Debate — 4 Rounds

> **Input bắt buộc:** Nếu `CONTRACT_DRAFT.md` đã tồn tại (Pipeline 2 hoàn tất hoặc đang chạy song song), Quang PHẢI đọc trước khi vẽ wireframe. Nếu chưa có, ghi rõ "[CONTRACT PENDING]" trên mỗi wireframe element cần API.

```
Round 1 (Quang)  → Draft ASCII wireframe + component list + API mapping table
Round 2 (Châu)   → Domain challenge: "TMS term SAI / Flow thiếu bước X"
Round 3 (Lân)    → Tech + Contract challenge:
                    - "Component này có sẵn trong T0_07?"
                    - "API endpoint nào trong CONTRACT_DRAFT.md hỗ trợ action này?"
                    - "Wireframe element X không có API tương ứng → flag DESIGN_GAP"
Round 4 (Huyền)  → Zero-Defect Check → VERDICT=PASS/FAIL
```

**Round 1 bắt buộc kèm API Mapping Table:**
```
| Wireframe Element      | User Action        | API Endpoint (from CONTRACT_DRAFT.md)     | Status       |
|------------------------|--------------------|-------------------------------------------|--------------|
| [Create Order] button  | Click → submit     | POST /api/v1/orders                       | ✅ Mapped    |
| [Search] input         | Type → filter      | GET /api/v1/orders?search=                | ✅ Mapped    |
| [Export PDF] button    | Click → download   | ???                                       | ❌ NO API    |
```

> Nếu có element `❌ NO API` → Round 3 Lân PHẢI flag, Dũng PM quyết định: bỏ element hoặc request BE bổ sung API.

Output: `ASCII_UX_MASTER.md` — nguồn duy nhất cho Stage 5 prompt Stitch.

---

## Output & Gate

| Stage | Output | Gate |
|-------|--------|------|
| 0 | `CONTRACT_DRAFT.md` (merged from Phúc + Mộc drafts) | Đủ 8 sections + Sign-off. Skip nếu đã có |
| 1 | `USER_RESEARCH.md` (personas + journey map + pain points top-10) | ≥3 personas + pain points documented |
| 2 | `DESIGN_DECISIONS.md` + `TMS_GLOSSARY.md` | Dũng approve |
| 3 | `ASCII_UX_MASTER.md` + `COMPONENT_SPEC.md` + `design-tokens.json` | Huyền VERDICT=PASS (Round 4) |
| 4 | `DESIGN_REVIEW.md` VERDICT=PASS | Châu ✅ Domain · Lân ✅ Tech · Huyền ✅ A11y · Dũng ✅ |
| 5 | `stitch-output/*.html` | Components + Tokens + A11y + Responsive check |
| 6 | HTML Integrity Report (Crawlee) | bugs < 5 |

> **Stage 6 PASS → HAND-OFF sang `FE_IMPLEMENTATION.md`**
> React implementation (code, TDD, QA, commit) nằm hoàn toàn trong FE_IMPLEMENTATION.md pipeline.
> DESIGN_FLOW chỉ chịu trách nhiệm design — không code React.

---

## Checklist Review Stage 4

**Châu:** Terminology đúng? Flow khớp chuẩn TMS? Pain points giải quyết đủ?
**Lân:** Components có sẵn (`@stmai/ui-components`)? APIs trong CONTRACT_DRAFT.md cover hết wireframe actions? Timeline thực tế?
**Huyền:** WCAG 2.1 AA? Keyboard nav? ARIA labels? Error messages rõ?
**Dũng:** Đúng scope MVP? Design system reusable cho module khác? API Mapping Table không còn `❌ NO API`?

> **BLOCKING:** Nếu API Mapping Table còn element `❌ NO API` và chưa được resolve → DESIGN_REVIEW VERDICT=FAIL. Không được chuyển sang Stage 5.

---

## Nguyên Tắc

1. **Design tokens trước** — `design-tokens.json` phải có trước khi viết Stitch prompt
2. **ASCII → Stitch** — Stitch prompt viết từ `ASCII_UX_MASTER.md`, không tự phát minh layout
3. **CONTRACT_DRAFT.md là ràng buộc cho design** — Mọi wireframe element có user action phải map được tới API endpoint trong CONTRACT_DRAFT.md. Không vẽ feature mà BE không có API
4. **DESIGN_FLOW không code React** — Stage 6 PASS → hand-off sang `FE_IMPLEMENTATION.md`. React code là trách nhiệm của FE pipeline
5. **Accessibility từ đầu (design-level)** — WCAG 2.1 AA check trên wireframe + Stitch HTML. Code-level A11y check nằm trong FE_IMPLEMENTATION.md FE-P5
6. **Mobile-first** — 3 breakpoints: 375 / 768 / 1440px
