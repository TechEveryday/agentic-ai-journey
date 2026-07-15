# Sports Team Manager

**Path:** `projects/sports-team-manager/` · **Branch:** `feature/sports-team-manager` · **Stack:** Frontend-only, localStorage

Manages team rosters and play time. Like Tournament/Bracket, the value here is a **pure, unit-testable algorithm** — fair play-time rotation — not the CRUD around it.

## The interesting problem

Given a roster of N players, a game of P periods, and F fielded slots per period, produce a rotation where total minutes are as equal as possible, honoring per-player availability constraints.

Total slots = `P × F`. Ideal per player = `P × F / N`, which rarely divides evenly — so some players get `ceil`, some `floor`. Fairness means: **no player's total differs from another's by more than one period**, and the players who get the extra period rotate across games (track it, or seed by who sat last).

Constraints to support: a player marked unavailable for a period cannot be fielded in it; a player marked "must play" in a period must be. Both can make a roster infeasible (e.g. more must-plays than slots) — detect and reject with a clear reason rather than emitting a silently wrong lineup.

## Core (`src/core/`, pure)

```ts
interface Player { id: string; name: string; number: string; }
interface Availability { playerId: string; unavailablePeriods: number[]; mustPlayPeriods: number[]; }
interface Lineup { period: number; playerIds: string[]; }
interface RotationPlan { lineups: Lineup[]; minutesByPlayer: Record<string, number>; }

function createPlayer(name: string, number: string): Player
function validatePlayer(input): ValidationResult
function generateRotation(players: Player[], periods: number,
                          slotsPerPeriod: number,
                          availability?: Availability[]): RotationPlan   // throws on infeasible
function isFair(plan: RotationPlan): boolean    // max−min ≤ 1
```

**Algorithm:** greedy with a fairness heap. For each period, place all `mustPlay` players first, then fill remaining slots from eligible players ordered by fewest-minutes-so-far (ties broken by who sat most recently, then by id for determinism). Determinism matters — the tests depend on it.

## Edge cases that MUST be unit-tested

- N < F (fewer players than slots) → infeasible, reject.
- N == F → everyone plays every period; all totals equal.
- N = 5, P = 4, F = 3 → 12 slots / 5 players = 2.4 → totals must be all 2s and 3s, `max−min ≤ 1`.
- More must-plays in a period than slots → infeasible, reject.
- A player unavailable for every period → gets 0 minutes; the rest still fair among themselves.
- `periods = 0` or `slotsPerPeriod = 0` → reject.
- Determinism: same input twice → identical plan.

## Other layers

- **Application:** `IRosterRepository` (all async) + `useRoster(repo)`. Rotation generation calls the pure core function; the hook only persists the result.
- **Infrastructure:** `LocalStorageRosterRepository`, key `sports-team-manager:rosters`.
- **Presentation:** `RosterPage` (composition root), `PlayerForm`, `PlayerList`, `RotationSettings` (periods / slots), `RotationView` (grid: periods × players), `MinutesSummary` (per-player totals, highlighting anyone off by one).

## Tests

- **Unit:** the bulk — every edge case above, plus `isFair`, `validatePlayer`.
- **Integration:** add players, generate rotation, grid renders, infeasible input shows an error.
- **E2E:** `manage-roster.spec.ts`, `generate-fair-rotation.spec.ts` (assert the displayed minute totals differ by ≤1).

## MVP vs deferred

**MVP:** roster CRUD, rotation generation, per-player minute totals, availability constraints.
**Deferred:** positions, multi-game season stats, substitution timing within a period, export/print.
