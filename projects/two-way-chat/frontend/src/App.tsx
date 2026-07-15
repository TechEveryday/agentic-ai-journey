import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ChatPage } from '@/presentation/pages/ChatPage';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatPage />
    </ThemeProvider>
  );
}
