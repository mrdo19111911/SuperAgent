# UX Audit Checklist

Structured UX audit for Visual Hierarchy, Visual Style, and Accessibility.

---

## Pillar 1: Visual Hierarchy (MANDATORY)

**Heading Structure**

```
✅ GOOD - Clear hierarchy
H1: Page Title (48px, semibold)
H2: Section (32px, semibold)
H3: Subsection (24px, medium)
Body: Content (16px, regular)

❌ BAD - Flat hierarchy
H1: Page Title (32px)
H2: Section (32px) ← Same size as H1
H3: Subsection (28px) ← Barely smaller
Body: Content (14px)
```

**CTA (Call-to-Action) Prominence**

```
✅ GOOD
Primary CTA: High contrast, large, prominent placement
  - "Confirm Order" (blue button, top-right, 48px height)
Secondary CTA: Lower prominence
  - "Cancel" (gray text link, smaller)

❌ BAD
Primary and Secondary CTAs same visual weight
  - Both blue buttons, same size
  - User confused which action is recommended
```

**Whitespace**

```
✅ GOOD
- 24px margin between sections
- 16px padding inside cards
- 8px gap between list items
- Consistent rhythm (multiples of 8px)

❌ BAD
- Inconsistent spacing (13px, 19px, 7px)
- Cramped layout (4px padding in cards)
- No breathing room
```

**Checklist**

```
Visual Hierarchy:
[ ] H1 > H2 > H3 > Body (clear size difference ≥8px)
[ ] Primary CTA stands out (color + size + position)
[ ] Secondary actions less prominent (text link or ghost button)
[ ] Whitespace follows 8px grid (8, 16, 24, 32, 48px)
```

---

## Pillar 2: Visual Style (MANDATORY)

**Spacing System**

```
✅ GOOD - Consistent spacing
Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
All margins/padding use scale values

❌ BAD - Magic numbers
margin: 13px ← Not on scale
padding: 7px ← Arbitrary
gap: 19px ← Inconsistent
```

**Color Palette**

```
✅ GOOD - Defined palette
Primary: #0066CC (brand blue)
Secondary: #6C757D (gray)
Success: #28A745 (green)
Danger: #DC3545 (red)
Neutral: #F8F9FA, #E9ECEF (backgrounds)

All colors from palette, no ad-hoc colors

❌ BAD - Ad-hoc colors
#0067CD ← Off by 1 from brand blue
#6D757E ← Slightly different gray
#27A644 ← Close but not exact
```

**Typography System**

```
✅ GOOD - Type scale
Font family: Inter (headings + body)
Sizes: 12, 14, 16, 18, 24, 32, 48px
Weights: 400 (regular), 500 (medium), 600 (semibold)

❌ BAD - Inconsistent typography
3 different fonts (Arial, Helvetica, Roboto)
Sizes: 13px, 15px, 17px ← Not on scale
Weights: 350, 450, 550 ← Non-standard
```

**Checklist**

```
Visual Style:
[ ] All spacing from defined scale (8px grid)
[ ] All colors from palette (no #RRGGBB ad-hoc)
[ ] Typography uses type scale (no arbitrary sizes)
[ ] Font weights standard (400, 500, 600, 700)
```

---

## Pillar 3: Accessibility (MANDATORY)

**Color Contrast**

```
✅ GOOD - WCAG AA compliance
Text on background: Contrast ratio ≥ 4.5:1
  - Black #000 on white #FFF = 21:1 ✅
  - Dark gray #333 on white = 12.6:1 ✅
  - Blue #0066CC on white = 5.1:1 ✅

❌ BAD - Low contrast
  - Light gray #AAA on white = 2.3:1 ❌ (fails WCAG)
  - Yellow #FFFF00 on white = 1.1:1 ❌ (unreadable)
```

**Tool: Check contrast**
```bash
# WebAIM Contrast Checker
https://webaim.org/resources/contrastchecker/

# Input:
Foreground: #666666
Background: #FFFFFF

# Output:
Contrast ratio: 5.74:1
✅ WCAG AA Normal Text: PASS
✅ WCAG AA Large Text: PASS
```

**Keyboard Navigation**

