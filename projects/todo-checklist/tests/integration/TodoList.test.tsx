import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from '@/presentation/components/TodoList';
import { createTodo } from '@/core';

describe('TodoList', () => {
  let onToggle: ReturnType<typeof vi.fn>;
  let onUpdate: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggle = vi.fn();
    onUpdate = vi.fn();
    onDelete = vi.fn();
  });

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

    const { container } = render(
      <TodoList
        todos={todos}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    // Material-UI List renders as <ul>, get checkboxes from it
    const list = container.querySelector('ul');
    const checkboxes = list ? list.querySelectorAll('input[type="checkbox"]') : [];
    expect(checkboxes).toHaveLength(3);
  });
});
