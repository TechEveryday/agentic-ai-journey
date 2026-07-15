import type { ContactInput } from './contact';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[0-9\s\-().]{7,30}$/;

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 30;

export function validateContact(input: ContactInput): ValidationResult {
  const errors: string[] = [];

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();
  const phone = input.phone.trim();

  if (firstName.length === 0) {
    errors.push('First name is required');
  } else if (firstName.length > MAX_NAME_LENGTH) {
    errors.push(`First name must be ${MAX_NAME_LENGTH} characters or less`);
  }

  if (lastName.length === 0) {
    errors.push('Last name is required');
  } else if (lastName.length > MAX_NAME_LENGTH) {
    errors.push(`Last name must be ${MAX_NAME_LENGTH} characters or less`);
  }

  if (email.length === 0 && phone.length === 0) {
    errors.push('At least one of email or phone is required');
  }

  if (email.length > 0) {
    if (email.length > MAX_EMAIL_LENGTH) {
      errors.push(`Email must be ${MAX_EMAIL_LENGTH} characters or less`);
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('Email format is invalid');
    }
  }

  if (phone.length > 0) {
    if (phone.length > MAX_PHONE_LENGTH) {
      errors.push(`Phone must be ${MAX_PHONE_LENGTH} characters or less`);
    } else if (!PHONE_REGEX.test(phone)) {
      errors.push('Phone format is invalid');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
