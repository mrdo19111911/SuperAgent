# Pipeline Template (Standard 6-Section Format)

**Version:** 1.0
**Target Token Limit:** ≤600 tokens
**Naming Convention:**
- Standard pipelines: `{id}_{name}.md` (must follow this template)
- Complex pipelines: `{name}_CUSTOM.md` (escape hatch, custom structure allowed)

---

## 1. TRIGGER (When to activate this pipeline)

**Audit Signals:**
- [List audit dimension triggers, e.g., C1=empty, C4=spaghetti]

**Conditions:**
- [Specific conditions that activate this pipeline]

---

## 2. AGENTS (Thesis → Anti-Thesis → Synthesis)

**Thesis (Builders):**
- [Agent 1]: [Role/responsibility]
- [Agent 2]: [Role/responsibility]

**Anti-Thesis (Challengers):**
- [Agent]: [What they challenge]

**Synthesis (Judge):**
- [Agent]: [Final approval authority]

---

## 3. PHASES (A→B→C→D→E→F as applicable)

**Phase A - Acceptance Criteria:**
- [Define success criteria]

**Phase B - Completeness Audit:**
- [Review A independently]

**Phase B2 - Correctness Audit:**
- [Review A for errors]

**Phase C - Execute:**
- [Implementation work]

**Phase D - Functional Verification:**
- [Review C output]

**Phase E - Non-Functional Verification:**
- [Performance, security, a11y]

**Phase F - Cross-Cutting Review:**
- [Critical pipelines only - review C+D+E]

*Note: Not all phases required. Minimum: A→C→D. Critical pipelines use all 6.*

---

## 4. OUTPUTS (Deliverables)

**Required Artifacts:**
- [File 1]: [Description]
- [File 2]: [Description]

**Optional Artifacts:**
- [File 3]: [When created]

**LEDGER Entries:**
- [Scoring events tracked in artifacts/{task}/LEDGER.md]

---

## 5. GATES (Quality checks before exit)

**Gate Scripts:**
- `gates/validate.sh`: [What it checks]
- `gates/integrity.sh`: [When applicable]
- `gates/qa.sh`: [SAST + smoke tests]
- `gates/security.sh`: [Pre-deploy only]

**Manual Gates:**
- [Human approval points]

---

## 6. EXIT (Success criteria)

**Pipeline Complete When:**
- ✅ All gates pass
- ✅ Synthesis agent approves
- ✅ Required artifacts created
- ✅ No P0/P1 issues in LEDGER

**Handoff to Next Pipeline:**
- [Which pipeline runs next, if any]

---

## Custom Pipeline Escape Hatch

**If this template is insufficient** (e.g., >6 phases, unique flow):
1. Rename file to `{name}_CUSTOM.md`
2. Add justification comment at top explaining why template doesn't fit
3. Validator (`gates/validate_pipeline_template.sh`) will skip `*_CUSTOM.md` files

**Example justification:**
```markdown
<!-- CUSTOM PIPELINE JUSTIFICATION:
This pipeline requires 8 stages with iterative feedback loops (wireframe → review → revise),
which doesn't fit the linear A→B→C→D flow. Custom structure preserves design iteration logic.
-->
```

---

**Token Budget:** This template = ~600 tokens. Actual pipelines should compress to ≤600 tokens.
