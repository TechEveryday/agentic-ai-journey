# Contacts

A single-user contacts manager: create, search, edit, and delete contacts. Data persists in browser localStorage. No backend or authentication required for Phase 1. The architecture is designed so that upgrading to a backend (Phase 2) requires minimal changes.

## Overview

Each contact has a first name, last name, email, phone, and free-form tags. At least one of email or phone is required. Search filters across name, email, phone, and tags, case-insensitively.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **UI Library**: Material-UI v5
- **Build Tool**: Vite 5
- **Persistence**: Browser localStorage
- **State Management**: React hooks
- **Testing**: Vitest + React Testing Library (unit/integration) + Playwright (E2E)

## Getting Started

### Prerequisites
- Node.js 20.11.0+ (see `.nvmrc`)
- npm 10+

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

# Lint
npm run lint

# E2E tests (starts the dev server automatically)
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
│  - ContactsPage                         │
│  - ContactForm, ContactList,            │
│    ContactItem, SearchBar, EmptyState   │
├─────────────────────────────────────────┤
│       APPLICATION LAYER                 │
│  (Business Rules, State Management)     │
│  - useContacts hook                     │
│  - IContactRepository interface         │
├─────────────────────────────────────────┤
│       INFRASTRUCTURE LAYER              │
│  (External Dependencies, I/O)           │
│  - LocalStorageContactRepository        │
├─────────────────────────────────────────┤
│         CORE LAYER                      │
│  (Pure Business Logic, Entities)        │
│  - Contact type & ContactInput          │
│  - createContact, validateContact       │
│  - matchesQuery (search predicate)      │
└─────────────────────────────────────────┘
```

**Dependency Rule**: `Presentation → Application → Core`; `Infrastructure → Core + Application`. Core has zero dependencies. See `docs/architecture.md` for the full dependency graph and rationale.

### Key Design Decisions

#### IContactRepository Interface
All methods are `async`, even though localStorage is synchronous. In a future phase, an `HttpContactRepository` implementing the same interface is a zero-refactor swap — the hook and components never change.

#### Validation in Core
`validateContact` lives in `src/core/contactValidator.ts`, not in React components. Rules:
- First and last name are required, non-empty, max 100 characters
- At least one of email or phone is required
- Email must match a reasonable format when present, max 254 characters
- Phone must match a reasonable format when present, max 30 characters
- All inputs are trimmed before validation

#### Search as a Pure Predicate
`matchesQuery(contact, query)` lives in `src/core/contactSearch.ts`. It is case-insensitive, matches across first name, last name, full name, email, phone, and tags, and treats an empty/whitespace query as matching everything. `ContactsPage` derives the filtered list by calling this predicate — the repository itself has no notion of search.

#### Composition Root Pattern
`ContactsPage.tsx` instantiates `LocalStorageContactRepository` once, at module scope:

```typescript
const repository = new LocalStorageContactRepository();

export function ContactsPage() {
  const { contacts, addContact, ... } = useContacts(repository);
  // ...
}
```

This is the one place in the app that knows about the concrete repository implementation, and creating it at module scope (not inside the component) keeps the reference stable across re-renders so `useContacts`'s `useEffect([repository])` only fires once.

## File Structure

```
src/
├── core/                      # Business logic, 0 dependencies
│   ├── contact.ts             # Contact/ContactInput types, createContact()
│   ├── contactValidator.ts    # validateContact()
│   ├── contactSearch.ts       # matchesQuery()
│   └── index.ts                # Barrel export
│
├── application/               # Business rules, state management
│   ├── IContactRepository.ts  # Repository interface contract
│   ├── useContacts.ts         # React hook (all CRUD state)
│   └── index.ts                # Barrel export
│
├── infrastructure/            # External dependencies
│   ├── LocalStorageContactRepository.ts
│   └── index.ts
│
└── presentation/               # React components, Material-UI
    ├── components/
    │   ├── ContactForm.tsx
    │   ├── ContactItem.tsx
    │   ├── ContactList.tsx
    │   ├── SearchBar.tsx
    │   └── EmptyState.tsx
    └── pages/
        └── ContactsPage.tsx

tests/
├── setup.ts                   # Vitest + RTL setup
├── unit/                      # Pure logic tests
│   ├── core/
│   │   ├── contact.test.ts
│   │   ├── contactValidator.test.ts
│   │   └── contactSearch.test.ts
│   └── infrastructure/
│       └── LocalStorageContactRepository.test.ts
├── integration/                # Component + hook tests
│   ├── MockContactRepository.ts # For testing without localStorage
│   ├── ContactForm.test.tsx
│   ├── ContactItem.test.tsx
│   ├── ContactList.test.tsx
│   ├── useContacts.test.ts
│   └── ContactsPage.test.tsx
└── e2e/                        # Playwright browser tests
    ├── create-contact.spec.ts
    ├── search-contact.spec.ts
    ├── edit-contact.spec.ts
    └── delete-contact.spec.ts
```

Note: `playwright.config.ts` lives at the project root (not under `tests/e2e/`) so `npm run test:e2e`, run from the project root, resolves it correctly; it points `testDir` at `./tests/e2e`.

## Test Coverage

| Layer | Type | Key Tests |
|-------|------|-----------|
| core/ | Unit | Trimming, tag parsing, every validation rule + boundary (100/101, 254/255, 30/31 char limits), case-insensitive search across all fields |
| infrastructure/ | Unit | CRUD, persistence, corrupt JSON handling |
| components | Integration | Validation errors, rendering, edit/save/cancel, delete |
| hook | Integration | Load, add, update, delete, full CRUD cycle, invalid-input rejection |
| page | Integration | Search filtering, delete removing from the list, empty state |
| Browser | E2E | Create → reload, search, edit → reload, delete → reload |

Coverage thresholds (lines/functions/branches/statements) are enforced at 80% via `vitest`'s v8 provider — see `vite.config.ts`.

## Docker

### Local Development with Docker
```bash
docker-compose up
# Hot reload at http://localhost:5173
```

### Production Build
```bash
docker build -t contacts .
docker run -p 80:80 contacts
```

The `Dockerfile` uses a multi-stage build:
1. **Build stage**: Node 20 Alpine, runs `npm run build`
2. **Serve stage**: Nginx Alpine, serves static assets with SPA routing

## Future Enhancements

- [ ] Contact avatars / photos
- [ ] Import/export (CSV, vCard)
- [ ] Favorites / pinned contacts
- [ ] Grouping by tag
- [ ] Dark mode
- [ ] Backend API + Postgres (swap `LocalStorageContactRepository` for an `HttpContactRepository`, per `docs/architecture.md`)

## Deployment

### Local
```bash
npm run build
npm run preview
```

### Docker
```bash
docker build -t contacts:1.0.0 .
docker push <your-registry>/contacts:1.0.0
```

### Fly.io (Future)
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
5. Run the full test suite: `npm run test && npm run test:coverage && npm run test:e2e`

## Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Material-UI](https://mui.com/)

## License

MIT
