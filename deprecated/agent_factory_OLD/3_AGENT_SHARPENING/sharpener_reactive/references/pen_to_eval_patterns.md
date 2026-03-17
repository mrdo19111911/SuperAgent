# PEN → Eval Conversion Patterns

**Purpose:** Templates for converting PEN entries into regression test evals.

---

## Template 1: Missing Action/Check

**Pattern:** Agent forgot to do X, causing failure.

**PEN Example:**
```markdown
### PEN-001
- Incident: Không cung cấp đủ context cho Mộc → Mộc tìm 9 HIGH issues
- Principle: Khi gọi reviewer, PHẢI đính kèm đầy đủ file liên quan
```

**Eval Conversion:**

```json
{
  "id": "pen-001-reproduction",
  "type": "regression",
  "prompt": "You are {Agent}. You've finished {Task}. Files created: {File1}, {File2}, {File3}. Now call {Reviewer} to review.",
  "setup_files": {
    "File1": "content...",
    "File2": "content...",
    "File3": "content..."
  },
  "assertions": [
    {
      "name": "reviewer_call_includes_file1",
      "type": "must_pass",
      "check": "Tool call to reviewer includes File1",
      "rationale": "PEN-XXX: Missing context files cause false issues"
    },
    {
      "name": "reviewer_call_includes_file2",
      "type": "must_pass",
      "check": "Tool call includes File2"
    },
    {
      "name": "no_premature_call",
      "type": "should_pass",
      "check": "Reviewer NOT called before all files exist"
    }
  ]
}
```

---

## Template 2: Wrong Configuration/Setting

**Pattern:** Agent used wrong config value, causing bug.

**PEN Example:**
```markdown
### PEN-002
- Incident: Bỏ sót NOBYPASSRLS trong RLS policy
- Principle: Mọi bảng multi-tenant PHẢI có role NON-superuser với NOBYPASSRLS
```

**Eval Conversion:**

```json
{
  "id": "pen-002-reproduction",
  "type": "regression",
  "prompt": "You are {Agent}. Design PostgreSQL schema for multi-tenant {Module}. Create RLS policies for tenant isolation.",
  "setup_files": {},
  "assertions": [
    {
      "name": "schema_has_nobypassrls_role",
      "type": "must_pass",
      "check": "schema.prisma or SQL file contains 'NOBYPASSRLS' keyword",
      "rationale": "PEN-002: Missing NOBYPASSRLS = superuser bypasses RLS"
    },
    {
      "name": "role_is_non_superuser",
      "type": "must_pass",
      "check": "Role definition includes 'NOSUPERUSER' or similar"
    },
    {
      "name": "all_tables_have_rls",
      "type": "should_pass",
      "check": "Every table with tenant_id has RLS policy defined"
    }
  ]
}
```

---

## Template 3: Forgot Edge Case

**Pattern:** Agent handled happy path but forgot nil/empty/error path.

**PEN Example:**
```markdown
### PEN-003
- Incident: Không handle empty array from API → app crashed
- Principle: Mọi external API call PHẢI check nil/empty/error response
```

**Eval Conversion:**

```json
{
  "id": "pen-003-reproduction",
  "type": "regression",
  "prompt": "You are {Agent}. Implement {Feature} that calls external API {ApiName}. Handle response and process data.",
  "setup_files": {
    "API_SPEC.md": "GET /items returns: { items: Item[] } or { items: [] } or { error: string }"
  },
  "assertions": [
    {
      "name": "handles_empty_array",
      "type": "must_pass",
      "check": "Code checks if response.items.length === 0 or isEmpty()",
      "rationale": "PEN-003: Empty array not handled → crash"
    },
    {
      "name": "handles_error_response",
      "type": "must_pass",
      "check": "Code checks for error field in response"
    },
    {
      "name": "handles_null_response",
      "type": "should_pass",
      "check": "Code handles null/undefined response gracefully"
    }
  ]
}
```

---

## Template 4: Wrong Order of Operations

**Pattern:** Agent did step B before step A, causing failure.

**PEN Example:**
```markdown
### PEN-004
- Incident: Called git commit before git add → commit thất bại
- Principle: Git workflow PHẢI theo thứ tự: add → commit → push
```

**Eval Conversion:**

```json
{
  "id": "pen-004-reproduction",
  "type": "regression",
  "prompt": "You are {Agent}. Files {File1}, {File2} have been modified. Create a git commit with message '{Message}'.",
  "setup_files": {
    "File1": "modified content",
    "File2": "modified content"
  },
  "assertions": [
    {
      "name": "git_add_before_commit",
      "type": "must_pass",
      "check": "Tool call sequence: git add appears BEFORE git commit",
      "rationale": "PEN-004: Commit before add fails"
    },
    {
      "name": "all_files_added",
      "type": "must_pass",
      "check": "git add includes both File1 and File2"
    },
    {
      "name": "commit_includes_message",
      "type": "should_pass",
      "check": "git commit -m includes specified message"
    }
  ]
}
```

---

## Template 5: Missing Validation/Check

**Pattern:** Agent assumed input is valid, didn't validate.

