import { List, ListItem, ListItemText, IconButton, Chip } from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Participant } from '@/core';
import { EmptyState } from './EmptyState';

interface ParticipantListProps {
  participants: Participant[];
  onRemove: (id: string) => void;
}

export function ParticipantList({ participants, onRemove }: ParticipantListProps) {
  if (participants.length === 0) {
    return <EmptyState />;
  }

  return (
    <List>
      {participants.map((participant, index) => (
        <ListItem
          key={participant.id}
          secondaryAction={
            <IconButton
              edge="end"
              size="small"
              onClick={() => onRemove(participant.id)}
              color="error"
              aria-label={`Remove ${participant.name}`}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          }
        >
          <Chip label={index + 1} size="small" sx={{ mr: 2 }} />
          <ListItemText primary={participant.name} />
        </ListItem>
      ))}
    </List>
  );
}
