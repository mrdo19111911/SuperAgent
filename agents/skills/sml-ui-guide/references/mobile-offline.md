# Mobile & Offline — Smartlog

67% WH ops = tablet/handheld (Zebra 2023)

## Touch

**Targets:** 44×44px min, 8px gap, mobile btn 48×16px font
**Scanner:** HW|camera|auto, QR/barcode/datamatrix, vibrate+audio+flash, batch, error 44px

## Offline-First

**Arch:** App↔API↔DB (online), App↔IndexedDB→Queue (offline), Queue→API batch (reconnect)
**Optimistic:** Local update+toast → queue PATCH → flush online | persist offline
**Conflict Resolution:**

| Type | Strategy | Why |
|------|----------|-----|
| Metadata | Server wins | Latest all users |
| User input | Ask user | Intentional |
| System | Server wins | System of record |

**Modal:** title, localValue, serverValue, lastModifiedBy, [Giữ tôi|Dùng server|Chi tiết]
**Indicator:** Online=green dot, Offline=yellow+count, reconnect=auto+toast
**Cache Strategy:**

| Tier | Items | Limits |
|------|-------|--------|
| Always | profile, tasks, catalog, zones | IndexedDB ~50MB |
| On-demand | shipment, orders | Warn 80%, purge oldest |
| Never | analytics, audit | Security/size |

## Responsive

**BP:** 480/768/1024/1440

| Range | Sidebar | Form | Other |
|-------|---------|------|-------|
| ≤768 | Hide→bottom nav | 1col | Table scroll-x, map 50vh |
| 769-1024 | 64px icons | 2col | - |
| ≥1025 | 256px | 3col | - |
