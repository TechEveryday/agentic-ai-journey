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
┌─────────────────────────────────┐      ┌─────────────────────────────────┐
│     Presentation (UI)           │      │   Infrastructure (I/O)          │
│ BracketPage, BracketView,       │      │ LocalStorageBracketRepository   │
│ MatchCard, ParticipantForm...   │      │                                 │
└──────────────┬───────────────────┘      └──────────────┬──────────────────┘
               │ depends on                               │ implements interface from,
               │                                           │ depends on
               ▼                                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                  Application (Orchestration / Interfaces)                 │
│        useBracket hook, IBracketRepository (interface contract)           │
└──────────────────────────────────┬────────────────────────────────────────┘
                                    │ depends on
                                    ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                      Core (Entities, Pure Business Logic)                 │
│   Bracket, Match, Participant, generateBracket, advanceWinner,            │
│   getChampion, getRounds, getSeedOrder — zero dependencies                │
└───────────────────────────────────────────────────────────────────────────┘
```

**Key Rule**: Dependencies point **inward**, toward Core. `Core` has no dependencies on anything else in the app. `Application` depends only on `Core`. Both `Presentation` and `Infrastructure` are **outer** layers — `Presentation` depends inward on `Application`, and `Infrastructure` also depends inward on `Application` (it *implements* the `IBracketRepository` interface that `Application` defines — this is the Dependency Inversion Principle at work). `Infrastructure` never depends on `Presentation`, and `Application` never depends on the concrete `Infrastructure` implementation, only on the abstract interface it owns.

The one place these two outer layers meet is the **Composition Root** (`BracketPage.tsx`), which is allowed to import the concrete `LocalStorageBracketRepository` and hand it to `useBracket`.

### Core Layer (`src/core/`)

**Responsibility**: Business entities and pure rules. Zero external dependencies.

**Files**:
- `participant.ts` — `Participant` type, `createParticipant()` factory
- `participantValidator.ts` — `validateParticipantName()`
- `match.ts` — `Match` type
- `seeding.ts` — `nextPowerOfTwo()`, `getSeedOrder()` (standard tournament seeding order)
- `bracket.ts` — `Bracket` type, `generateBracket()`, `advanceWinner()`, `getChampion()`, `getRounds()`

**Character**:
- Pure TypeScript, no React imports
- No I/O operations
- No external dependencies
- Fully testable in isolation
- Never mutates its inputs — every function that "changes" a bracket returns a new one

**Example**:
```typescript
// Core — no dependencies, pure logic, immutable
export function advanceWinner(bracket: Bracket, matchId: string, winnerId: string): Bracket {
  // ...validate...
  return { ...bracket, matches: newMatches }; // new object, original untouched
}
```

Why this matters: if we add a C# backend in Phase 2, the seeding algorithm and advancement rules can be ported 1:1 — they don't know anything about React, localStorage, or HTTP.

### Application Layer (`src/application/`)

**Responsibility**: State management and orchestration. Bridges Infrastructure and Presentation, but only ever through the `IBracketRepository` **interface** it owns.

**Files**:
- `IBracketRepository.ts` — interface contract for data access (`getAll/getById/save/delete`, all async)
- `useBracket.ts` — React hook that owns bracket state

**Character**:
- Defines `IBracketRepository`; does **not** know about `LocalStorageBracketRepository`
- `useBracket` calls the pure Core functions (`generateBracket`, `advanceWinner`) to compute the *next* state, then persists that result via the repository and updates React state
- **All repository methods are async** (even though localStorage is sync) so a future `HttpBracketRepository` is a zero-refactor swap

**Example**:
```typescript
// Application — orchestration only; the actual bracket math lives in Core
const createBracket = useCallback(async (name: string, participants: Participant[]) => {
  const bracket = generateBracket(name, participants); // Core computes it
  await repository.save(bracket);                      // Infrastructure persists it
  setBrackets((prev) => [...prev, bracket]);            // Presentation re-renders
}, [repository]);
```

### Infrastructure Layer (`src/infrastructure/`)

**Responsibility**: External I/O. Implements the interface defined in Application.

**Files**:
- `LocalStorageBracketRepository.ts` — reads/writes brackets to browser localStorage under the key `tournament-bracket:brackets`

**Character**:
- Implements `IBracketRepository`
- Handles serialization (JSON) and corruption gracefully — malformed JSON in localStorage yields `[]`, not a crash
- No business logic — never calls `generateBracket` or `advanceWinner`

### Presentation Layer (`src/presentation/`)

**Responsibility**: React components and Material-UI styling. No business logic.

**Files**:
- `components/` — `ParticipantForm`, `ParticipantList`, `BracketView`, `MatchCard`, `ChampionBanner`, `EmptyState` — all dumb, props-only
- `pages/BracketPage.tsx` — the **Composition Root**: instantiates `LocalStorageBracketRepository` at module scope and wires it into `useBracket`

**One controlled violation**: `BracketPage` knows about `LocalStorageBracketRepository`. This is the **Composition Root Pattern** — the single place in the app where concrete infrastructure is wired to the application layer. In Phase 2, swapping to a backend is one line:
```typescript
// Phase 1
const repository = new LocalStorageBracketRepository();
// Phase 2
const repository = new HttpBracketRepository(process.env.VITE_API_BASE_URL);
```
Everything else — `useBracket`, the Core seeding/advancement logic, every presentational component — is unchanged.

---

## The Seeding Algorithm

`getSeedOrder(size)` computes the standard tournament seeding order recursively, so that seed 1 and seed 2 can only meet in the final:

```
order(1) = [1]
order(2n) = order(n), each seed s replaced by the pair [s, 2n + 1 - s]

