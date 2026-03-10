# Pipeline 0: Nghiên Cứu Chuyên Sâu (Research P0.5)

4 research agents chạy song song → gom SUMMARY → handoff cho Pipeline 1.

> **⚡ L2 CACHE PRE-LOAD:**
> - `Cừa Feature-R` → `agents/research/cua-feature-r.md`
> - `Hiếu Arch-R` → `agents/research/hieu-arch-r.md`
> - `Nghĩa Stack-R` → `agents/research/nghia-stack-r.md`
> - `Đôn Synth` → `agents/research/don-synth.md`

## Input
- Kích hoạt bởi MoE Router khi: Domain mới/phức tạp (Blockchain, GenAI, EDI, IoT), hoặc Dũng PM gắn cờ `[RESEARCH_REQUIRED]` trong CONTEXT.md ban đầu.
- Luôn chạy TRƯỚC Pipeline 1.

## Output (Exact Filenames)

| File | Tạo bởi | Mô tả |
|------|---------|-------|
| `docs/RESEARCH/FEATURE_LANDSCAPE.md` | Cừa Feature-R | Tính năng tương đồng trên thị trường, gap analysis |
| `docs/RESEARCH/ARCH_PATTERNS.md` | Hiếu Arch-R | Kiến trúc phù hợp cho domain, anti-patterns cần tránh |
| `docs/RESEARCH/STACK_EVALUATION.md` | Nghĩa Stack-R | Đánh giá thư viện/tool, rủi ro dependency |
| `docs/RESEARCH/PITFALLS.md` | Nghĩa Stack-R + Cừa | Known pitfalls, security traps, performance traps |
| `docs/RESEARCH/SUMMARY.md` | Đôn Synth | Tổng hợp 4 file trên thành khuyến nghị actionable |

## Quy Trình (Nash Triad)

### THESIS: Trinh Sát Song Song
- **Agent:** Cừa Feature-R (Lead), Hiếu Arch-R, Nghĩa Stack-R
- **Hành động:**
  - Cừa: Scan competitive landscape, liệt kê feature patterns thực tế trong ngành.
  - Hiếu: Nghiên cứu architectural patterns phù hợp, tìm case studies đã proven.
  - Nghĩa: Đánh giá tech stack options, tìm pitfalls đã được ghi nhận (`ram/ngu-pitfall-r/`).
  - 3 agents chạy SONG SONG, không block nhau.

### ANTI-THESIS: Kiểm Chứng Chéo
- **Agent:** Cừa Feature-R (kiểm tra kết quả Nghĩa), Hiếu Arch-R (kiểm tra kết quả Cừa)
- **Hành động:**
  - Mỗi agent đọc output của agent khác, flag điểm mâu thuẫn hoặc thiếu bằng chứng.
  - Yêu cầu source/reference cho mọi khẳng định quan trọng.

### SYNTHESIS: Tổng Hợp Actionable
- **Agent:** Đôn Synth
- **Hành động:**
  - Đọc toàn bộ 4 file RESEARCH.
  - Gom mâu thuẫn, chốt khuyến nghị có evidence.
  - Viết `SUMMARY.md`: top-5 risks + top-5 recommendations + go/no-go cho từng approach.
  - Scoring theo `system/SCORING_RULES.md`.

## Gate Chain

| Gate | Script | Check | ON FAIL |
|------|--------|-------|---------|
| 0.5 | `gates/gate0_5.sh` | `SUMMARY.md` tồn tại, ≥20 lines, có section "Risks" và "Recommendations" | Đôn Synth phải bổ sung thiếu sót |

## Exit
- Gate 0.5 PASS → báo cáo cho Dũng PM → route Pipeline 1 (Requirements).
- `SUMMARY.md` được đính kèm vào CONTEXT.md của Pipeline 1 như phụ lục bắt buộc.
