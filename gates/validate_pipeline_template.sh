#!/bin/bash
# validate_pipeline_template.sh
# Validates that standard pipelines follow the 6-section template and ≤600 token limit.
# Skips *_CUSTOM.md files (Decision 11A).

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIPELINES_DIR="${REPO_ROOT}/system/pipelines"
TOKEN_SCRIPT="${REPO_ROOT}/scripts/measure_tokens.py"
MAX_TOKENS=600
FAILURES=0

# Required sections (standard template)
REQUIRED_SECTIONS=(
  "## 1. TRIGGER"
  "## 2. AGENTS"
  "## 3. PHASES"
  "## 4. OUTPUTS"
  "## 5. GATES"
  "## 6. EXIT"
)

echo "=== Pipeline Template Validator ==="
echo "Checking pipelines in: ${PIPELINES_DIR}"
echo "Max tokens allowed: ${MAX_TOKENS}"
echo ""

# Find all pipeline files (exclude PIPELINE_TEMPLATE.md and *_CUSTOM.md)
for pipeline_file in "${PIPELINES_DIR}"/*.md; do
  filename=$(basename "${pipeline_file}")

  # Skip template and custom pipelines
  if [[ "${filename}" == "PIPELINE_TEMPLATE.md" ]]; then
    echo "[SKIP] ${filename} (template reference)"
    continue
  fi

  if [[ "${filename}" == *_CUSTOM.md ]]; then
    echo "[SKIP] ${filename} (custom pipeline, Decision 11A)"
    continue
  fi

  echo "Validating: ${filename}"

  # Check 6 required sections
  missing_sections=()
  for section in "${REQUIRED_SECTIONS[@]}"; do
    if ! grep -q "^${section}" "${pipeline_file}"; then
      missing_sections+=("${section}")
    fi
  done

  if [ ${#missing_sections[@]} -gt 0 ]; then
    echo "  ❌ FAIL: Missing sections:"
    for section in "${missing_sections[@]}"; do
      echo "      - ${section}"
    done
    FAILURES=$((FAILURES + 1))
  else
    echo "  ✅ All 6 sections present"
  fi

  # Check token count
  # Try Python-based exact counting first, fallback to word-based estimation
  if [ -f "${TOKEN_SCRIPT}" ] && command -v python3 &>/dev/null; then
    token_output=$(python3 "${TOKEN_SCRIPT}" --file "${pipeline_file}" 2>/dev/null || echo "ERROR")

    if [[ "${token_output}" != "ERROR" ]]; then
      # Extract token count from output "path/file.md: XXX tokens"
      token_count=$(echo "${token_output}" | grep -oP '\d+(?= tokens)' || echo "ERROR")

      if [[ "${token_count}" != "ERROR" ]]; then
        if [ "${token_count}" -gt "${MAX_TOKENS}" ]; then
          echo "  ❌ FAIL: Token count ${token_count} exceeds max ${MAX_TOKENS}"
          FAILURES=$((FAILURES + 1))
        else
          echo "  ✅ Token count: ${token_count} (within limit)"
        fi
      fi
    fi
  fi

  # Fallback: word-based estimation (rough: ~0.75 tokens/word)
  if [[ ! -v token_count ]] || [[ "${token_count}" == "ERROR" ]]; then
    word_count=$(wc -w < "${pipeline_file}")
    estimated_tokens=$((word_count * 3 / 4))  # 0.75 tokens/word estimate

    if [ "${estimated_tokens}" -gt "${MAX_TOKENS}" ]; then
      echo "  ❌ FAIL: Estimated ~${estimated_tokens} tokens (${word_count} words × 0.75) exceeds max ${MAX_TOKENS}"
      FAILURES=$((FAILURES + 1))
    else
      echo "  ✅ Estimated ~${estimated_tokens} tokens (${word_count} words × 0.75, within limit)"
    fi
  fi

  echo ""
done

echo "=== Validation Summary ==="
if [ ${FAILURES} -eq 0 ]; then
  echo "✅ All pipelines pass validation!"
  exit 0
else
  echo "❌ ${FAILURES} pipeline(s) failed validation"
  exit 1
fi
