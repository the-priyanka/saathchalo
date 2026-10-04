'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, pendingText = 'Please wait...' }: { children: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}
