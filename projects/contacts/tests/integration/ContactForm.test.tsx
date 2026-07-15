import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/presentation/components/ContactForm';

describe('ContactForm', () => {
  it('should render all fields and the submit button', () => {
    const onAdd = vi.fn();
    const { container } = render(<ContactForm onAdd={onAdd} />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tags (comma separated)')).toBeInTheDocument();
  });

  it('should show a validation error when required fields are missing', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<ContactForm onAdd={onAdd} />);

    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should show a validation error when neither email nor phone is provided', async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();

    render(<ContactForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText('First name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Last name'), 'Lovelace');
    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(screen.getByText('At least one of email or phone is required')).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should call onAdd with trimmed values and parsed tags', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ContactForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText('First name'), '  Ada  ');
    await user.type(screen.getByPlaceholderText('Last name'), '  Lovelace  ');
    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('Tags (comma separated)'), 'friend, mathematician');
    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    expect(onAdd).toHaveBeenCalledWith({
      firstName: '  Ada  ',
      lastName: '  Lovelace  ',
      email: 'ada@example.com',
      phone: '',
      tags: ['friend', 'mathematician'],
    });
  });

  it('should clear the form after successful submission', async () => {
    const onAdd = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ContactForm onAdd={onAdd} />);

    const firstName = screen.getByPlaceholderText('First name') as HTMLInputElement;
    await user.type(firstName, 'Ada');
    await user.type(screen.getByPlaceholderText('Last name'), 'Lovelace');
    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: 'Add contact' }));

    await waitFor(() => {
      expect(firstName.value).toBe('');
    });
  });

  it('should disable the form while submitting', async () => {
    const onAdd = vi.fn(() => new Promise<void>((resolve) => setTimeout(resolve, 100)));
    const user = userEvent.setup();

    render(<ContactForm onAdd={onAdd} />);

    await user.type(screen.getByPlaceholderText('First name'), 'Ada');
    await user.type(screen.getByPlaceholderText('Last name'), 'Lovelace');
    await user.type(screen.getByPlaceholderText('Email'), 'ada@example.com');

    const button = screen.getByRole('button', { name: 'Add contact' });
    await user.click(button);

    expect(screen.getByPlaceholderText('First name')).toBeDisabled();
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('First name')).not.toBeDisabled();
    });
  });

  it('should respect the disabled prop', () => {
    const onAdd = vi.fn();
    render(<ContactForm onAdd={onAdd} disabled />);

    expect(screen.getByPlaceholderText('First name')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Add contact' })).toBeDisabled();
  });
});
