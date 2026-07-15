import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  TextField,
  Box,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import type { Todo } from '@/core';
import { TodoStatus } from '@/core';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onUpdate: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editTitle.trim() === todo.title) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(todo.id, editTitle);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(todo.id);
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

  if (isEditing) {
    return (
      <ListItem
        sx={{
          display: 'flex',
          gap: 1,
          py: 1,
        }}
      >
        <TextField
          autoFocus
          fullWidth
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          disabled={isLoading}
        />
        <IconButton
          size="small"
          onClick={handleSaveEdit}
          disabled={isLoading}
          color="primary"
          aria-label="Save todo"
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
            aria-label="Edit todo"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            edge="end"
            size="small"
            onClick={handleDelete}
            disabled={isLoading}
            color="error"
            aria-label="Delete todo"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      }
      disablePadding
    >
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={todo.status === TodoStatus.Complete}
          onChange={handleToggle}
          disabled={isLoading}
          tabIndex={-1}
          disableRipple
        />
      </ListItemIcon>
      <ListItemText
        primary={todo.title}
        sx={{
          textDecoration:
            todo.status === TodoStatus.Complete
              ? 'line-through'
              : 'none',
          opacity: todo.status === TodoStatus.Complete ? 0.6 : 1,
        }}
      />
    </ListItem>
  );
}
