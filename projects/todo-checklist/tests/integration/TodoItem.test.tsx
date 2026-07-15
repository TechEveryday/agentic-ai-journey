import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '@/presentation/components/TodoItem';
import { createTodo, TodoStatus } from '@/core';

describe('TodoItem', () => {
  it('should render todo title and checkbox', () => {
    const mockTodo = createTodo('Test todo');
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
    const mockTodo = createTodo('Test todo');
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
    const mockTodo = createTodo('Test todo');
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
    const mockTodo = createTodo('Test todo');
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    // Find edit button in the secondary action container
    const editButton = container.querySelector('[class*="MuiListItemSecondaryAction"] button');
    await user.click(editButton!);

    const input = screen.getByDisplayValue('Test todo');
    expect(input).toBeInTheDocument();
  });

  it('should save edit on Enter key', async () => {
    const mockTodo = createTodo('Test todo');
    const onToggle = vi.fn();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const editButton = container.querySelector('[class*="MuiListItemSecondaryAction"] button');
    await user.click(editButton!);

    const input = screen.getByDisplayValue('Test todo');
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Enter}');

    expect(onUpdate).toHaveBeenCalledWith(mockTodo.id, 'Updated todo');
  });

  it('should cancel edit on Escape key', async () => {
    const mockTodo = createTodo('Test todo');
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    const editButton = container.querySelector('[class*="MuiListItemSecondaryAction"] button');
    await user.click(editButton!);

    const input = screen.getByDisplayValue('Test todo') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, 'Updated todo');
    await user.keyboard('{Escape}');

    // Text should revert to view mode - look for the primary text in the list item
    const primaryText = container.querySelector('[class*="MuiListItemText-primary"]');
    expect(primaryText?.textContent).toBe('Test todo');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', async () => {
    const mockTodo = createTodo('Test todo');
    const onToggle = vi.fn();
    const onUpdate = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { container } = render(
      <TodoItem
        todo={mockTodo}
        onToggle={onToggle}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    // Find both buttons in the secondary action area
    const buttons = container.querySelectorAll('[class*="MuiListItemSecondaryAction"] button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    await user.click(buttons[1]); // Delete is the second button

    expect(onDelete).toHaveBeenCalledWith(mockTodo.id);
  });
});
