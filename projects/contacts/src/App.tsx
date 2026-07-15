import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ContactsPage } from '@/presentation/pages/ContactsPage';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ContactsPage />
    </ThemeProvider>
  );
}
