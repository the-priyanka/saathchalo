'use client';

import type { FormEvent } from 'react';

export default function CancelRideButton({
  action,
  label = 'Cancel ride',
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  function confirmCancel(event: FormEvent<HTMLFormElement>) {
    const message =
      'Cancel this ride? Passengers with a pending or accepted booking will see it as cancelled by the driver.';
    if (!window.confirm(message)) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmCancel}>
      <button
        type="submit"
        aria-label={label}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Cancel ride
      </button>
    </form>
  );
}
