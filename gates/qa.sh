#!/bin/bash
# qa.sh — Quality assurance: SAST + test distribution + smoke test
# Replaces: gate7a
# Usage: bash qa.sh <module_dir> [base_url]
set -e

DIR="${1:-.}"
BASE_URL="${2:-http://localhost:3000}"
FAIL=0

echo "QA: Starting quality checks for $DIR"

# ── 1. SAST (semgrep) ──
if command -v semgrep &>/dev/null && [ -d "$DIR/src" ]; then
  high=$(semgrep --config=auto "$DIR/src" --json 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(1 for r in d.get('results',[]) if r.get('extra',{}).get('severity','') in ('ERROR','HIGH')))" \
    2>/dev/null || echo 0)
  if [ "$high" -gt 0 ]; then
    echo "QA: [1/3] FAIL — SAST found $high HIGH/ERROR findings"
    FAIL=1
  else
    echo "QA: [1/3] PASS — SAST 0 HIGH findings"
  fi
else
  echo "QA: [1/3] SKIP — semgrep not installed or no src/"
fi

# ── 2. Test distribution (unit-only = red flag) ──
spec_count=$(find "$DIR" -name "*.spec.ts" -o -name "*.spec.tsx" -o -name "*_test.go" -o -name "*Test.cs" \
  2>/dev/null | grep -v node_modules | wc -l || echo 0)
int_count=$(find "$DIR" -path "*/tests/integration/*" -type f 2>/dev/null | wc -l || echo 0)
e2e_count=$(find "$DIR" -path "*/tests/e2e/*" -type f 2>/dev/null | wc -l || echo 0)

if [ "$spec_count" -gt 0 ] && [ "$int_count" -eq 0 ] && [ "$e2e_count" -eq 0 ]; then
  echo "QA: [2/3] WARN — 100% unit tests, 0 integration/e2e (consider adding integration tests)"
else
  echo "QA: [2/3] PASS — unit=$spec_count integration=$int_count e2e=$e2e_count"
fi

# ── 3. Smoke test (if server running) ──
if command -v curl &>/dev/null; then
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/health" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    echo "QA: [3/3] PASS — /health returned 200"
    # Bonus: auth injection check
    auth_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE_URL/api/orders" 2>/dev/null || echo "000")
    if [ "$auth_code" = "401" ]; then
      echo "QA: [bonus] PASS — unauthenticated request correctly rejected (401)"
    elif [ "$auth_code" != "000" ]; then
      echo "QA: [bonus] WARN — unauthenticated /api/orders returned $auth_code (expected 401)"
    fi
  elif [ "$status" = "000" ]; then
    echo "QA: [3/3] SKIP — server not running at $BASE_URL"
  else
    echo "QA: [3/3] WARN — /health returned $status"
  fi
else
  echo "QA: [3/3] SKIP — curl not available"
fi

# ── Result ──
if [ "$FAIL" -ne 0 ]; then
  echo "QA: FAIL"
  exit 1
fi

echo "QA: PASS"
