# Security & Privacy — Smartlog

## RBAC: Hide, Not Disable

**Rule:** No access = HIDDEN (not grayed)
**Correct:** {hasPermission() && <Button/>}, filter nav
**Wrong:** disabled button, tooltip on disabled

## Data Masking

| Field | Roles | Pattern |
|-------|-------|---------|
| pricing | admin, finance, sc_mgr | *** |
| customer_phone | admin, sales, coord | XXX****XXX |
| customer_email | admin, sales | XX***@ |
| driver_phone | admin, coord, dispatch | XXX****XXX |

## Session

**Timeout:** 30min inactivity, warn 25min "Phiên hết hạn 5min. Tiếp tục?" → reset|logout
**MFA:** bulk_delete, export_customer_data, change_pricing, modify_contract, admin_settings → OTP/biometric

## Audit Trail

**Log ALL mutations:** timestamp, userId, userName, action (create|update|delete|export|login), entityType, entityId, changes[{field, oldValue, newValue}], ipAddress, userAgent
**UI:** Panel on entity, show who/what/when/old→new, filter user/date/action, export CSV/Excel

## Privacy by Design

| Type | Required | Options | GDPR/PDPA |
|------|----------|---------|-----------|
| GPS | Driver app | while_using\|always, revoke | "Xuất dữ liệu" (JSON/CSV) |
| IoT | Optional | temp/humidity, revoke | "Xóa tài khoản" (30d) |
| Data | - | - | "Quản lý riêng tư" (settings) |

## URL Safety

**Rule:** Entity IDs only, NO sensitive data
**Correct:** /shipment/SH-2024-8834 (server checks RBAC)
**Wrong:** /shipment?cost=12500000&customer=Acme
