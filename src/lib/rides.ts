import { drivers } from '@/data/drivers';
import { buildRides } from '@/data/rides';
import type {
  Driver,
  PopularRoute,
  Ride,
  RideFilters,
  RideWithDriver,
  SearchQuery,
  SortKey,
  TimeOfDay,
} from './types';

const normalize = (value: string) => value.trim().toLowerCase();

/** Departure times carry the IST offset, so the hour in the string is the IST hour. */
function timeOfDayOf(ride: Ride): TimeOfDay {
  const hour = Number(ride.departureTime.slice(11, 13));
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

function attachDriver(ride: Ride): RideWithDriver {
  const driver = drivers.find((d) => d.id === ride.driverId);
  if (!driver) throw new Error(`Ride ${ride.id} references unknown driver ${ride.driverId}`);
  return { ...ride, driver };
}

const comparators: Record<SortKey, (a: RideWithDriver, b: RideWithDriver) => number> = {
  earliest: (a, b) => a.departureTime.localeCompare(b.departureTime),
  cheapest: (a, b) =>
    a.pricePerSeat - b.pricePerSeat || a.departureTime.localeCompare(b.departureTime),
  'best-rated': (a, b) =>
    b.driver.rating - a.driver.rating || a.departureTime.localeCompare(b.departureTime),
};

export async function searchRides(
  query: SearchQuery = {},
  filters: RideFilters = {},
  sort: SortKey = 'earliest',
): Promise<RideWithDriver[]> {
  return buildRides(new Date())
    .map(attachDriver)
    .filter((r) => !query.from || normalize(r.from) === normalize(query.from))
    .filter((r) => !query.to || normalize(r.to) === normalize(query.to))
    .filter((r) => !query.date || r.departureTime.slice(0, 10) === query.date)
    .filter((r) => !query.seats || r.seatsLeft >= query.seats)
    .filter((r) => filters.maxPrice === undefined || r.pricePerSeat <= filters.maxPrice)
    .filter((r) => !filters.timeOfDay?.length || filters.timeOfDay.includes(timeOfDayOf(r)))
    .filter((r) => filters.minRating === undefined || r.driver.rating >= filters.minRating)
    .filter((r) => !filters.verifiedOnly || r.driver.verified)
    .sort(comparators[sort]);
}

export async function getRide(id: string): Promise<RideWithDriver | undefined> {
  const ride = buildRides(new Date()).find((r) => r.id === id);
  return ride ? attachDriver(ride) : undefined;
}

export async function getDriver(id: string): Promise<Driver | undefined> {
  return drivers.find((d) => d.id === id);
}

export async function getPopularRoutes(): Promise<PopularRoute[]> {
  const byRoute = new Map<string, PopularRoute>();
  for (const ride of buildRides(new Date())) {
    const key = `${ride.from}|${ride.to}`;
    const existing = byRoute.get(key);
    if (existing) {
      existing.rideCount += 1;
      existing.startingPrice = Math.min(existing.startingPrice, ride.pricePerSeat);
    } else {
      byRoute.set(key, {
        from: ride.from,
        to: ride.to,
        startingPrice: ride.pricePerSeat,
        rideCount: 1,
      });
    }
  }
  return [...byRoute.values()]
    .sort(
      (a, b) =>
        b.rideCount - a.rideCount ||
        a.startingPrice - b.startingPrice ||
        a.from.localeCompare(b.from),
    )
    .slice(0, 6);
}
