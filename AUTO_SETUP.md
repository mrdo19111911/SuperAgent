# AUTO_SETUP.md - Nash Framework Auto-Installer

> **Prompt này khi copy framework sang máy mới.**
>
> Agent sẽ TỰ ĐỘNG tạo slash commands, install skills, setup registry - KHÔNG cần copy thủ công.

---

## 🤖 AGENT INSTRUCTIONS - READ AND EXECUTE

**You are setting up Nash Framework on a new machine. Follow these steps EXACTLY.**

**IMPORTANT:**
- Create ALL files programmatically (use Write tool)
- Do NOT ask user to copy-paste bash commands
- Track progress with TodoWrite
- Report completion status after each phase

---

## Phase 1: Verify Framework Structure

### Step 1.1: Check Core Files Exist

```bash
ls CLAUDE.md main.md bin/nash agents/ gates/ system/ observability/
```

**Expected:** All files/folders exist

**If missing:** STOP - Framework not copied completely. Tell user to copy entire SuperAgent folder.

---

### Step 1.2: Check Skills Source Exists

```bash
ls deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_reactive/SKILL.md
ls deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_proactive/SKILL.md
```

**Expected:** Both SKILL.md files exist

**If missing:** STOP - Tell user deprecated/ folder is required.

---

## Phase 2: Install Skills (Auto-Copy)

### Step 2.1: Create agents/skills/ Directory

```bash
mkdir -p agents/skills
```

### Step 2.2: Copy Sharpener Skills

**Use Bash tool to copy:**

```bash
cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_reactive agents/skills/
cp -r deprecated/agent_factory_OLD/3_AGENT_SHARPENING/sharpener_proactive agents/skills/
```

**Verify:**

```bash
ls agents/skills/sharpener_reactive/SKILL.md
ls agents/skills/sharpener_proactive/SKILL.md
```

**Expected:** Both files exist

---

### Step 2.3: Create Skills Registry

**Use Write tool to create `agents/skills/_registry.json`:**

```json
{
  "registry_version": "2.0",
  "last_updated": "2026-03-17T12:00:00.000Z",
  "skills": [
    {
      "id": "sharpener_reactive",
      "name": "Agent Skill Sharpener (Reactive)",
      "version": "1.0.0",
      "author": "Nash Framework",
      "description": "Automatically sharpen agent skills by mining PEN/WIN entries from agent files, converting past failures into regression tests, and iteratively improving agent capabilities.",
      "tags": ["agent-factory", "sharpening", "pen-win", "testing", "reactive"],
      "archetype_fit": ["Critic", "Analyst"],
      "path": "agents/skills/sharpener_reactive/",
      "dependencies": [],
      "used_by": [],
      "maintenance_status": "active",
      "last_modified": "2026-03-17",
      "test_coverage": "0%",
      "documentation_url": "agents/skills/sharpener_reactive/README.md"
    },
    {
      "id": "sharpener_proactive",
      "name": "Agent Sharpening 2026 (Proactive)",
      "version": "2.0.0",
      "author": "Nash Framework",
      "description": "Apply 2026 industry best practices to sharpen Nash agents using patterns from OpenAI Agents SDK, LangGraph, CrewAI. Reduce tokens by 60-80% while increasing quality.",
      "tags": ["agent-factory", "sharpening", "token-optimization", "best-practices", "2026-patterns", "proactive"],
      "archetype_fit": ["Strategist", "Analyst"],
      "path": "agents/skills/sharpener_proactive/",
      "dependencies": [],
      "used_by": [],
      "maintenance_status": "active",
      "last_modified": "2026-03-17",
      "test_coverage": "0%",
      "documentation_url": "agents/skills/sharpener_proactive/README.md"
    }
  ]
}
```

**Verify:**

```bash
node bin/nash list-skills
```

**Expected:** `2 skill(s) registered`

---

## Phase 3: Create Slash Commands

