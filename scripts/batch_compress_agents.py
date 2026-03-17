#!/usr/bin/env python3
"""
Batch agent compression script.
Compresses all agents to ≤500 tokens systematically.
"""

import re
import tiktoken
from pathlib import Path
from typing import Dict, List, Tuple


def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


def compress_agent_smart(agent_path: Path, ram_base: Path) -> Tuple[str, Dict]:
    """
    Smart compression: Extract verbose content, keep core identity.

    Returns:
        (compressed_content, stats_dict)
    """
    content = agent_path.read_text(encoding='utf-8')
    original_tokens = count_tokens(content)

    # Extract key metadata
    archetype = re.search(r'\*\*Archetype:\*\*\s*(.+?)(?:\n|\|)', content)
    archetype = archetype.group(1).strip() if archetype else "Agent"

    model = re.search(r'\*\*Model:\*\*\s*(.+)', content)
    model = model.group(1).strip() if model else "claude-sonnet-4.5"

    # Extract core mission (first bullet or line from Core Mission section)
    mission_section = re.search(r'## Core Mission.*?\n\n(.*?)(?:\n\n|\n##)', content, re.DOTALL)
    if mission_section:
        mission_text = mission_section.group(1).strip()
        # Get first meaningful line
        lines = [l.strip('- ') for l in mission_text.split('\n') if l.strip().startswith('-')]
        role = lines[0][:100] if lines else mission_text.split('\n')[0][:100]
    else:
        role = "Strategic agent for framework operations"

    # Extract TOP 3 P0-P1 PEN entries (most critical)
    pen_entries = []
    pen_section = re.search(r'## PEN.*?(?=\n## (?!P[012])|$)', content, re.DOTALL)
    if pen_section:
        # Find P0 and P1 entries
        p0_entries = re.findall(r'\*\*PEN-\d+.*?(?=\n\*\*PEN-|\n###|\n##|$)', pen_section.group(0), re.DOTALL)
        for entry in p0_entries[:3]:  # Top 3 only
            # Condense: keep violation and prevention only
            lines = entry.strip().split('\n')
            header = lines[0] if lines else ""
            prevention = next((l for l in lines if 'Prevention:' in l or 'Rule:' in l), "")
            pen_entries.append(f"{header}\n   {prevention}")

    top_pen = "\n".join(pen_entries[:3]) if pen_entries else "   _(No P0-P1 violations recorded)_"

    # Extract primary workflows (simplified list)
    workflows = []
    # Look for dispatch table, quick ref, or task delegation
    dispatch_table = re.search(r'\| When \| Call Who \|.*?(?=\n\n##|\n\n---)', content, re.DOTALL)
    if dispatch_table:
        workflows.append("**Dispatch Table:** See RAM for full mapping")

    # Get top 3-5 skills (already condensed in most agents)
    skills_section = re.search(r'\*\*Top \d+ Skills:\*\*.*?(?=\n\n|^_)', content, re.DOTALL)
    skills_list = skills_section.group(0) if skills_section else "Skills: See registry"

    # Tools (always simple)
    tools = ["Write", "Read", "Bash", "Glob", "Grep", "Edit"]

    # Create RAM directory
    agent_name = agent_path.stem
    agent_ram_dir = ram_base / agent_name
    agent_ram_dir.mkdir(parents=True, exist_ok=True)

    # Save full sections to RAM
    # 1. Full PEN/WIN history
    full_pen_win = pen_section.group(0) if pen_section else "## PEN\n\n_(Empty)_"
    win_section = re.search(r'## WIN.*?(?=\n## (?!P)|$)', content, re.DOTALL)
    if win_section:
        full_pen_win += "\n\n" + win_section.group(0)
    (agent_ram_dir / "pen_entries.md").write_text(full_pen_win, encoding='utf-8')

    # 2. Detailed workflows
    workflow_sections = []
    for pattern in [r'## Task Delegation.*?(?=\n## |$)',
                    r'## Quick Ref.*?(?=\n## |$)',
                    r'## Current Focus.*?(?=\n## |$)',
                    r'## Dispatch Table.*?(?=\n## |$)']:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            workflow_sections.append(match.group(0))
    workflows_content = "\n\n".join(workflow_sections) if workflow_sections else "# Workflows\n\n(To be documented)"
    (agent_ram_dir / "workflows.md").write_text(workflows_content, encoding='utf-8')

    # 3. Tools and examples
    tools_section = re.search(r'## Tools.*?(?=\n## |$)', content, re.DOTALL)
    tools_content = tools_section.group(0) if tools_section else "# Tools\n\nStandard agent toolkit."
    (agent_ram_dir / "tools.md").write_text(tools_content, encoding='utf-8')

    # 4. Skills (if has detailed skill section)
    skills_content = f"# Skills\n\n{skills_list}\n\nFull skill list: See agents/skills/_registry.json → used_by"
    (agent_ram_dir / "skills.md").write_text(skills_content, encoding='utf-8')

    # Get layer
    layer = agent_path.parent.name

    # Build compressed agent
    compressed = f"""# {agent_name.replace('-', ' ').title()}

## 1. IDENTITY
**Name:** {agent_name}
**Archetype:** {archetype}
**Model:** {model}
**Role:** {role}

## 2. CONSTRAINTS
**Top PEN Entries (P0-P1):**
{top_pen}

**Full PEN/WIN history:** `[[ram/agents/{agent_name}/pen_entries.md]]`

## 3. WORKFLOWS
{skills_list}

**Detailed processes:** `[[ram/agents/{agent_name}/workflows.md]]`

## 4. TOOLS
**Available Tools:** Write, Read, Bash, Grep, Glob, Edit, MCP tools

**Tool usage:** `[[ram/agents/{agent_name}/tools.md]]`

## 5. BOOT
**L2 Cache:** This file (`agents/{layer}/{agent_name}.md`) ≤ 500 tokens
**RAM:** `ram/agents/{agent_name}/*.md` (on-demand via `system/ram_loader.py`, max depth 3)
**HDD:** Source code, schemas (never preloaded)
"""

    compressed_tokens = count_tokens(compressed)

    stats = {
        'agent': agent_name,
        'original_tokens': original_tokens,
        'compressed_tokens': compressed_tokens,
        'reduction': original_tokens - compressed_tokens,
        'reduction_pct': round((1 - compressed_tokens/original_tokens) * 100, 1) if original_tokens > 0 else 0,
        'within_limit': compressed_tokens <= 500
    }

    return compressed, stats


