# AUTO_SETUP.md - Nash Framework Portable Installation

> **Copy framework này sang máy khác? Đọc file này và chạy lệnh bên dưới.**
>
> Agent sẽ tự động cài đặt toàn bộ: Nash CLI, Skills, Slash Commands, Factories.

---

## 🚀 QUICK START (Copy & Paste)

### Bước 1: Verify Framework Structure (5 giây)

```bash
# Kiểm tra các file/folder quan trọng tồn tại
ls CLAUDE.md main.md bin/nash agents/skills/ gates/ system/ observability/

# Kết quả mong đợi: Tất cả files/folders hiển thị, không có lỗi "No such file"
```

**Nếu thiếu gì → framework chưa copy đầy đủ.**

---

### Bước 2: Activate Nash Factories (30 giây)

```bash
# 2.1. Verify skills copied
ls agents/skills/sharpener_reactive/SKILL.md
ls agents/skills/sharpener_proactive/SKILL.md

# Nếu thiếu → copy từ deprecated:
# cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_reactive agents/skills/
# cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_proactive agents/skills/

# 2.2. Verify registry exists
cat agents/skills/_registry.json

# Nếu thiếu → tạo registry:
# cat > agents/skills/_registry.json <<'EOF'
# {
#   "registry_version": "2.0",
#   "last_updated": "2026-03-17T12:00:00.000Z",
#   "skills": []
# }
# EOF

# 2.3. Test Nash CLI
node bin/nash list-skills

# Kết quả mong đợi: 2 skill(s) registered (sharpener_reactive, sharpener_proactive)
```

---

### Bước 3: Create Slash Commands (1 phút)

```bash
# 3.1. Create .claude/commands directory
mkdir -p .claude/commands

# 3.2. Create /sharpen command
cat > .claude/commands/sharpen.md <<'EOF'
---
description: Fix agent bugs using PEN/WIN-based reactive sharpening
allowedTools: ["*"]
---

You are running the `/sharpen` workflow to automatically fix agent bugs based on PEN (Penalty) entries.

**Load the complete workflow from:**
`agents/skills/sharpener_reactive/SKILL.md`

**Your mission:**
Mine PEN entries from agent file → Auto-generate regression tests → Sharpen skills until all tests pass → Update agent file.

**Follow the workflow EXACTLY as documented in SKILL.md. Track progress with TodoWrite.**
EOF

# 3.3. Create /upgrade-agent command
cat > .claude/commands/upgrade-agent.md <<'EOF'
---
description: Upgrade agent to 2026 industry standards using proactive sharpening
allowedTools: ["*"]
---

You are running the `/upgrade-agent` workflow to apply 2026 best practices to Nash agents.

**Load the complete workflow from:**
`agents/skills/sharpener_proactive/SKILL.md`

**Your mission:**
Audit agent against 5 core principles + 9 workflow patterns → Identify gaps → Apply industry patterns → Reduce tokens 60-80% → Document improvements.

**Follow the workflow EXACTLY as documented in SKILL.md. Track progress with TodoWrite.**
EOF

# 3.4. Verify slash commands
ls .claude/commands/sharpen.md .claude/commands/upgrade-agent.md

# Kết quả mong đợi: 2 files exist
```

---

### Bước 4: Test Everything Works (30 giây)

```bash
# 4.1. Test Nash CLI
node bin/nash list-skills
node bin/nash list-souls

# 4.2. Test gate scripts
bash gates/validate.sh --help 2>&1 | head -5

# 4.3. Test dashboard (open in browser)
# Windows: start observability/dashboard-simple.html
# Mac/Linux: open observability/dashboard-simple.html

# 4.4. Reload VSCode to activate slash commands
# → File > Reload Window
# → Then type "/" in chat to see /sharpen and /upgrade-agent
```

---

## ✅ SUCCESS CRITERIA

After completing setup, you should have:

- ✅ Nash CLI works: `node bin/nash list-skills` shows 2+ skills
- ✅ Slash commands: `/sharpen` and `/upgrade-agent` appear in autocomplete
- ✅ Gate scripts executable: `bash gates/validate.sh` runs
- ✅ Dashboard opens: `observability/dashboard-simple.html` loads
- ✅ Agent profiles readable: `cat agents/core/dung-manager.md` shows content

---

## 📋 WHAT GETS INSTALLED

### 1. Nash CLI (Skill & Agent Manager)

**Location:** `bin/nash`

**Commands:**
```bash
node bin/nash list-skills         # List all registered skills
node bin/nash list-souls          # List available agent personalities
node bin/nash create-skill --name "X" --id x    # Scaffold new skill
node bin/nash install-skill <id> --agent <name> # Add skill to agent
```

---

### 2. Agent Factories (2 Sharpeners)

**Location:** `agents/skills/sharpener_reactive/`, `agents/skills/sharpener_proactive/`

**Slash Commands:**
- `/sharpen <agent-file>` - Fix bugs based on PEN entries (reactive)
- `/upgrade-agent <agent-file>` - Apply 2026 standards (proactive)

**Use Cases:**
- Agent has 3+ PEN entries → `/sharpen agents/core/phuc-sa.md`
- Quarterly upgrade → `/upgrade-agent agents/core/phuc-sa.md`
- Token bloat (>500 L2 Cache) → `/upgrade-agent --mode token-optimization`

---

### 3. Quality Gates (5 Scripts)

**Location:** `gates/`

**Scripts:**
```bash
bash gates/validate.sh <module>   # Build + tsc + tests + no TODO/FIXME
bash gates/integrity.sh <module>  # Detect mocks in integration tests
bash gates/qa.sh <module>         # SAST + test distribution + smoke
bash gates/security.sh <module>   # Secrets scan + dependency audit
bash gates/commit.sh <module>     # Pre-validate → safe git commit
```

