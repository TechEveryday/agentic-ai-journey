import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';

export interface JoinDialogProps {
  open: boolean;
  onJoin: (roomId: string, displayName: string) => void;
}

export function JoinDialog({ open, onJoin }: JoinDialogProps) {
  const [roomId, setRoomId] = useState('general');
  const [displayName, setDisplayName] = useState('');

  const canJoin = roomId.trim().length > 0 && displayName.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canJoin) return;
    onJoin(roomId.trim(), displayName.trim());
  };

  return (
    <Dialog open={open} maxWidth="xs" fullWidth disableEscapeKeyDown>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Join a chat room</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Room"
              placeholder="Room name"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              autoFocus
              fullWidth
            />
            <TextField
              label="Display name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="submit" variant="contained" disabled={!canJoin}>
            Join
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
