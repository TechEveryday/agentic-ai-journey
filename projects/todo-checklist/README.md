# Todo Checklist

A progressive todo application that starts simple and scales cleanly through three architectural phases.

## Overview

This is a single-user todo app with create, edit, delete, and complete functionality. Data persists in browser localStorage. No backend or authentication required for Phase 1. The architecture is designed so that upgrading to a backend (Phase 2) or multi-user with auth (Phase 3) requires minimal changes.

## Tech Stack

### Phase 1 (Current)
- **Frontend**: React 18 + TypeScript
- **UI Library**: Material-UI v5
- **Build Tool**: Vite 5
- **Persistence**: Browser localStorage
- **State Management**: React hooks
- **Testing**: Vitest + React Testing Library (unit/integration) + Playwright (E2E)

### Phase 2 (Planned)
- **Frontend**: React 18 (unchanged)
- **Backend**: C# .NET 8 Web API with Clean Architecture
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Deployment**: Fly.io (Docker)

### Phase 3 (Planned)
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: React 18 + Auth Context
- **Backend**: .NET API with JWT middleware
- **Database**: PostgreSQL with UserId associations

## Getting Started

### Prerequisites
- Node.js 18+ (for development)
- npm 8+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# http://localhost:5173
```

### Testing
```bash
# Unit and integration tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests (requires dev server running)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Architecture

This project follows **Clean Architecture** with strict layering:

```
┌─────────────────────────────────────────┐
│       PRESENTATION LAYER                │
│  (React Components, Material-UI)        │
│  - TodoPage                             │
│  - TodoForm, TodoItem, TodoList         │
├─────────────────────────────────────────┤
│       APPLICATION LAYER                 │
│  (Business Rules, State Management)     │
│  - useTodos hook                        │
│  - ITodoRepository interface            │
├─────────────────────────────────────────┤
│       INFRASTRUCTURE LAYER               │
│  (External Dependencies, I/O)           │
│  - LocalStorageTodoRepository           │
├─────────────────────────────────────────┤
│         CORE LAYER                      │
│  (Pure Business Logic, Entities)        │
│  - Todo type & TodoStatus enum          │
│  - Validation functions                 │
└─────────────────────────────────────────┘
```

**Dependency Rule**: Outer layers depend on inner layers. **Inner layers have no knowledge of outer layers**.

### Why This Matters

1. **Testability**: Each layer can be tested in isolation
2. **Reusability**: Core logic can be used by web, mobile, or backend
3. **Flexibility**: Infrastructure can be swapped (localStorage → HTTP → database) without touching business logic
4. **Clarity**: Clear separation of concerns makes the codebase easier to navigate

### Key Design Decisions

#### ITodoRepository Interface
The `ITodoRepository` interface is the contract between application logic and storage. All methods are `async`, even though localStorage is synchronous. This is intentional:

```typescript
export interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  save(todo: Todo): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Why async for localStorage?** In Phase 2, we'll swap `LocalStorageTodoRepository` for `HttpTodoRepository`. HTTP calls are async. By making the interface async now, the hook never changes—it's a zero-refactor upgrade.

#### Validation in Core
Validation logic lives in `src/core/todoValidator.ts`, not in React components. This means:

- The C# backend in Phase 2 can apply the same validation rules
- Validation is testable without mounting React components
- If validation rules change, one place to update

#### Composition Root Pattern
`TodoPage.tsx` is the single place that knows about `LocalStorageTodoRepository`:

```typescript
const repository = new LocalStorageTodoRepository();
const { todos, addTodo, ... } = useTodos(repository);
```

In Phase 2, this becomes:
```typescript
const repository = new HttpTodoRepository(process.env.VITE_API_BASE_URL);
```

This controlled violation of layering is called the **Composition Root Pattern**—it's the one place in the app where you wire things together.

## File Structure

```
src/
├── core/                      # Business logic, 0 dependencies
│   ├── todo.ts               # Type definitions, creation logic
│   ├── todoValidator.ts      # Pure validation functions
│   └── index.ts              # Barrel export
│
├── application/              # Business rules, state management
│   ├── ITodoRepository.ts    # Repository interface contract
│   ├── useTodos.ts           # React hook (all CRUD state)
│   └── index.ts              # Barrel export
│
├── infrastructure/           # External dependencies
│   ├── LocalStorageTodoRepository.ts
│   └── index.ts
│
└── presentation/             # React components, Material-UI
    ├── components/
    │   ├── EmptyState.tsx
    │   ├── TodoForm.tsx
    │   ├── TodoItem.tsx
    │   └── TodoList.tsx
    └── pages/
        └── TodoPage.tsx

