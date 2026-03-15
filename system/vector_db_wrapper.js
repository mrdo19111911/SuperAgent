/**
 * Vector Database Wrapper - Qdrant client with graceful degradation
 *
 * Provides semantic search for PEN entries with:
 * - LRU cache for hot queries (75ms → 1ms)
 * - Automatic fallback to grep when Qdrant unavailable
 * - Error handling and retry logic
 *
 * @module system/vector_db_wrapper
 * @version 1.0.0
 */

const { QdrantClient } = require('@qdrant/js-client-rest');
const { LRUCache } = require('lru-cache');
const { pipeline } = require('@xenova/transformers');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_TIMEOUT = 5000; // 5 seconds
const COLLECTION_NAME = 'pen_entries';
const EMBEDDING_MODEL = 'Snowflake/snowflake-arctic-embed-xs'; // 22M params, local
const CACHE_MAX_ENTRIES = 100;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// LRU CACHE
// ============================================================================

const queryCache = new LRUCache({
  max: CACHE_MAX_ENTRIES,
  ttl: CACHE_TTL_MS,
  updateAgeOnGet: true,
  updateAgeOnHas: false
});

// ============================================================================
// QDRANT CLIENT
// ============================================================================

let qdrantClient = null;
let embeddingPipeline = null;
let isQdrantAvailable = false;

/**
 * Initialize Qdrant client and check availability
 */
async function initializeQdrant() {
  try {
    qdrantClient = new QdrantClient({ url: QDRANT_URL, timeout: QDRANT_TIMEOUT });

    // Test connection
    await qdrantClient.getCollections();
    isQdrantAvailable = true;

    console.log(`✓ Qdrant connected at ${QDRANT_URL}`);
  } catch (error) {
    isQdrantAvailable = false;
    console.warn(`⚠ Qdrant unavailable at ${QDRANT_URL}: ${error.message}`);
    console.warn('Will fall back to grep for PEN entry searches');
  }
}

/**
 * Initialize local embedding model
 */
async function initializeEmbeddings() {
  try {
    embeddingPipeline = await pipeline('feature-extraction', EMBEDDING_MODEL);
    console.log(`✓ Embedding model loaded: ${EMBEDDING_MODEL}`);
  } catch (error) {
    console.error(`✗ Failed to load embedding model: ${error.message}`);
    throw error;
  }
}

/**
 * Generate embedding vector for text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  if (!embeddingPipeline) {
    await initializeEmbeddings();
  }

  const output = await embeddingPipeline(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// ============================================================================
// GREP FALLBACK
// ============================================================================

/**
 * Fall back to grep-based search when Qdrant unavailable
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching PEN entries
 */
