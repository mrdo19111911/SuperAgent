#!/bin/bash

# Nash Framework Baseline Metrics
# Run this to determine which Phase 2 features to build

set -e

OUTPUT="BASELINE_METRICS.md"

echo "# Nash Framework Baseline Metrics" > "$OUTPUT"
echo "" >> "$OUTPUT"
echo "**Generated:** $(date)" >> "$OUTPUT"
echo "**Purpose:** Data-driven decisions for Phase 2 triggers" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# ============================================================================
# 1. PEN Entry Count
# ============================================================================
echo "## 1. PEN Entry Count" >> "$OUTPUT"
echo "" >> "$OUTPUT"

PEN_COUNT=$(grep -r "^### PEN-" agents/*/MEMORY.md 2>/dev/null | wc -l || echo "0")
echo "**Total PEN entries:** $PEN_COUNT" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ "$PEN_COUNT" -lt 100 ]; then
  echo "**Decision:** ❌ Skip Vector DB — grep is sufficient for <100 entries" >> "$OUTPUT"
  VECTOR_DB_NEEDED="NO"
elif [ "$PEN_COUNT" -lt 300 ]; then
  echo "**Decision:** ⚠️  Build simple .pen_index.txt (Phase 2.2) — borderline" >> "$OUTPUT"
  VECTOR_DB_NEEDED="MAYBE"
else
  echo "**Decision:** ✅ Build Vector DB (Phase 2.3) — grep won't scale" >> "$OUTPUT"
  VECTOR_DB_NEEDED="YES"
fi

echo "" >> "$OUTPUT"

# ============================================================================
# 2. PEN Search Performance
# ============================================================================
echo "## 2. PEN Search Performance" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "Testing grep latency on common queries..." >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo '```bash' >> "$OUTPUT"

for query in "multi-tenant" "RLS" "idempotency" "race condition" "error handling"; do
  START=$(date +%s.%N)
  grep -r "$query" agents/*/MEMORY.md > /dev/null 2>&1 || true
  END=$(date +%s.%N)
  DURATION=$(echo "$END - $START" | bc)
  echo "grep '$query': ${DURATION}s" >> "$OUTPUT"
done

echo '```' >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Rough average (last query time as proxy)
AVG_TIME=$(echo "$END - $START" | bc)
if (( $(echo "$AVG_TIME > 2.0" | bc -l) )); then
  echo "**Decision:** ✅ Build Vector DB — grep too slow (>2s)" >> "$OUTPUT"
  VECTOR_DB_NEEDED="YES"
elif (( $(echo "$AVG_TIME > 0.5" | bc -l) )); then
  echo "**Decision:** ⚠️  Consider .pen_index.txt — grep borderline (500ms-2s)" >> "$OUTPUT"
else
  echo "**Decision:** ❌ Skip Vector DB — grep is fast (<500ms)" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"

# ============================================================================
# 3. Task Duration Analysis
# ============================================================================
echo "## 3. Task Duration Analysis" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ -d "artifacts" ]; then
  LEDGERS=$(find artifacts -name "LEDGER.md" 2>/dev/null || true)

  if [ -n "$LEDGERS" ]; then
    echo "Analyzing task durations from LEDGER files..." >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    TOTAL_DURATION=0
    TASK_COUNT=0
    LONG_TASKS=0

    while IFS= read -r ledger; do
      # Try to extract duration (format varies)
      DURATION=$(grep -i "duration\|elapsed\|time" "$ledger" 2>/dev/null | head -1 | grep -oP '\d+' || echo "0")

      if [ "$DURATION" -gt 0 ]; then
        TOTAL_DURATION=$((TOTAL_DURATION + DURATION))
        TASK_COUNT=$((TASK_COUNT + 1))

        if [ "$DURATION" -gt 30 ]; then
          LONG_TASKS=$((LONG_TASKS + 1))
        fi
      fi
    done <<< "$LEDGERS"

    if [ "$TASK_COUNT" -gt 0 ]; then
      AVG_DURATION=$((TOTAL_DURATION / TASK_COUNT))
      LONG_TASK_PCT=$((LONG_TASKS * 100 / TASK_COUNT))

      echo "**Total tasks analyzed:** $TASK_COUNT" >> "$OUTPUT"
      echo "**Average duration:** ${AVG_DURATION} minutes" >> "$OUTPUT"
      echo "**Tasks >30min:** $LONG_TASKS ($LONG_TASK_PCT%)" >> "$OUTPUT"
      echo "" >> "$OUTPUT"

      if [ "$AVG_DURATION" -lt 20 ]; then
        echo "**Decision:** ❌ Skip Dashboard — tasks complete quickly (<20min avg)" >> "$OUTPUT"
        DASHBOARD_NEEDED="NO"
      elif [ "$LONG_TASK_PCT" -lt 30 ]; then
        echo "**Decision:** ⚠️  Consider status.log (Phase 2.1) — some long tasks" >> "$OUTPUT"
        DASHBOARD_NEEDED="MAYBE"
      else
        echo "**Decision:** ✅ Build real-time observability — many long tasks (>30%)" >> "$OUTPUT"
        DASHBOARD_NEEDED="YES"
      fi
    else
      echo "**Warning:** No valid duration data found in LEDGER files" >> "$OUTPUT"
      DASHBOARD_NEEDED="UNKNOWN"
    fi
  else
    echo "**Warning:** No LEDGER files found in artifacts/" >> "$OUTPUT"
    DASHBOARD_NEEDED="UNKNOWN"
  fi
