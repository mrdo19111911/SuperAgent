# MEMORY_EVICTION_PROTOCOL.md
# Quy Trình Tối Ưu L2 Cache (Agent Memory Eviction)

> **Chạy bởi:** Nhiên Janitor | **Báo cáo cho:** Dũng PM (Super Agent)

---

## Priority Score Table

| Level | Tên | Giữ bao lâu | Ví dụ |
|-------|-----|------------|-------|
| **P0** | Critical / Never Evict | Vĩnh viễn | "RLS luôn cần NOBYPASSRLS" |
| **P1** | Active Module | Đến khi module done | T4_39 đang chạy |
| **P2** | Important Lesson | 90 ngày | "ML cần 3-layer fallback" |
| **P3** | Done Module | 30 ngày → archive | T2_26 đã PASS |
| **P4** | Draft / Temp Note | Hết Sprint → xóa | "Cần check lại cái này" |

---

## Eviction Rules

```
IF entry.priority == P4:
    DELETE immediately

IF entry.priority == P3 AND entry.age > 30 days:
    MOVE to agents/archive/{agent}-{date}.md

IF entry.priority == P2 AND entry.age > 90 days:
    DOWNGRADE to P3 → apply P3 rule next sprint

IF entry.priority IN [P0, P1]:
    KEEP, no action
```

---

## PEN Consolidation Rule (QUAN TRỌNG)

**Trigger:** Khi ≥3 PEN entries cùng loại lỗi (cùng error_code) trong L2 Cache của 1 agent.

**Hành động (Nhiên Janitor):**
```
IF COUNT(pen_entries WHERE error_code == X) >= 3:
    MERGE thành 1 PATTERN entry cấp P0
    DELETE 3 entries gốc
    NEW entry format:
    "PEN [P0] PATTERN_{ERROR_CODE}: {tóm tắt pattern tái diễn}. Xảy ra {N} lần."
```

Lý do: 3 lần cùng lỗi = systemic issue, cần upgrade lên P0 để không bao giờ bị evict.

---

## Blind Scoring — PEN Entry Format (BẮT BUỘC)

PEN entries trong L2 Cache CHỈ ghi **nguyên tắc phòng tránh**. KHÔNG ghi điểm số, KHÔNG ghi ngày bị phạt.

**ĐÚNG:**
```
PEN [P2] CONTRACT_DRIFT: Validate response shape với CONTRACT_DRAFT trước khi submit PR.
PEN [P0] COLLUSION: Không self-approve. Anti-Thesis phải là agent độc lập.
```

**SAI (bị cấm — vi phạm blind scoring):**
```
PEN [P2] -15đ ngày 2026-03-01: Contract drift tại gate5.   ← CẤM: có điểm số
PEN [P0] +30đ: Bắt được collusion của Phúc SA.            ← CẤM: agent thấy điểm
```

Điểm số chỉ tồn tại trong `artifacts/{module}/LEDGER.md` — do Dũng PM quản lý độc quyền.

---

## Cách Chấm Priority

Nhiên tự phán xét mỗi entry dựa trên câu hỏi:

| Câu Hỏi | Điều Kiện → Priority |
|---------|---------------------|
| Entry này có ngăn bug lặp lại không? | YES → P0 |
| Module liên quan đang active không? | YES → P1 |
| Bài học này tái sử dụng được không? | YES → P2 |
| Module liên quan đã PASS xong rồi không? | YES → P3 |
| Entry chỉ là ghi chú nháp không confirm? | YES → P4 |

---

## Báo Cáo Chuẩn (Sau Mỗi Lần Dọn)

```
=== MEMORY EVICTION REPORT ===
Date: {date}
Run by: Nhiên Janitor

Agents cleaned: {list}
P4 entries deleted: {count}
P3 entries archived to agents/archive/: {count}
PEN entries consolidated (≥3 same type): {count}
Total tokens saved (est.): ~{N}

Files still oversized (>500 tokens): {list nếu có}
Recommendation: {nếu cần action thêm}
==============================
```
