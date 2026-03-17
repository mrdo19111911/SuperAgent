# UX Audit Checklist (Compressed for Lan Dev-FE)

WCAG AA compliance audit for Visual Hierarchy, Visual Style, and Accessibility. Supports P3: Prevent missing aria-labels.

---

## Core Pillar 1: Visual Hierarchy (MANDATORY)

### Heading Structure

```
✅ GOOD
H1: Page Title (48px, semibold)
H2: Section (32px, semibold)
H3: Subsection (24px, medium)
Body: Content (16px, regular)

❌ BAD
H1: Page Title (32px)
H2: Section (32px)  ← Same size as H1
```

### CTA (Call-to-Action) Prominence

```
✅ GOOD
Primary CTA: "Confirm Order" (blue button, 48px height, top-right)
Secondary CTA: "Cancel" (gray text link, smaller)

❌ BAD
Both CTAs same visual weight (both blue buttons, same size)
```

### Whitespace

```
✅ GOOD: 8px grid (8, 16, 24, 32, 48px)
❌ BAD: Inconsistent spacing (13px, 19px, 7px)
```

**Checklist:**
```
[ ] H1 > H2 > H3 > Body (clear size difference ≥8px)
[ ] Primary CTA stands out (color + size + position)
[ ] Whitespace follows 8px grid
```

---

## Core Pillar 2: Visual Style (MANDATORY)

### Spacing System

```
✅ GOOD: 4, 8, 12, 16, 24, 32, 48, 64px
❌ BAD: margin: 13px, padding: 7px (not on scale)
```

### Color Palette

```
✅ GOOD: Defined palette
Primary: #0066CC (brand blue)
Secondary: #6C757D (gray)
Success: #28A745 (green)
Danger: #DC3545 (red)

❌ BAD: Ad-hoc colors
#0067CD ← Off by 1 from brand blue
```

### Typography System

```
✅ GOOD
Font family: Inter (headings + body)
Sizes: 12, 14, 16, 18, 24, 32, 48px
Weights: 400 (regular), 500 (medium), 600 (semibold)

❌ BAD
3 different fonts (Arial, Helvetica, Roboto)
Sizes: 13px, 15px, 17px ← Not on scale
```

**Checklist:**
```
[ ] All spacing from 8px grid
[ ] All colors from palette
[ ] Typography uses type scale
[ ] Font weights standard (400, 500, 600, 700)
```

---

## Core Pillar 3: Accessibility (MANDATORY - P3 Prevention)

### Color Contrast (WCAG AA)

```
✅ GOOD: Contrast ratio ≥ 4.5:1
Black #000 on white #FFF = 21:1 ✅
Dark gray #333 on white = 12.6:1 ✅
Blue #0066CC on white = 5.1:1 ✅

❌ BAD: Low contrast
Light gray #AAA on white = 2.3:1 ❌ (fails WCAG)
```

**Tool:** https://webaim.org/resources/contrastchecker/

### Keyboard Navigation

```
✅ GOOD
- Tab order follows visual flow (top → bottom, left → right)
- Focus visible (blue outline on focused element)
- All interactive elements reachable by Tab
- Escape closes modal

❌ BAD
- Tab jumps randomly (poor tab order)
- No focus indicator (user lost)
```

### Touch Targets

```
✅ GOOD
- Buttons ≥ 44px height
- Touch areas ≥ 44x44px (including padding)
- 8px spacing between touch targets

❌ BAD
- Button 32px height ← Too small for mobile
- Icons 16x16px without padding ← Hard to tap
```

### Screen Reader Support (P3: -10 points if missing!)

```html
<!-- ✅ GOOD - Semantic HTML + ARIA -->
<button aria-label="Delete order #12345">
  <TrashIcon />
</button>

<img src="logo.png" alt="STMAI Logistics Platform" />

<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<!-- ❌ BAD - Missing labels (P3 VIOLATION!) -->
<button>
  <TrashIcon /> <!-- Screen reader: "button" (no context) -->
</button>

<img src="logo.png" /> <!-- Screen reader: "image" (no description) -->

<div onclick="navigate()">Home</div> <!-- Not semantic, not keyboard accessible -->
```

**Checklist:**
```
[ ] Color contrast ≥ 4.5:1 (text on background)
[ ] Keyboard navigable (Tab order logical)
[ ] Focus indicators visible (outline or ring)
[ ] Touch targets ≥ 44x44px
[ ] Icon-only buttons have aria-label (P3!)
[ ] Images have alt text
[ ] Semantic HTML (<button>, <nav>, <main>)
```

---

## Pre-Implementation Checklist

```
Before sending to FE Dev:

Core Pillars (MANDATORY):
[ ] Visual Hierarchy: H1 > H2 > H3, CTA prominent, 8px grid
[ ] Visual Style: Spacing from grid, colors from palette, typography from scale
[ ] Accessibility: Contrast ≥4.5:1, keyboard nav, touch ≥44px, aria-labels

Stitch AI Prompt:
[ ] Component states documented (hover, disabled, error, focus)
[ ] Spacing values specified (padding, margin, gap)
[ ] Color tokens specified (#0066CC, not "blue")
[ ] Typography specified (font-family, size, weight)
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Low contrast text | Fails WCAG, unreadable | Use contrast checker, require ≥4.5:1 |
| Icon-only button no label | P3: -10 points, screen reader cannot announce | Add aria-label |
| Magic spacing (13px, 7px) | Inconsistent, hard to maintain | Use 8px grid (8, 16, 24, 32) |
| Generic error messages | User doesn't know how to fix | "Email must contain @" |

---

## Audit Output Template

```markdown
### ✅ PASS - Visual Hierarchy
- [x] H1 > H2 > H3 clear hierarchy
- [x] Primary CTA prominent (blue, top-right)

### ❌ FAIL - Accessibility (P3 VIOLATIONS)
- [ ] Color contrast: Gray #999 on white = 2.8:1 (fails WCAG AA)
  - **Fix:** Use #666 for 5.7:1 ratio
- [ ] Icon-only delete button missing aria-label
  - **Fix:** Add aria-label="Delete order"
- [x] Touch targets ≥ 44px

**Required Fixes (P0):**
1. Increase text contrast: #999 → #666
2. Add aria-label to delete button (P3!)
```
