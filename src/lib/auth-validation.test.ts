import { describe, expect, it } from 'vitest';
import {
  validateBio,
  validateEmail,
  validateLogin,
  validateOtpCode,
  validateReset,
  validateSignup,
} from '@/lib/auth-validation';

describe('validateSignup', () => {
  it('trims the name and normalizes the email', () => {
    expect(
      validateSignup({ fullName: '  Priya  ', email: ' PRIYA@Example.com ', password: 'longenough' }),
    ).toEqual({
      ok: true,
      value: { fullName: 'Priya', email: 'priya@example.com', password: 'longenough' },
    });
  });

  it('reports every invalid field', () => {
    const result = validateSignup({ fullName: ' ', email: 'nope', password: 'short' });
    expect(result).toEqual({
      ok: false,
      errors: {
        fullName: 'Enter your full name.',
        email: 'Enter a valid email address.',
        password: 'Password must be at least 8 characters.',
      },
    });
  });
});

describe('validateLogin', () => {
  it('needs a valid email and a password', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' }).ok).toBe(true);
    expect(validateLogin({ email: 'bad', password: '' })).toEqual({
      ok: false,
      errors: { email: 'Enter a valid email address.', password: 'Enter your password.' },
    });
  });
});

describe('validateEmail', () => {
  it('normalizes a valid email', () => {
    expect(validateEmail(' A@B.co ')).toEqual({ ok: true, value: 'a@b.co' });
  });
  it('rejects an invalid email', () => {
    expect(validateEmail('a@b')).toEqual({ ok: false, errors: { email: 'Enter a valid email address.' } });
  });
});

describe('validateOtpCode', () => {
  it('accepts 6 digits and strips spaces', () => {
    expect(validateOtpCode(' 123 456 ')).toEqual({ ok: true, value: '123456' });
  });
  it('rejects other input', () => {
    const error = { ok: false, errors: { code: 'Enter the 6 digit code from your email.' } };
    expect(validateOtpCode('12345')).toEqual(error);
    expect(validateOtpCode('abcdef')).toEqual(error);
    expect(validateOtpCode('1234567')).toEqual(error);
  });
});

describe('validateReset', () => {
  it('validates email, code, and the new password together', () => {
    expect(validateReset({ email: 'A@b.co', code: '123456', password: 'longenough' })).toEqual({
      ok: true,
      value: { email: 'a@b.co', code: '123456', password: 'longenough' },
    });
    expect(validateReset({ email: 'bad', code: '1', password: 'short' })).toEqual({
      ok: false,
      errors: {
        email: 'Enter a valid email address.',
        code: 'Enter the 6 digit code from your email.',
        password: 'Password must be at least 8 characters.',
      },
    });
  });
});

describe('validateBio', () => {
  it('trims and accepts up to 300 characters', () => {
    expect(validateBio('  hello ')).toEqual({ ok: true, value: 'hello' });
    expect(validateBio('a'.repeat(300)).ok).toBe(true);
  });
  it('rejects more than 300 characters', () => {
    expect(validateBio('a'.repeat(301))).toEqual({
      ok: false,
      errors: { bio: 'Bio can be at most 300 characters.' },
    });
  });
});
