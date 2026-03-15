#!/bin/bash
# Nash Agent Framework - Portable Installation Script
# Usage: bash install-nash.sh [--global|--local]

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
NASH_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${HOME}/.claude"
HOOKS_DIR="${CLAUDE_DIR}/hooks"
CONFIG_DIR="${CLAUDE_DIR}/config"

# Installation mode
MODE="${1:-local}"  # Default: local

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Nash Agent Framework - Portable Installation v1.0.0     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function: Print step
step() {
  echo -e "${GREEN}▶${NC} $1"
}

# Function: Print warning
warn() {
  echo -e "${YELLOW}⚠${NC}  $1"
}

# Function: Print error and exit
error() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

# Function: Print success
success() {
  echo -e "${GREEN}✓${NC} $1"
}

# Step 1: Check prerequisites
step "Checking prerequisites..."

# Check if running in Antigravity/Claude Code
if [ -z "${CLAUDE_CODE_SESSION:-}" ] && [ -z "${VSCODE_PID:-}" ]; then
  warn "Not running inside Claude Code/Antigravity - hooks may not work"
fi

# Check git
if ! command -v git &> /dev/null; then
  error "git is required but not installed"
fi

# Check bash version (need 4.0+ for associative arrays)
BASH_VERSION_MAJOR="${BASH_VERSION%%.*}"
if [ "$BASH_VERSION_MAJOR" -lt 4 ]; then
  warn "Bash 4.0+ recommended (current: $BASH_VERSION)"
fi

success "Prerequisites OK"
echo ""

# Step 2: Install mode selection
if [ "$MODE" = "--global" ] || [ "$MODE" = "-g" ]; then
  step "Installing globally (affects all Claude Code projects)..."
  INSTALL_MODE="global"
elif [ "$MODE" = "--local" ] || [ "$MODE" = "-l" ]; then
  step "Installing locally (this project only)..."
  INSTALL_MODE="local"
else
  error "Invalid mode: $MODE (use --global or --local)"
fi

echo ""

# Step 3: Setup hooks directory
step "Setting up hooks..."

mkdir -p "$HOOKS_DIR"

# Install pre-tool-use hook (bash auto-approve)
HOOK_SOURCE="${NASH_ROOT}/.claude/hooks/pre-tool-use.sh"
HOOK_TARGET="${HOOKS_DIR}/pre-tool-use.sh"

if [ -f "$HOOK_SOURCE" ]; then
  cp "$HOOK_SOURCE" "$HOOK_TARGET"
  chmod +x "$HOOK_TARGET"
  success "Installed pre-tool-use hook → $HOOK_TARGET"
else
  warn "Hook source not found: $HOOK_SOURCE (will create template)"

  # Create template hook
  cat > "$HOOK_TARGET" << 'EOF'
#!/bin/bash
# Nash Framework - Auto-approve bash (except delete)
TOOL_NAME="$1"
TOOL_ARGS="$2"

if [ "$TOOL_NAME" = "Bash" ]; then
  # Parse command from JSON
  COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command // empty' 2>/dev/null || echo "$TOOL_ARGS")

  # Deny patterns
  if echo "$COMMAND" | grep -qE "(rm |rmdir|del |delete|rd |Remove-Item|git push --force)"; then
    echo "DENY: Delete/destructive command blocked"
    exit 1
  fi

  # Log (optional)
  echo "[$(date)] AUTO-APPROVED: $COMMAND" >> ~/.claude/bash-audit.log
  exit 0
fi

# Auto-approve all other tools
exit 0
EOF
  chmod +x "$HOOK_TARGET"
  success "Created template hook → $HOOK_TARGET"
fi

echo ""

# Step 4: Setup config directory
step "Setting up Claude Code config..."

mkdir -p "$CONFIG_DIR"

CONFIG_FILE="${CONFIG_DIR}/nash-settings.json"

cat > "$CONFIG_FILE" << 'EOF'
{
  "claudeCode.hooks.preToolUse": "~/.claude/hooks/pre-tool-use.sh",
  "claudeCode.hooks.applyToSubagents": true,
  "claudeCode.bash.autoApprove": true,
  "claudeCode.bash.denyPatterns": "rm |rmdir|del |delete|rd |Remove-Item|git push --force",
  "claudeCode.bash.auditLog": "~/.claude/bash-audit.log",
  "nash.framework.enabled": true,
  "nash.agents.scoringEnabled": true,
  "nash.memory.l2CacheLimit": 500
}
EOF

