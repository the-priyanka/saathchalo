export type Validation<T, K extends string> =
  | { ok: true; value: T }
  | { ok: false; errors: Partial<Record<K, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_BIO = 300;
const MAX_NAME = 80;

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const EMAIL_ERROR = 'Enter a valid email address.';
const PASSWORD_ERROR = `Password must be at least ${MIN_PASSWORD} characters.`;
const CODE_ERROR = 'Enter the 6 digit code from your email.';

function finish<T, K extends string>(errors: Partial<Record<K, string>>, value: T): Validation<T, K> {
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, value };
}

export function validateSignup(input: { fullName: string; email: string; password: string }) {
  const errors: Partial<Record<'fullName' | 'email' | 'password', string>> = {};
  const fullName = input.fullName.trim();
  const email = normalizeEmail(input.email);
  if (!fullName) errors.fullName = 'Enter your full name.';
  else if (fullName.length > MAX_NAME) errors.fullName = `Name can be at most ${MAX_NAME} characters.`;
  if (!EMAIL_RE.test(email)) errors.email = EMAIL_ERROR;
  if (input.password.length < MIN_PASSWORD) errors.password = PASSWORD_ERROR;
  return finish(errors, { fullName, email, password: input.password });
}

export function validateLogin(input: { email: string; password: string }) {
  const errors: Partial<Record<'email' | 'password', string>> = {};
  const email = normalizeEmail(input.email);
  if (!EMAIL_RE.test(email)) errors.email = EMAIL_ERROR;
  if (!input.password) errors.password = 'Enter your password.';
  return finish(errors, { email, password: input.password });
}

export function validateEmail(raw: string) {
  const email = normalizeEmail(raw);
  const errors: Partial<Record<'email', string>> = {};
  if (!EMAIL_RE.test(email)) errors.email = EMAIL_ERROR;
  return finish(errors, email);
}

export function validateOtpCode(raw: string) {
  const code = raw.replace(/\s+/g, '');
  const errors: Partial<Record<'code', string>> = {};
  if (!/^\d{6}$/.test(code)) errors.code = CODE_ERROR;
  return finish(errors, code);
}

export function validateReset(input: { email: string; code: string; password: string }) {
  const errors: Partial<Record<'email' | 'code' | 'password', string>> = {};
  const email = normalizeEmail(input.email);
  const code = input.code.replace(/\s+/g, '');
  if (!EMAIL_RE.test(email)) errors.email = EMAIL_ERROR;
  if (!/^\d{6}$/.test(code)) errors.code = CODE_ERROR;
  if (input.password.length < MIN_PASSWORD) errors.password = PASSWORD_ERROR;
  return finish(errors, { email, code, password: input.password });
}

export function validateBio(raw: string) {
  const bio = raw.trim();
  const errors: Partial<Record<'bio', string>> = {};
  if (bio.length > MAX_BIO) errors.bio = `Bio can be at most ${MAX_BIO} characters.`;
  return finish(errors, bio);
}
