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
