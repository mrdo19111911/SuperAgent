#!/usr/bin/env python3
"""
Skills registry compression script.
Compresses _registry.json from 14K to 5K tokens.
"""

import json
import tiktoken
from pathlib import Path


def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))


def compress_registry(input_file: Path, output_file: Path, full_backup: Path) -> dict:
    """
    Compress skills registry by:
    - Truncating descriptions
    - Keeping only top 2 tags
    - Adding path reference to RAM

    Returns:
        stats dict
    """
    # Read original
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_json = json.dumps(data, indent=2)
    original_tokens = count_tokens(original_json)

    # Backup full registry
    with open(full_backup, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    # Compress skills
    compressed_skills = []

    for skill in data['skills']:
        # Truncate description (keep first 100 chars max, stop at first sentence)
        desc = skill['description']
        if '. ' in desc:
            desc = desc.split('. ')[0] + '.'
        desc = desc[:100] if len(desc) > 100 else desc

        # Keep only top 2 tags
        tags = skill['tags'][:2] if len(skill['tags']) > 2 else skill['tags']

        # Create compressed entry
        compressed_skill = {
            'id': skill['id'],
            'desc': desc,
            'tags': tags,
            'path': skill['path'],
            'used_by': skill.get('used_by', [])
        }

        compressed_skills.append(compressed_skill)

    # Build compressed registry
    compressed_data = {
        'registry_version': data['registry_version'],
        'last_updated': data['last_updated'],
        'skills': compressed_skills,
        '_note': 'This is a compressed registry. Full details in ram/skills/_registry_full.json'
    }

    compressed_json = json.dumps(compressed_data, indent=2)
    compressed_tokens = count_tokens(compressed_json)

    # Save compressed version
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(compressed_data, f, indent=2)

    stats = {
        'original_tokens': original_tokens,
        'compressed_tokens': compressed_tokens,
        'reduction': original_tokens - compressed_tokens,
        'reduction_pct': round((1 - compressed_tokens/original_tokens) * 100, 1),
        'skill_count': len(compressed_skills)
    }

    return stats


if __name__ == "__main__":
    repo_root = Path("e:/SuperAgent")
    input_file = repo_root / "agents" / "skills" / "_registry.json"
    output_file = repo_root / "ram" / "skills" / "_registry.json"
    full_backup = repo_root / "ram" / "skills" / "_registry_full.json"

    # Create RAM skills directory
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Compress
    stats = compress_registry(input_file, output_file, full_backup)

    print(f"Skills Registry Compression Report")
    print(f"=" * 50)
    print(f"Original tokens:    {stats['original_tokens']}")
    print(f"Compressed tokens:  {stats['compressed_tokens']}")
    print(f"Reduction:          {stats['reduction']} tokens ({stats['reduction_pct']}%)")
    print(f"Skills compressed:  {stats['skill_count']}")
    print(f"\n[OK] Compressed registry saved to: {output_file}")
    print(f"[OK] Full backup saved to: {full_backup}")

    # Check if target met (≤5K tokens)
    if stats['compressed_tokens'] <= 5000:
        print(f"\n[PASS] Within 5K token target (margin: {5000 - stats['compressed_tokens']} tokens)")
    else:
        print(f"\n[WARN] Exceeds 5K token target by {stats['compressed_tokens'] - 5000} tokens")
