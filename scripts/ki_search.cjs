#!/usr/bin/env node
/**
 * ki_search.cjs — BM25 search over KI knowledge items.
 *
 * Query knowledge items by natural language. Returns top-K most relevant
 * chunks ranked by BM25 score.
 *
 * Pure JS. No ONNX. No native deps. Instant startup.
 *
 * Usage:
 *   node scripts/ki_search.cjs "Nash Triad review process"
 *   node scripts/ki_search.cjs "how are agents scored" --top 5
 *   node scripts/ki_search.cjs --list
 *
 * Programmatic:
 *   const { search } = require('./ki_search.cjs');
 *   const results = await search('pipeline selection');
 */
'use strict';

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'ki_vectors.db');

// BM25 parameters (standard defaults)
const K1 = 1.2;
const B = 0.75;

let _db = null;
let _SQL = null;

// ============================================================================
// TOKENIZER (must match ki_vector.cjs)
// ============================================================================

const STOP_WORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should',
  'may','might','shall','can','need','dare','ought','used','to',
  'of','in','for','on','with','at','by','from','as','into',
  'through','during','before','after','above','below','between',
  'out','off','over','under','again','further','then','once',
  'and','but','or','nor','not','no','so','if','than','that',
  'this','these','those','it','its','i','me','my','we','our',
  'you','your','he','him','his','she','her','they','them','their',
  'what','which','who','whom','when','where','how','all','each',
  'every','both','few','more','most','other','some','such','only',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\-_]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

// ============================================================================
// DB INIT
// ============================================================================

async function getDB() {
  if (_db) return _db;
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Search index not found: ${DB_PATH}\nRun: node scripts/ki_vector.cjs`);
  }
  if (!_SQL) _SQL = await initSqlJs();
  _db = new _SQL.Database(fs.readFileSync(DB_PATH));
  return _db;
}

// ============================================================================
// BM25 SEARCH
// ============================================================================

/**
 * BM25 search over knowledge items.
 * @param {string} query - Natural language query
 * @param {Object} opts
 * @param {number} [opts.top=3] - Number of results
 * @returns {Promise<Array<{file, section, text, score, lineStart, lineEnd}>>}
 */
async function search(query, opts = {}) {
  const top = opts.top || 3;
  const db = await getDB();

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];

  // Load corpus stats
  const totalDocs = Number(db.exec("SELECT value FROM meta WHERE key='total_docs'")[0].values[0][0]);
  const avgDl = Number(db.exec("SELECT value FROM meta WHERE key='avg_dl'")[0].values[0][0]);

  // Score each chunk using BM25
  const scores = {}; // chunkId → score

  for (const token of queryTokens) {
    // Get term ID
    const termResult = db.exec('SELECT id FROM terms WHERE term = ?', [token]);
    if (termResult.length === 0) continue;
    const termId = termResult[0].values[0][0];

    // Get document frequency (how many chunks contain this term)
    const dfResult = db.exec('SELECT COUNT(*) FROM postings WHERE term_id = ?', [termId]);
    const df = dfResult[0].values[0][0];

    // IDF component: log((N - df + 0.5) / (df + 0.5) + 1)
    const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);

    // Get all postings for this term
    const postings = db.exec(
      `SELECT p.chunk_id, p.tf, c.token_count
       FROM postings p JOIN chunks c ON p.chunk_id = c.id
       WHERE p.term_id = ?`, [termId]
    );

    if (postings.length === 0) continue;

    for (const [chunkId, tf, docLen] of postings[0].values) {
      // BM25 score: IDF * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * dl/avgdl))
      const tfNorm = tf * docLen; // denormalize TF back to raw count
      const score = idf * (tfNorm * (K1 + 1)) / (tfNorm + K1 * (1 - B + B * docLen / avgDl));
      scores[chunkId] = (scores[chunkId] || 0) + score;
    }
  }

  // Rank and return top results
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top);

  const results = [];
  for (const [chunkId, score] of ranked) {
    const row = db.exec(
      'SELECT file, section, text, line_start, line_end FROM chunks WHERE id = ?',
      [Number(chunkId)]
    );
    if (row.length > 0) {
      const [file, section, text, lineStart, lineEnd] = row[0].values[0];
      results.push({ file, section, text, score, lineStart, lineEnd });
    }
  }

  return results;
}

/**
 * List all indexed chunks.
 */
async function listChunks() {
  const db = await getDB();
  const result = db.exec('SELECT file, section, length(text) as chars, token_count, created_at FROM chunks ORDER BY file, line_start');
  if (result.length === 0) return [];
  return result[0].values.map(([file, section, chars, tokens, created_at]) => ({
    file, section, chars, tokens, created_at
  }));
}

// ============================================================================
// CLI
// ============================================================================

async function cli() {
  const args = process.argv.slice(2);

  if (args.includes('--list')) {
    const chunks = await listChunks();
    console.log(`KI Search Index — ${chunks.length} chunks indexed:\n`);
    for (const c of chunks) {
      console.log(`  📄 ${c.file} § ${c.section} (${c.chars} chars, ${c.tokens} tokens)`);
    }
    return;
  }

  const query = args.filter(a => !a.startsWith('--')).join(' ');
  if (!query) {
    console.log('Usage: node scripts/ki_search.cjs "your question here"');
    console.log('       node scripts/ki_search.cjs --list');
    return;
  }

  const topIdx = args.indexOf('--top');
  const top = topIdx >= 0 ? parseInt(args[topIdx + 1]) || 3 : 3;

  console.log(`🔍 Searching: "${query}" (top ${top})\n`);

  const startTime = Date.now();
  const results = await search(query, { top });
  const duration = Date.now() - startTime;

  if (results.length === 0) {
    console.log('  No relevant results found.');
    return;
  }

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(`  ${i + 1}. [score: ${r.score.toFixed(2)}] ${r.file} § ${r.section} (L${r.lineStart}-${r.lineEnd})`);
    const preview = r.text.replace(/\n/g, ' ').substring(0, 150);
    console.log(`     ${preview}...`);
    console.log();
  }

  console.log(`  ⏱️  ${duration}ms`);
}

// ============================================================================
// EXPORTS + CLI
// ============================================================================

module.exports = { search, listChunks, tokenize };

if (require.main === module) {
  cli().catch(err => { console.error('❌', err.message); process.exit(1); });
}
