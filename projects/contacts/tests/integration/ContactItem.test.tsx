import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactItem } from '@/presentation/components/ContactItem';
import { createContact } from '@/core';

function makeContact() {
  return createContact({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '555-123-4567',
    tags: ['mathematician'],
  });
}

describe('ContactItem', () => {
  it('should render the contact name, email, phone, and tags', () => {
    const contact = makeContact();
    render(<ContactItem contact={contact} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    expect(screen.getByText('mathematician')).toBeInTheDocument();
  });

  it('should enter edit mode when the edit button is clicked', async () => {
    const contact = makeContact();
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit contact' }));

    expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lovelace')).toBeInTheDocument();
  });

  it('should save edits when the save button is clicked', async () => {
    const contact = makeContact();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit contact' }));

    const lastNameInput = screen.getByDisplayValue('Lovelace');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Byron');
    await user.click(screen.getByRole('button', { name: 'Save contact' }));

    expect(onUpdate).toHaveBeenCalledWith(
      contact.id,
      expect.objectContaining({ firstName: 'Ada', lastName: 'Byron' })
    );
  });

  it('should save edits on Enter key', async () => {
    const contact = makeContact();
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit contact' }));
    const lastNameInput = screen.getByDisplayValue('Lovelace');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Byron');
    await user.keyboard('{Enter}');

    expect(onUpdate).toHaveBeenCalledWith(
      contact.id,
      expect.objectContaining({ lastName: 'Byron' })
    );
  });

  it('should cancel edit on Escape key without calling onUpdate', async () => {
    const contact = makeContact();
    const onUpdate = vi.fn();
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={onUpdate} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit contact' }));
    const lastNameInput = screen.getByDisplayValue('Lovelace');
    await user.clear(lastNameInput);
    await user.type(lastNameInput, 'Byron');
    await user.keyboard('{Escape}');

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('should cancel edit when the cancel button is clicked', async () => {
    const contact = makeContact();
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={vi.fn()} onDelete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Edit contact' }));
    await user.click(screen.getByRole('button', { name: 'Cancel edit' }));

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('should call onDelete when the delete button is clicked', async () => {
    const contact = makeContact();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<ContactItem contact={contact} onUpdate={vi.fn()} onDelete={onDelete} />);

    await user.click(screen.getByRole('button', { name: 'Delete contact' }));

    expect(onDelete).toHaveBeenCalledWith(contact.id);
  });
});
