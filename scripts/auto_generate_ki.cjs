#!/usr/bin/env node
/**
 * auto_generate_ki.cjs — Scan agents/knowledge/ and generate .cache/ki/ entries.
 *
 * For each .md file in agents/knowledge/, creates a raw (uncompressed) cache entry
 * with the full content and a rough token count (words * 1.3).
 *
 * Usage: node scripts/auto_generate_ki.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cache = require('./ki_cache.cjs');

const ROOT = path.join(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT, 'agents', 'knowledge');

function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function walkMd(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMd(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function run() {
  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.error('❌ agents/knowledge/ not found. Nothing to generate.');
    process.exit(1);
  }

  const files = walkMd(KNOWLEDGE_DIR);
  const readmeFiles = files.filter(f => path.basename(f) === 'README.md');
  const kiFiles = files.filter(f => path.basename(f) !== 'README.md');

  if (kiFiles.length === 0) {
    console.log('⚠️  No knowledge items found in agents/knowledge/');
    return;
  }

  let generated = 0;
  let totalTokens = 0;

  for (const filePath of kiFiles) {
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const key = cache.cacheKey(relPath);

    // Skip if cache is still valid (file unchanged)
    const existing = cache.get(key);
    if (existing) {
      totalTokens += existing.data.tokens;
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const tokens = estimateTokens(content);

    cache.set(key, {
      file: relPath,
      content,
      tokens,
      compressed: false,
    }, filePath);

    generated++;
    totalTokens += tokens;
    console.log(`  📄 ${relPath} (${tokens} tokens)`);
  }

  console.log(`\n✅ KI generated: ${generated} new, ${kiFiles.length} total, ${totalTokens} tokens`);
}

run();
