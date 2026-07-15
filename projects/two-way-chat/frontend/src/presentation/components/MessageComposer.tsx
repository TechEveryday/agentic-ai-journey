import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export interface MessageComposerProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled = false }: MessageComposerProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 1, p: 2, borderTop: 1, borderColor: 'divider' }}
    >
      <TextField
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        fullWidth
        size="small"
        autoComplete="off"
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={disabled || !text.trim()}
        aria-label="send message"
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
