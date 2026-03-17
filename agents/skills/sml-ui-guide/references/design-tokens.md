# Design Tokens — Smartlog
All visual=tokens. NO hardcoded vals.

## Status Colors (6 Core)
**TS:** draft/planned/active/complete/error/pending = light+dark hex + label
**CSS:** --status-{name}, --status-{name}-bg (10% opacity), --color-{semantic}, --text-{primary/sec/tert/on-dark}, --surface-{primary/sec/tert/elevated}, --border-{light/med/focus}
**Dark:** [data-theme="dark"] all vars

| Token | OMS | WMS | TMS | Mkt | Icon |
|-------|-----|-----|-----|-----|------|
| draft | Order mới | Inbound chưa | Chưa plan | Draft | circle-dashed |
| planned | Allocated | Put-away | Planned | Confirmed | calendar-check |
| active | Processing | Pick/Pack | Transit | In progress | loader |
| complete | Closed | Out done | Delivered | Complete | check-circle |
| error | Val fail | Exception | Delayed | Dispute | alert-triangle |
| pending | Await approve | Pending QC | Wait carrier | Pending | clock |

## A11y
**Rule:** NEVER color alone. StatusBadge = icon+color+label+aria-label

## Typography

| Cat | Val | Use |
|-----|-----|-----|
| Fonts | Inter (primary), JetBrains Mono (mono) | - |
| Sizes | xs=11, sm=13, base=14 (B2B body), md=16, lg=20, xl=24, 2xl=32 (KPI) | Body=14 NOT 16, table=13, min 11, max 7 cols |
| Weights | 400/500/600/700 | - |
| Leading | 1.25/1.5/1.75 | - |

## Spacing

| Scale | px | Component | Val |
|-------|----|-----------|----|
| 1-16 | 4,8,12,16,20,24,32,40,48,64 | card/section/form/table | 20/32/16/12 |
| - | - | sidebar/topbar | 256/56 |
| Radius | sm/md/lg/full | 4/8/12/9999 | - |

## Touch
**Min 44×44px** (Fitts's Law). Icon btn: 36px vis, 44px hit via ::before

## Dark Mode
**Pref:** 1) localStorage→2) system→3) time (18:00-6:00)
**Rules:** WCAG AA, dark tiles, dark charts, test BOTH

## Lint
Ban hex (no-restricted-syntax), ban inline style (react/forbid-component-props)
