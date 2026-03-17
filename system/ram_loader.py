#!/usr/bin/env python3
"""
RAM Loader with depth limit and cycle detection.

Prevents:
- RAM depth exceeding 3 levels
- Circular dependencies in RAM references
"""

import re
from pathlib import Path
from typing import Set, List


class RAMDepthError(Exception):
    """Raised when RAM reference depth exceeds MAX_RAM_DEPTH."""
    pass


class RAMCycleError(Exception):
    """Raised when circular RAM reference detected."""
    pass


MAX_RAM_DEPTH = 3


def extract_ram_references(content: str) -> List[str]:
    """
    Extract RAM file references from content.
    Pattern: [[ram/...]] or `[[ram/...]]`

    Args:
        content: File content to parse

    Returns:
        List of RAM file paths
    """
    # Match [[ram/path/to/file.md]] or `[[ram/path/to/file.md]]`
    pattern = r'`?\[\[ram/([^\]]+)\]\]`?'
    matches = re.findall(pattern, content)
    return [f"ram/{match}" for match in matches]


def load_ram(path: str, depth: int = 0, loaded_paths: Set[str] = None) -> str:
    """
    Load RAM file with depth limit and cycle detection.

    Args:
        path: Path to RAM file (relative to repo root)
        depth: Current recursion depth
        loaded_paths: Set of already loaded paths (for cycle detection)

    Returns:
        File content

    Raises:
        RAMDepthError: If depth exceeds MAX_RAM_DEPTH
        RAMCycleError: If circular dependency detected
        FileNotFoundError: If RAM file doesn't exist
    """
    if loaded_paths is None:
        loaded_paths = set()

    # Normalize path
    normalized_path = str(Path(path).as_posix())

    # Check depth
    if depth > MAX_RAM_DEPTH:
        raise RAMDepthError(
            f"RAM depth exceeded at {normalized_path} "
            f"(max depth: {MAX_RAM_DEPTH}, current: {depth})"
        )

    # Check cycle
    if normalized_path in loaded_paths:
        cycle_path = " → ".join(sorted(loaded_paths)) + f" → {normalized_path}"
        raise RAMCycleError(f"Circular dependency detected: {cycle_path}")

    # Load file
    file_path = Path(normalized_path)
    if not file_path.exists():
        raise FileNotFoundError(f"RAM file not found: {normalized_path}")

    content = file_path.read_text(encoding='utf-8')

    # Track this path
    loaded_paths_copy = loaded_paths.copy()
    loaded_paths_copy.add(normalized_path)

    # Extract and load nested references
    references = extract_ram_references(content)
    nested_content = {}

    for ref in references:
        try:
            nested_content[ref] = load_ram(ref, depth + 1, loaded_paths_copy)
        except (RAMDepthError, RAMCycleError) as e:
            # Re-raise validation errors
            raise
        except FileNotFoundError as e:
            # Log missing nested references but don't fail
            print(f"Warning: {e}")
            nested_content[ref] = f"[Missing: {ref}]"

    return content


def validate_ram_file(path: str) -> bool:
    """
    Validate a RAM file can be loaded without errors.

    Args:
        path: Path to RAM file

    Returns:
        True if valid, False otherwise
    """
    try:
        load_ram(path)
        return True
    except (RAMDepthError, RAMCycleError, FileNotFoundError) as e:
        print(f"Validation failed for {path}: {e}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ram_loader.py <path_to_ram_file>")
        sys.exit(1)

    ram_file = sys.argv[1]

    try:
        content = load_ram(ram_file)
        print(f"✅ Successfully loaded {ram_file}")
        print(f"Content length: {len(content)} chars")
    except (RAMDepthError, RAMCycleError, FileNotFoundError) as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
