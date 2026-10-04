import { describe, expect, it } from 'vitest';
import { authErrorMessage } from '@/lib/auth-errors';

describe('authErrorMessage', () => {
  it('maps known Supabase codes', () => {
    expect(authErrorMessage('invalid_credentials')).toBe('Email or password is wrong.');
    expect(authErrorMessage('otp_expired')).toBe('This code is wrong or has expired. Request a new one.');
    expect(authErrorMessage('over_email_send_rate_limit')).toBe(
      'Too many emails sent. Please try again in a few minutes.',
    );
    expect(authErrorMessage('user_already_exists')).toBe(
      'An account with this email already exists. Log in instead.',
    );
  });

  it('falls back for unknown or missing codes', () => {
    expect(authErrorMessage('something_new')).toBe('Something went wrong. Please try again.');
    expect(authErrorMessage(undefined)).toBe('Something went wrong. Please try again.');
    expect(authErrorMessage('something_new', 'Custom')).toBe('Custom');
  });
});
