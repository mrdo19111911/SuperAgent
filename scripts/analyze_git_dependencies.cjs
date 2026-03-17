#!/usr/bin/env node
/**
 * analyze_git_dependencies.cjs — Analyze git history to find hot files and co-change patterns.
 *
 * Generates a .cache/ki/git_analysis.json with:
 * - Hot files: most frequently changed files (likely need KI entries)
 * - Co-change clusters: files that change together (dependency signals)
 * - Recent activity: files changed in last 30 commits
 *
 * Usage: node scripts/analyze_git_dependencies.cjs
 */
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const cache = require('./ki_cache.cjs');

const ROOT = path.join(__dirname, '..');
const MAX_COMMITS = 100;

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 }).trim();
  } catch {
    return '';
  }
}

function getHotFiles(limit = 20) {
  // Files most frequently changed in recent history
  const log = git(`log --pretty=format: --name-only -${MAX_COMMITS}`);
  if (!log) return [];

  const counts = {};
  for (const line of log.split('\n')) {
    const file = line.trim();
    if (!file || file.startsWith('.')) continue;
    counts[file] = (counts[file] || 0) + 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([file, changes]) => ({ file, changes }));
}

function getCoChangePatterns() {
  // Find files that frequently change together in same commits
  const log = git(`log --pretty=format:"COMMIT_SEP" --name-only -${MAX_COMMITS}`);
  if (!log) return [];

  const commits = log.split('COMMIT_SEP').filter(Boolean);
  const pairCounts = {};

  for (const commit of commits) {
    const files = commit.split('\n').map(f => f.trim()).filter(f => f && !f.startsWith('.'));
    // Only analyze commits with 2-10 files (skip huge commits)
    if (files.length < 2 || files.length > 10) continue;

    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const pair = [files[i], files[j]].sort().join(' <-> ');
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    }
  }

  return Object.entries(pairCounts)
    .filter(([, count]) => count >= 3) // Only significant co-changes
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([pair, count]) => ({ pair, count }));
}

function getRecentActivity(limit = 30) {
  const log = git(`log --pretty=format:"%H|%s" -${limit}`);
  if (!log) return [];

  return log.split('\n').map(line => {
    const [hash, ...msgParts] = line.split('|');
    return { hash: hash.substring(0, 7), message: msgParts.join('|') };
  });
}

function getKnowledgeGaps(hotFiles) {
  // Suggest knowledge items for hot files without KI coverage
  const knowledgeDirs = ['agents/knowledge/core', 'agents/knowledge/domain', 'agents/knowledge/operational'];
  const existingKI = new Set();

  for (const dir of knowledgeDirs) {
    const fullDir = path.join(ROOT, dir);
    try {
      const { readdirSync } = require('fs');
      for (const f of readdirSync(fullDir)) {
        if (f.endsWith('.md') && f !== 'README.md') {
          existingKI.add(f.replace('.md', ''));
        }
      }
    } catch { /* dir may not exist */ }
  }

  const suggestions = [];
  const seen = new Set();

  for (const { file, changes } of hotFiles) {
    // Extract domain from path: agents/core/dung-manager.md → "dung-manager"
    const base = path.basename(file, path.extname(file));
    const dir = file.split('/')[0]; // top-level dir

    if (!seen.has(dir) && !existingKI.has(base) && changes >= 5) {
      seen.add(dir);
      suggestions.push({
        suggested: `agents/knowledge/core/${dir}.md`,
        reason: `${dir}/ has ${changes}+ changes but no KI entry`,
      });
    }
  }

  return suggestions.slice(0, 5);
}

function run() {
  console.log('🔍 Analyzing git history...\n');

  const hotFiles = getHotFiles();
  const coChanges = getCoChangePatterns();
  const recentCommits = getRecentActivity();
  const gaps = getKnowledgeGaps(hotFiles);

  const analysis = {
    generated: new Date().toISOString(),
    hotFiles,
    coChangePatterns: coChanges,
    recentCommits: recentCommits.slice(0, 10),
    knowledgeGaps: gaps,
  };

  cache.set('git_analysis', analysis);

  // Print summary
  console.log(`  📊 Hot files: ${hotFiles.length} (top: ${hotFiles[0]?.file || 'none'})`);
  console.log(`  🔗 Co-change patterns: ${coChanges.length}`);
  console.log(`  📝 Recent commits analyzed: ${recentCommits.length}`);

  if (gaps.length > 0) {
    console.log(`\n  💡 Suggested new KI entries:`);
    for (const g of gaps) {
      console.log(`     → ${g.suggested} (${g.reason})`);
    }
  }

  console.log(`\n✅ Git analysis saved to .cache/ki/git_analysis.json`);
}

run();
