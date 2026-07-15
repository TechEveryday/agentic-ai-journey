import { Box, Paper, Typography } from '@mui/material';
import type { Message } from '@/core';

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.sentAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          px: 1.5,
          py: 1,
          maxWidth: '75%',
          bgcolor: isOwn ? 'primary.main' : 'grey.200',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
        }}
      >
        {!isOwn && (
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
            {message.senderName}
          </Typography>
        )}
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.text}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'right', opacity: 0.7, mt: 0.5 }}
        >
          {time}
        </Typography>
      </Paper>
    </Box>
  );
}
