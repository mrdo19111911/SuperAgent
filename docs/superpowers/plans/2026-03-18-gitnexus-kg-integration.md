# GitNexus Knowledge Graph Integration — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate GitNexus into SuperAgent setup so agents get automatic code structure awareness when embedded into any target project.

**Architecture:** Add `gitnexus` as devDependency, extend the `setup` script to run `npx gitnexus analyze ..` (scan parent/target project), register MCP server, and handle `.gitignore` for the target project. Zero new files — only `package.json` changes.

**Tech Stack:** GitNexus (npm), Claude Code MCP

**Spec:** `docs/superpowers/specs/2026-03-18-gitnexus-kg-integration-design.md`

---

## File Structure

- Modify: `package.json` — add devDependency + setup script + new convenience scripts

---

### Task 1: Add gitnexus devDependency

**Files:**
- Modify: `package.json:45-48` (devDependencies)

- [ ] **Step 1: Add gitnexus to devDependencies**

In `package.json`, add `gitnexus` to `devDependencies`:

```json
"devDependencies": {
    "eslint": "^8.56.0",
    "gitnexus": "^1.0.0",
    "jest": "^29.7.0"
}
```

- [ ] **Step 2: Add knowledge-graph keyword**

In `package.json`, add `"knowledge-graph"` to the keywords array.

- [ ] **Step 3: Run npm install**

Run: `npm install`
Expected: gitnexus added to node_modules, package-lock.json updated.

- [ ] **Step 4: Verify gitnexus CLI works**

Run: `npx gitnexus --help`
Expected: Shows available commands (analyze, setup, mcp, list, clean, serve).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add gitnexus devDependency for knowledge graph support"
```

---

### Task 2: Extend setup script with GitNexus analyze + .gitignore

**Files:**
- Modify: `package.json:12` (setup script)
- Modify: `package.json:7-26` (scripts section — add new convenience scripts)

- [ ] **Step 1: Update setup script**

In `package.json`, update the `setup` script to add GitNexus steps after `analyze_git_dependencies.cjs`:

```json
"setup": "npm install && node scripts/create-demo-db.cjs && node scripts/auto_generate_ki.cjs && node scripts/compress_ki.cjs && node scripts/ki_vector.cjs && node scripts/analyze_git_dependencies.cjs && (grep -qxF '.gitnexus/' ../.gitignore 2>/dev/null || echo '.gitnexus/' >> ../.gitignore) && (npx gitnexus analyze .. || true) && echo '✅ Nash Framework setup complete'"
```

Key details:
- `grep -qxF '.gitnexus/' ../.gitignore || echo '.gitnexus/' >> ../.gitignore` — adds `.gitnexus/` to target project's `.gitignore` if not present
- `npx gitnexus analyze .. || true` — scans parent (target project), graceful failure
- `..` = parent directory (target project root, since SuperAgent is embedded as subdirectory)

- [ ] **Step 2: Add convenience scripts**

Add these scripts to the `scripts` section in `package.json`:

```json
"kg:analyze": "npx gitnexus analyze ..",
"kg:analyze:force": "npx gitnexus analyze .. --force",
"kg:clean": "npx gitnexus clean",
"kg:list": "npx gitnexus list",
"kg:mcp": "npx gitnexus mcp",
"setup:kg": "npx gitnexus analyze .."
```

- [ ] **Step 3: Test setup script (dry run)**

Run: `npm run kg:analyze`
Expected: GitNexus scans parent directory, creates `.gitnexus/` at parent level. Output shows indexed files count and languages detected.

If parent directory has no supported code files, expected: GitNexus completes with 0 files indexed (graceful).

- [ ] **Step 4: Verify .gitignore handling**

Run: `grep '.gitnexus' ../.gitignore`
Expected: `.gitnexus/` appears in the file.

- [ ] **Step 5: Test MCP server starts**

Run: `npx gitnexus mcp` (then Ctrl+C to stop)
Expected: MCP server starts in stdio mode, ready for tool calls.

- [ ] **Step 6: Commit**

```bash
git add package.json
git commit -m "feat: integrate GitNexus KG into setup flow with convenience scripts"
```

---

### Task 3: Register GitNexus MCP server

- [ ] **Step 1: Register MCP server with Claude Code**

Run: `claude mcp add gitnexus -- npx -y gitnexus@latest mcp`
Expected: GitNexus MCP server registered. Claude Code can now discover the 7 tools (query, impact, context, detect_changes, rename, cypher, list_repos).

- [ ] **Step 2: Verify MCP tools available**

Run: `claude mcp list`
Expected: `gitnexus` appears in the list of registered MCP servers.

- [ ] **Step 3: Commit MCP config if file-based**

If `.mcp.json` or equivalent was created/modified:
```bash
git add .mcp.json
git commit -m "feat: register GitNexus MCP server for agent tools"
```

---

### Task 4: End-to-end verification

- [ ] **Step 1: Run full setup**

Run: `npm run setup`
Expected: All steps complete including GitNexus analyze. Output shows `✅ Nash Framework setup complete`.

- [ ] **Step 2: Test GitNexus query**

In Claude Code, verify agents can use GitNexus tools:
- `query` — search for symbols in target project
- `impact` — check blast radius of a function
- `context` — get 360-degree view of a symbol

- [ ] **Step 3: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: GitNexus KG integration complete"
```
