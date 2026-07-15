import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useBracket } from '@/application';
import { createParticipant, generateBracket, type Participant } from '@/core';
import { MockBracketRepository } from './MockBracketRepository';

function makeParticipants(count: number): Participant[] {
  return Array.from({ length: count }, (_, i) => createParticipant(`Player ${i + 1}`, i + 1));
}

describe('useBracket hook (integration)', () => {
  let mockRepo: MockBracketRepository;

  beforeEach(() => {
    mockRepo = new MockBracketRepository();
  });

  it('should load brackets on mount', async () => {
    const bracket = generateBracket('Existing', makeParticipants(2));
    await mockRepo.save(bracket);

    const { result } = renderHook(() => useBracket(mockRepo));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.brackets).toHaveLength(1);
    expect(result.current.currentBracket?.name).toBe('Existing');
    expect(result.current.error).toBeNull();
  });

  it('should show no current bracket when repository is empty', async () => {
    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.brackets).toEqual([]);
    expect(result.current.currentBracket).toBeNull();
  });

  it('should create a bracket via the core factory and persist it', async () => {
    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createBracket('New Tournament', makeParticipants(4));
    });

    await waitFor(() => {
      expect(result.current.brackets).toHaveLength(1);
    });

    expect(result.current.currentBracket?.name).toBe('New Tournament');
    expect(result.current.currentBracket?.matches).toHaveLength(3);

    const persisted = await mockRepo.getAll();
    expect(persisted).toHaveLength(1);
  });

  it('should surface an error when creating a bracket with fewer than 2 participants', async () => {
    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createBracket('Too Few', makeParticipants(1));
    });

    expect(result.current.brackets).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
  });

  it('should record a winner and propagate to the next round', async () => {
    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createBracket('Four Player', makeParticipants(4));
    });

    await waitFor(() => {
      expect(result.current.currentBracket).not.toBeNull();
    });

    const match = result.current.currentBracket!.matches.find((m) => m.round === 1)!;
    const winnerId = match.participantA!;

    await act(async () => {
      await result.current.recordWinner(match.id, winnerId);
    });

    await waitFor(() => {
      const updatedMatch = result.current.currentBracket!.matches.find((m) => m.id === match.id)!;
      expect(updatedMatch.winnerId).toBe(winnerId);
    });
  });

  it('should surface an error when recording a winner with no current bracket', async () => {
    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.recordWinner('any-match', 'any-winner');
    });

    expect(result.current.error).toBe('No bracket selected');
  });

  it('should select a different bracket by id', async () => {
    const b1 = generateBracket('Bracket One', makeParticipants(2));
    const b2 = generateBracket('Bracket Two', makeParticipants(2));
    await mockRepo.save(b1);
    await mockRepo.save(b2);

    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.selectBracket(b1.id);
    });

    expect(result.current.currentBracket?.id).toBe(b1.id);
  });

  it('should delete a bracket and clear currentBracket if it was selected', async () => {
    const bracket = generateBracket('To Delete', makeParticipants(2));
    await mockRepo.save(bracket);

    const { result } = renderHook(() => useBracket(mockRepo));

    await waitFor(() => {
      expect(result.current.currentBracket?.id).toBe(bracket.id);
    });

    await act(async () => {
      await result.current.deleteBracket(bracket.id);
    });

    await waitFor(() => {
      expect(result.current.brackets).toHaveLength(0);
    });

    expect(result.current.currentBracket).toBeNull();
  });
});
