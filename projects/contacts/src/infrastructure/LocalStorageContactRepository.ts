import type { Contact } from '@/core';
import type { IContactRepository } from '@/application';

const STORAGE_KEY = 'contacts:contacts';

export class LocalStorageContactRepository implements IContactRepository {
  async getAll(): Promise<Contact[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Contact[];
    } catch (error) {
      // Gracefully handle corrupted localStorage data
      console.error('Failed to read contacts from localStorage:', error);
      return [];
    }
  }

  async getById(id: string): Promise<Contact | null> {
    const contacts = await this.getAll();
    return contacts.find((contact) => contact.id === id) || null;
  }

  async save(contact: Contact): Promise<void> {
    const contacts = await this.getAll();
    const existingIndex = contacts.findIndex((c) => c.id === contact.id);

    if (existingIndex >= 0) {
      // Update
      contacts[existingIndex] = contact;
    } else {
      // Insert
      contacts.push(contact);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }

  async delete(id: string): Promise<void> {
    const contacts = await this.getAll();
    const filtered = contacts.filter((contact) => contact.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
}
