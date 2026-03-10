# LEDGER.md — {module_name}

> **Ghi bởi:** Dũng PM (Synthesis role) duy nhất.
> **Đọc bởi:** Dũng PM duy nhất. Agent tự đọc = P0 penalty (±30đ).
> **Vị trí:** `artifacts/{module}/LEDGER.md`

---

## Sprint Summary

| Agent | Total + | Total - | Net |
|-------|---------|---------|-----|
| _(điền sau sprint)_ | | | |

---

## Transaction Log

### {YYYY-MM-DD} | {gate_name}

```
EVENT:           {tên sự kiện — xem bảng Error Mapping trong SCORING_RULES.md}
SEVERITY:        P{0-4}
AGENT_PENALIZED: {agent_name}   POINTS: -{N}
AGENT_REWARDED:  {agent_name}   POINTS: +{N}
EVIDENCE:        {commit_hash | gate_log_path | file:line_number}
VERDICT_BY:      Dũng PM
```

---

## PEN Entry Protocol (Sau Khi Ghi LEDGER)

Sau mỗi giao dịch P0/P1, Dũng PM trigger Nhiên Janitor:
1. Nhiên đọc event type từ LEDGER
2. Nhiên thêm PEN entry vào L2 Cache của agent bị phạt
3. Format PEN (CHỈ nguyên tắc, KHÔNG điểm số):

```
PEN [{severity}] {ERROR_CODE}: {Nguyên tắc phòng tránh ngắn gọn.}
```

Ví dụ:
```
PEN [P2] CONTRACT_DRIFT: Validate response shape với CONTRACT_DRAFT trước khi submit PR.
PEN [P0] COLLUSION: Không self-approve. Luôn cần Anti-Thesis độc lập review.
```

---

## Notes

- Zero-sum enforced: mỗi `-N` có `+N` tương ứng trong cùng transaction
- Nếu không có Evidence → giao dịch vô hiệu, không ghi
- Cuối module: archive LEDGER cùng module khi move sang `Done/`
