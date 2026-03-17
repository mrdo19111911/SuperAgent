#!/usr/bin/env node
/**
 * ki_vector.cjs — Build BM25 search index for knowledge items.
 *
 * Chunks each agents/knowledge/*.md by ## sections, tokenizes text,
 * computes TF-IDF weights, and stores the inverted index in SQLite.
 *
 * Pure JS. No ONNX. No native deps. No Docker.
 *
 * Usage: node scripts/ki_vector.cjs [--force]
 */
'use strict';

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT, 'agents', 'knowledge');
const DB_PATH = path.join(ROOT, 'data', 'ki_vectors.db');
const FORCE = process.argv.includes('--force');

// ============================================================================
// TOKENIZER — simple but effective for English + technical text
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
// CHUNKING — split markdown by ## headings
// ============================================================================

function chunkMarkdown(content, filePath) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const chunks = [];
  const lines = content.split('\n');

  let currentHeading = path.basename(filePath, '.md');
  let currentLines = [];
  let lineStart = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ') && currentLines.length > 0) {
      const text = currentLines.join('\n').trim();
      if (text.length > 20) {
        chunks.push({ file: relPath, section: currentHeading, text, lineStart, lineEnd: i });
      }
      currentHeading = line.replace(/^##\s+/, '').trim();
      currentLines = [line];
      lineStart = i + 1;
    } else {
      currentLines.push(line);
    }
  }

  const text = currentLines.join('\n').trim();
  if (text.length > 20) {
    chunks.push({ file: relPath, section: currentHeading, text, lineStart, lineEnd: lines.length });
  }

  return chunks;
}

function walkMd(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkMd(full));
    else if (entry.name.endsWith('.md') && entry.name !== 'README.md') results.push(full);
  }
  return results;
}

function fileHash(filePath) {
  return crypto.createHash('md5').update(fs.readFileSync(filePath)).digest('hex');
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🧠 KI Search Index — building BM25 index...\n');

  const files = walkMd(KNOWLEDGE_DIR);
  if (files.length === 0) {
    console.error('❌ No knowledge items in agents/knowledge/');
    process.exit(1);
  }

  fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
  const SQL = await initSqlJs();

  let db;
  if (fs.existsSync(DB_PATH) && !FORCE) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file TEXT NOT NULL,
      section TEXT NOT NULL,
      text TEXT NOT NULL,
      line_start INTEGER,
      line_end INTEGER,
      file_hash TEXT NOT NULL,
      token_count INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS terms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      term TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS postings (
      term_id INTEGER NOT NULL,
      chunk_id INTEGER NOT NULL,
      tf REAL NOT NULL,
      FOREIGN KEY (term_id) REFERENCES terms(id),
      FOREIGN KEY (chunk_id) REFERENCES chunks(id),
      PRIMARY KEY (term_id, chunk_id)
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chunks_file ON chunks(file);
    CREATE INDEX IF NOT EXISTS idx_chunks_hash ON chunks(file_hash);
    CREATE INDEX IF NOT EXISTS idx_postings_chunk ON postings(chunk_id);
  `);

  let totalChunks = 0;
  let newChunks = 0;
  let skipped = 0;

  const allChunkData = []; // collect for IDF computation

  for (const filePath of files) {
    const relPath = path.relative(ROOT, filePath).replace(/\\/g, '/');
    const hash = fileHash(filePath);

    const stmt = db.prepare('SELECT COUNT(*) as n FROM chunks WHERE file = ? AND file_hash = ?');
    stmt.bind([relPath, hash]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      if (row.n > 0 && !FORCE) {
        skipped++;
        stmt.free();
        continue;
      }
    }
    stmt.free();

    // Remove old data for this file
    const oldIds = [];
    const idStmt = db.prepare('SELECT id FROM chunks WHERE file = ?');
    idStmt.bind([relPath]);
    while (idStmt.step()) oldIds.push(idStmt.getAsObject().id);
    idStmt.free();
    for (const id of oldIds) {
      db.run('DELETE FROM postings WHERE chunk_id = ?', [id]);
    }
    db.run('DELETE FROM chunks WHERE file = ?', [relPath]);

    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkMarkdown(content, filePath);

    console.log(`  📄 ${relPath} → ${chunks.length} chunks`);

    for (const chunk of chunks) {
      const tokens = tokenize(chunk.text);

      db.run(
        'INSERT INTO chunks (file, section, text, line_start, line_end, file_hash, token_count) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [chunk.file, chunk.section, chunk.text, chunk.lineStart, chunk.lineEnd, hash, tokens.length]
      );

      const chunkId = db.exec('SELECT last_insert_rowid()')[0].values[0][0];

      // Compute term frequencies (null prototype prevents prototype pollution)
      const tf = Object.create(null);
      for (const t of tokens) {
        tf[t] = (tf[t] || 0) + 1;
      }

      allChunkData.push({ chunkId, tf, tokenCount: tokens.length });
      totalChunks++;
      newChunks++;
    }
  }

  // Insert terms and postings
  // First: insert all unique terms
  for (const { tf } of allChunkData) {
    for (const term of Object.keys(tf)) {
      db.run('INSERT OR IGNORE INTO terms (term) VALUES (?)', [term]);
    }
  }

  // Build term→id lookup in one bulk query (sql.js exec() ignores bind params)
  const termIdMap = Object.create(null);
  const termRows = db.exec('SELECT id, term FROM terms');
  if (termRows.length) {
    for (const [id, term] of termRows[0].values) {
      termIdMap[term] = Number(id);
    }
  }

  // Now insert postings using the lookup map
  for (const { chunkId, tf, tokenCount } of allChunkData) {
    for (const [term, count] of Object.entries(tf)) {
      const termId = termIdMap[term];
      const termFreq = count / tokenCount; // normalized TF
      db.run('INSERT OR REPLACE INTO postings (term_id, chunk_id, tf) VALUES (?, ?, ?)', [termId, chunkId, termFreq]);
    }
  }

  // Store corpus stats for BM25
  const totalDocs = db.exec('SELECT COUNT(*) FROM chunks')[0].values[0][0];
  const avgDlResult = db.exec('SELECT AVG(token_count) FROM chunks')[0].values[0][0];
  db.run('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['total_docs', String(totalDocs)]);
  db.run('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['avg_dl', String(avgDlResult)]);

  // Save
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
  db.close();

  console.log(`\n✅ KI Search Index complete:`);
  console.log(`   📊 ${newChunks} new chunks indexed, ${skipped} files unchanged`);
  console.log(`   🗄️  ${DB_PATH}`);
  console.log(`   🔍 BM25 full-text search (pure JS, zero native deps)`);
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
