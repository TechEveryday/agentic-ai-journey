# Roblox Game

**Path:** `projects/roblox-game/` · **Status: BLOCKED — two prerequisites**

## Blocker 1 — no Lua toolchain

Verified on this machine (2026-07-14): `lua`, `lua5.4`, `luajit`, `lune`, and `busted` are all absent. Nothing can be run or tested until one is installed.

**Recommended:** [Lune](https://lune-org.github.io/docs) — a standalone Luau runtime, so tests run against *Luau* (the actual Roblox dialect) rather than stock Lua.
```
brew install lune        # note: cask/formula installs may need your password
```
Alternative: `luarocks` + `busted`, which is the more established test runner but runs plain Lua, not Luau — type annotations and Luau-only syntax won't parse.

Also expect **[Rojo](https://rojo.space)** (`brew install rojo`) to sync a filesystem project into Roblox Studio. Roblox development is Studio-centric; this repo can hold the source and test the pure logic, but the game itself is assembled and played in Studio.

## Blocker 2 — no game concept

"Roblox game" specifies a platform, not a game. Nothing can be designed without one line answering: **what does the player do?** (obby? tycoon? tag? tower defense? simulator?) Each implies a completely different domain model.

## The plan once unblocked

The whole testing strategy rests on one split: **pure logic must not touch the Roblox API.**

```
projects/roblox-game/
├── src/
│   ├── shared/     # PURE Luau: scoring, state machine, economy, rules — UNIT TESTED
│   ├── server/     # thin adapters: Players, DataStore, RemoteEvents — not unit tested
│   └── client/     # thin adapters: UI, input                        — not unit tested
├── tests/          # Lune/busted specs covering src/shared only
├── default.project.json   # Rojo mapping
└── README.md
```

- `src/shared/` modules take plain tables in and return plain tables out. No `game:GetService()`, no `Instance.new()`, no `wait()`. This is the same dependency rule as the TypeScript projects: pure core, adapters at the edge.
- `src/server/` and `src/client/` are the composition roots — they call the Roblox API and delegate every decision to `shared/`.
- **Coverage expectation is explicitly lower here.** The 80% bar in `prompts/PROJECT_TEMPLATE.md` applies to `src/shared/`. The adapters are verified manually in Studio, and the README must say so plainly rather than implying the game is fully tested.

## Honest caveat

Even fully unblocked, a Roblox game cannot be verified end-to-end from this repo — no CI, no headless Studio. An agent can produce well-structured, unit-tested Luau logic; **you** have to open Studio and play it. Weigh that before spending a build slot here: it's the one project in the slate where the agent's work can't be proven correct by running it.
