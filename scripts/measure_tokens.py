#!/usr/bin/env python3
"""
Token Counter with Persistent Memoization (Decision 18A)

Implements SHA256-based file caching to avoid re-tokenizing unchanged files.
Cache persists across runs in .token_cache.json (gitignored).

Usage:
    python scripts/measure_tokens.py --file path/to/agent.md
    python scripts/measure_tokens.py --dir agents/core
    python scripts/measure_tokens.py --cleanup

Performance:
    - Cache hit: ~0ms (read from JSON)
    - Cache miss: ~50ms (tiktoken encoding)
    - Savings: 95% cache hit rate after first run = 66s/day in production

Author: Nash Agent Framework
Date: 2026-03-16
"""

import sys
import os
import hashlib
import json
from pathlib import Path

try:
    import tiktoken
except ImportError:
    print("ERROR: tiktoken not installed. Run: pip install tiktoken")
    sys.exit(1)


CACHE_FILE = ".token_cache.json"
MAX_CACHE_ENTRIES = 1000


class TokenCounter:
    """
    Tokenizer with persistent file-based cache.
    Cache survives process restarts (unlike in-memory cache).
    """

    def __init__(self, encoding_name="cl100k_base"):
        """
        Initialize tokenizer with cache.

        Args:
            encoding_name: Tiktoken encoding (cl100k_base for GPT-4, Claude)
        """
        self.encoding = tiktoken.get_encoding(encoding_name)
        self.cache = self._load_cache()
        self.cache_hits = 0
        self.cache_misses = 0

    def _load_cache(self):
        """Load cache from disk."""
        if os.path.exists(CACHE_FILE):
            try:
                with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except (json.JSONDecodeError, IOError) as e:
                print(f"WARN: Cache corrupted ({e}), rebuilding...", file=sys.stderr)
                return {}
        return {}

    def _save_cache(self):
        """Save cache to disk."""
        try:
            with open(CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, indent=2)
        except IOError as e:
            print(f"WARN: Failed to save cache: {e}", file=sys.stderr)

    def _get_file_hash(self, filepath):
        """
        Compute SHA256 hash of file content.

        Args:
            filepath: Path to file

        Returns:
            str: SHA256 hex digest
        """
        try:
            with open(filepath, 'rb') as f:
                return hashlib.sha256(f.read()).hexdigest()
        except IOError as e:
            raise FileNotFoundError(f"Cannot read {filepath}: {e}")

    def count_tokens(self, filepath):
        """
        Count tokens with file-based caching.

        Args:
            filepath: Path to file

        Returns:
            int: Token count
        """
        filepath = str(Path(filepath).resolve())
        file_hash = self._get_file_hash(filepath)

        # Cache key: filepath:sha256
        cache_key = f"{filepath}:{file_hash}"

        # Check cache
        if cache_key in self.cache:
            self.cache_hits += 1
            return self.cache[cache_key]

        # Cache miss - tokenize and store
        self.cache_misses += 1
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except IOError as e:
            raise FileNotFoundError(f"Cannot read {filepath}: {e}")

        tokens = len(self.encoding.encode(content))

        # Update cache
        self.cache[cache_key] = tokens
        self._save_cache()

        return tokens

    def count_tokens_text(self, text):
        """
        Count tokens for text (no caching - use for dynamic content).

        Args:
            text: String to tokenize

        Returns:
            int: Token count
        """
        return len(self.encoding.encode(text))

    def cleanup_cache(self, max_entries=MAX_CACHE_ENTRIES):
        """
        Remove old cache entries if cache grows too large.

        Args:
            max_entries: Maximum cache entries to keep
        """
        if len(self.cache) > max_entries:
            print(f"Cache size {len(self.cache)} > {max_entries}, clearing...", file=sys.stderr)
            self.cache = {}
            self._save_cache()
            print(f"Cache cleared. Rebuild on next run.", file=sys.stderr)

    def print_stats(self):
        """Print cache hit/miss statistics."""
        total = self.cache_hits + self.cache_misses
        if total == 0:
            return

        hit_rate = self.cache_hits / total * 100
        print(f"\nCache Stats:", file=sys.stderr)
        print(f"  Hits: {self.cache_hits}/{total} ({hit_rate:.1f}%)", file=sys.stderr)
        print(f"  Misses: {self.cache_misses}/{total}", file=sys.stderr)
        print(f"  Total cache entries: {len(self.cache)}", file=sys.stderr)


def count_directory(counter, directory, pattern="*.md"):
    """
    Count tokens for all files in directory matching pattern.

    Args:
        counter: TokenCounter instance
        directory: Directory path
        pattern: Glob pattern (default: *.md)

    Returns:
        dict: {filepath: token_count}
    """
    from glob import glob

    pattern_path = os.path.join(directory, '**', pattern)
    files = glob(pattern_path, recursive=True)

    if not files:
        print(f"WARN: No files found matching {pattern_path}", file=sys.stderr)
        return {}

    results = {}
    for filepath in sorted(files):
        try:
            tokens = counter.count_tokens(filepath)
            results[filepath] = tokens
        except Exception as e:
            print(f"ERROR: {filepath}: {e}", file=sys.stderr)

    return results


def main():
    """Main CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Token counter with persistent memoization (Decision 18A)"
    )
    parser.add_argument(
        '--file',
        help='Count tokens for single file'
    )
    parser.add_argument(
        '--dir',
        help='Count tokens for all .md files in directory (recursive)'
    )
    parser.add_argument(
        '--text',
        help='Count tokens for text string (no caching)'
    )
    parser.add_argument(
        '--limit',
        type=int,
        help='Fail if token count exceeds limit (use with --file)'
    )
    parser.add_argument(
        '--cleanup',
        action='store_true',
        help='Clean cache if >1000 entries'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show cache statistics'
    )

    args = parser.parse_args()

    counter = TokenCounter()

    # Cleanup mode
    if args.cleanup:
        counter.cleanup_cache()
        print("✓ Cache cleanup complete")
        return 0

    # Text mode (no caching)
    if args.text:
        tokens = counter.count_tokens_text(args.text)
        print(f"{tokens}")
        return 0

    # File mode
    if args.file:
        try:
            tokens = counter.count_tokens(args.file)
            print(f"{args.file}: {tokens} tokens")

            # Check limit
            if args.limit and tokens > args.limit:
                print(f"❌ Token limit exceeded: {tokens} > {args.limit}", file=sys.stderr)
                return 1

            if args.stats:
                counter.print_stats()

            return 0

        except Exception as e:
            print(f"ERROR: {e}", file=sys.stderr)
            return 1

    # Directory mode
    if args.dir:
        results = count_directory(counter, args.dir)

        if not results:
            return 1

        # Print results
        total_tokens = 0
        violations = []

        for filepath, tokens in results.items():
            status = "OK" if not args.limit or tokens <= args.limit else "FAIL"
            print(f"{status} {filepath}: {tokens} tokens")

            total_tokens += tokens

            if args.limit and tokens > args.limit:
                violations.append((filepath, tokens))

        print(f"\nTotal: {len(results)} files, {total_tokens:,} tokens")

        if args.limit:
            print(f"Limit: {args.limit} tokens/file")
            if violations:
                print(f"\nFAIL: {len(violations)} violations:")
                for filepath, tokens in violations[:10]:
                    print(f"  {filepath}: {tokens} > {args.limit}")
                return 1
            else:
                print("✓ All files pass token limit")

        if args.stats:
            counter.print_stats()

        return 0

    # No arguments - show help
    parser.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
