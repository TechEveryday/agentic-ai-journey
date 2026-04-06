import type { Todo } from '@/core';
import type { ITodoRepository } from '@/application';

const STORAGE_KEY = 'todo-checklist:todos';

export class LocalStorageTodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Todo[];
    } catch (error) {
      // Gracefully handle corrupted localStorage data
      console.error('Failed to read todos from localStorage:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Todo | null> {
    const todos = await this.getAll();
    return todos.find((todo) => todo.id === id) || null;
  }

  async save(todo: Todo): Promise<void> {
    const todos = await this.getAll();
    const existingIndex = todos.findIndex((t) => t.id === todo.id);

    if (existingIndex >= 0) {
      // Update
      todos[existingIndex] = todo;
    } else {
      // Insert
      todos.push(todo);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  async delete(id: string): Promise<void> {
    const todos = await this.getAll();
    const filtered = todos.filter((todo) => todo.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}
