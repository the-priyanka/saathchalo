'use client';

import { useActionState } from 'react';
import { updateBioAction } from '@/app/auth/actions';
import type { FormState } from '@/lib/form-state';
import SubmitButton from './SubmitButton';

const initial: FormState = {};

export default function BioForm({ bio }: { bio: string }) {
  const [state, action] = useActionState(updateBioAction, initial);
  const error = state.fieldErrors?.bio;

  return (
    <form action={action} className="space-y-3">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">Bio</span>
        <textarea
          name="bio"
          rows={4}
          maxLength={300}
          defaultValue={bio}
          placeholder="Tell other travellers a little about yourself."
          aria-invalid={error ? true : undefined}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
      </label>
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
        <SubmitButton pendingText="Saving...">Save bio</SubmitButton>
      </div>
    </form>
  );
}
