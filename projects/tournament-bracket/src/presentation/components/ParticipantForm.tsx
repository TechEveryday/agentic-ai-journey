import { useState } from 'react';
import { Box, Button, TextField, FormHelperText } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { validateParticipantName } from '@/core';

interface ParticipantFormProps {
  onAdd: (name: string) => void;
  disabled?: boolean;
}

export function ParticipantForm({ onAdd, disabled = false }: ParticipantFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateParticipantName(name);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    setError(null);
    onAdd(name.trim());
    setName('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setError(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
        <TextField
          fullWidth
          placeholder="Add a participant..."
          value={name}
          onChange={handleChange}
          disabled={disabled}
          error={!!error}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={disabled}
          aria-label="Add participant"
          sx={{ mt: 0.5 }}
        >
          <AddIcon />
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
