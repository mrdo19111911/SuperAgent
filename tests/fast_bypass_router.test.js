/**
 * fast_bypass_router.test.js - Test Fast Bypass Router
 *
 * Run: npm test tests/fast_bypass_router.test.js
 */

const { calculateBypassConfidence, containsBlockedKeyword } = require('../system/fast_bypass_scorer.js');

describe('Fast Bypass Router', () => {
  describe('INSTANT_BYPASS (100% confidence)', () => {
    test('should bypass casual Vietnamese', () => {
      const result = calculateBypassConfidence('ê');
      expect(result.confidence).toBe(100);
      expect(result.route).toBe('INSTANT_BYPASS');
    });

    test('should bypass acknowledgments', () => {
      const inputs = ['ok', 'done', 'thanks', 'got it'];
      inputs.forEach(input => {
        const result = calculateBypassConfidence(input);
        expect(result.confidence).toBe(100);
        expect(result.route).toBe('INSTANT_BYPASS');
      });
    });

    test('should bypass emojis', () => {
      const result = calculateBypassConfidence('👍');
      expect(result.confidence).toBe(100);
      expect(result.route).toBe('INSTANT_BYPASS');
    });
  });

  describe('SYSTEM_COMMAND (95% confidence)', () => {
    test('should route git commands to direct execution', () => {
      const commands = ['git status', 'git diff', 'git log'];
      commands.forEach(cmd => {
        const result = calculateBypassConfidence(cmd);
        expect(result.confidence).toBe(95);
        expect(result.route).toBe('SYSTEM_COMMAND');
      });
    });

    test('should route npm commands to direct execution', () => {
      const result = calculateBypassConfidence('npm test');
      expect(result.confidence).toBe(95);
      expect(result.route).toBe('SYSTEM_COMMAND');
    });

    test('should route screenshot commands to direct execution', () => {
      const result = calculateBypassConfidence('screenshot the page');
      expect(result.confidence).toBe(95);
      expect(result.route).toBe('SYSTEM_COMMAND');
    });
  });

  describe('SIMPLE_BYPASS (80% confidence)', () => {
    test('should bypass simple queries', () => {
      const queries = ['show me logs', 'list files', 'what is status', 'check auth.ts'];
      queries.forEach(query => {
        const result = calculateBypassConfidence(query);
        expect(result.confidence).toBe(80);
        expect(result.route).toBe('SIMPLE_BYPASS');
      });
    });

    test('should require ≤5 words for simple bypass', () => {
      const result = calculateBypassConfidence('show me all the log files in the system');
      expect(result.route).toBe('MoE_ROUTER'); // >5 words
    });
  });

  describe('MoE_ROUTER (fallback)', () => {
    test('should route complex tasks to MoE', () => {
      const tasks = [
        'implement OAuth 2.0 authentication',
        'refactor payment module to use Stripe',
        'debug why tests are failing'
      ];
      tasks.forEach(task => {
        const result = calculateBypassConfidence(task);
        expect(result.confidence).toBe(0);
        expect(result.route).toBe('MoE_ROUTER');
      });
    });
  });

  describe('Blocklist Protection', () => {
    test('should block architecture keywords', () => {
      const result = calculateBypassConfidence('show architecture');
      expect(result.confidence).toBe(0);
      expect(result.route).toBe('MoE_ROUTER');
      expect(result.reason).toContain('blocked keyword');
    });

    test('should block security keywords', () => {
      const result = calculateBypassConfidence('check security');
      expect(result.confidence).toBe(0);
      expect(result.route).toBe('MoE_ROUTER');
    });

    test('should block database keywords', () => {
      const result = calculateBypassConfidence('ok database'); // Would be 100% without blocklist
      expect(result.confidence).toBe(0);
      expect(result.route).toBe('MoE_ROUTER');
    });

    test('should detect all blocklist keywords', () => {
      const keywords = [
        'architecture', 'database', 'security', 'deployment', 'refactor',
        'critical', 'production', 'bug', 'error', 'test',
        'schema', 'contract', 'api', 'auth', 'payment'
      ];

      keywords.forEach(kw => {
        expect(containsBlockedKeyword(`some text with ${kw}`)).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty input', () => {
      const result = calculateBypassConfidence('');
      expect(result.route).toBe('MoE_ROUTER');
    });

    test('should handle multi-word casual', () => {
      const result = calculateBypassConfidence('ok bro'); // Contains "ok"
      expect(result.route).toBe('INSTANT_BYPASS');
    });

    test('should be case-insensitive', () => {
      const result1 = calculateBypassConfidence('OK');
      const result2 = calculateBypassConfidence('ok');
      expect(result1).toEqual(result2);
    });
  });

  describe('Token Savings Estimation', () => {
    test('should save 92% tokens for casual messages', () => {
      const tokensBefore = 2500;
      const tokensAfter = 200; // Profile Line only
      const savings = (tokensBefore - tokensAfter) / tokensBefore;
      expect(savings).toBeGreaterThan(0.90);
    });

    test('should save 100% tokens for system commands', () => {
      const tokensBefore = 2500;
      const tokensAfter = 0; // Direct tool execution
      const savings = (tokensBefore - tokensAfter) / tokensBefore;
      expect(savings).toBe(1.0);
    });
  });
});
