import { describe, it, expect } from 'vitest';
import { validateContact } from '@/core/contactValidator';
import type { ContactInput } from '@/core/contact';

function makeInput(overrides: Partial<ContactInput> = {}): ContactInput {
  return {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '',
    tags: [],
    ...overrides,
  };
}

describe('validateContact', () => {
  it('should validate a fully valid contact', () => {
    const result = validateContact(makeInput());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should require a non-empty first name', () => {
    const result = validateContact(makeInput({ firstName: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('First name is required');
  });

  it('should treat a whitespace-only first name as empty', () => {
    const result = validateContact(makeInput({ firstName: '   ' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('First name is required');
  });

  it('should require a non-empty last name', () => {
    const result = validateContact(makeInput({ lastName: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Last name is required');
  });

  it('should accept first name of exactly 100 characters', () => {
    const result = validateContact(makeInput({ firstName: 'a'.repeat(100) }));
    expect(result.valid).toBe(true);
  });

  it('should reject first name longer than 100 characters', () => {
    const result = validateContact(makeInput({ firstName: 'a'.repeat(101) }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('First name must be 100 characters or less');
  });

  it('should accept last name of exactly 100 characters', () => {
    const result = validateContact(makeInput({ lastName: 'a'.repeat(100) }));
    expect(result.valid).toBe(true);
  });

  it('should reject last name longer than 100 characters', () => {
    const result = validateContact(makeInput({ lastName: 'a'.repeat(101) }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Last name must be 100 characters or less');
  });

  it('should require at least one of email or phone', () => {
    const result = validateContact(makeInput({ email: '', phone: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one of email or phone is required');
  });

  it('should be valid with only email present', () => {
    const result = validateContact(makeInput({ email: 'ada@example.com', phone: '' }));
    expect(result.valid).toBe(true);
  });

  it('should be valid with only phone present', () => {
    const result = validateContact(makeInput({ email: '', phone: '555-123-4567' }));
    expect(result.valid).toBe(true);
  });

  it('should reject an invalid email format', () => {
    const result = validateContact(makeInput({ email: 'not-an-email' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email format is invalid');
  });

  it('should accept an email of exactly 254 characters', () => {
    const email = `${'a'.repeat(64)}@${'b'.repeat(185)}.com`;
    expect(email.length).toBe(254);

    const result = validateContact(makeInput({ email }));
    expect(result.valid).toBe(true);
  });

  it('should reject an email longer than 254 characters', () => {
    const email = `${'a'.repeat(65)}@${'b'.repeat(185)}.com`;
    expect(email.length).toBe(255);

    const result = validateContact(makeInput({ email }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email must be 254 characters or less');
  });

  it('should reject an invalid phone format', () => {
    const result = validateContact(makeInput({ email: '', phone: 'abc' }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Phone format is invalid');
  });

  it('should accept a phone of exactly 30 characters', () => {
    const phone = '1'.repeat(30);
    const result = validateContact(makeInput({ email: '', phone }));
    expect(result.valid).toBe(true);
  });

  it('should reject a phone longer than 30 characters', () => {
    const phone = '1'.repeat(31);
    const result = validateContact(makeInput({ email: '', phone }));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Phone must be 30 characters or less');
  });

  it('should accept phone numbers with common punctuation', () => {
    const result = validateContact(makeInput({ email: '', phone: '+1 (555) 123-4567' }));
    expect(result.valid).toBe(true);
  });

  it('should trim inputs before validating', () => {
    const result = validateContact(
      makeInput({ firstName: '  Ada  ', lastName: '  Lovelace  ', email: '  ada@example.com  ' })
    );
    expect(result.valid).toBe(true);
  });

  it('should collect all validation errors at once', () => {
    const result = validateContact(makeInput({ firstName: '', lastName: '', email: '', phone: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });
});
