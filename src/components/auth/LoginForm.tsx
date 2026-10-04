'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { signInAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signInAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormField label="Email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={state.values?.email} error={errors.email} />
      <FormField label="Password" name="password" type="password" autoComplete="current-password" error={errors.password} />
      <p className="text-right text-sm">
        <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
          Forgot password?
        </Link>
      </p>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
    </form>
  );
}
