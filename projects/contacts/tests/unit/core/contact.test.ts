import { describe, it, expect } from 'vitest';
import { createContact } from '@/core/contact';
import type { ContactInput } from '@/core/contact';

function makeInput(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '',
    tags: [],
    ...overrides,
  };
}

describe('Contact Type', () => {
  it('createContact should create a contact with correct defaults', () => {
    const contact = createContact(makeInput());

    expect(contact.id).toBeDefined();
    expect(contact.firstName).toBe('Ada');
    expect(contact.lastName).toBe('Lovelace');
    expect(contact.email).toBe('ada@example.com');
    expect(contact.phone).toBe('');
    expect(contact.tags).toEqual([]);
    expect(contact.createdAt).toBeDefined();
    expect(contact.updatedAt).toBeDefined();
  });

  it('createContact should trim whitespace from string fields', () => {
    const contact = createContact(
      makeInput({
        firstName: '  Ada  ',
        lastName: '  Lovelace  ',
        email: '  ada@example.com  ',
        phone: '  555-1234  ',
      })
    );

    expect(contact.firstName).toBe('Ada');
    expect(contact.lastName).toBe('Lovelace');
    expect(contact.email).toBe('ada@example.com');
    expect(contact.phone).toBe('555-1234');
  });

  it('createContact should trim and drop empty tags', () => {
    const contact = createContact(
      makeInput({ tags: [' friend ', '', '  ', 'work'] })
    );

    expect(contact.tags).toEqual(['friend', 'work']);
  });

  it('createContact should generate valid ISO 8601 timestamps', () => {
    const contact = createContact(makeInput());
    const createdDate = new Date(contact.createdAt);
    const updatedDate = new Date(contact.updatedAt);

    expect(createdDate instanceof Date && !isNaN(createdDate.getTime())).toBe(true);
    expect(updatedDate instanceof Date && !isNaN(updatedDate.getTime())).toBe(true);
  });

  it('createContact should generate unique IDs', () => {
    const contact1 = createContact(makeInput({ firstName: 'Ada' }));
    const contact2 = createContact(makeInput({ firstName: 'Grace' }));

    expect(contact1.id).not.toBe(contact2.id);
  });
});
