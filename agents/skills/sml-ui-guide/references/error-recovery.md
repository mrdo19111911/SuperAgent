# Error Recovery — Smartlog

## 3 Types

| Type | Strategy | UX | Ex | Interface |
|------|----------|----|-----|-----------|
| User | Inline val+suggest | Red border+msg BELOW, --status-error+⚠, preserve input | "Số lượng >0" | ValidationRule: field/validate/message/suggestion |
| System | Auto-save+retry | Toast+retry btn, icon=wifi-off, NEVER auto-dismiss | "Mất kết nối. Lưu nháp. Thử lại?" | 30s interval, >3 fields, local+server, sync reconnect |
| Business | Root cause+solution | Modal+explain, icon=info-circle (blue), helpLink | "Không xóa: Đã xuất kho" → [Hủy đơn, Hủy ship] | title/rootCause/suggestedActions[{label,desc,onClick,variant}] |

**Validation Ex:** quantity>0, phone /^(\+84|0)\d{9,10}$/, weight≤30K kg

## Destructive Action Rule

**Golden:** Undo OR Soft Del (30d) REQUIRED

| Action | Confirm | Impl | Ex |
|--------|---------|------|-----|
| Reversible | None | - | Edit, status |
| Soft (1) | Toast+Undo 10s | PATCH status=del+delAt, cron purge 30d | Delete 1 |
| Soft (bulk) | Preview+confirm | Show "Sẽ xóa 50", confirm modal | Delete 50 |
| Hard | Type name | Final warn, type confirm | Purge, close account |

## Form Auto-Save
**useAutoSave:** Local immediate, debounce server 30s, restore draft on mount, show "Lưu lúc HH:mm"
