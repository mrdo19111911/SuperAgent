# CEO Skills Reference

## Skill 1: ceo-taste-validation (Primary)

**Path:** `agents/skills/ceo-taste-validation/SKILL.md`

**Use daily for:** Founder-mode plan review

**Key sections:**
- Philosophy: 3 modes (EXPANSION/HOLD/REDUCTION)
- Prime Directives (9 rules)
- Workflow (2 phases)
- Review Sections (10 sections)

**References (load on-demand):**
- `references/workflow.md` - 2-phase workflow details
- `references/mode-selection.md` - Step 0 breakdown
- `references/prime-directives.md` - DO/DON'T examples
- `references/error-rescue-map.md` - Section 2 error mapping
- `references/architecture.md` - Section 1 architecture review
- `references/sections-3-10-quick.md` - Sections 3-10 compressed

**Triggers:**
- "CEO review" / "founder review"
- "Should we build X?"
- "Go big" / "ambitious" / "cathedral"
- New feature planning (greenfield)
- Architecture decisions with unclear product direction

**Output artifacts:**
- CEO_REVIEW.md
- Updated TODOS.md
- ARCHITECTURE.md (if gaps)
- Completion Summary

---

## Skill 2: arch-challenge-response (Secondary)

**Path:** `agents/skills/arch-challenge-response/SKILL.md`

**Use weekly for:** Nash Triad Anti-Thesis challenges

**When to trigger:**
- Phúc SA proposes ARCHITECTURE.md
- User asks "challenge this architecture"
- Anti-Thesis role in Pipeline 2

**Key questions:**
- Scalability concerns?
- Tech debt introduced?
- Simpler alternatives?
- 12-month trajectory mismatch?

**Output:**
- Alternative architecture proposal (if exists)
- Challenges with evidence (not opinions)
- Present to User for Synthesis decision

---

## Skill 3: contract-draft-template (Tertiary)

**Path:** `agents/skills/contract-draft-template/SKILL.md`

**Use weekly for:** Contract validation from product perspective

**Focus on:**
- **API Contracts:** User-friendly endpoints?
- **Error Handling:** User sees helpful messages?
- **Acceptance Criteria:** User-centric (not just technical)?

**Challenge if:**
- Acceptance criteria are purely technical (no user outcome)
- Error messages are developer-facing (not user-friendly)
- API design is CRUD-only (no workflow alignment)

**Example challenge:**
```markdown
❌ Technical AC: "API returns 201 when order created"
✅ User-centric AC: "User receives order confirmation with tracking number within 2 seconds"

Why: Technical AC doesn't specify user outcome (confirmation, tracking number, latency)
```

---

## Cross-Skill Synergies

**ceo-taste-validation + arch-challenge-response:**
- Use ceo-taste-validation in Step 0 to challenge premises
- If architecture proposed, switch to arch-challenge-response for technical deep-dive
- Return to ceo-taste-validation for final recommendations

**ceo-taste-validation + contract-draft-template:**
- Use ceo-taste-validation for overall plan review
- When reviewing Section 1 (Architecture), load contract-draft-template to validate API design
- Ensure contracts serve product vision, not just technical correctness

---

## Skill Loading Strategy (Token Optimization)

**Always load (L2 Cache):**
- SKILL.md skeleton (~800 tokens)

**Load on-demand (RAM):**
- references/*.md (0-1,500 tokens per file)
- Load ONLY the reference needed for current section

**Example session:**
```
User: "Review this plan"
Load: SKILL.md (800 tokens)

Phase 1: Pre-Review Audit
Load: references/workflow.md (900 tokens)
Total: 1,700 tokens

Phase 2: Step 0
Load: references/mode-selection.md (1,300 tokens)
Total: 3,000 tokens

Section 1: Architecture
Load: references/architecture.md (1,300 tokens)
Total: 4,300 tokens

Section 2: Error Handling
Load: references/error-rescue-map.md (1,900 tokens)
Total: 6,200 tokens

(Unload workflow.md, mode-selection.md to free space)
Total: 4,000 tokens (active)
```

---

**Token Count:** ~600 tokens
