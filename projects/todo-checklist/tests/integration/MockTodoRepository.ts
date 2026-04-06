import type { Todo } from '@/core';
import type { ITodoRepository } from '@/application';

/**
 * Mock repository for testing — stores todos in memory
 * Useful for testing components and hooks without localStorage
 */
export class MockTodoRepository implements ITodoRepository {
  private todos: Map<string, Todo> = new Map();

  async getAll(): Promise<Todo[]> {
    return Array.from(this.todos.values());
  }

  async getById(id: string): Promise<Todo | null> {
    return this.todos.get(id) || null;
  }

  async save(todo: Todo): Promise<void> {
    this.todos.set(todo.id, todo);
  }

  async delete(id: string): Promise<void> {
    this.todos.delete(id);
  }

  clear(): void {
    this.todos.clear();
  }
}
