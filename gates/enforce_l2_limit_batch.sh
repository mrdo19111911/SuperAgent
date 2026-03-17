#!/bin/bash
#
# Batch L2 Cache token validator
# Validates all agent files are ≤500 tokens
#
# Usage: bash gates/enforce_l2_limit_batch.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "==================================================================="
echo "L2 Cache Token Limit Validator (Batch Mode)"
echo "==================================================================="

python3 - "$REPO_ROOT" <<'PYTHON'
import sys
import tiktoken
from pathlib import Path

def count_tokens(text: str) -> int:
    """Count tokens using cl100k_base encoding."""
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

def main():
    repo_root = Path(sys.argv[1])

    # Find all agent files
    agent_files = []
    for layer in ['core', 'dev', 'research', 'user']:
        layer_dir = repo_root / "agents" / layer
        if layer_dir.exists():
            agent_files.extend(list(layer_dir.glob("*.md")))

    violations = []
    passed = []

    for agent_file in sorted(agent_files):
        try:
            content = agent_file.read_text(encoding='utf-8')
            tokens = count_tokens(content)

            if tokens > 500:
                violations.append({
                    'file': str(agent_file.relative_to(repo_root)),
                    'tokens': tokens,
                    'over': tokens - 500
                })
            else:
                passed.append({
                    'file': str(agent_file.relative_to(repo_root)),
                    'tokens': tokens
                })
        except Exception as e:
            violations.append({
                'file': str(agent_file.relative_to(repo_root)),
                'tokens': 0,
                'error': str(e)
            })

    # Print results
    total = len(agent_files)
    passed_count = len(passed)
    failed_count = len(violations)

    print(f"\nTotal agents checked: {total}")
    print(f"[PASS] Agents within 500 token limit: {passed_count}/{total}")

    if violations:
        print(f"[FAIL] Agents over 500 token limit: {failed_count}/{total}\n")
        print("Violations:")
        for v in violations:
            if 'error' in v:
                print(f"  - {v['file']}: ERROR - {v['error']}")
            else:
                print(f"  - {v['file']}: {v['tokens']} tokens (+{v['over']} over limit)")
        print("")
        sys.exit(1)
    else:
        print("\n[PASS] All agents are within 500 token limit!")

        # Show top 5 largest
        passed_sorted = sorted(passed, key=lambda x: x['tokens'], reverse=True)
        print("\nTop 5 largest agents (still within limit):")
        for agent in passed_sorted[:5]:
            margin = 500 - agent['tokens']
            print(f"  - {agent['file']}: {agent['tokens']} tokens (margin: {margin})")

        sys.exit(0)

if __name__ == "__main__":
    main()
PYTHON
