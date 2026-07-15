import { useState, useEffect, useCallback } from 'react';
import type { Bracket, Participant } from '@/core';
import { generateBracket, advanceWinner } from '@/core';
import type { IBracketRepository } from './IBracketRepository';

export interface UseBracketReturn {
  brackets: Bracket[];
  currentBracket: Bracket | null;
  isLoading: boolean;
  error: string | null;
  createBracket: (name: string, participants: Participant[]) => Promise<void>;
  selectBracket: (id: string) => void;
  recordWinner: (matchId: string, winnerId: string) => Promise<void>;
  deleteBracket: (id: string) => Promise<void>;
}

export function useBracket(repository: IBracketRepository): UseBracketReturn {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [currentBracket, setCurrentBracket] = useState<Bracket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load brackets on mount
  useEffect(() => {
    const loadBrackets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loaded = await repository.getAll();
        setBrackets(loaded);

        if (loaded.length > 0) {
          const mostRecent = [...loaded].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];
          setCurrentBracket(mostRecent);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load brackets';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBrackets();
  }, [repository]);

  const createBracket = useCallback(
    async (name: string, participants: Participant[]) => {
      try {
        setError(null);

        // generateBracket (Core) is the single authority on validation,
        // seeding, and bye placement.
        const bracket = generateBracket(name, participants);

        await repository.save(bracket);
        setBrackets((prev) => [...prev, bracket]);
        setCurrentBracket(bracket);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create bracket';
        setError(message);
      }
    },
    [repository]
  );

  const recordWinner = useCallback(
    async (matchId: string, winnerId: string) => {
      if (!currentBracket) {
        setError('No bracket selected');
        return;
      }

      try {
        setError(null);

        // advanceWinner (Core) validates the match/winner and returns a new
        // bracket — the hook only persists the result and updates state.
        const updated = advanceWinner(currentBracket, matchId, winnerId);

        await repository.save(updated);
        setBrackets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
        setCurrentBracket(updated);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to record winner';
        setError(message);
      }
    },
    [currentBracket, repository]
  );

  const deleteBracket = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await repository.delete(id);
        setBrackets((prev) => prev.filter((b) => b.id !== id));
        setCurrentBracket((prev) => (prev?.id === id ? null : prev));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete bracket';
        setError(message);
      }
    },
    [repository]
  );

  const selectBracket = useCallback(
    (id: string) => {
      const bracket = brackets.find((b) => b.id === id);
      if (bracket) {
        setCurrentBracket(bracket);
      }
    },
    [brackets]
  );

  return {
    brackets,
    currentBracket,
    isLoading,
    error,
    createBracket,
    selectBracket,
    recordWinner,
    deleteBracket,
  };
}
