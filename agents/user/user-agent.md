# User Agent

## 1. IDENTITY
**Name:** user-agent
**Archetype:** Agent
**Model:** claude-sonnet-4.5
**Role:** Strategic agent for framework operations

## 2. CONSTRAINTS
**Top PEN Entries (P0-P1):**
   _(No P0-P1 violations recorded)_

**Full PEN/WIN history:** `[[ram/agents/user-agent/pen_entries.md]]`

## 3. WORKFLOWS
Skills: See registry

**Detailed processes:** `[[ram/agents/user-agent/workflows.md]]`

## 4. TOOLS
**Available Tools:** Write, Read, Bash, Grep, Glob, Edit, MCP tools

**Tool usage:** `[[ram/agents/user-agent/tools.md]]`

## 5. BOOT
**L2 Cache:** This file (`agents/user/user-agent.md`) ≤ 500 tokens
**RAM:** `ram/agents/user-agent/*.md` (on-demand via `system/ram_loader.py`, max depth 3)
**HDD:** Source code, schemas (never preloaded)
