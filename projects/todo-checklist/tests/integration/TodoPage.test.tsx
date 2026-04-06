import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTodos } from '@/application';
import { createTodo, TodoStatus } from '@/core';
import { MockTodoRepository } from './MockTodoRepository';

describe('TodoPage Integration (useTodos hook)', () => {
  let mockRepo: MockTodoRepository;

  beforeEach(() => {
    mockRepo = new MockTodoRepository();
  });

  it('should load todos on mount', async () => {
    const todo1 = createTodo('Todo 1');
    const todo2 = createTodo('Todo 2');

    await mockRepo.save(todo1);
    await mockRepo.save(todo2);

    const { result } = renderHook(() => useTodos(mockRepo));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.todos).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should show empty todos when repository is empty', async () => {
    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toEqual([]);
  });

  it('should add a new todo', async () => {
    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.addTodo('New todo');

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe('New todo');
    expect(result.current.todos[0].status).toBe(TodoStatus.Incomplete);
  });

  it('should prevent adding empty title', async () => {
    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await result.current.addTodo('');

    expect(result.current.todos).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
  });

  it('should toggle todo completion', async () => {
    const todo = createTodo('Todo');
    await mockRepo.save(todo);

    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const todoId = result.current.todos[0].id;

    await result.current.toggleTodo(todoId);

    expect(result.current.todos[0].status).toBe(TodoStatus.Complete);

    await result.current.toggleTodo(todoId);

    expect(result.current.todos[0].status).toBe(TodoStatus.Incomplete);
  });

  it('should update todo title', async () => {
    const todo = createTodo('Original');
    await mockRepo.save(todo);

    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const todoId = result.current.todos[0].id;

    await result.current.updateTodo(todoId, 'Updated');

    expect(result.current.todos[0].title).toBe('Updated');
  });

  it('should delete a todo', async () => {
    const todo1 = createTodo('Todo 1');
    const todo2 = createTodo('Todo 2');

    await mockRepo.save(todo1);
    await mockRepo.save(todo2);

    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toHaveLength(2);

    await result.current.deleteTodo(todo1.id);

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].id).toBe(todo2.id);
  });

  it('should handle CRUD cycle correctly', async () => {
    const { result } = renderHook(() => useTodos(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Add
    await result.current.addTodo('Task 1');
    await result.current.addTodo('Task 2');
    expect(result.current.todos).toHaveLength(2);

    // Update
    const task1Id = result.current.todos[0].id;
    await result.current.updateTodo(task1Id, 'Task 1 Updated');
    expect(result.current.todos[0].title).toBe('Task 1 Updated');

    // Toggle
    await result.current.toggleTodo(task1Id);
    expect(result.current.todos[0].status).toBe(TodoStatus.Complete);

    // Delete
    await result.current.deleteTodo(task1Id);
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe('Task 2');
  });
});
