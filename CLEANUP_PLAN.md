# Cleanup Plan - Files to Delete Before Commit

## 🗑️ Files to DELETE (Temporary/Junk)

### 1. Temporary files
```bash
rm nul                           # Empty file
rm roadmap_extracted.txt         # Extracted text, no longer needed
```

### 2. Duplicate/Backup directories
```bash
rm -rf .claude.backup/           # Backup folder
rm -rf agents/backup/            # Agent backups (already in git history)
rm -rf test_vector_env/          # Test environment
```

### 3. Vector DB experimental files (không dùng production)
```bash
rm -rf agents/knowledge/.compressed/
rm -rf agents/knowledge/.git_analysis.json
rm -rf agents/knowledge/KI_INDEX.json
rm -rf agents/knowledge/domain/
rm -rf agents/knowledge/operational/
rm test_vector.js
rm system/vector_simple.js
rm setup-vector-db.bat
rm setup-vector-db.sh
rm scripts/analyze_git_dependencies.cjs
rm scripts/auto_generate_ki.cjs
rm scripts/compress_ki.cjs
rm scripts/ki_cache.cjs
rm scripts/load_knowledge_items.cjs
rm scripts/load_knowledge_items.sh
rm scripts/load_nash_ki.cjs
rm scripts/query_nash_ki.cjs
```

### 4. Redundant documentation (keep only essential)
```bash
rm DEMO_NASH_KI_USAGE.md          # KI demo (not using KI in production)
rm GITNEXUS_SETUP.md              # Not using GitNexus
rm NASH_KI_UPGRADE_ROADMAP.md     # KI roadmap (not needed)
rm NASH_KI_V2.1_OPTIMIZATION.md   # Old optimization doc
rm NASH_KI_V2_SUMMARY.md          # Old summary
rm V6.8_V6.9_QUICK_SUMMARY.md     # Superseded by CLAUDE.md
rm VECTOR_DB_SETUP.md             # Not using vector DB
rm README_AUTO_INSTALL.md         # Duplicate of AUTO_SETUP.md
rm README_INSTALL.md              # Duplicate of AUTO_SETUP.md
```

### 5. Large Word documents (move to separate docs repo or delete)
```bash
# Option 1: Keep if needed for Smartlog project
mv "Smartlog_E2E_Ecosystem_Strategy_Architecture_Blueprint_v2_6_Panasonic_Customization_Hardened_Mar2026_Final (1).docx" ../smartlog-docs/
mv Smartlog_UX_Implementation_Roadmap.docx ../smartlog-docs/

# Option 2: Delete if already have content in MD files
rm "Smartlog_E2E_Ecosystem_Strategy_Architecture_Blueprint_v2_6_Panasonic_Customization_Hardened_Mar2026_Final (1).docx"
rm Smartlog_UX_Implementation_Roadmap.docx
```

### 6. Duplicate package files
```bash
rm package.minimal.json           # Keep only package.json
```

### 7. System prompt experiments
```bash
rm -rf system_prompt/             # Experiments, not production
```

---

## ✅ Files to KEEP (Essential for P0 Token Optimization)

### Core P0 Implementation Files
```
✅ NASH_SKILLS_TOKEN_OPTIMIZATION_AUDIT.md      # Main audit report
✅ NASH_SKILLS_TOKEN_DASHBOARD.md               # Dashboard
✅ NASH_SKILLS_TOKEN_QUICK_FIXES.md             # Quick fixes guide
✅ P0_TOKEN_OPTIMIZATION_IMPLEMENTATION_REPORT.md # Implementation report
```

### Roadmap Files
```
✅ NASH_ENHANCEMENT_ROADMAP.md                  # Keep one roadmap
OR
✅ NASH_ENHANCEMENT_ROADMAP_V2.md               # Or this one (choose better version)
```

### UX/Smartlog Files (if actively used)
```
✅ Smartlog_UX_Guiding_Principles_v2.3.md       # Referenced by sml-ui-guide skill
```

### New P0 Implementation Files
```
✅ system/fast_route_matcher.cjs                # Fast route matcher
✅ system/tier_selector.js                      # Tier selector
✅ tests/test_fast_route_skills.cjs             # Test suite
✅ agents/skills/sharpener_proactive/metadata.json  # Updated metadata
✅ agents/skills/sharpener_reactive/metadata.json   # Updated metadata
✅ agents/skills/sml-ui-guide/metadata.json     # Updated metadata
```

