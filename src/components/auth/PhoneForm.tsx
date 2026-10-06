'use client';

import { useActionState } from 'react';
import { updatePhoneAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import FormField from './FormField';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function PhoneForm({ phone }: { phone: string }) {
  const [state, action] = useActionState(updatePhoneAction, initial);
  const error = state.fieldErrors?.phone;

  return (
    <form action={action} className="space-y-3" noValidate>
      <FormField
        label="Phone number (optional)"
        name="phone"
        type="tel"
        inputMode="text"
        autoComplete="tel"
        defaultValue={state.values?.phone ?? phone}
        placeholder="For example +91 98765 43210"
        error={error}
      />
      <p className="text-xs text-slate-500">
        Shown only to the other person of a booking you both agreed on (the driver, or an accepted passenger). Leave it
        empty to remove it.
      </p>
      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="text-sm text-accent-700">
          {state.message}
        </p>
      )}
      <div className="sm:w-40">
        <SubmitButton pendingText="Saving...">Save phone</SubmitButton>
      </div>
    </form>
  );
}
