'use client';

import { useActionState, useState } from 'react';
import SubmitButton from '@/components/auth/SubmitButton';
import { formatINR } from '@/lib/format';
import type { FormState } from '@/lib/form-state';

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  seatsLeft: number;
  pricePerSeat: number;
};

const emptyState: FormState = {};

export default function RequestForm({ action, seatsLeft, pricePerSeat }: Props) {
  const [state, formAction] = useActionState(action, emptyState);
  const [seats, setSeats] = useState(1);
  const maxSeats = Math.min(6, seatsLeft);

  return (
    <form action={formAction} className="mt-5" noValidate>
      <label className="block text-sm font-medium text-slate-700">
        Seats
        <select
          name="seats"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {Array.from({ length: maxSeats }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      {state.fieldErrors?.seats && <p className="mt-1 text-sm text-red-600">{state.fieldErrors.seats}</p>}

      <p className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatINR(pricePerSeat * seats)}</span>
      </p>

      {state.error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="mt-5">
        <SubmitButton pendingText="Sending...">Request to book</SubmitButton>
      </div>
    </form>
  );
}
