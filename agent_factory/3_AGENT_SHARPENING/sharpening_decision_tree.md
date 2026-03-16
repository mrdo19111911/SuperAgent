# Sharpening Decision Tree
## Reactive vs Proactive - When to Use Which?

---

## Quick Decision

```
Agent has active PEN entries?
├─ YES → Reactive Sharpening (fix bugs)
└─ NO  → Check if quarterly upgrade due
          ├─ YES → Proactive Sharpening (modernize)
          └─ NO  → No sharpening needed (agent healthy)
```

---

## Detailed Decision Tree

### Question 1: Does agent have production failures?

**Check:**
- Count active PEN entries: `grep "PEN-" agents/core/{agent}.md | grep "Status: ACTIVE"`
- Recent penalties: `grep "Penalty:" LEDGER.md`

**If YES (3+ active PENs or P0/P1 penalty):**
→ **Use Reactive Sharpening**
- Extract PENs
- Auto-generate tests
- Fix specific bugs
- Verify fixes
- Mark PENs FIXED

**If NO:**
→ Go to Question 2

---

### Question 2: Is quarterly upgrade due?

**Check:**
- Last sharpening date: `grep "SHARPENING LOG" agents/core/{agent}.md | tail -1`
- Time since last sharpen: >3 months?

**If YES (>3 months since last sharpen):**
→ **Use Proactive Sharpening**
- Audit against 5 principles
- Apply 2026 workflow patterns
- Optimize tokens (6-layer defense)
- Validate improvements

**If NO:**
→ Go to Question 3

---

### Question 3: Is agent token-bloated?

**Check:**
- Token count: `wc -w agents/core/{agent}.md` (rough estimate: 1 token ≈ 0.75 words)
- L2 Cache target: <500 tokens
- Current count: >500 tokens?

**If YES (>500 tokens L2 Cache):**
→ **Use Proactive Sharpening**
- Focus on token optimization (Layer 1-6)
- Extract to RAM (`tmp/ram/{agent}/*.md`)
- Compress verbose sections
- Remove redundant content

**If NO:**
→ Go to Question 4

---

### Question 4: New industry patterns available?

**Check:**
- `system/BEST_PRACTICE_AGENT.md` updated?
- New workflow patterns in `sharpener_proactive/references/workflow_patterns_catalog.md`?

**If YES (new patterns not yet applied):**
→ **Use Proactive Sharpening**
- Apply new patterns
- Update agent to 2026 standards
- Document changes

**If NO:**
→ **No sharpening needed** (agent healthy)

---

## Comparison Matrix

| Criterion | Reactive | Proactive |
|-----------|----------|-----------|
| **Trigger** | Production failure | Quarterly/Token bloat/New patterns |
| **Focus** | Fix specific bugs | Modernize/Optimize |
| **Input** | PEN entries | 5 principles audit |
| **Output** | Enhanced skills + tests | Optimized agent + patterns |
| **Time** | 15-30 min | 30-60 min |
| **Driver** | Bug-driven | Calendar-driven |
| **Tests** | Auto-generated from PENs | Manual validation |
| **ROI** | High (fix P0/P1 bugs) | Medium (prevent future bugs) |

---

## Combined Approach (Recommended)

**Best practice:** Use BOTH systems in sequence

**Quarterly workflow:**
1. **Week 1:** Reactive Sharpening
   - Fix all active PEN entries
   - Clear bug backlog
   - Verify all tests pass

2. **Week 2:** Proactive Sharpening
   - Audit against 5 principles
   - Apply new workflow patterns
   - Optimize tokens

3. **Week 3:** Validation
   - Test with real tasks
   - Measure token savings
   - Document improvements

**Result:** Agent is bug-free (reactive) AND optimized (proactive)

---

## Special Cases

### Case 1: Emergency Hotfix
**Scenario:** Production P0 incident

**Decision:**
→ **Reactive Sharpening IMMEDIATELY**
- Extract PEN from incident
- Generate regression test
- Fix and deploy
- Full proactive sharpen later (after fire out)

---

### Case 2: New Agent (<1 month old)
**Scenario:** Agent created recently, no PENs yet

**Decision:**
→ **No sharpening needed**
- Wait for production usage
- Collect PENs naturally
- Sharpen when 3+ PENs accumulate OR 3 months pass

---

### Case 3: Agent Never Used
**Scenario:** Agent exists but never deployed

**Decision:**
→ **Proactive Sharpening (light)**
- Audit against 5 principles
- Ensure compliance with standards
- Skip token optimization (no usage data)

---

### Case 4: Agent with 1-2 PENs Only
**Scenario:** Minor bugs, not critical

**Decision:**
→ **Wait OR Reactive (quick)**
- If P0/P1: Reactive immediately
- If P2/P3/P4: Wait until 3+ PENs OR quarterly

---

## Metrics to Track

**After reactive sharpening:**
- PEN count: Before vs After
- Pass rate: Regression tests passing?
- Time to fix: <30 min target

**After proactive sharpening:**
- Token count: Before vs After (target: 60-80% reduction)
- Principle compliance: 0/5 → 5/5
- Workflow patterns applied: Count

---

## Next Steps

1. Use this decision tree to choose sharpening approach
2. Read [references/when_to_sharpen.md](references/when_to_sharpen.md) for detailed triggers
3. Execute:
   - Reactive: [sharpener_reactive/SKILL.md](sharpener_reactive/SKILL.md)
   - Proactive: [sharpener_proactive/SKILL.md](sharpener_proactive/SKILL.md)

---

**Reference:** See `../AGENT_BUILDING_MASTER_GUIDE.md` Level 3 for complete sharpening guide
