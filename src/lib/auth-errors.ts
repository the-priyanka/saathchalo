const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is wrong.',
  email_not_confirmed: 'Please verify your email first.',
  user_already_exists: 'An account with this email already exists. Log in instead.',
  otp_expired: 'This code is wrong or has expired. Request a new one.',
  over_email_send_rate_limit: 'Too many emails sent. Please try again in a few minutes.',
  over_request_rate_limit: 'Too many attempts. Please try again in a few minutes.',
  weak_password: 'Choose a stronger password (at least 8 characters).',
  same_password: 'Choose a password different from your old one.',
};

export function authErrorMessage(
  code: string | undefined,
  fallback = 'Something went wrong. Please try again.',
): string {
  return (code && MESSAGES[code]) || fallback;
}
