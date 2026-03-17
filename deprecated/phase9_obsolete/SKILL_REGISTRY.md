# Nash Agent Skill Registry
## Centralized Catalog of Reusable Skills

**Purpose:** Manage, version, and share skills across all Nash agents.

---

## 📚 Skill Registry Structure

```
.agents/skills/
├── _registry.json              # Master catalog (metadata for all skills)
├── code-review-excellence/
│   ├── SKILL.md                # Main skill definition
│   ├── metadata.json           # Version, tags, author, dependencies
│   ├── tests/
│   │   └── evals.json          # Test cases for this skill
│   └── README.md               # Usage documentation
├── bug-triage/
│   └── ...
└── architecture-design-stmai/
    └── ...
```

---

## 📋 _registry.json Format

```json
{
  "registry_version": "2.0",
  "last_updated": "2026-03-16T10:00:00Z",
  "skills": [
    {
      "id": "code-review-excellence",
      "name": "Code Review Excellence",
      "version": "1.2.0",
      "author": "Nash Framework",
      "description": "Two-pass code review (CRITICAL → INFORMATIONAL) with suppression lists",
      "tags": ["review", "qa", "backend", "frontend"],
      "archetype_fit": ["Critic", "Builder"],
      "path": ".agents/skills/code-review-excellence/",
      "dependencies": [],
      "used_by": ["phuc-sa", "moc", "xuan"],
      "maintenance_status": "active",
      "last_modified": "2026-03-10",
      "test_coverage": "95%",
      "documentation_url": ".agents/skills/code-review-excellence/README.md"
    },
    {
      "id": "bug-triage",
      "name": "Bug Severity Validation",
      "version": "1.0.1",
      "author": "Nash Framework",
      "description": "Classify bug severity (P0-P4) with evidence requirements",
      "tags": ["qa", "triage", "severity"],
      "archetype_fit": ["Critic", "Analyst"],
      "path": ".agents/skills/bug-triage/",
      "dependencies": [],
      "used_by": ["phuc-sa", "son-qa"],
      "maintenance_status": "active",
      "last_modified": "2026-02-28",
      "test_coverage": "88%",
      "documentation_url": ".agents/skills/bug-triage/README.md"
    },
    {
      "id": "architecture-design-stmai",
      "name": "STMAI Architecture Design",
      "version": "2.0.0",
      "author": "Phúc SA",
      "description": "Multi-tenant architecture with RLS, contracts, and event-driven design",
      "tags": ["architecture", "stmai", "rls", "multi-tenant"],
      "archetype_fit": ["Builder", "Strategist"],
      "path": ".agents/skills/architecture-design-stmai/",
      "dependencies": ["pg-aiguide"],
      "used_by": ["phuc-sa"],
      "maintenance_status": "active",
      "last_modified": "2026-03-16",
      "test_coverage": "100%",
      "documentation_url": ".agents/skills/architecture-design-stmai/README.md"
    }
  ]
}
```

---

## 🏷️ metadata.json Format (Per Skill)

**Path:** `.agents/skills/{skill-id}/metadata.json`

```json
{
  "skill_id": "code-review-excellence",
  "version": "1.2.0",
  "semantic_version": {
    "major": 1,
    "minor": 2,
    "patch": 0
  },
  "author": {
    "name": "Nash Framework",
    "created_by_agent": "phuc-sa",
    "created_date": "2026-01-15"
  },
  "description": {
    "short": "Two-pass code review with suppression lists",
    "long": "Systematic code review skill using two-pass structure (CRITICAL → INFORMATIONAL). Includes suppression list to prevent known false positives. Outputs terse format: file:line + problem + fix."
  },
  "tags": ["review", "qa", "backend", "frontend"],
  "archetype_fit": ["Critic", "Builder"],
  "triggers": [
    "When user asks for code review",
    "When PR needs pre-merge validation",
    "When synthesis role after Mộc challenge"
  ],
  "dependencies": {
    "tools": [],
    "mcp_servers": [],
    "other_skills": []
  },
  "compatible_agents": ["phuc-sa", "moc", "xuan", "son-qa"],
  "test_suite": {
    "path": "tests/evals.json",
    "test_count": 8,
    "coverage": "95%",
    "last_run": "2026-03-10",
    "pass_rate": "100%"
  },
  "performance": {
    "avg_tokens": 2500,
    "avg_duration_seconds": 15,
    "complexity": "medium"
  },
  "maintenance": {
    "status": "active",
    "last_updated": "2026-03-10",
    "changelog": "tests/CHANGELOG.md",
    "known_issues": []
  }
}
```

