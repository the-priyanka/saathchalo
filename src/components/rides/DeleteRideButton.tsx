'use client';

import type { FormEvent } from 'react';

export default function DeleteRideButton({
  action,
  label = 'Delete ride',
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm('Delete this ride? This cannot be undone.')) event.preventDefault();
  }

  return (
    <form action={action} onSubmit={confirmDelete}>
      <button
        type="submit"
        aria-label={label}
        className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
