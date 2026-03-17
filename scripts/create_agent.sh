#!/bin/bash
#
# Agent creation helper script
# Creates a new agent using AGENT_TEMPLATE_V3.md with proper RAM structure
#
# Usage: bash scripts/create_agent.sh <agent-name> <layer>
# Example: bash scripts/create_agent.sh new-agent core

set -e

AGENT_NAME=$1
LAYER=$2

if [ -z "$AGENT_NAME" ] || [ -z "$LAYER" ]; then
    echo "Usage: create_agent.sh <agent-name> <layer>"
    echo ""
    echo "Arguments:"
    echo "  agent-name: Name of the agent (e.g., 'john-dev-rust')"
    echo "  layer: Agent layer (core|dev|research|user)"
    echo ""
    echo "Example:"
    echo "  bash scripts/create_agent.sh john-dev-rust dev"
    exit 1
fi

# Validate layer
if [[ ! "$LAYER" =~ ^(core|dev|research|user)$ ]]; then
    echo "[ERROR] Invalid layer: $LAYER"
    echo "Valid layers: core, dev, research, user"
    exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_FILE="$REPO_ROOT/agents/$LAYER/$AGENT_NAME.md"
RAM_DIR="$REPO_ROOT/ram/agents/$AGENT_NAME"
TEMPLATE_FILE="$REPO_ROOT/agents/AGENT_TEMPLATE_V3.md"

# Check if agent already exists
if [ -f "$AGENT_FILE" ]; then
    echo "[ERROR] Agent already exists: $AGENT_FILE"
    exit 1
fi

# Check if template exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "[ERROR] Template not found: $TEMPLATE_FILE"
    exit 1
fi

echo "Creating agent: $AGENT_NAME in layer: $LAYER"
echo ""

# Create agent directory
mkdir -p "$REPO_ROOT/agents/$LAYER"

# Copy template
cp "$TEMPLATE_FILE" "$AGENT_FILE"

# Replace placeholders in template
sed -i "s|{agent}|$AGENT_NAME|g" "$AGENT_FILE"
sed -i "s|{layer}|$LAYER|g" "$AGENT_FILE"
sed -i "s|Agent Name|${AGENT_NAME//-/ }|g" "$AGENT_FILE"

# Create RAM directory structure
mkdir -p "$RAM_DIR"
cat > "$RAM_DIR/workflows.md" << 'EOF'
# Workflows

## Primary Workflows

(To be documented)

## Detailed Process Steps

(To be documented)
EOF

cat > "$RAM_DIR/tools.md" << 'EOF'
# Tools

## Available Tools

- **Write:** Save outputs to disk
- **Read:** Read files
- **Bash:** Execute shell commands
- **Grep:** Search for patterns in files
- **Glob:** Find files by pattern
- **Edit:** Modify files

## Tool Usage Examples

(To be documented)
EOF

cat > "$RAM_DIR/pen_entries.md" << 'EOF'
# PEN/WIN History

## PEN (Penalties - Never Repeat)

### P0 CRITICAL

(Empty - record here when penalty occurs)

### P1 HIGH

(Empty - record here when penalty occurs)

### P2 MEDIUM

(Empty - record here when penalty occurs)

## WIN (Successes - Repeat)

(Empty - record here when rewarded)
EOF

cat > "$RAM_DIR/skills.md" << 'EOF'
# Skills

## Top Skills

(To be documented)

## Full Skill List

See: agents/skills/_registry.json → used_by
EOF

echo "[OK] Agent file created: $AGENT_FILE"
echo "[OK] RAM structure created: $RAM_DIR/"
echo ""

# Validate token count
echo "Validating token count..."
python3 - "$AGENT_FILE" <<'PYTHON'
import sys
import tiktoken

def count_tokens(text: str) -> int:
    enc = tiktoken.get_encoding("cl100k_base")
    return len(enc.encode(text))

agent_file = sys.argv[1]
with open(agent_file, 'r', encoding='utf-8') as f:
    content = f.read()

tokens = count_tokens(content)
print(f"Token count: {tokens}")

if tokens > 500:
    print(f"[WARN] Exceeds 500 token limit by {tokens - 500} tokens")
    print("Please edit the agent file to reduce token count.")
    sys.exit(1)
else:
    print(f"[PASS] Within 500 token limit (margin: {500 - tokens} tokens)")
PYTHON

echo ""
echo "=================================================================="
echo "Agent created successfully!"
echo "=================================================================="
echo ""
echo "Next steps:"
echo "1. Edit $AGENT_FILE"
echo "2. Fill in the following sections:"
echo "   - IDENTITY (archetype, model, role)"
echo "   - CONSTRAINTS (PEN entries as you work)"
echo "   - WORKFLOWS (primary workflows)"
echo "3. Add detailed content to RAM files:"
echo "   - $RAM_DIR/workflows.md"
echo "   - $RAM_DIR/tools.md"
echo "   - $RAM_DIR/pen_entries.md"
echo "   - $RAM_DIR/skills.md"
echo ""
echo "4. Validate token count:"
echo "   bash gates/enforce_l2_limit_batch.sh"
echo ""
