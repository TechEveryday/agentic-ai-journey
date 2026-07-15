import { describe, it, expect } from 'vitest';
import { TodoStatus, createTodo } from '@/core/todo';

describe('Todo Type', () => {
  it('should have correct TodoStatus enum values', () => {
    expect(TodoStatus.Incomplete).toBe('incomplete');
    expect(TodoStatus.Complete).toBe('complete');
  });

  it('createTodo should create a todo with correct defaults', () => {
    const todo = createTodo('Test todo');

    expect(todo.id).toBeDefined();
    expect(todo.title).toBe('Test todo');
    expect(todo.status).toBe(TodoStatus.Incomplete);
    expect(todo.createdAt).toBeDefined();
    expect(todo.updatedAt).toBeDefined();
  });

  it('createTodo should trim whitespace from title', () => {
    const todo = createTodo('  Trimmed todo  ');
    expect(todo.title).toBe('Trimmed todo');
  });

  it('createTodo should generate valid ISO 8601 timestamps', () => {
    const todo = createTodo('Test');
    const createdDate = new Date(todo.createdAt);
    const updatedDate = new Date(todo.updatedAt);

    expect(createdDate instanceof Date && !isNaN(createdDate.getTime())).toBe(true);
    expect(updatedDate instanceof Date && !isNaN(updatedDate.getTime())).toBe(true);
  });

  it('createTodo should generate unique IDs', () => {
    const todo1 = createTodo('Todo 1');
    const todo2 = createTodo('Todo 2');

    expect(todo1.id).not.toBe(todo2.id);
  });
});
