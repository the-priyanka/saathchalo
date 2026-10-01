import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatINR } from '@/lib/format';
import { getPopularRoutes } from '@/lib/rides';
import { toSearchHref } from '@/lib/search-params';

export default async function PopularRoutes() {
  const routes = await getPopularRoutes();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Popular routes</h2>
      <p className="mt-2 text-slate-600">Where people are travelling right now.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <li key={`${route.from}-${route.to}`}>
            <Link
              href={toSearchHref({ from: route.from, to: route.to }, {}, 'earliest')}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-md"
            >
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-900">
                  {route.from}
                  <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  {route.to}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {route.rideCount} {route.rideCount === 1 ? 'ride' : 'rides'}
                </p>
              </div>
              <p className="text-right">
                <span className="block text-xs text-slate-500">from</span>
                <span className="text-lg font-bold text-brand-600">{formatINR(route.startingPrice)}</span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
