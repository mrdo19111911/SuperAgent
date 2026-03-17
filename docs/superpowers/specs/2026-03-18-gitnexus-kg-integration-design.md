# GitNexus Knowledge Graph Integration

**Date:** 2026-03-18
**Status:** Approved
**Approach:** GitNexus MCP Native (Approach 1)

## Problem

When SuperAgent is embedded into a target project, agents have no understanding of the codebase's code structure — no knowledge of which function calls which, what imports what, or how modules depend on each other. The existing BM25 system only searches knowledge docs, not source code.

## Solution

Integrate GitNexus (zero-server code intelligence engine) to auto-scan the target codebase on setup, providing agents with a queryable knowledge graph via MCP tools.

## Architecture

```
Target Project/
├── src/                           # target source code
├── SuperAgent/                    # embedded framework
│   ├── package.json               # setup script runs gitnexus analyze
│   ├── scripts/ki_vector.cjs      # BM25 index (knowledge docs)
│   ├── system/vector_db_wrapper.cjs
│   ├── gates/commit.sh            # +reindex after commit
│   └── data/ki_vectors.db         # BM25 SQLite index
├── .gitnexus/                     # KG database (auto, gitignored)
└── .claude/skills/                # GitNexus agent skills (auto)
```

### Dual Search System

| Dimension | BM25 | GitNexus KG |
|-----------|------|-------------|
| Index | `data/ki_vectors.db` | `.gitnexus/` |
| Scope | `agents/knowledge/*.md` | Target project source code |
| Query | Text search knowledge | Code structure, dependencies, impact |
| API | `ki_search.cjs` / `vector_db_wrapper.cjs` | MCP tools (7 tools) |

## Setup Flow

```
npm run setup
  ├── npm install
  ├── node scripts/create-demo-db.cjs
  ├── node scripts/auto_generate_ki.cjs
  ├── node scripts/compress_ki.cjs
  ├── node scripts/ki_vector.cjs
  ├── node scripts/analyze_git_dependencies.cjs
  ├── npx gitnexus analyze ..              ← NEW
  └── echo 'Nash Framework setup complete'
```

## Agent → GitNexus Tool Mapping

| Agent | Use Case | GitNexus Tool |
|-------|----------|---------------|
| Tung Diag | Audit C4 (Architecture) | `query`, `cypher` |
| Phuc SA | Design architecture | `impact`, `context` |
| Moc | Code review | `detect_changes` |
| Dung PM | Onboard new project | `list_repos`, `query` |
| Son QA | Test planning | `impact` |
| Nhien Janitor | Cleanup dead code | `cypher` |
| Huyen FE-QA | Cross-cutting analysis | `context` |

## GitNexus MCP Tools (7 total)

| Tool | Purpose |
|------|---------|
| `list_repos` | Discover all indexed repositories |
| `query` | Hybrid search (BM25 + semantic + RRF) |
| `context` | 360-degree symbol view |
| `impact` | Blast radius analysis with confidence |
| `detect_changes` | Git-diff → affected processes |
| `rename` | Multi-file coordinated rename |
| `cypher` | Raw graph queries |

## MCP Server Registration

Setup script auto-registers GitNexus MCP server for Claude Code:

```bash
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```

This adds an entry to `.mcp.json` so Claude Code discovers the 7 GitNexus tools.
The `gitnexus analyze` command also auto-generates `.claude/skills/` with 4 agent skills
(Exploring, Debugging, Impact Analysis, Refactoring).

## Reindex Strategy

1. **PostToolUse Hook (auto)** — GitNexus installs hook, incremental reindex after target project commits. This is the primary reindex mechanism for source code changes.
2. **Manual** — `npx gitnexus analyze ..` (incremental) or `--force` (full rebuild)

Note: `gates/commit.sh` is scoped to Nash pipeline modules, not target project code.
Target project commits go through regular `git commit` → GitNexus PostToolUse hook handles reindex.

## Error Handling

- **Setup failure:** `npx gitnexus analyze ..` uses `|| true` — if it fails (unsupported language, no git repo at parent), setup continues. Agents simply won't have KG tools available but BM25 knowledge search still works.
- **Runtime fallback:** If `.gitnexus/` missing or corrupted, MCP tools return empty results. Agents fall back to grep/glob/BM25 as before.
- **Recovery:** `npx gitnexus clean && npx gitnexus analyze ..` to rebuild from scratch.

## .gitignore

Setup script auto-appends `.gitnexus/` to the **target project's** `.gitignore` (`../.gitignore`) if not already present:

```bash
grep -qxF '.gitnexus/' ../.gitignore 2>/dev/null || echo '.gitnexus/' >> ../.gitignore
```

## Changes Required

1. `package.json` — add `gitnexus` to devDependencies (pinned `^1.0.0`), add to setup script with `|| true`
2. No changes to `gates/commit.sh` (reindex handled by GitNexus PostToolUse hook)

## Constraints

- **Embedding depth:** SuperAgent must be exactly one level below target project root (`TargetProject/SuperAgent/`)
- GitNexus supports 9 languages: TS, JS, Python, Java, C, C++, C#, Go, Rust
- Zero server, zero Docker, zero API keys
- KG stored in `.gitnexus/` (gitignored in target project)
- Agents need no code changes — MCP tools auto-available in Claude Code
