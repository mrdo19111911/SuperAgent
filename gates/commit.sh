#!/bin/bash
# commit.sh — Safe git commit: pre-validate → exclude dangerous files → targeted add → commit
# Replaces: gate9, gate_fe_9
# Usage: bash commit.sh <module_name> [commit_message]
# Example: bash commit.sh T1_08_order-management "feat: add escalation engine"
set -e

MODULE="${1:-}"
MSG="${2:-}"

if [ -z "$MODULE" ]; then
  echo "COMMIT: FAIL — module name required"
  echo "  Usage: bash commit.sh <module_name> [commit_message]"
  echo "  Example: bash commit.sh T1_08_order-management 'feat: add escalation engine'"
  exit 1
fi

# ── 1. Find module directory ──
MODULE_DIR=""
for candidate in "modules/$MODULE" "modules/Doing/$MODULE" "modules/Doing_2/$MODULE" "modules/Doing_3/$MODULE" "fe/$MODULE"; do
  if [ -d "$candidate" ]; then
    MODULE_DIR="$candidate"
    break
  fi
done

if [ -z "$MODULE_DIR" ]; then
  echo "COMMIT: FAIL — module '$MODULE' not found in modules/*/  or fe/"
  exit 1
fi

echo "COMMIT: Module found at $MODULE_DIR"

# ── 2. Pre-validate (build + test must pass before commit) ──
echo "COMMIT: Running pre-commit validation (parallel mode)..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
bash "$SCRIPT_DIR/parallel_validate.sh" "$MODULE_DIR" || {
  echo "COMMIT: FAIL — pre-commit validation failed. Fix issues before committing."
  exit 1
}

# ── 3. Check for dangerous files ──
DANGEROUS_PATTERNS=('.env' '.env.local' '.env.production' 'credentials' '*.pem' '*.key' '*.p12')
FOUND_DANGEROUS=0
for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  matches=$(find "$MODULE_DIR" -name "$pattern" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    echo "COMMIT: WARNING — found sensitive file(s) matching '$pattern':"
    echo "$matches" | sed 's/^/  /'
    FOUND_DANGEROUS=1
  fi
done

if [ "$FOUND_DANGEROUS" -eq 1 ]; then
  echo "COMMIT: Sensitive files detected — they will NOT be staged (add manually if intentional)"
fi

# ── 4. Targeted git add (exclude sensitive files) ──
# Stage module source (excluding dangerous patterns)
git add "$MODULE_DIR" -- \
  ':!*.env' ':!*.env.*' ':!*.pem' ':!*.key' ':!*.p12' ':!*credentials*' \
  ':!**/node_modules/**' ':!**/.DS_Store' 2>/dev/null || true

echo "COMMIT: Staged $MODULE_DIR"

# Stage related artifacts if they exist
for related in "contracts/$MODULE" "artifacts/$MODULE"; do
  if [ -d "$related" ]; then
    git add "$related" 2>/dev/null && echo "COMMIT: Staged $related" || true
  fi
done

# ── 5. Verify something is staged ──
staged_count=$(git diff --cached --name-only | wc -l)
if [ "$staged_count" -eq 0 ]; then
  echo "COMMIT: FAIL — nothing to commit (no changes staged)"
  exit 1
fi

echo "COMMIT: $staged_count file(s) staged:"
git diff --cached --name-only | head -20

# ── 6. Commit ──
if [ -z "$MSG" ]; then
  MSG="feat(${MODULE}): pipeline complete — validated and committed"
fi

git commit -m "$MSG" || {
  echo "COMMIT: FAIL — git commit failed"
  exit 1
}

echo "COMMIT: PASS — $MODULE committed ($staged_count files)"
echo "COMMIT: NOTE — not pushed. Run 'git push' manually when ready."
