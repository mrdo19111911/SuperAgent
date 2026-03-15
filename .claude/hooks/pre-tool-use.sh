#!/bin/bash
# Nash Framework - Pre-Tool-Use Hook
# Auto-approves bash commands except delete/destructive operations
# Version: 1.0.0

set -euo pipefail

# Input from Claude Code
TOOL_NAME="${1:-}"
TOOL_ARGS="${2:-}"

# Audit log
AUDIT_LOG="${HOME}/.claude/bash-audit.log"

# Exit codes
EXIT_APPROVE=0
EXIT_DENY=1

# Function: Log to audit
log_audit() {
  local status="$1"
  local command="$2"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$status] $command" >> "$AUDIT_LOG"
}

# Only intercept Bash tool
if [ "$TOOL_NAME" != "Bash" ]; then
  # Auto-approve all non-bash tools
  exit $EXIT_APPROVE
fi

# Parse command from JSON arguments
# Try jq first (if available), fallback to manual parsing
if command -v jq &> /dev/null; then
  COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command // empty' 2>/dev/null)
else
  # Manual JSON parsing (basic - assumes simple format)
  COMMAND=$(echo "$TOOL_ARGS" | grep -oP '(?<="command":")[^"]+' || echo "$TOOL_ARGS")
fi

# If parsing failed, deny for safety
if [ -z "$COMMAND" ]; then
  log_audit "DENY" "Failed to parse command from: $TOOL_ARGS"
  echo "DENY: Could not parse bash command"
  exit $EXIT_DENY
fi

# Deny patterns (destructive operations)
DENY_PATTERNS=(
  "rm "
  "rm\t"
  "rmdir"
  "del "
  "delete"
  "rd "
  "Remove-Item"
  "git push --force"
  "git push -f"
  "mkfs"
  "format"
  "dd if="
  "> /dev/"
  "chmod 777"
  "chown -R"
)

# Check deny patterns
for pattern in "${DENY_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qF "$pattern"; then
    log_audit "DENY" "$COMMAND (matched: $pattern)"
    echo "DENY: Destructive command blocked (pattern: $pattern)"
    echo "Command: $COMMAND"
    exit $EXIT_DENY
  fi
done

# Additional safety checks
# 1. Prevent writes to system directories
if echo "$COMMAND" | grep -qE "(> |>>).*(/(etc|bin|sbin|usr|sys|proc|boot)|/dev/[^n])"; then
  log_audit "DENY" "$COMMAND (system path write)"
  echo "DENY: Cannot write to system directories"
  exit $EXIT_DENY
fi

# 2. Prevent git operations on wrong branches (optional - customize)
# if echo "$COMMAND" | grep -qE "git (push|merge|rebase).*main"; then
#   log_audit "WARN" "$COMMAND (main branch operation)"
#   echo "WARN: Operation on main branch - proceed with caution"
#   # Can return EXIT_DENY to block
# fi

# 3. Prevent dangerous chmod patterns
if echo "$COMMAND" | grep -qE "chmod.*(777|666|4755)"; then
  log_audit "DENY" "$COMMAND (dangerous chmod)"
  echo "DENY: Dangerous chmod permissions"
  exit $EXIT_DENY
fi

# All checks passed - approve
log_audit "APPROVE" "$COMMAND"
exit $EXIT_APPROVE
