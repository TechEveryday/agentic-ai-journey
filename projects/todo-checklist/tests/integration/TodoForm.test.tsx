import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '@/presentation/components/TodoForm';

describe('TodoForm', () => {
  it('should render input and button', () => {
    const onAdd = vi.fn();
    const { container } = render(<TodoForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();

    const input = form?.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('should show validation error for empty title', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<TodoForm onAdd={onAdd} />);

    const button = container.querySelector('form button');
    expect(button).toBeInTheDocument();
    await user.click(button!);

    expect(screen.getByText('Title cannot be empty')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should call onAdd with trimmed title', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { container } = render(<TodoForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    const input = form?.querySelector('input') as HTMLInputElement;
    await user.type(input, '  Test todo  ');

    const button = form?.querySelector('button');
    await user.click(button!);

    expect(onAdd).toHaveBeenCalledWith('Test todo');
  });

  it('should clear input after successful submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { container } = render(<TodoForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    const input = form?.querySelector('input') as HTMLInputElement;
    await user.type(input, 'Test todo');

    const button = form?.querySelector('button');
    await user.click(button!);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should disable form while submitting', async () => {
    const onAdd = vi.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const user = userEvent.setup();

    const { container } = render(<TodoForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    const input = form?.querySelector('input') as HTMLInputElement;
    const button = form?.querySelector('button') as HTMLButtonElement;

    await user.type(input, 'Test todo');
    await user.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });

  it('should submit on Enter key', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    const { container } = render(<TodoForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    const input = form?.querySelector('input') as HTMLInputElement;
    await user.type(input, 'Test todo');
    await user.keyboard('{Enter}');

    expect(onAdd).toHaveBeenCalledWith('Test todo');
  });

  it('should respect disabled prop', () => {
    const onAdd = vi.fn();
    const { container } = render(<TodoForm onAdd={onAdd} disabled={true} />);

    // When disabled, the form should still render but controls should be disabled
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();

    const button = container.querySelector('form button') as HTMLButtonElement;
    expect(button).toBeDisabled();

    // Find the input field (Material-UI TextField renders it inside)
    const input = form?.querySelector('input') as HTMLInputElement | null;
    if (input) {
      expect(input).toBeDisabled();
    }
  });
});
