import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '@/presentation/components/TodoItem';
import { createTodo, TodoStatus } from '@/core';

describe('TodoItem', () => {
  const mockTodo = createTodo('Test todo');

  it('should render todo title and checkbox', () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox is clicked', async () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show strikethrough when complete', () => {
    const completeTodo = { ...mockTodo, status: TodoStatus.Complete };
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();

    const { container } = render(
      <TodoItem
        todo={completeTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const listItemText = container.querySelector('[class*="MuiListItemText"]');
    expect(listItemText).toHaveStyle('text-decoration: line-through');
  });

  it('should enter edit mode when edit button is clicked', async () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // Edit button

    const input = screen.getByDisplayValue('Test todo');
    expect(input).toBeInTheDocument();
  });

  it('should save edit on Enter key', async () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // Edit button

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Enter}');

    expect(onUpdate).toHaveBeenCalledWith(mockTodo.id, 'Updated todo');
  });

  it('should cancel edit on Escape key', async () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // Edit button

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Escape}');

    expect(screen.getByText('Test todo')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]); // Delete button

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });
});
