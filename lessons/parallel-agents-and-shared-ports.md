# Lesson: Parallel Agents and Shared Dev-Server Ports

## The Lesson

**When agents run in parallel, anything they share outside their worktree is not isolated. Git worktrees isolate files — they do not isolate ports.**

## What Happened (Day 5)

Three agents built three projects in parallel, each in its own git worktree on its own branch. File isolation worked perfectly.

Ports did not. Every project inherited its Playwright config from `projects/todo-checklist/`:

```ts
use: { baseURL: 'http://localhost:5173' },
webServer: { command: 'npm run dev', url: 'http://localhost:5173',
             reuseExistingServer: !process.env.CI }
```

`reuseExistingServer: true` means: *if something is already answering on 5173, don't start a server — use that one.* It does not check that the thing answering is **your app**.

The tournament-bracket agent's first E2E run failed because a completely unrelated app ("Soccer Roster") — not even from this repo, from somewhere else on the machine — was holding 5173. Playwright happily pointed the bracket tests at it. The agent retried later, the foreign server was gone, and the tests passed.

The failure was loud that time. It doesn't have to be. Two projects sharing enough UI surface (a heading, a button label) could produce a run that **passes against the wrong application**.

## Root Cause

Two compounding defaults:
1. Every project hardcodes the same port (5173, Vite's default). Cloning a template clones its port.
2. `reuseExistingServer: !process.env.CI` is `true` locally — an optimization that assumes one project at a time, which is exactly the assumption parallel agents break.

## The Solution

### 1. Give every project its own port
Set it in `vite.config.ts` (`server.port`) and in `playwright.config.ts` (`baseURL` + `webServer.url`) so they can't drift apart. A simple registry, kept in this file:

| Project | Port |
|---|---|
| todo-checklist | 5173 |
| contacts | 5174 |
| tournament-bracket | 5175 |
| two-way-chat (frontend) | 5176 |

### 2. Prefer `reuseExistingServer: false`
Slower by a few seconds; removes an entire class of silent wrong-app results. Reuse is an optimization for a serial workflow — parallel agents aren't that.

### 3. Verify E2E serially before believing it
Green E2E from concurrent agents is not trustworthy on its own. Confirm the port is free, then re-run each suite one at a time:
```bash
lsof -nP -iTCP:5173 -sTCP:LISTEN || echo "free"
```

## How to Apply

Before launching parallel agents, ask: **what do these agents share that isn't files?** Ports, `~/.npm` cache, global installs, localStorage origins (`localhost:5173` is one origin — two apps on it share storage), a database, the Docker daemon. Worktrees isolate the filesystem and nothing else.

For this repo specifically: assign each new project a port from the registry above, and don't leave `reuseExistingServer` on when more than one project might be running.

## The Broader Point

The bug wasn't in any agent's code. It was in the **harness** — a template default that was fine for one project and wrong for three. When you parallelize a workflow, re-examine every assumption the serial version was allowed to make.

## Status

✅ Applied going forward — port registry above; verify E2E serially when agents run in parallel.

## Related Files

- `projects/todo-checklist/tests/e2e/playwright.config.ts` — origin of the shared-port default
- `projects/contacts/playwright.config.ts`, `projects/tournament-bracket/playwright.config.ts`, `projects/two-way-chat/frontend/playwright.config.ts`
- [[template-drift-and-broken-scripts]]
