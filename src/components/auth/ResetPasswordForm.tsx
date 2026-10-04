'use client';

import { useActionState } from 'react';
import { resetPasswordAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function ResetPasswordForm({ email }: { email: string }) {
  const [state, action] = useActionState(resetPasswordAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="email" value={email} />
      <FormField
        label="6 digit code"
        name="code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="123456"
        error={errors.code}
      />
      <FormField label="New password" name="password" type="password" autoComplete="new-password" error={errors.password} />
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="Saving...">Set new password</SubmitButton>
    </form>
  );
}
