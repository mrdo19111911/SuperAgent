#!/bin/bash
# Nash Framework - Installation Verification Script

set -euo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

NASH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0
WARNINGS=0

echo "Verifying Nash Framework installation..."
echo ""

# Function: Check file exists
check_file() {
  local file="$1"
  local desc="$2"

  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $desc: $file"
  else
    echo -e "${RED}✗${NC} $desc: MISSING - $file"
    ERRORS=$((ERRORS + 1))
  fi
}

# Function: Check directory exists
check_dir() {
  local dir="$1"
  local desc="$2"

  if [ -d "$dir" ]; then
    local count=$(find "$dir" -type f | wc -l | tr -d ' ')
    echo -e "${GREEN}✓${NC} $desc: $dir ($count files)"
  else
    echo -e "${YELLOW}⚠${NC}  $desc: MISSING - $dir"
    WARNINGS=$((WARNINGS + 1))
  fi
}

# Function: Check executable
check_exec() {
  local file="$1"
  local desc="$2"

  if [ -f "$file" ]; then
    if [ -x "$file" ]; then
      echo -e "${GREEN}✓${NC} $desc: executable"
    else
      echo -e "${YELLOW}⚠${NC}  $desc: NOT executable - $file"
      WARNINGS=$((WARNINGS + 1))
    fi
  fi
}

# 1. Check hooks
echo "=== Hooks ===="
check_file "${HOME}/.claude/hooks/pre-tool-use.sh" "Pre-tool-use hook"
check_exec "${HOME}/.claude/hooks/pre-tool-use.sh" "Hook permissions"

# Test hook
HOOK_TEST=$(bash "${HOME}/.claude/hooks/pre-tool-use.sh" "Bash" '{"command":"ls -la"}' 2>&1 && echo "PASS" || echo "FAIL")
if [ "$HOOK_TEST" = "PASS" ]; then
  echo -e "${GREEN}✓${NC} Hook test: ls command approved"
else
  echo -e "${RED}✗${NC} Hook test: FAILED"
  ERRORS=$((ERRORS + 1))
fi

if bash "${HOME}/.claude/hooks/pre-tool-use.sh" "Bash" '{"command":"rm file.txt"}' 2>&1 >/dev/null; then
  # Hook returned 0 (approved) - BAD!
  echo -e "${RED}✗${NC} Hook test: rm NOT blocked (security issue!)"
  ERRORS=$((ERRORS + 1))
else
  # Hook returned 1 (denied) - GOOD!
  echo -e "${GREEN}✓${NC} Hook test: rm command blocked"
fi

echo ""

# 2. Check config
echo "=== Config ===="
check_file "${HOME}/.claude/config/nash-settings.json" "Nash settings"
check_file "${NASH_ROOT}/.vscode/settings.json" "Workspace settings (optional)" || true
echo ""

# 3. Check gates
echo "=== Gate Scripts ===="
check_dir "${NASH_ROOT}/gates" "Gates directory"
check_file "${NASH_ROOT}/gates/validate.sh" "Validate gate"
check_file "${NASH_ROOT}/gates/qa.sh" "QA gate"
check_file "${NASH_ROOT}/gates/security.sh" "Security gate"
check_file "${NASH_ROOT}/gates/commit.sh" "Commit gate"

for gate in validate.sh qa.sh security.sh commit.sh; do
  check_exec "${NASH_ROOT}/gates/${gate}" "Gate: $gate"
done
echo ""

# 4. Check agents
echo "=== Agents ===="
check_dir "${NASH_ROOT}/agents" "Agents directory"
check_file "${NASH_ROOT}/agents/BRAIN.md" "Brain (soul file)"
check_dir "${NASH_ROOT}/agents/core" "Core agents"
check_dir "${NASH_ROOT}/agents/dev" "Dev agents"
echo ""

# 5. Check system files
echo "=== System Files ===="
check_file "${NASH_ROOT}/CLAUDE.md" "CLAUDE.md"
check_file "${NASH_ROOT}/README.md" "README.md"
check_file "${NASH_ROOT}/system/MIXTURE_OF_EXPERTS_ROUTER.md" "MoE Router"
check_file "${NASH_ROOT}/system/templates/NASH_SUBAGENT_PROMPTS.md" "Subagent Prompts (v6.2)"
echo ""

# 6. Check dependencies
echo "=== Dependencies ===="

if command -v git &> /dev/null; then
  echo -e "${GREEN}✓${NC} git: $(git --version | head -1)"
else
  echo -e "${RED}✗${NC} git: NOT FOUND"
  ERRORS=$((ERRORS + 1))
fi

if command -v jq &> /dev/null; then
  echo -e "${GREEN}✓${NC} jq: $(jq --version)"
else
  echo -e "${YELLOW}⚠${NC}  jq: NOT FOUND (hook will use fallback parser)"
  WARNINGS=$((WARNINGS + 1))
fi

if command -v node &> /dev/null; then
  echo -e "${GREEN}✓${NC} node: $(node --version)"
elif command -v bun &> /dev/null; then
  echo -e "${GREEN}✓${NC} bun: $(bun --version)"
else
  echo -e "${YELLOW}⚠${NC}  node/bun: NOT FOUND (needed for some gates)"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Summary
echo "============================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}✓ Installation verified successfully!${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠ Verification completed with $WARNINGS warnings${NC}"
  exit 0
else
  echo -e "${RED}✗ Verification failed: $ERRORS errors, $WARNINGS warnings${NC}"
  exit 1
fi
