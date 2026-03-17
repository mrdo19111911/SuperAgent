// Fast route pattern matcher for skills
const fs = require('fs');
const path = require('path');

class FastRouteMatcher {
  constructor(skillsDir = 'agents/skills') {
    this.skills = this.loadSkills(skillsDir);
  }

  loadSkills(dir) {
    const skills = [];
    const skillDirs = fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));

    for (const skillDir of skillDirs) {
      const metadataPath = path.join(dir, skillDir.name, 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          if (metadata.fast_route_patterns) {
            skills.push({
              id: metadata.id,
              name: metadata.name,
              patterns: metadata.fast_route_patterns
            });
          }
        } catch (err) {
          console.error(`Error loading ${metadataPath}: ${err.message}`);
        }
      }
    }
    return skills;
  }

  match(input) {
    const results = [];

    for (const skill of this.skills) {
      const score = this.scoreSkill(input, skill.patterns);
      if (score.confidence >= 75) {
        results.push({
          skill_id: skill.id,
          skill_name: skill.name,
          confidence: score.confidence,
          matched_patterns: score.matches,
          reason: score.reason
        });
      }
    }

    // Sort by confidence descending
    return results.sort((a, b) => b.confidence - a.confidence);
  }

  scoreSkill(input, patterns) {
    const inputLower = input.toLowerCase();
    const matches = [];
    let maxConfidence = 0;

    // Check blocklist first
    if (patterns.blocklist && patterns.blocklist.length > 0) {
      for (const blocked of patterns.blocklist) {
        if (inputLower.includes(blocked.toLowerCase())) {
          return { confidence: 0, matches: [], reason: `Blocked by: ${blocked}` };
        }
      }
    }

    // Check high confidence patterns
    if (patterns.high_confidence) {
      for (const p of patterns.high_confidence) {
        const regex = new RegExp(p.pattern, 'i');
        if (regex.test(input)) {
          matches.push({ pattern: p.pattern, confidence: p.confidence, description: p.description });
          maxConfidence = Math.max(maxConfidence, p.confidence);
        }
      }
    }

    // Check medium confidence patterns (only if no high match)
    if (maxConfidence < 90 && patterns.medium_confidence) {
      for (const p of patterns.medium_confidence) {
        const regex = new RegExp(p.pattern, 'i');
        if (regex.test(input)) {
          matches.push({ pattern: p.pattern, confidence: p.confidence, description: p.description });
          maxConfidence = Math.max(maxConfidence, p.confidence);
        }
      }
    }

    return { confidence: maxConfidence, matches };
  }
}

// CLI usage
if (require.main === module) {
  const matcher = new FastRouteMatcher();
  const query = process.argv.slice(2).join(' ');

  if (!query) {
    console.log('Usage: node fast_route_matcher.js <query>');
    console.log('\nExamples:');
    console.log('  node fast_route_matcher.js "review ui for smartlog tms"');
    console.log('  node fast_route_matcher.js "sharpen agent with 2026 patterns"');
    console.log('  node fast_route_matcher.js "mine PEN entries from agent"');
    process.exit(1);
  }

  const matches = matcher.match(query);

  console.log(`Query: "${query}"\n`);
  if (matches.length === 0) {
    console.log('No fast route matches. Fallback to MoE Router.');
  } else {
    console.log('Fast Route Matches:');
    matches.forEach((m, i) => {
      console.log(`\n${i + 1}. ${m.skill_name} (${m.skill_id})`);
      console.log(`   Confidence: ${m.confidence}%`);
      if (m.matched_patterns && m.matched_patterns.length > 0) {
        console.log(`   Matched patterns:`);
        m.matched_patterns.forEach(p => {
          console.log(`     - ${p.description} (${p.confidence}%)`);
        });
      }
      if (m.reason) {
        console.log(`   Reason: ${m.reason}`);
      }
    });
  }
}

module.exports = FastRouteMatcher;
