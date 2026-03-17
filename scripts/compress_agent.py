#!/usr/bin/env python3
"""
Agent compression helper script.
Compresses agent files to ≤500 tokens by extracting content to RAM.
"""

import re
import tiktoken
from pathlib import Path


def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


def extract_pen_entries(content: str) -> tuple[str, str]:
    """
    Extract PEN entries from agent file.

    Returns:
        (top_3_pen, full_pen) - Top 3 P0-P1 entries and full PEN history
    """
    # Find PEN section
    pen_match = re.search(r'## PEN.*?(?=\n##|\Z)', content, re.DOTALL)
    if not pen_match:
        return ("", "")

    pen_section = pen_match.group(0)

    # Extract P0-P1 entries (top 3)
    p0_p1_pattern = r'(?:### P0.*?|### P1.*?)(?=\n###|\n##|\Z)'
    p0_p1_matches = re.findall(p0_p1_pattern, pen_section, re.DOTALL)

    # Get first 3 entries
    top_entries = []
    entry_count = 0
    for section in p0_p1_matches:
        entries = re.findall(r'\*\*PEN-\d+.*?(?=\n\*\*PEN-|\n###|\n##|\Z)', section, re.DOTALL)
        for entry in entries:
            if entry_count < 3:
                top_entries.append(entry.strip())
                entry_count += 1

    top_3_pen = "\n\n".join(top_entries) if top_entries else "(No P0-P1 PEN entries)"

    return (top_3_pen, pen_section)


def extract_workflows(content: str) -> str:
    """Extract workflow/process sections from agent file."""
    # Look for workflow-related sections
    patterns = [
        r'## Task Delegation Principles.*?(?=\n##|\Z)',
        r'## Quick Ref.*?(?=\n##|\Z)',
        r'## Current Focus.*?(?=\n##|\Z)',
        r'### .*? Checklist.*?(?=\n###|\n##|\Z)',
        r'### .*? Template.*?(?=\n###|\n##|\Z)',
    ]

    workflows = []
    for pattern in patterns:
        matches = re.findall(pattern, content, re.DOTALL)
        workflows.extend(matches)

    return "\n\n".join(workflows) if workflows else "# Workflows\n\n(To be documented)"


def extract_tools(content: str) -> str:
    """Extract tools section from agent file."""
    tools_match = re.search(r'## Tools.*?(?=\n##|\Z)', content, re.DOTALL)
    if tools_match:
        return tools_match.group(0)
    return "# Tools\n\n(To be documented)"


def create_compressed_agent(agent_path: Path, template_path: Path, ram_dir: Path) -> str:
    """
    Compress agent file using AGENT_TEMPLATE_V3.md.

    Returns:
        Compressed agent content (≤500 tokens)
    """
    content = agent_path.read_text(encoding='utf-8')

    # Extract metadata
    archetype_match = re.search(r'\*\*Archetype:\*\*\s*(.+)', content)
    model_match = re.search(r'\*\*Model:\*\*\s*(.+)', content)
    pipeline_match = re.search(r'\*\*Primary Pipeline:\*\*\s*(.+)', content)
    mission_match = re.search(r'## Core Mission.*?(?=\n##|\Z)', content, re.DOTALL)
    skills_match = re.search(r'\*\*Top 5 Skills:\*\*.*?(?=\n\n|^_)', content, re.DOTALL)

    archetype = archetype_match.group(1).strip() if archetype_match else "Analyst"
    model = model_match.group(1).strip() if model_match else "claude-sonnet-4.5"
    mission = mission_match.group(0) if mission_match else ""

    # Extract PEN entries
    top_3_pen, full_pen = extract_pen_entries(content)

    # Extract workflows and tools
    workflows = extract_workflows(content)
    tools_section = extract_tools(content)

    # Create RAM directory structure
    agent_name = agent_path.stem
    agent_ram_dir = ram_dir / agent_name
    agent_ram_dir.mkdir(parents=True, exist_ok=True)

    # Save extracted content to RAM
    (agent_ram_dir / "workflows.md").write_text(workflows, encoding='utf-8')
    (agent_ram_dir / "tools.md").write_text(tools_section, encoding='utf-8')
    (agent_ram_dir / "pen_entries.md").write_text(full_pen, encoding='utf-8')

    # Get agent layer (core/dev/research/user)
    layer = agent_path.parent.name

    # Build compressed agent using template
    compressed = f"""# {agent_name.replace('-', ' ').title()}

## 1. IDENTITY
**Name:** {agent_name}
**Archetype:** {archetype}
**Model:** {model}
**Role:** {mission.split('\\n')[2].strip('- ') if mission else 'TBD'}

## 2. CONSTRAINTS
**Top PEN Entries (P0-P1):**
{top_3_pen}

**Full PEN/WIN history:** `[[ram/agents/{agent_name}/pen_entries.md]]`

## 3. WORKFLOWS
**Primary Workflows:**
(See detailed processes in RAM)

**Detailed processes:** `[[ram/agents/{agent_name}/workflows.md]]`

## 4. TOOLS
**Available Tools:**
- **Write:** Save outputs to disk
- **Read:** Read files
- **MCP Tools:** Use when applicable

**Tool usage examples:** `[[ram/agents/{agent_name}/tools.md]]`

## 5. BOOT
**L2 Cache (Always loaded):**
- This file (`agents/{layer}/{agent_name}.md`) — ≤500 tokens

**RAM (On-demand loading):**
- `ram/agents/{agent_name}/workflows.md` — Detailed process steps
- `ram/agents/{agent_name}/tools.md` — Tool usage examples
- `ram/agents/{agent_name}/pen_entries.md` — Full PEN/WIN history

**Boot Protocol:** Load L2 Cache → Load RAM files as needed via `system/ram_loader.py` (max depth 3)
"""

    return compressed


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python compress_agent.py <agent_file>")
        sys.exit(1)

    agent_file = Path(sys.argv[1])
    template_file = Path("e:/SuperAgent/agents/AGENT_TEMPLATE_V3.md")
    ram_dir = Path("e:/SuperAgent/ram/agents")

    if not agent_file.exists():
        print(f"Error: {agent_file} not found")
        sys.exit(1)

    # Compress agent
    compressed_content = create_compressed_agent(agent_file, template_file, ram_dir)

    # Check token count
    tokens = count_tokens(compressed_content)

    print(f"Agent: {agent_file.name}")
    print(f"Compressed tokens: {tokens}")

    if tokens > 500:
        print(f"⚠️  Warning: Exceeds 500 token limit by {tokens - 500} tokens")
    else:
        print(f"✅ Within 500 token limit (margin: {500 - tokens} tokens)")

    # Save compressed version
    backup_file = agent_file.with_suffix('.md.bak')
    agent_file.rename(backup_file)
    agent_file.write_text(compressed_content, encoding='utf-8')

    print(f"✅ Compressed agent saved to {agent_file}")
    print(f"📦 Backup saved to {backup_file}")
    print(f"📁 RAM content saved to ram/agents/{agent_file.stem}/")
