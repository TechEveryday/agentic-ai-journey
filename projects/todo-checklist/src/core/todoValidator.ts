export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateTodoTitle(title: string): ValidationResult {
  const errors: string[] = [];

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    errors.push('Title cannot be empty');
  }

  if (trimmed.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateTodo(todo: {
  title?: string;
  status?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (todo.title !== undefined) {
    const titleResult = validateTodoTitle(todo.title);
    errors.push(...titleResult.errors);
  }

  if (todo.status !== undefined) {
    if (todo.status !== 'incomplete' && todo.status !== 'complete') {
      errors.push('Status must be "incomplete" or "complete"');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
