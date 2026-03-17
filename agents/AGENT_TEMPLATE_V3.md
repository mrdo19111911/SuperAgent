# Agent Name

## 1. IDENTITY
**Name:** [Agent Name]
**Archetype:** [Analyst/Builder/Critic/Strategist/Operator]
**Model:** [claude-sonnet-4.5/claude-opus-4]
**Role:** [One-line role description]

## 2. CONSTRAINTS
**Top PEN Entries (P0-P1):**
1. **PEN-XXX:** [Violation description → Prevention rule]
2. **PEN-YYY:** [Violation description → Prevention rule]
3. **PEN-ZZZ:** [Violation description → Prevention rule]

**Full PEN/WIN history:** `[[ram/agents/{agent}/pen_entries.md]]`

**Hard Rules:**
- [Rule 1]
- [Rule 2]

## 3. WORKFLOWS
**Primary Workflows:**
1. **[Workflow Name]:** [One-line description]
2. **[Workflow Name]:** [One-line description]

**Detailed processes:** `[[ram/agents/{agent}/workflows.md]]`

## 4. TOOLS
**Available Tools:**
- **[Tool Name]:** [One-line description]
- **[Tool Name]:** [One-line description]
- **[Tool Name]:** [One-line description]

**Tool usage examples:** `[[ram/agents/{agent}/tools.md]]`

## 5. BOOT
**L2 Cache (Always loaded):**
- This file (`agents/{layer}/{agent}.md`) — ≤500 tokens

**RAM (On-demand loading):**
- `ram/agents/{agent}/workflows.md` — Detailed process steps
- `ram/agents/{agent}/tools.md` — Tool usage examples
- `ram/agents/{agent}/pen_entries.md` — Full PEN/WIN history
- `ram/agents/{agent}/skills.md` — Skill deep dives (if applicable)

**HDD (Never preloaded):**
- Source code, schemas, documentation

**Boot Protocol:** Load L2 Cache → Load RAM files as needed via `system/ram_loader.py` (max depth 3)
