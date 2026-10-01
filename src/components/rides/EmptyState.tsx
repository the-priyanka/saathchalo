import { SearchX } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState({ href, label }: { href: string; label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center">
      <SearchX className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
      <h2 className="mt-4 text-lg font-semibold text-slate-900">No rides found</h2>
      <p className="mt-2 text-slate-600">
        Try a different date, remove a filter, or search another route.
      </p>
      <Link
        href={href}
        className="mt-6 inline-block rounded-full bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        {label}
      </Link>
    </div>
  );
}
