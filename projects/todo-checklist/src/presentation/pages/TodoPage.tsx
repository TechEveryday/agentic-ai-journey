import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTodos } from '@/application';
import { LocalStorageTodoRepository } from '@/infrastructure';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';

const repository = new LocalStorageTodoRepository();

export function TodoPage() {
  const { todos, isLoading, error, addTodo, updateTodo, toggleTodo, deleteTodo } =
    useTodos(repository);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Todo Checklist
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TodoForm onAdd={addTodo} disabled={isLoading} />

      {isLoading && !todos.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TodoList
          todos={todos}
          onToggle={toggleTodo}
          onUpdate={updateTodo}
          onDelete={deleteTodo}
        />
      )}
    </Container>
  );
}
