#!/bin/bash
# Git-First Rollback Script (Decision 22A)
#
# Safely rollback refactor using git reset --hard (atomic operation).
# Faster and safer than recursive cp -r (200+ files).
#
# Performance:
#   - Before: cp -r 200 files (5-10s)
#   - After: git reset --hard (<1s)
#   - Savings: 4-9s in critical failure path
#
# Usage:
#   bash scripts/rollback.sh                 # Rollback to pre-refactor tag
#   bash scripts/rollback.sh --test-mode     # Dry run (for Decision 13A test)
#
# Author: Nash Agent Framework
# Date: 2026-03-16

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PRE_REFACTOR_TAG="pre-refactor-$(date +%Y%m%d)"
BACKUP_DIR="artifacts/refactor/backup"
TEST_MODE=false

# Parse arguments
if [ "$1" = "--test-mode" ]; then
    TEST_MODE=true
    echo -e "${YELLOW}Running in TEST MODE (dry run)${NC}"
fi

echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Nash Agent Framework Rollback${NC}"
echo -e "${GREEN}  Decision 22A: Git-First Strategy${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo

# Step 1: Verify git working tree is clean
echo -e "${YELLOW}[1/4] Checking git status...${NC}"

if ! git diff --quiet HEAD; then
    echo -e "${RED}ERROR: Uncommitted changes detected${NC}"
    echo
    echo "You have uncommitted changes. Please commit or stash them first:"
    echo "  git stash push -m 'WIP before rollback'"
    echo "  # OR"
    echo "  git add . && git commit -m 'WIP'"
    echo
    echo "Then run rollback again."
    exit 1
fi

echo -e "${GREEN}✓ Working tree clean${NC}"
echo

# Step 2: Attempt git-based rollback
echo -e "${YELLOW}[2/4] Attempting git rollback...${NC}"

if git rev-parse "$PRE_REFACTOR_TAG" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Found git tag: $PRE_REFACTOR_TAG${NC}"

    if [ "$TEST_MODE" = true ]; then
        echo -e "${YELLOW}TEST MODE: Would run: git reset --hard $PRE_REFACTOR_TAG${NC}"
    else
        git reset --hard "$PRE_REFACTOR_TAG"
        echo -e "${GREEN}✓ Rolled back to: $PRE_REFACTOR_TAG${NC}"
    fi
else
    echo -e "${YELLOW}WARN: Git tag '$PRE_REFACTOR_TAG' not found${NC}"
    echo "Falling back to backup directory restore..."

    # Fallback: Restore from backup directory
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}ERROR: Backup directory not found: $BACKUP_DIR${NC}"
        echo
        echo "Cannot rollback without git tag or backup directory."
        echo "Create backup first:"
        echo "  mkdir -p $BACKUP_DIR"
        echo "  cp -r agents/ system/ pipelines/ $BACKUP_DIR/"
        exit 1
    fi

    if [ "$TEST_MODE" = true ]; then
        echo -e "${YELLOW}TEST MODE: Would restore from $BACKUP_DIR${NC}"
    else
        echo "Restoring from backup..."
        cp -r "$BACKUP_DIR/agents/" agents/
        cp -r "$BACKUP_DIR/system/" system/
        cp -r "$BACKUP_DIR/pipelines/" pipelines/
        echo -e "${GREEN}✓ Restored from backup${NC}"
    fi
fi
echo

# Step 3: Reset feature flags
echo -e "${YELLOW}[3/4] Resetting feature flags...${NC}"

FEATURE_FLAGS_FILE="core/feature_flags.yaml"

if [ "$TEST_MODE" = true ]; then
    echo -e "${YELLOW}TEST MODE: Would reset $FEATURE_FLAGS_FILE${NC}"
else
    if [ -f "$FEATURE_FLAGS_FILE" ]; then
        cat > "$FEATURE_FLAGS_FILE" << 'EOF'
# Feature Flags - All Disabled (Post-Rollback)
enable_csv_routing: false
enforce_token_limit: false
use_new_templates: false
load_from_core: false
enable_staged_bootstrap: false
EOF
        echo -e "${GREEN}✓ Feature flags reset to defaults${NC}"
    else
        echo -e "${YELLOW}WARN: Feature flags file not found (may not be created yet)${NC}"
    fi
fi
echo

# Step 4: Verify integrity
echo -e "${YELLOW}[4/4] Verifying integrity...${NC}"

# Check critical directories exist
CRITICAL_DIRS=("agents/core" "system" "pipelines")
ALL_OK=true

for dir in "${CRITICAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${RED}✗ Missing directory: $dir${NC}"
        ALL_OK=false
    else
        echo -e "${GREEN}✓ $dir exists${NC}"
    fi
done

# Check critical files exist
CRITICAL_FILES=(
    "system/MIXTURE_OF_EXPERTS_ROUTER.md"
    "agents/core/dung-manager.md"
    "CLAUDE.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}✗ Missing file: $file${NC}"
        ALL_OK=false
    else
        echo -e "${GREEN}✓ $file exists${NC}"
    fi
done

echo

# Step 5: Quick smoke test
if [ "$TEST_MODE" = false ]; then
    echo -e "${YELLOW}[5/5] Running smoke test...${NC}"

    # Test 1: Can list core agents?
    if ls agents/core/*.md >/dev/null 2>&1; then
        AGENT_COUNT=$(ls agents/core/*.md | wc -l)
        echo -e "${GREEN}✓ Core agents present (count: $AGENT_COUNT)${NC}"
    else
        echo -e "${RED}✗ No core agents found${NC}"
        ALL_OK=false
    fi

    # Test 2: Can read MoE Router?
    if [ -f "system/MIXTURE_OF_EXPERTS_ROUTER.md" ]; then
        ROUTER_LINES=$(wc -l < "system/MIXTURE_OF_EXPERTS_ROUTER.md")
        echo -e "${GREEN}✓ MoE Router readable ($ROUTER_LINES lines)${NC}"
    else
        echo -e "${RED}✗ MoE Router not readable${NC}"
        ALL_OK=false
    fi
fi

echo
echo -e "${GREEN}═══════════════════════════════════════${NC}"

if [ "$ALL_OK" = true ]; then
    if [ "$TEST_MODE" = true ]; then
        echo -e "${GREEN}✓ ROLLBACK DRY RUN PASSED${NC}"
        echo -e "${GREEN}  All checks succeeded${NC}"
    else
        echo -e "${GREEN}✓ ROLLBACK SUCCESS${NC}"
        echo -e "${GREEN}  Framework restored to pre-refactor state${NC}"
    fi
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}✗ ROLLBACK FAILED${NC}"
    echo -e "${RED}  Some integrity checks failed${NC}"
    echo -e "${RED}  Manual recovery may be required${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}"
    exit 1
fi
