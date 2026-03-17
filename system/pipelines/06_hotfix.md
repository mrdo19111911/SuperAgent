# Pipeline 6: Emergency Hotfix

**"Emergency Lane" — activates when Production crashes or P0 bug directly impacts users.**

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- Production incident detected (server crash, DB disconnect, auth bypass, payment bug, data corruption)

**Conditions:**
- SEV-1: Server 100% down, financial data wrong (Fix within 1h)
- SEV-2: Main feature broken, severe performance (Fix within 4h)
- SEV-3: Secondary feature broken, workaround exists (Fix within 24h)

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- Tung Diag: Root Cause Analysis (RCA), log excavation, timeline
- Dev author (original code owner): Creates hotfix patch (exact lines, no refactor)

**Anti-Thesis (Challengers):**
- Moc Arch-Chal (or Phuc SA if unavailable): Domino effect check, data corruption assessment, blocks band-aid fixes with high risk

**Synthesis (Judge):**
- Dung PM (or C-Level/User for SEV-1): Trade-off analysis, merge decision, deploy authorization

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- RCA complete within ≤30 min (SEV-1), hotfix fixes root cause, no new issues introduced

**Phase C - Execute:**
- Tung Diag: Analyzes logs (Server, DataDog, Grafana), finds root cause ≤30 min (SEV-1)
- Tung Diag: Writes `ROOT_CAUSE.md` (timeline, root cause, impacted scope)
- Dev author: Creates `HOTFIX_PR.md` — only fixes exact function/lines broken (NO refactor, rename, or new features during hotfix)
- Communicate stakeholders every 30 min (SEV-1) or 2h (SEV-2)

**Phase D - Functional Verification:**
- Moc reviews `HOTFIX_PR.md` quickly (≤15 min for SEV-1)
- Questions: "Does fix cause domino effect to other services?" "Is corrupted data recoverable with rollback script?"
- Blocks band-aid fixes that create worse tech debt than current incident
- Approves or blocks with written rationale

**Phase E - Non-Functional Verification:**
- Dung PM analyzes trade-off: "Keep Production down" vs "Merge hotfix with risk X"
- If Moc approved: forces merge to `main` and urgent deploy
- Git blame traces original bug author for post-mortem scoring
- After Production stabilizes: creates tickets for Pipeline 3 + 4 cleanup

*Phases B/B2/F not used (emergency speed priority).*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- `docs/hotfix/ROOT_CAUSE.md`: Log analysis, root cause, impacted scope
- `docs/hotfix/HOTFIX_PR.md`: Exact lines changed, risk assessment
- `docs/hotfix/POST_MORTEM.md`: Timeline, root cause, prevention plan

**LEDGER Entries:**
- Production bug severity (P0 max ±30 points)
- Original bug author penalty
- Hotfix quality scoring

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- **Gate 9**: `gates/commit.sh` — Targeted git commit (no `git add .`), `POST_MORTEM.md` exists

**Manual Gates:**
- Moc approval for domino effect check
- Dung PM/C-Level merge authorization

**Communication Protocol:**
- SEV-1: Notify stakeholders immediately → update every 30 min → confirm resolved
- SEV-2: Notify within 30 min → update every 2h → confirm resolved
- SEV-3: Notify within 4h → update daily

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ Gate 9 PASS
- ✅ Production stable ≥30 min
- ✅ `POST_MORTEM.md` complete with prevention plan
- ✅ Cleanup tickets created for Pipeline 3 + 4

**Handoff to Next Pipeline:**
- Open Pipeline 3 (Coding) + Pipeline 4 (Testing) for proper cleanup

---

**L2 Cache Pre-Load:**
- `agents/core/tung-diag.md` (Tung Diag)
- `agents/core/moc-arch-chal.md` (Moc)
- `agents/BRAIN.md` (Dung PM)

**Token Count:** ~550 tokens
