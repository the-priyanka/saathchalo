import type { Metadata } from 'next';
import SearchBox from '@/components/home/SearchBox';
import EmptyState from '@/components/rides/EmptyState';
import Filters from '@/components/rides/Filters';
import RideCard from '@/components/rides/RideCard';
import SortSelect from '@/components/rides/SortSelect';
import { formatDate } from '@/lib/format';
import { searchRides } from '@/lib/rides';
import { parseSearchParams, toSearchHref, type RawParams } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Find a ride' };

function buildHeading(query: { from?: string; to?: string; date?: string }) {
  let base = 'All upcoming rides';
  if (query.from && query.to) base = `${query.from} to ${query.to}`;
  else if (query.from) base = `Rides from ${query.from}`;
  else if (query.to) base = `Rides to ${query.to}`;
  return query.date ? `${base} on ${formatDate(`${query.date}T00:00:00+05:30`)}` : base;
}

export default async function RidesPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const { query, filters, sort } = parseSearchParams(await searchParams);
  const rides = await searchRides(query, filters, sort);

  const heading = buildHeading(query);

  const hasFilters = Object.keys(filters).length > 0;
  const emptyAction = hasFilters
    ? { href: toSearchHref(query, {}, sort), label: 'Clear filters' }
    : query.date
      ? { href: toSearchHref({ ...query, date: undefined }, {}, sort), label: 'Search any date' }
      : { href: '/rides', label: 'See all upcoming rides' };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBox key={JSON.stringify(query)} initial={query} filters={filters} sort={sort} />

      <div className="mt-8 grid gap-6 md:grid-cols-[16rem_1fr]">
        <Filters query={query} filters={filters} sort={sort} />

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{heading}</h1>
              <p className="text-sm text-slate-500">
                {rides.length} {rides.length === 1 ? 'ride' : 'rides'} found
              </p>
            </div>
            <SortSelect query={query} filters={filters} sort={sort} />
          </div>

          {rides.length === 0 ? (
            <EmptyState href={emptyAction.href} label={emptyAction.label} />
          ) : (
            <ul className="space-y-4">
              {rides.map((ride) => (
                <li key={ride.id}>
                  <RideCard ride={ride} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
