import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useContacts } from '@/application';
import { createContact } from '@/core';
import { MockContactRepository } from './MockContactRepository';

describe('useContacts hook', () => {
  let mockRepo: MockContactRepository;

  beforeEach(() => {
    mockRepo = new MockContactRepository();
  });

  it('should load contacts on mount', async () => {
    const contact1 = createContact({ firstName: 'Ada', lastName: 'Lovelace', email: 'a@x.com', phone: '', tags: [] });
    const contact2 = createContact({ firstName: 'Grace', lastName: 'Hopper', email: 'g@x.com', phone: '', tags: [] });

    await mockRepo.save(contact1);
    await mockRepo.save(contact2);

    const { result } = renderHook(() => useContacts(mockRepo));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.contacts).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contacts).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('should show an empty list when the repository is empty', async () => {
    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contacts).toEqual([]);
  });

  it('should add a new contact', async () => {
    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(result.current.contacts).toHaveLength(1);
    });

    expect(result.current.contacts[0].firstName).toBe('Ada');
  });

  it('should prevent adding an invalid contact', async () => {
    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addContact({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        tags: [],
      });
    });

    expect(result.current.contacts).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
  });

  it('should update a contact', async () => {
    const contact = createContact({ firstName: 'Ada', lastName: 'Lovelace', email: 'a@x.com', phone: '', tags: [] });
    await mockRepo.save(contact);

    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateContact(contact.id, {
        firstName: 'Ada',
        lastName: 'Byron',
        email: 'a@x.com',
        phone: '',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(result.current.contacts[0].lastName).toBe('Byron');
    });
  });

  it('should delete a contact', async () => {
    const contact1 = createContact({ firstName: 'Ada', lastName: 'Lovelace', email: 'a@x.com', phone: '', tags: [] });
    const contact2 = createContact({ firstName: 'Grace', lastName: 'Hopper', email: 'g@x.com', phone: '', tags: [] });

    await mockRepo.save(contact1);
    await mockRepo.save(contact2);

    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.contacts).toHaveLength(2);

    await act(async () => {
      await result.current.deleteContact(contact1.id);
    });

    await waitFor(() => {
      expect(result.current.contacts).toHaveLength(1);
    });

    expect(result.current.contacts[0].id).toBe(contact2.id);
  });

  it('should handle a full CRUD cycle', async () => {
    const { result } = renderHook(() => useContacts(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addContact({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        tags: [],
      });
    });

    await waitFor(() => {
      expect(result.current.contacts).toHaveLength(1);
    });

    const contactId = result.current.contacts[0].id;

    await act(async () => {
      await result.current.updateContact(contactId, {
        firstName: 'Ada',
        lastName: 'Byron',
        email: 'ada@example.com',
        phone: '',
        tags: ['friend'],
      });
    });

    await waitFor(() => {
      expect(result.current.contacts[0].lastName).toBe('Byron');
    });

    await act(async () => {
      await result.current.deleteContact(contactId);
    });

    await waitFor(() => {
      expect(result.current.contacts).toHaveLength(0);
    });
  });
});
