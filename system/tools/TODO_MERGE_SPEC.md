# TodoWrite Merge Capability Specification v1.0

## Overview

Enhanced TodoWrite tool with merge capability to update only changed tasks instead of rewriting entire list. Includes enforcement of "exactly 1 in_progress" rule.

---

## Tool Definition

### Name: `todo_write`

### Parameters:

```typescript
interface TodoWriteParams {
  merge?: boolean;           // Default: false for first call, true for updates
  todos: Todo[];             // Tasks to create/update
}

interface Todo {
  id?: string;               // UUID (required for merge=true, auto-generated otherwise)
  content: string;           // Task description (≤100 chars, verb-led)
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  activeForm: string;        // Present continuous form (e.g., "Creating API endpoint")
}
```

### Returns:

```typescript
interface TodoWriteResponse {
  success: boolean;
  todos: Todo[];             // Updated full list with IDs
  error?: string;            // If validation fails
}
```

---

## Validation Rules

### Rule 1: Exactly 1 in_progress (ENFORCED)

**Error if:**
- 0 tasks with `status: "in_progress"`
- 2+ tasks with `status: "in_progress"`

**Error message:**
```
Exactly 1 task must be in_progress. Found {count}.
Current in_progress tasks: {list of task IDs}
```

### Rule 2: Minimum 2 tasks

**Error if:**
- `todos.length < 2` when `merge=false`

**Error message:**
```
Minimum 2 tasks required. Use structured task management for multi-step work.
```

### Rule 3: Content length

**Error if:**
- `content.length > 100` characters

**Error message:**
```
Task content too long ({length} chars). Max 100. Use concise verb-led description.
```

---

## Behavior

### First Call (merge=false):

```typescript
// Creates new todo list, replaces any existing
todo_write({
  merge: false,
  todos: [
    {
      content: "Investigate requirements",
      status: "in_progress",
      activeForm: "Investigating requirements"
    },
    {
      content: "Design API contracts",
      status: "pending",
      activeForm: "Designing API contracts"
    }
  ]
})

// Response:
{
  success: true,
  todos: [
    { id: "uuid-1", content: "Investigate...", status: "in_progress", ... },
    { id: "uuid-2", content: "Design...", status: "pending", ... }
  ]
}
```

### Subsequent Calls (merge=true):

```typescript
// Updates only specified tasks
todo_write({
  merge: true,
  todos: [
    { id: "uuid-1", status: "completed" },           // Mark done
    { id: "uuid-2", status: "in_progress" }          // Start next
  ]
})

// Response: Full list with updates applied
{
  success: true,
  todos: [
    { id: "uuid-1", content: "Investigate...", status: "completed", ... },
    { id: "uuid-2", content: "Design...", status: "in_progress", ... }
  ]
}
```

### Adding New Task (merge=true):

```typescript
todo_write({
  merge: true,
  todos: [
    { id: "uuid-2", status: "completed" },          // Complete current
    {
      content: "New unexpected task",                // Add new
      status: "in_progress",
      activeForm: "Handling new task"
    }
  ]
})

// New task gets auto-generated UUID
```

---

## Token Savings Example

### Without merge (20 tasks, update 1):

```typescript
todo_write({
  todos: [
    { content: "Task 1", status: "completed" },     // Changed
    { content: "Task 2", status: "in_progress" },   // Changed
    { content: "Task 3", status: "pending" },       // UNCHANGED
    // ... 17 more unchanged tasks
  ]
})
// Tokens: ~2000 (20 tasks × ~100 tokens/task)
```

### With merge:

```typescript
todo_write({
  merge: true,
  todos: [
    { id: "task-1", status: "completed" },
    { id: "task-2", status: "in_progress" }
  ]
})
// Tokens: ~200 (2 tasks × ~100 tokens/task)
// SAVINGS: -90%
```

---

## File Storage

### Location:
```
artifacts/{task}/TODO.md
```

