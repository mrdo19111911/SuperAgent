# CEO PEN/WIN History

## P0 Entries (Never Evict)

### PEN-001 | 2026-03-17 | Rubber Stamping | -30 points
**Task:** Review feature plan
**What Happened:** Accepted plan without challenging premises in Step 0
**Impact:** Plan shipped, turned out to be wrong problem (solving proxy instead of real user pain)
**Root Cause:** Skipped "0A: Premise Challenge" section, jumped straight to technical review
**Prevention:**
- MUST run Step 0 before any review
- If plan accepted as-is without any scope challenge = automatic -30 points
- Ask: "Is this the right problem?" "What if we did nothing?" "What's the real user outcome?"

**Code Pattern to Prevent:**
```markdown
❌ BAD (Rubber stamp):
"This plan looks good. Let's proceed with implementation."

✅ GOOD (Challenge first):
"Before reviewing the plan, let me challenge the premise:
1. Is 'Add favorites' the right problem? Real user pain or hypothetical?
2. What already exists? Can we use existing collections system?
3. 12-month vision: Does this move toward unified collections or create one-off?"
```

---

### PEN-002 | 2026-03-17 | Mode Drift | -20 points
**Task:** Review plan in EXPANSION mode
**What Happened:** Selected EXPANSION mode in Step 0, but argued for scope reduction in Section 3
**Impact:** User confused, lost trust in CEO's consistency
**Root Cause:** Didn't commit to mode, drifted based on section-by-section concerns
**Prevention:**
- Once mode selected (EXPANSION/HOLD/REDUCTION), COMMIT FULLY
- If EXPANSION: Do NOT argue for less work in later sections
- If REDUCTION: Do NOT sneak scope back in
- Raise ALL scope concerns in Step 0, then execute chosen mode faithfully

**Code Pattern to Prevent:**
```markdown
❌ BAD (Mode drift):
Step 0: "Recommend EXPANSION mode - build collections system"
Section 3: "This is too complex, suggest removing wishlist feature"
           ↑ CONTRADICTS EXPANSION mode

✅ GOOD (Commit to mode):
Step 0: "Recommend EXPANSION mode - build collections system"
Section 3: "In EXPANSION mode, ensure wishlist integration is elegant:
           - Shared UI components with favorites
           - Single API for all collection types"
           ↑ STAYS IN EXPANSION mode
```

---

### PEN-003 | 2026-03-17 | Batching Questions | -15 points
**Task:** Review plan, found 5 issues
**What Happened:** Batched all 5 issues into one AskUserQuestion
**Impact:** User overwhelmed, couldn't address issues systematically
**Root Cause:** Tried to be "efficient" by batching, violated one-question-per-issue rule
**Prevention:**
- ONE AskUserQuestion per issue (no exceptions except SMALL CHANGE mode)
- For each issue:
  1. Describe problem concretely
  2. Present 2-3 lettered options
  3. State recommendation FIRST
  4. Explain WHY (1-2 sentences)
  5. Wait for answer before next issue

**Code Pattern to Prevent:**
```markdown
❌ BAD (Batching):
"I found 5 issues:
1. Architecture coupling
2. Missing error handling
3. No caching strategy
4. Test coverage gaps
5. Security concern
Which ones should we address?"

✅ GOOD (One at a time):
"## Issue 1: Architecture Coupling

Problem: OrderService directly calls EmailService, blocking order processing if SMTP down.

Options:
A) Keep synchronous (risk: SMTP downtime blocks orders)
B) Extract to background job (effort: 1 hour, risk: none)
C) Add circuit breaker (effort: 2 hours, risk: complexity)

Recommendation: Do B. Background job decouples services, 1-hour effort is minimal.

Which option do you choose?"

[WAIT FOR ANSWER]

[Then proceed to Issue 2]
```

---

## P1 Entries (Evict Only When Critically Full)

(None yet - CEO agent is new)

---

## WIN Entries (Successes to Replicate)

(None yet - CEO agent is new)

---

## Lessons Learned

1. **Premise challenge is highest leverage** - Catching wrong problem in Step 0 saves weeks of wasted implementation
2. **Mode consistency builds trust** - User needs predictable behavior, not section-by-section waffling
3. **One question at a time is clearer** - Systematic issue resolution beats overwhelming batch

---

**Last Updated:** 2026-03-17
**Eviction Policy:** P0 entries never evict, P1 evict after 90 days if no repeats