**Auto-detects:** TypeScript, Go, .NET, Python projects

---

### 4. Dashboard (Real-time Observability)

**Location:** `observability/dashboard-simple.html`

**Features:**
- Static HTML (no React, no npm)
- JSONP data loading (no CORS, no server)
- Auto-refresh every 3s when `data.js` changes
- Track tasks, agents, token usage

**Usage:**
```bash
# Open dashboard
open observability/dashboard-simple.html

# Update data (auto-refreshes UI)
vim observability/data.js
# → Save → Dashboard updates within 3s
```

---

## 🔧 TROUBLESHOOTING

### Problem: "nash list-skills" shows 0 skills

**Fix:**
```bash
# Check registry exists
cat agents/skills/_registry.json

# If missing → create it
cat > agents/skills/_registry.json <<'EOF'
{
  "registry_version": "2.0",
  "last_updated": "2026-03-17T12:00:00.000Z",
  "skills": []
}
EOF

# Register sharpeners
node bin/nash register-skill sharpener_reactive
node bin/nash register-skill sharpener_proactive
```

---

### Problem: Slash commands not appearing

**Fix:**
```bash
# 1. Verify files exist
ls .claude/commands/sharpen.md
ls .claude/commands/upgrade-agent.md

# 2. Reload VSCode
# File > Reload Window (or Ctrl+R)

# 3. Type "/" in chat to see commands
```

---

### Problem: Gate scripts fail with "permission denied"

**Fix:**
```bash
# Make scripts executable
chmod +x gates/*.sh

# Test again
bash gates/validate.sh /tmp/test-dir
```

---

### Problem: Dashboard shows "Access to fetch blocked by CORS"

**Fix:** Don't use `fetch()` - framework already uses JSONP (`<script src="data.js">`) which bypasses CORS. This error means you're using old dashboard version.

```bash
# Verify correct dashboard
grep "script src.*data.js" observability/dashboard-simple.html

# Should see: <script src="./data.js"></script>
```

---

## 🎯 NEXT STEPS

### After Installation

1. **Read main.md** - Workflow orchestration guide
   ```bash
   cat main.md | head -100
   ```

2. **Test a simple pipeline**
   ```bash
   # Example: Validate a module
   mkdir -p test-module/src
   echo "// TODO: test" > test-module/src/index.ts
   bash gates/validate.sh test-module
   # Should detect TODO and fail
   ```

3. **Try agent sharpening**
   ```bash
   # If any agent has PEN entries
   /sharpen agents/core/dung-manager.md

   # Or proactive upgrade
   /upgrade-agent agents/core/phuc-sa.md
   ```

4. **Create your first skill**
   ```bash
   node bin/nash create-skill --name "My Workflow" --id my-workflow
   # → Edit agents/skills/my-workflow/SKILL.md
   # → Register: node bin/nash register-skill my-workflow
   ```

---

## 📖 DOCUMENTATION QUICK REFERENCE

| I want to... | Read this file |
|--------------|----------------|
| Understand Nash Framework | [CLAUDE.md](CLAUDE.md) |
| Learn workflow orchestration | [main.md](main.md) |
| Create agents | [deprecated/agent_factory_OLD/README.md](deprecated/agent_factory_OLD/README.md) |
| Create skills | [deprecated/skill_factory_OLD/README.md](deprecated/skill_factory_OLD/README.md) |
| Understand pipelines | [system/pipelines/](system/pipelines/) |
| Learn Nash Triad | [system/NASH.md](system/NASH.md) |
| Scoring rules | [system/SCORING_RULES.md](system/SCORING_RULES.md) |
| Memory system | [system/MEMORY_EVICTION_PROTOCOL.md](system/MEMORY_EVICTION_PROTOCOL.md) |

---

## 🚨 IMPORTANT NOTES

### What's Active vs Deprecated

**ACTIVE (Use These):**
- ✅ `agents/skills/` - Active skills (sharpeners)
- ✅ `bin/nash` - Nash CLI
- ✅ `gates/` - Quality gate scripts
- ✅ `system/pipelines/` - SDLC workflows
- ✅ `.claude/commands/` - Slash commands

**DEPRECATED (Reference Only):**
- ⚠️ `deprecated/agent_factory_OLD/` - Documentation + templates (tools moved to agents/skills/)
- ⚠️ `deprecated/skill_factory_OLD/` - Documentation + templates (tools moved to agents/skills/)
- ⚠️ `agents/skills.bak/` - Backup of 60+ skills (optional - activate if needed)

**BACKUP (Optional):**
- 📦 `agents/skills.bak/` - Contains 60+ additional skills
- 📦 `ram/skills/` - Skills reference documentation

**To activate backup skills:**
```bash
# Copy specific skill from backup
cp -r agents/skills.bak/code-review-excellence agents/skills/
node bin/nash register-skill code-review-excellence

# Or activate all (symlink)
rm -rf agents/skills
ln -s skills.bak agents/skills
```

---

## ✅ FINAL CHECKLIST

Before using framework, verify:

- [ ] Nash CLI works: `node bin/nash list-skills`
- [ ] Sharpeners registered: Output shows 2 skills
- [ ] Slash commands exist: `ls .claude/commands/sharpen.md`
- [ ] Gate scripts executable: `bash gates/validate.sh --help`
- [ ] Dashboard opens: `observability/dashboard-simple.html`
- [ ] Main docs readable: `cat CLAUDE.md main.md`

---

**Framework Version:** Nash Anti_propost_0.1
**Last Updated:** 2026-03-17
**Minimum Setup Time:** 2 minutes
**Full Setup Time:** 5 minutes

---

*Nash Agent Framework | See [CLAUDE.md](CLAUDE.md) for architecture | [main.md](main.md) for orchestration*
