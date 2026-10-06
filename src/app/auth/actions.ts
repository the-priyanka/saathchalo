'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { DEMO_EMAIL, getCurrentUser } from '@/lib/auth';
import { authErrorMessage } from '@/lib/auth-errors';
import {
  validateBio,
  validateEmail,
  validateLogin,
  validateOtpCode,
  validateReset,
  validateSignup,
} from '@/lib/auth-validation';
import { validatePhone } from '@/lib/booking-validation';
import { removePhone, savePhone } from '@/lib/contacts';
import type { FormState } from '@/lib/form-state';
import { safeNextPath } from '@/lib/safe-next';
import { createClient } from '@/lib/supabase/server';

const text = (formData: FormData, key: string) => String(formData.get(key) ?? '');

function verifyHref(email: string, next: string): string {
  const params = new URLSearchParams({ email });
  if (next !== '/account') params.set('next', next);
  return `/verify?${params.toString()}`;
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, 'email').trim(), fullName: text(formData, 'fullName').trim() };
  const parsed = validateSignup({
    fullName: text(formData, 'fullName'),
    email: text(formData, 'email'),
    password: text(formData, 'password'),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors, values };
  const next = safeNextPath(text(formData, 'next'));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.value.email,
    password: parsed.value.password,
    options: { data: { full_name: parsed.value.fullName } },
  });
  if (error) return { error: authErrorMessage(error.code), values };
  // With email confirmation on, Supabase hides existing accounts by returning a user without identities.
  if (data.user && data.user.identities?.length === 0) {
    return { error: authErrorMessage('user_already_exists'), values };
  }
  redirect(verifyHref(parsed.value.email, next));
}

export async function verifyOtpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = validateEmail(text(formData, 'email'));
  const code = validateOtpCode(text(formData, 'code'));
  if (!email.ok) return { error: 'We could not read your email address. Please sign up again.' };
  if (!code.ok) return { fieldErrors: code.errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.value,
    token: code.value,
    type: 'signup',
  });
  if (error) return { error: authErrorMessage(error.code) };
  redirect(safeNextPath(text(formData, 'next')));
}

export async function resendOtpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = validateEmail(text(formData, 'email'));
  if (!email.ok) return { error: 'We could not read your email address. Please sign up again.' };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: 'signup', email: email.value });
  if (error) return { error: authErrorMessage(error.code) };
  return { message: 'A new code was sent to your email.', sentAt: Date.now() };
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { email: text(formData, 'email').trim() };
  const parsed = validateLogin({
    email: text(formData, 'email'),
    password: text(formData, 'password'),
  });
  if (!parsed.ok) return { fieldErrors: parsed.errors, values };
  const next = safeNextPath(text(formData, 'next'));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.value);
  if (error) {
    if (error.code === 'email_not_confirmed') {
      await supabase.auth.resend({ type: 'signup', email: parsed.value.email });
      redirect(verifyHref(parsed.value.email, next));
    }
    return { error: authErrorMessage(error.code), values };
  }
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/');
}

export async function requestResetAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = validateEmail(text(formData, 'email'));
  const values = { email: text(formData, 'email').trim() };
  if (!email.ok) return { fieldErrors: email.errors, values };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.value);
  // Only the IP-scoped limit is surfaced. The per-email limit (over_email_send_rate_limit) applies only to
  // real accounts, so returning it would reveal whether an email is registered. Every other error falls
  // through to the same redirect as success.
  if (error && error.code === 'over_request_rate_limit') {
    return { error: authErrorMessage(error.code), values };
  }
  redirect(`/reset-password?email=${encodeURIComponent(email.value)}`);
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = validateReset({
    email: text(formData, 'email'),
    code: text(formData, 'code'),
    password: text(formData, 'password'),
  });
  if (!parsed.ok) {
    // The reset form has no email field, so an email error means the page itself is broken.
    if (parsed.errors.email) {
      return { error: 'Something is wrong with this page. Request a new code from Forgot password.' };
    }
    return { fieldErrors: parsed.errors };
  }

  const supabase = await createClient();
  const verified = await supabase.auth.verifyOtp({
    email: parsed.value.email,
    token: parsed.value.code,
    type: 'recovery',
  });
  if (verified.error) return { error: authErrorMessage(verified.error.code) };

  const updated = await supabase.auth.updateUser({ password: parsed.value.password });
  if (updated.error) {
    return {
      error:
        authErrorMessage(updated.error.code) +
        ' Your code was already used, so please request a new one from the Forgot password page.',
    };
  }
  redirect('/account');
}

export async function updateBioAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const parsed = validateBio(text(formData, 'bio'));
  if (!parsed.ok) return { fieldErrors: parsed.errors };

  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ bio: parsed.value }).eq('id', user.id);
  if (error) return { error: 'Could not save your bio. Please try again.' };
  revalidatePath('/account');
  return { message: 'Saved.' };
}

export async function updatePhoneAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  if (user.email.toLowerCase() === DEMO_EMAIL) {
    return { error: 'Phone numbers are not available on the shared demo account.' };
  }

  const raw = text(formData, 'phone');
  const parsed = validatePhone(raw);
  if (!parsed.ok) return { fieldErrors: parsed.errors, values: { phone: raw } };

  try {
    if (parsed.value === null) await removePhone(user.id);
    else await savePhone(user.id, parsed.value);
  } catch {
    return { error: 'Could not save your phone number. Please try again.', values: { phone: raw } };
  }
  revalidatePath('/account');
  return {
    message: parsed.value === null ? 'Phone number removed.' : 'Saved.',
    values: { phone: parsed.value ?? '' },
  };
}
