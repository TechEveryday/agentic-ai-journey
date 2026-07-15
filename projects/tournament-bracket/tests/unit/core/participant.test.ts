import { describe, it, expect } from 'vitest';
import { createParticipant } from '@/core/participant';

describe('createParticipant', () => {
  it('should create a participant with the given name and seed', () => {
    const participant = createParticipant('Alice', 1);

    expect(participant.id).toBeDefined();
    expect(participant.name).toBe('Alice');
    expect(participant.seed).toBe(1);
  });

  it('should trim whitespace from name', () => {
    const participant = createParticipant('  Bob  ', 2);
    expect(participant.name).toBe('Bob');
  });

  it('should generate unique IDs', () => {
    const p1 = createParticipant('Alice', 1);
    const p2 = createParticipant('Bob', 2);
    expect(p1.id).not.toBe(p2.id);
  });
});
