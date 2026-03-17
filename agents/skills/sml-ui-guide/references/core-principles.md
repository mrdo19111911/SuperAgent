# 8 Core Principles — Smartlog

| # | Principle | DO | DON'T | Metric |
|---|-----------|----|----|--------|
| 1 | Workflow-First Nav | Sidebar=stages (Order→Plan→Exec→Track→Close), seq groups | DB entities, alpha sort, tech terms | TMS: Lập KH→Thực hiện→Theo dõi |
| 2 | Exception-First Dash | Problems top, action btns, AI panel (70% exc+30% AI) | KPI only, "View all", hidden exc | Max 4 KPI cards |
| 3 | One-Screen Ops | <3 clicks core, drill-down panel, bulk ops | Multi-pg wizard, nav away, >5 clicks | Resolve exc≤3, create ship≤3, update≤2 |
| 4 | Visual-First | Color+icon+text ALWAYS, Kanban, map-center, timeline | Color only (8% colorblind), table-only | StatusBadge=[⚠][red]"Lỗi" |
| 5 | System-Suggest, Human-Approve | AI 3 actions (Approve/Adj/Reject), "Tại sao?" btn, risk label | Auto-exec high risk, hide reasoning, no adjust | See ai-ux.md |
| 6 | Progressive Complexity | Wk1-2 Essential, Wk3-8 Pro, Mo3+ Expert, HIDE above tier | Show all to new, disable+tooltip, no path | See onboarding.md |
| 7 | Cross-Platform Consistency | Shared lib TMS/WMS/OMS, same tokens, same patterns | Custom per platform, diff color meanings | See design-tokens.md |
| 8 | Error Recovery | Inline val (blur), auto-save 30s, undo OR soft del 30d | Browser confirm(), hard del, no auto-save | See error-recovery.md |