order(2) = [1, 2]
order(4) = [1, 4, 2, 3]
order(8) = [1, 8, 4, 5, 2, 7, 3, 6]
```

`generateBracket()` fills round-1 slots in that order using participants by seed (seed is assigned by array order: the first participant added is seed 1). Slots beyond the participant count get `null`, which represents a **bye**. Because byes replace the *highest* (numerically largest, i.e. weakest) seed numbers in the order sequence, and standard seeding always pairs the strongest remaining seed against the next bye slot first, byes land on the **top seeds** — verified in `tests/unit/core/bracket.test.ts`.

A round-1 match with exactly one `null` participant is auto-resolved at generation time: the present participant is declared the winner and propagated into round 2, by reusing `advanceWinner()` so the propagation logic exists in exactly one place.

## Immutability

`generateBracket()` and `advanceWinner()` never mutate their inputs. `advanceWinner()` builds an entirely new `matches` array (via `.map()`), locates the copy of the affected match, updates it, and returns a new `Bracket` object. The caller's original `Bracket` reference is guaranteed to be deep-equal to what it was before the call — this is asserted directly in the unit tests.

## Testability

Each layer is independently testable:

```typescript
// Core — pure function, pure test
it('should place byes on the top seeds', () => {
  const bracket = generateBracket('Five', makeParticipants(5));
  // ...assert byes advanced seeds 1, 2, 3...
});

// Infrastructure — against jsdom's localStorage
localStorage.clear();
const repo = new LocalStorageBracketRepository();
await repo.save(bracket);

// Application — hook + in-memory MockBracketRepository
const { result } = renderHook(() => useBracket(mockRepo));
await result.current.createBracket('Cup', participants);

// Presentation — full RTL render of BracketPage
render(<BracketPage />);
await user.click(screen.getByRole('button', { name: 'Generate Bracket' }));
```

## Summary

- **Core is stable**: seeding and advancement rules rarely change and have no dependencies
- **Infrastructure is swappable**: localStorage → HTTP → database, without touching Core or Application
- **Presentation is simple**: components are dumb, the hook is smart
- **Testing is easy**: each layer tests independently, and coverage stays high because the bulk of the logic (and the bulk of the tests) live in Core
