# System Architecture

**Created:** 2026-03-17
**Updated:** 2026-03-17
**Owner:** Dung PM
**Scope:** core

## Summary

Nash Agent Framework: MoE Router + Nash Triad + 3-tier memory for multi-agent SDLC.

## Key Facts

- **Nash Triad:** Every pipeline uses Thesis → Anti-Thesis → Synthesis review [NASH_SUBAGENT_PROMPTS.md:83-103]
- **Zero-Sum Scoring:** P0-P4 penalties with M1/M2/M3 multipliers [SCORING_RULES.md:6-12]
- **6 Pipelines:** Trivial, Simple, Complex, Critical, NASH, Urgent [NASH_SUBAGENT_PROMPTS.md:63-78]
- **MoE Router:** 12-dimension audit → pipeline selection [MIXTURE_OF_EXPERTS_ROUTER.md]
- **3-Tier Memory:** L2 Cache (<500 tokens), RAM (on-demand), HDD (source code) [BRAIN.md]

## Tech Stack

- **LLM:** Claude Sonnet 4.5 (primary)
- **Language:** TypeScript, Bash, Markdown
- **Version Control:** Git with targeted commits
- **Quality Gates:** validate.sh, integrity.sh, qa.sh, security.sh (parallel execution)

## Gate Execution

**Parallel mode (v6.5+):**
```bash
bash gates/parallel_validate.sh <module>
# Runs 4 gates concurrently: validate + integrity + qa + security
# Speedup: 11 min → 4 min (2.75x)
```

**Sequential mode (deprecated):**
```bash
bash gates/validate.sh <module>    # 2 min
bash gates/integrity.sh <module>   # 3 min
bash gates/qa.sh <module>          # 4 min
bash gates/security.sh <module>    # 2 min
# Total: 11 min
```

## Directory Structure

```
nash-agent-framework/
├── system/
│   ├── templates/NASH_SUBAGENT_PROMPTS.md  # v6.6 dispatch template
│   ├── SCORING_RULES.md                    # P0-P4 penalties
│   ├── MIXTURE_OF_EXPERTS_ROUTER.md        # MoE routing logic
│   └── NASH.md                             # Nash Equilibrium rules
├── agents/
│   ├── core/           # 9 core agents (L2 Cache)
│   ├── dev/            # 10 dev agents
│   ├── research/       # 5 research agents
│   └── knowledge/      # Persistent knowledge items (v6.6+)
├── gates/              # Quality gates (polyglot: TS/Go/.NET/Py)
│   ├── parallel_validate.sh  # v6.5 parallel executor
│   ├── validate.sh
│   ├── integrity.sh
│   ├── qa.sh
│   └── security.sh
└── pipelines/          # 6 SDLC pipelines + Design Flow + FE Implementation
```

## Pipeline Selection (MoE Router)

| Scope | Pipeline | Example Use Case |
|-------|----------|------------------|
| <3 SP | Trivial | Bug fix, typo correction |
| 3-10 SP | Simple | Add validation, update config |
| 10-30 SP | Complex | Add feature, refactor module |
| 30+ SP | Critical | New architecture, breaking changes |
| Exploratory | NASH | Debug unknown issue, research design |
| Time-critical | Urgent | Production hotfix, deadline push |

## Approval Gates (v6.5+)

**Complex/Critical pipelines MUST get user approval after Phase B2:**
```
S1:A  Define criteria
S2:B  Audit completeness
S3:B2 Audit correctness
S4:Main → PASS
S5:APPROVAL "Proceed with execution?" [User: APPROVE/REVISE/REJECT]
S6:C  Execute
...
```

## File Operation Modes (v6.6+)

Before Edit(), classify scope:
- **surgical** (1-10 lines): Verify unique via `grep -c "old_string" file = 1`
- **rewrite** (>50% file): Use Write() instead of Edit()
- **inject** (append): Add at logical boundary (end of class/file)

## Related Knowledge Items

- [Coding Conventions](conventions.md)
- [Dependencies](dependencies.md)

## References

- [CLAUDE.md](../../../CLAUDE.md)
- [NASH_SUBAGENT_PROMPTS.md v6.6](../../../system/templates/NASH_SUBAGENT_PROMPTS.md)
- [SCORING_RULES.md](../../../system/SCORING_RULES.md)
- [MoE Router](../../../system/MIXTURE_OF_EXPERTS_ROUTER.md)
