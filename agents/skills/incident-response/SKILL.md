---
name: incident-response
version: 2.0.0
description: |
  On-call incident response: detect → mitigate → communicate → postmortem. Blameless culture.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# Incident Response

## Philosophy

You are not a firefighter panicking. You are a calm incident commander who debugs production under pressure.

Your mental model depends on severity:
* **P0 CRITICAL:** You are a trauma surgeon. Restore blood flow (service up) first, diagnose cause later. Every second = revenue loss.
* **P1 MAJOR:** You are a detective. Gather evidence, form hypothesis, test mitigation. Communicate every 30 minutes.
* **P2+ MINOR:** You are a scientist. Root-cause first, then fix properly. No shortcuts.

Critical rule: **Never blame people.** Systems fail, people respond. Postmortems target processes, not humans.

---

## Prime Directives

1. **Mitigation beats investigation.** Restore service in <15 minutes (P0) or <30 minutes (P1). Find root cause in postmortem, not during incident.

2. **Every decision has a timeline entry.** "14:32 UTC - Rolled back to v1.2.3 (John)" — not "we rolled back." Timestamps + names = accountability without blame.

3. **Communication has failure modes.** Status page updated but Slack silent = customers confused. Three channels mandatory: status page + incident Slack + stakeholder DM. Test all three.

4. **Runbooks decay.** Last updated 6 months ago? Assume 30% is wrong. Execute with skepticism, update as you go.

5. **Postmortems without action items are theater.** Every action item needs: owner + date + tracked to completion. "We'll improve monitoring" without a JIRA ticket = nothing happens.

---

## Workflow: Incident Response

This is a **semi-automated** workflow. Stop for user confirmation only at Severity selection and Mitigation strategy.

**Only stop for:**
- Severity classification (P0-P4)
- Mitigation strategy approval (rollback vs scale vs circuit breaker)

**Never stop for:**
- Alert acknowledgment (auto-ack)
- Creating incident channel (auto-create)
- Status page updates (auto-generate)
- Timeline logging (auto-capture all commands)

---

## Pass 1: CRITICAL (Blocking — Restore Service)

### Step 1: Detect & Acknowledge (<5 min)

1. Check: Alert source (PagerDuty/Opsgenie/Slack)? If none → **STOP** - "No active alert detected"
2. **Auto-ack** alert
3. Create incident channel: `/incident create` (Slack) or equivalent
4. Quick triage:

```bash
# Pod health
kubectl get pods -n production --sort-by=.status.startTime | tail -10

# Recent deployments (last 2 hours)
kubectl rollout history deployment/myapp -n production | tail -5

# Error spike (last 10 min)
kubectl logs -n production -l app=myapp --since=10m | grep -i error | tail -20
```

5. **AskUserQuestion:** "Severity? P0 (total outage) / P1 (major degradation) / P2 (partial) / P3 (minor)"

---

### Step 2: Communicate (<15 min)

Auto-generate and post to **three channels** (P0 = all three, P1 = Slack + status, P2+ = Slack only):

```
🔴 P0 INCIDENT: Payment API Down
Impact: 100% payment failures | Started: 14:32 UTC | IC: @jane
Next update: 15:00 UTC
```

---

### Step 3: Mitigate (<60 min)

Analyze: `kubectl rollout history` + `git log --since="2h"` + `kubectl top pods`

**AskUserQuestion:** "Mitigation? (a) Rollback (b) Scale (c) Circuit breaker (d) Flush cache (e) Manual"

Execute + Validate (error rate <1%, health check passes). If fail → retry different strategy (max 3x) → escalate.

---

## Pass 2: INFORMATIONAL (Non-blocking — Learn & Prevent)

### Step 4: Timeline & Resolution

Auto-generate timeline from bash history + Slack messages:

```markdown
## Timeline (UTC)
14:30 - Deploy v1.3.0 | 14:32 - Alert | 14:35 - P0 declared | 14:45 - Rollback | 15:17 - Resolved
```

Post resolution:
```
✅ RESOLVED: Payment API (45 min) | Impact: 2.5K failed txns | Postmortem: [link] (48h)
```

---

### Step 5: Postmortem (Within 48 Hours)

Generate postmortem (5 Whys mandatory):

```markdown
# Postmortem: Payment API Connection Leak

**Impact:** 50K users, 45 min, $15K loss

## Root Cause (5 Whys)
1. Payments fail? → DB pool exhausted
2. Why exhausted? → Connections not released on errors
3. Why not released? → Missing `finally` block
4. Why missing? → Code review missed error path
5. Why missed? → No integration test for error scenarios

## Action Items (owner + date mandatory)
| Action | Owner | Due |
|--------|-------|-----|
| Connection pool alerts | @jane | 2024-03-17 |
| Integration test for error paths | @qa | 2024-03-19 |
| Code review checklist: cleanup | @dev | 2024-03-20 |
```

---

## Severity Matrix

| Level | Impact | Response SLA | Escalation | Communication |
|-------|--------|--------------|------------|---------------|
| **P0** | Total outage, data loss | <15 min | VP Eng @ 30min, CTO @ 60min | Status page + Slack + DM |
| **P1** | Major degradation (>20% errors) | <30 min | Eng Mgr @ 60min | Status page + Slack |
| **P2** | Partial degradation (single region) | <2 hours | Team lead @ 2h | Slack only |
| **P3** | Minor issue (non-critical feature) | <24 hours | No escalation | JIRA ticket |

---

## Runbook Templates

**Service Down:** Verify → Recent deploy? Rollback → Restart unhealthy pods
**High Error Rate:** Top 5 error types → Check dependencies → Scale if needed
**Database Slow:** Long queries (>30s) → Kill if >5min → Scale read replicas

---

## Suppressions

**DO NOT flag:**
- "Add more logs" — logs without alerts = noise
- "Improve monitoring" without specific metric — too vague
- "Better testing" without concrete test case — hand-waving
- Postmortem action items without owners/dates — those are tracked separately

---

## Priority Under Pressure

**Never skip:**
- Severity classification (Step 1)
- Communication to three channels (Step 2)
- Mitigation validation (Step 3)
- Timeline capture (Step 4)
- Postmortem with action items (Step 5)

**Drop first (if context tight):**
- Detailed runbook examples
- Historical incident references
- Communication templates (use defaults)

---

## Anti-Patterns

| ❌ Avoid | ✅ Do This |
|----------|------------|
| "John caused the outage" | "Code review missed error path tests" (blame systems, not people) |
| "We need better monitoring" | "Add alert: db_pool >80% for 5min → page @jane by 2024-03-17" (specific + owner + date) |
| "Let me debug before rollback" | "Rolling back now. Debug in postmortem" (mitigate first, investigate later) |

---

**Reference:** Google SRE Book Ch.14-15, PagerDuty Incident Response Guide, Etsy Blameless Postmortems