def main():
    """Batch compress all agents."""
    repo_root = Path("e:/SuperAgent")
    ram_base = repo_root / "ram" / "agents"
    ram_base.mkdir(parents=True, exist_ok=True)

    # Find all agents
    agent_files = []
    for layer in ['core', 'dev', 'research', 'user']:
        layer_dir = repo_root / "agents" / layer
        if layer_dir.exists():
            agent_files.extend(list(layer_dir.glob("*.md")))

    print(f"Found {len(agent_files)} agents to compress\n")

    all_stats = []

    for agent_file in sorted(agent_files):
        print(f"Compressing {agent_file.name}...")

        try:
            compressed_content, stats = compress_agent_smart(agent_file, ram_base)

            # Backup original
            backup_file = agent_file.with_suffix('.md.bak')
            if not backup_file.exists():
                agent_file.rename(backup_file)
                agent_file.write_text(compressed_content, encoding='utf-8')
            else:
                # Backup already exists, just overwrite
                agent_file.write_text(compressed_content, encoding='utf-8')

            all_stats.append(stats)

            status = "[OK]" if stats['within_limit'] else "[WARN]"
            print(f"  {status} {stats['original_tokens']} -> {stats['compressed_tokens']} tokens "
                  f"({stats['reduction_pct']}% reduction)\n")

        except Exception as e:
            print(f"  [ERROR] {e}\n")
            all_stats.append({
                'agent': agent_file.stem,
                'original_tokens': 0,
                'compressed_tokens': 0,
                'reduction': 0,
                'reduction_pct': 0,
                'within_limit': False,
                'error': str(e)
            })

    # Summary
    print("\n" + "="*80)
    print("COMPRESSION SUMMARY")
    print("="*80)
    print(f"{'Agent':<30} {'Before':<10} {'After':<10} {'Reduction':<12} {'Status'}")
    print("-"*80)

    total_before = 0
    total_after = 0
    within_limit = 0

    for stat in all_stats:
        if 'error' in stat:
            print(f"{stat['agent']:<30} {'ERROR':<10} {'ERROR':<10} {'N/A':<12} [FAIL]")
        else:
            total_before += stat['original_tokens']
            total_after += stat['compressed_tokens']
            if stat['within_limit']:
                within_limit += 1

            status = "[PASS]" if stat['within_limit'] else f"[FAIL +{stat['compressed_tokens']-500}]"
            print(f"{stat['agent']:<30} {stat['original_tokens']:<10} {stat['compressed_tokens']:<10} "
                  f"{stat['reduction_pct']}%{'':<7} {status}")

    print("-"*80)
    print(f"{'TOTAL':<30} {total_before:<10} {total_after:<10} "
          f"{round((1-total_after/total_before)*100,1) if total_before>0 else 0}%")
    print(f"\n[PASS] Agents within limit: {within_limit}/{len(all_stats)}")
    print(f"[WARN] Agents over limit: {len(all_stats) - within_limit}/{len(all_stats)}")

    # Save report
    report_file = repo_root / "artifacts" / "refactor" / "agent_compression_report.txt"
    report_file.parent.mkdir(parents=True, exist_ok=True)

    with open(report_file, 'w') as f:
        f.write("AGENT COMPRESSION REPORT\n")
        f.write("="*80 + "\n\n")
        f.write(f"Total agents: {len(all_stats)}\n")
        f.write(f"Within 500 token limit: {within_limit}\n")
        f.write(f"Over 500 token limit: {len(all_stats) - within_limit}\n\n")
        f.write(f"Total tokens before: {total_before}\n")
        f.write(f"Total tokens after: {total_after}\n")
        f.write(f"Total reduction: {total_before - total_after} tokens ({round((1-total_after/total_before)*100,1)}%)\n\n")
        f.write("Per-agent breakdown:\n")
        for stat in all_stats:
            f.write(f"  {stat['agent']}: {stat.get('original_tokens', 0)} -> {stat.get('compressed_tokens', 0)} "
                    f"({'PASS' if stat.get('within_limit') else 'FAIL'})\n")

    print(f"\n[INFO] Report saved to {report_file}")


if __name__ == "__main__":
    main()
