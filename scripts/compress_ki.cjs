#!/usr/bin/env node
/**
 * compress_ki.cjs — Compress KI cache entries for token savings.
 *
 * Reads raw entries from .cache/ki/, strips code blocks, examples, and
 * verbose markdown to produce compressed versions (~60% token reduction).
 *
 * Usage: node scripts/compress_ki.cjs
 */
'use strict';

const fs = require('fs');
const path = require('path');
const cache = require('./ki_cache.cjs');

function compressMarkdown(content, sourceFile) {
  let compressed = content;

  // Remove code blocks (keep first line as hint)
  compressed = compressed.replace(/```[\s\S]*?```/g, (match) => {
    const firstLine = match.split('\n').slice(1, 2).join('').trim();
    return firstLine ? `\`${firstLine.substring(0, 60)}...\`` : '';
  });

  // Remove full examples sections (keep headers)
  compressed = compressed.replace(/^(## Examples?)[\s\S]*?(?=^## |\Z)/gm, '$1\n(see source)\n');

  // Remove validation/gate script sections
  compressed = compressed.replace(/^(## Validation)[\s\S]*?(?=^## |\Z)/gm, '');

  // Collapse multi-blank-lines
  compressed = compressed.replace(/\n{3,}/g, '\n\n');

  // Remove HTML comments
  compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');

  // Remove trailing whitespace
  compressed = compressed.replace(/[ \t]+$/gm, '');

  // Add compression marker
  const header = `# ${path.basename(sourceFile, '.md')} (compressed)\n<!-- Original: ${sourceFile} -->\n<!-- Compression: ~60% token reduction -->\n\n`;

  // Remove the original H1 if present
  compressed = compressed.replace(/^# .+\n/, '');

  return header + compressed.trim();
}

function estimateTokens(text) {
  return Math.ceil(text.split(/\s+/).length * 1.3);
}

function run() {
  const entries = cache.list();
  if (entries.length === 0) {
    console.log('⚠️  No KI cache entries. Run: node scripts/auto_generate_ki.cjs first');
    return;
  }

  let compressed = 0;
  let savedTokens = 0;

  for (const entry of entries) {
    if (entry.error) continue;

    const cachePath = path.join(cache.CACHE_DIR, `${entry.key}.json`);
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

    // Skip already compressed
    if (raw.data.compressed) continue;

    const originalTokens = raw.data.tokens;
    const compressedContent = compressMarkdown(raw.data.content, raw.data.file);
    const newTokens = estimateTokens(compressedContent);

    raw.data.content = compressedContent;
    raw.data.tokens = newTokens;
    raw.data.originalTokens = originalTokens;
    raw.data.compressed = true;

    fs.writeFileSync(cachePath, JSON.stringify(raw, null, 2), 'utf-8');

    const saved = originalTokens - newTokens;
    savedTokens += saved;
    compressed++;

    const pct = ((saved / originalTokens) * 100).toFixed(0);
    console.log(`  🗜️  ${raw.data.file}: ${originalTokens} → ${newTokens} tokens (${pct}% saved)`);
  }

  console.log(`\n✅ Compressed ${compressed} entries, saved ${savedTokens} tokens total`);
}

run();
