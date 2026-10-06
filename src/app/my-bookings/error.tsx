'use client';

export default function MyBookingsError({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Your bookings could not be loaded right now</h1>
      <p className="mt-3 text-slate-600">Please try again in a moment.</p>
      <button
        type="button"
        onClick={retry}
        className="mt-6 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