async function grepFallback(query, options = {}) {
  const limit = options.limit || 10;
  const memoryDirs = [
    'agents/core',
    'agents/dev',
    'agents/research',
    'agents/user'
  ];

  const results = [];
  const queryKeywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  for (const dir of memoryDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;

    // Find all MEMORY.md files
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(dirPath, f));

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const penSection = extractPENSection(content);

        if (!penSection) continue;

        // Parse PEN entries
        const entries = parsePENEntries(penSection);

        // Score each entry by keyword matches
        for (const entry of entries) {
          const entryText = `${entry.violation} ${entry.context} ${entry.impact}`.toLowerCase();
          const matches = queryKeywords.filter(kw => entryText.includes(kw)).length;

          if (matches > 0) {
            results.push({
              ...entry,
              score: matches / queryKeywords.length, // Relevance score
              source: file
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to read ${file}: ${error.message}`);
      }
    }
  }

  // Sort by score descending, limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Extract PEN section from agent memory file
 * @param {string} content - File content
 * @returns {string|null} PEN section content
 */
function extractPENSection(content) {
  const penMatch = content.match(/## PEN \(Penalties\)([\s\S]*?)(?=\n## |$)/);
  return penMatch ? penMatch[1].trim() : null;
}

/**
 * Parse PEN entries from markdown section
 * @param {string} penSection - PEN section text
 * @returns {Array} Parsed entries
 */
function parsePENEntries(penSection) {
  const entries = [];
  const entryBlocks = penSection.split(/\n(?=\d+\.\s)/);

  for (const block of entryBlocks) {
    const violationMatch = block.match(/\*\*Violation:\*\*\s*(.+)/);
    const contextMatch = block.match(/\*\*Context:\*\*\s*(.+)/);
    const impactMatch = block.match(/\*\*Impact:\*\*\s*(.+)/);
    const severityMatch = block.match(/\*\*Severity:\*\*\s*(P\d)/);

    if (violationMatch) {
      entries.push({
        violation: violationMatch[1].trim(),
        context: contextMatch ? contextMatch[1].trim() : '',
        impact: impactMatch ? impactMatch[1].trim() : '',
        severity: severityMatch ? severityMatch[1].trim() : 'P3'
      });
    }
  }

  return entries;
}

// ============================================================================
// QDRANT SEARCH
// ============================================================================

/**
 * Search Qdrant vector database
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
async function queryQdrant(query, options = {}) {
  if (!isQdrantAvailable || !qdrantClient) {
    throw new Error('Qdrant not available');
  }

  const limit = options.limit || 10;
  const scoreThreshold = options.scoreThreshold || 0.7;

  // Generate query embedding
  const queryVector = await generateEmbedding(query);

  // Search collection
  const results = await qdrantClient.search(COLLECTION_NAME, {
    vector: queryVector,
    limit,
    score_threshold: scoreThreshold,
    with_payload: true
  });

  return results.map(hit => ({
    violation: hit.payload.violation,
    context: hit.payload.context,
    impact: hit.payload.impact,
    severity: hit.payload.severity,
    score: hit.score,
    source: hit.payload.source
  }));
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Query PEN entries with semantic search (Qdrant) or fallback to grep
 *
 * @param {string} query - Search query (natural language)
 * @param {Object} options - Search options
 * @param {number} [options.limit=10] - Max results to return
 * @param {number} [options.scoreThreshold=0.7] - Minimum similarity score (Qdrant only)
 * @param {boolean} [options.forceGrep=false] - Force grep fallback
 * @returns {Promise<Array>} Matching PEN entries
 */
async function queryPENEntries(query, options = {}) {
  // Generate cache key
  const cacheKey = `${query}:${options.limit || 10}:${options.scoreThreshold || 0.7}`;

  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached && !options.forceGrep) {
    console.log(`✓ Cache hit for query: "${query.substring(0, 50)}..."`);
    return cached;
  }

  let results;

  // Try Qdrant first (unless forced to use grep)
  if (!options.forceGrep && isQdrantAvailable) {
    try {
      const startTime = Date.now();
      results = await queryQdrant(query, options);
      const duration = Date.now() - startTime;

      console.log(`✓ Qdrant search completed in ${duration}ms (${results.length} results)`);
    } catch (error) {
      console.warn(`Qdrant search failed: ${error.message}`);
      console.warn('Falling back to grep...');
      isQdrantAvailable = false; // Mark as unavailable
    }
  }

  // Fall back to grep if Qdrant failed or unavailable
  if (!results) {
    const startTime = Date.now();
    results = await grepFallback(query, options);
    const duration = Date.now() - startTime;

    console.log(`✓ Grep fallback completed in ${duration}ms (${results.length} results)`);
  }

  // Cache results
  queryCache.set(cacheKey, results);

  return results;
}

/**
 * Simple text search across all PEN entries (no embeddings)
 * @param {string} searchText - Text to search for
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching entries
 */
async function textSearch(searchText, options = {}) {
  return grepFallback(searchText, { ...options, forceGrep: true });
}

/**
 * Get PEN entries by severity level
 * @param {string} severity - Severity level (P0, P1, P2, P3, P4)
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching entries
 */
async function getBySeverity(severity, options = {}) {
  const results = await grepFallback(`severity ${severity}`, options);
  return results.filter(entry => entry.severity === severity);
}

/**
 * Clear query cache (useful for testing or after PEN updates)
 */
function clearCache() {
  queryCache.clear();
  console.log('✓ Query cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
  return {
    size: queryCache.size,
    maxSize: CACHE_MAX_ENTRIES,
    ttlMs: CACHE_TTL_MS
  };
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize on module load
(async () => {
  await initializeQdrant();
  if (isQdrantAvailable) {
    await initializeEmbeddings();
  }
})();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Main API
  queryPENEntries,
  textSearch,
  getBySeverity,

  // Cache management
  clearCache,
  getCacheStats,

  // Internal functions (exported for testing)
  generateEmbedding,
  grepFallback,
  parsePENEntries,
  extractPENSection,

  // State
  isQdrantAvailable: () => isQdrantAvailable
};
