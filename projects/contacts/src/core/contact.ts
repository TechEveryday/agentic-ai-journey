export interface Contact {
  id: string; // UUID v4
  firstName: string; // Required, non-empty, max 100 chars
  lastName: string; // Required, non-empty, max 100 chars
  email: string; // Optional, max 254 chars, valid format when present
  phone: string; // Optional, max 30 chars, valid format when present
  tags: string[];
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface ContactInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
}

export function createContact(input: ContactInput): Contact {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    tags: input.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
    createdAt: now,
    updatedAt: now,
  };
}