**PEN Example:**
```markdown
### PEN-005
- Incident: Không validate user input → SQL injection
- Principle: Mọi user input PHẢI sanitize trước khi dùng trong query
```

**Eval Conversion:**

```json
{
  "id": "pen-005-reproduction",
  "type": "regression",
  "prompt": "You are {Agent}. User provides search query: '{UserInput}'. Fetch matching records from database.",
  "setup_files": {
    "UserInput": "test' OR '1'='1"
  },
  "assertions": [
    {
      "name": "input_is_sanitized",
      "type": "must_pass",
      "check": "Code uses parameterized query or sanitize function",
      "rationale": "PEN-005: Unsanitized input = SQL injection"
    },
    {
      "name": "no_string_interpolation_in_sql",
      "type": "must_pass",
      "check": "SQL query does NOT contain string interpolation like `${input}`"
    },
    {
      "name": "uses_safe_query_method",
      "type": "should_pass",
      "check": "Uses prisma.findMany(), sanitize_sql_array(), or similar safe method"
    }
  ]
}
```

---

## Synthetic Variation Strategies

**Goal:** Prevent overfitting by testing same pattern in different context.

### Strategy 1: Domain Swap

**Original PEN:** Authentication module
**Variant:** Billing module

**Change:**
- File names: USER_AUTH.md → PAYMENT_GATEWAY.md
- Entities: User/Session → Invoice/Payment
- Keep pattern same: "attach all files to reviewer"

### Strategy 2: Technology Swap

**Original PEN:** PostgreSQL schema
**Variant:** MongoDB schema

**Change:**
- Tool: schema.prisma → mongoose-schema.js
- Concept: RLS policy → document-level permissions
- Keep pattern same: "multi-tenant isolation"

### Strategy 3: Scale Change

**Original PEN:** 3 files to attach
**Variant:** 5 files to attach

**Change:**
- Add more files: ARCHITECTURE.md + schema.prisma + CONTRACT_DRAFT.md + SEQUENCE_DIAGRAM.md + ERROR_CODES.md
- Keep pattern same: "completeness check before reviewer call"

---

## Cross-Validation Template

**For each PEN eval, create 1-2 cross-validation evals:**

```json
{
  "id": "pen-001-cross-val-billing",
  "type": "synthetic",
  "source": "PEN-001",
  "prompt": "[Same pattern, different domain]",
  "setup_files": "[Different file names, same structure]",
  "assertions": "[Same assertion logic, adjusted for new domain]"
}
```

**Test on cross-validation AFTER agent is enhanced:**
- If passes: Enhancement generalized well ✅
- If fails: Enhancement is too specific ❌ (overfitting)

---

## WIN Validation Template

**For each WIN entry, create validation eval to ensure no regression:**

```json
{
  "id": "win-001-validation",
  "type": "validation",
  "source": "WIN-001",
  "prompt": "Scenario that should trigger WIN pattern",
  "assertions": [
    {
      "name": "win_pattern_preserved",
      "type": "must_pass",
      "check": "Agent still does the successful action from WIN entry"
    }
  ]
}
```

**Example (WIN-001: ARCHITECTURE_ABSTRACT.md):**

```json
{
  "id": "win-001-validation",
  "type": "validation",
  "prompt": "You are {Agent}. You've finished ARCHITECTURE.md (450 lines) for {Module}. Prepare for gate review by Xuân.",
  "assertions": [
    {
      "name": "abstract_created",
      "type": "must_pass",
      "check": "ARCHITECTURE_ABSTRACT.md file exists",
      "rationale": "WIN-001: Abstract saves reviewer 60% tokens"
    },
    {
      "name": "abstract_is_concise",
      "type": "should_pass",
      "check": "ARCHITECTURE_ABSTRACT.md is 100-200 lines (not full copy)"
    }
  ]
}
```

---

## Assertion Types

| Type | Meaning | When to Use |
|------|---------|-------------|
| **must_pass** | Critical - eval fails if assertion fails | PEN core requirement (what caused failure) |
| **should_pass** | Important but not blocking | Best practice, edge case handling |
| **nice_to_have** | Bonus - doesn't affect pass/fail | Optimization, style preferences |

**Rule:** Each PEN eval should have 2-4 `must_pass` assertions (core issue) + 1-2 `should_pass` (related best practices).

---

## Evidence Collection

**For each assertion, specify HOW to check:**

```json
{
  "assertion": "reviewer_call_includes_architecture_file",
  "check_method": "parse_tool_calls",
  "check_logic": "Find Task tool calls where agent='moc' or agent='xuân', check if ARCHITECTURE.md in arguments or file_attachments",
  "evidence_if_pass": "Line 234: Task call to Mộc with ARCHITECTURE.md attached",
  "evidence_if_fail": "Line 234: Task call to Mộc but no files attached"
}
```

**Good evidence:**
- ✅ Specific line number in transcript
- ✅ Actual tool call arguments
- ✅ File content snippet

**Bad evidence:**
- ❌ "Agent did it correctly"
- ❌ "Looks good"
- ❌ No line number reference

---

**Use these templates to systematically convert every PEN entry into high-quality regression tests!**
