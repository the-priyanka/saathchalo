'use client';

import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toSearchHref } from '@/lib/search-params';
import type { RideFilters, SearchQuery, SortKey, TimeOfDay } from '@/lib/types';

type Props = {
  query: SearchQuery;
  filters: RideFilters;
  sort: SortKey;
};

const TIMES: { value: TimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning (5 AM to 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM to 5 PM)' },
  { value: 'evening', label: 'Evening (after 5 PM)' },
];

const selectClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

export default function Filters({ query, filters, sort }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function update(next: RideFilters) {
    router.push(toSearchHref(query, next, sort), { scroll: false });
  }

  function toggleTime(time: TimeOfDay) {
    const current = filters.timeOfDay ?? [];
    const next = current.includes(time) ? current.filter((t) => t !== time) : [...current, time];
    update({ ...filters, timeOfDay: next.length > 0 ? next : undefined });
  }

  return (
    <aside>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
      </button>

      <div className={`${open ? 'block' : 'hidden'} mt-4 space-y-5 md:mt-0 md:block`}>
        <h2 className="hidden text-lg font-semibold text-slate-900 md:block">Filters</h2>

        <label className="block text-sm font-medium text-slate-700">
          Max price per seat
          <select
            className={selectClass}
            value={String(filters.maxPrice ?? '')}
            onChange={(e) =>
              update({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Any price</option>
            <option value="300">Up to ₹300</option>
            <option value="500">Up to ₹500</option>
            <option value="800">Up to ₹800</option>
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Departure time</legend>
          <div className="mt-2 space-y-2">
            {TIMES.map((time) => (
              <label key={time.value} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filters.timeOfDay?.includes(time.value) ?? false}
                  onChange={() => toggleTime(time.value)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                {time.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-slate-700">
          Driver rating
          <select
            className={selectClass}
            value={String(filters.minRating ?? '')}
            onChange={(e) =>
              update({ ...filters, minRating: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">Any rating</option>
            <option value="4">4.0 and above</option>
            <option value="4.5">4.5 and above</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.verifiedOnly ?? false}
            onChange={(e) => update({ ...filters, verifiedOnly: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          Verified drivers only
        </label>

        <Link
          href={toSearchHref(query, {}, sort)}
          scroll={false}
          className="inline-block text-sm font-semibold text-brand-600 hover:underline"
        >
          Clear filters
        </Link>
      </div>
    </aside>
  );
}
