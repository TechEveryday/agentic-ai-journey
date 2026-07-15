# Tournament Bracket Maker

A single-elimination tournament bracket generator. Add participants, generate a seeded bracket, click winners to advance them round by round, and see a champion crowned.

## Overview

This is a single-user app: create a bracket from a list of participants, then click through match winners until a champion is decided. Data persists in browser localStorage. No backend or authentication required for Phase 1.

## Tech Stack

### Phase 1 (Current)
- **Frontend**: React 19 + TypeScript
- **UI Library**: Material-UI v5
- **Build Tool**: Vite 5
- **Persistence**: Browser localStorage
- **State Management**: React hooks
- **Testing**: Vitest + React Testing Library (unit/integration) + Playwright (E2E)

### Phase 2 (Planned)
- **Frontend**: React 19 (unchanged)
- **Backend**: C# .NET 8 Web API with Clean Architecture
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Deployment**: Fly.io (Docker)

## Getting Started

### Prerequisites
- Node.js 20.11.0+ (see `.nvmrc`)
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

# E2E tests (requires dev server running — Playwright starts it automatically)
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Architecture

This project follows **Clean Architecture** with strict layering. See [`docs/architecture.md`](docs/architecture.md) for the full write-up, including the seeding algorithm and dependency diagram.

```
src/
├── core/                      # Business logic, 0 dependencies — THE POINT of this project
│   ├── participant.ts         # Participant type, createParticipant()
│   ├── participantValidator.ts
│   ├── match.ts                # Match type
│   ├── seeding.ts              # nextPowerOfTwo(), getSeedOrder()
│   └── bracket.ts              # Bracket type, generateBracket(), advanceWinner(),
│                                # getChampion(), getRounds()
│
├── application/               # Orchestration, state management
│   ├── IBracketRepository.ts  # Repository interface contract
│   └── useBracket.ts          # React hook (create / advance / select / delete)
│
├── infrastructure/            # External dependencies
│   └── LocalStorageBracketRepository.ts
│
└── presentation/              # React components, Material-UI
    ├── components/
    │   ├── ParticipantForm.tsx
    │   ├── ParticipantList.tsx
    │   ├── BracketView.tsx     # Renders rounds as columns
    │   ├── MatchCard.tsx       # Click a participant to declare the winner
    │   ├── ChampionBanner.tsx
    │   └── EmptyState.tsx
    └── pages/
        └── BracketPage.tsx     # Composition root

tests/
├── setup.ts
├── unit/
│   ├── core/                  # The bulk of the test suite
│   │   ├── seeding.test.ts
│   │   ├── bracket.test.ts
│   │   ├── participant.test.ts
│   │   └── participantValidator.test.ts
│   └── infrastructure/
│       └── LocalStorageBracketRepository.test.ts
├── integration/
│   ├── MockBracketRepository.ts
│   ├── useBracket.test.ts
│   └── BracketPage.test.tsx
└── e2e/
    ├── create-bracket.spec.ts
    └── advance-winner-to-champion.spec.ts
```

## Domain Rules

- **Seeding**: standard tournament seeding order, generated recursively so seed 1 and seed 2 can only meet in the final. Seed is assigned by the order participants are added (first added = seed 1).
- **Byes**: when the participant count isn't a power of two, the bracket is padded up to the next power of two with byes. Byes always land on the top seeds and are auto-resolved at generation time — no user action needed to advance a bye.
- **Advancing a winner**: `advanceWinner()` rejects (throws) if the match doesn't exist, if the chosen winner isn't one of that match's two participants, or if the match isn't decided yet (both slots still empty, waiting on an earlier round). On success it returns a **new** bracket with the winner propagated into the correct slot of the next round.
- **0 or 1 participants**: `generateBracket()` rejects (throws) — a bracket needs at least 2 participants to hold a single match.

See the doc comments in `src/core/bracket.ts` for the full rationale behind these decisions, and `tests/unit/core/bracket.test.ts` for the edge cases they're tested against.

## Docker

### Local Development with Docker
```bash
docker-compose up
# Hot reload at http://localhost:5173
```

### Production Build
```bash
docker build -t tournament-bracket .
docker run -p 80:80 tournament-bracket
```

The `Dockerfile` uses a multi-stage build:
1. **Build stage**: Node 20 Alpine, runs `npm run build`
2. **Serve stage**: Nginx Alpine, serves static assets with SPA routing

## Phase 2: React + C# .NET API + Postgres

### What Changes
- Add `HttpBracketRepository` implementing `IBracketRepository`
- Wire it up instead of `LocalStorageBracketRepository` in `BracketPage.tsx`
- New env var: `VITE_API_BASE_URL=http://localhost:5000`

### What Doesn't Change
- `src/core/` — the seeding and advancement algorithms port directly
- `src/application/useBracket` — same interface, same orchestration
- `src/presentation/` — no component changes
- Tests — integration tests still work with `MockBracketRepository`

## Deployment

### Local
```bash
npm run build
npm run preview
```

### Fly.io (Coming in Phase 2)
```bash
flyctl auth login
flyctl launch
flyctl deploy
```

## License

MIT
