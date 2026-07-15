export interface Participant {
  id: string;
  name: string;
  seed: number; // 1-based
}

/**
 * Creates a Participant. `seed` is a placeholder — generateBracket() is the
 * authority on final seed assignment (see bracket.ts for why) so callers may
 * pass a provisional value (e.g. current list length + 1).
 */
export function createParticipant(name: string, seed: number): Participant {
  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    seed,
  };
}
