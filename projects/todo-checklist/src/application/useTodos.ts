import { useState, useEffect, useCallback } from 'react';
import type { Todo } from '@/core';
import { TodoStatus, createTodo, validateTodoTitle } from '@/core';
import type { ITodoRepository } from './ITodoRepository';

export interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (title: string) => Promise<void>;
  updateTodo: (id: string, title: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
}

export function useTodos(repository: ITodoRepository): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loaded = await repository.getAll();
        setTodos(loaded);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load todos';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodos();
  }, [repository]);

  const addTodo = useCallback(
    async (title: string) => {
      // Validate before adding
      const validation = validateTodoTitle(title);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      try {
        setError(null);

        // Entity construction belongs to core, not here
        const todo = createTodo(title);

        await repository.save(todo);
        setTodos((prev) => [...prev, todo]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add todo';
        setError(message);
      }
    },
    [repository]
  );

  const updateTodo = useCallback(
    async (id: string, title: string) => {
      // Validate before updating
      const validation = validateTodoTitle(title);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      try {
        setError(null);
        const todo = todos.find((t) => t.id === id);

        if (!todo) {
          setError('Todo not found');
          return;
        }

        const updated: Todo = {
          ...todo,
          title: title.trim(),
          updatedAt: new Date().toISOString(),
        };

        await repository.save(updated);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update todo';
        setError(message);
      }
    },
    [todos, repository]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      try {
        setError(null);
        const todo = todos.find((t) => t.id === id);

        if (!todo) {
          setError('Todo not found');
          return;
        }

        const updated: Todo = {
          ...todo,
          status:
            todo.status === TodoStatus.Complete
              ? TodoStatus.Incomplete
              : TodoStatus.Complete,
          updatedAt: new Date().toISOString(),
        };

        await repository.save(updated);
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? updated : t))
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to toggle todo';
        setError(message);
      }
    },
    [todos, repository]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await repository.delete(id);
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete todo';
        setError(message);
      }
    },
    [repository]
  );

  return {
    todos,
    isLoading,
    error,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
  };
}
