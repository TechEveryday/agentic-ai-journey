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
  Presentation (UI)              Infrastructure (I/O)
  ContactsPage, ContactForm,     LocalStorageContactRepository
  ContactList, ContactItem,
  SearchBar, EmptyState
        │       │                        │        │
        │       └──────────┐             │        │
        ▼                  ▼             ▼        │
  Application (State)  ─────────────────▶│        │
  useContacts,                           │        │
  IContactRepository  ◀───────────────────────────┘
        │                                (implements IContactRepository)
        ▼
  Core (Entities)
  Contact, createContact,
  validateContact, matchesQuery ◀───────────────────────┐
        ▲                                                │
        └────────────────────────────────────────────────┘
                    (Infrastructure also depends on Core
                     directly, for the Contact type)
```

**Key Rule**: Dependencies point **inward**, toward `Core`.

- `Core` has zero dependencies.
- `Application` depends on `Core` only.
- `Infrastructure` depends on `Core` (for the `Contact` type) **and** `Application` (it implements `IContactRepository`, which is defined in the application layer).
- `Presentation` depends on `Application` (the `useContacts` hook) **and** `Core` directly (it calls the pure `matchesQuery` predicate to derive search results, and validation types flow through the form). The composition root (`ContactsPage.tsx`) also imports `Infrastructure` to construct the concrete repository — this is the one intentional, controlled violation described below.

This differs from a naive "layers stacked top to bottom" diagram: `Infrastructure` is not "below" `Application` in the sense of `Application` depending on it. Instead, `Infrastructure` reaches *up* to `Application` only to implement its interface — the dependency arrow still points from `Infrastructure` to `Application`, not the reverse. `Application` never imports anything from `Infrastructure`.

### Core Layer (`src/core/`)

**Responsibility**: Business entities and rules. Zero external dependencies.

**Files**:
- `contact.ts` — `Contact` and `ContactInput` type definitions, `createContact()` factory
- `contactValidator.ts` — `validateContact()`, pure validation rules
- `contactSearch.ts` — `matchesQuery()`, pure search predicate

**Character**:
- Pure TypeScript, no React imports
- No I/O operations
- No external dependencies
- Fully testable in isolation

**Example**:
```typescript
// Core — no dependencies, pure logic
export function matchesQuery(contact: Contact, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (trimmed.length === 0) return true;
  const haystacks = [contact.firstName, contact.lastName, contact.email, contact.phone, ...contact.tags];
  return haystacks.some((field) => field.toLowerCase().includes(trimmed));
}
```

Why validation and search live here: they are reusable, deterministic rules that both the UI and (eventually) a backend can share. The canonical truth is in the domain, not scattered across components.

### Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: External I/O and dependencies. Implements interfaces defined in the Application layer.

**Files**:
- `LocalStorageContactRepository.ts` — reads/writes contacts to browser localStorage

**Character**:
- Implements `IContactRepository` (defined in Application)
- Single source of truth for localStorage access
- Handles serialization (JSON) and corruption gracefully
- No business logic, no search/filter logic

**Example**:
```typescript
// Infrastructure — handles I/O, implements interfaces
export class LocalStorageContactRepository implements IContactRepository {
  async getAll(): Promise<Contact[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to read contacts from localStorage:', error);
      return [];
    }
  }
}
```

**Why an interface?** In a future phase, `HttpContactRepository` could implement the same interface. The hook and components would not know the difference.

### Application Layer (`src/application/`)

**Responsibility**: State management and orchestration. Bridges Infrastructure and Presentation.

**Files**:
- `IContactRepository.ts` — interface contract for data access
- `useContacts.ts` — React hook that owns all contact state (CRUD operations)

**Character**:
- Defines `IContactRepository` (implemented by Infrastructure)
- `useContacts` coordinates CRUD operations
- Uses `validateContact` and `createContact` from Core
- **All repository methods are async** (even though localStorage is sync), so a backend can swap in later with zero interface changes

**Example**:
```typescript
// Application — orchestration, async by design
export function useContacts(repository: IContactRepository): UseContactsReturn {
  const addContact = useCallback(async (input: ContactInput) => {
    const validation = validateContact(input);      // 1. Validate (Core)
    if (!validation.valid) { setError(validation.errors[0]); return; }

    const contact = createContact(input);            // 2. Create entity (Core)
    await repository.save(contact);                  // 3. Persist (Infrastructure)
    setContacts((prev) => [...prev, contact]);        // 4. Update state (Presentation)
  }, [repository]);
  // ...
}
```

Note that `addContact` calls the Core factory `createContact()` rather than constructing the entity inline — the hook has exactly one place that knows how a `Contact` is built.

### Presentation Layer (`src/presentation/`)

**Responsibility**: React components and Material-UI styling. No business logic, no I/O.

**Files**:
- `components/` — reusable UI components
  - `ContactForm.tsx` — first/last name, email, phone, tags input + add button
  - `ContactItem.tsx` — individual contact row with inline edit/delete
  - `ContactList.tsx` — list of `ContactItem`s or `EmptyState`
  - `SearchBar.tsx` — search input
  - `EmptyState.tsx` — empty state message
- `pages/` — page-level composition
  - `ContactsPage.tsx` — wires up the repository, calls the hook, derives search results, renders components

**Character**:
- Uses Material-UI for styling (`sx` prop only, no CSS files)
- Calls the `useContacts` hook, never touches the repository directly (except at the composition root)
- Purely presentational components take props only — no internal data fetching

**Search stays in the page, not the repository**: `ContactsPage` filters `contacts` through the pure `matchesQuery()` predicate from Core. The repository's `getAll()` always returns every contact; search is a view concern, not a storage concern.

```typescript
// Presentation — pure React, calls the hook, filters with a Core predicate
export function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useContacts(repository);
  const [query, setQuery] = useState('');
  const filteredContacts = useMemo(
    () => contacts.filter((c) => matchesQuery(c, query)),
    [contacts, query]
  );

  return (
    <Container>
      <ContactForm onAdd={addContact} />
      <SearchBar value={query} onChange={setQuery} />
      <ContactList contacts={filteredContacts} onUpdate={updateContact} onDelete={deleteContact} />
    </Container>
  );
}
```

**One controlled violation**: `ContactsPage` instantiates `LocalStorageContactRepository` at **module scope** (outside the component function). This is the **Composition Root Pattern** — the single place in the app where concrete dependencies are wired together. Because the instance is created once at module load, `useContacts`'s `useEffect([repository])` never re-fires from a changing repository reference.

---

## Why Async Interface for Sync Storage?

`IContactRepository` uses `async`/`Promise` everywhere, even though `localStorage` is synchronous:

```typescript
export interface IContactRepository {
  getAll(): Promise<Contact[]>;
  getById(id: string): Promise<Contact | null>;
  save(contact: Contact): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Why?** A universal I/O contract. `LocalStorageContactRepository` wraps synchronous calls in `async` methods today; a future `HttpContactRepository` would perform real `fetch` calls behind the exact same signatures. Neither `useContacts` nor any component would need to change.

---

## Validation as a Boundary

Validation sits in the Core layer, not in React components:

```
UserInput
    ↓
React Component (ContactForm)
    ↓ calls
Core (validateContact)  ← canonical validation rules
    ↓
Hook (useContacts.addContact)
    ↓
Repository (save)
```

**Why?** A single source of truth prevents client and (eventual) server validation from drifting, and it makes the rules testable without mounting a single React component.

---

## Testability

Each layer is independently testable:

### Testing Core (no dependencies)
```typescript
it('should require a non-empty first name', () => {
  const result = validateContact({ firstName: '', lastName: 'Lovelace', email: 'a@x.com', phone: '', tags: [] });
  expect(result.valid).toBe(false);
});
```

### Testing Infrastructure (against jsdom's localStorage)
```typescript
localStorage.clear();
const repo = new LocalStorageContactRepository();
await repo.save(contact);
const retrieved = await repo.getById(contact.id);
expect(retrieved).toEqual(contact);
```

### Testing Application (hook + mock repository)
```typescript
const mockRepo = new MockContactRepository();
const { result } = renderHook(() => useContacts(mockRepo));
await result.current.addContact(input);
expect(result.current.contacts).toHaveLength(1);
```

### Testing Presentation (components + mocked handlers)
```typescript
const onAdd = vi.fn();
render(<ContactForm onAdd={onAdd} />);
await user.type(screen.getByPlaceholderText('First name'), 'Ada');
await user.click(screen.getByRole('button', { name: 'Add contact' }));
expect(onAdd).toHaveBeenCalled();
```

---

## Design Patterns Applied

1. **Repository Pattern** (`IContactRepository`) — abstracts data access, allows swapping implementations
2. **Custom Hook Pattern** (`useContacts`) — encapsulates stateful logic, reusable across components
3. **Composition Root Pattern** (`ContactsPage`) — single place to wire dependencies
4. **Interface Segregation** (`IContactRepository`) — depend on what you need, not on concrete implementations
5. **Pure Predicate for Search** (`matchesQuery`) — filtering logic is a testable function, not embedded UI state logic
6. **Validation as Boundary** (Core validators) — business rules live where they're enforceable

---

## Avoiding Common Pitfalls

### Bad: Business logic in components
```typescript
// Don't do this
function ContactForm() {
  const handleSubmit = () => {
    if (firstName.trim().length === 0) {  // business logic in component
      setError('Empty');
    }
  };
}
```

### Good: Business logic in Core
```typescript
import { validateContact } from '@/core';

function ContactForm() {
  const handleSubmit = () => {
    const result = validateContact(input);  // business logic in core
    if (!result.valid) setError(result.errors[0]);
  };
}
```

### Bad: Search logic in the repository
```typescript
// Don't do this — search is a view concern, not storage
class LocalStorageContactRepository {
  async search(query: string) { /* ... */ }
}
```

### Good: Search derived in the page from a pure predicate
```typescript
const filtered = contacts.filter((c) => matchesQuery(c, query));
```

---

## Summary

Clean Architecture creates a codebase where:

- **Core is stable**: business rules rarely change
- **Infrastructure is swappable**: swap storage, API clients, libraries
- **Presentation is simple**: components are dumb, hooks are smart
- **Testing is easy**: each layer tests independently

The inward dependency rule is the cornerstone: outer layers depend on inner layers, never the reverse.
