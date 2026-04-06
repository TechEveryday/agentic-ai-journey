import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '@/presentation/components/TodoForm';

describe('TodoForm', () => {
  it('should render input and button', () => {
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} />);

    expect(screen.getByPlaceholderText('Add a new todo...')).toBeInTheDocument();
    // Find the add button in the box (skip form buttons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should show validation error for empty title', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // Click first button (add button)

    expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should call onAdd with trimmed title', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByPlaceholderText(
      'Add a new todo...'
    ) as HTMLInputElement;
    await user.type(input, '  Test todo  ');

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(onAdd).toHaveBeenCalledWith('Test todo');
  });

  it('should clear input after successful submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByPlaceholderText(
      'Add a new todo...'
    ) as HTMLInputElement;
    await user.type(input, 'Test todo');

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should disable form while submitting', async () => {
    const onAdd = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    const buttons = screen.getAllByRole('button');

    await user.type(input, 'Test todo');
    await user.click(buttons[0]);

    expect(input).toBeDisabled();
    expect(buttons[0]).toBeDisabled();

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it('should submit on Enter key', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<TodoForm onAdd={onAdd} />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    await user.type(input, 'Test todo');
    await user.keyboard('{Enter}');

    expect(onAdd).toHaveBeenCalledWith('Test todo');
  });

  it('should respect disabled prop', () => {
    const onAdd = vi.fn();
    render(<TodoForm onAdd={onAdd} disabled={true} />);

    const input = screen.getByPlaceholderText('Add a new todo...');
    const buttons = screen.getAllByRole('button');

    expect(input).toBeDisabled();
    expect(buttons[0]).toBeDisabled();
  });
});
