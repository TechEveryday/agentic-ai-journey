# Architecture

## Clean Architecture in This Project

This project implements **Clean Architecture** as described in Robert C. Martin's "Clean Architecture" book. The goal is to create a codebase that is:

- **Independent of frameworks**: We could swap React for Vue; swap localStorage for a database
- **Testable**: Business logic has zero dependencies on UI or I/O
- **Independent of UI**: The business rules don't know if they're called from a CLI, web app, or API
- **Independent of databases**: The business rules don't know if data comes from localStorage, PostgreSQL, or MongoDB
- **Independent of any external agency**: Business rules are isolated

## Layering

### Dependency Graph

```
┌─────────────────────────────────┐
│     Presentation (UI)           │
│  TodoPage, TodoForm, TodoItem   │
└──────────────┬──────────────────┘
               │ depends on
               ▼
┌─────────────────────────────────┐
│     Application (State)         │
│   useTodos, ITodoRepository     │
└──────────────┬──────────────────┘
               │ depends on
               ▼
┌─────────────────────────────────┐
│   Infrastructure (I/O)          │
│ LocalStorageTodoRepository      │
└──────────────┬──────────────────┘
               │ implements interface from
               ▼
┌─────────────────────────────────┐
│        Core (Entities)          │
│  Todo, TodoStatus, Validators   │
└─────────────────────────────────┘
```

**Key Rule**: Dependencies point **inward**. `Core` has no dependencies. `Infrastructure` depends on `Core`. `Application` depends on `Core` and `Infrastructure`. `Presentation` depends on everything below it.

### Core Layer (`src/core/`)

**Responsibility**: Business entities and rules. Zero external dependencies.

**Files**:
- `todo.ts` — `Todo` type definition, `TodoStatus` enum, `createTodo()` helper
- `todoValidator.ts` — Pure validation functions (`validateTodoTitle()`, `validateTodo()`)

**Character**:
- Pure TypeScript, no React imports
- No I/O operations
- No external dependencies
- Fully testable in isolation

**Example**:
```typescript
// Core — no dependencies, pure logic
export function validateTodoTitle(title: string): ValidationResult {
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    return { valid: false, errors: ['Title cannot be empty'] };
  }
  return { valid: true, errors: [] };
}
```

Why validation is here: If we add a C# backend in Phase 2, it will also call `validateTodoTitle()` (or its C# equivalent) with the same rules. The canonical truth is here, in the domain.

### Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: External I/O and dependencies. Implements interfaces defined in Application layer.

**Files**:
- `LocalStorageTodoRepository.ts` — Reads/writes todos to browser localStorage

**Character**:
- Implements `ITodoRepository` interface (from Application)
- Single source of truth for localStorage access
- Handles serialization (JSON) and corruption gracefully
- No business logic

**Example**:
```typescript
// Infrastructure — handles I/O, implements interfaces
export class LocalStorageTodoRepository implements ITodoRepository {
  async getAll(): Promise<Todo[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      // Gracefully handle corrupted localStorage
      console.error('Failed to read from localStorage:', error);
      return [];
    }
  }
}
```

**Why an interface?** In Phase 2, we'll create `HttpTodoRepository` implementing the same interface. The hook won't know the difference.

### Application Layer (`src/application/`)

**Responsibility**: State management and orchestration of the business rules. Bridges Infrastructure and Presentation.

**Files**:
- `ITodoRepository.ts` — Interface contract for data access
- `useTodos.ts` — React hook that owns all todo state (CRUD operations)

**Character**:
- Defines `ITodoRepository` interface (implemented by Infrastructure)
- `useTodos` hook coordinates CRUD operations
- Uses validation from Core
- **All methods are async** (even though localStorage is sync) to support Phase 2 HTTP calls

**Example**:
```typescript
// Application — orchestration, async by design
export function useTodos(repository: ITodoRepository): UseTodosReturn {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = useCallback(async (title: string) => {
    // 1. Validate (Core)
    const validation = validateTodoTitle(title);
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }

    // 2. Create entity (Core)
    const todo = { id: crypto.randomUUID(), title, status: 'incomplete', ... };

    // 3. Persist (Infrastructure)
    await repository.save(todo);

    // 4. Update state (Presentation)
    setTodos(prev => [...prev, todo]);
  }, [repository]);

  return { todos, addTodo, ... };
}
```

