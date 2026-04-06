import { describe, it, expect } from 'vitest';
import { validateTodoTitle, validateTodo } from '@/core/todoValidator';

describe('validateTodoTitle', () => {
  it('should validate empty string as invalid', () => {
    const result = validateTodoTitle('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title cannot be empty');
  });

  it('should validate whitespace-only string as invalid', () => {
    const result = validateTodoTitle('   ');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title cannot be empty');
  });

  it('should validate non-empty string as valid', () => {
    const result = validateTodoTitle('Valid todo');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate string with leading/trailing whitespace as valid after trim', () => {
    const result = validateTodoTitle('  Valid todo  ');
    expect(result.valid).toBe(true);
  });

  it('should accept title of exactly 200 characters', () => {
    const title = 'a'.repeat(200);
    const result = validateTodoTitle(title);
    expect(result.valid).toBe(true);
  });

  it('should reject title longer than 200 characters', () => {
    const title = 'a'.repeat(201);
    const result = validateTodoTitle(title);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title must be 200 characters or less');
  });

  it('should handle titles with special characters', () => {
    const result = validateTodoTitle('Todo with !@#$%^&*()');
    expect(result.valid).toBe(true);
  });
});

describe('validateTodo', () => {
  it('should validate valid title', () => {
    const result = validateTodo({ title: 'Valid' });
    expect(result.valid).toBe(true);
  });

  it('should invalidate empty title', () => {
    const result = validateTodo({ title: '' });
    expect(result.valid).toBe(false);
  });

  it('should validate correct status values', () => {
    const incomplete = validateTodo({ status: 'incomplete' });
    const complete = validateTodo({ status: 'complete' });

    expect(incomplete.valid).toBe(true);
    expect(complete.valid).toBe(true);
  });

  it('should invalidate incorrect status values', () => {
    const result = validateTodo({ status: 'invalid' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Status must be "incomplete" or "complete"');
  });

  it('should validate both title and status together', () => {
    const result = validateTodo({
      title: 'Valid todo',
      status: 'complete',
    });
    expect(result.valid).toBe(true);
  });

  it('should collect all validation errors', () => {
    const result = validateTodo({
      title: '',
      status: 'invalid',
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
