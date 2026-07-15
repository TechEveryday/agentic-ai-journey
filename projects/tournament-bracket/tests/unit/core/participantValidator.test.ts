import { describe, it, expect } from 'vitest';
import { validateParticipantName } from '@/core/participantValidator';

describe('validateParticipantName', () => {
  it('should reject an empty name', () => {
    const result = validateParticipantName('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name cannot be empty');
  });

  it('should reject a whitespace-only name', () => {
    const result = validateParticipantName('   ');
    expect(result.valid).toBe(false);
  });

  it('should accept a valid name', () => {
    const result = validateParticipantName('Alice');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should reject a name over 100 characters', () => {
    const result = validateParticipantName('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name must be 100 characters or less');
  });

  it('should accept a name exactly 100 characters', () => {
    const result = validateParticipantName('a'.repeat(100));
    expect(result.valid).toBe(true);
  });
});
