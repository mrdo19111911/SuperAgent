# A11y & Perf

## WCAG 2.1 AA (Mandatory)

| Requirement | Rule | Test | Tool |
|-------------|------|------|------|
| Contrast | Text <18px ≥4.5:1, ≥18px/bold ≥3:1, UI ≥3:1 | Fail: #999/FFF=2.85, Pass: #5F6368/FFF=5.74 | DevTools, axe-core |
| Color | NEVER color alone | Icon+Text+aria-label: [⚠][red]"Lỗi" | Manual |
| Keyboard | Tab, Enter/Space, Arrows, Esc, Cmd+K | :focus-visible 2px outline, skip link | Manual |
| ARIA | Dynamic content, icon btns, tables | aria-live="polite", aria-label, role="grid", scope="col" | axe-core |

## Perf Budget (Non-Negotiable)

| Metric | Target | Tool |
|--------|--------|------|
| FCP | <1.5s | Lighthouse |
| LCP | <2.5s | Lighthouse |
| TTI | <3.0s | Lighthouse |
| CLS | <0.1 | Lighthouse |
| FID | <100ms | Web Vitals |
| API P95 | <500ms | Server |
| Bundle gzip | <300KB | Webpack |

## Response Times

| Type | Max | UX | Examples |
|------|-----|----|----|
| Simple | 200ms | None | Click, toggle, dropdown |
| Page | 2s | Skeleton @200ms | Nav, table, detail |
| Report | 10s | Progress+cancel | Export, forecast |
| Bulk | 60s | Background+notify | Bulk ops, import |

**Optimize:** useSkeletonDelay(200ms), layout match, lazy chunks, prefetch routes

## Dark Mode Checklist

- [ ] Contrast 4.5:1/3:1 (both modes)
- [ ] Dark tokens (not same hex)
- [ ] Charts dark-safe
- [ ] Map dark tileset
- [ ] Images visible
- [ ] Skeleton dark surfaces
- [ ] Borders dark tokens
- [ ] Shadows lighter
- [ ] No hex in CSS

**Test:** DevTools prefers-color-scheme, axe-core, Playwright visual

## Auto Compliance

- No hex in CSS
- All img have alt
- All interactive ≥44px
- Page <2s load
- axe wcag2a/wcag2aa pass

**CI/CD:** Cypress + axe-core gate before merge
