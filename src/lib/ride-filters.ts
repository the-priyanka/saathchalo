import type { PopularRoute, Ride, RideWithDriver, SortKey, TimeOfDay } from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Departure times carry the IST offset, so the hour in the string is the IST hour. */
export function timeOfDayOf(ride: { departureTime: string }): TimeOfDay {
  const hour = Number(ride.departureTime.slice(11, 13));
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

export function filterByTimeOfDay<T extends { departureTime: string }>(
  rides: T[],
  times?: TimeOfDay[],
): T[] {
  if (!times?.length) return rides;
  return rides.filter((ride) => times.includes(timeOfDayOf(ride)));
}

export function filterByDriver<T extends { driver: { rating: number; verified: boolean } }>(
  rides: T[],
  filters: { minRating?: number; verifiedOnly?: boolean },
): T[] {
  return rides
    .filter((ride) => filters.minRating === undefined || ride.driver.rating >= filters.minRating)
    .filter((ride) => !filters.verifiedOnly || ride.driver.verified);
}

const comparators: Record<SortKey, (a: RideWithDriver, b: RideWithDriver) => number> = {
  earliest: (a, b) => a.departureTime.localeCompare(b.departureTime),
  cheapest: (a, b) =>
    a.pricePerSeat - b.pricePerSeat || a.departureTime.localeCompare(b.departureTime),
  'best-rated': (a, b) =>
    b.driver.rating - a.driver.rating || a.departureTime.localeCompare(b.departureTime),
};

export function sortRides<T extends RideWithDriver>(rides: T[], sort: SortKey): T[] {
  return [...rides].sort(comparators[sort]);
}

export function aggregatePopularRoutes(
  rides: Pick<Ride, 'from' | 'to' | 'pricePerSeat'>[],
): PopularRoute[] {
  const byRoute = new Map<string, PopularRoute>();
  for (const ride of rides) {
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

export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** The UTC instants that bound one IST calendar day, for example 2026-10-02. */
export function istDayRange(date: string): { start: string; end: string } {
  const start = new Date(`${date}T00:00:00+05:30`);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + DAY_MS).toISOString(),
  };
}
