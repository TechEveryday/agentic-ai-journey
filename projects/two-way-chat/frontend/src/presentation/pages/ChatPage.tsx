import { useState } from 'react';
import { Container, Paper, Typography, Alert, Box } from '@mui/material';
import { useChat } from '@/application';
import { SignalRMessageTransport } from '@/infrastructure';
import { JoinDialog } from '../components/JoinDialog';
import { MessageList } from '../components/MessageList';
import { MessageComposer } from '../components/MessageComposer';

// Composition root: the transport is instantiated once at module scope so
// the same connection persists across re-renders of ChatPage.
const transport = new SignalRMessageTransport();

export function ChatPage() {
  const { messages, isConnected, error, join, send } = useChat(transport);
  const [displayName, setDisplayName] = useState('');

  const handleJoin = (roomId: string, name: string) => {
    setDisplayName(name);
    void join(roomId, name);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Two-Way Chat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <JoinDialog open={!isConnected} onJoin={handleJoin} />

      <Paper
        variant="outlined"
        sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <MessageList messages={messages} currentDisplayName={displayName} />
          <MessageComposer onSend={send} disabled={!isConnected} />
        </Box>
      </Paper>
    </Container>
  );
}
