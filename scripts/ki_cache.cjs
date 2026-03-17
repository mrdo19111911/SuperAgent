/**
 * KI Cache Manager — shared module for Knowledge Index system.
 *
 * Provides file-based caching with TTL (default 30 min) under .cache/ki/.
 * Each entry stores: key, data, sourceFile, fileHash, timestamp.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_DIR = path.join(__dirname, '..', '.cache', 'ki');
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

function ensureCacheDir() {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function cacheKey(filePath) {
  return filePath
    .replace(/\\/g, '/')
    .replace(/[^a-zA-Z0-9_/]/g, '_')
    .replace(/\//g, '_')
    .replace(/^_+|_+$/g, '');
}

function fileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

function getCachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

/**
 * Get a cached entry. Returns null if missing, expired, or source changed.
 */
function get(key, opts = {}) {
  const ttl = opts.ttl || DEFAULT_TTL_MS;
  const cachePath = getCachePath(key);

  if (!fs.existsSync(cachePath)) return null;

  try {
    const entry = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    const age = Date.now() - entry.timestamp;

    if (age > ttl) return null;

    // If source file still exists, check hash hasn't changed
    if (entry.sourceFile && fs.existsSync(entry.sourceFile)) {
      const currentHash = fileHash(entry.sourceFile);
      if (currentHash !== entry.fileHash) return null;
    }

    return entry;
  } catch {
    return null;
  }
}

/**
 * Write a cache entry.
 */
function set(key, data, sourceFile) {
  ensureCacheDir();
  const entry = {
    key,
    data,
    sourceFile: sourceFile || null,
    fileHash: sourceFile && fs.existsSync(sourceFile) ? fileHash(sourceFile) : null,
    timestamp: Date.now(),
  };
  fs.writeFileSync(getCachePath(key), JSON.stringify(entry, null, 2), 'utf-8');
  return entry;
}

/**
 * Clear all cache entries.
 */
function clear() {
  if (!fs.existsSync(CACHE_DIR)) return 0;
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
  for (const f of files) {
    fs.unlinkSync(path.join(CACHE_DIR, f));
  }
  return files.length;
}

/**
 * List all cache entries with their age and status.
 */
function list() {
  ensureCacheDir();
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
  return files.map(f => {
    try {
      const entry = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, f), 'utf-8'));
      const ageMin = ((Date.now() - entry.timestamp) / 60000).toFixed(1);
      return { key: entry.key, ageMin, tokens: entry.data?.tokens || 0, source: entry.sourceFile };
    } catch {
      return { key: f, error: 'corrupt' };
    }
  });
}

module.exports = { get, set, clear, list, cacheKey, fileHash, CACHE_DIR, DEFAULT_TTL_MS };

// CLI: node scripts/ki_cache.cjs [clear|list]
if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'clear') {
    const n = clear();
    console.log(`🗑️  KI cache cleared (${n} entries removed)`);
  } else if (cmd === 'list') {
    const entries = list();
    if (entries.length === 0) {
      console.log('KI cache is empty. Run: npm run setup:ki');
    } else {
      console.log(`KI Cache (${entries.length} entries):`);
      for (const e of entries) {
        console.log(`  ${e.key} — ${e.tokens} tokens, ${e.ageMin}min old`);
      }
    }
  } else {
    console.log('Usage: node scripts/ki_cache.cjs [clear|list]');
  }
}
