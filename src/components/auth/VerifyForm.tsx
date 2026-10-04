'use client';

import { useActionState, useEffect, useState } from 'react';
import { resendOtpAction, verifyOtpAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};
const COOLDOWN_SECONDS = 60;

function ResendCode({ email }: { email: string }) {
  const [state, action, pending] = useActionState(resendOtpAction, initial);
  const [mountedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // The first code was just sent, so the cooldown starts when this page opens.
  const startedAt = state.sentAt ?? mountedAt;
  const remaining = Math.max(0, COOLDOWN_SECONDS - Math.floor((now - startedAt) / 1000));

  return (
    <form action={action} className="mt-4 text-sm text-slate-600">
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending || remaining > 0}
        className="font-semibold text-brand-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
      >
        {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
      </button>
      {state.message && <p role="status" className="mt-2 text-accent-700">{state.message}</p>}
      {state.error && <p role="alert" className="mt-2 text-red-600">{state.error}</p>}
    </form>
  );
}

export default function VerifyForm({ email, next }: { email: string; next: string }) {
  const [state, action] = useActionState(verifyOtpAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <>
      <form action={action} className="space-y-4" noValidate>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <FormField
          label="6 digit code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          error={errors.code}
        />
        {state.error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </p>
        )}
        <SubmitButton pendingText="Verifying...">Verify email</SubmitButton>
      </form>
      <ResendCode email={email} />
    </>
  );
}
