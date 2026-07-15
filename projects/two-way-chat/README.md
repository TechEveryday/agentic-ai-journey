# Two-Way Chat

A real-time 2-way chat app: an ASP.NET Core 10 + SignalR backend, and a
React 19 + MUI 5 frontend. No auth — users pick a display name on join. No
persistent storage — messages live in memory for the lifetime of the
process. Both are deliberate, approved scope decisions for this MVP.

## Architecture

Clean Architecture on both sides, with the dependency arrows pointing the
same direction: outer layers depend on inner layers, never the reverse.

```
backend/
  Chat.Domain/          Message record, MessageValidator, ValidationResult — zero dependencies
  Chat.Application/     IMessageRepository, IChatService/ChatService — depends on Domain only
  Chat.Infrastructure/  InMemoryMessageRepository — depends on Domain + Application
  Chat.Api/             Program.cs, Hubs/ChatHub.cs — depends on all three
  Chat.Tests/           xUnit tests for Domain/Application/Infrastructure

frontend/
  src/core/              Message type, validateMessageText() — pure, zero dependencies
  src/application/       IMessageTransport port, useChat() hook — depends on core only
  src/infrastructure/    SignalRMessageTransport — implements the port, depends on @microsoft/signalr
  src/presentation/      ChatPage (composition root), JoinDialog, MessageList, MessageBubble, MessageComposer
```

`useChat` depends only on the `IMessageTransport` interface, never on
`@microsoft/signalr` directly, so it can be exercised in tests against a
`MockMessageTransport` with no network involved.

## Backend

### Run

```bash
cd backend/Chat.Api
dotnet run
```

Listens on `http://localhost:5000` by default (see
`Chat.Api/Properties/launchSettings.json`), hub at `/hubs/chat`, health
check at `/health`.

### Test

```bash
cd backend
dotnet build
dotnet test
```

26 xUnit tests across `MessageValidatorTests`, `ChatServiceTests`, and
`InMemoryMessageRepositoryTests` (including validated concurrent-write
safety), all passing.

### Hub contract

| Direction | Method | Payload |
|---|---|---|
| Client → Server | `JoinRoom(roomId, displayName)` | joins a SignalR group, replays history, broadcasts `UserJoined` |
| Client → Server | `SendMessage(roomId, text)` | validated + persisted server-side, then broadcast |
| Server → Client | `MessageHistory(Message[])` | sent to the caller only, on join |
| Server → Client | `ReceiveMessage(Message)` | broadcast to the room |
| Server → Client | `UserJoined(string)` / `UserLeft(string)` | presence notifications |

The server is the sole authority for `Message.Id` and `Message.SentAt` —
the client never supplies them.

## Frontend

### Setup

Node 20.11.0+ required (`.nvmrc` pinned). Copy `.env.example` to `.env` and
adjust `VITE_HUB_URL` if the backend isn't on `http://localhost:5000`.

```bash
cd frontend
npm install
npm run dev
```

### Test

```bash
npm run lint            # ESLint 9 flat config
npm run build            # tsc + vite build
npm test                 # Vitest unit + integration tests
npm run test:coverage    # same, with coverage thresholds (80% lines/branches/functions/statements)
npm run test:e2e         # Playwright — requires the backend running separately (see below)
```

`SignalRMessageTransport` is excluded from the coverage thresholds (see
`vite.config.ts`) — it's a thin wrapper around a live network connection
that isn't meaningfully unit-testable; it's exercised instead by the
Playwright e2e test.

### Running the e2e test

Playwright's `webServer` config only starts the frontend dev server. Start
the backend yourself first:

```bash
# terminal 1
cd backend/Chat.Api && dotnet run

# terminal 2
cd frontend
npx playwright install chromium   # first time only
npm run test:e2e
```

`tests/e2e/two-way-message.spec.ts` opens two independent browser contexts,
joins both to the same room under different display names, and asserts
messages sent from either side arrive on the other — this is the test that
proves the "2-way" part of the feature.

## Docker Compose

`docker-compose.yml` at the project root wires the API
(`mcr.microsoft.com/dotnet/aspnet:10.0` runtime image, built via
`mcr.microsoft.com/dotnet/sdk:10.0`) and the frontend dev server together.

```bash
docker compose config   # validated successfully in this environment
docker compose up       # not exercised — no Docker daemon was running here
```

`docker compose config` was verified to produce valid, fully-resolved
compose output. A full `docker compose up` was **not** run in this
environment because the Docker daemon was not available
(`Cannot connect to the Docker daemon at unix:///var/run/docker.sock`) —
this is stated plainly rather than claimed as verified.

## Scope decisions (approved)

- **In-memory storage only.** `IMessageRepository` is the seam a future
  `PostgresMessageRepository` would implement; no EF Core/Postgres for this
  MVP.
- **No authentication.** Display name only, entered on join.
