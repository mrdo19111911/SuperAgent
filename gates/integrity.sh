#!/bin/bash
# integrity.sh — Detect mocks/placeholders/fakes in integration & e2e tests
# Purpose: Ensure integration tests actually integrate (not unit tests in disguise)
# Usage: bash integrity.sh <module_dir>
#
# Exit codes:
#   0 = PASS (clean or only allowlisted mocks)
#   1 = FAIL (suspicious mocks/placeholders found)
#
# Allowlist: Create .mock-allowlist in module root, one pattern per line.
# Example .mock-allowlist:
#   jest.mock.*stripe      # OK: external payment provider
#   jest.mock.*sendgrid    # OK: external email service
#   msw.*handlers          # OK: MSW for external API simulation
set -e

DIR="${1:-.}"
FAIL=0
WARN=0

echo "INTEGRITY: Scanning integration/e2e tests in $DIR"

# ── Find integration & e2e test files ──
INT_FILES=$(find "$DIR" \( \
  -path "*/tests/integration/*" -o \
  -path "*/tests/e2e/*" -o \
  -path "*/__tests__/integration/*" -o \
  -path "*/test/integration/*" \
\) \( \
  -name "*.spec.ts" -o -name "*.spec.tsx" -o \
  -name "*.test.ts" -o -name "*.test.tsx" -o \
  -name "*.spec.js" -o -name "*.test.js" \
\) ! -path "*/node_modules/*" 2>/dev/null || true)

if [ -z "$INT_FILES" ]; then
  echo "INTEGRITY: SKIP — no integration/e2e test files found"
  exit 0
fi

file_count=$(echo "$INT_FILES" | wc -l)
echo "INTEGRITY: Found $file_count integration/e2e test files"

# ── Load allowlist ──
ALLOWLIST="$DIR/.mock-allowlist"
ALLOW_PATTERNS=""
if [ -f "$ALLOWLIST" ]; then
  ALLOW_PATTERNS=$(grep -v '^#' "$ALLOWLIST" | grep -v '^$' || true)
  allow_count=$(echo "$ALLOW_PATTERNS" | grep -c '.' || echo 0)
  echo "INTEGRITY: Loaded $allow_count allowlist patterns from .mock-allowlist"
fi

# Helper: check if a line is allowlisted
is_allowlisted() {
  local line="$1"
  if [ -n "$ALLOW_PATTERNS" ]; then
    while IFS= read -r pattern; do
      if echo "$line" | grep -qiE "$pattern" 2>/dev/null; then
        return 0
      fi
    done <<< "$ALLOW_PATTERNS"
  fi
  return 1
}

