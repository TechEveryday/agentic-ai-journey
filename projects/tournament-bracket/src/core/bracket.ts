import type { Participant } from './participant';
import type { Match } from './match';
import { nextPowerOfTwo, getSeedOrder } from './seeding';

export interface Bracket {
  id: string;
  name: string;
  participants: Participant[];
  matches: Match[];
  createdAt: string; // ISO 8601 string
}

/**
 * DESIGN DECISION: seed assignment.
 *
 * generateBracket() does NOT trust `seed` values on the incoming
 * Participant objects. Instead it assigns seeds by array order —
 * participants[0] becomes seed 1, participants[1] becomes seed 2, etc. — and
 * returns a NEW Participant array with corrected `seed` fields on the
 * returned Bracket.
 *
 * Rationale: the seed number is really just "the order participants were
 * entered/arranged in" from the caller's point of view (e.g. the UI list).
 * Trusting caller-supplied seed numbers would require validating they form a
 * contiguous 1..N permutation, which adds a whole class of rejectable input
 * for no real benefit — the UI can just reorder its list to change seeding.
 */

/**
 * DESIGN DECISION: 0 and 1 participant inputs are both REJECTED (throw).
 *
 * A bracket represents a competition between two or more parties. With 0
 * participants there is nothing to seed. With exactly 1 participant, calling
 * that participant a "champion" without a single match being played is
 * ambiguous and not tested/asserted by getChampion's contract (which only
 * resolves once a final match has a winner) — so we reject rather than
 * special-case an instant champion.
 */
export function generateBracket(name: string, participants: Participant[]): Bracket {
  const n = participants.length;

  if (n < 2) {
    throw new Error('generateBracket requires at least 2 participants');
  }

  const seededParticipants: Participant[] = participants.map((p, index) => ({
    ...p,
    seed: index + 1,
  }));

  const size = nextPowerOfTwo(n);
  const order = getSeedOrder(size);
  const bySeed = new Map(seededParticipants.map((p) => [p.seed, p]));

  // slots[i] = participant occupying round-1 slot i, or null for a bye
  const slots: (Participant | null)[] = order.map((seed) => (seed <= n ? bySeed.get(seed)! : null));

  const totalRounds = Math.log2(size);
  const matches: Match[] = [];

  for (let round = 1; round <= totalRounds; round++) {
    const numMatches = size / 2 ** round;
    for (let position = 0; position < numMatches; position++) {
      matches.push({
        id: crypto.randomUUID(),
        round,
        position,
        participantA: null,
        participantB: null,
        winnerId: null,
      });
    }
  }

  const round1Matches = matches.filter((m) => m.round === 1);
  for (const match of round1Matches) {
    const a = slots[match.position * 2];
    const b = slots[match.position * 2 + 1];
    match.participantA = a ? a.id : null;
    match.participantB = b ? b.id : null;

    // Invariant: standard seeding with byes < size/2 guarantees a round-1
    // match never has both slots empty.
    if (match.participantA === null && match.participantB === null) {
      throw new Error('Invariant violated: round 1 match with no participants');
    }
  }

  let bracket: Bracket = {
    id: crypto.randomUUID(),
    name,
    participants: seededParticipants,
    matches,
    createdAt: new Date().toISOString(),
  };

  // Auto-advance byes (a round-1 match with exactly one participant) into
  // round 2, reusing advanceWinner so propagation logic lives in one place.
  for (const match of round1Matches) {
    const isBye = (match.participantA === null) !== (match.participantB === null);
    if (isBye) {
      const winnerId = (match.participantA ?? match.participantB) as string;
      bracket = advanceWinner(bracket, match.id, winnerId);
    }
  }

  return bracket;
}

/**
 * DESIGN DECISION: advanceWinner THROWS (rather than returning the bracket
 * unchanged) on invalid input. Silently returning the same bracket would let
 * a caller mistake a no-op for success; throwing surfaces the mistake
 * immediately and is what the application layer's try/catch expects.
 *
 * Rejects when:
 *   - no match with `matchId` exists on the bracket
 *   - the match has no participants assigned yet (both null — still pending
 *     an earlier round)
 *   - `winnerId` is not one of the match's two participants
 *
 * On success, returns a NEW Bracket (input is never mutated) with the
 * match's winnerId set and that winner propagated into the correct slot of
 * the next round's match, if one exists.
 */
export function advanceWinner(bracket: Bracket, matchId: string, winnerId: string): Bracket {
  const match = bracket.matches.find((m) => m.id === matchId);

  if (!match) {
    throw new Error(`advanceWinner: no match found with id ${matchId}`);
  }

  if (match.participantA === null && match.participantB === null) {
    throw new Error(`advanceWinner: match ${matchId} does not have decided participants yet`);
  }

  if (winnerId !== match.participantA && winnerId !== match.participantB) {
    throw new Error(`advanceWinner: winnerId ${winnerId} is not a participant of match ${matchId}`);
  }

  const newMatches = bracket.matches.map((m) => ({ ...m }));
  const updatedMatch = newMatches.find((m) => m.id === matchId)!;
  updatedMatch.winnerId = winnerId;

  const nextRound = match.round + 1;
  const nextPosition = Math.floor(match.position / 2);
  const nextMatch = newMatches.find((m) => m.round === nextRound && m.position === nextPosition);

  if (nextMatch) {
    if (match.position % 2 === 0) {
      nextMatch.participantA = winnerId;
    } else {
      nextMatch.participantB = winnerId;
    }
  }

  return {
    ...bracket,
    matches: newMatches,
  };
}

/**
 * Returns the champion once the final match has a decided winner, otherwise
 * null.
 */
export function getChampion(bracket: Bracket): Participant | null {
  if (bracket.matches.length === 0) {
    return null;
  }

  const maxRound = Math.max(...bracket.matches.map((m) => m.round));
  const finalMatch = bracket.matches.find((m) => m.round === maxRound && m.position === 0);

  if (!finalMatch || finalMatch.winnerId === null) {
    return null;
  }

  return bracket.participants.find((p) => p.id === finalMatch.winnerId) ?? null;
}

/**
 * Groups matches by round, round 1 first, matches within a round sorted by
 * position.
 */
export function getRounds(bracket: Bracket): Match[][] {
  if (bracket.matches.length === 0) {
    return [];
  }

  const maxRound = Math.max(...bracket.matches.map((m) => m.round));
  const rounds: Match[][] = [];

  for (let round = 1; round <= maxRound; round++) {
    rounds.push(
      bracket.matches.filter((m) => m.round === round).sort((a, b) => a.position - b.position)
    );
  }

  return rounds;
}
