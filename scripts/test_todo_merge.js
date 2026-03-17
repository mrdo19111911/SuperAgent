/**
 * Test TodoWrite Merge Capability
 * Tests the "exactly 1 in_progress" enforcement and merge functionality
 */

import { randomUUID } from 'crypto';

const uuidv4 = randomUUID;

// Simulated TodoWrite implementation
class TodoWriteSimulator {
  constructor() {
    this.todoState = new Map();
  }

  todo_write(params) {
    const currentTaskId = process.env.NASH_TASK_ID || 'current';
    let todos = this.todoState.get(currentTaskId) || [];

    // Merge or replace
    if (params.merge) {
      for (const update of params.todos) {
        if (update.id) {
          // Update existing
          const index = todos.findIndex(t => t.id === update.id);
          if (index >= 0) {
            todos[index] = { ...todos[index], ...update };
          } else {
            throw new Error(`Task ID ${update.id} not found in current list`);
          }
        } else {
          // Add new task
          todos.push({ ...update, id: uuidv4() });
        }
      }
    } else {
      // Replace all
      if (params.todos.length < 2) {
        throw new Error(`Minimum 2 tasks required. Got ${params.todos.length}.`);
      }
      todos = params.todos.map(t => ({
        ...t,
        id: t.id || uuidv4()
      }));
    }

    // Validation: Exactly 1 in_progress
    const inProgressCount = todos.filter(t => t.status === 'in_progress').length;
    if (inProgressCount !== 1) {
      const inProgressIds = todos
        .filter(t => t.status === 'in_progress')
        .map(t => t.id || 'unknown')
        .join(', ');

      throw new Error(
        `Exactly 1 task must be in_progress. Found ${inProgressCount}. ` +
        `Current in_progress: ${inProgressIds || 'none'}`
      );
    }

    // Validation: Content length
    for (const todo of todos) {
      if (todo.content && todo.content.length > 100) {
        throw new Error(
          `Task content too long (${todo.content.length} chars). Max 100.`
        );
      }
    }

    // Save state
    this.todoState.set(currentTaskId, todos);

    return {
      success: true,
      todos: todos
    };
  }

  getTodos(taskId = 'current') {
    return this.todoState.get(taskId) || [];
  }
}