# ── 1. CRITICAL: jest.mock() calls (mocking internal modules) ──
echo ""
echo "INTEGRITY: [1/5] Checking jest.mock() calls..."
mock_hits=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  matches=$(grep -n "jest\.mock(" "$file" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    while IFS= read -r match; do
      if ! is_allowlisted "$match"; then
        mock_hits="${mock_hits}  ${file}:${match}\n"
      fi
    done <<< "$matches"
  fi
done <<< "$INT_FILES"

if [ -n "$mock_hits" ]; then
  echo "INTEGRITY: [1/5] FAIL — jest.mock() found in integration tests:"
  echo -e "$mock_hits" | head -15
  FAIL=1
else
  echo "INTEGRITY: [1/5] PASS — no jest.mock() in integration tests"
fi

# ── 2. CRITICAL: Mock implementations (mockReturnValue, mockResolvedValue, etc.) ──
echo ""
echo "INTEGRITY: [2/5] Checking mock implementations..."
MOCK_IMPL_PATTERN='mockReturnValue\|mockResolvedValue\|mockRejectedValue\|mockImplementation\|mockReturnValueOnce\|mockResolvedValueOnce'
mock_impl_hits=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  matches=$(grep -n "$MOCK_IMPL_PATTERN" "$file" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    while IFS= read -r match; do
      if ! is_allowlisted "$match"; then
        mock_impl_hits="${mock_impl_hits}  ${file}:${match}\n"
      fi
    done <<< "$matches"
  fi
done <<< "$INT_FILES"

if [ -n "$mock_impl_hits" ]; then
  echo "INTEGRITY: [2/5] FAIL — mock implementations found in integration tests:"
  echo -e "$mock_impl_hits" | head -15
  FAIL=1
else
  echo "INTEGRITY: [2/5] PASS — no mock implementations"
fi

# ── 3. WARNING: jest.fn() (sometimes OK for callbacks, flag for review) ──
echo ""
echo "INTEGRITY: [3/5] Checking jest.fn() usage..."
fn_count=0
while IFS= read -r file; do
  [ -z "$file" ] && continue
  count=$(grep -c "jest\.fn()" "$file" 2>/dev/null || true)
  count=${count:-0}
  count=$(echo "$count" | tr -d '[:space:]')
  fn_count=$((fn_count + count))
done <<< "$INT_FILES"

if [ "$fn_count" -gt 10 ]; then
  echo "INTEGRITY: [3/5] WARN — $fn_count jest.fn() calls across integration tests (>10 suggests over-mocking)"
  WARN=1
elif [ "$fn_count" -gt 0 ]; then
  echo "INTEGRITY: [3/5] INFO — $fn_count jest.fn() calls (acceptable for callbacks/spies)"
else
  echo "INTEGRITY: [3/5] PASS — no jest.fn() calls"
fi

# ── 4. CRITICAL: Placeholders & fake data markers ──
echo ""
echo "INTEGRITY: [4/5] Checking placeholders and fake data..."
PLACEHOLDER_PATTERN='TODO\|FIXME\|placeholder\|PLACEHOLDER\|dummy\|DUMMY\|fake_\|FAKE_\|xxx@\|test@test\|123456789\|password123\|changeme'
placeholder_hits=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  matches=$(grep -n "$PLACEHOLDER_PATTERN" "$file" 2>/dev/null | grep -v "// allowlist\|# allowlist" || true)
  if [ -n "$matches" ]; then
    placeholder_hits="${placeholder_hits}  ${file}:\n$(echo "$matches" | sed 's/^/    /')\n"
  fi
done <<< "$INT_FILES"

if [ -n "$placeholder_hits" ]; then
  echo "INTEGRITY: [4/5] FAIL — placeholders/fake data found:"
  echo -e "$placeholder_hits" | head -20
  FAIL=1
else
  echo "INTEGRITY: [4/5] PASS — no placeholders or fake data markers"
fi

# ── 5. WARNING: __mocks__ directory used by integration tests ──
echo ""
echo "INTEGRITY: [5/5] Checking __mocks__ directory imports..."
mocks_dir_hits=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  matches=$(grep -n "__mocks__\|\.mock\." "$file" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    mocks_dir_hits="${mocks_dir_hits}  ${file}:\n$(echo "$matches" | sed 's/^/    /')\n"
  fi
done <<< "$INT_FILES"

if [ -n "$mocks_dir_hits" ]; then
  echo "INTEGRITY: [5/5] FAIL — __mocks__ directory or .mock. imports in integration tests:"
  echo -e "$mocks_dir_hits" | head -15
  FAIL=1
else
  echo "INTEGRITY: [5/5] PASS — no __mocks__ imports"
fi

# ── Summary ──
echo ""
echo "════════════════════════════════════════"
if [ "$FAIL" -ne 0 ]; then
  echo "INTEGRITY: FAIL — integration tests contain mocks/placeholders"
  echo ""
  echo "Fix options:"
  echo "  1. Remove mocks and use real DB/services (preferred)"
  echo "  2. If mock is for external API, add pattern to .mock-allowlist"
  echo "  3. Move test to unit/ if it truly needs mocks"
  exit 1
elif [ "$WARN" -ne 0 ]; then
  echo "INTEGRITY: PASS with WARNINGS — review jest.fn() usage"
  exit 0
else
  echo "INTEGRITY: PASS — integration tests are clean"
  exit 0
fi
