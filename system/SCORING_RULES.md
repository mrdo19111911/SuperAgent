# Zero-Sum Scoring Classification

Mọi giao dịch điểm số giữa các Agent đều tuân theo hệ thống phân loại Severity (P0-P4).
Nguyên tắc cốt lõi: **Kẻ phát hiện được cộng điểm (+), kẻ gây lỗi bị phạt điểm (-).** Giá trị bằng nhau (Zero-Sum).

## Tiers & Points (Tiêu chuẩn P0-P4)

- **P0 - Blocker (±30 điểm):** Lỗi Trí Mạng / Lừa Dối (Báo cáo láo, Mù lòa cho code rác qua, Lọt Bug lên Production). *Hành vi phá hoại Cân Bằng Nash.*
- **P1 - High (±20 điểm):** Lỗi Nghiêm Trọng (Bug lọt qua tới vòng QA P7 rồi mới bị bắt).
- **P2 - Medium (±15 điểm):** Lỗi Chệch Đường Ray (Sai lệch Hợp đồng API / Spec, Chẩn đoán sai Root Cause).
- **P3 - Low (±10 điểm):** Lỗi Code / Test Tiêu Chuẩn (Thiếu Unit Test, Code còn để lại TODO/Mocks, Vi phạm SLO/Budget).
- **P4 - Trivial (±5 điểm):** Lỗi Bắt Bẻ Lặt Vặt (Bắt lỗi thiết kế/bug ở mức ưu tiên siêu thấp).

## Bảng Tra Lỗi (Error Mapping)

| Tên lỗi / Sự kiện (Event) | Phân Loại |
|---------------------------|-----------|
| Thỏa hiệp bẩn (Collusion) - Agent A và B tự pass khống qua mặt Trọng tài | **P0** (Blocker) |
| Review lười biếng, tìm ra 0 lỗi dù code nát (Rule M1) | **P0** (Blocker) |
| Báo cáo láo, ngụy tạo lỗi (False Positive M3) | **P0** (Blocker) |
| Lọt lỗi Kiến trúc nghiêm trọng (Dũng bắt được ở P5/P6/P7 - Rule M2) | **P0** (Blocker) |
| Bug lọt thẳng ra môi trường Production | **P0** (Blocker) |
| Bug lọt qua Gate QA P7 | **P1** (High) |
| Phá vỡ Hợp đồng API (BREAKING Contract drift) | **P2** (Medium) |
| Lọt lỗi hở SPEC / Gap giữa Contract và Yêu cầu | **P2** (Medium) |
| Tùng Diag chẩn đoán sai Root Cause | **P2** (Medium) |
| Code có chứa stub, TODO, mock variables khi lên Gate 5 | **P3** (Low) |
| Dev thiếu Unit Test / Hollow test thiếu độ phủ | **P3** (Low) |
| Vi phạm SLO/Budget trong WORKFLOW.md | **P3** (Low) |
| Fail P4/P5/P6 do lỗi Code Logic cơ bản / TSC error | **P3** (Low) |
| Báo động giả mức độ thông thường (False Positive bởi QA) | **P3** (Low) |
| Bắt lỗi thiết kế/bug ở mức MEDIUM/LOW | **P4** (Trivial) |

## Quick Resolution Rules

- Lệnh thưởng/phạt áp dụng NGAY LẬP TỨC khi sự kiện trigger ở các Gate.
- Dũng PM ghi giao dịch vào `artifacts/{module}/LEDGER.md`. Nếu không có Evidence → Giao dịch vô hiệu.
- **Blind scoring enforcement:** Agent KHÔNG được gọi Tool đọc LEDGER của mình. Vi phạm = P0 penalty (±30đ).

---

## LEDGER Mechanism

### Vị Trí
```
artifacts/{module}/LEDGER.md   ← Dũng PM ghi, không ai khác được đọc/ghi
```

### Ai Ghi / Ai Đọc
| Hành động | Ai được phép |
|-----------|-------------|
| Ghi giao dịch mới | Dũng PM (Synthesis) duy nhất |
| Đọc để tổng kết sprint | Dũng PM duy nhất |
| Agent tự đọc điểm mình | **CẤM** — P0 penalty ngay lập tức |

### Format Giao Dịch
```
## {date} | {gate}
- EVENT: {tên sự kiện}
- AGENT_PENALIZED: {agent}  POINTS: -{N}
- AGENT_REWARDED: {agent}   POINTS: +{N}
- EVIDENCE: {commit hash / gate log URL / file:line}
- VERDICT_BY: Dũng PM
```

### Blind Scoring — PEN Entries trong L2 Cache

PEN entries trong `agents/{layer}/{agent}.md` CHỈ được ghi **nguyên tắc phòng tránh**, KHÔNG ghi điểm số cụ thể.

ĐÚNG:
```
PEN [P2] CONTRACT_DRIFT: Luôn validate response shape trước khi merge.
```
SAI (bị cấm):
```
PEN [P2] -15đ: Contract drift tại gate5 ngày 2026-03-01.
```

Template đầy đủ: `system/templates/LEDGER_TEMPLATE.md`
