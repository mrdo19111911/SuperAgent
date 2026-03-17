const path = require('path');
const FastRouteMatcher = require('../system/fast_route_matcher.cjs');

const TEST_CASES = [
  // sml-ui-guide tests
  { query: 'review ui for smartlog tms', expected_skill: 'sml-ui-guide', min_confidence: 90 },
  { query: 'check wcag compliance', expected_skill: 'sml-ui-guide', min_confidence: 80 },
  { query: 'audit navigation patterns', expected_skill: 'sml-ui-guide', min_confidence: 80 },
  { query: 'validate accessibility for oms', expected_skill: 'sml-ui-guide', min_confidence: 80 },
  { query: 'smartlog compliance check', expected_skill: 'sml-ui-guide', min_confidence: 95 },

  // sharpener_proactive tests
  { query: 'sharpen agent with 2026 patterns', expected_skill: 'sharpener_proactive', min_confidence: 90 },
  { query: 'apply openai sdk best practices', expected_skill: 'sharpener_proactive', min_confidence: 80 },
  { query: 'optimize agent tokens', expected_skill: 'sharpener_proactive', min_confidence: 90 },
  { query: 'upgrade agent to industry standards', expected_skill: 'sharpener_proactive', min_confidence: 75 },
  { query: 'reduce tokens in agent', expected_skill: 'sharpener_proactive', min_confidence: 90 },

  // sharpener_reactive tests
  { query: 'mine PEN entries from agent', expected_skill: 'sharpener_reactive', min_confidence: 95 },
  { query: 'convert past failures to regression tests', expected_skill: 'sharpener_reactive', min_confidence: 80 },
  { query: 'extract WIN patterns', expected_skill: 'sharpener_reactive', min_confidence: 95 },
  { query: 'analyze production failure in agent', expected_skill: 'sharpener_reactive', min_confidence: 92 },
  { query: 'sharpen reactive from ledger', expected_skill: 'sharpener_reactive', min_confidence: 75 },

  // Blocklist tests
  { query: 'sharpen agent from pen entries', expected_skill: 'sharpener_reactive', min_confidence: 95, note: 'Should route to reactive (PEN keyword)' },
  { query: 'apply 2026 patterns and best practices', expected_skill: 'sharpener_proactive', min_confidence: 90, note: 'Should route to proactive (2026 keyword)' },

  // No match cases
  { query: 'hello world', expected_skill: null, min_confidence: 0 },
  { query: 'implement payment gateway', expected_skill: null, min_confidence: 0 },
  { query: 'write unit tests', expected_skill: null, min_confidence: 0 }
];

function runTests() {
  const matcher = new FastRouteMatcher(path.join(__dirname, '..', 'agents', 'skills'));
  let passed = 0;
  let failed = 0;
  const failures = [];

  console.log('Running Fast Route Skill Tests...\n');
  console.log(`Loaded ${matcher.skills.length} skills with fast_route_patterns\n`);

  for (const test of TEST_CASES) {
    const matches = matcher.match(test.query);
    const topMatch = matches[0];

    let testPassed = false;
    if (test.expected_skill === null) {
      testPassed = matches.length === 0;
    } else {
      testPassed = topMatch &&
                   topMatch.skill_id === test.expected_skill &&
                   topMatch.confidence >= test.min_confidence;
    }

    if (testPassed) {
      console.log(`✅ PASS: "${test.query}"`);
      if (test.note) console.log(`   Note: ${test.note}`);
      passed++;
    } else {
      console.log(`❌ FAIL: "${test.query}"`);
      console.log(`   Expected: ${test.expected_skill || 'no match'} (≥${test.min_confidence}%)`);
      console.log(`   Got: ${topMatch ? `${topMatch.skill_id} (${topMatch.confidence}%)` : 'no match'}`);
      if (test.note) console.log(`   Note: ${test.note}`);
      if (topMatch && topMatch.matched_patterns) {
        console.log(`   Matched patterns:`);
        topMatch.matched_patterns.forEach(p => {
          console.log(`     - ${p.description}`);
        });
      }
      failed++;
      failures.push({
        query: test.query,
        expected: test.expected_skill,
        got: topMatch ? topMatch.skill_id : null,
        confidence: topMatch ? topMatch.confidence : 0
      });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${passed}/${TEST_CASES.length} tests passed`);
  console.log(`${'='.repeat(60)}`);

  if (failed > 0) {
    console.log('\nFailed tests summary:');
    failures.forEach((f, i) => {
      console.log(`${i + 1}. "${f.query}"`);
      console.log(`   Expected: ${f.expected || 'no match'}, Got: ${f.got || 'no match'} (${f.confidence}%)`);
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
