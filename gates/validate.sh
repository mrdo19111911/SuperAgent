#!/bin/bash
# validate.sh — Unified build + type-check + test + code hygiene (polyglot)
# Replaces: gate3, gate4, gate5, gate_fe_3, gate_fe_4
# Usage: bash validate.sh <module_dir>
set -e

DIR="${1:-.}"

if [ ! -d "$DIR" ]; then
  echo "VALIDATE: FAIL — directory '$DIR' not found"
  exit 1
fi

echo "VALIDATE: Checking $DIR"
FAIL=0

# ── 1. No TODO/FIXME in src/ ──
if [ -d "$DIR/src" ]; then
  todo_count=$(grep -rn "TODO\|FIXME\|NotImplemented" "$DIR/src" \
    --include="*.ts" --include="*.tsx" --include="*.go" --include="*.cs" --include="*.py" \
    2>/dev/null | wc -l || echo 0)
  if [ "$todo_count" -gt 0 ]; then
    echo "VALIDATE: [1/4] FAIL — $todo_count TODO/FIXME in src/"
    grep -rn "TODO\|FIXME\|NotImplemented" "$DIR/src" \
      --include="*.ts" --include="*.tsx" --include="*.go" --include="*.cs" --include="*.py" \
      2>/dev/null | head -10 || true
    FAIL=1
  else
    echo "VALIDATE: [1/4] PASS — no TODO/FIXME in src/"
  fi
else
  echo "VALIDATE: [1/4] SKIP — no src/ directory"
fi

# ── 2. Build ──
echo "VALIDATE: [2/4] Building..."
if [ -f "$DIR/package.json" ]; then
  (cd "$DIR" && npm run build) || { echo "VALIDATE: [2/4] FAIL — npm run build"; FAIL=1; }
elif [ -f "$DIR/go.mod" ]; then
  (cd "$DIR" && go build ./...) || { echo "VALIDATE: [2/4] FAIL — go build"; FAIL=1; }
elif ls "$DIR"/*.csproj 1>/dev/null 2>&1; then
  (cd "$DIR" && dotnet build) || { echo "VALIDATE: [2/4] FAIL — dotnet build"; FAIL=1; }
else
  echo "VALIDATE: [2/4] SKIP — unknown stack"
fi

# ── 3. Type check (TS only) ──
if [ -f "$DIR/tsconfig.json" ]; then
  echo "VALIDATE: [3/4] Type-checking..."
  (cd "$DIR" && npx tsc --noEmit) || { echo "VALIDATE: [3/4] FAIL — tsc --noEmit"; FAIL=1; }
elif [ -f "$DIR/go.mod" ]; then
  echo "VALIDATE: [3/4] Vetting Go..."
  (cd "$DIR" && go vet ./...) || { echo "VALIDATE: [3/4] FAIL — go vet"; FAIL=1; }
else
  echo "VALIDATE: [3/4] SKIP — no tsconfig.json or go.mod"
fi

# ── 4. Tests ──
echo "VALIDATE: [4/4] Running tests..."
if [ -f "$DIR/package.json" ]; then
  (cd "$DIR" && npm test) || { echo "VALIDATE: [4/4] FAIL — npm test"; FAIL=1; }
elif [ -f "$DIR/go.mod" ]; then
  (cd "$DIR" && go test ./...) || { echo "VALIDATE: [4/4] FAIL — go test"; FAIL=1; }
elif ls "$DIR"/*.csproj 1>/dev/null 2>&1; then
  (cd "$DIR" && dotnet test) || { echo "VALIDATE: [4/4] FAIL — dotnet test"; FAIL=1; }
fi

# ── Result ──
if [ "$FAIL" -ne 0 ]; then
  echo "VALIDATE: FAIL — one or more checks failed"
  exit 1
fi

echo "VALIDATE: PASS — build + types + tests + hygiene all green"
