import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageTodoRepository } from '@/infrastructure';
import { createTodo, TodoStatus } from '@/core';

describe('LocalStorageTodoRepository', () => {
  let repo: LocalStorageTodoRepository;
  const STORAGE_KEY = 'todo-checklist:todos';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    repo = new LocalStorageTodoRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('should return empty array when localStorage is empty', async () => {
      const todos = await repo.getAll();
      expect(todos).toEqual([]);
    });

    it('should return all stored todos', async () => {
      const todo1 = createTodo('Todo 1');
      const todo2 = createTodo('Todo 2');

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([todo1, todo2])
      );

      const todos = await repo.getAll();
      expect(todos).toHaveLength(2);
      expect(todos[0].title).toBe('Todo 1');
      expect(todos[1].title).toBe('Todo 2');
    });

    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {');

      const todos = await repo.getAll();
      expect(todos).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return null when todo does not exist', async () => {
      const todo = await repo.getById('nonexistent-id');
      expect(todo).toBeNull();
    });

    it('should return todo by id', async () => {
      const todo = createTodo('Test todo');
      await repo.save(todo);

      const retrieved = await repo.getById(todo.id);
      expect(retrieved).toEqual(todo);
    });
  });

  describe('save', () => {
    it('should insert a new todo', async () => {
      const todo = createTodo('New todo');
      await repo.save(todo);

      const stored = await repo.getById(todo.id);
      expect(stored).toEqual(todo);
    });

    it('should update an existing todo', async () => {
      const todo = createTodo('Original');
      await repo.save(todo);

      const updated = {
        ...todo,
        title: 'Updated',
        status: TodoStatus.Complete,
        updatedAt: new Date().toISOString(),
      };
      await repo.save(updated);

      const retrieved = await repo.getById(todo.id);
      expect(retrieved?.title).toBe('Updated');
      expect(retrieved?.status).toBe(TodoStatus.Complete);
    });

    it('should not duplicate todos on update', async () => {
      const todo = createTodo('Todo');
      await repo.save(todo);

      const updated = { ...todo, title: 'Updated' };
      await repo.save(updated);

      const todos = await repo.getAll();
      expect(todos).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a todo by id', async () => {
      const todo = createTodo('To delete');
      await repo.save(todo);

      let todos = await repo.getAll();
      expect(todos).toHaveLength(1);

      await repo.delete(todo.id);

      todos = await repo.getAll();
      expect(todos).toHaveLength(0);
    });

    it('should not affect other todos when deleting', async () => {
      const todo1 = createTodo('Todo 1');
      const todo2 = createTodo('Todo 2');

      await repo.save(todo1);
      await repo.save(todo2);

      await repo.delete(todo1.id);

      const todos = await repo.getAll();
      expect(todos).toHaveLength(1);
      expect(todos[0].id).toBe(todo2.id);
    });

    it('should handle deleting non-existent todo gracefully', async () => {
      const todo = createTodo('Todo');
      await repo.save(todo);

      // Should not throw
      await repo.delete('nonexistent-id');

      const todos = await repo.getAll();
      expect(todos).toHaveLength(1);
    });
  });

  describe('persistence', () => {
    it('should persist todos across repository instances', async () => {
      const todo = createTodo('Persisted todo');
      await repo.save(todo);

      const newRepo = new LocalStorageTodoRepository();
      const retrieved = await newRepo.getById(todo.id);

      expect(retrieved).toEqual(todo);
    });
  });
});
