# Nash Framework - Hooks System

Hooks intercept Claude Code tool calls to enforce security policies and auto-approve safe operations.

---

## Installed Hooks

### `pre-tool-use.sh` (Bash Auto-Approve)

**Purpose:** Auto-approve bash commands EXCEPT destructive operations.

**How it works:**
1. Claude Code calls a tool (e.g., `Bash`)
2. Hook receives: `TOOL_NAME` and `TOOL_ARGS` (JSON)
3. Hook parses command from JSON
4. Hook checks deny patterns
5. Returns `exit 0` (approve) or `exit 1` (deny)

**Deny patterns:**
- `rm`, `rmdir`, `del`, `delete`, `rd`, `Remove-Item`
- `git push --force`, `git push -f`
- `mkfs`, `format`, `dd if=`
- Writes to system paths (`/etc`, `/bin`, `/usr`, `/dev`)
- Dangerous chmod (`chmod 777`, `chmod 666`)

**Audit log:**
All decisions logged to: `~/.claude/bash-audit.log`

```
[2026-03-15 21:30:45] [APPROVE] git status
[2026-03-15 21:31:12] [DENY] rm file.txt (matched: rm )
[2026-03-15 21:32:03] [APPROVE] npm install
```

---

## Testing Hooks

```bash
# Test approval (should exit 0)
bash ~/.claude/hooks/pre-tool-use.sh "Bash" '{"command":"ls -la"}'
echo $?  # Should print: 0

# Test denial (should exit 1)
bash ~/.claude/hooks/pre-tool-use.sh "Bash" '{"command":"rm file.txt"}'
echo $?  # Should print: 1

# Test with non-bash tool (auto-approve)
bash ~/.claude/hooks/pre-tool-use.sh "Read" '{"file_path":"test.txt"}'
echo $?  # Should print: 0
```

---

## Customizing Hooks

### Add custom deny patterns

Edit `~/.claude/hooks/pre-tool-use.sh`:

```bash
DENY_PATTERNS=(
  # ... existing patterns ...
  "your-custom-pattern"
  "another-pattern"
)
```

### Add custom logic

```bash
# Example: Warn on operations to main branch
if echo "$COMMAND" | grep -qE "git (push|merge).*main"; then
  log_audit "WARN" "$COMMAND (main branch)"
  # Can return EXIT_DENY to block
fi
```

### Disable hook temporarily

```bash
# Rename hook (hook must end with .sh to be active)
mv ~/.claude/hooks/pre-tool-use.sh ~/.claude/hooks/pre-tool-use.sh.disabled

# Re-enable
mv ~/.claude/hooks/pre-tool-use.sh.disabled ~/.claude/hooks/pre-tool-use.sh
```

---

## Hook API Reference

### Input

**Argument 1:** Tool name (string)
- Examples: `"Bash"`, `"Read"`, `"Edit"`, `"Write"`

**Argument 2:** Tool arguments (JSON string)
- For Bash: `'{"command":"ls -la","timeout":5000}'`
- For Read: `'{"file_path":"test.txt","offset":0,"limit":100}'`

### Output

**Exit code:**
- `0` = Approve (tool executes)
- `1` = Deny (tool blocked, user sees error)

**stdout:** Optional message shown to user

### Example

```bash
#!/bin/bash
TOOL_NAME="$1"
TOOL_ARGS="$2"

if [ "$TOOL_NAME" = "Bash" ]; then
  COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command')

  if echo "$COMMAND" | grep -q "danger"; then
    echo "DENY: Dangerous command"
    exit 1
  fi
fi

exit 0
```

---

## Troubleshooting

### Hook not executing

1. Check file permissions:
   ```bash
   ls -la ~/.claude/hooks/pre-tool-use.sh
   # Should show: -rwxr-xr-x (executable)
   ```

2. Check filename (must end with `.sh`):
   ```bash
   # ✓ Correct: pre-tool-use.sh
   # ✗ Wrong: pre-tool-use.disabled
   # ✗ Wrong: pre-tool-use.txt
   ```

3. Check shebang:
   ```bash
   head -1 ~/.claude/hooks/pre-tool-use.sh
   # Should print: #!/bin/bash
   ```

4. Test manually:
   ```bash
   bash ~/.claude/hooks/pre-tool-use.sh "Bash" '{"command":"echo test"}'
   ```

### jq not found

Hook falls back to grep-based parsing if `jq` not installed:

```bash
# Install jq (recommended)
# macOS:
brew install jq

# Ubuntu/Debian:
sudo apt-get install jq

# Or use fallback (already in hook)
COMMAND=$(echo "$TOOL_ARGS" | grep -oP '(?<="command":")[^"]+')
```

### Hook denying everything

Check deny patterns in hook. Common issue:

```bash
# ✗ Wrong: Missing space after pattern
if echo "$COMMAND" | grep -qF "rm"; then  # Matches "format", "confirm", etc.

# ✓ Correct: Include space or tab
if echo "$COMMAND" | grep -qF "rm "; then  # Only matches "rm file"
```

---

## Security Notes

### Hooks are NOT a security boundary

- Malicious LLM could bypass hooks by using other tools
- Example: Use `Write` to create a script, then `Bash` to execute it
- Hooks provide **convenience**, not **isolation**

### Audit logs are append-only

- No rotation (grows unbounded)
- Manual cleanup needed:
  ```bash
  # Keep last 1000 lines
  tail -1000 ~/.claude/bash-audit.log > ~/.claude/bash-audit.log.tmp
  mv ~/.claude/bash-audit.log.tmp ~/.claude/bash-audit.log
  ```

### Concurrent execution

- Multiple Claude sessions share same hook
- No file locking on audit log
- Race condition possible (rare, benign)

---

## Advanced: Hook Chaining

To run multiple hooks sequentially:

```bash
#!/bin/bash
# meta-hook.sh - runs all hooks

for hook in ~/.claude/hooks/*.hook.sh; do
  bash "$hook" "$@" || exit 1
done

exit 0
```

Rename individual hooks to `*.hook.sh`, then set:
```json
{
  "claudeCode.hooks.preToolUse": "~/.claude/hooks/meta-hook.sh"
}
```

---

For more information, see:
- [CLAUDE.md](../../CLAUDE.md) - Framework overview
- [NASH_SUBAGENT_PROMPTS.md](../../system/templates/NASH_SUBAGENT_PROMPTS.md) - Dispatch rules
- [install-nash.sh](../../install-nash.sh) - Installation script
