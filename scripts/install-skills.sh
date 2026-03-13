#!/bin/bash
# Install SuperAgent skills as Claude Code commands in any project.
#
# Usage (from project root):
#   bash SuperAgent/scripts/install-skills.sh
#
# Or if SuperAgent is elsewhere:
#   bash path/to/SuperAgent/scripts/install-skills.sh

set -e

# Detect SuperAgent directory (relative to this script)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SUPERAGENT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(pwd)"

# Detect relative path from project root to SuperAgent
RELATIVE_SA=$(python3 -c "import os; print(os.path.relpath('$SUPERAGENT_DIR', '$PROJECT_ROOT'))" 2>/dev/null \
  || python -c "import os; print(os.path.relpath('$SUPERAGENT_DIR', '$PROJECT_ROOT'))" 2>/dev/null \
  || echo "SuperAgent")

echo "SuperAgent: $RELATIVE_SA"
echo "Project:    $PROJECT_ROOT"
echo ""

# Create .claude/commands if not exists
mkdir -p "$PROJECT_ROOT/.claude/commands"

# Find all skills with SKILL.md
SKILLS_DIR="$SUPERAGENT_DIR/.agents/skills"
if [ ! -d "$SKILLS_DIR" ]; then
  echo "ERROR: No skills directory found at $SKILLS_DIR"
  exit 1
fi

INSTALLED=0
SKIPPED=0

for skill_dir in "$SKILLS_DIR"/*/; do
  [ -f "$skill_dir/SKILL.md" ] || continue

  skill_name=$(basename "$skill_dir")

  # Extract description from first line starting with ">"
  desc=$(grep -m1 "^>" "$skill_dir/SKILL.md" | sed 's/^> *Agent: [^|]*| *Trigger: *//' | head -c 100)
  [ -z "$desc" ] && desc="SuperAgent skill: $skill_name"

  # Extract command name from SKILL.md title (e.g., "# Session Summarizer (`/sum`)" -> "sum")
  cmd_name=$(grep -m1 '`/' "$skill_dir/SKILL.md" | sed 's/.*`\/\([^`]*\)`.*/\1/')
  [ -z "$cmd_name" ] && cmd_name="$skill_name"

  target="$PROJECT_ROOT/.claude/commands/$cmd_name.md"
  skill_path="$RELATIVE_SA/.agents/skills/$skill_name/SKILL.md"

  # Don't overwrite if file exists and is NOT a thin wrapper
  if [ -f "$target" ]; then
    if grep -q "Read and follow the skill at" "$target" 2>/dev/null; then
      # It's a wrapper — safe to overwrite
      :
    else
      echo "  SKIP  /$cmd_name (custom command exists, not overwriting)"
      SKIPPED=$((SKIPPED + 1))
      continue
    fi
  fi

  cat > "$target" << EOF
---
description: $desc
---

Read and follow the skill at \`$skill_path\`.

User input: \$ARGUMENTS
EOF

  echo "  ✓  /$cmd_name → $skill_path"
  INSTALLED=$((INSTALLED + 1))
done

echo ""
echo "Done: $INSTALLED installed, $SKIPPED skipped."

# ── Optional Dependencies ──────────────────────────────────

install_d2() {
  echo ""
  echo "D2 (diagramming tool) is needed by /arch."
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*)
      if command -v winget &>/dev/null; then
        echo "  Installing D2 via winget..."
        winget install Terrastruct.D2 --accept-source-agreements --accept-package-agreements 2>&1 | tail -3
      elif command -v choco &>/dev/null; then
        echo "  Installing D2 via chocolatey..."
        choco install d2 -y 2>&1 | tail -3
      else
        echo "  WARNING: Cannot auto-install D2. Download: https://d2lang.com/releases"
        return 1
      fi ;;
    Darwin*)
      if command -v brew &>/dev/null; then
        echo "  Installing D2 via Homebrew..."
        brew install d2 2>&1 | tail -3
      else
        echo "  WARNING: Run: brew install d2"
        return 1
      fi ;;
    Linux*)
      if command -v curl &>/dev/null; then
        echo "  Installing D2 via official script..."
        curl -fsSL https://d2lang.com/install.sh | sh -s -- 2>&1 | tail -3
      else
        echo "  WARNING: See https://d2lang.com/releases"
        return 1
      fi ;;
    *)
      echo "  WARNING: Unknown OS. Download D2: https://d2lang.com/releases"
      return 1 ;;
  esac
}

D2_WIN="/c/Program Files/D2/d2.exe"
if command -v d2 &>/dev/null; then
  echo ""
  echo "D2: $(d2 --version) ✓"
elif [ -f "$D2_WIN" ]; then
  echo ""
  echo "D2: found at $D2_WIN ✓"
else
  install_d2
  if command -v d2 &>/dev/null || [ -f "$D2_WIN" ]; then
    echo "  ✓ D2 installed successfully"
  else
    echo "  WARNING: D2 not found — /arch will not render diagrams"
  fi
fi

echo ""
echo "Commands available:"
for f in "$PROJECT_ROOT/.claude/commands"/*.md; do
  name=$(basename "$f" .md)
  echo "  /$name"
done
