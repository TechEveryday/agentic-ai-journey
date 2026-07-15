import { List } from '@mui/material';
import type { Contact, ContactInput } from '@/core';
import { ContactItem } from './ContactItem';
import { EmptyState } from './EmptyState';

interface ContactListProps {
  contacts: Contact[];
  onUpdate: (id: string, input: ContactInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ContactList({ contacts, onUpdate, onDelete }: ContactListProps) {
  if (contacts.length === 0) {
    return <EmptyState />;
  }

  return (
    <List>
      {contacts.map((contact) => (
        <ContactItem
          key={contact.id}
          contact={contact}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
}
