import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  FormHelperText,
  Stack,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { validateContact } from '@/core';
import type { ContactInput } from '@/core';

interface ContactFormProps {
  onAdd: (input: ContactInput) => Promise<void>;
  disabled?: boolean;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string;
}

const EMPTY_FORM: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  tags: '',
};

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

export function ContactForm({ onAdd, disabled = false }: ContactFormProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const input = toContactInput(form);

    // Validate before submitting
    const validation = validateContact(input);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onAdd(input);
      setForm(EMPTY_FORM); // Clear on success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add contact';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError(null); // Clear error on input change
    };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange('firstName')}
            disabled={disabled || isSubmitting}
            error={!!error}
            size="small"
          />
          <TextField
            fullWidth
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange('lastName')}
            disabled={disabled || isSubmitting}
            error={!!error}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Email"
            value={form.email}
            onChange={handleChange('email')}
            disabled={disabled || isSubmitting}
            error={!!error}
            size="small"
          />
          <TextField
            fullWidth
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange('phone')}
            disabled={disabled || isSubmitting}
            error={!!error}
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={handleChange('tags')}
            disabled={disabled || isSubmitting}
            size="small"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting}
            aria-label="Add contact"
            sx={{ mt: 0.5 }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : <AddIcon />}
          </Button>
        </Box>
      </Stack>
      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
