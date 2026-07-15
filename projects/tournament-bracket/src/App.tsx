import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BracketPage } from '@/presentation/pages/BracketPage';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BracketPage />
    </ThemeProvider>
  );
}
