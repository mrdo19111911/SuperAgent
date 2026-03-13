# Architecture Diagrammer (`/arch`)
> Agent: Phúc SA | Trigger: when architecture documentation needed, system overview requested, or after major structural changes

Scan codebase and auto-generate a comprehensive D2 architecture diagram.

## Boot

Read for context:
- `SuperAgent/agents/BRAIN.md` — Rule 0
- `SuperAgent/agents/arch/phuc-sa-techlead.md` — L2 Cache

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

**D2 Style:**
- Dark theme colors (dark backgrounds, bright accents per layer)
- Nested containers for grouping (e.g., `engine.iteration.improve`)
- Quote strings with special chars: `"GET /api/sessions/{id}"`
- `shape: cylinder` for databases/caches, `shape: diamond` for decisions
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

Detect D2 binary location and render:
```bash
# Try common locations
D2=$(command -v d2 || echo "/c/Program Files/D2/d2.exe")
"$D2" docs/architecture.d2 docs/architecture.svg --theme 200 --layout elk --pad 40
"$D2" docs/architecture.d2 docs/architecture.png --theme 200 --layout elk --pad 40
```

If compilation fails, fix syntax and retry. Common issues:
- Unquoted brackets `[]` → wrap in quotes
- Duplicate node IDs → make unique
- Missing closing braces

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
