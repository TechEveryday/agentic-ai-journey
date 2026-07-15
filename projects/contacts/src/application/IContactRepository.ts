import type { Contact } from '@/core';

export interface IContactRepository {
  getAll(): Promise<Contact[]>;
  getById(id: string): Promise<Contact | null>;
  save(contact: Contact): Promise<void>;
  delete(id: string): Promise<void>;
}
