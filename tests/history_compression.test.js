/**
 * history_compression.test.js - Test 3-Zone History Compression
 *
 * Run: npm test tests/history_compression.test.js
 */

const {
  compressHistory,
  estimateTokens,
  extractIntent,
  extractVerb,
  summarizeOldExchange
} = require('../system/compress_history.js');

describe('History Compression', () => {
  describe('Zone 1: RECENT (no compression)', () => {
    test('should keep first 5 messages unchanged', () => {
      const messages = [
        { role: 'user', content: 'Implement OAuth' },
        { role: 'assistant', content: 'I will implement OAuth. [ACTION:Read auth.ts]' },
        { role: 'user', content: 'Thanks' },
        { role: 'assistant', content: 'Done' },
        { role: 'user', content: 'Test it' }
      ];

      const compressed = compressHistory(messages);

      // First 5 should be identical
      expect(compressed.slice(0, 5)).toEqual(messages);
    });
  });

  describe('Zone 2: MIDDLE (strip + truncate)', () => {
    test('should strip ACTION tags from bot responses', () => {
      const messages = [
        { role: 'assistant', content: 'Analyzed. [ACTION:Read file.ts] [ACTION:Grep TODO] Done.' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed[0].content).not.toContain('[ACTION:');
      expect(compressed[0].content).toBe('Analyzed. Done.');
    });

    test('should remove verbose prefixes', () => {
      const messages = [
        { role: 'assistant', content: 'Great question! Let me analyze the code. After reviewing, I found the issue.' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed[0].content).not.toContain('Great question!');
      expect(compressed[0].content).not.toContain('Let me');
    });

    test('should truncate to first 2 sentences', () => {
      const messages = [
        { role: 'assistant', content: 'First sentence. Second sentence. Third sentence. Fourth sentence.' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed[0].content).toBe('First sentence. Second sentence.');
    });

    test('should keep user messages FULL', () => {
      const userMsg = { role: 'user', content: 'Implement OAuth 2.0 with Google and GitHub providers using PKCE flow.' };
      const messages = [userMsg];

      const compressed = compressHistory(messages);

      expect(compressed[0]).toEqual(userMsg);
    });

    test('should preserve error messages', () => {
      const messages = [
        { role: 'assistant', content: 'Error: TypeError at line 42. [ACTION:Read file.ts] Stack trace shows...' }
      ];

      const compressed = compressHistory(messages);

      // Should strip ACTION tags but keep full content
      expect(compressed[0].content).not.toContain('[ACTION:');
      expect(compressed[0].content).toContain('Error: TypeError at line 42');
      expect(compressed[0].content).toContain('Stack trace shows');
    });

    test('should preserve user corrections', () => {
      const messages = [
        { role: 'user', content: 'No, actually use axios instead of fetch.' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed[0].content).toBe('No, actually use axios instead of fetch.');
    });
  });

  describe('Zone 3: OLD (collapse to summaries)', () => {
    test('should collapse old exchanges to 1-line summaries', () => {
      const messages = [
        { role: 'user', content: 'Can you help me debug the payment module? Tests are failing.' },
        { role: 'assistant', content: 'I will analyze the payment tests. Let me read the test files first. [ACTION:Read tests/payment.test.ts] Found the issue - missing mock for Stripe API.' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed.length).toBe(1);
      expect(compressed[0].role).toBe('system');
      expect(compressed[0].content).toContain('[History]');
      expect(compressed[0].content).toContain('fix');
    });

    test('should extract file names in summaries', () => {
      const userMsg = 'Fix bug in auth.ts';
      const botMsg = 'Fixed the bug in auth.ts file.';

      const summary = summarizeOldExchange(userMsg, botMsg);

      expect(summary).toContain('auth.ts');
    });
  });

  describe('Intent & Verb Extraction', () => {
    test('should extract implement intent', () => {
      expect(extractIntent('Implement OAuth login')).toBe('implement');
      expect(extractIntent('Create new feature')).toBe('implement');
    });

    test('should extract fix intent', () => {
      expect(extractIntent('Fix the bug in auth')).toBe('fix');
      expect(extractIntent('Debug payment module')).toBe('fix');
    });

    test('should extract analyze intent', () => {
      expect(extractIntent('Analyze the codebase')).toBe('analyze');
      expect(extractIntent('Review the PR')).toBe('analyze');
    });

    test('should extract implemented verb', () => {
      expect(extractVerb('I implemented OAuth login')).toBe('implemented');
      expect(extractVerb('Created new feature')).toBe('implemented');
    });

    test('should extract fixed verb', () => {
      expect(extractVerb('Fixed the bug')).toBe('fixed');
      expect(extractVerb('Debugged the issue')).toBe('fixed');
    });
  });

  describe('Token Estimation', () => {
    test('should estimate tokens correctly', () => {
      const messages = [
        { role: 'user', content: 'This is a test message' } // 5 words × 4 chars avg = 20 chars ≈ 5 tokens
      ];

      const tokens = estimateTokens(messages);
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(10);
    });
  });

  describe('End-to-End Compression', () => {
    test('should reduce tokens by ~49%', () => {
      const messages = [];

      // Generate 20 messages (10 exchanges)
      for (let i = 0; i < 10; i++) {
        messages.push({ role: 'user', content: `User message ${i + 1}` });
        messages.push({
          role: 'assistant',
          content: `Bot response ${i + 1}. [ACTION:Read file.ts] [ACTION:Write output.ts] I have completed the task. Let me verify. Great! Everything works. Please review the changes.`
        });
      }

      const beforeTokens = estimateTokens(messages);
      const compressed = compressHistory(messages);
      const afterTokens = estimateTokens(compressed);

      const reduction = (beforeTokens - afterTokens) / beforeTokens;

      expect(reduction).toBeGreaterThan(0.40); // At least 40% reduction
      expect(compressed.length).toBeLessThan(messages.length);
    });
  });

  describe('Edge Cases', () => {
    test('should handle messages with code blocks', () => {
      const messages = [
        {
          role: 'assistant',
          content: 'Here is the code:\n```typescript\nfunction test() {\n  console.log("test");\n}\n```\nThis implements the feature.'
        }
      ];

      const compressed = compressHistory(messages);

      // Should preserve code block structure
      expect(compressed[0].content).toContain('```');
      expect(compressed[0].content).toContain('function test()');
    });

    test('should handle empty messages', () => {
      const messages = [
        { role: 'user', content: '' },
        { role: 'assistant', content: '' }
      ];

      const compressed = compressHistory(messages);

      expect(compressed.length).toBe(2);
    });

    test('should handle odd number of messages in Zone 3', () => {
      const messages = [];

      // 15 messages (7.5 pairs)
      for (let i = 0; i < 15; i++) {
        messages.push({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`
        });
      }

      const compressed = compressHistory(messages);

      // Should not throw error
      expect(compressed).toBeDefined();
    });

    test('should limit to maxMessages', () => {
      const messages = [];
      for (let i = 0; i < 50; i++) {
        messages.push({ role: 'user', content: `Message ${i + 1}` });
      }

      const compressed = compressHistory(messages, 20);

      // Should only compress last 20 messages
      expect(compressed.length).toBeLessThanOrEqual(20);
    });
  });

  describe('ACTION Tag Prevention', () => {
    test('should strip ALL ACTION tags to prevent re-execution', () => {
      const messages = [
        {
          role: 'assistant',
          content: '[ACTION:Read file1.ts] [ACTION:Write file2.ts] [ACTION:Bash npm test] Done.'
        }
      ];

      const compressed = compressHistory(messages);

      // Absolutely NO ACTION tags should remain
      expect(compressed[0].content).not.toMatch(/\[ACTION:/);
      expect(compressed[0].content).toBe('Done.');
    });

    test('should prevent re-execution hallucination', () => {
      // Simulate old message with file write action
      const messages = [
        { role: 'assistant', content: 'I have implemented auth. [ACTION:Write src/auth.ts content=...]' }
      ];

      const compressed = compressHistory(messages);

      // LLM should NOT see the ACTION tag and re-execute write
      expect(compressed[0].content).not.toContain('[ACTION:Write');
    });
  });
});
