import { useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { matchesQuery } from '@/core';
import { useContacts } from '@/application';
import { LocalStorageContactRepository } from '@/infrastructure';
import { ContactForm } from '../components/ContactForm';
import { ContactList } from '../components/ContactList';
import { SearchBar } from '../components/SearchBar';

const repository = new LocalStorageContactRepository();

export function ContactsPage() {
  const { contacts, isLoading, error, addContact, updateContact, deleteContact } =
    useContacts(repository);
  const [query, setQuery] = useState('');

  // Search filtering is derived here using the pure core predicate —
  // the repository stays unaware of search concerns.
  const filteredContacts = useMemo(
    () => contacts.filter((contact) => matchesQuery(contact, query)),
    [contacts, query]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Contacts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <ContactForm onAdd={addContact} disabled={isLoading} />

      <SearchBar value={query} onChange={setQuery} />

      {isLoading && !contacts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ContactList
          contacts={filteredContacts}
          onUpdate={updateContact}
          onDelete={deleteContact}
        />
      )}
    </Container>
  );
}
