export enum TodoStatus {
  Incomplete = 'incomplete',
  Complete = 'complete',
}

export interface Todo {
  id: string;           // UUID v4
  title: string;        // Required, non-empty, max 200 chars
  status: TodoStatus;
  createdAt: string;    // ISO 8601 string
  updatedAt: string;    // ISO 8601 string
}

export function createTodo(title: string): Todo {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: title.trim(),
    status: TodoStatus.Incomplete,
    createdAt: now,
    updatedAt: now,
  };
}