```
✅ GOOD
- Tab order follows visual flow (top → bottom, left → right)
- Focus visible (blue outline on focused element)
- All interactive elements reachable by Tab
- Escape closes modal

❌ BAD
- Tab jumps randomly (poor tab order)
- No focus indicator (user lost)
- Buttons not keyboard-accessible
```

**Touch Targets**

```
✅ GOOD
- Buttons ≥ 44px height
- Touch areas ≥ 44x44px (including padding)
- 8px spacing between touch targets

❌ BAD
- Button 32px height ← Too small for mobile
- Icons 16x16px without padding ← Hard to tap
- Buttons 2px apart ← Accidental taps
```

**Screen Reader Support**

```html
<!-- ✅ GOOD - Semantic HTML + ARIA -->
<button aria-label="Delete order #12345">
  <TrashIcon />
</button>

<img src="logo.png" alt="STMAI Logistics Platform" />

<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<!-- ❌ BAD - Missing labels -->
<button>
  <TrashIcon /> <!-- Screen reader: "button" (no context) -->
</button>

<img src="logo.png" /> <!-- Screen reader: "image" (no description) -->

<div onclick="navigate()">Home</div> <!-- Not semantic, not keyboard accessible -->
```

**Checklist**

```
Accessibility:
[ ] Color contrast ≥ 4.5:1 (text on background)
[ ] Keyboard navigable (Tab order logical)
[ ] Focus indicators visible (outline or ring)
[ ] Touch targets ≥ 44x44px
[ ] Icon-only buttons have aria-label
[ ] Images have alt text
[ ] Semantic HTML (<button>, <nav>, <main>)
```

---

## Contextual Pillar 4: Navigation (when applicable)

**Wayfinding**

```
✅ GOOD
- User always knows: Where am I? Where can I go? How do I get back?
- Breadcrumbs: Home > Orders > Order #12345
- Active nav item highlighted

❌ BAD
- No indication of current page
- No breadcrumbs in deep hierarchy
- User gets lost
```

**Mobile Navigation Pattern**

```
✅ GOOD - Hamburger menu
- Top-left hamburger icon
- Slides in from left
- Overlay closes on outside tap
- Close button (X) visible

❌ BAD
- Desktop nav on mobile (too small)
- Bottom nav with 7+ items (cramped)
- No way to close nav drawer
```

**Checklist**

```
Navigation (if applicable):
[ ] Breadcrumbs for deep pages (>2 levels)
[ ] Active nav item highlighted
[ ] Mobile: Hamburger menu (not desktop nav)
[ ] User can navigate back (browser back or breadcrumb)
```

---

## Contextual Pillar 5: Usability (when applicable)

**Feature Discoverability**

```
✅ GOOD
- Primary actions visible without scrolling
- Tooltips on hover for icons
- Empty states guide user ("No orders yet. Create your first order.")

❌ BAD
- Important feature buried in sub-menu
- No tooltip on icon (user guesses)
- Empty state just says "No data" (unhelpful)
```

**Error Feedback**

```
✅ GOOD
- Inline validation (email format error shows immediately)
- Clear error message ("Email must contain @")
- Error color (red) + icon

❌ BAD
- Error shown only after submit
- Generic message ("Invalid input")
- No visual indication (no red color)
```

**Cognitive Load**

```
✅ GOOD - Simple flow
1. Select product
2. Enter quantity
3. Confirm

❌ BAD - Complex flow
1. Select product
2. Enter quantity
3. Choose warehouse
4. Select shipping method
5. Enter delivery date
6. Choose packaging
7. Confirm
(Too many decisions → user abandons)
```

**Checklist**

```
Usability (if applicable):
[ ] Primary actions above the fold
[ ] Tooltips on icon-only UI elements
[ ] Empty states provide guidance
[ ] Error messages specific and helpful
[ ] Flow has ≤5 steps (reduce cognitive load)
```

---

## Contextual Pillar 6: Forms (when applicable)

**Label Clarity**

```
✅ GOOD
<label for="email">Email Address</label>
<input id="email" type="email" placeholder="you@example.com" />

❌ BAD
<input type="email" placeholder="Email" />
(No <label>, screen reader cannot announce)
```

**Inline Validation**

```
✅ GOOD
- Email field: Shows error immediately on blur (not on submit)
- Error: "Email must contain @"
- Success: Green checkmark when valid

❌ BAD
- No validation until submit
- All errors shown at once (user overwhelmed)
- Generic error: "Form invalid"
```

