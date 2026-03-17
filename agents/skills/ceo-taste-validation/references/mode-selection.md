# Mode Selection (Step 0F)

## Three Modes

| Mode | When to Use | Posture | Scope Direction |
|------|-------------|---------|-----------------|
| **EXPANSION** | Greenfield feature, user says "go big" | Build the cathedral | Push UP |
| **HOLD SCOPE** | Bug fix, hotfix, refactor, plan is right-sized | Maximum rigor, bulletproof | Maintain |
| **REDUCTION** | Plan touches >15 files, overbuilt, wrong-headed | Ruthless surgeon | Push DOWN |

---

## 0A. Premise Challenge

**Question the problem itself:**

1. **Is this the right problem to solve?**
   - Could a different framing yield a dramatically simpler or more impactful solution?
   - Example: Plan says "Add favorites feature" → Better: "Build collections system (favorites is just one type)"

2. **What is the actual user/business outcome?**
   - Is the plan the most direct path to that outcome?
   - Or is it solving a proxy problem?
   - Example: Plan says "Optimize query" → Real outcome: "Reduce p99 latency from 800ms to <200ms"

3. **What would happen if we did nothing?**
   - Real pain point or hypothetical one?
   - Example: "Users complaining daily" vs "Might be nice to have"

**STOP if premise is wrong.** Recommend scrapping plan and reframing.

---

## 0B. Existing Code Leverage

**Map every sub-problem to existing code:**

1. **What existing code already partially or fully solves each sub-problem?**
   - Can we capture outputs from existing flows rather than building parallel ones?
   - Example: Plan wants "Export to CSV" → `app/services/report_exporter.rb` already does this for invoices

2. **Is this plan rebuilding anything that already exists?**
   - If yes, explain why rebuilding is better than refactoring
   - Example: Rebuilding auth system → Need to explain why not extend existing

**Template:**
```markdown
## Existing Code Leverage

| Sub-Problem | Existing Code | Reuse? | Why Not? |
|-------------|---------------|--------|----------|
| CSV export | services/report_exporter.rb | ✅ YES | Just add new column mappings |
| Auth | devise gem + custom policy | ✅ YES | Extend, don't rebuild |
| Validation | - | ❌ NO | No existing pattern for this domain |
```

---

## 0C. Dream State Mapping

Describe the ideal end state of this system **12 months from now.**

Does this plan move toward that state or away from it?

**ASCII Diagram:**
```
CURRENT STATE          THIS PLAN                  12-MONTH IDEAL
─────────────────  →  ──────────────────────  →  ───────────────────
[describe]             [describe delta]           [describe target]
```

**Example:**
```
CURRENT STATE
- Monolith Rails app
- Manual inventory updates
- No real-time sync

THIS PLAN
- Add background job for inventory sync
- Sidekiq worker polls supplier API every 5 min

12-MONTH IDEAL
- Event-driven architecture
- Real-time inventory via webhooks
- Auto-reorder when stock < threshold

Assessment: Plan moves toward ideal (adds async processing)
but misses opportunity for real-time (webhooks better than polling)
```

---

## 0D. Mode-Specific Analysis

### EXPANSION Mode (Run all three)

**1. 10x Check**
- What's the version that's 10x more ambitious and delivers 10x more value for 2x the effort?
- Describe it concretely.

**Example:**
```
Current plan: Add "favorites" button
10x version: Build "collections" system
- Favorites is just type: 'favorites'
- Also unlocks: wishlist, compare, recently viewed, custom collections
- Effort: 2 days → 4 days (2x)
- Value: 1 feature → 5 features (5x)
```

**2. Platonic Ideal**
- If the best engineer in the world had unlimited time and perfect taste, what would this system look like?
- Start from user experience, not architecture

**Example:**
```
Platonic ideal: "Collections feel like Notion databases"
- Drag-drop reordering
- Filters and views (grid, list, kanban)
- Share collections with team
- Collaborative editing
```

**3. Delight Opportunities**
- What adjacent 30-minute improvements would make this feature sing?
- Things where a user would think "oh nice, they thought of that"
- List at least 3

**Example:**
```
Delight opportunities:
1. "Add to collection" button shows preview tooltip of collection contents (30 min)
2. Empty state shows "Import from wishlist" if user has wishlist items (20 min)
3. Collection cover image auto-generates from first 4 items (45 min)
```

---

### HOLD SCOPE Mode (Run this)

