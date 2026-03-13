# Architecture Diagrammer (`/arch`)
> Agent: Phúc SA | Trigger: when architecture documentation needed, system overview requested, or after major structural changes

Scan codebase and auto-generate a comprehensive D2 architecture diagram.

## Boot

Read for context:
- `SuperAgent/agents/BRAIN.md` — Rule 0
- `SuperAgent/agents/arch/phuc-sa-techlead.md` — L2 Cache

Read on-demand (when generating D2):
- `SuperAgent/.agents/skills/arch-diagram/references/d2-style-guide.md` — rendering best practices, connection styles, CSS animations
- `SuperAgent/.agents/skills/arch-diagram/references/icons.d2` — icon URL catalog (browse for relevant tech icons)

## Process

### 1. Scan Codebase (parallel)

**Database layer:**
- Read `prisma/schema.prisma` — all models, relations, indexes
- Group by domain (core, iteration, tracking, cache, tracing, chunking)

**API layer:**
- Glob `src/app/api/**/route.ts` — all routes with HTTP methods
- Note auth requirements, request/response patterns

**Engine layer:**
- `src/lib/engine/orchestrator.ts` — main coordination flow
- `src/lib/engine/types.ts` — SSE event types
- `src/lib/engine/config.ts` — models, token limits, external services
- `src/lib/engine/phases/` — phase files and data flow
- `src/lib/engine/agents/` — agent initialization, soul generation
- `src/lib/engine/llm.ts` — LLM wrapper, caching, deChineseify
- `src/lib/engine/registry.ts` — SSE registry pattern

**Frontend layer:**
- `src/app/workspace/` — pages and hooks
- `src/components/workspace/` — workspace components
- `src/hooks/workspace/` — custom hooks (SSE, export, etc.)
- State persistence patterns (LocalStorage, etc.)

**Auth & Security:**
- `src/lib/utils/encryption.ts` — encryption pattern
- NextAuth config

### 2. Generate D2

Write `docs/architecture.d2` with layers:
1. Client (Frontend) — pages, components, hooks, local storage
2. API Routes — grouped by domain
3. SSE/Streaming — registry, event types
4. Engine Pipeline — orchestrator, phases, iteration loop
5. LLM Layer — wrapper, cache, external API
6. Database — all Prisma models grouped by domain
7. Auth & Security — NextAuth, encryption
8. External Services

**Layout — optimized for 4K screens and web embedding:**
- Use `direction: down` as primary direction — vertical layouts embed well in web pages and scroll naturally. Only use `direction: right` inside small sub-containers where horizontal flow reads better (e.g., iteration loop: improve → critique → synthesize).
- Target max rendered width ~3500px. When the diagram exceeds this, prefer taller over wider — height scrolls, width doesn't embed.
- Collapse minor nodes into parent containers. For example, list API routes as text labels inside one "API Routes" box rather than giving each route its own node with connections.
- Use `style.font-size: 13` for leaf nodes to keep compact.
- Max 3 nesting levels. Flatten where possible.
- Place the heaviest containers (Database, Engine) in the center column to minimize crossing lines.

**D2 Style** (see `references/d2-style-guide.md` for full details):
- **No `style.fill`** — let D2 theme handle fills for light/dark compatibility. Only set `style.stroke`, `style.stroke-width`, `shape`.
- **Icons** — add both `class:` and `icon:` URL to technology nodes (see `references/icons.d2`). Use `--bundle` flag when rendering to embed icons as data URIs.
- Nested containers for grouping (e.g., `engine.iteration.improve`)
- Quote strings with special chars: `"GET /api/sessions/{id}"`
- `shape: cylinder` for databases/caches, `shape: diamond` for decisions
- **Connection differentiation**: solid blue = sync API, dashed purple = async, green = data flow, red diamond-head = write ops (see style guide)
- `style.stroke-dash: 5` for optional/async connections
- Show iteration loop clearly (improve → critique → synthesize → back)
- Label connections with data flow descriptions
- Include ALL Prisma models

**Easy to miss:**
- LLM Cache flow (check → miss → API → save)
- Process tracing (TimelineEvent, ProcessEvent)
- SSE event types list
- LocalStorage persistence
- Chinese character cleanup (deChineseify)
- Chunking/parallel processing
- Human feedback loop
- Fire-and-forget DB writes

### 3. Render

Detect D2 binary location and render with `--bundle` (embeds icons as data URIs):
```bash
# Try common locations
D2=$(command -v d2 || echo "/c/Program Files/D2/d2.exe")

# Dark theme (primary) — theme 200 = Dark Mauve
"$D2" --bundle docs/architecture.d2 docs/architecture-dark.svg --theme 200 --layout elk --pad 40

# Light theme — theme 0 = Neutral Default
"$D2" --bundle docs/architecture.d2 docs/architecture-light.svg --theme 0 --layout elk --pad 40

# PNG export (for README embeds)
"$D2" --bundle docs/architecture.d2 docs/architecture.png --theme 200 --layout elk --pad 40
```

If ELK fails, fallback to `--layout dagre`.

If compilation fails, fix syntax and retry (max 3 attempts). Common issues:
- Unquoted brackets `[]` → wrap in quotes
- Duplicate node IDs → make unique
- Missing closing braces
- See `references/d2-style-guide.md` → "Common Errors & Recovery" for full table

### 3b. Enhance SVG (optional)

Inject CSS animations for traffic flow visualization. See `references/d2-style-guide.md` → "CSS Animations" section. This adds:
- Animated dashed lines on connections (data traffic flow)
- Subtle opacity pulse on database/cache shapes
- Accessibility: respects `prefers-reduced-motion`
- Text protection: animations never affect labels

### 4. Open & Report

Open SVG in browser. Report:
- Layers/components mapped
- New components since last diagram
- File paths to outputs

## Rules

- **Comprehensive** — every Prisma model, API route, engine component
- **Data flow** — label connections with what moves between components
- **Maintainable** — clear node IDs for easy future updates
- **Dark theme** — consistent aesthetic
- Token conservation (Rule 0): scan efficiently, headers/exports suffice for large files