success "Created config → $CONFIG_FILE"

# Merge with existing Antigravity settings (if exists)
ANTIGRAVITY_SETTINGS="${HOME}/AppData/Roaming/Antigravity/User/settings.json"
if [ -f "$ANTIGRAVITY_SETTINGS" ]; then
  warn "Found Antigravity settings - manual merge required"
  echo "   Add these settings to: $ANTIGRAVITY_SETTINGS"
  echo "   (See: $CONFIG_FILE)"
fi

echo ""

# Step 5: Validate gates scripts
step "Validating gate scripts..."

GATES_DIR="${NASH_ROOT}/gates"
if [ ! -d "$GATES_DIR" ]; then
  warn "Gates directory not found: $GATES_DIR"
else
  GATES_FOUND=0
  for gate in validate.sh integrity.sh qa.sh security.sh commit.sh; do
    if [ -f "${GATES_DIR}/${gate}" ]; then
      chmod +x "${GATES_DIR}/${gate}"
      GATES_FOUND=$((GATES_FOUND + 1))
    fi
  done
  success "Found $GATES_FOUND/5 gate scripts"
fi

echo ""

# Step 6: Setup agent directories
step "Setting up agent directories..."

AGENTS_DIR="${NASH_ROOT}/agents"
if [ -d "$AGENTS_DIR" ]; then
  AGENT_COUNT=$(find "$AGENTS_DIR" -name "*.md" | wc -l | tr -d ' ')
  success "Found $AGENT_COUNT agent profiles"
else
  warn "Agents directory not found: $AGENTS_DIR"
fi

echo ""

# Step 7: Create workspace-specific config (local mode)
if [ "$INSTALL_MODE" = "local" ]; then
  step "Creating workspace config..."

  WORKSPACE_CONFIG="${NASH_ROOT}/.vscode/settings.json"
  mkdir -p "${NASH_ROOT}/.vscode"

  cat > "$WORKSPACE_CONFIG" << EOF
{
  "files.autoSave": "afterDelay",
  "claudeCode.preferredLocation": "panel",
  "claudeCode.selectedModel": "claude-opus-4-6",
  "claudeCode.hooks.preToolUse": "${HOOKS_DIR}/pre-tool-use.sh",
  "nash.framework.root": "${NASH_ROOT}",
  "nash.agents.directory": "${AGENTS_DIR}",
  "nash.gates.directory": "${GATES_DIR}"
}
EOF

  success "Created workspace config → $WORKSPACE_CONFIG"
fi

echo ""

# Step 8: Verify installation
step "Verifying installation..."

VERIFY_SCRIPT="${NASH_ROOT}/scripts/verify-install.sh"
if [ -f "$VERIFY_SCRIPT" ]; then
  bash "$VERIFY_SCRIPT"
else
  # Basic verification
  ERRORS=0

  [ -f "$HOOK_TARGET" ] || { warn "Hook not found"; ERRORS=$((ERRORS + 1)); }
  [ -f "$CONFIG_FILE" ] || { warn "Config not found"; ERRORS=$((ERRORS + 1)); }
  [ -d "$GATES_DIR" ] || { warn "Gates not found"; ERRORS=$((ERRORS + 1)); }

  if [ $ERRORS -eq 0 ]; then
    success "Verification passed"
  else
    warn "Verification completed with $ERRORS warnings"
  fi
fi

echo ""

# Step 9: Post-install instructions
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  Installation Complete!                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} Hooks installed: $HOOK_TARGET"
echo -e "${GREEN}✓${NC} Config created: $CONFIG_FILE"
echo -e "${GREEN}✓${NC} Mode: $INSTALL_MODE"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Reload Antigravity/Claude Code window (Ctrl+Shift+P → 'Reload Window')"
echo "  2. Test hook: bash $HOOK_TARGET Bash '{\"command\":\"ls -la\"}'"
echo "  3. Run validation: bash gates/validate.sh <module>"
echo "  4. Read docs: cat CLAUDE.md"
echo ""
echo -e "${BLUE}For teammates:${NC}"
echo "  git clone <repo> && cd <repo> && bash install-nash.sh"
echo ""
echo -e "${GREEN}Happy agent orchestration! 🚀${NC}"
