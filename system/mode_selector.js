/**
 * Mode Selector - Shared utility for cognitive mode selection
 *
 * Extracts mode selection logic to avoid duplication across 50+ agents.
 * Implements keyword-based decision tree with complexity estimation.
 *
 * @module system/mode_selector
 * @version 1.0.0
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPANSION_KEYWORDS = [
  'new domain', 'explore', 'unclear', 'ambiguous', 'research',
  'investigate', 'prototype', 'spike', 'feasibility', 'evaluate',
  'discover', 'understand', 'analyze', 'brainstorm', 'design',
  'architecture', 'what if', 'options', 'alternatives', 'trade-offs'
];

const HOLD_KEYWORDS = [
  'architecture', 'critical', 'integration', 'migration', 'refactor',
  'security', 'performance', 'database', 'schema', 'contract',
  'API', 'protocol', 'interface', 'review', 'audit',
  'complex', 'distributed', 'concurrent', 'async', 'production'
];

const REDUCTION_KEYWORDS = [
  'implement', 'fix bug', 'optimize', 'complete', 'finish',
  'deploy', 'simple', 'straightforward', 'known', 'routine',
  'update', 'add feature', 'small change', 'quick fix', 'hotfix',
  'minor', 'trivial', 'cleanup', 'polish', 'tweak'
];

// Token budgets by mode (in tokens)
const MODE_BUDGETS = {
  EXPANSION: { min: 15000, max: 30000, default: 20000 },
  HOLD: { min: 10000, max: 15000, default: 12000 },
  REDUCTION: { min: 5000, max: 10000, default: 7000 }
};

// ============================================================================
// COMPLEXITY ESTIMATION
// ============================================================================

/**
 * Estimate task complexity from description
 * @param {string} description - Task description
 * @returns {Object} Complexity indicators
 */
function estimateComplexity(description) {
  const text = description.toLowerCase();

  return {
    hasSpec: /spec|requirement|criteria|acceptance/i.test(description),
    hasTests: /test|coverage|qa/i.test(description),
    hasMultipleSteps: (description.match(/\n/g) || []).length > 3,
    hasUncertainty: /unclear|unknown|unsure|maybe|might|possibly/i.test(description),
    hasCriticalKeywords: HOLD_KEYWORDS.some(kw => text.includes(kw)),
    hasNewDomain: /new domain|unfamiliar|first time|never done/i.test(description),
    wordCount: description.split(/\s+/).length
  };
}

/**
 * Count keyword matches in text
 * @param {string} text - Text to search
 * @param {string[]} keywords - Keywords to match
 * @returns {number} Match count
 */
function countKeywordMatches(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword)).length;
}

// ============================================================================
// MODE SELECTION
// ============================================================================

/**
 * Select cognitive mode based on task description
 *
 * Decision tree:
 * 1. EXPANSION if new domain OR unclear spec OR >2 expansion keywords
 * 2. HOLD if architecture/critical keywords OR medium complexity
 * 3. REDUCTION if simple implementation with clear spec
 *
 * @param {string} taskDescription - Task from user/PM
 * @param {Object} options - Configuration options
 * @param {string} [options.forceMode] - Override mode selection
 * @param {number} [options.customBudget] - Override token budget
 * @param {boolean} [options.verbose=false] - Enable debug logging
 * @returns {Object} { mode, budget, reason, complexity }
 */
