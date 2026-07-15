import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import type { Message } from '@/core';
import { MessageBubble } from './MessageBubble';

export interface MessageListProps {
  messages: Message[];
  currentDisplayName: string;
}

export function MessageList({ messages, currentDisplayName }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No messages yet. Say hello!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1 }}>
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.senderName === currentDisplayName}
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}
