import { describe, it, expect } from 'vitest';
import {
  validateMessageText,
  validateDisplayName,
  MAX_MESSAGE_TEXT_LENGTH,
} from '@/core/messageValidator';

describe('validateMessageText', () => {
  it('should validate empty string as invalid', () => {
    const result = validateMessageText('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message text cannot be empty');
  });

  it('should validate whitespace-only string as invalid', () => {
    const result = validateMessageText('   ');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Message text cannot be empty');
  });

  it('should validate non-empty string as valid', () => {
    const result = validateMessageText('Hello there');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept text of exactly the max length', () => {
    const text = 'a'.repeat(MAX_MESSAGE_TEXT_LENGTH);
    const result = validateMessageText(text);
    expect(result.valid).toBe(true);
  });

  it('should reject text longer than the max length', () => {
    const text = 'a'.repeat(MAX_MESSAGE_TEXT_LENGTH + 1);
    const result = validateMessageText(text);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      `Message text must be ${MAX_MESSAGE_TEXT_LENGTH} characters or less`
    );
  });

  it('should handle text with special characters', () => {
    const result = validateMessageText('Hello !@#$%^&*()');
    expect(result.valid).toBe(true);
  });
});

describe('validateDisplayName', () => {
  it('should validate empty string as invalid', () => {
    const result = validateDisplayName('');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Display name cannot be empty');
  });

  it('should validate whitespace-only string as invalid', () => {
    const result = validateDisplayName('   ');
    expect(result.valid).toBe(false);
  });

  it('should validate non-empty string as valid', () => {
    const result = validateDisplayName('Alex');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