---

## 🔧 Skill Installation Commands

### Install Skill to Agent

```bash
# Syntax
nash install-skill <skill-id> --agent <agent-name>

# Example
nash install-skill code-review-excellence --agent phuc-sa

# What it does:
# 1. Checks skill exists in registry
# 2. Validates compatibility (archetype_fit)
# 3. Adds reference to agent file:
#    - **SKILL:** `../../.agents/skills/code-review-excellence/SKILL.md`
# 4. Updates used_by in _registry.json
```

### Uninstall Skill from Agent

```bash
nash uninstall-skill code-review-excellence --agent phuc-sa

# Removes reference from agent file
# Updates used_by in _registry.json
```

### List Available Skills

```bash
nash list-skills

# Output:
# ID                         | Name                     | Ver   | Tags                | Used By
# ---------------------------|--------------------------|-------|---------------------|-------------
# code-review-excellence     | Code Review Excellence   | 1.2.0 | review, qa, backend | phuc-sa, moc, xuan
# bug-triage                 | Bug Severity Validation  | 1.0.1 | qa, triage          | phuc-sa, son-qa
# architecture-design-stmai  | STMAI Architecture       | 2.0.0 | architecture, rls   | phuc-sa
```

### Search Skills by Tag

```bash
nash search-skills --tag review

# Output:
# Found 2 skills with tag 'review':
# - code-review-excellence (1.2.0)
# - code-review-fe (1.0.0)
```

### Update Skill Version

```bash
nash update-skill code-review-excellence --version 1.3.0

# Updates metadata.json
# Runs regression tests
# Updates _registry.json if tests pass
```

---

## 📦 Creating New Skill

### Step 1: Generate Scaffold

```bash
nash create-skill --name "PostgreSQL Schema Validation" --id pg-schema-validation

# Creates:
# .agents/skills/pg-schema-validation/
# ├── SKILL.md (template)
# ├── metadata.json (with defaults)
# ├── tests/
# │   └── evals.json (empty)
# └── README.md (usage guide template)
```

### Step 2: Edit SKILL.md

Use gstack 12 principles:
- Philosophy section
- Prime Directives
- Tables for completeness
- Escape Hatches
- Two-Pass structure
- Suppressions
- etc.

### Step 3: Add Tests

```bash
cd .agents/skills/pg-schema-validation/tests/
# Edit evals.json with test cases
```

### Step 4: Register Skill

```bash
nash register-skill pg-schema-validation

# Validates:
# - SKILL.md exists and has required sections
# - metadata.json is valid JSON
# - tests/evals.json exists
# - All tests pass

# If valid:
# - Adds to _registry.json
# - Status: "active"
```

---

## 🔄 Skill Lifecycle

### States

1. **draft** - Being developed, not in registry
2. **active** - Registered, tested, ready to use
3. **deprecated** - Still works but superseded by newer skill
4. **archived** - No longer maintained, kept for reference

### Version Bumping Rules

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes (workflow structure change)
- **MINOR** (1.1.0 → 1.2.0): New features (added steps, new assertions)
- **PATCH** (1.2.0 → 1.2.1): Bug fixes (typo corrections, clarifications)

### Deprecation Process

```bash
nash deprecate-skill code-review-v1 --superseded-by code-review-excellence

# Sets maintenance_status: "deprecated"
# Adds warning to metadata.json
# Suggests migration to new skill
```

---

## 🎯 Skill Compatibility Matrix

**Archetype Fit:**

