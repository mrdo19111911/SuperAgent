# Installation & Setup Guide

Nash Agent Framework — a multi-agent orchestration framework that runs on Claude Code CLI.

---

## Prerequisites

- **Claude Code CLI** installed (`npm install -g @anthropic-ai/claude-code` or via Homebrew/other package manager)
- **Bash shell** (Linux/macOS native; Windows via Git Bash or WSL)
- **Git** for version control
- **Node.js 18+** for gate scripts that use npm
- A **project codebase** to apply the framework to

## Installation

```bash
git clone <repo-url> nash-agent-framework
cd nash-agent-framework
```

That's it. There are no dependencies to install. The framework is pure Markdown and Bash scripts — no build step, no `npm install`, no compilation.

## Configuration

The framework operates on YOUR project codebase via configurable path variables. Set these before your first run.

### Core Variables

Define these in your task artifacts or pass them when invoking agents:

| Variable | Purpose | Example |
|----------|---------|---------|
| `$PROJECT_ROOT` | Absolute path to your project directory | `/home/user/my-tms` |
| `$AGENT_DIR` | Path to `agents/` in this framework | `/home/user/nash-agent-framework/agents` |
| `$ARTIFACTS_DIR` | Where pipeline outputs are written | `./artifacts/T1_08_order-management` |
| `$SOURCE_OF_TRUTH` | Your top-level architecture document | `docs/MASTER_PLAN.md` |
| `$SPEC_FILE` | Task-level specification | `modules/T1_08/SPEC.md` |
| `$CONTRACTS_FILE` | Shared interface contracts (API/event envelopes) | `modules/T0_01/CONTRACTS.md` |
| `$VERIFY_CMD` | CLI verification command | `npm test`, `dotnet test`, `go test ./...` |
| `$VERIFY_PEER` | Non-CLI verification checklist or rubric | `system/SCORING_RULES.md` |
| `$CRITERIA_VERB` | What the Thesis agent (Tier 1) produces | `designs`, `specifies`, `architects` |
| `$DELIVERABLE_VERB` | What the Synthesis agent (Tier 2) produces | `implements`, `builds`, `codes` |

### Project Layout Expectations

The framework expects your project at a sibling directory or a configurable absolute path. A typical setup:

```
workspace/
├── nash-agent-framework/   # This framework
└── my-project/             # Your codebase ($PROJECT_ROOT)
```

## First Run — Boot Protocol

1. **Read the soul file** — `agents/BRAIN.md` defines the PM agent's identity, values, and operating principles.
2. **Read the active agent profile** — Each agent has an L2 Cache file under `agents/{layer}/`.
3. **Read the MoE Router** — `system/MIXTURE_OF_EXPERTS_ROUTER.md` determines which pipeline(s) to activate.
4. **Audit your module** — The PM agent scans your project, reads `$SOURCE_OF_TRUTH`, `$SPEC_FILE`, and `$CONTRACTS_FILE`.
5. **Pipeline selection** — The MoE Router selects the appropriate pipeline(s) based on audit results.
6. **Execute with Nash Triad** — Thesis, Anti-Thesis, and Synthesis agents collaborate through the selected pipeline.

## Customization

**Add a new agent:** Create a file at `agents/{layer}/{name}.md` following the L2 Cache format (identity, expertise, tools, scoring criteria). Register it in the MoE Router if it should be auto-selectable.

**Modify pipelines:** Edit files in `pipelines/`. Each pipeline is a sequence of numbered stages with entry/exit gates.

**Adjust scoring:** Edit `system/SCORING_RULES.md` to change pass/fail thresholds, weight distributions, or add new scoring dimensions.

**Add gate scripts:** Place executable scripts in `gates/`. Gates run automatically between pipeline stages to enforce quality thresholds (test coverage, lint, type-check).

## Skills (Claude Code Commands)

SuperAgent ships with reusable skills that install as slash commands in any project.

### Available Skills

