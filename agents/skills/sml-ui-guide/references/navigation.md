# Navigation — Smartlog

## Sidebar: Workflow-First

**Rule:** Workflow stages (Order→Plan→Exec→Track→Close), NOT DB entities

| System | Stages |
|--------|--------|
| TMS | Lập KH (Tạo/Board/Optimize) → Thực hiện (Giao/Dispatch) → Theo dõi (Transit/Exception/Delivered) |
| OMS | Tiếp nhận (Mới/Validate/Import) → Phân bổ (Kho/VT/Split) → Release (WMS/TMS/Pending) → Theo dõi (Exception/SLA/Done) |
| WMS | Inbound (ASN/Receiving/QC) → Kho (Put-away/Map/Count) → Outbound (Wave/Pick/Pack/Dock) → Exception (Stock/Damage/Returns) |

## Breadcrumb: Cross-System

**Rule:** Full drill-down, never lose context, platform icon, max 5 → collapse "..."
**Interface:** BreadcrumbItem = label/path/platform/icon
**Ex:** Tower → Exception #4821 → Shipment SH-2024-8834 → Allocation WA-9912

## Cmd+K

**Rule:** EVERY screen, Cmd+K (Ctrl+K Win)
**Types:** navigation|entity|action|recent
**Interface:** Command = type/label/desc/icon/action/keywords[]/platform
**Behavior:** Fuzzy, VN+EN, recent first, cross-platform, top 5, keyboard nav

## Global Search

**Rule:** One bar, entire ecosystem
**Interface:** SearchResult = entityType/entityId/displayName/platform/status/path/lastUpdated
**Supports:** ORD-/SH-/TEMU/VN...TH/names/SKU

## Drill-Down, Not Drill-Away

**Rule:** Click → drawer/panel/modal, NEVER nav away
**Methods:** openSidePanel(<Detail/>), openModal(<Detail/>)
**Exception:** Cmd+Click = new tab
