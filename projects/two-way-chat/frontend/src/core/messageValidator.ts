export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Server enforces the same limit — see Chat.Domain/MessageValidator.cs. */
export const MAX_MESSAGE_TEXT_LENGTH = 1000;

/**
 * Pure client-side pre-validation for message text. Mirrors the rules
 * enforced server-side in MessageValidator.ValidateText so users get instant
 * feedback before a round trip — the server remains the source of truth.
 */
export function validateMessageText(text: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    errors.push('Message text cannot be empty');
  }

  if (trimmed.length > MAX_MESSAGE_TEXT_LENGTH) {
    errors.push(`Message text must be ${MAX_MESSAGE_TEXT_LENGTH} characters or less`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateDisplayName(displayName: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = displayName.trim();

  if (trimmed.length === 0) {
    errors.push('Display name cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