tests/
├── setup.ts                  # Vitest + RTL setup
├── unit/                     # Pure logic tests
│   ├── core/
│   │   ├── todo.test.ts
│   │   └── todoValidator.test.ts
│   └── infrastructure/
│       └── LocalStorageTodoRepository.test.ts
├── integration/              # Component + hook tests
│   ├── MockTodoRepository.ts # For testing without localStorage
│   ├── TodoForm.test.tsx
│   ├── TodoItem.test.tsx
│   ├── TodoList.test.tsx
│   └── TodoPage.test.tsx
└── e2e/                      # Playwright browser tests
    ├── playwright.config.ts
    ├── create-todo.spec.ts
    ├── complete-todo.spec.ts
    └── delete-todo.spec.ts
```

## Test Coverage

| Layer | Type | Coverage | Key Tests |
|-------|------|----------|-----------|
| core/ | Unit | >80% | Empty string, 200/201 char limits, type shape |
| infrastructure/ | Unit | >80% | CRUD, persistence, corrupt JSON handling |
| components | Integration | >80% | User interactions, validation errors, state updates |
| App flow | Integration | >80% | Loading, error states, full CRUD cycle |
| Browser | E2E | Critical paths | Create → reload, complete → reload, delete → reload |

## Docker

### Local Development with Docker
```bash
docker-compose up
# Hot reload at http://localhost:5173
```

### Production Build
```bash
docker build -t todo-checklist .
docker run -p 80:80 todo-checklist
```

The `Dockerfile` uses a multi-stage build:
1. **Build stage**: Node 20 Alpine, runs `npm run build`
2. **Serve stage**: Nginx Alpine, serves static assets with SPA routing

## Phase 2: React + C# .NET API + Postgres

### What Changes
- Add `HttpTodoRepository` implementing `ITodoRepository` (calls API endpoints)
- Wire up `HttpTodoRepository` instead of `LocalStorageTodoRepository` in `TodoPage.tsx`
- New env var: `VITE_API_BASE_URL=http://localhost:5000`

### What Doesn't Change
- `src/core/` — No changes
- `src/application/` — No changes to `useTodos` hook
- `src/presentation/` — No changes to components
- Tests — Integration tests still work with `MockTodoRepository`

### Backend (C# .NET 8)

Structure follows Clean Architecture:
```
backend/
├── TodoChecklist.Api/           # Web API, controllers, middleware
├── TodoChecklist.Application/   # Use cases, interfaces
├── TodoChecklist.Domain/        # Entities, business rules
└── TodoChecklist.Infrastructure/ # Database, EF Core
```

**Endpoints**:
```
GET    /api/todos              # Get all todos for current user
GET    /api/todos/{id}         # Get todo by ID
POST   /api/todos              # Create new todo
PUT    /api/todos/{id}         # Update todo
DELETE /api/todos/{id}         # Delete todo
```

**Database Schema**:
```sql
CREATE TABLE Todos (
  Id UUID PRIMARY KEY,
  UserId UUID NOT NULL,
  Title VARCHAR(200) NOT NULL,
  Status VARCHAR(50) NOT NULL,
  CreatedAt TIMESTAMP NOT NULL,
  UpdatedAt TIMESTAMP NOT NULL,
  FOREIGN KEY (UserId) REFERENCES Users(Id)
);
```

See `docs/future-phases.md` for detailed design.

## Phase 3: Multi-User with JWT Auth

### What Changes
- Add JWT authentication middleware to .NET API
- Add `AuthContext` to React app
- Todos filtered by `UserId` in backend

### What Doesn't Change
- Core validation logic
- `ITodoRepository` interface
- Component structure (Auth Context wraps everything)

See `docs/future-phases.md` for detailed design.

## Lessons Learned

This project embodies lessons from `agentic-ai-journey`:

1. **AI as Pair Programmer**: Built incrementally with tests validating each layer
2. **Tests First**: Every change has tests before moving forward
3. **Clean Architecture**: Layers are enforced via TypeScript imports and interfaces
4. **Documented Futures**: Phases 2 and 3 are designed before Phase 1 ships

## Future Enhancements

- [ ] Drag-and-drop to reorder todos
- [ ] Duedate reminders
- [ ] Recurring todos
- [ ] Labels / categories
- [ ] Dark mode
- [ ] Offline sync (with Service Workers)
- [ ] Mobile app (React Native)

## Performance Considerations

- **localStorage limit**: ~5-10MB depending on browser. With JSON serialization, this supports ~10,000 todos comfortably
- **No pagination needed** for Phase 1 (all todos loaded on mount)
- **In Phase 2**, implement pagination via API endpoint: `GET /api/todos?skip=0&take=50`

## Deployment

### Local
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t todo-checklist:1.0.0 .
docker push <your-registry>/todo-checklist:1.0.0
```

### Fly.io (Coming in Phase 2)
```bash
flyctl auth login
flyctl launch
flyctl deploy
```

## Contributing

When adding features:

1. Start with a test in the appropriate layer
2. Implement the feature
3. Ensure no layer imports from outer layers
4. Update docs if architecture changes
5. Run full test suite: `npm run test && npm run test:coverage && npm run test:e2e`

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Material-UI](https://mui.com/)

## License

MIT
