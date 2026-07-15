import { describe, it, expect } from 'vitest';
import { matchesQuery } from '@/core/contactSearch';
import { createContact } from '@/core/contact';

function makeContact() {
  return createContact({
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '555-123-4567',
    tags: ['mathematician', 'writer'],
  });
}

describe('matchesQuery', () => {
  it('should match everything when the query is empty', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, '')).toBe(true);
  });

  it('should match everything when the query is whitespace only', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, '   ')).toBe(true);
  });

  it('should match on first name', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'Ada')).toBe(true);
  });

  it('should match on last name', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'Lovelace')).toBe(true);
  });

  it('should match on full name across first and last name', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'Ada Lovelace')).toBe(true);
  });

  it('should match on email', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'ada@example.com')).toBe(true);
  });

  it('should match on phone', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, '555-123')).toBe(true);
  });

  it('should match on tags', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'writer')).toBe(true);
  });

  it('should be case-insensitive', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'ADA')).toBe(true);
    expect(matchesQuery(contact, 'lovelace')).toBe(true);
    expect(matchesQuery(contact, 'WRITER')).toBe(true);
  });

  it('should return false when nothing matches', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'nonexistent')).toBe(false);
  });

  it('should match partial substrings', () => {
    const contact = makeContact();
    expect(matchesQuery(contact, 'ovela')).toBe(true);
  });
});
