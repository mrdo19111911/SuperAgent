#!/bin/bash
# gates/parallel_validate.sh
# Run all quality gates in parallel for 3x speedup
# Usage: bash gates/parallel_validate.sh <module_dir>

set -e

MODULE=$1
RESULTS_DIR="artifacts/${MODULE}/gate_results"

if [ -z "$MODULE" ]; then
  echo "Usage: bash gates/parallel_validate.sh <module_dir>"
  exit 1
fi

mkdir -p "$RESULTS_DIR"

echo "🚀 Running 4 quality gates in parallel..."
echo "Module: $MODULE"
echo "Results: $RESULTS_DIR"
echo ""

# Start all gates as background processes
bash gates/validate.sh "$MODULE" > "$RESULTS_DIR/validate.log" 2>&1 &
PID_VALIDATE=$!

bash gates/integrity.sh "$MODULE" > "$RESULTS_DIR/integrity.log" 2>&1 &
PID_INTEGRITY=$!

bash gates/qa.sh "$MODULE" > "$RESULTS_DIR/qa.log" 2>&1 &
PID_QA=$!

bash gates/security.sh "$MODULE" > "$RESULTS_DIR/security.log" 2>&1 &
PID_SECURITY=$!

# Wait for all to complete
echo "⏳ Waiting for gates to complete..."

wait $PID_VALIDATE
EXIT_VALIDATE=$?
echo "  ✓ validate.sh completed (exit $EXIT_VALIDATE)"

wait $PID_INTEGRITY
EXIT_INTEGRITY=$?
echo "  ✓ integrity.sh completed (exit $EXIT_INTEGRITY)"

wait $PID_QA
EXIT_QA=$?
echo "  ✓ qa.sh completed (exit $EXIT_QA)"

wait $PID_SECURITY
EXIT_SECURITY=$?
echo "  ✓ security.sh completed (exit $EXIT_SECURITY)"

echo ""

# Aggregate results
TOTAL_EXIT=$((EXIT_VALIDATE + EXIT_INTEGRITY + EXIT_QA + EXIT_SECURITY))

if [ $TOTAL_EXIT -eq 0 ]; then
  echo "✅ All quality gates passed"
  echo ""
  echo "Summary:"
  echo "  - Build: PASS"
  echo "  - Tests: PASS"
  echo "  - Integrity: PASS"
  echo "  - QA: PASS"
  echo "  - Security: PASS"
  exit 0
else
  echo "❌ Quality gate failures detected:"
  echo ""

  if [ $EXIT_VALIDATE -ne 0 ]; then
    echo "  ❌ validate.sh FAILED (exit $EXIT_VALIDATE)"
    echo "     Check: $RESULTS_DIR/validate.log"
  fi

  if [ $EXIT_INTEGRITY -ne 0 ]; then
    echo "  ❌ integrity.sh FAILED (exit $EXIT_INTEGRITY)"
    echo "     Check: $RESULTS_DIR/integrity.log"
  fi

  if [ $EXIT_QA -ne 0 ]; then
    echo "  ❌ qa.sh FAILED (exit $EXIT_QA)"
    echo "     Check: $RESULTS_DIR/qa.log"
  fi

  if [ $EXIT_SECURITY -ne 0 ]; then
    echo "  ❌ security.sh FAILED (exit $EXIT_SECURITY)"
    echo "     Check: $RESULTS_DIR/security.log"
  fi

  echo ""
  echo "Fix errors above and re-run validation."
  exit $TOTAL_EXIT
fi
