export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateParticipantName(name: string): ValidationResult {
  const errors: string[] = [];
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    errors.push('Name cannot be empty');
  }

  if (trimmed.length > 100) {
    errors.push('Name must be 100 characters or less');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
