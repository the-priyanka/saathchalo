import type { RideFilters, SearchQuery, SortKey, TimeOfDay } from './types';

export type RawParams = Record<string, string | string[] | undefined>;

export type ParsedSearch = {
  query: SearchQuery;
  filters: RideFilters;
  sort: SortKey;
};

const TIMES: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
const SORTS: SortKey[] = ['cheapest', 'earliest', 'best-rated'];

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function parseSearchParams(raw: RawParams): ParsedSearch {
  const get = (key: string): string | undefined => {
    const value = raw[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
  };
  const num = (key: string): number | undefined => {
    const value = get(key);
    return value !== undefined && Number.isFinite(Number(value)) ? Number(value) : undefined;
  };

  const date = get('date');
  const seats = num('seats');
  const query: SearchQuery = {
    from: get('from'),
    to: get('to'),
    date: date && isRealDate(date) ? date : undefined,
    seats: seats !== undefined && Number.isInteger(seats) && seats >= 1 && seats <= 6 ? seats : 1,
  };

  const filters: RideFilters = {};
  const maxPrice = num('maxPrice');
  if (maxPrice !== undefined && maxPrice > 0) filters.maxPrice = Math.round(maxPrice);
  const times = (get('time') ?? '')
    .split(',')
    .filter((t): t is TimeOfDay => TIMES.includes(t as TimeOfDay));
  if (times.length > 0) filters.timeOfDay = [...new Set(times)];
  const minRating = num('minRating');
  if (minRating !== undefined && minRating > 0 && minRating <= 5) filters.minRating = minRating;
  if (get('verified') === '1') filters.verifiedOnly = true;

  const sortValue = get('sort');
  const sort: SortKey = SORTS.includes(sortValue as SortKey) ? (sortValue as SortKey) : 'earliest';

  return { query, filters, sort };
}

export function toSearchHref(query: SearchQuery, filters: RideFilters, sort: SortKey): string {
  const params = new URLSearchParams();
  const from = query.from?.trim();
  const to = query.to?.trim();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (query.date) params.set('date', query.date);
  if (query.seats && query.seats > 1) params.set('seats', String(query.seats));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.timeOfDay?.length) params.set('time', filters.timeOfDay.join(','));
  if (filters.minRating) params.set('minRating', String(filters.minRating));
  if (filters.verifiedOnly) params.set('verified', '1');
  if (sort !== 'earliest') params.set('sort', sort);
  const queryString = params.toString();
  return queryString ? `/rides?${queryString}` : '/rides';
}