**1. Complexity Check**
- If plan touches >8 files or introduces >2 new classes/services → smell
- Challenge whether same goal can be achieved with fewer moving parts

**2. Minimum Changes**
- What is the minimum set of changes that achieves the stated goal?
- Flag any work that could be deferred without blocking core objective

**Example:**
```
Plan touches 12 files:
- Core: 5 files (model, controller, service, view, test) ✅ Necessary
- Nice-to-have: 3 files (admin UI, CSV export, email notifications) ⚠️ Defer?
- Cleanup: 4 files (rename variables, extract helpers) ⚠️ Defer to separate PR
```

---

### REDUCTION Mode (Run this)

**1. Ruthless Cut**
- What is the absolute minimum that ships value to a user?
- Everything else is deferred. No exceptions.

**2. What Can Be a Follow-Up PR?**
- Separate "must ship together" from "nice to ship together"

**Example:**
```
MUST SHIP TOGETHER (MVP):
- Model + migration
- API endpoint (create, read)
- React component (basic list)
- Test coverage

FOLLOW-UP PR:
- Update endpoint
- Delete endpoint
- Sorting/filtering UI
- CSV export
- Admin dashboard
```

---

## 0E. Temporal Interrogation (EXPANSION and HOLD modes)

Think ahead to implementation. What decisions will need to be made during implementation that should be resolved **NOW** in the plan?

**Template:**
```
HOUR 1 (foundations):     What does the implementer need to know?
HOUR 2-3 (core logic):    What ambiguities will they hit?
HOUR 4-5 (integration):   What will surprise them?
HOUR 6+ (polish/tests):   What will they wish they'd planned for?
```

**Example:**
```
HOUR 1: How do we name the table? `user_collections` or `collections`?
  → RESOLVE NOW: `collections` (shorter, clearer)

HOUR 2-3: Can a collection contain items of different types (products + bundles)?
  → RESOLVE NOW: Yes, polymorphic `collection_items` table

HOUR 4-5: How do we handle concurrent adds (2 users add to shared collection)?
  → RESOLVE NOW: Optimistic locking with `lock_version` column

HOUR 6+: Do we need to test with 10,000 items in a collection?
  → RESOLVE NOW: Yes, add performance test for large collections
```

Surface these as questions for user NOW, not "figure it out later."

---

## 0F. Mode Selection

Present three options:

**A) SCOPE EXPANSION**
- The plan is good but could be great
- Propose the ambitious version, then review that
- Push scope up. Build the cathedral.

**B) HOLD SCOPE**
- The plan's scope is right
- Review it with maximum rigor
- Make it bulletproof

**C) SCOPE REDUCTION**
- The plan is overbuilt or wrong-headed
- Propose a minimal version that achieves the core goal
- Then review that

---

## Context-Dependent Defaults

| Context | Default Mode | Why |
|---------|--------------|-----|
| Greenfield feature | EXPANSION | Opportunity to build platform |
| Bug fix or hotfix | HOLD SCOPE | Scope already minimal |
| Refactor | HOLD SCOPE | Scope already defined |
| Plan touching >15 files | Suggest REDUCTION | Complexity smell |
| User says "go big" / "ambitious" / "cathedral" | EXPANSION | Explicit permission |

---

## Critical Rule: Commit to Mode

**Once selected, COMMIT FULLY. Do not silently drift.**

- If EXPANSION selected → Do NOT argue for less work during later sections
- If REDUCTION selected → Do NOT sneak scope back in
- Raise concerns once in Step 0 — after that, execute chosen mode faithfully

---

## AskUserQuestion Template

```markdown
## Step 0F: Mode Selection

Based on analysis:
- Premise: [Valid / Needs reframing]
- Existing code leverage: [High / Medium / Low]
- 12-month trajectory: [Toward ideal / Away from ideal]
- Complexity: [Plan touches X files, introduces Y new classes]

I recommend **[MODE]** because [1-2 sentence reasoning].

**Options:**

A) **SCOPE EXPANSION** - [Describe ambitious version]
   - Effort: [X days → Y days]
   - Value: [Current features → Expanded features]

B) **HOLD SCOPE** - [Describe bulletproofing approach]
   - Effort: [As planned]
   - Value: [Reduce risk, ensure quality]

C) **SCOPE REDUCTION** - [Describe minimal version]
   - Effort: [X days → Y days]
   - Value: [Ship faster, defer nice-to-haves]

Which mode do you choose?
```

---

**Token Count:** ~1,300 tokens
