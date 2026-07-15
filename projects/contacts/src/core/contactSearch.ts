import type { Contact } from './contact';

/**
 * Pure search predicate — case-insensitive match across name, email,
 * phone, and tags. Empty/whitespace query matches everything.
 */
export function matchesQuery(contact: Contact, query: string): boolean {
  const trimmed = query.trim().toLowerCase();

  if (trimmed.length === 0) {
    return true;
  }

  const haystacks = [
    contact.firstName,
    contact.lastName,
    `${contact.firstName} ${contact.lastName}`,
    contact.email,
    contact.phone,
    ...contact.tags,
  ];

  return haystacks.some((field) => field.toLowerCase().includes(trimmed));
}
