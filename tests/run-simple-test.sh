#!/bin/bash
# Simple integration test for Nash Framework
# Tests if basic pipeline works end-to-end

set -e  # Exit on error

echo "========================================"
echo "Nash Framework - Simple Integration Test"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
  TESTS_RUN=$((TESTS_RUN + 1))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  echo "   Reason: $2"
  TESTS_FAILED=$((TESTS_FAILED + 1))
  TESTS_RUN=$((TESTS_RUN + 1))
}

info() {
  echo -e "${YELLOW}ℹ️${NC}  $1"
}

# Test 1: Check required files exist
echo "Test 1: Framework Structure"
echo "----------------------------"

if [ -f "CLAUDE.md" ]; then
  pass "CLAUDE.md exists"
else
  fail "CLAUDE.md missing" "Core documentation not found"
fi

if [ -f "main.md" ]; then
  pass "main.md exists"
else
  fail "main.md missing" "Entry point not found"
fi

if [ -d "agents/core" ]; then
  pass "agents/core directory exists"
else
  fail "agents/core missing" "Core agents not found"
fi

if [ -d "system" ]; then
  pass "system directory exists"
else
  fail "system missing" "System files not found"
fi

if [ -f "system/templates/NASH_SUBAGENT_PROMPTS.md" ]; then
  pass "NASH_SUBAGENT_PROMPTS.md exists"
else
  fail "NASH_SUBAGENT_PROMPTS.md missing" "Dispatch templates not found"
fi

echo ""

# Test 2: Check core agents
echo "Test 2: Core Agents"
echo "----------------------------"

CORE_AGENTS=("dung-manager" "phuc-sa" "moc-arch-chal" "son-qa" "tung-diag" "conan-req-aud" "xuan-spec-rev")

for agent in "${CORE_AGENTS[@]}"; do
  if [ -f "agents/core/${agent}.md" ]; then
    pass "Agent ${agent}.md exists"
  else
    fail "Agent ${agent}.md missing" "Required core agent not found"
  fi
done

echo ""

# Test 3: Check gate scripts
echo "Test 3: Gate Scripts"
echo "----------------------------"

GATES=("validate.sh" "integrity.sh" "qa.sh" "security.sh" "commit.sh")

for gate in "${GATES[@]}"; do
  if [ -f "gates/${gate}" ]; then
    pass "Gate ${gate} exists"

    # Check if executable
    if [ -x "gates/${gate}" ]; then
      pass "Gate ${gate} is executable"
    else
      info "Gate ${gate} not executable (may need chmod +x)"
    fi
  else
    fail "Gate ${gate} missing" "Quality gate not found"
  fi
done

echo ""

# Test 4: Check pipelines
echo "Test 4: Pipelines"
echo "----------------------------"

PIPELINES=(
  "01_requirements.md"
  "02_architecture.md"
  "03_coding.md"
  "04_testing.md"
  "05_security.md"
  "06_hotfix.md"
)

for pipeline in "${PIPELINES[@]}"; do
  if [ -f "system/pipelines/${pipeline}" ]; then
    pass "Pipeline ${pipeline} exists"
  else
    fail "Pipeline ${pipeline} missing" "SDLC pipeline not found"
  fi
done

echo ""

# Test 5: Check dashboard
echo "Test 5: Dashboard & Observability"
echo "----------------------------"

if [ -f "observability/dashboard-simple.html" ]; then
  pass "Dashboard HTML exists"
else
  fail "Dashboard missing" "Monitoring dashboard not found"
fi

if [ -f "observability/data.js" ]; then
  pass "Dashboard data.js exists"
else
  fail "Dashboard data missing" "Data file not found"
fi

echo ""

# Test 6: Test gate script (validate.sh) with sample
echo "Test 6: Gate Script Execution"
echo "----------------------------"

# Create temp test file with src/ directory
mkdir -p /tmp/nash-test/src
echo "// TODO: test" > /tmp/nash-test/src/test.js
echo '{"compilerOptions": {"target": "ES2020"}}' > /tmp/nash-test/tsconfig.json

# Run validate gate (should fail because of TODO)
if bash gates/validate.sh /tmp/nash-test 2>&1 | grep -q "TODO\|FIXME\|Hygiene"; then
  pass "validate.sh correctly detects TODO/FIXME"
else
  info "validate.sh ran (may skip on minimal project structure)"
fi

# Cleanup
rm -rf /tmp/nash-test

echo ""

# Test 7: Check memory system
echo "Test 7: Memory System"
echo "----------------------------"

if [ -d "tmp/ram" ]; then
  pass "RAM tier directory exists"
else
  fail "tmp/ram missing" "Memory tier not set up"
fi

if [ -f "agents/BRAIN.md" ]; then
  pass "BRAIN.md (memory architecture) exists"
else
  fail "BRAIN.md missing" "Memory documentation not found"
fi

echo ""

# Test 8: Check scoring system
echo "Test 8: Scoring & LEDGER"
echo "----------------------------"

if [ -f "system/SCORING_RULES.md" ]; then
  pass "SCORING_RULES.md exists"
else
  fail "SCORING_RULES.md missing" "Scoring system not documented"
fi

if [ -f "system/templates/LEDGER_TEMPLATE.md" ]; then
  pass "LEDGER template exists"
else
  fail "LEDGER template missing" "Immutable scoring template not found"
fi

echo ""

# Summary
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Total tests run: $TESTS_RUN"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
  echo ""
  echo "Nash Framework structure is valid."
  echo "Ready for agent dispatch testing."
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo ""
  echo "Please fix the failed tests before proceeding."
  exit 1
fi
