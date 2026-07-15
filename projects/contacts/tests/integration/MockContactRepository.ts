import type { Contact } from '@/core';
import type { IContactRepository } from '@/application';

/**
 * Mock repository for testing — stores contacts in memory
 * Useful for testing components and hooks without localStorage
 */
export class MockContactRepository implements IContactRepository {
  private contacts: Map<string, Contact> = new Map();

  async getAll(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getById(id: string): Promise<Contact | null> {
    return this.contacts.get(id) || null;
  }

  async save(contact: Contact): Promise<void> {
    this.contacts.set(contact.id, contact);
  }

  async delete(id: string): Promise<void> {
    this.contacts.delete(id);
  }

  clear(): void {
    this.contacts.clear();
  }
}
