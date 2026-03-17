# AI UX

## Core Principle: System-Suggest, Human-Approve

AI analyzes → Proposes → User Approve/Adjust/Reject (NEVER auto-exec high risk)

## Risk Matrix (Classify Before Dev)

| Risk | AI Action | User Action | Undo | Examples |
|------|-----------|-------------|------|----------|
| Low | Auto-apply | Can undo | 30s | Auto-fill, address standardize |
| Med | Proposes | Click Accept | 5min | Route opt, carrier match |
| High | Warns only | Manual | N/A | Flight change, contract mod |

**Config:** autoApply (low), requireConfirm (med+high), requireMFA (high finance), explainability (ALWAYS)

## 7 Capabilities

| # | Capability | Risk | Platform | UX Pattern |
|---|------------|------|----------|------------|
| 1 | ETA Prediction | Low | TMS/OMS | Inline + confidence% |
| 2 | Route Optimization | Med | TMS | Card + map preview |
| 3 | Carrier Matching | Med | TMS/Marketplace | Table + AI rank |
| 4 | Demand Forecast | Med | SCP | Chart + confidence band |
| 5 | Exception Detection | Low-Med | Tower | Warning badge |
| 6 | Auto Planning | Med-High | TMS/WMS | Kanban proposal |
| 7 | Chat Assistant | Low | All | Panel + context |

## XAI (Mandatory)

EVERY output MUST have "Tại sao?" button with:

| Element | Display |
|---------|---------|
| Summary | 1-line reason |
| Factors | factor/weight/value/direction (bar chart) |
| Data Source | "90 days" |
| Confidence | 0-100% progress bar |
| Alternatives | Tradeoff table |

**Confidence Thresholds:**

| Range | Visual | Action |
|-------|--------|--------|
| ≥85% | Green | Normal execution |
| 70-84% | Yellow | Warn "Trung bình" |
| <70% | Red | "Cần xác minh" + manual review |
| N/A | Gray | Disable auto (even low risk) |

## Maturity Levels (Sequential, DO NOT skip)

| Level | Capabilities | Risk/Impact/Change | Prerequisites |
|-------|-------------|-------------------|---------------|
| 1. Automation | Auto-fill, cleanup | Low/Low/Med | - |
| 2. Prediction | ETA, forecast, exception | Low-Med/Med/High | - |
| 3. Recommendation | Route, carrier, inventory | Med/High/VHigh | - |
| 4. Autonomous | Full auto-plan | High/VHigh/Transform | Levels 1-3 stable + 6mo prod |

## Chat Assistant

| Feature | Implementation |
|---------|----------------|
| Context | platform/screen/entityId/userRole |
| Suggestions | Quick questions from context |
| Location | Right panel |
| Actions | Trigger ops (confirm med/high) |
| History | Session-level |
| Label | "AI đã tạo" watermark |