| Command | Skill | Description |
|---------|-------|-------------|
| `/task` | `nash-orchestrator` | Spawn Dũng PM — full NASH pipeline orchestration |
| `/sum` | `session-sum` | Summarize session progress → `PROJECT_CONTEXT.md` |
| `/tiep` | `session-tiep` | Continue from where last session left off |
| `/arch` | `arch-diagram` | Auto-generate D2 architecture diagram from codebase |
| `/quality-gate` | `quality-gate` | Pre-approve checklist before pipeline approval |
| `/data-flow-review` | `data-flow-review` | Multi-perspective data flow audit |
| `/data-persistence-audit` | `data-persistence-audit` | Resource lifecycle completeness audit |
| `/e2e-scenario-test` | `e2e-scenario-test` | E2E user scenario test priority audit |

### Install Skills into Your Project

From your **project root** (not from inside SuperAgent):

```bash
bash SuperAgent/scripts/install-skills.sh
```

This creates thin wrapper files in `.claude/commands/` that point back to SuperAgent. Each wrapper is ~3 lines — the full logic stays in SuperAgent and updates when you `git pull`.

**What it does:**
1. Scans `.agents/skills/*/SKILL.md` for all available skills
2. Extracts command name from each SKILL.md title (e.g., `` `/task` `` → `task.md`)
3. Creates `.claude/commands/<name>.md` wrappers
4. Skips any custom commands that aren't thin wrappers (safe to re-run)

### Adding SuperAgent to a New Project

**Option A: Git Submodule (recommended)**

```bash
cd your-project
git submodule add https://github.com/mrdo19111911/SuperAgent.git
bash SuperAgent/scripts/install-skills.sh
```

Future clones:

```bash
git clone --recurse-submodules https://github.com/you/your-project.git
cd your-project
bash SuperAgent/scripts/install-skills.sh
```

**Option B: Direct Clone (standalone)**

```bash
cd your-project
git clone https://github.com/mrdo19111911/SuperAgent.git
bash SuperAgent/scripts/install-skills.sh
echo "SuperAgent/" >> .gitignore
```

### Creating New Skills

1. Create directory: `.agents/skills/<skill-name>/`
2. Add `SKILL.md`:
   ```markdown
   # Skill Title (`/command-name`)
   > Agent: Agent Name | Trigger: when to use this skill

   ## Steps
   ...
   ```
3. Run `bash SuperAgent/scripts/install-skills.sh` from project root
4. Command name is extracted from the backtick-wrapped `/name` in the title

### Skill Architecture

```
.agents/skills/                  ← Source of truth (versioned in Git)
├── nash-orchestrator/SKILL.md   ← /task
├── session-sum/SKILL.md         ← /sum
├── session-tiep/SKILL.md        ← /tiep
├── arch-diagram/SKILL.md        ← /arch
└── .../SKILL.md

your-project/.claude/commands/   ← Auto-generated thin wrappers
├── task.md                      → "Read and follow .../SKILL.md"
├── sum.md
└── ...
```

Skills use relative paths (`SuperAgent/agents/BRAIN.md`), so they work in any project where SuperAgent is at the root level.

## Directory Structure

```
nash-agent-framework/
├── .agents/
│   └── skills/      # 8 reusable Claude Code skills
├── agents/          # 24 agent profiles (L2 Cache format)
├── system/          # Core theory, scoring rules, MoE routing
├── pipelines/       # 6 SDLC pipelines + FE design/impl flows
├── gates/           # Automated quality gate scripts
├── scripts/         # Utility + install-skills.sh
├── artifacts/       # Runtime output (created per-task)
├── tmp/             # Temporary runtime data
├── main.md          # PM operating system
├── CLAUDE.md        # Framework-level instructions for Claude Code
├── README.md        # Overview and quick start
├── GUIDE.md         # Deep walkthrough of concepts
└── INSTALLATION.md  # This file
```

## Troubleshooting

- **"Command not found: claude"** — Ensure Claude Code CLI is installed and on your `$PATH`.
- **Gate scripts fail silently** — Check that scripts in `gates/` have execute permissions (`chmod +x gates/*.sh`).
- **Artifacts not appearing** — Verify `$ARTIFACTS_DIR` points to a writable directory. The framework does not create it automatically.
- **Wrong pipeline selected** — Review `system/MIXTURE_OF_EXPERTS_ROUTER.md` routing rules. You can override by specifying the pipeline directly.
- **Skills not showing** — Run `bash SuperAgent/scripts/install-skills.sh` from project root. Check `.claude/commands/` was created.
- **`/task` not working** — Verify SuperAgent is at project root level. Skills use relative paths like `SuperAgent/agents/BRAIN.md`.
