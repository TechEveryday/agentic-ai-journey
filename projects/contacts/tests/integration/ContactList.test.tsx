import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactList } from '@/presentation/components/ContactList';
import { createContact } from '@/core';

describe('ContactList', () => {
  let onUpdate: ReturnType<typeof vi.fn>;
  let onDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onUpdate = vi.fn();
    onDelete = vi.fn();
  });

  it('should render EmptyState when there are no contacts', () => {
    render(<ContactList contacts={[]} onUpdate={onUpdate} onDelete={onDelete} />);

    expect(screen.getByText('No contacts yet')).toBeInTheDocument();
  });

  it('should render all contacts', () => {
    const contact1 = createContact({
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '',
      tags: [],
    });
    const contact2 = createContact({
      firstName: 'Grace',
      lastName: 'Hopper',
      email: 'grace@example.com',
      phone: '',
      tags: [],
    });

    render(
      <ContactList
        contacts={[contact1, contact2]}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('should render one ContactItem row per contact', () => {
    const contacts = [
      createContact({ firstName: 'Ada', lastName: 'Lovelace', email: 'a@x.com', phone: '', tags: [] }),
      createContact({ firstName: 'Grace', lastName: 'Hopper', email: 'g@x.com', phone: '', tags: [] }),
      createContact({ firstName: 'Alan', lastName: 'Turing', email: 't@x.com', phone: '', tags: [] }),
    ];

    const { container } = render(
      <ContactList contacts={contacts} onUpdate={onUpdate} onDelete={onDelete} />
    );

    const list = container.querySelector('ul');
    const items = list ? list.querySelectorAll('li') : [];
    expect(items).toHaveLength(3);
  });
});
