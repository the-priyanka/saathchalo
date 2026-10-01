import type { Metadata } from 'next';
import SearchBox from '@/components/home/SearchBox';
import EmptyState from '@/components/rides/EmptyState';
import Filters from '@/components/rides/Filters';
import RideCard from '@/components/rides/RideCard';
import SortSelect from '@/components/rides/SortSelect';
import { searchRides } from '@/lib/rides';
import { parseSearchParams, toSearchHref, type RawParams } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Find a ride' };

export default async function RidesPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const { query, filters, sort } = parseSearchParams(await searchParams);
  const rides = await searchRides(query, filters, sort);

  const heading = query.from && query.to ? `${query.from} to ${query.to}` : 'All upcoming rides';

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
            <EmptyState clearHref={toSearchHref(query, {}, sort)} />
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