// Test suite
async function runTests() {
  const simulator = new TodoWriteSimulator();
  let passed = 0;
  let failed = 0;

  console.log('=== TodoWrite Merge Capability Tests ===\n');

  // Test 1: Should reject 0 in_progress
  console.log('Test 1: Reject 0 in_progress tasks');
  try {
    simulator.todo_write({
      merge: false,
      todos: [
        { content: 'Task 1', status: 'pending', activeForm: 'Task 1' },
        { content: 'Task 2', status: 'pending', activeForm: 'Task 2' }
      ]
    });
    console.log('❌ FAILED: Should have rejected 0 in_progress\n');
    failed++;
  } catch (e) {
    if (e.message.includes('Exactly 1 task must be in_progress. Found 0')) {
      console.log('✅ PASSED:', e.message, '\n');
      passed++;
    } else {
      console.log('❌ FAILED: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 2: Should accept 1 in_progress
  console.log('Test 2: Accept exactly 1 in_progress');
  try {
    const result = simulator.todo_write({
      merge: false,
      todos: [
        { content: 'Task A', status: 'in_progress', activeForm: 'Doing Task A' },
        { content: 'Task B', status: 'pending', activeForm: 'Doing Task B' }
      ]
    });
    if (result.success && result.todos.length === 2) {
      console.log('✅ PASSED: Created 2 tasks with UUIDs');
      console.log('   Task IDs:', result.todos.map(t => t.id).join(', '), '\n');
      passed++;
    } else {
      console.log('❌ FAILED: Unexpected result:', result, '\n');
      failed++;
    }
  } catch (e) {
    console.log('❌ FAILED:', e.message, '\n');
    failed++;
  }

  // Test 3: Should reject 2+ in_progress
  console.log('Test 3: Reject 2+ in_progress tasks');
  try {
    simulator.todo_write({
      merge: false,
      todos: [
        { content: 'Task 1', status: 'in_progress', activeForm: 'Task 1' },
        { content: 'Task 2', status: 'in_progress', activeForm: 'Task 2' }
      ]
    });
    console.log('❌ FAILED: Should have rejected 2 in_progress\n');
    failed++;
  } catch (e) {
    if (e.message.includes('Exactly 1 task must be in_progress. Found 2')) {
      console.log('✅ PASSED:', e.message, '\n');
      passed++;
    } else {
      console.log('❌ FAILED: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 4: Merge update (mark done, start next)
  console.log('Test 4: Merge update - mark done, start next');
  try {
    const firstCall = simulator.todo_write({
      merge: false,
      todos: [
        { content: 'Analyze requirements', status: 'in_progress', activeForm: 'Analyzing requirements' },
        { content: 'Design architecture', status: 'pending', activeForm: 'Designing architecture' },
        { content: 'Implement code', status: 'pending', activeForm: 'Implementing code' }
      ]
    });

    const task1Id = firstCall.todos[0].id;
    const task2Id = firstCall.todos[1].id;

    console.log('   Initial list:', firstCall.todos.length, 'tasks');

    // Update: complete task 1, start task 2
    const mergeCall = simulator.todo_write({
      merge: true,
      todos: [
        { id: task1Id, status: 'completed' },
        { id: task2Id, status: 'in_progress' }
      ]
    });

    const task1Status = mergeCall.todos.find(t => t.id === task1Id).status;
    const task2Status = mergeCall.todos.find(t => t.id === task2Id).status;
    const task3Status = mergeCall.todos[2].status;

    if (task1Status === 'completed' &&
        task2Status === 'in_progress' &&
        task3Status === 'pending') {
      console.log('✅ PASSED: Merge updated only specified tasks');
      console.log('   Task 1:', task1Status);
      console.log('   Task 2:', task2Status);
      console.log('   Task 3:', task3Status, '(unchanged)\n');
      passed++;
    } else {
      console.log('❌ FAILED: Unexpected statuses:', { task1Status, task2Status, task3Status }, '\n');
      failed++;
    }
  } catch (e) {
    console.log('❌ FAILED:', e.message, '\n');
    failed++;
  }

  // Test 5: Add new task with merge
  console.log('Test 5: Add new task using merge');
  try {
    const currentTodos = simulator.getTodos();
    const task2Id = currentTodos.find(t => t.status === 'in_progress').id;

    const addNewTask = simulator.todo_write({
      merge: true,
      todos: [
        { id: task2Id, status: 'completed' },
        {
          content: 'New urgent task',
          status: 'in_progress',
          activeForm: 'Handling urgent task'
        }
      ]
    });

    if (addNewTask.todos.length === 4) {
      const newTask = addNewTask.todos[3];
      console.log('✅ PASSED: Added new task with UUID');
      console.log('   Total tasks:', addNewTask.todos.length);
      console.log('   New task:', newTask.content, '(ID:', newTask.id, ')\n');
      passed++;
    } else {
      console.log('❌ FAILED: Expected 4 tasks, got', addNewTask.todos.length, '\n');
      failed++;
    }
  } catch (e) {
    console.log('❌ FAILED:', e.message, '\n');
    failed++;
  }

  // Test 6: Reject < 2 tasks on first call
  console.log('Test 6: Reject < 2 tasks on first call');
  try {
    const newSim = new TodoWriteSimulator();
    newSim.todo_write({
      merge: false,
      todos: [
        { content: 'Only task', status: 'in_progress', activeForm: 'Only task' }
      ]
    });
    console.log('❌ FAILED: Should have rejected < 2 tasks\n');
    failed++;
  } catch (e) {
    if (e.message.includes('Minimum 2 tasks required')) {
      console.log('✅ PASSED:', e.message, '\n');
      passed++;
    } else {
      console.log('❌ FAILED: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 7: Reject content > 100 chars
  console.log('Test 7: Reject content > 100 characters');
  try {
    const newSim = new TodoWriteSimulator();
    newSim.todo_write({
      merge: false,
      todos: [
        {
          content: 'A'.repeat(150),
          status: 'in_progress',
          activeForm: 'Long task'
        },
        { content: 'Task 2', status: 'pending', activeForm: 'Task 2' }
      ]
    });
    console.log('❌ FAILED: Should have rejected long content\n');
    failed++;
  } catch (e) {
    if (e.message.includes('Task content too long')) {
      console.log('✅ PASSED:', e.message, '\n');
      passed++;
    } else {
      console.log('❌ FAILED: Wrong error:', e.message, '\n');
      failed++;
    }
  }

  // Test 8: Token savings simulation
  console.log('Test 8: Token savings estimation');
  try {
    const newSim = new TodoWriteSimulator();

    // Create 20 tasks
    const largeTodoList = Array(20).fill(null).map((_, i) => ({
      content: `Task ${i + 1}`,
      status: i === 0 ? 'in_progress' : 'pending',
      activeForm: `Doing Task ${i + 1}`
    }));

    const result = newSim.todo_write({
      merge: false,
      todos: largeTodoList
    });

    // Simulate full rewrite
    const fullRewriteTokens = JSON.stringify(largeTodoList).length;

    // Simulate merge (only 2 tasks)
    const mergeTokens = JSON.stringify([
      { id: result.todos[0].id, status: 'completed' },
      { id: result.todos[1].id, status: 'in_progress' }
    ]).length;

    const savings = ((fullRewriteTokens - mergeTokens) / fullRewriteTokens * 100).toFixed(1);

    console.log('✅ PASSED: Token savings estimation');
    console.log('   Full rewrite: ~', fullRewriteTokens, 'chars');
    console.log('   Merge update: ~', mergeTokens, 'chars');
    console.log('   Savings: ', savings, '%\n');
    passed++;
  } catch (e) {
    console.log('❌ FAILED:', e.message, '\n');
    failed++;
  }

  // Summary
  console.log('=== Test Summary ===');
  console.log('Passed:', passed);
  console.log('Failed:', failed);
  console.log('Total:', passed + failed);

  if (failed === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(console.error);