### Skills (decide on these)
```
❓ agents/skills/ceo-taste-validation/          # New skill - keep or delete?
❓ agents/skills/eng-rigor-validation/          # New skill - keep or delete?
```

### Slash Command
```
✅ .claude/commands/create-skill.md             # Keep if useful
```

---

## 📋 Cleanup Commands (Safe Order)

Run these commands in order after reviewing:

```bash
# Step 1: Remove obvious junk
rm nul
rm roadmap_extracted.txt

# Step 2: Remove backup directories
rm -rf .claude.backup/
rm -rf agents/backup/
rm -rf test_vector_env/

# Step 3: Remove Vector DB experiment files (if not using)
rm -rf agents/knowledge/
rm test_vector.js
rm system/vector_simple.js
rm setup-vector-db.bat
rm setup-vector-db.sh

# Step 4: Remove redundant scripts
rm scripts/analyze_git_dependencies.cjs
rm scripts/auto_generate_ki.cjs
rm scripts/compress_ki.cjs
rm scripts/ki_cache.cjs
rm scripts/load_knowledge_items.cjs
rm scripts/load_knowledge_items.sh
rm scripts/load_nash_ki.cjs
rm scripts/query_nash_ki.cjs
rm scripts/git-commit-auto.sh

# Step 5: Remove redundant docs
rm DEMO_NASH_KI_USAGE.md
rm GITNEXUS_SETUP.md
rm NASH_KI_UPGRADE_ROADMAP.md
rm NASH_KI_V2.1_OPTIMIZATION.md
rm NASH_KI_V2_SUMMARY.md
rm V6.8_V6.9_QUICK_SUMMARY.md
rm VECTOR_DB_SETUP.md
rm README_AUTO_INSTALL.md
rm README_INSTALL.md

# Step 6: Remove duplicate package file
rm package.minimal.json

# Step 7: Remove system_prompt experiments
rm -rf system_prompt/

# Step 8: OPTIONAL - Remove large Word docs if already extracted
# rm "Smartlog_E2E_Ecosystem_Strategy_Architecture_Blueprint_v2_6_Panasonic_Customization_Hardened_Mar2026_Final (1).docx"
# rm Smartlog_UX_Implementation_Roadmap.docx

# Step 9: Consolidate roadmap files (choose one, delete the other)
# rm NASH_ENHANCEMENT_ROADMAP.md  # OR
# rm NASH_ENHANCEMENT_ROADMAP_V2.md
```

---

## 🤔 Decision Needed on These Files

### 1. Roadmap Files (choose one)
- `NASH_ENHANCEMENT_ROADMAP.md` (1,234 lines)
- `NASH_ENHANCEMENT_ROADMAP_V2.md` (2,456 lines) ← **Probably this one (newer)**

**Recommendation:** Keep V2, delete V1

### 2. Skills
- `agents/skills/ceo-taste-validation/` - Keep if using, delete if experimental
- `agents/skills/eng-rigor-validation/` - Keep if using, delete if experimental

**Recommendation:** Check if these are referenced in `agents/skills/_registry.json`

### 3. Word Documents
- Keep if they contain unique info not in MD files
- Delete if already extracted to Smartlog_UX_Guiding_Principles_v2.3.md

**Recommendation:** Delete if over 1MB and content is in MD files

---

## 📊 Estimated Space Savings

```
Directories to delete:  ~50 MB
Redundant docs:         ~5 MB
Vector DB files:        ~10 MB
Word docs (optional):   ~1.3 MB
Total savings:          ~66 MB
```

---

## ⚠️ Safety Checks Before Deleting

```bash
# 1. Check if any important files in backup
ls -lh agents/backup/ | head -20

# 2. Check Vector DB usage
grep -r "vector_simple\|KI_INDEX" . --include="*.md" --include="*.js" 2>/dev/null | head -10

# 3. Verify Word docs content extracted
grep -l "Smartlog UX" *.md

# 4. Check skill references
cat agents/skills/_registry.json | grep -E "ceo-taste|eng-rigor"
```

---

## 🚀 After Cleanup

Run git status to verify:
```bash
git status --short

# Should see:
# - No "D deprecated/" (already deleted)
# - No "D agents/skills.bak/" (already deleted)
# - Clean working tree with only P0 implementation files
```

Then ready to commit!
