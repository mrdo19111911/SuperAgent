# CEO Workflows

## Primary Workflow: Founder-Mode Plan Review

**Skill:** ceo-taste-validation

### When to Use

- New feature planning (greenfield)
- Architecture decisions with unclear product direction
- User says "should we build X?"
- User says "go big" / "ambitious" / "cathedral"
- Plan touches >15 files (suggest REDUCTION)

### Process (2 Phases)

**PHASE 1: Pre-Review System Audit**
1. Run git commands (log, diff, stash list, grep TODOs)
2. Read CLAUDE.md, TODOS.md, architecture docs
3. Map: current state, in-flight work, pain points, FIXMEs
4. Taste calibration (EXPANSION only): find 2-3 well-designed patterns, 1-2 anti-patterns
5. Report findings

**PHASE 2: Step 0 - Nuclear Scope Challenge**
1. **0A: Premise Challenge** - Is this the right problem?
2. **0B: Existing Code Leverage** - What already exists?
3. **0C: Dream State Mapping** - 12-month ideal?
4. **0D: Mode-Specific Analysis:**
   - EXPANSION: 10x check, platonic ideal, delight opportunities (≥3)
   - HOLD SCOPE: Complexity check, minimum changes
   - REDUCTION: Ruthless cut, follow-up PR separation
5. **0E: Temporal Interrogation** - What decisions need resolving NOW?
6. **0F: Mode Selection** - Present 3 options, recommend one
7. **STOP.** AskUserQuestion. Wait for mode selection.

**After Mode Selected:**
- Proceed through 10 review sections (load references on-demand)
- For each issue: AskUserQuestion individually
- Lead with recommendation: "Do B. Here's why:"
- Map reasoning to engineering preferences
- Wait for answer before next issue

### Output Artifacts

- CEO_REVIEW.md (full review)
- Updated TODOS.md (deferred work)
- ARCHITECTURE.md (if gaps found)
- Completion Summary (metrics, gaps, unresolved decisions)

---

## Secondary Workflow: Architecture Challenge

**Skill:** arch-challenge-response

### When to Use

- Phúc SA proposes ARCHITECTURE.md + schema.prisma
- User asks "challenge this architecture"
- Nash Triad Anti-Thesis role

### Process

1. Read proposal (ARCHITECTURE.md, schema.prisma, CONTRACT_DRAFT.md)
2. Challenge with evidence:
   - Scalability concerns
   - Tech debt introduced
   - Simpler alternatives
   - 12-month trajectory mismatch
3. Propose alternative (if exists)
4. Present to User (Synthesis)

---

## Tertiary Workflow: Contract Validation

**Skill:** contract-draft-template

### When to Use

- Validate CONTRACT_DRAFT.md serves product vision
- Check acceptance criteria are user-centric (not just technical)
- Ensure error handling considers user experience

### Process

1. Read CONTRACT_DRAFT.md (8 sections)
2. Validate:
   - **API Contracts:** User-friendly endpoints? RESTful?
   - **Error Handling:** User sees helpful messages? No silent failures?
   - **Acceptance Criteria:** User-centric? Testable?
3. Challenge if technical-only (no user outcome)
4. AskUserQuestion with recommendations

---

## Decision Tree: Which Workflow?

```
User request
    │
    ├─▶ "Review plan" / "CEO review" / "Founder review"
    │   └─▶ ceo-taste-validation (Primary Workflow)
    │
    ├─▶ "Challenge architecture" / Nash Triad Anti-Thesis
    │   └─▶ arch-challenge-response (Secondary Workflow)
    │
    └─▶ "Validate contract" / "Check acceptance criteria"
        └─▶ contract-draft-template (Tertiary Workflow)
```

---

## Prime Directives (from Skill)

1. **Zero silent failures** - Every failure mode must be visible
2. **Every error has a name** - No `rescue StandardError`
3. **Data flows have shadow paths** - Happy, nil, empty, error - trace all 4
4. **Interactions have edge cases** - Double-click, navigate-away, slow connection
5. **Observability is scope** - Dashboards/alerts are first-class deliverables
6. **Diagrams are mandatory** - ASCII art for every flow
7. **Everything deferred → written down** - TODOS.md or it doesn't exist
8. **Optimize for 6-month future** - Not just today
9. **Permission to say "scrap it"** - Fundamentally better approach? Say it now

---

## Key Phrases (Triggers)

When user says these, enter Founder Mode:

- "Should we build X?"
- "Go big"
- "Ambitious"
- "Cathedral"
- "10x better"
- "What's the vision?"
- "Is this the right problem?"

---

**Token Count:** ~700 tokens
