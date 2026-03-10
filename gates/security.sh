#!/bin/bash
# security.sh — Security checks: hardcoded secrets + dependency audit
# Replaces: gate_deploy
# Usage: bash security.sh <module_dir>
set -e

DIR="${1:-.}"
FAIL=0

echo "SECURITY: Checking $DIR"

# ── 1. Hardcoded secrets scan ──
if [ -d "$DIR/src" ]; then
  SECRET_PATTERNS='(password|secret|api_key|apikey|private_key|access_token|auth_token)\s*[:=]\s*["\x27][^"\x27]{8,}'
  secret_hits=$(grep -riE "$SECRET_PATTERNS" "$DIR/src" 2>/dev/null \
    | grep -v "\.spec\.\|\.test\.\|example\|placeholder\|your_\|<\|process\.env\|configService" \
    | wc -l || echo 0)
  if [ "$secret_hits" -gt 0 ]; then
    echo "SECURITY: [1/2] FAIL — $secret_hits potential hardcoded secrets in src/"
    grep -riE "$SECRET_PATTERNS" "$DIR/src" 2>/dev/null \
      | grep -v "\.spec\.\|\.test\.\|example\|placeholder\|your_\|<\|process\.env\|configService" \
      | head -5 || true
    FAIL=1
  else
    echo "SECURITY: [1/2] PASS — no hardcoded secrets in src/"
  fi
else
  echo "SECURITY: [1/2] SKIP — no src/"
fi

# ── 2. Dependency audit ──
if [ -f "$DIR/package.json" ]; then
  critical=$(cd "$DIR" && npm audit --json 2>/dev/null \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('metadata',{}).get('vulnerabilities',{}).get('critical',0))" \
    2>/dev/null || echo "unknown")
  if [ "$critical" = "unknown" ]; then
    echo "SECURITY: [2/2] WARN — npm audit parse failed"
  elif [ "$critical" -gt 0 ]; then
    echo "SECURITY: [2/2] FAIL — $critical CRITICAL npm vulnerabilities"
    FAIL=1
  else
    echo "SECURITY: [2/2] PASS — 0 CRITICAL npm vulnerabilities"
  fi
elif [ -f "$DIR/go.mod" ]; then
  if command -v govulncheck &>/dev/null; then
    (cd "$DIR" && govulncheck ./...) || { echo "SECURITY: [2/2] FAIL — govulncheck found issues"; FAIL=1; }
  else
    echo "SECURITY: [2/2] SKIP — govulncheck not installed"
  fi
elif ls "$DIR"/*.csproj 1>/dev/null 2>&1; then
  echo "SECURITY: [2/2] SKIP — .NET (run 'dotnet list package --vulnerable' manually)"
else
  echo "SECURITY: [2/2] SKIP — unknown stack"
fi

# ── Result ──
if [ "$FAIL" -ne 0 ]; then
  echo "SECURITY: FAIL"
  exit 1
fi

echo "SECURITY: PASS"
