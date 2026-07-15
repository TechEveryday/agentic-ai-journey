import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import type { Contact, ContactInput } from '@/core';

interface ContactItemProps {
  contact: Contact;
  onUpdate: (id: string, input: ContactInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string;
}

function toFormState(contact: Contact): FormState {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    tags: contact.tags.join(', '),
  };
}

function toContactInput(form: FormState): ContactInput {
  return {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    phone: form.phone,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };
}

export function ContactItem({ contact, onUpdate, onDelete }: ContactItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(toFormState(contact));
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEdit = async () => {
    setIsLoading(true);
    try {
      await onUpdate(contact.id, toContactInput(form));
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setForm(toFormState(contact));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(contact.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  if (isEditing) {
    return (
      <ListItem
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1,
          py: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="First name"
            inputProps={{ 'aria-label': 'Edit first name' }}
            value={form.firstName}
            onChange={handleChange('firstName')}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={isLoading}
          />
          <TextField
            fullWidth
            placeholder="Last name"
            inputProps={{ 'aria-label': 'Edit last name' }}
            value={form.lastName}
            onChange={handleChange('lastName')}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={isLoading}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Email"
            inputProps={{ 'aria-label': 'Edit email' }}
            value={form.email}
            onChange={handleChange('email')}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={isLoading}
          />
          <TextField
            fullWidth
            placeholder="Phone"
            inputProps={{ 'aria-label': 'Edit phone' }}
            value={form.phone}
            onChange={handleChange('phone')}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={isLoading}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Tags (comma separated)"
            inputProps={{ 'aria-label': 'Edit tags' }}
            value={form.tags}
            onChange={handleChange('tags')}
            onKeyDown={handleKeyDown}
            size="small"
            disabled={isLoading}
          />
          <IconButton
            size="small"
            onClick={handleSaveEdit}
            disabled={isLoading}
            color="primary"
            aria-label="Save contact"
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleCancelEdit}
            disabled={isLoading}
            aria-label="Cancel edit"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            edge="end"
            size="small"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            aria-label="Edit contact"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            edge="end"
            size="small"
            onClick={handleDelete}
            disabled={isLoading}
            color="error"
            aria-label="Delete contact"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      }
      disablePadding
    >
      <ListItemText
        primary={`${contact.firstName} ${contact.lastName}`}
        secondary={
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {(contact.email || contact.phone) && (
              <Typography variant="body2" color="text.secondary" component="span">
                {[contact.email, contact.phone].filter(Boolean).join(' · ')}
              </Typography>
            )}
            {contact.tags.length > 0 && (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {contact.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
            )}
          </Stack>
        }
        secondaryTypographyProps={{ component: 'div' }}
        sx={{ pr: 8 }}
      />
    </ListItem>
  );
}