function selectMode(taskDescription, options = {}) {
  // Handle force mode override
  if (options.forceMode && isValidMode(options.forceMode)) {
    const budget = options.customBudget || MODE_BUDGETS[options.forceMode].default;
    return {
      mode: options.forceMode,
      budget,
      reason: `Forced by caller: ${options.forceMode}`,
      complexity: estimateComplexity(taskDescription)
    };
  }

  const complexity = estimateComplexity(taskDescription);
  const expansionMatches = countKeywordMatches(taskDescription, EXPANSION_KEYWORDS);
  const holdMatches = countKeywordMatches(taskDescription, HOLD_KEYWORDS);
  const reductionMatches = countKeywordMatches(taskDescription, REDUCTION_KEYWORDS);

  if (options.verbose) {
    console.log('Mode Selection Analysis:');
    console.log(`  EXPANSION keywords: ${expansionMatches}`);
    console.log(`  HOLD keywords: ${holdMatches}`);
    console.log(`  REDUCTION keywords: ${reductionMatches}`);
    console.log(`  Complexity:`, complexity);
  }

  // Decision tree (EXPANSION > HOLD > REDUCTION priority)

  // EXPANSION: New domain, unclear requirements, or exploration
  if (
    complexity.hasNewDomain ||
    complexity.hasUncertainty ||
    !complexity.hasSpec ||
    expansionMatches >= 2
  ) {
    return {
      mode: 'EXPANSION',
      budget: options.customBudget || MODE_BUDGETS.EXPANSION.default,
      reason: complexity.hasNewDomain ? 'New domain detected' :
              complexity.hasUncertainty ? 'High uncertainty detected' :
              !complexity.hasSpec ? 'No spec/requirements found' :
              `${expansionMatches} expansion keywords matched`,
      complexity
    };
  }

  // HOLD: Critical/architectural work or medium complexity
  if (
    complexity.hasCriticalKeywords ||
    holdMatches >= 2 ||
    (complexity.hasMultipleSteps && !complexity.hasTests)
  ) {
    return {
      mode: 'HOLD',
      budget: options.customBudget || MODE_BUDGETS.HOLD.default,
      reason: complexity.hasCriticalKeywords ? 'Critical keywords detected' :
              holdMatches >= 2 ? `${holdMatches} HOLD keywords matched` :
              'Multi-step task without test coverage',
      complexity
    };
  }

  // REDUCTION: Simple implementation with clear spec
  if (
    complexity.hasSpec &&
    reductionMatches >= 1 &&
    complexity.wordCount < 100
  ) {
    return {
      mode: 'REDUCTION',
      budget: options.customBudget || MODE_BUDGETS.REDUCTION.default,
      reason: `Simple implementation (${reductionMatches} reduction keywords)`,
      complexity
    };
  }

  // Default fallback: HOLD (conservative choice)
  return {
    mode: 'HOLD',
    budget: options.customBudget || MODE_BUDGETS.HOLD.default,
    reason: 'Default fallback - moderate complexity',
    complexity
  };
}

// ============================================================================
// VALIDATION & UTILITIES
// ============================================================================

/**
 * Validate mode string
 * @param {string} mode - Mode to validate
 * @returns {boolean} True if valid
 */
function isValidMode(mode) {
  return ['EXPANSION', 'HOLD', 'REDUCTION'].includes(mode);
}

/**
 * Get token budget range for a mode
 * @param {string} mode - Cognitive mode
 * @returns {Object} { min, max, default }
 */
function getBudgetRange(mode) {
  if (!isValidMode(mode)) {
    throw new Error(`Invalid mode: ${mode}. Must be EXPANSION, HOLD, or REDUCTION`);
  }
  return MODE_BUDGETS[mode];
}

/**
 * Adjust budget based on task size estimate
 * @param {string} mode - Selected mode
 * @param {number} estimatedStoryPoints - Estimated complexity (1-30)
 * @returns {number} Adjusted token budget
 */
function adjustBudgetByStoryPoints(mode, estimatedStoryPoints) {
  const range = getBudgetRange(mode);

  if (estimatedStoryPoints <= 3) {
    return range.min; // Simple task - use minimum
  } else if (estimatedStoryPoints >= 20) {
    return range.max; // Complex task - use maximum
  } else {
    // Linear interpolation between min and max
    const ratio = (estimatedStoryPoints - 3) / (20 - 3);
    return Math.round(range.min + (range.max - range.min) * ratio);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main function
  selectMode,

  // Validation
  isValidMode,
  getBudgetRange,
  adjustBudgetByStoryPoints,

  // Utilities
  estimateComplexity,
  countKeywordMatches,

  // Constants (for testing/customization)
  EXPANSION_KEYWORDS,
  HOLD_KEYWORDS,
  REDUCTION_KEYWORDS,
  MODE_BUDGETS
};
