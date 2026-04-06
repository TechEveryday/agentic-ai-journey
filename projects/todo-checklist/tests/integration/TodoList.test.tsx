import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '@/presentation/components/TodoList';
import { createTodo } from '@/core';

describe('TodoList', () => {
  const onToggle = vi.fn();
  const onUpdate = vi.fn();
  const onDelete = vi.fn();

  it('should render EmptyState when no todos', () => {
    render(
      <TodoList
        todos={[]}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('No todos yet')).toBeInTheDocument();
  });

  it('should render all todos', () => {
    const todo1 = createTodo('Todo 1');
    const todo2 = createTodo('Todo 2');

    render(
      <TodoList
        todos={[todo1, todo2]}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Todo 1')).toBeInTheDocument();
    expect(screen.getByText('Todo 2')).toBeInTheDocument();
  });

  it('should render correct number of TodoItem components', () => {
    const todos = [createTodo('Todo 1'), createTodo('Todo 2'), createTodo('Todo 3')];

    render(
      <TodoList
        todos={todos}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });
});
