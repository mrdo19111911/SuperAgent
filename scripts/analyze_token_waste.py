#!/usr/bin/env python3
import os, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def count_tokens(f):
    try: return int(len(open(f, encoding='utf-8').read().split()) * 0.75)
    except: return 0

print("="*70)
print("TOKEN WASTE ANALYSIS - ACTIVE COMPONENTS ONLY")
print("="*70)

# Bootstrap
print("\n[1] BOOTSTRAP (always loaded):")
bootstrap = [('core/boot/BOOTSTRAP.md', count_tokens('core/boot/BOOTSTRAP.md')),
             ('core/boot/NASH_RULES.md', count_tokens('core/boot/NASH_RULES.md'))]
for f, t in bootstrap:
    print(f"  {f:45s} {t:5d} tokens")
total_bootstrap = sum(t for _, t in bootstrap)
print(f"  TOTAL: {total_bootstrap} tokens (target: 300)")
print(f"  WASTE: {total_bootstrap - 300} tokens (2.6x over target)")

# Stage 1
print("\n[2] STAGE 1 REQUIRED (always loaded):")
stage1 = [('agents/core/tung-diag.md', count_tokens('agents/core/tung-diag.md')),
          ('core/metadata/METADATA.yaml', count_tokens('core/metadata/METADATA.yaml'))]
for f, t in stage1:
    print(f"  {f:45s} {t:5d} tokens")
total_stage1 = sum(t for _, t in stage1)
print(f"  TOTAL: {total_stage1} tokens")
metadata_waste = max(0, stage1[1][1] - 400)
print(f"  WASTE: {metadata_waste} tokens (METADATA.yaml could be 400)")

# Skills
print("\n[3] SKILLS REGISTRY (always loaded - CAN BE CONDITIONAL!):")
skills_tokens = count_tokens('ram/skills/_registry.json')
print(f"  ram/skills/_registry.json {skills_tokens:29d} tokens")
print(f"  WASTE: {int(skills_tokens * 0.5)} tokens avg (50% tasks don't need)")

# Active Agents (exclude .bak and skills.bak/)
print("\n[4] ACTIVE AGENTS (core/dev/research/user - excluding backups):")
agents = []
for root, dirs, files in os.walk('agents'):
    # Skip backup directories
    if 'skills.bak' in root or 'skills' in root:
        continue
    for f in files:
        if f.endswith('.md') and not f.endswith('.bak'):
            p = os.path.join(root, f)
            agents.append((p, count_tokens(p)))

agents.sort(key=lambda x: x[1], reverse=True)

print(f"  Total active agents: {len(agents)}")
print(f"  Average tokens/agent: {sum(t for _, t in agents) // len(agents) if agents else 0}")
print(f"\n  Top 10 largest ACTIVE agents:")
for f, t in agents[:10]:
    over = max(0, t - 250)
    print(f"    {f:43s} {t:5d} tokens (can save: {over})")

total_agent_waste = sum(max(0, t - 250) for _, t in agents)

# Pipelines
print("\n[5] PIPELINES (loaded per-task):")
pipelines = []
for f in os.listdir('system/pipelines'):
    if f.endswith('.md'):
        p = os.path.join('system/pipelines', f)
        pipelines.append((f, count_tokens(p)))
pipelines.sort(key=lambda x: x[1], reverse=True)

for f, t in pipelines[:6]:
    over = max(0, t - 400)
    print(f"  {f:45s} {t:5d} tokens (can save: {over})")
total_pipeline_waste = sum(max(0, t - 400) for _, t in pipelines)

# Quick refs
print("\n[6] QUICK REFS (on-demand):")
quickrefs = []
for root, dirs, files in os.walk('system/advanced'):
    for f in files:
        if 'QUICK_REF' in f:
            p = os.path.join(root, f)
            quickrefs.append((p, count_tokens(p)))
quickrefs.sort(key=lambda x: x[1], reverse=True)

for f, t in quickrefs[:5]:
    over = max(0, t - 150)
    print(f"  {os.path.basename(f):43s} {t:5d} tokens (can save: {over})")
total_quickref_waste = sum(max(0, t - 150) for _, t in quickrefs)

print("\n" + "="*70)
print("ROI-RANKED OPTIMIZATION OPPORTUNITIES:")
print("="*70)

opps = [
    ("BOOTSTRAP compression (779 -> 300)", total_bootstrap - 300, "HIGH"),
    ("Skills conditional loading (50% tasks)", int(skills_tokens * 0.5), "HIGH"),
    ("Agent compression (avg 329 -> 250)", total_agent_waste, "MEDIUM"),
    ("METADATA abbreviation (713 -> 400)", metadata_waste, "LOW"),
    ("Pipeline compression (avg -> 400)", total_pipeline_waste, "LOW"),
    ("Quick ref compression (avg -> 150)", total_quickref_waste, "LOW"),
]

opps.sort(key=lambda x: x[1], reverse=True)

for i, (desc, tokens, priority) in enumerate(opps, 1):
    print(f"{i}. {desc:45s} {tokens:5d} tokens ({priority})")

total_potential = sum(t for _, t, _ in opps)
print(f"\nTOTAL POTENTIAL PHASE 9: ~{total_potential} tokens")
print(f"Additional reduction: {total_potential / 28000 * 100:.1f}% of current 28K baseline")

print("\n" + "="*70)
print("SPECIFIC FILES TO COMPRESS:")
print("="*70)
print("\n1. BOOTSTRAP.md (479 tokens to save):")
print("   - Remove verbose examples")
print("   - Abbreviate Stage 1/2 logic")
print("   - Move feature flag docs to ram/")
print("\n2. METADATA.yaml (313 tokens to save):")
print("   - Abbreviate agent descriptions")
print("   - Remove example entries")
print("   - Move full schema to docs/")
print(f"\n3. Top 5 agents to compress further:")
for f, t in agents[:5]:
    save = max(0, t - 250)
    if save > 0:
        print(f"   {os.path.basename(f):30s} {t:4d} -> 250 = save {save}")
print("\n4. Skills registry conditional load:")
print("   - Add flag: --skip-skills for simple tasks")
print("   - Save 455 tokens average (50% tasks)")
