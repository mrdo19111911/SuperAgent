# When to Sharpen Agents
## Reactive and Proactive Triggers

---

## Reactive Triggers (Bug-Driven)

Sharpen **immediately** when any of these occur:

### Trigger 1: P0 Penalty Received
**Condition:** Agent caused production data leak, security breach, or critical failure

**Examples:**
- RLS bypass (Tenant A sees Tenant B data)
- SQL injection vulnerability
- Production data loss
- Authentication bypass

**Action:**
→ Reactive Sharpening IMMEDIATELY
- Extract PEN entry
- Generate regression test
- Fix and verify
- Deploy fix
- Document in SHARPENING_LOG

---

### Trigger 2: 3+ Active PEN Entries
**Condition:** Agent has accumulated 3 or more unresolved PEN entries

**Check:**
```bash
grep "Status: ACTIVE" agents/core/{agent}.md | wc -l
# If output ≥ 3 → Sharpen now
```

**Why 3?**
- 1-2 PENs = isolated incidents
- 3+ PENs = pattern emerging
- Fix pattern, not individual bugs

**Action:**
→ Reactive Sharpening (batch fix)
- Extract all active PENs
- Generate tests from all PENs
- Apply systematic enhancements
- Verify all tests pass

---

### Trigger 3: Repeated Bug Pattern
**Condition:** Same type of bug occurs 2+ times

**Examples:**
- Forgot RLS check (happened twice)
- Skipped validation (happened twice)
- Missed error handling (happened twice)

**Check:**
- Read PEN entries
- Look for similar "Specific Reason" or "General Reason"

**Action:**
→ Reactive Sharpening (strengthen pattern)
- Add Prime Directive (hard rule)
- Add Table (completeness check)
- Add Philosophy reinforcement

---

### Trigger 4: Production Incident
**Condition:** Agent's output caused production outage, user-facing bug, or escalation

**Examples:**
- API 500 errors
- UI components losing data on refresh
- Performance degradation
- User complaints

**Action:**
→ Reactive Sharpening IMMEDIATELY
- Create PEN entry from incident
- Generate regression test
- Fix and verify
- Post-mortem in SHARPENING_LOG

---

## Proactive Triggers (Calendar/Performance-Driven)

Sharpen **quarterly or as needed** when any of these occur:

### Trigger 5: Quarterly Upgrade (Every 3 Months)
**Condition:** 3 months since last sharpening

**Check:**
```bash
grep "SHARPENING LOG" agents/core/{agent}.md | tail -1
# Check date - if >3 months ago → Sharpen now
```

**Why quarterly?**
- Industry patterns evolve (2026 standards)
- Token optimization opportunities accumulate
- Prevent drift from best practices

**Action:**
→ Proactive Sharpening
- Audit against 5 core principles
- Apply new workflow patterns
- Optimize tokens (6-layer defense)

---

### Trigger 6: Token Bloat (>500 L2 Cache)
**Condition:** Agent L2 Cache file exceeds 500 tokens

**Check:**
```bash
wc -w agents/core/{agent}.md
# Rough estimate: 1 token ≈ 0.75 words
# If word count >375 (≈500 tokens) → Optimize
```

**Why 500 tokens?**
- L2 Cache = always loaded
- >500 tokens = wastes context on every task
- Target: <500 tokens per agent

**Action:**
→ Proactive Sharpening (token focus)
- Apply Layer 1-6 token optimization
- Extract to RAM (`tmp/ram/{agent}/*.md`)
- Compress verbose sections
- Remove redundant content

---

### Trigger 7: New Workflow Patterns Available
**Condition:** `system/BEST_PRACTICE_AGENT.md` updated with new 2026 patterns

**Check:**
- Read `system/BEST_PRACTICE_AGENT.md` changelog
- Check `sharpener_proactive/references/workflow_patterns_catalog.md` for new patterns
- Compare agent workflow to latest patterns

**Action:**
→ Proactive Sharpening
- Apply new patterns (ReAct, Plan-and-Execute, Critic/Reflection, etc.)
- Update agent to 2026 standards
- Document changes in SHARPENING_LOG

---

### Trigger 8: Performance Issues
**Condition:** Agent consistently slow, uses excess tokens, or fails under load

**Examples:**
- Tasks taking >10 min (should be <5 min)
- Token usage >20K per task (should be <15K)
- Timeout errors

**Action:**
→ Proactive Sharpening (performance focus)
- Optimize cognitive modes (EXPANSION → HOLD)
- Apply token compression (Layer 2)
- Optimize workflows (remove redundant steps)

---

## Special Triggers

### Trigger 9: Agent Onboarding (First Deployment)
**Condition:** New agent about to go to production

**Action:**
→ Proactive Sharpening (pre-deployment audit)
- Audit against 5 core principles
- Ensure compliance with standards
- Validate boot protocol
- Test with real scenarios

---

### Trigger 10: Major Framework Upgrade
**Condition:** Nash Framework major version upgrade (v3.0 → v4.0)

**Action:**
→ Proactive Sharpening (compatibility)
- Update to new framework patterns
- Migrate to new SOUL system
- Test compatibility
- Document migration

---

## Trigger Summary Table

| Trigger | Type | Urgency | Sharpener | Time |
|---------|------|---------|-----------|------|
| P0 Penalty | Reactive | IMMEDIATE | Reactive | 15-30 min |
| 3+ Active PENs | Reactive | HIGH | Reactive | 30 min |
| Repeated Bug | Reactive | HIGH | Reactive | 20 min |
| Production Incident | Reactive | IMMEDIATE | Reactive | 15-30 min |
| Quarterly (3 months) | Proactive | SCHEDULED | Proactive | 30-60 min |
| Token Bloat (>500) | Proactive | MEDIUM | Proactive | 30 min |
| New Patterns | Proactive | LOW | Proactive | 45 min |
| Performance Issues | Proactive | MEDIUM | Proactive | 45 min |
| Onboarding | Proactive | MEDIUM | Proactive | 30 min |
| Framework Upgrade | Proactive | HIGH | Proactive | 60 min |

---

## Monthly Checklist

**Week 1:**
- Check all agents for active PEN entries (`grep "Status: ACTIVE"`)
- Reactive sharpen any agent with 3+ PENs

**Week 2:**
- Review token counts (`wc -w agents/**/*.md`)
- Proactive sharpen any agent >500 tokens

**Week 3:**
- Check for new industry patterns (`system/BEST_PRACTICE_AGENT.md` updates)
- Proactive sharpen to apply new patterns

**Week 4:**
- Quarterly audit (every 3rd month)
- Proactive sharpen agents due for upgrade

---

## Next Steps

1. Use this trigger list to identify agents needing sharpening
2. Use [../sharpening_decision_tree.md](../sharpening_decision_tree.md) to choose approach
3. Execute:
   - Reactive: [../sharpener_reactive/SKILL.md](../sharpener_reactive/SKILL.md)
   - Proactive: [../sharpener_proactive/SKILL.md](../sharpener_proactive/SKILL.md)

---

**Reference:** See `../../AGENT_BUILDING_MASTER_GUIDE.md` Level 3 for complete sharpening guide
