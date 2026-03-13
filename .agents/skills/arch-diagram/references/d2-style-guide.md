# D2 Style Guide & Best Practices

Adapted from [heathdutton/claude-d2-diagrams](https://github.com/heathdutton/claude-d2-diagrams) (MIT).

Read this when generating D2 source files for architecture diagrams.

---

## Theme-Agnostic Styling

**Critical rule:** Do NOT set explicit `style.fill` on classes or nodes. D2's theme system handles fill colors for light and dark modes. Setting explicit fills breaks dark mode.

Only set:
- `style.stroke` — border/outline color (works across themes)
- `style.stroke-width` — line thickness
- `shape` — node shape (cylinder, queue, cloud, hexagon, etc.)
- `style.border-radius` — rounded corners

## Icons

Every node representing a technology should have BOTH:
1. `class:` — for styling (stroke color, shape)
2. `icon:` — for the visual icon (direct URL from `https://icons.terrastruct.com/`)

```d2
# CORRECT — icon appears in bundled SVG:
db: SQLite Database {
  class: sqlite
  shape: cylinder
  icon: https://icons.terrastruct.com/dev%2Fsqlite.svg
}

# WRONG — no icon:
db: SQLite Database {class: sqlite}
```

See `references/icons.d2` for the full icon URL catalog.

**Bundling:** Always render with `--bundle` to embed icons as data URIs. This avoids CORS issues on GitHub Pages or other hosts.

## Connection Styles

Differentiate connection types visually:

```d2
# Synchronous API call (solid, blue)
a -> b: "REST/HTTP" {
  style.stroke: "#1976D2"
  style.stroke-width: 2
}

# Asynchronous / fire-and-forget (dashed, purple)
a -> b: "async event" {
  style.stroke: "#7B1FA2"
  style.stroke-width: 2
  style.stroke-dash: 5
}

# Data flow (green)
a -> b: "data" {
  style.stroke: "#388E3C"
  style.stroke-width: 2
}

# Read operation (orange, arrow head)
a -> b: "read" {
  style.stroke: "#F57C00"
}

# Write operation (red, diamond head)
a -> b: "write" {
  style.stroke: "#D32F2F"
  target-arrowhead: {
    shape: diamond
    style.filled: true
  }
}

# Optional / monitoring (thin dashed gray)
a -> b: "traces" {
  style.stroke-dash: 3
  style.opacity: 0.6
}
```

## Rendering Commands

### Primary: dark theme, ELK layout, bundled icons

```bash
D2=$(command -v d2 || echo "/c/Program Files/D2/d2.exe")

# Dark theme (theme 200 = Dark Mauve)
"$D2" --bundle docs/architecture.d2 docs/architecture-dark.svg --theme 200 --layout elk --pad 40

# Light theme (theme 0 = Neutral Default)
"$D2" --bundle docs/architecture.d2 docs/architecture-light.svg --theme 0 --layout elk --pad 40

# PNG export (for docs/README embeds)
"$D2" --bundle docs/architecture.d2 docs/architecture.png --theme 200 --layout elk --pad 40
```

### Fallback: dagre layout (if ELK fails on complex diagrams)

```bash
"$D2" --bundle docs/architecture.d2 docs/architecture-dark.svg --theme 200 --layout dagre --pad 40
```

## Layout Optimization

### Minimizing Connection Bends

1. **Define connected nodes near each other** in source — layout engine uses source order as hint
2. **Use `direction: down`** at diagram level, `direction: right` only inside small sub-containers
3. **Group related nodes** in containers — shorter connection paths
4. **Order nodes by data flow** — define in the order data flows through them

### Container Best Practices

```d2
# Use grid-columns for horizontal arrangements inside containers
api: API Routes {
  grid-columns: 3
  sessions: "/api/sessions"
  process: "/api/process"
  auth: "/api/auth"
}

# Use nested containers for logical grouping (max 3 levels)
engine: Forge Engine {
  orchestrator: Orchestrator
  iteration: Iteration Loop {
    direction: right
    improve: Improve Phase
    critique: Critique Phase
    synthesize: Synthesize Phase
    improve -> critique -> synthesize
    synthesize -> improve: "next iteration" {style.stroke-dash: 5}
  }
}
```

## CSS Animations (Optional Enhancement)

After rendering SVG, inject this CSS after the `<svg>` tag for animated traffic flow:

```css
/* Animated dashes on connection paths */
path[marker-end] {
  stroke-dasharray: 8 4;
  animation: traffic-flow 1s linear infinite;
}
@keyframes traffic-flow {
  to { stroke-dashoffset: -12; }
}

/* Subtle pulse on database shapes */
.shape-cylinder > path:first-of-type {
  animation: subtle-pulse 3s ease-in-out infinite;
}
@keyframes subtle-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

/* CRITICAL: Protect text from animations */
text, tspan, textPath {
  animation: none !important;
  filter: none !important;
  opacity: 1 !important;
}

/* Accessibility: respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
  }
}
```

To inject: `sed -i 's/<svg/<svg>\n<style>...CSS HERE...<\/style>\n<svg/' docs/architecture-dark.svg`

Or use a script: save CSS to `docs/animations.css`, then:
```bash
CSS=$(cat docs/animations.css)
sed -i "s|<svg |<svg >\n<defs><style>${CSS}</style></defs>\n<svg |" docs/architecture-dark.svg
```

## Common Errors & Recovery

| Error | Cause | Fix |
|-------|-------|-----|
| `unexpected text after unquoted string` | Special chars `[]{}` in labels | Wrap in quotes: `"GET /api/sessions/{id}"` |
| `unexpected token` | Missing quotes around special chars | Wrap labels in quotes |
| `undefined shape` | Typo in class reference | Check class name spelling |
| `cycle detected` | Circular container nesting | Flatten or restructure |
| `elk failed` | Complex layout exceeds ELK limits | Switch to `--layout dagre` |
| Duplicate node IDs | Same ID used twice | Make unique: `db_main`, `db_cache` |

Recovery process: capture error → identify line → fix → re-render. Max 3 retries, then fallback to dagre.