else
  echo "**Warning:** No artifacts/ directory found" >> "$OUTPUT"
  DASHBOARD_NEEDED="UNKNOWN"
fi

echo "" >> "$OUTPUT"

# ============================================================================
# 4. SOUL Duplication Analysis
# ============================================================================
echo "## 4. SOUL Duplication Analysis" >> "$OUTPUT"
echo "" >> "$OUTPUT"

SOUL_LINES=$(grep -A 20 "## 🎭 SOUL" agents/core/*.md 2>/dev/null | wc -l || echo "0")
AGENT_COUNT=$(ls agents/core/*.md 2>/dev/null | wc -l || echo "1")
AVG_SOUL_SIZE=$((SOUL_LINES / AGENT_COUNT))

echo "**Total SOUL section lines:** $SOUL_LINES" >> "$OUTPUT"
echo "**Number of agents:** $AGENT_COUNT" >> "$OUTPUT"
echo "**Avg SOUL size per agent:** $AVG_SOUL_SIZE lines" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ "$SOUL_LINES" -gt 500 ]; then
  echo "**Decision:** ✅ Extract SOULs (Phase 1.1) — significant duplication" >> "$OUTPUT"
  SOUL_EXTRACT_NEEDED="YES"
else
  echo "**Decision:** ⚠️  SOUL extraction nice-to-have but not critical" >> "$OUTPUT"
  SOUL_EXTRACT_NEEDED="MAYBE"
fi

echo "" >> "$OUTPUT"

# ============================================================================
# 5. Final Recommendations
# ============================================================================
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "## 🎯 Final Recommendations" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "| Feature | Status | Reason |" >> "$OUTPUT"
echo "|---------|--------|--------|" >> "$OUTPUT"
echo "| **Phase 1.1: SOUL Modularity** | ${SOUL_EXTRACT_NEEDED} | $SOUL_LINES total lines, $AVG_SOUL_SIZE avg/agent |" >> "$OUTPUT"
echo "| **Phase 1.3: Cognitive Modes** | YES | Always high ROI (gstack proven pattern) |" >> "$OUTPUT"
echo "| **Phase 2.1: status.log Observability** | ${DASHBOARD_NEEDED} | Avg task: ${AVG_DURATION:-unknown} min, Long tasks: ${LONG_TASK_PCT:-unknown}% |" >> "$OUTPUT"
echo "| **Phase 2.2: .pen_index.txt** | ${VECTOR_DB_NEEDED} | $PEN_COUNT PEN entries, grep: ${AVG_TIME:-unknown}s |" >> "$OUTPUT"
echo "| **Phase 2.3: Vector DB** | ${VECTOR_DB_NEEDED} | $PEN_COUNT PEN entries |" >> "$OUTPUT"

echo "" >> "$OUTPUT"

# ============================================================================
# 6. Next Steps
# ============================================================================
echo "## 📋 Next Steps" >> "$OUTPUT"
echo "" >> "$OUTPUT"

if [ "$SOUL_EXTRACT_NEEDED" = "YES" ]; then
  echo "1. ✅ **Proceed with Phase 1.1 (SOUL Modularity)** — Clear duplication detected" >> "$OUTPUT"
else
  echo "1. ⏸️  **Phase 1.1 optional** — Consider if building 20+ agents in future" >> "$OUTPUT"
fi

echo "2. ✅ **Always do Phase 1.3 (Cognitive Modes)** — gstack proven pattern, high ROI" >> "$OUTPUT"

if [ "$VECTOR_DB_NEEDED" = "YES" ]; then
  echo "3. ✅ **Build Vector DB (Phase 2.3) immediately** — PEN count critical" >> "$OUTPUT"
elif [ "$VECTOR_DB_NEEDED" = "MAYBE" ]; then
  echo "3. ⚠️  **Build .pen_index.txt first (Phase 2.2)** — Defer Vector DB for now" >> "$OUTPUT"
else
  echo "3. ❌ **Skip Vector DB** — grep is sufficient, revisit when PEN >100" >> "$OUTPUT"
fi

if [ "$DASHBOARD_NEEDED" = "YES" ]; then
  echo "4. ✅ **Build status.log observability (Phase 2.1)** — Many long tasks detected" >> "$OUTPUT"
elif [ "$DASHBOARD_NEEDED" = "MAYBE" ]; then
  echo "4. ⚠️  **Consider status.log** — Some tasks take >30min" >> "$OUTPUT"
else
  echo "4. ❌ **Skip observability** — Tasks complete quickly" >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "---" >> "$OUTPUT"
echo "" >> "$OUTPUT"
echo "*Run this script monthly to re-evaluate as system scales.*" >> "$OUTPUT"

# ============================================================================
# Display results
# ============================================================================
cat "$OUTPUT"

echo ""
echo "✅ Metrics saved to $OUTPUT"
echo ""
echo "Review the recommendations and proceed to Phase 1!"
