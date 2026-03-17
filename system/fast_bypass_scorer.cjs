#!/usr/bin/env node
/**
 * fast_bypass_scorer.js - Fast Bypass Router (Phase -0.5)
 *
 * Calculates bypass confidence for user input to skip heavyweight AUDIT.
 *
 * Usage: node system/fast_bypass_scorer.js "user input"
 * Output: JSON { confidence: 0-100, route: string, reason: string }
 *
 * Routes:
 * - INSTANT_BYPASS (100%): Casual chat → Trivial Pipeline (Profile Line only)
 * - SYSTEM_COMMAND (95%): Tool commands → Direct execution
 * - SIMPLE_BYPASS (80%): Simple queries → Simple Pipeline (Lazy Memory)
 * - MoE_ROUTER (<80%): Complex tasks → Full AUDIT
 */

const input = process.argv[2] || '';

if (!input) {
  console.error('Usage: node fast_bypass_scorer.js "user input"');
  process.exit(1);
}

/**
 * Blocklist: Keywords that MUST NOT bypass (require full AUDIT)
 * P1 penalty if bypass causes missed requirements
 */
const BYPASS_BLOCKLIST = [
  'architecture', 'database', 'security', 'deployment', 'refactor',
  'critical', 'production', 'bug', 'error', 'fail', 'test',
  'schema', 'contract', 'api', 'auth', 'payment',
  'oauth', 'jwt', 'session', 'stripe', 'paypal',
  'migrate', 'rollback', 'hotfix', 'incident'
];

/**
 * Check if input contains blocked keywords
 */
function containsBlockedKeyword(text) {
  const lower = text.toLowerCase();
  return BYPASS_BLOCKLIST.some(kw => lower.includes(kw));
}

/**
 * Calculate bypass confidence (0-100%)
 */
function calculateBypassConfidence(text) {
  const trimmed = text.trim().toLowerCase();
  const wordCount = trimmed.split(/\s+/).length;

  // Rule 0: Blocklist check (override all other rules)
  if (containsBlockedKeyword(trimmed)) {
    return {
      confidence: 0,
      route: 'MoE_ROUTER',
      reason: 'Contains blocked keyword (requires AUDIT)'
    };
  }

  // Rule 1: INSTANT_BYPASS (100%) - Casual chat
  const casualPatterns = [
    /^(ê|ừ|ok|okay|k|haha|lol|done|got it|thanks|thx|hi|hello|hey|sup|test)(\s+(bro|man|dude|buddy))?$/i,
    /^(👍|🎉|✅|❌|🔥|💯)$/,
    /^(yes|no|yep|nope|sure|fine)$/i
  ];

  for (const pattern of casualPatterns) {
    if (pattern.test(trimmed)) {
      return {
        confidence: 100,
        route: 'INSTANT_BYPASS',
        reason: 'Casual chat (acknowledgment/emoji)'
      };
    }
  }

  // Rule 2: SYSTEM_COMMAND (95%) - Direct tool execution
  const commandPatterns = [
    /^(screenshot|capture|screen|snap)/i,
    /^git\s+(status|diff|log|show|branch)/i,
    /^npm\s+(test|run|start|build)/i,
    /^(bash|sh|cmd)\s+/i,
    /^(grep|glob|find|search)\s+/i,
    /^(read|cat|head|tail)\s+/i
  ];

  for (const pattern of commandPatterns) {
    if (pattern.test(trimmed)) {
      return {
        confidence: 95,
        route: 'SYSTEM_COMMAND',
        reason: 'System command (direct tool execution)'
      };
    }
  }

  // Rule 3: SIMPLE_BYPASS (80%) - Simple queries
  if (wordCount <= 5) {
    const simpleQueryPatterns = [
      /^(what|show|list|check|get|read|display|view)\b/i,
      /^(where|when|who|how)\b/i,
      /status$/i,
      /\blogs?\b/i,
      /\bfiles?\b/i
    ];

    for (const pattern of simpleQueryPatterns) {
      if (pattern.test(trimmed)) {
        return {
          confidence: 80,
          route: 'SIMPLE_BYPASS',
          reason: 'Simple query (≤5 words, status/info request)'
        };
      }
    }
  }

  // Rule 4: MoE_FALLBACK (<80%) - Complex tasks
  return {
    confidence: 0,
    route: 'MoE_ROUTER',
    reason: 'Complex task (requires full AUDIT)'
  };
}

// Main execution
const result = calculateBypassConfidence(input);
console.log(JSON.stringify(result, null, 2));

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calculateBypassConfidence, containsBlockedKeyword };
}