### Step 3.1: Create .claude/commands/ Directory

```bash
mkdir -p .claude/commands
```

### Step 3.2: Create /sharpen Command

**Use Write tool to create `.claude/commands/sharpen.md`:**

```markdown
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
```

---

### Step 3.3: Create /upgrade-agent Command

**Use Write tool to create `.claude/commands/upgrade-agent.md`:**

```markdown
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
```

---

### Step 3.4: Create /create-skill Command (Bonus)

**Use Write tool to create `.claude/commands/create-skill.md`:**

```markdown
---
description: Create new skill using Nash CLI
allowedTools: ["*"]
---

You are helping user create a new skill for Nash Framework.

**Workflow:**

1. Ask user:
   - Skill name (e.g., "My Workflow")
   - Skill ID (kebab-case, e.g., "my-workflow")

2. Create skill scaffold:
   ```bash
   node bin/nash create-skill --name "<name>" --id "<id>"
   ```

3. Tell user to edit:
   - `agents/skills/<id>/SKILL.md` - Workflow steps
   - `agents/skills/<id>/metadata.json` - Tags, archetype_fit, etc.

4. Register skill:
   ```bash
   node bin/nash register-skill <id>
   ```

5. Test:
   ```bash
   node bin/nash list-skills | grep <id>
   ```
```

---

### Step 3.5: Verify Slash Commands Created

```bash
ls .claude/commands/sharpen.md
ls .claude/commands/upgrade-agent.md
ls .claude/commands/create-skill.md
```

**Expected:** All 3 files exist

---

### Step 3.6: Add SKILLS Section to Core Agents

**Important:** Agents need `## ⚙️ SKILLS` section to support skill installation.

**For each core agent, add SKILLS section using Edit tool:**

Target agents:
- `agents/core/dung-manager.md`
- `agents/core/phuc-sa.md`
- `agents/core/moc-arch-chal.md`
- `agents/core/son-qa.md`

**Insert after `## 3. WORKFLOWS` section:**

```markdown
## 3.5. SKILLS

**Installed Skills:** (managed by nash CLI)

<!-- Skills will be added here via: node bin/nash install-skill <skill-id> --agent <name> -->
```

**Use Edit tool to insert this section into each agent file.**

---

### Step 3.7: Install Skills into Core Agents

**Use Bash tool to install skills based on agent roles:**

**Dung PM (Project Manager):**
```bash
# Install from skills.bak if available, otherwise skip
[ -f "agents/skills.bak/bug-triage/SKILL.md" ] && cp -r agents/skills.bak/bug-triage agents/skills/ && node bin/nash register-skill bug-triage
[ -f "agents/skills.bak/deployment-excellence/SKILL.md" ] && cp -r agents/skills.bak/deployment-excellence agents/skills/ && node bin/nash register-skill deployment-excellence
```

**Phuc SA (Solution Architect):**
```bash
# Install architecture skills
[ -f "agents/skills.bak/contract-draft-template/SKILL.md" ] && cp -r agents/skills.bak/contract-draft-template agents/skills/ && node bin/nash register-skill contract-draft-template
[ -f "agents/skills.bak/arch-challenge-response/SKILL.md" ] && cp -r agents/skills.bak/arch-challenge-response agents/skills/ && node bin/nash register-skill arch-challenge-response
```

**Note:** Only install if skills.bak/ exists. If not, skip this step.

---

### Step 3.8: Install gstack Slash Commands (Bonus)

**Check if gstack-main/ exists:**

```bash
ls gstack-main/browse/SKILL.md 2>/dev/null
```

**If exists, create slash commands using Write tool:**

**Create `.claude/commands/browse.md`:**
```markdown
---
description: Browse web with persistent browser automation (from gstack)
allowedTools: ["*"]
---

You are running the `/browse` workflow from gstack.

**Load the complete workflow from:**
`gstack-main/browse/SKILL.md`

**Follow the workflow EXACTLY as documented in gstack SKILL.md.**
```

