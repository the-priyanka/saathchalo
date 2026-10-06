import { createPublicClient } from '@/lib/supabase/public';
import {
  aggregatePopularRoutes,
  escapeLike,
  filterByDriver,
  filterByTimeOfDay,
  istDayRange,
  sortRides,
} from './ride-filters';
import {
  mapProfile,
  mapRide,
  type ProfileRow,
  type RideWithDriverRow,
} from './ride-mapping';
import type {
  Driver,
  PopularRoute,
  RideFilters,
  RideWithDriver,
  SearchQuery,
  SortKey,
} from './types';

/** Postgres integer upper bound, so a crafted maxPrice cannot break the query. */
const MAX_PRICE_LIMIT = 2147483647;
const RIDE_SELECT = '*, driver:profiles(*)';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RidesUnavailableError extends Error {
  constructor(detail?: string) {
    super(`Rides could not be loaded${detail ? `: ${detail}` : ''}`);
    this.name = 'RidesUnavailableError';
  }
}

export async function searchRides(
  query: SearchQuery = {},
  filters: RideFilters = {},
  sort: SortKey = 'earliest',
): Promise<RideWithDriver[]> {
  const supabase = createPublicClient();
  let request = supabase
    .from('rides')
    .select(RIDE_SELECT)
    .eq('status', 'active')
    .gt('departure_time', new Date().toISOString());

  const from = query.from?.trim();
  if (from) request = request.ilike('from_city', escapeLike(from));
  const to = query.to?.trim();
  if (to) request = request.ilike('to_city', escapeLike(to));
  if (query.date) {
    const { start, end } = istDayRange(query.date);
    request = request.gte('departure_time', start).lt('departure_time', end);
  }
  if (query.seats) request = request.gte('seats_left', query.seats);
  if (filters.maxPrice !== undefined) request = request.lte('price_per_seat', Math.min(filters.maxPrice, MAX_PRICE_LIMIT));

  const { data, error } = await request;
  if (error) throw new RidesUnavailableError(error.message);

  const rides = (data as unknown as RideWithDriverRow[]).map(mapRide);
  return sortRides(filterByDriver(filterByTimeOfDay(rides, filters.timeOfDay), filters), sort);
}

export async function getRide(id: string): Promise<RideWithDriver | undefined> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('rides')
    .select(RIDE_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new RidesUnavailableError(error.message);
  return data ? mapRide(data as unknown as RideWithDriverRow) : undefined;
}

export async function getDriver(id: string): Promise<Driver | undefined> {
  if (!UUID_RE.test(id)) return undefined;
  const supabase = createPublicClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw new RidesUnavailableError(error.message);
  return data ? mapProfile(data as unknown as ProfileRow) : undefined;
}

export async function getPopularRoutes(): Promise<PopularRoute[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('rides')
    .select('from_city, to_city, price_per_seat')
    .eq('status', 'active')
    .gt('departure_time', new Date().toISOString());
  if (error) throw new RidesUnavailableError(error.message);

  const rows = data as unknown as { from_city: string; to_city: string; price_per_seat: number }[];
  return aggregatePopularRoutes(
    rows.map((row) => ({ from: row.from_city, to: row.to_city, pricePerSeat: row.price_per_seat })),
  );
}