| Skill | Builder | Critic | Analyst | Strategist | Operator |
|-------|---------|--------|---------|------------|----------|
| code-review-excellence | ✅ | ✅ | ⚠️ | ⚠️ | ❌ |
| bug-triage | ❌ | ✅ | ✅ | ❌ | ❌ |
| architecture-design | ✅ | ❌ | ⚠️ | ✅ | ❌ |
| deployment-orchestration | ❌ | ❌ | ❌ | ⚠️ | ✅ |

**Legend:**
- ✅ Perfect fit (skill aligns with archetype strengths)
- ⚠️ Acceptable (can use but not ideal)
- ❌ Poor fit (archetype lacks required traits)

---

## 📊 Skill Analytics

### Usage Metrics

```bash
nash skill-stats code-review-excellence

# Output:
# Skill: code-review-excellence (v1.2.0)
# Installed on: 3 agents (phuc-sa, moc, xuan)
# Total invocations (last 30 days): 47
# Avg tokens per invocation: 2,500
# Avg duration: 15 seconds
# Success rate: 98%
# Last failure: 2026-03-08 (timeout on large PR)
```

### Quality Metrics

```json
{
  "skill_id": "code-review-excellence",
  "quality_metrics": {
    "test_coverage": "95%",
    "documentation_score": "A",
    "principle_compliance": {
      "philosophy": true,
      "prime_directives": true,
      "tables": true,
      "escape_hatches": true,
      "two_pass": true,
      "suppressions": true,
      "terse_output": true,
      "concrete_examples": true,
      "multi_path": false,
      "priority_hierarchy": true,
      "meta_instructions": true
    },
    "gstack_score": "10/12 principles applied"
  }
}
```

---

## 🔍 Skill Discovery

### By Problem Domain

```bash
nash recommend-skill --problem "need to review code before merge"

# Recommended skills:
# 1. code-review-excellence (95% match)
#    - Tags: review, qa, pre-merge
#    - Used successfully by: phuc-sa, moc, xuan
#    - Pass rate: 100% (last 30 days)
#
# 2. security-audit (70% match)
#    - Tags: security, review, vulnerability
#    - More specialized than needed
```

### By Agent Archetype

```bash
nash recommend-skill --archetype Critic

# Skills for Critic archetype:
# - code-review-excellence ✅ (perfect fit)
# - bug-triage ✅ (perfect fit)
# - security-audit ✅ (perfect fit)
# - edge-case-hunter ⚠️ (acceptable)
```

---

## 🚀 Skill Sharing & Distribution

### Export Skill Package

```bash
nash export-skill code-review-excellence --output code-review-v1.2.0.skill

# Creates .skill package:
# - SKILL.md
# - metadata.json
# - tests/ (full test suite)
# - README.md
# - CHANGELOG.md
```

### Import Skill Package

```bash
nash import-skill code-review-v1.2.0.skill

# Validates package
# Checks for conflicts (ID collision)
# Runs tests
# If pass: Adds to registry
```

### Skill Marketplace (Future)

```bash
nash publish-skill code-review-excellence --marketplace nash-skills

# Uploads to central registry
# Makes available to all Nash framework users
# Versioning, reviews, ratings
```

---

## 📖 Best Practices

### When to Create New Skill vs Embed in Agent

**Create separate skill when:**
- ✅ Multiple agents need same capability
- ✅ Workflow is >200 lines
- ✅ Needs independent testing/versioning
- ✅ Domain-agnostic (works across projects)

**Embed in agent when:**
- ✅ Highly specific to one agent's role
- ✅ Workflow is <100 lines
- ✅ Tightly coupled to agent's SOUL/values
- ✅ Project-specific rules (not reusable)

### Skill Naming Conventions

- **ID:** lowercase-kebab-case (e.g., `code-review-excellence`)
- **Name:** Title Case (e.g., "Code Review Excellence")
- **Version:** Semantic versioning (e.g., `1.2.0`)
- **Tags:** lowercase, single-word (e.g., `review`, `qa`, `backend`)

### Documentation Requirements

Every skill MUST have:
- ✅ Clear trigger conditions ("When to use")
- ✅ Workflow with numbered steps
- ✅ At least 2 concrete examples
- ✅ Assertions for testing
- ✅ Known limitations documented

---

**END OF SKILL REGISTRY**