**Create `.claude/commands/qa.md`:**
```markdown
---
description: Run QA checks with 4 modes (from gstack)
allowedTools: ["*"]
---

You are running the `/qa` workflow from gstack.

**Load the complete workflow from:**
`gstack-main/qa/SKILL.md`

**Follow the workflow EXACTLY as documented in gstack SKILL.md.**
```

**Create `.claude/commands/ship.md`:**
```markdown
---
description: Ship code quickly with automated checks (from gstack)
allowedTools: ["*"]
---

You are running the `/ship` workflow from gstack.

**Load the complete workflow from:**
`gstack-main/ship/SKILL.md`

**Follow the workflow EXACTLY as documented in gstack SKILL.md.**
```

**Create `.claude/commands/review.md`:**
```markdown
---
description: Code review with greptile triage (from gstack)
allowedTools: ["*"]
---

You are running the `/review` workflow from gstack.

**Load the complete workflow from:**
`gstack-main/review/SKILL.md`

**Follow the workflow EXACTLY as documented in gstack SKILL.md.**
```

**If gstack-main/ doesn't exist:** Skip this step and inform user.

---

## Phase 4: Test Everything Works

### Step 4.1: Test Nash CLI

```bash
node bin/nash list-skills
```

**Expected Output:**
```
📚 Nash Skill Registry

ID                   | Name                        | Ver   | Tags
sharpener_reactive   | Agent Skill Sharpener       | 1.0.0 | agent-factory, sharpening
sharpener_proactive  | Agent Sharpening 2026       | 2.0.0 | agent-factory, sharpening

2 skill(s) registered
```

---

### Step 4.2: Test Gate Scripts

```bash
bash gates/validate.sh --help 2>&1 | head -5
```

**Expected:** Usage instructions displayed (not error)

---

### Step 4.3: Verify Dashboard Files

```bash
ls observability/dashboard-simple.html
ls observability/data.js
```

**Expected:** Both files exist

---

## Phase 5: Report Installation Summary

**Use this template to report to user:**

```
✅ NASH FRAMEWORK INSTALLATION COMPLETE

📊 Installation Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Phase 1: Framework Structure - VERIFIED
   - Core files: CLAUDE.md, main.md, bin/nash ✓
   - Agents: 9 core agents ✓
   - Gates: 5 quality scripts ✓
   - System: Pipelines & templates ✓

✅ Phase 2: Skills Installation - COMPLETED
   - Copied: sharpener_reactive ✓
   - Copied: sharpener_proactive ✓
   - Registry: 2 skills registered ✓

✅ Phase 3: Slash Commands - CREATED
   - /sharpen ✓
   - /upgrade-agent ✓
   - /create-skill ✓
   - /browse ✓ (if gstack-main exists)
   - /qa ✓ (if gstack-main exists)
   - /ship ✓ (if gstack-main exists)
   - /review ✓ (if gstack-main exists)
   - Core agents: SKILLS section added ✓
   - Skills installed into agents ✓ (if skills.bak exists)

✅ Phase 4: Verification - PASSED
   - Nash CLI: 2 skills listed ✓
   - Gate scripts: Executable ✓
   - Dashboard: Files ready ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Next Steps:

1. **Reload VSCode** to activate slash commands:
   - Windows/Linux: Ctrl+Shift+P → "Developer: Reload Window"
   - Mac: Cmd+Shift+P → "Developer: Reload Window"

2. **Test slash commands:**
   Type "/" in chat → Should see /sharpen, /upgrade-agent, /create-skill

3. **Try agent sharpening:**
   /sharpen agents/core/dung-manager.md

4. **Read documentation:**
   - Framework overview: CLAUDE.md
   - Workflow guide: main.md
   - Agent factory: deprecated/agent_factory_OLD/README.md
   - Skill factory: deprecated/skill_factory_OLD/README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Quick Reference:

Nash CLI:
  node bin/nash list-skills         # List all skills
  node bin/nash list-souls          # List agent personalities
  node bin/nash create-skill --name X --id x

Slash Commands:
  /sharpen <agent-file>             # Fix PEN entry bugs
  /upgrade-agent <agent-file>       # Apply 2026 standards
  /create-skill                     # Scaffold new skill

Quality Gates:
  bash gates/validate.sh <module>   # Build + tests + hygiene
  bash gates/qa.sh <module>         # SAST + smoke tests
  bash gates/security.sh <module>   # Secrets + dep audit

Dashboard:
  Open: observability/dashboard-simple.html
  Edit data: observability/data.js (auto-refresh 3s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏭 Factories Now Active:

✅ Agent Factory (Sharpening)
   - Reactive: Fix bugs from PEN entries
   - Proactive: Upgrade to 2026 standards

✅ Skill Factory (Creation)
   - Use /create-skill to scaffold new skills
   - Registry management via nash CLI

✅ Quality Gates (Validation)
   - Auto-detect: TS, Go, .NET, Python
   - Polyglot validation scripts

✅ Dashboard (Observability)
   - Static HTML (no React, no npm)
   - JSONP auto-refresh (no CORS)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Installation completed in X seconds
🎉 Nash Framework is ready to use!
```