### Format:
```markdown
# Task List

- [x] Task 1 description (ID: uuid-1)
- [/] Task 2 description (ID: uuid-2)
- [ ] Task 3 description (ID: uuid-3)
- [-] Task 4 cancelled (ID: uuid-4)

Legend:
- [ ] = pending
- [/] = in_progress
- [x] = completed
- [-] = cancelled
```

---

## Error Handling

### Example 1: Multiple in_progress

```typescript
todo_write({
  merge: true,
  todos: [
    { id: "uuid-1", status: "in_progress" },
    { id: "uuid-2", status: "in_progress" }  // ERROR!
  ]
})

// Response:
{
  success: false,
  error: "Exactly 1 task must be in_progress. Found 2. Current in_progress: uuid-1, uuid-2"
}
```

### Example 2: Zero in_progress

```typescript
todo_write({
  merge: false,
  todos: [
    { content: "Task 1", status: "pending", activeForm: "Task 1" },
    { content: "Task 2", status: "pending", activeForm: "Task 2" }
  ]
})

// Response:
{
  success: false,
  error: "Exactly 1 task must be in_progress. Found 0."
}
```

---

## Implementation Notes

### State Management:

```typescript
// Global state (per task)
const todoState: Map<string, Todo[]> = new Map();

// Get current task's todos
const currentTaskId = process.env.NASH_TASK_ID || 'current';
let todos = todoState.get(currentTaskId) || [];
```

### Merge Logic:

```typescript
if (params.merge) {
  for (const update of params.todos) {
    if (update.id) {
      // Update existing
      const index = todos.findIndex(t => t.id === update.id);
      if (index >= 0) {
        todos[index] = { ...todos[index], ...update };
      } else {
        throw new Error(`Task ID ${update.id} not found`);
      }
    } else {
      // Add new (generate UUID)
      todos.push({ ...update, id: generateUUID() });
    }
  }
} else {
  // Replace all
  todos = params.todos.map(t => ({
    ...t,
    id: t.id || generateUUID()
  }));
}
```

### Validation:

```typescript
// Count in_progress
const inProgressCount = todos.filter(t => t.status === 'in_progress').length;

if (inProgressCount !== 1) {
  const inProgressIds = todos
    .filter(t => t.status === 'in_progress')
    .map(t => t.id)
    .join(', ');

  throw new Error(
    `Exactly 1 task must be in_progress. Found ${inProgressCount}. ` +
    `Current in_progress: ${inProgressIds}`
  );
}
```

---

## Integration with NASH_SUBAGENT_PROMPTS.md

Add to prompt:

```markdown
## Task Management

### First todo_write:
todo_write({
  merge: false,
  todos: [
    { content: "Investigate...", status: "in_progress", activeForm: "Investigating..." },
    { content: "Design...", status: "pending", activeForm: "Designing..." }
  ]
})

### Updates (PREFERRED):
todo_write({
  merge: true,
  todos: [
    { id: "task-1-uuid", status: "completed" },
    { id: "task-2-uuid", status: "in_progress" }
  ]
})

Rules:
- Exactly 1 in_progress (enforced)
- Use merge=true after first call (saves 90% tokens)
- Min 2 tasks in list
```

---

## Testing Checklist

- [ ] First call creates new list with UUIDs
- [ ] Merge updates only specified tasks
- [ ] Adding new task with merge works
- [ ] Error on 0 in_progress tasks
- [ ] Error on 2+ in_progress tasks
- [ ] Error on content > 100 chars
- [ ] Error on < 2 tasks (first call)
- [ ] File writes to correct artifacts/{task}/TODO.md
- [ ] Token usage measured (expect -90% for updates)

---

## Scoring Integration

### P0 Violations:
- Agent calls todo_write with 0 or 2+ in_progress tasks → **P0 penalty** (-30 points)
- Agent reads LEDGER to check own score → **P0 penalty** (-30 points)

### Best Practice:
- Use merge=true for all updates after first call
- Mark task completed IMMEDIATELY after finishing (don't batch)
- Update only tasks that changed (not entire list)

---

**Version:** 1.0
**Date:** 2026-03-17
**Integration:** Nash Framework v6.3
