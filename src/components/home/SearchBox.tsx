'use client';

import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CITIES } from '@/lib/cities';
import { toSearchHref } from '@/lib/search-params';
import type { RideFilters, SearchQuery, SortKey } from '@/lib/types';

type Props = {
  initial?: SearchQuery;
  filters?: RideFilters;
  sort?: SortKey;
};

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200';

export default function SearchBox({ initial = {}, filters = {}, sort = 'earliest' }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(initial.from ?? '');
  const [to, setTo] = useState(initial.to ?? '');
  const [date, setDate] = useState(initial.date ?? '');
  const [seats, setSeats] = useState(initial.seats ?? 1);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(toSearchHref({ from, to, date: date || undefined, seats }, filters, sort));
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid max-w-5xl gap-3 rounded-2xl bg-white p-4 text-left shadow-lg ring-1 ring-slate-200 md:grid-cols-[1fr_1fr_1fr_7rem_auto] md:items-end"
    >
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">From</span>
        <span className="relative block">
          <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            list="saathchalo-cities"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Leaving from"
            className={fieldClass}
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">To</span>
        <span className="relative block">
          <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input
            list="saathchalo-cities"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Going to"
            className={fieldClass}
          />
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date</span>
        <span className="relative block">
          <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
        </span>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Seats</span>
        <span className="relative block">
          <Users className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
          <select value={seats} onChange={(e) => setSeats(Number(e.target.value))} className={fieldClass}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </span>
      </label>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        Search
      </button>

      <datalist id="saathchalo-cities">
        {CITIES.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </form>
  );
}
