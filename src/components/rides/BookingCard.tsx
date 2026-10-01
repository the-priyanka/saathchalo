'use client';

import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { formatINR } from '@/lib/format';
import type { Ride } from '@/lib/types';

export default function BookingCard({ ride }: { ride: Ride }) {
  const [seats, setSeats] = useState(1);
  const [requested, setRequested] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-3xl font-bold text-brand-600">{formatINR(ride.pricePerSeat)}</p>
      <p className="text-sm text-slate-500">per seat</p>

      <label className="mt-5 block text-sm font-medium text-slate-700">
        Seats
        <select
          value={seats}
          onChange={(e) => {
            setSeats(Number(e.target.value));
            setRequested(false);
          }}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          {Array.from({ length: ride.seatsLeft }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatINR(ride.pricePerSeat * seats)}</span>
      </p>

      <button
        type="button"
        onClick={() => setRequested(true)}
        className="mt-5 w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Request to book
      </button>

      {requested && (
        <p role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-accent-50 p-3 text-sm text-accent-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Request sent for {seats} {seats === 1 ? 'seat' : 'seats'}. This is a demo, nothing is saved.
        </p>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Demo only: booking is simulated and no data is stored.
      </p>
    </div>
  );
}
