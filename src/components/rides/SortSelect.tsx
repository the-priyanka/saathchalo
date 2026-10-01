'use client';

import { useRouter } from 'next/navigation';
import { toSearchHref } from '@/lib/search-params';
import type { RideFilters, SearchQuery, SortKey } from '@/lib/types';

type Props = {
  query: SearchQuery;
  filters: RideFilters;
  sort: SortKey;
};

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'earliest', label: 'Earliest departure' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'best-rated', label: 'Best rated' },
];

export default function SortSelect({ query, filters, sort }: Props) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      Sort by
      <select
        value={sort}
        onChange={(e) =>
          router.push(toSearchHref(query, filters, e.target.value as SortKey), { scroll: false })
        }
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
