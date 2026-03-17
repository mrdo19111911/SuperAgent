// Model-Specific Tier Selection Logic (v6.9)
// Part of Nash Agent Framework Token Optimization

/**
 * Model family definitions
 * Maps model identifiers to their family grouping
 */
const MODELS = {
  opus: ['claude-opus-4', 'opus-4', 'opus'],
  pro: ['claude-pro-4', 'pro-4', 'pro'],
  sonnet: ['claude-sonnet-4', 'claude-sonnet-4.5', 'sonnet-4', 'sonnet-4.5', 'sonnet'],
  haiku: ['claude-haiku', 'claude-haiku-3.5', 'haiku-3.5', 'haiku']
};

/**
 * Token budgets for each tier
 * Includes breakdown of what's loaded in each tier
 */
const TIER_BUDGETS = {
  MINI: {
    total: 450,
    breakdown: {
      brain: 300,
      agent_identity: 150,
      pen_win: 0,
      workflows: 0,
      ram: 0
    }
  },
  STANDARD: {
    total: 950,
    breakdown: {
      brain: 300,
      agent_full: 500,
      pen_win: 100,  // Top 5 entries
      workflows: 50,
      ram: 0
    }
  },
  TOOL: {
    total: 400,
    breakdown: {
      brain: 300,
      task_instructions: 100,
      pen_win: 0,
      workflows: 0,
      ram: 0
    }
  },
  FULL: {
    total: 4200,
    breakdown: {
      brain: 300,
      agent_full: 500,
      pen_win: 200,  // All entries
      workflows: 200,
      ram: 3000  // Max RAM
    }
  }
};

/**
 * Task complexity levels
 * Aligns with NASH_SUBAGENT_PROMPTS.md pipeline definitions
 */
const TASK_COMPLEXITY = {
  TRIVIAL: 'trivial',    // <3 SP
  SIMPLE: 'simple',      // 3-10 SP
  COMPLEX: 'complex',    // 10-30 SP
  CRITICAL: 'critical'   // 30+ SP
};

/**
 * Task types for tier selection
 */
const TASK_TYPE = {
  REASONING: 'reasoning',     // Architecture, design decisions, trade-offs
  EXECUTION: 'execution',     // Implementation, coding, building
  REVIEW: 'review',           // Code review, auditing, verification
  OPERATION: 'operation'      // File ops, cleanup, simple queries
};

/**
 * Get model family from model identifier
 * @param {string} model - Model identifier (e.g., 'claude-sonnet-4.5')
 * @returns {string} - Model family ('opus', 'pro', 'sonnet', 'haiku')
 */
function getModelFamily(model) {
  const normalizedModel = model.toLowerCase().trim();

  for (const [family, models] of Object.entries(MODELS)) {
    if (models.some(m => normalizedModel.includes(m))) {
      return family;
    }
  }

  // Default fallback
  return 'sonnet';
}

/**
 * Select appropriate tier based on model, task type, and complexity
 * @param {string} model - Model identifier
 * @param {string} taskType - Type of task (reasoning, execution, review, operation)
 * @param {string} taskComplexity - Complexity level (trivial, simple, complex, critical)
 * @returns {string} - Selected tier (MINI, STANDARD, TOOL, FULL)
 */
function selectTier(model, taskType, taskComplexity) {
  const modelFamily = getModelFamily(model);

  // Opus/Pro: Optimize for reasoning space
  if (modelFamily === 'opus' || modelFamily === 'pro') {
    if (taskType === TASK_TYPE.REASONING) {
      return 'MINI';  // Max reasoning budget - minimal context
    }
    return 'STANDARD';  // Need some context for execution/review
  }

  // Sonnet: Balanced approach based on complexity
  if (modelFamily === 'sonnet') {
    if (taskComplexity === TASK_COMPLEXITY.TRIVIAL) {
      return 'MINI';  // Simple tasks don't need full context
    }
    if (taskComplexity === TASK_COMPLEXITY.CRITICAL) {
      return 'FULL';  // Critical tasks need all context
    }
    return 'STANDARD';  // Simple/Complex use standard
  }

  // Haiku: Always minimal (designed for simple operations)
  if (modelFamily === 'haiku') {
    return 'TOOL';
  }

  // Fallback default
  return 'STANDARD';
}

