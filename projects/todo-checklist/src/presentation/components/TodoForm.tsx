import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { validateTodoTitle } from '@/core';

interface TodoFormProps {
  onAdd: (title: string) => Promise<void>;
  disabled?: boolean;
}

export function TodoForm({ onAdd, disabled = false }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submitting
    const validation = validateTodoTitle(title);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      await onAdd(title);
      setTitle(''); // Clear on success
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add todo';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setError(null); // Clear error on input change
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          placeholder="Add a new todo..."
          value={title}
          onChange={handleChange}
          disabled={disabled || isSubmitting}
          error={!!error}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={disabled || isSubmitting}
          sx={{ mt: 0.5 }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} />
          ) : (
            <AddIcon />
          )}
        </Button>
      </Box>
      {error && (
        <FormHelperText error sx={{ mt: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}