Notice the pattern:
1. **Validate** using Core rules
2. **Create** an entity using Core logic
3. **Persist** by calling the repository (Infrastructure)
4. **Update state** for the UI (Presentation)

### Presentation Layer (`src/presentation/`)

**Responsibility**: React components and Material-UI styling. No business logic.

**Files**:
- `components/` — Reusable UI components
  - `TodoForm.tsx` — Input + add button
  - `TodoItem.tsx` — Individual todo row with edit/delete/complete
  - `TodoList.tsx` — List of TodoItems or EmptyState
  - `EmptyState.tsx` — Empty state message
- `pages/` — Page-level composition
  - `TodoPage.tsx` — Wires up repository, calls hook, renders components

**Character**:
- Uses Material-UI for styling
- Calls React hooks, never directly calls repository
- Purely presentational logic
- No decisions about where data comes from

**Example**:
```typescript
// Presentation — pure React, calls hooks, no business logic
export function TodoPage() {
  const repository = new LocalStorageTodoRepository();
  const { todos, addTodo, deleteTodo } = useTodos(repository);

  return (
    <Container>
      <TodoForm onAdd={addTodo} />
      <TodoList todos={todos} onDelete={deleteTodo} />
    </Container>
  );
}
```

**One controlled violation**: `TodoPage` knows about `LocalStorageTodoRepository`. This is the **Composition Root** — the single place where you wire dependencies. In Phase 2, you change one line:
```typescript
// Phase 2
const repository = new HttpTodoRepository(process.env.VITE_API_BASE_URL);
```

---

## Why Async Interface for Sync Storage?

The `ITodoRepository` interface uses `async`/`Promise` everywhere, even though `localStorage` is synchronous:

```typescript
export interface ITodoRepository {
  async getAll(): Promise<Todo[]>;  // ← returns Promise
  async save(todo: Todo): Promise<void>;
}
```

**Why?** Universal I/O contract.

In Phase 1, `LocalStorageTodoRepository`:
```typescript
async getAll(): Promise<Todo[]> {
  const data = localStorage.getItem(STORAGE_KEY);  // sync
  return Promise.resolve(JSON.parse(data));        // wrap in Promise
}
```

In Phase 2, `HttpTodoRepository`:
```typescript
async getAll(): Promise<Todo[]> {
  const response = await fetch('/api/todos');  // actually async
  return response.json();
}
```

**Same interface, completely different implementations.** The hook doesn't care. The components don't care. Zero changes needed.

This is the power of the Interface Segregation Principle: depend on interfaces, not implementations.

---

## Validation as a Boundary

Validation sits in the Core layer, not in React components:

```
UserInput
    ↓
React Component (TodoForm)
    ↓ calls
Core (validateTodoTitle)  ← Canonical validation rules
    ↓
Hook (useTodos.addTodo)
    ↓
Repository (save)
```

**Why?** In Phase 2, the C# backend will apply the same rules server-side:

```csharp
// C# backend — same rules as Core
public class TodoValidator {
    public static ValidationResult ValidateTodoTitle(string title) {
        var trimmed = title.Trim();
        if (trimmed.Length == 0) {
            return new ValidationResult { 
                Valid = false, 
                Errors = new[] { "Title cannot be empty" } 
            };
        }
        return new ValidationResult { Valid = true, Errors = Array.Empty<string>() };
    }
}
```

Single source of truth prevents client and server validation from drifting.

---

## Testability

Each layer is independently testable:

### Testing Core (No dependencies)
```typescript
// Pure function, pure test
it('should reject empty title', () => {
  const result = validateTodoTitle('');
  expect(result.valid).toBe(false);
});
```

### Testing Infrastructure (Against localStorage mock)
```typescript
// jsdom provides window.localStorage automatically
localStorage.clear();
const repo = new LocalStorageTodoRepository();
await repo.save(todo);
const retrieved = await repo.getById(todo.id);
expect(retrieved).toEqual(todo);
```