/**
 * Get token budget for a tier
 * @param {string} tier - Tier name (MINI, STANDARD, TOOL, FULL)
 * @returns {object} - Budget breakdown
 */
function getTierBudget(tier) {
  return TIER_BUDGETS[tier] || TIER_BUDGETS.STANDARD;
}

/**
 * Determine which files to load for a given tier
 * @param {string} agent - Agent name (e.g., 'phuc-sa')
 * @param {string} tier - Tier name
 * @returns {object} - Files to load configuration
 */
function getContextFiles(agent, tier) {
  const agentPath = `agents/core/${agent}.md`;
  const ramPath = `ram/agents/${agent}`;

  const context = {
    always: ['agents/BRAIN.md'],
    agent: [],
    ram: []
  };

  switch (tier) {
    case 'MINI':
      // Identity section only
      context.agent.push({
        file: agentPath,
        sections: ['1. IDENTITY'],
        maxTokens: 150
      });
      break;

    case 'STANDARD':
      // Full agent file
      context.agent.push({
        file: agentPath,
        sections: ['all'],
        maxTokens: 500
      });
      // Top 5 PEN/WIN entries
      context.ram.push({
        file: `${ramPath}/pen_entries.md`,
        sections: ['top-5'],
        maxTokens: 100
      });
      // Workflow summaries
      context.ram.push({
        file: `${ramPath}/workflows.md`,
        sections: ['summary'],
        maxTokens: 50
      });
      break;

    case 'TOOL':
      // Task-specific instructions only (no agent file)
      // Instructions passed directly in context
      break;

    case 'FULL':
      // Full agent file
      context.agent.push({
        file: agentPath,
        sections: ['all'],
        maxTokens: 500
      });
      // All PEN/WIN entries
      context.ram.push({
        file: `${ramPath}/pen_entries.md`,
        sections: ['all'],
        maxTokens: 200
      });
      // Full workflows
      context.ram.push({
        file: `${ramPath}/workflows.md`,
        sections: ['all'],
        maxTokens: 200
      });
      // Additional RAM files as needed (up to 3000 tokens)
      context.ram.push({
        file: `${ramPath}/tools.md`,
        sections: ['all'],
        maxTokens: 500
      });
      context.ram.push({
        file: `${ramPath}/skills.md`,
        sections: ['all'],
        maxTokens: 500
      });
      break;
  }

  return context;
}

/**
 * Estimate token count for context configuration
 * @param {object} contextConfig - Configuration from getContextFiles()
 * @returns {number} - Estimated token count
 */
function estimateTokenCount(contextConfig) {
  let total = 0;

  // BRAIN.md always loaded (300 tokens)
  total += 300;

  // Agent files
  for (const file of contextConfig.agent) {
    total += file.maxTokens;
  }

  // RAM files
  for (const file of contextConfig.ram) {
    total += file.maxTokens;
  }

  return total;
}

/**
 * Main dispatch function - determines tier and returns context configuration
 * @param {object} options - Dispatch options
 * @param {string} options.model - Model identifier
 * @param {string} options.agent - Agent name
 * @param {string} options.taskType - Task type
 * @param {string} options.taskComplexity - Task complexity
 * @returns {object} - Dispatch configuration
 */
function dispatch(options) {
  const { model, agent, taskType, taskComplexity } = options;

  const tier = selectTier(model, taskType, taskComplexity);
  const budget = getTierBudget(tier);
  const context = getContextFiles(agent, tier);
  const estimatedTokens = estimateTokenCount(context);

  return {
    tier,
    budget,
    context,
    estimatedTokens,
    model: model,
    modelFamily: getModelFamily(model),
    agent
  };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectTier,
    getModelFamily,
    getTierBudget,
    getContextFiles,
    estimateTokenCount,
    dispatch,
    MODELS,
    TIER_BUDGETS,
    TASK_COMPLEXITY,
    TASK_TYPE
  };
}
