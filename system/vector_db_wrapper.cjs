/**
 * Vector Database Wrapper - BM25 search with LRU cache
 *
 * Provides search for PEN entries and knowledge items with:
 * - BM25 ranking via SQLite (pure JS, no native deps)
 * - LRU cache for hot queries (29ms → <1ms)
 * - Grep fallback when index unavailable
 *
 * Replaces Qdrant + ONNX with zero-dependency BM25.
 *
 * @module system/vector_db_wrapper
 * @version 2.0.0
 */

const { LRUCache } = require('lru-cache');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

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
// BM25 SEARCH (delegates to ki_search.cjs)
// ============================================================================

let _kiSearch = null;

function getKISearch() {
  if (_kiSearch) return _kiSearch;
  try {
    _kiSearch = require(path.join(__dirname, '..', 'scripts', 'ki_search.cjs'));
    return _kiSearch;
  } catch {
    return null;
  }
}

// ============================================================================
// GREP FALLBACK
// ============================================================================

/**
 * Fall back to grep-based search when index unavailable
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

    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(dirPath, f));

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const penSection = extractPENSection(content);

        if (!penSection) continue;

        const entries = parsePENEntries(penSection);

        for (const entry of entries) {
          const entryText = `${entry.violation} ${entry.context} ${entry.impact}`.toLowerCase();
          const matches = queryKeywords.filter(kw => entryText.includes(kw)).length;

          if (matches > 0) {
            results.push({
              ...entry,
              score: matches / queryKeywords.length,
              source: file
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to read ${file}: ${error.message}`);
      }
    }
  }

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
// PUBLIC API
// ============================================================================

/**
 * Query PEN entries with BM25 search or fallback to grep
 *
 * @param {string} query - Search query (natural language)
 * @param {Object} options - Search options
 * @param {number} [options.limit=10] - Max results to return
 * @param {boolean} [options.forceGrep=false] - Force grep fallback
 * @returns {Promise<Array>} Matching PEN entries
 */
async function queryPENEntries(query, options = {}) {
  const cacheKey = `pen:${query}:${options.limit || 10}`;

  const cached = queryCache.get(cacheKey);
  if (cached && !options.forceGrep) {
    return cached;
  }

  // Try BM25 search first for knowledge items
  const ki = getKISearch();
  let results;

  if (ki && !options.forceGrep) {
    try {
      const startTime = Date.now();
      const kiResults = await ki.search(query, { top: options.limit || 10 });
      const duration = Date.now() - startTime;
      results = kiResults.map(r => ({
        violation: r.section,
        context: r.text.substring(0, 200),
        impact: '',
        severity: 'P3',
        score: r.score,
        source: r.file
      }));
      console.log(`✓ BM25 search completed in ${duration}ms (${results.length} results)`);
    } catch (error) {
      console.warn(`BM25 search failed: ${error.message}, falling back to grep`);
    }
  }

  // Grep fallback for PEN-specific entries
  if (!results) {
    const startTime = Date.now();
    results = await grepFallback(query, options);
    const duration = Date.now() - startTime;
    console.log(`✓ Grep fallback completed in ${duration}ms (${results.length} results)`);
  }

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
 * Clear query cache
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
// EXPORTS
// ============================================================================

module.exports = {
  queryPENEntries,
  textSearch,
  getBySeverity,
  clearCache,
  getCacheStats,
  grepFallback,
  parsePENEntries,
  extractPENSection,
  isQdrantAvailable: () => false // Qdrant replaced by BM25
};
