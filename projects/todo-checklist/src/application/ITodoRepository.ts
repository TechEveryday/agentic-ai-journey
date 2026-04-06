import type { Todo } from '@/core';

export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  save(todo: Todo): Promise<void>;
  delete(id: string): Promise<void>;
}
