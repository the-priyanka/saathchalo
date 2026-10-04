'use client';

import { useActionState } from 'react';
import { signUpAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUpAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormField label="Full name" name="fullName" autoComplete="name" defaultValue={state.values?.fullName} error={errors.fullName} />
      <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={errors.email} />
      <FormField label="Password" name="password" type="password" autoComplete="new-password" error={errors.password} />
      <p className="text-xs text-slate-500">At least 8 characters. We will email you a 6 digit code to verify your address.</p>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
    </form>
  );
}
