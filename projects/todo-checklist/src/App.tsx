import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { TodoPage } from '@/presentation/pages/TodoPage';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TodoPage />
    </ThemeProvider>
  );
}
