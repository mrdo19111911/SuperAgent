# Nash Agent Framework — CLAUDE.md

**Nash Agent Framework (Anti_propost_0.1)** — MoE Router + Nash Triad + 3-tier memory.

---

## Quick Commands

```bash
bash gates/validate.sh <module_dir>   # Build + tsc + tests + no TODO/FIXME
bash gates/qa.sh <module_dir> [url]   # SAST + test distribution + smoke
bash gates/security.sh <module_dir>   # Secrets scan + dep audit
bash gates/commit.sh <module> [msg]   # Pre-validate → safe git commit
bash scripts/merge_audit.sh <dir>     # Merge 3 audit → AUDIT_REPORT_FINAL.md
```

---

## Architecture

1. **Phase -1 (Audit):** Tung Diag → 3 parallel sub-audits → `merge_audit.sh` → `AUDIT_REPORT_FINAL.md`
2. **MoE Router** (`system/MIXTURE_OF_EXPERTS_ROUTER.md`) selects pipelines from audit

6 Pipelines with Nash Triad (Thesis/Anti-Thesis/Synthesis):

| # | Pipeline | Thesis | Anti-Thesis | Synthesis |
|---|----------|--------|-------------|-----------|
| 1 | Requirements | Dung PM + Chau UX | Conan | User |
| 2 | Architecture | Phuc SA + Quang | Moc + Lan | Dung PM |
| 3 | Coding | Dev agents | ESLint + Moc | Phuc SA |
| 4 | Testing | Son QA + Huyen FE-QA | Lan | Dung PM |
| 5 | Security | CI/CD + Thanh Lai | Ngu | User |
| 6 | Hotfix | Tung + Lan | Moc | Dung PM |

## 3-Tier Memory

```
L2 Cache  →  agents/{layer}/{agent}.md    Always loaded (<500 tokens)
RAM       →  tmp/ram/{agent}/*.md         On-demand deep reference
HDD       →  Source code / schema         Never preloaded
```

PEN/WIN entries in L2 Cache = hard constraints. Format: `agents/README.md`.

---

## Boot Protocol

1. `agents/BRAIN.md` → Soul file, Rule 0 (token conservation)
2. `agents/{layer}/{agent}.md` → L2 Cache
3. `system/MIXTURE_OF_EXPERTS_ROUTER.md` → Workflow
4. `tmp/ram/{agent}/` → Only when needed

**Rule 0:** TOKEN is food, Context Window is lifeline. Read only when needed. Write short.

---

## Gates (5 scripts)

| Script | Purpose | When |
|--------|---------|------|
| `validate.sh` | Build + tsc + tests + no TODO/FIXME (polyglot) | After coding |
| `integrity.sh` | Detect mocks/placeholders in integration tests | Before integration tests |
| `qa.sh` | SAST + test distribution + smoke test | Before merge |
| `security.sh` | Hardcoded secrets + dependency audit | Before deploy |
| `commit.sh` | Pre-validate → exclude secrets → targeted git commit | Final step |

> Doc quality validated by Nash Triad LLM review, not grep scripts.

---

## Scoring (Zero-Sum)

P0=+-30 (collusion/lazy review) | P1=+-20 (bug at QA) | P2=+-15 (contract drift) | P3=+-10 (TODO at validate) | P4=+-5 (nitpick). Main Agent writes LEDGER, agents cannot self-score.

## Non-Negotiable Rules

1. Nash Triad in every pipeline — no self-approval
2. PEN entries = hard constraints — check before submitting
3. Token conservation — read only when needed, write concisely
4. Gate scripts are law — no manual overrides
5. Evidence-based scoring — commit/log/gate evidence required
6. Targeted git add — never `git add .`

---

*Nash Agent Framework | See `GUIDE.md` for full documentation*