### Testing Application (Hook + Mock Repository)
```typescript
// Mock repository in memory, test hook logic
const mockRepo = new MockTodoRepository();
const { result } = renderHook(() => useTodos(mockRepo));

await result.current.addTodo('Test');
expect(result.current.todos).toHaveLength(1);
```

### Testing Presentation (Components + Mocked handlers)
```typescript
// Mock callbacks, test component rendering
const onAdd = vi.fn();
render(<TodoForm onAdd={onAdd} />);

await user.type(input, 'Test');
await user.click(button);

expect(onAdd).toHaveBeenCalledWith('Test');
```

---

## Phase 2: Swapping Infrastructure

When we add a C# backend:

1. Create `src/infrastructure/HttpTodoRepository.ts` implementing `ITodoRepository`
2. Update `src/presentation/pages/TodoPage.tsx`:
   ```typescript
   - const repository = new LocalStorageTodoRepository();
   + const repository = new HttpTodoRepository(process.env.VITE_API_BASE_URL);
   ```
3. That's it. Everything else works as-is.

The hook, components, validation — all untouched. The entire frontend continues to work because we depended on interfaces, not implementations.

---

## Phase 3: Adding Multi-User Auth

When we add JWT auth:

1. Wrap app in `AuthContext` providing `userId`
2. Modify `TodoPage` to pass `userId` to repository:
   ```typescript
   const { userId } = useAuth();
   const repository = new HttpTodoRepository(url, userId);
   ```
3. Modify `HttpTodoRepository.getAll()` to send `userId` to backend:
   ```typescript
   async getAll(): Promise<Todo[]> {
     const response = await fetch(`/api/todos?userId=${this.userId}`);
     return response.json();
   }
   ```
4. Backend filters by `userId` in database queries

Again: Core validation, Hook interface, Component structure — all unchanged.

---

## Design Patterns Applied

1. **Repository Pattern** (`ITodoRepository`)
   - Abstracts data access
   - Allows swapping implementations (localStorage → HTTP → database)

2. **Custom Hook Pattern** (`useTodos`)
   - Encapsulates stateful logic
   - Reusable across components

3. **Composition Root Pattern** (`TodoPage`)
   - Single place to wire dependencies
   - Clear DI mechanism

4. **Interface Segregation** (`ITodoRepository`)
   - Depend on what you need, not on concrete implementations
   - Makes swapping implementations zero-friction

5. **Validation as Boundary** (Core validators)
   - Business rules live where they're enforceable
   - Client and server can share validation logic

---

## Avoiding Common Pitfalls

### ❌ Bad: Business Logic in Components
```typescript
// ❌ DON'T do this
function TodoForm() {
  const handleSubmit = (title) => {
    if (title.trim().length === 0) {  // ← Business logic in component
      setError('Empty');
      return;
    }
    // ...
  };
}
```

### ✅ Good: Business Logic in Core
```typescript
// ✅ DO this
import { validateTodoTitle } from '@/core';

function TodoForm() {
  const handleSubmit = (title) => {
    const result = validateTodoTitle(title);  // ← Business logic in core
    if (!result.valid) {
      setError(result.errors[0]);
      return;
    }
    // ...
  };
}
```

### ❌ Bad: Component Directly Touching Storage
```typescript
// ❌ DON'T do this
function TodoList() {
  useEffect(() => {
    const data = localStorage.getItem('todos');  // ← I/O in component
    setTodos(JSON.parse(data));
  }, []);
}
```

### ✅ Good: Hook Abstracts Storage
```typescript
// ✅ DO this
function TodoList() {
  const { todos } = useTodos(repository);  // ← Hook abstracts I/O
}
```

---

## Summary

Clean Architecture creates a codebase where:

- **Core is stable**: Business rules rarely change
- **Infrastructure is swappable**: Swap storage, API clients, libraries
- **Presentation is simple**: Components are dumb, hooks are smart
- **Testing is easy**: Each layer tests independently
- **Future is flexible**: Phase 2 and 3 require minimal changes

The inward dependency rule is the cornerstone: outer layers depend on inner layers, never the reverse. This makes the system testable, maintainable, and ready for change.
