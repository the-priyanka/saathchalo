import { describe, expect, it } from 'vitest';
import { drivers } from '@/data/drivers';
import { buildRides } from '@/data/rides';
import {
  aggregatePopularRoutes,
  escapeLike,
  filterByDriver,
  filterByTimeOfDay,
  istDayRange,
  sortRides,
  timeOfDayOf,
} from '@/lib/ride-filters';
import type { RideWithDriver } from '@/lib/types';

const NOW = new Date('2026-10-01T04:30:00Z');

const rides: RideWithDriver[] = buildRides(NOW).map((ride) => {
  const driver = drivers.find((d) => d.id === ride.driverId);
  if (!driver) throw new Error('fixture driver missing');
  return { ...ride, driver };
});

const route = rides.filter((r) => r.from === 'Delhi' && r.to === 'Chandigarh');
const ids = (list: { id: string }[]) => list.map((r) => r.id);

describe('timeOfDayOf', () => {
  it('buckets by the IST hour in the string', () => {
    expect(timeOfDayOf({ departureTime: '2026-10-02T05:00:00+05:30' })).toBe('morning');
    expect(timeOfDayOf({ departureTime: '2026-10-02T11:59:00+05:30' })).toBe('morning');
    expect(timeOfDayOf({ departureTime: '2026-10-02T12:00:00+05:30' })).toBe('afternoon');
    expect(timeOfDayOf({ departureTime: '2026-10-02T16:59:00+05:30' })).toBe('afternoon');
    expect(timeOfDayOf({ departureTime: '2026-10-02T17:00:00+05:30' })).toBe('evening');
    expect(timeOfDayOf({ departureTime: '2026-10-02T02:00:00+05:30' })).toBe('evening');
  });
});

describe('filterByTimeOfDay', () => {
  it('returns everything when no times are given', () => {
    expect(filterByTimeOfDay(route)).toHaveLength(3);
    expect(filterByTimeOfDay(route, [])).toHaveLength(3);
  });

  it('keeps only the requested times', () => {
    expect(ids(filterByTimeOfDay(route, ['morning']))).toEqual(['r1']);
    expect(ids(filterByTimeOfDay(route, ['afternoon']))).toEqual(['r2']);
    expect(ids(filterByTimeOfDay(route, ['morning', 'evening']))).toEqual(['r1', 'r3']);
  });
});

describe('filterByDriver', () => {
  it('filters by minimum rating', () => {
    expect(ids(filterByDriver(route, { minRating: 4.7 }))).toEqual(['r1']);
  });

  it('filters to verified drivers only', () => {
    expect(ids(filterByDriver(route, { verifiedOnly: true }))).toEqual(['r1', 'r2']);
  });

  it('returns everything with no filters', () => {
    expect(filterByDriver(route, {})).toHaveLength(3);
  });
});

describe('sortRides', () => {
  it('sorts earliest first', () => {
    expect(ids(sortRides([...route].reverse(), 'earliest'))).toEqual(['r1', 'r2', 'r3']);
  });

  it('sorts cheapest first', () => {
    expect(ids(sortRides(route, 'cheapest'))).toEqual(['r3', 'r1', 'r2']);
  });

  it('sorts best rated first', () => {
    expect(ids(sortRides(route, 'best-rated'))).toEqual(['r1', 'r2', 'r3']);
  });

  it('does not mutate its input', () => {
    const copy = [...route];
    sortRides(route, 'cheapest');
    expect(route).toEqual(copy);
  });
});

describe('aggregatePopularRoutes', () => {
  it('returns at most 6 routes, most rides first, cheapest first on ties', () => {
    const routes = aggregatePopularRoutes(rides);
    expect(routes).toHaveLength(6);
    expect(routes[0]).toEqual({ from: 'Delhi', to: 'Chandigarh', startingPrice: 400, rideCount: 3 });
    expect(routes[1]).toEqual({ from: 'Bengaluru', to: 'Mysuru', startingPrice: 250, rideCount: 2 });
  });

  it('breaks full ties by destination name', () => {
    const routes = aggregatePopularRoutes([
      { from: 'Delhi', to: 'Pune', pricePerSeat: 300 },
      { from: 'Delhi', to: 'Agra', pricePerSeat: 300 },
    ]);
    expect(routes.map((r) => r.to)).toEqual(['Agra', 'Pune']);
  });

  it('returns an empty list for no rides', () => {
    expect(aggregatePopularRoutes([])).toEqual([]);
  });
});

describe('escapeLike', () => {
  it('escapes LIKE wildcards and the escape character', () => {
    expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\');
    expect(escapeLike('Delhi')).toBe('Delhi');
    expect(escapeLike('Del*')).toBe('Del\\*');
  });
});

describe('istDayRange', () => {
  it('returns the UTC instants that bound an IST calendar day', () => {
    expect(istDayRange('2026-10-02')).toEqual({
      start: '2026-10-01T18:30:00.000Z',
      end: '2026-10-02T18:30:00.000Z',
    });
  });
});
