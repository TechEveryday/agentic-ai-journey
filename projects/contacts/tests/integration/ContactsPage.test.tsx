import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactsPage } from '@/presentation/pages/ContactsPage';

async function addContact(
  user: ReturnType<typeof userEvent.setup>,
  { firstName, lastName, email }: { firstName: string; lastName: string; email: string }
) {
  await user.type(screen.getByPlaceholderText('First name'), firstName);
  await user.type(screen.getByPlaceholderText('Last name'), lastName);
  await user.type(screen.getByPlaceholderText('Email'), email);
  await user.click(screen.getByRole('button', { name: 'Add contact' }));
  await waitFor(() => {
    expect(screen.getByText(`${firstName} ${lastName}`)).toBeInTheDocument();
  });
}

describe('ContactsPage integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the empty state with no contacts', async () => {
    render(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('No contacts yet')).toBeInTheDocument();
    });
  });

  it('should filter the visible list as the search query changes', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('No contacts yet')).toBeInTheDocument();
    });

    await addContact(user, { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });
    await addContact(user, { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com' });

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search contacts...'), 'Grace');

    await waitFor(() => {
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('should show all contacts again when the search query is cleared', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('No contacts yet')).toBeInTheDocument();
    });

    await addContact(user, { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });
    await addContact(user, { firstName: 'Grace', lastName: 'Hopper', email: 'grace@example.com' });

    const search = screen.getByPlaceholderText('Search contacts...');
    await user.type(search, 'Grace');

    await waitFor(() => {
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });

    await user.clear(search);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('should remove a contact from the list when deleted', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />);

    await waitFor(() => {
      expect(screen.getByText('No contacts yet')).toBeInTheDocument();
    });

    await addContact(user, { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' });

    await user.click(screen.getByRole('button', { name: 'Delete contact' }));

    await waitFor(() => {
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No contacts yet')).toBeInTheDocument();
  });
});
