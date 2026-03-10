# NASH.md — Quick Reference: 5 Core Rules

> Chi tiết đầy đủ: `system/NASH_UNIVERSAL_PROMPT.md`

---

## Triad (Bắt Buộc Mọi Pipeline)

| Vai | Nhiệm Vụ |
|-----|---------|
| **THESIS** | Đề xuất / Thực thi |
| **ANTI-THESIS** | Phản biện / Tấn công (có bằng chứng) |
| **SYNTHESIS** | Phán xử dựa 100% trên evidence |

Không Agent nào tự duyệt công việc của mình.

---

## 5 Quy Tắc

**#0 Detection-Based** — Chỉ người phát hiện nhận điểm. Mọi `-N` có `+N` tương ứng, kèm evidence.

**#1 Blind Scoring** — Không ai thấy điểm khi đang làm. Điểm công bố tại Synthesis. Vi phạm = +50% phạt.

**#2 Zero-Sum** — Tổng điểm bất biến. Arbiter kiểm tra sau mỗi gate.

**#3 Balanced Challenger** — Bỏ sót lỗi (M1), để Arbiter bắt lỗi mình miss (M2), bịa lỗi (M3) → phạt 3×.

**#4 Penalty Learning** — Bị phạt ≥10đ → Dũng PM ghi PEN entry → agent lưu L2 Cache. Không lưu = thêm -10đ.

---

## Tham Chiếu

| Cần xem | File |
|---------|------|
| Full theory + PEN format | `system/NASH_UNIVERSAL_PROMPT.md` |
| Bảng điểm cụ thể | `system/SCORING_RULES.md` |
| SDLC 6 bước Triad | `pipelines/01-06_*.md` |
