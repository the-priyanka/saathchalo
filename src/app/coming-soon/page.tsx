import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Coming soon' };

export default function ComingSoonPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">This part is coming soon</h1>
      <p className="mt-4 text-slate-600">
        Login, posting rides, and dashboards are planned for the next phase of SaathChalo. For now you
        can browse sample rides.
      </p>
      <Link
        href="/rides"
        className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700"
      >
        Find a ride
      </Link>
    </div>
  );
}
