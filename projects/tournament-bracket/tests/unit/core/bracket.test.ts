import { describe, it, expect } from 'vitest';
import { createParticipant } from '@/core/participant';
import { generateBracket, advanceWinner, getChampion, getRounds } from '@/core/bracket';
import type { Participant } from '@/core/participant';

function makeParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => createParticipant(`Player ${i + 1}`, i + 1));
}

describe('generateBracket', () => {
  describe('edge cases: participant count', () => {
    it('should reject 0 participants', () => {
      expect(() => generateBracket('Empty', [])).toThrow();
    });

    it('should reject 1 participant', () => {
      // DECISION: 1 participant is rejected (not treated as an instant
      // champion) — see comment in src/core/bracket.ts.
      expect(() => generateBracket('Solo', makeParticipants(1))).toThrow();
    });

    it('should handle 2 participants: one match, no byes', () => {
      const bracket = generateBracket('Duel', makeParticipants(2));
      expect(bracket.matches).toHaveLength(1);

      const rounds = getRounds(bracket);
      expect(rounds).toHaveLength(1);

      const [match] = bracket.matches;
      expect(match.round).toBe(1);
      expect(match.participantA).not.toBeNull();
      expect(match.participantB).not.toBeNull();
      expect(match.winnerId).toBeNull();
    });

    it('should handle 3 participants: size 4, 1 bye, top seed advances free', () => {
      const bracket = generateBracket('Trio', makeParticipants(3));

      // size 4 => 2 rounds, 3 matches total
      expect(getRounds(bracket)).toHaveLength(2);
      expect(bracket.matches).toHaveLength(3);

      const round1 = bracket.matches.filter((m) => m.round === 1);
      expect(round1).toHaveLength(2);

      const byeMatches = round1.filter(
        (m) => (m.participantA === null) !== (m.participantB === null)
      );
      expect(byeMatches).toHaveLength(1);

      // The bye match should already be auto-resolved in favor of the
      // present participant, and that participant should be the top seed.
      const [byeMatch] = byeMatches;
      const advancedId = byeMatch.participantA ?? byeMatch.participantB;
      expect(byeMatch.winnerId).toBe(advancedId);

      const topSeed = bracket.participants.find((p) => p.seed === 1)!;
      expect(advancedId).toBe(topSeed.id);

      // And that winner should already be propagated into round 2.
      const final = bracket.matches.find((m) => m.round === 2)!;
      expect([final.participantA, final.participantB]).toContain(topSeed.id);
    });

    it('should handle 5 participants: size 8, 3 byes', () => {
      const bracket = generateBracket('Five', makeParticipants(5));

      expect(getRounds(bracket)).toHaveLength(3);
      expect(bracket.matches).toHaveLength(7);

      const round1 = bracket.matches.filter((m) => m.round === 1);
      expect(round1).toHaveLength(4);

      const byeMatches = round1.filter(
        (m) => (m.participantA === null) !== (m.participantB === null)
      );
      expect(byeMatches).toHaveLength(3);

      // Byes land on the top 3 seeds.
      const topSeeds = bracket.participants.filter((p) => p.seed <= 3).map((p) => p.id);
      const advancedIds = byeMatches.map((m) => m.participantA ?? m.participantB);
      expect(new Set(advancedIds)).toEqual(new Set(topSeeds));
    });

    it('should handle 8 participants: perfect bracket, 3 rounds, no byes', () => {
      const bracket = generateBracket('Eight', makeParticipants(8));

      expect(getRounds(bracket)).toHaveLength(3);
      expect(bracket.matches).toHaveLength(7);

      const round1 = bracket.matches.filter((m) => m.round === 1);
      expect(round1).toHaveLength(4);
      for (const match of round1) {
        expect(match.participantA).not.toBeNull();
        expect(match.participantB).not.toBeNull();
        expect(match.winnerId).toBeNull();
      }
    });

    it('should handle 16 participants: perfect bracket, 4 rounds, no byes', () => {
      const bracket = generateBracket('Sixteen', makeParticipants(16));

      expect(getRounds(bracket)).toHaveLength(4);
      expect(bracket.matches).toHaveLength(15);

      const round1 = bracket.matches.filter((m) => m.round === 1);
      expect(round1).toHaveLength(8);
      for (const match of round1) {
        expect(match.participantA).not.toBeNull();
        expect(match.participantB).not.toBeNull();
      }
    });
  });

  describe('seed 1 vs seed 2 meeting only in the final', () => {
    it('should place seed 1 and seed 2 in opposite halves for 8 participants', () => {
      const bracket = generateBracket('Eight', makeParticipants(8));
      const round1 = getRounds(bracket)[0];
      const half = round1.length / 2;

      const seed1 = bracket.participants.find((p) => p.seed === 1)!;
      const seed2 = bracket.participants.find((p) => p.seed === 2)!;

      const firstHalfMatches = round1.slice(0, half);
      const secondHalfMatches = round1.slice(half);

      const inFirstHalf = (id: string) =>
        firstHalfMatches.some((m) => m.participantA === id || m.participantB === id);
      const inSecondHalf = (id: string) =>
        secondHalfMatches.some((m) => m.participantA === id || m.participantB === id);

      expect(inFirstHalf(seed1.id)).toBe(true);
      expect(inSecondHalf(seed2.id)).toBe(true);
    });
  });
});