---

## 🔧 Troubleshooting (If Errors Occur)

### Error: "deprecated/ folder not found"

**Solution:** Tell user to copy entire SuperAgent folder including deprecated/

```
❌ ERROR: deprecated/agent_factory_OLD/ not found

Nash Framework requires the full directory structure.

Please copy the ENTIRE SuperAgent folder:
- cp -r SuperAgent /path/to/new/location/

Then run this setup again.
```

---

### Error: "node bin/nash command not found"

**Solution:** Check Node.js installed

```bash
node --version
```

**If not installed:** Tell user to install Node.js 18+

---

### Error: "bash gates/validate.sh permission denied"

**Solution:** Make scripts executable

```bash
chmod +x gates/*.sh
```

---

## 📋 SUCCESS CRITERIA CHECKLIST

After running this setup, verify:

- [ ] `node bin/nash list-skills` → Shows 2 skills
- [ ] `ls .claude/commands/` → Shows 3 .md files
- [ ] `cat agents/skills/_registry.json` → Valid JSON with 2 skills
- [ ] `bash gates/validate.sh --help` → Shows usage (no error)
- [ ] Files created programmatically (not copied by user)

**If ALL checked → Installation successful!** ✅

---

## 🎯 IMPORTANT NOTES FOR AGENT

1. **Use Write tool** to create slash command files - do NOT tell user to copy-paste
2. **Use Bash tool** to copy skills from deprecated/ - do NOT tell user to run commands manually
3. **Track progress** with TodoWrite tool
4. **Report status** after each phase (Phase 1 ✅, Phase 2 ✅, etc.)
5. **Final summary** using the template above

**Goal:** User should only need to:
1. Copy SuperAgent folder
2. Say "Đọc AUTO_SETUP.md và setup"
3. Wait 2-5 minutes
4. Reload VSCode
5. Done!

---

## 🚀 QUICK START PROMPT FOR USER

Copy SuperAgent folder to new machine, then paste this into Claude Code:

```
Đọc file AUTO_SETUP.md và thực hiện TẤT CẢ các bước setup.

Sử dụng Write tool để TẠO slash commands.
Sử dụng Bash tool để COPY skills.
KHÔNG yêu cầu tôi copy-paste commands thủ công.

Track progress với TodoWrite.
Báo cáo kết quả sau mỗi Phase.
```

---

**Framework Version:** Nash Anti_propost_0.1
**Setup Time:** 2-5 minutes (fully automated)
**Agent Action Required:** Read this file → Execute all phases → Report completion

---

*Auto-generated setup for Nash Framework | Zero manual intervention required*
