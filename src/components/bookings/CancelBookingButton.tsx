'use client';

import type { FormEvent } from 'react';

export default function CancelBookingButton({
  action,
  label = 'Cancel booking',
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  function confirmCancel(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm('Cancel this booking?')) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmCancel}>
      <button
        type="submit"
        aria-label={label}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Cancel booking
      </button>
    </form>
  );
}