describe('advanceWinner', () => {
  it('should reject a match that does not exist', () => {
    const bracket = generateBracket('Duel', makeParticipants(2));
    expect(() => advanceWinner(bracket, 'nonexistent-id', bracket.participants[0].id)).toThrow();
  });

  it('should reject a winnerId that is not one of the match participants', () => {
    const bracket = generateBracket('Trio', makeParticipants(3));
    const realMatch = bracket.matches.find(
      (m) => m.round === 1 && m.participantA !== null && m.participantB !== null
    )!;
    expect(() => advanceWinner(bracket, realMatch.id, 'not-a-real-id')).toThrow();
  });

  it('should reject advancing a match whose participants are not yet decided', () => {
    const bracket = generateBracket('Eight', makeParticipants(8));
    // Round 2 matches have no participants yet — they are waiting on round 1.
    const round2Match = bracket.matches.find((m) => m.round === 2)!;
    expect(round2Match.participantA).toBeNull();
    expect(round2Match.participantB).toBeNull();

    expect(() => advanceWinner(bracket, round2Match.id, 'anyone')).toThrow();
  });

  it('should set the winnerId on success', () => {
    const bracket = generateBracket('Duel', makeParticipants(2));
    const match = bracket.matches[0];
    const winnerId = match.participantA!;

    const updated = advanceWinner(bracket, match.id, winnerId);
    const updatedMatch = updated.matches.find((m) => m.id === match.id)!;

    expect(updatedMatch.winnerId).toBe(winnerId);
  });

  it('should propagate the winner into the correct slot of the next round', () => {
    const bracket = generateBracket('Eight', makeParticipants(8));
    const round1 = bracket.matches.filter((m) => m.round === 1).sort((a, b) => a.position - b.position);

    const match0 = round1[0]; // position 0 -> next round position 0, slot A
    const winnerId = match0.participantA!;

    const updated = advanceWinner(bracket, match0.id, winnerId);
    const nextMatch = updated.matches.find((m) => m.round === 2 && m.position === 0)!;

    expect(nextMatch.participantA).toBe(winnerId);
    expect(nextMatch.participantB).toBeNull();

    const match1 = round1[1]; // position 1 -> next round position 0, slot B
    const winnerId2 = match1.participantB!;
    const updated2 = advanceWinner(updated, match1.id, winnerId2);
    const nextMatch2 = updated2.matches.find((m) => m.round === 2 && m.position === 0)!;

    expect(nextMatch2.participantA).toBe(winnerId);
    expect(nextMatch2.participantB).toBe(winnerId2);
  });

  it('should not mutate the input bracket', () => {
    const bracket = generateBracket('Eight', makeParticipants(8));
    const original = JSON.parse(JSON.stringify(bracket));

    const match = bracket.matches.find((m) => m.round === 1)!;
    advanceWinner(bracket, match.id, match.participantA!);

    expect(bracket).toEqual(original);
  });

  it('should allow advancing a bye-created match once both slots are filled', () => {
    // 5 participants -> byes for seeds 1, 2, 3. Seeds 2 and 3 both get byes
    // and are pre-filled into the same round-2 match without either of them
    // being a bye themselves, so it should be advanceable like any match.
    const bracket = generateBracket('Five', makeParticipants(5));
    const round2 = bracket.matches.filter((m) => m.round === 2);
    const readyMatch = round2.find((m) => m.participantA !== null && m.participantB !== null);

    expect(readyMatch).toBeDefined();
    const updated = advanceWinner(bracket, readyMatch!.id, readyMatch!.participantA!);
    expect(updated.matches.find((m) => m.id === readyMatch!.id)!.winnerId).toBe(
      readyMatch!.participantA
    );
  });
});

describe('getChampion', () => {
  it('should return null until the final resolves', () => {
    const bracket = generateBracket('Duel', makeParticipants(4));
    expect(getChampion(bracket)).toBeNull();
  });

  it('should return the winner once the final is decided', () => {
    let bracket = generateBracket('Duel', makeParticipants(2));
    const match = bracket.matches[0];
    const winnerId = match.participantA!;

    bracket = advanceWinner(bracket, match.id, winnerId);

    const champion = getChampion(bracket);
    expect(champion).not.toBeNull();
    expect(champion!.id).toBe(winnerId);
  });

  it('should drive a full 4-participant bracket to a champion', () => {
    let bracket = generateBracket('Final Four', makeParticipants(4));

    expect(getChampion(bracket)).toBeNull();

    const round1 = bracket.matches.filter((m) => m.round === 1).sort((a, b) => a.position - b.position);

    const winner0 = round1[0].participantA!;
    bracket = advanceWinner(bracket, round1[0].id, winner0);

    const winner1 = round1[1].participantA!;
    bracket = advanceWinner(bracket, round1[1].id, winner1);

    expect(getChampion(bracket)).toBeNull();

    const final = bracket.matches.find((m) => m.round === 2)!;
    expect(final.participantA).toBe(winner0);
    expect(final.participantB).toBe(winner1);

    bracket = advanceWinner(bracket, final.id, winner0);

    const champion = getChampion(bracket);
    expect(champion).not.toBeNull();
    expect(champion!.id).toBe(winner0);
  });
});

describe('getRounds', () => {
  it('should group matches by round, round 1 first', () => {
    const bracket = generateBracket('Eight', makeParticipants(8));
    const rounds = getRounds(bracket);

    expect(rounds).toHaveLength(3);
    expect(rounds[0].every((m) => m.round === 1)).toBe(true);
    expect(rounds[1].every((m) => m.round === 2)).toBe(true);
    expect(rounds[2].every((m) => m.round === 3)).toBe(true);
  });

  it('should sort matches within a round by position', () => {
    const bracket = generateBracket('Eight', makeParticipants(8));
    const [round1] = getRounds(bracket);
    const positions = round1.map((m) => m.position);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});
