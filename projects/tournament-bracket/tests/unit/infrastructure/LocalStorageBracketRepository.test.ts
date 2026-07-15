import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LocalStorageBracketRepository } from '@/infrastructure';
import { generateBracket, createParticipant } from '@/core';
import type { Participant } from '@/core';

function makeParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => createParticipant(`Player ${i + 1}`, i + 1));
}

describe('LocalStorageBracketRepository', () => {
  let repo: LocalStorageBracketRepository;
  const STORAGE_KEY = 'tournament-bracket:brackets';

  beforeEach(() => {
    localStorage.clear();
    repo = new LocalStorageBracketRepository();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('should return empty array when localStorage is empty', async () => {
      const brackets = await repo.getAll();
      expect(brackets).toEqual([]);
    });

    it('should return all stored brackets', async () => {
      const b1 = generateBracket('Bracket 1', makeParticipants(2));
      const b2 = generateBracket('Bracket 2', makeParticipants(4));

      localStorage.setItem(STORAGE_KEY, JSON.stringify([b1, b2]));

      const brackets = await repo.getAll();
      expect(brackets).toHaveLength(2);
      expect(brackets[0].name).toBe('Bracket 1');
      expect(brackets[1].name).toBe('Bracket 2');
    });

    it('should handle corrupted JSON gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {');

      const brackets = await repo.getAll();
      expect(brackets).toEqual([]);
    });
  });

  describe('getById', () => {
    it('should return null when bracket does not exist', async () => {
      const bracket = await repo.getById('nonexistent-id');
      expect(bracket).toBeNull();
    });

    it('should return bracket by id', async () => {
      const bracket = generateBracket('Test bracket', makeParticipants(2));
      await repo.save(bracket);

      const retrieved = await repo.getById(bracket.id);
      expect(retrieved).toEqual(bracket);
    });
  });

  describe('save', () => {
    it('should insert a new bracket', async () => {
      const bracket = generateBracket('New bracket', makeParticipants(2));
      await repo.save(bracket);

      const stored = await repo.getById(bracket.id);
      expect(stored).toEqual(bracket);
    });

    it('should update an existing bracket', async () => {
      const bracket = generateBracket('Original', makeParticipants(2));
      await repo.save(bracket);

      const match = bracket.matches[0];
      const updated = {
        ...bracket,
        matches: bracket.matches.map((m) =>
          m.id === match.id ? { ...m, winnerId: match.participantA } : m
        ),
      };
      await repo.save(updated);

      const retrieved = await repo.getById(bracket.id);
      expect(retrieved?.matches.find((m) => m.id === match.id)?.winnerId).toBe(
        match.participantA
      );
    });

    it('should not duplicate brackets on update', async () => {
      const bracket = generateBracket('Bracket', makeParticipants(2));
      await repo.save(bracket);
      await repo.save({ ...bracket, name: 'Renamed' });

      const brackets = await repo.getAll();
      expect(brackets).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a bracket by id', async () => {
      const bracket = generateBracket('To delete', makeParticipants(2));
      await repo.save(bracket);

      let brackets = await repo.getAll();
      expect(brackets).toHaveLength(1);

      await repo.delete(bracket.id);

      brackets = await repo.getAll();
      expect(brackets).toHaveLength(0);
    });

    it('should not affect other brackets when deleting', async () => {
      const b1 = generateBracket('Bracket 1', makeParticipants(2));
      const b2 = generateBracket('Bracket 2', makeParticipants(2));

      await repo.save(b1);
      await repo.save(b2);

      await repo.delete(b1.id);

      const brackets = await repo.getAll();
      expect(brackets).toHaveLength(1);
      expect(brackets[0].id).toBe(b2.id);
    });

    it('should handle deleting non-existent bracket gracefully', async () => {
      const bracket = generateBracket('Bracket', makeParticipants(2));
      await repo.save(bracket);

      await repo.delete('nonexistent-id');

      const brackets = await repo.getAll();
      expect(brackets).toHaveLength(1);
    });
  });

  describe('persistence', () => {
    it('should persist brackets across repository instances', async () => {
      const bracket = generateBracket('Persisted bracket', makeParticipants(2));
      await repo.save(bracket);

      const newRepo = new LocalStorageBracketRepository();
      const retrieved = await newRepo.getById(bracket.id);

      expect(retrieved).toEqual(bracket);
    });
  });
});