**Error Messages**

```
✅ GOOD
- "Password must be at least 8 characters"
- "Email address is already registered. Try logging in."

❌ BAD
- "Invalid input"
- "Error 400"
- "Field required" (which field?)
```

**Checklist**

```
Forms (if applicable):
[ ] All inputs have <label> (not just placeholder)
[ ] Inline validation on blur (not only on submit)
[ ] Error messages specific ("Password must be ≥8 characters")
[ ] Success states visible (green checkmark)
[ ] Required fields marked with *
```

---

## Audit Output Template

```markdown
## UX Audit Report

**Design:** [Wireframe/Mockup name]
**Date:** [YYYY-MM-DD]

### ✅ PASS - Visual Hierarchy
- [x] H1 > H2 > H3 clear hierarchy
- [x] Primary CTA prominent (blue, top-right)
- [x] Whitespace consistent (16px, 24px, 32px)

### ⚠️ NEEDS FIX - Visual Style
- [ ] Spacing inconsistent (13px, 19px detected)
- [x] Color palette adhered to
- [x] Typography from type scale

### ❌ FAIL - Accessibility
- [ ] Color contrast: Gray #999 on white = 2.8:1 (fails WCAG AA)
  - **Fix:** Use #666 for 5.7:1 ratio
- [ ] Icon-only delete button missing aria-label
  - **Fix:** Add aria-label="Delete order"
- [x] Touch targets ≥ 44px

### ✅ PASS - Navigation
- [x] Breadcrumbs present
- [x] Active page highlighted
- [x] Mobile: Hamburger menu

### ✅ PASS - Usability
- [x] Empty state provides guidance
- [x] Error messages helpful
- [x] Flow simple (3 steps)

### ⚠️ NEEDS FIX - Forms
- [ ] Email input missing <label> (only placeholder)
  - **Fix:** Add `<label for="email">Email Address</label>`
- [x] Inline validation present
- [x] Error messages specific

---

## Overall Verdict

**Status:** NEEDS REVISION

**Required Fixes (P0):**
1. Increase text contrast: #999 → #666
2. Add aria-label to delete button
3. Add <label> to email input

**Suggested Improvements (P1):**
4. Standardize spacing to 8px grid (remove 13px, 19px)
```

---

## Decision Framework (from Quang's profile)

**3-Step Process:**

1. **Institutional Knowledge** - Does design system already solve this? (Check components library)
2. **User Familiarity** - Is there a common pattern users expect? (e.g., hamburger menu on mobile)
3. **Research** - If no precedent, research best practices (Nielsen Norman Group, Material Design)

**Example:**

```
Q: How to display order status?

Step 1: Institutional Knowledge
- Check design system → "StatusBadge" component exists

Step 2: User Familiarity
- Users expect: Green = Success, Yellow = Pending, Red = Error

Step 3: Research (skip - already solved)

Decision: Use StatusBadge component with semantic colors
```

---

## Common Mistakes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Low contrast text | Fails WCAG, unreadable | Use contrast checker, require ≥4.5:1 |
| Icon-only button no label | Screen reader cannot announce | Add aria-label |
| Magic spacing (13px, 7px) | Inconsistent, hard to maintain | Use 8px grid (8, 16, 24, 32) |
| No empty state guidance | User confused | Add "No data. Click + to create." |
| Generic error messages | User doesn't know how to fix | "Email must contain @" |

---

## Pre-Implementation Checklist

```
Before sending to FE Dev (Lân):

Core Pillars (MANDATORY):
[ ] Visual Hierarchy: H1 > H2 > H3, CTA prominent, whitespace consistent
[ ] Visual Style: Spacing from grid, colors from palette, typography from scale
[ ] Accessibility: Contrast ≥4.5:1, keyboard nav, touch targets ≥44px, aria-labels

Contextual (if applicable):
[ ] Navigation: Breadcrumbs, active state, mobile pattern
[ ] Usability: Discoverability, error feedback, simple flow
[ ] Forms: Labels, inline validation, helpful errors

Stitch AI Prompt:
[ ] Component states documented (hover, disabled, error, focus)
[ ] Spacing values specified (padding, margin, gap)
[ ] Color tokens specified (#0066CC, not "blue")
[ ] Typography specified (font-family, size, weight)
```
