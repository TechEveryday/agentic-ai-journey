import { useState, useEffect, useCallback } from 'react';
import type { Contact, ContactInput } from '@/core';
import { createContact, validateContact } from '@/core';
import type { IContactRepository } from './IContactRepository';

export interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  addContact: (input: ContactInput) => Promise<void>;
  updateContact: (id: string, input: ContactInput) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

export function useContacts(repository: IContactRepository): UseContactsReturn {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load contacts on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loaded = await repository.getAll();
        setContacts(loaded);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load contacts';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, [repository]);

  const addContact = useCallback(
    async (input: ContactInput) => {
      // Validate before adding
      const validation = validateContact(input);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      try {
        setError(null);

        // Create new contact using the core factory
        const contact = createContact(input);

        await repository.save(contact);
        setContacts((prev) => [...prev, contact]);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add contact';
        setError(message);
      }
    },
    [repository]
  );

  const updateContact = useCallback(
    async (id: string, input: ContactInput) => {
      // Validate before updating
      const validation = validateContact(input);
      if (!validation.valid) {
        setError(validation.errors[0]);
        return;
      }

      try {
        setError(null);
        const contact = contacts.find((c) => c.id === id);

        if (!contact) {
          setError('Contact not found');
          return;
        }

        const updated: Contact = {
          ...contact,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          tags: input.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0),
          updatedAt: new Date().toISOString(),
        };

        await repository.save(updated);
        setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update contact';
        setError(message);
      }
    },
    [contacts, repository]
  );

  const deleteContact = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await repository.delete(id);
        setContacts((prev) => prev.filter((c) => c.id !== id));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete contact';
        setError(message);
      }
    },
    [repository]
  );

  return {
    contacts,
    isLoading,
    error,
    addContact,
    updateContact,
    deleteContact,
  };
}
