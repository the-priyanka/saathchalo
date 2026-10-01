import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDriver, getPopularRoutes, getRide, searchRides } from '@/lib/rides';

beforeEach(() => {
  vi.useFakeTimers();
  // 10:00 IST on 1 October 2026
  vi.setSystemTime(new Date('2026-10-01T04:30:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

const ids = (rides: { id: string }[]) => rides.map((r) => r.id);

describe('searchRides', () => {
  it('returns every ride for an empty query', async () => {
    expect(await searchRides()).toHaveLength(14);
  });

  it('matches from and to case-insensitively and ignores spaces', async () => {
    const rides = await searchRides({ from: ' delhi ', to: 'CHANDIGARH' });
    expect(ids(rides)).toEqual(['r1', 'r2', 'r3']);
  });

  it('filters by from only', async () => {
    expect(ids(await searchRides({ from: 'Delhi' }))).toEqual(['r1', 'r2', 'r3']);
  });

  it('returns nothing for a route with no rides', async () => {
    expect(await searchRides({ from: 'Delhi', to: 'Pune' })).toEqual([]);
  });

  it('filters by date', async () => {
    const route = { from: 'Delhi', to: 'Chandigarh' };
    expect(ids(await searchRides({ ...route, date: '2026-10-02' }))).toEqual(['r1', 'r2']);
    expect(ids(await searchRides({ ...route, date: '2026-10-03' }))).toEqual(['r3']);
  });

  it('filters by seats needed', async () => {
    const rides = await searchRides({ from: 'Delhi', to: 'Chandigarh', seats: 3 });
    expect(ids(rides)).toEqual(['r1']);
  });

  it('attaches the driver to every ride', async () => {
    const [first] = await searchRides({ from: 'Delhi', to: 'Chandigarh' });
    expect(first.driver.name).toBe('Rohan Mehta');
  });
});

describe('searchRides filters', () => {
  const route = { from: 'Delhi', to: 'Chandigarh' };

  it('filters by max price', async () => {
    expect(ids(await searchRides(route, { maxPrice: 450 }))).toEqual(['r1', 'r3']);
  });

  it('filters by time of day', async () => {
    expect(ids(await searchRides(route, { timeOfDay: ['morning'] }))).toEqual(['r1']);
    expect(ids(await searchRides(route, { timeOfDay: ['afternoon'] }))).toEqual(['r2']);
    expect(ids(await searchRides(route, { timeOfDay: ['morning', 'evening'] }))).toEqual(['r1', 'r3']);
  });

  it('filters by minimum driver rating', async () => {
    expect(ids(await searchRides(route, { minRating: 4.7 }))).toEqual(['r1']);
  });

  it('filters to verified drivers only', async () => {
    expect(ids(await searchRides(route, { verifiedOnly: true }))).toEqual(['r1', 'r2']);
  });
});

describe('searchRides sorting', () => {
  const route = { from: 'Delhi', to: 'Chandigarh' };

  it('sorts earliest first by default', async () => {
    expect(ids(await searchRides(route))).toEqual(['r1', 'r2', 'r3']);
  });

  it('sorts cheapest first', async () => {
    expect(ids(await searchRides(route, {}, 'cheapest'))).toEqual(['r3', 'r1', 'r2']);
  });

  it('sorts best rated first', async () => {
    expect(ids(await searchRides(route, {}, 'best-rated'))).toEqual(['r1', 'r2', 'r3']);
  });
});

describe('getRide and getDriver', () => {
  it('returns a ride with its driver', async () => {
    const ride = await getRide('r1');
    expect(ride?.from).toBe('Delhi');
    expect(ride?.driver.name).toBe('Rohan Mehta');
  });

  it('returns undefined for an unknown ride id', async () => {
    expect(await getRide('nope')).toBeUndefined();
  });

  it('returns a driver by id', async () => {
    expect((await getDriver('d2'))?.name).toBe('Ananya Iyer');
  });

  it('returns undefined for an unknown driver id', async () => {
    expect(await getDriver('zzz')).toBeUndefined();
  });
});

describe('getPopularRoutes', () => {
  it('returns at most 6 routes, most rides first, cheapest first on ties', async () => {
    const routes = await getPopularRoutes();
    expect(routes).toHaveLength(6);
    expect(routes[0]).toEqual({ from: 'Delhi', to: 'Chandigarh', startingPrice: 400, rideCount: 3 });
    expect(routes[1]).toEqual({ from: 'Bengaluru', to: 'Mysuru', startingPrice: 250, rideCount: 2 });
  });
});
