import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageContactRepository } from '@/infrastructure';
import { createContact } from '@/core';

describe('LocalStorageContactRepository', () => {
  let repo: LocalStorageContactRepository;
  const STORAGE_KEY = 'contacts:contacts';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    repo = new LocalStorageContactRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('should return empty array when localStorage is empty', async () => {
      const contacts = await repo.getAll();
      expect(contacts).toEqual([]);
    });

    it('should return all stored contacts', async () => {
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

      localStorage.setItem(STORAGE_KEY, JSON.stringify([contact1, contact2]));

      const contacts = await repo.getAll();
      expect(contacts).toHaveLength(2);
      expect(contacts[0].firstName).toBe('Ada');
      expect(contacts[1].firstName).toBe('Grace');
    });

    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {');

      const contacts = await repo.getAll();
      expect(contacts).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return null when contact does not exist', async () => {
      const contact = await repo.getById('nonexistent-id');
      expect(contact).toBeNull();
    });

    it('should return contact by id', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      const retrieved = await repo.getById(contact.id);
      expect(retrieved).toEqual(contact);
    });
  });

  describe('save', () => {
    it('should insert a new contact', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      const stored = await repo.getById(contact.id);
      expect(stored).toEqual(contact);
    });

    it('should update an existing contact', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      const updated = {
        ...contact,
        lastName: 'Byron',
        updatedAt: new Date().toISOString(),
      };
      await repo.save(updated);

      const retrieved = await repo.getById(contact.id);
      expect(retrieved?.lastName).toBe('Byron');
    });

    it('should not duplicate contacts on update', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      const updated = { ...contact, lastName: 'Byron' };
      await repo.save(updated);

      const contacts = await repo.getAll();
      expect(contacts).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a contact by id', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      let contacts = await repo.getAll();
      expect(contacts).toHaveLength(1);

      await repo.delete(contact.id);

      contacts = await repo.getAll();
      expect(contacts).toHaveLength(0);
    });

    it('should not affect other contacts when deleting', async () => {
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

      await repo.save(contact1);
      await repo.save(contact2);

      await repo.delete(contact1.id);

      const contacts = await repo.getAll();
      expect(contacts).toHaveLength(1);
      expect(contacts[0].id).toBe(contact2.id);
    });

    it('should handle deleting a non-existent contact gracefully', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      // Should not throw
      await repo.delete('nonexistent-id');

      const contacts = await repo.getAll();
      expect(contacts).toHaveLength(1);
    });
  });

  describe('persistence', () => {
    it('should persist contacts across repository instances', async () => {
      const contact = createContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
      await repo.save(contact);

      const newRepo = new LocalStorageContactRepository();
      const retrieved = await newRepo.getById(contact.id);

      expect(retrieved).toEqual(contact);
    });
  });
});
