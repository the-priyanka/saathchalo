'use client';

import { useActionState } from 'react';
import { requestResetAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function ForgotPasswordForm() {
  const [state, action] = useActionState(requestResetAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={errors.email} />
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="Sending code...">Send code</SubmitButton>
    </form>
  );
}
